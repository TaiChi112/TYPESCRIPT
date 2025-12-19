# Command Pattern — สร้างคำสั่งที่ยกเลิก/ทำซ้ำได้

แนวคิดหลักของ Command คือ "ห่อ (encapsulate) การกระทำ" ให้เป็นอ็อบเจกต์ที่มี `execute()` และ `undo()` ทำให้
- แยก UI ออกจากลอจิกของคำสั่ง (loosely coupled)
- ทำ Undo/Redo ได้ด้วยสแต็ก
- ขยายเพิ่มคำสั่งใหม่ได้ง่าย (Open for extension)

ตัวอย่างในโปรเจกต์นี้: `ImportViaProxyCommand`
- เมื่อ `execute()` จะเรียก `SafeJSONAdapterProxy` เพื่อ normalize/validate/cache แล้วแปลงเป็น `ContentItem` (ผ่าน `JSONContentAdapter`)
- จากนั้นเพิ่ม item เข้า collection ที่เกี่ยวข้อง (projects/blogs/research)
- เมื่อ `undo()` จะลบ item ที่เพิ่งเพิ่มโดยอ้างอิง `addedId`
- `CommandManager` ทำหน้าที่ Invoker จัดการ `undoStack` และ `redoStack`

โครงสร้างหลัก
- ICommand: สัญญา (interface) ของคำสั่ง (`execute`, `undo`)
- ImportViaProxyCommand: คำสั่งจริง (Concrete Command)
- CommandManager: Invoker จัดการ Execute/Undo/Redo
- Collections (state setters): Receiver ที่ถูกสั่งให้เปลี่ยนแปลงสถานะ
- SafeJSONAdapterProxy + JSONContentAdapter: Workflow ที่คำสั่งเรียกใช้ภายใน

ข้อดี
- บันทึกประวัติของการกระทำได้ (history)
- รองรับ batching/queuing และ macro-commands ได้ในอนาคต
- ทดสอบแยกคำสั่งได้ง่าย

ข้อควรระวัง
- มี overhead เพิ่มจากการสร้างอ็อบเจกต์คำสั่ง
- ต้องออกแบบข้อมูลสำหรับ `undo()` ให้ครบถ้วน (เช่น id ของรายการที่เพิ่ม)

วิธีใช้งานใน UI
- ปุ่ม Execute: สร้าง `ImportViaProxyCommand` ด้วย sample data แล้วเรียก `CommandManager.execute(cmd)`
- ปุ่ม Undo/Redo: เรียก `commandManager.undo()` หรือ `commandManager.redo()`
- ทุกการกระทำจะมี log ผ่าน `SessionLogger` (Singleton) เพื่อดู flow