import { createWorker } from 'tesseract.js';
import * as path from 'path';
import sharp from 'sharp';
import * as fs from 'fs/promises'; // ใช้ fs.promises สำหรับ async/await file operations

// --- Interfaces ---
interface BoundingBox {
    left: number;
    top: number;
    width: number;
    height: number;
}

interface OCROptions {
    lang: string;
    maxAttempts: number;
    adjustmentAmount: number; // Pixels to adjust BBox by in each step
    saveDebugImages: boolean; // Whether to save cropped images for debugging
    threshold: number; // Sharp.js threshold value for binarization
    // Add more Tesseract.js specific options if needed, e.g., psm, oem
    // tesseractConfig?: Partial<Tesseract.RecognizeOptions>;
}

// --- Default OCR Options ---
const DEFAULT_OCR_OPTIONS: OCROptions = {
    lang: 'eng',
    maxAttempts: 7, // Max attempts for BBox adjustment
    adjustmentAmount: 15, // Default adjustment amount in pixels
    saveDebugImages: false,
    threshold: 150,
};

// --- Global Tesseract Worker ---
let sharedWorker: Tesseract.Worker | null = null;
let currentWorkerLang: string | null = null; // To track current worker language

/**
 * Ensures a Tesseract.js worker is initialized and loaded.
 * Reinitializes only if the language changes.
 */
async function getSharedWorker(lang: string): Promise<Tesseract.Worker> {
    if (!sharedWorker) {
        sharedWorker = await createWorker();
        await sharedWorker.load();
    }

    if (currentWorkerLang !== lang) {
        console.log(`Reinitializing worker for language: ${lang}`);
        await sharedWorker.reinitialize(lang);
        currentWorkerLang = lang;
    }

    return sharedWorker;
}

/**
 * Terminates the shared Tesseract.js worker.
 */
async function cleanupWorker(): Promise<void> {
    if (sharedWorker) {
        await sharedWorker.terminate();
        sharedWorker = null;
        currentWorkerLang = null;
        console.log("Tesseract.js worker terminated.");
    }
}

// --- Text Quality Assessment ---
/**
 * Checks if the text contains characters generally considered unwanted (e.g., common symbols).
 * This pattern can be adjusted based on specific needs.
 */
