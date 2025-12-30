"use client";

import React, { useState } from "react";

/**
 * ---------------------------------------------------------------------
 * FACTORY METHOD PATTERN — LAYOUT SYSTEM (DEMO PAGE)
 * ---------------------------------------------------------------------
 * หน้านี้เป็นสนามทดลองสำหรับ Factory Method โดยเฉพาะ
 *
 * แนวคิดหลักในหน้านี้:
 * - มี abstract creator: SectionCreator
 * - แต่ละ concrete creator สร้าง layout component ต่างกัน (ListSection, GridSection)
 * - Client เลือกว่าจะใช้ creator ตัวไหน แล้ว factory จะคืน React component กลับมา
 *
 * คุณสามารถ:
 * - เพิ่ม creator ใหม่ (เช่น MasonrySectionCreator, CarouselSectionCreator)
 * - เพิ่ม props/behavior ใหม่ใน SectionProps
 * - ขยายความสามารถของ layout แต่ละแบบได้เต็มที่
 */

// 1) PRODUCT INTERFACE (SECTION COMPONENT PROPS)
interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
}

interface SectionProps {
  title: string;
  items: Article[];
  highlightCategory?: string;
}

type SectionComponent = React.FC<SectionProps>;

// 2) CONCRETE PRODUCTS

