# Prototype Pattern — Content Cloning

## 📖 Intent

ระบุ **ประเภทของ objects ที่ต้องสร้าง** โดยใช้ prototypical instance  
และสร้าง objects ใหม่ โดยการ **copy prototype นี้**

## 🎨 Application Context

Prototype Pattern ถูกใช้เพื่อ **duplicate `ContentItem` objects**  
เช่น:
- 📂 Projects (โปรเจกต์)
- 📊 Research (งานวิจัย)
- 📝 Blogs (บทความ)

โดยไม่เปิดเผย construction logic ให้กับ clients

### ตัวอย่างการใช้งาน

```tsx
// User click "Clone" บน project card
const clonedProject = originalProject.clone();

// Result: 
// - New ID (random generated)
// - Same title, description, tags
// - Independent from original
// - Log entry created via Singleton
```

---

## 🏗️ Participants

### 1. Prototype Interface — `Prototype<T>`

**Description**

`Prototype<T>` เป็น generic interface ที่ประกาศ cloning operation

**Methods**

```tsx
interface Prototype<T> {
  clone(): T;
}
```

**Responsibilities**

- ประกาศสัญญา (contract) ของ cloning
- ให้ type safety ผ่าน generics

---

### 2. Concrete Prototype — `ContentItem`

**Description**

`ContentItem` implements `Prototype<ContentItem>`  
เก็บข้อมูลเนื้อหา (projects, research, blogs)

**Attributes**

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Unique identifier |
| `title` | `string` | ชื่อของ item |
| `description` | `string` | รายละเอียด |
| `date` | `string` | วันที่สร้าง |
| `tags` | `string[]` | Tags/keywords |

**Constructor**

```tsx
class ContentItem implements Prototype<ContentItem> {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public date: string,
    public tags: string[]
  ) {}

  // More methods below...
}
```

**Clone Implementation**

```tsx
clone(): ContentItem {
  // 1. Log via Singleton
  SessionLogger.getInstance().addLog(
    `Prototype Pattern: Cloned "${this.title}"`
  );

  // 2. Generate new ID
  const newId = Math.random().toString(36).substr(2, 9);

  // 3. Create new instance with copied data
  return new ContentItem(
    newId,                           // new ID ✓
    `${this.title} (Copy)`,          // modified title
    this.description,                // same description
    this.date,                       // same date
    [...this.tags]                   // shallow copy of tags
  );
}
```

**Key Points in Clone Method**

- ✅ **New ID Generation** - ป้องกันการชนกัน
- ✅ **Shallow Copy Tags** - ใช้ spread operator `[...this.tags]`
- ✅ **Logging Integration** - เรียก Singleton logger
- ✅ **Data Independence** - Cloned object ไม่ affect original

---

## ⚙️ Responsibilities

Prototype Pattern ต้องรับผิดชอบ:

- ✅ **Encapsulate Cloning Logic**  
  Client ไม่รู้ว่า clone ดำเนินการยังไง

- ✅ **Ensure Data Independence**  
  Cloned object ต้องเป็น independent จาก original

- ✅ **Handle Side Effects**  
  Logging, ID generation ต้องเกิดขึ้นภายใน clone()

- ✅ **Support Complex Object Duplication**  
  ถ้า ContentItem มี nested objects ก็ต้อง deep copy

---

## 🔗 Collaboration

### Interaction Flow

```
┌─────────────────────────┐
│ PersonalWebsiteUltimate │
│ (User Component)        │
└────────────┬────────────┘
             │ (user clicks Clone button)
             ▼
      handleCloneItem()
             │
             ├─→ item.clone() ◄──┐
             │                   │
             │  Prototype Pattern│
             │   ContentItem     │
             │                   │
             ├─→ Generate new ID ├─┐
             │                   │ │
             ├─→ Log event       │ │
             │                   │ │
             └──→ returns cloned item
                  (independent copy)
                  │
                  ▼
        setState([clonedItem, ...items])
                  │
                  ▼
        Re-render with cloned item
```

### Code Integration

```tsx
// in PersonalWebsiteUltimate component
const handleCloneItem = (item: ContentItem) => {
  // 1. Call clone on the item
  const clonedItem = item.clone();
  // Note: Logging happens inside clone() automatically!

  // 2. Update state based on which list item belongs to
  if (projects.find(p => p.id === item.id)) {
    setProjects([clonedItem, ...projects]); // Add to front
  } else if (research.find(r => r.id === item.id)) {
    setResearch([clonedItem, ...research]);
  } else if (blogs.find(b => b.id === item.id)) {
    setBlogs([clonedItem, ...blogs]);
  }
};

// Usage in JSX
<theme.CardWrapper onClone={() => handleCloneItem(item)}>
  {/* card content */}
</theme.CardWrapper>
```

---

