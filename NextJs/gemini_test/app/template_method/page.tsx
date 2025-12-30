"use client";

import React, { useMemo, useState } from "react";

/**
 * ---------------------------------------------------------------------
 * TEMPLATE METHOD PATTERN — PUBLISHING PIPELINE PLAYGROUND
 * ---------------------------------------------------------------------
 * หน้านี้เป็นสนามทดลองสำหรับ Template Method Pattern
 *
 * แนวคิดหลัก:
 * - มีขั้นตอน (algorithm) การ "publish" เนื้อหาที่ตายตัว เช่น validate → format → enrich → persist → notify
 * - ขั้นตอนใหญ่ (template method) จะถูกกำหนดใน abstract class ไม่ให้เปลี่ยนลำดับง่าย ๆ
 * - แต่แต่ละขั้นสามารถ customize ได้โดย subclass (hook methods) เช่น กฎ validate, การ format, enrich ต่างกัน
 *
 * คุณสามารถ:
 * - เพิ่ม publisher ใหม่ (เช่น ReleaseNotePublisher, InternalMemoPublisher ฯลฯ) โดย reuse algorithm เดิม
 * - ปรับรายละเอียด logic ใน hook method ของแต่ละ subclass
 * - ทดลองสลับ publisher + options แล้วดูว่าขั้นตอน/ข้อความเปลี่ยนไปอย่างไร
 */

// 1) DOMAIN MODEL

type Audience = "public" | "beta" | "internal";

type ContentKind = "article" | "lab" | "release-note";

interface DraftConfig {
  title: string;
  hasCoverImage: boolean;
  hasCodeSamples: boolean;
  includesBreakingChanges: boolean;
  audience: Audience;
  kind: ContentKind;
}

interface StepLog {
  step: string;
  message: string;
  level: "info" | "warn" | "error";
}

// 2) TEMPLATE METHOD BASE CLASS

abstract class ContentPublisher {
  abstract readonly id: string;
  abstract readonly label: string;
  abstract readonly description: string;

  // Template method (algorithm) — ลำดับหลักไม่ควรถูก override ง่าย ๆ
  publish(config: DraftConfig): StepLog[] {
    const logs: StepLog[] = [];

    logs.push({
      step: "init",
      message: `เริ่ม pipeline ด้วย publisher: ${this.label}`,
      level: "info",
    });

    const isValid = this.validate(config, logs);
    if (!isValid) {
      logs.push({
        step: "abort",
        message: "validation ไม่ผ่าน: ยกเลิกการ publish",
        level: "error",
      });
      return logs;
    }

    this.format(config, logs);
    this.enrich(config, logs);
    this.persist(config, logs);
    this.notify(config, logs);

    logs.push({
      step: "done",
      message: "publish เสร็จสมบูรณ์ ✨",
      level: "info",
    });

    return logs;
  }

  // Hook methods — subclass override ได้
  protected abstract validate(config: DraftConfig, logs: StepLog[]): boolean;
  protected abstract format(config: DraftConfig, logs: StepLog[]): void;
  protected abstract enrich(config: DraftConfig, logs: StepLog[]): void;
  protected abstract persist(config: DraftConfig, logs: StepLog[]): void;
  protected abstract notify(config: DraftConfig, logs: StepLog[]): void;
}

// 3) CONCRETE PUBLISHERS

// 3.1 บทความปกติ (Article)
class ArticlePublisher extends ContentPublisher {
  readonly id = "article";
  readonly label = "Article Publisher";
  readonly description =
    "pipeline สำหรับบทความทั่วไป เน้นความอ่านง่าย และ SEO-friendly";

  protected validate(config: DraftConfig, logs: StepLog[]): boolean {
    if (!config.title || config.title.trim().length < 5) {
      logs.push({
        step: "validate",
        message: "title สั้นเกินไป (ควรยาวอย่างน้อย 5 ตัวอักษร)",
        level: "error",
      });
      return false;
    }

    if (config.audience === "internal") {
      logs.push({
        step: "validate",
        message: "article แบบ public ไม่ควรมี audience = internal",
        level: "warn",
      });
    }

    logs.push({
      step: "validate",
      message: "ผ่าน validation สำหรับบทความทั่วไป",
      level: "info",
    });
    return true;
  }

