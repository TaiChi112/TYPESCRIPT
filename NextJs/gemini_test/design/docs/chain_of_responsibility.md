# พฤติกรรม: Chain of Responsibility (Validation Pipeline)

Chain of Responsibility (CoR) แบ่งความรับผิดชอบการประมวลผลออกเป็นชุดของ handlers ที่เชื่อมต่อกันเป็นสาย โดยแต่ละตัวจะรับข้อมูล ตัดสินใจว่าจะจัดการบางส่วน แล้วส่งต่อให้ตัวถัดไป ช่วยให้โค้ดเปิดกว้างต่อการขยาย (Open/Closed) และจัดการ cross-cutting concerns ได้เป็นระบบ

## สิ่งที่เพิ่มเข้ามา
- `IImportHandler`, `ImportHandler` (base), และ concrete handlers:
  - `TitleRequiredHandler`: บังคับให้มี `title` (หากว่าง → "Untitled")
  - `DateStringHandler`: บังคับให้ `date` เป็น string (เช่น 2024 → "2024")
  - `TagLimitHandler`: ทำความสะอาดและจำกัดจำนวน `tags` (ค่าเริ่มต้น 10)
- ผนวก CoR เข้ากับ `SafeJSONAdapterProxy` ก่อนเรียก `JSONContentAdapter` ช่วยให้การ import ผ่าน pipeline validation/sanitization เสมอ

## ทำงานร่วมกับของเดิมอย่างไร
- Proxy: เรียกใช้ chain หลัง normalize เพื่อ clean ข้อมูลเพิ่มเติม โดยไม่ต้องแก้ Adapter เดิม
- Adapter: ยังทำหน้าที่แปลงข้อมูลเป็น `ContentItem` เช่นเดิม หลังผ่าน CoR แล้ว
- Facade & UI: ไม่ต้องแก้โค้ด interface ฝั่ง client เพราะยังเรียก import ผ่าน proxy เหมือนเดิม

## ตัวอย่างการไหลของข้อมูล
1) Normalize (ใน Proxy) → 2) TitleRequiredHandler → 3) DateStringHandler → 4) TagLimitHandler → Adapter

## ข้อดี
- ยืดหยุ่น: เพิ่ม/ลบ/สลับลำดับ handler ได้ง่าย
- แยก concerns: validation แต่ละเรื่องอยู่ในคลาสของตัวเอง อ่านง่าย ดูแลรักษาง่าย
- ทำงานร่วมกับ Proxy/Adapter ได้อย่างเป็นธรรมชาติ

## ข้อควรระวัง
- อย่าให้ chain ลึกเกินไปจน performance ลดลงโดยไม่จำเป็น
- กำหนดโครงสร้างของ data ที่ handler คาดหวังให้ชัดเจน

## สรุป
CoR ช่วยให้ pipeline validation/sanitization มีโครงสร้างที่ขยายได้ ควบคุมได้ดี และเข้ากันกับ Proxy + Adapter เดิมได้อย่างลงตัว
