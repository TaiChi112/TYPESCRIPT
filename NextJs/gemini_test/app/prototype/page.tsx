"use client";

import React, { useState } from "react";

/**
 * ---------------------------------------------------------------------
 * PROTOTYPE PATTERN — CLONING PLAYGROUND (DEMO PAGE)
 * ---------------------------------------------------------------------
 * หน้านี้เป็นสนามทดลองสำหรับ Prototype Pattern โดยเฉพาะ
 *
 * แนวคิดหลัก:
 * - มี object ต้นแบบ (prototype) ที่สามารถ clone ตัวเองได้ผ่าน method clone()
 * - เวลา clone สามารถปรับ logic ได้ เช่น เปลี่ยน id, เติมคำว่า (Copy), deep copy array ฯลฯ
 *
 * คุณสามารถ:
 * - ลองเพิ่ม field ใหม่ใน PrototypeItem แล้วดูผลตอน clone
 * - ลองเปลี่ยนจาก shallow copy → deep copy ของ field ต่าง ๆ
 * - ทดลองเขียน clone หลายแบบ (เช่น safeClone, cloneWithNewTags, ฯลฯ)
 */

// 1) PROTOTYPE INTERFACE
interface Prototype<T> {
  clone(): T;
}

// 2) DOMAIN MODEL + PROTOTYPE IMPLEMENTATION
class PrototypeItem implements Prototype<PrototypeItem> {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public tags: string[],
    public metadata: { importance: "low" | "medium" | "high"; color: string }
  ) {}

  // Logic การ clone ปัจจุบัน: new id + เติม (Copy) + deep copy array/object
  clone(): PrototypeItem {
    const newId = Math.random().toString(36).slice(2, 9);

    // กรณีนี้เราเลือก deep copy ทั้ง tags และ metadata เพื่อไม่ให้ reference ร่วมกัน
    const clonedTags = [...this.tags];
    const clonedMetadata = { ...this.metadata };

    return new PrototypeItem(
      newId,
      `${this.title} (Copy)`,
      this.description,
      clonedTags,
      clonedMetadata
    );
  }
}

// 3) SAMPLE DATA (PROTOTYPES เริ่มต้น)
const initialPrototypes: PrototypeItem[] = [
  new PrototypeItem(
    "p1",
    "Design Pattern Cheatsheet",
    "A compact reference of GoF patterns with real-world examples.",
    ["design", "patterns", "reference"],
    { importance: "high", color: "indigo" }
  ),
  new PrototypeItem(
    "p2",
    "Portfolio Card",
    "A base card component that can be cloned and customized.",
    ["ui", "react", "component"],
    { importance: "medium", color: "emerald" }
  ),
];

// 4) SMALL PRESENTATION HELPERS
const tagColorMap: Record<string, string> = {
  design: "bg-pink-500/20 text-pink-200 border-pink-400/50",
  patterns: "bg-purple-500/20 text-purple-200 border-purple-400/50",
  reference: "bg-amber-500/20 text-amber-100 border-amber-400/50",
  ui: "bg-sky-500/20 text-sky-100 border-sky-400/50",
  react: "bg-cyan-500/20 text-cyan-100 border-cyan-400/50",
  component: "bg-emerald-500/20 text-emerald-100 border-emerald-400/50",
};

const getTagClass = (tag: string) =>
  tagColorMap[tag] ?? "bg-slate-500/20 text-slate-100 border-slate-400/50";

