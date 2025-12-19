# Strategy Pattern — Portfolio Sorting

## 📖 Intent

กำหนด **family of algorithms**  
encapsulate ทั้งหมด และทำให้ **interchangeable**  
Strategy ให้ **algorithm เปลี่ยนแปลงอิสระ** จาก clients ที่ใช้มัน

## 🎨 Application Context

Strategy Pattern ถูกใช้เพื่อ **เลือก sorting algorithm สำหรับ portfolio items**  
โดยไม่แก้ sorting context logic

### ตัวอย่างการใช้งาน

```tsx
// เลือก sorting strategy ตาม user input
const strategy = new AlphabeticalSortStrategy();
sortStrategyContextRef.current!.setStrategy(strategy);

// Apply ไปยังทั้ง 3 collections
setSortedProjects(sortStrategyContextRef.current!.sort(projects));
setSortedBlogs(sortStrategyContextRef.current!.sort(blogs));
setSortedResearch(sortStrategyContextRef.current!.sort(research));
```

---

## 🏗️ Participants

### 1. Strategy Interface — `IPortfolioSortStrategy`

**Description**

`IPortfolioSortStrategy` ประกาศ contract สำหรับทุก sorting strategies

**Methods**

```tsx
interface IPortfolioSortStrategy {
  getName(): string;
  sort(items: ContentItem[]): ContentItem[];
}
```

**Responsibilities**

- ประกาศ sorting algorithm interface
- `getName()`: ชื่อของ strategy (สำหรับ UI display)
- `sort()`: ทำการจัดเรียงและ return sorted array

---

### 2. Concrete Strategies

#### 🔤 AlphabeticalSortStrategy
```tsx
sort(items: ContentItem[]): ContentItem[] {
  SessionLogger.getInstance().addLog('Strategy: Sorting by title (A-Z)');
  return [...items].sort((a, b) => a.title.localeCompare(b.title));
}
```
- **Order**: A → Z (ascending alphabetically)
- **Use Case**: Browse content by title

#### 📅 DateSortStrategy
```tsx
sort(items: ContentItem[]): ContentItem[] {
  SessionLogger.getInstance().addLog('Strategy: Sorting by date (newest first)');
  return [...items].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
```
- **Order**: Newest → Oldest
- **Use Case**: View recent content first

#### 🏷️ TagCountSortStrategy
```tsx
sort(items: ContentItem[]): ContentItem[] {
  SessionLogger.getInstance().addLog('Strategy: Sorting by tag count');
  return [...items].sort((a, b) => b.tags.length - a.tags.length);
}
```
- **Order**: Most tags → Least tags
- **Use Case**: Find well-tagged content

#### 🔄 ReverseSortStrategy
```tsx
sort(items: ContentItem[]): ContentItem[] {
  SessionLogger.getInstance().addLog('Strategy: Reversing order');
  return [...items].reverse();
}
```
- **Order**: Reverse current order
- **Use Case**: Flip sorting direction

#### 🎲 RandomSortStrategy
```tsx
sort(items: ContentItem[]): ContentItem[] {
  SessionLogger.getInstance().addLog('Strategy: Shuffling items randomly');
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```
- **Order**: Random
- **Use Case**: Discover unexpected content

---

### 3. Strategy Context — `PortfolioSortContext`

**Description**

`PortfolioSortContext` จัดการ strategy instance  
และ provide interface สำหรับ sorting

**Constructor**

```tsx
class PortfolioSortContext {
  private strategy: IPortfolioSortStrategy;

  constructor() {
    this.strategy = new AlphabeticalSortStrategy(); // Default
  }
}
```

**Key Methods**

| Method | Purpose |
|--------|---------|
| `setStrategy(strategy)` | เปลี่ยน sorting algorithm |
| `getStrategy()` | ได้ current strategy |
| `sort(items)` | Execute current strategy |
| `getAvailableStrategies()` | ได้ list ของ strategies ทั้งหมด |

**Strategy Switching**

```tsx
setStrategy(strategy: IPortfolioSortStrategy): void {
  this.strategy = strategy;
  SessionLogger.getInstance().addLog(
    `Strategy Context: Using "${strategy.getName()}" sorting strategy`
  );
}
```

---

## 📋 Implementation Example

### Sorting Multiple Collections

```tsx
const handleApplySortStrategy = (strategy: IPortfolioSortStrategy) => {
  // 1. Update context strategy
  sortStrategyContextRef.current!.setStrategy(strategy);
  setCurrentSortStrategy(strategy.getName());
  
  // 2. Apply to all collections
  setSortedProjects(strategy.sort(projects));
  setSortedBlogs(strategy.sort(blogs));
  setSortedResearch(strategy.sort(research));
  
  // 3. Log success
  SessionLogger.getInstance().addLog(
    `✅ Applied "${strategy.getName()}" sorting to all collections`
  );
};
```

---

## 🔄 Strategy Selection Flow

```
User Action: Select Sort Option
            ↓
Create Strategy Instance
(Alphabetical/Date/TagCount/Reverse/Random)
            ↓
setStrategy(strategy) in PortfolioSortContext
            ↓
Sort each collection:
├─ setSortedProjects(strategy.sort(projects))
├─ setSortedBlogs(strategy.sort(blogs))
└─ setSortedResearch(strategy.sort(research))
            ↓
Update UI with sorted results
            ↓
SessionLogger.addLog(success message)
```

---

## 💡 Benefits

1. **Runtime Selection**: เปลี่ยน algorithm ขณะ runtime โดยไม่ compile ใหม่
2. **Encapsulation**: Algorithm details ซ่อนใน concrete strategy
3. **Easy Extension**: เพิ่ม strategy ใหม่ได้โดยไม่แก้ context
4. **Separation of Concerns**: Sorting logic แยกจาก component logic
5. **Testability**: แต่ละ strategy สามารถ test อิสระได้

---

## 🔗 Related Patterns

- **Singleton**: SessionLogger สำหรับ log strategy changes
- **Factory**: ตัวอื่น สามารถ create strategies dynamically
- **Template Method**: Strategy ใช้ template method pattern ใน implementation
- **Context**: PortfolioSortContext ใช้ Strategy pattern
