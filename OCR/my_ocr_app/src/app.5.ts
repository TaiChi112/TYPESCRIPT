import sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import path from 'path';
import fs from 'fs';

// ตรวจสอบให้แน่ใจว่าโฟลเดอร์ 'out/image' มีอยู่
const outputDir = path.resolve(__dirname, './out/image');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// สมมติว่านี่คือ Image interface ของเรา
interface Image {
    path: string; // เปลี่ยนจาก data: any เป็น path: string
    width: number;
    height: number;
}

interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

// กำหนดตำแหน่งและขนาดของข้อความ "HELLO WORLD" บนรูปภาพต้นฉบับ 500x500
// นี่คือตำแหน่งจริงของ text ในภาพเริ่มต้นของเรา (เพื่อใช้เป็น ground truth)
const ORIGINAL_IMAGE_WIDTH = 500;
const ORIGINAL_IMAGE_HEIGHT = 500;
const ORIGINAL_TEXT_X = 400; // ตำแหน่ง x ของ HELLO WORLD
const ORIGINAL_TEXT_Y = 100; // ตำแหน่ง y ของ HELLO WORLD
const ORIGINAL_TEXT_WIDTH = 100; // สมมติว่า 'HELLO WORLD' กว้าง 100px
const ORIGINAL_TEXT_HEIGHT = 20;  // สมมติว่า 'HELLO WORLD' สูง 20px

/**
 * ฟังก์ชันสำหรับ OCR ในภูมิภาคที่กำหนดของรูปภาพ
 * นี่คือฟังก์ชันที่คุณให้มา แต่มีการปรับชื่อ BoundingBox เพื่อให้เข้ากับโค้ดหลัก
 * @param imagePath Path ของไฟล์รูปภาพ
 * @param bbox BoundingBox { left, top, width, height }
 * @param lang ภาษาสำหรับ OCR (ค่าเริ่มต้น 'eng')
 * @returns ข้อความที่อ่านได้จาก OCR
 */
async function recognizeTextInRegion(imagePath: string, bbox: { left: number; top: number; width: number; height: number }, lang: string = 'eng'): Promise<string> {
    try {
        console.log(`  [OCR Process]: Attempting to read text from ${imagePath} within box:`, bbox);
        const croppedImageBuffer = await sharp(imagePath)
            .extract(bbox)
            .grayscale()
            .normalize()
            .threshold(150)
            .toBuffer();

        const outputCroppedPath = path.resolve(outputDir, `cropped_bubble_${bbox.left}_${bbox.top}.png`);
        fs.writeFileSync(outputCroppedPath, croppedImageBuffer);
        console.log(`  [OCR Process]: Cropped image saved to: ${outputCroppedPath}`);

        const worker = await createWorker(lang); // ระบุภาษาตอนสร้าง worker
        // await worker.reinitialize(lang); // ไม่จำเป็นต้อง reinitialize ถ้าสร้าง worker ด้วยภาษาแล้ว

        const { data: { text } } = await worker.recognize(croppedImageBuffer);
        await worker.terminate();
        return text.trim(); // trim whitespace
    } catch (error) {
        console.error('  [OCR Error]: An error occurred during processing:', error);
        return '';
    }
}

/**
 * ฟังก์ชันหลักที่ใช้เรียก `recognizeTextInRegion`
 * @param image รูปภาพ (มี path และขนาด)
 * @param box BoundingBox ที่ต้องการอ่านข้อความ
 * @returns ข้อความที่อ่านได้ (อาจจะเป็น string ว่างถ้าไม่เจอ)
 */
