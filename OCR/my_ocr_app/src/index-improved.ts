import { createWorker, type Worker } from 'tesseract.js';
import * as path from 'path';
import sharp from 'sharp';
import * as fs from 'fs';

interface BoundingBox {
    left: number;
    top: number;
    width: number;
    height: number;
}

interface ImageDimensions {
    width: number;
    height: number;
    aspectRatio: number;
    orientation: 'landscape' | 'portrait' | 'square';
}

interface OCROptions {
    lang: string;
    threshold: number;
    saveDebugImages: boolean;
    tesseractOptions?: any;
    adaptiveProcessing: boolean;
    autoRotate: boolean;
    enhanceText: boolean;
}

// Text validation and correction functions
interface TextValidationResult {
    isValid: boolean;
    correctedText: string;
    issues: string[];
    confidence: number;
}

function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function validateAndCorrectText(rawText: string): TextValidationResult {
    const issues: string[] = [];
    let correctedText = rawText;
    let confidence = 100;
    
    // Remove strange symbols that shouldn't be in normal text
    const strangeSymbols = /[@#$%^&*()_+=|\\{}[\]:;"'<>?/~`]/g;
    const hasStrangeSymbols = strangeSymbols.test(correctedText);
    
    if (hasStrangeSymbols) {
        issues.push('Contains strange symbols');
        correctedText = correctedText.replace(strangeSymbols, '');
        confidence -= 30;
    }
    
    // Fix excessive spacing (more than 2 consecutive spaces)
    const excessiveSpacing = /\s{3,}/g;
    if (excessiveSpacing.test(correctedText)) {
        issues.push('Excessive spacing detected');
        correctedText = correctedText.replace(excessiveSpacing, ' ');
        confidence -= 10;
    }
    
    // Remove leading/trailing whitespace
    correctedText = correctedText.trim();
    
    // Fix common OCR mistakes for uppercase text - but only obvious wrong symbols
    const ocrFixes = {
        // Only fix obvious incorrect symbols, not numbers
        '|': 'I',  // Pipe to I
        'ı': 'I',  // Turkish i to I
        'ℓ': 'L',  // Script l to L
        '∣': 'I',  // Mathematical vertical bar to I
        '⎥': 'I',  // Right square bracket extension to I
        '⎢': 'I',  // Left square bracket extension to I
    };
    
    // Apply fixes cautiously - only fix obvious wrong symbols
    let fixedText = correctedText;
    Object.entries(ocrFixes).forEach(([wrong, correct]) => {
        if (fixedText.includes(wrong)) {
            fixedText = fixedText.replace(new RegExp(escapeRegExp(wrong), 'g'), correct);
            issues.push(`Fixed OCR error: ${wrong} → ${correct}`);
            confidence -= 5;
        }
    });
    correctedText = fixedText;
    
    // Check for reasonable text patterns
    const hasLetters = /[A-Za-z]/.test(correctedText);
    const isReasonableLength = correctedText.length >= 1 && correctedText.length <= 1000;
    
    if (!hasLetters) {
        issues.push('No letters detected');
        confidence -= 50;
    }
    
    if (!isReasonableLength) {
        issues.push('Unreasonable text length');
        confidence -= 20;
    }
    
    // Validate grouped text patterns (common in uppercase text)
    const groupedPattern = /^[A-Z0-9\s\.,!?-]+$/;
    const isValidGroupedText = groupedPattern.test(correctedText);
    
    if (!isValidGroupedText && correctedText.length > 0) {
        issues.push('Invalid character pattern for grouped text');
        confidence -= 25;
    }
    
    return {
        isValid: confidence > 50 && correctedText.length > 0,
        correctedText,
        issues,
        confidence: Math.max(0, confidence)
    };
}

function analyzeTextGroups(text: string): {
    groups: string[];
    isGroupedText: boolean;
    groupSeparator: string;
} {
    // Try to identify text groups separated by multiple spaces or line breaks
    let groups: string[] = [];
    let groupSeparator = '';
    
    // Check for line-separated groups
    if (text.includes('\n')) {
        groups = text.split('\n').map(g => g.trim()).filter(g => g.length > 0);
        groupSeparator = 'newline';
    }
    // Check for space-separated groups (2+ spaces)
    else if (/\s{2,}/.test(text)) {
        groups = text.split(/\s{2,}/).map(g => g.trim()).filter(g => g.length > 0);
        groupSeparator = 'multiple spaces';
    }
    // Single group
    else {
        groups = [text.trim()];
        groupSeparator = 'none';
    }
    
    return {
        groups,
        isGroupedText: groups.length > 1,
        groupSeparator
    };
}

function formatGroupedText(groups: string[]): string {
    // Format groups with consistent spacing
    return groups
        .map(group => group.trim())
        .filter(group => group.length > 0)
        .join('  '); // Use double space as separator
}

const DEFAULT_OPTIONS: OCROptions = {
    lang: 'eng',
    threshold: 150,
    saveDebugImages: false,
    tesseractOptions: {},
    adaptiveProcessing: true,
    autoRotate: true,
    enhanceText: true
};

// Shared worker instance for better performance
let sharedWorker: Worker | null = null;

async function getWorker(lang: string = 'eng'): Promise<Worker> {
    if (!sharedWorker) {
        sharedWorker = await createWorker();
        await sharedWorker.load();
        await sharedWorker.reinitialize(lang);
    }
    return sharedWorker;
}

function getImageDimensions(width: number, height: number): ImageDimensions {
    const aspectRatio = width / height;
    let orientation: 'landscape' | 'portrait' | 'square';
    
    if (aspectRatio > 1.1) {
        orientation = 'landscape';
    } else if (aspectRatio < 0.9) {
        orientation = 'portrait';
    } else {
        orientation = 'square';
    }
    
    return {
        width,
        height,
        aspectRatio,
        orientation
    };
}

function adaptBoundingBoxForOrientation(
    bbox: BoundingBox, 
    imageDimensions: ImageDimensions
): BoundingBox {
    const { width: imgWidth, height: imgHeight, orientation } = imageDimensions;
    
    // For portrait images, we might need to adjust coordinates differently
    if (orientation === 'portrait') {
        // Ensure bounding boxes work well with tall images
        return {
            left: Math.max(0, bbox.left),
            top: Math.max(0, bbox.top),
            width: Math.min(bbox.width, imgWidth - bbox.left),
            height: Math.min(bbox.height, imgHeight - bbox.top)
        };
    }
    
    // For landscape images, standard processing
    if (orientation === 'landscape') {
        return {
            left: Math.max(0, bbox.left),
            top: Math.max(0, bbox.top),
            width: Math.min(bbox.width, imgWidth - bbox.left),
            height: Math.min(bbox.height, imgHeight - bbox.top)
        };
    }
    
    // For square images
    return bbox;
}

function getOptimalTesseractParams(imageDimensions: ImageDimensions, bbox: BoundingBox): any {
    const { orientation } = imageDimensions;
    const regionAspectRatio = bbox.width / bbox.height;
    
    let pageSegMode = '6'; // Default: uniform block of text
    const oem = '3'; // Default OCR Engine Mode
    
    // Adjust based on image orientation and region characteristics
    if (orientation === 'portrait') {
        if (regionAspectRatio > 3) {
            pageSegMode = '8'; // Single word
        } else if (regionAspectRatio < 0.5) {
            pageSegMode = '5'; // Single vertical text block
        }
        // else keep default '6'
    } else if (orientation === 'landscape') {
        if (regionAspectRatio > 5) {
            pageSegMode = '7'; // Single text line
        } else if (regionAspectRatio < 1) {
            pageSegMode = '5'; // Single vertical block
        }
        // else keep default '6'
    }
    
    return {
        tessedit_pageseg_mode: pageSegMode,
        tessedit_ocr_engine_mode: oem,
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?-',
    };
}

function validateBoundingBox(bbox: BoundingBox, imageWidth: number, imageHeight: number): BoundingBox {
    const validLeft = Math.max(0, Math.min(bbox.left, imageWidth - 1));
    const validTop = Math.max(0, Math.min(bbox.top, imageHeight - 1));
    const validWidth = Math.min(bbox.width, imageWidth - validLeft);
    const validHeight = Math.min(bbox.height, imageHeight - validTop);
    
    return {
        left: validLeft,
        top: validTop,
        width: Math.max(1, validWidth),
        height: Math.max(1, validHeight)
    };
}

async function recognizeTextInRegion(
    imagePath: string, 
    bbox: BoundingBox, 
    options: Partial<OCROptions> = {}
): Promise<string> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    try {
        // Get image metadata for validation
        const metadata = await sharp(imagePath).metadata();
        if (!metadata.width || !metadata.height) {
            throw new Error('Could not read image dimensions');
        }

        const imageDimensions = getImageDimensions(metadata.width, metadata.height);
        console.log(`Image info: ${imageDimensions.width}x${imageDimensions.height} (${imageDimensions.orientation}, AR: ${imageDimensions.aspectRatio.toFixed(2)})`);

        // Adapt bounding box based on image orientation
        let validBbox = bbox;
        if (opts.adaptiveProcessing) {
            validBbox = adaptBoundingBoxForOrientation(bbox, imageDimensions);
        }
        
        // Final validation
        validBbox = validateBoundingBox(validBbox, metadata.width, metadata.height);
        console.log(`Processing region: ${JSON.stringify(validBbox)}`);

        // Create image processing pipeline
        let imageProcessor = sharp(imagePath).extract(validBbox);
        
        // Auto-rotate if needed (for images that might be rotated)
        if (opts.autoRotate) {
            imageProcessor = imageProcessor.rotate(); // Auto-rotate based on EXIF
        }
        
        // Enhanced text processing pipeline
        if (opts.enhanceText) {
            imageProcessor = imageProcessor
                .grayscale()
                .normalize()
                .modulate({ brightness: 1.1, saturation: 1.0 }) // Enhance brightness
                .sharpen() // Sharpen text edges
                .linear(1.2, 0) // Increase contrast
                .threshold(opts.threshold);
        } else {
            imageProcessor = imageProcessor
                .grayscale()
                .normalize()
                .threshold(opts.threshold);
        }

        const croppedImageBuffer = await imageProcessor.toBuffer();

        // Save debug image only if requested
        if (opts.saveDebugImages) {
            const orientationSuffix = imageDimensions.orientation.charAt(0); // l, p, or s
            const outputCroppedPath = path.resolve(__dirname, `./debug_${orientationSuffix}_${validBbox.left}_${validBbox.top}.png`);
            fs.writeFileSync(outputCroppedPath, croppedImageBuffer);
            console.log(`Debug image saved to: ${outputCroppedPath}`);
        }

        const worker = await getWorker(opts.lang);
        
        // Get optimal Tesseract parameters based on image characteristics
        let tesseractParams = opts.tesseractOptions || {};
        if (opts.adaptiveProcessing) {
            const optimalParams = getOptimalTesseractParams(imageDimensions, validBbox);
            tesseractParams = { ...optimalParams, ...tesseractParams }; // User options override optimal
        }
        
        // Set Tesseract options
        if (tesseractParams && Object.keys(tesseractParams).length > 0) {
            await worker.setParameters(tesseractParams);
            console.log(`Applied Tesseract params: PSM=${tesseractParams.tessedit_pageseg_mode || 'default'}`);
        }

        const { data: { text, confidence } } = await worker.recognize(croppedImageBuffer);
        
        const rawText = text.trim();
        console.log(`Raw OCR result: "${rawText}"`);
        
        // Validate and correct the text
        const validation = validateAndCorrectText(rawText);
        console.log(`OCR confidence: ${confidence.toFixed(2)}% | Text confidence: ${validation.confidence}%`);
        
        if (validation.issues.length > 0) {
            console.log(`Text issues detected: ${validation.issues.join(', ')}`);
        }
        
        // Analyze text groups
        const groupAnalysis = analyzeTextGroups(validation.correctedText);
        if (groupAnalysis.isGroupedText) {
            console.log(`Grouped text detected: ${groupAnalysis.groups.length} groups (separated by ${groupAnalysis.groupSeparator})`);
            validation.correctedText = formatGroupedText(groupAnalysis.groups);
        }
        
        console.log(`Final text: "${validation.correctedText}" | Valid: ${validation.isValid}`);
        console.log(`Text length: ${validation.correctedText.length} | Groups: ${groupAnalysis.groups.length}`);
        
        return validation.correctedText;
    } catch (error) {
        console.error(`OCR processing failed for region ${JSON.stringify(bbox)}:`, error);
        return '';
    }
}

