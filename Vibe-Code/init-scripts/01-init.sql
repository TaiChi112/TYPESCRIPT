-- init-scripts/init.sql
-- สร้าง DATABASE ก่อน
CREATE DATABASE proposal_software_db;

-- สร้าง USER (ROLE) พร้อมรหัสผ่าน
CREATE USER taichi WITH PASSWORD 'taichi112' IF NOT EXISTS;

-- กำหนดให้ USER เป็นเจ้าของ DATABASE
ALTER DATABASE proposal_software_db OWNER TO taichi;

-- (ตัวเลือก) ให้สิทธิ์ taichi ใน database นั้น
GRANT ALL PRIVILEGES ON DATABASE proposal_software_db TO taichi;