async function readTextFromImage(image: Image, box: BoundingBox): Promise<string> {
    // ในการทำงานจริง ฟังก์ชันนี้จะเรียก OCR บนภาพจริง
    // แต่เพื่อจำลอง "text scaling" และ "finding specific text"
    // เรายังคงใช้ logic การตรวจสอบการทับซ้อนกับตำแหน่ง "HELLO WORLD" ที่คาดการณ์ไว้
    // ก่อนที่จะเรียก OCR จริงๆ เพื่อให้ algorithm โดยรวมทำงานได้ตามที่คุณต้องการ

    const scaleFactorX = image.width / ORIGINAL_IMAGE_WIDTH;
    const scaleFactorY = image.height / ORIGINAL_IMAGE_HEIGHT;

    const currentTextX = ORIGINAL_TEXT_X * scaleFactorX;
    const currentTextY = ORIGINAL_TEXT_Y * scaleFactorY;
    const currentTextWidth = ORIGINAL_TEXT_WIDTH * scaleFactorX;
    const currentTextHeight = ORIGINAL_TEXT_HEIGHT * scaleFactorY;

    // สร้าง BoundingBox สำหรับ OCR ที่ถูกต้องตามตำแหน่งของ 'box' ในภาพปัจจุบัน
    const ocrBox = {
        left: Math.round(box.x),
        top: Math.round(box.y),
        width: Math.round(box.width),
        height: Math.round(box.height)
    };

    // จำลองการปรับขนาดภาพในเชิงรูปธรรม
    // ในชีวิตจริง คุณอาจจะต้องสร้างไฟล์รูปภาพชั่วคราวที่ปรับขนาดแล้ว
    // หรือส่ง buffer ของรูปภาพที่ปรับขนาดแล้วเข้าไปใน recognizeTextInRegion โดยตรง
    // สำหรับตอนนี้ เราจะสมมติว่า recognizeTextInRegion ทำงานกับภาพที่ 'scaled' มาแล้ว
    // หรือเราจะส่ง path ของ original image และให้ OCR Box เป็นตัวแทนของ scale

    // ในการใช้งานจริง, ถ้าคุณย่อรูปภาพจริงๆ (เช่น 500x500 -> 250x250)
    // คุณจะต้องเซฟรูปภาพที่ถูกย่อแล้วเป็นไฟล์ใหม่ชั่วคราว
    // และส่ง path ของรูปภาพที่ย่อแล้วนั้นไปให้ `recognizeTextInRegion`
    // หรือปรับ `recognizeTextInRegion` ให้รับ `Buffer` แทน `imagePath`

    // สำหรับตัวอย่างนี้ เราจะเรียก OCR บนภาพต้นฉบับ 500x500
    // แต่ `box` ที่ส่งไปจะถูกตีความว่าเป็นการเลือกพื้นที่จากภาพต้นฉบับ
    // ที่ 'เทียบเท่า' กับพื้นที่ในภาพที่ scale แล้ว
    // *** นี่คือส่วนที่ซับซ้อนที่สุดในการจำลอง ***
    // ทางออกที่ดีกว่าคือ: เมื่อ resizeImage ทำงานจริง, มันควรจะ save รูปที่ resize แล้วออกมา
    // แล้ว readTextFromImage ค่อยใช้ path ของรูปที่ resize แล้ว

    // วิธีแก้ไขแบบง่ายสำหรับตอนนี้: เราจะ 'แกล้งทำเป็น' ว่า recognizeTextInRegion ทำงานบนภาพที่ถูก scale
    // โดยการปรับ BoundingBox ที่ส่งให้ OCR ให้กลับไปเป็นสัดส่วนของภาพต้นฉบับ
    // (เพราะ recognizeTextInRegion คาดหวัง bbox ที่ relative กับ imagePath)
    const originalScaleBox = {
        left: Math.round(box.x / scaleFactorX),
        top: Math.round(box.y / scaleFactorY),
        width: Math.round(box.width / scaleFactorX),
        height: Math.round(box.height / scaleFactorY)
    };

    // ตรวจสอบขอบเขตไม่ให้เกินภาพต้นฉบับ
    originalScaleBox.left = Math.max(0, originalScaleBox.left);
    originalScaleBox.top = Math.max(0, originalScaleBox.top);
    originalScaleBox.width = Math.min(originalScaleBox.width, ORIGINAL_IMAGE_WIDTH - originalScaleBox.left);
    originalScaleBox.height = Math.min(originalScaleBox.height, ORIGINAL_IMAGE_HEIGHT - originalScaleBox.top);


    // ทำ OCR จริงๆ
    const ocrResult = await recognizeTextInRegion(image.path, originalScaleBox);
    console.log(`  [Mock OCR]: OCR result in box (${box.x},${box.y}) was: "${ocrResult}"`);

    // ตรวจสอบว่า OCR เจอข้อความที่เราต้องการหรือไม่
    // ในการใช้งานจริง คุณอาจต้องใช้ Regex หรือ logic อื่นๆ ในการยืนยัน
    if (ocrResult.toUpperCase().includes("HELLO WORLD")) { // ตรวจสอบแบบไม่สนใจตัวพิมพ์เล็กใหญ่
        return "HELLO WORLD"; // คืนค่าข้อความที่สมมติว่าเจอทั้งหมด
    } else if (ocrResult.length > 0) { // ถ้าเจอข้อความอะไรบางอย่าง แต่ไม่ใช่ทั้งหมด
        // นี่คือส่วนที่ algorithm ของคุณบอกว่า "เจอ text 1 ตัว เช่น ตัว D"
        // เราจะจำลองโดยการคืนค่าข้อความนั้นไป เพื่อให้ลูปขยาย box ทำงาน
        return ocrResult;
    }
    return ""; // ไม่เจอข้อความเลย
}

