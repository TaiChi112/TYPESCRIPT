"use client";

import React, { useState } from "react";

/**
 * ---------------------------------------------------------------------
 * BUILDER PATTERN — PAGE COMPOSITION PLAYGROUND (DEMO PAGE)
 * ---------------------------------------------------------------------
 * หน้านี้เป็นสนามทดลองสำหรับ Builder Pattern โดยเฉพาะ
 *
 * แนวคิดหลัก:
 * - แยกขั้นตอนการ "ประกอบหน้า" (construction steps) ออกจาก "รูปแบบการแสดงผลสุดท้าย"
 * - Builder รับคำสั่งเป็น step เล็ก ๆ (setTitle, addSection, setAccentColor, ...)
 * - เมื่อพร้อมแล้วค่อยเรียก build() เพื่อได้ React element หน้าสำเร็จ
 *
 * คุณสามารถ:
 * - เพิ่ม method ใหม่ใน IPageBuilder (เช่น setFooter, setHeaderBadge ฯลฯ)
 * - สร้าง Concrete Builder ใหม่ (เช่น TimelinePageBuilder, DashboardPageBuilder)
 * - เล่นกับลำดับการเรียก step เพื่อดูผลลัพธ์ที่ต่างกัน
 */

// 1) DOMAIN MODEL สำหรับส่วนต่าง ๆ ของหน้า
interface SectionConfig {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

// 2) BUILDER INTERFACE
interface IPageBuilder {
  reset(): void;
  setTitle(title: string): void;
  setSubtitle(subtitle: string): void;
  setAccentColor(color: string): void;
  setSections(sections: SectionConfig[]): void;
  build(): React.ReactNode;
}

// 3) CONCRETE BUILDER — MINIMAL PAGE
class MinimalPageBuilder implements IPageBuilder {
  private title = "";
  private subtitle = "";
  private accentColor = "#22c55e"; // tailwind green-500
  private sections: SectionConfig[] = [];

  reset(): void {
    this.title = "";
    this.subtitle = "";
    this.accentColor = "#22c55e";
    this.sections = [];
  }

  setTitle(title: string): void {
    this.title = title;
  }

  setSubtitle(subtitle: string): void {
    this.subtitle = subtitle;
  }

  setAccentColor(color: string): void {
    this.accentColor = color;
  }

  setSections(sections: SectionConfig[]): void {
    this.sections = sections.filter((s) => s.enabled);
  }

  build(): React.ReactNode {
    return (
      <div className="border border-gray-800 bg-black rounded-2xl p-6 font-mono text-sm text-gray-200 space-y-4">
        <header className="mb-2">
          <p className="text-[11px] tracking-[0.25em] text-gray-500 mb-1 uppercase">
            MINIMAL PAGE (BUILDER OUTPUT)
          </p>
          <h1 className="text-xl text-gray-100" style={{ color: this.accentColor }}>
            {this.title || "Untitled Page"}
          </h1>
          {this.subtitle && (
            <p className="text-xs text-gray-400 mt-1">{this.subtitle}</p>
          )}
        </header>
        <main className="space-y-3">
          {this.sections.length === 0 && (
            <p className="text-xs text-gray-500">
              (ไม่มี section ที่ถูก enable — ลองเปิดสักอันจาก panel ด้านบน)
            </p>
          )}
          {this.sections.map((section) => (
            <section key={section.id} className="border-l border-gray-700 pl-3 py-1">
              <h2 className="text-sm text-gray-100">{section.title}</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {section.description}
              </p>
            </section>
          ))}
        </main>
      </div>
    );
  }
}

// 4) CONCRETE BUILDER — CREATIVE PAGE
class CreativePageBuilder implements IPageBuilder {
  private title = "";
  private subtitle = "";
  private accentColor = "#6366f1"; // tailwind indigo-500
  private sections: SectionConfig[] = [];

  reset(): void {
    this.title = "";
    this.subtitle = "";
    this.accentColor = "#6366f1";
    this.sections = [];
  }

  setTitle(title: string): void {
    this.title = title;
  }

  setSubtitle(subtitle: string): void {
    this.subtitle = subtitle;
  }

  setAccentColor(color: string): void {
    this.accentColor = color;
  }

  setSections(sections: SectionConfig[]): void {
    this.sections = sections.filter((s) => s.enabled);
  }

