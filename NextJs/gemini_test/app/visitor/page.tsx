"use client";

import React, { useMemo, useState } from "react";

/**
 * ---------------------------------------------------------------------
 * VISITOR PATTERN — CONTENT ANALYZER PLAYGROUND
 * ---------------------------------------------------------------------
 * หน้านี้เป็นสนามทดลองสำหรับ Visitor Pattern
 *
 * แนวคิดหลัก:
 * - มี element หลายประเภท (Article, Project, Lab) แต่ละตัวมีข้อมูลเหมือนกันบางส่วน
 * - Visitor ต่าง ๆ สามารถเดิน (visit) ไปยัง element แต่ละประเภทแล้วทำงานต่างกันได้
 * - Element ไม่ต้องรู้รายละเอียดของ logic วิเคราะห์ เพียงแต่รับ visitor แล้วเรียก accept
 *
 * คุณสามารถ:
 * - เพิ่ม Visitor ใหม่ เช่น SecurityScanVisitor, CostEstimateVisitor ฯลฯ
 * - ปรับ logic ในแต่ละ visitor โดยไม่แก้ element class เดิม
 * - ทดลองเลือก visitor หลายตัวแล้วดู summary/logs ที่ได้
 */

// 1) DOMAIN MODEL

type ElementKind = "article" | "project" | "lab";

interface BaseElementData {
  id: string;
  title: string;
  kind: ElementKind;
  impact: number; // 1-100
  complexity: number; // 1-100 (สูง = ซับซ้อนมาก)
  tags: string[];
}

interface VisitorLog {
  message: string;
}

interface VisitorSummaryItem {
  label: string;
  value: string;
}

// 2) VISITOR INTERFACES

// Forward declarations of concrete element types
// class ArticleElement {}
// class ProjectElement {}
// class LabElement {}

interface ContentVisitor {
  readonly id: string;
  readonly label: string;
  readonly description: string;

  start(): void;
  visitArticle(element: ArticleElement): void;
  visitProject(element: ProjectElement): void;
  visitLab(element: LabElement): void;
  finish(): void;

  getLogs(): VisitorLog[];
  getSummary(): VisitorSummaryItem[];
}

interface ContentElement extends BaseElementData {
  accept(visitor: ContentVisitor): void;
}

// 3) CONCRETE ELEMENTS

class ArticleElement implements ContentElement {
  id: string;
  title: string;
  kind: ElementKind = "article";
  impact: number;
  complexity: number;
  tags: string[];

  constructor(data: Omit<BaseElementData, "kind">) {
    this.id = data.id;
    this.title = data.title;
    this.impact = data.impact;
    this.complexity = data.complexity;
    this.tags = data.tags;
  }

  accept(visitor: ContentVisitor): void {
    visitor.visitArticle(this);
  }
}

class ProjectElement implements ContentElement {
  id: string;
  title: string;
  kind: ElementKind = "project";
  impact: number;
  complexity: number;
  tags: string[];

  constructor(data: Omit<BaseElementData, "kind">) {
    this.id = data.id;
    this.title = data.title;
    this.impact = data.impact;
    this.complexity = data.complexity;
    this.tags = data.tags;
  }

  accept(visitor: ContentVisitor): void {
    visitor.visitProject(this);
  }
}

class LabElement implements ContentElement {
  id: string;
  title: string;
  kind: ElementKind = "lab";
  impact: number;
  complexity: number;
  tags: string[];

  constructor(data: Omit<BaseElementData, "kind">) {
    this.id = data.id;
    this.title = data.title;
    this.impact = data.impact;
    this.complexity = data.complexity;
    this.tags = data.tags;
  }

  accept(visitor: ContentVisitor): void {
    visitor.visitLab(this);
  }
}

const ELEMENTS: ContentElement[] = [
  new ArticleElement({
    id: "e1",
    title: "Intro to Design Patterns",
    impact: 80,
    complexity: 35,
    tags: ["patterns", "guide"],
  }),
  new ProjectElement({
    id: "e2",
    title: "Analytics Dashboard",
    impact: 95,
    complexity: 75,
    tags: ["nextjs", "analytics", "dashboard"],
  }),
  new LabElement({
    id: "e3",
    title: "Visitor vs Double Dispatch Lab",
    impact: 60,
    complexity: 55,
    tags: ["visitor", "lab"],
  }),
  new ProjectElement({
    id: "e4",
    title: "Command-based Editor",
    impact: 88,
    complexity: 65,
    tags: ["command", "undo", "editor"],
  }),
  new ArticleElement({
    id: "e5",
    title: "Observer Pattern in UI State",
    impact: 78,
    complexity: 40,
    tags: ["observer", "ui-state"],
  }),
];

