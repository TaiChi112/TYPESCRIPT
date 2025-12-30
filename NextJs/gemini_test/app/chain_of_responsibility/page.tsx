"use client";

import React, { useCallback, useMemo, useState } from "react";

/**
 * ---------------------------------------------------------------------
 * CHAIN OF RESPONSIBILITY — MODERATION PIPELINE PLAYGROUND (DEMO PAGE)
 * ---------------------------------------------------------------------
 * หน้านี้เป็นสนามทดลองสำหรับ Chain of Responsibility
 *
 * แนวคิดหลัก:
 * - มีคำขอ (request) หนึ่งอัน เช่น content ที่จะโพสต์
 * - มี handler หลายตัวเรียงเป็น chain เช่น ตรวจความยาว title, ตรวจคำต้องห้าม, ตรวจ owner
 * - แต่ละ handler ตัดสินใจเองว่าจะ handle / log อะไร และจะส่งต่อให้ตัวถัดไปหรือหยุด chain
 *
 * คุณสามารถ:
 * - เปิด/ปิด handler บางตัว แล้วดูว่าผลลัพธ์ chain เปลี่ยนอย่างไร
 * - เพิ่ม handler ใหม่ เช่น LanguageDetectionHandler, SpamScoreHandler
 * - เปลี่ยนกฎใน handler แต่ละตัวได้โดยไม่ต้องแก้โค้ดส่วนอื่น
 */

// 1) DOMAIN MODEL

type Priority = "low" | "normal" | "high";

interface ModerationRequest {
  title: string;
  body: string;
  tags: string[];
  owner?: string;
  isPublic: boolean;
  priority: Priority;
}

type Severity = "info" | "warning" | "error";

interface ModerationLogEntry {
  id: number;
  handler: string;
  severity: Severity;
  message: string;
  stopped: boolean;
}

// 2) HANDLER INTERFACE + BASE CLASS

interface IModerationHandler {
  setNext(handler: IModerationHandler): IModerationHandler;
  handle(request: ModerationRequest, logs: ModerationLogEntry[]): void;
}

let globalLogId = 1;

abstract class BaseModerationHandler implements IModerationHandler {
  protected next: IModerationHandler | null = null;
  protected abstract readonly name: string;

  setNext(handler: IModerationHandler): IModerationHandler {
    this.next = handler;
    return handler;
  }

  protected pushLog(
    logs: ModerationLogEntry[],
    severity: Severity,
    message: string,
    stopped = false,
  ) {
    logs.push({
      id: globalLogId += 1,
      handler: this.name,
      severity,
      message,
      stopped,
    });
  }

  protected continue(request: ModerationRequest, logs: ModerationLogEntry[]) {
    if (this.next) {
      this.next.handle(request, logs);
    }
  }

  abstract handle(request: ModerationRequest, logs: ModerationLogEntry[]): void;
}

// 3) CONCRETE HANDLERS

class TitleLengthHandler extends BaseModerationHandler {
  protected readonly name = "TitleLengthHandler";

  handle(request: ModerationRequest, logs: ModerationLogEntry[]): void {
    const len = request.title.trim().length;
    if (len === 0) {
      this.pushLog(logs, "error", "Title is required", true);
      return;
    }
    if (len < 8) {
      this.pushLog(logs, "warning", `Title is quite short (${len} chars)`);
    } else if (len > 80) {
      this.pushLog(logs, "warning", `Title is long (${len} chars)`);
    } else {
      this.pushLog(logs, "info", `Title length OK (${len} chars)`);
    }
    this.continue(request, logs);
  }
}

class ForbiddenWordHandler extends BaseModerationHandler {
  protected readonly name = "ForbiddenWordHandler";

  private forbidden = ["hack", "attack", "scam", "xxx"];

  handle(request: ModerationRequest, logs: ModerationLogEntry[]): void {
    const text = `${request.title} ${request.body}`.toLowerCase();
    const found = this.forbidden.filter((w) => text.includes(w));
    if (found.length > 0) {
      this.pushLog(
        logs,
        "error",
        `Found forbidden words: ${found.join(", ")}`,
        true,
      );
      return;
    }
    this.pushLog(logs, "info", "No forbidden words detected");
    this.continue(request, logs);
  }
}

class TagCountHandler extends BaseModerationHandler {
  protected readonly name = "TagCountHandler";