  build(): React.ReactNode {
    return (
      <div className="bg-linear-to-br from-slate-900 via-indigo-900 to-slate-900 rounded-3xl p-6 border border-white/10 shadow-xl text-sm text-slate-100 space-y-5">
        <header className="mb-1">
          <p className="text-[11px] tracking-[0.25em] text-indigo-200 mb-2 uppercase">
            CREATIVE PAGE (BUILDER OUTPUT)
          </p>
          <h1
            className="text-2xl font-semibold mb-1 drop-shadow-[0_0_15px_rgba(129,140,248,0.65)]"
            style={{ color: this.accentColor }}
          >
            {this.title || "Untitled Creative Page"}
          </h1>
          {this.subtitle && (
            <p className="text-xs text-indigo-100/90 max-w-xl">
              {this.subtitle}
            </p>
          )}
        </header>
        <main className="grid gap-4 md:grid-cols-2">
          {this.sections.length === 0 && (
            <div className="text-xs text-slate-200/70 italic">
              ไม่มี section ถูกเลือก — ลอง enable จาก panel ด้านบนเพื่อดูผล layout
            </div>
          )}
          {this.sections.map((section) => (
            <section
              key={section.id}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              <h2 className="text-sm font-semibold mb-1 flex items-center gap-2">
                <span
                  className="inline-block h-5 w-5 rounded-full"
                  style={{ background: this.accentColor }}
                />
                {section.title}
              </h2>
              <p className="text-xs text-slate-100/90 leading-relaxed">
                {section.description}
              </p>
            </section>
          ))}
        </main>
      </div>
    );
  }
}

// 5) BUILDER REGISTRY
const builderRegistry = {
  minimal: () => new MinimalPageBuilder(),
  creative: () => new CreativePageBuilder(),
};

type BuilderKind = keyof typeof builderRegistry; // 'minimal' | 'creative'

// 6) DEMO PAGE COMPONENT (DIRECTOR)
const BuilderDemoPage: React.FC = () => {
  const [builderKind, setBuilderKind] = useState<BuilderKind>("minimal");
  const [title, setTitle] = useState("My Builder Composed Page");
  const [subtitle, setSubtitle] = useState(
    "ปรับ step การ build หน้าได้อย่างยืดหยุ่น โดยไม่ผูกกับ layout เดียว",
  );
  const [accentColor, setAccentColor] = useState("#22c55e");

  const [sections, setSections] = useState<SectionConfig[]>([
    {
      id: "about",
      title: "About",
      description:
        "Introduce who you are, what you do, and what this page is for.",
      enabled: true,
    },
    {
      id: "projects",
      title: "Projects",
      description:
        "Highlight a few key projects or case studies that matter most.",
      enabled: true,
    },
    {
      id: "skills",
      title: "Skills",
      description:
        "Summarize your core skills, tools, and technologies in one place.",
      enabled: true,
    },
    {
      id: "contact",
      title: "Contact",
      description:
        "Provide ways to reach you: email, social links, or calendar.",
      enabled: false,
    },
  ]);

  // DIRECTOR LOGIC: สั่ง builder ตาม state ปัจจุบัน
  const builder = builderRegistry[builderKind]();
  builder.reset();
  builder.setTitle(title);
  builder.setSubtitle(subtitle);
  builder.setAccentColor(accentColor);
  builder.setSections(sections);
  const builtPage = builder.build();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-5xl">
        {/* Hero / Intro */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-[11px] tracking-[0.25em] text-slate-400 mb-2 uppercase">
              BUILDER · PAGE COMPOSITION DEMO
            </p>
            <h1 className="text-2xl font-semibold mb-1">
              Builder Pattern — Page Composition Playground
            </h1>
            <p className="text-sm text-slate-300 mb-4 max-w-2xl">
              หน้านี้ใช้ Builder Pattern เพื่อประกอบหน้า (Page) จาก step เล็ก ๆ หลาย ๆ ขั้น
              คุณสามารถเปลี่ยน Builder (minimal / creative) ได้โดยที่ Director logic
              ยังเหมือนเดิมทุกอย่าง
            </p>
          </div>
        </div>

        {/* Control Panel */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Builder selection + accent color */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs space-y-3">
            <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-1">
              BUILDER TYPE
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setBuilderKind("minimal")}
                className={`px-3 py-1.5 rounded-full border text-[11px] transition-all
                  ${builderKind === "minimal"
                    ? "bg-emerald-500 border-emerald-300 text-white shadow"
                    : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                `}
              >
                MinimalPageBuilder
              </button>
              <button
                onClick={() => setBuilderKind("creative")}
                className={`px-3 py-1.5 rounded-full border text-[11px] transition-all
                  ${builderKind === "creative"
                    ? "bg-indigo-500 border-indigo-300 text-white shadow"
                    : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                `}
              >
                CreativePageBuilder
              </button>
            </div>

            <div className="mt-3">
              <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-1">
                ACCENT COLOR
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded-full border border-white/40 bg-transparent cursor-pointer"
                />
                <span className="font-mono text-[11px] text-slate-300">
                  {accentColor}
                </span>
              </div>
            </div>
          </div>

          {/* Title / Subtitle */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs space-y-3">
            <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-1">
              PAGE META
            </p>
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md bg-slate-900 border border-white/15 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Subtitle</label>
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  rows={3}
                  className="w-full rounded-md bg-slate-900 border border-white/15 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-emerald-400 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Sections toggle */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs space-y-2">
            <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-1">
              SECTIONS
            </p>
            <div className="space-y-1">
              {sections.map((section) => (
                <label
                  key={section.id}
                  className="flex items-start gap-2 cursor-pointer hover:bg-white/5 rounded-md px-1 py-0.5"
                >
                  <input
                    type="checkbox"
                    checked={section.enabled}
                    onChange={(e) =>
                      setSections((prev) =>
                        prev.map((s) =>
                          s.id === section.id ? { ...s, enabled: e.target.checked } : s,
                        ),
                      )
                    }
                    className="mt-0.5 h-3 w-3 rounded border-slate-500 bg-slate-900"
                  />
                  <div>
                    <p className="text-xs text-slate-100">{section.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {section.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs leading-relaxed">
            <h2 className="text-sm font-semibold text-white mb-2">Builder คืออะไร?</h2>
            <p className="text-slate-200 mb-2">
              Builder Pattern แยกขั้นตอนการสร้าง object ที่ซับซ้อนออกจากตัว object เอง
              ทำให้สามารถประกอบ (compose) ส่วนต่าง ๆ ทีละขั้น และสร้าง representation
              ที่ต่างกันจากชุด step เดียวกันได้
            </p>
            <p className="text-slate-400">
              ในหน้านี้ <span className="font-mono">BuilderDemoPage</span> ทำหน้าที่เป็น
              Director ที่เรียก step เดียวกัน แต่คุณสามารถเปลี่ยน Builder
              จาก <span className="font-mono">MinimalPageBuilder</span> เป็น
              <span className="font-mono">CreativePageBuilder</span> โดยไม่ต้องแก้ logic
              ของ Director เลย
            </p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-200 space-y-1">
            <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-1">
              CURRENT BUILDER
            </p>
            <p>
              <span className="text-slate-500">builder:</span> {builderKind}
            </p>
            <p>
              <span className="text-slate-500">class:</span>{" "}
              {builderKind === "minimal"
                ? "MinimalPageBuilder"
                : "CreativePageBuilder"}
            </p>
            <p>
              <span className="text-slate-500">steps used:</span> reset → setTitle →
              setSubtitle → setAccentColor → setSections → build
            </p>
          </div>
        </div>

        {/* BUILDER OUTPUT */}
        <div className="mb-10">{builtPage}</div>

        {/* Playground hints */}
        <div className="mt-4 text-xs text-slate-400 border-t border-white/5 pt-4">
          <p className="mb-1 font-mono text-[11px] text-slate-500">PLAYGROUND HINT</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              เพิ่ม method ใหม่ใน <span className="font-mono">IPageBuilder</span> เช่น
              <span className="font-mono">setFooter()</span> หรือ
              <span className="font-mono">addHeroBadge()</span> แล้ว implement ให้ครบทุก
              Concrete Builder
            </li>
            <li>
              สร้าง Builder ใหม่ เช่น
              <span className="font-mono">TimelinePageBuilder</span> หรือ
              <span className="font-mono">DashboardPageBuilder</span> แล้วเพิ่มเข้า
              <span className="font-mono">builderRegistry</span>
            </li>
            <li>
              ลองสลับลำดับการเรียก step (เช่น setSections ก่อน setAccentColor)
              เพื่อเข้าใจว่าบาง step อาจมี dependency กันอย่างไร
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BuilderDemoPage;
