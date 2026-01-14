/**
 * ==========================================
 * FULL CREATIONAL PATTERNS DEMO
 * ==========================================
 * รวม 5 Design Patterns ที่สร้าง Objects อย่างไร้ปัญหา:
 * 1. Singleton - UserActivityLogger
 * 2. Prototype - Content Management (Article cloning)
 * 3. Factory Method - Layout System
 * 4. Abstract Factory - Theme & Style System
 * 5. Builder - Page Construction with Step-by-step Assembly
 */

// ==========================================
// 1️⃣ SINGLETON: User Activity Logger
// ==========================================
// Concept: Single Source of Truth - มี instance เดียวตลอดทั้ง app
// ประโยชน์: ประหยัด Memory, ไม่ต้อง new Object หลายครั้ง, shared state

interface ActivityData {
  timestamp: Date;
  action: string;
  details: string;
}

class UserActivityLogger {
  private static instance: UserActivityLogger;
  private logs: ActivityData[] = [];

  // Private constructor - ไม่อนุญาตให้ new จากนอก class
  private constructor() {}

  // Static method สำหรับ access instance
  public static getInstance(): UserActivityLogger {
    if (!UserActivityLogger.instance) {
      UserActivityLogger.instance = new UserActivityLogger();
    }
    return UserActivityLogger.instance;
  }

  public log(activity: ActivityData): void {
    this.logs.push(activity);
    console.log(`[LOG] ${activity.timestamp.toISOString()} - ${activity.action}`);
  }

  public getLogs(): ActivityData[] {
    return this.logs;
  }
}

// ==========================================
// 2️⃣ PROTOTYPE: Content Management System
// ==========================================
// Concept: Clone objects แทนที่จะ new ใหม่ทุกครั้ง
// ประโยชน์: ประหยัด resource, maintain default values, reduce duplication

interface IContentPrototype {
  clone(): IContentPrototype;
  setData(data: any): void;
  getInfo(): string;
}

class Article implements IContentPrototype {
  private title: string = "";
  private body: string = "";
  private author: string = "";

  public clone(): Article {
    const cloned = new Article();
    cloned.title = this.title;
    cloned.body = this.body;
    cloned.author = this.author;
    return cloned;
  }

  public setData(data: { title?: string; body?: string; author?: string }): void {
    if (data.title) this.title = data.title;
    if (data.body) this.body = data.body;
    if (data.author) this.author = data.author;
  }

  public getInfo(): string {
    return `Article: "${this.title}" by ${this.author}\n${this.body}`;
  }
}

/**
 * SCALE POINT 1: Content Types
 * สามารถเพิ่ม Concrete Class ได้เช่น:
 * - class Blog implements IContentPrototype { ... }
 * - class Documentation implements IContentPrototype { ... }
 * - class ProjectShowcase implements IContentPrototype { ... }
 */

// ==========================================
// 3️⃣ FACTORY METHOD: Layout System
// ==========================================
// Concept: Delegate object creation to subclasses
// ประโยชน์: decouple creation logic, easy to extend new layouts

interface ILayout {
  render(content: string): string;
}

class ListLayout implements ILayout {
  public render(content: string): string {
    return `📋 LIST LAYOUT:\n${content}\n${"=".repeat(50)}`;
  }
}

class GridLayout implements ILayout {
  public render(content: string): string {
    return `📊 GRID LAYOUT:\n${content}\n${"▬".repeat(50)}`;
  }
}

abstract class LayoutFactory {
  abstract createLayout(): ILayout;

  public renderContent(content: string): string {
    const layout = this.createLayout();
    return layout.render(content);
  }
}

class ListLayoutFactory extends LayoutFactory {
  public createLayout(): ILayout {
    return new ListLayout();
  }
}

class GridLayoutFactory extends LayoutFactory {
  public createLayout(): ILayout {
    return new GridLayout();
  }
}