## 💡 Why Prototype Fits Here

### 1. **Client Doesn't Need Construction Knowledge**

```tsx
// ❌ Without Prototype (Bad)
const clonedItem = new ContentItem(
  Math.random().toString(36).substr(2, 9),
  item.title + ' (Copy)',
  item.description,
  item.date,
  item.tags.slice()
);

// ✅ With Prototype (Good)
const clonedItem = item.clone();
```

### 2. **Runtime Duplication of Complex Objects**

```tsx
// ContentItem มี multiple fields
// Prototype encapsulates ทั้งหมดเข้าไว้
class ContentItem {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  // (potential future: metadata, comments, etc.)

  clone(): ContentItem {
    // Handle all fields automatically
  }
}
```

### 3. **Keeps Cloning Logic Close to Data**

```tsx
// Responsibility ของ ContentItem เอง ว่า clone ยังไง
// ไม่ใช่ UI component หรือ utility function
// Single Responsibility Principle ✓
```

### 4. **Easy to Add Side Effects**

```tsx
clone(): ContentItem {
  // Can add logging without modifying client
  SessionLogger.getInstance().addLog(`Cloned "${this.title}"`);
  
  // Can add validation
  if (this.tags.length === 0) {
    console.warn('Cloning item with no tags');
  }

  // Can add metrics
  trackEvent('item_cloned', { itemType: 'project' });

  return new ContentItem(...);
}
```

---

## ✨ Design Benefits

- ✅ **สะดวกและง่าย (Convenience)**  
  เพียง `item.clone()` แค่นั้น

- ✅ **Loose Coupling**  
  UI ไม่รู้รายละเอียดของ cloning algorithm

- ✅ **Flexibility**  
  เปลี่ยนวิธี clone ได้โดยไม่เปลี่ยน client code

- ✅ **Self-Contained Logic**  
  Clone logic อยู่กับ object เอง

- ✅ **Easy Logging Integration**  
  Singleton logger สามารถ call ได้จาก clone() method

---

## 🔧 Advanced: Deep Clone vs Shallow Clone

### **Shallow Clone** (ปัจจุบัน)

```tsx
clone(): ContentItem {
  return new ContentItem(
    newId,
    `${this.title} (Copy)`,
    this.description,
    this.date,
    [...this.tags]  // ← Shallow copy (ก็พอสำหรับ string arrays)
  );
}
```

**ข้อดี:** Fast, Simple  
**ข้อเสีย:** ถ้า tags มี nested objects จะไม่ deep copy

### **Deep Clone** (ถ้าต้อง)

```tsx
clone(): ContentItem {
  // If tags had nested objects:
  const deepCopyTags = this.tags.map(tag => ({
    ...tag,  // deep copy each tag
    nested: structuredClone(tag.nested)
  }));

  return new ContentItem(
    newId,
    `${this.title} (Copy)`,
    this.description,
    this.date,
    deepCopyTags
  );
}
```

---

## 📚 Summary

Prototype Pattern ในระบบนี้:

1. **Encapsulate object duplication** ใน item เอง

2. **Support runtime copying** ของ complex objects

3. **Keep cloning logic close** ถึง data

4. **Enable side effects integration** (logging, validation)

### Integration with Other Patterns

```
Singleton (Logger)
       ↓
   clone() called
       ↓
   SessionLogger.getInstance().addLog()
       ↓
   useState triggers re-render
```

### Full Pattern Chain

```
User clicks "Clone" button
       ↓
handleCloneItem(item)
       ↓
item.clone()  ◄──── Prototype Pattern
├─→ Generate new ID
├─→ Call Singleton Logger  ◄──── Singleton Pattern
├─→ Return new ContentItem
       ↓
setState([clonedItem, ...items])  ◄──── Builder/State Management
       ↓
Re-render with cloned item
```

---

## 🚀 Implementation Tips

### **Adding Clone Validation**

```tsx
clone(): ContentItem {
  if (!this.id || !this.title) {
    throw new Error('Cannot clone incomplete item');
  }
  
  SessionLogger.getInstance().addLog(
    `Prototype: Cloned "${this.title}"`
  );

  return new ContentItem(
    Math.random().toString(36).substr(2, 9),
    `${this.title} (Copy)`,
    this.description,
    this.date,
    [...this.tags]
  );
}
```

### **Using Structuring Clone for True Deep Copy**

```tsx
clone(): ContentItem {
  const clonedItem = structuredClone({
    id: Math.random().toString(36).substr(2, 9),
    title: `${this.title} (Copy)`,
    description: this.description,
    date: this.date,
    tags: this.tags
  });

  SessionLogger.getInstance().addLog(
    `Prototype: Cloned "${this.title}"`
  );

  return clonedItem;
}
```

---

**Happy Cloning! 🧬✨**
