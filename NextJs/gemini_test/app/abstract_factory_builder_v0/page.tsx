"use client";

import React, { useState, useMemo } from "react";

/**
 * ---------------------------------------------------------------------
 * 1) ABSTRACT PRODUCTS (Interfaces for Components)
 * ---------------------------------------------------------------------
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
 * 2) CONCRETE PRODUCTS - MINIMAL & CREATIVE
 * ---------------------------------------------------------------------
 */
// --- Minimal Theme ---
const MinimalButton: React.FC<ButtonProps> = ({ onClick, children, isActive }) => (
    <button onClick={onClick} className={`font-mono text-xs px-3 py-1 border transition-all mr-2 rounded-sm ${isActive ? "border-green-500 text-green-400 bg-green-500/10" : "border-gray-700 text-gray-400 hover:border-gray-500"}`}>
        [ {children} ]
    </button>
);
const MinimalTag: React.FC<TagProps> = ({ label }) => <span className="text-xs text-gray-500 font-mono mr-2">#{label}</span>;
const MinimalCard: React.FC<WrapperProps> = ({ children }) => <div className="border-l border-gray-800 pl-4 py-3 mb-4">{children}</div>;
const MinimalHero: React.FC<HeroProps> = ({ title, subtitle, children }) => (
    <div className="border border-gray-800 p-6 bg-black text-green-500 font-mono mb-8">
        <h1 className="text-2xl mb-2">{title}</h1>
        <p className="text-sm text-gray-400 mb-4">{subtitle}</p>
        {children}
    </div>
);

// --- Creative Theme ---
const CreativeButton: React.FC<ButtonProps> = ({ onClick, children, isActive }) => (
    <button onClick={onClick} className={`px-4 py-2 rounded-xl font-semibold text-sm mr-2 transition-all ${isActive ? "bg-indigo-600 text-white" : "bg-white text-gray-700 border border-gray-200"}`}>
        {children}
    </button>
);
const CreativeTag: React.FC<TagProps> = ({ label }) => <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-md font-bold mr-2">✨ {label}</span>;
const CreativeCard: React.FC<WrapperProps> = ({ children }) => <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-4">{children}</div>;
const CreativeHero: React.FC<HeroProps> = ({ title, subtitle, children }) => (
    <div className="bg-gradient-to-r from-violet-600 to-blue-500 p-8 rounded-3xl text-white mb-10">
        <h1 className="text-3xl font-black mb-2">{title}</h1>
        <p className="text-sm text-indigo-100 mb-4">{subtitle}</p>
        {children}
    </div>
);

/**
 * ---------------------------------------------------------------------
 * 3) ABSTRACT FACTORY
 * ---------------------------------------------------------------------
 */
interface UIThemeFactory {
    createActionButton(): React.FC<ButtonProps>;
    createTag(): React.FC<TagProps>;
    createCardWrapper(): React.FC<WrapperProps>;
    createHeroWrapper(): React.FC<HeroProps>;
}

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

/**
 * ---------------------------------------------------------------------
 * 4) BUILDER PATTERN (The Assembly Line)
 * ---------------------------------------------------------------------
 * Builder จะทำหน้าที่ "ประกอบ" ชิ้นส่วนเข้าด้วยกัน
 */
interface WebPageBuilder {
    reset(): void;
    addHero(title: string, sub: string): void;
    addContentBlock(title: string, desc: string, tags: string[]): void;
    addFooter(text: string): void;
    getComponents(): React.ReactNode[];
}

class ReactWebPageBuilder implements WebPageBuilder {
    private components: React.ReactNode[] = [];
    private factory: UIThemeFactory;

    constructor(factory: UIThemeFactory) {
        this.factory = factory;
    }

    reset() { this.components = []; }

    addHero(title: string, sub: string) {
        const Hero = this.factory.createHeroWrapper();
        this.components.push(<Hero key="hero" title={title} subtitle={sub} />);
    }

    addContentBlock(title: string, desc: string, tags: string[]) {
        const Card = this.factory.createCardWrapper();
        const Tag = this.factory.createTag();
        this.components.push(
            <Card key={`content-${title}`}>
                <h2 className="text-xl font-bold mb-2">{title}</h2>
                <p className="opacity-70 mb-4">{desc}</p>
                <div className="flex">
                    {tags.map(t => <Tag key={t} label={t} />)}
                </div>
            </Card>
        );
    }