/**
 * SCALE POINT 2: Layout Types
 * สามารถเพิ่ม Layout Class ได้เช่น:
 * - class TimelineLayout implements ILayout { ... }
 * - class MasonryLayout implements ILayout { ... }
 * - class CardLayout implements ILayout { ... }
 */

// ==========================================
// 4️⃣ ABSTRACT FACTORY: Theme & Style System
// ==========================================
// Concept: Create families of related objects
// ประโยชน์: consistent styling, easy theme switching (Light/Dark/Custom)

interface IFont {
  getFontFamily(): string;
  getFontSize(): number;
}

interface IColor {
  getPrimaryColor(): string;
  getSecondaryColor(): string;
}

// Minimal Theme
class MinimalFont implements IFont {
  public getFontFamily(): string {
    return "Arial, sans-serif";
  }
  public getFontSize(): number {
    return 14;
  }
}

class MinimalColor implements IColor {
  public getPrimaryColor(): string {
    return "#000000";
  }
  public getSecondaryColor(): string {
    return "#FFFFFF";
  }
}

interface IThemeFactory {
  createFont(): IFont;
  createColorPalette(): IColor;
}

class MinimalThemeFactory implements IThemeFactory {
  public createFont(): IFont {
    return new MinimalFont();
  }
  public createColorPalette(): IColor {
    return new MinimalColor();
  }
}

/**
 * SCALE POINT 3: Theme Variants
 * สามารถเพิ่ม Theme Factory ได้เช่น:
 * - class FutureThemeFactory (Cyberpunk/Modern)
 * - class RetroThemeFactory (Vintage/Pixel)
 * - class NatureThemeFactory (Organic/Wellness)
 */

// ==========================================
// 5️⃣ BUILDER: Page Construction
// ==========================================
// Concept: Separate construction from representation
// ประโยชน์: step-by-step building, flexible combinations, readable code

class WebPage {
  public content: IContentPrototype | null = null;
  public layout: ILayout | null = null;
  public themeFont: IFont | null = null;
  public themeColor: IColor | null = null;

  public render(): string {
    if (!this.content || !this.layout) {
      return "[Error] Incomplete page configuration";
    }

    // const contentStr = this.content instanceof Article ? this.content.getInfo() : "";
    const contentStr = this.content.getInfo();
    const rendered = this.layout.render(contentStr);

    const cssStyle = `Font: ${this.themeFont?.getFontFamily() || "default"} | Color: ${this.themeColor?.getPrimaryColor() || "default"}`;

    return `${rendered}\n🎨 Theme: ${cssStyle}`;
  }
}

interface IPageBuilder {
  reset(): IPageBuilder;
  buildContent(content: IContentPrototype): IPageBuilder;
  buildLayout(factory: LayoutFactory): IPageBuilder;
  buildTheme(themeFactory: IThemeFactory): IPageBuilder;
  getResult(): WebPage;
}

class PersonalPageBuilder implements IPageBuilder {
  private page: WebPage = new WebPage();

  public reset(): IPageBuilder {
    this.page = new WebPage();
    return this;
  }

  public buildContent(content: IContentPrototype): IPageBuilder {
    this.page.content = content;
    return this;
  }

  public buildLayout(factory: LayoutFactory): IPageBuilder {
    this.page.layout = factory.createLayout();
    return this;
  }

  public buildTheme(themeFactory: IThemeFactory): IPageBuilder {
    this.page.themeFont = themeFactory.createFont();
    this.page.themeColor = themeFactory.createColorPalette();
    return this;
  }

  public getResult(): WebPage {
    return this.page;
  }
}

// ==========================================
// 🎯 CLIENT DIRECTOR: Orchestrate all patterns
// ==========================================

class ClientDirector {
  private builder: IPageBuilder;
  private logger: UserActivityLogger;

  constructor(builder: IPageBuilder) {
    this.builder = builder;
    this.logger = UserActivityLogger.getInstance();
  }

