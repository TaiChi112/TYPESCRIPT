# 🎨 Decorator Pattern - การประยุกต์ใช้งาน

## 📖 Introduction

**Decorator Pattern** เป็น Structural Design Pattern ที่ช่วยให้สามารถ **เพิ่ม behavior/features ให้กับ objects** โดยไม่แก้ไขค่าเดิมและสามารถ **stack decorators เข้าด้วยกัน** ได้

**Real-world Analogy:**
- 🎂 **Cake Decorations:** Cake (base) → Frosting (decorator) → Sprinkles (decorator) → Candles (decorator)
- 🎁 **Gift Wrapping:** Present (base) → Wrapper (decorator) → Ribbon (decorator) → Tag (decorator)
- 💎 **Jewelry:** Plain ring (base) → Diamond (decorator) → Engraving (decorator)
- 📦 **Coffee:** Coffee (base) → Cream (decorator) → Sugar (decorator) → Cinnamon (decorator)

---

## 🎯 ปัญหาที่แก้ไข

### สถานการณ์จริง
ใน Portfolio มี Content Items (Projects, Blogs, Research) ต้องการเพิ่มเครื่องหมายพิเศษ:
- ⭐ **Featured** - ทำเครื่องหมายให้เป็นรายการเด่น
- 📌 **Pinned** - ปักหมุดไว้ด้านบน
- 🏆 **Award** - ได้รับรางวัล
- 📈 **Trending** - กำลังนิยม
- 🔥 **Hot** - ยอดนิยม

ปัญหา: ต้องการสามารถ **combine decorations ได้หลายแบบ**

---

### ❌ ปัญหาถ้าไม่ใช้ Decorator Pattern

#### Approach 1: Inheritance Hell
```typescript
class ContentItem { ... }
class FeaturedContentItem extends ContentItem { ... }
class PinnedContentItem extends ContentItem { ... }
class FeaturedAndPinnedContentItem extends ContentItem { ... }
class FeaturedAndPinnedAndAwardedContentItem extends ContentItem { ... }
// Explosion! 2^5 = 32 combinations for 5 features!
```

**ปัญหา:**
- exponential class explosion
- Hard to maintain
- Duplicate code
- Rigid structure

---

#### Approach 2: Properties Approach
```typescript
class ContentItem {
  featured: boolean = false;
  pinned: boolean = false;
  award: boolean = false;
  trending: boolean = false;
  hot: boolean = false;
  
  render() {
    if (this.featured) { ... }
    if (this.pinned) { ... }
    if (this.award) { ... }
    // Logic scattered throughout
  }
}
```

**ปัญหา:**
- Object ต้องรู้เรื่องทั้งหมด
- Violate Single Responsibility
- Hard to add new features
- Tangled rendering logic

---

## ✅ Solution: Decorator Pattern

Create **wrapper objects** ที่ wrap original item และเพิ่ม behavior

```
Original Item
    ↓
Decorator 1 (Featured)
    ↓
Decorator 2 (Pinned)
    ↓
Decorator 3 (Award)
    
Result: Item with 3 stacked decorations
```

---

## 🏗️ Structure

### 📐 Components

#### 1️⃣ **IContentDecorator (Component Interface)**
```typescript
interface IContentDecorator {
  getDecorations(): string[];           // Get all applied decorations
  renderDecorations(): React.ReactNode; // Render visual badges
  getDecoratedItem(): ContentItem;      // Get original item
  hasDecoration(type: string): boolean; // Check if has specific decoration
}
```

**Purpose:** Define contract ที่ทุก decorator ต้อง implement

---

#### 2️⃣ **ContentDecorator (Base Decorator Class)**
Abstract base class ที่ implement chaining logic

