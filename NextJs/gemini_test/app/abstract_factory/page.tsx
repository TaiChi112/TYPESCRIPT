"use client";

import React, { useState } from "react";

/**
 * ---------------------------------------------------------------------
 * ABSTRACT FACTORY PATTERN — THEME SYSTEM (DEMO PAGE)
 * ---------------------------------------------------------------------
 * หน้านี้เป็น "สนามทดลอง" สำหรับ Abstract Factory โดยเฉพาะ
 * คุณสามารถลองเพิ่ม/ลด feature, attribute, method ของแต่ละ Theme
 * โดยไม่กระทบกับ app/page.tsx ตัวใหญ่
 *
 * แนวคิดหลักของ Abstract Factory ในหน้านี้:
 * - มี interface UIThemeFactory กำหนดชุดของ components ที่ theme ต้องมี
 * - แต่ละ Concrete Factory (MinimalThemeFactory, CreativeThemeFactory, AcademicThemeFactory)
 *   จะต้องสร้าง ActionButton, Tag, CardWrapper, HeroWrapper ตาม style ของตัวเอง
 * - หน้า Demo นี้แค่เลือกโรงงาน (factory) แล้ว render UI ให้ดูผล
 */

// 1) ABSTRACT FACTORY INTERFACE
interface UIThemeFactory {
  ActionButton: React.FC<{ onClick?: () => void; children: React.ReactNode; isActive?: boolean }>;
  Tag: React.FC<{ label: string }>;
  CardWrapper: React.FC<{ children: React.ReactNode }>;
  HeroWrapper: React.FC<{ title: string; subtitle: string; children?: React.ReactNode }>;
}

// 2) CONCRETE FACTORY — MINIMAL THEME
const MinimalThemeFactory: UIThemeFactory = {
  ActionButton: ({ onClick, children, isActive }) => (
    <button
      onClick={onClick}
      className={`font-mono text-xs px-3 py-1 border transition-all mr-2 rounded-sm
        ${isActive ? "border-green-500 text-green-400 bg-green-500/10" : "border-gray-700 text-gray-400 hover:border-gray-500"}
      `}
    >
      [ {children} ]
    </button>
  ),
  Tag: ({ label }) => (
    <span className="text-xs text-gray-500 font-mono mr-2">#{label}</span>
  ),
  CardWrapper: ({ children }) => (
    <div className="border-l border-gray-800 pl-4 py-3 hover:border-green-500/60 transition-colors">
      {children}
    </div>
  ),
  HeroWrapper: ({ title, subtitle, children }) => (
    <div className="border border-gray-800 p-6 bg-black text-green-500 font-mono mb-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,#22c55e,transparent_60%)]" />
      <div className="relative z-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">ABSTRACT FACTORY DEMO</p>
        <h1 className="text-2xl mb-2">{title}</h1>
        <p className="text-sm text-gray-400 mb-4">{subtitle}</p>
        {children}
      </div>
    </div>
  ),
};

