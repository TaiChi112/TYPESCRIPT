import { createWorker } from 'tesseract.js';
import * as path from 'path';
import sharp from 'sharp';
import * as fs from 'fs';

interface BoundingBox {
    left: number;
    top: number;
    width: number;
    height: number;
}

interface OCROptions {
    lang: string;
    maxAttempts: number;
    adjustmentAmount: number;
    saveDebugImages: boolean;
    threshold: number;
}

// Default OCR options
const DEFAULT_OCR_OPTIONS: OCROptions = {
    lang: 'eng',
    maxAttempts: 5,
    adjustmentAmount: 10,
    saveDebugImages: false,
    threshold: 150
};

// Function to check if text contains unwanted characters
function containsUnwantedChars(text: string): boolean {
    const unwantedPattern = /[~!@#$%^&*()_+=|\\{}[\]:;"'<,>?/]/;
    return unwantedPattern.test(text);
}

// Function to calculate text quality score
function calculateTextQuality(text: string): number {
    if (!text || text.trim().length === 0) return 0;

    let score = text.length; // Base score on text length

    // Penalty for unwanted characters
    if (containsUnwantedChars(text)) score -= 50;

    // Bonus for complete words (contains spaces)
    if (text.includes(' ')) score += 20;

    // Penalty for too many special characters relative to text length
    const specialCharCount = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;
    if (specialCharCount > text.length * 0.3) score -= 30;

    return Math.max(0, score);
}

// Global worker for reuse
let sharedWorker: Tesseract.Worker | null = null;

async function getSharedWorker(): Promise<Tesseract.Worker> {
    if (!sharedWorker) {
        sharedWorker = await createWorker();
        await sharedWorker.load();
    }
    return sharedWorker;
}

// Simple OCR function (from index.ts)
async function recognizeTextInRegion(
    imagePath: string,
    bbox: BoundingBox,
    options: Partial<OCROptions> = {}
): Promise<string> {
    const opts = { ...DEFAULT_OCR_OPTIONS, ...options };

    try {
        const croppedImageBuffer = await sharp(imagePath)
            .extract(bbox)
            .grayscale()
            .normalize()
            .threshold(opts.threshold)
            .toBuffer();

        // Save debug image if requested
        if (opts.saveDebugImages) {
            const outputCroppedPath = path.resolve(__dirname, `./cropped_simple_${bbox.left}_${bbox.top}.png`);
            fs.writeFileSync(outputCroppedPath, croppedImageBuffer);
            console.log(`Debug image saved to: ${outputCroppedPath}`);
        }

        const worker = await getSharedWorker();
        await worker.reinitialize(opts.lang);

        const { data: { text } } = await worker.recognize(croppedImageBuffer);
        return text.trim();
    } catch (error) {
        console.error('Error in simple OCR processing:', error);
        return '';
    }
}

// Advanced OCR function with adjustment (from app.2.ts)
async function recognizeTextInRegionWithAdjustment(
    imagePath: string,
    initialBbox: BoundingBox,
    options: Partial<OCROptions> = {}
): Promise<string> {
    const opts = { ...DEFAULT_OCR_OPTIONS, ...options };
    const worker = await getSharedWorker();
    await worker.reinitialize(opts.lang);

    let currentBbox = { ...initialBbox };
    let bestText = '';
    let bestScore = 0;
    let attempt = 0;

    // Get image dimensions
    const metadata = await sharp(imagePath).metadata();
    const imageWidth = metadata.width || 0;
    const imageHeight = metadata.height || 0;

    console.log(`--- Starting OCR processing for BBox: ${JSON.stringify(initialBbox)} ---`);

    while (attempt < opts.maxAttempts) {
        attempt++;
        console.log(`  Attempt ${attempt} with BBox: ${JSON.stringify(currentBbox)}`);

        // Validate bounding box
        const validLeft = Math.max(0, currentBbox.left);
        const validTop = Math.max(0, currentBbox.top);
        const validWidth = Math.min(imageWidth - validLeft, currentBbox.width);
        const validHeight = Math.min(imageHeight - validTop, currentBbox.height);

        const safeBbox = {
            left: validLeft,
            top: validTop,
            width: validWidth,
            height: validHeight
        };

        if (safeBbox.width <= 0 || safeBbox.height <= 0) {
            console.log("  Invalid BoundingBox, stopping.");
            break;
        }

        try {
            const croppedImageBuffer = await sharp(imagePath)
                .extract(safeBbox)
                .grayscale()
                .normalize()
                .threshold(opts.threshold)
                .toBuffer();

            // Save debug image if requested
            if (opts.saveDebugImages) {
                const outputCroppedPath = path.resolve(__dirname, `./debug_cropped_${initialBbox.left}_${initialBbox.top}_attempt${attempt}.png`);
                fs.writeFileSync(outputCroppedPath, croppedImageBuffer);
                console.log(`  Debug image saved: ${outputCroppedPath}`);
            }

            const { data: { text } } = await worker.recognize(croppedImageBuffer);
            const cleanedText = text.trim();
            const textScore = calculateTextQuality(cleanedText);

            console.log(`  Recognized text (Attempt ${attempt}): "${cleanedText.substring(0, 50)}..." (Score: ${textScore})`);

            // Keep track of best result
            if (textScore > bestScore) {
                bestText = cleanedText;
                bestScore = textScore;
            }

            // If we found good quality text, we can stop early
            if (!containsUnwantedChars(cleanedText) && cleanedText.length > 0 && textScore > 50) {
                console.log(`  Found high-quality text on attempt ${attempt}.`);
                break;
            } else {
                console.log("  Adjusting BBox for better results...");
                // Expand bounding box
                currentBbox.left = Math.max(0, currentBbox.left - opts.adjustmentAmount);
                currentBbox.top = Math.max(0, currentBbox.top - opts.adjustmentAmount);
                currentBbox.width = Math.min(imageWidth - currentBbox.left, currentBbox.width + opts.adjustmentAmount * 2);
                currentBbox.height = Math.min(imageHeight - currentBbox.top, currentBbox.height + opts.adjustmentAmount * 2);
            }
        } catch (error) {
            console.error(`  Error during attempt ${attempt}:`, error);
            break;
        }
    }

    console.log(`--- Finished processing BBox: ${JSON.stringify(initialBbox)} (Best score: ${bestScore}) ---`);
    return bestText;
}

// Batch processing function
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
        console.log(`Result ${i + 1}: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);
    }

    return results;
}

// Cleanup function
async function cleanup(): Promise<void> {
    if (sharedWorker) {
        await sharedWorker.terminate();
        sharedWorker = null;
        console.log("Tesseract.js worker terminated.");
    }
}

// Main function
async function main() {
    try {
        const imageFile = path.resolve(__dirname, 'C:\\Users\\Anothai\\Documents\\onedrive\\picture\\testocr.jpg');

        // Define bounding boxes
        const boundingBoxes: BoundingBox[] = [
            { left: 0, top: 50, width: 900, height: 550 },   // Bubble 1
            { left: 0, top: 520, width: 500, height: 400 }   // Bubble 2
        ];

        // OCR options
        const ocrOptions: Partial<OCROptions> = {
            lang: 'eng',
            maxAttempts: 7,
            adjustmentAmount: 20,
            saveDebugImages: false, // Set to true for debugging
            threshold: 150
        };

        console.log("Starting batch OCR processing...");
        const results = await processBoundingBoxes(imageFile, boundingBoxes, ocrOptions);

        // Display results
        console.log("\n" + "=".repeat(50));
        console.log("FINAL RESULTS:");
        console.log("=".repeat(50));

        results.forEach((text, index) => {
            console.log(`\nBounding Box ${index + 1}:`);
            console.log("-".repeat(30));
            console.log(text || "[No text detected]");
        });

        // Cleanup
        await cleanup();

    } catch (error) {
        console.error("Error in main function:", error);
        await cleanup();
    }
}

// Export functions for use in other modules
export {
    recognizeTextInRegion,
    recognizeTextInRegionWithAdjustment,
    processBoundingBoxes,
    cleanup,
    // BoundingBox, (moved to export type below)
};
export type { OCROptions };

// Run main function if this file is executed directly
if (require.main === module) {
    main();
}