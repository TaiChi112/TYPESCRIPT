"use client";

import React, { useEffect, useState } from "react";

/**
 * ---------------------------------------------------------------------
 * OBSERVER PATTERN — LIVE DASHBOARD PLAYGROUND (DEMO PAGE)
 * ---------------------------------------------------------------------
 * หน้านี้เป็นสนามทดลองสำหรับ Observer Pattern
 *
 * แนวคิดหลัก:
 * - มี Subject กลาง (DashboardSubject) ถือสถานะของระบบ เช่น online users, alerts
 * - มี Observer หลายตัวติดตาม Subject เช่น LoggerObserver, BadgeObserver, ThresholdObserver
 * - เมื่อ state เปลี่ยน Subject จะ notify observer ทุกตัวที่ subscribe อยู่
 *
 * คุณสามารถ:
 * - กดปุ่มจำลอง event ต่าง ๆ แล้วดูว่า observer แต่ละตัว react อย่างไร
 * - เปิด/ปิดการ subscribe ของ observer แต่ละตัว
 * - เพิ่ม observer ใหม่ที่มีพฤติกรรมของตัวเอง เช่น MetricObserver, NotificationObserver
 */

// 1) DOMAIN MODEL

type Severity = "stable" | "warning" | "critical";

interface DashboardState {
    onlineUsers: number;
    activeAlerts: number;
    lastEvent: string;
}

// 2) OBSERVER INTERFACE & SUBJECT

interface Observer {
    readonly id: string;
    update(state: DashboardState): void;
}

class DashboardSubject {
    private state: DashboardState;

    private observers: Set<Observer> = new Set();

    constructor(initial: DashboardState) {
        this.state = { ...initial };
    }

    getState(): DashboardState {
        return { ...this.state };
    }

    attach(observer: Observer): void {
        this.observers.add(observer);
    }

    detach(observer: Observer): void {
        this.observers.delete(observer);
    }

    private notify(): void {
        const snapshot = this.getState();
        this.observers.forEach((obs) => obs.update(snapshot));
    }

    setState(partial: Partial<DashboardState>): void {
        this.state = { ...this.state, ...partial };
        this.notify();
    }

    addUsers(delta: number): void {
        const nextUsers = Math.max(0, this.state.onlineUsers + delta);
        const direction =
            delta > 0 ? `+${delta} users joined` : `${Math.abs(delta)} users left`;
        this.setState({ onlineUsers: nextUsers, lastEvent: direction });
    }

    raiseAlert(): void {
        this.setState({
            activeAlerts: this.state.activeAlerts + 1,
            lastEvent: "New alert raised",
        });
    }

    resolveAlert(): void {
        this.setState({
            activeAlerts: Math.max(0, this.state.activeAlerts - 1),
            lastEvent: "Alert resolved",
        });
    }

    recordCustomEvent(message: string): void {
        this.setState({ lastEvent: message });
    }
}

// 3) CONCRETE OBSERVERS

class LoggingObserver implements Observer {
    readonly id = "logger";

    private logs: string[] = [];

    update(state: DashboardState): void {
        const timestamp = new Date().toLocaleTimeString();
        const line = `${timestamp} · users=${state.onlineUsers}, alerts=${state.activeAlerts}, event="${state.lastEvent}"`;
        this.logs = [...this.logs, line].slice(-50); // limit to last 50
    }

    getLogs(): string[] {
        return [...this.logs];
    }

    clear(): void {
        this.logs = [];
    }
}

class BadgeObserver implements Observer {
    readonly id = "badge";

    private severity: Severity = "stable";

    private label = "Stable";

    update(state: DashboardState): void {
        if (state.activeAlerts > 2 || state.onlineUsers > 80) {
            this.severity = "critical";
            this.label = "Critical load";
        } else if (state.activeAlerts > 0 || state.onlineUsers > 40) {
            this.severity = "warning";
            this.label = "Increased activity";
        } else {
            this.severity = "stable";
            this.label = "Stable";
        }
    }

    getSeverity(): Severity {
        return this.severity;
    }

    getLabel(): string {
        return this.label;
    }
}

class ThresholdObserver implements Observer {
    readonly id = "threshold";

    private readonly threshold: number;

    private highLoad = false;

