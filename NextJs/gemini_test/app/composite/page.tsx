"use client";

import React, { useRef, useState } from "react";

/**
 * ---------------------------------------------------------------------
 * COMPOSITE PATTERN — HIERARCHICAL STRUCTURE PLAYGROUND (DEMO PAGE)
 * ---------------------------------------------------------------------
 * หน้านี้เป็นสนามทดลองสำหรับ Composite Pattern โดยเฉพาะ
 *
 * แนวคิดหลัก:
 * - สร้างโครงสร้างแบบ Tree (ต้นไม้) ที่ประกอบด้วยทั้ง "กลุ่ม" (Composite)
 *   และ "ใบไม้" (Leaf) แต่ client ใช้ interface เดียวกันหมด
 * - สามารถเพิ่ม/ลบ node ได้ โดยไม่สนว่า node นั้นเป็น leaf หรือ composite
 *
 * คุณสามารถ:
 * - เพิ่ม group/item ใหม่ลงใน tree
 * - ลองปรับ interface ให้ composite มี operation เพิ่มเติม (เช่น move, rename)
 * - ลองต่อยอดทำ feature อย่าง collapse/expand, drag & drop ฯลฯ
 */

// 1) COMPOSITE INTERFACE
interface ITreeComponent {
  id: string;
  getName(): string;
  setName(name: string): void;
  getChildren(): ITreeComponent[];
  addChild(child: ITreeComponent): void;
  removeChildById(childId: string): void;
  isLeaf(): boolean;
  kind: "group" | "item";
}

// 2) LEAF IMPLEMENTATION
class ItemLeaf implements ITreeComponent {
  public kind: "group" | "item" = "item";

  constructor(public id: string, private name: string) {}

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  getChildren(): ITreeComponent[] {
    return [];
  }

  addChild(): void {
    // leaf ไม่สามารถมีลูกได้
    console.warn("Cannot add child to leaf item");
  }

  removeChildById(): void {
    console.warn("Leaf has no children to remove");
  }

  isLeaf(): boolean {
    return true;
  }
}

// 3) COMPOSITE IMPLEMENTATION
class GroupComposite implements ITreeComponent {
  public kind: "group" | "item" = "group";
  private children: ITreeComponent[] = [];

  constructor(public id: string, private name: string) {}

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  getChildren(): ITreeComponent[] {
    return this.children;
  }

  addChild(child: ITreeComponent): void {
    this.children.push(child);
  }

  removeChildById(childId: string): void {
    this.children = this.children.filter((c) => c.id !== childId);
  }

  isLeaf(): boolean {
    return false;
  }
}

// 4) HELPER: FIND NODE BY ID (DEPTH-FIRST)
function findNodeById(root: ITreeComponent, id: string): ITreeComponent | null {
  if (root.id === id) return root;
  for (const child of root.getChildren()) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
}

function findParentOf(root: ITreeComponent, targetId: string): GroupComposite | null {
  for (const child of root.getChildren()) {
    if (child.id === targetId && !root.isLeaf()) {
      return root as GroupComposite;
    }
    const parent = findParentOf(child, targetId);
    if (parent) return parent;
  }
  return null;
}

