# 🚀 Docker Compose Setup - E-Commerce MVP

## ✅ การใช้งาน

### เริ่มต้นใช้งาน (Start)
```bash
# เปิด WSL Terminal
wsl

# ไปที่ project directory
cd /mnt/d/RepositoryVS/TypeScript/project/ecommerce-mvp

# Start ทุก services (database, api, web)
docker compose -f docker-compose.dev.yml up -d
```

### ตรวจสอบสถานะ (Check Status)
```bash
# ดู containers ที่ทำงาน
docker compose -f docker-compose.dev.yml ps

# หรือ
docker ps
```

### ดู Logs
```bash
# ดู logs ทั้งหมด
docker compose -f docker-compose.dev.yml logs

# ดู logs แบบ follow
docker compose -f docker-compose.dev.yml logs -f

# ดู logs เฉพาะ service
docker logs ecommerce-api-dev
docker logs ecommerce-web-dev
docker logs ecommerce-db-dev
```

### หยุดการทำงาน (Stop)
```bash
# หยุด services แต่เก็บ data
docker compose -f docker-compose.dev.yml stop

# หยุดและลบ containers แต่เก็บ volumes
docker compose -f docker-compose.dev.yml down

# หยุด ลบ containers และ volumes (ลบ database!)
docker compose -f docker-compose.dev.yml down -v
```

### Restart Service
```bash
# Restart service ใดก็ได้
docker compose -f docker-compose.dev.yml restart api
docker compose -f docker-compose.dev.yml restart web
docker compose -f docker-compose.dev.yml restart db
```

### Rebuild
```bash
# Rebuild และ restart
docker compose -f docker-compose.dev.yml up -d --build

# Rebuild เฉพาะ service
docker compose -f docker-compose.dev.yml build api
docker compose -f docker-compose.dev.yml up -d api
```

---

## 🌐 URLs สำหรับทดสอบ

### จาก WSL (Linux)
```bash
# API
curl http://localhost:4000/health
curl http://localhost:4000/products

# Frontend
curl http://localhost:3000
```

### จาก Windows
```bash
# API - ใช้ได้ทั้ง localhost และ 127.0.0.1
curl http://localhost:4000/health
curl http://127.0.0.1:4000/health

# Frontend - ต้องผ่าน WSL
wsl -e curl http://localhost:3000
```

**Browser:**
- **API:** http://localhost:4000
- **Frontend:** ต้อง access ผ่าน WSL port forwarding หรือใช้ container IP

---

## 📦 Services

| Service | Container Name | Port | Status |
|---------|---------------|------|--------|
| PostgreSQL | ecommerce-db-dev | 5432 | ✅ Working |
| API (Elysia/Bun) | ecommerce-api-dev | 4000 | ✅ Working |
| Web (Next.js) | ecommerce-web-dev | 3000 | ⚠️ WSL only |

---

## 🛠️ Troubleshooting

### ปัญหา: Container ไม่ start
```bash
# ดู logs เพื่อหาสาเหตุ
docker logs ecommerce-api-dev
docker logs ecommerce-web-dev

# ลอง restart
docker compose -f docker-compose.dev.yml restart
```

### ปัญหา: Database connection error
```bash
# ตรวจสอบว่า database พร้อมหรือยัง
docker exec ecommerce-db-dev pg_isready -U app -d app

# เข้าไปดูข้อมูลใน database
docker exec -it ecommerce-db-dev psql -U app -d app

# ใน psql:
\dt              # ดู tables
\d products      # ดู schema ของ products table
SELECT COUNT(*) FROM products;  # นับจำนวน products
```

### ปัญหา: Port ถูกใช้งานอยู่แล้ว
```bash
# หา process ที่ใช้ port (Windows)
netstat -ano | findstr :4000
netstat -ano | findstr :3000
netstat -ano | findstr :5432

# Kill process (เปลี่ยน PID)
taskkill /PID <PID> /F

# หรือหยุด container อื่นที่ใช้ port เดียวกัน
docker stop <container_name>
```

### ปัญหา: เว็บไม่เข้าจาก Windows
```bash
# วิธีที่ 1: ใช้ WSL curl
wsl -e curl http://localhost:3000

# วิธีที่ 2: หา container IP
wsl -e docker inspect ecommerce-web-dev | grep IPAddress

# วิธีที่ 3: ใช้ WSL IP
wsl -e hostname -I
# แล้ว access http://<WSL-IP>:3000
```

---

## 🗄️ Database

### ข้อมูล Connection
```
Host: localhost (from host) / db (from containers)
Port: 5432
User: app
Password: secret
Database: app
```

### Connection String
```
# From host machine
postgresql://app:secret@localhost:5432/app

# From Docker containers
postgresql://app:secret@db:5432/app
```

