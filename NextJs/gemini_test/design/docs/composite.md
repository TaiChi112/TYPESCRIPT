# 🌳 Composite Pattern - การประยุกต์ใช้งาน

## 📖 Introduction

**Composite Pattern** เป็น Structural Design Pattern ที่ช่วยให้สามารถ **compose objects เข้าด้วยกันเป็น tree structures** ได้ โดย **treat individual objects และ compositions of objects อย่างเดียวกัน** (Uniform Treatment)

**Real-world Analogy:**
- 📁 **File System:** Folders (composite) ที่สามารถมี files (leaf) และ subfolders (composite) ได้
- 🌳 **DOM Tree:** Elements (composite) ที่สามารถมี child elements (composite/leaf) ได้
- 🍽️ **Menu:** Menus (composite) ที่มี menu items (leaf) และ submenus (composite)

---

## 🎯 ปัญหาที่แก้ไข

### สถานการณ์จริง
ในเว็บไซต์ Portfolio มี data structure:
- **Projects** (3 items)
- **Blogs** (2 items)  
- **Research** (1 item)

ต้องการแสดง as **hierarchical structure:**
```
My Full Portfolio (Root)
├── Featured Projects (Group)
│   ├── Algorithmic Trading Bot (Item)
│   └── Knowledge Graph System (Item)
├── Tech Blog (Group)
│   └── Deep Dive into React Hooks (Item)
└── Academic Research (Group)
    └── Distributed Systems Analysis (Item)
```

---

### ❌ ปัญหาถ้าไม่ใช้ Composite Pattern

#### Approach 1: Flat Iteration
```typescript
// Must handle categories separately from items
{categories.map(cat => (
  <div>
    <h3>{cat.name}</h3>
    {items
      .filter(i => i.categoryId === cat.id)
      .map(i => (
        <div>{i.title}</div>
      ))
    }
  </div>
))}
```

**ปัญหา:**
- Client code ต้องรู้ data structure
- ยาก support nested categories (เช่น category มี subcategories)
- Logic ซับซ้อนเมื่อมี multiple levels
- Hard to recursively traverse

---

#### Approach 2: Specialized Classes
```typescript
// ต้องสร้าง class แยกสำหรับ Category และ CategoryWithSubcategories
class Category { ... }
class CategoryWithSubcategories extends Category { ... }

// แล้วต้อง check type
if (cat instanceof CategoryWithSubcategories) {
  // render differently
} else {
  // render normally
}
```

**ปัญหา:**
- Type checking everywhere
- Violation of Open/Closed Principle
- Difficult to extend

---

## ✅ Solution: Composite Pattern

สร้าง **single interface** ที่ใช้สำหรับทั้ง individual objects และ composite structures

```
┌─────────────────────────────────────┐
│   IContentComponent (Interface)     │
├─────────────────────────────────────┤
│ + getName()                         │
│ + addChild(component)               │
│ + removeChild(component)            │
│ + getChildren()                     │
│ + render(renderMode)                │
└─────────────────────────────────────┘
        ▲            ▲            ▲
        │            │            │
    ┌───┴────┐   ┌───┴────┐   ┌──┴─────┐
    │ Leaf   │   │ Composite     │ Root  │
    │ (Item) │   │ (Group)       │ (Port)│
    └────────┘   └────────┘   └────────┘
```

---

## 🏗️ Structure

### 📐 Components

#### 1️⃣ **IContentComponent (Component Interface)**
```typescript
interface IContentComponent {
  getName(): string;
  addChild(component: IContentComponent): void;
  removeChild(component: IContentComponent): void;
  getChildren(): IContentComponent[];
  render(renderMode: RenderMode): React.ReactNode;
}
```

**Purpose:** Define contract ที่ทั้ง leaf และ composite ต้อง implement

---

#### 2️⃣ **ContentItemLeaf (Leaf)**
Represent individual item - ไม่มี children

```typescript
class ContentItemLeaf implements IContentComponent {
  constructor(private item: ContentItem) {}

  getName(): string {
    return this.item.title;
  }

  addChild(): void {
    // No-op: leaf nodes ไม่มี children
    console.warn("Cannot add child to leaf node");
  }

  removeChild(): void {
    // No-op
    console.warn("Cannot remove child from leaf node");
  }

  getChildren(): IContentComponent[] {
    return []; // Empty array
  }

  render(renderMode: RenderMode): React.ReactNode {
    // Delegate to Bridge Pattern rendering
    const strategy = getRenderStrategy(renderMode);
    const renderer = new ProjectRenderer(strategy);
    return renderer.render(this.item);
  }
}
```

