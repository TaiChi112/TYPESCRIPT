import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost', // IP Address ของ WSL2 VM
  database: process.env.DB_NAME || 'my_app_db', // ชื่อ Database ที่จะเชื่อมต่อ
  password: process.env.DB_PASSWORD || 'mysecretpassword', // รหัสผ่านของ PostgreSQL
  port: parseInt(process.env.DB_PORT || '5432'), // Port ที่ Map ไว้บน Host (5432)
});

// ตรวจสอบการเชื่อมต่อเมื่อ Pool ถูกสร้างขึ้น
pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1); // ออกจากโปรแกรมหากมีข้อผิดพลาดร้ายแรง
});

export default pool;