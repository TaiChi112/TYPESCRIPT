"use client";

import React, { useState } from "react";

/**
 * ---------------------------------------------------------------------
 * BRIDGE PATTERN — RENDERING STRATEGIES PLAYGROUND (DEMO PAGE)
 * ---------------------------------------------------------------------
 * หน้านี้เป็นสนามทดลองสำหรับ Bridge Pattern โดยเฉพาะ
 *
 * แนวคิดหลัก:
 * - แยก "สิ่งที่ต้องแสดง" (Abstraction) ออกจาก "วิธีแสดง" (Implementation/Strategy)
 * - ทำให้ทั้งฝั่ง Content type และ Render style เปลี่ยนได้อิสระ
 * - ใช้ object ของ strategy เป็นสะพาน (bridge) ระหว่าง abstraction กับ implementation
 *
 * คุณสามารถ:
 * - เพิ่ม render strategy ใหม่ (เช่น Outline, Ghost, CardWithBadge)
 * - เพิ่ม abstraction ใหม่ (เช่น ResearchRenderer) โดยใช้ strategy เดิม
 * - เปลี่ยน strategy runtime โดยไม่แตะข้อมูล content
 */

// 1) DOMAIN MODEL
interface ContentItem {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  kind: "article" | "project";
}

const SAMPLE_ITEMS: ContentItem[] = [
  {
    id: "a1",
    kind: "article",
    title: "Understanding Bridge Pattern",
    description:
      "Bridge decouples an abstraction from its implementation so they can vary independently.",
    date: "2024-09-01",
    tags: ["design-patterns", "bridge", "architecture"],
  },
  {
    id: "p1",
    kind: "project",
    title: "Portfolio Rendering System",
    description:
      "A system that can switch between preview/full/compact views without touching content models.",
    date: "2024-06-10",
    tags: ["react", "nextjs", "ui"],
  },
];

// 2) IMPLEMENTOR INTERFACE (HOW TO RENDER)
interface IRenderStrategy {
  renderTitle(title: string, kind: ContentItem["kind"]): React.ReactNode;
  renderDescription(description: string): React.ReactNode;
  renderMeta(date: string, tags: string[]): React.ReactNode;
}

// 3) CONCRETE IMPLEMENTORS (STRATEGIES)
class PreviewRenderStrategy implements IRenderStrategy {
  renderTitle(title: string, kind: ContentItem["kind"]): React.ReactNode {
    return (
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/60 font-mono uppercase tracking-[0.14em]">
          {kind}
        </span>
      </div>
    );
  }

  renderDescription(description: string): React.ReactNode {
    return (
      <p className="text-[11px] text-slate-300 line-clamp-2">{description}</p>
    );
  }

  renderMeta(date: string, tags: string[]): React.ReactNode {
    return (
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] text-slate-500 font-mono">{date}</span>
        <div className="flex gap-1 flex-wrap justify-end">
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-800 text-slate-100 border border-slate-500/60 font-mono"
            >
              {tag}
            </span>
          ))}
          {tags.length > 2 && (
            <span className="text-[10px] text-slate-500">+{tags.length - 2}</span>
          )}
        </div>
      </div>
    );
  }
}

class FullRenderStrategy implements IRenderStrategy {
  renderTitle(title: string, kind: ContentItem["kind"]): React.ReactNode {
    return (
      <div className="flex items-center gap-3 mb-1">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-200 border border-emerald-400/60 font-mono uppercase tracking-[0.16em]">
          {kind}
        </span>
      </div>
    );
  }

  renderDescription(description: string): React.ReactNode {
    return (
      <p className="text-sm text-slate-100 leading-relaxed mb-2">{description}</p>
    );
  }