```typescript
abstract class ContentDecorator implements IContentDecorator {
  protected decoratedItem: ContentItem | ContentDecorator; // Can wrap item or decorator
  public decorationType: string;

  constructor(item: ContentItem | ContentDecorator, type: string) {
    this.decoratedItem = item;
    this.decorationType = type;
    SessionLogger.getInstance().addLog(
      `Decorator Pattern: Added "${type}" decoration`
    );
  }

  // Collect all decorations from entire chain
  getDecorations(): string[] {
    const wrapped = this.decoratedItem instanceof ContentDecorator 
      ? this.decoratedItem.getDecorations() 
      : [];
    return [...wrapped, this.decorationType];
  }

  // Get original item from decorator chain
  getDecoratedItem(): ContentItem {
    return this.decoratedItem instanceof ContentDecorator
      ? this.decoratedItem.getDecoratedItem()
      : this.decoratedItem;
  }

  // Check if specific decoration exists
  hasDecoration(type: string): boolean {
    return this.getDecorations().includes(type);
  }

  abstract renderDecorations(): React.ReactNode;
}
```

**Characteristics:**
- ✅ Handles wrapping logic
- ✅ Provides chaining methods
- ✅ Recursively collects decorations
- ✅ Maintains original item reference

---

#### 3️⃣ **Concrete Decorators**

**FeaturedDecorator:**
```typescript
class FeaturedDecorator extends ContentDecorator {
  constructor(item: ContentItem | ContentDecorator) {
    super(item, 'Featured');
  }

  renderDecorations(): React.ReactNode {
    return (
      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 
                       text-xs rounded border border-amber-500/50 
                       font-semibold">
        ⭐ Featured
      </span>
    );
  }
}
```

**PinnedDecorator:**
```typescript
class PinnedDecorator extends ContentDecorator {
  constructor(item: ContentItem | ContentDecorator) {
    super(item, 'Pinned');
  }

  renderDecorations(): React.ReactNode {
    return (
      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 
                       text-xs rounded border border-red-500/50 
                       font-semibold">
        📌 Pinned
      </span>
    );
  }
}
```

Similar: **AwardDecorator**, **TrendingDecorator**, **HotDecorator**

---

## 🎮 การใช้งาน (Usage)

### Basic Decoration (Single Decorator)
```typescript
// Create item
const item = new ContentItem(
  '1', 
  'Algorithmic Trading Bot', 
  'Python based...',
  '2024',
  ['Python', 'Finance']
);

// Wrap with decorator
const featured = new FeaturedDecorator(item);

// Get decorations
featured.getDecorations();  // ["Featured"]
featured.getDecoratedItem() === item;  // true
featured.hasDecoration("Featured");    // true
```

---

### Stacking Decorators (Multiple Decorations)
```typescript
const item = new ContentItem(...);

// Layer 1: Add Featured
const featured = new FeaturedDecorator(item);
featured.getDecorations(); // ["Featured"]

// Layer 2: Add Pinned
const pinned = new PinnedDecorator(featured);
pinned.getDecorations(); // ["Featured", "Pinned"]

// Layer 3: Add Award
const awarded = new AwardDecorator(pinned);
awarded.getDecorations(); // ["Featured", "Pinned", "Award"]

// Still can get original item
awarded.getDecoratedItem() === item; // true

// Check for specific decorations
awarded.hasDecoration("Pinned");  // true
awarded.hasDecoration("Hot");     // false
```

---

### React State Management
```typescript
// State: Maps itemId to decorators
const [itemDecorators, setItemDecorators] = useState<Record<string, ContentDecorator[]>>({});

// Apply decorator function
const applyDecorator = (itemId: string, type: 'Featured' | 'Pinned' | ...) => {
  setItemDecorators(prev => {
    const current = prev[itemId] || [];
    
    // Check if already has decoration (toggle)
    const hasDecorator = current.some(d => d.decorationType === type);
    if (hasDecorator) {
      // Remove it
      return { 
        ...prev, 
        [itemId]: current.filter(d => d.decorationType !== type) 
      };
    }
    
    // Add new decorator, wrapping previous one
    const baseItem = current.length > 0 ? current[current.length - 1] : item;
    const decorator = createDecorator(baseItem, type); // Factory helper
    
    return { ...prev, [itemId]: [...current, decorator] };
  });
};

// Derive decorations map for rendering
const itemDecorationsMap: Record<string, string[]> = {};
Object.entries(itemDecorators).forEach(([itemId, decorators]) => {
  itemDecorationsMap[itemId] = decorators.map(d => d.decorationType);
  // Result: { "item1": ["Featured", "Pinned"], "item2": ["Award"] }
});
```

---