  handle(request: ModerationRequest, logs: ModerationLogEntry[]): void {
    const count = request.tags.length;
    if (count === 0) {
      this.pushLog(logs, "warning", "No tags provided");
    } else if (count > 6) {
      this.pushLog(
        logs,
        "warning",
        `Too many tags (${count}), consider reducing to 3–6`,
      );
    } else {
      this.pushLog(logs, "info", `Tag count OK (${count})`);
    }
    this.continue(request, logs);
  }
}

class OwnershipHandler extends BaseModerationHandler {
  protected readonly name = "OwnershipHandler";

  handle(request: ModerationRequest, logs: ModerationLogEntry[]): void {
    if (!request.owner || request.owner.trim().length === 0) {
      if (request.isPublic) {
        this.pushLog(
          logs,
          "error",
          "Public content must have an owner",
          true,
        );
        return;
      }
      this.pushLog(logs, "warning", "Draft content has no owner set yet");
      this.continue(request, logs);
      return;
    }
    this.pushLog(logs, "info", `Owner set to "${request.owner.trim()}"`);
    this.continue(request, logs);
  }
}

class PriorityEscalationHandler extends BaseModerationHandler {
  protected readonly name = "PriorityEscalationHandler";

  handle(request: ModerationRequest, logs: ModerationLogEntry[]): void {
    if (!request.isPublic) {
      this.pushLog(logs, "info", "Draft content: priority checks skipped");
      this.continue(request, logs);
      return;
    }

    if (request.priority === "high") {
      this.pushLog(
        logs,
        "warning",
        "High priority content — should be reviewed by a human moderator",
      );
    } else if (request.priority === "low") {
      this.pushLog(logs, "info", "Low priority content — auto-review is enough");
    } else {
      this.pushLog(logs, "info", "Normal priority content");
    }
    this.continue(request, logs);
  }
}

// Available handlers for UI
const HANDLER_DEFINITIONS = [
  {
    id: "title" as const,
    name: "TitleLengthHandler",
    description: "ตรวจความยาวของ title และ require ว่าต้องไม่ว่าง",
    create: () => new TitleLengthHandler(),
  },
  {
    id: "forbidden" as const,
    name: "ForbiddenWordHandler",
    description: "ตรวจคำต้องห้ามแบบง่าย ๆ ใน title + body",
    create: () => new ForbiddenWordHandler(),
  },
  {
    id: "tags" as const,
    name: "TagCountHandler",
    description: "เตือนถ้ามี tag น้อยเกินไป หรือเยอะเกินไป",
    create: () => new TagCountHandler(),
  },
  {
    id: "owner" as const,
    name: "OwnershipHandler",
    description: "require owner เมื่อเป็น public content",
    create: () => new OwnershipHandler(),
  },
  {
    id: "priority" as const,
    name: "PriorityEscalationHandler",
    description: "เพิ่ม log ตาม priority และสถานะ public/draft",
    create: () => new PriorityEscalationHandler(),
  },
];

export type HandlerId = (typeof HANDLER_DEFINITIONS)[number]["id"];

// Helper: build chain ตามลำดับ handlerIds
const buildChain = (handlerIds: HandlerId[]): IModerationHandler | null => {
  if (handlerIds.length === 0) return null;

  let first: IModerationHandler | null = null;
  let current: IModerationHandler | null = null;

  handlerIds.forEach((id) => {
    const def = HANDLER_DEFINITIONS.find((h) => h.id === id);
    if (!def) return;
    const handler = def.create();
    if (!first) {
      first = handler;
    }
    if (current) {
      current.setNext(handler);
    }
    current = handler;
  });

  return first;
};

// Utility: หาค่า severity สูงสุดใน log
const getOverallSeverity = (logs: ModerationLogEntry[]): Severity | null => {
  let result: Severity | null = null;
  for (const l of logs) {
    if (l.severity === "error") return "error";
    if (l.severity === "warning") result = "warning";
    if (l.severity === "info" && !result) result = "info";
  }
  return result;
};

// 4) REACT DEMO PAGE

