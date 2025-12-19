# Iterator Pattern — Portfolio Traversal

## 📖 Intent

**Access elements ของ collection** sequentially  
โดยไม่เปิดเผยโครงสร้าง underlying ของ collection นั้น

## 🎨 Application Context

Iterator Pattern ถูกใช้เพื่อ **traverse Composite Portfolio structure**  
ให้ traversal ของ hierarchical tree (portfolio → groups → items) เป็นแบบ uniform

### ตัวอย่างการใช้งาน

```tsx
// Initialize iterator กับ portfolio root
iteratorRef.current = new PortfolioIterator(portfolioRef.current);

// Traverse ทุก content items
while (iterator.hasNext()) {
  const item = iterator.next();
  // Process item...
}
```

---

## 🏗️ Participants

### 1. Iterator Interface — `IIterator<T>`

**Description**

`IIterator<T>` ประกาศ contract สำหรับ iteration

**Methods**

```tsx
interface IIterator<T> {
  next(): T | null;
  hasNext(): boolean;
  reset(): void;
}
```

**Responsibilities**

- `next()`: ได้ element ถัดไป หรือ `null` เมื่อหมด
- `hasNext()`: check มี element ถัดไปหรือไม่
- `reset()`: รีเซ็ต iterator ไปยังจุดเริ่มต้น

---

### 2. Concrete Iterator — `PortfolioIterator`

**Description**

`PortfolioIterator` implement `IIterator<ContentItem>`  
traverse Composite Portfolio structure แบบ depth-first

**Implementation Strategy**

```tsx
class PortfolioIterator implements IIterator<ContentItem> {
  private stack: IContentComponent[] = [];
  private root: IContentComponent;

  constructor(root: IContentComponent) {
    this.root = root;
    this.reset();
  }

  reset(): void {
    this.stack = [this.root]; // Start from root
  }

  // Depth-first traversal using stack
}
```

**Traversal Mechanism**

- Uses **stack-based** depth-first traversal
- วน loop สำหรับ node ทั้งหมด
- ถ้า node เป็น composite (มี children) push children ไปยัง stack
- ถ้า node เป็น leaf (ContentItem) return เป็น next element

```
Portfolio (Root)
  ├─ ProjectsGroup (Composite)
  │  ├─ Project1 (Leaf) ← return
  │  └─ Project2 (Leaf) ← return
  ├─ BlogsGroup (Composite)
  │  ├─ Blog1 (Leaf) ← return
  │  └─ Blog2 (Leaf) ← return
  └─ ResearchGroup (Composite)
     └─ Research1 (Leaf) ← return
```

**Key Methods**

| Method | Logic |
|--------|-------|
| `reset()` | Initialize stack with root node |
| `hasNext()` | Peek ahead: loop stack to find next item |
| `next()` | Pop from stack, add children if composite, return if leaf |

---

### 3. Aggregate — `IContentComponent`

**Description**

`IContentComponent` interface ที่ iterator traverse

**Methods Related to Iterator**

```tsx
interface IContentComponent {
  getName(): string;
  asItem(): ContentItem | null;        // Leaf node check
  getChildren(): IContentComponent[];   // Get children for traversal
  // ... other methods
}
```

**Two Types of Components**

#### 🍃 Leaf Node — `ContentItemLeaf`
```tsx
class ContentItemLeaf implements IContentComponent {
  asItem(): ContentItem | null {
    return this.item; // Leaf returns content
  }
  
  getChildren(): IContentComponent[] {
    return []; // No children
  }
}
```

#### 🌳 Composite Node — `ContentGroup` / `Portfolio`
```tsx
class ContentGroup implements IContentComponent {
  private children: IContentComponent[] = [];
  
  asItem(): ContentItem | null {
    return null; // Composite returns null
  }
  
  getChildren(): IContentComponent[] {
    return this.children;
  }
}
```

---

## 📋 Implementation Example

### Portfolio Structure Setup

```tsx
// Initialize portfolio hierarchy
const portfolioRef = useRef<Portfolio | null>(null);

if (portfolioRef.current === null) {
  const portfolio = new Portfolio('My Full Portfolio');
  
  // Create groups
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
```

### Using Iterator to Traverse

```tsx
// Create iterator
const iterator = new PortfolioIterator(portfolioRef.current);

// Traverse all items
while (iterator.hasNext()) {
  const item = iterator.next();
  if (item) {
    console.log(`Processing: ${item.title}`);
    // Apply operations to item...
  }
}

// Reset and traverse again
iterator.reset();
while (iterator.hasNext()) {
  const item = iterator.next();
  // Process again...
}
```

---

## 🔄 Traversal Flow

```
Initialize Iterator with Portfolio root
        ↓
        Reset
        ↓
     hasNext()?
    ↙         ↘
   YES       NO (End)
    ↓
  next()
    ↓
Check top of stack
    ├─ Is Leaf? → Return item ✅
    └─ Is Composite? → Push children → Loop back
        ↓
      Repeat
```

---

## 💡 Benefits

1. **Encapsulation**: Composite structure hidden dari client
2. **Uniform Access**: Same interface para sa todos types ng traversal
3. **Flexibility**: Change traversal strategy without changing aggregate
4. **Multiple Iterators**: May ability na gumagawa ng multiple iterators
5. **Decoupling**: Client depends on iterator interface, hindi sa structure

---

## 🔗 Related Patterns

- **Composite**: Iterator traverses Composite portfolio structure
- **Singleton**: SessionLogger logs iteration operations (future enhancement)
- **Observer**: Subject can notify observers about iterations
- **Factory**: Iterator factory could create different traversal types

---

## 📝 Implementation Notes

### Current Implementation

- **Traversal Type**: Depth-first (stack-based)
- **Direction**: Top-to-bottom, left-to-right
- **Complexity**: O(n) where n = total leaf nodes

### Possible Enhancements

```tsx
// Breadth-first iterator (using queue instead of stack)
class BreadthFirstIterator implements IIterator<ContentItem> {
  private queue: IContentComponent[] = [];
  // ... implementation
}

// Filtered iterator (skip items not matching criteria)
class FilteredIterator implements IIterator<ContentItem> {
  constructor(private root: IContentComponent, 
              private predicate: (item: ContentItem) => boolean) {
    // ... filter logic
  }
}
```