### Rendering Decorations
```typescript
// In component
{itemDecorations[item.id] && 
  itemDecorations[item.id].length > 0 && (
  <div className="flex flex-wrap gap-1">
    {itemDecorations[item.id].map((dec, idx) => (
      <span key={idx}>
        {dec === 'Featured' && <span className="...">⭐ Featured</span>}
        {dec === 'Pinned' && <span className="...">📌 Pinned</span>}
        {dec === 'Award' && <span className="...">🏆 Award</span>}
        {dec === 'Trending' && <span className="...">📈 Trending</span>}
        {dec === 'Hot' && <span className="...">🔥 Hot</span>}
      </span>
    ))}
  </div>
)}

// Decorator buttons for toggling
{(['Featured', 'Pinned', 'Award', 'Trending', 'Hot'] as const).map(dec => (
  <button
    key={dec}
    onClick={() => applyDecorator(item.id, dec)}
    className={itemDecorations[item.id]?.includes(dec) ? 'active' : ''}
  >
    {dec === 'Featured' && '⭐'}
    {dec === 'Pinned' && '📌'}
    {/* ... etc ... */}
  </button>
))}
```

---

## 🔄 Recursive Chaining

### How Wrapping Works
```
Original Item
  ↓ wrapped by FeaturedDecorator
FeaturedDecorator { decoratedItem: Item, decorationType: "Featured" }
  ↓ wrapped by PinnedDecorator
PinnedDecorator { decoratedItem: FeaturedDecorator, decorationType: "Pinned" }
  ↓ wrapped by AwardDecorator
AwardDecorator { decoratedItem: PinnedDecorator, decorationType: "Award" }

Call getDecorations() on AwardDecorator:
1. Awards decorationType = "Award"
2. Pinned's decoratedItem.getDecorations() = ["Featured", "Pinned"]
3. Return [...["Featured", "Pinned"], "Award"] = ["Featured", "Pinned", "Award"]
```

---

### Visual Representation
```
┌─────────────────────────────────┐
│   AwardDecorator Layer 3        │
│  ┌──────────────────────────┐   │
│  │ PinnedDecorator Layer 2  │   │
│  │ ┌────────────────────┐   │   │
│  │ │ FeaturedDecorator 1│   │   │
│  │ │ ┌──────────────┐   │   │   │
│  │ │ │ ContentItem  │   │   │   │
│  │ │ │ "Trading Bot"│   │   │   │
│  │ │ └──────────────┘   │   │   │
│  │ └────────────────────┘   │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘

Decorations: ["Featured", "Pinned", "Award"]
Badges shown: ⭐ 📌 🏆
```

---

## ✅ Design Principles Applied

### 1. **Single Responsibility Principle (SRP)**
| Class | Responsibility |
|-------|-----------------|
| **ContentItem** | Store item data |
| **FeaturedDecorator** | Add featured badge |
| **PinnedDecorator** | Add pinned badge |
| **ContentDecorator** | Manage wrapping chain |

---

### 2. **Open/Closed Principle (OCP)**
```typescript
// ✅ Can add new decorator without changing existing code
class PremiumDecorator extends ContentDecorator {
  constructor(item: ContentItem | ContentDecorator) {
    super(item, 'Premium');
  }
  
  renderDecorations(): React.ReactNode {
    return <span>👑 Premium</span>;
  }
}

// Works immediately with existing system
const premium = new PremiumDecorator(item);
```

---

### 3. **Liskov Substitution Principle (LSP)**
```typescript
// ✅ All decorators are interchangeable
function applyDecoration(
  item: ContentItem | ContentDecorator, 
  decorator: ContentDecorator
) {
  return decorator; // Works regardless of decorator type
}

applyDecoration(item, new FeaturedDecorator(item));  // ✅
applyDecoration(item, new PinnedDecorator(item));    // ✅
applyDecoration(item, new CustomDecorator(item));    // ✅
```

---

### 4. **Composition over Inheritance**
```typescript
// ✅ Use composition (decorators wrap items)
class FeaturedDecorator extends ContentDecorator {
  protected decoratedItem: ContentItem | ContentDecorator; // Composition
}

// ❌ Not inheritance chains
// class FeaturedItem extends PinnedItem extends AwardedItem { ... }
```