const ChainOfResponsibilityDemoPage: React.FC = () => {
  const [title, setTitle] = useState("Welcome to my portfolio");
  const [body, setBody] = useState(
    "This page showcases multiple design patterns combined into a single experience.",
  );
  const [tagsInput, setTagsInput] = useState("patterns, portfolio, demo");
  const [owner, setOwner] = useState("alice");
  const [isPublic, setIsPublic] = useState(true);
  const [priority, setPriority] = useState<Priority>("normal");

  const [activeHandlers, setActiveHandlers] = useState<HandlerId[]>([
    "title",
    "forbidden",
    "tags",
    "owner",
    "priority",
  ]);

  const [logs, setLogs] = useState<ModerationLogEntry[]>([]);

  const handlerCount = activeHandlers.length;

  const chain = useMemo(() => buildChain(activeHandlers), [activeHandlers]);

  const overallSeverity = useMemo(() => getOverallSeverity(logs), [logs]);

  const runPipeline = useCallback(() => {
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const request: ModerationRequest = {
      title,
      body,
      tags,
      owner,
      isPublic,
      priority,
    };

    const newLogs: ModerationLogEntry[] = [];
    if (!chain) {
      newLogs.push({
        id: globalLogId += 1,
        handler: "System",
        severity: "info",
        message: "No handlers in chain — nothing to validate",
        stopped: false,
      });
    } else {
      chain.handle(request, newLogs);
    }

    setLogs(newLogs);
  }, [title, body, tagsInput, owner, isPublic, priority, chain]);

  const toggleHandler = (id: HandlerId) => {
    setLogs([]);
    setActiveHandlers((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id],
    );
  };

  const orderedHandlerDefs = useMemo(
    () => HANDLER_DEFINITIONS,
    [],
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-6xl">
        {/* Hero */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-[11px] tracking-[0.25em] text-slate-400 mb-2 uppercase">
              CHAIN OF RESPONSIBILITY · MODERATION PIPELINE DEMO
            </p>
            <h1 className="text-2xl font-semibold mb-1">
              Chain of Responsibility — Moderation Pipeline Playground
            </h1>
            <p className="text-sm text-slate-300 mb-4 max-w-2xl">
              หน้านี้ใช้ Chain of Responsibility เพื่อเรียง handler ตรวจ content แบบ
              pipeline ที่สามารถเปิด/ปิด และเพิ่ม/ลบ handler ได้ง่าย โดยไม่ผูกกับ UI โดยตรง
            </p>
          </div>
        </div>

        {/* Explanation */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs leading-relaxed">
            <h2 className="text-sm font-semibold text-white mb-2">Chain of Responsibility คืออะไร?</h2>
            <p className="text-slate-200 mb-2">
              Chain of Responsibility Pattern ทำให้เราส่ง request ผ่าน handler หลายตัว
              ที่เชื่อมต่อกันเป็น chain โดยแต่ละ handler ตัดสินใจเองว่าจะ handle
              หรือส่งต่อไปยังตัวถัดไป
            </p>
            <p className="text-slate-400">
              ในหน้านี้แต่ละ handler ตรวจส่วนหนึ่งของ request เช่น title, tag, owner
              ถ้าพบปัญหาอาจเลือกหยุด chain ทันที (เช่น ForbiddenWordHandler)
              หรือแค่ log แล้วส่งต่อไปยัง handler ถัดไป
            </p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-200 space-y-1">
            <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-1">
              AVAILABLE HANDLERS
            </p>
            {orderedHandlerDefs.map((h) => (
              <p key={h.id}>
                - {h.name}: <span className="text-slate-400">{h.description}</span>
              </p>
            ))}
            <p className="text-[11px] text-slate-400 mt-2">
              คุณสามารถเพิ่ม handler ใหม่ได้โดย extends
              <span className="font-mono"> BaseModerationHandler</span> แล้วเพิ่มเข้าใน
              <span className="font-mono">HANDLER_DEFINITIONS</span>
            </p>
          </div>
        </div>

        {/* Controls + Logs */}
        <div className="grid lg:grid-cols-[280px,1fr] gap-6 mb-10">
          {/* Request editor & handler toggles */}
          <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs space-y-4">
            <h3 className="text-sm font-semibold mb-1">Request & Chain</h3>

            {/* Content form */}
            <div className="space-y-2">
              <div>
                <p className="text-[11px] text-slate-400 mb-1">Title</p>
                <input
                  className="w-full bg-slate-900/80 border border-white/20 rounded px-2 py-1 text-[11px]"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 mb-1">Body</p>
                <textarea
                  className="w-full bg-slate-900/80 border border-white/20 rounded px-2 py-1 text-[11px] min-h-15"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 mb-1">Tags (comma separated)</p>
                <input
                  className="w-full bg-slate-900/80 border border-white/20 rounded px-2 py-1 text-[11px]"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-[11px] text-slate-400 mb-1">Owner</p>
                  <input
                    className="w-full bg-slate-900/80 border border-white/20 rounded px-2 py-1 text-[11px]"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[11px] text-slate-400 mb-1">Public?</p>
                  <button
                    type="button"
                    onClick={() => setIsPublic((v) => !v)}
                    className={`px-3 py-1 rounded-full border text-[11px] transition
                      ${isPublic
                        ? "bg-emerald-500/90 border-emerald-300 text-black"
                        : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                    `}
                  >
                    {isPublic ? "Public" : "Draft"}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 mb-1">Priority</p>
                <div className="flex flex-wrap gap-1">
                  {["low", "normal", "high"].map((p) => {
                    const active = priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p as Priority)}
                        className={`px-3 py-1 rounded-full border text-[11px] transition
                          ${active
                            ? "bg-orange-500/90 border-orange-300 text-black"
                            : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                        `}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Handler toggles */}
            <div className="pt-3 border-t border-white/5 space-y-2">
              <p className="text-[11px] text-slate-400 mb-1">
                Active handlers (จัดเรียงตามลำดับในตารางด้านบน)
              </p>
              <div className="flex flex-wrap gap-1">
                {orderedHandlerDefs.map((h) => {
                  const active = activeHandlers.includes(h.id);
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => toggleHandler(h.id)}
                      className={`px-3 py-1 rounded-full border text-[11px] transition
                        ${active
                          ? "bg-sky-500/90 border-sky-300 text-white"
                          : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                      `}
                    >
                      {h.id}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                handlers in chain: <span className="font-semibold">{handlerCount}</span>
              </p>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={runPipeline}
                className="px-3 py-1 rounded-full border border-emerald-400/80 bg-emerald-500/80 text-[11px] text-black font-semibold"
              >
                Run moderation pipeline
              </button>
              <div className="text-[11px] text-slate-400">
                Overall status: {" "}
                {overallSeverity === "error" && (
                  <span className="text-red-400 font-semibold">ERROR</span>
                )}
                {overallSeverity === "warning" && !overallSeverity?.includes("error") && (
                  <span className="text-amber-300 font-semibold">WARNING</span>
                )}
                {overallSeverity === "info" && (
                  <span className="text-emerald-300 font-semibold">OK</span>
                )}
                {!overallSeverity && <span className="text-slate-500">(no run yet)</span>}
              </div>
            </div>
          </div>

          {/* Logs view */}
          <div className="bg-black/50 border border-white/10 rounded-2xl p-4 text-[11px] font-mono max-h-115 overflow-auto">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400">Handler logs (ตามลำดับการวิ่งใน chain)</p>
              <button
                type="button"
                onClick={() => setLogs([])}
                className="px-2 py-0.5 rounded-full border border-slate-500/80 text-[10px] text-slate-200 hover:border-slate-300/80"
              >
                Clear
              </button>
            </div>
            {logs.length === 0 && (
              <p className="text-slate-500">
                ยังไม่มี log — ปรับค่าด้านซ้ายแล้วกด `Run moderation pipeline`
              </p>
            )}
            {logs.length > 0 && (
              <ul className="space-y-1">
                {logs.map((log) => (
                  <li key={log.id} className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{log.handler}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full border text-[9px]
                          ${log.severity === "error"
                            ? "border-red-400/80 text-red-300"
                            : log.severity === "warning"
                            ? "border-amber-400/80 text-amber-200"
                            : "border-emerald-400/80 text-emerald-200"}
                        `}
                      >
                        {log.severity.toUpperCase()}
                      </span>
                      {log.stopped && (
                        <span className="px-1.5 py-0.5 rounded-full border border-pink-400/80 text-[9px] text-pink-200">
                          STOPPED CHAIN
                        </span>
                      )}
                    </div>
                    <div className="text-slate-200">{log.message}</div>
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
              เพิ่ม handler ใหม่ เช่น <span className="font-mono">LanguageDetectionHandler</span>
              หรือ <span className="font-mono">SpamScoreHandler</span> แล้วใส่เข้าไปใน
              <span className="font-mono">HANDLER_DEFINITIONS</span>
            </li>
            <li>
              เปลี่ยนให้ handler บางตัวไม่หยุด chain แม้จะเป็น error
              เพื่อจำลองการเก็บ log แล้วค่อย reject ทีหลัง
            </li>
            <li>
              ทดลองเชื่อม Chain นี้กับ Facade หรือ Proxy จากหน้าอื่น ๆ
              เช่นให้ Proxy เรียก chain เพื่อ validate ก่อนยิง API จริง
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChainOfResponsibilityDemoPage;
