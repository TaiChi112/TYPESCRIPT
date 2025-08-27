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

// ฟังก์ชันสำหรับตรวจสอบว่าข้อความมีอักขระพิเศษที่เราไม่ต้องการหรือไม่
function containsUnwantedChars(text: string): boolean {
    // ใช้ Regular Expression ในการตรวจสอบ
    // [^a-zA-Z0-9\s.,!?'"ก-๙] คือ "ไม่ใช่" ตัวอักษร, ตัวเลข, ช่องว่าง, เครื่องหมายวรรคตอนพื้นฐาน, และตัวอักษรไทย
    // คุณสามารถเพิ่ม/ลดอักขระที่ยอมรับได้ใน [^...] นี้
    const unwantedPattern = /[~!@#$%^&*()_+=|\\{}[\]:;"'<,>?/]/; // ตัวอย่าง: ตรวจจับอักขระพิเศษทั่วไป
    return unwantedPattern.test(text);
}

// Global worker เพื่อ reuse
let sharedWorker: Tesseract.Worker | null = null;

async function getSharedWorker(): Promise<Tesseract.Worker> {
    sharedWorker ??= await createWorker();
    return sharedWorker;
}

async function recognizeTextInRegionWithAdjustment(
    imagePath: string,
    initialBbox: BoundingBox,
    lang: string = 'eng',
    maxAttempts: number = 5, // จำนวนครั้งสูงสุดที่จะลองปรับ BoundingBox
    adjustmentAmount: number = 10 // จำนวนพิกเซลที่จะขยาย/ย่อในแต่ละครั้ง
): Promise<string> {
    const worker = await getSharedWorker(); // ใช้ worker ที่สร้างไว้แล้ว
    await worker.load();
    await worker.reinitialize(lang);

    let currentBbox = { ...initialBbox }; // สร้างสำเนาของ BoundingBox เริ่มต้น
    let bestText = '';
    let attempt = 0;

    // หาขนาดจริงของรูปภาพ
    const metadata = await sharp(imagePath).metadata();
    const imageWidth = metadata.width || 0;
    const imageHeight = metadata.height || 0;

    console.log(`--- เริ่มต้นประมวลผล BoundingBox ที่ ${JSON.stringify(initialBbox)} ---`);

    while (attempt < maxAttempts) {
        attempt++;
        console.log(`  Attemp ${attempt} with BBox: ${JSON.stringify(currentBbox)}`);

        // ตรวจสอบว่า BoundingBox ไม่หลุดขอบรูปภาพ
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
        
        // ถ้า BoundingBox กลายเป็นค่าที่ไม่ถูกต้อง (เช่น width/height เป็น 0 หรือติดลบ) ให้หยุด
        if (safeBbox.width <= 0 || safeBbox.height <= 0) {
            console.log("  Invalid BoundingBox, stopping.");
            break;
        }

        try {
            const croppedImageBuffer = await sharp(imagePath)
                .extract(safeBbox)
                .grayscale()
                .normalize()
                .threshold(150)
                .toBuffer();

            // Optional: บันทึก cropped image สำหรับ debug ในแต่ละ attempt
            // const outputCroppedPath = path.resolve(__dirname, `./debug_cropped_${initialBbox.left}_${initialBbox.top}_attempt${attempt}.png`);
            // fs.writeFileSync(outputCroppedPath, croppedImageBuffer);
            // console.log(`  Saved cropped image for debug: ${outputCroppedPath}`);

            const { data: { text } } = await worker.recognize(croppedImageBuffer);
            const cleanedText = text.trim();

            console.log(`  Recognized text (Attempt ${attempt}): "${cleanedText.substring(0, 50)}..."`); // แสดงแค่บางส่วน
            
            // ถ้าข้อความที่ได้ไม่มีอักขระพิเศษที่เราไม่ต้องการ ให้ถือว่าโอเคแล้ว
            if (!containsUnwantedChars(cleanedText) && cleanedText.length > 0) {
                bestText = cleanedText;
                console.log(`  Found good text on attempt ${attempt}.`);
                break; // หยุด loop
            } else {
                console.log("  Text contains unwanted characters or is empty, adjusting BBox...");
                // กลยุทธ์การปรับ: ขยาย BoundingBox ออกไปเล็กน้อย
                // ลด left/top และเพิ่ม width/height เพื่อขยายพื้นที่ครอบคลุม
                currentBbox.left = Math.max(0, currentBbox.left - adjustmentAmount);
                currentBbox.top = Math.max(0, currentBbox.top - adjustmentAmount);
                currentBbox.width = Math.min(imageWidth - currentBbox.left, currentBbox.width + adjustmentAmount * 2);
                currentBbox.height = Math.min(imageHeight - currentBbox.top, currentBbox.height + adjustmentAmount * 2);
            }
        } catch (error) {
            console.error(`  An error occurred during attempt ${attempt}:`, error);
            // อาจจะลองปรับ BBox หรือหยุด loop แล้วแต่กรณี
            break; // ถ้าเกิด error ร้ายแรง อาจจะหยุดเลย
        }
    }
    console.log(`--- สิ้นสุดการประมวลผล BoundingBox สำหรับ ${JSON.stringify(initialBbox)} ---`);
    return bestText;
}

async function main() {
    const imageFile = path.resolve(__dirname, 'C:\\Users\\Anothai\\Documents\\onedrive\\picture\\testocr.jpg');
    
    const bubble1_test: BoundingBox = { left: 0, top: 50, width: 900, height: 550 };
    const bubble2_test: BoundingBox = { left: 0, top: 520, width: 500, height: 400 };

    console.log("Processing Bubble 1...");
    const text1 = await recognizeTextInRegionWithAdjustment(imageFile, bubble1_test, 'eng', 7, 20); // 7 attempts, adjust by 20px
    console.log(`\nFinal Text in Bubble 1:\n${text1}`);

    console.log("\nProcessing Bubble 2...");
    const text2 = await recognizeTextInRegionWithAdjustment(imageFile, bubble2_test, 'eng', 5, 10); // 5 attempts, adjust by 10px
    console.log(`\nFinal Text in Bubble 2:\n${text2}`);

    // อย่าลืม terminate worker เมื่อประมวลผลทั้งหมดเสร็จสิ้น
    if (sharedWorker) {
        await sharedWorker.terminate();
        console.log("\nTesseract.js worker terminated.");
    }
}

main();