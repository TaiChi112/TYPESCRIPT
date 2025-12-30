"use client";

import React, { useMemo, useState } from "react";

/**
 * ---------------------------------------------------------------------
 * FACADE PATTERN — PORTFOLIO INSIGHTS PLAYGROUND (DEMO PAGE)
 * ---------------------------------------------------------------------
 * หน้านี้เป็นสนามทดลองสำหรับ Facade Pattern โดยเฉพาะ
 *
 * แนวคิดหลัก:
 * - มี subsystem หลายตัวที่ทำงานย่อย เช่น โหลดข้อมูล, filter, คำนวณสถิติ, export
 * - Facade จะเป็น class เดียวที่ห่อการเรียก subsystem เหล่านั้นให้เรียบง่าย
 * - UI ฝั่ง React เรียกใช้ผ่าน Facade เพียงตัวเดียว ไม่ต้องรู้รายละเอียดภายใน
 *
 * คุณสามารถ:
 * - เพิ่ม subsystem ใหม่ (เช่น RecommendationService, TagCloudService)
 * - เพิ่ม method ใหม่ใน Facade (เช่น getRecommendedItems, getTimeline)
 * - เปลี่ยน implementation ภายในได้โดยไม่กระทบ UI ที่เรียกใช้ Facade
 */

// 1) DOMAIN MODEL
interface PortfolioItem {
  id: string;
  title: string;
  category: "article" | "project" | "lab";
  tags: string[];
  year: number;
  impactScore: number; // 1-100
}

const SAMPLE_ITEMS: PortfolioItem[] = [
  {
    id: "p1",
    title: "Design Pattern Deep Dive",
    category: "article",
    tags: ["design", "patterns", "architecture"],
    year: 2023,
    impactScore: 82,
  },
  {
    id: "p2",
    title: "Portfolio Analytics Dashboard",
    category: "project",
    tags: ["react", "nextjs", "analytics"],
    year: 2024,
    impactScore: 93,
  },
  {
    id: "p3",
    title: "TypeScript Utility Library",
    category: "project",
    tags: ["typescript", "library"],
    year: 2022,
    impactScore: 76,
  },
  {
    id: "p4",
    title: "Experiment: Design System Tokens",
    category: "lab",
    tags: ["design-system", "tokens", "experiment"],
    year: 2024,
    impactScore: 67,
  },
  {
    id: "p5",
    title: "Observer vs. Pub/Sub",
    category: "article",
    tags: ["observer", "events", "patterns"],
    year: 2021,
    impactScore: 59,
  },
];

// 2) SUBSYSTEMS (อย่างง่าย)

// 2.1 Loader / Repository
class PortfolioRepository {
  private items: PortfolioItem[];

  constructor(seed: PortfolioItem[]) {
    this.items = seed;
  }

  getAll(): PortfolioItem[] {
    return [...this.items];
  }
}

// 2.2 Filter Service
class PortfolioFilterService {
  filterByTag(items: PortfolioItem[], tag: string | null): PortfolioItem[] {
    if (!tag) return items;
    return items.filter((item) => item.tags.includes(tag));
  }

  filterByCategory(
    items: PortfolioItem[],
    category: PortfolioItem["category"] | "all",
  ): PortfolioItem[] {
    if (category === "all") return items;
    return items.filter((item) => item.category === category);
  }

  filterByYearRange(
    items: PortfolioItem[],
    from?: number,
    to?: number,
  ): PortfolioItem[] {
    return items.filter((item) => {
      if (from !== undefined && item.year < from) return false;
      if (to !== undefined && item.year > to) return false;
      return true;
    });
  }
}

// 2.3 Stats Service
interface PortfolioStatsSummary {
  total: number;
  avgImpact: number;
  byCategory: Record<string, number>;
  topTags: { tag: string; count: number }[];
}

class PortfolioStatsService {
  computeSummary(items: PortfolioItem[]): PortfolioStatsSummary {
    const total = items.length;
    const avgImpact =
      total === 0
        ? 0
        : Math.round(
            (items.reduce((sum, i) => sum + i.impactScore, 0) / total) * 10,
          ) / 10;

    const byCategory: Record<string, number> = {};
    const tagCount: Record<string, number> = {};

    for (const item of items) {
      byCategory[item.category] = (byCategory[item.category] ?? 0) + 1;
      for (const tag of item.tags) {
        tagCount[tag] = (tagCount[tag] ?? 0) + 1;
      }
    }

    const topTags = Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { total, avgImpact, byCategory, topTags };
  }
}

// 2.4 Export Service
class PortfolioExportService {
  toJSON(items: PortfolioItem[]): string {
    return JSON.stringify(items, null, 2);
  }
}

// 3) FACADE
class PortfolioInsightsFacade {
  private repo: PortfolioRepository;
  private filterService: PortfolioFilterService;
  private statsService: PortfolioStatsService;
  private exportService: PortfolioExportService;