// List-style layout
const ListSection: SectionComponent = ({ title, items, highlightCategory }) => {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
        <span className="h-6 w-1 bg-indigo-400 rounded-full" />
        {title}
      </h2>
      <div className="space-y-3">
        {items.map((item) => {
          const isHighlight = highlightCategory && item.category === highlightCategory;
          return (
            <div
              key={item.id}
              className={`border border-white/10 rounded-lg px-4 py-3 text-sm transition-colors
                ${isHighlight ? "border-indigo-400 bg-indigo-500/10" : "hover:border-white/25"}
              `}
            >
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-medium text-white">{item.title}</p>
                <span className="text-[11px] uppercase tracking-[0.2em] text-indigo-300">
                  {item.category}
                </span>
              </div>
              <p className="text-gray-300 text-xs mt-1">{item.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

// Grid-style layout
const GridSection: SectionComponent = ({ title, items, highlightCategory }) => {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
        <span className="h-6 w-1 bg-emerald-400 rounded-full" />
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const isHighlight = highlightCategory && item.category === highlightCategory;
          return (
            <div
              key={item.id}
              className={`rounded-2xl p-4 border text-sm transition-all duration-200
                ${isHighlight
                  ? "border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/20"
                  : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/40"}
              `}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300 mb-1">
                {item.category}
              </p>
              <h3 className="font-semibold text-white mb-1">{item.title}</h3>
              <p className="text-xs text-gray-200 leading-relaxed">{item.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

// 3) CREATOR ABSTRACTION
abstract class SectionCreator {
  abstract createSection(): SectionComponent;
}

// 4) CONCRETE CREATORS
class ListSectionCreator extends SectionCreator {
  createSection(): SectionComponent {
    return ListSection;
  }
}

class GridSectionCreator extends SectionCreator {
  createSection(): SectionComponent {
    return GridSection;
  }
}

// ตัวอย่าง: สามารถเพิ่ม Creator ใหม่ได้ เช่น MasonrySectionCreator
// class MasonrySectionCreator extends SectionCreator {
//   createSection(): SectionComponent {
//     return MasonrySection;
//   }
// }

// 5) FACTORY METHOD (HELPER)
const creatorRegistry: Record<"list" | "grid", SectionCreator> = {
  list: new ListSectionCreator(),
  grid: new GridSectionCreator(),
};

type LayoutKind = keyof typeof creatorRegistry; // "list" | "grid"

const createSectionComponent = (layout: LayoutKind): SectionComponent => {
  return creatorRegistry[layout].createSection();
};

// 6) SAMPLE DATA
const SAMPLE_ARTICLES: Article[] = [
  {
    id: "a1",
    title: "Factory Method vs Abstract Factory",
    description:
      "Understand when to use a single creator vs a family of related factories.",
    category: "design-patterns",
  },
  {
    id: "a2",
    title: "Scaling Layout Variants",
    description:
      "Create new layouts (list/grid/masonry) without touching the calling code.",
    category: "layout",
  },
  {
    id: "a3",
    title: "Next.js UI Composition",
    description:
      "Use factory method to swap React components while keeping props stable.",
    category: "react",
  },
];

// 7) DEMO PAGE COMPONENT
const FactoryMethodDemoPage: React.FC = () => {
  const [layout, setLayout] = useState<LayoutKind>("list");
  const [highlightCategory, setHighlightCategory] = useState<string | undefined>(
    "design-patterns",
  );

  const Section = createSectionComponent(layout);

  return (
    <div className="min-h-screen bg-[#020617] text-gray-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Hero / Intro */}
        <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-[11px] tracking-[0.25em] text-slate-400 mb-2 uppercase">
              FACTORY METHOD · LAYOUT DEMO
            </p>
            <h1 className="text-2xl font-semibold mb-1">
              Factory Method — Section Layout Creator
            </h1>
            <p className="text-sm text-slate-300 mb-4 max-w-xl">
              หน้านี้สาธิตการใช้ Factory Method ในการสร้าง layout ของ section
              คุณสามารถสลับระหว่าง list/grid ได้ โดย component ที่เรียกใช้
              ยังใช้ interface เดิม ไม่ต้องเปลี่ยนโค้ดส่วน client เลย
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <button
                onClick={() => setLayout("list")}
                className={`px-3 py-1.5 text-xs rounded-full border transition-all
                  ${layout === "list"
                    ? "bg-indigo-500 border-indigo-400 text-white shadow"
                    : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                `}
              >
                List layout
              </button>
              <button
                onClick={() => setLayout("grid")}
                className={`px-3 py-1.5 text-xs rounded-full border transition-all
                  ${layout === "grid"
                    ? "bg-emerald-500 border-emerald-400 text-white shadow"
                    : "bg-transparent border-white/20 text-slate-200 hover:border-white/60"}
                `}
              >
                Grid layout
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
              <span className="uppercase tracking-[0.2em] text-slate-500 mr-1">
                Highlight category:
              </span>
              {[
                "design-patterns",
                "layout",
                "react",
                undefined,
              ].map((cat) => (
                <button
                  key={cat ?? "none"}
                  onClick={() => setHighlightCategory(cat)}
                  className={`px-2 py-1 rounded-full border transition-all text-[11px]
                    ${highlightCategory === cat
                      ? "border-amber-400 bg-amber-500/20 text-amber-100"
                      : "border-white/10 text-slate-200 hover:border-white/40"}
                  `}
                >
                  {cat ?? "(none)"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs leading-relaxed">
            <h2 className="text-sm font-semibold text-white mb-2">Factory Method คืออะไร?</h2>
            <p className="text-slate-200 mb-2">
              Factory Method แยก `การสร้าง object` ออกจาก client โดยให้ subclass
              เป็นผู้ตัดสินใจว่าจะสร้าง product แบบไหน ในหน้านี้ subclasses
              สร้าง layout ต่างกัน (ListSection, GridSection) แต่ client แค่เรียก
              <span className="font-mono"> createSectionComponent(layout) </span>
              เท่านั้น
            </p>
            <p className="text-slate-400">
              ลองเพิ่ม <span className="font-mono">SectionCreator</span> ใหม่
              เช่น <span className="font-mono">MasonrySectionCreator</span> หรือ
              <span className="font-mono">TimelineSectionCreator</span> แล้วเพิ่ม key
              ลงใน <span className="font-mono">creatorRegistry</span> เพื่อดูว่า
              client side ไม่ต้องเปลี่ยนโค้ดเลย
            </p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-200 space-y-1">
            <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-1">
              CURRENT CREATOR
            </p>
            <p>
              <span className="text-slate-500">layout key:</span> {layout}
            </p>
            <p>
              <span className="text-slate-500">concrete creator:</span>{" "}
              {layout === "list" ? "ListSectionCreator" : "GridSectionCreator"}
            </p>
            <p>
              <span className="text-slate-500">product component:</span>{" "}
              {layout === "list" ? "ListSection" : "GridSection"}
            </p>
          </div>
        </div>

        {/* Render section via Factory Method */}
        <Section
          title="Articles rendered via Factory Method"
          items={SAMPLE_ARTICLES}
          highlightCategory={highlightCategory}
        />

        {/* Playground hints */}
        <div className="mt-10 text-xs text-slate-400 border-t border-white/5 pt-4">
          <p className="mb-1 font-mono text-[11px] text-slate-500">
            PLAYGROUND HINT
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              เพิ่ม field ใหม่ใน <span className="font-mono">SectionProps</span>
              เช่น <span className="font-mono">showIndex</span> หรือ
              <span className="font-mono">showCategoryBadge</span> แล้ว implement ใน
              ทุก layout
            </li>
            <li>
              สร้าง creator เพิ่ม เช่น <span className="font-mono">`compact`</span>
              แล้วเพิ่มใน <span className="font-mono">creatorRegistry</span>
            </li>
            <li>
              ลองใช้ Factory Method นี้ร่วมกับ Abstract Factory จากหน้าก่อน
              โดยให้แต่ละ layout เลือกใช้ theme factory ต่างกัน
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FactoryMethodDemoPage;
