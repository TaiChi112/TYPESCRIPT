# 🌉 Bridge Pattern - การประยุกต์ใช้งาน

## 📖 Introduction

**Bridge Pattern** เป็น Structural Design Pattern ที่แยก **Abstraction (สิ่งที่ต้องการ)** ออกจาก **Implementation (วิธีการทำ)** ให้ทั้ง 2 ส่วนสามารถเปลี่ยนแปลงได้อิสระจากกันโดยไม่ต้องขึ้นต่อกัน

**คำกล่าวที่มีชื่อเสียง:**
> "Decouple an abstraction from its implementation so that the two can vary independently." - Gang of Four

---

## 🎯 ปัญหาที่แก้ไข

### สถานการณ์จริง
คุณมี Portfolio Website ที่แสดง **ContentItem** 3 ประเภท:
1. **Projects** 🚀
2. **Blogs** 📰
3. **Research Papers** 📚

และต้องการให้แต่ละประเภทสามารถแสดงผลได้ **3 รูปแบบ**:
1. **Preview Mode** 👁️ - แสดงแบบสั้นๆ (title + จำนวน tags)
2. **Full Mode** 📄 - แสดงแบบเต็ม (title + description + tag pills)
3. **Compact Mode** 📦 - แสดงแบบกระชับ (title + 2 tags แรก)

---

### ❌ ปัญหาถ้าไม่ใช้ Bridge Pattern

#### Approach 1: Inheritance Explosion
```typescript
// ต้องสร้าง class จำนวน: 3 types × 3 modes = 9 classes!
class ProjectPreviewRenderer { ... }
class ProjectFullRenderer { ... }
class ProjectCompactRenderer { ... }
class BlogPreviewRenderer { ... }
class BlogFullRenderer { ... }
class BlogCompactRenderer { ... }
class ResearchPreviewRenderer { ... }
class ResearchFullRenderer { ... }
class ResearchCompactRenderer { ... }
```

**ปัญหา:**
- 📈 **Combinatorial Explosion** - ถ้าเพิ่ม type ใหม่ ต้องสร้าง 3 classes
- 📈 **Scalability Issue** - ถ้าเพิ่ม mode ใหม่ ต้องสร้าง 3 classes
- 🔁 **Code Duplication** - logic เหมือนกันซ้ำกันหลาย classes
- 🐛 **Maintenance Hell** - แก้ไข 1 feature ต้องแก้ทุก class

---

#### Approach 2: Switch Statement Hell
```typescript
class ContentRenderer {
  render(item: ContentItem, type: string, mode: string) {
    if (type === 'project') {
      if (mode === 'preview') { /* ... */ }
      else if (mode === 'full') { /* ... */ }
      else if (mode === 'compact') { /* ... */ }
    } else if (type === 'blog') {
      if (mode === 'preview') { /* ... */ }
      // ... nested if-else hell
    }
    // ต่อไปเรื่อยๆ
  }
}
```

**ปัญหา:**
- ❌ **Violates OCP** - ต้องแก้ไข render() ทุกครั้งที่เพิ่ม type/mode
- ❌ **Violates SRP** - render() รับผิดชอบหลายอย่าง
- ❌ **Hard to Test** - ต้อง test ทุก combinations
- ❌ **Readability** - code ยาวและซับซ้อน

---

## ✅ Solution: Bridge Pattern

แยก **2 Dimensions** ให้เป็นอิสระ:

1. **Abstraction (What to Render)** → ContentRenderer hierarchy
   - ProjectRenderer
   - BlogRenderer
   - ResearchRenderer

2. **Implementation (How to Render)** → RenderStrategy hierarchy
   - PreviewRenderStrategy
   - FullRenderStrategy
   - CompactRenderStrategy

**ผลลัพธ์:** Total classes = **3 + 3 = 6 classes** (แทนที่จะเป็น 9)

---

## 🏗️ Structure

