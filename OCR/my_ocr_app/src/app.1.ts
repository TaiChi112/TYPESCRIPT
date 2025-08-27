// import * as cv from 'opencv4nodejs'; // OpenCV.js for Node.js
// import { createWorker } from 'tesseract.js';
// import * as path from 'path';
// import sharp from 'sharp';
// import * as fs from 'fs';

// // Define BoundingBox interface (เหมือนเดิม)
// interface BoundingBox {
//     x: number; // OpenCV ใช้ x, y แทน left, top
//     y: number;
//     width: number;
//     height: number;
// }

// // ฟังก์ชันสำหรับหา Bounding Boxes ของ Speech Bubbles
// async function findSpeechBubbleBoundingBoxes(imagePath: string): Promise<BoundingBox[]> {
//     const src = cv.imread(imagePath); // อ่านรูปภาพด้วย OpenCV
//     const gray = src.bgrToGray(); // 1. แปลงเป็น Grayscale

//     // 2. Preprocessing เพิ่มเติม (อาจต้องปรับค่า)
//     // ลด Noise ก่อน Thresholding
//     const blurred = gray.medianBlur(5); // Median blur มักจะดีกับการลด noise บนภาพถ่าย
    
//     // 3. Binarization (Thresholding) - สำคัญมาก
//     // ลองปรับค่า thresholdValue และ maxValue ให้เหมาะสมกับรูปภาพ Manga ของคุณ
//     // cv.THRESH_BINARY หรือ cv.THRESH_BINARY_INV
//     const thresholdValue = 180; // ค่านี้สำคัญมากในการทำให้ตัวอักษรดำสนิท พื้นขาวสนิท
//     const maxValue = 255;
//     const binary = blurred.threshold(thresholdValue, maxValue, cv.THRESH_BINARY_INV); // THRESH_BINARY_INV ทำให้ข้อความเป็นสีขาว พื้นหลังสีดำ

//     // Optionally save the binary image for debugging
//     // cv.imwrite(path.resolve(__dirname, './debug_binary.png'), binary);


//     // 4. Morphology เพื่อเชื่อมช่องว่างเล็กๆ ในตัวอักษร หรือแยกวัตถุ
//     const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
//     const dilated = binary.dilate(kernel); // ขยายตัวอักษรเล็กน้อย เพื่อเชื่อมส่วนที่ขาด

//     // Optionally save the dilated image for debugging
//     // cv.imwrite(path.resolve(__dirname, './debug_dilated.png'), dilated);


//     // 5. หา Contours (โครงร่าง)
//     // cv.RETR_EXTERNAL: หาเฉพาะ Contour ภายนอกสุด (ไม่สนใจ Contour ซ้อนใน)
//     // cv.CHAIN_APPROX_SIMPLE: ลดจุดใน Contour เพื่อให้ได้รูปร่างที่เรียบง่าย
//     const contours = dilated.findContours(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

//     const detectedBoxes: BoundingBox[] = [];

//     // 6. กรอง Contours
//     for (const contour of contours) {
//         const area = contour.area;
//         const rect = contour.boundingRect(); // ได้ Bounding Box ของ Contour นั้น

//         // กรองตามขนาด (ต้องปรับค่า min/max area/width/height ให้เหมาะสมกับ Speech Bubble)
//         const minArea = 1000; // พื้นที่ขั้นต่ำของ Bubble (ประมาณ)
//         const maxArea = src.cols * src.rows * 0.5; // ไม่เกินครึ่งของรูปภาพทั้งหมด
//         const minWidth = 50;
//         const minHeight = 20;
//         const aspectRatio = rect.width / rect.height; // อัตราส่วน กว้าง/สูง

//         // กรอง Contour ที่เป็นไปได้ว่าเป็น Speech Bubble
//         // เงื่อนไขเหล่านี้ต้องปรับแต่งอย่างหนักตามลักษณะของ Manga ของคุณ
//         if (area > minArea && area < maxArea && rect.width > minWidth && rect.height > minHeight && aspectRatio > 1.0 && aspectRatio < 8.0) {
//             // (ปรับ aspectRatio: Speech Bubble มักจะกว้างกว่าสูง แต่ไม่แคบมาก)
//             // อาจจะมีการกรองเพิ่มเติม เช่น ตรวจสอบความนูนของรูปร่าง (convexity)
//             // หรือการตรวจสอบว่ามีข้อความอยู่ภายในจริงๆ ด้วย Tesseract (แต่จะช้า)

//             // เพิ่ม Margin เล็กน้อยรอบ Bounding Box ที่ตรวจจับได้ (optional)
//             const margin = 5;
//             const finalRect = {
//                 x: Math.max(0, rect.x - margin),
//                 y: Math.max(0, rect.y - margin),
//                 width: Math.min(src.cols - rect.x, rect.width + margin * 2),
//                 height: Math.min(src.rows - rect.y, rect.height + margin * 2)
//             };

