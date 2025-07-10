# React + TypeScript + Vite Template

## 🌐 Languages / ภาษา
- [English](#english)
- [ไทย](#thai)

---

## English

### 🚀 Overview
This template provides a minimal setup to get React working in Vite with HMR (Hot Module Replacement) and some ESLint rules. It uses Bun as the package manager for improved performance.

### 📋 Features
- ⚡ **Vite** - Fast build tool and development server
- ⚛️ **React 19** - Latest React version
- 🔷 **TypeScript** - Type-safe JavaScript
- 🧹 **ESLint** - Code linting and formatting
- 🔥 **Hot Module Replacement** - Instant updates during development
- 📦 **Bun** - Ultra-fast package manager

### 🛠️ Quick Start

#### Clone or Fork this Repository

##### Option 1: Clone (for personal use)
```bash
# Clone the repository
git clone <repository-url>
cd my-react-v0

# Install dependencies
bun install

# Start development server
bun dev
```

##### Option 2: Fork (for contributions)
1. Click the "Fork" button at the top right of this repository
2. Clone your forked repository:
```bash
git clone https://github.com/YOUR_USERNAME/my-react-v0.git
cd my-react-v0
bun install
bun dev
```

### 📜 Available Scripts
- `bun dev` - Start development server
- `bun build` - Build for production
- `bun preview` - Preview production build
- `bun lint` - Run ESLint

### 🔧 Plugin Options
Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

---

## Thai

### 🚀 ภาพรวม
เทมเพลตนี้เป็นการตั้งค่าขั้นพื้นฐานเพื่อให้ React ทำงานร่วมกับ Vite พร้อมกับ HMR (Hot Module Replacement) และกฎ ESLint โดยใช้ Bun เป็นตัวจัดการแพ็คเกจเพื่อประสิทธิภาพที่ดีขึ้น

### 📋 คุณสมบัติ
- ⚡ **Vite** - เครื่องมือสร้างและเซิร์ฟเวอร์พัฒนาที่รวดเร็ว
- ⚛️ **React 19** - React เวอร์ชั่นล่าสุด
- 🔷 **TypeScript** - JavaScript ที่มีการตรวจสอบประเภทข้อมูล
- 🧹 **ESLint** - เครื่องมือตรวจสอบและจัดรูปแบบโค้ด
- 🔥 **Hot Module Replacement** - อัปเดตทันทีระหว่างการพัฒนา
- 📦 **Bun** - ตัวจัดการแพ็คเกจที่เร็วมาก

### 🛠️ เริ่มต้นอย่างรวดเร็ว

#### Clone หรือ Fork repository นี้

##### ตัวเลือก 1: Clone (สำหรับใช้งานส่วนตัว)
```bash
# Clone repository
git clone <repository-url>
cd my-react-v0

# ติดตั้ง dependencies
bun install

# เริ่มเซิร์ฟเวอร์พัฒนา
bun dev
```

##### ตัวเลือก 2: Fork (สำหรับการมีส่วนร่วม)
1. คลิกปุ่ม "Fork" ที่มุมขวาบนของ repository นี้
2. Clone repository ที่ fork แล้วของคุณ:
```bash
git clone https://github.com/YOUR_USERNAME/my-react-v0.git
cd my-react-v0
bun install
bun dev
```

### 📜 สคริปต์ที่มีอยู่
- `bun dev` - เริ่มเซิร์ฟเวอร์พัฒนา
- `bun build` - สร้างสำหรับ production
- `bun preview` - ดูตัวอย่าง production build
- `bun lint` - รัน ESLint

### 🔧 ตัวเลือกปลั๊กอิน
ปัจจุบันมีปลั๊กอินทางการสองตัวที่มีอยู่:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) ใช้ [Babel](https://babeljs.io/) สำหรับ Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) ใช้ [SWC](https://swc.rs/) สำหรับ Fast Refresh

---

## 🔧 Advanced Configuration

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## 📁 Project Structure / โครงสร้างโปรเจค

```
my-react-v0/
├── public/                 # Static assets / ไฟล์ static
│   └── vite.svg
├── src/                    # Source code / ซอร์สโค้ด
│   ├── assets/            # Assets / ไฟล์ทรัพยากร
│   ├── App.tsx            # Main App component / คอมโพเนนต์หลัก
│   ├── App.css            # App styles / สไตล์แอป
│   ├── index.css          # Global styles / สไตล์ทั่วไป
│   ├── main.tsx           # Entry point / จุดเริ่มต้น
│   └── vite-env.d.ts      # Vite type definitions / ประเภทของ Vite
├── index.html             # HTML template / เทมเพลต HTML
├── package.json           # Dependencies / dependencies
├── tsconfig.json          # TypeScript config / การตั้งค่า TypeScript
├── vite.config.ts         # Vite config / การตั้งค่า Vite
└── eslint.config.js       # ESLint config / การตั้งค่า ESLint
```

## 📋 Requirements / ข้อกำหนด

### English
- **Node.js**: v18.0.0 or higher
- **Bun**: v1.0.0 or higher (recommended) or npm/yarn/pnpm
- **Git**: For cloning the repository

### Thai
- **Node.js**: เวอร์ชั่น 18.0.0 หรือสูงกว่า
- **Bun**: เวอร์ชั่น 1.0.0 หรือสูงกว่า (แนะนำ) หรือ npm/yarn/pnpm
- **Git**: สำหรับ clone repository

## 🔧 Installation Steps / ขั้นตอนการติดตั้ง

### Using Bun (Recommended) / ใช้ Bun (แนะนำ)
```bash
# Install Bun if you haven't already / ติดตั้ง Bun หากยังไม่ได้ติดตั้ง
curl -fsSL https://bun.sh/install | bash

# Clone and setup / Clone และตั้งค่า
git clone <repository-url>
cd my-react-v0
bun install
bun dev
```

### Using npm / ใช้ npm
```bash
git clone <repository-url>
cd my-react-v0
npm install
npm run dev
```

### Using yarn / ใช้ yarn
```bash
git clone <repository-url>
cd my-react-v0
yarn install
yarn dev
```

## 🚨 Troubleshooting / การแก้ปัญหา

### English
#### Common Issues:
1. **Port 5173 already in use**: Change port in `vite.config.ts` or kill the process using the port
2. **Dependencies not installing**: Try deleting `node_modules` and reinstalling
3. **TypeScript errors**: Check your `tsconfig.json` configuration
4. **ESLint errors**: Check your `eslint.config.js` configuration

#### Solutions:
```bash
# Clear cache and reinstall
rm -rf node_modules bun.lockb
bun install

# Run with different port
bun dev --port 3000

# Check for TypeScript errors
bun run build
```

### Thai
#### ปัญหาที่พบบ่อย:
1. **Port 5173 ถูกใช้แล้ว**: เปลี่ยน port ใน `vite.config.ts` หรือหยุดโปรเซสที่ใช้ port นั้น
2. **Dependencies ติดตั้งไม่ได้**: ลองลบ `node_modules` และติดตั้งใหม่
3. **TypeScript error**: ตรวจสอบการตั้งค่า `tsconfig.json`
4. **ESLint error**: ตรวจสอบการตั้งค่า `eslint.config.js`

#### วิธีแก้ไข:
```bash
# ล้าง cache และติดตั้งใหม่
rm -rf node_modules bun.lockb
bun install

# รันด้วย port อื่น
bun dev --port 3000

# ตรวจสอบ TypeScript errors
bun run build
```

## 🤝 Contributing / การมีส่วนร่วม

### English
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Thai
1. Fork repository
2. สร้าง feature branch: `git checkout -b feature/amazing-feature`
3. Commit การเปลี่ยนแปลง: `git commit -m 'Add amazing feature'`
4. Push ไปยัง branch: `git push origin feature/amazing-feature`
5. เปิด Pull Request

## 📄 License / ใบอนุญาต

This project is open source and available under the [MIT License](LICENSE).

โปรเจคนี้เป็นโอเพนซอร์สและสามารถใช้ได้ภายใต้ [MIT License](LICENSE)

## 🙏 Acknowledgments / กิตติกรรมประกาศ

- [React](https://reactjs.org/) - The library that makes it all possible
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Bun](https://bun.sh/) - Fast all-in-one JavaScript runtime

---

**Happy Coding! 🎉 / ขอให้เขียนโค้ดอย่างสนุก! 🎉**
