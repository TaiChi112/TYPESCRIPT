# โครงสร้าง: Proxy Pattern (Validation & Caching)

Proxy Pattern ใช้สำหรับควบคุมการเข้าถึง (control access) และเพิ่มพฤติกรรมเสริม เช่น validation, caching, logging โดยไม่ต้องแก้ไขโค้ดของวัตถุจริง (Real Subject)

ในโปรเจกต์นี้ เราใช้ `SafeJSONAdapterProxy` เพื่อห่อ (`wrap`) `JSONContentAdapter` ที่ทำหน้าที่แปลงข้อมูลภายนอกให้เป็น `ContentItem` (Adapter Pattern)

## ทำอะไรให้ระบบบ้าง
- ตรวจสอบและปรับข้อมูลนำเข้า (validation/normalization) เช่น เติม `title` ให้เป็น "Untitled" ถ้าหายไป
- สร้างรหัส `id` แบบ deterministic เมื่อไม่ระบุ เพื่อป้องกัน duplicate และช่วยให้ cache ทำงานได้ดี
- แคชผลลัพธ์การแปลง (caching) ด้วย key: `type:id` ทำให้การ import ซ้ำรวดเร็วขึ้นและไม่คำนวนซ้ำ
- เขียน log ผ่าน `SessionLogger` เพื่อให้เห็นพฤติกรรม cache hit/miss ชัดเจน

## จุดที่เชื่อมกับส่วนอื่น
- Adapter: Proxy เรียก `JSONContentAdapter` หลังผ่านการ validate/normalize
- Facade: `PortfolioFacade.importFromJSON()` ถูกปรับให้เรียกผ่าน Proxy โดยอัตโนมัติ (Adapter+Proxy)
- UI: ส่วน "Proxy Pattern Demo" แสดงสองกรณีตัวอย่าง (Invalid JSON และ Cache Repeat)

## ตัวอย่างการใช้งาน
```ts
const proxy = new SafeJSONAdapterProxy({ content: 'no title' }, 'blog');
const item = proxy.adapt(); // title จะถูกตั้งเป็น "Untitled" และถูก log

const same = new SafeJSONAdapterProxy({ id: 'dup-1', name: 'X' }, 'project');
const first = same.adapt();   // miss -> แปลง + cache
const second = same.adapt();  // hit -> ดึงจาก cache
```

## ข้อดี
- แยก cross-cutting concerns ออกจาก business logic เดิม (Adapter)
- เพิ่มคุณสมบัติแบบเปิด-ปิด (Open/Closed) ขยาย proxy อื่นๆ เช่น Rate-limit, Logging เพิ่มเติมได้
- ทำงานโปร่งใสต่อผู้ใช้ปลายทาง เพราะยังคง interface เดิม (`IContentAdapter`)

## ข้อควรระวัง
- ควรออกแบบ cache key ให้เหมาะสม (ในที่นี้ใช้ `type:id` หลัง normalize)
- อย่าปล่อยให้ Proxy หนาเกินไป (fat proxy) จนยากต่อการดูแลรักษา

## สรุป
Proxy ช่วยยกระดับความยืดหยุ่นและความปลอดภัยของการ import ข้อมูล โดยไม่ต้องแก้โค้ดใน Adapter เดิม และทำงานร่วมกับ Facade อย่างราบรื่น