### 📐 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│           Abstraction Hierarchy                  │
│  (What to Render - ContentRenderer)             │
│                                                  │
│  ┌────────────┐  ┌────────────┐  ┌─────────────┐│
│  │  Project   │  │    Blog    │  │  Research   ││
│  │  Renderer  │  │  Renderer  │  │  Renderer   ││
│  └─────┬──────┘  └─────┬──────┘  └──────┬──────┘│
│        │               │                 │       │
│        └───────────────┴─────────────────┘       │
│                        │                         │
│                        │ Bridge                  │
│                        ↓                         │
│        ┌───────────────────────────┐             │
│        │   IRenderStrategy         │             │
│        │   (Interface)             │             │
│        └───────────┬───────────────┘             │
│                    │                             │
│     ┌──────────────┼──────────────┐              │
│     │              │               │             │
│ ┌───▼────┐   ┌────▼─────┐   ┌────▼─────┐        │
│ │Preview │   │   Full   │   │ Compact  │        │
│ │Strategy│   │ Strategy │   │ Strategy │        │
│ └────────┘   └──────────┘   └──────────┘        │
│                                                  │
│       Implementation Hierarchy                   │
│       (How to Render - RenderStrategy)          │
└─────────────────────────────────────────────────┘
```

---

## 🧩 Components Breakdown

### 1️⃣ **Implementor (IRenderStrategy)**
Interface ที่กำหนดวิธีการ render

```typescript
interface IRenderStrategy {
  renderTitle(title: string): React.ReactNode;
  renderDescription(description: string): React.ReactNode;
  renderMeta(date: string, tags: string[]): React.ReactNode;
}
```

**หน้าที่:**
- กำหนด contract สำหรับ rendering methods
- แยก rendering logic ออกจาก content logic
- ทำให้สามารถเปลี่ยน rendering style ได้

---

### 2️⃣ **Concrete Implementors**

#### 👁️ PreviewRenderStrategy
```typescript
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
```

**ลักษณะเด่น:**
- 📏 **Title:** ขนาดกลาง (text-base) + truncate
- 📄 **Description:** แสดง 1 บรรทัด (line-clamp-1)
- 🏷️ **Tags:** แสดงแค่จำนวน tags ไม่แสดงชื่อ

**Use Case:** Dashboard overview, List view, Quick scan

---

#### 📄 FullRenderStrategy
```typescript
class FullRenderStrategy implements IRenderStrategy {
  renderTitle(title: string): React.ReactNode {
    return <h3 className="font-bold text-xl mb-2">{title}</h3>;
  }

  renderDescription(description: string): React.ReactNode {
    return (
      <p className="text-sm opacity-80 leading-relaxed mb-3">
        {description}
      </p>
    );
  }