  protected format(config: DraftConfig, logs: StepLog[]): void {
    logs.push({
      step: "format",
      message: "apply markdown + heading structure + SEO title",
      level: "info",
    });
  }

  protected enrich(config: DraftConfig, logs: StepLog[]): void {
    if (config.hasCoverImage) {
      logs.push({
        step: "enrich",
        message: "แนบ cover image สำหรับ social preview",
        level: "info",
      });
    }
    logs.push({
      step: "enrich",
      message: "เพิ่ม related links และขยาย snippet สำหรับ search",
      level: "info",
    });
  }

  protected persist(config: DraftConfig, logs: StepLog[]): void {
    logs.push({
      step: "persist",
      message: "บันทึกบทความลง content store พร้อม slug ถาวร",
      level: "info",
    });
  }

  protected notify(config: DraftConfig, logs: StepLog[]): void {
    logs.push({
      step: "notify",
      message: "ยิง notification ไปยัง public feed + RSS",
      level: "info",
    });
  }
}

// 3.2 Lab / Playground เน้นทดลอง
class LabPublisher extends ContentPublisher {
  readonly id = "lab";
  readonly label = "Lab / Playground Publisher";
  readonly description =
    "pipeline สำหรับ lab ที่เน้นทดลอง ปล่อยเร็ว ตรวจความเสถียรทีหลัง";

  protected validate(config: DraftConfig, logs: StepLog[]): boolean {
    if (!config.title) {
      logs.push({
        step: "validate",
        message: "lab ต้องมี title ขั้นต่ำ 1 ตัวอักษร",
        level: "error",
      });
      return false;
    }

    logs.push({
      step: "validate",
      message: "ยอม validation หลวม ๆ สำหรับ lab (move fast)",
      level: "warn",
    });
    return true;
  }

  protected format(config: DraftConfig, logs: StepLog[]): void {
    logs.push({
      step: "format",
      message: "format เน้น code-first + playground blocks",
      level: "info",
    });
  }

  protected enrich(config: DraftConfig, logs: StepLog[]): void {
    if (!config.hasCodeSamples) {
      logs.push({
        step: "enrich",
        message: "แนะนำให้เพิ่ม code samples ในภายหลัง",
        level: "warn",
      });
    } else {
      logs.push({
        step: "enrich",
        message: "แนบ code samples และ interactive widgets",
        level: "info",
      });
    }
  }

  protected persist(config: DraftConfig, logs: StepLog[]): void {
    logs.push({
      step: "persist",
      message: "บันทึกเป็น lab entry (ไม่ขึ้นหน้าแรก)",
      level: "info",
    });
  }

  protected notify(config: DraftConfig, logs: StepLog[]): void {
    logs.push({
      step: "notify",
      message: "แจ้งเตือนเฉพาะกลุ่ม internal/beta testers",
      level: "info",
    });
  }
}

// 3.3 Release Note สำหรับ version ใหม่
class ReleaseNotePublisher extends ContentPublisher {
  readonly id = "release-note";
  readonly label = "Release Note Publisher";
  readonly description =
    "pipeline สำหรับ release notes มี flow check breaking changes พิเศษ";

  protected validate(config: DraftConfig, logs: StepLog[]): boolean {
    if (!config.title || !config.includesBreakingChanges) {
      logs.push({
        step: "validate",
        message:
          "release note ควรระบุ breaking changes ให้ชัดเจน (ติ๊ก includesBreakingChanges)",
        level: "warn",
      });
    }

    if (config.audience === "public" && !config.includesBreakingChanges) {
      logs.push({
        step: "validate",
        message:
          "public release ที่ไม่มี breaking changes อาจไม่ต้องเขียน note ยาวมาก",
        level: "info",
      });
    }

    logs.push({
      step: "validate",
      message: "ผ่าน validation สำหรับ release note (มี checklist เสริม)",
      level: "info",
    });
    return true;
  }

  protected format(config: DraftConfig, logs: StepLog[]): void {
    logs.push({
      step: "format",
      message: "จัดหัวข้อเป็น Added / Changed / Fixed / Breaking",
      level: "info",
    });
  }

