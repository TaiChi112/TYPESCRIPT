"use client";

import React, { useMemo, useState } from "react";

/**
 * ---------------------------------------------------------------------
 * STRATEGY PATTERN — RANKING STRATEGIES PLAYGROUND (DEMO PAGE)
 * ---------------------------------------------------------------------
 * หน้านี้เป็นสนามทดลองสำหรับ Strategy Pattern
 *
 * แนวคิดหลัก:
 * - มีชุดข้อมูล projects เดียวกัน แต่สามารถให้คะแนน/จัดอันดับได้หลายแบบ
 * - กลยุทธ์การให้คะแนนแต่ละแบบ (Strategy) ถูกห่อเป็น object แยก
 * - Context (RankingContext) จะเลือกใช้ Strategy ปัจจุบันมาคำนวณ score และ sort
 *
 * คุณสามารถ:
 * - เพิ่ม Strategy ใหม่ เช่น RiskFirstStrategy, TagMatchStrategy ฯลฯ
 * - ปรับสูตร score ภายในแต่ละ Strategy ได้โดยไม่แตะโค้ด UI เลย
 * - ทดลองสลับกลยุทธ์แล้วดูลำดับของ projects เปลี่ยนไป
 */

// 1) DOMAIN MODEL

type Category = "article" | "project" | "lab";

type Maturity = "experimental" | "beta" | "stable";

interface ProjectItem {
  id: string;
  title: string;
  category: Category;
  maturity: Maturity;
  impact: number; // 1-100
  effort: number; // 1-100 (สูง = ใช้แรงเยอะ)
  tags: string[];
}

const PROJECTS: ProjectItem[] = [
  {
    id: "p1",
    title: "Design Patterns Handbook",
    category: "article",
    maturity: "stable",
    impact: 80,
    effort: 40,
    tags: ["patterns", "reference"],
  },
  {
    id: "p2",
    title: "Portfolio Analytics Dashboard",
    category: "project",
    maturity: "beta",
    impact: 95,
    effort: 70,
    tags: ["analytics", "dashboard", "nextjs"],
  },
  {
    id: "p3",
    title: "Iterator vs Visitor Lab",
    category: "lab",
    maturity: "experimental",
    impact: 60,
    effort: 25,
    tags: ["iterator", "visitor"],
  },
  {
    id: "p4",
    title: "Command-based Undo/Redo System",
    category: "project",
    maturity: "stable",
    impact: 88,
    effort: 55,
    tags: ["command", "undo", "editor"],
  },
  {
    id: "p5",
    title: "Design System Token Playground",
    category: "lab",
    maturity: "beta",
    impact: 72,
    effort: 30,
    tags: ["design-system", "tokens"],
  },
];

// 2) STRATEGY INTERFACE

interface RankingStrategy {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  score(project: ProjectItem): number;
}

// 3) CONCRETE STRATEGIES

// 3.1 Impact-first: เน้น impact สูงสุด ไม่สน effort เท่าไร
class ImpactFirstStrategy implements RankingStrategy {
  readonly id = "impact";

  readonly label = "Impact first";

  readonly description =
    "ให้คะแนนจาก impact เป็นหลัก (เหมาะกับโฟกัสผลลัพธ์ก่อน แรงที่ใช้ทีหลัง)";

  score(project: ProjectItem): number {
    return project.impact;
  }
}

// 3.2 Effort-efficient: เน้นผลลัพธ์ต่อแรง (impact / effort)
class EffortEfficientStrategy implements RankingStrategy {
  readonly id = "efficiency";

  readonly label = "Effort efficiency";

  readonly description =
    "ให้คะแนนจาก impact/effort เน้นงานที่คุ้มค่า (ผลลัพธ์สูง แรงน้อย)";

  score(project: ProjectItem): number {
    if (project.effort === 0) return project.impact * 2;
    return (project.impact / project.effort) * 50; // scale ให้ใกล้ 0-100
  }
}

// 3.3 Experiment-friendly: ชอบ experimental/lab เพื่อทดลอง
class ExperimentFriendlyStrategy implements RankingStrategy {
  readonly id = "experimental";

  readonly label = "Experiment friendly";

  readonly description =
    "ให้คะแนนบวกพิเศษกับ lab และงาน experimental เพื่อกระตุ้นการทดลอง";

  score(project: ProjectItem): number {
    let base = project.impact;
    if (project.category === "lab") base += 15;
    if (project.maturity === "experimental") base += 10;
    if (project.maturity === "stable") base -= 5;
    return base;
  }
}

// 3.4 BalancedStable: แจกคะแนนให้ stable/project ฯลฯ
class BalancedStableStrategy implements RankingStrategy {
  readonly id = "balanced";

  readonly label = "Balanced + stable";

  readonly description =
    "สมดุล impact/effort และให้คะแนนเสริมกับ project ที่ stable";

  score(project: ProjectItem): number {
    const eff = project.effort === 0 ? 1 : project.effort;
    let s = (project.impact * 0.7 + (100 - eff) * 0.3);
    if (project.category === "project") s += 10;
    if (project.maturity === "stable") s += 5;
    if (project.category === "lab") s -= 5;
    return s;
  }
}

// 4) CONTEXT

class RankingContext {
  private strategy: RankingStrategy;

  constructor(initial: RankingStrategy) {
    this.strategy = initial;
  }

  setStrategy(strategy: RankingStrategy) {
    this.strategy = strategy;
  }

  getStrategy(): RankingStrategy {
    return this.strategy;
  }

  rank(projects: ProjectItem[]): { project: ProjectItem; score: number }[] {
    const scored = projects.map((p) => ({
      project: p,
      score: this.strategy.score(p),
    }));
    return scored.sort((a, b) => b.score - a.score);
  }
}