  renderMeta(date: string, tags: string[]): React.ReactNode {
    return (
      <div className="space-y-2">
        <div className="text-xs opacity-60">
          <span className="font-mono">{date}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, idx) => (
            <span 
              key={idx} 
              className="px-2 py-0.5 bg-blue-500/10 text-blue-400 
                         text-xs rounded border border-blue-500/30"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  }
}
```

**ลักษณะเด่น:**
- 📏 **Title:** ขนาดใหญ่ (text-xl)
- 📄 **Description:** แสดงเต็ม (leading-relaxed)
- 🏷️ **Tags:** แสดง tag pills แบบสวยงาม

**Use Case:** Detail page, Full article view, In-depth reading

---

#### 📦 CompactRenderStrategy
```typescript
class CompactRenderStrategy implements IRenderStrategy {
  renderTitle(title: string): React.ReactNode {
    return <span className="font-semibold text-sm">{title}</span>;
  }

  renderDescription(): React.ReactNode {
    return null; // ไม่แสดง
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
```

**ลักษณะเด่น:**
- 📏 **Title:** ขนาดเล็ก (text-sm)
- 📄 **Description:** ไม่แสดง (return null)
- 🏷️ **Tags:** แสดงแค่ 2 tags + count

**Use Case:** Mobile view, Sidebar list, Space-constrained UI

---

### 3️⃣ **Abstraction (ContentRenderer)**

```typescript
abstract class ContentRenderer {
  protected strategy: IRenderStrategy;

  constructor(strategy: IRenderStrategy) {
    this.strategy = strategy;
  }

  // Bridge: เปลี่ยน Strategy runtime ได้
  setStrategy(strategy: IRenderStrategy): void {
    this.strategy = strategy;
    SessionLogger.getInstance().addLog(
      `Bridge Pattern: Changed render strategy to ${strategy.constructor.name}`
    );
  }

  // Template Method ให้ subclass implement
  abstract render(item: ContentItem): React.ReactNode;
}
```

**Key Points:**
- ✅ **Composition over Inheritance** - "มี" Strategy แทนที่จะ "เป็น" Strategy
- ✅ **Dynamic Behavior** - `setStrategy()` เปลี่ยนได้ runtime
- ✅ **Template Method** - `render()` เป็น framework ให้ subclass implement
- ✅ **Encapsulation** - `strategy` เป็น protected ใช้ได้แค่ใน subclass

---

### 4️⃣ **Refined Abstractions**

#### 🚀 ProjectRenderer
```typescript
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
```

**Identity:**
- 🎨 **Color:** Blue theme
- 🔷 **Icon:** Code icon (programming)
- 📦 **Border:** Left border accent

---

#### 📰 BlogRenderer
```typescript
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
```

**Identity:**
- 🎨 **Color:** Purple theme
- 🪶 **Icon:** Feather icon (writing)
- 📦 **Border:** Left border accent

---

#### 📚 ResearchRenderer
```typescript
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
```

**Identity:**
- 🎨 **Color:** Green theme
- 📖 **Icon:** Book icon (academic)
- 📦 **Border:** Left border accent

---

## 🎮 การใช้งาน (Client Code)

### State Management
```typescript
// Bridge Pattern State
const [renderMode, setRenderMode] = useState<RenderMode>('full');

// Handler
const handleRenderModeChange = (newMode: RenderMode) => {
  SessionLogger.getInstance().addLog(
    `Bridge Pattern: Changed render mode to "${newMode}"`
  );
  setRenderMode(newMode);
};
```

---

### Get Strategy Helper
```typescript
const getRenderStrategy = (mode: RenderMode): IRenderStrategy => {
  switch (mode) {
    case 'preview': return new PreviewRenderStrategy();
    case 'full': return new FullRenderStrategy();
    case 'compact': return new CompactRenderStrategy();
    default: return new FullRenderStrategy();
  }
};
```

**Design Note:** Factory Method pattern สำหรับสร้าง Strategy

---

### Render with Bridge
```typescript
const renderWithBridge = (
  item: ContentItem, 
  type: 'project' | 'blog' | 'research'
): React.ReactNode => {
  // 1. Get Strategy based on current mode
  const strategy = getRenderStrategy(renderMode);
  
  // 2. Create Renderer with Strategy
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

  // 3. Render item
  return renderer.render(item);
};
```

---

### UI Implementation
```tsx
{/* Render Mode Toggle */}
<div className="bg-white/10 backdrop-blur-md p-1 rounded-full">
  {(['preview', 'full', 'compact'] as RenderMode[]).map(mode => (
    <button 
      key={mode} 
      onClick={() => handleRenderModeChange(mode)} 
      className={`px-3 py-1 text-xs rounded-full capitalize ${
        renderMode === mode 
          ? 'bg-green-500 text-white font-bold' 
          : 'text-gray-500'
      }`}
    >
      {mode === 'preview' && '👁️'} 
      {mode === 'full' && '📄'} 
      {mode === 'compact' && '📦'} 
      {mode}
    </button>
  ))}
</div>

{/* Bridge Pattern Demo */}
<div className="grid grid-cols-3 gap-4">
  <div>
    <h4>Project (Blue)</h4>
    {renderWithBridge(projects[0], 'project')}
  </div>
  <div>
    <h4>Blog (Purple)</h4>
    {renderWithBridge(blogs[0], 'blog')}
  </div>
  <div>
    <h4>Research (Green)</h4>
    {renderWithBridge(research[0], 'research')}
  </div>
</div>
```

---

## 🔄 Workflow

### User Flow
```
[User คลิก "Preview" button]
  ↓
[handleRenderModeChange('preview')]
  ↓
[setRenderMode('preview')]
  ↓
[Component Re-render]
  ↓
[getRenderStrategy('preview')]
  ↓
[new PreviewRenderStrategy()]
  ↓
[new ProjectRenderer(strategy)]
  ↓
[renderer.render(item)]
  ↓
[strategy.renderTitle(...)]
[strategy.renderDescription(...)]
[strategy.renderMeta(...)]
  ↓
[แสดงผลแบบ Preview Mode]
  ↓
[SessionLogger.addLog("Changed to preview")]
```

---

## ✅ Design Principles Applied

### 1. **Open/Closed Principle (OCP)**

#### ✅ เพิ่ม Strategy ใหม่
```typescript
// ไม่ต้องแก้ ContentRenderer classes
class DetailedRenderStrategy implements IRenderStrategy {
  renderTitle(title: string): React.ReactNode {
    return <h2 className="text-3xl font-bold">{title}</h2>;
  }
  // ... implement interface
}

// ใช้ได้ทันที
const strategy = new DetailedRenderStrategy();
const renderer = new ProjectRenderer(strategy);
```

---

#### ✅ เพิ่ม Content Type ใหม่
```typescript
// ไม่ต้องแก้ RenderStrategy classes
class ArticleRenderer extends ContentRenderer {
  render(item: ContentItem): React.ReactNode {
    return (
      <div className="border-l-4 border-orange-500">
        <Newspaper size={14} />
        {this.strategy.renderTitle(item.title)}
        {this.strategy.renderDescription(item.description)}
        {this.strategy.renderMeta(item.date, item.tags)}
      </div>
    );
  }
}
```

---

### 2. **Single Responsibility Principle (SRP)**

| Class | Responsibility |
|-------|---------------|
| **PreviewRenderStrategy** | วิธีการ render แบบ preview เท่านั้น |
| **FullRenderStrategy** | วิธีการ render แบบ full เท่านั้น |
| **CompactRenderStrategy** | วิธีการ render แบบ compact เท่านั้น |
| **ProjectRenderer** | เลือก style สำหรับ project เท่านั้น |
| **BlogRenderer** | เลือก style สำหรับ blog เท่านั้น |
| **ResearchRenderer** | เลือก style สำหรับ research เท่านั้น |

---

### 3. **Dependency Inversion Principle (DIP)**

```typescript
// ✅ Good: Depend on abstraction
class ContentRenderer {
  protected strategy: IRenderStrategy; // Interface
}

// ❌ Bad: Depend on concretion
class ContentRenderer {
  protected strategy: FullRenderStrategy; // Concrete class
}
```

---

### 4. **Composition over Inheritance**

```typescript
// ✅ Bridge Pattern (Composition)
class ProjectRenderer extends ContentRenderer {
  // "มี" Strategy (has-a)
  protected strategy: IRenderStrategy;
}

// ❌ Without Bridge (Inheritance)
class ProjectFullRenderer extends FullRenderer {
  // "เป็น" FullRenderer (is-a)
}
class ProjectPreviewRenderer extends PreviewRenderer {
  // "เป็น" PreviewRenderer (is-a)
}
```

---

## 🔗 Integration with Other Patterns

### 1. **Singleton** (SessionLogger)
```typescript
setStrategy(strategy: IRenderStrategy): void {
  this.strategy = strategy;
  // Log to Singleton
  SessionLogger.getInstance().addLog(
    `Bridge Pattern: Changed render strategy`
  );
}
```

---

### 2. **Prototype** (ContentItem)
```typescript
// Bridge render Prototype objects
const renderWithBridge = (item: ContentItem, type) => {
  const renderer = createRenderer(type);
  return renderer.render(item); // item จาก Prototype
};
```

---

### 3. **Factory Method** (Strategy Creation)
```typescript
// Factory Method สำหรับสร้าง Strategy
const getRenderStrategy = (mode: RenderMode): IRenderStrategy => {
  switch (mode) {
    case 'preview': return new PreviewRenderStrategy();
    case 'full': return new FullRenderStrategy();
    case 'compact': return new CompactRenderStrategy();
  }
};
```

---

### 4. **Abstract Factory** (Theme System)
```typescript
// Renderer ใช้ theme colors จาก Abstract Factory
const theme = getTheme(style); // MinimalTheme/CreativeTheme/AcademicTheme

// Apply theme colors to renderer
<div className={theme.cardBackground}>
  {renderWithBridge(item, type)}
</div>
```

---

### 5. **Adapter** (Import Data)
```typescript
// Imported data (via Adapter) render ผ่าน Bridge
const handleImportData = () => {
  const adapter = new JSONContentAdapter(jsonData, type);
  const contentItem = adapter.adapt();
  
  // Render ผ่าน Bridge
  renderWithBridge(contentItem, type);
};
```

---

## 📊 Comparison Table

| Aspect | Without Bridge | With Bridge |
|--------|----------------|-------------|
| **Classes** | 9 (3×3) | 6 (3+3) |
| **Add Type** | +3 classes | +1 class |
| **Add Strategy** | +3 classes | +1 class |
| **Code Duplication** | High | Low |
| **Flexibility** | Low | High |
| **Maintainability** | Hard | Easy |
| **Testability** | Complex | Simple |
| **Runtime Change** | ❌ | ✅ |

---

## 🧪 Testing Scenarios

### ✅ Test Case 1: Switch Render Mode
**Input:**
1. User อยู่ที่ Full Mode
2. คลิกปุ่ม "Preview"

**Expected:**
- ✅ `renderMode` state เปลี่ยนเป็น 'preview'
- ✅ ทุก ContentItem render ด้วย PreviewRenderStrategy
- ✅ Title truncate, Description 1 line, Tags แสดงจำนวน
- ✅ SessionLogger บันทึก "Changed render mode to preview"
- ✅ UI update ทันทีโดยไม่ reload page

---

### ✅ Test Case 2: Different Types, Same Strategy
**Input:** Render mode = 'compact'

**Expected:**
- ✅ ProjectRenderer ใช้ CompactRenderStrategy
- ✅ BlogRenderer ใช้ CompactRenderStrategy
- ✅ ResearchRenderer ใช้ CompactRenderStrategy
- ✅ แต่ละ type มี border color ต่างกัน (Blue/Purple/Green)
- ✅ แต่ละ type มี icon ต่างกัน (Code/Feather/Book)

---

### ✅ Test Case 3: Add New Strategy
**Input:** เพิ่ม `AnimatedRenderStrategy`

```typescript
class AnimatedRenderStrategy implements IRenderStrategy {
  renderTitle(title: string): React.ReactNode {
    return (
      <motion.h3 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {title}
      </motion.h3>
    );
  }
  // ... implement interface
}
```

**Expected:**
- ✅ ไม่ต้องแก้ ProjectRenderer, BlogRenderer, ResearchRenderer
- ✅ เพิ่มใน `getRenderStrategy()` switch statement
- ✅ เพิ่ม 'animated' ใน RenderMode type
- ✅ ใช้งานได้ทันที

---

### ✅ Test Case 4: Add New Content Type
**Input:** เพิ่ม `VideoRenderer`

```typescript
class VideoRenderer extends ContentRenderer {
  render(item: ContentItem): React.ReactNode {
    return (
      <div className="border-l-4 border-red-500">
        <Video size={14} className="text-red-400" />
        {this.strategy.renderTitle(item.title)}
        {this.strategy.renderDescription(item.description)}
        {this.strategy.renderMeta(item.date, item.tags)}
      </div>
    );
  }
}
```

**Expected:**
- ✅ ไม่ต้องแก้ RenderStrategy classes
- ✅ สามารถใช้ Strategy ทั้งหมด (Preview/Full/Compact)
- ✅ เพิ่มใน `renderWithBridge()` switch statement

---

## 📊 Benefits & Trade-offs

### ✅ Pros

| Benefit | Description | Example |
|---------|-------------|---------|
| **Decoupling** 🔓 | Abstraction แยกจาก Implementation | เปลี่ยน Strategy ไม่กระทบ Renderer |
| **Scalability** 📈 | Linear growth แทน exponential | 3+3 แทน 3×3 |
| **Flexibility** 🔄 | เปลี่ยน Strategy runtime ได้ | `setStrategy()` |
| **Maintainability** 🛠️ | แก้ไข 1 Strategy กระทบทุก Renderer | Fix once, apply everywhere |
| **Testability** ✅ | Test แยกได้ชัดเจน | Test Strategy แยกจาก Renderer |
| **Code Reuse** ♻️ | Strategy ใช้ร่วมกันได้ | PreviewStrategy ใช้กับทุก type |
| **Open/Closed** 🎯 | เพิ่ม dimension ใหม่ง่าย | Add without modify |

---

### ⚠️ Cons

| Issue | Impact | Mitigation |
|-------|--------|------------|
| **Complexity** | เพิ่ม classes/interfaces | ใช้เมื่อมี 2+ dimensions |
| **Indirection** | เพิ่ม layer ระหว่าง client-logic | Document clearly |
| **Memory** | สร้าง Strategy objects | Cache หรือ use Flyweight |
| **Learning Curve** | ยากกว่า simple if-else | เหมาะกับ team ที่รู้จัก patterns |
| **Over-engineering** | อาจซับซ้อนเกินไปถ้า variation น้อย | ใช้เมื่อจำเป็น |

---

## 🚀 Advanced Features (Future)

### 1. **Lazy Strategy Loading**
```typescript
const strategies = {
  preview: () => import('./PreviewStrategy'),
  full: () => import('./FullStrategy'),
  compact: () => import('./CompactStrategy')
};

const getRenderStrategy = async (mode: RenderMode) => {
  const StrategyClass = await strategies[mode]();
  return new StrategyClass.default();
};
```

---

### 2. **Strategy Caching**
```typescript
class StrategyCacheManager {
  private cache = new Map<RenderMode, IRenderStrategy>();

  getStrategy(mode: RenderMode): IRenderStrategy {
    if (!this.cache.has(mode)) {
      this.cache.set(mode, this.createStrategy(mode));
    }
    return this.cache.get(mode)!;
  }

  private createStrategy(mode: RenderMode): IRenderStrategy {
    switch (mode) {
      case 'preview': return new PreviewRenderStrategy();
      case 'full': return new FullRenderStrategy();
      case 'compact': return new CompactRenderStrategy();
    }
  }
}
```

---

### 3. **Responsive Strategy**
```typescript
const useResponsiveStrategy = (): IRenderStrategy => {
  const [windowWidth] = useWindowSize();

  if (windowWidth < 640) return new CompactRenderStrategy();
  if (windowWidth < 1024) return new PreviewRenderStrategy();
  return new FullRenderStrategy();
};

// ใช้งาน
const strategy = useResponsiveStrategy();
const renderer = new ProjectRenderer(strategy);
```

---

### 4. **Theme-based Strategy**
```typescript
const getStrategyForTheme = (
  theme: LayoutStyle, 
  mode: RenderMode
): IRenderStrategy => {
  if (theme === 'minimal') {
    return new MinimalPreviewStrategy();
  } else if (theme === 'creative') {
    return new CreativeFullStrategy();
  }
  return new FullRenderStrategy();
};
```

---

### 5. **Strategy Pipeline**
```typescript
class StrategyPipeline implements IRenderStrategy {
  private strategies: IRenderStrategy[] = [];

  addStrategy(strategy: IRenderStrategy): this {
    this.strategies.push(strategy);
    return this;
  }

  renderTitle(title: string): React.ReactNode {
    return this.strategies.reduce(
      (result, strategy) => strategy.renderTitle(title),
      title
    );
  }
}

// ใช้งาน
const pipeline = new StrategyPipeline()
  .addStrategy(new SanitizeStrategy())
  .addStrategy(new HighlightStrategy())
  .addStrategy(new FullRenderStrategy());
```

---

## 🎓 When to Use

### ✅ Use Bridge Pattern When:

1. **Multiple Dimensions of Variation**
   - มี 2+ aspects ที่ต้องเปลี่ยนแปลงอิสระ
   - Example: Content Type × Render Strategy

2. **Avoid Class Explosion**
   - จำนวน combinations มาก (m × n)
   - ต้องการลด classes เป็น (m + n)

3. **Runtime Flexibility**
   - ต้องการเปลี่ยน implementation ขณะ runtime
   - Example: User สลับ render mode

4. **Platform Independence**
   - ต้องการ support หลาย platforms
   - Example: iOS vs Android rendering

5. **Shared Implementation**
   - Implementation ใช้ร่วมกันได้หลาย abstractions
   - Example: PreviewStrategy ใช้กับทุก content type

---

### ❌ Avoid When:

1. **Single Dimension**
   - มี variation เดียว → ใช้ Strategy Pattern
   - Example: เฉพาะ render strategies ไม่มี content types

2. **Simple Requirements**
   - Project เล็ก ไม่ซับซ้อน
   - if-else statements เพียงพอ

3. **Fixed Implementation**
   - Implementation ไม่เปลี่ยน runtime
   - ใช้ simple inheritance

4. **No Growth Expected**
   - ไม่มีแผนเพิ่ม types หรือ strategies
   - Bridge over-engineers

---

## 📚 Related Patterns

### Strategy Pattern
**Similarities:**
- ทั้งคู่ใช้ composition
- ทั้งคู่เปลี่ยน behavior runtime ได้

**Differences:**
- **Strategy**: focus on algorithm เดียว
- **Bridge**: แยก 2 dimensions (abstraction + implementation)

---

### Adapter Pattern
**Similarities:**
- ทั้งคู่เกี่ยวกับ interface compatibility

**Differences:**
- **Adapter**: แก้ไข existing incompatibility (retroactive)
- **Bridge**: ป้องกัน future explosion (proactive)

---

### Abstract Factory
**Similarities:**
- สร้าง objects ที่เกี่ยวข้องกัน

**Differences:**
- **Abstract Factory**: สร้าง family of objects
- **Bridge**: แยก hierarchies

---

### State Pattern
**Similarities:**
- เปลี่ยน behavior runtime

**Differences:**
- **State**: state transitions (FSM)
- **Bridge**: independent dimensions

---

## 💡 Key Takeaways

1. **Bridge = แยก "What" ออกจาก "How"**
   - Abstraction (What to render)
   - Implementation (How to render)

2. **Composition > Inheritance**
   - ใช้ "has-a" แทน "is-a"
   - Flexible และ maintainable

3. **Prevents Class Explosion**
   - 3 + 3 = 6 classes
   - แทนที่จะเป็น 3 × 3 = 9 classes

4. **Runtime Flexibility**
   - เปลี่ยน Strategy ได้ขณะ runtime
   - `setStrategy()` method

5. **Open/Closed Principle**
   - เพิ่ม dimension ใหม่ได้โดยไม่แก้ existing code
   - Extend without modify

6. **เหมาะกับ Multi-dimensional Variation**
   - 2+ aspects ที่ต้อง vary independently
   - Platform, Theme, Mode, etc.

---

## 🎯 Real-world Use Cases

1. **UI Frameworks**
   - Components (Button, Input) × Themes (Light, Dark)
   - Widgets × Platforms (iOS, Android, Web)

2. **Database Drivers**
   - Queries (Select, Insert) × Databases (MySQL, PostgreSQL)
   - ORM Models × SQL Dialects

3. **Graphics Systems**
   - Shapes (Circle, Square) × Renderers (SVG, Canvas, WebGL)
   - Objects × Rendering Engines

4. **Remote Controls**
   - Devices (TV, Radio) × Protocols (IR, Bluetooth, WiFi)

5. **Payment Systems**
   - Transactions (Purchase, Refund) × Gateways (PayPal, Stripe)

---

## 📖 Resources

- **Implementation**: [page.tsx](../../app/page.tsx) (Lines 190-310)
- **Class Diagram**: [diagram/bridge.md](../diagram/bridge.md)
- **Pattern Type**: Structural Design Pattern
- **Gang of Four**: Object Structural Pattern
- **Also Known As**: Handle/Body Pattern

---

**Created**: 2024  
**Author**: Design Patterns Documentation  
**Version**: 1.0  
**Related Patterns**: [adapter.md](./adapter.md), [strategy.md](./strategy.md)