  protected enrich(config: DraftConfig, logs: StepLog[]): void {
    if (config.includesBreakingChanges) {
      logs.push({
        step: "enrich",
        message: "เพิ่ม migration guide สำหรับ breaking changes",
        level: "warn",
      });
    }
    logs.push({
      step: "enrich",
      message: "แนบลิงก์ไปยัง docs และ issue ที่เกี่ยวข้อง",
      level: "info",
    });
  }

  protected persist(config: DraftConfig, logs: StepLog[]): void {
    logs.push({
      step: "persist",
      message: "บันทึก release note เป็น versioned entry พร้อม tag เวอร์ชัน",
      level: "info",
    });
  }

  protected notify(config: DraftConfig, logs: StepLog[]): void {
    logs.push({
      step: "notify",
      message:
        "ยิง notification ไปยังผู้ใช้ที่ subscribe และทีม internal ที่เกี่ยวข้อง",
      level: "info",
    });
  }
}

const PUBLISHERS: ContentPublisher[] = [
  new ArticlePublisher(),
  new LabPublisher(),
  new ReleaseNotePublisher(),
];

// 4) REACT PAGE

const defaultConfig: DraftConfig = {
  title: "Design Patterns Update",
  hasCoverImage: true,
  hasCodeSamples: true,
  includesBreakingChanges: false,
  audience: "public",
  kind: "article",
};