// 4) CONCRETE VISITORS

// 4.1 ImpactStatsVisitor — สรุป impact รวมและเฉลี่ยต่อประเภท
class ImpactStatsVisitor implements ContentVisitor {
  readonly id = "impact";
  readonly label = "Impact Stats";
  readonly description = "สรุปคะแนน impact รวม/เฉลี่ย และต่อประเภท";

  private logs: VisitorLog[] = [];
  private totalImpact = 0;
  private count = 0;
  private byKind: Record<ElementKind, { impact: number; count: number }> = {
    article: { impact: 0, count: 0 },
    project: { impact: 0, count: 0 },
    lab: { impact: 0, count: 0 },
  };

  start(): void {
    this.logs = [];
    this.totalImpact = 0;
    this.count = 0;
    this.byKind = {
      article: { impact: 0, count: 0 },
      project: { impact: 0, count: 0 },
      lab: { impact: 0, count: 0 },
    };
    this.logs.push({ message: "เริ่มคำนวณสถิติ impact" });
  }

  private add(element: ContentElement): void {
    this.totalImpact += element.impact;
    this.count += 1;
    this.byKind[element.kind].impact += element.impact;
    this.byKind[element.kind].count += 1;
    this.logs.push({
      message: `[${element.kind}] ${element.title} → impact ${element.impact}`,
    });
  }

  visitArticle(element: ArticleElement): void {
    this.add(element);
  }

  visitProject(element: ProjectElement): void {
    this.add(element);
  }

  visitLab(element: LabElement): void {
    this.add(element);
  }

  finish(): void {
    this.logs.push({ message: "จบการคำนวณ impact stats" });
  }

  getLogs(): VisitorLog[] {
    return this.logs;
  }

  getSummary(): VisitorSummaryItem[] {
    const avg = this.count === 0 ? 0 : this.totalImpact / this.count;
    const items: VisitorSummaryItem[] = [
      {
        label: "Total impact",
        value: this.totalImpact.toFixed(1),
      },
      {
        label: "Average impact",
        value: avg.toFixed(1),
      },
    ];

    (Object.keys(this.byKind) as ElementKind[]).forEach((kind) => {
      const { impact, count } = this.byKind[kind];
      const avgKind = count === 0 ? 0 : impact / count;
      items.push({
        label: `${kind} (avg x count)`,
        value: `${avgKind.toFixed(1)} x ${count}`,
      });
    });

    return items;
  }
}

// 4.2 ComplexityRiskVisitor — หางานที่ impact สูงแต่ complexity สูง (risk)
class ComplexityRiskVisitor implements ContentVisitor {
  readonly id = "risk";
  readonly label = "Complexity Risk";
  readonly description =
    "ไฮไลต์ items ที่ impact สูงและ complexity สูง (อาจเสี่ยงดูแลยาก)";

  private logs: VisitorLog[] = [];
  private risky: ContentElement[] = [];

  start(): void {
    this.logs = [];
    this.risky = [];
    this.logs.push({ message: "เริ่มสแกนความเสี่ยงจาก impact/complexity" });
  }

  private check(element: ContentElement): void {
    const isRisky = element.impact >= 80 && element.complexity >= 60;
    if (isRisky) {
      this.risky.push(element);
      this.logs.push({
        message: `RISK: ${element.title} (impact ${element.impact}, complexity ${element.complexity})`,
      });
    } else {
      this.logs.push({
        message: `OK: ${element.title} (impact ${element.impact}, complexity ${element.complexity})`,
      });
    }
  }

  visitArticle(element: ArticleElement): void {
    this.check(element);
  }

  visitProject(element: ProjectElement): void {
    this.check(element);
  }

  visitLab(element: LabElement): void {
    this.check(element);
  }

  finish(): void {
    this.logs.push({
      message: `พบ risky items ${this.risky.length} รายการ`,
    });
  }

  getLogs(): VisitorLog[] {
    return this.logs;
  }

  getSummary(): VisitorSummaryItem[] {
    if (this.risky.length === 0) {
      return [
        {
          label: "Risky items",
          value: "none 🎉",
        },
      ];
    }
    return [
      {
        label: "Risky items count",
        value: `${this.risky.length}`,
      },
      {
        label: "Risky titles",
        value: this.risky.map((e) => e.title).join(", "),
      },
    ];
  }
}

