"use client";

import React, { useState } from "react";

/**
 * ---------------------------------------------------------------------
 * ADAPTER PATTERN — EXTERNAL DATA INTEGRATION PLAYGROUND (DEMO PAGE)
 * ---------------------------------------------------------------------
 * หน้านี้เป็นสนามทดลองสำหรับ Adapter Pattern โดยเฉพาะ
 *
 * แนวคิดหลัก:
 * - มี "external data shape" หลายแบบจากระบบภายนอก
 * - เราสร้าง Adapter ช่วยแปลงให้กลายเป็น internal model เดียวกัน
 * - ทำให้ส่วนอื่นของระบบคุยกับ model เดียว ไม่ต้องสนใจรูปแบบเดิม
 *
 * คุณสามารถ:
 * - เพิ่ม external format ใหม่ + adapter ใหม่
 * - ขยาย internal model (ContentItem) แล้วอัปเดต logic ของ adapters
 * - ทดลองผสมหลาย adapter พร้อมกันใน list เดียว
 */

// 1) INTERNAL MODEL (เป้าหมายของการแปลง)
interface ContentItem {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  source: string; // เพื่อรู้ว่ามาจาก adapter ไหน
}

// 2) EXTERNAL DATA SHAPES (จำลอง API ภายนอก)
interface ExternalBlogPost {
  post_id: string;
  headline: string;
  body: string;
  published_at: string;
  categories: string[];
}

interface ExternalProject {
  project_id: string;
  name: string;
  summary: string;
  year: number;
  tech_stack: string[];
}

interface ExternalResearch {
  paperId: string;
  title: string;
  abstract: string;
  year: string;
  keywords: string[];
}

// 3) ADAPTER INTERFACE
interface IContentAdapter {
  adapt(): ContentItem;
}

// 4) CONCRETE ADAPTERS
class BlogPostAdapter implements IContentAdapter {
  constructor(private external: ExternalBlogPost) {}

  adapt(): ContentItem {
    return {
      id: this.external.post_id,
      title: this.external.headline,
      description: this.external.body,
      date: this.external.published_at,
      tags: this.external.categories,
      source: "blog-api",
    };
  }
}

class ProjectAdapter implements IContentAdapter {
  constructor(private external: ExternalProject) {}

  adapt(): ContentItem {
    return {
      id: this.external.project_id,
      title: this.external.name,
      description: this.external.summary,
      date: this.external.year.toString(),
      tags: this.external.tech_stack,
      source: "project-api",
    };
  }
}

class ResearchAdapter implements IContentAdapter {
  constructor(private external: ExternalResearch) {}

  adapt(): ContentItem {
    return {
      id: this.external.paperId,
      title: this.external.title,
      description: this.external.abstract,
      date: this.external.year,
      tags: this.external.keywords,
      source: "research-api",
    };
  }
}

// Generic JSON adapter (คล้ายใน main app แต่ simplified)
class JSONContentAdapter implements IContentAdapter {
  constructor(
    private json: Record<string, unknown>,
    private type: "blog" | "project" | "research",
  ) {}

  adapt(): ContentItem {
    const id =
      (this.json.id as string) ||
      (this.json.post_id as string) ||
      (this.json.project_id as string) ||
      (this.json.paperId as string) ||
      Math.random().toString(36).slice(2, 9);

    const title =
      (this.json.title as string) ||
      (this.json.headline as string) ||
      (this.json.name as string) ||
      "Untitled";

    const description =
      (this.json.description as string) ||
      (this.json.body as string) ||
      (this.json.summary as string) ||
      (this.json.abstract as string) ||
      "No description";

    const date =
      (this.json.date as string) ||
      (this.json.published_at as string) ||
      (this.json.year as string) ||
      new Date().getFullYear().toString();

    const tags =
      (this.json.tags as string[]) ||
      (this.json.categories as string[]) ||
      (this.json.tech_stack as string[]) ||
      (this.json.keywords as string[]) ||
      [];

    return {
      id,
      title,
      description,
      date: date.toString(),
      tags,
      source: `json-${this.type}`,
    };
  }
}

