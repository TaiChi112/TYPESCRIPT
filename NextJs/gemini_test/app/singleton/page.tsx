"use client";

import React, { useState } from "react";

/**
 * ---------------------------------------------------------------------
 * SINGLETON PATTERN — GLOBAL LOGGER PLAYGROUND (DEMO PAGE)
 * ---------------------------------------------------------------------
 * หน้านี้เป็นสนามทดลองสำหรับ Singleton Pattern โดยเฉพาะ
 *
 * แนวคิดหลัก:
 * - มี class ที่มี instance เดียวตลอดอายุการทำงานของแอป (per session/process)
 * - ใช้ static method (getInstance) เป็น global access point
 * - ใช้ร่วมกันจากหลาย component ได้ โดยแชร์ state เดียวกัน
 *
 * คุณสามารถ:
 * - เพิ่ม field ใหม่ให้ Singleton (เช่น level, userId, metadata ฯลฯ)
 * - เพิ่ม method เช่น setLevel, filterLogs, exportLogs
 * - ทดลองดูผลว่าทุก component เห็น state เดียวกันเสมอ
 */

// 1) SINGLETON IMPLEMENTATION (Simple Session Logger)
class LoggerSingleton {
  private static instance: LoggerSingleton | null = null;

  private logs: string[] = [];
  private readonly instanceId: string;

  private constructor() {
    this.instanceId = Math.random().toString(36).slice(2, 8);
    this.addLog("LoggerSingleton initialized.");
  }

  public static getInstance(): LoggerSingleton {
    if (!LoggerSingleton.instance) {
      LoggerSingleton.instance = new LoggerSingleton();
    }
    return LoggerSingleton.instance;
  }

  public addLog(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.unshift(`[${timestamp}] ${message}`);
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(0, 50);
    }
  }

  public clear(): void {
    this.logs = [];
    this.addLog("Logs cleared.");
  }

  public getLogs(): string[] {
    return this.logs;
  }

  public getInstanceId(): string {
    return this.instanceId;
  }
}

// 2) SMALL HELPER HOOK สำหรับใช้ Singleton จาก React
function useLogger() {
  const [version, setVersion] = useState(0);
  const logger = LoggerSingleton.getInstance();

  const pushUpdate = () => setVersion((v) => v + 1);

  return {
    logger,
    logs: logger.getLogs(),
    instanceId: logger.getInstanceId(),
    refresh: pushUpdate,
  };
}

// 3) CONTROL PANEL COMPONENT A / B
interface ControlPanelProps {
  panelName: string;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ panelName }) => {
  const { logger, logs, instanceId, refresh } = useLogger();
  const [customMessage, setCustomMessage] = useState("");

  const addDefaultLog = () => {
    logger.addLog(`${panelName}: clicked default log button`);
    refresh();
  };

  const addCustomLog = () => {
    if (!customMessage.trim()) return;
    logger.addLog(`${panelName}: ${customMessage.trim()}`);
    setCustomMessage("");
    refresh();
  };

  const clearLogs = () => {
    logger.clear();
    refresh();
  };

  return (
    <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 text-xs">
      <div className="flex items-center justify-between">
        <p className="text-[11px] tracking-[0.2em] text-slate-400 uppercase">
          {panelName}
        </p>
        <span className="font-mono text-[10px] text-slate-500">
          instanceId: <span className="text-emerald-300">{instanceId}</span>
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={addDefaultLog}
          className="px-3 py-1 rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-white font-mono border border-emerald-300 shadow-sm transition-all text-[11px]"
        >
          Add default log
        </button>

        <div className="flex gap-2 items-center">
          <input
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Custom message"
            className="flex-1 rounded-md bg-slate-950 border border-white/15 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-emerald-400"
          />
          <button
            onClick={addCustomLog}
            className="px-3 py-1 rounded-full bg-indigo-500/90 hover:bg-indigo-400 text-white font-mono border border-indigo-300 shadow-sm transition-all text-[11px]"
          >
            Log
          </button>
        </div>

        <button
          onClick={clearLogs}
          className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-100 font-mono border border-slate-500/70 transition-all text-[11px]"
        >
          Clear logs
        </button>
      </div>

      <div className="mt-2 max-h-40 overflow-auto rounded-md bg-black/40 border border-white/10 p-2 font-mono text-[10px] text-slate-200 space-y-1">
        {logs.length === 0 ? (
          <p className="text-slate-500 italic">(no logs yet)</p>
        ) : (
          logs.map((log, idx) => <p key={idx}>{log}</p>)
        )}
      </div>
    </div>
  );
};

