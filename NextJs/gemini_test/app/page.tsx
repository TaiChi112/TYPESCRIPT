"use client"

import React, { useState, useEffect, useReducer, useRef } from 'react';
import { Book, Code, Layout, Terminal, User, FileText, Cpu, Layers, Feather, GraduationCap, Briefcase, Copy, Plus, Activity, X, Upload, Zap, Sparkles, Shield, Repeat, Undo2, Redo2 } from 'lucide-react';

/**
 * ---------------------------------------------------------------------
 * 1. PATTERN 5: SINGLETON PATTERN (GLOBAL STATE/LOGGER)
 * ---------------------------------------------------------------------
 * รับผิดชอบเรื่อง "การมี Instance เดียวตลอดกาล" (Global Access Point)
 * ใช้สำหรับเก็บ Logs การกระทำของผู้ใช้ (Session History)
 */

class SessionLogger {
  // 1. Private Static Instance
  private static instance: SessionLogger;

  private logs: string[] = [];
  private listeners: (() => void)[] = [];
  private pauseNotifications = true; // Start paused to prevent render loops

  // 2. Private Constructor เพื่อป้องกันการใช้ new SessionLogger() จากภายนอก
  private constructor() {
    this.addLog("Session started. Singleton initialized.");
  }

  // 3. Public Static Method เพื่อเข้าถึง Instance (Lazy Initialization)
  public static getInstance(): SessionLogger {
    if (!SessionLogger.instance) {
      SessionLogger.instance = new SessionLogger();
    }
    return SessionLogger.instance;
  }

  // Business Logic
  public addLog(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.unshift(`[${timestamp}] ${message}`);
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100); // เก็บแค่ 100 รายการล่าสุด
    }
    this.notifyListeners(); // แจ้งเตือน React ให้ re-render
  }

  public getLogs(): string[] {
    return this.logs;
  }

  public clearLogs(): void {
    this.logs = [];
    this.addLog("Logs cleared.");
    this.notifyListeners();
  }

  // Helper สำหรับเชื่อมต่อกับ React State
  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    if (!this.pauseNotifications) {
      this.listeners.forEach(listener => listener());
    }
  }

  // Resume notifications (call after component mounts)
  public resumeNotifications(): void {
    this.pauseNotifications = false;
  }

  // Pause notifications (for initialization)
  public pauseNotificationsMethod(): void {
    this.pauseNotifications = true;
  }
}

/**
 * ---------------------------------------------------------------------
 * 2. PATTERN 4: PROTOTYPE PATTERN (DATA CLONING)
 * ---------------------------------------------------------------------
 */

interface Prototype<T> {
  clone(): T;
}

class ContentItem implements Prototype<ContentItem> {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public date: string,
    public tags: string[]
  ) { }

  clone(): ContentItem {
    // เมื่อมีการ Clone ให้เรียก Singleton เพื่อบันทึก Log
    SessionLogger.getInstance().addLog(`Prototype Pattern: Cloned "${this.title}"`);

    const newId = Math.random().toString(36).slice(2,11)
    return new ContentItem(newId, `${this.title} (Copy)`, this.description, this.date, [...this.tags]);
  }
}

/**
 * ---------------------------------------------------------------------
 * STRUCTURAL PATTERN: ADAPTER PATTERN (EXTERNAL DATA INTEGRATION)
 * ---------------------------------------------------------------------
 * รับผิดชอบเรื่อง "การแปลง Interface ของ External Data" ให้เข้ากับระบบภายใน
 * ใช้สำหรับ Import ข้อมูลจาก External APIs หรือ Different Data Formats
 */

// External Data Formats (Third-party APIs)
interface ExternalBlogPost {
  post_id: string;
  headline: string;
  content: string;
  published_date: string;
  categories: string[];
}

interface ExternalProject {
  project_id: string;
  name: string;
  summary: string;
  year: number;
  tech_stack: string[];
}

// Adapter Interface
interface IContentAdapter {
  adapt(): ContentItem;
}

// Concrete Adapter สำหรับ External Blog
class ExternalBlogAdapter implements IContentAdapter {
  constructor(private externalData: ExternalBlogPost) {}

  adapt(): ContentItem {
    SessionLogger.getInstance().addLog(
      `Adapter Pattern: Converted external blog "${this.externalData.headline}"`
    );

    return new ContentItem(
      this.externalData.post_id,
      this.externalData.headline,
      this.externalData.content,
      this.externalData.published_date,
      this.externalData.categories
    );
  }
}

// Concrete Adapter สำหรับ External Project
class ExternalProjectAdapter implements IContentAdapter {
  constructor(private externalData: ExternalProject) {}

  adapt(): ContentItem {
    SessionLogger.getInstance().addLog(
      `Adapter Pattern: Converted external project "${this.externalData.name}"`
    );

    return new ContentItem(
      this.externalData.project_id,
      this.externalData.name,
      this.externalData.summary,
      this.externalData.year.toString(),
      this.externalData.tech_stack
    );
  }
}

// Generic JSON Adapter (flexible)
class JSONContentAdapter implements IContentAdapter {
  constructor(private jsonData: Record<string, unknown>, private type: 'blog' | 'project' | 'research') {}

  adapt(): ContentItem {
    SessionLogger.getInstance().addLog(
      `Adapter Pattern: Imported ${this.type} from JSON`
    );

    // Flexible mapping based on common field names
    const id = (this.jsonData.id || this.jsonData.post_id || this.jsonData.project_id || Math.random().toString(36).slice(2, 11)) as string;
    const title = (this.jsonData.title || this.jsonData.name || this.jsonData.headline || 'Untitled') as string;
    const description = (this.jsonData.description || this.jsonData.summary || this.jsonData.content || 'No description') as string;
    const date = (this.jsonData.date || this.jsonData.year || this.jsonData.published_date || new Date().getFullYear().toString()) as string;
    const tags = (this.jsonData.tags || this.jsonData.categories || this.jsonData.tech_stack || []) as string[];

    return new ContentItem(id, title, description, date.toString(), tags);
  }
}

/**
 * ---------------------------------------------------------------------
 * STRUCTURAL PATTERN: BRIDGE PATTERN (RENDERING STRATEGIES)
 * ---------------------------------------------------------------------
 * รับผิดชอบเรื่อง "การแยก Abstraction ออกจาก Implementation"
 * ให้ทั้ง 2 ส่วนสามารถเปลี่ยนแปลงได้อิสระ
 * 
 * Use Case: แยก "ContentItem (What)" ออกจาก "RenderStrategy (How)"
 * - สามารถเปลี่ยน Render Mode ได้โดยไม่แก้ ContentItem
 * - สามารถเพิ่ม ContentItem Type ใหม่โดยไม่แก้ RenderStrategy
 */

// Implementor Interface (How to Render)
interface IRenderStrategy {
  renderTitle(title: string): React.ReactNode;
  renderDescription(description: string): React.ReactNode;
  renderMeta(date: string, tags: string[]): React.ReactNode;
}

// Concrete Implementor 1: Preview Mode (แสดงแบบสั้น)
class PreviewRenderStrategy implements IRenderStrategy {
  renderTitle(title: string): React.ReactNode {
    return <h4 className="font-bold text-base truncate">{title}</h4>;
  }

  renderDescription(description: string): React.ReactNode {
    return <p className="text-xs opacity-70 line-clamp-1">{description}</p>;
  }

  renderMeta(date: string, tags: string[]): React.ReactNode {
    return (
      <div className="flex items-center gap-2 text-xs opacity-50">
        <span>{date}</span>
        {tags.length > 0 && <span>• {tags.length} tags</span>}
      </div>
    );
  }
}

// Concrete Implementor 2: Full Mode (แสดงแบบเต็ม)
class FullRenderStrategy implements IRenderStrategy {
  renderTitle(title: string): React.ReactNode {
    return <h3 className="font-bold text-xl mb-2">{title}</h3>;
  }

  renderDescription(description: string): React.ReactNode {
    return <p className="text-sm opacity-80 leading-relaxed mb-3">{description}</p>;
  }

  renderMeta(date: string, tags: string[]): React.ReactNode {
    return (
      <div className="space-y-2">
        <div className="text-xs opacity-60 flex items-center gap-2">
          <span className="font-mono">{date}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/30">
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  }
}

// Concrete Implementor 3: Compact Mode (แสดงแบบกระชับ)
class CompactRenderStrategy implements IRenderStrategy {
  renderTitle(title: string): React.ReactNode {
    return <span className="font-semibold text-sm">{title}</span>;
  }

  renderDescription(): React.ReactNode {
    return null; // ไม่แสดง description ใน Compact mode
  }

  renderMeta(date: string, tags: string[]): React.ReactNode {
    return (
      <span className="text-xs opacity-50">
        {date} • {tags.slice(0, 2).join(', ')}
        {tags.length > 2 && ' +' + (tags.length - 2)}
      </span>
    );
  }
}

// Helper function to get RenderStrategy (used by Bridge and Composite)
const getRenderStrategy = (mode: RenderMode): IRenderStrategy => {
  switch (mode) {
    case 'preview': return new PreviewRenderStrategy();
    case 'full': return new FullRenderStrategy();
    case 'compact': return new CompactRenderStrategy();
    default: return new FullRenderStrategy();
  }
};

// Abstraction (What to Render)
abstract class ContentRenderer {
  protected strategy: IRenderStrategy;

  constructor(strategy: IRenderStrategy) {
    this.strategy = strategy;
  }

  // Bridge: สามารถเปลี่ยน Strategy ได้ runtime
  setStrategy(strategy: IRenderStrategy): void {
    this.strategy = strategy;
    SessionLogger.getInstance().addLog(
      `Bridge Pattern: Changed render strategy to ${strategy.constructor.name}`
    );
  }

  // Template Method ที่ใช้ Strategy
  abstract render(item: ContentItem): React.ReactNode;
}

// Refined Abstraction 1: Project Renderer
class ProjectRenderer extends ContentRenderer {
  render(item: ContentItem): React.ReactNode {
    return (
      <div className="border-l-4 border-blue-500 pl-3 py-2">
        <div className="flex items-center gap-2 mb-1">
          <Code size={14} className="text-blue-400" />
          {this.strategy.renderTitle(item.title)}
        </div>
        {this.strategy.renderDescription(item.description)}
        {this.strategy.renderMeta(item.date, item.tags)}
      </div>
    );
  }
}

// Refined Abstraction 2: Blog Renderer
class BlogRenderer extends ContentRenderer {
  render(item: ContentItem): React.ReactNode {
    return (
      <div className="border-l-4 border-purple-500 pl-3 py-2">
        <div className="flex items-center gap-2 mb-1">
          <Feather size={14} className="text-purple-400" />
          {this.strategy.renderTitle(item.title)}
        </div>
        {this.strategy.renderDescription(item.description)}
        {this.strategy.renderMeta(item.date, item.tags)}
      </div>
    );
  }
}

// Refined Abstraction 3: Research Renderer
class ResearchRenderer extends ContentRenderer {
  render(item: ContentItem): React.ReactNode {
    return (
      <div className="border-l-4 border-green-500 pl-3 py-2">
        <div className="flex items-center gap-2 mb-1">
          <Book size={14} className="text-green-400" />
          {this.strategy.renderTitle(item.title)}
        </div>
        {this.strategy.renderDescription(item.description)}
        {this.strategy.renderMeta(item.date, item.tags)}
      </div>
    );
  }
}

/**
 * ---------------------------------------------------------------------
 * STRUCTURAL PATTERN: COMPOSITE PATTERN (HIERARCHICAL STRUCTURE)
 * ---------------------------------------------------------------------
 * รับผิดชอบเรื่อง "การสร้าง Tree Structures ของ Objects"
 * Treat individual objects และ compositions of objects uniformly
 * 
 * Use Case: Portfolio → Category → Items (hierarchical grouping)
 * - สามารถ compose sections/items เข้าด้วยกันได้
 * - Support nested content structure
 * - Expand/Collapse functionality
 */

// Composite Component Interface
interface IContentComponent {
  getName(): string;
  addChild(component: IContentComponent): void;
  removeChild(component: IContentComponent): void;
  getChildren(): IContentComponent[];
  asItem(): ContentItem | null;
  render(renderMode: RenderMode): React.ReactNode;
}

// Leaf: Individual ContentItem (ไม่มี children)
class ContentItemLeaf implements IContentComponent {
  constructor(private item: ContentItem) {}

  getName(): string {
    return this.item.title;
  }

  asItem(): ContentItem | null {
    return this.item;
  }

  addChild(): void {
    // Leaf nodes ไม่มี children
    console.warn("Cannot add child to leaf node");
  }

  removeChild(): void {
    console.warn("Cannot remove child from leaf node");
  }

  getChildren(): IContentComponent[] {
    return [];
  }

  render(renderMode: RenderMode): React.ReactNode {
    const strategy = getRenderStrategy(renderMode);
    const renderer = new ProjectRenderer(strategy);
    return (
      <div key={this.item.id} className="pl-2">
        {renderer.render(this.item)}
      </div>
    );
  }
}

/**
 * ---------------------------------------------------------------------
 * BEHAVIORAL PATTERN: MEDIATOR PATTERN (UI COORDINATION)
 * ---------------------------------------------------------------------
 * ลดการพึ่งพากันโดยตรงของคอมโพเนนต์/ฟีเจอร์ต่างๆ โดยให้ตัวกลาง (Mediator)
 * เป็นผู้จัดการการสื่อสาร เช่น การเปลี่ยนธีม เปิดโมดอล หรือสั่ง import
 */

interface IMediator {
  notify(sender: string, event: string, data?: unknown): void;
}

class UIMediator implements IMediator {
  constructor(
    private ctx: {
      setStyle: (s: LayoutStyle) => void;
      setPersona: (p: UserPersona) => void;
      setRenderMode: (m: RenderMode) => void;
      setShowImportModal: (b: boolean) => void;
      setProjects: (updater: (prev: ContentItem[]) => ContentItem[]) => void;
      setBlogs: (updater: (prev: ContentItem[]) => ContentItem[]) => void;
      setResearch: (updater: (prev: ContentItem[]) => ContentItem[]) => void;
      resetIterator: () => void;
      commandManager?: CommandManager;
      subject?: PortfolioSubject;
    }
  ) {}

  notify(sender: string, event: string, data?: unknown): void {
    switch (event) {
      case 'change-style': {
        const style = (data as { style: LayoutStyle }).style;
        this.ctx.setStyle(style);
        SessionLogger.getInstance().addLog(`Mediator: ${sender} changed style → ${style}`);
        break;
      }
      case 'change-persona': {
        const persona = (data as { persona: UserPersona }).persona;
        this.ctx.setPersona(persona);
        SessionLogger.getInstance().addLog(`Mediator: ${sender} changed persona → ${persona}`);
        break;
      }
      case 'change-render': {
        const mode = (data as { mode: RenderMode }).mode;
        this.ctx.setRenderMode(mode);
        SessionLogger.getInstance().addLog(`Mediator: ${sender} changed render mode → ${mode}`);
        break;
      }
      case 'open-import': {
        this.ctx.setShowImportModal(true);
        SessionLogger.getInstance().addLog('Mediator: Opened import modal');
        break;
      }
      case 'import-json': {
        const payload = data as { json: Record<string, unknown>; type: 'project' | 'blog' | 'research' };
        const adapter = new SafeJSONAdapterProxy(payload.json, payload.type);
        const item = adapter.adapt();
        if (payload.type === 'project') {
          this.ctx.setProjects(prev => [item, ...prev]);
        } else if (payload.type === 'blog') {
          this.ctx.setBlogs(prev => [item, ...prev]);
        } else {
          this.ctx.setResearch(prev => [item, ...prev]);
        }
        SessionLogger.getInstance().addLog(`Mediator: Imported ${payload.type} via Adapter+Proxy`);
        this.ctx.subject?.notify('mediator', { kind: payload.type, action: 'import', payload: item });
        break;
      }
      case 'reset-iterator': {
        this.ctx.resetIterator();
        SessionLogger.getInstance().addLog('Mediator: Iterator reset requested');
        break;
      }
      case 'execute-import-command': {
        const p = data as { json: Record<string, unknown>; type: 'project' | 'blog' | 'research' };
        if (!this.ctx.commandManager) {
          SessionLogger.getInstance().addLog('Mediator: No CommandManager bound');
          break;
        }
        const cmd = new ImportViaProxyCommand(
          p.json,
          p.type,
          (updater) => this.ctx.setProjects(updater),
          (updater) => this.ctx.setBlogs(updater),
          (updater) => this.ctx.setResearch(updater)
        );
        this.ctx.commandManager.execute(cmd);
        SessionLogger.getInstance().addLog('Mediator: Executed import via Command');
        this.ctx.subject?.notify('mediator', { kind: p.type, action: 'import' });
        break;
      }
      default:
        SessionLogger.getInstance().addLog(`Mediator: Unknown event "${event}" from ${sender}`);
    }
  }
}

/**
 * ---------------------------------------------------------------------
 * BEHAVIORAL PATTERN: ITERATOR PATTERN (TRAVERSE COMPOSITE)
 * ---------------------------------------------------------------------
 * ให้วิธีการวนซ้ำองค์ประกอบของโครงสร้าง (เช่น Tree/Composite)
 * โดยไม่เปิดเผยรายละเอียดโครงสร้างภายใน และมีอินเทอร์เฟซมาตรฐาน
 */

interface IIterator<T> {
  next(): T | null;
  hasNext(): boolean;
  reset(): void;
}

class PortfolioIterator implements IIterator<ContentItem> {
  private stack: IContentComponent[] = [];
  private root: IContentComponent;

  constructor(root: IContentComponent) {
    this.root = root;
    this.reset();
  }

  reset(): void {
    this.stack = [this.root];
  }

  hasNext(): boolean {
    // Peek ahead to see if any ContentItem remains
    const temp = [...this.stack];
    while (temp.length) {
      const node = temp.pop()!;
      const item = node.asItem();
      if (item) return true;
      const children = node.getChildren();
      for (let i = children.length - 1; i >= 0; i--) temp.push(children[i]);
    }
    return false;
  }

