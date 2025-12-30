"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * ---------------------------------------------------------------------
 * MEDIATOR PATTERN — DASHBOARD FILTER PLAYGROUND (DEMO PAGE)
 * ---------------------------------------------------------------------
 * หน้านี้เป็นสนามทดลองสำหรับ Mediator Pattern
 *
 * แนวคิดหลัก:
 * - มี component/โมดูลหลายตัว เช่น ตัวกรอง (filter), การค้นหา (search), การจัดเรียง (sort), สรุปสถิติ (stats)
 * - แต่ละตัวไม่คุยกันโดยตรง จะคุยผ่านตัวกลางที่เรียกว่า Mediator เท่านั้น
 * - เมื่อ filter/search/sort เปลี่ยน Mediator จะเป็นคนคำนวณผลลัพธ์ใหม่ และอัปเดต stats ให้สอดคล้อง
 *
 * คุณสามารถ:
 * - เพิ่ม colleague ใหม่ เช่น PaginationColleague, LayoutColleague
 * - เพิ่ม event ใหม่ใน Mediator เช่น "reset", "highlight" เป็นต้น
 * - เปลี่ยนโครงสร้างภายใน แต่ยังคง interface ของ Mediator เดิม
 */

// 1) DOMAIN MODEL

type Category = "article" | "project" | "lab";

type Difficulty = "easy" | "medium" | "hard";

interface DashboardItem {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  minutes: number;
  tags: string[];
}

const DASHBOARD_ITEMS: DashboardItem[] = [
  {
    id: "d1",
    title: "Design Patterns Overview",
    category: "article",
    difficulty: "easy",
    minutes: 10,
    tags: ["patterns", "overview"],
  },
  {
    id: "d2",
    title: "Portfolio Analytics Dashboard",
    category: "project",
    difficulty: "hard",
    minutes: 40,
    tags: ["react", "nextjs", "analytics"],
  },
  {
    id: "d3",
    title: "Iterator vs Visitor Lab",
    category: "lab",
    difficulty: "medium",
    minutes: 18,
    tags: ["iterator", "visitor"],
  },
  {
    id: "d4",
    title: "Command Pattern in UI",
    category: "article",
    difficulty: "medium",
    minutes: 12,
    tags: ["command", "undo-redo"],
  },
  {
    id: "d5",
    title: "Prototype & Flyweight Experiments",
    category: "lab",
    difficulty: "hard",
    minutes: 25,
    tags: ["prototype", "flyweight"],
  },
  {
    id: "d6",
    title: "Builder and Abstract Factory",
    category: "article",
    difficulty: "easy",
    minutes: 14,
    tags: ["builder", "abstract-factory"],
  },
];

// 2) MEDIATOR INTERFACE & COLLEAGUES

// Forward declaration
// interface DashboardMediator{};

abstract class BaseColleague {
  protected mediator: DashboardMediator;

  constructor(mediator: DashboardMediator) {
    this.mediator = mediator;
  }
}

export type MediatorEvent =
  | "filter-category"
  | "filter-difficulty"
  | "search-text"
  | "sort-mode"
  | "reset";

type SortMode = "title" | "minutes" | "difficulty";

interface SummaryInfo {
  total: number;
  visible: number;
  activeCategory: Category | "all";
  activeDifficulty: Difficulty | "all";
  searchText: string;
  sortMode: SortMode;
  avgMinutes: number;
}

interface DashboardMediator {
  notify(sender: BaseColleague, event: MediatorEvent, payload?: unknown): void;
  getVisibleItems(): DashboardItem[];
  getSummary(): SummaryInfo;
}

// 3) COLLEAGUES IMPLEMENTATION

class FilterColleague extends BaseColleague {
  private category: Category | "all" = "all";

  private difficulty: Difficulty | "all" = "all";

  setCategory(category: Category | "all") {
    this.category = category;
    this.mediator.notify(this, "filter-category", category);
  }

  setDifficulty(difficulty: Difficulty | "all") {
    this.difficulty = difficulty;
    this.mediator.notify(this, "filter-difficulty", difficulty);
  }

  getCategory() {
    return this.category;
  }

  getDifficulty() {
    return this.difficulty;
  }
}