---

## 🔗 Integration with Other Patterns

### **Singleton Pattern** (SessionLogger)
```typescript
constructor(item: ContentItem | ContentDecorator, type: string) {
  this.decoratedItem = item;
  this.decorationType = type;
  SessionLogger.getInstance().addLog(
    `Decorator Pattern: Added "${type}" decoration`
  );
}
```

---

### **Prototype Pattern** (Cloning Items)
```typescript
// Item can be cloned
const cloned = item.clone();

// Decorator can wrap both original and cloned
const decoratedOriginal = new FeaturedDecorator(item);
const decoratedClone = new FeaturedDecorator(cloned);
```

---

### **Composite Pattern** (Tree Structure)
```typescript
// Portfolio has groups and items
// Items can be decorated
// Composite rendering + Decorator features

const featured = new FeaturedDecorator(
  new ContentItemLeaf(item)
);

// Composite tree with decorated leaves
portfolio.addChild(featured);
```

---

### **Bridge Pattern** (Rendering Strategies)
```typescript
// Decorator adds visual badges
// Bridge Pattern controls HOW items render (preview/full/compact)
// Together: Decorations + Rendering Strategy

// Item decorated + rendered with strategy
renderWithBridge(decoratedItem, 'full');
```

---

## 📊 Benefits

| Benefit | Description | Impact |
|---------|-------------|--------|
| **No Class Explosion** ✨ | Combine features without inheritance | 2^5 combinations with 5 decorators |
| **Flexibility** 🔄 | Add/remove features at runtime | Toggle badges dynamically |
| **Single Responsibility** 🎯 | Each decorator does one thing | Easy to test and maintain |
| **Composition** 🧩 | Decorate any object | Reusable with all items |
| **Runtime Behavior** ⚙️ | Features decided at runtime | No compile-time knowledge needed |
| **Open/Closed** 🚪 | Extend without modifying | Add new decorators freely |

---

## ⚠️ Trade-offs

| Trade-off | Impact | Solution |
|-----------|--------|----------|
| **Memory Overhead** | Wrapper objects consume memory | Use only needed decorators |
| **Complexity** | Understanding decoration chains | Document decoration logic |
| **Performance** | Recursive method calls | Cache if performance critical |
| **Debugging** | Hard to trace wrapped items | Use getDecoratedItem() helper |

---

## 🚀 Advanced Features

### Custom Decorators
```typescript
// Add new decorator type without changing system
class VipDecorator extends ContentDecorator {
  constructor(item: ContentItem | ContentDecorator) {
    super(item, 'VIP');
  }
  
  renderDecorations(): React.ReactNode {
    return <span className="text-purple-400">👑 VIP Member</span>;
  }
}

// Use immediately
const vip = new VipDecorator(item);
```

---

### Decorator Query
```typescript
// Find all items with specific decoration
function findItemsWithDecoration(
  items: ContentItem[],
  decorationType: string
): ContentItem[] {
  return items.filter(item => {
    const decorations = itemDecorationsMap[item.id] || [];
    return decorations.includes(decorationType);
  });
}

// Usage
const featured = findItemsWithDecoration(projects, "Featured");
const pinnedAndAwarded = projects.filter(item => {
  const decs = itemDecorationsMap[item.id] || [];
  return decs.includes("Pinned") && decs.includes("Award");
});
```

---

### Decoration Statistics
```typescript
function getDecorationStats(items: ContentItem[]): Record<string, number> {
  const stats: Record<string, number> = {};
  
  Object.values(itemDecorationsMap).forEach(decorations => {
    decorations.forEach(type => {
      stats[type] = (stats[type] || 0) + 1;
    });
  });
  
  return stats;
  // Result: { "Featured": 3, "Pinned": 2, "Award": 1, ... }
}
```

---

## 🎓 When to Use

### ✅ Use Decorator Pattern When:

1. **Add Features Dynamically**
   - Badges, indicators, decorations
   - Optional enhancements
   - Runtime behavior

2. **Avoid Explosion**
   - Many feature combinations
   - Exponential subclass growth
   - Inheritance madness

3. **Keep Objects Simple**
   - Core object focused
   - Features added externally
   - Single Responsibility