**Characteristics:**
- ✅ Simple - ไม่ต้อง manage children
- ✅ Wraps ContentItem
- ✅ addChild/removeChild = safe no-op
- ✅ render() = use Bridge Pattern

---

#### 3️⃣ **ContentGroup (Composite)**
สามารถมี children - represent category/group

```typescript
class ContentGroup implements IContentComponent {
  private children: IContentComponent[] = [];

  constructor(
    private name: string,
    private color: 'blue' | 'purple' | 'green' | 'orange',
    private icon: React.ElementType
  ) {}

  getName(): string {
    return this.name;
  }

  addChild(component: IContentComponent): void {
    this.children.push(component);
    SessionLogger.getInstance().addLog(
      `Composite: Added "${component.getName()}" to "${this.name}"`
    );
  }

  removeChild(component: IContentComponent): void {
    this.children = this.children.filter(c => c !== component);
  }

  getChildren(): IContentComponent[] {
    return this.children;
  }

  render(renderMode: RenderMode): React.ReactNode {
    const Icon = this.icon;
    return (
      <div className={`border-l-4 border-${this.color}-500`}>
        <div className="flex items-center gap-2">
          <Icon size={16} />
          <span className="font-bold">{this.name}</span>
          <span className="text-xs">({this.children.length})</span>
        </div>
        <div className="ml-2 space-y-2">
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
```

**Characteristics:**
- ✅ สามารถมี children ได้
- ✅ addChild() = add to array + log
- ✅ render() = render group header + recursively render children
- ✅ Support unlimited nesting

---

#### 4️⃣ **Portfolio (Root Composite)**
Root of entire tree

```typescript
class Portfolio implements IContentComponent {
  private children: IContentComponent[] = [];

  constructor(private name: string) {}

  getName(): string {
    return this.name;
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
```

---

## 🎮 การใช้งาน (Usage)

### Building Tree Structure
```typescript
// 1. Create root
const portfolio = new Portfolio('My Full Portfolio');

// 2. Create groups (composites)
const projectsGroup = new ContentGroup(
  'Featured Projects', 
  'blue', 
  Code
);

const blogsGroup = new ContentGroup(
  'Tech Blog', 
  'purple', 
  Feather
);

const researchGroup = new ContentGroup(
  'Academic Research', 
  'green', 
  Book
);

// 3. Create items (leaves)
const tradingBot = new ContentItemLeaf(
  new ContentItem('1', 'Algorithmic Trading Bot', ...)
);

const graphSystem = new ContentItemLeaf(
  new ContentItem('2', 'Knowledge Graph System', ...)
);

// ... create more items

// 4. Build tree structure
projectsGroup.addChild(tradingBot);
projectsGroup.addChild(graphSystem);

blogsGroup.addChild(hooksArticle);

researchGroup.addChild(distributedSystems);

// 5. Assemble into portfolio
portfolio.addChild(projectsGroup);
portfolio.addChild(blogsGroup);
portfolio.addChild(researchGroup);
```

**Result:**
```
Portfolio
├── ContentGroup "Featured Projects"
│   ├── ContentItemLeaf "Trading Bot"
│   └── ContentItemLeaf "Graph System"
├── ContentGroup "Tech Blog"
│   └── ContentItemLeaf "Hooks Article"
└── ContentGroup "Academic Research"
    └── ContentItemLeaf "Distributed Systems"
```

---

### Rendering Tree (Uniform Interface)
```typescript
// Simple one-liner to render entire tree
const html = portfolio.render('full');

// Under the hood:
// 1. portfolio.render() → iterate children
// 2. Each group.render() → render header + iterate children
// 3. Each leaf.render() → render item using Bridge Pattern
// 4. Recursively compose results
```

---

### Adding/Removing Items
```typescript
// Add item to group
const newItem = new ContentItemLeaf(newContentItem);
projectsGroup.addChild(newItem);

// Remove item from group
projectsGroup.removeChild(newItem);

// Move item between groups
projectsGroup.removeChild(item);
blogsGroup.addChild(item);
```

---

## 🔄 Recursive Rendering Flow

