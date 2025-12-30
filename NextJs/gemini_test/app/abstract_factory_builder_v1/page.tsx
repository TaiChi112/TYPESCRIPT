"use client";

import React, { useState, useMemo } from "react";

/**
 * ---------------------------------------------------------------------
 * 1) ABSTRACT PRODUCTS
 * ---------------------------------------------------------------------
 */
interface NavProps { links: string[] }
interface ContentProps { title: string; body: string }
interface FooterProps { text: string }

/**
 * ---------------------------------------------------------------------
 * 2) CONCRETE PRODUCTS - (MINIMAL & CREATIVE)
 * ---------------------------------------------------------------------
 */
// Minimal
const MinimalNav: React.FC<NavProps> = ({ links }) => (
    <nav className="font-mono text-xs border-b border-gray-800 pb-2 mb-4">
        {links.map(l => <span key={l} className="mr-4 text-green-500 hover:underline cursor-pointer">[{l}]</span>)}
    </nav>
);
const MinimalContent: React.FC<ContentProps> = ({ title, body }) => (
    <div className="font-mono mb-6">
        <h2 className="text-xl text-green-400 mb-2">{"> " + title}</h2>
        <p className="text-gray-400 text-sm leading-relaxed">{body}</p>
    </div>
);
const MinimalFooter: React.FC<FooterProps> = ({ text }) => (
    <footer className="font-mono text-[10px] text-gray-600 mt-10 border-t border-gray-900 pt-2 italic">
        (c) 2025 // {text}
    </footer>
);