  constructor(seed: PortfolioItem[]) {
    this.repo = new PortfolioRepository(seed);
    this.filterService = new PortfolioFilterService();
    this.statsService = new PortfolioStatsService();
    this.exportService = new PortfolioExportService();
  }

  /**
   * ฟังก์ชันระดับสูงให้ UI ใช้งานง่าย ๆ ตัวเดียว แทนที่จะเรียก subsystem เองทีละตัว
   */
  getInsights(options: {
    tag: string | null;
    category: PortfolioItem["category"] | "all";
    fromYear?: number;
    toYear?: number;
  }): {
    filteredItems: PortfolioItem[];
    stats: PortfolioStatsSummary;
  } {
    const all = this.repo.getAll();
    let filtered = this.filterService.filterByTag(all, options.tag);
    filtered = this.filterService.filterByCategory(filtered, options.category);
    filtered = this.filterService.filterByYearRange(
      filtered,
      options.fromYear,
      options.toYear,
    );

    const stats = this.statsService.computeSummary(filtered);
    return { filteredItems: filtered, stats };
  }

  exportCurrentSelection(items: PortfolioItem[]): string {
    return this.exportService.toJSON(items);
  }
}

// 4) DEMO PAGE
const FacadeDemoPage: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [category, setCategory] = useState<PortfolioItem["category"] | "all">
    ("all");
  const [fromYear, setFromYear] = useState<number | undefined>(undefined);
  const [toYear, setToYear] = useState<number | undefined>(undefined);
  const [showExport, setShowExport] = useState(false);

  const facade = useMemo(() => new PortfolioInsightsFacade(SAMPLE_ITEMS), []);

  const { filteredItems, stats } = useMemo(
    () =>
      facade.getInsights({
        tag: selectedTag,
        category,
        fromYear,
        toYear,
      }),
    [facade, selectedTag, category, fromYear, toYear],
  );

  const allTags = useMemo(() => {
    const set = new Set<string>();
    SAMPLE_ITEMS.forEach((i) => i.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, []);

  const exportJson = useMemo(
    () => (showExport ? facade.exportCurrentSelection(filteredItems) : ""),
    [facade, filteredItems, showExport],
  );

  const parseYear = (value: string): number | undefined => {
    const n = parseInt(value, 10);
    return Number.isNaN(n) ? undefined : n;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-6xl">
        {/* Hero / Intro */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-[11px] tracking-[0.25em] text-slate-400 mb-2 uppercase">
              FACADE · PORTFOLIO INSIGHTS DEMO
            </p>
            <h1 className="text-2xl font-semibold mb-1">
              Facade Pattern — Portfolio Insights Playground
            </h1>
            <p className="text-sm text-slate-300 mb-4 max-w-2xl">
              หน้านี้ใช้ Facade Pattern เพื่อซ่อนความซับซ้อนของการ filter, คำนวณสถิติ
              และ export ข้อมูลพอร์ตโฟลิโอ ไว้หลังคลาสเดียวที่เรียกว่า
              <span className="font-mono"> PortfolioInsightsFacade</span> ทำให้ฝั่ง UI
              เรียกใช้งานได้ง่ายมาก
            </p>
          </div>
        </div>

        {/* Explanation Panel */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs leading-relaxed">
            <h2 className="text-sm font-semibold text-white mb-2">Facade คืออะไร?</h2>
            <p className="text-slate-200 mb-2">
              Facade Pattern ให้ interface ง่าย ๆ ตัวเดียวในการเข้าถึง subsystem
              หลายตัวที่อยู่ข้างใน ทำให้โค้ดที่เรียกใช้งานอ่านง่ายและ decouple
              จากรายละเอียด implementation ภายใน
            </p>
            <p className="text-slate-400">
              ในหน้านี้ UI จะไม่เรียกใช้
              <span className="font-mono">PortfolioFilterService</span> หรือ
              <span className="font-mono">PortfolioStatsService</span> โดยตรง แต่ใช้
              <span className="font-mono">PortfolioInsightsFacade.getInsights()</span>
              เพียง method เดียวในการได้ทั้งรายการที่ filter แล้ว และสรุปสถิติพร้อมกัน
            </p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-200 space-y-1">
            <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-1">
              SUBSYSTEMS BEHIND THE FACADE
            </p>
            <p>- PortfolioRepository — เก็บ/โหลดข้อมูลทั้งหมด</p>
            <p>- PortfolioFilterService — filter ตาม tag, category, year</p>
            <p>- PortfolioStatsService — คำนวณจำนวน, impact เฉลี่ย, top tags</p>
            <p>- PortfolioExportService — แปลง selection ปัจจุบันเป็น JSON</p>
            <p className="text-[11px] text-slate-400 mt-2">
              คุณสามารถเพิ่ม subsystem ใหม่แล้วเชื่อมเข้ากับ Facade ได้โดยไม่ต้องแก้โค้ด UI เลย
            </p>
          </div>
        </div>

        {/* Controls + Results */}
        <div className="grid lg:grid-cols-[260px,1fr] gap-6 mb-10">
          {/* Controls */}
          <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs space-y-4">
            <h3 className="text-sm font-semibold mb-1">Filters (ผ่าน Facade)</h3>

            {/* Tag Filter */}
            <div>
              <p className="text-[11px] text-slate-400 mb-1">Tag</p>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-3 py-1 rounded-full border text-[11px] transition
                    ${selectedTag === null
                      ? "bg-sky-500/90 border-sky-300 text-white"
                      : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                  `}
                >
                  All
                </button>
                {allTags.map((tag) => {
                  const active = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(active ? null : tag)}
                      className={`px-3 py-1 rounded-full border text-[11px] transition
                        ${active
                          ? "bg-sky-500/90 border-sky-300 text-white"
                          : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                      `}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <p className="text-[11px] text-slate-400 mb-1">Category</p>
              <div className="flex flex-wrap gap-1">
                {["all", "article", "project", "lab"].map((cat) => {
                  const active = category === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() =>
                        setCategory(cat as PortfolioItem["category"] | "all")
                      }
                      className={`px-3 py-1 rounded-full border text-[11px] transition
                        ${active
                          ? "bg-emerald-500/90 border-emerald-300 text-white"
                          : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                      `}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Year Range */}
            <div>
              <p className="text-[11px] text-slate-400 mb-1">Year range</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="from"
                  className="w-20 bg-slate-900/80 border border-white/20 rounded px-2 py-1 text-[11px]"
                  onChange={(e) => setFromYear(parseYear(e.target.value))}
                />
                <span className="text-slate-500">–</span>
                <input
                  type="number"
                  placeholder="to"
                  className="w-20 bg-slate-900/80 border border-white/20 rounded px-2 py-1 text-[11px]"
                  onChange={(e) => setToYear(parseYear(e.target.value))}
                />
              </div>
            </div>

            {/* Export toggle */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">
                Export current selection as JSON
              </span>
              <button
                onClick={() => setShowExport((v) => !v)}
                className={`px-3 py-1 rounded-full border text-[11px] transition
                  ${showExport
                    ? "bg-violet-500/90 border-violet-300 text-white"
                    : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                `}
              >
                {showExport ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs flex flex-wrap gap-6">
              <div>
                <p className="text-[11px] text-slate-400 mb-1">Total items</p>
                <p className="text-lg font-semibold">{stats.total}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 mb-1">Average impact</p>
                <p className="text-lg font-semibold">{stats.avgImpact}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 mb-1">By category</p>
                <div className="flex gap-3">
                  {Object.entries(stats.byCategory).map(([cat, count]) => (
                    <span key={cat} className="text-slate-200">
                      {cat}: <span className="font-semibold">{count}</span>
                    </span>
                  ))}
                  {Object.keys(stats.byCategory).length === 0 && (
                    <span className="text-slate-500">—</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 mb-1">Top tags</p>
                <div className="flex flex-wrap gap-1">
                  {stats.topTags.length === 0 && (
                    <span className="text-slate-500">—</span>
                  )}
                  {stats.topTags.map((t) => (
                    <span
                      key={t.tag}
                      className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-600 text-[10px]"
                    >
                      {t.tag} ({t.count})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Items list */}
                      <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs space-y-2 max-h-85 overflow-auto">
              {filteredItems.length === 0 && (
                <p className="text-slate-500 text-[11px]">
                  No items match current filters. ลองลบ filter บางตัวออก
                </p>
              )}
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-white/10 rounded-xl px-3 py-2 flex flex-col gap-1 bg-slate-900/70"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-slate-100 font-medium text-[13px]">
                      {item.title}
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono border border-slate-600">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-700 text-[10px]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>Year: {item.year}</span>
                      <span>Impact: {item.impactScore}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Export JSON */}
            {showExport && (
                          <div className="bg-black/60 border border-violet-500/40 rounded-2xl p-4 text-[11px] font-mono text-violet-100 max-h-85 overflow-auto">
                <p className="text-[10px] text-violet-300 mb-1">EXPORT JSON VIA FACADE</p>
                <pre>{exportJson}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Playground hints */}
        <div className="mt-4 text-xs text-slate-400 border-t border-white/5 pt-4">
          <p className="mb-1 font-mono text-[11px] text-slate-500">PLAYGROUND HINT</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              เพิ่ม subsystem ใหม่ เช่น <span className="font-mono">RecommendationService</span>
              แล้วเพิ่ม method ใน
              <span className="font-mono">PortfolioInsightsFacade</span>
              เพื่อดึงรายการที่แนะนำ
            </li>
            <li>
              เปลี่ยน signature ของ <span className="font-mono">getInsights()</span>
              ให้รับ options มากขึ้น แต่ให้ UI ยังเรียกแค่ method เดียว
            </li>
            <li>
              ทดลองใช้ Facade นี้ร่วมกับ pattern อื่น เช่น
              ใช้ Decorator เพื่อห่อ Facade อีกชั้นสำหรับ logging หรือ caching
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FacadeDemoPage;
