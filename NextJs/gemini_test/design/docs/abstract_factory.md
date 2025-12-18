# Abstract Factory Pattern — UI Theme System

## 📖 Intent

ให้ interface สำหรับการสร้าง **families ของ related/dependent objects**  
โดยไม่ต้องระบุ concrete classes ของพวกมัน

## 🎨 Application Context

Abstract Factory Pattern ถูกใช้จัดการระบบ **UI Themes:**
- 🖤 Minimal (ขาวดำ/monokai)
- 🌈 Creative (colorful/gradient)
- 📚 Academic (serif/classical)

แต่ละ theme ให้ family ที่สอดคล้องกันของ UI components

---

## 🏗️ Participants

### 1. Abstract Factory — `UIThemeFactory`

**Description**

`UIThemeFactory` เป็น interface ที่ประกาศ factory methods สำหรับสร้าง UI components family

**Factory Methods**

| Method | Returns | Purpose |
|--------|---------|---------|
| `ActionButton` | `React.FC` | ปุ่ม action ที่ styled ตามธีม |
| `Tag` | `React.FC` | label/tag ที่ styled ตามธีม |
| `CardWrapper` | `React.FC` | card container |
| `SectionWrapper` | `React.FC` | section container |
| `HeroWrapper` | `React.FC` | hero header section |

---

### 2. Concrete Factories

#### MinimalThemeFactory

| Attribute | Value |
|-----------|-------|
| **Style** | Monokai/Dark Terminal |
| **Colors** | Black, Green, Gray |
| **Aesthetic** | Clean, Minimalist |
| **Components** | `[ActionButton, Tag, CardWrapper, SectionWrapper, HeroWrapper]` |

**Characteristics**
- ใช้ border-left สำหรับ cards
- Font mono (terminal-like)
- Green accent color
- Minimal animations

#### CreativeThemeFactory

| Attribute | Value |
|-----------|-------|
| **Style** | Modern & Vibrant |
| **Colors** | Indigo, Purple, White |
| **Aesthetic** | Colorful, Engaging |
| **Components** | `[ActionButton, Tag, CardWrapper, SectionWrapper, HeroWrapper]` |

**Characteristics**
- Rounded corners & shadows
- Gradient backgrounds
- Emoji ✨ decorations
- Smooth transitions & hover effects

#### AcademicThemeFactory

| Attribute | Value |
|-----------|-------|
| **Style** | Formal & Scholarly |
| **Colors** | Black, Gray, Cream |
| **Aesthetic** | Professional, Documentation |
| **Components** | `[ActionButton, Tag, CardWrapper, SectionWrapper, HeroWrapper]` |

**Characteristics**
- Serif fonts
- Paper-like background (#fdfbf7)
- Keyword-style tags
- Citation-like buttons

---

## ⚙️ Responsibilities

Abstract Factory ต้องรับผิดชอบ:

- ✅ **ความสอดคล้องทางสายตา (Visual Consistency)**  
  ทุก components ในธีมเดียวกันจะมี look & feel เหมือนกัน

- ✅ **ป้องกันการผสมธีม (Prevent Theme Mixing)**  
  ไม่ให้ builder สามารถใช้ buttons จาก minimal กับ cards จาก creative

- ✅ **แยก UI Creation จาก Logic**  
  Page Builder ไม่รู้จักรายละเอียด styling ของแต่ละธีม

---

## 🔗 Collaboration

### Interaction Flow

```
┌────────────────────────┐
│ PortfolioPageBuilder   │
│ (Client)               │
└───────────┬────────────┘
            │ (selects theme & requests components)
            ▼
┌────────────────────────────────────────┐
│ UIThemeFactory (Abstract)              │
│ ┌──────────────────────────────────┐  │
│ │ + ActionButton()                 │  │
│ │ + Tag()                          │  │
│ │ + CardWrapper()                  │  │
│ │ + SectionWrapper()               │  │
│ │ + HeroWrapper()                  │  │
│ └──────────────────────────────────┘  │
└────────────────────────────────────────┘
            │
    ┌───────┼───────┐
    │       │       │
    ▼       ▼       ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│MinimalFactory│ │CreativeFactory│ │AcademicFactory│
│ (Concrete)   │ │ (Concrete)   │ │ (Concrete)   │
└──────────────┘ └──────────────┘ └──────────────┘
    │                │                 │
    └────────────────┼─────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
    ┌─────────────┐          ┌─────────────┐
    │UI Components│          │UI Components│
    │ (Styled)    │          │ (Styled)    │
    └─────────────┘          └─────────────┘
```

### Code Example

```tsx
// Builder เลือก theme
const theme = getTheme('creative'); // Returns CreativeThemeFactory

// Builder ขอ components จาก factory
<theme.ActionButton onClick={handleClick}>
  Click Me
</theme.ActionButton>

// Builder ไม่รู้ว่ามันเป็น concrete implementation ไหน
// มันแค่รู้ว่ามันได้ ActionButton component ที่ styled ตรงกับ theme
```

---

## 💡 Why Abstract Factory Fits Here

### 1. **Themes are Product Families**
- ไม่ใช่สร้าง individual components
- แต่สร้าง **complete sets** ที่ cohesive

### 2. **Switching Theme = Entire UI Transformation**
```tsx
// ก่อนหน้า: minimal theme
builder.setTheme(MinimalThemeFactory, 'minimal');

// หลังจากนี้: creative theme
builder.setTheme(CreativeThemeFactory, 'creative');

// ทุก components ต่างออกมา cohesive กับธีมใหม่
```

### 3. **Encourages Consistent Design Systems**
- Design tokens (colors, spacing, fonts) ไม่ scattered
- อยู่ใน theme factory เดียว

### 4. **Prevents Invalid Component Combinations**
- ไม่มีทาง mix minimal buttons กับ creative cards

---

## ✨ Design Benefits

- ✅ **ความยืดหยุ่นในเลือกธีม (Theme Flexibility)**  
  เพิ่ม theme ใหม่เพียง implements `UIThemeFactory`

- ✅ **การเปลี่ยนแปลงธีมง่าย (Easy Theme Switching)**  
  เพียง swap the factory reference

- ✅ **ลดการแยกตัวของ Code (Low Coupling)**  
  Builder ไม่ depend on concrete theme implementations

- ✅ **ความสม่ำเสมอ (Consistency Guaranteed)**  
  Family ของ components ออกมาสม่ำเสมอเสมอ

- ✅ **ทำให้เข้าใจและบำรุงรักษาง่าย (Maintainability)**  
  Theme logic ศูนย์กลางอยู่ที่ factory

---

## 📚 Summary

Abstract Factory Pattern ในระบบนี้:

1. **จัดการธีม UI เป็น product families**  
   ไม่ใช่ individual components

2. **ให้ interface unified** ผ่าน `UIThemeFactory`

3. **ทำให้ theme switching ปลอดภัยและง่าย**

4. **สะท้อนการใช้ GoF Abstract Factory** ในบริบท React/UI

### Integration with Other Patterns

```
Abstract Factory (Themes)
       ↓
   UI Components (ActionButton, Tag, etc.)
       ↓
   Builder Pattern (Page Composition)
       ↓
   Factory Method (Layout Selection)
       ↓
   Prototype (Data Cloning)
       ↓
   Singleton (Session Logging)
```

---

**Happy Theming! 🎨✨**