const TemplateMethodDemoPage: React.FC = () => {
  const [config, setConfig] = useState<DraftConfig>(defaultConfig);
  const [publisherId, setPublisherId] = useState<string>(PUBLISHERS[0].id);
  const [logs, setLogs] = useState<StepLog[]>([]);

  const activePublisher = useMemo(
    () => PUBLISHERS.find((p) => p.id === publisherId) ?? PUBLISHERS[0],
    [publisherId],
  );

  const handleRun = () => {
    const newLogs = activePublisher.publish(config);
    setLogs(newLogs);
  };

  const handleReset = () => {
    setConfig(defaultConfig);
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-6xl">
        {/* Hero */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-[11px] tracking-[0.25em] text-slate-400 mb-2 uppercase">
              TEMPLATE METHOD · PUBLISHING PIPELINE DEMO
            </p>
            <h1 className="text-2xl font-semibold mb-1">
              Template Method Pattern — Publishing Playground
            </h1>
            <p className="text-sm text-slate-300 mb-4 max-w-2xl">
              หน้านี้ใช้ Template Method Pattern เพื่อกำหนดลำดับขั้นตอนการ publish เนื้อหา
              แบบตายตัว แต่เปิดให้แต่ละ publisher override รายละเอียดในแต่ละขั้นได้
            </p>
          </div>
        </div>

        {/* Layout grid */}
        <div className="grid lg:grid-cols-[260px,1fr] gap-6 mb-8">
          {/* Left side: publisher + config */}
          <div className="space-y-4">
            {/* Publisher selector */}
            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs">
              <h2 className="text-sm font-semibold mb-2">เลือก Publisher</h2>
              <div className="flex flex-wrap gap-2 mb-2">
                {PUBLISHERS.map((p) => {
                  const active = p.id === publisherId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPublisherId(p.id)}
                      className={`px-3 py-1 rounded-full border text-[11px] transition
                        ${active
                          ? "bg-emerald-400/90 border-emerald-200 text-black"
                          : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                      `}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-300">
                {activePublisher.description}
              </p>
            </div>

            {/* Draft config */}
            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs space-y-3">
              <h2 className="text-sm font-semibold mb-1">Draft Config</h2>

              <div className="space-y-1">
                <label className="block text-[11px] text-slate-300 mb-1">
                  Title
                </label>
                <input
                  value={config.title}
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, title: e.target.value }))
                  }
                  className="w-full rounded-md bg-slate-900 border border-white/15 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 text-[11px]">
                  <input
                    type="checkbox"
                    checked={config.hasCoverImage}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, hasCoverImage: e.target.checked }))
                    }
                    className="accent-emerald-400"
                  />
                  <span>มี cover image</span>
                </label>
                <label className="flex items-center gap-2 text-[11px]">
                  <input
                    type="checkbox"
                    checked={config.hasCodeSamples}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, hasCodeSamples: e.target.checked }))
                    }
                    className="accent-emerald-400"
                  />
                  <span>มี code samples</span>
                </label>
                <label className="flex items-center gap-2 text-[11px]">
                  <input
                    type="checkbox"
                    checked={config.includesBreakingChanges}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        includesBreakingChanges: e.target.checked,
                      }))
                    }
                    className="accent-emerald-400"
                  />
                  <span>มี breaking changes</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <p className="mb-1 text-slate-300">Audience</p>
                  <div className="flex flex-wrap gap-1">
                    {(["public", "beta", "internal"] as Audience[]).map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setConfig((c) => ({ ...c, audience: a }))}
                        className={`px-2 py-0.5 rounded-full border transition
                          ${config.audience === a
                            ? "bg-emerald-400/90 border-emerald-200 text-black"
                            : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                        `}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-slate-300">Kind</p>
                  <div className="flex flex-wrap gap-1">
                    {(["article", "lab", "release-note"] as ContentKind[]).map(
                      (k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setConfig((c) => ({ ...c, kind: k }))}
                          className={`px-2 py-0.5 rounded-full border transition
                            ${config.kind === k
                              ? "bg-emerald-400/90 border-emerald-200 text-black"
                              : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                          `}
                        >
                          {k}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleRun}
                  className="flex-1 px-3 py-1 rounded-md bg-emerald-500 text-black text-[11px] font-semibold hover:bg-emerald-400 transition"
                >
                  Run template method
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1 rounded-md bg-transparent border border-white/20 text-[11px] hover:border-white/60 transition"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Right side: logs */}
                  <div className="bg-black/50 border border-white/10 rounded-2xl p-4 text-[11px] max-h-130 overflow-auto">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400">Template Method Steps</p>
              <span className="text-slate-500">{logs.length} steps</span>
            </div>
            {logs.length === 0 ? (
              <p className="text-slate-500">
                ยังไม่ได้รัน pipeline — กดปุ่ม `Run template method` เพื่อดูขั้นตอน
              </p>
            ) : (
              <ul className="space-y-1">
                {logs.map((log, index) => (
                  <li
                    key={index}
                    className={`px-3 py-1.5 rounded-md border text-[11px] flex items-start gap-2
                      ${log.level === "error"
                        ? "border-rose-500/60 bg-rose-950/40"
                        : log.level === "warn"
                        ? "border-amber-400/60 bg-amber-950/40"
                        : "border-emerald-500/40 bg-emerald-950/30"}
                    `}
                  >
                    <span className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-slate-400 w-16">
                      {log.step}
                    </span>
                    <span className="text-slate-100 flex-1">{log.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Explanation + hints */}
        <div className="grid md:grid-cols-2 gap-6 mt-2 text-xs">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 leading-relaxed">
            <h2 className="text-sm font-semibold text-white mb-2">
              Template Method คืออะไร?
            </h2>
            <p className="text-slate-200 mb-2">
              Template Method Pattern กำหนดโครง (template) ของ algorithm ใน base class
              แล้วให้ subclass override เฉพาะบางขั้นได้ โดยไม่ต้องเปลี่ยนลำดับหลัก
            </p>
            <p className="text-slate-400">
              ในตัวอย่างนี้ method <span className="font-mono">publish()</span>
              เป็น template ที่ fix ลำดับขั้นตอน validate → format → enrich → persist → notify
              แต่ <span className="font-mono">ArticlePublisher</span>,
              <span className="font-mono">LabPublisher</span>,
              <span className="font-mono">ReleaseNotePublisher</span> override รายละเอียดแต่ละขั้นต่างกันได้
            </p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs text-slate-300">
            <p className="mb-1 font-mono text-[11px] text-slate-500 uppercase tracking-[0.2em]">
              PLAYGROUND HINT
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                เพิ่ม publisher ใหม่สำหรับ workflow พิเศษ เช่น
                ABTestPublisher, InternalMemoPublisher แล้ว reuse template เดิม
              </li>
              <li>
                แยก template method ออกไปเป็น base class
                ที่สามารถใช้ร่วมกับ service จริงใน backend ได้
              </li>
              <li>
                ผสม Template Method กับ Strategy โดยให้ hook บางตัว
                เรียกใช้ Strategy ภายนอก (เช่น กำหนด format strategy หรือ notify strategy)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateMethodDemoPage;
