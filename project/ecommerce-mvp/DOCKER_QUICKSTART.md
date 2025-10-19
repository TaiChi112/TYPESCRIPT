# 🐳 Docker Compose Quick Start

## ✅ เริ่มใช้งานแบบง่าย

### Prerequisites
- Docker Desktop หรือ Docker Engine (via WSL)
- Git Bash, WSL, หรือ Linux Terminal

---

## 🚀 Start Application

### จาก WSL Terminal (แนะนำ):

```bash
# 1. เปิด WSL
wsl

# 2. ไปที่ project directory
cd /mnt/d/RepositoryVS/TypeScript/project/ecommerce-mvp

# 3. Start ทุก services
docker compose -f docker-compose.dev.yml up -d

# 4. ดูสถานะ
docker compose -f docker-compose.dev.yml ps

# 5. ดู logs
docker compose -f docker-compose.dev.yml logs -f
```

### จาก Git Bash/CMD/PowerShell:

```bash
# Start via WSL
wsl -e bash -c "cd /mnt/d/RepositoryVS/TypeScript/project/ecommerce-mvp && docker compose -f docker-compose.dev.yml up -d"

# ดูสถานะ
wsl -e docker ps

# ดู logs
wsl -e docker logs ecommerce-api-dev
wsl -e docker logs ecommerce-web-dev
```

---

## 🌐 ทดสอบ Application

### API Backend (Port 4000)
```bash
# Health Check
curl http://localhost:4000/health

# Get Products
curl http://localhost:4000/products

# Test Checkout
curl -X POST http://localhost:4000/cart/checkout \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"1","quantity":2}]}'
```

### Frontend (Port 3000)
```bash
# จาก WSL
wsl -e curl http://localhost:3000

# เปิด Browser
# http://localhost:3000 (อาจไม่ทำงานจาก Windows)
# ใช้ WSL IP แทน: http://<WSL-IP>:3000
```

### Database (Port 5432)
```bash
# เข้าไป PostgreSQL
docker exec -it ecommerce-db-dev psql -U app -d app

# ดูข้อมูล
SELECT * FROM products;
SELECT * FROM users;
```

---

## 🛑 Stop Application

```bash
# หยุด (เก็บ data)
docker compose -f docker-compose.dev.yml stop

# หยุดและลบ containers (เก็บ volumes)
docker compose -f docker-compose.dev.yml down

# ลบทั้งหมดรวม volumes (ลบ database!)
docker compose -f docker-compose.dev.yml down -v
```

---

## 🔄 Restart/Rebuild

```bash
# Restart
docker compose -f docker-compose.dev.yml restart

# Rebuild และ Start
docker compose -f docker-compose.dev.yml up -d --build

# Rebuild เฉพาะ service
docker compose -f docker-compose.dev.yml build api
docker compose -f docker-compose.dev.yml up -d api
```

---

## 📊 Services Overview

| Service | Port | Status | Access From Windows |
|---------|------|--------|---------------------|
| **Database** | 5432 | ✅ Running | ✅ Yes |
| **API** | 4000 | ✅ Running | ✅ Yes |
| **Frontend** | 3000 | ✅ Running | ⚠️ Via WSL only |

---

## 💡 Common Commands

```bash
# ดูสถานะ
wsl -e docker ps

# ดู logs real-time
wsl -e docker logs -f ecommerce-api-dev

# Restart service
wsl -e docker restart ecommerce-api-dev

# เข้าไปใน container
wsl -e docker exec -it ecommerce-api-dev sh

# ดู volumes
wsl -e docker volume ls

# Clean up all
wsl -e bash -c "cd /mnt/d/RepositoryVS/TypeScript/project/ecommerce-mvp && docker compose -f docker-compose.dev.yml down -v"
```

---

## 🐛 Troubleshooting

### ปัญหา: Container ไม่ start
```bash
docker logs ecommerce-api-dev
docker logs ecommerce-web-dev
docker logs ecommerce-db-dev
```

### ปัญหา: Port already in use
```bash
# หา process (Windows)
netstat -ano | findstr :4000

# หยุด container เก่า
docker stop ecommerce-api-dev
docker rm ecommerce-api-dev
```

### ปัญหา: ไม่เข้า Frontend
```bash
# Test จาก WSL
wsl -e curl http://localhost:3000

# หา WSL IP
wsl -e hostname -I

# เปิดจาก browser: http://<WSL-IP>:3000
```

---

## 📁 Files

- `docker-compose.dev.yml` - Development setup (hot reload)
- `docker-compose.prod.yml` - Production setup
- `DOCKER_GUIDE.md` - คู่มือละเอียด
- `app/api/Dockerfile` - API image
- `app/web/Dockerfile` - Web image

---

## 🎯 Next Steps

1. ✅ Start containers: `docker compose up -d`
2. ✅ Test API: `curl http://localhost:4000/health`
3. ✅ Test Frontend: `wsl -e curl http://localhost:3000`
4. 📝 Seed database (optional)
5. 🧪 Run E2E tests

---

**สำคัญ:** หากใช้ Docker บน Windows ผ่าน WSL ให้รันคำสั่งผ่าน `wsl -e` หรือเข้าไปใน WSL terminal ตรงๆ