```
portfolio.render('full')
├─ projectsGroup.render('full')
│  ├─ tradingBot.render('full')
│  │  └─ ProjectRenderer.render(item) [Bridge]
│  └─ graphSystem.render('full')
│     └─ ProjectRenderer.render(item) [Bridge]
├─ blogsGroup.render('full')
│  └─ hooksArticle.render('full')
│     └─ BlogRenderer.render(item) [Bridge]
└─ researchGroup.render('full')
   └─ distributedSystems.render('full')
      └─ ResearchRenderer.render(item) [Bridge]
```

---

## ✅ Design Principles Applied

### 1. **Single Responsibility (SRP)**
| Class | Responsibility |
|-------|-----------------|
| **ContentItemLeaf** | Wrap individual item |
| **ContentGroup** | Manage children + header rendering |
| **Portfolio** | Root organization |
| **IContentComponent** | Define contract |

---

### 2. **Open/Closed Principle (OCP)**
```typescript
// ✅ Can add new component type without changing existing code
class CustomGroup implements IContentComponent {
  // implement interface
}

// Client doesn't need to change
portfolio.addChild(new CustomGroup(...));
```

---

### 3. **Liskov Substitution (LSP)**
```typescript
// ✅ All components are interchangeable
function render(component: IContentComponent, mode: RenderMode) {
  return component.render(mode);
}

render(leaf, 'full');      // Works
render(group, 'full');     // Works
render(portfolio, 'full'); // Works
```

---

### 4. **Composition over Inheritance**
```typescript
// ✅ Use composition, not inheritance
class ContentGroup {
  private children: IContentComponent[] = []; // Composition
}

// Not:
// class ContentGroup extends Array<IContentComponent> { ... }
```

---

## 🔗 Integration with Other Patterns

### **Singleton Pattern** (SessionLogger)
```typescript
addChild(component: IContentComponent): void {
  this.children.push(component);
  SessionLogger.getInstance().addLog(...); // Singleton
}
```

---

### **Bridge Pattern** (Rendering)
```typescript
// Leaf uses Bridge to render items
render(renderMode: RenderMode): React.ReactNode {
  const strategy = getRenderStrategy(renderMode); // Bridge
  const renderer = new ProjectRenderer(strategy);
  return renderer.render(this.item);
}
```

---

### **Prototype Pattern** (ContentItem)
```typescript
// Composite organizes Prototype objects
const leaf = new ContentItemLeaf(contentItem); // Prototype
group.addChild(leaf);
```

---

### **Adapter Pattern** (Imported Data)
```typescript
// Imported items become leaves
const adapter = new JSONContentAdapter(jsonData, 'project');
const item = adapter.adapt(); // Returns ContentItem
const leaf = new ContentItemLeaf(item);
projectsGroup.addChild(leaf);
```

---

## 📊 Benefits

| Benefit | Description | Impact |
|---------|-------------|--------|
| **Simplicity** ✨ | Single interface | Easy client code |
| **Flexibility** 🔄 | Support any structure | Unlimited nesting |
| **Reusability** ♻️ | Same rendering logic | DRY principle |
| **Maintainability** 🛠️ | Recursive nature | Scales well |
| **Composability** 🧩 | Mix and match | Creative structures |

---

## ⚠️ Trade-offs

| Trade-off | Impact | Mitigation |
|-----------|--------|------------|
| **Memory** | Wrapper objects | Cache or Flyweight |
| **Type Safety** | Uniform interface | Document carefully |
| **Performance** | Recursive calls | Optimize hot paths |
| **Complexity** | More classes | Worth for hierarchies |

---

## 🚀 Advanced Features

### 1. **Visitor Pattern (Separate Operations)**
```typescript
interface IComponentVisitor {
  visitLeaf(leaf: ContentItemLeaf): void;
  visitComposite(composite: ContentGroup): void;
}

class CountVisitor implements IComponentVisitor {
  itemCount = 0;
  groupCount = 0;
  
  visitLeaf(leaf: ContentItemLeaf): void {
    this.itemCount++;
  }
  
  visitComposite(composite: ContentGroup): void {
    this.groupCount++;
    composite.getChildren().forEach(child => {
      // visit recursively
    });
  }
}
```

---

### 2. **Tree Iterator**
```typescript
class TreeIterator implements IterableIterator<IContentComponent> {
  *[Symbol.iterator](): Generator<IContentComponent> {
    yield this.node;
    for (const child of this.node.getChildren()) {
      yield* new TreeIterator(child);
    }
  }
}

// Usage
for (const node of new TreeIterator(portfolio)) {
  console.log(node.getName());
}
```