  next(): ContentItem | null {
    while (this.stack.length) {
      const node = this.stack.pop()!;
      const item = node.asItem();
      if (item) return item;
      const children = node.getChildren();
      for (let i = children.length - 1; i >= 0; i--) this.stack.push(children[i]);
    }
    return null;
  }
}

/**
 * ---------------------------------------------------------------------
 * BEHAVIORAL PATTERN: OBSERVER PATTERN (EVENT NOTIFICATION)
 * ---------------------------------------------------------------------
 * กระจายการเปลี่ยนแปลงของสถานะ (Subject) ไปยังผู้สนใจ (Observers)
 * โดยไม่ผูกติดกันแน่น (loose coupling)
 */

interface IObserver<T> {
  update(event: string, data: T): void;
}

interface ISubject<T> {
  subscribe(o: IObserver<T>): void;
  unsubscribe(o: IObserver<T>): void;
  notify(event: string, data: T): void;
}

type PortfolioEvent = {
  kind: 'project' | 'blog' | 'research' | 'decorations' | 'snapshot' | 'iterator' | 'command';
  action: 'add' | 'remove' | 'import' | 'clone' | 'undo' | 'redo' | 'save' | 'restore' | 'reset';
  payload?: unknown;
};

class PortfolioSubject implements ISubject<PortfolioEvent> {
  private observers = new Set<IObserver<PortfolioEvent>>();
  subscribe(o: IObserver<PortfolioEvent>): void { this.observers.add(o); }
  unsubscribe(o: IObserver<PortfolioEvent>): void { this.observers.delete(o); }
  notify(event: string, data: PortfolioEvent): void {
    this.observers.forEach(o => {
      try { o.update(event, data); } catch {/* ignore observer errors */}
    });
  }
}

class LoggerObserver implements IObserver<PortfolioEvent> {
  update(event: string, data: PortfolioEvent): void {
    const msg = `Observer: ${data.kind}:${data.action} via ${event}`;
    SessionLogger.getInstance().addLog(msg);
  }
}

/**
 * ---------------------------------------------------------------------
 * BEHAVIORAL PATTERN: STATE PATTERN (STATE MACHINE MANAGEMENT)
 * ---------------------------------------------------------------------
 * จัดการการเปลี่ยนแปลง (transition) ระหว่างสถานะต่างๆของ Portfolio
 * โดยให้แต่ละสถานะมี behavior ของตัวเอง (encapsulation)
 * ลดการใช้ if-else ในการตัดสินใจ action ที่ขึ้นกับสถานะ
 */

interface IPortfolioState {
  getName(): string;
  onEnter(ctx: PortfolioStateContext): void;
  onExit(ctx: PortfolioStateContext): void;
  canImport(): boolean;
  canAdd(): boolean;
  canRestore(): boolean;
  canClone(): boolean;
}

abstract class PortfolioStateBase implements IPortfolioState {
  abstract getName(): string;
  onEnter(ctx: PortfolioStateContext): void {
    SessionLogger.getInstance().addLog(`State: Entered "${this.getName()}" state`);
  }
  onExit(ctx: PortfolioStateContext): void {
    SessionLogger.getInstance().addLog(`State: Exited "${this.getName()}" state`);
  }
  canImport(): boolean { return false; }
  canAdd(): boolean { return false; }
  canRestore(): boolean { return false; }
  canClone(): boolean { return false; }
}

class IdleState extends PortfolioStateBase {
  getName(): string { return 'Idle'; }
  canImport(): boolean { return true; }
  canAdd(): boolean { return true; }
  canRestore(): boolean { return true; }
  canClone(): boolean { return true; }
}

class ImportingState extends PortfolioStateBase {
  getName(): string { return 'Importing'; }
  onEnter(ctx: PortfolioStateContext): void {
    super.onEnter(ctx);
    SessionLogger.getInstance().addLog('State: Processing import operation');
  }
  canImport(): boolean { return false; } // Already importing, disable duplicate
  canAdd(): boolean { return false; }
  canRestore(): boolean { return false; }
  canClone(): boolean { return false; }
}

class AddingState extends PortfolioStateBase {
  getName(): string { return 'Adding'; }
  onEnter(ctx: PortfolioStateContext): void {
    super.onEnter(ctx);
    SessionLogger.getInstance().addLog('State: Adding new item to portfolio');
  }
  canImport(): boolean { return false; }
  canAdd(): boolean { return false; } // Already adding
  canRestore(): boolean { return false; }
  canClone(): boolean { return false; }
}

class RestoringState extends PortfolioStateBase {
  getName(): string { return 'Restoring'; }
  onEnter(ctx: PortfolioStateContext): void {
    super.onEnter(ctx);
    SessionLogger.getInstance().addLog('State: Restoring from memento snapshot');
  }
  canImport(): boolean { return false; }
  canAdd(): boolean { return false; }
  canRestore(): boolean { return false; } // Already restoring
  canClone(): boolean { return false; }
}

class CloningState extends PortfolioStateBase {
  getName(): string { return 'Cloning'; }
  onEnter(ctx: PortfolioStateContext): void {
    super.onEnter(ctx);
    SessionLogger.getInstance().addLog('State: Cloning item via Prototype pattern');
  }
  canImport(): boolean { return false; }
  canAdd(): boolean { return false; }
  canRestore(): boolean { return false; }
  canClone(): boolean { return false; } // Already cloning
}

class PortfolioStateContext {
  private currentState: IPortfolioState;

  constructor() {
    this.currentState = new IdleState();
    this.currentState.onEnter(this);
  }

  setState(newState: IPortfolioState): void {
    this.currentState.onExit(this);
    this.currentState = newState;
    this.currentState.onEnter(this);
  }

  getState(): IPortfolioState {
    return this.currentState;
  }

  canImport(): boolean { return this.currentState.canImport(); }
  canAdd(): boolean { return this.currentState.canAdd(); }
  canRestore(): boolean { return this.currentState.canRestore(); }
  canClone(): boolean { return this.currentState.canClone(); }

  transitionToImporting(): void { this.setState(new ImportingState()); }
  transitionToAdding(): void { this.setState(new AddingState()); }
  transitionToRestoring(): void { this.setState(new RestoringState()); }
  transitionToCloning(): void { this.setState(new CloningState()); }
  transitionToIdle(): void { this.setState(new IdleState()); }
}

/**
 * ---------------------------------------------------------------------
 * BEHAVIORAL PATTERN: STRATEGY PATTERN (ALGORITHM SELECTION)
 * ---------------------------------------------------------------------
 * เลือก algorithm (strategy) เพื่อจัดเรียง/กรอง items แบบต่างๆในขณะ runtime
 * โดยไม่ต้องเปลี่ยนโค้ด sorting logic หลัก แต่ switch strategies ได้
 */

interface IPortfolioSortStrategy {
  getName(): string;
  sort(items: ContentItem[]): ContentItem[];
}

class AlphabeticalSortStrategy implements IPortfolioSortStrategy {
  getName(): string { return 'Alphabetical'; }
  sort(items: ContentItem[]): ContentItem[] {
    SessionLogger.getInstance().addLog('Strategy: Sorting by title (A-Z)');
    return [...items].sort((a, b) => a.title.localeCompare(b.title));
  }
}

class DateSortStrategy implements IPortfolioSortStrategy {
  getName(): string { return 'Date (Newest)'; }
  sort(items: ContentItem[]): ContentItem[] {
    SessionLogger.getInstance().addLog('Strategy: Sorting by date (newest first)');
    return [...items].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Newest first
    });
  }
}

class TagCountSortStrategy implements IPortfolioSortStrategy {
  getName(): string { return 'Tag Count'; }
  sort(items: ContentItem[]): ContentItem[] {
    SessionLogger.getInstance().addLog('Strategy: Sorting by tag count (most tags first)');
    return [...items].sort((a, b) => b.tags.length - a.tags.length);
  }
}

class ReverseSortStrategy implements IPortfolioSortStrategy {
  getName(): string { return 'Reverse'; }
  sort(items: ContentItem[]): ContentItem[] {
    SessionLogger.getInstance().addLog('Strategy: Reversing order');
    return [...items].reverse();
  }
}

