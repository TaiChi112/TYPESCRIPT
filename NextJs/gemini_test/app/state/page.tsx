"use client";

import React, { useState } from "react";

/**
 * ---------------------------------------------------------------------
 * STATE PATTERN — WORKFLOW STATE PLAYGROUND (DEMO PAGE)
 * ---------------------------------------------------------------------
 * หน้านี้เป็นสนามทดลองสำหรับ State Pattern
 *
 * แนวคิดหลัก:
 * - มี object หลักตัวเดียว (Document) แต่พฤติกรรมเปลี่ยนตาม state ปัจจุบัน
 * - แต่ละ state ถูกห่อเป็นคลาสแยก เช่น DraftState, InReviewState, PublishedState, ArchivedState
 * - UI เรียกเมธอดเดียวกัน (submit, approve, reject, publish, archive, restore)
 *   แต่ผลลัพธ์และ transition จะแตกต่างตาม state ที่ document อยู่ตอนนั้น
 *
 * คุณสามารถ:
 * - เพิ่ม state ใหม่ เช่น "Scheduled" หรือ "Locked" แล้วควบคุม transition เอง
 * - เพิ่มเมธอดใหม่ใน state เช่น schedule(), lock(), duplicate()
 * - เปลี่ยนกฎว่า state ไหนอนุญาต action ไหนได้บ้าง โดยไม่ต้องแก้โค้ด UI
 */

// 1) DOMAIN TYPES

type WorkflowStatus = "draft" | "in_review" | "published" | "archived";

interface TransitionResult {
  next: WorkflowState;
  log: string;
}

interface WorkflowState {
  readonly status: WorkflowStatus;
  readonly canEdit: boolean;
  readonly label: string;
  readonly description: string;

  submitForReview(): TransitionResult | null;
  approve(): TransitionResult | null;
  reject(): TransitionResult | null;
  publish(): TransitionResult | null;
  archive(): TransitionResult | null;
  restoreToDraft(): TransitionResult | null;
}

// Utility: create log prefixes
const prefix = (from: WorkflowStatus, to: WorkflowStatus, action: string) =>
  `[${action}] ${from.toUpperCase()} → ${to.toUpperCase()}`;

// 2) CONCRETE STATES

class DraftState implements WorkflowState {
  readonly status: WorkflowStatus = "draft";

  readonly canEdit = true;

  readonly label = "Draft";

  readonly description =
    "ยังเป็นร่าง สามารถแก้ไขทุกอย่างได้ แต่ยังไม่เผยแพร่ให้ผู้อื่นเห็น";

  submitForReview(): TransitionResult | null {
    const next = new InReviewState();
    return {
      next,
      log: prefix(this.status, next.status, "submitForReview"),
    };
  }

  approve(): TransitionResult | null {
    return null;
  }

  reject(): TransitionResult | null {
    return null;
  }

  publish(): TransitionResult | null {
    const next = new PublishedState();
    return {
      next,
      log: prefix(this.status, next.status, "publish"),
    };
  }

  archive(): TransitionResult | null {
    const next = new ArchivedState();
    return {
      next,
      log: prefix(this.status, next.status, "archive"),
    };
  }

  restoreToDraft(): TransitionResult | null {
    return null;
  }
}

class InReviewState implements WorkflowState {
  readonly status: WorkflowStatus = "in_review";

  readonly canEdit = false;

  readonly label = "In review";

  readonly description =
    "กำลังอยู่ระหว่างการตรวจสอบ แก้ไขไม่ได้จนกว่าจะถูกอนุมัติหรือถูกตีกลับ";

  submitForReview(): TransitionResult | null {
    return null;
  }

  approve(): TransitionResult | null {
    const next = new PublishedState();
    return {
      next,
      log: prefix(this.status, next.status, "approve"),
    };
  }

  reject(): TransitionResult | null {
    const next = new DraftState();
    return {
      next,
      log: prefix(this.status, next.status, "reject"),
    };
  }

  publish(): TransitionResult | null {
    // ในระบบจริงอาจบังคับว่าต้อง approve ก่อน publish
    const next = new PublishedState();
    return {
      next,
      log: prefix(this.status, next.status, "publish"),
    };
  }

  archive(): TransitionResult | null {
    const next = new ArchivedState();
    return {
      next,
      log: prefix(this.status, next.status, "archive"),
    };
  }

  restoreToDraft(): TransitionResult | null {
    const next = new DraftState();
    return {
      next,
      log: prefix(this.status, next.status, "restoreToDraft"),
    };
  }
}

