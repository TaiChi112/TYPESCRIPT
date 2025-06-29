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

async function recognizeTextInRegion(imagePath: string, bbox: BoundingBox, lang: string = 'eng'): Promise<string> {
    try {
        const croppedImageBuffer = await sharp(imagePath)
            .extract(bbox)
            .grayscale()
            .normalize()
            .threshold(150)
            .toBuffer();

        const outputCroppedPath = path.resolve(__dirname, `./out/image/cropped_bubble_${bbox.left}_${bbox.top}.png`);
        fs.writeFileSync(outputCroppedPath, croppedImageBuffer);
        console.log(`Cropped image saved to: ${outputCroppedPath}`);

        const worker = await createWorker();
        await worker.reinitialize(lang);

        const { data: { text } } = await worker.recognize(croppedImageBuffer, {});
        await worker.terminate();
        return text;
    } catch (error) {
        console.error('An error occurred during processing:', error);
        return '';
    }
}

async function main() {
    const imageFile = path.resolve(__dirname, 'image/testocr.jpg');
    const bubble1_test: BoundingBox = { left: 0, top: 50, width: 900, height: 550 };
    const bubble2_test: BoundingBox = { left: 0, top: 520, width: 500, height: 400 };
    const bubble3_test: BoundingBox = { left: 0, top: 1500, width: 750, height: 300 };

    console.log("Processing Bubble 1...");
    const text1 = await recognizeTextInRegion(imageFile, bubble1_test, 'eng');
    console.log(`\nText in Bubble 1:\n${text1}`);

    console.log("\nProcessing Bubble 2...");
    const text2 = await recognizeTextInRegion(imageFile, bubble2_test, 'eng');
    console.log(`\nText in Bubble 2:\n${text2}`);

    console.log("\nProcessing Bubble 3...");
    const text3 = await recognizeTextInRegion(imageFile, bubble3_test, 'eng');
    console.log(`\nText in Bubble 3:\n${text3}`);

}

main();