// 4.3 TagIndexVisitor — สร้าง index ของ tag → count
class TagIndexVisitor implements ContentVisitor {
  readonly id = "tags";
  readonly label = "Tag Index";
  readonly description = "สร้าง index ของ tag ทั้งหมดและจำนวนครั้งที่เจอ";

  private logs: VisitorLog[] = [];
  private tagCount: Map<string, number> = new Map();

  start(): void {
    this.logs = [];
    this.tagCount = new Map();
    this.logs.push({ message: "เริ่มรวบรวม tag index" });
  }

  private addTags(element: ContentElement): void {
    element.tags.forEach((tag) => {
      const prev = this.tagCount.get(tag) ?? 0;
      this.tagCount.set(tag, prev + 1);
      this.logs.push({
        message: `[${element.title}] +tag "${tag}" → ${prev + 1}`,
      });
    });
  }

  visitArticle(element: ArticleElement): void {
    this.addTags(element);
  }

  visitProject(element: ProjectElement): void {
    this.addTags(element);
  }

  visitLab(element: LabElement): void {
    this.addTags(element);
  }

  finish(): void {
    this.logs.push({ message: "จบการสร้าง tag index" });
  }

  getLogs(): VisitorLog[] {
    return this.logs;
  }

  getSummary(): VisitorSummaryItem[] {
    const entries = Array.from(this.tagCount.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
    if (entries.length === 0) {
      return [
        {
          label: "Tags",
          value: "no tags",
        },
      ];
    }
    return entries.map(([tag, count]) => ({
      label: `#${tag}`,
      value: `${count}`,
    }));
  }
}

const VISITOR_FACTORIES: { factory: () => ContentVisitor }[] = [
  { factory: () => new ImpactStatsVisitor() },
  { factory: () => new ComplexityRiskVisitor() },
  { factory: () => new TagIndexVisitor() },
];

function createVisitors(): ContentVisitor[] {
  return VISITOR_FACTORIES.map((f) => f.factory());
}

// 5) REACT PAGE

interface VisitorRunResult {
  id: string;
  label: string;
  description: string;
  logs: VisitorLog[];
  summary: VisitorSummaryItem[];
}

const VisitorDemoPage: React.FC = () => {
  const [activeVisitorIds, setActiveVisitorIds] = useState<string[]>(["impact", "risk", "tags"]);
  const [results, setResults] = useState<VisitorRunResult[]>([]);

  const allVisitors = useMemo(() => createVisitors(), []);

  const toggleVisitor = (id: string) => {
    setResults([]);
    setActiveVisitorIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleRun = () => {
    const visitors = createVisitors().filter((v) =>
      activeVisitorIds.includes(v.id),
    );

    visitors.forEach((v) => v.start());

    ELEMENTS.forEach((el) => {
      visitors.forEach((v) => el.accept(v));
    });

    visitors.forEach((v) => v.finish());

    const runResults: VisitorRunResult[] = visitors.map((v) => ({
      id: v.id,
      label: v.label,
      description: v.description,
      logs: v.getLogs(),
      summary: v.getSummary(),
    }));

    setResults(runResults);
  };

  const handleClear = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-6xl">
        {/* Hero */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-[11px] tracking-[0.25em] text-slate-400 mb-2 uppercase">
              VISITOR · CONTENT ANALYZER DEMO
            </p>
            <h1 className="text-2xl font-semibold mb-1">
              Visitor Pattern — Content Analyzer Playground
            </h1>
            <p className="text-sm text-slate-300 mb-4 max-w-2xl">
              หน้านี้ใช้ Visitor Pattern เพื่อให้ visitor หลายแบบเดินไปตาม elements
              (Article, Project, Lab) และคิดสถิติ/วิเคราะห์ต่างกัน
              โดยไม่ต้องแก้โค้ด element เดิม
            </p>
          </div>
        </div>

        {/* Layout */}
        <div className="grid lg:grid-cols-[260px,1fr] gap-6 mb-8">
          {/* Left: elements + visitor controls */}
          <div className="space-y-4">
            {/* Elements */}
            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-[11px]">
              <h2 className="text-sm font-semibold mb-2">Elements</h2>
              <ul className="space-y-1">
                {ELEMENTS.map((el) => (
                  <li
                    key={el.id}
                    className="border border-white/10 rounded-md px-3 py-1.5 bg-slate-950/90 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-100 text-[12px] truncate">
                        {el.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-600 text-[10px] font-mono">
                        {el.kind}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>
                        impact: {el.impact} · complexity: {el.complexity}
                      </span>
                      <span className="flex flex-wrap gap-1">
                        {el.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[9px]"
                          >
                            {tag}
                          </span>
                        ))}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visitor controls */}
            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-[11px] space-y-3">
              <h2 className="text-sm font-semibold mb-1">Visitors</h2>
              <div className="flex flex-wrap gap-2 mb-1">
                {allVisitors.map((v) => {
                  const active = activeVisitorIds.includes(v.id);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => toggleVisitor(v.id)}
                      className={`px-3 py-1 rounded-full border text-[11px] transition
                        ${active
                          ? "bg-violet-400/90 border-violet-200 text-black"
                          : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                      `}
                    >
                      {v.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-300">
                เลือก visitor ที่ต้องการให้เดินวิเคราะห์ elements
              </p>

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleRun}
                  className="flex-1 px-3 py-1 rounded-md bg-violet-500 text-black text-[11px] font-semibold hover:bg-violet-400 transition"
                >
                  Run visitors
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1 rounded-md bg-transparent border border-white/20 text-[11px] hover:border-white/60 transition"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Right: results */}
                  <div className="bg-black/50 border border-white/10 rounded-2xl p-4 text-[11px] max-h-130 overflow-auto">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400">Visitor Results</p>
              <span className="text-slate-500">{results.length} visitors</span>
            </div>

            {results.length === 0 ? (
              <p className="text-slate-500">
                ยังไม่มีผลลัพธ์ — เลือก visitor แล้วกด `Run visitors` เพื่อดู summary/logs
              </p>
            ) : (
              <div className="space-y-4">
                {results.map((res) => (
                  <div
                    key={res.id}
                    className="border border-white/15 rounded-xl p-3 bg-slate-950/80"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-[12px] font-semibold text-slate-100">
                          {res.label}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {res.description}
                        </p>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="mt-2 mb-2 flex flex-wrap gap-2">
                      {res.summary.map((s, idx) => (
                        <div
                          key={idx}
                          className="px-2 py-1 rounded-md bg-slate-900 border border-slate-700"
                        >
                          <span className="text-slate-400 mr-1">{s.label}:</span>
                          <span className="text-slate-100 font-mono">{s.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Logs */}
                    <div className="border-t border-white/10 pt-2 mt-1">
                      <p className="text-[10px] text-slate-500 mb-1">Logs</p>
                      <ul className="space-y-0.5 max-h-40 overflow-auto">
                        {res.logs.map((log, i) => (
                          <li
                            key={i}
                            className="px-2 py-0.5 rounded bg-slate-900/80 text-slate-200"
                          >
                            {log.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Explanation + hints */}
        <div className="grid md:grid-cols-2 gap-6 mt-2 text-xs">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 leading-relaxed">
            <h2 className="text-sm font-semibold text-white mb-2">
              Visitor คืออะไร?
            </h2>
            <p className="text-slate-200 mb-2">
              Visitor Pattern แยก logic การทำงานที่ขึ้นกับประเภทของ object ออกมาเป็น visitor
              ทำให้สามารถเพิ่มการวิเคราะห์/การคำนวณใหม่ ๆ ได้ โดยไม่ต้องแก้ class ของ element ดั้งเดิม
            </p>
            <p className="text-slate-400">
              ในตัวอย่างนี้ element รับ visitor ผ่าน method <span className="font-mono">accept(visitor)</span>
              แล้ว visitor จะเรียก <span className="font-mono">visitArticle / visitProject / visitLab</span>
              เพื่อประมวลผลเฉพาะสำหรับแต่ละประเภท
            </p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs text-slate-300">
            <p className="mb-1 font-mono text-[11px] text-slate-500 uppercase tracking-[0.2em]">
              PLAYGROUND HINT
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                เพิ่ม visitor ใหม่ เช่น <span className="font-mono">SecurityScanVisitor</span>
                ที่หา element ที่มี tag เสี่ยง หรือ <span className="font-mono">CostEstimateVisitor</span>
              </li>
              <li>
                ใช้ Visitor พร้อมกันหลายตัว เพื่อตรวจคุณภาพ, risk, cost
                บน dataset เดียวกัน โดย element ไม่ต้องเปลี่ยนโค้ดเลย
              </li>
              <li>
                ผสม Visitor กับ Composite pattern
                โดยให้ tree ของ elements (เช่น section/page/widget) ยอมรับ visitor เดียวกันทั้งโครงสร้าง
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorDemoPage;