    addFooter(text: string) {
        this.components.push(
            <footer key="footer" className="mt-8 pt-4 border-t border-gray-200 opacity-50 text-sm">
                {text}
            </footer>
        );
    }

    getComponents() { return this.components; }
}

/**
 * ---------------------------------------------------------------------
 * 5) DIRECTOR (The Template Manager)
 * ---------------------------------------------------------------------
 * Director จะรู้ว่า "Resume" หรือ "Blog" ต้องมีโครงสร้างยังไง
 */
class PageDirector {
    static buildResume(builder: WebPageBuilder) {
        builder.reset();
        builder.addHero("My Professional Profile", "Software Engineer & Architect");
        builder.addContentBlock("Experience", "Worked at X, Y, Z for 5 years.", ["React", "Architecture"]);
        builder.addFooter("Generated via Profile Builder");
    }

    static buildBlog(builder: WebPageBuilder) {
        builder.reset();
        builder.addHero("Technical Blog", "Sharing thoughts on Design Patterns");
        builder.addContentBlock("Builder Pattern", "How to assemble complex objects...", ["DesignPatterns", "Code"]);
        builder.addContentBlock("Abstract Factory", "Managing multiple families of products...", ["UI", "Scale"]);
        builder.addFooter("Reading time: 5 mins");
    }
}

/**
 * ---------------------------------------------------------------------
 * 6) MAIN DEMO PAGE
 * ---------------------------------------------------------------------
 */
export default function BuilderDemoPage() {
    const [theme, setTheme] = useState<"minimal" | "creative">("minimal");
    const [layout, setLayout] = useState<"resume" | "blog">("resume");
    const [showFooter, setShowFooter] = useState(true);

    // 1. เลือก Factory
    const factory = theme === "minimal" ? MinimalThemeFactory : CreativeThemeFactory;

    // 2. ใช้ Builder ประกอบหน้าเว็บ (ใช้ useMemo เพื่อไม่ให้สร้างใหม่ทุกครั้งที่ render)
    const pageContent = useMemo(() => {
        const builder = new ReactWebPageBuilder(factory);

        // ให้ Director ทำงานตาม Layout ที่เลือก
        if (layout === "resume") PageDirector.buildResume(builder);
        else PageDirector.buildBlog(builder);

        // คุณสามารถ "ปรับแต่ง" ต่อได้หลังจาก Director ทำงานเสร็จ (เช่น ติ๊ก Checkbox)
        if (!showFooter) {
            const current = builder.getComponents();
            // ตัวอย่างการลบส่วนท้ายออกหากไม่ต้องการ
            return current.filter(c => (c as React.ReactElement).key !== "footer");
        }

        return builder.getComponents();
    }, [factory, layout, showFooter]);

    return (
        <div className={`min-h-screen p-8 transition-colors duration-500 ${theme === 'minimal' ? 'bg-[#050816] text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-4xl mx-auto">

                {/* Controls Area */}
                <div className="mb-10 p-4 border border-dashed border-gray-500 rounded-lg flex flex-wrap gap-6 items-center">
                    <div>
                        <p className="text-xs font-bold mb-2 uppercase opacity-50">1. Select Theme (Abstract Factory)</p>
                        <div className="flex gap-2">
                            <button onClick={() => setTheme("minimal")} className={`px-3 py-1 text-xs border rounded ${theme === 'minimal' ? 'bg-green-500 text-black' : ''}`}>Minimal</button>
                            <button onClick={() => setTheme("creative")} className={`px-3 py-1 text-xs border rounded ${theme === 'creative' ? 'bg-indigo-500 text-white' : ''}`}>Creative</button>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold mb-2 uppercase opacity-50">2. Select Layout (Director)</p>
                        <select
                            value={layout}
                            onChange={(e) => setLayout(e.target.value as any)}
                            className="bg-transparent border p-1 text-xs rounded"
                        >
                            <option value="resume">Resume Layout</option>
                            <option value="blog">Blog Layout</option>
                        </select>
                    </div>

                    <div>
                        <p className="text-xs font-bold mb-2 uppercase opacity-50">3. Custom Toggle (Builder Logic)</p>
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input type="checkbox" checked={showFooter} onChange={() => setShowFooter(!showFooter)} />
                            Include Footer
                        </label>
                    </div>
                </div>

                {/* Render the assembled content */}
                <div className="space-y-4">
                    {pageContent}
                </div>

            </div>
        </div>
    );
}