async function processBatch(
    imagePath: string,
    bboxes: BoundingBox[],
    options: Partial<OCROptions> = {}
): Promise<string[]> {
    const results: string[] = [];
    
    for (let i = 0; i < bboxes.length; i++) {
        const bbox = bboxes[i];
        if (!bbox) continue;
        
        console.log(`\nProcessing region ${i + 1}/${bboxes.length}...`);
        const text = await recognizeTextInRegion(imagePath, bbox, options);
        results.push(text);
        
        // Show processed result with validation info
        const validation = validateAndCorrectText(text);
        const isClean = validation.issues.length === 0;
        const statusIcon = isClean ? '✓' : '⚠';
        
        console.log(`${statusIcon} Result ${i + 1}: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" (${validation.confidence}% clean)`);
        if (!isClean) {
            console.log(`  Issues: ${validation.issues.join(', ')}`);
        }
    }
    
    return results;
}

async function cleanup(): Promise<void> {
    if (sharedWorker) {
        await sharedWorker.terminate();
        sharedWorker = null;
        console.log('OCR worker terminated');
    }
}

// Clean up debug images
function cleanupDebugImages(): void {
    const debugPattern = /^debug_[lps]_\d+_\d+\.png$/;
    const files = fs.readdirSync(__dirname);
    
    files.forEach(file => {
        if (debugPattern.test(file)) {
            fs.unlinkSync(path.join(__dirname, file));
            console.log(`Removed debug image: ${file}`);
        }
    });
}