4. **Composition Over Inheritance**
   - Mix and match features
   - Flexible stacking
   - Easy to extend

---

### ❌ Avoid When:

1. **Few Features**
   - Simple object
   - 1-2 decorations max
   - Inheritance sufficient

2. **Immutable Objects**
   - Can't wrap objects
   - Frozen state
   - No modification allowed

3. **Performance Critical**
   - Wrapper overhead significant
   - Real-time system
   - Latency sensitive

4. **Fixed Behavior**
   - No runtime changes
   - Static features
   - Predictable decoration

---

## 💡 Key Takeaways

1. **Decorator = Wrapper**
   - Wraps object in another object
   - Maintains same interface
   - Adds behavior/features

2. **Stacking = Composition**
   - Can layer multiple decorators
   - Creates decoration chain
   - All combine together

3. **Flexibility > Inheritance**
   - No class explosion
   - Flexible combinations
   - Easy to extend

4. **Real-world Use**
   - Portfolio badges (⭐📌🏆)
   - UI decorations
   - Feature flags
   - Runtime enhancements

5. **Chain Pattern**
   - Recursive wrapping
   - Collect decorations
   - Get original item
   - Check decorations

---

## 🧪 Test Scenarios

### Test 1: Single Decoration
```typescript
const item = projects[0];
const featured = new FeaturedDecorator(item);

assert(featured.getDecorations() === ["Featured"]);
assert(featured.getDecoratedItem() === item);
assert(featured.hasDecoration("Featured") === true);
assert(featured.hasDecoration("Award") === false);
```

---

### Test 2: Stacked Decorations
```typescript
const item = projects[0];
const decorated = 
  new AwardDecorator(
    new PinnedDecorator(
      new FeaturedDecorator(item)
    )
  );

assert(decorated.getDecorations().length === 3);
assert(decorated.getDecoratedItem() === item);
assert(decorated.hasDecoration("Pinned") === true);
```

---

### Test 3: Toggle Behavior
```typescript
// Apply and remove decorations
applyDecorator("item1", "Featured");
// itemDecorators["item1"] = [FeaturedDecorator]

applyDecorator("item1", "Pinned");
// itemDecorators["item1"] = [FeaturedDecorator, PinnedDecorator]

applyDecorator("item1", "Featured"); // toggle off
// itemDecorators["item1"] = [PinnedDecorator]
```

---

## 📚 Related Patterns

### Composite Pattern
- **Composite**: Organize hierarchical structure
- **Decorator**: Add features to objects
- **Together**: Decorate items in composite tree

### Strategy Pattern
- **Strategy**: Change algorithm/behavior (HOW)
- **Decorator**: Add features (WHAT)
- **Difference**: Strategy for algorithms, Decorator for features

### Prototype Pattern
- **Prototype**: Clone objects
- **Decorator**: Decorate objects
- **Together**: Clone and decorate items

### Factory Pattern
- **Factory**: Create decorators
- **Decorator**: Wrap objects
- **Together**: Create and apply decorations

---

## 📖 Resources

- **Implementation**: [page.tsx](../../app/page.tsx) (Lines 350-420)
- **Class Diagram**: [diagram/decorator.md](../diagram/decorator.md)
- **Pattern Type**: Structural Design Pattern
- **Gang of Four**: Object Structural Pattern
- **Main Purpose**: Add behavior dynamically

---

## 📊 Current Portfolio Implementation

### Decorators Available
1. ⭐ **Featured** - Featured badge (amber)
2. 📌 **Pinned** - Pinned badge (red)
3. 🏆 **Award** - Award badge (yellow)
4. 📈 **Trending** - Trending badge (blue)
5. 🔥 **Hot** - Hot badge (orange)

### Usage
- Click buttons in card items to toggle decorations
- Multiple decorations can be stacked
- Decorations are tracked in itemDecorators state
- Rendered as colored badges on items

### Example
```
[Algorithmic Trading Bot]
⭐ Featured 📌 Pinned 🔥 Hot
```

---

**Created**: 2024  
**Author**: Design Patterns Documentation  
**Version**: 1.0  
**Related**: [adapter.md](./adapter.md), [bridge.md](./bridge.md), [composite.md](./composite.md)
