"use client";

import React, { useState } from "react";

/**
 * ---------------------------------------------------------------------
 * DECORATOR PATTERN — DYNAMIC BADGES PLAYGROUND (DEMO PAGE)
 * ---------------------------------------------------------------------
 * หน้านี้เป็นสนามทดลองสำหรับ Decorator Pattern โดยเฉพาะ
 *
 * แนวคิดหลัก:
 * - มี component พื้นฐาน (BasicCard) ที่แสดง content
 * - สามารถ "ห่อ" (wrap) ด้วย decorator หลายชั้น เช่น Featured, Pinned, Award
 * - ทุก decorator มี interface เดียวกับ component เดิม (render / getDecorations)
 *
 * คุณสามารถ:
 * - เพิ่ม decorator ใหม่ เช่น Trending, Archived ฯลฯ
 * - เพิ่ม field/behavior ใหม่ใน decorator (เช่น icon, color, tooltip)
 * - ทดลอง stack decorators หลายตัวแล้วดูผลลัพธ์
 */

// 1) DOMAIN MODEL
interface Article {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

const SAMPLE_ARTICLES: Article[] = [
  {
    id: "a1",
    title: "Design Patterns Overview",
    description: "High-level overview of GoF design patterns with practical React examples.",
    tags: ["design", "patterns", "overview"],
  },
  {
    id: "a2",
    title: "Building a Portfolio System",
    description: "How to combine multiple design patterns into a cohesive portfolio app.",
    tags: ["react", "nextjs", "portfolio"],
  },
];

// 2) DECORATOR INTERFACE
interface ICardComponent {
  render(): React.ReactNode;
  getDecorations(): string[];
}

// 3) BASE COMPONENT
class BasicCard implements ICardComponent {
  constructor(private article: Article) {}

