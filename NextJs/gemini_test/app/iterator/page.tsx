"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * ---------------------------------------------------------------------
 * ITERATOR PATTERN — CONTENT BROWSER PLAYGROUND (DEMO PAGE)
 * ---------------------------------------------------------------------
 * หน้านี้เป็นสนามทดลองสำหรับ Iterator Pattern
 *
 * แนวคิดหลัก:
 * - มี collection ของ content หลายชิ้น
 * - สร้าง iterator objects หลายแบบ (all, only articles, reverse, short-only)
 * - UI ใช้ iterator เพื่อเดินไปข้างหน้า/ย้อนกลับ/รีเซ็ต โดยไม่ต้องรู้โครงสร้างภายใน
 *
 * คุณสามารถ:
 * - เพิ่ม iterator mode ใหม่ เช่น "byTag", "random", "chunk" เป็นต้น
 * - เปลี่ยนโครงสร้างภายใน collection ได้ โดยที่ interface ของ iterator ยังเหมือนเดิม
 */

// 1) DOMAIN MODEL

type Category = "article" | "project" | "lab";

interface ContentItem {
  id: string;
  title: string;
  category: Category;
  lengthMinutes: number;
  tags: string[];
}

const CONTENT_ITEMS: ContentItem[] = [
  {
    id: "c1",
    title: "Understanding Design Patterns",
    category: "article",
    lengthMinutes: 8,
    tags: ["patterns", "overview"],
  },
  {
    id: "c2",
    title: "Portfolio Analytics Dashboard",
    category: "project",
    lengthMinutes: 25,
    tags: ["react", "nextjs", "analytics"],
  },
  {
    id: "c3",
    title: "Iterator vs. Generator",
    category: "article",
    lengthMinutes: 5,
    tags: ["iterator", "javascript"],
  },
  {
    id: "c4",
    title: "Design System Token Lab",
    category: "lab",
    lengthMinutes: 12,
    tags: ["design-system", "tokens"],
  },
  {
    id: "c5",
    title: "Command Pattern in UI",
    category: "article",
    lengthMinutes: 6,
    tags: ["command", "undo-redo"],
  },
  {
    id: "c6",
    title: "Prototype and Flyweight Experiments",
    category: "lab",
    lengthMinutes: 15,
    tags: ["prototype", "flyweight"],
  },
];

// 2) ITERATOR INTERFACE

interface IContentIterator {
  current(): ContentItem | null;
  next(): ContentItem | null;
  previous(): ContentItem | null;
  reset(): ContentItem | null;
  hasNext(): boolean;
  hasPrevious(): boolean;
  getIndex(): number;
  getCount(): number;
}

// 3) BASE ITERATOR IMPLEMENTATION (forward with optional filter)

class ForwardFilteredIterator implements IContentIterator {
  private items: ContentItem[];

  private indexes: number[];

  private index: number;

  constructor(items: ContentItem[], predicate?: (item: ContentItem) => boolean) {
    this.items = items;
    this.indexes = items
      .map((_, i) => i)
      .filter((idx) => (predicate ? predicate(items[idx]) : true));
    this.index = 0;
  }

  current(): ContentItem | null {
    if (this.indexes.length === 0) return null;
    const realIndex = this.indexes[this.index];
    return this.items[realIndex] ?? null;
  }

  next(): ContentItem | null {
    if (!this.hasNext()) return null;
    this.index += 1;
    return this.current();
  }

  previous(): ContentItem | null {
    if (!this.hasPrevious()) return null;
    this.index -= 1;
    return this.current();
  }

  reset(): ContentItem | null {
    this.index = 0;
    return this.current();
  }

  hasNext(): boolean {
    return this.index < this.indexes.length - 1;
  }

  hasPrevious(): boolean {
    return this.index > 0 && this.indexes.length > 0;
  }

  getIndex(): number {
    if (this.indexes.length === 0) return -1;
    return this.index;
  }

  getCount(): number {
    return this.indexes.length;
  }
}

// 4) REVERSE ITERATOR (เดินจากท้ายมาหาต้น)

class ReverseIterator implements IContentIterator {
  private items: ContentItem[];

  private indexes: number[];

  private index: number;

  constructor(items: ContentItem[]) {
    this.items = items;
    this.indexes = items.map((_, i) => i).reverse();
    this.index = 0;
  }

  current(): ContentItem | null {
    if (this.indexes.length === 0) return null;
    const realIndex = this.indexes[this.index];
    return this.items[realIndex] ?? null;
  }

  next(): ContentItem | null {
    if (!this.hasNext()) return null;
    this.index += 1;
    return this.current();
  }

  previous(): ContentItem | null {
    if (!this.hasPrevious()) return null;
    this.index -= 1;
    return this.current();
  }

