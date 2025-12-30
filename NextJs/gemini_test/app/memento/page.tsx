"use client";

import React, { useState } from "react";

/**
 * ---------------------------------------------------------------------
 * MEMENTO PATTERN — SNAPSHOT HISTORY PLAYGROUND (DEMO PAGE)
 * ---------------------------------------------------------------------
 * หน้านี้เป็นสนามทดลองสำหรับ Memento Pattern
 *
 * แนวคิดหลัก:
 * - มี state กลาง (ProfileState) เช่น theme, layout, sections, flags ต่าง ๆ
 * - Originator เป็นคนถือ state และสามารถสร้าง/restore Memento ได้
 * - Caretaker ดูแลประวัติของ Memento (timeline, undo/redo) โดยไม่รู้รายละเอียดภายใน state
 *
 * คุณสามารถ:
 * - เพิ่ม field ใหม่ใน ProfileState แล้วดูว่า snapshot เก็บ/restore ได้ถูกต้อง
 * - เปลี่ยน Caretaker ให้รองรับ branching, multi-track history หรือ limit ความยาว
 * - เชื่อม Memento นี้เข้ากับหน้าอื่น ๆ เพื่อเก็บ config snapshot ของ UI จริง
 */

// 1) DOMAIN MODEL

export type Theme = "dark" | "light" | "neon";

export type LayoutDensity = "compact" | "cozy" | "comfortable";

export interface ProfileState {
  displayName: string;
  theme: Theme;
  layout: LayoutDensity;
  showWidgets: boolean;
  showExperimental: boolean;
  sections: string[];
}

const cloneProfileState = (state: ProfileState): ProfileState => ({
  ...state,
  sections: [...state.sections],
});

// 2) MEMENTO

class ProfileMemento {
  private readonly state: ProfileState;

  readonly label: string;

  readonly createdAt: Date;

  constructor(state: ProfileState, label: string) {
    this.state = cloneProfileState(state);
    this.label = label;
    this.createdAt = new Date();
  }

  getState(): ProfileState {
    return cloneProfileState(this.state);
  }
}

// 3) ORIGINATOR

class ProfileOriginator {
  private state: ProfileState;

  constructor(initial: ProfileState) {
    this.state = cloneProfileState(initial);
  }

  setState(state: ProfileState) {
    this.state = cloneProfileState(state);
  }

  getState(): ProfileState {
    return cloneProfileState(this.state);
  }

  createMemento(label: string): ProfileMemento {
    return new ProfileMemento(this.state, label);
  }

  restore(memento: ProfileMemento) {
    this.state = memento.getState();
  }
}

// 4) CARETAKER

interface TimelineEntry {
  id: number;
  label: string;
  createdAt: Date;
}

class HistoryCaretaker {
  private mementos: ProfileMemento[] = [];

  private index = -1; // ชี้ไปยัง snapshot ปัจจุบัน

  private nextId = 1;

  addSnapshot(memento: ProfileMemento): TimelineEntry[] {
    // ถ้ามี redo history อยู่ ให้ตัดทิ้ง (linear history)
    if (this.index < this.mementos.length - 1) {
      this.mementos = this.mementos.slice(0, this.index + 1);
    }

    this.mementos.push(memento);
    this.index = this.mementos.length - 1;

    return this.getTimeline();
  }

  canUndo(): boolean {
    return this.index > 0;
  }

  canRedo(): boolean {
    return this.index >= 0 && this.index < this.mementos.length - 1;
  }

  undo(originator: ProfileOriginator): { state: ProfileState; timeline: TimelineEntry[] } | null {
    if (!this.canUndo()) return null;
    this.index -= 1;
    const m = this.mementos[this.index];
    originator.restore(m);
    return { state: originator.getState(), timeline: this.getTimeline() };
  }

  redo(originator: ProfileOriginator): { state: ProfileState; timeline: TimelineEntry[] } | null {
    if (!this.canRedo()) return null;
    this.index += 1;
    const m = this.mementos[this.index];
    originator.restore(m);
    return { state: originator.getState(), timeline: this.getTimeline() };
  }