  render(): React.ReactNode {
    return (
      <div className="border border-slate-700 rounded-xl bg-slate-900/80 p-4 flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-white">{this.article.title}</h3>
        <p className="text-xs text-slate-200 leading-relaxed">
          {this.article.description}
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          {this.article.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-100 border border-slate-600/80"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  }

  getDecorations(): string[] {
    return [];
  }
}

// 4) ABSTRACT DECORATOR
abstract class CardDecorator implements ICardComponent {
  protected component: ICardComponent;
  public decorationType: string;

  constructor(component: ICardComponent, type: string) {
    this.component = component;
    this.decorationType = type;
  }

  abstract render(): React.ReactNode;

  getDecorations(): string[] {
    return [...this.component.getDecorations(), this.decorationType];
  }
}

// 5) CONCRETE DECORATORS
class FeaturedDecorator extends CardDecorator {
  constructor(component: ICardComponent) {
    super(component, "Featured");
  }

  render(): React.ReactNode {
    const base = this.component.render();
    const decorations = this.getDecorations();
    return (
      <div className="relative">
        {base}
        <div className="absolute -top-2 -left-2 px-2 py-0.5 rounded-full bg-amber-500 text-[10px] font-mono text-black border border-amber-300 shadow">
          ★ Featured
        </div>
        {/* chain other decorations preview */}
        {decorations.length > 1 && (
          <div className="absolute -bottom-2 left-2 flex gap-1 text-[9px] text-amber-100">
            {decorations
              .filter((d) => d !== "Featured")
              .map((d) => (
                <span
                  key={d}
                  className="px-1 py-0.5 rounded-full bg-amber-500/20 border border-amber-300/70"
                >
                  {d}
                </span>
              ))}
          </div>
        )}
      </div>
    );
  }
}

class PinnedDecorator extends CardDecorator {
  constructor(component: ICardComponent) {
    super(component, "Pinned");
  }

  render(): React.ReactNode {
    const base = this.component.render();
    return (
      <div className="relative">
        <div className="absolute -top-1 right-4 w-2 h-5 bg-slate-700 rounded-b-full" />
        <div className="absolute -top-3 right-2 w-4 h-4 bg-slate-400 rounded-t-full shadow" />
        {base}
      </div>
    );
  }
}

class AwardDecorator extends CardDecorator {
  constructor(component: ICardComponent) {
    super(component, "Award");
  }

  render(): React.ReactNode {
    const base = this.component.render();
    return (
      <div className="relative">
        {base}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-yellow-500/90 text-[10px] font-mono text-black flex items-center gap-1 shadow">
          🏆 <span>Awarded</span>
        </div>
      </div>
    );
  }
}

class HighlightedDecorator extends CardDecorator {
  constructor(component: ICardComponent) {
    super(component, "Highlighted");
  }

  render(): React.ReactNode {
    const base = this.component.render();
    return (
      <div className="relative ring-2 ring-sky-400/70 shadow-[0_0_30px_rgba(56,189,248,0.5)] rounded-xl">
        {base}
      </div>
    );
  }
}

// 6) HELPER ฟังก์ชันสร้าง decorator chain จาก state
const buildDecoratedCard = (
  article: Article,
  activeDecorations: string[],
): ICardComponent => {
  let card: ICardComponent = new BasicCard(article);

  activeDecorations.forEach((dec) => {
    switch (dec) {
      case "Featured":
        card = new FeaturedDecorator(card);
        break;
      case "Pinned":
        card = new PinnedDecorator(card);
        break;
      case "Award":
        card = new AwardDecorator(card);
        break;
      case "Highlighted":
        card = new HighlightedDecorator(card);
        break;
      default:
        break;
    }
  });

  return card;
};

// 7) DEMO PAGE COMPONENT
const DecoratorDemoPage: React.FC = () => {
  const [decoratorsMap, setDecoratorsMap] = useState<
    Record<string, string[]>
  >({});

  const toggleDecoration = (articleId: string, type: string) => {
    setDecoratorsMap((prev) => {
      const current = prev[articleId] ?? [];
      if (current.includes(type)) {
        return {
          ...prev,
          [articleId]: current.filter((d) => d !== type),
        };
      }
      return {
        ...prev,
        [articleId]: [...current, type],
      };
    });
  };

  const allDecoratorTypes = ["Featured", "Pinned", "Award", "Highlighted"];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-5xl">
        {/* Hero / Intro */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-[11px] tracking-[0.25em] text-slate-400 mb-2 uppercase">
              DECORATOR · DYNAMIC BADGES DEMO
            </p>
            <h1 className="text-2xl font-semibold mb-1">
              Decorator Pattern — Dynamic Badges Playground
            </h1>
            <p className="text-sm text-slate-300 mb-4 max-w-2xl">
              หน้านี้ใช้ Decorator Pattern เพื่อห่อการ์ดพื้นฐานด้วย badges หลายชั้น
              เช่น Featured, Pinned, Award โดยไม่ต้องแก้โค้ดของการ์ดต้นฉบับเลย
            </p>
          </div>
        </div>

        {/* Info Panel */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs leading-relaxed">
            <h2 className="text-sm font-semibold text-white mb-2">Decorator คืออะไร?</h2>
            <p className="text-slate-200 mb-2">
              Decorator Pattern ช่วยให้เราเพิ่ม behavior/การตกแต่งให้ object เดิม
              โดยการห่อ (wrap) ด้วย object ตัวใหม่ที่มี interface เดียวกัน
              ทำให้สามารถ stack ความสามารถใหม่ ๆ ได้ทีละชั้น
            </p>
            <p className="text-slate-400">
              ในหน้านี้ <span className="font-mono">BasicCard</span> แสดงเนื้อหาหลัก
              ส่วน decorators เช่น
              <span className="font-mono">FeaturedDecorator</span>,
              <span className="font-mono">PinnedDecorator</span>,
              <span className="font-mono">AwardDecorator</span> เพิ่ม badge และ effect
              รอบนอกโดยไม่ยุ่งกับโค้ดของ BasicCard โดยตรง
            </p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-200 space-y-1">
            <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-1">
              AVAILABLE DECORATORS
            </p>
            {allDecoratorTypes.map((d) => (
              <p key={d}>
                <span className="text-slate-500">-</span> {d}
              </p>
            ))}
            <p className="text-[11px] text-slate-400 mt-2">
              คุณสามารถเพิ่ม class decorator ใหม่แล้วใส่เข้าไปใน
              <span className="font-mono">buildDecoratedCard()</span> เพื่อทดลองพฤติกรรมใหม่
            </p>
          </div>
        </div>

        {/* Cards with decorators */}
        <div className="space-y-4 mb-10">
          {SAMPLE_ARTICLES.map((article) => {
            const active = decoratorsMap[article.id] ?? [];
            const card = buildDecoratedCard(article, active);

            return (
              <div
                key={article.id}
                className="border border-white/10 rounded-2xl p-3 bg-slate-950/80 flex flex-col gap-2"
              >
                <div className="flex flex-wrap gap-2 mb-2 text-[11px]">
                  {allDecoratorTypes.map((dec) => {
                    const isActive = active.includes(dec);
                    return (
                      <button
                        key={dec}
                        onClick={() => toggleDecoration(article.id, dec)}
                        className={`px-3 py-1 rounded-full border transition-all
                          ${isActive
                            ? "bg-pink-500/90 border-pink-300 text-white shadow"
                            : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                        `}
                      >
                        {dec}
                      </button>
                    );
                  })}
                </div>

                <div>{card.render()}</div>

                <div className="mt-1 text-[10px] text-slate-400 font-mono">
                  active decorations: [
                  {(active.length ? active.join(", ") : "none").toString()}]
                </div>
              </div>
            );
          })}
        </div>

        {/* Playground hints */}
        <div className="mt-4 text-xs text-slate-400 border-t border-white/5 pt-4">
          <p className="mb-1 font-mono text-[11px] text-slate-500">PLAYGROUND HINT</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              เพิ่ม decorator ใหม่ เช่น <span className="font-mono">TrendingDecorator</span>
              หรือ <span className="font-mono">ArchivedDecorator</span> แล้วใส่เข้าไปใน
              <span className="font-mono">buildDecoratedCard()</span>
            </li>
            <li>
              เพิ่ม method ใหม่ใน <span className="font-mono">ICardComponent</span> เช่น
              <span className="font-mono">getPriority()</span> แล้วให้ decorators
              override เพื่อเพิ่ม priority
            </li>
            <li>
              ทดลองเชื่อม Decorator นี้เข้ากับ Prototype หรือ Memento
              เช่น clone การ์ดที่ถูก decorate แล้ว save snapshot ไว้
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DecoratorDemoPage;