  reset(): ContentItem | null {
    this.index = 0;
    return this.current();
  }

  hasNext(): boolean {
    return this.index < this.indexes.length - 1;
  }

  hasPrevious(): boolean {
    return this.index > 0 && this.indexes.length > 0;
  }

  getIndex(): number {
    if (this.indexes.length === 0) return -1;
    return this.index;
  }

  getCount(): number {
    return this.indexes.length;
  }
}

// 5) ITERATOR MODES & FACTORY

type IteratorMode = "all" | "articles" | "short" | "reverse";

const createIterator = (mode: IteratorMode): IContentIterator => {
  switch (mode) {
    case "articles":
      return new ForwardFilteredIterator(
        CONTENT_ITEMS,
        (item) => item.category === "article",
      );
    case "short":
      return new ForwardFilteredIterator(
        CONTENT_ITEMS,
        (item) => item.lengthMinutes <= 8,
      );
    case "reverse":
      return new ReverseIterator(CONTENT_ITEMS);
    case "all":
    default:
      return new ForwardFilteredIterator(CONTENT_ITEMS);
  }
};

// 6) DEMO PAGE

const IteratorDemoPage: React.FC = () => {
  const [mode, setMode] = useState<IteratorMode>("all");
  const iteratorRef = useRef<IContentIterator | null>(null);

  const [currentItem, setCurrentItem] = useState<ContentItem | null>(null);
  const [indexInfo, setIndexInfo] = useState<{ index: number; count: number }>(
    { index: -1, count: 0 },
  );

  // สร้าง iterator ใหม่เมื่อ mode เปลี่ยน
  useEffect(() => {
    const iterator = createIterator(mode);
    iteratorRef.current = iterator;
    const item = iterator.reset();
    setCurrentItem(item);
    setIndexInfo({ index: iterator.getIndex(), count: iterator.getCount() });
  }, [mode]);

  const updateFromIterator = () => {
    const it = iteratorRef.current;
    if (!it) return;
    setCurrentItem(it.current());
    setIndexInfo({ index: it.getIndex(), count: it.getCount() });
  };

  const handleNext = () => {
    const it = iteratorRef.current;
    if (!it) return;
    it.next();
    updateFromIterator();
  };

  const handlePrevious = () => {
    const it = iteratorRef.current;
    if (!it) return;
    it.previous();
    updateFromIterator();
  };

  const handleReset = () => {
    const it = iteratorRef.current;
    if (!it) return;
    it.reset();
    updateFromIterator();
  };

  const modeDescription = useMemo(() => {
    switch (mode) {
      case "all":
        return "เดินผ่านทุก content ตามลำดับที่เก็บไว้";
      case "articles":
        return "เดินเฉพาะ content ที่เป็นบทความ (category = article)";
      case "short":
        return "เดินเฉพาะ content ที่ใช้เวลา ≤ 8 นาที";
      case "reverse":
        return "เดินทุก content แบบย้อนลำดับ (จากท้ายมาหาต้น)";
      default:
        return "";
    }
  }, [mode]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-6xl">
        {/* Hero */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-[11px] tracking-[0.25em] text-slate-400 mb-2 uppercase">
              ITERATOR · CONTENT BROWSER DEMO
            </p>
            <h1 className="text-2xl font-semibold mb-1">
              Iterator Pattern — Content Browser Playground
            </h1>
            <p className="text-sm text-slate-300 mb-4 max-w-2xl">
              หน้านี้ใช้ Iterator Pattern เพื่อเดินดู content ทีละชิ้นผ่าน iterator
              หลายแบบ โดย UI ไม่ต้องรู้โครงสร้างภายในของ collection เลย
            </p>
          </div>
        </div>

        {/* Explanation */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs leading-relaxed">
            <h2 className="text-sm font-semibold text-white mb-2">Iterator คืออะไร?</h2>
            <p className="text-slate-200 mb-2">
              Iterator Pattern แยกการเดิน (traversal) ออกจากโครงสร้างของ collection
              ทำให้เราสามารถมี iterator หลายแบบ (forward, reverse, filtered) บน
              collection เดียวกันได้ โดยที่ client ใช้ interface เดียวกัน
            </p>
            <p className="text-slate-400">
              ในหน้านี้ เรามี <span className="font-mono">ForwardFilteredIterator</span>
              และ <span className="font-mono">ReverseIterator</span>
              ซึ่งทั้งคู่ implement
              <span className="font-mono"> IContentIterator</span>
              ทำให้ปุ่มควบคุม (Next/Previous/Reset) ใช้โค้ดเดียวกันทั้งหมด
            </p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-200 space-y-1">
            <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-1">
              MODES (ITERATOR VARIANTS)
            </p>
            <p>- all: เดินผ่านทุก content</p>
            <p>- articles: เฉพาะ category = article</p>
            <p>- short: เฉพาะ lengthMinutes ≤ 8</p>
            <p>- reverse: เดินทุก content แบบย้อนลำดับ</p>
            <p className="text-[11px] text-slate-400 mt-2">
              คุณสามารถเพิ่ม iterator ใหม่โดยสร้างคลาสใหม่ที่ implement
              <span className="font-mono"> IContentIterator</span> แล้วผูกใน
              <span className="font-mono">createIterator()</span>
            </p>
          </div>
        </div>

        {/* Controls + View */}
        <div className="grid lg:grid-cols-[260px,1fr] gap-6 mb-10">
          {/* Controls */}
          <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs space-y-4">
            <h3 className="text-sm font-semibold mb-1">Iterator controls</h3>

            {/* Mode selection */}
            <div>
              <p className="text-[11px] text-slate-400 mb-1">Iterator mode</p>
              <div className="flex flex-wrap gap-1">
                {(["all", "articles", "short", "reverse"] as IteratorMode[]).map(
                  (m) => {
                    const active = mode === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={`px-3 py-1 rounded-full border text-[11px] transition
                          ${active
                            ? "bg-teal-500/90 border-teal-300 text-black"
                            : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                        `}
                      >
                        {m}
                      </button>
                    );
                  },
                )}
              </div>
              <p className="text-[11px] text-slate-300 mt-1">{modeDescription}</p>
            </div>

            {/* Navigation buttons */}
            <div className="border-t border-white/5 pt-3 space-y-2">
              <p className="text-[11px] text-slate-400 mb-1">Navigation</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={!iteratorRef.current?.hasPrevious()}
                  className="px-3 py-1 rounded-full border border-slate-400/80 text-[11px] font-semibold disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!iteratorRef.current?.hasNext()}
                  className="px-3 py-1 rounded-full border border-emerald-400/80 text-[11px] font-semibold disabled:opacity-40"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1 rounded-full border border-sky-400/80 text-[11px] font-semibold"
                >
                  Reset
                </button>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                index: {indexInfo.index >= 0 ? indexInfo.index + 1 : "-"} /{
                  " "
                }
                {indexInfo.count}
              </p>
            </div>
          </div>

          {/* Current item + list overview */}
          <div className="space-y-4">
            {/* Current item */}
            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs">
              <p className="text-[11px] text-slate-400 mb-1">Current item</p>
              {!currentItem && (
                <p className="text-slate-500 text-[11px]">
                  ไม่มี item สำหรับ mode นี้ — อาจเพราะ filter แล้วไม่เหลือเลย
                </p>
              )}
              {currentItem && (
                <div className="border border-slate-700 rounded-xl p-3 bg-slate-950/70 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold text-slate-100">
                      {currentItem.title}
                    </h2>
                    <span
                      className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-600 text-[10px] font-mono"
                    >
                      {currentItem.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-300">
                    <span>Length: {currentItem.lengthMinutes} min</span>
                    <span>ID: {currentItem.id}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentItem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-600 text-[10px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Full collection preview */}
                      <div className="bg-black/50 border border-white/10 rounded-2xl p-4 text-[11px] font-mono max-h-65 overflow-auto">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400">Underlying collection (ไม่เปลี่ยน)</p>
                <span className="text-slate-500">{CONTENT_ITEMS.length} items</span>
              </div>
              <ul className="space-y-1">
                {CONTENT_ITEMS.map((item, idx) => {
                  const isCurrent = currentItem?.id === item.id;
                  return (
                    <li
                      key={item.id}
                      className={`flex items-center gap-2 px-2 py-1 rounded
                        ${isCurrent ? "bg-teal-500/20 border border-teal-400/60" : ""}
                      `}
                    >
                      <span className="text-slate-500 w-6">#{idx + 1}</span>
                      <span className="text-slate-100 flex-1 truncate">
                        {item.title}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        {item.category} · {item.lengthMinutes}m
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Playground hints */}
        <div className="mt-4 text-xs text-slate-400 border-t border-white/5 pt-4">
          <p className="mb-1 font-mono text-[11px] text-slate-500">PLAYGROUND HINT</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              เพิ่ม iterator ใหม่ เช่น <span className="font-mono">TagIterator</span>
              ที่เดินเฉพาะ item ที่มี tag บางตัว แล้วผูกใน
              <span className="font-mono">createIterator()</span>
            </li>
            <li>
              ทดลองทำ iterator แบบ random (สุ่ม item ถัดไป)
              โดยยังคง interface <span className="font-mono">IContentIterator</span> เดิม
            </li>
            <li>
              ใช้ Iterator Pattern นี้ร่วมกับ Composite/Visitor
              เพื่อเดิน tree หรือ structure ที่ซับซ้อนกว่า array ธรรมดา
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IteratorDemoPage;
