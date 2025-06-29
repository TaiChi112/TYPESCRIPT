// src/components/AsciiArtConverter.tsx

'use client'; // **สำคัญมาก:** ระบุว่านี่คือ Client Component ที่จะทำงานใน Browser

import React, { useState, useRef, useCallback, useMemo, ChangeEvent } from 'react';

// ชุดตัวอักษรสำหรับแปลง ASCII Art (จากตัวอักษรที่ "เข้ม" ไป "อ่อน")
// คุณสามารถปรับแต่งชุดนี้ได้ตามต้องการ เพื่อให้ได้สไตล์ ASCII Art ที่แตกต่างกัน
// ตัวอย่าง: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,"^`'`.' (ยาวกว่าและละเอียดกว่า)
const ASCII_CHARS = '@%#*+=-:. ';

// Constants moved outside component to avoid recreation
const MONOSPACE_ASPECT_RATIO = 0.55;
const LUMINOSITY_WEIGHTS = { r: 0.2126, g: 0.7152, b: 0.0722 } as const;

/**
 * Props สำหรับ AsciiArtConverter Component
 */
interface AsciiArtConverterProps {
  /**
   * ความกว้างสูงสุดของ ASCII Art ที่จะแสดงผล (เป็นจำนวนตัวอักษร/คอลัมน์)
   * ค่าเริ่มต้นคือ 120 ตัวอักษร
   */
  maxWidth?: number;
  /**
   * ความสูงสูงสุดของ ASCII Art ที่จะแสดงผล (เป็นจำนวนบรรทัด)
   * หากไม่กำหนด ค่าจะขึ้นอยู่กับความกว้างและอัตราส่วนภาพ
   */
  maxHeight?: number;
  /**
   * ขนาด Font ของ ASCII Art (เช่น '8px', 'small', '0.6em')
   * ค่าเริ่มต้นคือ '8px'
   */
  fontSize?: string;
  /**
   * สีพื้นหลังของกล่องแสดงผล ASCII Art (ค่าเริ่มต้น: '#000' - ดำ)
   */
  backgroundColor?: string;
  /**
   * สีตัวอักษรของ ASCII Art (ค่าเริ่มต้น: '#0f0' - เขียวเหมือน Terminal)
   */
  textColor?: string;
}

/**
 * คอมโพเนนต์สำหรับแปลงรูปภาพเป็น ASCII Art และแสดงผลบนหน้าเว็บ
 * ผู้ใช้สามารถอัปโหลดรูปภาพ และระบบจะแปลงเป็น ASCII Art แล้วแสดงใน `<pre>` tag
 */