// Generate adaptive bounding boxes based on image orientation
function generateAdaptiveBoundingBoxes(imageDimensions: ImageDimensions): BoundingBox[] {
    const { width, height, orientation } = imageDimensions;
    
    if (orientation === 'portrait') {
        // For tall images, create vertical regions with better coverage
        const topRegionHeight = Math.floor(height * 0.45);
        const bottomRegionTop = Math.floor(height * 0.5);
        const bottomRegionHeight = Math.floor(height * 0.4);
        
        return [
            { left: Math.floor(width * 0.05), top: Math.floor(height * 0.05), width: Math.floor(width * 0.9), height: topRegionHeight },
            { left: Math.floor(width * 0.05), top: bottomRegionTop, width: Math.floor(width * 0.9), height: bottomRegionHeight }
        ];
    } else if (orientation === 'landscape') {
        // For wide images, create horizontal regions
        const leftRegionWidth = Math.floor(width * 0.55);
        const rightRegionLeft = Math.floor(width * 0.6);
        const rightRegionWidth = Math.floor(width * 0.35);
        const regionHeight = Math.floor(height * 0.8);
        
        return [
            { left: Math.floor(width * 0.05), top: Math.floor(height * 0.1), width: leftRegionWidth, height: regionHeight },
            { left: rightRegionLeft, top: Math.floor(height * 0.1), width: rightRegionWidth, height: regionHeight }
        ];
    }
    
    // For square images, create balanced regions
    const regionSize = Math.floor(Math.min(width, height) * 0.45);
    const centerOffset = Math.floor((Math.max(width, height) - regionSize) / 2);
    
    return [
        { left: Math.floor(width * 0.05), top: Math.floor(height * 0.05), width: regionSize, height: regionSize },
        { left: centerOffset, top: Math.floor(height * 0.55), width: regionSize, height: Math.floor(height * 0.4) }
    ];
}

