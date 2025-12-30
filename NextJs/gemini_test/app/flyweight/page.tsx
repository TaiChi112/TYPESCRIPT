"use client";

import React, { useMemo, useState } from "react";

/**
 * ---------------------------------------------------------------------
 * FLYWEIGHT PATTERN — TAG STYLE SHARING PLAYGROUND (DEMO PAGE)
 * ---------------------------------------------------------------------
 * หน้านี้เป็นสนามทดลองสำหรับ Flyweight Pattern
 *
 * แนวคิดหลัก:
 * - มี "tag" จำนวนมากที่แสดงบนการ์ดหลายใบ (logical instances เยอะมาก)
 * - แต่ style ของ tag มีรูปแบบซ้ำ ๆ กัน เช่น primary, secondary, warning, info
 * - Flyweight จะเก็บข้อมูล style ที่ซ้ำกัน (intrinsic state) ไว้เพียงชุดเดียว แล้วแชร์ให้ทุก tag ที่ใช้รูปแบบนั้น
 * - Extrinsic state (เช่น ข้อความ tag, id) ยังคงแยกของใครของมัน
 *
 * คุณสามารถ:
 * - เปลี่ยนจำนวนการ์ด / จำนวน tag ต่อการ์ด แล้วดูว่ายังมี flyweight instance เท่าเดิม
 * - เพิ่มชนิด style ใหม่ใน factory แล้วลอง map tag ไปใช้ style นั้น
 * - ลองเก็บข้อมูล style ให้หนักขึ้น (เช่น gradients, animation config, icons) เพื่อเห็นประโยชน์ชัดขึ้น
 */

// 1) DOMAIN MODEL
interface ProjectCardData {
  id: string;
  title: string;
  complexity: "low" | "medium" | "high";
  tagKeys: string[]; // logical tag identifiers
}

// ตัวอย่าง projects แบบ static
const BASE_PROJECTS: ProjectCardData[] = [
  {
    id: "p1",
    title: "Design System Playground",
    complexity: "high",
    tagKeys: ["design", "tokens", "ui"],
  },
  {
    id: "p2",
    title: "Analytics Dashboard",
    complexity: "medium",
    tagKeys: ["analytics", "dashboard", "react"],
  },
  {
    id: "p3",
    title: "Pattern Library",
    complexity: "medium",
    tagKeys: ["patterns", "typescript", "docs"],
  },
];

// 2) FLYWEIGHT: Tag Style (Intrinsic State)
interface TagStyleProps {
  background: string;
  border: string;
  textColor: string;
  glow?: string;
}

class TagStyleFlyweight {
  // intrinsic state ที่แชร์กันทุกที่
  private readonly style: TagStyleProps;

  constructor(style: TagStyleProps) {
    this.style = style;
  }

  renderTag(label: string): React.ReactNode {
    return (
      <span
        className={`px-2 py-0.5 rounded-full border text-[10px] font-mono inline-flex items-center gap-1 ${this.style.background} ${this.style.border} ${this.style.textColor} ${this.style.glow ?? ""}`}
      >
        {label}
      </span>
    );
  }
}

// 3) FLYWEIGHT FACTORY
class TagStyleFactory {
  private cache: Map<string, TagStyleFlyweight> = new Map();

  constructor() {
    // optional: preload some styles
  }

