# Builder Pattern — Page Composition

## 📖 Intent

แยก **การสร้าง (construction)** ของ object ที่ซับซ้อน จากการ **นำเสนอ (representation)** ของมัน  
เพื่อให้กระบวนการสร้างเดียวกัน สามารถสร้าง representations ต่างกันได้

## 🎨 Application Context

Builder Pattern ถูกใช้เพื่อประกอบหน้าเว็บอย่างไดนามิก  
โดยขึ้นอยู่กับ:
- **User Persona:** developer, researcher, student
- **Selected Theme:** minimal, creative, academic

### ตัวอย่างการใช้งาน

```tsx
// Persona 1: Developer
builder.addHero("Full-Stack Developer", "...");
builder.addSkills(['React', 'TypeScript', 'Docker']);
builder.addSection("Featured Projects", projects);
builder.addSection("Tech Blog", blogs);

// Persona 2: Researcher
builder.addHero("Dr. Researcher", "...");
builder.addSection("Academic Publications", research);
builder.addSection("Implementation Prototypes", projects);
builder.addSkills(['Python', 'Statistics', 'LaTeX']);
```

---

## 🏗️ Participants

### 1. Builder Interface — `IPageBuilder`

**Description**

`IPageBuilder` ประกาศ interface สำหรับขั้นตอน (steps) ในการสร้างหน้า

**Methods**

| Method | Parameters | Purpose |
|--------|-----------|---------|
| `reset()` | — | ล้างสถานะเดิม |
| `setTheme()` | `theme, layoutStyle` | เลือก theme และ layout |
| `setCloneHandler()` | `handler` | กำหนด callback สำหรับ clone items |
| `addHero()` | `title, subtitle` | เพิ่ม hero section |
| `addSkills()` | `skills[]` | เพิ่ม skills list |
| `addSection()` | `title, items, icon` | เพิ่ม content section |
| `build()` | — | ส่งคืน final ReactNode tree |

---

### 2. Concrete Builder — `PortfolioPageBuilder`

**Description**

`PortfolioPageBuilder` implements `IPageBuilder` interface  
รักษาสถานะภายในขณะสร้างหน้า

**Internal State**

```tsx
private elements: React.ReactNode[] = [];
private currentTheme: UIThemeFactory = MinimalThemeFactory;
private currentLayoutStyle: LayoutStyle = 'minimal';
private onClone: (item: ContentItem) => void = () => {};
```

**Key Responsibilities**

- เก็บ elements ที่จะ render เป็น array
- ติดตามธีมและ layout style ปัจจุบัน
- ประกอบ components ตามลำดับ

**Example Flow**

```tsx
const builder = new PortfolioPageBuilder();

builder.reset();                              // 1. ล้างสถานะ
builder.setTheme(MinimalThemeFactory, 'minimal');  // 2. ตั้งค่าธีม
builder.setCloneHandler(handleClone);        // 3. ตั้ง handler
builder.addHero("Title", "Subtitle");        // 4. เพิ่ม hero
builder.addSkills(['Skill1', 'Skill2']);     // 5. เพิ่ม skills
builder.addSection("Section", items, Icon);  // 6. เพิ่ม section
const page = builder.build();                // 7. สร้าง final page
```

---

### 3. Product — `Page (ReactNode Tree)`

**Description**

ผลลัพธ์สุดท้าย: React component tree ที่ประกอบจากหลาย elements

```tsx
<div className="animate-slideUp">
  <HeroWrapper ... />
  <SkillsSection ... />
  <ProjectsSection ... />
  <BlogSection ... />
  {/* more sections */}
</div>
```

---

### 4. Director — `PersonalWebsiteUltimate (Component)`

**Description**

`PersonalWebsiteUltimate` เป็น **Director** ที่:
- ควบคุมลำดับของขั้นตอนการสร้าง
- เลือก sections ตามมาตรฐานที่เหมาะสม
- บอก builder ว่าต้องสร้างอะไร

**Director Logic**

```tsx
export default function PersonalWebsiteUltimate() {
  const [style, setStyle] = useState<LayoutStyle>('minimal');
  const [persona, setPersona] = useState<UserPersona>('developer');

  const builder = new PortfolioPageBuilder();
  const theme = getTheme(style);
  
  builder.reset();
  builder.setTheme(theme, style);
  builder.setCloneHandler(handleCloneItem);

  // Director ตัดสินใจว่าจะสร้างอะไรตาม persona
  switch (persona) {
    case 'developer':
      builder.addHero("Full-Stack Developer", "...");
      builder.addSkills(['React', 'TypeScript', ...]);
      builder.addSection("Featured Projects", projects, Code);
      builder.addSection("Tech Blog", blogs, Feather);
      break;

    case 'researcher':
      builder.addHero("Dr. Researcher", "...");
      builder.addSection("Academic Publications", research, Book);
      builder.addSection("Implementation Prototypes", projects, Cpu);
      builder.addSkills(['Python', 'Statistics', ...]);
      break;

    case 'student':
      builder.addHero("CS Student @ University", "...");
      builder.addSkills(['Java', 'C++', ...]);
      builder.addSection("Coursework Projects", projects, Layers);
      builder.addSection("Study Notes", research, FileText);
      break;
  }

  return builder.build();
}
```