// Generate intelligent bounding boxes based on image analysis
function generateIntelligentBoundingBoxes(imageDimensions: ImageDimensions): BoundingBox[] {
    const { width, height, orientation, aspectRatio } = imageDimensions;
    
    // Small images - single region
    if (width < 400 || height < 400) {
        const margin = Math.floor(Math.min(width, height) * 0.05);
        return [{
            left: margin,
            top: margin,
            width: width - (margin * 2),
            height: height - (margin * 2)
        }];
    }
    
    // Very wide images (like panoramic screenshots)
    if (aspectRatio > 3) {
        const regionWidth = Math.floor(width / 3);
        const regionHeight = Math.floor(height * 0.8);
        const topMargin = Math.floor(height * 0.1);
        
        return [
            { left: Math.floor(width * 0.05), top: topMargin, width: regionWidth, height: regionHeight },
            { left: Math.floor(width * 0.35), top: topMargin, width: regionWidth, height: regionHeight },
            { left: Math.floor(width * 0.65), top: topMargin, width: regionWidth, height: regionHeight }
        ];
    }
    
    // Very tall images (like mobile screenshots)
    if (aspectRatio < 0.33) {
        const regionWidth = Math.floor(width * 0.9);
        const regionHeight = Math.floor(height / 3);
        const leftMargin = Math.floor(width * 0.05);
        
        return [
            { left: leftMargin, top: Math.floor(height * 0.05), width: regionWidth, height: regionHeight },
            { left: leftMargin, top: Math.floor(height * 0.35), width: regionWidth, height: regionHeight },
            { left: leftMargin, top: Math.floor(height * 0.65), width: regionWidth, height: regionHeight }
        ];
    }
    
    // Default adaptive regions
    return generateAdaptiveBoundingBoxes(imageDimensions);
}

// Generate full image bounding box (processes entire image as one region)
function generateFullImageBoundingBox(imageDimensions: ImageDimensions): BoundingBox[] {
    const { width, height } = imageDimensions;
    
    // Small margin to avoid edge artifacts
    const margin = Math.floor(Math.min(width, height) * 0.01); // 1% margin
    
    return [{
        left: margin,
        top: margin,
        width: width - (margin * 2),
        height: height - (margin * 2)
    }];
}

// Analyze image content and suggest optimal regions (future enhancement)
async function analyzeImageContent(imagePath: string): Promise<BoundingBox[]> {
    // This could be enhanced with image analysis to detect text regions
    // For now, we'll use the intelligent generation based on dimensions
    const metadata = await sharp(imagePath).metadata();
    if (!metadata.width || !metadata.height) {
        throw new Error('Could not read image dimensions');
    }
    
    const dimensions = getImageDimensions(metadata.width, metadata.height);
    return generateIntelligentBoundingBoxes(dimensions);
}

async function analyzeImageAndSuggestRegions(imagePath: string): Promise<{
    dimensions: ImageDimensions;
    suggestedBoundingBoxes: BoundingBox[];
    intelligentBoundingBoxes: BoundingBox[];
    fullImageBoundingBox: BoundingBox[];
}> {
    const metadata = await sharp(imagePath).metadata();
    if (!metadata.width || !metadata.height) {
        throw new Error('Could not read image dimensions');
    }
    
    const dimensions = getImageDimensions(metadata.width, metadata.height);
    const suggestedBoundingBoxes = generateAdaptiveBoundingBoxes(dimensions);
    const intelligentBoundingBoxes = generateIntelligentBoundingBoxes(dimensions);
    const fullImageBoundingBox = generateFullImageBoundingBox(dimensions);
    
    return { dimensions, suggestedBoundingBoxes, intelligentBoundingBoxes, fullImageBoundingBox };
}