// 5) SAMPLE EXTERNAL DATA
const sampleBlog: ExternalBlogPost = {
  post_id: "b1",
  headline: "Understanding the Adapter Pattern",
  body: "Adapter allows objects with incompatible interfaces to collaborate.",
  published_at: "2024-09-01",
  categories: ["design-patterns", "adapter", "architecture"],
};

const sampleProject: ExternalProject = {
  project_id: "p1",
  name: "External Analytics Dashboard",
  summary: "Dashboard fetching metrics from multiple external APIs.",
  year: 2023,
  tech_stack: ["Next.js", "TypeScript", "REST"],
};

const sampleResearch: ExternalResearch = {
  paperId: "r1",
  title: "A Study on Data Integration",
  abstract: "This paper discusses techniques for integrating heterogeneous data sources.",
  year: "2022",
  keywords: ["integration", "adapter", "systems"],
};

// 6) DEMO PAGE COMPONENT
const AdapterDemoPage: React.FC = () => {
  const [items, setItems] = useState<ContentItem[]>([]);

  const addFromBlog = () => {
    const adapter = new BlogPostAdapter(sampleBlog);
    setItems((prev) => [adapter.adapt(), ...prev]);
  };

  const addFromProject = () => {
    const adapter = new ProjectAdapter(sampleProject);
    setItems((prev) => [adapter.adapt(), ...prev]);
  };

  const addFromResearch = () => {
    const adapter = new ResearchAdapter(sampleResearch);
    setItems((prev) => [adapter.adapt(), ...prev]);
  };

  const addFromJSON = () => {
    const raw: Record<string, unknown> = {
      id: "custom-json-1",
      title: "Custom Imported Item",
      description: "Item created from flexible JSON adapter.",
      date: "2025",
      tags: ["json", "flexible"],
    };
    const adapter = new JSONContentAdapter(raw, "project");
    setItems((prev) => [adapter.adapt(), ...prev]);
  };

  const clearItems = () => setItems([]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-5xl">
        {/* Hero / Intro */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-[11px] tracking-[0.25em] text-slate-400 mb-2 uppercase">
              ADAPTER · EXTERNAL DATA DEMO
            </p>
            <h1 className="text-2xl font-semibold mb-1">
              Adapter Pattern — External Data Integration Playground
            </h1>
            <p className="text-sm text-slate-300 mb-3 max-w-2xl">
              หน้านี้สาธิตการใช้ Adapter Pattern เพื่อแปลงข้อมูลจาก API ภายนอกหลายแบบ
              ให้กลายเป็น internal model เดียวกัน (<span className="font-mono">ContentItem</span>)
              ทำให้ส่วนอื่นของระบบไม่ต้องรู้รายละเอียดโครงสร้างเดิม
            </p>
          </div>
        </div>

        {/* Control Panel & Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs leading-relaxed">
            <h2 className="text-sm font-semibold text-white mb-2">Adapter คืออะไร?</h2>
            <p className="text-slate-200 mb-2">
              Adapter ทำหน้าที่เป็นตัวกลางแปลง interface ในกรณีที่ code ภายในของเรา
              ต้องการรูปแบบข้อมูลหนึ่ง แต่ data ที่ได้จากภายนอกมีโครงสร้างต่างออกไป.
            </p>
            <p className="text-slate-400">
              ในหน้านี้ <span className="font-mono">BlogPostAdapter</span>,
              <span className="font-mono">ProjectAdapter</span>,
              <span className="font-mono">ResearchAdapter</span> และ
              <span className="font-mono">JSONContentAdapter</span> ช่วย map field
              จาก external shapes ให้กลายเป็น <span className="font-mono">ContentItem</span>
              แบบเดียวกันทั้งหมด
            </p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-200 space-y-2">
            <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-1">
              ACTIONS
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                onClick={addFromBlog}
                className="px-3 py-1.5 rounded-full bg-sky-500/90 hover:bg-sky-400 text-white border border-sky-300 text-[11px] transition-all"
              >
                Import from Blog API
              </button>
              <button
                onClick={addFromProject}
                className="px-3 py-1.5 rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-white border border-emerald-300 text-[11px] transition-all"
              >
                Import from Project API
              </button>
              <button
                onClick={addFromResearch}
                className="px-3 py-1.5 rounded-full bg-violet-500/90 hover:bg-violet-400 text-white border border-violet-300 text-[11px] transition-all"
              >
                Import from Research API
              </button>
              <button
                onClick={addFromJSON}
                className="px-3 py-1.5 rounded-full bg-amber-500/90 hover:bg-amber-400 text-white border border-amber-300 text-[11px] transition-all"
              >
                Import from JSON (Generic Adapter)
              </button>
            </div>
            <button
              onClick={clearItems}
              className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-500/70 text-[11px] transition-all"
            >
              Clear all items
            </button>
            <p className="text-[11px] text-slate-400 mt-2">
              ลองดูว่าทุก adapter แปลงข้อมูลให้กลายเป็น structure เดียวกันได้อย่างไร
            </p>
          </div>
        </div>

        {/* Adapted Items List */}
        <div className="space-y-3 mb-10">
          {items.length === 0 ? (
            <div className="border border-dashed border-slate-600 rounded-xl p-6 text-xs text-slate-400 text-center">
              ยังไม่มี item ที่ถูก import — กดปุ่มด้านบนเพื่อ import จากแหล่งต่าง ๆ
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id + item.source}
                className="border border-white/10 bg-slate-900/70 rounded-2xl p-4 text-xs flex flex-col gap-2"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <p className="text-[11px] text-slate-500 font-mono mb-1">
                      id: <span className="text-slate-200">{item.id}</span>
                    </p>
                    <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full border border-slate-500/70 text-[10px] font-mono uppercase tracking-[0.12em] text-slate-200 bg-slate-800/80">
                    {item.source}
                  </span>
                </div>
                <p className="text-[11px] text-slate-200">{item.description}</p>
                <div className="flex flex-wrap items-center gap-1 mt-1">
                  <span className="text-[10px] text-slate-500 mr-1">date:</span>
                  <span className="text-[10px] text-sky-300 font-mono">{item.date}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1 mt-1">
                  {item.tags.map((tag) => (
                    <span
                      key={tag + item.id}
                      className="px-2 py-0.5 rounded-full border border-slate-500/60 bg-slate-800 text-[10px] font-mono text-slate-100"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags.length === 0 && (
                    <span className="text-[10px] text-slate-500 italic">
                      (no tags)
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Playground hints */}
        <div className="mt-4 text-xs text-slate-400 border-t border-white/5 pt-4">
          <p className="mb-1 font-mono text-[11px] text-slate-500">PLAYGROUND HINT</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              เพิ่ม external shape ใหม่ เช่น <span className="font-mono">ExternalVideo</span>
              หรือ <span className="font-mono">ExternalEvent</span> แล้วสร้าง adapter ใหม่
              ที่ implement <span className="font-mono">IContentAdapter</span>
            </li>
            <li>
              ลองขยาย internal <span className="font-mono">ContentItem</span> ให้มี field
              เพิ่ม เช่น <span className="font-mono">author</span>, <span className="font-mono">url</span>
              แล้วปรับทุก adapter ให้เติมค่าตาม context ของตัวเอง
            </li>
            <li>
              ทดลองสร้าง `Bi-directional Adapter` หรือ `Adapter + Proxy` เพื่อทั้ง
              แปลงข้อมูลและ validate/clean ไปพร้อมกัน
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdapterDemoPage;