class PublishedState implements WorkflowState {
  readonly status: WorkflowStatus = "published";

  readonly canEdit = false;

  readonly label = "Published";

  readonly description =
    "เผยแพร่สู่สาธารณะแล้ว การแก้ไขควรถูกควบคุมอย่างระมัดระวัง";

  submitForReview(): TransitionResult | null {
    return null;
  }

  approve(): TransitionResult | null {
    return null;
  }

  reject(): TransitionResult | null {
    return null;
  }

  publish(): TransitionResult | null {
    return null;
  }

  archive(): TransitionResult | null {
    const next = new ArchivedState();
    return {
      next,
      log: prefix(this.status, next.status, "archive"),
    };
  }

  restoreToDraft(): TransitionResult | null {
    const next = new DraftState();
    return {
      next,
      log: prefix(this.status, next.status, "restoreToDraft"),
    };
  }
}

class ArchivedState implements WorkflowState {
  readonly status: WorkflowStatus = "archived";

  readonly canEdit = false;

  readonly label = "Archived";

  readonly description =
    "ถูกเก็บเข้าคลังแล้ว โดยปกติจะไม่ถูกแสดงผล และแก้ไขไม่ได้";

  submitForReview(): TransitionResult | null {
    return null;
  }

  approve(): TransitionResult | null {
    return null;
  }

  reject(): TransitionResult | null {
    return null;
  }

  publish(): TransitionResult | null {
    const next = new PublishedState();
    return {
      next,
      log: prefix(this.status, next.status, "publish"),
    };
  }

  archive(): TransitionResult | null {
    return null;
  }

  restoreToDraft(): TransitionResult | null {
    const next = new DraftState();
    return {
      next,
      log: prefix(this.status, next.status, "restoreToDraft"),
    };
  }
}

// 3) DEMO PAGE