// 4) DEMO PAGE COMPONENT
const SingletonDemoPage: React.FC = () => {
  const { instanceId, logs } = useLogger();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-5xl">
        {/* Hero / Intro */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-[11px] tracking-[0.25em] text-slate-400 mb-2 uppercase">
              SINGLETON · GLOBAL LOGGER DEMO
            </p>
            <h1 className="text-2xl font-semibold mb-1">
              Singleton Pattern — Global Logger Playground
            </h1>
            <p className="text-sm text-slate-300 mb-3 max-w-2xl">
              หน้านี้ใช้ Singleton Pattern เพื่อสร้าง logger ที่มี instance เดียว
              ทุก component ที่ใช้ logger นี้จะอ้างถึง object เดียวกัน
              เพราะเรียกผ่าน <span className="font-mono">LoggerSingleton.getInstance()</span>
            </p>
            <p className="text-[11px] font-mono text-slate-400">
              current instanceId: <span className="text-emerald-300">{instanceId}</span> ·
              total logs: <span className="text-sky-300">{logs.length}</span>
            </p>
          </div>
        </div>

        {/* Info Panel */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs leading-relaxed">
            <h2 className="text-sm font-semibold text-white mb-2">Singleton คืออะไร?</h2>
            <p className="text-slate-200 mb-2">
              Singleton ทำให้ class มี instance เดียว และให้จุดเข้าถึงแบบ global
              ผ่าน static method (เช่น <span className="font-mono">getInstance()</span>).
              เหมาะสำหรับ resource กลาง เช่น logger, config, cache, connection pool.
            </p>
            <p className="text-slate-400">
              ในหน้านี้ทั้ง Control Panel A และ B ใช้ logger ชุดเดียวกัน
              เพราะเรียกผ่าน Singleton เดียวกัน ลองสังเกตว่า log list ด้านล่าง
              เปลี่ยนพร้อมกันเสมอ
            </p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-200 space-y-1">
            <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-1">
              IMPLEMENTATION DETAILS
            </p>
            <p>
              <span className="text-slate-500">class:</span> LoggerSingleton
            </p>
            <p>
              <span className="text-slate-500">creation:</span> lazy (สร้างเมื่อเรียก getInstance ครั้งแรก)
            </p>
            <p>
              <span className="text-slate-500">fields:</span> logs[], instanceId
            </p>
            <p>
              <span className="text-slate-500">methods:</span> getInstance, addLog, clear, getLogs, getInstanceId
            </p>
          </div>
        </div>

        {/* Two panels sharing the same Singleton */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <ControlPanel panelName="Control Panel A" />
          <ControlPanel panelName="Control Panel B" />
        </div>

        {/* Playground hints */}
        <div className="mt-4 text-xs text-slate-400 border-t border-white/5 pt-4">
          <p className="mb-1 font-mono text-[11px] text-slate-500">PLAYGROUND HINT</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              เพิ่ม field ใหม่ใน <span className="font-mono">LoggerSingleton</span> เช่น
              <span className="font-mono">level</span>, <span className="font-mono">userId</span>,
              หรือ <span className="font-mono">context</span> แล้วเพิ่ม UI ให้เปลี่ยนค่า
            </li>
            <li>
              เพิ่ม method เช่น <span className="font-mono">setLevel()</span> หรือ
              <span className="font-mono">filterLogs()</span> และลองดูว่าทุก panel
              เห็นผลเปลี่ยนพร้อมกันหรือไม่
            </li>
            <li>
              ทดลองแยก Singleton ตัวอื่น เช่น <span className="font-mono">ConfigSingleton</span>
              หรือ <span className="font-mono">ThemeSingleton</span> แล้วใช้ร่วมกับ logger
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SingletonDemoPage;