async function main() {
    try {
        const imageFile = path.resolve(__dirname, './image/testocr7.jpg');
        
        console.log("Analyzing image for optimal processing...");
        const analysis = await analyzeImageAndSuggestRegions(imageFile);
        
        console.log(`Image Analysis:`);
        console.log(`- Dimensions: ${analysis.dimensions.width}x${analysis.dimensions.height}`);
        console.log(`- Orientation: ${analysis.dimensions.orientation}`);
        console.log(`- Aspect Ratio: ${analysis.dimensions.aspectRatio.toFixed(2)}`);
        console.log(`- Adaptive regions: ${analysis.suggestedBoundingBoxes.length}`);
        console.log(`- Intelligent regions: ${analysis.intelligentBoundingBoxes.length}`);
        console.log(`- Full image option: ${analysis.fullImageBoundingBox.length} region`);

        // ==================== DEBUG: RAW IMAGE TEXT DETECTION ====================
        console.log("\n" + "🔍".repeat(40));
        console.log("🔍 DEBUG: ANALYZING RAW IMAGE TEXT CONTENT");
        console.log("🔍".repeat(40));
        
        try {
            // Perform a quick OCR scan of the entire image to see what text is actually present
            const debugWorker = await getWorker('eng');
            
            // Use minimal processing to see raw text content
            const rawImageBuffer = await sharp(imageFile)
                .grayscale()
                .normalize()
                .toBuffer();
            
            console.log("🔍 Performing raw OCR scan of entire image...");
            
            // Set basic OCR parameters for text detection
            await debugWorker.setParameters({
                tessedit_pageseg_mode: 3, // Fully automatic page segmentation
                tessedit_ocr_engine_mode: 3 // Default OCR Engine Mode
            });
            
            const { data: { text: rawImageText, confidence: rawConfidence } } = await debugWorker.recognize(rawImageBuffer);
            
            console.log(`🔍 Raw OCR Confidence: ${rawConfidence.toFixed(2)}%`);
            console.log(`🔍 Raw Image Dimensions: ${analysis.dimensions.width}x${analysis.dimensions.height}`);
            console.log(`🔍 Image File: ${path.basename(imageFile)}`);
            
            if (rawImageText.trim().length > 0) {
                console.log("🔍 RAW TEXT DETECTED IN IMAGE:");
                console.log("┌" + "─".repeat(78) + "┐");
                
                // Split text into lines and display with line numbers
                const textLines = rawImageText.split('\n');
                textLines.forEach((line, index) => {
                    const trimmedLine = line.trim();
                    if (trimmedLine.length > 0) {
                        const lineNum = (index + 1).toString().padStart(2, '0');
                        const displayLine = trimmedLine.length > 70 ? trimmedLine.substring(0, 67) + '...' : trimmedLine;
                        const padding = Math.max(0, 70 - displayLine.length);
                        console.log(`│ ${lineNum}: ${displayLine}${" ".repeat(padding)} │`);
                    }
                });
                
                console.log("├" + "─".repeat(78) + "┤");
                console.log(`│ 📊 Total Lines: ${textLines.filter(l => l.trim().length > 0).length} | Total Characters: ${rawImageText.trim().length}${" ".repeat(25)} │`);
                console.log("└" + "─".repeat(78) + "┘");
                
                // Show character frequency analysis
                const chars = rawImageText.replace(/\s/g, '').toUpperCase();
                const charFreq: Record<string, number> = {};
                for (const char of chars) {
                    charFreq[char] = (charFreq[char] || 0) + 1;
                }
                
                const topChars = Object.entries(charFreq)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([char, count]) => `${char}:${count}`)
                    .join(' ');
                    
                console.log(`🔍 Top Characters: ${topChars}`);
                
                // Text quality indicators
                const hasUppercase = /[A-Z]/.test(rawImageText);
                const hasLowercase = /[a-z]/.test(rawImageText);
                const hasNumbers = /[0-9]/.test(rawImageText);
                const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(rawImageText);
                
                console.log(`🔍 Content Analysis: Uppercase:${hasUppercase ? '✓' : '✗'} Lowercase:${hasLowercase ? '✓' : '✗'} Numbers:${hasNumbers ? '✓' : '✗'} Special:${hasSpecialChars ? '✓' : '✗'}`);
                
            } else {
                console.log("🔍 ❌ NO TEXT DETECTED IN IMAGE");
                console.log("   This could indicate:");
                console.log("   - Image is too low resolution");
                console.log("   - Text is too small or blurry");
                console.log("   - Image format/encoding issues");
                console.log("   - Non-text content (graphics only)");
            }
            
        } catch (debugError) {
            if (debugError instanceof Error) {
                console.log(`🔍 ❌ Debug OCR scan failed: ${debugError.message}`);
            } else {
                console.log(`🔍 ❌ Debug OCR scan failed:`, debugError);
            }
        }
        
        console.log("🔍".repeat(40));
        console.log("🔍 END DEBUG ANALYSIS");
        console.log("🔍".repeat(40) + "\n");
        // ========================================================================

        // Choose bounding box strategy based on image characteristics
        let boundingBoxes: BoundingBox[];
        let strategy: string;
        
        const { width, height, aspectRatio } = analysis.dimensions;
        
        // CHANGED: Default to full image processing for complete text extraction
        // Strategy selection - prioritize full image capture
        const useFullImage = true; // Set to false to use intelligent region detection
        
        if (useFullImage) {
            // Process entire image as one region for complete text extraction
            boundingBoxes = analysis.fullImageBoundingBox;
            strategy = "Full Image (Complete Text Extraction)";
        } else if (width < 400 || height < 400) {
            // Small images - use simple full coverage
            boundingBoxes = analysis.intelligentBoundingBoxes;
            strategy = "Small Image (Full Coverage)";
        } else if (aspectRatio > 3 || aspectRatio < 0.33) {
            // Extreme aspect ratios - use intelligent multi-region
            boundingBoxes = analysis.intelligentBoundingBoxes;
            strategy = "Extreme Aspect Ratio (Multi-Region)";
        } else if (width > 1200 || height > 1200) {
            // Large images - use intelligent segmentation
            boundingBoxes = analysis.intelligentBoundingBoxes;
            strategy = "Large Image (Intelligent Segmentation)";
        } else {
            // Standard images - use adaptive regions
            boundingBoxes = analysis.suggestedBoundingBoxes;
            strategy = "Standard Image (Adaptive Regions)";
        }
        
        console.log(`\nSelected Strategy: ${strategy}`);
        console.log(`Regions to process: ${boundingBoxes.length}`);
        
        // Display the selected bounding boxes
        console.log(`\nSelected Bounding Boxes:`);
        boundingBoxes.forEach((bbox, index) => {
            const regionAR = (bbox.width / bbox.height).toFixed(2);
            console.log(`  Region ${index + 1}: ${JSON.stringify(bbox)} (AR: ${regionAR})`);
        });

        // Enhanced OCR options with adaptive processing for uppercase grouped text
        const ocrOptions: Partial<OCROptions> = {
            lang: 'eng',
            threshold: 180, // Higher threshold for cleaner text separation
            saveDebugImages: true, // Set to false in production
            adaptiveProcessing: true, // Enable adaptive processing
            autoRotate: true, // Auto-rotate based on EXIF
            enhanceText: true, // Enhanced text processing
            tesseractOptions: {
                // Optimized for uppercase grouped text
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?-',
                tessedit_char_blacklist: '@#$%^&*()_+=|\\{}[]:;"\'<>?/~`', // Remove problematic characters
                tessedit_pageseg_mode: '6', // Uniform block of text (good for grouped text)
            }
        };

        console.log(`\nStarting ${analysis.dimensions.orientation} image OCR processing for UPPERCASE GROUPED TEXT...`);
        const results = await processBatch(imageFile, boundingBoxes, ocrOptions);

        // Display results with text validation
        console.log("\n" + "=".repeat(80));
        console.log(`PROOFREAD OCR RESULTS (${analysis.dimensions.orientation.toUpperCase()} IMAGE - ${strategy.toUpperCase()}):`);
        console.log("=".repeat(80));
        
        results.forEach((text, index) => {
            const bbox = boundingBoxes[index];
            const validation = validateAndCorrectText(text);
            const groupAnalysis = analyzeTextGroups(text);
            
            console.log(`\nRegion ${index + 1}:`);
            console.log("-".repeat(50));
            console.log(`📍 Raw Text: "${text}"`);
            console.log(`✅ Corrected: "${validation.correctedText}"`);
            console.log(`📊 Quality: ${validation.confidence}% | Valid: ${validation.isValid ? '✓' : '✗'}`);
            
            if (validation.issues.length > 0) {
                console.log(`⚠️  Issues: ${validation.issues.join(', ')}`);
            }
            
            if (groupAnalysis.isGroupedText) {
                console.log(`👥 Groups: ${groupAnalysis.groups.length} (${groupAnalysis.groupSeparator})`);
                groupAnalysis.groups.forEach((group, i) => {
                    console.log(`   Group ${i + 1}: "${group}"`);
                });
            }
            
            console.log(`📐 Region: ${bbox?.left},${bbox?.top} | Size: ${bbox?.width}x${bbox?.height}`);
        });

        // Show processing summary with text quality metrics
        console.log("\n" + "=".repeat(80));
        console.log("PROOFREADING SUMMARY:");
        console.log("=".repeat(80));
        console.log(`Image Type: ${analysis.dimensions.orientation} (${analysis.dimensions.width}x${analysis.dimensions.height})`);
        console.log(`Processing Strategy: ${strategy}`);
        console.log(`Regions Processed: ${results.length}`);
        
        const validResults = results.map(validateAndCorrectText).filter(v => v.isValid);
        const avgConfidence = validResults.length > 0 ? 
            Math.round(validResults.reduce((sum, v) => sum + v.confidence, 0) / validResults.length) : 0;
            
        console.log(`Valid Extractions: ${validResults.length}/${results.length}`);
        console.log(`Average Text Quality: ${avgConfidence}%`);
        console.log(`Total Characters Extracted: ${results.reduce((sum, text) => sum + text.length, 0)}`);
        
        // Show text quality breakdown
        console.log(`\nText Quality Breakdown:`);
        results.forEach((text, index) => {
            const validation = validateAndCorrectText(text);
            const status = validation.isValid ? '✅' : '❌';
            const quality = validation.confidence > 80 ? 'High' : validation.confidence > 50 ? 'Medium' : 'Low';
            console.log(`  ${status} Region ${index + 1}: ${quality} quality (${validation.confidence}%) - "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
        });

        // ==================== EXTRACTED TEXT SUMMARY ====================
        console.log("\n" + "┌" + "─".repeat(78) + "┐");
        console.log("│" + " ".repeat(25) + "📋 EXTRACTED TEXT SUMMARY" + " ".repeat(26) + "│");
        console.log("├" + "─".repeat(78) + "┤");
        
        const validTexts = results
            .map(text => validateAndCorrectText(text))
            .filter(validation => validation.isValid && validation.correctedText.length > 0);
            
        if (validTexts.length === 0) {
            console.log("│" + " ".repeat(30) + "❌ No valid text found" + " ".repeat(25) + "│");
        } else {
            // Show individual corrected texts
            validTexts.forEach((validation, index) => {
                const regionNum = results.findIndex(text => validateAndCorrectText(text).correctedText === validation.correctedText) + 1;
                const text = validation.correctedText;
                const quality = validation.confidence > 80 ? 'HIGH' : validation.confidence > 50 ? 'MED' : 'LOW';
                
                // Split long text into multiple lines if needed
                const maxWidth = 65;
                if (text.length <= maxWidth) {
                    const padding = Math.max(0, maxWidth - text.length);
                    console.log(`│ Region ${regionNum} [${quality}]: ${text}${" ".repeat(padding)} │`);
                } else {
                    // Split text into chunks
                    const words = text.split(' ');
                    let currentLine = `Region ${regionNum} [${quality}]: `;
                    
                    for (const word of words) {
                        if ((currentLine + word).length <= maxWidth) {
                            currentLine += word + ' ';
                        } else {
                            // Print current line and start new one
                            const padding = Math.max(0, maxWidth - currentLine.trimEnd().length);
                            console.log(`│ ${currentLine.trimEnd()}${" ".repeat(padding)} │`);
                            currentLine = `${"".repeat(15)}${word} `;
                        }
                    }
                    // Print remaining text
                    if (currentLine.trim().length > 15) {
                        const padding = Math.max(0, maxWidth - currentLine.trimEnd().length);
                        console.log(`│ ${currentLine.trimEnd()}${" ".repeat(padding)} │`);
                    }
                }
                
                // Add separator between regions
                if (index < validTexts.length - 1) {
                    console.log("│" + " ".repeat(78) + "│");
                }
            });
            
            console.log("├" + "─".repeat(78) + "┤");
            
            // Combine all text into one summary
            const allExtractedText = validTexts.map(v => v.correctedText).join('  ');
            const totalQuality = Math.round(validTexts.reduce((sum, v) => sum + v.confidence, 0) / validTexts.length);
            
            console.log(`│ 📊 COMBINED TEXT (${totalQuality}% quality):${" ".repeat(35)} │`);
            console.log("│" + " ".repeat(78) + "│");
            
            // Format combined text
            const combinedMaxWidth = 70;
            if (allExtractedText.length <= combinedMaxWidth) {
                const padding = Math.max(0, combinedMaxWidth - allExtractedText.length);
                console.log(`│ "${allExtractedText}"${" ".repeat(padding)} │`);
            } else {
                const words = allExtractedText.split(' ');
                let currentLine = '"';
                
                for (let i = 0; i < words.length; i++) {
                    const word = words[i];
                    if ((currentLine + word + (i === words.length - 1 ? '"' : ' ')).length <= combinedMaxWidth) {
                        currentLine += word + (i === words.length - 1 ? '"' : ' ');
                    } else {
                        // Print current line and start new one
                        const padding = Math.max(0, combinedMaxWidth - currentLine.length);
                        console.log(`│ ${currentLine}${" ".repeat(padding)} │`);
                        currentLine = ` ${word}${i === words.length - 1 ? '"' : ' '}`;
                    }
                }
                // Print remaining text
                if (currentLine.trim().length > 1) {
                    const padding = Math.max(0, combinedMaxWidth - currentLine.length);
                    console.log(`│ ${currentLine}${" ".repeat(padding)} │`);
                }
            }
            
            console.log("├" + "─".repeat(78) + "┤");
            console.log(`│ 📈 Stats: ${validTexts.length} regions | ${allExtractedText.length} chars | ${totalQuality}% avg quality${" ".repeat(14)} │`);
        }
        
        console.log("└" + "─".repeat(78) + "┘");
        // ================================================================

        // Generate and optionally save detailed summary
        const textSummary = generateTextSummary(results, imageFile, strategy);
        
        // Save summary to file
        if (textSummary.combinedText.length > 0) {
            try {
                const summaryFilePath = await saveSummaryToFile(textSummary.summary);
                console.log(`\n💾 Detailed summary saved to: ${summaryFilePath}`);
                console.log(`📋 Quick access: Combined text contains ${textSummary.stats.totalCharacters} characters across ${textSummary.stats.validRegions} regions`);
            } catch (error) {
                console.log(`\n⚠️  Could not save summary file: ${error}`);
            }
        }

    } catch (error) {
        console.error("Main execution error:", error);
    } finally {
        // Cleanup
        await cleanup();
        
        // Optionally clean debug images
        // cleanupDebugImages();
    }
}

// Generate a comprehensive text summary
function generateTextSummary(results: string[], imagePath: string, strategy: string): {
    summary: string;
    combinedText: string;
    stats: {
        totalRegions: number;
        validRegions: number;
        totalCharacters: number;
        averageQuality: number;
        highQualityRegions: number;
    };
} {
    const validations = results.map(text => validateAndCorrectText(text));
    const validTexts = validations.filter(v => v.isValid && v.correctedText.length > 0);
    
    const stats = {
        totalRegions: results.length,
        validRegions: validTexts.length,
        totalCharacters: validTexts.reduce((sum, v) => sum + v.correctedText.length, 0),
        averageQuality: validTexts.length > 0 ? 
            Math.round(validTexts.reduce((sum, v) => sum + v.confidence, 0) / validTexts.length) : 0,
        highQualityRegions: validTexts.filter(v => v.confidence > 80).length
    };
    
    const combinedText = validTexts.map(v => v.correctedText).join('  ');
    
    const timestamp = new Date().toLocaleString();
    const imageFileName = path.basename(imagePath);
    
    const summary = [
        `OCR EXTRACTION SUMMARY`,
        `Generated: ${timestamp}`,
        `Image: ${imageFileName}`,
        `Strategy: ${strategy}`,
        ``,
        `STATISTICS:`,
        `- Total Regions Processed: ${stats.totalRegions}`,
        `- Valid Text Extractions: ${stats.validRegions}`,
        `- High Quality Results: ${stats.highQualityRegions}`,
        `- Total Characters: ${stats.totalCharacters}`,
        `- Average Quality Score: ${stats.averageQuality}%`,
        ``,
        `EXTRACTED TEXTS BY REGION:`,
        ...validTexts.map((validation, index) => {
            const regionNum = results.findIndex(text => validateAndCorrectText(text).correctedText === validation.correctedText) + 1;
            return `Region ${regionNum} (${validation.confidence}%): "${validation.correctedText}"`;
        }),
        ``,
        `COMBINED TEXT:`,
        `"${combinedText}"`,
        ``,
        `END OF SUMMARY`
    ].join('\n');
    
    return {
        summary,
        combinedText,
        stats
    };
}

// Save summary to file
async function saveSummaryToFile(summary: string, outputPath?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultPath = path.resolve(__dirname, `ocr-summary-${timestamp}.txt`);
    const filePath = outputPath || defaultPath;
    
    fs.writeFileSync(filePath, summary, 'utf8');
    return filePath;
}

// Export for module use
export {
    recognizeTextInRegion,
    processBatch,
    cleanup,
    cleanupDebugImages,
    analyzeImageAndSuggestRegions,
    generateAdaptiveBoundingBoxes,
    generateIntelligentBoundingBoxes,
    analyzeImageContent,
    getImageDimensions,
    validateAndCorrectText,
    analyzeTextGroups,
    formatGroupedText,
    generateTextSummary,
    saveSummaryToFile
};

export type {
    BoundingBox,
    OCROptions,
    ImageDimensions,
    TextValidationResult
};

// Run if executed directly
if (require.main === module) {
    main();
}