class SearchColleague extends BaseColleague {
  private text = "";

  setSearch(text: string) {
    this.text = text;
    this.mediator.notify(this, "search-text", text);
  }

  getSearch() {
    return this.text;
  }
}

class SortColleague extends BaseColleague {
  private mode: SortMode = "title";

  setSortMode(mode: SortMode) {
    this.mode = mode;
    this.mediator.notify(this, "sort-mode", mode);
  }

  getSortMode() {
    return this.mode;
  }
}

class StatsColleague extends BaseColleague {
  private summary: SummaryInfo;

  constructor(mediator: DashboardMediator, initialSummary: SummaryInfo) {
    super(mediator);
    this.summary = initialSummary;
  }

  setSummary(summary: SummaryInfo) {
    this.summary = summary;
  }

  getSummary(): SummaryInfo {
    return this.summary;
  }
}

// 4) CONCRETE MEDIATOR

class DashboardMediatorImpl implements DashboardMediator {
  private items: DashboardItem[];

  private filter!: FilterColleague;

  private search!: SearchColleague;

  private sort!: SortColleague;

  private stats!: StatsColleague;

  private visibleItems: DashboardItem[] = [];

  constructor(items: DashboardItem[]) {
    this.items = items;
  }

  register(filter: FilterColleague, search: SearchColleague, sort: SortColleague, stats: StatsColleague) {
    this.filter = filter;
    this.search = search;
    this.sort = sort;
    this.stats = stats;
    this.recompute();
  }

  notify(sender: BaseColleague, event: MediatorEvent, payload?: unknown): void {
    switch (event) {
      case "filter-category":
      case "filter-difficulty":
      case "search-text":
      case "sort-mode":
      case "reset":
        this.recompute();
        break;
      default:
        break;
    }
  }

  private recompute() {
    const category = this.filter.getCategory();
    const difficulty = this.filter.getDifficulty();
    const search = this.search.getSearch().toLowerCase();
    const sortMode = this.sort.getSortMode();

    let result = [...this.items];

    if (category !== "all") {
      result = result.filter((item) => item.category === category);
    }

    if (difficulty !== "all") {
      result = result.filter((item) => item.difficulty === difficulty);
    }

    if (search.trim().length > 0) {
      result = result.filter((item) => {
        const haystack = `${item.title} ${item.tags.join(" ")}`.toLowerCase();
        return haystack.includes(search);
      });
    }

    result.sort((a, b) => {
      switch (sortMode) {
        case "title":
          return a.title.localeCompare(b.title);
        case "minutes":
          return a.minutes - b.minutes;
        case "difficulty": {
          const order: Record<Difficulty, number> = {
            easy: 0,
            medium: 1,
            hard: 2,
          };
          return order[a.difficulty] - order[b.difficulty];
        }
        default:
          return 0;
      }
    });

    this.visibleItems = result;

    const avgMinutes =
      result.length === 0
        ? 0
        : Math.round(
            (result.reduce((sum, i) => sum + i.minutes, 0) / result.length) * 10,
          ) / 10;

    const summary: SummaryInfo = {
      total: this.items.length,
      visible: result.length,
      activeCategory: category,
      activeDifficulty: difficulty,
      searchText: this.search.getSearch(),
      sortMode,
      avgMinutes,
    };

    this.stats.setSummary(summary);
  }

  getVisibleItems(): DashboardItem[] {
    return [...this.visibleItems];
  }

  getSummary(): SummaryInfo {
    return this.stats.getSummary();
  }
}

// 5) DEMO PAGE