---

### 3. **Search/Filter**
```typescript
class CompositeSearch {
  static findByName(
    root: IContentComponent, 
    query: string
  ): IContentComponent[] {
    const results: IContentComponent[] = [];
    
    if (root.getName().includes(query)) {
      results.push(root);
    }
    
    root.getChildren().forEach(child => {
      results.push(...this.findByName(child, query));
    });
    
    return results;
  }
}

// Usage
const matches = CompositeSearch.findByName(portfolio, 'React');
```

---

### 4. **Tree Statistics**
```typescript
class TreeStats {
  static getDepth(node: IContentComponent): number {
    const children = node.getChildren();
    if (children.length === 0) return 1;
    return 1 + Math.max(...children.map(c => this.getDepth(c)));
  }
  
  static getLeafCount(node: IContentComponent): number {
    const children = node.getChildren();
    if (children.length === 0) return 1;
    return children.reduce((sum, c) => sum + this.getLeafCount(c), 0);
  }
}

// Usage
const depth = TreeStats.getDepth(portfolio);
const items = TreeStats.getLeafCount(portfolio);
```

---

## 🎓 When to Use

### ✅ Use Composite Pattern When:
1. **Hierarchical Data**
   - Folders & files
   - Organization charts
   - Menu structures

2. **Uniform Treatment Needed**
   - Same operation on all levels
   - Recursive processing
   - Tree traversal

3. **Variable Nesting**
   - Unknown depth
   - Unlimited nesting
   - Dynamic structure

4. **Domain-Driven**
   - Data naturally hierarchical
   - Tree-like in nature
   - Clear parent-child relationships

---

### ❌ Avoid When:
1. **Flat Structure**
   - No hierarchy
   - Simple list/array
   - No nesting needed

2. **Different Processing**
   - Leaf vs Composite handled differently
   - Type checking required
   - Specialized behavior

3. **Performance Critical**
   - Recursive overhead significant
   - Large trees with deep nesting
   - Real-time constraints

4. **Over-engineering**
   - Simple data structure
   - Fixed depth
   - Loop sufficient

---

## 📚 Related Patterns

### Iterator Pattern
- **Purpose**: Traverse structures
- **With Composite**: Traverse tree uniformly
- **Together**: Perfect match

---

### Visitor Pattern
- **Purpose**: Separate operations from structure
- **With Composite**: Perform different operations on tree
- **Together**: Add operations without modifying Composite

---

### Decorator Pattern
- **Purpose**: Add behavior to objects
- **With Composite**: Decorate nodes in tree
- **ความต่าง**: Decorator linear, Composite hierarchical

---

### Facade Pattern
- **Purpose**: Simplify complex subsystems
- **With Composite**: Hide tree complexity
- **ความต่าง**: Facade hides, Composite exposes uniformly

---

## 💡 Key Takeaways

1. **Composite = Tree Structure ที่ Treat Uniformly**
   - Leaves ไม่มี children
   - Composites สามารถมี children
   - Implement interface เดียวกัน

2. **Recursive Rendering**
   - Parent render → Child render → ...
   - Automatic tree traversal
   - Scales to any depth

3. **Client Simplicity**
   - Don't need to know structure
   - Same code for all levels
   - No special cases

4. **Real-world Applications**
   - File systems
   - DOM trees
   - Menu systems
   - Organization charts

5. **Support Unlimited Nesting**
   - Recursive nature handles any depth
   - No limit on complexity
   - Grows organically

---

## 🎯 Current Portfolio Structure

```
My Full Portfolio
├── Featured Projects (3 items)
│   ├── Algorithmic Trading Bot
│   └── Knowledge Graph System
├── Tech Blog (1 item)
│   └── Deep Dive into React Hooks
└── Academic Research (1 item)
    └── Distributed Systems Analysis
```

**Total Components:** 1 Portfolio + 3 Groups + 5 Leaves = 9 nodes
**Depth:** 3 levels

---

## 📖 Resources

- **Implementation**: [page.tsx](../../app/page.tsx) (Lines 280-360)
- **Class Diagram**: [diagram/composite.md](../diagram/composite.md)
- **Pattern Type**: Structural Design Pattern
- **Gang of Four**: Object Structural Pattern

---

**Created**: 2024  
**Author**: Design Patterns Documentation  
**Version**: 1.0  
**Related**: [adapter.md](./adapter.md), [bridge.md](./bridge.md)