//             detectedBoxes.push(finalRect);
//         }
//     }
    
//     // Sort boxes by y-coordinate then x-coordinate to get text in reading order
//     detectedBoxes.sort((a, b) => {
//         if (Math.abs(a.y - b.y) < 10) { // If lines are close, sort by x
//             return a.x - b.x;
//         }
//         return a.y - b.y; // Otherwise, sort by y
//     });


//     return detectedBoxes;
// }

// // ฟังก์ชัน OCR (เหมือนเดิม)
// async function recognizeTextInRegion(imagePath: string, bbox: BoundingBox, lang: string = 'eng'): Promise<string> {
//     try {
//         const croppedImageBuffer = await sharp(imagePath)
//             .extract({ left: bbox.x, top: bbox.y, width: bbox.width, height: bbox.height })
//             .grayscale()
//             .normalize()
//             .threshold(180) // อาจต้องปรับค่า threshold อีกครั้งสำหรับภาพที่ถูกตัด
//             .toBuffer();

//         const outputCroppedPath = path.resolve(__dirname, `./detected_cropped_x${bbox.x}_y${bbox.y}.png`);
//         fs.writeFileSync(outputCroppedPath, croppedImageBuffer);
//         // console.log(`บันทึกภาพที่ตัดแล้วไปที่: ${outputCroppedPath}`);

//         const worker = await createWorker();
//         await worker.reinitialize(lang);

//         const { data: { text } } = await worker.recognize(croppedImageBuffer, {});
//         await worker.terminate();
//         return text.trim(); // Trim whitespace
//     } catch (error) {
//         console.error(`เกิดข้อผิดพลาดในการประมวลผล Bounding Box {x:${bbox.x}, y:${bbox.y}, w:${bbox.width}, h:${bbox.height}}:`, error);
//         return '';
//     }
// }

// // Main execution
// async function main() {
//     const imageFile = path.resolve(__dirname, 'C:\\Users\\Anothai\\Documents\\onedrive\\picture\\testocr.jpg'); // เปลี่ยนเป็น path รูปภาพของคุณ

//     console.log("กำลังตรวจจับ Speech Bubbles อัตโนมัติ...");
//     const boundingBoxes = await findSpeechBubbleBoundingBoxes(imageFile);

//     if (boundingBoxes.length === 0) {
//         console.log("ไม่พบ Speech Bubbles ในรูปภาพ");
//         return;
//     }

//     console.log(`พบ ${boundingBoxes.length} Bounding Boxes ที่เป็นไปได้:`);

//     let fullText = '';
//     for (let i = 0; i < boundingBoxes.length; i++) {
//         const bbox = boundingBoxes[i];
//         if (!bbox) continue;
//         console.log(`\n--- ประมวลผล Bubble ${i + 1} (Box: x=${bbox.x}, y=${bbox.y}, w=${bbox.width}, h=${bbox.height}) ---`);
//         const text = await recognizeTextInRegion(imageFile, bbox, 'eng');
//         console.log(text);
//         fullText += text + '\n\n'; // เพิ่มข้อความเป็นรวม
//     }

//     // console.log("\n--- ข้อความทั้งหมดที่ตรวจจับได้ ---");
//     // console.log(fullText);
// }

// main();

import * as cv from 'opencv4nodejs';
import * as path from 'path';
import sharp from 'sharp'; // ยังคงใช้ sharp สำหรับ pre-processing และ cropping
import * as fs from 'fs';
import { createWorker } from 'tesseract.js';

interface BoundingBox {
    left: number;
    top: number;
    width: number;
    height: number;
}