const MediatorDemoPage: React.FC = () => {
  const mediatorRef = useRef<DashboardMediatorImpl | null>(null);
  const filterRef = useRef<FilterColleague | null>(null);
  const searchRef = useRef<SearchColleague | null>(null);
  const sortRef = useRef<SortColleague | null>(null);

  const [items, setItems] = useState<DashboardItem[]>([]);
  const [summary, setSummary] = useState<SummaryInfo | null>(null);

  // initial setup
  useEffect(() => {
    const mediator = new DashboardMediatorImpl(DASHBOARD_ITEMS);
    const dummySummary: SummaryInfo = {
      total: DASHBOARD_ITEMS.length,
      visible: DASHBOARD_ITEMS.length,
      activeCategory: "all",
      activeDifficulty: "all",
      searchText: "",
      sortMode: "title",
      avgMinutes: 0,
    };
    const stats = new StatsColleague(mediator as DashboardMediator, dummySummary);
    const filter = new FilterColleague(mediator as DashboardMediator);
    const search = new SearchColleague(mediator as DashboardMediator);
    const sort = new SortColleague(mediator as DashboardMediator);

    mediator.register(filter, search, sort, stats);

    mediatorRef.current = mediator;
    filterRef.current = filter;
    searchRef.current = search;
    sortRef.current = sort;

    setItems(mediator.getVisibleItems());
    setSummary(mediator.getSummary());
  }, []);

  const refresh = () => {
    const mediator = mediatorRef.current;
    if (!mediator) return;
    setItems(mediator.getVisibleItems());
    setSummary(mediator.getSummary());
  };

  const allCategories = useMemo(
    () => ["all", "article", "project", "lab"] as const,
    [],
  );

  const allDifficulties = useMemo(
    () => ["all", "easy", "medium", "hard"] as const,
    [],
  );

  const sortModes: SortMode[] = useMemo(
    () => ["title", "minutes", "difficulty"],
    [],
  );

  const handleCategoryClick = (value: Category | "all") => {
    filterRef.current?.setCategory(value);
    refresh();
  };

  const handleDifficultyClick = (value: Difficulty | "all") => {
    filterRef.current?.setDifficulty(value);
    refresh();
  };

  const handleSearchChange = (value: string) => {
    searchRef.current?.setSearch(value);
    refresh();
  };

  const handleSortClick = (mode: SortMode) => {
    sortRef.current?.setSortMode(mode);
    refresh();
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-6xl">
        {/* Hero */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-[11px] tracking-[0.25em] text-slate-400 mb-2 uppercase">
              MEDIATOR · DASHBOARD FILTER DEMO
            </p>
            <h1 className="text-2xl font-semibold mb-1">
              Mediator Pattern — Dashboard Filter Playground
            </h1>
            <p className="text-sm text-slate-300 mb-4 max-w-2xl">
              หน้านี้ใช้ Mediator Pattern เพื่อให้ filter, search, sort, stats
              ทำงานร่วมกันผ่านตัวกลางเดียว แทนที่จะอ้างถึงกันโดยตรง
            </p>
          </div>
        </div>

        {/* Explanation */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs leading-relaxed">
            <h2 className="text-sm font-semibold text-white mb-2">Mediator คืออะไร?</h2>
            <p className="text-slate-200 mb-2">
              Mediator Pattern ลดการเชื่อมโยงกันโดยตรงระหว่าง object หลายตัว
              (colleagues) โดยให้ทุกตัวคุยผ่านตัวกลาง (mediator) เพื่อลด coupling
              และทำให้ logic การประสานงานอยู่ในที่เดียว
            </p>
            <p className="text-slate-400">
              ในหน้านี้ <span className="font-mono">FilterColleague</span>,
              <span className="font-mono">SearchColleague</span>,
              <span className="font-mono">SortColleague</span>,
              <span className="font-mono">StatsColleague</span> ไม่อ้างถึงกันโดยตรง
              แต่ใช้ <span className="font-mono">DashboardMediatorImpl</span>
              เป็นตัวประสานทุกครั้งที่มีการเปลี่ยนค่า
            </p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-200 space-y-1">
            <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-1">
              COLLEAGUES
            </p>
            <p>- FilterColleague — จัดการ category + difficulty</p>
            <p>- SearchColleague — จัดการคำค้นหา</p>
            <p>- SortColleague — จัดการโหมดการจัดเรียง</p>
            <p>- StatsColleague — เก็บและแสดงผล summary</p>
            <p className="text-[11px] text-slate-400 mt-2">
              คุณสามารถเพิ่ม colleague ใหม่ เช่น PaginationColleague
              แล้วให้เรียก <span className="font-mono">mediator.notify()</span>
              เมื่อ page เปลี่ยน เพื่อให้ mediator คำนวณผลใหม่
            </p>
          </div>
        </div>

        {/* Controls + List */}
        <div className="grid lg:grid-cols-[260px,1fr] gap-6 mb-10">
          {/* Controls */}
          <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs space-y-4">
            <h3 className="text-sm font-semibold mb-1">Controls (ผ่าน Mediator)</h3>

            {/* Category */}
            <div>
              <p className="text-[11px] text-slate-400 mb-1">Category</p>
              <div className="flex flex-wrap gap-1">
                {allCategories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCategoryClick(c as Category | "all")}
                    className="px-3 py-1 rounded-full border text-[11px] transition bg-transparent border-white/20 text-slate-200 hover:border-white/60"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <p className="text-[11px] text-slate-400 mb-1">Difficulty</p>
              <div className="flex flex-wrap gap-1">
                {allDifficulties.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleDifficultyClick(d as Difficulty | "all")}
                    className="px-3 py-1 rounded-full border text-[11px] transition bg-transparent border-white/20 text-slate-200 hover:border-white/60"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div>
              <p className="text-[11px] text-slate-400 mb-1">Search</p>
              <input
                className="w-full bg-slate-900/80 border border-white/20 rounded px-2 py-1 text-[11px]"
                placeholder="ค้นหาจาก title / tag"
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            {/* Sort */}
            <div className="border-t border-white/5 pt-3">
              <p className="text-[11px] text-slate-400 mb-1">Sort</p>
              <div className="flex flex-wrap gap-1">
                {sortModes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSortClick(m)}
                    className="px-3 py-1 rounded-full border text-[11px] transition bg-transparent border-white/20 text-slate-200 hover:border-white/60"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List + Summary */}
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs flex flex-wrap gap-6 items-baseline">
              {summary ? (
                <>
                  <div>
                    <p className="text-[11px] text-slate-400 mb-1">Visible / Total</p>
                    <p className="text-lg font-semibold">
                      {summary.visible} / {summary.total}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 mb-1">Avg minutes</p>
                    <p className="text-lg font-semibold">{summary.avgMinutes}</p>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-0.5 max-w-xs">
                    <p>
                      Category: <span className="font-mono">{summary.activeCategory}</span>
                    </p>
                    <p>
                      Difficulty: <span className="font-mono">{summary.activeDifficulty}</span>
                    </p>
                    <p>
                      Sort: <span className="font-mono">{summary.sortMode}</span>
                    </p>
                    <p>
                      Search: <span className="font-mono">{summary.searchText || "(none)"}</span>
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-slate-500 text-[11px]">Loading mediator...</p>
              )}
            </div>

            {/* Items list */}
                      <div className="bg-black/50 border border-white/10 rounded-2xl p-4 text-[11px] max-h-80 overflow-auto">
              {items.length === 0 && (
                <p className="text-slate-500 text-[11px]">
                  ไม่มีรายการที่ตรงกับ filter/search ปัจจุบัน
                </p>
              )}
              {items.length > 0 && (
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="border border-white/10 rounded-xl px-3 py-2 bg-slate-950/80 flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-100 truncate text-[13px]">
                          {item.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-600 text-[10px] font-mono">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400">
                        <span>Difficulty: {item.difficulty}</span>
                        <span>{item.minutes} min</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-600 text-[10px]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Playground hints */}
        <div className="mt-4 text-xs text-slate-400 border-t border-white/5 pt-4">
          <p className="mb-1 font-mono text-[11px] text-slate-500">PLAYGROUND HINT</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              เพิ่ม colleague ใหม่ เช่น <span className="font-mono">PaginationColleague</span>
              หรือ <span className="font-mono">LayoutColleague</span>
              แล้วให้คุยกับ <span className="font-mono">DashboardMediatorImpl</span>
            </li>
            <li>
              เพิ่ม event ใหม่ใน Mediator เช่น `reset` เพื่อ clear filter ทั้งหมด
              และลองดูว่าผลสรุปเปลี่ยนอย่างไร
            </li>
            <li>
              ใช้ Mediator นี้ร่วมกับ Command/Observer
              เพื่อ log ทุกครั้งที่ filter/search/sort เปลี่ยน หรือทำ undo/redo ของ config
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MediatorDemoPage;