---

## ⚙️ Responsibilities

Builder Pattern ต้องรับผิดชอบ:

- ✅ **Encapsulate Page Assembly Logic**  
  ทำให้ director ไม่ต้องรู้รายละเอียดของการประกอบ

- ✅ **Allow Different Representations**  
  Persona ต่างกัน → Page structure ต่างกัน

- ✅ **Separate "What" from "How"**  
  Director ระบุ "สร้างอะไร" → Builder ระบุ "สร้างยังไง"

- ✅ **Maintain Internal State**  
  Builder รักษา elements array และ state ระหว่างการสร้าง

---

## 🔗 Collaboration

### Pattern Integration

```
┌──────────────────────┐
│ PersonalWebsiteUltimate
│ (Director/Client)
└──────────┬───────────┘
           │
           │ "สร้างหน้า developer"
           ▼
┌────────────────────────────┐
│ PortfolioPageBuilder        │
│ (Concrete Builder)          │
│ ┌────────────────────────┐  │
│ │ reset()                │  │
│ │ setTheme()             │  │
│ │ addHero()              │  │
│ │ addSkills()            │  │
│ │ addSection()           │  │
│ │ build()                │  │
│ └────────────────────────┘  │
└──────────┬───────────────────┘
           │
    ┌──────┴──────┬──────────┬──────────┐
    │             │          │          │
    ▼             ▼          ▼          ▼
 Abstract     Factory    Prototype   Singleton
 Factory      Method     Pattern     Pattern
   (Theme) (Layout)    (Data)       (Logger)
```

### How Builders Use Other Patterns

**1. Abstract Factory (Themes)**
```tsx
builder.setTheme(CreativeThemeFactory, 'creative');
// Theme's components ถูกเก็บใน builder state
```

**2. Factory Method (Layouts)**
```tsx
const LayoutComponent = SectionFactory(this.currentLayoutStyle);
// Factory เลือก ListLayout หรือ GridLayout
```

**3. Prototype Pattern (Data)**
```tsx
const clonedItem = item.clone();
// Prototype pattern ใช้สำหรับ clone items
```

**4. Singleton (Logging)**
```tsx
SessionLogger.getInstance().addLog(`Builder: Added section...`);
// Log ทั้งหมด ไปที่ instance เดียว
```

---

## 💡 Why Builder Fits Here

### 1. **Page Structure is Complex**
- Hero section, skills, multiple content sections
- ไม่สามารถสร้างด้วย simple constructor

### 2. **Construction Depends on Runtime Decisions**
```tsx
// ต้องรอ user เลือก persona ก่อยจะรู้ว่าสร้างอะไร
const [persona, setPersona] = useState<UserPersona>('developer');

switch (persona) {
  // Different sections per persona
}
```

### 3. **Improves Readability**
```tsx
// Builder ทำให้ step-by-step construction ชัดเจน
builder.addHero(...);
builder.addSkills(...);
builder.addSection(...); // readable & intentional
```

### 4. **Flexibility & Reusability**
- ลองเปลี่ยน persona → ออกมาหน้าต่างกัน
- ลองเปลี่ยน theme → ออกมา style ต่างกัน
- Everything work together harmoniously

---

## ✨ Design Benefits

- ✅ **ความยืดหยุ่น (Flexibility)**  
  เปลี่ยน persona/theme → ออกมาหน้าต่างกัน

- ✅ **ความชัดเจน (Clarity)**  
  Step-by-step construction เห็นได้ชัด

- ✅ **การแยกสัง (Separation of Concerns)**  
  Director หวัง "อะไร" → Builder บอก "ไง"

- ✅ **ง่ายต่อการขยาย (Extensibility)**  
  เพิ่ม persona/section ใหม่ไม่ต้องแก้ core logic

- ✅ **ง่ายต่อการทดสอบ (Testability)**  
  สามารถ test builder steps แยกต่างหาก

---

## 📚 Summary

Builder Pattern ในระบบนี้:

1. **ประกอบหน้าเว็บที่ซับซ้อน** step-by-step

2. **รองรับหลาย representations** ผ่าน different personas

3. **ทำให้ code อ่านง่าย** และ maintain ได้ง่าย

4. **สร้างประสิทธิภาพในการสร้างสรรค์** ตามการตัดสินใจของ runtime

### Full Pattern Chain

```
User selects Persona + Theme
           ↓
    PersonalWebsiteUltimate (Director)
           ↓
    switch (persona) { ... }
           ↓
    PortfolioPageBuilder.reset()
    PortfolioPageBuilder.setTheme()        → Abstract Factory
    PortfolioPageBuilder.addHero()
    PortfolioPageBuilder.addSection()      → Factory Method
           ↓
    builder.build()
           ↓
    Rendered Page (composed from:
      • Theme components (Abstract Factory)
      • Layout components (Factory Method)
      • Data items (Prototype)
      • Logs (Singleton)
    )
```

---

**Happy Building! 🏗️✨**
