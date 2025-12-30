"use client";

import React, { useState } from "react";

/**
 * ---------------------------------------------------------------------
 * COMMAND PATTERN — UNDO/REDO EDITOR PLAYGROUND (DEMO PAGE)
 * ---------------------------------------------------------------------
 * หน้านี้เป็นสนามทดลองสำหรับ Command Pattern
 *
 * แนวคิดหลัก:
 * - มี state กลาง (DocumentState) เช่น title, content, tags, published
 * - ทุก action (เช่น เปลี่ยน title, เพิ่ม tag, toggle publish) ถูกห่อเป็น "Command"
 * - Command มีเมธอด execute() และ undo() ทำให้สามารถสร้าง undo/redo manager ได้ง่าย
 *
 * คุณสามารถ:
 * - เพิ่ม command ใหม่ เช่น ClearTagsCommand, ReplaceBodyCommand
 * - เปลี่ยนให้ command บางตัวเป็น macro (เรียกหลาย command ย่อย)
 * - เพิ่ม persistence หรือเชื่อม CommandManager เข้ากับหน้าอื่น ๆ
 */

// 1) DOMAIN MODEL

interface DocumentState {
  title: string;
  body: string;
  tags: string[];
  published: boolean;
}

const cloneState = (state: DocumentState): DocumentState => ({
  ...state,
  tags: [...state.tags],
});

// 2) COMMAND INTERFACE + BASE CLASS

interface ICommand {
  readonly label: string;
  execute(state: DocumentState): DocumentState;
  undo(state: DocumentState): DocumentState;
}

abstract class BaseCommand implements ICommand {
  protected before: DocumentState | null = null;
  abstract readonly label: string;

  protected captureBefore(state: DocumentState) {
    this.before = cloneState(state);
  }

  execute(state: DocumentState): DocumentState {
    this.captureBefore(state);
    return this.doExecute(state);
  }

  undo(): DocumentState {
    if (!this.before) {
      throw new Error("No previous state captured for undo");
    }
    return cloneState(this.before);
  }

  protected abstract doExecute(state: DocumentState): DocumentState;
}

// 3) CONCRETE COMMANDS

class SetTitleCommand extends BaseCommand {
  readonly label: string;

  private newTitle: string;

  constructor(newTitle: string) {
    super();
    this.newTitle = newTitle;
    this.label = `Set title → "${newTitle || "(empty)"}"`;
  }

  protected doExecute(state: DocumentState): DocumentState {
    const next = cloneState(state);
    next.title = this.newTitle;
    return next;
  }
}

class SetBodyCommand extends BaseCommand {
  readonly label: string;

  private newBody: string;

  constructor(newBody: string) {
    super();
    this.newBody = newBody;
    this.label = `Set body (${newBody.length} chars)`;
  }

  protected doExecute(state: DocumentState): DocumentState {
    const next = cloneState(state);
    next.body = this.newBody;
    return next;
  }
}

class AddTagCommand extends BaseCommand {
  readonly label: string;

  private tag: string;

  constructor(tag: string) {
    super();
    this.tag = tag.trim();
    this.label = `Add tag "${this.tag}"`;
  }

  protected doExecute(state: DocumentState): DocumentState {
    const next = cloneState(state);
    if (this.tag && !next.tags.includes(this.tag)) {
      next.tags.push(this.tag);
    }
    return next;
  }
}

class RemoveLastTagCommand extends BaseCommand {
  readonly label = "Remove last tag";

  protected doExecute(state: DocumentState): DocumentState {
    const next = cloneState(state);
    next.tags.pop();
    return next;
  }
}

class TogglePublishedCommand extends BaseCommand {
  readonly label = "Toggle published";

  protected doExecute(state: DocumentState): DocumentState {
    const next = cloneState(state);
    next.published = !next.published;
    return next;
  }
}

// Example macro command: publish with preset tags
class PublishWithTagCommand extends BaseCommand {
  readonly label: string;

  private tag: string;

  constructor(tag: string) {
    super();
    this.tag = tag.trim();
    this.label = `Publish with tag "${this.tag || "featured"}"`;
  }

  protected doExecute(state: DocumentState): DocumentState {
    const next = cloneState(state);
    next.published = true;
    const tag = this.tag || "featured";
    if (!next.tags.includes(tag)) {
      next.tags.push(tag);
    }
    return next;
  }
}

// 4) COMMAND MANAGER (INVOKER)

interface HistoryEntry {
  id: number;
  label: string;
}

class CommandManager {
  private state: DocumentState;

  private undoStack: ICommand[] = [];

  private redoStack: ICommand[] = [];

  private history: HistoryEntry[] = [];

  private nextId = 1;

  constructor(initialState: DocumentState) {
    this.state = cloneState(initialState);
  }

  getState(): DocumentState {
    return cloneState(this.state);
  }

