# 💾 Flyweight Pattern - เอกสารภาษาไทย

## 📋 สารบัญ

1. [บทนำ](#บทนำ)
2. [ปัญหาที่พบ](#ปัญหาที่พบ)
3. [โซลูชัน](#โซลูชัน)
4. [โครงสร้าง](#โครงสร้าง)
5. [การทำงาน](#การทำงาน)
6. [ตัวอย่างการใช้งาน](#ตัวอย่างการใช้งาน)
7. [ข้อดีและข้อเสีย](#ข้อดีและข้อเสีย)
8. [เมื่อไหร่ควรใช้](#เมื่อไหร่ควรใช้)
9. [การประยุกต์ใช้จริง](#การประยุกต์ใช้จริง)
10. [สรุป](#สรุป)

---

## 🎯 บทนำ

**Flyweight Pattern** เป็น Structural Design Pattern ที่ช่วย**ลดการใช้ memory** โดยการ**แชร์ objects** ที่มี intrinsic state (ข้อมูลภายในที่เหมือนกัน) ระหว่าง instances หลายๆ ตัว

### คำอธิบายแบบเปรียบเทียบ

**เหมือนห้องสมุดที่ให้ยืมหนังสือ:**
- ถ้าทุกคนซื้อหนังสือเล่มเดียวกัน → เปลือง เก็บซ้ำซ้อน
- แต่ถ้าทุกคนมาห้องสมุดยืม → ประหยัด มีแค่ 1 เล่ม
- หนังสือ = **intrinsic state** (เนื้อหาเดียวกันสำหรับทุกคน)
- คนที่ยืม, หน้าที่กำลังอ่าน = **extrinsic state** (แตกต่างกันแต่ละคน)

**ในโค้ด:**
- Tag "React" ถูกใช้ใน 50 projects → ไม่ต้องสร้าง 50 objects
- แชร์ 1 `TagFlyweight("React")` ให้ทุก project ใช้ร่วมกัน
- ข้อมูลที่เหมือนกัน (name, color, icon) = intrinsic state
- ข้อมูลที่ต่างกัน (ตำแหน่ง, ขนาด) = extrinsic state

---

## 🚨 ปัญหาที่พบ

### สถานการณ์

ในโปรเจกต์ Portfolio เรามี **tags** ที่ซ้ำกันเยอะมาก:

```typescript
const projects = [
  { title: 'Project 1', tags: ['React', 'TypeScript', 'Next.js'] },
  { title: 'Project 2', tags: ['React', 'TypeScript', 'Node'] },
  { title: 'Project 3', tags: ['React', 'Python', 'Docker'] },
  { title: 'Project 4', tags: ['React', 'TypeScript', 'AWS'] },
  // ... อีก 50 projects
];

// Tag "React" ปรากฏ 50 ครั้ง
// Tag "TypeScript" ปรากฏ 30 ครั้ง
// = สร้าง 80 tag objects แม้ข้อมูลจะเหมือนกัน!
```

### ปัญหาที่เจอ

**1. Memory Wasteful (เปลือง Memory)**

```typescript
// ❌ แต่ละ project สร้าง tags ซ้ำๆ กัน

// Project 1
const reactTag1 = { name: 'React', color: 'blue', icon: '⚛️' };

// Project 2  
const reactTag2 = { name: 'React', color: 'blue', icon: '⚛️' }; // ซ้ำ!

// Project 3
const reactTag3 = { name: 'React', color: 'blue', icon: '⚛️' }; // ซ้ำอีก!

// สิ้นเปลือง: 3 objects แม้ข้อมูลจะเหมือนกันทุกอย่าง
```

**2. ไม่มี Metadata ที่หลากหลาย**

```typescript
// แค่ string ธรรมดา
tags: ['React', 'TypeScript']

// ไม่มี:
// - สี (color)
// - ไอคอน (icon)
// - หมวดหมู่ (category)
// - การ render แบบต่างๆ
```

**3. ยากต่อการเปลี่ยนแปลงแบบ Global**

```typescript
// ต้องการเปลี่ยนสีของ tag "React" ทั้งหมด
// ❌ ต้องไปแก้ทุก object ที่สร้างไว้แล้ว
// ไม่มี centralized configuration
```

**4. Duplicate Configuration**

```typescript
// ต้อง config สี/ไอคอน ซ้ำๆ ในหลายที่
const reactTag = {
  name: 'React',
  color: 'blue',  // ต้องเขียนซ้ำทุกครั้ง
  icon: '⚛️',     // ต้องเขียนซ้ำทุกครั้ง
};
```

### ผลกระทบ

- 💾 **Memory Usage สูง** - objects ซ้ำๆ เต็ม memory
- ⚡ **Performance ต่ำ** - สร้าง objects มากเกินไป
- 🐛 **Bugs ง่าย** - config ไม่สอดคล้องกัน (typo, wrong color)
- 🔧 **Maintenance ยาก** - แก้ที่เดียว ต้องหาซ้ำทุกที่
- 📈 **Scalability จำกัด** - càng มี items มาก càng ช้า

---

## 💡 โซลูชัน

### Flyweight Pattern แก้ปัญหาอย่างไร

สร้าง **TagFlyweight + TagFlyweightFactory** ที่:

1. **แยก State**:
   - **Intrinsic State** (shared) → `name`, `color`, `icon`, `category`
   - **Extrinsic State** (unique) → `size`, `showIcon`, `position`, `context`

2. **Share Objects**:
   - Tag "React" มี 1 instance เดียว
   - ทุก project ที่ใช้ "React" จะชี้ไปที่ instance เดียวกัน

3. **Factory Management**:
   - `TagFlyweightFactory` เก็บ pool ของ shared flyweights
   - `getTag("React")` → ถ้ามีแล้ว return existing, ถ้ายังไม่มี create new

### Before vs After

#### ❌ Before Flyweight
```typescript
// Project 1
const p1 = {
  title: 'Project 1',
  tags: [
    { name: 'React', color: 'blue', icon: '⚛️' },  // Object 1
    { name: 'TypeScript', color: 'blue', icon: '📘' } // Object 2
  ]
};

// Project 2
const p2 = {
  title: 'Project 2',
  tags: [
    { name: 'React', color: 'blue', icon: '⚛️' },  // Object 3 (ซ้ำ!)
    { name: 'TypeScript', color: 'blue', icon: '📘' } // Object 4 (ซ้ำ!)
  ]
};

// Total: 4 objects (2 ซ้ำ)
// Memory: 400 bytes
```

#### ✅ After Flyweight
```typescript
const factory = TagFlyweightFactory.getInstance();

// Create shared flyweights (สร้างครั้งเดียว)
const reactFlyweight = factory.getTag('React');       // Object 1
const tsFlyweight = factory.getTag('TypeScript');     // Object 2

// Project 1 ใช้ flyweights ที่แชร์
const p1 = {
  title: 'Project 1',
  tagNames: ['React', 'TypeScript'], // แค่ชื่อ
  // เวลา render จะเรียก factory.getTag() ซึ่ง return existing flyweights
};

// Project 2 ใช้ flyweights เดียวกัน (ไม่สร้างใหม่!)
const p2 = {
  title: 'Project 2',
  tagNames: ['React', 'TypeScript'], // ชี้ไปที่ flyweights เดียวกัน
};

// Total: 2 objects (ไม่มีซ้ำ)
// Memory: 200 bytes
// Saved: 50%! 🎉
```

---

## 🏗️ โครงสร้าง

### Components

#### 1. **ITagFlyweight (Flyweight Interface)**

```typescript
interface ITagFlyweight {
  getName(): string;
  getColor(): string;
  getIcon(): string;
  getCategory(): string;
  render(context?: RenderContext): React.ReactNode;
}
```

**หน้าที่:**
- กำหนด interface สำหรับ flyweight objects
- รับ extrinsic state ผ่าน parameters

---

#### 2. **TagFlyweight (Concrete Flyweight)**

```typescript
class TagFlyweight implements ITagFlyweight {
  // Intrinsic State (shared, immutable)
  private readonly name: string;
  private readonly color: string;
  private readonly icon: string;
  private readonly category: string;

  constructor(name: string, color: string, icon: string, category: string) {
    this.name = name;
    this.color = color;
    this.icon = icon;
    this.category = category;
    
    SessionLogger.getInstance().addLog(
      `Flyweight Pattern: Created new tag flyweight "${name}"`
    );
  }

  getName(): string { return this.name; }
  getColor(): string { return this.color; }
  getIcon(): string { return this.icon; }
  getCategory(): string { return this.category; }

  render(context?: { size?: 'sm' | 'md' | 'lg'; showIcon?: boolean }): React.ReactNode {
    const size = context?.size || 'sm';
    const showIcon = context?.showIcon !== false;

    // ใช้ intrinsic state (name, color, icon) + extrinsic context (size, showIcon)
    return (
      <span className={`tag ${this.color} ${size}`}>
        {showIcon && <span>{this.icon}</span>}
        <span>{this.name}</span>
      </span>
    );
  }
}
```

**คุณสมบัติ:**
- **Intrinsic State** (shared, อยู่ใน flyweight):
  - `name` - ชื่อ tag (เช่น "React")
  - `color` - สี (เช่น "blue")
  - `icon` - ไอคอน (เช่น "⚛️")
  - `category` - หมวดหมู่ (เช่น "framework")

- **Extrinsic State** (unique, ส่งเข้ามาผ่าน context):
  - `size` - ขนาด ('sm', 'md', 'lg')
  - `showIcon` - แสดงไอคอนหรือไม่
  - `position` - ตำแหน่งใน array
  - `container` - อยู่ใน ContentItem ไหน

**จุดสำคัญ:**
- Intrinsic state เป็น `readonly` (immutable)
- Log เมื่อสร้างครั้งแรก (แสดงว่ามี flyweight ใหม่)
- `render()` รับ context เป็น parameter (extrinsic state)

---

#### 3. **TagFlyweightFactory (Flyweight Factory)**

```typescript
class TagFlyweightFactory {
  private static instance: TagFlyweightFactory; // Singleton
  private flyweights: Map<string, ITagFlyweight> = new Map();
  private tagConfigs: Record<string, Config> = {
    'React': { color: 'blue', icon: '⚛️', category: 'framework' },
    'TypeScript': { color: 'blue', icon: '📘', category: 'language' },
    // ... more configs
  };

  private constructor() {
    SessionLogger.getInstance().addLog(
      "Flyweight Pattern: TagFlyweightFactory initialized"
    );
  }

  public static getInstance(): TagFlyweightFactory {
    if (!TagFlyweightFactory.instance) {
      TagFlyweightFactory.instance = new TagFlyweightFactory();
    }
    return TagFlyweightFactory.instance;
  }

  // Core Flyweight Pattern: Get or Create
  public getTag(name: string): ITagFlyweight {
    // ถ้ามี flyweight แล้ว → return existing
    if (this.flyweights.has(name)) {
      return this.flyweights.get(name)!; // ไม่สร้างใหม่!
    }

    // ถ้ายังไม่มี → create new และ store in pool
    const config = this.tagConfigs[name] || { /* default */ };
    const flyweight = new TagFlyweight(name, config.color, config.icon, config.category);
    
    this.flyweights.set(name, flyweight);
    return flyweight;
  }

  // Get multiple tags
  public getTags(names: string[]): ITagFlyweight[] {
    return names.map(name => this.getTag(name));
  }

  // Register new tag configuration
  public registerTag(name: string, color: string, icon: string, category: string): void {
    this.tagConfigs[name] = { color, icon, category };
    SessionLogger.getInstance().addLog(`Flyweight Pattern: Registered tag "${name}"`);
  }

  // Statistics
  public getStats() {
    const uniqueTags = this.flyweights.size;
    const totalUsage = uniqueTags * 4; // estimate
    const memorySaved = ((totalUsage - uniqueTags) / totalUsage) * 100;
    
    return { uniqueTags, totalUsage, memorySaved };
  }
}
```

**หน้าที่:**
- **Manage Pool** - เก็บ flyweights ที่สร้างแล้วใน Map
- **Reuse or Create** - ถ้ามีแล้ว return existing, ถ้ายังไม่มี create new
- **Centralized Config** - เก็บ configuration ของ tags ทั้งหมดที่เดียว
- **Statistics** - คำนวณ memory savings

---

#### 4. **ContentItem (Client)**

```typescript
class ContentItem {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public date: string,
    public tags: string[] // แค่เก็บชื่อ
  ) {}

  // เมื่อต้องการ render tags
  renderTags(size: 'sm' | 'md' | 'lg' = 'sm'): React.ReactNode[] {
    const factory = TagFlyweightFactory.getInstance();
    
    return this.tags.map(tagName => {
      const flyweight = factory.getTag(tagName); // Get shared flyweight
      return flyweight.render({ size, showIcon: true }); // Pass extrinsic state
    });
  }
}
```

**คุณสมบัติ:**
- เก็บแค่ `tags: string[]` (ชื่อ tag)
- เมื่อต้อง render → เรียก `factory.getTag()` เพื่อเอา shared flyweight
- ส่ง extrinsic state (size, showIcon) เข้าไปใน `render()`

---

## ⚙️ การทำงาน

### Flow Diagram

```
1. Client ต้องการ tag "React"
   │
   ├─→ เรียก factory.getTag("React")
   │
   ├─→ Factory เช็คใน pool
   │   │
   │   ├─ ถ้ามีแล้ว → return existing flyweight (ไม่สร้างใหม่!)
   │   │
   │   └─ ถ้ายังไม่มี → สร้าง TagFlyweight("React", ...) และ store in pool
   │
   └─→ Client ได้ flyweight มาแล้ว
       │
       └─→ เรียก flyweight.render({ size: 'md', showIcon: true })
           │
           └─→ Render ด้วย intrinsic state + extrinsic context
```

---

### ขั้นตอนการทำงาน

#### Step 1: Factory Initialization

```typescript
const factory = TagFlyweightFactory.getInstance();

// Factory initialized (Singleton)
// Pool = {} (empty)
```

---

#### Step 2: First Tag Request (Create New)

```typescript
const reactTag = factory.getTag('React');

// ขั้นตอน:
// 1. เช็ค pool → ไม่มี 'React'
// 2. หา config: { color: 'blue', icon: '⚛️', category: 'framework' }
// 3. สร้าง: new TagFlyweight('React', 'blue', '⚛️', 'framework')
// 4. เก็บใน pool: pool.set('React', flyweight)
// 5. Log: "Flyweight Pattern: Created new tag flyweight 'React'"
// 6. Return flyweight

// Pool = { 'React' => TagFlyweight(...) }
```

---

#### Step 3: Second Tag Request (Reuse Existing)

```typescript
const reactTag2 = factory.getTag('React');

// ขั้นตอน:
// 1. เช็ค pool → มี 'React' แล้ว!
// 2. Return existing flyweight (ไม่สร้างใหม่!)
// 3. ไม่มี log (เพราะไม่ได้สร้างใหม่)

// Pool = { 'React' => TagFlyweight(...) } (เหมือนเดิม)

console.log(reactTag === reactTag2); // true (same instance!)
```

---

#### Step 4: Render with Extrinsic Context

```typescript
// Project 1: Small tag with icon
const smallTag = reactTag.render({ size: 'sm', showIcon: true });

// Project 2: Large tag without icon
const largeTag = reactTag.render({ size: 'lg', showIcon: false });

// Project 3: Medium tag with icon
const mediumTag = reactTag.render({ size: 'md', showIcon: true });

// Same flyweight object (intrinsic state)
// Different contexts (extrinsic state)
// = Different visual outputs!
```

---

#### Step 5: Statistics

```typescript
// สร้าง projects หลายตัว
factory.getTag('React');       // สร้างครั้งแรก
factory.getTag('TypeScript');  // สร้างครั้งแรก
factory.getTag('React');       // reuse
factory.getTag('Node');        // สร้างครั้งแรก
factory.getTag('TypeScript');  // reuse
factory.getTag('React');       // reuse

// Statistics
const stats = factory.getStats();
// {
//   uniqueTags: 3,           // React, TypeScript, Node
//   totalUsage: 6,           // ใช้ทั้งหมด 6 ครั้ง
//   memorySaved: 50%         // ประหยัด 50%!
// }
```

---

## 💻 ตัวอย่างการใช้งาน

### ตัวอย่างที่ 1: สร้าง Project ด้วย Shared Tags

#### ก่อนใช้ Flyweight (เปลือง)

```typescript
// ❌ แต่ละ project สร้าง tag objects ใหม่

const project1 = {
  title: 'Project 1',
  tags: [
    { name: 'React', color: 'blue', icon: '⚛️' },     // Object 1
    { name: 'TypeScript', color: 'blue', icon: '📘' } // Object 2
  ]
};

const project2 = {
  title: 'Project 2',
  tags: [
    { name: 'React', color: 'blue', icon: '⚛️' },     // Object 3 (ซ้ำ!)
    { name: 'TypeScript', color: 'blue', icon: '📘' } // Object 4 (ซ้ำ!)
  ]
};

// Total: 4 objects
// Memory: ~400 bytes
```

#### หลังใช้ Flyweight (ประหยัด)

```typescript
// ✅ ทุก project แชร์ flyweights เดียวกัน

const factory = TagFlyweightFactory.getInstance();

// สร้าง projects (ใช้แค่ชื่อ tag)
const project1 = new ContentItem('1', 'Project 1', '...', '2024', ['React', 'TypeScript']);
const project2 = new ContentItem('2', 'Project 2', '...', '2024', ['React', 'TypeScript']);

// เวลา render
const p1Tags = factory.getTags(project1.tags); // Get shared flyweights
const p2Tags = factory.getTags(project2.tags); // Get same flyweights!

console.log(p1Tags[0] === p2Tags[0]); // true (same "React" flyweight)
console.log(p1Tags[1] === p2Tags[1]); // true (same "TypeScript" flyweight)

// Total: 2 flyweight objects
// Memory: ~200 bytes
// Saved: 50%! 🎉
```

---

### ตัวอย่างที่ 2: Register Custom Tag

```typescript
const factory = TagFlyweightFactory.getInstance();

// Register new tag type
factory.registerTag(
  'MyFramework',   // name
  'pink',          // color
  '✨',            // icon
  'custom'         // category
);

// Create project with custom tag
const project = new ContentItem(
  '1',
  'Custom Project',
  'Uses custom tag flyweight',
  '2024',
  ['MyFramework', 'React']
);

// Render tags
const tags = factory.getTags(project.tags);
tags.forEach(tag => {
  console.log(tag.getName(), tag.getColor(), tag.getIcon());
});

// Output:
// MyFramework pink ✨
// React blue ⚛️

// Both tags are flyweights (shared across projects)
```

---

### ตัวอย่างที่ 3: Extrinsic State Rendering

```typescript
const factory = TagFlyweightFactory.getInstance();
const reactTag = factory.getTag('React');

// Same flyweight, different contexts
const contexts = [
  { size: 'sm', showIcon: true },   // Small with icon
  { size: 'md', showIcon: false },  // Medium without icon
  { size: 'lg', showIcon: true },   // Large with icon
];

contexts.forEach(context => {
  const rendered = reactTag.render(context);
  // Same intrinsic state (name, color, icon)
  // Different extrinsic state (size, showIcon)
  // = Different visual outputs!
});
```

---

### ตัวอย่างที่ 4: Memory Savings Calculation

```typescript
const factory = TagFlyweightFactory.getInstance();

// สมมติมี 50 projects, แต่ละ project ใช้ 4 tags
// แต่มีแค่ 10 unique tags
const uniqueTags = ['React', 'TypeScript', 'Node', 'Python', 'Docker', 'AWS', 'Next.js', 'GraphQL', 'MongoDB', 'Redis'];

// สร้าง 50 projects (mock)
for (let i = 0; i < 50; i++) {
  // แต่ละ project random 4 tags จาก uniqueTags
  const tags = [];
  for (let j = 0; j < 4; j++) {
    const randomTag = uniqueTags[Math.floor(Math.random() * uniqueTags.length)];
    tags.push(randomTag);
  }
  
  const project = new ContentItem(`p${i}`, `Project ${i}`, '...', '2024', tags);
}

// Statistics
const stats = factory.getStats();
console.log(`Unique flyweights: ${stats.uniqueTags}`);       // 10
console.log(`Total tag usage: ${stats.totalUsage}`);          // 200 (50 projects × 4 tags)
console.log(`Memory saved: ${stats.memorySaved}%`);           // 95%!

// Without Flyweight: 200 tag objects × 100 bytes = 20,000 bytes
// With Flyweight: 10 flyweight objects × 100 bytes = 1,000 bytes
// Saved: 19,000 bytes (95%)! 🎉
```

---

### ตัวอย่างที่ 5: ใช้งานใน React Component

```typescript
function ProjectCard({ project }: { project: ContentItem }) {
  const factory = TagFlyweightFactory.getInstance();
  
  return (
    <div className="project-card">
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      
      {/* Render tags using flyweights */}
      <div className="tags">
        {project.tags.map(tagName => {
          const flyweight = factory.getTag(tagName); // Get shared flyweight
          
          // Render with extrinsic context
          return flyweight.render({ 
            size: 'md',      // Extrinsic
            showIcon: true   // Extrinsic
          });
        })}
      </div>
    </div>
  );
}

// แม้จะมี 100 ProjectCard components
// Tag "React" ก็มี 1 flyweight instance เท่านั้น
// = Memory efficient! 🚀
```

---

## ✅ ข้อดีและข้อเสีย

### ข้อดี

#### 1. **Memory Efficiency** 💾
```
ลด memory usage อย่างมาก (50-95%)
แชร์ objects ที่มี intrinsic state เหมือนกัน
เหมาะกับ large datasets
```

**ตัวอย่าง:**
```typescript
// 1,000 projects × 4 tags = 4,000 tag usages
// มีแค่ 20 unique tags

// Without Flyweight: 4,000 objects × 100 bytes = 400 KB
// With Flyweight: 20 objects × 100 bytes = 2 KB
// Saved: 398 KB (99.5%)! 🎉
```

---

#### 2. **Centralized Configuration** ⚙️
```
Configuration อยู่ที่เดียว (Factory)
แก้ที่เดียว กระทบทั้งระบบ
ง่ายต่อการ maintain
```

**ตัวอย่าง:**
```typescript
// แก้สีของ "React" ที่เดียว
factory.registerTag('React', 'purple', '⚛️', 'framework'); // เปลี่ยนเป็น purple

// ทุก project ที่ใช้ "React" จะได้สี purple อัตโนมัติ!
// ไม่ต้องไปแก้ทีละ project
```

---

#### 3. **Performance Improvement** ⚡
```
ลดเวลาสร้าง objects
Factory lookup เร็วกว่าสร้างใหม่
Initialization ครั้งเดียว
```

---

#### 4. **Transparency** 🔍
```
Client ไม่รู้ว่ามีการแชร์
API ง่าย ใช้งานเหมือนปกติ
ไม่กระทบ existing code
```

---

#### 5. **Scalability** 📈
```
Handle large datasets ได้ดี
Memory usage เติบโตช้า
Consistent performance
```

---

#### 6. **Rich Metadata** 🎨
```
Flyweight เก็บข้อมูลเพิ่ม (color, icon, category)
Render ได้หลายแบบ (size, style)
Flexible rendering
```

---

### ข้อเสีย

#### 1. **Complexity** 🤯
- เพิ่ม Factory layer
- ต้องแยก intrinsic/extrinsic state
- เข้าใจยากสำหรับ junior

**แก้:** ใช้เฉพาะเมื่อมี sharing significant

---

#### 2. **State Separation** 📦
- ต้องแยก state อย่างชัดเจน
- intrinsic = shared (immutable)
- extrinsic = unique (parameters)

**แก้:** Document ให้ชัดเจน

---

#### 3. **Factory Overhead** ⏱️
- ต้อง lookup ใน Map ทุกครั้ง
- O(1) lookup แต่ก็มี overhead
- Negligible compared to memory savings

---

#### 4. **Thread Safety** 🔒
- Shared state ใน multi-threaded environment
- ต้อง handle concurrency

**แก้:** ใช้ immutable intrinsic state

---

#### 5. **Debugging Complexity** 🐛
- ยากต่อการ debug
- Objects ไม่ unique
- Shared reference confusing

**แก้:** ใช้ logging + clear naming

---

### เปรียบเทียบข้อดี - ข้อเสีย

| ข้อดี ✅ | ข้อเสีย ❌ | คะแนน |
|---------|----------|-------|
| Memory Efficiency | Complexity | 9/10 |
| Centralized Config | State Separation | 8/10 |
| Performance | Factory Overhead | 8/10 |
| Transparency | Thread Safety | 7/10 |
| Scalability | Debugging | 9/10 |
| Rich Metadata | - | 8/10 |

**Overall: 8/10** - ดีมากสำหรับ use cases ที่เหมาะสม

---

## 🤔 เมื่อไหร่ควรใช้

### ✅ ใช้ Flyweight เมื่อ:

#### 1. **มี Objects เยอะที่มี Shared State**
```
หลักพัน/หลักหมื่น instances
ส่วนใหญ่มี intrinsic state เหมือนกัน
Memory เป็นปัญหา
```

**ตัวอย่าง:**
- Tags ที่ซ้ำกัน (React, TypeScript, etc.)
- Icons/Sprites ใน game
- Characters ใน text editor
- Map markers ของประเภทเดียวกัน

---

#### 2. **แยก State ได้ชัดเจน**
```
รู้ว่าอะไรเป็น intrinsic (shared)
รู้ว่าอะไรเป็น extrinsic (unique)
Extrinsic state ส่งเป็น parameter ได้
```

**ตัวอย่าง:**
```typescript
// Intrinsic: name, color, icon (เหมือนกันสำหรับ tag "React" ทุกตัว)
// Extrinsic: size, position, showIcon (ต่างกันแต่ละ context)
```

---

#### 3. **Memory Critical**
```
Mobile/Embedded systems
Large datasets
Memory-constrained environments
```

**ตัวอย่าง:**
- Mobile apps (limited RAM)
- Browser apps (memory leaks)
- Real-time systems

---

#### 4. **Centralized Configuration ดีกว่า**
```
ต้องการเปลี่ยน config แบบ global
ต้องการ consistency
ลด duplication
```

---

### ❌ ไม่ควรใช้ Flyweight เมื่อ:

#### 1. **Objects น้อย**
```
< 100 instances
Memory ไม่เป็นปัญหา
Over-engineering
```

**ตัวอย่าง:**
- Settings page (มี configs 10-20 ตัว)
- Navigation menu (มี items < 20)

---

#### 2. **ไม่มี Shared State**
```
ทุก object unique
ไม่มีอะไรแชร์
Flyweight ไม่ช่วยอะไร
```

---

#### 3. **Simple Use Case**
```
YAGNI (You Aren't Gonna Need It)
Premature optimization
เพิ่ม complexity โดยไม่จำเป็น
```

---

#### 4. **State Separation ยาก**
```
แยก intrinsic/extrinsic ไม่ได้
State ต้อง mutable
Extrinsic state ส่งเป็น parameter ไม่ได้
```

---

## 🌍 การประยุกต์ใช้จริง

### 1. **Text Editors (Characters)**

```typescript
// Text editor แบบไม่ใช้ Flyweight = เปลือง memory มาก!

// ❌ Without Flyweight
const document = [
  { char: 'H', font: 'Arial', size: 12, color: 'black', x: 0, y: 0 },
  { char: 'e', font: 'Arial', size: 12, color: 'black', x: 10, y: 0 },
  { char: 'l', font: 'Arial', size: 12, color: 'black', x: 20, y: 0 },
  { char: 'l', font: 'Arial', size: 12, color: 'black', x: 30, y: 0 }, // ซ้ำ!
  { char: 'o', font: 'Arial', size: 12, color: 'black', x: 40, y: 0 },
  // ... 10,000 characters
];

// Document ขนาด 10,000 characters
// = 10,000 objects (แม้ font/size/color จะเหมือนกัน!)

// ✅ With Flyweight
class CharacterFlyweight {
  constructor(
    private font: string,    // Intrinsic
    private size: number,    // Intrinsic
    private color: string    // Intrinsic
  ) {}
  
  render(char: string, x: number, y: number) {
    // char, x, y = extrinsic
  }
}

// Document มี 10,000 characters
// แต่มีแค่ ~10 unique font/size/color combinations
// = 10 flyweights instead of 10,000 objects
// Saved: 99.9%! 🎉
```

---

### 2. **Game Engines (Sprites)**

```typescript
// Game ที่มีศัตรูเยอะๆ

// ❌ Without Flyweight
const enemies = [
  { sprite: goblinImage, animations: goblinAnims, x: 100, y: 200, hp: 50 },
  { sprite: goblinImage, animations: goblinAnims, x: 150, y: 250, hp: 50 }, // ซ้ำ!
  { sprite: goblinImage, animations: goblinAnims, x: 200, y: 300, hp: 50 }, // ซ้ำ!
  // ... 1,000 goblins (แต่ sprite/animations เหมือนกันหมด!)
];

// ✅ With Flyweight
class SpriteFlyweight {
  constructor(
    private texture: Texture,     // Intrinsic (sprite image)
    private animations: Map       // Intrinsic (animation data)
  ) {}
  
  render(x: number, y: number, rotation: number) {
    // position, rotation = extrinsic
  }
}

const goblinSprite = new SpriteFlyweight(goblinTexture, goblinAnims);

const enemies = [
  { flyweight: goblinSprite, x: 100, y: 200, hp: 50 },
  { flyweight: goblinSprite, x: 150, y: 250, hp: 50 }, // แชร์ sprite เดียวกัน!
  { flyweight: goblinSprite, x: 200, y: 300, hp: 50 }, // แชร์ sprite เดียวกัน!
  // ... 1,000 goblins sharing 1 sprite
];

// Texture image: ~5 MB
// Without Flyweight: 1,000 × 5 MB = 5 GB! 💀
// With Flyweight: 1 × 5 MB = 5 MB ✅
// Saved: 4.995 GB (99.9%)!
```

---

### 3. **Google Maps (Markers)**

```typescript
// Google Maps มี markers หลักล้าน

// ❌ Without Flyweight
const markers = [
  { icon: restaurantIcon, lat: 13.7, lng: 100.5, name: 'Restaurant 1' },
  { icon: restaurantIcon, lat: 13.8, lng: 100.6, name: 'Restaurant 2' }, // icon ซ้ำ!
  { icon: hotelIcon, lat: 13.9, lng: 100.7, name: 'Hotel 1' },
  { icon: hotelIcon, lat: 14.0, lng: 100.8, name: 'Hotel 2' }, // icon ซ้ำ!
  // ... millions of markers
];

// ✅ With Flyweight
class MarkerFlyweight {
  constructor(
    private icon: Image,      // Intrinsic
    private type: string      // Intrinsic
  ) {}
  
  render(lat: number, lng: number, data: any) {
    // coordinates, data = extrinsic
  }
}

// มี marker types: restaurant, hotel, cafe, gas, etc. (~50 types)
// แต่มี markers หลักล้าน
// = 50 flyweights for millions of markers
// Saved: 99.995%! 🎉
```

---

### 4. **React Components (Icons/Tags)**

```typescript
// React app ที่ใช้ tags เยอะ

// ❌ Without Flyweight
function TagComponent({ name, color, icon }: TagProps) {
  // แต่ละครั้งสร้าง tag object ใหม่
  return <span className={color}>{icon} {name}</span>;
}

// 500 places ที่ใช้ "React" tag
// = 500 times rendering component
// ถ้า inline สร้าง object → 500 objects

// ✅ With Flyweight
const factory = TagFlyweightFactory.getInstance();

function TagComponent({ name }: { name: string }) {
  const flyweight = factory.getTag(name); // Get shared flyweight
  return flyweight.render({ size: 'md', showIcon: true });
}

// 500 places ใช้ "React" tag
// = 1 flyweight shared across all
// Memory efficient! ✅
```

---

### 5. **Database Connection Pools**

```typescript
// Connection pool เป็น Flyweight แบบหนึ่ง!

// ❌ Without Pool
function queryDatabase(sql: string) {
  const connection = createNewConnection(); // สร้างใหม่ทุกครั้ง (ช้า!)
  const result = connection.execute(sql);
  connection.close();
  return result;
}

// 1,000 queries = 1,000 connections created
// Slow! เปลือง resources!

// ✅ With Connection Pool (Flyweight)
class ConnectionPool {
  private pool: Connection[] = [];
  
  getConnection(): Connection {
    // Return existing connection from pool
    if (this.pool.length > 0) {
      return this.pool.pop()!; // Reuse!
    }
    return createNewConnection();
  }
  
  releaseConnection(conn: Connection) {
    this.pool.push(conn); // Return to pool
  }
}

function queryDatabase(sql: string) {
  const conn = pool.getConnection(); // Get from pool (fast!)
  const result = conn.execute(sql);
  pool.releaseConnection(conn);      // Return to pool
  return result;
}

// 1,000 queries = maybe 10-20 connections reused
// Fast! ประหยัด resources! ✅
```

---

## 🎓 สรุป

### Key Takeaways

1. **Flyweight = Share Intrinsic State**
   - แชร์ objects ที่มี intrinsic state เหมือนกัน
   - ลด memory usage อย่างมาก (50-95%)

2. **แยก State ชัดเจน**
   - **Intrinsic** = shared, immutable, อยู่ใน flyweight
   - **Extrinsic** = unique, passed as parameters

3. **Factory Pattern**
   - Factory จัดการ pool ของ shared flyweights
   - `getTag()` → return existing หรือ create new

4. **Transparency**
   - Client ไม่รู้ว่ามีการแชร์
   - API ง่าย ใช้งานเหมือนปกติ

5. **Use Case**
   - มี objects เยอะที่มี shared state
   - Memory critical applications
   - Large datasets

---

### เมื่อไหร่ควรใช้

```
✅ ใช้เมื่อ:
- มี objects เยอะ (>1000)
- ส่วนใหญ่มี shared state
- Memory เป็นปัญหา
- แยก intrinsic/extrinsic ได้ชัดเจน

❌ ไม่ใช้เมื่อ:
- Objects น้อย (<100)
- ไม่มี shared state
- Over-engineering
- State separation ยาก
```

---

### ข้อควรระวัง

1. **State Separation** - แยก intrinsic/extrinsic ให้ชัดเจน
2. **Immutability** - Intrinsic state ต้อง immutable
3. **Thread Safety** - Shared state ต้อง thread-safe
4. **Documentation** - อธิบาย state separation ให้ชัด
5. **Profiling** - วัด memory savings ให้เห็นจริง

---

### Next Steps

เรียนรู้ patterns อื่นๆ ที่ทำงานร่วมกับ Flyweight:
- [Facade Pattern](./facade.md) - Simplified interface
- [Composite Pattern](./composite.md) - Tree structure (can use flyweights)
- [Proxy Pattern](./proxy.md) - Similar caching concept
- [Singleton Pattern](./singleton.md) - Factory is typically Singleton

---

**Pattern Type**: Structural Design Pattern  
**Complexity**: Medium  
**Use Frequency**: Medium (specific use cases) ⭐⭐⭐  
**Memory Impact**: Very High (50-95% reduction) ⭐⭐⭐⭐⭐  
**Real-world Examples**: Text editors, Game engines, Google Maps, React apps

สร้างโดย: Portfolio Design Patterns Project  
อัพเดทล่าสุด: ธันวาคม 2024  
เอกสารที่เกี่ยวข้อง: [flyweight.md](../diagram/flyweight.md) (Mermaid Diagrams)