// 5) DEMO PAGE COMPONENT
const CompositeDemoPage: React.FC = () => {
  const idCounter = useRef(3);
  const [selectedId, setSelectedId] = useState<string | null>("root");
  const [, forceUpdate] = useState(0);

  // Initialize root tree once
  const rootRef = useRef<GroupComposite | null>(null);
  if (rootRef.current === null) {
    const root = new GroupComposite("root", "My Portfolio");

    const groupProjects = new GroupComposite("g1", "Projects");
    groupProjects.addChild(new ItemLeaf("i1", "Algorithmic Trading Bot"));
    groupProjects.addChild(new ItemLeaf("i2", "Knowledge Graph Explorer"));

    const groupBlog = new GroupComposite("g2", "Blog");
    groupBlog.addChild(new ItemLeaf("i3", "Understanding React Hooks"));

    root.addChild(groupProjects);
    root.addChild(groupBlog);

    rootRef.current = root;
  }

  const root = rootRef.current!;

  const bump = () => forceUpdate((v) => v + 1);

  const handleAddGroup = () => {
    const baseName = "New Group";
    const newId = `g${idCounter.current++}`;
    const newGroup = new GroupComposite(newId, `${baseName} #${idCounter.current}`);

    const targetId = selectedId ?? "root";
    const targetNode = findNodeById(root, targetId);
    const target = targetNode && !targetNode.isLeaf() ? targetNode : root;

    (target as GroupComposite).addChild(newGroup);
    setSelectedId(newId);
    bump();
  };

  const handleAddItem = () => {
    const baseName = "New Item";
    const newId = `i${idCounter.current++}`;
    const newItem = new ItemLeaf(newId, `${baseName} #${idCounter.current}`);

    const targetId = selectedId ?? "root";
    const targetNode = findNodeById(root, targetId);
    const target = targetNode && !targetNode.isLeaf() ? targetNode : root;

    (target as GroupComposite).addChild(newItem);
    setSelectedId(newId);
    bump();
  };

  const handleRemoveSelected = () => {
    if (!selectedId || selectedId === "root") return;
    const parent = findParentOf(root, selectedId);
    if (!parent) return;
    parent.removeChildById(selectedId);
    setSelectedId("root");
    bump();
  };

  // Render tree recursively
  const renderNode = (node: ITreeComponent, depth = 0): React.ReactNode => {
    const isSelected = selectedId === node.id;
    const isGroup = !node.isLeaf();

    return (
        <div key={node.id} className="ml-1.5">
        <div
          className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer border
            ${isSelected
              ? "border-emerald-400 bg-emerald-500/10"
              : "border-transparent hover:border-slate-600 hover:bg-slate-800/60"}
          `}
          style={{ marginLeft: depth * 12 }}
          onClick={() => setSelectedId(node.id)}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isGroup ? "bg-emerald-400" : "bg-slate-400"
            }`}
          />
          <span className="text-[11px] text-slate-100 truncate">
            {isGroup ? "[Group]" : "[Item]"} {node.getName()}
          </span>
        </div>
        {!node.isLeaf() && (
          <div className="border-l border-slate-700 ml-2 pl-2 mt-0.5 space-y-0.5">
            {node.getChildren().map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const selectedNode = selectedId ? findNodeById(root, selectedId) : null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-5xl">
        {/* Hero / Intro */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-[11px] tracking-[0.25em] text-slate-400 mb-2 uppercase">
              COMPOSITE · TREE STRUCTURE DEMO
            </p>
            <h1 className="text-2xl font-semibold mb-1">
              Composite Pattern — Hierarchical Structure Playground
            </h1>
            <p className="text-sm text-slate-300 mb-4 max-w-2xl">
              หน้านี้ใช้ Composite Pattern เพื่อสร้าง tree ของ Portfolio (Root → Groups → Items)
              โดยให้ทั้งกลุ่ม (GroupComposite) และใบไม้ (ItemLeaf) ใช้ interface เดียวกัน
              ทำให้ client สามารถ traverse และจัดการ node ได้อย่างสม่ำเสมอ
            </p>
          </div>
        </div>

        {/* Controls + Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Controls */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs space-y-3">
            <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-1">
              TREE OPERATIONS
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleAddGroup}
                className="px-3 py-1.5 rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-white border border-emerald-300 text-[11px] transition-all"
              >
                Add Group under selected (or root)
              </button>
              <button
                onClick={handleAddItem}
                className="px-3 py-1.5 rounded-full bg-sky-500/90 hover:bg-sky-400 text-white border border-sky-300 text-[11px] transition-all"
              >
                Add Item under selected (or root)
              </button>
              <button
                onClick={handleRemoveSelected}
                disabled={!selectedId || selectedId === "root"}
                className={`px-3 py-1.5 rounded-full border text-[11px] transition-all
                  ${!selectedId || selectedId === "root"
                    ? "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed"
                    : "bg-rose-500/90 border-rose-300 text-white hover:bg-rose-400"}
                `}
              >
                Remove selected node (except root)
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              เลือก node จาก tree ด้านขวา แล้วกดปุ่มเพื่อเพิ่ม group/item หรือจะลบ node
              ที่เลือก (ยกเว้น root) ก็ได้
            </p>
          </div>

          {/* Explanation */}
          <div className="md:col-span-2 bg-black/40 border border-white/10 rounded-2xl p-4 text-xs leading-relaxed">
            <h2 className="text-sm font-semibold text-white mb-2">Composite คืออะไร?</h2>
            <p className="text-slate-200 mb-2">
              Composite Pattern ทำให้เราสามารถจัดการ object เดี่ยว (Leaf) และชุดของ object
              (Composite) ผ่าน interface เดียวกัน เช่น การแสดงผล, การลบ, การ traverse tree.
            </p>
            <p className="text-slate-400 mb-1">
              ในหน้านี้ <span className="font-mono">GroupComposite</span> และ
              <span className="font-mono">ItemLeaf</span> implement interface เดียวกัน
              (<span className="font-mono">ITreeComponent</span>) ดังนั้น code ในส่วน render
              tree ไม่ต้องเช็คประเภทพิเศษมากนัก
            </p>
            {selectedNode && (
              <p className="text-[11px] text-slate-400 mt-2">
                <span className="font-mono text-slate-500">Selected:</span>{" "}
                {selectedNode.isLeaf() ? "[Item] " : "[Group] "}
                {selectedNode.getName()} (id: {selectedNode.id})
              </p>
            )}
          </div>
        </div>

        {/* Tree View */}
        <div className="mb-10 bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs">
          <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-2">
            PORTFOLIO TREE (COMPOSITE STRUCTURE)
          </p>
          <div className="space-y-1">
            {renderNode(root)}
          </div>
        </div>

        {/* Playground hints */}
        <div className="mt-4 text-xs text-slate-400 border-t border-white/5 pt-4">
          <p className="mb-1 font-mono text-[11px] text-slate-500">PLAYGROUND HINT</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              เพิ่ม method ใหม่ใน <span className="font-mono">ITreeComponent</span> เช่น
              <span className="font-mono">count()</span> หรือ
              <span className="font-mono">render()</span> แล้วลองให้ทั้ง Leaf/Composite
              implement ต่างกัน
            </li>
            <li>
              ลองเพิ่ม property เช่น <span className="font-mono">icon</span> หรือ
              <span className="font-mono">badge</span> แล้วคิดว่าจะเก็บไว้ที่ leaf,
              composite หรือทั้งสองแบบ
            </li>
            <li>
              ต่อ pattern นี้เข้ากับ Iterator หรือ Visitor เพื่อเดิน tree
              หรือทำ operation ต่าง ๆ บนทุก node
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CompositeDemoPage;
