# คู่มือ Contributing

เอกสารนี้เอาไว้สำหรับงานที่ต้อง scale ระบบ หรือ maintenance ให้ระบบยังนิ่งและดูแลง่าย

ก่อนเริ่ม ให้แยกก่อนว่า change นี้เป็น `scale` หรือ `maintenance`

## ถ้าจะ Scale

Scale work คือการทำให้ระบบรองรับ load มากขึ้น, feature มากขึ้น หรือ consumer มากขึ้น

จุดเริ่มต้นที่ควรดู:

- [src/domain/](../src/domain/)
- [src/infrastructure/](../src/infrastructure/)
- [src/delivery/](../src/delivery/)

สิ่งที่มักต้องเปลี่ยน:

- เพิ่ม service method หรือ use case ใหม่ใน domain
- ขยาย repository contract และ implementation
- เพิ่ม HTTP routes หรือ tool adapters
- อัปเดต [index.ts](../index.ts) ตอน wire dependency ใหม่

ตัวอย่าง todo สำหรับ scale 3 รายการ:

1. เพิ่ม alumni profile registration flow.
   - เริ่มที่ [src/domain/ProfileService.ts](../src/domain/ProfileService.ts) และ [src/domain/ProfileFactory.ts](../src/domain/ProfileFactory.ts)
   - อัปเดต [src/core/types.ts](../src/core/types.ts) และ [src/core/schemas.ts](../src/core/schemas.ts)
   - เพิ่ม persistence change ใน [src/infrastructure/PrismaProfileRepository.ts](../src/infrastructure/PrismaProfileRepository.ts) และ [prisma/schema.prisma](../prisma/schema.prisma)
   - ถ้ามี profile variant ใหม่ ให้ตามไปอัปเดต [src/integration/McpToolAdapter.ts](../src/integration/McpToolAdapter.ts) และ [src/delivery/ProfileApiServer.ts](../src/delivery/ProfileApiServer.ts)

2. เพิ่ม pagination หรือ filtering สำหรับ profile list.
   - เริ่มจาก [src/domain/ProfileRepository.ts](../src/domain/ProfileRepository.ts) และ [src/domain/ProfileService.ts](../src/domain/ProfileService.ts)
   - อัปเดต [src/infrastructure/PrismaProfileRepository.ts](../src/infrastructure/PrismaProfileRepository.ts) และอาจต้องเพิ่ม test ใน [tests/domain/ProfileService.test.ts](../tests/domain/ProfileService.test.ts)
   - ถ้าเปิดผ่าน HTTP ให้ขยาย [src/delivery/ProfileApiServer.ts](../src/delivery/ProfileApiServer.ts)
   - ถ้า payload shape เปลี่ยน ให้ปรับ [src/core/schemas.ts](../src/core/schemas.ts)

3. เพิ่ม external integration หรือ event publisher อีกตัว.
   - เริ่มจาก [src/integration/](../src/integration/)
   - wire dependency ใน [index.ts](../index.ts)
   - ถ้าต้องใช้ persistence ให้ปรับ [src/infrastructure/](../src/infrastructure/) และ [prisma/schema.prisma](../prisma/schema.prisma)
   - ถ้าแตะ public API ให้สะท้อน contract ใหม่ใน [src/delivery/ProfileApiServer.ts](../src/delivery/ProfileApiServer.ts)

## ถ้าจะ Maintenance

Maintenance work คือการทำให้ code ยัง reliable, consistent และดูแลง่าย

จุดเริ่มต้นที่ควรดู:

- [src/core/](../src/core/)
- [tests/domain/](../tests/domain/)
- [.github/workflows/](../.github/workflows/)

สิ่งที่มักต้องเปลี่ยน:

- tighten validation และ error handling
- เพิ่ม tests สำหรับ behavior เดิม
- refresh documentation หรือ CI checks
- clean up logging, startup flow หรือ environment handling

ตัวอย่าง todo สำหรับ maintenance 3 รายการ:

1. เพิ่ม coverage สำหรับ error branches ใน `ProfileService`.
   - เริ่มที่ [tests/domain/ProfileService.test.ts](../tests/domain/ProfileService.test.ts)
   - ถ้า failure behavior เปลี่ยน ให้ดู [src/core/errors.ts](../src/core/errors.ts) และ [src/domain/ProfileService.ts](../src/domain/ProfileService.ts)
   - ถ้ามี repository method ใหม่ ให้ปรับ [src/domain/ProfileRepository.ts](../src/domain/ProfileRepository.ts)

2. ปรับ startup และ shutdown ให้ปลอดภัยขึ้น.
   - เริ่มที่ [index.ts](../index.ts) และ [src/core/config.ts](../src/core/config.ts)
   - ถ้าเพิ่ม runtime resource ใหม่ ต้องแน่ใจว่า disconnect หรือ cleanup ใน [src/infrastructure/PrismaProfileRepository.ts](../src/infrastructure/PrismaProfileRepository.ts)
   - ถ้า startup behavior เปลี่ยน ให้ update [docs/README.th.md](README.th.md) และ [docs/README.md](README.md)

3. ทำให้ CI และ docs ตรงกับ codebase ปัจจุบัน.
   - เริ่มที่ [.github/workflows/ci.yml](../.github/workflows/ci.yml) และ [README.md](../README.md)
   - ถ้าเพิ่ม command หรือ workflow step ใหม่ ให้สะท้อนใน docs ด้วย
   - ถ้า test strategy เปลี่ยน ให้ update [tests/domain/ProfileService.test.ts](../tests/domain/ProfileService.test.ts) และ CI พร้อมกัน

## ข้อควรจำ

- ถ้า change แตะ domain contract ให้ปรับ domain, infrastructure และ tests พร้อมกัน
- ถ้า change เพิ่ม runtime data ให้ปรับ `types`, `schemas` และ Prisma ในรอบเดียวกัน
- ถ้า change กระทบ boot flow ให้ปรับ [index.ts](../index.ts) และ path สำหรับ cleanup ด้วย
- ถ้า change กระทบ external consumers ให้เช็กทั้ง [src/delivery/ProfileApiServer.ts](../src/delivery/ProfileApiServer.ts) และ [src/integration/McpToolAdapter.ts](../src/integration/McpToolAdapter.ts)

## จำง่าย ๆ

- core กำหนด shape
- domain กำหนด rule
- infrastructure ทำงานจริง
- integration ส่งออกให้ AI tools
- delivery ส่งออกให้ HTTP clients

ลำดับนี้คือทางที่ปลอดภัยที่สุดเวลาจะอ่านหรือแก้โปรเจกต์นี้
