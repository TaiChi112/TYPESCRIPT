"use client";

import React, { useState } from "react";

/**
 * ---------------------------------------------------------------------
 * 1) ABSTRACT PRODUCTS (Interfaces for Components)
 * ---------------------------------------------------------------------
 * นี่คือ "สัญญาระบุ" ว่า Component แต่ละประเภทต้องรับ Props อะไรบ้าง
 */
interface ButtonProps {
    onClick?: () => void;
    children: React.ReactNode;
    isActive?: boolean;
}

interface TagProps { 
    label: string;
}

interface WrapperProps {
    children: React.ReactNode;
}

interface HeroProps {
    title: string;
    subtitle: string;
    children?: React.ReactNode;
}

/**
 * ---------------------------------------------------------------------
 * 2) CONCRETE PRODUCTS - MINIMAL THEME
 * ---------------------------------------------------------------------
 * แยกการเขียน UI ของแต่ละธีมออกมาเป็น Component อิสระ
 */
const MinimalButton: React.FC<ButtonProps> = ({ onClick, children, isActive }) => (
    <button
        onClick={onClick}
        className={`font-mono text-xs px-3 py-1 border transition-all mr-2 rounded-sm
      ${isActive ? "border-green-500 text-green-400 bg-green-500/10" : "border-gray-700 text-gray-400 hover:border-gray-500"}
    `}
    >
        [ {children} ]
    </button>
);

const MinimalTag: React.FC<TagProps> = ({ label }) => (
    <span className="text-xs text-gray-500 font-mono mr-2">#{label}</span>
);

const MinimalCard: React.FC<WrapperProps> = ({ children }) => (
    <div className="border-l border-gray-800 pl-4 py-3 hover:border-green-500/60 transition-colors">
        {children}
    </div>
);

const MinimalHero: React.FC<HeroProps> = ({ title, subtitle, children }) => (
    <div className="border border-gray-800 p-6 bg-black text-green-500 font-mono mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,#22c55e,transparent_60%)]" />
        <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">MINIMAL STYLE</p>
            <h1 className="text-2xl mb-2">{title}</h1>
            <p className="text-sm text-gray-400 mb-4">{subtitle}</p>
            {children}
        </div>
    </div>
);

/**
 * ---------------------------------------------------------------------
 * 3) CONCRETE PRODUCTS - CREATIVE THEME
 * ---------------------------------------------------------------------
 */
const CreativeButton: React.FC<ButtonProps> = ({ onClick, children, isActive }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-xl font-semibold text-sm mr-2 transition-all transform hover:-translate-y-0.5
      ${isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-300" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}
    `}
    >
        {children}
    </button>
);

const CreativeTag: React.FC<TagProps> = ({ label }) => (
    <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-md font-bold mr-2 shadow-sm">
        ✨ {label}
    </span>
);

const CreativeCard: React.FC<WrapperProps> = ({ children }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1">
        {children}
    </div>
);

const CreativeHero: React.FC<HeroProps> = ({ title, subtitle, children }) => (
    <div className="bg-linear-to-r from-violet-600 via-indigo-600 to-blue-500 p-8 rounded-3xl text-white shadow-2xl mb-10 relative overflow-hidden">
        <div className="absolute -top-20 -right-32 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
            <h1 className="text-3xl font-black mb-2">{title}</h1>
            <p className="text-sm text-indigo-100 mb-4 max-w-xl">{subtitle}</p>
            {children}
        </div>
    </div>
);

/**
 * ---------------------------------------------------------------------
 * 4) ABSTRACT FACTORY INTERFACE
 * ---------------------------------------------------------------------
 */
interface UIThemeFactory {
    createActionButton(): React.FC<ButtonProps>;
    createTag(): React.FC<TagProps>;
    createCardWrapper(): React.FC<WrapperProps>;
    createHeroWrapper(): React.FC<HeroProps>;
}

/**
 * ---------------------------------------------------------------------
 * 5) CONCRETE FACTORIES
 * ---------------------------------------------------------------------
 * ตอนนี้ Factory ทำหน้าที่แค่ "เลือกว่าจะใช้ชิ้นส่วนไหน" มาประกอบกัน
 */
const MinimalThemeFactory: UIThemeFactory = {
    createActionButton: () => MinimalButton,
    createTag: () => MinimalTag,
    createCardWrapper: () => MinimalCard,
    createHeroWrapper: () => MinimalHero,
};

const CreativeThemeFactory: UIThemeFactory = {
    createActionButton: () => CreativeButton,
    createTag: () => CreativeTag,
    createCardWrapper: () => CreativeCard,
    createHeroWrapper: () => CreativeHero,
};

// --- Theme Registry ---
const themeRegistry: Record<string, UIThemeFactory> = {
    minimal: MinimalThemeFactory,
    creative: CreativeThemeFactory,
};

/**
 * ---------------------------------------------------------------------
 * 6) CLIENT CODE (WebApp)
 * ---------------------------------------------------------------------
 */
export default function AbstractFactoryDemoPage() {
    const [currentTheme, setCurrentTheme] = useState<string>("minimal");

    // เลือก Factory ตาม State
    const factory = themeRegistry[currentTheme];

    // สั่งให้ Factory "สร้าง" Component ออกมาใช้งาน
    const ActionButton = factory.createActionButton();
    const Tag = factory.createTag();
    const Card = factory.createCardWrapper();
    const Hero = factory.createHeroWrapper();


    const sampleTags = ["design", "patterns", "react"];

    return (
        <div className={`min-h-screen p-8 transition-colors duration-500 ${currentTheme === 'minimal' ? 'bg-[#050816] text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-4xl mx-auto">

                {/* Render Hero จาก Factory */}
                <Hero
                    title="Theme System Scalability"
                    subtitle="การแยก Product ออกจาก Factory ช่วยให้คุณจัดการโค้ดได้เป็นระเบียบขึ้นมาก"
                >
                    <div className="flex gap-2">
                        <ActionButton onClick={() => setCurrentTheme("minimal")} isActive={currentTheme === "minimal"}>
                            Minimal
                        </ActionButton>
                        <ActionButton onClick={() => setCurrentTheme("creative")} isActive={currentTheme === "creative"}>
                            Creative
                        </ActionButton>
                    </div>
                </Hero>

                {/* Render Card จาก Factory */}
                <Card>
                    <h2 className="text-xl font-bold mb-2">Example Card Content</h2>
                    <p className="opacity-70 mb-4">ข้อมูลส่วนนี้จะเปลี่ยน Style ไปตาม Factory ที่คุณเลือกโดยที่ Logic การส่ง Data เหมือนเดิมเป๊ะ</p>
                    <div className="flex">
                        {sampleTags.map(t => <Tag key={t} label={t} />)}
                    </div>
                </Card>

            </div>
        </div>
    );
}