  getHistory(): HistoryEntry[] {
    return [...this.history];
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  executeCommand(cmd: ICommand): DocumentState {
    const nextState = cmd.execute(this.state);
    this.state = cloneState(nextState);
    this.undoStack.push(cmd);
    this.redoStack = [];
    this.history.push({ id: this.nextId += 1, label: cmd.label });
    return this.getState();
  }

  undo(): DocumentState | null {
    const cmd = this.undoStack.pop();
    if (!cmd) return null;
    const prevState = (cmd as BaseCommand).undo(this.state);
    this.state = cloneState(prevState);
    this.redoStack.push(cmd);
    return this.getState();
  }

  redo(): DocumentState | null {
    const cmd = this.redoStack.pop();
    if (!cmd) return null;
    const nextState = cmd.execute(this.state);
    this.state = cloneState(nextState);
    this.undoStack.push(cmd);
    return this.getState();
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.history = [];
  }

  getUndoCount(): number {
    return this.undoStack.length;
  }

  getRedoCount(): number {
    return this.redoStack.length;
  }
}

// 5) DEMO PAGE

const initialDoc: DocumentState = {
  title: "My Design Patterns Portfolio",
  body: "This document is controlled entirely by commands.",
  tags: ["patterns", "portfolio"],
  published: false,
};

const CommandDemoPage: React.FC = () => {
  const [manager] = useState(() => new CommandManager(initialDoc));
  const [doc, setDoc] = useState<DocumentState>(() => manager.getState());

  const [titleInput, setTitleInput] = useState(doc.title);
  const [bodyInput, setBodyInput] = useState(doc.body);
  const [tagInput, setTagInput] = useState("");

  const [history, setHistory] = useState<HistoryEntry[]>(
    manager.getHistory(),
  );

  const refreshFromManager = () => {
    setDoc(manager.getState());
    setHistory(manager.getHistory());
  };

  const runCommand = (cmd: ICommand) => {
    manager.executeCommand(cmd);
    refreshFromManager();
  };

  const handleUndo = () => {
    manager.undo();
    refreshFromManager();
  };

  const handleRedo = () => {
    manager.redo();
    refreshFromManager();
  };

  const handleReset = () => {
    manager.clear();
    const resetState = new CommandManager(initialDoc).getState();
    (manager as unknown as { state: DocumentState }).state = cloneState(resetState);
    refreshFromManager();
  };

  const undoCount = manager.getUndoCount();
  const redoCount = manager.getRedoCount();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-6xl">
        {/* Hero */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-lime-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-[11px] tracking-[0.25em] text-slate-400 mb-2 uppercase">
              COMMAND · UNDO/REDO EDITOR DEMO
            </p>
            <h1 className="text-2xl font-semibold mb-1">
              Command Pattern — Undo/Redo Editor Playground
            </h1>
            <p className="text-sm text-slate-300 mb-4 max-w-2xl">
              หน้านี้ใช้ Command Pattern เพื่อควบคุมการแก้ไข DocumentState ทั้งหมดผ่าน
              command objects ทำให้สามารถ undo/redo ได้อย่างเป็นระบบ
            </p>
          </div>
        </div>

        {/* Explanation */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs leading-relaxed">
            <h2 className="text-sm font-semibold text-white mb-2">Command คืออะไร?</h2>
            <p className="text-slate-200 mb-2">
              Command Pattern ห่อการกระทำ (operation) ให้กลายเป็น object
              ที่มีเมธอด execute() และ undo() ทำให้เราสามารถจัดการ history,
              queue, macro commands ได้ง่าย
            </p>
            <p className="text-slate-400">
              ในหน้านี้ทุกการเปลี่ยนแปลงของ document (title, body, tags, published)
              มาจาก command ทั้งหมด ไม่มีการ set state ตรง ๆ จาก UI เลย
            </p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-200 space-y-1">
            <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-1">
              AVAILABLE COMMANDS
            </p>
            <p>- SetTitleCommand — เปลี่ยน title</p>
            <p>- SetBodyCommand — เปลี่ยน body ทั้งหมด</p>
            <p>- AddTagCommand — เพิ่ม tag (ถ้าไม่มีอยู่แล้ว)</p>
            <p>- RemoveLastTagCommand — ลบ tag สุดท้าย</p>
            <p>- TogglePublishedCommand — toggle ค่าสถานะ published</p>
            <p>- PublishWithTagCommand — macro: published=true และเพิ่ม tag พิเศษ</p>
            <p className="text-[11px] text-slate-400 mt-2">
              คุณสามารถเพิ่ม command ใหม่ได้โดย extends
              <span className="font-mono"> BaseCommand</span> และเรียกใช้ผ่าน
              <span className="font-mono">CommandManager.executeCommand()</span>
            </p>
          </div>
        </div>

        {/* Controls + View */}
        <div className="grid lg:grid-cols-[280px,1fr] gap-6 mb-10">
          {/* Controls */}
          <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs space-y-4">
            <h3 className="text-sm font-semibold mb-1">Commands</h3>

            {/* Title */}
            <div>
              <p className="text-[11px] text-slate-400 mb-1">Title</p>
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-slate-900/80 border border-white/20 rounded px-2 py-1 text-[11px]"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => runCommand(new SetTitleCommand(titleInput))}
                  className="px-3 py-1 rounded-full border border-emerald-400/80 bg-emerald-500/80 text-[11px] text-black font-semibold"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Body */}
            <div>
              <p className="text-[11px] text-slate-400 mb-1">Body</p>
              <textarea
                className="w-full bg-slate-900/80 border border-white/20 rounded px-2 py-1 text-[11px] min-h-[70px] mb-2"
                value={bodyInput}
                onChange={(e) => setBodyInput(e.target.value)}
              />
              <button
                type="button"
                onClick={() => runCommand(new SetBodyCommand(bodyInput))}
                className="px-3 py-1 rounded-full border border-sky-400/80 bg-sky-500/80 text-[11px] text-black font-semibold"
              >
                Apply body
              </button>
            </div>

            {/* Tags */}
            <div>
              <p className="text-[11px] text-slate-400 mb-1">Add tag</p>
              <div className="flex gap-2 mb-1">
                <input
                  className="flex-1 bg-slate-900/80 border border-white/20 rounded px-2 py-1 text-[11px]"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (tagInput.trim()) {
                      runCommand(new AddTagCommand(tagInput));
                      setTagInput("");
                    }
                  }}
                  className="px-3 py-1 rounded-full border border-amber-400/80 bg-amber-500/80 text-[11px] text-black font-semibold"
                >
                  Add
                </button>
              </div>
              <button
                type="button"
                onClick={() => runCommand(new RemoveLastTagCommand())}
                className="px-3 py-1 rounded-full border border-slate-400/80 bg-slate-600/80 text-[11px] text-black font-semibold"
              >
                Remove last tag
              </button>
            </div>