const AsciiArtConverter: React.FC<AsciiArtConverterProps> = ({
  maxWidth = 120, 
  maxHeight,
  fontSize = '8px',
  backgroundColor = '#000', // Default background color
  textColor = '#0f0'        // Default text color
}) => {
  // State สำหรับเก็บผลลัพธ์ ASCII Art (null ถ้ายังไม่มีการแปลง)
  const [asciiArt, setAsciiArt] = useState<string | null>(null); 
  // useRef สำหรับเข้าถึง Canvas element ใน DOM (ใช้ประมวลผลรูปภาพ)
  const canvasRef = useRef<HTMLCanvasElement>(null); 
  // useRef สำหรับเข้าถึง Input File element (ใช้เคลียร์ค่าไฟล์ที่เลือก)
  const fileInputRef = useRef<HTMLInputElement>(null); 
  // State สำหรับแสดงข้อความโหลด
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // State สำหรับเก็บข้อผิดพลาด
  const [error, setError] = useState<string | null>(null);

  // Memoized values for optimization
  const asciiCharsLengthMinusOne = useMemo(() => ASCII_CHARS.length - 1, []);

  /**
   * Optimized function to calculate target dimensions
   */
  const calculateTargetDimensions = useCallback((imgWidth: number, imgHeight: number) => {
    let targetWidth = imgWidth;
    let targetHeight = imgHeight;

    // ปรับขนาดภาพตาม `maxWidth` ถ้าภาพกว้างเกินไป
    if (maxWidth && imgWidth > maxWidth) {
      targetWidth = maxWidth;
      targetHeight = Math.floor(imgHeight * (targetWidth / imgWidth) * MONOSPACE_ASPECT_RATIO);
    }

    // ปรับขนาดภาพตาม `maxHeight` ถ้าภาพสูงเกินไป (หลังจากปรับความกว้างแล้ว)
    if (maxHeight && targetHeight > maxHeight) {
      targetHeight = maxHeight;
      targetWidth = Math.floor(targetWidth * (maxHeight / targetHeight) / MONOSPACE_ASPECT_RATIO);
    }
    
    // กรณีที่ภาพต้นฉบับมีขนาดเล็กกว่า maxWidth/maxHeight ที่กำหนด
    // ให้คำนวณ targetHeight ใหม่โดยใช้ MONOSPACE_ASPECT_RATIO เพื่อไม่ให้ภาพดูยืด/บีบ
    if (targetWidth === imgWidth && targetHeight === imgHeight) {
        targetHeight = Math.floor(imgHeight * MONOSPACE_ASPECT_RATIO);
    }

    return { targetWidth, targetHeight };
  }, [maxWidth, maxHeight]);

  /**
   * Optimized ASCII conversion function with optional Web Worker support
   */
  const convertImageToAscii = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) {
        setError("ไม่พบ Canvas element สำหรับประมวลผล");
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        setError("ไม่สามารถเข้าถึง Canvas context 2D ได้");
        return;
    }

    const { targetWidth, targetHeight } = calculateTargetDimensions(img.width, img.height);

    // กำหนดขนาด canvas ตามที่คำนวณได้
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // วาดรูปภาพลงบน canvas ที่ซ่อนอยู่ (จะถูกย่อ/ขยายตาม targetWidth, targetHeight)
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // ดึงข้อมูล pixel (พิกเซลแต่ละจุด) จาก canvas
    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    
    // Use Web Worker for large images (> 50,000 pixels) to avoid blocking UI
    const totalPixels = targetWidth * targetHeight;
    const useWebWorker = totalPixels > 50000 && typeof Worker !== 'undefined';
    
    if (useWebWorker) {
      try {
        const worker = new Worker(new URL('./ascii-worker.ts', import.meta.url));
        
        worker.postMessage({
          imageData,
          asciiChars: ASCII_CHARS,
          monospaceAspectRatio: MONOSPACE_ASPECT_RATIO,
          luminosityWeights: LUMINOSITY_WEIGHTS
        });
        
        worker.onmessage = (event) => {
          const { asciiArt, error } = event.data;
          if (error) {
            setError(`เกิดข้อผิดพลาดในการประมวลผล: ${error}`);
          } else {
            setAsciiArt(asciiArt);
          }
          worker.terminate();
        };
        
        worker.onerror = () => {
          setError("เกิดข้อผิดพลาดในการใช้ Web Worker กำลังใช้วิธีการทั่วไป");
          // Fallback to main thread processing
          processImageDataInMainThread(imageData.data, targetWidth, targetHeight);
          worker.terminate();
        };
        
        return;
      } catch (workerError) {
        console.warn('Web Worker not available, falling back to main thread:', workerError);
      }
    }
    
    // Process in main thread for smaller images or when Web Worker is not available
    processImageDataInMainThread(imageData.data, targetWidth, targetHeight);
  }, [calculateTargetDimensions, asciiCharsLengthMinusOne]);

  /**
   * Process image data in the main thread (fallback or for small images)
   */
  const processImageDataInMainThread = useCallback((data: Uint8ClampedArray, width: number, height: number) => {
    // Use array buffer for better performance with large images
    const asciiLines: string[] = [];
    
    // วนลูปผ่านแต่ละ "พิกเซล" ที่ถูกย่อขนาดลงบน canvas
    for (let y = 0; y < height; y++) {
      const row: string[] = [];
      const rowStartIndex = y * width * 4;
      
      for (let x = 0; x < width; x++) {
        // คำนวณตำแหน่งของ R (Red) component ของพิกเซลปัจจุบันใน array `data`
        const pixelIndex = rowStartIndex + (x * 4);
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];

        // คำนวณค่าความสว่าง (Grayscale) ของพิกเซลโดยใช้สูตร Luminosity (คนมองเห็นสีเขียวสว่างสุด)
        const gray = LUMINOSITY_WEIGHTS.r * r + LUMINOSITY_WEIGHTS.g * g + LUMINOSITY_WEIGHTS.b * b;

        // แปลงค่า Grayscale (0-255) ไปเป็น index ของตัวอักษรในชุด ASCII_CHARS
        // ค่า 0 (ดำสนิท) จะได้ตัวอักษรที่เข้มที่สุด (ASCII_CHARS[0]),
        // ค่า 255 (ขาวสนิท) จะได้ตัวอักษรที่อ่อนที่สุด (ASCII_CHARS[สุดท้าย])
        const charIndex = Math.floor((gray / 255) * asciiCharsLengthMinusOne);
        row.push(ASCII_CHARS[charIndex]);
      }
      asciiLines.push(row.join(''));
    }
    
    setAsciiArt(asciiLines.join('\n')); // อัปเดต state เพื่อแสดงผล ASCII Art บน UI
  }, [asciiCharsLengthMinusOne]);

  /**
   * Handler เมื่อมีการเลือกไฟล์รูปภาพจาก input
   * จะอ่านไฟล์และเรียกฟังก์ชันแปลงรูปภาพ
   * @param event Event object จากการเปลี่ยนแปลงของ input file
   */
  const handleImageUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; 
    if (file) {
      setIsLoading(true); // เริ่มโหลด
      setError(null);    // ล้างข้อผิดพลาดเก่า
      const reader = new FileReader(); 

      reader.onload = (e) => {
        const imageUrl = e.target?.result as string; 
        const img = new Image(); 

        img.onload = () => {
          convertImageToAscii(img); // เมื่อรูปภาพโหลดเสร็จสิ้นในหน่วยความจำ
          setIsLoading(false);      // หยุดโหลด
        };
        img.onerror = () => {
          setError("เกิดข้อผิดพลาดในการโหลดรูปภาพ โปรดลองไฟล์อื่น");
          setIsLoading(false);
          setAsciiArt(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
        img.src = imageUrl; 
      };
      reader.onerror = () => {
        setError("ไม่สามารถอ่านไฟล์รูปภาพได้ โปรดตรวจสอบสิทธิ์หรือลองไฟล์อื่น");
        setIsLoading(false);
        setAsciiArt(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
      reader.readAsDataURL(file); 
    } else {
      setAsciiArt(null);
      setError(null);
      setIsLoading(false);
    }
  }, [convertImageToAscii]);

  /**
   * ฟังก์ชันสำหรับล้างรูปภาพและ ASCII Art ที่แสดงอยู่
   */
  const handleClear = useCallback(() => {
    setAsciiArt(null); 
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // เคลียร์ค่าใน input file เพื่อให้เลือกไฟล์เดิมซ้ำได้
    }
  }, []);

  // Memoized styles for better performance
  const containerStyle = useMemo(() => ({
    fontFamily: 'sans-serif',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    maxWidth: '860px', // Accommodate 800px output area + padding
    width: '100%',
    margin: '20px auto',
    boxSizing: 'border-box' as const
  }), []);

  const outputContainerStyle = useMemo(() => ({
    marginTop: '20px',
    border: '1px solid #ddd',
    padding: '15px',
    backgroundColor: backgroundColor,
    borderRadius: '5px',
    overflow: 'auto' as const,
    width: '800px',
    height: '800px',
    maxWidth: 'calc(100vw - 60px)', // Responsive: never exceed viewport width minus padding
    maxHeight: 'calc(100vh - 200px)', // Responsive: leave space for controls and margins
    minWidth: '300px',
    minHeight: '300px',
    boxSizing: 'border-box' as const
  }), [backgroundColor]);

  const preStyle = useMemo(() => ({
    fontFamily: 'monospace',
    whiteSpace: 'pre' as const,
    margin: '0',
    lineHeight: '1',
    color: textColor,
    fontSize: fontSize
  }), [textColor, fontSize]);

  return (
    <div style={containerStyle}>
      <h1 style={{ color: '#333' }}>Image to ASCII Art Converter</h1>
      <p style={{ color: '#555', marginBottom: '20px', textAlign: 'center' }}>
        อัปโหลดรูปภาพของคุณแล้วดูผลลัพธ์ ASCII Art ที่สร้างขึ้นมา!
      </p>

      {/* Input สำหรับเลือกไฟล์รูปภาพ */}
      <input
        type="file"
        accept="image/*" // รับเฉพาะไฟล์รูปภาพ
        onChange={handleImageUpload}
        ref={fileInputRef}
        style={{ marginBottom: '15px' }}
        disabled={isLoading} // ปิดการใช้งานระหว่างโหลด
      />
      
      {/* แสดงข้อความโหลด */}
      {isLoading && <p style={{ color: '#007bff' }}>กำลังประมวลผลรูปภาพ...</p>}

      {/* แสดงข้อผิดพลาด */}
      {error && <p style={{ color: '#dc3545', fontWeight: 'bold' }}>ข้อผิดพลาด: {error}</p>}

      {/* ปุ่มล้างจะแสดงเมื่อมี ASCII Art หรือข้อผิดพลาด */}
      {(asciiArt || error) && (
        <button
          onClick={handleClear}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            padding: '8px 15px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '20px'
          }}
        >
          {error ? 'ลองใหม่อีกครั้ง' : 'ล้างรูปภาพและ ASCII Art'}
        </button>
      )}

      {/* Canvas ที่ซ่อนอยู่ - ใช้สำหรับการวาดภาพและดึงข้อมูลพิกเซลเท่านั้น */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      {/* ส่วนแสดงผล ASCII Art - จะแสดงเมื่อ `asciiArt` ไม่เป็น null */}
      {asciiArt && (
        <div style={outputContainerStyle}>
          <h2 style={{ color: textColor, textAlign: 'center', margin: '0 0 10px 0' }}>ASCII Art Output:</h2>
          <pre style={preStyle}>
            {asciiArt}
          </pre>
        </div>
      )}

      {/* ข้อความเริ่มต้นถ้ายังไม่มีการอัปโหลดหรือประมวลผลรูปภาพ */}
      {!asciiArt && !isLoading && !error && (
        <p style={{ color: '#888', marginTop: '30px' }}>
          เลือกไฟล์รูปภาพ (JPG, PNG, GIF) เพื่อเริ่มต้น
        </p>
      )}
    </div>
  );
};

export default AsciiArtConverter;