# ecommerce-mvp (Starter — prompts only, no code)

**Stack**: Next.js (frontend) + Elysia (backend) + PostgreSQL + Prisma + Docker/Compose on WSL.

> ใช้ชุดไฟล์นี้คู่กับ GitHub Copilot Chat บน VS Code เพื่อให้มัน scaffold โครงสร้าง/เอกสาร/ทาสก์ก่อน จากนั้นค่อยสั่ง generate โค้ดภายหลัง

## How to Use with Copilot Chat
1. Open this repo in VS Code.
2. In Copilot Chat, run:
   ```
   @workspace Read CONTEXT.md and COPILOT_INSTRUCTION.json. Summarize your understanding in 5 bullets. Do NOT write any implementation code.
   ```
3. Then:
   ```
   @workspace Use PRP_ecommerce_mvp.json to create and fill outlines in docs/*.md. Keep outlines only.
   ```
4. Generate tasks:
   ```
   @workspace Update TASKS.md with prioritized phases and acceptance criteria.
   ```
5. CI & Deploy notes:
   ```
   @workspace Fill 06-ci-cd.md and 07-deploy-notes.md with actionable outlines (no secrets, placeholders only).
   ```
6. When ready to implement, use `PROMPTS_LATER.md` prompts.

## WSL + Docker Notes (no Desktop)
- Ensure Docker Engine is available inside WSL (e.g., Ubuntu) and paths use Linux style.
- Use Compose v2. Keep volumes under `/home/<user>/...` to avoid Windows path issues.