    constructor(threshold: number) {
        this.threshold = threshold;
    }

    update(state: DashboardState): void {
        this.highLoad = state.onlineUsers >= this.threshold;
    }

    isHighLoad(): boolean {
        return this.highLoad;
    }

    getThreshold(): number {
        return this.threshold;
    }
}

// 4) DEMO PAGE

const initialState: DashboardState = {
    onlineUsers: 15,
    activeAlerts: 1,
    lastEvent: "System started",
};

const ObserverDemoPage: React.FC = () => {
    const [subject] = useState(() => new DashboardSubject(initialState));
    const [logger] = useState(() => new LoggingObserver());
    const [badgeObserver] = useState(() => new BadgeObserver());
    const [thresholdObserver] = useState(() => new ThresholdObserver(50));

    const [subjectState, setSubjectState] = useState<DashboardState>(
        subject.getState(),
    );
    const [logs, setLogs] = useState<string[]>([]);
    const [badge, setBadge] = useState<{ severity: Severity; label: string }>(
        { severity: "stable", label: "Stable" },
    );
    const [highLoad, setHighLoad] = useState(false);

    const [loggerSubscribed, setLoggerSubscribed] = useState(true);
    const [badgeSubscribed, setBadgeSubscribed] = useState(true);
    const [thresholdSubscribed, setThresholdSubscribed] = useState(true);

    const [customEvent, setCustomEvent] = useState("");

    useEffect(() => {
        subject.attach(logger);
        subject.attach(badgeObserver);
        subject.attach(thresholdObserver);

        // initial notify snapshot
        subject.recordCustomEvent(initialState.lastEvent);
        setSubjectState(subject.getState());
        setLogs(logger.getLogs());
        setBadge({
            severity: badgeObserver.getSeverity(),
            label: badgeObserver.getLabel(),
        });
        setHighLoad(thresholdObserver.isHighLoad());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refreshFromObservers = () => {
        setSubjectState(subject.getState());
        setLogs(logger.getLogs());
        setBadge({
            severity: badgeObserver.getSeverity(),
            label: badgeObserver.getLabel(),
        });
        setHighLoad(thresholdObserver.isHighLoad());
    };

    const handleAddUsers = (delta: number) => {
        subject.addUsers(delta);
        refreshFromObservers();
    };

    const handleAlertChange = (action: "raise" | "resolve") => {
        if (action === "raise") {
            subject.raiseAlert();
        } else {
            subject.resolveAlert();
        }
        refreshFromObservers();
    };

    const handleCustomEvent = () => {
        const msg = customEvent.trim() || "Manual event";
        subject.recordCustomEvent(msg);
        setCustomEvent("");
        refreshFromObservers();
    };

    const toggleLogger = () => {
        if (loggerSubscribed) {
            subject.detach(logger);
            setLoggerSubscribed(false);
        } else {
            subject.attach(logger);
            setLoggerSubscribed(true);
        }
    };

    const toggleBadge = () => {
        if (badgeSubscribed) {
            subject.detach(badgeObserver);
            setBadgeSubscribed(false);
        } else {
            subject.attach(badgeObserver);
            setBadgeSubscribed(true);
        }
    };

    const toggleThreshold = () => {
        if (thresholdSubscribed) {
            subject.detach(thresholdObserver);
            setThresholdSubscribed(false);
        } else {
            subject.attach(thresholdObserver);
            setThresholdSubscribed(true);
        }
    };

    const clearLogs = () => {
        logger.clear();
        setLogs(logger.getLogs());
    };

    const severityColor =
        badge.severity === "critical"
            ? "bg-red-900/70 border-red-500/80 text-red-100"
            : badge.severity === "warning"
                ? "bg-amber-900/70 border-amber-500/80 text-amber-100"
                : "bg-emerald-900/70 border-emerald-500/80 text-emerald-100";

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center px-4 py-8">
            <div className="w-full max-w-6xl">
                {/* Hero */}
                <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <p className="text-[11px] tracking-[0.25em] text-slate-400 mb-2 uppercase">
                            OBSERVER · LIVE DASHBOARD DEMO
                        </p>
                        <h1 className="text-2xl font-semibold mb-1">
                            Observer Pattern — Live Dashboard Playground
                        </h1>
                        <p className="text-sm text-slate-300 mb-4 max-w-2xl">
                            หน้านี้ใช้ Observer Pattern เพื่อให้ observers หลายตัวรับรู้การเปลี่ยนแปลง
                            ของ DashboardSubject เดียวกัน เช่น logger, badge, threshold indicator
                        </p>
                    </div>
                </div>

                {/* Explanation */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs leading-relaxed">
                        <h2 className="text-sm font-semibold text-white mb-2">Observer คืออะไร?</h2>
                        <p className="text-slate-200 mb-2">
                            Observer Pattern ทำให้ object หนึ่ง (Subject) สามารถแจ้งเตือน object
                            อื่น ๆ (Observers) ที่ subscribe อยู่ได้อัตโนมัติเมื่อ state เปลี่ยน
                        </p>
                        <p className="text-slate-400">
                            ในหน้านี้ <span className="font-mono">DashboardSubject</span>
                            ถือจำนวณ online users และ alerts เมื่อกดปุ่มจำลองเหตุการณ์ Subject
                            จะ notify observers เช่น <span className="font-mono">LoggingObserver</span>
                            และ <span className="font-mono">BadgeObserver</span> ให้ update ของตัวเอง
                        </p>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-200 space-y-1">
                        <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-1">
                            OBSERVERS IN THIS DEMO
                        </p>
                        <p>- LoggingObserver — เก็บ log ของทุก event</p>
                        <p>- BadgeObserver — แปลง state เป็น badge severity (stable/warning/critical)</p>
                        <p>- ThresholdObserver — เช็คว่าจำนวนผู้ใช้งานเกิน threshold หรือไม่</p>
                        <p className="text-[11px] text-slate-400 mt-2">
                            คุณสามารถเพิ่ม observer ใหม่ที่ implement
                            <span className="font-mono"> Observer</span> แล้ว attach เข้ากับ
                            <span className="font-mono">DashboardSubject</span> ได้ทันที
                        </p>
                    </div>
                </div>

                {/* Controls + Observers view */}
                <div className="grid lg:grid-cols-[260px,1fr] gap-6 mb-10">
                    {/* Controls */}
                    <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs space-y-4">
                        <h3 className="text-sm font-semibold mb-1">Controls (เปลี่ยน state ของ Subject)</h3>

                        {/* Users */}
                        <div>
                            <p className="text-[11px] text-slate-400 mb-1">Online users</p>
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-lg font-semibold">{subjectState.onlineUsers}</span>
                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        onClick={() => handleAddUsers(-5)}
                                        className="px-2 py-1 rounded-full border border-slate-500/80 text-[11px]"
                                    >
                                        -5
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleAddUsers(-1)}
                                        className="px-2 py-1 rounded-full border border-slate-500/80 text-[11px]"
                                    >
                                        -1
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleAddUsers(+1)}
                                        className="px-2 py-1 rounded-full border border-emerald-500/80 text-[11px]"
                                    >
                                        +1
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleAddUsers(+10)}
                                        className="px-2 py-1 rounded-full border border-emerald-500/80 text-[11px]"
                                    >
                                        +10
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Alerts */}
                        <div>
                            <p className="text-[11px] text-slate-400 mb-1">Active alerts</p>
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-lg font-semibold">{subjectState.activeAlerts}</span>
                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        onClick={() => handleAlertChange("resolve")}
                                        className="px-3 py-1 rounded-full border border-slate-500/80 text-[11px]"
                                    >
                                        Resolve
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleAlertChange("raise")}
                                        className="px-3 py-1 rounded-full border border-pink-500/80 text-[11px]"
                                    >
                                        Raise
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Custom event */}
                        <div>
                            <p className="text-[11px] text-slate-400 mb-1">Custom event</p>
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 bg-slate-900/80 border border-white/20 rounded px-2 py-1 text-[11px]"
                                    placeholder="เช่น Deploy completed, Cache warmed ฯลฯ"
                                    value={customEvent}
                                    onChange={(e) => setCustomEvent(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={handleCustomEvent}
                                    className="px-3 py-1 rounded-full border border-sky-400/80 bg-sky-500/80 text-[11px] text-black font-semibold"
                                >
                                    Send
                                </button>
                            </div>
                        </div>

                        {/* Observer subscription toggles */
                            <div className="border-t border-white/5 pt-3 space-y-2">
                                <p className="text-[11px] text-slate-400 mb-1">Observers subscriptions</p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={toggleLogger}
                                        className={`px-3 py-1 rounded-full border text-[11px] transition
                    ${loggerSubscribed
                                                ? "bg-emerald-500/90 border-emerald-300 text-black"
                                                : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                  `}
                                    >
                                        Logger {loggerSubscribed ? "ON" : "OFF"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={toggleBadge}
                                        className={`px-3 py-1 rounded-full border text-[11px] transition
                    ${badgeSubscribed
                                                ? "bg-amber-500/90 border-amber-300 text-black"
                                                : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                  `}
                                    >
                                        Badge {badgeSubscribed ? "ON" : "OFF"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={toggleThreshold}
                                        className={`px-3 py-1 rounded-full border text-[11px] transition
                    ${thresholdSubscribed
                                                ? "bg-red-500/90 border-red-300 text-black"
                                                : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                  `}
                                    >
                                        Threshold {thresholdSubscribed ? "ON" : "OFF"}
                                    </button>
                                </div>
                            </div>
                        }
                    </div>


                    {/* Observers view */}
                    <div className="space-y-4">
                        {/* Subject snapshot */}
                        <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs">
                            <p className="text-[11px] text-slate-400 mb-1">DashboardSubject snapshot</p>
                            <div className="border border-slate-700 rounded-xl p-3 bg-slate-950/70 flex flex-col gap-2">
                                <div className="flex items-center justify-between gap-2">
                                    <div>
                                        <p className="text-[11px] text-slate-400">Online users</p>
                                        <p className="text-lg font-semibold">{subjectState.onlineUsers}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-slate-400">Active alerts</p>
                                        <p className="text-lg font-semibold">{subjectState.activeAlerts}</p>
                                    </div>
                                </div>
                                <div className="text-[11px] text-slate-300 mt-1">
                                    Last event: <span className="font-mono">{subjectState.lastEvent}</span>
                                </div>
                            </div>
                        </div>

                        {/* Badge + threshold */}
                        <div className="grid md:grid-cols-2 gap-3">
                            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px] text-slate-400 mb-1">BadgeObserver</p>
                                    <span
                                        className={`px-2 py-0.5 rounded-full border text-[10px] font-mono ${severityColor}`}
                                    >
                                        {badge.label}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-300">
                                    severity: <span className="font-mono">{badge.severity}</span>
                                </p>
                            </div>

                            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs flex flex-col gap-2">
                                <p className="text-[11px] text-slate-400 mb-1">ThresholdObserver</p>
                                <p className="text-[11px] text-slate-300">
                                    threshold: <span className="font-mono">{thresholdObserver.getThreshold()}</span>
                                </p>
                                <p className="text-[11px] text-slate-300">
                                    high load: {" "}
                                    <span className="font-mono">
                                        {highLoad ? "true" : "false"}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Logs */}
                        <div className="bg-black/50 border border-white/10 rounded-2xl p-4 text-[11px] font-mono max-h-65 overflow-auto">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-slate-400">LoggingObserver logs</p>
                                <button
                                    type="button"
                                    onClick={clearLogs}
                                    className="px-2 py-0.5 rounded-full border border-slate-500/80 text-[10px] text-slate-200 hover:border-slate-300/80"
                                >
                                    Clear
                                </button>
                            </div>
                            {logs.length === 0 && (
                                <p className="text-slate-500">ยังไม่มี log — ลองกดปุ่มด้านซ้าย</p>
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
                            เพิ่ม observer ใหม่ เช่น <span className="font-mono">MetricObserver</span>
                            ที่เก็บค่าเฉลี่ยของ users/alerts แล้วแสดงใน panel ใหม่
                        </li>
                        <li>
                            เปลี่ยน Subject ให้รองรับหลาย channel (topics)
                            แล้วให้ observer subscribe เฉพาะ channel ที่สนใจ
                        </li>
                        <li>
                            ใช้ Observer Pattern นี้ร่วมกับ Memento หรือ Command
                            เพื่อ log snapshot ทุกครั้งที่ state เปลี่ยน หรือทำ replay ของ events
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ObserverDemoPage;