class RandomSortStrategy implements IPortfolioSortStrategy {
  getName(): string { return 'Random'; }
  sort(items: ContentItem[]): ContentItem[] {
    SessionLogger.getInstance().addLog('Strategy: Shuffling items randomly');
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

class PortfolioSortContext {
  private strategy: IPortfolioSortStrategy;

  constructor() {
    this.strategy = new AlphabeticalSortStrategy();
  }

  setStrategy(strategy: IPortfolioSortStrategy): void {
    this.strategy = strategy;
    SessionLogger.getInstance().addLog(`Strategy Context: Using "${strategy.getName()}" sorting strategy`);
  }

  getStrategy(): IPortfolioSortStrategy {
    return this.strategy;
  }

  sort(items: ContentItem[]): ContentItem[] {
    return this.strategy.sort(items);
  }

  getAvailableStrategies(): IPortfolioSortStrategy[] {
    return [
      new AlphabeticalSortStrategy(),
      new DateSortStrategy(),
      new TagCountSortStrategy(),
      new ReverseSortStrategy(),
      new RandomSortStrategy(),
    ];
  }
}

/**
 * ---------------------------------------------------------------------
 * BEHAVIORAL PATTERN: TEMPLATE METHOD PATTERN (ALGORITHM TEMPLATE)
 * ---------------------------------------------------------------------
 * กำหนดโครงสร้างของ algorithm ในฐาน class แต่ให้ subclasses
 * override ขั้นตอนเฉพาะโดยไม่เปลี่ยนโครงสร้างโดยรวม
 * 
 * Use Case: Content Processing Pipeline
 * - Validate content (different rules per type)
 * - Format/normalize data (different formats per type)
 * - Enrich with metadata (different enrichment per type)
 * - Save to collection (common step)
 */

abstract class ContentProcessingTemplate {
  // Template Method: กำหนดลำดับของ algorithm
  public processAndAdd(
    item: ContentItem,
    addToCollection: (item: ContentItem) => void
  ): boolean {
    try {
      // Step 1: Validate (ให้ subclass override)
      if (!this.validate(item)) {
        SessionLogger.getInstance().addLog(`TemplateMethod: Validation failed for "${item.title}"`);
        return false;
      }

      // Step 2: Format/Normalize (ให้ subclass override)
      const normalized = this.normalize(item);

      // Step 3: Enrich metadata (ให้ subclass override)
      const enriched = this.enrich(normalized);

      // Step 4: Save to collection (ขั้นตอนร่วมกันของทุก subclass)
      this.save(enriched, addToCollection);

      SessionLogger.getInstance().addLog(
        `TemplateMethod: Successfully processed "${enriched.title}" (${this.getProcessorType()})`
      );
      return true;
    } catch (error) {
      SessionLogger.getInstance().addLog(`TemplateMethod: Error processing "${item.title}": ${error}`);
      return false;
    }
  }

  // Hook method: ให้ subclass override หากต้องการ
  public getProcessorType(): string {
    return this.constructor.name;
  }

  // Abstract methods: ต้องให้ subclass implement
  protected abstract validate(item: ContentItem): boolean;
  protected abstract normalize(item: ContentItem): ContentItem;
  protected abstract enrich(item: ContentItem): ContentItem;

  // Concrete method: ขั้นตอนร่วมกันของทุก subclass
  protected save(item: ContentItem, addToCollection: (item: ContentItem) => void): void {
    addToCollection(item);
  }
}

// Concrete Implementation 1: Project Processor
class ProjectProcessor extends ContentProcessingTemplate {
  protected validate(item: ContentItem): boolean {
    // Project-specific validation
    return item.title.length > 0 && item.tags.length > 0;
  }

  protected normalize(item: ContentItem): ContentItem {
    // Normalize project-specific fields
    return new ContentItem(
      item.id,
      item.title.trim(),
      item.description.trim(),
      item.date.toString(), // Ensure date is string
      item.tags.map(t => t.trim()).filter(t => t.length > 0)
    );
  }

  protected enrich(item: ContentItem): ContentItem {
    // Enrich project with tech tag prefix
    const enrichedTags = [...item.tags];
    if (!enrichedTags.some(t => t.toLowerCase().startsWith('tech'))) {
      enrichedTags.unshift('Tech');
    }
    return new ContentItem(
      item.id,
      `🚀 ${item.title}`,
      item.description,
      item.date,
      enrichedTags
    );
  }
}

// Concrete Implementation 2: Blog Processor
class BlogProcessor extends ContentProcessingTemplate {
  protected validate(item: ContentItem): boolean {
    // Blog-specific validation
    return item.title.length > 3 && item.description.length > 10;
  }

  protected normalize(item: ContentItem): ContentItem {
    // Normalize blog-specific fields (capitalize title)
    return new ContentItem(
      item.id,
      item.title.charAt(0).toUpperCase() + item.title.slice(1),
      item.description.trim(),
      item.date.toString(),
      item.tags.map(t => t.toLowerCase()).filter(t => t.length > 0)
    );
  }

  protected enrich(item: ContentItem): ContentItem {
    // Enrich blog with content tag
    const enrichedTags = [...item.tags];
    if (!enrichedTags.includes('content')) {
      enrichedTags.push('content');
    }
    return new ContentItem(
      item.id,
      `📝 ${item.title}`,
      item.description,
      item.date,
      enrichedTags
    );
  }
}

// Concrete Implementation 3: Research Processor
class ResearchProcessor extends ContentProcessingTemplate {
  protected validate(item: ContentItem): boolean {
    // Research-specific validation (stricter)
    return (
      item.title.length > 5 &&
      item.description.length > 20 &&
      item.tags.length >= 2
    );
  }

  protected normalize(item: ContentItem): ContentItem {
    // Normalize research-specific fields
    return new ContentItem(
      item.id,
      item.title.trim().toUpperCase(),
      item.description.trim(),
      item.date.toString(),
      item.tags.map(t => t.trim()).filter(t => t.length > 0)
    );
  }

  protected enrich(item: ContentItem): ContentItem {
    // Enrich research with academic tag
    const enrichedTags = [...item.tags];
    if (!enrichedTags.some(t => t.toLowerCase() === 'academic')) {
      enrichedTags.push('academic');
    }
    return new ContentItem(
      item.id,
      `🎓 ${item.title}`,
      item.description,
      item.date,
      enrichedTags
    );
  }
}

// Factory for Template Method processors
class ContentProcessorFactory {
  static createProcessor(type: 'project' | 'blog' | 'research'): ContentProcessingTemplate {
    switch (type) {
      case 'project':
        return new ProjectProcessor();
      case 'blog':
        return new BlogProcessor();
      case 'research':
        return new ResearchProcessor();
      default:
        throw new Error(`Unknown processor type: ${type}`);
    }
  }
}

/**
 * ---------------------------------------------------------------------
 * BEHAVIORAL PATTERN: VISITOR PATTERN (OPERATIONS ON STRUCTURES)
 * ---------------------------------------------------------------------
 * ให้วิธีการกำหนด new operations บน object structures
 * โดยไม่ต้องเปลี่ยนแปลง classes ของ objects
 * 
 * Use Case: Portfolio Analysis & Export
 * - เยี่ยม (visit) content items และทำ operations ต่างๆ เช่น:
 *   - Export to different formats (JSON, CSV, Markdown)
 *   - Generate statistics (word count, tag frequency)
 *   - Validate content quality
 *   - Generate summaries/reports
 */

// Visitor Interface: กำหนด visit methods สำหรับ content types ต่างๆ
interface IPortfolioVisitor {
  visitProject(item: ContentItem): unknown;
  visitBlog(item: ContentItem): unknown;
  visitResearch(item: ContentItem): unknown;
  getResult(): unknown;
}

// Concrete Visitor 1: Export to JSON
class JSONExportVisitor implements IPortfolioVisitor {
  private items: unknown[] = [];

  visitProject(item: ContentItem): unknown {
    const exported = {
      type: 'project',
      id: item.id,
      title: item.title,
      description: item.description,
      year: item.date,
      technologies: item.tags,
      exportedAt: new Date().toISOString(),
    };
    this.items.push(exported);
    SessionLogger.getInstance().addLog(`Visitor(JSONExport): Exported project "${item.title}"`);
    return exported;
  }

  visitBlog(item: ContentItem): unknown {
    const exported = {
      type: 'blog',
      id: item.id,
      title: item.title,
      content: item.description,
      publishDate: item.date,
      tags: item.tags,
      exportedAt: new Date().toISOString(),
    };
    this.items.push(exported);
    SessionLogger.getInstance().addLog(`Visitor(JSONExport): Exported blog "${item.title}"`);
    return exported;
  }

  visitResearch(item: ContentItem): unknown {
    const exported = {
      type: 'research',
      id: item.id,
      title: item.title,
      abstract: item.description,
      year: item.date,
      keywords: item.tags,
      exportedAt: new Date().toISOString(),
    };
    this.items.push(exported);
    SessionLogger.getInstance().addLog(`Visitor(JSONExport): Exported research "${item.title}"`);
    return exported;
  }

  getResult(): unknown {
    return JSON.stringify(this.items, null, 2);
  }
}

// Concrete Visitor 2: Generate Statistics
class StatisticsVisitor implements IPortfolioVisitor {
  private projectCount = 0;
  private blogCount = 0;
  private researchCount = 0;
  private totalTags = new Set<string>();
  private totalWords = 0;

  visitProject(item: ContentItem): unknown {
    this.projectCount++;
    this.totalTags = new Set([...this.totalTags, ...item.tags]);
    this.totalWords += item.title.split(' ').length + item.description.split(' ').length;
    SessionLogger.getInstance().addLog(`Visitor(Statistics): Analyzed project "${item.title}"`);
    return { type: 'project', tags: item.tags.length, words: item.description.split(' ').length };
  }

  visitBlog(item: ContentItem): unknown {
    this.blogCount++;
    this.totalTags = new Set([...this.totalTags, ...item.tags]);
    this.totalWords += item.title.split(' ').length + item.description.split(' ').length;
    SessionLogger.getInstance().addLog(`Visitor(Statistics): Analyzed blog "${item.title}"`);
    return { type: 'blog', tags: item.tags.length, words: item.description.split(' ').length };
  }

  visitResearch(item: ContentItem): unknown {
    this.researchCount++;
    this.totalTags = new Set([...this.totalTags, ...item.tags]);
    this.totalWords += item.title.split(' ').length + item.description.split(' ').length;
    SessionLogger.getInstance().addLog(`Visitor(Statistics): Analyzed research "${item.title}"`);
    return { type: 'research', tags: item.tags.length, words: item.description.split(' ').length };
  }

  getResult(): unknown {
    return {
      projects: this.projectCount,
      blogs: this.blogCount,
      research: this.researchCount,
      totalItems: this.projectCount + this.blogCount + this.researchCount,
      uniqueTags: this.totalTags.size,
      totalWords: this.totalWords,
      averageWordsPerItem: Math.round(this.totalWords / (this.projectCount + this.blogCount + this.researchCount)),
    };
  }
}

// Concrete Visitor 3: Markdown Export
class MarkdownExportVisitor implements IPortfolioVisitor {
  private markdown = '';

  visitProject(item: ContentItem): unknown {
    this.markdown += `## 🚀 ${item.title}\n\n`;
    this.markdown += `**Description:** ${item.description}\n\n`;
    this.markdown += `**Year:** ${item.date}\n\n`;
    this.markdown += `**Technologies:** ${item.tags.join(', ')}\n\n`;
    this.markdown += '---\n\n';
    SessionLogger.getInstance().addLog(`Visitor(MarkdownExport): Exported project "${item.title}"`);
    return item.title;
  }

  visitBlog(item: ContentItem): unknown {
    this.markdown += `## 📝 ${item.title}\n\n`;
    this.markdown += `${item.description}\n\n`;
    this.markdown += `**Published:** ${item.date}\n\n`;
    this.markdown += `**Tags:** ${item.tags.join(', ')}\n\n`;
    this.markdown += '---\n\n';
    SessionLogger.getInstance().addLog(`Visitor(MarkdownExport): Exported blog "${item.title}"`);
    return item.title;
  }

  visitResearch(item: ContentItem): unknown {
    this.markdown += `## 🎓 ${item.title}\n\n`;
    this.markdown += `**Abstract:** ${item.description}\n\n`;
    this.markdown += `**Year:** ${item.date}\n\n`;
    this.markdown += `**Keywords:** ${item.tags.join(', ')}\n\n`;
    this.markdown += '---\n\n';
    SessionLogger.getInstance().addLog(`Visitor(MarkdownExport): Exported research "${item.title}"`);
    return item.title;
  }

  getResult(): unknown {
    return this.markdown;
  }
}

// Concrete Visitor 4: Quality Validation
class ValidationVisitor implements IPortfolioVisitor {
  private validationResults: Array<{ title: string; type: string; issues: string[] }> = [];

  visitProject(item: ContentItem): unknown {
    const issues: string[] = [];
    if (item.title.length < 3) issues.push('Title too short');
    if (item.description.length < 10) issues.push('Description too brief');
    if (item.tags.length === 0) issues.push('No tags assigned');
    if (!item.date || item.date.length === 0) issues.push('No date specified');

    this.validationResults.push({
      title: item.title,
      type: 'project',
      issues,
    });

    if (issues.length === 0) {
      SessionLogger.getInstance().addLog(`Visitor(Validation): Project "${item.title}" ✅ passed`);
    } else {
      SessionLogger.getInstance().addLog(`Visitor(Validation): Project "${item.title}" ⚠️ ${issues.join(', ')}`);
    }

    return { valid: issues.length === 0, issues };
  }

  visitBlog(item: ContentItem): unknown {
    const issues: string[] = [];
    if (item.title.length < 3) issues.push('Title too short');
    if (item.description.length < 20) issues.push('Content too brief');
    if (item.tags.length < 1) issues.push('At least 1 tag required');

    this.validationResults.push({
      title: item.title,
      type: 'blog',
      issues,
    });

    if (issues.length === 0) {
      SessionLogger.getInstance().addLog(`Visitor(Validation): Blog "${item.title}" ✅ passed`);
    } else {
      SessionLogger.getInstance().addLog(`Visitor(Validation): Blog "${item.title}" ⚠️ ${issues.join(', ')}`);
    }

    return { valid: issues.length === 0, issues };
  }

  visitResearch(item: ContentItem): unknown {
    const issues: string[] = [];
    if (item.title.length < 5) issues.push('Title too short');
    if (item.description.length < 50) issues.push('Abstract too brief');
    if (item.tags.length < 2) issues.push('At least 2 keywords required');

    this.validationResults.push({
      title: item.title,
      type: 'research',
      issues,
    });

    if (issues.length === 0) {
      SessionLogger.getInstance().addLog(`Visitor(Validation): Research "${item.title}" ✅ passed`);
    } else {
      SessionLogger.getInstance().addLog(`Visitor(Validation): Research "${item.title}" ⚠️ ${issues.join(', ')}`);
    }

    return { valid: issues.length === 0, issues };
  }

  getResult(): unknown {
    const valid = this.validationResults.filter(r => r.issues.length === 0).length;
    const total = this.validationResults.length;
    return {
      summary: `${valid}/${total} items passed validation`,
      details: this.validationResults,
      passRate: Math.round((valid / total) * 100),
    };
  }
}

// Dispatcher: Apply visitor to collection
class PortfolioVisitorDispatcher {
  static visitItems(items: ContentItem[], type: 'project' | 'blog' | 'research', visitor: IPortfolioVisitor): void {
    items.forEach(item => {
      switch (type) {
        case 'project':
          visitor.visitProject(item);
          break;
        case 'blog':
          visitor.visitBlog(item);
          break;
        case 'research':
          visitor.visitResearch(item);
          break;
      }
    });
  }

  static visitAll(
    projects: ContentItem[],
    blogs: ContentItem[],
    research: ContentItem[],
    visitor: IPortfolioVisitor
  ): void {
    projects.forEach(p => visitor.visitProject(p));
    blogs.forEach(b => visitor.visitBlog(b));
    research.forEach(r => visitor.visitResearch(r));
  }
}

/**
 * ---------------------------------------------------------------------
 * BEHAVIORAL PATTERN: MEMENTO PATTERN (SNAPSHOT/RESTORE STATE)
 * ---------------------------------------------------------------------
 * จัดเก็บ Snapshot ของสถานะ (Originator) ไว้ใน Memento และให้ Caretaker
 * จัดการประวัติ (history) โดยไม่เปิดเผยรายละเอียดภายในของ state
 */

type ContentItemDTO = { id: string; title: string; description: string; date: string; tags: string[] };
type DecorationsDTO = Record<string, Array<'Featured' | 'Pinned' | 'Award' | 'Trending' | 'Hot'>>;
type PortfolioSnapshot = {
  projects: ContentItemDTO[];
  blogs: ContentItemDTO[];
  research: ContentItemDTO[];
  decorations: DecorationsDTO;
};

class PortfolioMemento {
  private readonly ts: number;
  private readonly name: string;
  private readonly snapshot: PortfolioSnapshot;
  constructor(snapshot: PortfolioSnapshot, name?: string) {
    this.ts = Date.now();
    this.name = name ?? `Snapshot @ ${new Date(this.ts).toLocaleTimeString()}`;
    // store immutable copy
    this.snapshot = JSON.parse(JSON.stringify(snapshot));
  }
  getName(): string { return this.name; }
  getTimestamp(): number { return this.ts; }
  getSnapshot(): PortfolioSnapshot { return JSON.parse(JSON.stringify(this.snapshot)); }
}

class PortfolioStateOriginator {
  createMemento(snapshot: PortfolioSnapshot, name?: string): PortfolioMemento {
    return new PortfolioMemento(snapshot, name);
  }
  restore(memento: PortfolioMemento): PortfolioSnapshot {
    return memento.getSnapshot();
  }
}

class HistoryCaretaker {
  private history: PortfolioMemento[] = [];
  save(m: PortfolioMemento) { this.history.push(m); }
  canRestore(): boolean { return this.history.length > 0; }
  restoreLast(): PortfolioMemento | null { return this.history.pop() ?? null; }
  size(): number { return this.history.length; }
  clear() { this.history = []; }
  getAll(): PortfolioMemento[] { return [...this.history]; }
}

// Composite: ContentGroup (สามารถมี children)
class ContentGroup implements IContentComponent {
  private children: IContentComponent[] = [];

  constructor(
    private name: string,
    private color: 'blue' | 'purple' | 'green' | 'orange' = 'orange',
    private icon: React.ElementType = Plus
  ) {}

  getName(): string {
    return this.name;
  }

  asItem(): ContentItem | null {
    return null;
  }

  addChild(component: IContentComponent): void {
    this.children.push(component);
    SessionLogger.getInstance().addLog(
      `Composite Pattern: Added "${component.getName()}" to "${this.name}"`
    );
  }

  removeChild(component: IContentComponent): void {
    this.children = this.children.filter(c => c !== component);
    SessionLogger.getInstance().addLog(
      `Composite Pattern: Removed child from "${this.name}"`
    );
  }

  getChildren(): IContentComponent[] {
    return this.children;
  }

  render(renderMode: RenderMode): React.ReactNode {
    const colorMap = {
      blue: 'border-blue-500 text-blue-400',
      purple: 'border-purple-500 text-purple-400',
      green: 'border-green-500 text-green-400',
      orange: 'border-orange-500 text-orange-400',
    };

    const Icon = this.icon;

    return (
      <div key={this.name} className={`border-l-4 ${colorMap[this.color]} pl-4 py-3 my-3`}>
        <div className="flex items-center gap-2 mb-2 cursor-pointer">
          <Icon size={16} className={colorMap[this.color].split(' ')[1]} />
          <span className="font-bold text-sm">{this.name}</span>
          <span className="text-xs opacity-60">({this.children.length})</span>
        </div>
        <div className="space-y-2 ml-2">
          {this.children.map((child, idx) => (
            <div key={idx}>
              {child.render(renderMode)}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

// Composite Portfolio (Root)
class Portfolio implements IContentComponent {
  private children: IContentComponent[] = [];

  constructor(private name: string) {}

  getName(): string {
    return this.name;
  }

  asItem(): ContentItem | null {
    return null;
  }

  addChild(component: IContentComponent): void {
    this.children.push(component);
  }

  removeChild(component: IContentComponent): void {
    this.children = this.children.filter(c => c !== component);
  }

  getChildren(): IContentComponent[] {
    return this.children;
  }

  render(renderMode: RenderMode): React.ReactNode {
    return (
      <div className="space-y-4">
        {this.children.map((child, idx) => (
          <div key={idx}>
            {child.render(renderMode)}
          </div>
        ))}
      </div>
    );
  }
}

/**
 * ---------------------------------------------------------------------
 * STRUCTURAL PATTERN: DECORATOR PATTERN (ADDING BEHAVIOR DYNAMICALLY)
 * ---------------------------------------------------------------------
 * รับผิดชอบเรื่อง "การเพิ่ม behavior/features ให้กับ objects"
 * โดยไม่แก้ object เดิมและสามารถ stack decorators ได้
 * 
 * Use Case: Add decorations/badges to ContentItems (Featured, Pinned, Award, Trending, Hot)
 * - Can wrap same object multiple times
 * - Each decorator adds responsibility
 * - Same interface as wrapped object
 */

// Decorator Component Interface
interface IContentDecorator {
  getDecorations(): string[]; // Return list of applied decorations
  renderDecorations(): React.ReactNode; // Render badges/indicators
  getDecoratedItem(): ContentItem;
  hasDecoration(type: string): boolean;
}

// Base Decorator Class
abstract class ContentDecorator implements IContentDecorator {
  protected decoratedItem: ContentItem | ContentDecorator;
  public decorationType: string;

  constructor(item: ContentItem | ContentDecorator, type: string) {
    this.decoratedItem = item;
    this.decorationType = type;
    SessionLogger.getInstance().addLog(
      `Decorator Pattern: Added "${type}" decoration`
    );
  }

  getDecorations(): string[] {
    // Get decorations from wrapped object + add own
    const wrappedDecorations = this.decoratedItem instanceof ContentDecorator 
      ? this.decoratedItem.getDecorations() 
      : [];
    return [...wrappedDecorations, this.decorationType];
  }

  getDecoratedItem(): ContentItem {
    return this.decoratedItem instanceof ContentDecorator
      ? this.decoratedItem.getDecoratedItem()
      : this.decoratedItem;
  }

  hasDecoration(type: string): boolean {
    return this.getDecorations().includes(type);
  }

  abstract renderDecorations(): React.ReactNode;
}

// Concrete Decorator 1: Featured
class FeaturedDecorator extends ContentDecorator {
  constructor(item: ContentItem | ContentDecorator) {
    super(item, 'Featured');
  }

  renderDecorations(): React.ReactNode {
    return (
      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded border border-amber-500/50 font-semibold flex items-center gap-1">
        ⭐ Featured
      </span>
    );
  }
}

// Concrete Decorator 2: Pinned
class PinnedDecorator extends ContentDecorator {
  constructor(item: ContentItem | ContentDecorator) {
    super(item, 'Pinned');
  }

  renderDecorations(): React.ReactNode {
    return (
      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded border border-red-500/50 font-semibold flex items-center gap-1">
        📌 Pinned
      </span>
    );
  }
}

// Concrete Decorator 3: Award
class AwardDecorator extends ContentDecorator {
  constructor(item: ContentItem | ContentDecorator) {
    super(item, 'Award');
  }

  renderDecorations(): React.ReactNode {
    return (
      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded border border-yellow-500/50 font-semibold flex items-center gap-1">
        🏆 Award
      </span>
    );
  }
}

// Concrete Decorator 4: Trending
class TrendingDecorator extends ContentDecorator {
  constructor(item: ContentItem | ContentDecorator) {
    super(item, 'Trending');
  }

  renderDecorations(): React.ReactNode {
    return (
      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/50 font-semibold flex items-center gap-1">
        📈 Trending
      </span>
    );
  }
}

// Concrete Decorator 5: Hot
class HotDecorator extends ContentDecorator {
  constructor(item: ContentItem | ContentDecorator) {
    super(item, 'Hot');
  }

  renderDecorations(): React.ReactNode {
    return (
      <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded border border-orange-500/50 font-semibold flex items-center gap-1">
        🔥 Hot
      </span>
    );
  }
}

/**
 * ---------------------------------------------------------------------
 * STRUCTURAL PATTERN: FLYWEIGHT PATTERN (MEMORY OPTIMIZATION)
 * ---------------------------------------------------------------------
 * รับผิดชอบเรื่อง "การแชร์ Objects ที่มี Intrinsic State เหมือนกัน"
 * เพื่อลดการใช้ Memory โดยไม่ต้องสร้าง objects ซ้ำๆ
 * 
 * Use Case: Tag System - Tags ถูกใช้ซ้ำหลายครั้งใน ContentItems
 * - Intrinsic State (shared): name, color, icon, category
 * - Extrinsic State (unique): position, context (which item uses it)
 * - Factory manages pool of shared flyweight instances
 */

// Flyweight Interface
interface ITagFlyweight {
  getName(): string;
  getColor(): string;
  getIcon(): string;
  getCategory(): string;
  render(context?: { size?: 'sm' | 'md' | 'lg'; showIcon?: boolean }): React.ReactNode;
}

// Concrete Flyweight: Tag with intrinsic state
class TagFlyweight implements ITagFlyweight {
  // Intrinsic state (shared, immutable)
  private readonly name: string;
  private readonly color: string;
  private readonly icon: string;
  private readonly category: string;

  constructor(name: string, color: string, icon: string, category: string) {
    this.name = name;
    this.color = color;
    this.icon = icon;
    this.category = category;
    
    // Log only on creation (shows when new flyweight is created)
    SessionLogger.getInstance().addLog(
      `Flyweight Pattern: Created new tag flyweight "${name}"`
    );
  }

  getName(): string {
    return this.name;
  }

  getColor(): string {
    return this.color;
  }

  getIcon(): string {
    return this.icon;
  }

  getCategory(): string {
    return this.category;
  }

  // Render method uses intrinsic state + extrinsic context
  render(context?: { size?: 'sm' | 'md' | 'lg'; showIcon?: boolean }): React.ReactNode {
    const size = context?.size || 'sm';
    const showIcon = context?.showIcon !== false;

    const sizeClasses = {
      sm: 'text-xs px-2 py-0.5',
      md: 'text-sm px-3 py-1',
      lg: 'text-base px-4 py-1.5',
    };

    // Color mapping based on category
    const colorClasses = {
      blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      green: 'bg-green-500/10 text-green-400 border-green-500/30',
      orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      pink: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
      yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      red: 'bg-red-500/10 text-red-400 border-red-500/30',
      gray: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    };

    return (
      <span
        key={this.name}
        className={`inline-flex items-center gap-1 ${sizeClasses[size]} ${colorClasses[this.color as keyof typeof colorClasses] || colorClasses.gray} rounded border font-medium`}
      >
        {showIcon && <span>{this.icon}</span>}
        <span>{this.name}</span>
      </span>
    );
  }
}

// Flyweight Factory: Manages pool of shared flyweights
class TagFlyweightFactory {
  private static instance: TagFlyweightFactory;
  private flyweights: Map<string, ITagFlyweight> = new Map();
  private tagConfigs: Record<string, { color: string; icon: string; category: string }> = {
    // Programming Languages
    'React': { color: 'blue', icon: '⚛️', category: 'framework' },
    'TypeScript': { color: 'blue', icon: '📘', category: 'language' },
    'JavaScript': { color: 'yellow', icon: '📜', category: 'language' },
    'Python': { color: 'yellow', icon: '🐍', category: 'language' },
    'Java': { color: 'red', icon: '☕', category: 'language' },
    'C++': { color: 'purple', icon: '⚙️', category: 'language' },
    
    // Frameworks & Libraries
    'Next.js': { color: 'gray', icon: '▲', category: 'framework' },
    'Node': { color: 'green', icon: '🟢', category: 'framework' },
    'TensorFlow': { color: 'orange', icon: '🧠', category: 'framework' },
    'Docker': { color: 'blue', icon: '🐳', category: 'tool' },
    
    // Concepts & Topics
    'Finance': { color: 'green', icon: '💰', category: 'domain' },
    'GraphDB': { color: 'purple', icon: '🕸️', category: 'database' },
    'Theory': { color: 'purple', icon: '📐', category: 'concept' },
    'Dist-Sys': { color: 'orange', icon: '🌐', category: 'concept' },
    'Algorithms': { color: 'pink', icon: '🔢', category: 'concept' },
    'Architecture': { color: 'purple', icon: '🏛️', category: 'concept' },
    
    // Tools & Platforms
    'AWS': { color: 'orange', icon: '☁️', category: 'platform' },
    'LaTeX': { color: 'blue', icon: '📄', category: 'tool' },
    'Statistics': { color: 'green', icon: '📊', category: 'concept' },
    
    // Patterns
    'Design Patterns': { color: 'pink', icon: '🎨', category: 'concept' },
    'Facade': { color: 'indigo', icon: '🏢', category: 'pattern' },
    'Adapter': { color: 'purple', icon: '🔌', category: 'pattern' },
    'Quick': { color: 'orange', icon: '⚡', category: 'status' },
  };

  private constructor() {
    SessionLogger.getInstance().addLog("Flyweight Pattern: TagFlyweightFactory initialized");
  }

  public static getInstance(): TagFlyweightFactory {
    if (!TagFlyweightFactory.instance) {
      TagFlyweightFactory.instance = new TagFlyweightFactory();
    }
    return TagFlyweightFactory.instance;
  }

  /**
   * Get or create tag flyweight (reuses existing if available)
   * This is the core of Flyweight Pattern - sharing instances
   */
  public getTag(name: string): ITagFlyweight {
    // Return existing flyweight if already created
    if (this.flyweights.has(name)) {
      return this.flyweights.get(name)!;
    }

    // Create new flyweight and store in pool
    const config = this.tagConfigs[name] || {
      color: 'gray',
      icon: '🏷️',
      category: 'other',
    };

    const flyweight = new TagFlyweight(
      name,
      config.color,
      config.icon,
      config.category
    );

    this.flyweights.set(name, flyweight);
    return flyweight;
  }

  /**
   * Get multiple tags at once
   */
  public getTags(names: string[]): ITagFlyweight[] {
    return names.map(name => this.getTag(name));
  }

  /**
   * Register new tag configuration
   */
  public registerTag(name: string, color: string, icon: string, category: string): void {
    this.tagConfigs[name] = { color, icon, category };
    SessionLogger.getInstance().addLog(`Flyweight Pattern: Registered tag "${name}"`);
  }

  /**
   * Get statistics about flyweight usage
   */
  public getStats(): { uniqueTags: number; totalUsage: number; memorySaved: number } {
    const uniqueTags = this.flyweights.size;
    // Mock calculation: assume each ContentItem uses 3-5 tags on average
    const totalUsage = uniqueTags * 4; // Rough estimate
    const memorySaved = ((totalUsage - uniqueTags) / totalUsage) * 100;

    return {
      uniqueTags,
      totalUsage,
      memorySaved: Math.round(memorySaved),
    };
  }

  /**
   * Get all flyweights (for debugging/display)
   */
  public getAllFlyweights(): ITagFlyweight[] {
    return Array.from(this.flyweights.values());
  }

  /**
   * Clear all flyweights (for testing)
   */
  public clear(): void {
    this.flyweights.clear();
    SessionLogger.getInstance().addLog("Flyweight Pattern: Cleared all flyweights");
  }
}

/**
 * ---------------------------------------------------------------------
 * BEHAVIORAL PATTERN: CHAIN OF RESPONSIBILITY (VALIDATION PIPELINE)
 * ---------------------------------------------------------------------
 * ใช้สำหรับส่งคำขอ (request) ผ่าน chain ของ handlers ทีละตัว
 * แต่ละ handler ตัดสินใจว่าจะจัดการหรือส่งต่อไปยังตัวถัดไป
 *
 * เราประยุกต์ใช้กับ flow การ import: สร้าง pipeline สำหรับ
 * - ตรวจสอบ title
 * - แปลง/บังคับให้ date เป็น string
 * - จำกัด/ทำความสะอาด tags
 */

interface IImportHandler {
  setNext(handler: IImportHandler): IImportHandler;
  handle(data: Record<string, unknown>): Record<string, unknown>;
}

abstract class ImportHandler implements IImportHandler {
  protected nextHandler: IImportHandler | null = null;
  setNext(handler: IImportHandler): IImportHandler {
    this.nextHandler = handler;
    return handler;
  }
  handle(data: Record<string, unknown>): Record<string, unknown> {
    const processed = this.process(data);
    if (this.nextHandler) return this.nextHandler.handle(processed);
    return processed;
  }
  protected abstract process(data: Record<string, unknown>): Record<string, unknown>;
}

class TitleRequiredHandler extends ImportHandler {
  protected process(data: Record<string, unknown>): Record<string, unknown> {
    const title = (data.title as string | undefined)?.trim();
    if (!title) {
      SessionLogger.getInstance().addLog('CoR: Title missing → set to "Untitled"');
      return { ...data, title: 'Untitled' };
    }
    return data;
  }
}

class DateStringHandler extends ImportHandler {
  protected process(data: Record<string, unknown>): Record<string, unknown> {
    const raw = data.date as string | number | undefined;
    const date = raw == null ? new Date().getFullYear().toString() : String(raw);
    if (date !== raw) {
      SessionLogger.getInstance().addLog('CoR: Normalized date to string');
    }
    return { ...data, date };
  }
}

class TagLimitHandler extends ImportHandler {
  constructor(private limit = 10) { super(); }
  protected process(data: Record<string, unknown>): Record<string, unknown> {
    let tags = (data.tags as unknown[]) || [];
    if (!Array.isArray(tags)) tags = [];
    const cleaned = tags
      .map(t => (typeof t === 'string' ? t.trim() : null))
      .filter((t): t is string => !!t)
      .slice(0, this.limit);
    if (cleaned.length !== tags.length) {
      SessionLogger.getInstance().addLog(`CoR: Sanitized/limited tags to ${this.limit}`);
    }
    return { ...data, tags: cleaned };
  }
}

/**
 * ---------------------------------------------------------------------
 * STRUCTURAL PATTERN: PROXY PATTERN (ACCESS/CACHING/VALIDATION)
 * ---------------------------------------------------------------------
 * รับผิดชอบเรื่อง "การควบคุมการเข้าถึง, เพิ่ม caching, validation"
 * โดยการห่อหุ้ม (wrap) real subject ด้วย proxy ที่มีพฤติกรรมเพิ่มเติม
 * 
 * Use Cases ใช้ร่วมกับระบบที่มีอยู่แล้ว:
 * - Protection/Validation Proxy: ตรวจสอบ/ normalize ข้อมูลก่อน import (ห่อ JSONContentAdapter)
 * - Caching Proxy: cache ผลการ import เพื่อลดการทำงานซ้ำ ป้องกัน duplicate
 * - Virtual/Logging Proxy: (รองรับภายหลังได้) หน่วงการโหลดและบันทึก log
 */

// Proxy (Adapter Wrapper) Interface compatible with IContentAdapter
class SafeJSONAdapterProxy implements IContentAdapter {
  private static cache = new Map<string, ContentItem>();
  constructor(
    private jsonData: Record<string, unknown>,
    private type: 'blog' | 'project' | 'research'
  ) {}

  private normalize(): Record<string, unknown> {
    // ทำให้ field มาตรฐาน เพื่อความคาดเดาได้และลด duplicate key
    const id = (this.jsonData.id || this.jsonData.post_id || this.jsonData.project_id) as string | undefined;
    const title = (this.jsonData.title || this.jsonData.name || this.jsonData.headline || 'Untitled') as string;
    const description = (this.jsonData.description || this.jsonData.summary || this.jsonData.content || 'No description') as string;
    const rawDate = (this.jsonData.date || this.jsonData.year || this.jsonData.published_date || new Date().getFullYear().toString()) as string | number;
    const date = String(rawDate);
    const tags = (this.jsonData.tags || this.jsonData.categories || this.jsonData.tech_stack || []) as string[];

    // ถ้าไม่มี id ให้สร้างจาก title (deterministic) เพื่อลด duplicate เมื่อ import ซ้ำ
    const deterministicId = id ?? `${this.type}-${title.trim().toLowerCase().replace(/\s+/g, '-')}`;

    return { id: deterministicId, title, description, date, tags };
  }

  adapt(): ContentItem {
    // 1) Normalize base fields
    const normalized = this.normalize();
    
    // 2) Run through Chain of Responsibility (validation/sanitization)
    const pipeline = new TitleRequiredHandler();
    pipeline
      .setNext(new DateStringHandler())
      .setNext(new TagLimitHandler(10));

    const processed = pipeline.handle(normalized);
    const cacheKey = `${this.type}:${processed.id as string}`;

    if (SafeJSONAdapterProxy.cache.has(cacheKey)) {
      SessionLogger.getInstance().addLog(
        `Proxy Pattern: Cache hit for import \"${processed.id}\" (${this.type})`
      );
      return SafeJSONAdapterProxy.cache.get(cacheKey)!;
    }

    // Delegate ไปยัง real adapter หลังผ่าน CoR แล้ว
    const adapter = new JSONContentAdapter(processed, this.type);
    const item = adapter.adapt();

    SafeJSONAdapterProxy.cache.set(cacheKey, item);
    SessionLogger.getInstance().addLog(
      `Proxy Pattern: Cached imported item \"${item.title}\" (${this.type})`
    );
    return item;
  }
}

/**
 * ---------------------------------------------------------------------
 * BEHAVIORAL PATTERN: COMMAND PATTERN (ACTIONS + UNDO/REDO)
 * ---------------------------------------------------------------------
 * แคปซูลคำสั่ง (execute/undo) ให้แยกจากผู้เรียกใช้งาน ช่วยให้ทำ Undo/Redo
 * และจัดคิวคำสั่งได้ง่าย เราจะสาธิตคำสั่ง Import ผ่าน Adapter+Proxy
 */

interface ICommand {
  label: string;
  execute(): void;
  undo(): void;
}

class CommandManager {
  private undoStack: ICommand[] = [];
  private redoStack: ICommand[] = [];

  execute(command: ICommand) {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = [];
    SessionLogger.getInstance().addLog(`Command: Executed → ${command.label}`);
  }

  undo() {
    const cmd = this.undoStack.pop();
    if (!cmd) {
      SessionLogger.getInstance().addLog('Command: Nothing to undo');
      return;
    }
    cmd.undo();
    this.redoStack.push(cmd);
    SessionLogger.getInstance().addLog(`Command: Undone → ${cmd.label}`);
  }

  redo() {
    const cmd = this.redoStack.pop();
    if (!cmd) {
      SessionLogger.getInstance().addLog('Command: Nothing to redo');
      return;
    }
    cmd.execute();
    this.undoStack.push(cmd);
    SessionLogger.getInstance().addLog(`Command: Redone → ${cmd.label}`);
  }
}

class ImportViaProxyCommand implements ICommand {
  public label = 'Import Item via Adapter+Proxy';
  private addedId: string | null = null;

  constructor(
    private data: Record<string, unknown>,
    private type: 'blog' | 'project' | 'research',
    private setProjects: (updater: (prev: ContentItem[]) => ContentItem[]) => void,
    private setBlogs: (updater: (prev: ContentItem[]) => ContentItem[]) => void,
    private setResearch: (updater: (prev: ContentItem[]) => ContentItem[]) => void
  ) {}

  execute(): void {
    const adapter = new SafeJSONAdapterProxy(this.data, this.type);
    const item = adapter.adapt();
    this.addedId = item.id;

    switch (this.type) {
      case 'project':
        this.setProjects(prev => [item, ...prev]);
        break;
      case 'blog':
        this.setBlogs(prev => [item, ...prev]);
        break;
      case 'research':
        this.setResearch(prev => [item, ...prev]);
        break;
    }
  }

  undo(): void {
    if (!this.addedId) return;
    const id = this.addedId;
    switch (this.type) {
      case 'project':
        this.setProjects(prev => prev.filter(i => i.id !== id));
        break;
      case 'blog':
        this.setBlogs(prev => prev.filter(i => i.id !== id));
        break;
      case 'research':
        this.setResearch(prev => prev.filter(i => i.id !== id));
        break;
    }
  }
}

/**
 * ---------------------------------------------------------------------
 * STRUCTURAL PATTERN: FACADE PATTERN (SIMPLIFIED INTERFACE)
 * ---------------------------------------------------------------------
 * รับผิดชอบเรื่อง "การสร้าง Unified Interface ที่ง่ายต่อการใช้"
 * สำหรับ complex subsystem ที่มีหลาย patterns ทำงานร่วมกัน
 * 
 * Use Case: Simplify portfolio operations across 7+ design patterns
 * - Hide complexity of Singleton, Prototype, Adapter, Bridge, Composite, Decorator
 * - Provide simple methods for common operations
 * - Coordinate multiple patterns automatically
 */

class PortfolioFacade {
  private static instance: PortfolioFacade;
  
  private projects: ContentItem[] = [];
  private blogs: ContentItem[] = [];
  private research: ContentItem[] = [];
  private decorators: Record<string, ContentDecorator[]> = {};
  
  private constructor() {
    SessionLogger.getInstance().addLog("Facade Pattern: Portfolio Facade initialized");
  }
  
  public static getInstance(): PortfolioFacade {
    if (!PortfolioFacade.instance) {
      PortfolioFacade.instance = new PortfolioFacade();
    }
    return PortfolioFacade.instance;
  }
  
  // === Simple CRUD Operations ===
  
  /**
   * Add new project with automatic logging
   * Combines: ContentItem creation + Singleton logging + State update
   */
  addProject(id: string, title: string, description: string, date: string, tags: string[]): ContentItem {
    const item = new ContentItem(id, title, description, date, tags);
    this.projects.push(item);
    SessionLogger.getInstance().addLog(`Facade: Added project "${title}"`);
    return item;
  }
  
  addBlog(id: string, title: string, description: string, date: string, tags: string[]): ContentItem {
    const item = new ContentItem(id, title, description, date, tags);
    this.blogs.push(item);
    SessionLogger.getInstance().addLog(`Facade: Added blog "${title}"`);
    return item;
  }
  
  addResearch(id: string, title: string, description: string, date: string, tags: string[]): ContentItem {
    const item = new ContentItem(id, title, description, date, tags);
    this.research.push(item);
    SessionLogger.getInstance().addLog(`Facade: Added research "${title}"`);
    return item;
  }
  
  /**
   * Clone item with decorations preserved
   * Combines: Prototype cloning + Decorator copying + State update
   */
  cloneItem(itemId: string): ContentItem | null {
    const item = this.findItem(itemId);
    if (!item) return null;
    
    const cloned = item.clone(); // Prototype Pattern
    
    // Copy decorations
    if (this.decorators[itemId]) {
      this.decorators[cloned.id] = [...this.decorators[itemId]];
      SessionLogger.getInstance().addLog(
        `Facade: Cloned item with ${this.decorators[itemId].length} decorations`
      );
    }
    
    // Add to appropriate collection
    if (this.projects.find(p => p.id === itemId)) {
      this.projects.unshift(cloned);
    } else if (this.blogs.find(b => b.id === itemId)) {
      this.blogs.unshift(cloned);
    } else if (this.research.find(r => r.id === itemId)) {
      this.research.unshift(cloned);
    }
    
    return cloned;
  }
  
  /**
   * Import external data and add to portfolio
   * Combines: Adapter conversion + Item creation + State update
   */
  importFromJSON(jsonData: Record<string, unknown>, type: 'blog' | 'project' | 'research'): ContentItem {
    const adapter = new SafeJSONAdapterProxy(jsonData, type); // Proxy wraps Adapter
    const item = adapter.adapt();
    
    switch (type) {
      case 'project':
        this.projects.unshift(item);
        break;
      case 'blog':
        this.blogs.unshift(item);
        break;
      case 'research':
        this.research.unshift(item);
        break;
    }
    
    SessionLogger.getInstance().addLog(`Facade: Imported ${type} via Adapter+Proxy`);
    return item;
  }
  
  /**
   * Apply decoration to item
   * Combines: Decorator creation + State management
   */
  applyDecoration(itemId: string, decorationType: 'Featured' | 'Pinned' | 'Award' | 'Trending' | 'Hot'): void {
    const item = this.findItem(itemId);
    if (!item) return;
    
    const current = this.decorators[itemId] || [];
    
    // Toggle if exists
    if (current.some(d => d.decorationType === decorationType)) {
      this.decorators[itemId] = current.filter(d => d.decorationType !== decorationType);
      SessionLogger.getInstance().addLog(`Facade: Removed "${decorationType}" from item`);
      return;
    }
    
    // Create new decorator
    const baseItem = current.length > 0 ? current[current.length - 1] : item;
    let decorator: ContentDecorator;
    
    switch (decorationType) {
      case 'Featured':
        decorator = new FeaturedDecorator(baseItem);
        break;
      case 'Pinned':
        decorator = new PinnedDecorator(baseItem);
        break;
      case 'Award':
        decorator = new AwardDecorator(baseItem);
        break;
      case 'Trending':
        decorator = new TrendingDecorator(baseItem);
        break;
      case 'Hot':
        decorator = new HotDecorator(baseItem);
        break;
    }
    
    this.decorators[itemId] = [...current, decorator];
  }
  
  /**
   * Create decorated item in one step
   * Combines: Item creation + Multiple decorators
   */
  createDecoratedItem(
    type: 'project' | 'blog' | 'research',
    title: string,
    description: string,
    date: string,
    tags: string[],
    decorations: ('Featured' | 'Pinned' | 'Award' | 'Trending' | 'Hot')[]
  ): ContentItem {
    const id = Math.random().toString(36).slice(2, 11);
    
    let item: ContentItem;
    switch (type) {
      case 'project':
        item = this.addProject(id, title, description, date, tags);
        break;
      case 'blog':
        item = this.addBlog(id, title, description, date, tags);
        break;
      case 'research':
        item = this.addResearch(id, title, description, date, tags);
        break;
    }
    
    // Apply all decorations
    decorations.forEach(dec => {
      this.applyDecoration(item.id, dec);
    });
    
    SessionLogger.getInstance().addLog(
      `Facade: Created ${type} with ${decorations.length} decorations`
    );
    
    return item;
  }
  
  /**
   * Render item with specific strategy
   * Combines: Bridge Pattern rendering
   */
  renderItem(item: ContentItem, mode: RenderMode): React.ReactNode {
    const strategy = getRenderStrategy(mode); // Bridge Pattern
    const renderer = new ProjectRenderer(strategy);
    return renderer.render(item);
  }
  
  // === Getters ===
  
  getProjects(): ContentItem[] {
    return this.projects;
  }
  
  getBlogs(): ContentItem[] {
    return this.blogs;
  }
  
  getResearch(): ContentItem[] {
    return this.research;
  }
  
  getDecorations(itemId: string): string[] {
    return (this.decorators[itemId] || []).map(d => d.decorationType);
  }
  
  getAllDecorations(): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    Object.entries(this.decorators).forEach(([id, decs]) => {
      result[id] = decs.map(d => d.decorationType);
    });
    return result;
  }
  
  // === Helper Methods ===
  
  private findItem(itemId: string): ContentItem | undefined {
    return (
      this.projects.find(p => p.id === itemId) ||
      this.blogs.find(b => b.id === itemId) ||
      this.research.find(r => r.id === itemId)
    );
  }
  
  // === State Synchronization (for React) ===
  
  setProjects(items: ContentItem[]): void {
    this.projects = items;
  }
  
  setBlogs(items: ContentItem[]): void {
    this.blogs = items;
  }
  
  setResearch(items: ContentItem[]): void {
    this.research = items;
  }
  
  setDecorators(decorators: Record<string, ContentDecorator[]>): void {
    this.decorators = decorators;
  }
}

// Data Initialization
const initialProjects = [
  new ContentItem('1', 'Algorithmic Trading Bot', 'Python based automated trading bot using Strategy Pattern.', '2024', ['Python', 'Finance']),
  new ContentItem('2', 'Knowledge Graph System', 'Personal documentation system using Neo4j and Next.js.', '2023', ['Next.js', 'GraphDB']),
];
const initialResearch = [
  new ContentItem('r1', 'Distributed Systems Analysis', 'Paper on CAP Theorem implementation in modern databases.', '2024', ['Theory', 'Dist-Sys']),
];
const initialBlogs = [
  new ContentItem('b1', 'Deep Dive into React Hooks', 'Understanding the closure trap in useEffect.', 'Oct 2024', ['React', 'JS']),
];

/**
 * ---------------------------------------------------------------------
 * 3. CORE TYPES
 * ---------------------------------------------------------------------
 */
type LayoutStyle = 'minimal' | 'creative' | 'academic';
type UserPersona = 'developer' | 'researcher' | 'student';
type RenderMode = 'preview' | 'full' | 'compact';

/**
 * ---------------------------------------------------------------------
 * 4. PATTERN 1: ABSTRACT FACTORY (THEME SYSTEM)
 * ---------------------------------------------------------------------
 */
interface UIThemeFactory {
  ActionButton: React.FC<{ onClick?: () => void; children: React.ReactNode; isActive?: boolean }>;
  Tag: React.FC<{ label: string }>;
  CardWrapper: React.FC<{ children: React.ReactNode; onClone?: () => void }>;
  SectionWrapper: React.FC<{ children: React.ReactNode }>;
  HeroWrapper: React.FC<{ title: string; subtitle: string; children?: React.ReactNode }>;
}

// -- Minimal Theme --
const MinimalThemeFactory: UIThemeFactory = {
  ActionButton: ({ onClick, children, isActive }) => (
    <button onClick={onClick} className={`font-mono text-xs px-2 py-1 mr-2 border transition-all ${isActive ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-gray-700 text-gray-500 hover:border-gray-500'}`}>
      {`[ ${children} ]`}
    </button>
  ),
  Tag: ({ label }) => <span className="text-xs text-gray-500 font-mono mr-2">#{label}</span>,
  CardWrapper: ({ children, onClone }) => (
    <div className="group border-l border-gray-800 pl-4 py-2 hover:border-green-500/50 transition-colors relative">
      {children}
      {onClone && (
        <button onClick={onClone} className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-gray-600 hover:text-green-500 transition-opacity" title="Clone Item">
          <Copy size={14} />
        </button>
      )}
    </div>
  ),
  SectionWrapper: ({ children }) => <div className="font-mono text-gray-300 py-4 animate-fadeIn">{children}</div>,
  HeroWrapper: ({ title, subtitle, children }) => (
    <div className="border border-gray-800 p-6 bg-black text-green-500 font-mono mb-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity"><Terminal size={40} /></div>
      <div className="text-sm text-gray-500 mb-2">#!/bin/bash</div>
      <h1 className="text-2xl font-bold mb-2">$ echo `{title}`</h1>
      <p className="text-gray-400 mb-4">{`> ${subtitle}`}</p>
      {children}
    </div>
  )
};

// -- Creative Theme --
const CreativeThemeFactory: UIThemeFactory = {
  ActionButton: ({ onClick, children, isActive }) => (
    <button onClick={onClick} className={`px-4 py-2 rounded-lg font-bold text-sm mr-2 transition-all transform hover:-translate-y-0.5 ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
      {children}
    </button>
  ),
  Tag: ({ label }) => <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-md font-bold mr-2 shadow-sm">✨ {label}</span>,
  CardWrapper: ({ children, onClone }) => (
    <div className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 relative hover:-translate-y-1 duration-300">
      {children}
      {onClone && (
        <button onClick={onClone} className="absolute top-4 right-4 p-2 bg-indigo-50 rounded-full text-indigo-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-100 hover:scale-110 shadow-sm" title="Clone Item">
          <Copy size={16} />
        </button>
      )}
    </div>
  ),
  SectionWrapper: ({ children }) => <div className="py-6 animate-fadeIn">{children}</div>,
  HeroWrapper: ({ title, subtitle, children }) => (
    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-8 rounded-3xl text-white shadow-2xl mb-12 relative overflow-hidden">
      <div className="relative z-10">
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight drop-shadow-md">{title}</h1>
        <p className="text-indigo-100 text-lg mb-6 drop-shadow">{subtitle}</p>
        {children}
      </div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-400 opacity-20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
    </div>
  )
};

// -- Academic Theme --
const AcademicThemeFactory: UIThemeFactory = {
  ActionButton: ({ onClick, children, isActive }) => (
    <button onClick={onClick} className={`font-serif px-4 py-1 border-b mr-4 text-sm transition-all ${isActive ? 'border-black text-black font-bold bg-gray-200' : 'border-transparent text-gray-600 hover:text-black hover:border-gray-300'}`}>
      § {children}
    </button>
  ),
  Tag: ({ label }) => <span className="text-xs text-gray-600 italic bg-gray-200 px-2 py-0.5 mr-2 border border-gray-300">keyword: {label}</span>,
  CardWrapper: ({ children, onClone }) => (
    <div className="group mb-4 pb-4 border-b border-gray-300 relative">
      {children}
      {onClone && (
        <button onClick={onClone} className="absolute right-0 top-0 text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs bg-white px-2 py-1 border border-gray-200 shadow-sm" title="Cite/Duplicate">
          <Copy size={12} /> <span>[duplicate]</span>
        </button>
      )}
    </div>
  ),
  SectionWrapper: ({ children }) => <div className="font-serif text-gray-900 bg-[#fdfbf7] p-8 border border-gray-300 shadow-sm my-4 animate-fadeIn">{children}</div>,
  HeroWrapper: ({ title, subtitle, children }) => (
    <div className="bg-[#fdfbf7] p-8 border-b-4 border-black mb-8">
      <h1 className="text-4xl font-serif font-bold text-black mb-2 uppercase tracking-widest">{title}</h1>
      <p className="text-gray-600 italic border-l-2 border-gray-400 pl-4 py-1">{subtitle}</p>
      <div className="mt-4 pt-4 border-t border-gray-200">{children}</div>
    </div>
  )
};

/**
 * ---------------------------------------------------------------------
 * 5. PATTERN 2: FACTORY METHOD (LAYOUT SYSTEM)
 * ---------------------------------------------------------------------
 */

interface SectionProps {
  title: string;
  items: ContentItem[];
  theme: UIThemeFactory;
  icon?: React.ElementType;
  onCloneItem: (item: ContentItem) => void;
  onApplyDecorator?: (itemId: string, type: string) => void;
  itemDecorators?: Record<string, string[]>;
}

const ListLayout: React.FC<SectionProps & { onApplyDecorator?: (itemId: string, type: string) => void; itemDecorators?: Record<string, string[]> }> = 
  ({ title, items, theme, icon: Icon, onCloneItem, onApplyDecorator, itemDecorators }) => (
  <theme.SectionWrapper>
    <div className="flex items-center gap-2 mb-4 opacity-70">
      {Icon && <Icon size={18} />}
      <h3 className="text-lg font-bold uppercase">{title}</h3>
    </div>
    <div className="space-y-4">
      {items.map(item => (
        <theme.CardWrapper key={item.id} onClone={() => onCloneItem(item)}>
          <div className="flex justify-between items-baseline mb-1">
            <span className="font-bold text-lg">{item.title}</span>
            <span className="text-xs opacity-60">{item.date}</span>
          </div>
          <p className="text-sm opacity-80 mb-2">{item.description}</p>
          
          {/* Decorations Display */}
          {itemDecorators?.[item.id] && itemDecorators[item.id].length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {itemDecorators[item.id].map((dec, idx) => {
                const decoratorMap: Record<string, React.ReactNode> = {
                  'Featured': <span key={idx} className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded border border-amber-500/50 font-semibold">⭐ Featured</span>,
                  'Pinned': <span key={idx} className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded border border-red-500/50 font-semibold">📌 Pinned</span>,
                  'Award': <span key={idx} className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded border border-yellow-500/50 font-semibold">🏆 Award</span>,
                  'Trending': <span key={idx} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/50 font-semibold">📈 Trending</span>,
                  'Hot': <span key={idx} className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded border border-orange-500/50 font-semibold">🔥 Hot</span>,
                };
                return decoratorMap[dec] || null;
              })}
            </div>
          )}
          
          <div>{item.tags.map(t => <theme.Tag key={t} label={t} />)}</div>
          
          {/* Decorator Buttons */}
          {onApplyDecorator && (
            <div className="mt-2 pt-2 border-t border-gray-700/20 flex flex-wrap gap-1">
              {(['Featured', 'Pinned', 'Award', 'Trending', 'Hot'] as const).map(dec => (
                <button
                  key={dec}
                  onClick={() => onApplyDecorator(item.id, dec)}
                  className={`text-xs px-2 py-0.5 rounded border transition-all ${
                    itemDecorators?.[item.id]?.includes(dec)
                      ? 'bg-opacity-40 opacity-100'
                      : 'opacity-40 hover:opacity-70'
                  }`}
                  style={{
                    borderColor: {
                      'Featured': 'rgb(217, 119, 6)',
                      'Pinned': 'rgb(239, 68, 68)',
                      'Award': 'rgb(202, 138, 4)',
                      'Trending': 'rgb(59, 130, 246)',
                      'Hot': 'rgb(249, 115, 22)',
                    }[dec],
                    color: {
                      'Featured': 'rgb(251, 191, 36)',
                      'Pinned': 'rgb(248, 113, 113)',
                      'Award': 'rgb(234, 179, 8)',
                      'Trending': 'rgb(96, 165, 250)',
                      'Hot': 'rgb(251, 146, 60)',
                    }[dec],
                  }}
                >
                  {dec === 'Featured' && '⭐'}
                  {dec === 'Pinned' && '📌'}
                  {dec === 'Award' && '🏆'}
                  {dec === 'Trending' && '📈'}
                  {dec === 'Hot' && '🔥'}
                </button>
              ))}
            </div>
          )}
        </theme.CardWrapper>
      ))}
    </div>
  </theme.SectionWrapper>
);

const GridLayout: React.FC<SectionProps & { onApplyDecorator?: (itemId: string, type: string) => void; itemDecorators?: Record<string, string[]> }> = 
  ({ title, items, theme, icon: Icon, onCloneItem, onApplyDecorator, itemDecorators }) => (
  <div className="mb-8 animate-fadeIn">
    <div className="flex items-center gap-2 mb-6">
      {Icon && <Icon size={24} className="text-indigo-500" />}
      <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">{title}</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map(item => (
        <theme.CardWrapper key={item.id} onClone={() => onCloneItem(item)}>
          <h4 className="font-bold text-xl mb-2">{item.title}</h4>
          <p className="text-sm opacity-70 mb-4 h-12 overflow-hidden">{item.description}</p>
          
          {/* Decorations Display */}
          {itemDecorators?.[item.id] && itemDecorators[item.id].length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {itemDecorators[item.id].map((dec, idx) => {
                const decoratorMap: Record<string, React.ReactNode> = {
                  'Featured': <span key={idx} className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded border border-amber-500/50 font-semibold">⭐ Featured</span>,
                  'Pinned': <span key={idx} className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded border border-red-500/50 font-semibold">📌 Pinned</span>,
                  'Award': <span key={idx} className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded border border-yellow-500/50 font-semibold">🏆 Award</span>,
                  'Trending': <span key={idx} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/50 font-semibold">📈 Trending</span>,
                  'Hot': <span key={idx} className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded border border-orange-500/50 font-semibold">🔥 Hot</span>,
                };
                return decoratorMap[dec] || null;
              })}
            </div>
          )}
          
          <div className="flex flex-wrap gap-1">{item.tags.map(t => <theme.Tag key={t} label={t} />)}</div>
          
          {/* Decorator Buttons */}
          {onApplyDecorator && (
            <div className="mt-2 pt-2 border-t border-gray-700/20 flex flex-wrap gap-1">
              {(['Featured', 'Pinned', 'Award', 'Trending', 'Hot'] as const).map(dec => (
                <button
                  key={dec}
                  onClick={() => onApplyDecorator(item.id, dec)}
                  className={`text-xs px-2 py-0.5 rounded border transition-all ${
                    itemDecorators?.[item.id]?.includes(dec)
                      ? 'bg-opacity-40 opacity-100'
                      : 'opacity-40 hover:opacity-70'
                  }`}
                  style={{
                    borderColor: {
                      'Featured': 'rgb(217, 119, 6)',
                      'Pinned': 'rgb(239, 68, 68)',
                      'Award': 'rgb(202, 138, 4)',
                      'Trending': 'rgb(59, 130, 246)',
                      'Hot': 'rgb(249, 115, 22)',
                    }[dec],
                    color: {
                      'Featured': 'rgb(251, 191, 36)',
                      'Pinned': 'rgb(248, 113, 113)',
                      'Award': 'rgb(234, 179, 8)',
                      'Trending': 'rgb(96, 165, 250)',
                      'Hot': 'rgb(251, 146, 60)',
                    }[dec],
                  }}
                >
                  {dec === 'Featured' && '⭐'}
                  {dec === 'Pinned' && '📌'}
                  {dec === 'Award' && '🏆'}
                  {dec === 'Trending' && '📈'}
                  {dec === 'Hot' && '🔥'}
                </button>
              ))}
            </div>
          )}
        </theme.CardWrapper>
      ))}
    </div>
  </div>
);

type SectionComponent = React.FC<SectionProps>;

abstract class SectionCreator {
  abstract create(): SectionComponent;
}

class MinimalSectionCreator extends SectionCreator {
  create(): SectionComponent {
    return ListLayout;
  }
}

class AcademicSectionCreator extends SectionCreator {
  create(): SectionComponent {
    return ListLayout;
  }
}

class CreativeSectionCreator extends SectionCreator {
  create(): SectionComponent {
    return GridLayout;
  }
}

const creatorRegistry: Record<LayoutStyle, SectionCreator> = {
  minimal: new MinimalSectionCreator(),
  academic: new AcademicSectionCreator(),
  creative: new CreativeSectionCreator(),
};

const SectionFactory = (layoutType: LayoutStyle): React.FC<SectionProps> => {
  return creatorRegistry[layoutType].create();
};



/**
 * ---------------------------------------------------------------------
 * 6. PATTERN 3: BUILDER PATTERN (PAGE COMPOSITION)
 * ---------------------------------------------------------------------
 */

interface IPageBuilder {
  reset(): void;
  setTheme(theme: UIThemeFactory, layoutStyle: LayoutStyle): void;
  setCloneHandler(handler: (item: ContentItem) => void): void;
  setDecoratorHandler(handler: (itemId: string, type: string) => void): void;
  setItemDecorators(decorators: Record<string, string[]>): void;
  addHero(title: string, subtitle: string): void;
  addSkills(skills: string[]): void;
  addSection(title: string, data: ContentItem[], icon: React.ElementType): void;
  build(): React.ReactNode;
}

/**
 * Builder Pattern
 * - Responsible for page composition
 * - Delegates layout creation to Factory Method
 * - Delegates theme creation to Abstract Factory
 */

class PortfolioPageBuilder implements IPageBuilder {
  private elements: React.ReactNode[] = [];
  private currentTheme: UIThemeFactory = MinimalThemeFactory;
  private currentLayoutStyle: LayoutStyle = 'minimal';
  private onClone: (item: ContentItem) => void = () => { };
  private onDecorate: (itemId: string, type: string) => void = () => { };
  private itemDecorators: Record<string, string[]> = {};

  reset() {
    this.elements = [];
  }

  setTheme(theme: UIThemeFactory, layoutStyle: LayoutStyle) {
    this.currentTheme = theme;
    this.currentLayoutStyle = layoutStyle;
  }

  setCloneHandler(handler: (item: ContentItem) => void) {
    this.onClone = handler;
  }

  setDecoratorHandler(handler: (itemId: string, type: string) => void) {
    this.onDecorate = handler;
  }

  setItemDecorators(decorators: Record<string, string[]>) {
    this.itemDecorators = decorators;
  }

  addHero(title: string, subtitle: string) {
    this.elements.push(
      <this.currentTheme.HeroWrapper key="hero" title={title} subtitle={subtitle} />
    );
  }

  addSkills(skills: string[]) {
    this.elements.push(
      <this.currentTheme.SectionWrapper key="skills">
        <h3 className="font-bold mb-3 opacity-80 uppercase text-sm tracking-widest">Technical Arsenal</h3>
        <div className="flex flex-wrap gap-y-2">
          {skills.map(s => <this.currentTheme.Tag key={s} label={s} />)}
        </div>
      </this.currentTheme.SectionWrapper>
    );
  }

  addSection(title: string, data: ContentItem[], icon: React.ElementType) {
    const LayoutComponent: SectionComponent = SectionFactory(this.currentLayoutStyle);

    this.elements.push(
      <div key={title} className="mt-8">
        <LayoutComponent
          title={title}
          items={data}
          theme={this.currentTheme}
          icon={icon}
          onCloneItem={this.onClone}
          onApplyDecorator={this.onDecorate}
          itemDecorators={this.itemDecorators}
        />
      </div>
    );
  }

  build(): React.ReactNode {
    return <div className="animate-slideUp">{this.elements}</div>;
  }
}

/**
 * ---------------------------------------------------------------------
 * 7. DIRECTOR & MAIN COMPONENT (CLIENT)
 * ---------------------------------------------------------------------
 */
export default function PersonalWebsiteUltimate() {
  const [style, setStyle] = useState<LayoutStyle>('minimal');
  const [persona, setPersona] = useState<UserPersona>('developer');
  const commandManagerRef = useRef<CommandManager | null>(null);
  const mediatorRef = useRef<IMediator | null>(null);
  const iteratorRef = useRef<PortfolioIterator | null>(null);
  const [iterCurrent, setIterCurrent] = useState<ContentItem | null>(null);
  const mementoOriginatorRef = useRef<PortfolioStateOriginator | null>(null);
  const mementoHistoryRef = useRef<HistoryCaretaker | null>(null);
  const subjectRef = useRef<PortfolioSubject | null>(null);
  const portfolioStateContextRef = useRef<PortfolioStateContext | null>(null);
  const sortStrategyContextRef = useRef<PortfolioSortContext | null>(null);
  
  // Visitor Pattern State
  const [visitorResults, setVisitorResults] = useState<unknown>(null);
  const [visitorResultType, setVisitorResultType] = useState<'json' | 'stats' | 'markdown' | 'validation' | null>(null);
  
  // Template Method Pattern State
  const [lastProcessedItem, setLastProcessedItem] = useState<ContentItem | null>(null);
  const [processingLog, setProcessingLog] = useState<string>('');

  // Sorting Strategy State
  const [sortedProjects, setSortedProjects] = useState<ContentItem[]>(initialProjects);
  const [sortedBlogs, setSortedBlogs] = useState<ContentItem[]>(initialBlogs);
  const [sortedResearch, setSortedResearch] = useState<ContentItem[]>(initialResearch);
  const [currentSortStrategy, setCurrentSortStrategy] = useState<string>('Alphabetical');

  // Data State
  const [projects, setProjects] = useState<ContentItem[]>(initialProjects);
  const [research, setResearch] = useState<ContentItem[]>(initialResearch);
  const [blogs, setBlogs] = useState<ContentItem[]>(initialBlogs);

  // Import Feature State (Adapter Pattern)
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJSON, setImportJSON] = useState('');
  const [importType, setImportType] = useState<'blog' | 'project' | 'research'>('project');

  // Bridge Pattern State (Render Mode)
  const [renderMode, setRenderMode] = useState<RenderMode>('full');

  // Composite Pattern State (Hierarchical Portfolio)
  const portfolioRef = useRef<Portfolio | null>(null);
  
  // Initialize portfolio once
  if (portfolioRef.current === null) {
    const portfolio = new Portfolio('My Full Portfolio');
    
    // Create categories using Composite Pattern
    const projectsGroup = new ContentGroup('Featured Projects', 'blue', Code);
    const blogsGroup = new ContentGroup('Tech Blog', 'purple', Feather);
    const researchGroup = new ContentGroup('Academic Research', 'green', Book);
    
    // Add items to groups
    initialProjects.forEach(project => {
      projectsGroup.addChild(new ContentItemLeaf(project));
    });
    initialBlogs.forEach(blog => {
      blogsGroup.addChild(new ContentItemLeaf(blog));
    });
    initialResearch.forEach(research => {
      researchGroup.addChild(new ContentItemLeaf(research));
    });
    
    // Add groups to portfolio
    portfolio.addChild(projectsGroup);
    portfolio.addChild(blogsGroup);
    portfolio.addChild(researchGroup);
    
    portfolioRef.current = portfolio;
  }

  // Initialize all refs that have constructors with side effects
  useEffect(() => {
    // Initialize refs ONCE after first mount (outside render phase)
    if (commandManagerRef.current === null) {
      commandManagerRef.current = new CommandManager();
    }
    if (mementoOriginatorRef.current === null) {
      mementoOriginatorRef.current = new PortfolioStateOriginator();
    }
    if (mementoHistoryRef.current === null) {
      mementoHistoryRef.current = new HistoryCaretaker();
    }
    if (subjectRef.current === null) {
      subjectRef.current = new PortfolioSubject();
    }
    if (portfolioStateContextRef.current === null) {
      portfolioStateContextRef.current = new PortfolioStateContext();
    }
    if (sortStrategyContextRef.current === null) {
      sortStrategyContextRef.current = new PortfolioSortContext();
    }
  }, []);

  // Initialize Mediator once per mount (bindings use stable setters)
  useEffect(() => {
    if (!portfolioRef.current) return;
    if (!commandManagerRef.current || !subjectRef.current) return;
    
    mediatorRef.current = new UIMediator({
      setStyle,
      setPersona,
      setRenderMode,
      setShowImportModal,
      setProjects: (updater) => setProjects(prev => updater(prev)),
      setBlogs: (updater) => setBlogs(prev => updater(prev)),
      setResearch: (updater) => setResearch(prev => updater(prev)),
      resetIterator: () => {
        if (portfolioRef.current) {
          iteratorRef.current = new PortfolioIterator(portfolioRef.current);
          setIterCurrent(null);
        }
      },
      commandManager: commandManagerRef.current,
      subject: subjectRef.current,
    });
  }, []);

  // Decorator Pattern State (Track decorators for each item)
  const [itemDecorators, setItemDecorators] = useState<Record<string, ContentDecorator[]>>({});

  const applyDecorator = (itemId: string, decoratorType: 'Featured' | 'Pinned' | 'Award' | 'Trending' | 'Hot') => {
    setItemDecorators(prev => {
      const currentDecorators = prev[itemId] || [];
      
      // Check if decorator already exists
      const hasDecorator = currentDecorators.some(d => d.decorationType === decoratorType);
      if (hasDecorator) {
        // Remove if exists
        const updated = currentDecorators.filter(d => d.decorationType !== decoratorType);
        return { ...prev, [itemId]: updated };
      }
      
      // Add decorator
      const item = projects.find(p => p.id === itemId) || 
                   blogs.find(b => b.id === itemId) || 
                   research.find(r => r.id === itemId);
      
      if (!item) return prev;
      
      let decorator: ContentDecorator;
      const baseItem = currentDecorators.length > 0 ? currentDecorators[currentDecorators.length - 1] : item;
      
      switch (decoratorType) {
        case 'Featured':
          decorator = new FeaturedDecorator(baseItem);
          break;
        case 'Pinned':
          decorator = new PinnedDecorator(baseItem);
          break;
        case 'Award':
          decorator = new AwardDecorator(baseItem);
          break;
        case 'Trending':
          decorator = new TrendingDecorator(baseItem);
          break;
        case 'Hot':
          decorator = new HotDecorator(baseItem);
          break;
      }
      
      return { ...prev, [itemId]: [...currentDecorators, decorator] };
    });
  };

  // Create a map of itemId -> decorations for rendering
  const itemDecorationsMap: Record<string, string[]> = {};
  Object.entries(itemDecorators).forEach(([itemId, decorators]) => {
    itemDecorationsMap[itemId] = decorators.map(d => d.decorationType);
  });

  // Singleton State (For UI Rendering)
  // ใช้ useReducer เพื่อ force update เมื่อ Singleton มีการเปลี่ยนแปลง
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [isClient, setIsClient] = useState(false);
  const isMountedRef = useRef(false);

  useEffect(() => {
    // Mark as client-side only and mounted
    setIsClient(true);
    isMountedRef.current = true;
    
    // Resume notifications now that component is mounted
    SessionLogger.getInstance().resumeNotifications();
    
    // Subscribe to Singleton changes only after mount
    const unsubscribe = SessionLogger.getInstance().subscribe(() => {
      if (isMountedRef.current) {
        forceUpdate();
      }
    });
    
    return () => {
      isMountedRef.current = false;
      SessionLogger.getInstance().pauseNotificationsMethod();
      unsubscribe();
    };
  }, []);

  // Register an Observer to log portfolio events
  useEffect(() => {
    const loggerObserver = new LoggerObserver();
    subjectRef.current!.subscribe(loggerObserver);
    return () => subjectRef.current!.unsubscribe(loggerObserver);
  }, []);

  // Helpers for Memento: serialize/deserialize
  const toDTO = (items: ContentItem[]): ContentItemDTO[] => items.map(i => ({ id: i.id, title: i.title, description: i.description, date: i.date, tags: [...i.tags] }));
  const fromDTO = (dtos: ContentItemDTO[]): ContentItem[] => dtos.map(d => new ContentItem(d.id, d.title, d.description, d.date, [...d.tags]));
  const decorationsToDTO = (decoratorsMap: Record<string, ContentDecorator[]>): DecorationsDTO => {
    const result: DecorationsDTO = {} as DecorationsDTO;
    Object.entries(decoratorsMap).forEach(([id, decs]) => {
      result[id] = decs.map(d => d.decorationType) as DecorationsDTO[string];
    });
    return result;
  };
  const rebuildDecorators = (items: ContentItem[], decMap: DecorationsDTO): Record<string, ContentDecorator[]> => {
    const index = new Map(items.map(i => [i.id, i] as const));
    const res: Record<string, ContentDecorator[]> = {};
    Object.entries(decMap).forEach(([id, types]) => {
      const item = index.get(id);
      if (!item) return;
      const arr: ContentDecorator[] = [];
      let base: ContentItem | ContentDecorator = item;
      types.forEach(t => {
        switch (t) {
          case 'Featured': base = new FeaturedDecorator(base); arr.push(base as ContentDecorator); break;
          case 'Pinned': base = new PinnedDecorator(base); arr.push(base as ContentDecorator); break;
          case 'Award': base = new AwardDecorator(base); arr.push(base as ContentDecorator); break;
          case 'Trending': base = new TrendingDecorator(base); arr.push(base as ContentDecorator); break;
          case 'Hot': base = new HotDecorator(base); arr.push(base as ContentDecorator); break;
        }
      });
      res[id] = arr;
    });
    return res;
  };

  // Handlers logging via Singleton
  const handleStyleChange = (newStyle: LayoutStyle) => {
    SessionLogger.getInstance().addLog(`Abstract Factory: Switched theme to "${newStyle}"`);
    setStyle(newStyle);
  };

  const handlePersonaChange = (newPersona: UserPersona) => {
    SessionLogger.getInstance().addLog(`Builder: Rebuilt page for "${newPersona}" persona`);
    setPersona(newPersona);
  };

  const handleRenderModeChange = (newMode: RenderMode) => {
    SessionLogger.getInstance().addLog(`Bridge Pattern: Changed render mode to "${newMode}"`);
    setRenderMode(newMode);
  };

  // Strategy Pattern: Apply sorting strategy
  const handleApplySortStrategy = (strategy: IPortfolioSortStrategy) => {
    sortStrategyContextRef.current!.setStrategy(strategy);
    setCurrentSortStrategy(strategy.getName());
    
    // Apply sorting to all collections
    setSortedProjects(strategy.sort(projects));
    setSortedBlogs(strategy.sort(blogs));
    setSortedResearch(strategy.sort(research));
    
    SessionLogger.getInstance().addLog(`✅ Applied "${strategy.getName()}" sorting to all collections`);
  };

  // --- Template Method Handler (Process content via template) ---
  const handleProcessContentWithTemplate = (item: ContentItem, type: 'project' | 'blog' | 'research') => {
    const processor = ContentProcessorFactory.createProcessor(type);
    
    let success = false;
    if (type === 'project') {
      success = processor.processAndAdd(item, (processedItem) => setProjects([processedItem, ...projects]));
    } else if (type === 'blog') {
      success = processor.processAndAdd(item, (processedItem) => setBlogs([processedItem, ...blogs]));
    } else {
      success = processor.processAndAdd(item, (processedItem) => setResearch([processedItem, ...research]));
    }
    
    if (success) {
      setLastProcessedItem(item);
      setProcessingLog(`Processed: ${type} - ${item.title}`);
    } else {
      setProcessingLog(`Failed: ${type} - ${item.title} validation error`);
    }
  };

  // --- Visitor Handler: Apply visitor pattern to collections ---
  const handleApplyVisitor = (visitorType: 'json' | 'stats' | 'markdown' | 'validation') => {
    let visitor: IPortfolioVisitor;

    switch (visitorType) {
      case 'json':
        visitor = new JSONExportVisitor();
        break;
      case 'stats':
        visitor = new StatisticsVisitor();
        break;
      case 'markdown':
        visitor = new MarkdownExportVisitor();
        break;
      case 'validation':
        visitor = new ValidationVisitor();
        break;
    }

    // Apply visitor to all content types
    PortfolioVisitorDispatcher.visitAll(projects, blogs, research, visitor);

    const result = visitor.getResult();
    setVisitorResults(result);
    setVisitorResultType(visitorType);

    SessionLogger.getInstance().addLog(`✅ Applied Visitor Pattern (${visitorType}): Processed ${projects.length + blogs.length + research.length} items`);
  };

  const handleCloneItem = (item: ContentItem) => {
    // Check state before cloning
    if (!portfolioStateContextRef.current!.canClone()) {
      SessionLogger.getInstance().addLog(`❌ Clone blocked: Portfolio in ${portfolioStateContextRef.current!.getState().getName()} state`);
      return;
    }
    // Note: The Log is added inside item.clone() as well, demonstrating Prototype responsibility
    portfolioStateContextRef.current!.transitionToCloning();
    const clonedItem = item.clone();

    if (projects.find(p => p.id === item.id)) {
      setProjects([clonedItem, ...projects]);
      subjectRef.current!.notify('clone', { kind: 'project', action: 'clone', payload: clonedItem });
    } else if (research.find(r => r.id === item.id)) {
      setResearch([clonedItem, ...research]);
      subjectRef.current!.notify('clone', { kind: 'research', action: 'clone', payload: clonedItem });
    } else if (blogs.find(b => b.id === item.id)) {
      setBlogs([clonedItem, ...blogs]);
      subjectRef.current!.notify('clone', { kind: 'blog', action: 'clone', payload: clonedItem });
    }
    portfolioStateContextRef.current!.transitionToIdle();
  };

  // --- Import Handler (Adapter + Proxy Pattern) ---
  const handleImportData = () => {
    // Check state before importing
    if (!portfolioStateContextRef.current!.canImport()) {
      SessionLogger.getInstance().addLog(`❌ Import blocked: Portfolio in ${portfolioStateContextRef.current!.getState().getName()} state`);
      return;
    }
    portfolioStateContextRef.current!.transitionToImporting();
    try {
      const jsonData = JSON.parse(importJSON);
      const adapter = new SafeJSONAdapterProxy(jsonData, importType);
      const contentItem = adapter.adapt();

      // Add to appropriate collection based on import type
      switch (importType) {
        case 'project':
          setProjects([contentItem, ...projects]);
          subjectRef.current!.notify('import', { kind: 'project', action: 'import', payload: contentItem });
          break;
        case 'blog':
          setBlogs([contentItem, ...blogs]);
          subjectRef.current!.notify('import', { kind: 'blog', action: 'import', payload: contentItem });
          break;
        case 'research':
          setResearch([contentItem, ...research]);
          subjectRef.current!.notify('import', { kind: 'research', action: 'import', payload: contentItem });
          break;
      }

      // Close modal and clear input
      setShowImportModal(false);
      setImportJSON('');
      
      SessionLogger.getInstance().addLog(`✅ Successfully imported ${importType} via Adapter+Proxy (validated/cached)`);
    } catch (error) {
      SessionLogger.getInstance().addLog(`❌ Import failed: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    } finally {
      portfolioStateContextRef.current!.transitionToIdle();
    }
  };

  // Sample data for quick testing
  const getSampleJSON = () => {
    const samples = {
      project: `{
  "id": "ext-proj-001",
  "name": "ML Image Classifier",
  "summary": "Deep learning model for image classification using TensorFlow",
  "year": 2024,
  "tech_stack": ["Python", "TensorFlow", "Docker"]
}`,
      blog: `{
  "post_id": "blog-ext-001",
  "headline": "Understanding Adapter Pattern",
  "content": "How Adapter Pattern helps integrate external systems seamlessly",
  "published_date": "2024-01-15",
  "categories": ["Design Patterns", "Architecture"]
}`,
      research: `{
  "id": "research-ext-001",
  "title": "Quantum Computing Algorithms",
  "description": "Novel approach to quantum error correction using topological codes",
  "date": "2024",
  "tags": ["Quantum", "Algorithms", "Error Correction"]
}`
    };
    setImportJSON(samples[importType]);
  };

  // --- Theme Selection (Abstract Factory) ---
  const getTheme = (s: LayoutStyle) => {
    switch (s) {
      case 'minimal': return MinimalThemeFactory;
      case 'creative': return CreativeThemeFactory;
      case 'academic': return AcademicThemeFactory;
      default: return MinimalThemeFactory;
    }
  };

  // --- Bridge Pattern: Get Render Strategy ---
  // (getRenderStrategy is defined globally above)

  // --- Bridge Pattern: Render ContentItem with Strategy ---
  const renderWithBridge = (item: ContentItem, type: 'project' | 'blog' | 'research'): React.ReactNode => {
    const strategy = getRenderStrategy(renderMode);
    let renderer: ContentRenderer;

    switch (type) {
      case 'project':
        renderer = new ProjectRenderer(strategy);
        break;
      case 'blog':
        renderer = new BlogRenderer(strategy);
        break;
      case 'research':
        renderer = new ResearchRenderer(strategy);
        break;
    }

    return renderer.render(item);
  };

  // --- Page Construction (Builder) ---
  const builder = new PortfolioPageBuilder();
  const theme = getTheme(style);

  builder.reset();
  builder.setTheme(theme, style);
  builder.setCloneHandler(handleCloneItem);
  builder.setDecoratorHandler((id, type) => applyDecorator(id, type as 'Featured' | 'Pinned' | 'Award' | 'Trending' | 'Hot'));
  builder.setItemDecorators(itemDecorationsMap);

  // Director Logic
  switch (persona) {
    case 'developer':
      builder.addHero("Full-Stack Developer", "Singleton Pattern active: View logs below.");
      builder.addSkills(['React', 'TypeScript', 'Design Patterns', 'Docker', 'AWS']);
      builder.addSection("Featured Projects", projects, Code);
      builder.addSection("Tech Blog", blogs, Feather);
      break;

    case 'researcher':
      builder.addHero("Dr. Researcher", "Analyzing Design Patterns efficiency.");
      builder.addSection("Academic Publications", research, Book);
      builder.addSection("Implementation Prototypes", projects, Cpu);
      builder.addSkills(['LaTeX', 'Python', 'Statistics', 'System Theory']);
      break;

    case 'student':
      builder.addHero("CS Student @ University", "Learning Singleton, Factory, Builder, Prototype.");
      builder.addSkills(['Java', 'C++', 'Algorithms', 'Data Structures']);
      builder.addSection("Coursework Projects", projects, Layers);
      builder.addSection("Study Notes", research, FileText);
      break;
  }

  const pageContent = builder.build();

  return (
    <div className={`min-h-screen transition-colors duration-500 flex flex-col ${style === 'minimal' ? 'bg-[#0d1117] text-gray-300' :
      style === 'academic' ? 'bg-white text-gray-900' :
        'bg-gray-50 text-gray-800'
      }`}>

      {/* --- Controls UI (Top Right) --- */}
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
        {/* Import Button (Adapter Pattern Demo) */}
        <button 
          onClick={() => setShowImportModal(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 hover:scale-105"
        >
          <Upload size={16} />
          Import Data
        </button>

        {/* Render Mode Toggle (Bridge Pattern Demo) */}
        <div className="bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/20 flex gap-1 shadow-lg">
          {(['preview', 'full', 'compact'] as RenderMode[]).map(mode => (
            <button 
              key={mode} 
              onClick={() => handleRenderModeChange(mode)} 
              className={`px-3 py-1 text-xs rounded-full capitalize transition-all ${renderMode === mode ? 'bg-green-500 text-white font-bold shadow' : 'text-gray-500 hover:text-gray-300'}`}
              title={`Bridge Pattern: ${mode} render`}
            >
              {mode === 'preview' && '👁️'} {mode === 'full' && '📄'} {mode === 'compact' && '📦'} {mode}
            </button>
          ))}
        </div>


        <div className="bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/20 flex gap-1 shadow-lg">
          {(['minimal', 'creative', 'academic'] as LayoutStyle[]).map(s => (
            <button key={s} onClick={() => handleStyleChange(s)} className={`px-3 py-1 text-xs rounded-full capitalize transition-all ${style === s ? 'bg-white text-black font-bold shadow' : 'text-gray-500 hover:text-gray-300'}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/20 flex gap-1 shadow-lg">
          {(['developer', 'researcher', 'student'] as UserPersona[]).map(p => (
            <button key={p} onClick={() => handlePersonaChange(p)} className={`px-3 py-1 text-xs rounded-full capitalize transition-all ${persona === p ? 'bg-blue-500 text-white font-bold shadow' : 'text-gray-500 hover:text-gray-300'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="max-w-4xl mx-auto p-8 md:p-12 w-full flex-grow">
        <div className="mb-8 flex items-center gap-3 opacity-50 text-xs uppercase tracking-widest font-bold border-b border-gray-700/20 pb-4">
          <User size={16} />
          <span>Mode: {persona}</span>
          <span>/</span>
          <span>Theme: {style}</span>
          <span>/</span>
          <span>Render: {renderMode}</span>
        </div>

        {/* Bridge Pattern Demo Section */}
        <div className={`mb-8 p-6 rounded-xl border ${
          style === 'minimal' ? 'bg-gray-900/50 border-gray-800' :
          style === 'academic' ? 'bg-gray-50 border-gray-200' :
          'bg-white/50 border-gray-200'
        }`}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Layout size={18} className="text-green-400" />
            🌉 Bridge Pattern Demo - Render Strategies
          </h3>
          <p className="text-sm opacity-70 mb-4">
            แยก `What to Render` ออกจาก `How to Render` - เปลี่ยน Render Mode ได้โดยไม่แก้ ContentItem
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sample Project */}
            <div className="space-y-2">
              <div className="text-xs font-semibold opacity-50 uppercase">Project (Blue)</div>
              {renderWithBridge(projects[0], 'project')}
            </div>
            
            {/* Sample Blog */}
            <div className="space-y-2">
              <div className="text-xs font-semibold opacity-50 uppercase">Blog (Purple)</div>
              {renderWithBridge(blogs[0], 'blog')}
            </div>
            
            {/* Sample Research */}
            <div className="space-y-2">
              <div className="text-xs font-semibold opacity-50 uppercase">Research (Green)</div>
              {renderWithBridge(research[0], 'research')}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700/20 text-xs opacity-60">
            💡 <strong>Current Strategy:</strong> {getRenderStrategy(renderMode).constructor.name} | 
            <strong> Abstraction:</strong> ProjectRenderer, BlogRenderer, ResearchRenderer
          </div>
        </div>

        {/* Composite Pattern Demo Section */}
        <div className={`mb-8 p-6 rounded-xl border ${
          style === 'minimal' ? 'bg-gray-900/50 border-gray-800' :
          style === 'academic' ? 'bg-gray-50 border-gray-200' :
          'bg-white/50 border-gray-200'
        }`}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Layers size={18} className="text-orange-400" />
            🌳 Composite Pattern Demo - Hierarchical Portfolio
          </h3>
          <p className="text-sm opacity-70 mb-4">
            สร้าง Tree Structure ของ Content - Portfolio → Categories → Items (Support nested)
          </p>
          
          {/* Render Composite Tree */}
          <div className={`p-4 rounded-lg ${
            style === 'minimal' ? 'bg-gray-800/30 border border-gray-700' :
            'bg-gray-100 border border-gray-300'
          }`}>
            {portfolioRef.current?.render(renderMode)}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700/20 text-xs opacity-60">
            💡 <strong>Structure:</strong> Portfolio (root) → ContentGroup (branches) → ContentItemLeaf (leaves)
          </div>
        </div>

        {/* Proxy Pattern Demo Section */}
        <div className={`mb-8 p-6 rounded-xl border ${style === 'minimal' ? 'bg-gray-900/50 border-gray-800' :
            style === 'academic' ? 'bg-gray-50 border-gray-200' :
              'bg-white/50 border-gray-200'
          }`}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Shield size={18} className="text-emerald-400" />
            🛡️ Proxy Pattern Demo - Validation & Caching
          </h3>
          <p className="text-sm opacity-70 mb-4">
            ห่อ Adapter ด้วย Proxy เพื่อเพิ่มการตรวจสอบและ caching ก่อนจะแปลงข้อมูลเป็น ContentItem
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Validation Proxy Demo */}
            <button
              onClick={() => {
                const invalid = { content: 'no title/description', published_date: '2023-01-01', categories: ['misc'] };
                const adapter = new SafeJSONAdapterProxy(invalid, 'blog');
                const adapted = adapter.adapt();
                setBlogs(prev => [adapted, ...prev]);
                SessionLogger.getInstance().addLog('Proxy Demo: Imported invalid JSON → normalized and accepted');
              }}
              className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all text-left"
            >
              <div className="font-bold mb-1">🧪 Import Invalid JSON (Validation)</div>
              <div className="text-xs opacity-90">Missing title auto-filled as `Untitled`</div>
            </button>

            {/* Caching Proxy Demo */}
            <button
              onClick={() => {
                const data = { id: 'proxy-dup-1', name: 'Proxy Cache Demo', summary: 'Second import should hit cache', year: 2024, tech_stack: ['Proxy', 'Cache'] };
                const a1 = new SafeJSONAdapterProxy(data, 'project');
                const i1 = a1.adapt();
                setProjects(prev => [i1, ...prev]);
                // Second call demonstrates cache hit without adding a duplicate item (avoids duplicate React keys)
                const a2 = new SafeJSONAdapterProxy(data, 'project');
                a2.adapt();
                SessionLogger.getInstance().addLog('Proxy Demo: Second import triggered cache hit (no duplicate added)');
              }}
              className="p-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all text-left flex items-center gap-2"
            >
              <Repeat size={16} />
              <div>
                <div className="font-bold">Repeat Import (Caching)</div>
                <div className="text-xs opacity-90">Second call reuses cached adaptation</div>
              </div>
            </button>
          </div>

          {/* Benefits Display */}
          <div className={`mt-4 p-4 rounded-lg ${style === 'minimal' ? 'bg-emerald-500/5 border border-emerald-500/20' :
              'bg-emerald-50 border border-emerald-200'
            }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div>✅ Validates/normalizes input before adaptation</div>
              <div>✅ Caches adapted results (duplicate-safe)</div>
              <div>✅ Transparent to clients using same interface</div>
              <div>✅ Works alongside Adapter and Facade</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700/20 text-xs opacity-60">
            💡 <strong>Pattern:</strong> Proxy controls access and adds cross-cutting concerns |
            <strong> Subject:</strong> IContentAdapter → SafeJSONAdapterProxy → JSONContentAdapter
          </div>
        </div>

        {/* Decorator Pattern Demo Section */}
        <div className={`mb-8 p-6 rounded-xl border ${
          style === 'minimal' ? 'bg-gray-900/50 border-gray-800' :
          style === 'academic' ? 'bg-gray-50 border-gray-200' :
          'bg-white/50 border-gray-200'
        }`}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <GraduationCap size={18} className="text-yellow-400" />
            ✨ Decorator Pattern Demo - Dynamic Behavior Adding
          </h3>
          <p className="text-sm opacity-70 mb-4">
            เพิ่ม Behavior/Decorations ให้กับ Items โดยไม่แก้ item เดิม - สามารถ stack decorators ได้ (⭐ Featured, 📌 Pinned, 🏆 Award, 📈 Trending, 🔥 Hot)
          </p>
          
          {/* Decorator Demo Items */}
          <div className="space-y-3">
            <div className="text-sm font-semibold opacity-70 uppercase">Try clicking decorator buttons below in Featured Projects section 👇</div>
            <div className={`p-4 rounded-lg ${
              style === 'minimal' ? 'bg-gray-800/30 border border-gray-700' :
              'bg-gray-100 border border-gray-300'
            }`}>
              <div className="text-xs opacity-70 mb-2">
                <strong>Example:</strong> Decorator allows wrapping objects to add features without modifying original
              </div>
              <div className="space-y-2">
                {projects.slice(0, 2).map(item => (
                  <div key={item.id} className="p-2 bg-black/20 rounded border border-gray-700/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-sm">{item.title}</div>
                        <div className="text-xs opacity-60">{item.date}</div>
                      </div>
                      {itemDecorationsMap[item.id]?.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-end">
                          {itemDecorationsMap[item.id].map((dec, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 text-xs rounded border font-semibold bg-opacity-20"
                              style={{
                                borderColor: {
                                  'Featured': 'rgb(217, 119, 6)',
                                  'Pinned': 'rgb(239, 68, 68)',
                                  'Award': 'rgb(202, 138, 4)',
                                  'Trending': 'rgb(59, 130, 246)',
                                  'Hot': 'rgb(249, 115, 22)',
                                }[dec],
                                color: {
                                  'Featured': 'rgb(251, 191, 36)',
                                  'Pinned': 'rgb(248, 113, 113)',
                                  'Award': 'rgb(234, 179, 8)',
                                  'Trending': 'rgb(96, 165, 250)',
                                  'Hot': 'rgb(251, 146, 60)',
                                }[dec],
                              }}
                            >
                              {dec === 'Featured' && '⭐'} {dec === 'Pinned' && '📌'} {dec === 'Award' && '🏆'} {dec === 'Trending' && '📈'} {dec === 'Hot' && '🔥'} {dec}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700/20 text-xs opacity-60">
            💡 <strong>Pattern:</strong> Decorator wraps objects to add behavior dynamically | 
            <strong> Implementation:</strong> IContentDecorator + ContentDecorator base + 5 concrete decorators
          </div>
        </div>

        {/* Flyweight Pattern Demo Section */}
        <div className={`mb-8 p-6 rounded-xl border ${
          style === 'minimal' ? 'bg-gray-900/50 border-gray-800' :
          style === 'academic' ? 'bg-gray-50 border-gray-200' :
          'bg-white/50 border-gray-200'
        }`}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap size={18} className="text-cyan-400" />
            💾 Flyweight Pattern Demo - Memory Optimization
          </h3>
          <p className="text-sm opacity-70 mb-4">
            แชร์ Objects ที่มี Intrinsic State เหมือนกัน - Tags ถูกใช้ซ้ำหลายครั้ง โดยไม่สร้าง instances ใหม่
          </p>
          
          {/* Flyweight Statistics */}
          {(() => {
            const factory = TagFlyweightFactory.getInstance();
            const stats = factory.getStats();
            
            return (
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className={`p-3 rounded-lg text-center ${
                  style === 'minimal' ? 'bg-cyan-500/10 border border-cyan-500/30' :
                  'bg-cyan-50 border border-cyan-200'
                }`}>
                  <div className="text-2xl font-bold text-cyan-400">{stats.uniqueTags}</div>
                  <div className="text-xs opacity-70 mt-1">Unique Flyweights</div>
                </div>
                <div className={`p-3 rounded-lg text-center ${
                  style === 'minimal' ? 'bg-blue-500/10 border border-blue-500/30' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="text-2xl font-bold text-blue-400">{stats.totalUsage}</div>
                  <div className="text-xs opacity-70 mt-1">Total Tag Usage</div>
                </div>
                <div className={`p-3 rounded-lg text-center ${
                  style === 'minimal' ? 'bg-green-500/10 border border-green-500/30' :
                  'bg-green-50 border border-green-200'
                }`}>
                  <div className="text-2xl font-bold text-green-400">{stats.memorySaved}%</div>
                  <div className="text-xs opacity-70 mt-1">Memory Saved</div>
                </div>
              </div>
            );
          })()}
          
          {/* Flyweight Pool Display */}
          <div className={`p-4 rounded-lg mb-4 ${
            style === 'minimal' ? 'bg-gray-800/50 border border-gray-700' :
            'bg-gray-100 border border-gray-300'
          }`}>
            <div className="text-xs font-bold opacity-70 mb-2">Flyweight Pool (Shared Instances):</div>
            <div className="flex flex-wrap gap-2">
              {TagFlyweightFactory.getInstance().getAllFlyweights().map((flyweight, idx) => (
                <div key={idx}>
                  {flyweight.render({ size: 'sm', showIcon: true })}
                </div>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                const factory = TagFlyweightFactory.getInstance();
                
                // Create project using existing flyweights (no new instances created!)
                const tagNames = ['React', 'TypeScript', 'Next.js'];
                const flyweights = factory.getTags(tagNames);
                
                const newProject = new ContentItem(
                  Math.random().toString(36).slice(2, 11),
                  'Flyweight Demo Project',
                  'Uses shared tag flyweights - no duplicate tag objects created!',
                  new Date().getFullYear().toString(),
                  tagNames
                );
                
                setProjects([newProject, ...projects]);
                
                SessionLogger.getInstance().addLog(
                  `Flyweight Pattern: Created project with ${flyweights.length} shared tags (reused existing flyweights)`
                );
              }}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-105"
            >
              <Plus size={16} />
              Use Shared Tags
            </button>
            
            <button
              onClick={() => {
                const factory = TagFlyweightFactory.getInstance();
                
                // Register new custom tag
                const customTagName = `Custom-${Date.now().toString(36).slice(-4)}`;
                factory.registerTag(customTagName, 'pink', '✨', 'custom');
                
                // Create project with new tag
                const newProject = new ContentItem(
                  Math.random().toString(36).slice(2, 11),
                  'Custom Tag Project',
                  'Project with newly registered flyweight tag',
                  new Date().getFullYear().toString(),
                  [customTagName, 'React']
                );
                
                setProjects([newProject, ...projects]);
                
                SessionLogger.getInstance().addLog(
                  `Flyweight Pattern: Registered new tag "${customTagName}" and created project`
                );
              }}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-105"
            >
              <Sparkles size={16} />
              Register New Tag
            </button>
          </div>
          
          {/* Benefits Display */}
          <div className={`mt-4 p-4 rounded-lg ${
            style === 'minimal' ? 'bg-green-500/5 border border-green-500/20' :
            'bg-green-50 border border-green-200'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✅</span>
                <span className="opacity-80">Shares tag objects across items</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✅</span>
                <span className="opacity-80">Reduces memory usage significantly</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✅</span>
                <span className="opacity-80">Separates intrinsic/extrinsic state</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✅</span>
                <span className="opacity-80">Factory manages shared pool</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✅</span>
                <span className="opacity-80">Tags reused: `React` = 1 instance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✅</span>
                <span className="opacity-80">Transparent to clients</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700/20 text-xs opacity-60">
            💡 <strong>Pattern:</strong> Flyweight shares intrinsic state (name, color, icon) across instances | 
            <strong>Classes:</strong> TagFlyweight + TagFlyweightFactory
          </div>
        </div>

        {/* Command Pattern Demo Section */}
        <div className={`mb-8 p-6 rounded-xl border ${
          style === 'minimal' ? 'bg-gray-900/50 border-gray-800' :
          style === 'academic' ? 'bg-gray-50 border-gray-200' :
          'bg-white/50 border-gray-200'
        }`}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Terminal size={18} className="text-pink-400" />
            🧩 Command Pattern Demo - Execute / Undo / Redo
          </h3>
          <p className="text-sm opacity-70 mb-4">
            แคปซูลคำสั่ง (execute/undo) ให้เป็นอ็อบเจกต์เดียว ทำให้ยกเลิก/ทำซ้ำได้สะดวก ตัวอย่างนี้ใช้คำสั่ง Import ที่วิ่งผ่าน Adapter+Proxy
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Execute Sample Import via Command */}
            <button
              onClick={() => {
                const sample = {
                  id: `cmd-${Date.now().toString(36).slice(-5)}`,
                  name: 'Command Import Demo',
                  summary: 'Imported via Command → Adapter+Proxy',
                  year: new Date().getFullYear(),
                  tech_stack: ['Command', 'Adapter', 'Proxy']
                };
                const cmd = new ImportViaProxyCommand(
                  sample,
                  'project',
                  (updater) => setProjects(prev => updater(prev)),
                  (updater) => setBlogs(prev => updater(prev)),
                  (updater) => setResearch(prev => updater(prev))
                );
                commandManagerRef.current!.execute(cmd);
              }}
              className="p-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-lg transition-all text-left"
            >
              <div className="font-bold mb-1">▶️ Execute Import (Command)</div>
              <div className="text-xs opacity-90">Runs Adapter+Proxy via Import Command</div>
            </button>

            {/* Undo */}
            <button
              onClick={() => commandManagerRef.current!.undo()}
              className="p-4 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg hover:shadow-lg transition-all text-left flex items-center gap-2"
            >
              <Undo2 size={16} />
              <div>
                <div className="font-bold">Undo</div>
                <div className="text-xs opacity-90">Revert last executed command</div>
              </div>
            </button>

            {/* Redo */}
            <button
              onClick={() => commandManagerRef.current!.redo()}
              className="p-4 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all text-left flex items-center gap-2"
            >
              <Redo2 size={16} />
              <div>
                <div className="font-bold">Redo</div>
                <div className="text-xs opacity-90">Re-apply last undone command</div>
              </div>
            </button>
          </div>

          {/* Benefits Display */}
          <div className={`mt-4 p-4 rounded-lg ${
            style === 'minimal' ? 'bg-pink-500/5 border border-pink-500/20' :
            'bg-pink-50 border border-pink-200'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div>✅ แยกคำสั่งออกจาก UI (loosely coupled)</div>
              <div>✅ รองรับ undo/redo ด้วยสแต็ก</div>
              <div>✅ ขยายได้ง่าย เพิ่มคำสั่งใหม่</div>
              <div>✅ ทำงานร่วมกับ Adapter+Proxy ได้โปร่งใส</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700/20 text-xs opacity-60">
            💡 <strong>Pattern:</strong> Command encapsulates actions and supports undo/redo | 
            <strong> Roles:</strong> Invoker(CommandManager), Command(ImportViaProxyCommand), Receiver(Collections)
          </div>
        </div>

        {/* Mediator Pattern Demo Section */}
        <div className={`mb-8 p-6 rounded-xl border ${
          style === 'minimal' ? 'bg-gray-900/50 border-gray-800' :
          style === 'academic' ? 'bg-gray-50 border-gray-200' :
          'bg-white/50 border-gray-200'
        }`}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-fuchsia-400" />
            🧭 Mediator Pattern Demo - Centralized Coordination
          </h3>
          <p className="text-sm opacity-70 mb-4">
            รวมศูนย์การสื่อสารระหว่างส่วนต่างๆ ของ UI: เปลี่ยนธีม/โหมด, เปิดโมดอล, import ข้อมูล โดยไม่ให้คอมโพเนนต์คุยกันโดยตรง
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => mediatorRef.current?.notify('MediatorDemo', 'open-import')}
              className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all text-left"
            >
              <div className="font-bold mb-1">📦 Open Import (Mediator)</div>
              <div className="text-xs opacity-90">Open modal via mediator</div>
            </button>

            <button
              onClick={() => {
                const sample = {
                  id: `med-${Date.now().toString(36).slice(-5)}`,
                  name: 'Mediator Import Demo',
                  summary: 'Imported via Mediator → Adapter+Proxy',
                  year: new Date().getFullYear(),
                  tech_stack: ['Mediator', 'Adapter', 'Proxy']
                };
                mediatorRef.current?.notify('MediatorDemo', 'import-json', { json: sample, type: 'project' });
              }}
              className="p-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all text-left"
            >
              <div className="font-bold mb-1">⬇️ Import via Mediator</div>
              <div className="text-xs opacity-90">Mediator coordinates Adapter+Proxy and state</div>
            </button>

            <button
              onClick={() => mediatorRef.current?.notify('MediatorDemo', 'reset-iterator')}
              className="p-4 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all text-left"
            >
              <div className="font-bold mb-1">🔄 Reset Iterator (Mediator)</div>
              <div className="text-xs opacity-90">Resets DFS traversal centrally</div>
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700/20 text-xs opacity-60">
            💡 <strong>Pattern:</strong> Mediator centralizes communication to reduce coupling | 
            <strong> Roles:</strong> Mediator(UIMediator), Colleagues(controls, modal, commands)
          </div>
        </div>

        {/* Memento Pattern Demo Section */}
        <div className={`mb-8 p-6 rounded-xl border ${
          style === 'minimal' ? 'bg-gray-900/50 border-gray-800' :
          style === 'academic' ? 'bg-gray-50 border-gray-200' :
          'bg-white/50 border-gray-200'
        }`}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Shield size={18} className="text-amber-400" />
            🗂️ Memento Pattern Demo - Snapshot & Restore
          </h3>
          <p className="text-sm opacity-70 mb-4">
            บันทึก Snapshot ของสถานะ (projects/blogs/research + decorations) และกู้คืนย้อนหลัง โดยไม่เปิดเผยโครงสร้างภายใน
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Save Snapshot */}
            <button
              onClick={() => {
                const snap: PortfolioSnapshot = {
                  projects: toDTO(projects),
                  blogs: toDTO(blogs),
                  research: toDTO(research),
                  decorations: decorationsToDTO(itemDecorators as Record<string, ContentDecorator[]>)
                };
                const m = mementoOriginatorRef.current!.createMemento(snap, `Snapshot #${mementoHistoryRef.current!.size() + 1}`);
                mementoHistoryRef.current!.save(m);
                SessionLogger.getInstance().addLog(`Memento: Saved ${m.getName()} (history=${mementoHistoryRef.current!.size()})`);
              }}
              className="p-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg hover:shadow-lg transition-all text-left"
            >
              <div className="font-bold mb-1">💾 Save Snapshot</div>
              <div className="text-xs opacity-90">Push current state to history stack</div>
            </button>

            {/* Restore Last */}
            <button
              onClick={() => {
                // Check state before restoring
                if (!portfolioStateContextRef.current!.canRestore()) {
                  SessionLogger.getInstance().addLog(`❌ Restore blocked: Portfolio in ${portfolioStateContextRef.current!.getState().getName()} state`);
                  return;
                }
                if (!mementoHistoryRef.current!.canRestore()) {
                  SessionLogger.getInstance().addLog('Memento: No snapshot to restore');
                  return;
                }
                portfolioStateContextRef.current!.transitionToRestoring();
                try {
                  const m = mementoHistoryRef.current!.restoreLast();
                  if (!m) return;
                  const restored = mementoOriginatorRef.current!.restore(m);
                  const newProjects = fromDTO(restored.projects);
                  const newBlogs = fromDTO(restored.blogs);
                  const newResearch = fromDTO(restored.research);
                  setProjects(newProjects);
                  setBlogs(newBlogs);
                  setResearch(newResearch);
                  // rebuild decorators from DTO types
                  const allItems = [...newProjects, ...newBlogs, ...newResearch];
                  const newDecorators = rebuildDecorators(allItems, restored.decorations);
                  setItemDecorators(newDecorators);
                  SessionLogger.getInstance().addLog(`Memento: Restored ${m.getName()} (remaining=${mementoHistoryRef.current!.size()})`);
                } finally {
                  portfolioStateContextRef.current!.transitionToIdle();
                }
              }}
              className="p-4 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all text-left"
            >
              <div className="font-bold mb-1">↩️ Restore Last</div>
              <div className="text-xs opacity-90">Pop and apply last snapshot</div>
            </button>

            {/* Save + Demo Change */}
            <button
              onClick={() => {
                // Save snapshot first
                const snap: PortfolioSnapshot = {
                  projects: toDTO(projects),
                  blogs: toDTO(blogs),
                  research: toDTO(research),
                  decorations: decorationsToDTO(itemDecorators as Record<string, ContentDecorator[]>)
                };
                mementoHistoryRef.current!.save(
                  mementoOriginatorRef.current!.createMemento(snap, `Before Quick Import`)
                );
                // Make a change via Facade (or Mediator) to show restore later
                const facade = PortfolioFacade.getInstance();
                facade.setProjects(projects);
                facade.setBlogs(blogs);
                facade.setResearch(research);
                facade.importFromJSON({
                  id: `memento-${Date.now().toString(36).slice(-4)}`,
                  name: 'Snapshot Demo Item',
                  summary: 'Added after saving snapshot',
                  year: new Date().getFullYear(),
                  tech_stack: ['Memento']
                }, 'project');
                setProjects(facade.getProjects());
                SessionLogger.getInstance().addLog('Memento: Saved snapshot then imported an item (use Restore Last to undo)');
              }}
              className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all text-left"
            >
              <div className="font-bold mb-1">🧪 Save + Quick Import</div>
              <div className="text-xs opacity-90">Snapshot before change, then add an item</div>
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700/20 text-xs opacity-60">
            💡 <strong>Pattern:</strong> Memento stores state snapshots without exposing internals | 
            <strong> Roles:</strong> Originator(PortfolioStateOriginator), Memento(PortfolioMemento), Caretaker(HistoryCaretaker)
          </div>
        </div>

        {/* Facade Pattern Demo Section */}
        <div className={`mb-8 p-6 rounded-xl border ${
          style === 'minimal' ? 'bg-gray-900/50 border-gray-800' :
          style === 'academic' ? 'bg-gray-50 border-gray-200' :
          'bg-white/50 border-gray-200'
        }`}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Briefcase size={18} className="text-indigo-400" />
            🏢 Facade Pattern Demo - Simplified Interface
          </h3>
          <p className="text-sm opacity-70 mb-4">
            Unified Interface ที่ซ่อนความซับซ้อนของระบบ - ใช้งาน 7+ patterns ผ่าน methods เดียว
          </p>
          
          {/* Quick Actions via Facade */}
          <div className="space-y-3">
            <div className="text-sm font-semibold opacity-70 uppercase">Quick Actions (Powered by Facade)</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Action 1: Create Decorated Project */}
              <button
                onClick={() => {
                  const facade = PortfolioFacade.getInstance();
                  facade.setProjects(projects);
                  facade.setBlogs(blogs);
                  facade.setResearch(research);
                  facade.setDecorators(itemDecorators);
                  
                  const newItem = facade.createDecoratedItem(
                    'project',
                    'Quick Project via Facade',
                    'Created with Facade Pattern - automatic decorations!',
                    new Date().getFullYear().toString(),
                    ['Facade', 'Quick'],
                    ['Featured', 'Hot']
                  );
                  
                  setProjects(facade.getProjects());
                  setItemDecorators(prev => ({
                    ...prev,
                    [newItem.id]: facade.getDecorations(newItem.id).map(type => {
                      const decorators = prev[newItem.id] || [];
                      return decorators.find(d => d.decorationType === type) || new FeaturedDecorator(newItem);
                    })
                  }));
                }}
                className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all text-left"
              >
                <div className="font-bold mb-1">➕ Add Decorated Project</div>
                <div className="text-xs opacity-90">Creates project with Featured + Hot badges</div>
              </button>

              {/* Action 2: Import via Facade */}
              <button
                onClick={() => {
                  const facade = PortfolioFacade.getInstance();
                  facade.setProjects(projects);
                  facade.setBlogs(blogs);
                  facade.setResearch(research);
                  
                  const sampleData = {
                    name: 'Facade Import Demo',
                    summary: 'Imported via Facade Pattern',
                    year: 2024,
                    tech_stack: ['Facade', 'Adapter']
                  };
                  
                  facade.importFromJSON(sampleData, 'project');
                  setProjects(facade.getProjects());
                }}
                className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all text-left"
              >
                <div className="font-bold mb-1">📦 Import via Facade</div>
                <div className="text-xs opacity-90">Uses Adapter + adds to collection</div>
              </button>
            </div>

            {/* Benefits Display */}
            <div className={`p-4 rounded-lg ${
              style === 'minimal' ? 'bg-gray-800/30 border border-gray-700' :
              'bg-gray-100 border border-gray-300'
            }`}>
              <div className="text-xs font-semibold mb-2">🎯 What Facade Does:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div>✅ Hides complexity of 7+ patterns</div>
                <div>✅ Provides simple unified methods</div>
                <div>✅ Coordinates Singleton, Prototype, Adapter</div>
                <div>✅ Manages Decorator, Bridge, Composite</div>
                <div>✅ Automatic logging via Singleton</div>
                <div>✅ One-line complex operations</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700/20 text-xs opacity-60">
            💡 <strong>Pattern:</strong> Facade provides unified interface to subsystem | 
            <strong> Implementation:</strong> PortfolioFacade wraps 7+ design patterns
          </div>
        </div>

        {pageContent}
      </div>

      {/* --- SINGLETON LOG CONSOLE (Bottom Panel) --- */}
      <div className={`border-t p-4 transition-all duration-300 ${style === 'minimal' ? 'bg-[#000] border-gray-800' : 'bg-gray-900 border-gray-200 text-white'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-green-400 font-mono text-sm font-bold">
              <Activity size={16} />
              <span>SessionLogger (Singleton Instance)</span>
            </div>
            <button onClick={() => SessionLogger.getInstance().clearLogs()} className="text-xs text-gray-500 hover:text-white flex items-center gap-1">
              <X size={12} /> Clear Logs
            </button>
          </div>
          <div className="h-32 overflow-y-auto font-mono text-xs bg-black/50 p-2 rounded border border-white/10 shadow-inner">
            {isClient ? (
              <>
                {SessionLogger.getInstance().getLogs().map((log, idx) => (
                  <div key={idx} className="mb-1 text-gray-300 border-b border-white/5 pb-0.5 last:border-0">
                    <span className="text-green-500 mr-2">➜</span>
                    {log}
                  </div>
                ))}
                {SessionLogger.getInstance().getLogs().length === 0 && (
                  <div className="text-gray-600 italic">Waiting for user actions... (Try changing theme or cloning items)</div>
                )}
              </>
            ) : (
              <div className="text-gray-600 italic">Loading logs...</div>
            )}
          </div>
        </div>
      </div>

      {/* --- IMPORT MODAL (Adapter Pattern Demo) --- */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-2xl w-full shadow-2xl animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Upload size={20} className="text-purple-500" />
                Import External Data (Adapter + Proxy)
              </h2>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-400 mb-4">
              📦 Adapter Pattern แปลง External Data Format ให้เข้ากับ ContentItem ภายใน
            </p>

            {/* Type Selector */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Import As:</label>
              <div className="flex gap-2">
                {(['project', 'blog', 'research'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setImportType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                      importType === type 
                        ? 'bg-purple-500 text-white shadow-lg' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* JSON Input */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-300">JSON Data:</label>
                <button 
                  onClick={getSampleJSON}
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  Load Sample
                </button>
              </div>
              <textarea
                value={importJSON}
                onChange={(e) => setImportJSON(e.target.value)}
                placeholder={`Paste JSON data here...\n\nExample fields:\n- id, title, description, date, tags\n- post_id, headline, content, published_date, categories\n- project_id, name, summary, year, tech_stack`}
                className="w-full h-64 bg-black/50 text-gray-300 font-mono text-xs p-4 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImportData}
                disabled={!importJSON.trim()}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Upload size={16} />
                Import via Adapter+Proxy
              </button>
            </div>

            {/* Info Box */}
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300">
                💡 <strong>Tip:</strong> Adapter + Proxy จะ normalize/validate ข้อมูล และแปลงฟิลด์ต่างๆ ให้เข้ากับ ContentItem โดยอัตโนมัติ 
                (supports flexible field names like id/post_id/project_id, title/name/headline, etc.) พร้อม caching การ import ซ้ำ
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}