  getCurrent(originator: ProfileOriginator): { state: ProfileState; timeline: TimelineEntry[] } | null {
    if (this.index < 0 || this.index >= this.mementos.length) return null;
    const m = this.mementos[this.index];
    originator.restore(m);
    return { state: originator.getState(), timeline: this.getTimeline() };
  }

  getTimeline(): TimelineEntry[] {
    return this.mementos.map((m, idx) => ({
      id: this.nextId + idx,
      label: m.label,
      createdAt: m.createdAt,
    }));
  }

  getIndex(): number {
    return this.index;
  }

  clear() {
    this.mementos = [];
    this.index = -1;
  }
}

// 5) DEMO PAGE

const initialProfile: ProfileState = {
  displayName: "Ultimate Portfolio Layout",
  theme: "dark",
  layout: "cozy",
  showWidgets: true,
  showExperimental: false,
  sections: ["overview", "timeline", "projects"],
};

const MementoDemoPage: React.FC = () => {
  const [originator] = useState(() => new ProfileOriginator(initialProfile));
  const [caretaker] = useState(() => new HistoryCaretaker());

  const [profile, setProfile] = useState<ProfileState>(() => originator.getState());
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [snapshotLabel, setSnapshotLabel] = useState("");

  const [sectionsInput, setSectionsInput] = useState(
    initialProfile.sections.join(", "),
  );

//   const refreshFromOriginator = () => {
//     const current = caretaker.getCurrent(originator);
//     if (current) {
//       setProfile(current.state);
//       setTimeline(current.timeline);
//       setSectionsInput(current.state.sections.join(", "));
//     } else {
//       setProfile(originator.getState());
//       setTimeline(caretaker.getTimeline());
//     }
//   };

  const handleFieldChange = <K extends keyof ProfileState>(key: K, value: ProfileState[K]) => {
    const updated: ProfileState = { ...profile, [key]: value } as ProfileState;
    setProfile(updated);
  };

  const handleSectionsChange = (value: string) => {
    setSectionsInput(value);
    const sections = value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    handleFieldChange("sections", sections);
  };

  const saveSnapshot = () => {
    originator.setState(profile);
    const label = snapshotLabel.trim() || `Snapshot #${timeline.length + 1}`;
    const memento = originator.createMemento(label);
    const newTimeline = caretaker.addSnapshot(memento);
    setTimeline(newTimeline);
    setSnapshotLabel("");
  };

  const handleUndo = () => {
    const result = caretaker.undo(originator);
    if (result) {
      setProfile(result.state);
      setTimeline(result.timeline);
      setSectionsInput(result.state.sections.join(", "));
    }
  };

  const handleRedo = () => {
    const result = caretaker.redo(originator);
    if (result) {
      setProfile(result.state);
      setTimeline(result.timeline);
      setSectionsInput(result.state.sections.join(", "));
    }
  };

  const handleResetHistory = () => {
    caretaker.clear();
    originator.setState(initialProfile);
    setProfile(originator.getState());
    setTimeline([]);
    setSectionsInput(initialProfile.sections.join(", "));
  };

  const canUndo = caretaker.canUndo();
  const canRedo = caretaker.canRedo();
  const currentIndex = caretaker.getIndex();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-6xl">
        {/* Hero */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-[11px] tracking-[0.25em] text-slate-400 mb-2 uppercase">
              MEMENTO · SNAPSHOT HISTORY DEMO
            </p>
            <h1 className="text-2xl font-semibold mb-1">
              Memento Pattern — Snapshot History Playground
            </h1>
            <p className="text-sm text-slate-300 mb-4 max-w-2xl">
              หน้านี้ใช้ Memento Pattern เพื่อเก็บ snapshot ของการตั้งค่าโปรไฟล์
              และสามารถ undo/redo กลับไปยังสถานะก่อนหน้าได้อย่างปลอดภัย
            </p>
          </div>
        </div>

        {/* Explanation */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs leading-relaxed">
            <h2 className="text-sm font-semibold text-white mb-2">Memento คืออะไร?</h2>
            <p className="text-slate-200 mb-2">
              Memento Pattern แยกความรับผิดชอบในการเก็บ snapshot state ออกจาก client
              โดย Originator เป็นคนสร้าง memento และ Caretaker เป็นคนเก็บรักษา
              โดยไม่ต้องอ่านรายละเอียดภายใน state
            </p>
            <p className="text-slate-400">
              ในหน้านี้ <span className="font-mono">ProfileOriginator</span>
              ถือ <span className="font-mono">ProfileState</span> จริง ๆ
              ส่วน <span className="font-mono">HistoryCaretaker</span>
              จะเก็บ array ของ <span className="font-mono">ProfileMemento</span>
              เพื่อทำ timeline / undo / redo โดยไม่รู้โครงสร้างภายในของ ProfileState
            </p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-200 space-y-1">
            <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-1">
              PARTICIPANTS</p>
            <p>- ProfileState — ข้อมูลการตั้งค่าปัจจุบัน</p>
            <p>- ProfileMemento — snapshot ของ ProfileState + label + createdAt</p>
            <p>- ProfileOriginator — สร้าง/restore memento</p>
            <p>- HistoryCaretaker — ดูแล timeline, undo/redo</p>
            <p className="text-[11px] text-slate-400 mt-2">
              คุณสามารถเพิ่ม field ใหม่ใน ProfileState แล้วดูว่า snapshot เก็บค่าใหม่
              และ restore ย้อนกลับได้ถูกต้องหรือไม่
            </p>
          </div>
        </div>

        {/* Controls + View */}
        <div className="grid lg:grid-cols-[280px,1fr] gap-6 mb-10">
          {/* Profile editor */}
          <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs space-y-4">
            <h3 className="text-sm font-semibold mb-1">Profile editor (Originator state)</h3>

            <div>
              <p className="text-[11px] text-slate-400 mb-1">Display name</p>
              <input
                className="w-full bg-slate-900/80 border border-white/20 rounded px-2 py-1 text-[11px]"
                value={profile.displayName}
                onChange={(e) => handleFieldChange("displayName", e.target.value)}
              />
            </div>

            <div>
              <p className="text-[11px] text-slate-400 mb-1">Theme</p>
              <div className="flex flex-wrap gap-1">
                {(["dark", "light", "neon"] as Theme[]).map((t) => {
                  const active = profile.theme === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleFieldChange("theme", t)}
                      className={`px-3 py-1 rounded-full border text-[11px] transition
                        ${active
                          ? "bg-amber-500/90 border-amber-300 text-black"
                          : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                      `}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[11px] text-slate-400 mb-1">Layout density</p>
              <div className="flex flex-wrap gap-1">
                {(["compact", "cozy", "comfortable"] as LayoutDensity[]).map(
                  (d) => {
                    const active = profile.layout === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleFieldChange("layout", d)}
                        className={`px-3 py-1 rounded-full border text-[11px] transition
                          ${active
                            ? "bg-sky-500/90 border-sky-300 text-black"
                            : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                        `}
                      >
                        {d}
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-[11px] text-slate-300">
                <input
                  type="checkbox"
                  checked={profile.showWidgets}
                  onChange={(e) => handleFieldChange("showWidgets", e.target.checked)}
                />
                Show widgets
              </label>
              <label className="flex items-center gap-2 text-[11px] text-slate-300">
                <input
                  type="checkbox"
                  checked={profile.showExperimental}
                  onChange={(e) =>
                    handleFieldChange("showExperimental", e.target.checked)
                  }
                />
                Show experimental features
              </label>
            </div>

            <div>
              <p className="text-[11px] text-slate-400 mb-1">Sections (comma separated)</p>
              <input
                className="w-full bg-slate-900/80 border border-white/20 rounded px-2 py-1 text-[11px]"
                value={sectionsInput}
                onChange={(e) => handleSectionsChange(e.target.value)}
              />
            </div>

            {/* Snapshot controls */}
            <div className="pt-3 border-t border-white/5 space-y-2">
              <p className="text-[11px] text-slate-400 mb-1">Snapshots (ผ่าน Memento)</p>
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-slate-900/80 border border-white/20 rounded px-2 py-1 text-[11px]"
                  placeholder="Snapshot label (optional)"
                  value={snapshotLabel}
                  onChange={(e) => setSnapshotLabel(e.target.value)}
                />
                <button
                  type="button"
                  onClick={saveSnapshot}
                  className="px-3 py-1 rounded-full border border-emerald-400/80 bg-emerald-500/80 text-[11px] text-black font-semibold"
                >
                  Save snapshot
                </button>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className="px-3 py-1 rounded-full border border-slate-400/80 text-[11px] font-semibold disabled:opacity-40"
                >
                  Undo
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={!canRedo}
                  className="px-3 py-1 rounded-full border border-sky-400/80 text-[11px] font-semibold disabled:opacity-40"
                >
                  Redo
                </button>
                <button
                  type="button"
                  onClick={handleResetHistory}
                  className="ml-auto px-3 py-1 rounded-full border border-red-400/80 text-[11px] font-semibold text-red-200 hover:bg-red-500/20"
                >
                  Clear history & reset
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Current snapshot index: {currentIndex >= 0 ? currentIndex + 1 : "—"} /
                {" "}
                {timeline.length}
              </p>
            </div>
          </div>

          {/* Preview + timeline */}
          <div className="space-y-4">
            {/* Profile preview */}
            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs">
              <p className="text-[11px] text-slate-400 mb-1">Profile preview (จาก Originator)</p>
              <div className="border border-slate-700 rounded-xl p-3 bg-slate-950/70 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-slate-100">
                    {profile.displayName || "(no name)"}
                  </h2>
                  <span
                    className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-600 text-[10px] font-mono"
                  >
                    {profile.theme} · {profile.layout}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-[11px] text-slate-300">
                  <span>Widgets: {profile.showWidgets ? "ON" : "off"}</span>
                  <span>
                    Experimental: {profile.showExperimental ? "ON" : "off"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.sections.length === 0 && (
                    <span className="text-[10px] text-slate-500">no sections</span>
                  )}
                  {profile.sections.map((sec) => (
                    <span
                      key={sec}
                      className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-600 text-[10px]"
                    >
                      {sec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline */}
                      <div className="bg-black/50 border border-white/10 rounded-2xl p-4 text-[11px] font-mono max-h-65 overflow-auto">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400">Snapshot timeline</p>
                <span className="text-slate-500">{timeline.length} snapshots</span>
              </div>
              {timeline.length === 0 && (
                <p className="text-slate-500">
                  ยังไม่มี snapshot — ปรับค่าด้านซ้ายแล้วกด `Save snapshot`
                </p>
              )}
              {timeline.length > 0 && (
                <ul className="space-y-1">
                  {timeline.map((entry, idx) => {
                    const active = idx === currentIndex;
                    return (
                      <li
                        key={entry.id}
                        className={`flex items-center justify-between gap-2 px-2 py-1 rounded
                          ${active ? "bg-amber-500/20 border border-amber-400/60" : ""}
                        `}
                      >
                        <div className="flex flex-col">
                          <span className="text-slate-100 truncate">
                            {entry.label}
                          </span>
                          <span className="text-slate-500 text-[10px]">
                            {entry.createdAt.toLocaleTimeString()}
                          </span>
                        </div>
                        <span className="text-slate-500 text-[10px]">#{idx + 1}</span>
                      </li>
                    );
                  })}
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
              เพิ่ม field ใหม่ใน <span className="font-mono">ProfileState</span>
              เช่น language, timezone แล้วดูว่าถูกเก็บใน snapshot และ restore
              ย้อนกลับถูกต้องหรือไม่
            </li>
            <li>
              เปลี่ยน <span className="font-mono">HistoryCaretaker</span>
              ให้รองรับ branching (มีหลาย timeline) หรือจำกัดจำนวน snapshot สูงสุด
            </li>
            <li>
              ใช้ Memento นี้ร่วมกับ Command/State เพื่อสร้างระบบ undo/redo
              ที่เก็บ snapshot แบบเต็ม (memento) ควบคู่กับ command history
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MementoDemoPage;