// Creative
const CreativeNav: React.FC<NavProps> = ({ links }) => (
    <nav className="flex gap-4 mb-6 bg-white shadow-sm p-4 rounded-2xl">
        {links.map(l => <span key={l} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">{l}</span>)}
    </nav>
);
const CreativeContent: React.FC<ContentProps> = ({ title, body }) => (
    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100/50 mb-6 transform hover:scale-[1.01] transition-transform">
        <h2 className="text-2xl font-black text-gray-800 mb-3">{title}</h2>
        <p className="text-gray-600 leading-relaxed">{body}</p>
    </div>
);
const CreativeFooter: React.FC<FooterProps> = ({ text }) => (
    <footer className="text-center py-6 text-gray-400 text-xs font-medium tracking-widest uppercase">
        --- {text} ---
    </footer>
);

/**
 * ---------------------------------------------------------------------
 * 3) ABSTRACT FACTORY
 * ---------------------------------------------------------------------
 */
interface UIThemeFactory {
    createNav(links: string[]): React.ReactNode;
    createContent(title: string, body: string): React.ReactNode;
    createFooter(text: string): React.ReactNode;
}

const MinimalFactory: UIThemeFactory = {
    createNav: (links) => <MinimalNav key="nav" links={links} />,
    createContent: (title, body) => <MinimalContent key={`content-${title}`} title={title} body={body} />,
    createFooter: (text) => <MinimalFooter key="footer" text={text} />,
};

const CreativeFactory: UIThemeFactory = {
    createNav: (links) => <CreativeNav key="nav" links={links} />,
    createContent: (title, body) => <CreativeContent key={`content-${title}`} title={title} body={body} />,
    createFooter: (text) => <CreativeFooter key="footer" text={text} />,
};

/**
 * ---------------------------------------------------------------------
 * 4) BUILDER (The Universal Assembler)
 * ---------------------------------------------------------------------
 */
class PageBuilder {
    private components: React.ReactNode[] = [];
    private factory: UIThemeFactory;

    constructor(factory: UIThemeFactory) {
        this.factory = factory;
    }

    addNavigation(links: string[]) {
        this.components.push(this.factory.createNav(links));
        return this; // Fluent Interface: เพื่อให้เรียกต่อกันได้
    }

    addMainSection(title: string, body: string) {
        this.components.push(this.factory.createContent(title, body));
        return this;
    }

    addFooter(text: string) {
        this.components.push(this.factory.createFooter(text));
        return this;
    }

    build() { return this.components; }
}

/**
 * ---------------------------------------------------------------------
 * 5) DEMO PAGE (Interactive Builder)
 * ---------------------------------------------------------------------
 */
export default function InteractiveBuilderPage() {
    const [theme, setTheme] = useState<"minimal" | "creative">("minimal");

    // สถานะของ Checkbox (User's Choices)
    const [config, setConfig] = useState({
        includeNav: true,
        includeIntro: true,
        includeProjects: false,
        includeSkills: false,
        includeContact: false,
        includeFooter: true,
    });

    // ข้อมูลสำหรับแต่ละ Section (Data Source)
    const pageData = {
        nav: ["Home", "Works", "Contact"],
        intro: { title: "Hello, I'm a Developer", body: "Welcome to my personal corner of the web where I share my thoughts and projects." },
        projects: { title: "Featured Projects", body: "1. AI Platform\n2. Design System\n3. E-commerce Engine" },
        skills: { title: "Technical Skills", body: "React, TypeScript, Node.js, and Software Design Patterns." },
        contact: { title: "Get in Touch", body: "Email: hello@example.com | GitHub: @devuser" },
        footer: "Built with Builder Pattern & Abstract Factory"
    };

    const factory = theme === "minimal" ? MinimalFactory : CreativeFactory;

    // การประกอบร่างหน้าเว็บ (The Construction Process)
    const pageView = useMemo(() => {
        const builder = new PageBuilder(factory);

        // ขั้นตอนการประกอบตามความต้องการของ User (Manual Direction)
        if (config.includeNav) builder.addNavigation(pageData.nav);
        if (config.includeIntro) builder.addMainSection(pageData.intro.title, pageData.intro.body);
        if (config.includeProjects) builder.addMainSection(pageData.projects.title, pageData.projects.body);
        if (config.includeSkills) builder.addMainSection(pageData.skills.title, pageData.skills.body);
        if (config.includeContact) builder.addMainSection(pageData.contact.title, pageData.contact.body);
        if (config.includeFooter) builder.addFooter(pageData.footer);

        return builder.build();
    }, [factory, config]);

    return (
        <div className={`min-h-screen p-8 transition-colors duration-500 ${theme === 'minimal' ? 'bg-[#050816] text-white' : 'bg-slate-50 text-slate-900'}`}>
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">

                {/* --- Left Column: BUILDER CONTROLS --- */}
                <div className="md:col-span-1 space-y-8 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm h-fit">
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-50">1. Select Theme</h3>
                        <div className="flex gap-2">
                            <button onClick={() => setTheme("minimal")} className={`flex-1 py-2 text-xs rounded-lg border transition-all ${theme === 'minimal' ? 'bg-green-500 text-black border-green-500' : 'border-gray-700 hover:border-gray-400'}`}>Minimalist</button>
                            <button onClick={() => setTheme("creative")} className={`flex-1 py-2 text-xs rounded-lg border transition-all ${theme === 'creative' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-700 hover:border-gray-400'}`}>Creative</button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-50">2. Assemble Page (Builder)</h3>
                        <div className="space-y-3">
                            {Object.keys(config).map((key) => (
                                <label key={key} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={config[key as keyof typeof config]}
                                        onChange={() => setConfig(prev => ({ ...prev, [key]: !prev[key as keyof typeof config] }))}
                                        className="w-4 h-4 accent-indigo-500"
                                    />
                                    <span className="text-sm capitalize">{key.replace('include', '').trim()} Section</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setConfig({ includeNav: false, includeIntro: false, includeProjects: false, includeSkills: false, includeContact: false, includeFooter: false })}
                        className="w-full py-2 text-xs text-red-400 hover:text-red-300 transition-colors uppercase font-bold"
                    >
                        Reset All Sections
                    </button>
                </div>

                {/* --- Right Column: LIVE PREVIEW --- */}
                <div className="md:col-span-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-6 opacity-30">Live Preview</h3>
                    <div className="min-h-[600px] p-2">
                        {pageView.length > 0 ? pageView : (
                            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-3xl opacity-20">
                                <p className="text-xl font-mono">_BLANK_PAGE_</p>
                                <p className="text-xs">Start ticking boxes to build your site</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}