const STRATEGIES: RankingStrategy[] = [
  new ImpactFirstStrategy(),
  new EffortEfficientStrategy(),
  new ExperimentFriendlyStrategy(),
  new BalancedStableStrategy(),
];

// 5) DEMO PAGE

const StrategyDemoPage: React.FC = () => {
  const [context] = useState(() => new RankingContext(STRATEGIES[0]));
  const [currentStrategyId, setCurrentStrategyId] = useState<string>(
    STRATEGIES[0].id,
  );

  const currentStrategy = useMemo(
    () => STRATEGIES.find((s) => s.id === currentStrategyId) ?? STRATEGIES[0],
    [currentStrategyId],
  );

  const ranked = useMemo(() => {
    context.setStrategy(currentStrategy);
    return context.rank(PROJECTS);
  }, [context, currentStrategy]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-6xl">
        {/* Hero */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-[11px] tracking-[0.25em] text-slate-400 mb-2 uppercase">
              STRATEGY · RANKING STRATEGIES DEMO
            </p>
            <h1 className="text-2xl font-semibold mb-1">
              Strategy Pattern — Ranking Playground
            </h1>
            <p className="text-sm text-slate-300 mb-4 max-w-2xl">
              หน้านี้ใช้ Strategy Pattern เพื่อสลับกลยุทธ์ในการจัดอันดับ projects
              โดยที่ UI ใช้ context เดียวกัน แต่ Strategy ภายในเปลี่ยนไปได้ตลอดเวลา
            </p>
          </div>
        </div>

        {/* Explanation */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs leading-relaxed">
            <h2 className="text-sm font-semibold text-white mb-2">Strategy คืออะไร?</h2>
            <p className="text-slate-200 mb-2">
              Strategy Pattern แยกกลยุทธ์/อัลกอริทึมออกเป็น object แต่ละตัวที่มี
              interface เดียวกัน ทำให้สามารถสลับ เปลี่ยน หรือลองหลายกลยุทธ์ได้
              โดย client ไม่ต้องเปลี่ยนโค้ดที่เรียกใช้
            </p>
            <p className="text-slate-400">
              ในหน้านี้ UI เรียกใช้ <span className="font-mono">RankingContext</span>
              เพียงตัวเดียว แต่ <span className="font-mono">RankingStrategy</span>
              ภายในสามารถเปลี่ยนได้เป็น impact-first, efficiency, experimental-friendly
              หรือ balanced-stable ตามที่ผู้ใช้เลือก
            </p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-200 space-y-1">
            <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-1">
              STRATEGIES
            </p>
            {STRATEGIES.map((s) => (
              <p key={s.id}>
                - {s.label}: <span className="text-slate-400">{s.description}</span>
              </p>
            ))}
            <p className="text-[11px] text-slate-400 mt-2">
              คุณสามารถเพิ่ม strategy ใหม่ได้โดย implement
              <span className="font-mono"> RankingStrategy</span>
              แล้วเพิ่มเข้า array <span className="font-mono">STRATEGIES</span>
            </p>
          </div>
        </div>

        {/* Controls + Ranked list */}
        <div className="grid lg:grid-cols-[260px,1fr] gap-6 mb-10">
          {/* Controls */}
          <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs space-y-4">
            <h3 className="text-sm font-semibold mb-1">Choose strategy</h3>
            <div className="flex flex-wrap gap-2">
              {STRATEGIES.map((s) => {
                const active = s.id === currentStrategyId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrentStrategyId(s.id)}
                    className={`px-3 py-1 rounded-full border text-[11px] transition
                      ${active
                        ? "bg-cyan-500/90 border-cyan-300 text-black"
                        : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                    `}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              Strategy ปัจจุบัน: <span className="font-mono">{currentStrategy.label}</span>
            </p>
          </div>

          {/* Ranked list */}
                  <div className="bg-black/50 border border-white/10 rounded-2xl p-4 text-[11px] max-h-105 overflow-auto">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400">Ranked projects (จาก Strategy ปัจจุบัน)</p>
              <span className="text-slate-500">{ranked.length} items</span>
            </div>
            {ranked.length === 0 && (
              <p className="text-slate-500">ไม่มี projects</p>
            )}
            {ranked.length > 0 && (
              <ul className="space-y-2">
                {ranked.map(({ project, score }, index) => (
                  <li
                    key={project.id}
                    className="border border-white/10 rounded-xl px-3 py-2 bg-slate-950/80 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 w-6">#{index + 1}</span>
                        <span className="text-slate-100 text-[13px] truncate">
                          {project.title}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-600 text-[10px] font-mono">
                        {project.category} · {project.maturity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400">
                      <span>
                        impact: {project.impact} · effort: {project.effort}
                      </span>
                      <span>
                        score: <span className="text-cyan-300 font-semibold">
                          {score.toFixed(1)}
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {project.tags.map((tag) => (
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

        {/* Playground hints */}
        <div className="mt-4 text-xs text-slate-400 border-t border-white/5 pt-4">
          <p className="mb-1 font-mono text-[11px] text-slate-500">PLAYGROUND HINT</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              เพิ่ม Strategy ใหม่ เช่น <span className="font-mono">RiskFirstStrategy</span>
              ที่ให้คะแนนสูงกับงาน experimental และ lab ที่มี impact สูง
            </li>
            <li>
              แยก Context class ออกไปใช้ร่วมกับหน้าอื่น
              แล้ว inject Strategy จากภายนอกตาม feature flag หรือ config
            </li>
            <li>
              ใช้ Strategy Pattern นี้ร่วมกับ Factory Method หรือ Builder
              เพื่อสร้างชุด Strategy ที่ต่างกันสำหรับ user role คนละแบบ
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StrategyDemoPage;
