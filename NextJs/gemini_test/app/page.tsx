"use client"
import React, { useState, useEffect, useReducer } from 'react';
import { Book, Code, PenTool, Layout, Terminal, ExternalLink, User, FileText, Cpu, Layers, Feather, GraduationCap, Briefcase, Copy, Plus, Activity, X } from 'lucide-react';

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
    this.listeners.forEach(listener => listener());
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

    const newId = Math.random().toString(36).substr(2, 9);
    return new ContentItem(newId, `${this.title} (Copy)`, this.description, this.date, [...this.tags]);
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
      <h1 className="text-2xl font-bold mb-2">$ echo "{title}"</h1>
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
}

const ListLayout: React.FC<SectionProps> = ({ title, items, theme, icon: Icon, onCloneItem }) => (
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
          <div>{item.tags.map(t => <theme.Tag key={t} label={t} />)}</div>
        </theme.CardWrapper>
      ))}
    </div>
  </theme.SectionWrapper>
);

const GridLayout: React.FC<SectionProps> = ({ title, items, theme, icon: Icon, onCloneItem }) => (
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
          <div className="flex flex-wrap gap-1">{item.tags.map(t => <theme.Tag key={t} label={t} />)}</div>
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

  // Data State
  const [projects, setProjects] = useState<ContentItem[]>(initialProjects);
  const [research, setResearch] = useState<ContentItem[]>(initialResearch);
  const [blogs, setBlogs] = useState<ContentItem[]>(initialBlogs);

  // Singleton State (For UI Rendering)
  // ใช้ useReducer เพื่อ force update เมื่อ Singleton มีการเปลี่ยนแปลง
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    // Subscribe to Singleton changes
    const unsubscribe = SessionLogger.getInstance().subscribe(() => {
      forceUpdate();
    });
    return () => unsubscribe();
  }, []);

  // Handlers logging via Singleton
  const handleStyleChange = (newStyle: LayoutStyle) => {
    SessionLogger.getInstance().addLog(`Abstract Factory: Switched theme to "${newStyle}"`);
    setStyle(newStyle);
  };

  const handlePersonaChange = (newPersona: UserPersona) => {
    SessionLogger.getInstance().addLog(`Builder: Rebuilt page for "${newPersona}" persona`);
    setPersona(newPersona);
  };

  const handleCloneItem = (item: ContentItem) => {
    // Note: The Log is added inside item.clone() as well, demonstrating Prototype responsibility
    const clonedItem = item.clone();

    if (projects.find(p => p.id === item.id)) {
      setProjects([clonedItem, ...projects]);
    } else if (research.find(r => r.id === item.id)) {
      setResearch([clonedItem, ...research]);
    } else if (blogs.find(b => b.id === item.id)) {
      setBlogs([clonedItem, ...blogs]);
    }
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

  // --- Page Construction (Builder) ---
  const builder = new PortfolioPageBuilder();
  const theme = getTheme(style);

  builder.reset();
  builder.setTheme(theme, style);
  builder.setCloneHandler(handleCloneItem);

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
            {SessionLogger.getInstance().getLogs().map((log, idx) => (
              <div key={idx} className="mb-1 text-gray-300 border-b border-white/5 pb-0.5 last:border-0">
                <span className="text-green-500 mr-2">➜</span>
                {log}
              </div>
            ))}
            {SessionLogger.getInstance().getLogs().length === 0 && (
              <div className="text-gray-600 italic">Waiting for user actions... (Try changing theme or cloning items)</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}