/**
 * ฟังก์ชันจำลอง: ปรับขนาดรูปภาพ
 * ในการใช้งานจริง คุณจะต้องใช้ sharp เพื่อสร้างไฟล์รูปภาพใหม่ที่ถูกปรับขนาดแล้ว
 * @param image รูปภาพต้นฉบับ
 * @param newWidth ความกว้างใหม่
 * @param newHeight ความสูงใหม่
 * @returns รูปภาพที่ถูกปรับขนาดแล้ว (ตอนนี้แค่เปลี่ยน metadata)
 */
async function resizeImage(image: Image, newWidth: number, newHeight: number): Promise<Image> {
    console.log(`  [Mock Image]: Resizing image from ${image.width}x${image.height} to ${newWidth}x${newHeight}`);

    // *** นี่คือส่วนที่คุณต้อง implement การ resize และ save รูปภาพจริง ***
    // เช่น:
    // const resizedBuffer = await sharp(image.path)
    //     .resize(newWidth, newHeight)
    //     .toBuffer();
    // const newImagePath = path.resolve(outputDir, `resized_${newWidth}x${newHeight}.png`);
    // fs.writeFileSync(newImagePath, resizedBuffer);

    // สำหรับตัวอย่างนี้ เราจะยังคงใช้ path เดิม แต่เปลี่ยน metadata
    // ซึ่งหมายความว่า `recognizeTextInRegion` จะต้อง handle การ scale ของ bbox เอง
    return {
        path: image.path, // ในการใช้งานจริง ควรเป็น path ของรูปที่ resize แล้ว
        width: newWidth,
        height: newHeight,
    };
}

/**
 * Algorithm สำหรับค้นหาข้อความในรูปภาพ
 * @param initialImagePath Path ของรูปภาพเริ่มต้น (500x500)
 * @param targetText ข้อความที่ต้องการค้นหา ('HELLO WORLD')
 * @returns BoundingBox ที่ครอบคลุมข้อความ หรือ null ถ้าไม่พบ
 */