  renderMeta(date: string, tags: string[]): React.ReactNode {
    return (
      <div className="flex items-center justify-between mt-1">
        <span className="text-[11px] text-sky-300 font-mono">{date}</span>
        <div className="flex gap-1 flex-wrap justify-end">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[10px] rounded-full bg-slate-800 text-slate-100 border border-slate-500/60 font-mono"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  }
}

class CompactRenderStrategy implements IRenderStrategy {
  renderTitle(title: string, kind: ContentItem["kind"]): React.ReactNode {
    return (
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        <span className="text-[11px] text-slate-100 truncate">
          [{kind}] {title}
        </span>
      </div>
    );
  }

  renderDescription(): React.ReactNode {
    return null; // compact mode ไม่แสดง description
  }

  renderMeta(date: string): React.ReactNode {
    return (
      <span className="text-[10px] text-slate-500 font-mono">{date}</span>
    );
  }
}

// Helper: strategy factory
const getRenderStrategy = (
  mode: "preview" | "full" | "compact",
): IRenderStrategy => {
  switch (mode) {
    case "preview":
      return new PreviewRenderStrategy();
    case "full":
      return new FullRenderStrategy();
    case "compact":
    default:
      return new CompactRenderStrategy();
  }
};

// 4) ABSTRACTION (WHAT TO RENDER)
abstract class ContentRenderer {
  protected strategy: IRenderStrategy;

  constructor(strategy: IRenderStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: IRenderStrategy): void {
    this.strategy = strategy;
  }

  abstract render(item: ContentItem): React.ReactNode;
}

// Refined Abstraction: Article
class ArticleRenderer extends ContentRenderer {
  render(item: ContentItem): React.ReactNode {
    return (
      <div className="border border-white/10 bg-slate-900/70 rounded-2xl p-4 flex flex-col gap-1">
        {this.strategy.renderTitle(item.title, item.kind)}
        {this.strategy.renderDescription(item.description)}
        {this.strategy.renderMeta(item.date, item.tags)}
      </div>
    );
  }
}

// Refined Abstraction: Project
class ProjectRenderer extends ContentRenderer {
  render(item: ContentItem): React.ReactNode {
    return (
      <div className="border border-indigo-400/40 bg-slate-950/70 rounded-2xl p-4 flex flex-col gap-1 shadow-[0_0_25px_rgba(129,140,248,0.3)]">
        {this.strategy.renderTitle(item.title, item.kind)}
        {this.strategy.renderDescription(item.description)}
        {this.strategy.renderMeta(item.date, item.tags)}
      </div>
    );
  }
}

// 5) DEMO PAGE COMPONENT
const BridgeDemoPage: React.FC = () => {
  const [mode, setMode] = useState<"preview" | "full" | "compact">("preview");

  // Bridge: abstraction uses strategy; เราสามารถเปลี่ยน strategy runtime ได้
  const strategy = getRenderStrategy(mode);
  const articleRenderer = new ArticleRenderer(strategy);
  const projectRenderer = new ProjectRenderer(strategy);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-5xl">
        {/* Hero / Intro */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-[11px] tracking-[0.25em] text-slate-400 mb-2 uppercase">
              BRIDGE · RENDERING STRATEGIES DEMO
            </p>
            <h1 className="text-2xl font-semibold mb-1">
              Bridge Pattern — Content & Rendering Separation
            </h1>
            <p className="text-sm text-slate-300 mb-4 max-w-2xl">
              หน้านี้ใช้ Bridge Pattern เพื่อแยก Content type (Article/Project) ออกจาก
              วิธี render (Preview/Full/Compact) ทำให้สามารถเพิ่มทั้งสองด้าน
              ได้โดยไม่กระทบกัน
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 bg-black/40 border border-white/10 rounded-2xl p-4 text-xs leading-relaxed">
            <h2 className="text-sm font-semibold text-white mb-2">Bridge คืออะไร?</h2>
            <p className="text-slate-200 mb-2">
              Bridge แยก Abstraction (สิ่งที่ทำ) ออกจาก Implementation (วิธีทำ) ทำให้ทั้ง
              สองส่วนเปลี่ยนแปลงได้อิสระ ในหน้านี้ Abstraction คือ
              <span className="font-mono">ArticleRenderer / ProjectRenderer</span> และ
              Implementation คือ <span className="font-mono">IRenderStrategy</span>
            </p>
            <p className="text-slate-400">
              ลองสลับ Render Mode ด้านขวา แล้วสังเกตว่า Content เดิมถูกแสดงผลต่างกัน
              โดยไม่ต้องแก้ object ของ content เลย
            </p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-200 space-y-2">
            <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-1">
              RENDER MODE (STRATEGY)
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setMode("preview")}
                className={`px-3 py-1.5 rounded-full border text-[11px] transition-all
                  ${mode === "preview"
                    ? "bg-sky-500/90 border-sky-300 text-white shadow"
                    : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                `}
              >
                preview
              </button>
              <button
                onClick={() => setMode("full")}
                className={`px-3 py-1.5 rounded-full border text-[11px] transition-all
                  ${mode === "full"
                    ? "bg-emerald-500/90 border-emerald-300 text-white shadow"
                    : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                `}
              >
                full
              </button>
              <button
                onClick={() => setMode("compact")}
                className={`px-3 py-1.5 rounded-full border text-[11px] transition-all
                  ${mode === "compact"
                    ? "bg-slate-500/90 border-slate-300 text-white shadow"
                    : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                `}
              >
                compact
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              ปัจจุบันใช้ strategy: <span className="text-sky-300">{mode}</span>
            </p>
          </div>
        </div>

        {/* Bridge output: same data, different abstractions using same strategy */}
        <div className="space-y-4 mb-10">
          {SAMPLE_ITEMS.map((item) => {
            const renderer =
              item.kind === "article" ? articleRenderer : projectRenderer;
            return <React.Fragment key={item.id}>{renderer.render(item)}</React.Fragment>;
          })}
        </div>

        {/* Playground hints */}
        <div className="mt-4 text-xs text-slate-400 border-t border-white/5 pt-4">
          <p className="mb-1 font-mono text-[11px] text-slate-500">PLAYGROUND HINT</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              เพิ่ม strategy ใหม่ใน <span className="font-mono">IRenderStrategy</span>
              เช่น <span className="font-mono">OutlineRenderStrategy</span> หรือ
              <span className="font-mono">NeonRenderStrategy</span> แล้วปรับ
              <span className="font-mono">getRenderStrategy()</span> ให้เลือกใช้
            </li>
            <li>
              เพิ่ม abstraction ใหม่ เช่น <span className="font-mono">ResearchRenderer</span>
              ที่ใช้ strategy เดิม แต่มี frame/สไตล์รอบนอกต่างออกไป
            </li>
            <li>
              ลองเชื่อม Bridge นี้กับ Abstract Factory หรือ Theme system โดยให้แต่ละ
              strategy ใช้ theme ต่างกัน
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BridgeDemoPage;
