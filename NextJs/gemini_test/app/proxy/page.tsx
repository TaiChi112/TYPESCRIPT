"use client";

import React, { useCallback, useMemo, useState } from "react";

/**
 * ---------------------------------------------------------------------
 * PROXY PATTERN — ANALYTICS SERVICE PLAYGROUND (DEMO PAGE)
 * ---------------------------------------------------------------------
 * หน้านี้เป็นสนามทดลองสำหรับ Proxy Pattern
 *
 * แนวคิดหลัก:
 * - มี service จริง (RealAnalyticsService) ที่ดึงสถิติบางอย่าง (อาจจะช้า / แพง)
 * - มี Proxy (AnalyticsServiceProxy) ที่คั่นกลางเพื่อทำ caching, logging, rate-limit
 * - UI สามารถสลับใช้ service ตรง ๆ หรือผ่าน proxy ได้ เพื่อดูพฤติกรรมที่ต่างกัน
 *
 * คุณสามารถ:
 * - เพิ่ม policy ใหม่ใน Proxy เช่น max request ต่อวินาที, auth token check เป็นต้น
 * - เก็บ log เพิ่มเติมใน Proxy เช่น เวลาเรียกแต่ละครั้ง, arguments ที่ส่งเข้าไป
 * - เปลี่ยนให้ RealAnalyticsService เรียก API จริง หรือทำ computation หนัก ๆ
 */

// 1) DOMAIN MODEL
interface AnalyticsQuery {
  range: "7d" | "30d" | "90d";
  focus: "views" | "conversions" | "engagement";
}

interface AnalyticsResult {
  key: string; // ใช้เป็น cache key
  value: number;
  generatedAt: Date;
  source: "real" | "proxy-cache";
}

// 2) SERVICE INTERFACE
interface IAnalyticsService {
  fetchAnalytics(query: AnalyticsQuery): Promise<AnalyticsResult>;
}

// Helper สำหรับจำลอง async delay
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 3) REAL SERVICE (subject จริง)
class RealAnalyticsService implements IAnalyticsService {
  private latencyMs: number;

  constructor(latencyMs: number) {
    this.latencyMs = latencyMs;
  }

  async fetchAnalytics(query: AnalyticsQuery): Promise<AnalyticsResult> {
    await sleep(this.latencyMs);

    const base =
      query.focus === "views" ? 1000 : query.focus === "conversions" ? 240 : 600;
    const multiplier = query.range === "7d" ? 0.4 : query.range === "30d" ? 1 : 2.5;

    const value = Math.round(base * multiplier + Math.random() * 50);

    return {
      key: `${query.range}-${query.focus}`,
      value,
      generatedAt: new Date(),
      source: "real",
    };
  }
}

// 4) PROXY SERVICE
interface ProxyLogEntry {
  id: number;
  message: string;
  timestamp: Date;
}

class AnalyticsServiceProxy implements IAnalyticsService {
  private realService: RealAnalyticsService;
  private cache: Map<string, AnalyticsResult> = new Map();
  private logs: ProxyLogEntry[] = [];
  private nextLogId = 1;
  private cacheTtlMs: number;
  private maxCallsWithoutDelay: number;
  private callsCount = 0;

  constructor(real: RealAnalyticsService, cacheTtlMs: number, burstLimit: number) {
    this.realService = real;
    this.cacheTtlMs = cacheTtlMs;
    this.maxCallsWithoutDelay = burstLimit;
  }

  getLogs(): ProxyLogEntry[] {
    return [...this.logs].reverse();
  }

  clearLogs() {
    this.logs = [];
  }

  private addLog(message: string) {
    this.logs.push({
      id: this.nextLogId += 1,
      message,
      timestamp: new Date(),
    });
  }

  private buildKey(query: AnalyticsQuery): string {
    return `${query.range}-${query.focus}`;
  }

  private isFresh(result: AnalyticsResult): boolean {
    const age = Date.now() - result.generatedAt.getTime();
    return age <= this.cacheTtlMs;
  }