async function findTextInImage(initialImagePath: string, targetText: string): Promise<BoundingBox | null> {
    let currentImage: Image = {
        path: initialImagePath,
        width: ORIGINAL_IMAGE_WIDTH,
        height: ORIGINAL_IMAGE_HEIGHT,
    };

    const initialBoxSize = 100;
    let currentBox: BoundingBox = {
        x: (currentImage.width - initialBoxSize) / 2,
        y: (currentImage.height - initialBoxSize) / 2,
        width: initialBoxSize,
        height: initialBoxSize,
    };

    console.log(`--- Starting text search for "${targetText}" ---`);

    while (currentImage.width >= 50 && currentImage.height >= 50) {
        console.log(`\nChecking image at ${currentImage.width}x${currentImage.height} with box at (${currentBox.x},${currentBox.y}) size ${currentBox.width}x${currentBox.height}`);

        const textFoundInBox = await readTextFromImage(currentImage, currentBox);

        if (textFoundInBox.includes(targetText)) { // ถ้าเจอข้อความทั้งหมดตั้งแต่แรก
            console.log(`Full text "${targetText}" found directly in initial box!`);
            return currentBox;
        } else if (textFoundInBox.length > 0) { // ถ้าเจอ text บางส่วน
            console.log(`Text segment "${textFoundInBox}" found! Now trying to expand box.`);
            let expandedBox = { ...currentBox };
            let foundFullText = false;

            while (expandedBox.width < currentImage.width * 0.95 && expandedBox.height < currentImage.height * 0.95) {
                const prevBox = { ...expandedBox };
                const newWidth = expandedBox.width * 2;
                const newHeight = expandedBox.height * 2;

                expandedBox = {
                    x: Math.max(0, expandedBox.x - (newWidth - expandedBox.width) / 2),
                    y: Math.max(0, expandedBox.y - (newHeight - expandedBox.height) / 2),
                    width: newWidth,
                    height: newHeight,
                };

                expandedBox.x = Math.max(0, Math.min(expandedBox.x, currentImage.width - expandedBox.width));
                expandedBox.y = Math.max(0, Math.min(expandedBox.y, currentImage.height - expandedBox.height));
                expandedBox.width = Math.min(expandedBox.width, currentImage.width - expandedBox.x);
                expandedBox.height = Math.min(expandedBox.height, currentImage.height - expandedBox.y);

                console.log(`  Expanding box to ${expandedBox.width}x${expandedBox.height} at (${expandedBox.x},${expandedBox.y})...`);
                const fullTextAttempt = await readTextFromImage(currentImage, expandedBox);

                if (fullTextAttempt.includes(targetText)) {
                    console.log(`  Full text "${targetText}" found in expanded box!`);
                    return expandedBox;
                }

                if (expandedBox.width === prevBox.width && expandedBox.height === prevBox.height) {
                    console.log("  Box could not expand further or did not find more text. Stopping expansion.");
                    break;
                }
            }
            break; // ออกจากลูปหลัก ถ้าขยาย Box แล้วหาไม่เจอ
        } else {
            console.log(`No text found in box. Resizing image.`);
            currentImage = await resizeImage(currentImage, currentImage.width / 2, currentImage.height / 2);

            currentBox.x = (currentImage.width - initialBoxSize) / 2; // ยังคงใช้ initialBoxSize เพราะ Box ไม่ได้ scale ตามภาพ
            currentBox.y = (currentImage.height - initialBoxSize) / 2;

            currentBox.width = Math.min(initialBoxSize, currentImage.width);
            currentBox.height = Math.min(initialBoxSize, currentImage.height);

            if (currentBox.width < 10 || currentBox.height < 10) {
                console.log("Box became too small to be effective. Stopping search.");
                break;
            }
        }
    }

    console.log("\n--- Search finished. Text not fully found in any step. ---");
    return null;
}

// --- การใช้งาน ---
async function runSearch() {
    // *** สำคัญ: คุณต้องมีไฟล์รูปภาพชื่อ 'original_500x500.png' ในโฟลเดอร์เดียวกับสคริปต์นี้
    // ที่มีข้อความ "HELLO WORLD" อยู่ที่ประมาณ (400, 100)
    const imagePath = path.resolve(__dirname, './image/testocr5.png');
    
    // สร้างไฟล์รูปภาพจำลองสำหรับทดสอบ (ถ้ายังไม่มี)
    if (!fs.existsSync(imagePath)) {
        console.warn(`\nWarning: Image file not found at ${imagePath}. Creating a dummy image for testing.`);
        // ใช้ sharp สร้างรูปภาพสีขาว 500x500
        await sharp({
            create: {
                width: 500,
                height: 500,
                channels: 3,
                background: { r: 255, g: 255, b: 255 } // สีขาว
            }
        }).toFile(imagePath);
        console.warn(`Dummy image created. Please manually add "HELLO WORLD" text at (400, 100) to ${imagePath} for accurate testing with OCR.`);
        console.warn(`You might need to use an image editor to add the text for OCR to actually find it.`);
        // ในสถานการณ์จริง คุณต้องใช้เครื่องมืออื่นในการฝังข้อความลงในภาพ หรือมีรูปภาพที่เตรียมไว้แล้ว
        // การสร้างรูปภาพที่มีข้อความแบบอัตโนมัติด้วย Sharp/Node.js ค่อนข้างซับซ้อน
    }


    const targetText = "NORMAL";

    const resultBox = await findTextInImage(imagePath, targetText);

    if (resultBox) {
        console.log(`\n🎉 Found "${targetText}" at: x=${resultBox.x}, y=${resultBox.y}, width=${resultBox.width}, height=${resultBox.height}`);
    } else {
        console.log(`\n😢 Could not find "${targetText}" in the image.`);
    }
}

runSearch();