const UNWANTED_CHAR_PATTERN = /[~!@#$%^&*()_+=|\\{}[\]:;"'<,>?`]/;
const UNWANTED_CHAR_PATTERN_GLOBAL = /[~!@#$%^&*()_+=|\\{}[\]:;"'<,>?`]/g;

function containsUnwantedChars(text: string): boolean {
    // This pattern targets common symbols that are unlikely in typical text.
    // Adjust as needed, especially for non-English/Thai languages.
    return UNWANTED_CHAR_PATTERN.test(text);
}

/**
 * Calculates a quality score for the recognized text. Higher score means better quality.
 * This heuristic can be fine-tuned extensively based on expected output.
 */
function calculateTextQuality(text: string): number {
    if (!text || text.trim().length === 0) return 0;

    let score = text.length; // Base score on length (longer text implies more content)
    const specialCharCount = (text.match(UNWANTED_CHAR_PATTERN_GLOBAL) || []).length;
    if (specialCharCount > text.length * 0.2) { // More than 20% special chars is bad
        score -= 50; // Significant penalty
    } else {
        score += (text.length - specialCharCount) * 0.5; // Bonus for actual letters/numbers
    }

    // Penalize if it contains explicit unwanted chars
    if (containsUnwantedChars(text)) score -= 30; // Small penalty just for presence

    // Bonus for containing spaces (indicates multiple words, better readability)
    if (/\s/.test(text)) score += 10;

    // Bonus for common sentence endings (can indicate complete thoughts)
    if (/[.!?]$/.test(text.trim())) score += 5;

    // Ensure score is not negative
    return Math.max(0, score);
}


// --- OCR Core Functions ---

/**
 * Performs OCR on a specific bounding box with optional image pre-processing and dynamic adjustment.
 * It attempts to find the best text quality within a set number of attempts by adjusting the BBox.
 */
async function recognizeTextInRegionWithAdjustment(
    imagePath: string,
    initialBbox: BoundingBox,
    options: Partial<OCROptions> = {}
): Promise<string> {
    const opts = { ...DEFAULT_OCR_OPTIONS, ...options };
    const worker = await getSharedWorker(opts.lang);

    let currentBbox = { ...initialBbox };
    let bestText = '';
    let bestScore = -1; // Initialize with a low score
    let debugImageCounter = 0;

    // Get image dimensions once
    let imageWidth = 0;
    let imageHeight = 0;
    try {
        const metadata = await sharp(imagePath).metadata();
        imageWidth = metadata.width || 0;
        imageHeight = metadata.height || 0;
    } catch (metaError) {
        console.error(`Error getting image metadata for ${imagePath}:`, metaError);
        return '';
    }

    if (imageWidth === 0 || imageHeight === 0) {
        console.error(`Invalid image dimensions for ${imagePath}.`);
        return '';
    }

    console.log(`--- Starting OCR processing for BBox: ${JSON.stringify(initialBbox)} ---`);

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
        console.log(`  Attempt ${attempt} with BBox: ${JSON.stringify(currentBbox)}`);

        // Ensure BoundingBox stays within image boundaries
        const safeBbox: BoundingBox = {
            left: Math.max(0, currentBbox.left),
            top: Math.max(0, currentBbox.top),
            width: Math.min(imageWidth - Math.max(0, currentBbox.left), currentBbox.width),
            height: Math.min(imageHeight - Math.max(0, currentBbox.top), currentBbox.height),
        };

        if (safeBbox.width <= 0 || safeBbox.height <= 0) {
            console.log("  Invalid or too small BoundingBox, stopping adjustments.");
            break;
        }

        try {
            const croppedImageBuffer = await sharp(imagePath)
                .extract(safeBbox)
                .grayscale()
                .normalize()
                .threshold(opts.threshold)
                .toBuffer();

            if (opts.saveDebugImages) {
                const outputCroppedPath = path.resolve(__dirname, `./debug_cropped_${path.basename(imagePath, path.extname(imagePath))}_${initialBbox.left}_${initialBbox.top}_${debugImageCounter++}.png`);
                await fs.writeFile(outputCroppedPath, croppedImageBuffer);
                console.log(`  Debug image saved: ${outputCroppedPath}`);
            }

            const { data: { text } } = await worker.recognize(croppedImageBuffer);
            const cleanedText = text.trim();
            const textScore = calculateTextQuality(cleanedText);

            console.log(`  Recognized text (Attempt ${attempt}): "${cleanedText.substring(0, Math.min(cleanedText.length, 50))}..." (Score: ${textScore})`);

            // Update best result if current score is better
            if (textScore > bestScore) {
                bestScore = textScore;
                bestText = cleanedText;
                console.log(`  New best text found (Score: ${bestScore}).`);
            }

            // Adjustment strategy: Prioritize expanding initially, then perhaps refining
            // This is a simple expansion strategy. More complex logic could be added here
            // (e.g., try shrinking, shifting based on text properties or confidence).
            
            // If the score is already very good, or we've reached max attempts for expansion,
            // we might stop or try a different adjustment strategy.
            if (bestScore > 70 && !containsUnwantedChars(bestText) && bestText.length > 5) { // Heuristic for good quality
                 console.log(`  Text quality is good enough (Score: ${bestScore}), stopping adjustments.`);
                 break;
            }

            // Expand BBox for the next attempt
            currentBbox.left = Math.max(0, currentBbox.left - opts.adjustmentAmount);
            currentBbox.top = Math.max(0, currentBbox.top - opts.adjustmentAmount);
            currentBbox.width = Math.min(imageWidth - currentBbox.left, currentBbox.width + opts.adjustmentAmount * 2);
            currentBbox.height = Math.min(imageHeight - currentBbox.top, currentBbox.height + opts.adjustmentAmount * 2);

        } catch (error) {
            console.error(`  Error during OCR attempt ${attempt}:`, error);
            // If a critical error occurs, might be better to stop
            break;
        }
    }

    console.log(`--- Finished processing BBox: ${JSON.stringify(initialBbox)} (Best score: ${bestScore}) ---`);
    return bestText; // Return the best text found
}

/**
 * Processes a list of bounding boxes for OCR on a single image.
 */
async function processBoundingBoxes(
    imagePath: string,
    boundingBoxes: BoundingBox[],
    options: Partial<OCROptions> = {}
): Promise<string[]> {
    const results: string[] = [];

    for (let i = 0; i < boundingBoxes.length; i++) {
        const bbox = boundingBoxes[i];
        if (!bbox) {
            console.warn(`Bounding box at index ${i} is undefined. Skipping.`);
            results.push('');
            continue;
        }
        console.log(`\nProcessing Bounding Box ${i + 1}/${boundingBoxes.length}...`);
        const text = await recognizeTextInRegionWithAdjustment(imagePath, bbox, options);
        results.push(text);
        console.log(`Result ${i + 1}: "${text.substring(0, Math.min(text.length, 100))}${text.length > 100 ? '...' : ''}"`);
    }

    return results;
}

// --- Main execution ---
async function main() {
    try {
        // Use an environment variable or relative path for image file
        // For production, consider using a more robust config or CLI arguments
        const imageFile = process.env.IMAGE_PATH || path.resolve(__dirname, '..', 'images', 'C:\\Users\\Anothai\\Documents\\onedrive\\picture\\testocr.jpg');

        // Check if image file exists
        try {
            await fs.access(imageFile, fs.constants.F_OK);
        } catch (error) {
            console.error(`Error: Image file not found at ${imageFile}. Please ensure the path is correct.`);
            return;
        }

        // Define bounding boxes
        const boundingBoxes: BoundingBox[] = [
            { left: 0, top: 50, width: 900, height: 550 },   // Example Bubble 1
            { left: 0, top: 520, width: 500, height: 400 },  // Example Bubble 2
            // Add more bounding boxes here, or use an auto-detection method (e.g., OpenCV)
        ];

        // OCR options for this run
        const ocrOptions: Partial<OCROptions> = {
            lang: 'eng', // Use 'tha' for Thai, 'jpn' for Japanese, 'eng+tha' for both
            maxAttempts: 10,
            adjustmentAmount: 15,
            saveDebugImages: true, // Set to true to see cropped images in debug_cropped_*.png
            threshold: 150 // Adjust based on image lighting and contrast
        };

        console.log("Starting batch OCR processing...");
        const results = await processBoundingBoxes(imageFile, boundingBoxes, ocrOptions);

        console.log("\n" + "=".repeat(50));
        console.log("FINAL OCR RESULTS:");
        console.log("=".repeat(50));

        results.forEach((text, index) => {
            console.log(`\nBounding Box ${index + 1}:`);
            console.log("-".repeat(30));
            console.log(text || "[No text detected]");
        });

    } catch (error) {
        console.error("An unhandled error occurred in main function:", error);
    } finally {
        // Ensure worker is terminated even if errors occur
        await cleanupWorker();
    }
}

// Run main function if this file is executed directly
if (require.main === module) {
    main();
}

// Export types and functions for potential external use
export {
    recognizeTextInRegionWithAdjustment,
    processBoundingBoxes,
    cleanupWorker,
};
export type { BoundingBox, OCROptions };