  async fetchAnalytics(query: AnalyticsQuery): Promise<AnalyticsResult> {
    const key = this.buildKey(query);
    this.callsCount += 1;

    // Rate / burst control (ง่าย ๆ): ถ้าเกิน limit ให้ delay เพิ่มเติม
    if (this.callsCount > this.maxCallsWithoutDelay) {
      this.addLog(
        `Burst limit exceeded, applying extra delay for key=${key} (call #${this.callsCount})`,
      );
      await sleep(300);
    }

    const cached = this.cache.get(key);
    if (cached && this.isFresh(cached)) {
      this.addLog(`Cache hit for key=${key}`);
      return { ...cached, source: "proxy-cache" };
    }

    this.addLog(`Cache miss for key=${key}, delegating to real service`);
    const realResult = await this.realService.fetchAnalytics(query);

    this.cache.set(key, realResult);
    return realResult;
  }
}

// 5) REACT DEMO PAGE
const ProxyDemoPage: React.FC = () => {
  const [range, setRange] = useState<AnalyticsQuery["range"]>("7d");
  const [focus, setFocus] = useState<AnalyticsQuery["focus"]>("views");
  const [useProxy, setUseProxy] = useState(true);
  const [latencyMs, setLatencyMs] = useState(600);
  const [cacheTtlMs, setCacheTtlMs] = useState(5000);
  const [burstLimit, setBurstLimit] = useState(3);

  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalyticsResult | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [, setForceUpdate] = useState(0);

  const realService = useMemo(
    () => new RealAnalyticsService(latencyMs),
    [latencyMs],
  );

  const proxyService = useMemo(
    () => new AnalyticsServiceProxy(realService, cacheTtlMs, burstLimit),
    [realService, cacheTtlMs, burstLimit],
  );

  const activeService: IAnalyticsService = useProxy ? proxyService : realService;

  const logs = useMemo(
    () => (useProxy ? proxyService.getLogs() : []),
    [proxyService, useProxy, currentResult],
  );

  const triggerFetch = useCallback(async () => {
    setIsLoading(true);
    setLastError(null);
    try {
      const result = await activeService.fetchAnalytics({ range, focus });
      setCurrentResult(result);
      setForceUpdate((x) => x + 1);
    } catch (err) {
      setLastError((err as Error).message ?? "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [activeService, range, focus]);

  const handleLatencyChange = (value: string) => {
    const n = parseInt(value, 10);
    if (!Number.isNaN(n) && n >= 0 && n <= 2000) {
      setLatencyMs(n);
    }
  };

  const handleCacheTtlChange = (value: string) => {
    const n = parseInt(value, 10);
    if (!Number.isNaN(n) && n >= 0 && n <= 20000) {
      setCacheTtlMs(n);
    }
  };

  const handleBurstLimitChange = (value: string) => {
    const n = parseInt(value, 10);
    if (!Number.isNaN(n) && n >= 0 && n <= 10) {
      setBurstLimit(n);
    }
  };

  const callMultipleTimes = async (count: number) => {
    for (let i = 0; i < count; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await triggerFetch();
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-6xl">
        {/* Hero */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-[11px] tracking-[0.25em] text-slate-400 mb-2 uppercase">
              PROXY · ANALYTICS SERVICE DEMO
            </p>
            <h1 className="text-2xl font-semibold mb-1">
              Proxy Pattern — Analytics Service Playground
            </h1>
            <p className="text-sm text-slate-300 mb-4 max-w-2xl">
              หน้านี้ใช้ Proxy Pattern เพื่อคั่นกลางระหว่าง UI กับ Analytics Service
              โดย Proxy สามารถทำ caching, logging และ simple rate limiting ให้เราได้
            </p>
          </div>
        </div>

        {/* Explanation */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs leading-relaxed">
            <h2 className="text-sm font-semibold text-white mb-2">Proxy คืออะไร?</h2>
            <p className="text-slate-200 mb-2">
              Proxy Pattern คือ object ที่ “ยืนคั่นกลาง” แทน real subject เพื่อทำ
              สิ่งเพิ่มเติม เช่น access control, caching, lazy loading หรือ logging
            </p>
            <p className="text-slate-400">
              ในหน้านี้ <span className="font-mono">AnalyticsServiceProxy</span>
              จะห่อ <span className="font-mono">RealAnalyticsService</span>
              แล้วจัดการ cache และ delay เพิ่มเติมเมื่อมีการเรียกบ่อยเกินไป
              ฝั่ง UI เห็นแค่ interface เดียวคือ
              <span className="font-mono">fetchAnalytics()</span> ไม่รู้ว่าข้างในมี proxy
              หรือไม่
            </p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-200 space-y-1">
            <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-1">
              PROXY RESPONSIBILITIES (IN THIS DEMO)
            </p>
            <p>- Cache ผลลัพธ์ตาม key (range + focus) พร้อม TTL</p>
            <p>- Log ว่าเป็น cache hit / miss, และ burst control ถูกใช้หรือไม่</p>
            <p>- เพิ่ม delay เล็กน้อยเมื่อเรียกบ่อยเกิน burst limit</p>
            <p className="text-[11px] text-slate-400 mt-2">
              คุณสามารถเพิ่ม rule เพิ่มเติมใน Proxy ได้ เช่น auth, IP allowlist,
              หรือการนับ quota ต่อผู้ใช้
            </p>
          </div>
        </div>

        {/* Controls + Results */}
        <div className="grid lg:grid-cols-[260px,1fr] gap-6 mb-10">
          {/* Controls */}
          <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs space-y-4">
            <h3 className="text-sm font-semibold mb-1">Controls</h3>

            {/* Use proxy toggle */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">
                ใช้งานผ่าน Proxy (เปิด caching + logging)
              </span>
              <button
                onClick={() => setUseProxy((v) => !v)}
                className={`px-3 py-1 rounded-full border text-[11px] transition
                  ${useProxy
                    ? "bg-emerald-500/90 border-emerald-300 text-white"
                    : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                `}
              >
                {useProxy ? "Proxy ON" : "Proxy OFF"}
              </button>
            </div>

            {/* Query params */}
            <div>
              <p className="text-[11px] text-slate-400 mb-1">ช่วงเวลา (range)</p>
              <div className="flex flex-wrap gap-1">
                {["7d", "30d", "90d"].map((r) => {
                  const active = range === r;
                  return (
                    <button
                      key={r}
                      onClick={() => setRange(r as AnalyticsQuery["range"])}
                      className={`px-3 py-1 rounded-full border text-[11px] transition
                        ${active
                          ? "bg-sky-500/90 border-sky-300 text-white"
                          : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                      `}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[11px] text-slate-400 mb-1">ประเภท metric (focus)</p>
              <div className="flex flex-wrap gap-1">
                {["views", "conversions", "engagement"].map((f) => {
                  const active = focus === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setFocus(f as AnalyticsQuery["focus"])}
                      className={`px-3 py-1 rounded-full border text-[11px] transition
                        ${active
                          ? "bg-pink-500/90 border-pink-300 text-white"
                          : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                      `}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Service config */}
            <div className="border-t border-white/5 pt-3 space-y-3">
              <div>
                <p className="text-[11px] text-slate-400 mb-1">
                  Latency ของ real service (ms)
                </p>
                <input
                  type="range"
                  min={0}
                  max={2000}
                  value={latencyMs}
                  onChange={(e) => handleLatencyChange(e.target.value)}
                  className="w-full"
                />
                <p className="text-[11px] text-slate-300 mt-1">
                  latencyMs: <span className="font-semibold">{latencyMs}</span>
                </p>
              </div>

              <div>
                <p className="text-[11px] text-slate-400 mb-1">Cache TTL (ms)</p>
                <input
                  type="range"
                  min={0}
                  max={20000}
                  value={cacheTtlMs}
                  onChange={(e) => handleCacheTtlChange(e.target.value)}
                  className="w-full"
                />
                <p className="text-[11px] text-slate-300 mt-1">
                  cacheTtlMs: <span className="font-semibold">{cacheTtlMs}</span>
                </p>
              </div>

              <div>
                <p className="text-[11px] text-slate-400 mb-1">
                  Burst limit ก่อนที่จะ delay เพิ่ม (เฉพาะ Proxy)
                </p>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={burstLimit}
                  onChange={(e) => handleBurstLimitChange(e.target.value)}
                  className="w-full"
                />
                <p className="text-[11px] text-slate-300 mt-1">
                  burstLimit: <span className="font-semibold">{burstLimit}</span>
                </p>
              </div>
            </div>

            {/* Trigger buttons */}
            <div className="border-t border-white/5 pt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => triggerFetch()}
                disabled={isLoading}
                className="px-3 py-1 rounded-full border border-emerald-400/80 bg-emerald-500/80 text-[11px] text-black font-semibold disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "Fetch once"}
              </button>
              <button
                type="button"
                onClick={() => callMultipleTimes(3)}
                disabled={isLoading}
                className="px-3 py-1 rounded-full border border-sky-400/80 bg-sky-500/80 text-[11px] text-black font-semibold disabled:opacity-50"
              >
                Fetch 3x (test cache)
              </button>
              <button
                type="button"
                onClick={() => callMultipleTimes(6)}
                disabled={isLoading}
                className="px-3 py-1 rounded-full border border-pink-400/80 bg-pink-500/80 text-[11px] text-black font-semibold disabled:opacity-50"
              >
                Fetch 6x (test burst)
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Current result */}
            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs">
              <p className="text-[11px] text-slate-400 mb-1">Current result</p>
              {lastError && (
                <p className="text-red-400 text-[11px] mb-1">Error: {lastError}</p>
              )}
              {!currentResult && !lastError && (
                <p className="text-slate-500 text-[11px]">
                  กดปุ่ม Fetch เพื่อดึง analytics
                </p>
              )}
              {currentResult && (
                <div className="flex flex-wrap gap-6 items-baseline">
                  <div>
                    <p className="text-[11px] text-slate-400 mb-1">Value</p>
                    <p className="text-2xl font-semibold">{currentResult.value}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 mb-1">Source</p>
                    <p
                      className={
                        currentResult.source === "proxy-cache"
                          ? "text-emerald-300"
                          : "text-sky-300"
                      }
                    >
                      {currentResult.source === "proxy-cache"
                        ? "Proxy cache"
                        : "Real service"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 mb-1">Key</p>
                    <p className="font-mono text-slate-200">{currentResult.key}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 mb-1">Generated at</p>
                    <p className="font-mono text-slate-300">
                      {currentResult.generatedAt.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Proxy logs */}
                      <div className="bg-black/50 border border-white/10 rounded-2xl p-4 text-[11px] font-mono max-h-65 overflow-auto">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400">Proxy logs (เฉพาะตอน Proxy ON)</p>
                <button
                  type="button"
                  onClick={() => {
                    if (useProxy) {
                      proxyService.clearLogs();
                      setForceUpdate((x) => x + 1);
                    }
                  }}
                  className="px-2 py-0.5 rounded-full border border-slate-500/80 text-[10px] text-slate-200 hover:border-slate-300/80"
                >
                  Clear
                </button>
              </div>
              {!useProxy && (
                <p className="text-slate-500">
                  Proxy ปิดอยู่ — ไม่มี log (เพราะเรียก real service ตรง ๆ)
                </p>
              )}
              {useProxy && logs.length === 0 && (
                <p className="text-slate-500">ยังไม่มี log — ลองกด Fetch ดู</p>
              )}
              {useProxy && logs.length > 0 && (
                <ul className="space-y-1">
                  {logs.map((log) => (
                    <li key={log.id} className="text-slate-100 flex gap-2">
                      <span className="text-slate-500">
                        {log.timestamp.toLocaleTimeString()} ·
                      </span>
                      <span>{log.message}</span>
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
              เพิ่ม rule ใหม่ใน Proxy เช่น reject ถ้าไม่มี API key หรือจำกัดจำนวน call
              ต่อ range/focus
            </li>
            <li>
              ทดลองทำ lazy initialization ของ RealAnalyticsService ใน Proxy
              (สร้างก็ต่อเมื่อมีการเรียกครั้งแรก)
            </li>
            <li>
              ต่อ Proxy เข้ากับ Facade หรือ Decorator จากหน้าอื่นเพื่อสร้าง
              combination pattern ที่ซับซ้อนยิ่งขึ้น
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProxyDemoPage;