const StateDemoPage: React.FC = () => {
  const [state, setState] = useState<WorkflowState>(() => new DraftState());
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, msg].slice(-40));
  };

  const handleTransition = (actionName: keyof WorkflowState) => {
    const current = state;
    const fn = current[actionName] as () => TransitionResult | null;
    const result = fn.call(current);
    if (!result) {
      addLog(`[DENY] Action "${actionName}" not allowed in ${current.status}`);
      return;
    }
    setState(result.next);
    addLog(result.log);
  };

  const badgeColor = (() => {
    switch (state.status) {
      case "draft":
        return "bg-slate-900 border-slate-500 text-slate-100";
      case "in_review":
        return "bg-amber-900/60 border-amber-500/80 text-amber-100";
      case "published":
        return "bg-emerald-900/60 border-emerald-500/80 text-emerald-100";
      case "archived":
        return "bg-zinc-900/80 border-zinc-500/80 text-zinc-100";
      default:
        return "bg-slate-900 border-slate-500 text-slate-100";
    }
  })();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-6xl">
        {/* Hero */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-[11px] tracking-[0.25em] text-slate-400 mb-2 uppercase">
              STATE · WORKFLOW STATE DEMO
            </p>
            <h1 className="text-2xl font-semibold mb-1">
              State Pattern — Workflow Playground
            </h1>
            <p className="text-sm text-slate-300 mb-4 max-w-2xl">
              หน้านี้ใช้ State Pattern เพื่อเปลี่ยนพฤติกรรมของ workflow เดียวกัน
              (Document) ตาม state ปัจจุบัน โดย UI เรียก action เดิมเสมอ
              แต่ผลลัพธ์และ transition ถูกควบคุมโดยคลาส state แต่ละตัว
            </p>
          </div>
        </div>

        {/* Explanation */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs leading-relaxed">
            <h2 className="text-sm font-semibold text-white mb-2">State คืออะไร?</h2>
            <p className="text-slate-200 mb-2">
              State Pattern ทำให้ object เปลี่ยนพฤติกรรมเมื่อ state ภายในเปลี่ยน
              โดยย้าย logic สำหรับแต่ละ state ไปอยู่ในคลาสแยก
              แทนที่จะเขียน if/else ยาว ๆ ใน object เดียว
            </p>
            <p className="text-slate-400">
              ในหน้านี้ action เดิมอย่างเช่น
              <span className="font-mono">publish()</span>,
              <span className="font-mono">archive()</span>
              จะทำงานไม่เหมือนกันขึ้นกับว่า Document อยู่ใน Draft, InReview,
              Published หรือ Archived
            </p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-200 space-y-1">
            <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-1">
              STATES & ACTIONS
            </p>
            <p>- Draft: แก้ไขได้, สามารถ submitForReview / publish / archive</p>
            <p>- InReview: แก้ไขไม่ได้, สามารถ approve / reject / archive / restoreToDraft</p>
            <p>- Published: แก้ไขไม่ได้, สามารถ archive / restoreToDraft</p>
            <p>- Archived: แก้ไขไม่ได้, สามารถ publish / restoreToDraft</p>
            <p className="text-[11px] text-slate-400 mt-2">
              คุณสามารถเพิ่ม state ใหม่หรือเปลี่ยนกฎของแต่ละ state ได้โดยแก้เฉพาะ
              คลาส state นั้น ๆ โดยไม่ต้องแตะโค้ดปุ่มใน UI เลย
            </p>
          </div>
        </div>

        {/* Controls + View */}
        <div className="grid lg:grid-cols-[260px,1fr] gap-6 mb-10">
          {/* Controls */}
          <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs space-y-4">
            <h3 className="text-sm font-semibold mb-1">Actions (call methods on current state)</h3>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleTransition("submitForReview")}
                className="px-3 py-1 rounded-full border border-sky-400/80 text-[11px] font-semibold"
              >
                submitForReview
              </button>
              <button
                type="button"
                onClick={() => handleTransition("approve")}
                className="px-3 py-1 rounded-full border border-emerald-400/80 text-[11px] font-semibold"
              >
                approve
              </button>
              <button
                type="button"
                onClick={() => handleTransition("reject")}
                className="px-3 py-1 rounded-full border border-amber-400/80 text-[11px] font-semibold"
              >
                reject
              </button>
              <button
                type="button"
                onClick={() => handleTransition("publish")}
                className="px-3 py-1 rounded-full border border-emerald-400/80 text-[11px] font-semibold"
              >
                publish
              </button>
              <button
                type="button"
                onClick={() => handleTransition("archive")}
                className="px-3 py-1 rounded-full border border-pink-400/80 text-[11px] font-semibold"
              >
                archive
              </button>
              <button
                type="button"
                onClick={() => handleTransition("restoreToDraft")}
                className="px-3 py-1 rounded-full border border-slate-400/80 text-[11px] font-semibold"
              >
                restoreToDraft
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mt-2">
              ลองกด action เดียวกันใน state ที่ต่างกัน แล้วสังเกต log ว่าบาง action
              ถูกปฏิเสธ (DENY) ตามกฎของ state
            </p>
          </div>

          {/* Current state + logs */}
          <div className="space-y-4">
            {/* Current state */}
            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs">
              <p className="text-[11px] text-slate-400 mb-1">Current workflow state</p>
              <div className="border border-slate-700 rounded-xl p-3 bg-slate-950/70 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-slate-100">
                    {state.label}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded-full border text-[10px] font-mono ${badgeColor}`}
                  >
                    {state.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {state.description}
                </p>
                <p className="text-[11px] text-slate-300 mt-1">
                  canEdit: <span className="font-mono">{state.canEdit ? "true" : "false"}</span>
                </p>
              </div>
            </div>

            {/* Logs */}
                      <div className="bg-black/50 border border-white/10 rounded-2xl p-4 text-[11px] font-mono max-h-65 overflow-auto">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400">Transition log</p>
                <span className="text-slate-500">{logs.length} entries</span>
              </div>
              {logs.length === 0 && (
                <p className="text-slate-500">
                  ยังไม่มี log — ลองกด action ด้านซ้าย
                </p>
              )}
              {logs.length > 0 && (
                <ul className="space-y-1">
                  {logs.map((line, idx) => (
                    <li key={`${line}-${idx}`} className="text-slate-100">
                      - {line}
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
              เพิ่ม state ใหม่ เช่น <span className="font-mono">ScheduledState</span>
              พร้อม action ใหม่อย่าง <span className="font-mono">schedule()</span>
              แล้วลองต่อปุ่มเพิ่มใน UI
            </li>
            <li>
              แยก Context class จริง ๆ เช่น <span className="font-mono">DocumentContext</span>
              ที่ถือ reference ไปยัง state ปัจจุบัน และมีเมธอด wrapper
              (submitForReview, publish, ฯลฯ) เพื่อใช้ร่วมกับหน้าอื่น
            </li>
            <li>
              ใช้ State Pattern นี้ร่วมกับ Command หรือ Memento
              เพื่อสร้าง workflow ที่ undo/redo ได้พร้อมเก็บ snapshot ของ state
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StateDemoPage;