### ดูข้อมูลใน Database
```bash
# เข้าไป psql
docker exec -it ecommerce-db-dev psql -U app -d app

# Commands ใน psql:
\l                  # List databases
\dt                 # List tables
\d products         # Describe products table
SELECT * FROM products;
SELECT * FROM users;
EXIT
```

### Seed Database (Manual)
```bash
docker exec ecommerce-db-dev psql -U app -d app -c "
INSERT INTO products (id, name, description, price, stock, \"imageUrl\", \"createdAt\", \"updatedAt\") 
VALUES 
('cm4yw0001', 'Laptop Pro', 'High-performance laptop', 1299.99, 15, 'https://via.placeholder.com/300', NOW(), NOW()),
('cm4yw0002', 'Wireless Mouse', 'Ergonomic mouse', 29.99, 50, 'https://via.placeholder.com/300', NOW(), NOW())
ON CONFLICT DO NOTHING;
"
```

---

## 🔧 Development Workflow

### 1. แก้ไข Code
- แก้ไฟล์ใน `app/api/src/` หรือ `app/web/src/`
- Code จะ auto-reload (hot reload) อัตโนมัติ
- ไม่ต้อง restart container

### 2. เพิ่ม Dependencies
```bash
# API (Bun)
cd app/api
bun add <package-name>

# Web (npm)
cd app/web
npm install <package-name>

# Rebuild container
docker compose -f docker-compose.dev.yml build api
docker compose -f docker-compose.dev.yml up -d api
```

### 3. Prisma Schema Changes
```bash
# แก้ไข prisma/schema.prisma
# แล้วรัน:
docker exec ecommerce-api-dev bunx prisma db push
docker exec ecommerce-api-dev bunx prisma generate

# หรือ restart container
docker compose -f docker-compose.dev.yml restart api
```

---

## 📊 System Architecture

```
┌─────────────────────────────────────────┐
│         Docker Compose Network          │
│          (ecommerce-network)            │
│                                         │
│  ┌────────────┐  ┌────────────┐       │
│  │ PostgreSQL │  │  Elysia    │       │
│  │ :5432      │◄─┤  API       │       │
│  │            │  │  :4000     │       │
│  └────────────┘  └────────────┘       │
│                         ▲               │
│                         │               │
│                  ┌──────┴───────┐      │
│                  │   Next.js    │      │
│                  │   :3000      │      │
│                  └──────────────┘      │
│                                         │
└─────────────────────────────────────────┘
         ▲                    ▲
         │                    │
    localhost:4000      localhost:3000
         │                    │
    ┌────┴────────────────────┴─────┐
    │      Windows / WSL Host       │
    └───────────────────────────────┘
```

---

## ✨ Features

### API Container
- ✅ Auto-reload on code changes
- ✅ Prisma auto-push schema on startup
- ✅ OpenSSL installed for Prisma
- ✅ Health check endpoint
- ✅ CORS configured

### Web Container
- ✅ Auto-reload on code changes
- ✅ Polling enabled for Windows/WSL
- ✅ Environment variables loaded
- ✅ Next.js 14 App Router

### Database Container
- ✅ Persistent data with volumes
- ✅ Health check configured
- ✅ Auto-restart on failure
- ✅ Pre-configured credentials

---

## 🎯 Quick Commands

```bash
# Start everything
wsl -e bash -c "cd /mnt/d/RepositoryVS/TypeScript/project/ecommerce-mvp && docker compose -f docker-compose.dev.yml up -d"

# Stop everything
wsl -e bash -c "cd /mnt/d/RepositoryVS/TypeScript/project/ecommerce-mvp && docker compose -f docker-compose.dev.yml down"

# View all logs
wsl -e bash -c "cd /mnt/d/RepositoryVS/TypeScript/project/ecommerce-mvp && docker compose -f docker-compose.dev.yml logs -f"

# Rebuild and restart
wsl -e bash -c "cd /mnt/d/RepositoryVS/TypeScript/project/ecommerce-mvp && docker compose -f docker-compose.dev.yml up -d --build"
```

---

## 📝 Notes

1. **Windows Access Issue:** Frontend (port 3000) ไม่สามารถ access จาก Windows browser ได้โดยตรง ต้องใช้ผ่าน WSL
2. **API Works:** Backend API (port 4000) ใช้งานได้ปกติจาก Windows
3. **Database:** PostgreSQL ทำงานได้ดี มี health check
4. **Hot Reload:** ทั้ง API และ Web รองรับ hot reload
5. **Volumes:** ใช้ named volumes เพื่อ optimize performance

---

**Last Updated:** October 19, 2025