  public constructArticlePage(
    title: string,
    body: string,
    author: string,
    layoutFactory: LayoutFactory,
    themeFactory: IThemeFactory
  ): WebPage {
    // Log activity using Singleton
    this.logger.log({
      timestamp: new Date(),
      action: "Page Construction Started",
      details: `Constructing page for article: ${title}`
    });

    // Create content using Prototype
    const prototype = new Article();
    prototype.setData({ title, body, author });
    const content = prototype.clone();

    // Build page using Builder (with Factory Method + Abstract Factory)
    const page = this.builder
      .reset()
      .buildContent(content)
      .buildLayout(layoutFactory)
      .buildTheme(themeFactory)
      .getResult();

    // Log completion
    this.logger.log({
      timestamp: new Date(),
      action: "Page Construction Completed",
      details: `Page ready with ${layoutFactory.constructor.name}`
    });

    return page;
  }
}

// ==========================================
// 🚀 DEMO EXECUTION
// ==========================================

console.log("╔════════════════════════════════════════════════════════════╗");
console.log("║         FULL CREATIONAL PATTERNS INTEGRATION DEMO          ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");

// Initialize Builder
const builder = new PersonalPageBuilder();
const director = new ClientDirector(builder);

// PAGE 1: Article with List Layout + Minimal Theme
console.log("\n📄 PAGE 1: List Layout");
const page1 = director.constructArticlePage(
  "Design Patterns Explained",
  "Creational patterns are used to create objects in a manner suitable to the situation.",
  "John Doe",
  new ListLayoutFactory(),
  new MinimalThemeFactory()
);
console.log(page1.render());

// PAGE 2: Article with Grid Layout + Minimal Theme
console.log("\n\n📄 PAGE 2: Grid Layout");
const page2 = director.constructArticlePage(
  "TypeScript Best Practices",
  "Use strict typing, interfaces, and avoid any type for better code safety.",
  "Jane Smith",
  new GridLayoutFactory(),
  new MinimalThemeFactory()
);
console.log(page2.render());

// PAGE 3: Clone Article for reuse
console.log("\n\n📄 PAGE 3: Cloned Article (Prototype Pattern)");
const prototype = new Article();
prototype.setData({
  title: "Singleton Benefits",
  body: "Singleton ensures a class has only one instance with global access.",
  author: "Mike Johnson"
});

const clonedArticle = prototype.clone();
clonedArticle.setData({
  title: "Modified: " + "Singleton Benefits",
  author: "Modified by: Admin"
});

const page3 = builder
  .reset()
  .buildContent(clonedArticle)
  .buildLayout(new ListLayoutFactory())
  .buildTheme(new MinimalThemeFactory())
  .getResult();
console.log(page3.render());

// Display Singleton Activity Logs
console.log("\n\n📊 ACTIVITY LOG (Singleton Pattern):");
console.log("─".repeat(60));
const logger = UserActivityLogger.getInstance();
const logs = logger.getLogs();
logs.forEach((log, index) => {
  console.log(`${index + 1}. [${log.action}] ${log.details}`);
});

console.log("\n" + "═".repeat(60));
console.log("✅ All Design Patterns Working Together Successfully!");
console.log("═".repeat(60));

/**
 * SUMMARY OF PATTERNS USED:
 * 
 * 1️⃣  SINGLETON (UserActivityLogger)
 *     └─ Single instance logs all page creations
 *
 * 2️⃣  PROTOTYPE (Article)
 *     └─ Clone articles instead of creating new instances
 *
 * 3️⃣  FACTORY METHOD (ListLayoutFactory, GridLayoutFactory)
 *     └─ Delegate layout creation to specific factories
 *
 * 4️⃣  ABSTRACT FACTORY (MinimalThemeFactory)
 *     └─ Create related Font + Color families together
 *
 * 5️⃣  BUILDER (PersonalPageBuilder)
 *     └─ Step-by-step page construction with fluent API
 *
 * This architecture is highly scalable and maintainable!
 */