// 3) CONCRETE FACTORY — CREATIVE THEME
const CreativeThemeFactory: UIThemeFactory = {
  ActionButton: ({ onClick, children, isActive }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-semibold text-sm mr-2 transition-all transform hover:-translate-y-0.5
        ${isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-300" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}
      `}
    >
      {children}
    </button>
  ),
  Tag: ({ label }) => (
    <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-md font-bold mr-2 shadow-sm">
      ✨ {label}
    </span>
  ),
  CardWrapper: ({ children }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1">
      {children}
    </div>
  ),
  HeroWrapper: ({ title, subtitle, children }) => (
    <div className="bg-linear-to-r from-violet-600 via-indigo-600 to-blue-500 p-8 rounded-3xl text-white shadow-2xl mb-10 relative overflow-hidden">
      <div className="absolute -top-20 -right-32 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      <div className="relative z-10">
        <p className="text-xs font-semibold tracking-[0.25em] mb-3 text-indigo-100">ABSTRACT FACTORY · CREATIVE THEME</p>
        <h1 className="text-3xl font-black mb-2">{title}</h1>
        <p className="text-sm text-indigo-100 mb-4 max-w-xl">{subtitle}</p>
        {children}
      </div>
    </div>
  ),
};

// 4) CONCRETE FACTORY — ACADEMIC THEME
const AcademicThemeFactory: UIThemeFactory = {
  ActionButton: ({ onClick, children, isActive }) => (
    <button
      onClick={onClick}
      className={`font-serif px-4 py-1 border-b mr-4 text-sm transition-all
        ${isActive ? "border-black text-black font-bold bg-gray-200" : "border-transparent text-gray-600 hover:text-black hover:border-gray-400"}
      `}
    >
      § {children}
    </button>
  ),
  Tag: ({ label }) => (
    <span className="text-xs text-gray-700 italic bg-gray-200/70 px-2 py-0.5 mr-2 border border-gray-300">
      keyword: {label}
    </span>
  ),
  CardWrapper: ({ children }) => (
    <div className="mb-4 pb-4 border-b border-gray-300">
      {children}
    </div>
  ),
  HeroWrapper: ({ title, subtitle, children }) => (
    <div className="bg-[#fdfbf7] p-8 border-b-4 border-black mb-8">
      <p className="text-xs tracking-[0.35em] text-gray-500 mb-2 uppercase">ABSTRACT FACTORY · ACADEMIC THEME</p>
      <h1 className="text-3xl font-serif mb-1 text-gray-900">{title}</h1>
      <p className="text-sm text-gray-700 mb-4 max-w-2xl">{subtitle}</p>
      {children}
    </div>
  ),
};

const TaiChiThemeFactory: UIThemeFactory = {
  ActionButton: ({ onClick, children, isActive }) => (
    <button
      onClick={onClick}
      className={`${isActive ? "" : " "}`}
    >
      [ {children} ]
    </button>
  ),
  Tag: ({ label }) => (
    <span className={``}>#{label}</span>
  ),
  CardWrapper: ({ children }) => (
    <div className={``}>
      {children}
    </div>
  ),
  HeroWrapper: ({ title, subtitle, children }) => (
    <div className={``}>
      <div className={``} />
      <div className={``}>
        <p className={``}>ABSTRACT FACTORY DEMO</p>
        <h1 className={``}>{title}</h1>
        <p className={``}>{subtitle}</p>
        {children}
      </div>
    </div>
  ),

};

// 5) FACTORY REGISTRY + TYPE
const themeRegistry = {
  minimal: MinimalThemeFactory,
  creative: CreativeThemeFactory,
  academic: AcademicThemeFactory,
  taichi: TaiChiThemeFactory,
};

type ThemeKey = keyof typeof themeRegistry; // 'minimal' | 'creative' | 'academic' | 'taichi'

// 6) SAMPLE DOMAIN MODEL (สามารถปรับเองได้)
interface SampleProject {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

const sampleProjects: SampleProject[] = [
  {
    id: "p1",
    title: "Design System Playground",
    description: "Experiment with various UI theme factories and see how the same data can be rendered in different styles.",
    tags: ["design", "patterns", "abstract-factory"],
  },
  {
    id: "p2",
    title: "Portfolio Theme Explorer",
    description: "Switch between minimal, creative, and academic themes without changing business logic.",
    tags: ["react", "nextjs", "theming"],
  },
];

// 7) MAIN DEMO PAGE COMPONENT
const AbstractFactoryDemoPage: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>("minimal");
  const Theme = themeRegistry[currentTheme];

  return (
    <div className="min-h-screen bg-[#050816] text-gray-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-5xl">
        <Theme.HeroWrapper
          title="Abstract Factory — Theme System Demo"
          subtitle="หน้า demo นี้แสดงให้เห็นว่าเราสามารถสลับชุดของ UI components (ปุ่ม, card, tag, hero section) ได้ง่าย ๆ โดยแค่เปลี่ยน factory เดียว โดย logic ฝั่ง data ไม่ต้องแก้เลย"
        >
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Theme.ActionButton
              onClick={() => setCurrentTheme("minimal")}
              isActive={currentTheme === "minimal"}
            >
              minimal
            </Theme.ActionButton>
            <Theme.ActionButton
              onClick={() => setCurrentTheme("creative")}
              isActive={currentTheme === "creative"}
            >
              creative
            </Theme.ActionButton>
            <Theme.ActionButton
              onClick={() => setCurrentTheme("academic")}
              isActive={currentTheme === "academic"}
            >
              academic
            </Theme.ActionButton>

            <Theme.ActionButton
              onClick={() => setCurrentTheme("taichi")}
              isActive={currentTheme === "taichi"}
            >
              taichi
            </Theme.ActionButton>
            
          </div>
        </Theme.HeroWrapper>

        {/* Info Panel: อธิบาย Pattern แบบย่อ */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm leading-relaxed">
            <h2 className="text-base font-semibold mb-2 text-white">Abstract Factory คืออะไร?</h2>
            <p className="text-gray-300 mb-2">
              Abstract Factory คือ pattern ที่ให้ `โรงงานของโรงงาน` — แทนที่จะสร้าง object เดียว เราสร้าง <span className="font-mono">family ของ related components</span> ทั้งชุด เช่น ปุ่ม, card, tag ที่เข้ากันเป็น theme เดียวกัน
            </p>
            <p className="text-gray-400 text-xs">
              ลองไปแก้ไข interface <span className="font-mono">UIThemeFactory</span> ด้านบน เพิ่ม method หรือ component ใหม่ แล้ว implement ให้ครบทั้ง 3 theme ดู เช่น เพิ่ม <span className="font-mono">Badge</span> หรือ <span className="font-mono">Panel</span> แล้วลองใช้ในหน้านี้
            </p>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-gray-300 space-y-1">
            <p className="text-[11px] text-gray-500 uppercase tracking-[0.2em] mb-1">CURRENT FACTORY</p>
            <p><span className="text-gray-500">Key:</span> {currentTheme}</p>
            <p><span className="text-gray-500">Concrete Factory:</span> <span className="text-white">{currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}ThemeFactory</span></p>
            <p className="mt-2 text-gray-400">
              UI ถูกสร้างจากชุด components ภายใต้ theme เดียวกัน เพื่อให้คุณลอง scale design pattern นี้ต่อได้ง่าย
            </p>
          </div>
        </div>

        {/* Project List Preview (ใช้ factory เดียวกัน เปลี่ยนได้แค่ data) */}
        <div className="space-y-4">
          {sampleProjects.map(project => (
            <Theme.CardWrapper key={project.id}>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                <p className="text-sm text-gray-300">{project.description}</p>
                <div className="mt-2 flex flex-wrap items-center">
                  {project.tags.map(tag => (
                    <Theme.Tag key={tag} label={tag} />
                  ))}
                </div>
              </div>
            </Theme.CardWrapper>
          ))}
        </div>

        {/* Playground Hint */}
        <div className="mt-10 text-xs text-gray-400 border-t border-white/5 pt-4">
          <p className="mb-1 font-mono text-[11px] text-gray-500">PLAYGROUND HINT</p>
          <ul className="list-disc list-inside space-y-1">
            <li>เพิ่ม component ใหม่เข้าไปใน <span className="font-mono">UIThemeFactory</span> เช่น <span className="font-mono">Badge</span>, <span className="font-mono">Panel</span>, หรือ <span className="font-mono">Footer</span></li>
            <li>ลองเพิ่ม theme ใหม่เช่น <span className="font-mono">`neon`</span> หรือ <span className="font-mono">`terminal`</span> ลงใน <span className="font-mono">themeRegistry</span></li>
            <li>ลองปรับ layout, spacing, font, shadow ของแต่ละ factory เพื่อดูผลต่างชัดๆ</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AbstractFactoryDemoPage;