// 5) DEMO PAGE COMPONENT
const PrototypeDemoPage: React.FC = () => {
  const [items, setItems] = useState<PrototypeItem[]>(initialPrototypes);

  const handleClone = (item: PrototypeItem) => {
    const cloned = item.clone();
    setItems((prev) => [cloned, ...prev]);
  };

  const handleMutateOriginalTags = (item: PrototypeItem) => {
    // ตัวอย่างให้เห็นผลของ shared reference (หากคุณเปลี่ยนไปใช้ shallow copy)
    item.tags.push("mutated");
    setItems((prev) => [...prev]);
  };

  const handleMutateClonedMetadata = (item: PrototypeItem) => {
    // ตัวอย่าง: เปลี่ยน importance ของ clone แล้วดูว่า original กระทบไหม
    item.metadata.importance = item.metadata.importance === "high" ? "low" : "high";
    setItems((prev) => [...prev]);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Hero / Intro */}
        <div className="bg-linear-to-r from-indigo-900 via-slate-900 to-slate-900 border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-[11px] tracking-[0.25em] text-slate-400 mb-2 uppercase">
              PROTOTYPE · CLONING DEMO
            </p>
            <h1 className="text-2xl font-semibold mb-1">Prototype Pattern — Cloning Playground</h1>
            <p className="text-sm text-slate-300 mb-4 max-w-xl">
              หน้านี้สาธิตการ clone object โดยใช้ Prototype Pattern — คุณสามารถลองเพิ่ม field
              ใหม่ ปรับ logic ของ <span className="font-mono">clone()</span> และดูว่า original
              กับ clone มีพฤติกรรมต่างกันอย่างไร
            </p>
          </div>
        </div>

        {/* Info Panel */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs leading-relaxed">
            <h2 className="text-sm font-semibold text-white mb-2">Prototype คืออะไร?</h2>
            <p className="text-slate-200 mb-2">
              Prototype Pattern เน้นที่การสร้าง object ใหม่จาก object เดิมผ่านการ clone
              แทนที่จะ new จาก constructor ตรง ๆ เหมาะเมื่อ object มีการ config/ตั้งค่าเยอะ
              หรือสร้างยาก แต่อยากได้สำเนาที่คล้ายกันหลาย ๆ อัน
            </p>
            <p className="text-slate-400">
              ลองเพิ่ม field ใหม่ใน <span className="font-mono">PrototypeItem</span> เช่น
              <span className="font-mono">createdAt</span>, <span className="font-mono">owner</span>,
              หรือ nested object ซับซ้อน แล้วปรับวิธี clone ให้รองรับ deep/shallow copy
            </p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-200 space-y-1">
            <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-1">
              CURRENT IMPLEMENTATION
            </p>
            <p>
              <span className="text-slate-500">class:</span> PrototypeItem
            </p>
            <p>
              <span className="text-slate-500">clone strategy:</span> deep copy tags & metadata,
              new id, add `(Copy)` to title
            </p>
            <p className="text-slate-400 mt-1">
              คุณสามารถแก้ logic การ clone ได้โดยตรงใน method <span className="font-mono">clone()</span>
              ด้านบน แล้วกดปุ่ม Clone ใหม่เพื่อดูผลลัพธ์
            </p>
          </div>
        </div>

        {/* List of items and clone actions */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="border border-white/10 bg-slate-900/60 rounded-2xl p-4 flex flex-col gap-2 text-sm"
            >
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="text-[11px] text-slate-500 mb-1 font-mono">
                    id: <span className="text-slate-300">{item.id}</span>
                  </p>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] border font-mono uppercase tracking-[0.12em]
                    ${
                      item.metadata.importance === "high"
                        ? "border-rose-400 text-rose-200 bg-rose-500/20"
                        : item.metadata.importance === "medium"
                        ? "border-amber-400 text-amber-100 bg-amber-500/20"
                        : "border-slate-400 text-slate-200 bg-slate-500/20"
                    }
                  `}
                >
                  {item.metadata.importance}
                </span>
              </div>

              <p className="text-xs text-slate-200 mt-1">{item.description}</p>

              <div className="flex flex-wrap items-center gap-1 mt-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag + item.id}
                    className={`px-2 py-0.5 text-[11px] border rounded-full font-mono ${getTagClass(
                      tag,
                    )}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
                <button
                  onClick={() => handleClone(item)}
                  className="px-3 py-1 rounded-full bg-indigo-500/90 hover:bg-indigo-400 text-white font-mono border border-indigo-300 shadow-sm transition-all"
                >
                  Clone this item
                </button>

                <button
                  onClick={() => handleMutateClonedMetadata(item)}
                  className="px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/30 text-amber-100 font-mono border border-amber-400/60 transition-all"
                >
                  Toggle importance (mutate metadata)
                </button>

                <button
                  onClick={() => handleMutateOriginalTags(item)}
                  className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-100 font-mono border border-slate-500/70 transition-all"
                >
                  Mutate tags array (push `mutated`)
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Playground hints */}
        <div className="mt-10 text-xs text-slate-400 border-t border-white/5 pt-4">
          <p className="mb-1 font-mono text-[11px] text-slate-500">PLAYGROUND HINT</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              เพิ่ม field ใหม่ใน <span className="font-mono">PrototypeItem</span> เช่น
              <span className="font-mono">createdAt</span>, <span className="font-mono">owner</span> หรือ
              nested object แล้วกำหนดว่าจะ clone แบบ shallow หรือ deep
            </li>
            <li>
              ทดลองแยก method clone หลายแบบ เช่น
              <span className="font-mono">cloneShallow()</span>, <span className="font-mono">cloneDeep()</span>
              และเปรียบเทียบผลเวลามีการ mutate
            </li>
            <li>
              เชื่อม logic prototype นี้กับ pattern อื่น เช่น Decorator หรือ Memento
              เพื่อจำลองการ clone + decorate + save snapshot
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PrototypeDemoPage;