// ฟังก์ชันสำหรับตรวจจับ Text Bubbles ด้วย OpenCV
async function findTextBubbles(imagePath: string): Promise<BoundingBox[]> {
    const bubbles: BoundingBox[] = [];
    
    // โหลดรูปภาพด้วย OpenCV
    const img = await cv.imreadAsync(imagePath);
    
    // Pre-processing
    const gray = img.bgrToGray();
    const blurred = gray.gaussianBlur(new cv.Size(5, 5), 0); // ลด noise
    
    // Adaptive Thresholding เพื่อแยก Text Bubble ออกจากพื้นหลัง
    // ค่า 255 คือค่าสูงสุด, cv.ADAPTIVE_THRESH_GAUSSIAN_C คือใช้วิธี Gaussian เพื่อคำนวณ Threshold, cv.THRESH_BINARY_INV คือกลับสีดำ/ขาว
    // 11 คือขนาด Block Size, 2 คือค่าคงที่ C
    const thresh = blurred.adaptiveThreshold(255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2);
    
    // Morphological Operations (Optional: เปิดรูเล็กๆ หรือเชื่อมต่อส่วนที่ขาด)
    const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
    const opened = thresh.morphologyEx(kernel, cv.MORPH_OPEN); // Remove small noises
    const closed = opened.morphologyEx(kernel, cv.MORPH_CLOSE); // Close small gaps

    // หา Contours
    const contours = closed.findContours(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE); // RETR_EXTERNAL เพื่อหาแค่ Contour นอกสุด

    // กรองและหา Bounding Box
    for (const contour of contours) {
        const area = contour.area;
        // กรองตามขนาด (ปรับค่านี้ตามขนาด Bubble โดยทั่วไปของคุณ)
        if (area > 1000 && area < 500000) { // ตัวอย่างค่า: กรอง Contours ที่ใหญ่เกินไปหรือเล็กเกินไป
            const rect = contour.boundingRect();
            // ตรวจสอบอัตราส่วนภาพ (width/height) หาก Bubble มีลักษณะเป็นวงรี/วงกลม
            const aspectRatio = rect.width / rect.height;
            if (aspectRatio > 0.2 && aspectRatio < 5) { // ปรับค่านี้ตามลักษณะ Bubble
                bubbles.push({
                    left: rect.x,
                    top: rect.y,
                    width: rect.width,
                    height: rect.height
                });
            }
        }
    }
    
    // Optional: บันทึกภาพที่ผ่านการประมวลผลเพื่อดูผลลัพธ์
    cv.imwrite(path.resolve(__dirname, './debug_thresholded.png'), thresh);
    // Draw contours on a copy of the image for visualization
    const imgWithContours = img.copy();
    imgWithContours.drawContours(
        contours,
        new cv.Vec3(0, 255, 0), // color: green (BGR format)
        -1,                // contourIdx: draw all contours
        2                  // thickness
    );
    cv.imwrite(path.resolve(__dirname, './debug_contours.png'), imgWithContours);

    return bubbles;
}


async function recognizeTextInRegion(imagePath: string, bbox: BoundingBox, lang: string = 'eng'): Promise<string> {
    const worker = await createWorker(); // สร้าง worker ข้างนอก loop และ reuse จะดีกว่า
    await worker.load();
    await worker.reinitialize(lang);

    try {
        const croppedImageBuffer = await sharp(imagePath)
            .extract(bbox)
            .grayscale()
            .normalize()
            .threshold(150) // หรือใช้ adaptiveThreshold ของ sharp ก็ได้
            .toBuffer();

        // Optional: บันทึก cropped image เพื่อ debug
        // const outputCroppedPath = path.resolve(__dirname, `./cropped_bubble_${bbox.left}_${bbox.top}.png`);
        // fs.writeFileSync(outputCroppedPath, croppedImageBuffer);
        // console.log(`Cropped image saved to: ${outputCroppedPath}`);

        const { data: { text } } = await worker.recognize(croppedImageBuffer);
        return text;
    } catch (error) {
        console.error('An error occurred during processing region:', error);
        return '';
    } finally {
        await worker.terminate(); // terminate worker เมื่อใช้เสร็จใน function นี้ (แต่ถ้าเรียกซ้ำๆ ควร reuse)
    }
}

async function main() {
    const imageFile = path.resolve(__dirname, 'C:\\Users\\Anothai\\Documents\\onedrive\\picture\\testocr.jpg');
    
    console.log("Detecting text bubbles...");
    const bubbles = await findTextBubbles(imageFile);
    
    if (bubbles.length === 0) {
        console.log("No text bubbles found in the image.");
        return;
    }

    console.log(`Found ${bubbles.length} bubbles. Processing them...`);

    const sharedWorker = await createWorker();
    await sharedWorker.load();
    await sharedWorker.reinitialize('eng'); 

    for (let i = 0; i < bubbles.length; i++) {
        const bbox = bubbles[i];
        console.log(`\nProcessing Bubble ${i + 1} at bbox: ${JSON.stringify(bbox)}`);
        
        try {
            if (!bbox) {
                console.error(`Bubble ${i + 1} bounding box is undefined, skipping.`);
                continue;
            }
            const croppedImageBuffer = await sharp(imageFile)
                .extract(bbox as sharp.Region)
                .grayscale()
                .normalize()
                .threshold(150)
                .toBuffer();
            
            const { data: { text } } = await sharedWorker.recognize(croppedImageBuffer);
            console.log(`Text in Bubble ${i + 1}:\n${text}`);
        } catch (error) {
            console.error(`Error processing bubble ${i + 1}:`, error);
        }
    }

    await sharedWorker.terminate();
    console.log("\n--- All bubbles processed. ---");
}

main();