  getStyle(kind: string): TagStyleFlyweight {
    if (!this.cache.has(kind)) {
      const style = this.createStyle(kind);
      this.cache.set(kind, new TagStyleFlyweight(style));
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.cache.get(kind)!;
  }

  // ใช้สำหรับ debug / UI แสดงจำนวน flyweight
  getFlyweightCount(): number {
    return this.cache.size;
  }

  getRegisteredKinds(): string[] {
    return Array.from(this.cache.keys()).sort();
  }

  private createStyle(kind: string): TagStyleProps {
    switch (kind) {
      case "design":
        return {
          background: "bg-pink-900/60",
          border: "border-pink-400/80",
          textColor: "text-pink-100",
          glow: "shadow-[0_0_14px_rgba(244,114,182,0.5)]",
        };
      case "tokens":
        return {
          background: "bg-amber-900/60",
          border: "border-amber-400/80",
          textColor: "text-amber-100",
          glow: "shadow-[0_0_14px_rgba(251,191,36,0.5)]",
        };
      case "ui":
        return {
          background: "bg-sky-900/60",
          border: "border-sky-400/80",
          textColor: "text-sky-100",
        };
      case "analytics":
        return {
          background: "bg-emerald-900/60",
          border: "border-emerald-400/80",
          textColor: "text-emerald-100",
        };
      case "dashboard":
        return {
          background: "bg-slate-900/80",
          border: "border-slate-500/80",
          textColor: "text-slate-100",
        };
      case "react":
        return {
          background: "bg-cyan-900/60",
          border: "border-cyan-400/80",
          textColor: "text-cyan-100",
        };
      case "patterns":
        return {
          background: "bg-violet-900/60",
          border: "border-violet-400/80",
          textColor: "text-violet-100",
        };
      case "typescript":
        return {
          background: "bg-blue-900/60",
          border: "border-blue-400/80",
          textColor: "text-blue-100",
        };
      case "docs":
        return {
          background: "bg-zinc-900/80",
          border: "border-zinc-500/80",
          textColor: "text-zinc-100",
        };
      default:
        return {
          background: "bg-slate-900/70",
          border: "border-slate-500/80",
          textColor: "text-slate-100",
        };
    }
  }
}

// 4) HELPER: สร้าง data จำนวนมากเพื่อเห็น effect
const generateCards = (
  base: ProjectCardData[],
  repeat: number,
): ProjectCardData[] => {
  const result: ProjectCardData[] = [];
  for (let i = 0; i < repeat; i += 1) {
    for (const b of base) {
      result.push({
        ...b,
        id: `${b.id}-${i}`,
      });
    }
  }
  return result;
};

// 5) DEMO PAGE
const FlyweightDemoPage: React.FC = () => {
  const [repeatCount, setRepeatCount] = useState(5); // คูณจำนวนการ์ด
  const [extraTagsPerCard, setExtraTagsPerCard] = useState(0); // เพิ่ม logical tags ต่อการ์ด

  const tagFactory = useMemo(() => new TagStyleFactory(), []);

  const cards = useMemo(
    () => generateCards(BASE_PROJECTS, repeatCount),
    [repeatCount],
  );

  // นับ logical tag instances
  const logicalTagCount = useMemo(() => {
    let count = 0;
    cards.forEach((c) => {
      count += c.tagKeys.length + extraTagsPerCard;
    });
    return count;
  }, [cards, extraTagsPerCard]);

  const handleRepeatChange = (value: string) => {
    const n = parseInt(value, 10);
    if (!Number.isNaN(n) && n > 0 && n <= 40) {
      setRepeatCount(n);
    }
  };

  const handleExtraTagsChange = (value: string) => {
    const n = parseInt(value, 10);
    if (!Number.isNaN(n) && n >= 0 && n <= 10) {
      setExtraTagsPerCard(n);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-6xl">
        {/* Hero */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-[11px] tracking-[0.25em] text-slate-400 mb-2 uppercase">
              FLYWEIGHT · TAG STYLE SHARING DEMO
            </p>
            <h1 className="text-2xl font-semibold mb-1">
              Flyweight Pattern — Tag Style Sharing Playground
            </h1>
            <p className="text-sm text-slate-300 mb-4 max-w-2xl">
              หน้านี้สาธิตการแชร์ style object ของ tag ระหว่างการ์ดจำนวนมาก
              โดยใช้ Flyweight Pattern เพื่อลดจำนวน instance ที่ต้องสร้างจริง ๆ
            </p>
          </div>
        </div>

        {/* Explanation */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs leading-relaxed">
            <h2 className="text-sm font-semibold text-white mb-2">Flyweight คืออะไร?</h2>
            <p className="text-slate-200 mb-2">
              Flyweight Pattern ใช้สำหรับแชร์ state ที่ซ้ำ ๆ กัน (intrinsic state)
              ระหว่าง object จำนวนมากเพื่อลด memory และ cost ในการสร้าง object
            </p>
            <p className="text-slate-400">
              ในหน้านี้ style ของ tag (สี, border, glow) จะถูกเก็บใน
              <span className="font-mono">TagStyleFlyweight</span> เพียงชุดเดียวต่อ kind
              เช่น `design`, `tokens` แล้วทุก tag ที่ใช้ kind นั้นจะเรียกผ่าน instance
              เดียวกันแทนที่จะสร้าง style object ใหม่ทุกครั้ง
            </p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-200 space-y-1">
            <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-1">
              INTRINSIC VS EXTRINSIC STATE
            </p>
            <p>- Intrinsic: background, border, textColor, glow (อยู่ใน TagStyleFlyweight)</p>
            <p>- Extrinsic: label ของ tag, id ของการ์ด, complexity (อยู่นอก flyweight)</p>
            <p className="text-[11px] text-slate-400 mt-2">
              คุณสามารถเพิ่ม property style หนัก ๆ เช่น gradients, animation config,
              icon SVG ฯลฯ ลงใน flyweight เพื่อเห็นประโยชน์ชัดยิ่งขึ้น
            </p>
          </div>
        </div>

        {/* Controls + Stats */}
        <div className="grid lg:grid-cols-[260px,1fr] gap-6 mb-10">
          {/* Controls */}
          <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs space-y-4">
            <h3 className="text-sm font-semibold mb-1">Controls</h3>

            <div>
              <p className="text-[11px] text-slate-400 mb-1">
                จำนวนรอบที่คูณชุดการ์ด (base projects)
              </p>
              <input
                type="range"
                min={1}
                max={40}
                value={repeatCount}
                onChange={(e) => handleRepeatChange(e.target.value)}
                className="w-full"
              />
              <p className="text-[11px] text-slate-300 mt-1">
                repeatCount: <span className="font-semibold">{repeatCount}</span>
              </p>
            </div>

            <div>
              <p className="text-[11px] text-slate-400 mb-1">
                จำนวน tag เสริมต่อการ์ด (logical เท่านั้น ใช้ style default)
              </p>
              <input
                type="range"
                min={0}
                max={10}
                value={extraTagsPerCard}
                onChange={(e) => handleExtraTagsChange(e.target.value)}
                className="w-full"
              />
              <p className="text-[11px] text-slate-300 mt-1">
                extraTagsPerCard: <span className="font-semibold">{extraTagsPerCard}</span>
              </p>
            </div>

            <div className="border-t border-white/5 pt-3 text-[11px] space-y-1">
              <p className="text-slate-400">Logical tag instances</p>
              <p className="text-lg font-semibold">{logicalTagCount}</p>
              <p className="text-slate-400 mt-2">Flyweight instances (style objects)</p>
              <p className="text-lg font-semibold">{tagFactory.getFlyweightCount()}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                สังเกตว่าแม้ logical tags จะเพิ่มขึ้นเยอะ แต่จำนวน flyweight
                (style object) จะคงเดิมตามชนิดของ style ที่มีอยู่
              </p>
            </div>
          </div>

          {/* Cards preview */}
                  <div className="space-y-3 max-h-110 overflow-auto">
            {cards.map((card) => (
              <div
                key={card.id}
                className="border border-white/10 rounded-2xl px-3 py-2 bg-slate-950/80 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[13px] font-semibold text-slate-100">
                    {card.title}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono border
                      ${
                        card.complexity === "high"
                          ? "bg-red-900/60 border-red-500/80 text-red-100"
                          : card.complexity === "medium"
                          ? "bg-amber-900/60 border-amber-500/80 text-amber-100"
                          : "bg-emerald-900/60 border-emerald-500/80 text-emerald-100"
                      }
                    `}
                  >
                    {card.complexity}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mt-1">
                  {/* base tags */}
                  {card.tagKeys.map((key) => {
                    const fly = tagFactory.getStyle(key);
                    return <React.Fragment key={key}>{fly.renderTag(key)}</React.Fragment>;
                  })}

                  {/* extra logical tags ใช้ style default */}
                  {Array.from({ length: extraTagsPerCard }).map((_, idx) => {
                    const label = `extra-${idx + 1}`;
                    const fly = tagFactory.getStyle("default");
                    return <React.Fragment key={label}>{fly.renderTag(label)}</React.Fragment>;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Playground hints */}
        <div className="mt-4 text-xs text-slate-400 border-t border-white/5 pt-4">
          <p className="mb-1 font-mono text-[11px] text-slate-500">PLAYGROUND HINT</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              เพิ่ม kind ใหม่ใน <span className="font-mono">TagStyleFactory.createStyle()</span>
              เช่น `error`, `success` แล้ว map tagKeys บางตัวไปใช้ style ใหม่
            </li>
            <li>
              เพิ่ม property หนัก ๆ เช่น gradients, icon JSX, animation config
              ลงใน <span className="font-mono">TagStyleProps</span>
              เพื่อจำลองเคสที่ได้ประโยชน์จาก Flyweight มาก
            </li>
            <li>
              ลองเก็บ <span className="font-mono">TagStyleFactory</span> ไว้ใน Singleton
              แล้วใช้ร่วมกับหน้าอื่น เพื่อแชร์ flyweight ทั่วทั้งแอป
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FlyweightDemoPage;