            {/* Publish related */}
            <div className="border-t border-white/5 pt-3 space-y-2">
              <button
                type="button"
                onClick={() => runCommand(new TogglePublishedCommand())}
                className="px-3 py-1 rounded-full border border-indigo-400/80 bg-indigo-500/80 text-[11px] text-black font-semibold"
              >
                Toggle published
              </button>
              <button
                type="button"
                onClick={() => runCommand(new PublishWithTagCommand("featured"))}
                className="px-3 py-1 rounded-full border border-pink-400/80 bg-pink-500/80 text-[11px] text-black font-semibold"
              >
                Publish as featured
              </button>
            </div>

            {/* Undo / Redo / Reset */}
            <div className="border-t border-white/5 pt-3 flex flex-wrap gap-2 items-center">
              <button
                type="button"
                disabled={!manager.canUndo()}
                onClick={handleUndo}
                className="px-3 py-1 rounded-full border border-emerald-400/80 text-[11px] font-semibold disabled:opacity-40"
              >
                Undo ({undoCount})
              </button>
              <button
                type="button"
                disabled={!manager.canRedo()}
                onClick={handleRedo}
                className="px-3 py-1 rounded-full border border-sky-400/80 text-[11px] font-semibold disabled:opacity-40"
              >
                Redo ({redoCount})
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="ml-auto px-3 py-1 rounded-full border border-red-400/80 text-[11px] font-semibold text-red-200 hover:bg-red-500/20"
              >
                Clear history & reset
              </button>
            </div>
          </div>

          {/* Document view & History */}
          <div className="space-y-4">
            {/* Document preview */}
            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs">
              <p className="text-[11px] text-slate-400 mb-1">DocumentState (ปัจจุบัน)</p>
              <div className="border border-slate-700 rounded-xl p-3 bg-slate-950/70 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-slate-100">
                    {doc.title || "(no title)"}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono border
                      ${doc.published
                        ? "bg-emerald-900/60 border-emerald-500/80 text-emerald-100"
                        : "bg-slate-900/80 border-slate-500/80 text-slate-200"}
                    `}
                  >
                    {doc.published ? "PUBLISHED" : "DRAFT"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {doc.body || "(empty body)"}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {doc.tags.length === 0 && (
                    <span className="text-[10px] text-slate-500">no tags</span>
                  )}
                  {doc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-600 text-[10px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* History list */}
            <div className="bg-black/50 border border-white/10 rounded-2xl p-4 text-[11px] font-mono max-h-[260px] overflow-auto">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400">Executed command history</p>
                <span className="text-slate-500">{history.length} entries</span>
              </div>
              {history.length === 0 && (
                <p className="text-slate-500">ยังไม่มี command — ลองกดปุ่มด้านซ้าย</p>
              )}
              {history.length > 0 && (
                <ul className="space-y-1">
                  {history.map((h) => (
                    <li key={h.id} className="text-slate-100">
                      - {h.label}
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
              เพิ่ม command ใหม่ เช่น <span className="font-mono">ClearTagsCommand</span>
              หรือ <span className="font-mono">AppendBodyCommand</span>
              แล้วเรียกผ่าน <span className="font-mono">runCommand()</span>
            </li>
            <li>
              เปลี่ยน <span className="font-mono">CommandManager</span> ให้รองรับ grouping
              (เช่น รวมหลาย command เป็น batch เดียวเพื่อ undo ครั้งเดียว)
            </li>
            <li>
              เชื่อม Command Pattern นี้เข้ากับ State/Observer จากหน้าอื่น
              เพื่อให้ทุกการ execute/undo trigger side effects เพิ่มเติม
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CommandDemoPage;
