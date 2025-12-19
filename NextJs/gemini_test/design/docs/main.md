# 🏗️ Main Architecture Overview — Creational Design Patterns Integration

## 📋 Overview

ระบบนี้ demonstrates วิธีการที่ **5 Creational Design Patterns**  
สามารถรวมกันได้อย่างมีความหมาย ในแอปพลิเคชันเดียว  
เพื่อแก้ไขปัญหาที่เกี่ยวข้องกับ creation โดยไม่ซ้ำซ้อน

### Architecture Characteristics

Architecture ถูกออกแบบให้เป็น:
- 🔧 **Modular** - แต่ละ pattern อยู่แยก
- 📈 **Extensible** - ง่ายต่อการขยาย
- 💭 **Understandable** - เข้าใจได้ง่าย
- 📐 **GoF-Aligned** - สอดคล้องกับ Gang of Four intent แต่ adapt ให้ React

### 5 Patterns ที่ใช้

```
1. 🔒 Singleton      → Application-level service
2. 🧬 Prototype      → Data duplication
3. 🎨 Abstract Factory → UI theme families
4. 🏭 Factory Method  → Layout selection
5. 🏗️  Builder        → Page composition
```

**Key Principle:** แต่ละ pattern แก้ปัญหา **creation ที่ต่างกัน** โดยไม่ซ้ำซ้อน

---

## 🎯 High-Level Responsibility Separation

| Concern | Pattern | Purpose |
|---------|---------|---------|
| **Global Service** | 🔒 Singleton | เก็บ shared logger instance |
| **Data Duplication** | 🧬 Prototype | Clone objects อย่างปลอดภัย |
| **UI Families** | 🎨 Abstract Factory | สร้าง cohesive UI components |
| **Layout Variation** | 🏭 Factory Method | เลือก layout ตามสถานการณ์ |
| **Page Assembly** | 🏗️ Builder | ประกอบหน้าขั้นตอนต่อขั้นตอน |

**Golden Rule:** ไม่มี pattern ที่ซ้ำซ้อนกัน!

---

## 📱 Client / Director Layer

### `PersonalWebsiteUltimate` Component

**Role**
- เป็น **entry point** และ **director**
- จัดการ user interactions (style change, persona change, cloning)
- Coordinate พฤติกรรม high-level โดยไม่รู้ implementation details

**Responsibilities**

```tsx
const handleStyleChange = (newStyle: LayoutStyle) => {
  SessionLogger.getInstance().addLog(...);  // ← Singleton
  setStyle(newStyle);
};

const handleCloneItem = (item: ContentItem) => {
  const clonedItem = item.clone();          // ← Prototype
  setItems([clonedItem, ...items]);
};

// Director decides what to build based on persona
switch (persona) {
  case 'developer':
    builder.addHero(...);
    builder.addSkills(...);
    builder.addSection(...);  // ← Builder
    break;
  // ...
}
```

**Key Point:**
> Client **ไม่เคยสร้าง concrete objects** โดยตรง

---

## 🔒 Singleton — Application-Level Services

### `SessionLogger`

**Purpose**
- Maintain **single shared instance** ของ logger
- Synchronize UI updates ทั่วทั้ง application

**Why Singleton ใช้ได้ดี**

1. **Logging must be globally consistent**
   - Session history ต้องอยู่ที่เดียว
   - ไม่มี fragmentation

2. **Multiple instances = Fragmented history**
   ```
   Instance A: ["event1", "event2"]
   Instance B: ["event3", "event4"]  ❌ Incomplete
   
   Single Instance: ["event4", "event3", "event2", "event1"]  ✓
   ```

3. **Cross-pattern communication**
   - Prototype calls Singleton
   - Builder calls Singleton
   - Factory calls Singleton
   - ทั้งหมด share ผ่าน `getInstance()`

**Key Insight:**
> Singleton เป็น *infrastructure*, ไม่ใช่ domain logic

---

## 🧬 Prototype — Data Duplication

### `ContentItem` Class

**Purpose**
- Represent clonable domain data (projects, research, blogs)
- Encapsulate cloning logic **ในตัว object เอง**

**Why Prototype ใช้ได้ดี**

1. **Client doesn't need construction knowledge**
   ```tsx
   // ❌ Without Prototype
   const cloned = new ContentItem(
     Math.random().toString(...),
     item.title + ' (Copy)',
     // ... more boilerplate
   );
   
   // ✅ With Prototype
   const cloned = item.clone();
   ```

2. **Runtime duplication of complex objects**
   - วิธีการ clone อาจซับซ้อน
   - แต่ client ไม่ต้องรู้

3. **Cloning responsibility close to data**
   - Single Responsibility Principle
   - ContentItem รู้วิธี clone ตัวเอง

4. **Side effect integration**
   - Logging ทำได้ใน clone() method
   - ไม่ต้อง client รู้

**Collaboration with Singleton**
```tsx
clone(): ContentItem {
  SessionLogger.getInstance().addLog(
    `Cloned "${this.title}"`
  );
  // ...
}
```

---

## 🎨 Abstract Factory — UI Theme System

### `UIThemeFactory` Interface

**Purpose**
- Create **families ของ related UI components**
- Ensure visual consistency ทั่วทั้ง app

**Concrete Factories (3 ธีม)**

| Theme | Colors | Aesthetic | Use Case |
|-------|--------|-----------|----------|
| 🖤 **Minimal** | Black, Green, Gray | Terminal-like | Developers |
| 🌈 **Creative** | Indigo, Purple, White | Colorful & Modern | Designers |
| 📚 **Academic** | Black, Gray, Cream | Formal & Scholarly | Researchers |

**Why Abstract Factory ใช้ได้ดี**

1. **Themes are product families**
   - ไม่ใช่สร้าง individual buttons
   - สร้าง **complete cohesive sets**

2. **Switching theme = entire UI transformation**
   ```tsx
   // Change one factory reference
   setTheme(MinimalThemeFactory);
   
   // ✓ ทั้ง buttons, cards, sections เปลี่ยนไปเลย
   // ✓ ยังคงสม่ำเสมอ (cohesive)
   ```

3. **Prevents invalid combinations**
   - ไม่มีทางใช้ minimal buttons กับ creative cards
   - Consistency guaranteed

4. **Easy to add new theme**
   - เพิ่ม concrete factory
   - ไม่ต้องแก้ existing code

**Key Rule:**
> One theme = One coherent UI family

---

## 🏭 Factory Method — Layout System

### `SectionCreator` Hierarchy

**Purpose**
- ตัดสินใจว่าจะสร้าง layout component ไหน
- Replace conditional logic ด้วย polymorphism

**Products (2 Layouts)**

```
SectionComponent (abstract)
├─→ ListLayout (เรียงแนวตั้ง)
└─→ GridLayout (2 columns grid)
```

**Creators (3 Concrete)**

```
SectionCreator (abstract)
├─→ MinimalSectionCreator  → ListLayout
├─→ AcademicSectionCreator → ListLayout
└─→ CreativeSectionCreator → GridLayout
```

**Why Factory Method ใช้ได้ดี**

1. **Layout choice depends on context**
   ```
   'minimal' style → use ListLayout ✓
   'academic' style → use ListLayout ✓
   'creative' style → use GridLayout ✓
   ```

2. **Open–Closed Principle**
   ```tsx
   // เพิ่ม layout ใหม่:
   class GlassmorphismLayout extends SectionComponent {}
   class GlassmorphismCreator extends SectionCreator {
     create() { return new GlassmorphismLayout(); }
   }
   
   // ไม่ต้องแก้ existing code ❌
   ```

3. **Replaces switch/if**
   ```tsx
   // ❌ Without Factory Method
   if (style === 'minimal') {
     return <ListLayout ... />;
   } else if (style === 'creative') {
     return <GridLayout ... />;
   }
   // Long, tedious, error-prone
   
   // ✅ With Factory Method
   const layout = SectionFactory(style);
   return <layout.Component ... />;
   ```

**Facade Note:**
> `SectionFactory` เป็น **small helper** เท่านั้น  
> (ไม่ใช่ core pattern)

---

## 🏗️ Builder — Page Composition

### `PortfolioPageBuilder` Class

**Purpose**
- Assemble complex page **step by step**
- Separate *construction logic* จาก *representation*

**Participants**

| Role | Component | Purpose |
|------|-----------|---------|
| **Builder** | `PortfolioPageBuilder` | รู้ว่าสร้างยังไง |
| **Director** | `PersonalWebsiteUltimate` | รู้ว่าสร้างอะไร |
| **Product** | `Page (ReactNode)` | ผลลัพธ์สุดท้าย |

**Why Builder ใช้ได้ดี**

1. **Page structure is complex**
   ```
   Hero section
   Skills section
   Projects section
   Blog section
   Log console
   
   ลำดับสำคัญ! โครงสร้างซับซ้อน!
   ```

2. **Different personas = different pages**
   ```tsx
   switch (persona) {
     case 'developer':
       // Developer specific sections
     case 'researcher':
       // Researcher specific sections
     case 'student':
       // Student specific sections
   }
   ```

3. **Construction order matters**
   ```tsx
   builder.reset();
   builder.setTheme(...);           // 1
   builder.addHero(...);            // 2
   builder.addSkills(...);          // 3
   builder.addSection(...);         // 4
   const page = builder.build();    // 5
   ```

4. **Readability & maintainability**
   - Step-by-step construction ชัดเจน
   - ส่วนหนึ่งของ building logic

---

## 🔗 Pattern Collaboration Flow

### Interaction Sequence

```
User Interaction (click theme button / clone button / etc.)
        ↓
PersonalWebsiteUltimate (Director/Client)
        ├─→ handleStyleChange() / handleCloneItem()
        ↓
┌───────────────────────────────────────────────────────┐
│ Pattern 1: Singleton                                  │
│ SessionLogger.getInstance().addLog(...)               │
└───────────────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────────────┐
│ Pattern 2: Prototype (if cloning)                     │
│ item.clone() → new independent object                 │
└───────────────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────────────┐
│ Pattern 3: Builder                                    │
│ builder.reset()                                       │
│ builder.setTheme(getTheme(style))  ← Pattern 3       │
│ builder.addSection(...)            ← Pattern 4       │
│ const page = builder.build()                          │
└───────────────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────────────┐
│ Pattern 3: Abstract Factory                           │
│ UIThemeFactory provides styled components             │
│ (ActionButton, Tag, CardWrapper, etc.)                │
└───────────────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────────────┐
│ Pattern 4: Factory Method                            │
│ SectionFactory selects ListLayout or GridLayout       │
└───────────────────────────────────────────────────────┘
        ↓
setState() → React re-render
        ↓
UI Updated with new theme/layout
```

**Each pattern collaborates ONLY through abstractions:**
- No tight coupling
- No hardcoded dependencies
- Easy to extend

---

## 🎓 Design Principles Applied

### **Single Responsibility Principle**
```
✓ SessionLogger: Logging only
✓ ContentItem: Data representation + cloning
✓ UIThemeFactory: UI component creation
✓ PortfolioPageBuilder: Page assembly
```

### **Open–Closed Principle**
```
✓ Add new theme → implement UIThemeFactory
✓ Add new layout → implement SectionCreator
✓ Add new persona → extend switch in Director
→ No modification of existing code
```

### **Dependency Inversion Principle**
```
✓ Builder depends on IPageBuilder (interface)
✓ Client depends on abstractions, not concrete classes
✓ Director doesn't know concrete themes/layouts
```

### **Separation of Concerns**
```
✓ Singleton: Infrastructure
✓ Prototype: Data logic
✓ Abstract Factory: UI styling
✓ Factory Method: Layout selection
✓ Builder: Page composition
```

---

## 📊 Decision Tree: Which Pattern for What?

```
Need to...

├─ Share state globally across app?
│  └─→ Singleton ✓
│
├─ Clone/duplicate objects?
│  └─→ Prototype ✓
│
├─ Create families of related UI components?
│  └─→ Abstract Factory ✓
│
├─ Decide which variant to create (runtime)?
│  └─→ Factory Method ✓
│
└─ Assemble complex object step-by-step?
   └─→ Builder ✓
```

---

## 📚 Summary

### ระบบนี้ demonstrates:

1. **Creational patterns aren't isolated tools**
   - พวกมันถูก **ออกแบบให้ทำงานร่วมกัน**

2. **Each pattern solves distinct problem**
   - ไม่มีซ้ำซ้อน
   - ไม่มี overlap

3. **Result is coherent architecture**
   - ✨ Easy to extend
   - ✨ Easy to explain
   - ✨ Easy to maintain
   - ✨ Architecturally sound

### Pattern Chain

```
Singleton (Service)
    ↓
Prototype (Data)
    ↓
Builder (Composition)
    ↓
Abstract Factory (Styling)
    ↓
Factory Method (Layout)
    ↓
Rendered UI
```

---

## 🎯 Key Takeaways

### **DON'T:**
- ❌ Use pattern just because it sounds smart
- ❌ Force patterns into places they don't belong
- ❌ Over-engineer simple solutions

### **DO:**
- ✅ Use pattern because it solves a real problem
- ✅ Keep pattern intent clear and obvious
- ✅ Favor clarity over cleverness

---

## 💡 Final Philosophy

> **Clarity over Cleverness**

ทุก pattern ที่อยู่ในระบบนี้ มีเหตุผลชัดเจน  
ไม่ใช่เพราะ "ดูเท่ห์" หรือ "advanced"

### Questions to Ask:

```
1. "What problem does this pattern solve?" → ชัดเจน?
2. "Could I explain it to a new developer?" → ได้?
3. "Would removing it make code worse?" → ใช่?
4. "Is there a simpler alternative?" → ลองแล้ว?
```

ถ้าตอบ "ใช่" สำหรับคำถามข้างบน → Pattern เหมาะสม ✓

---

## 📖 Next Steps

ไป explore individual pattern docs:

1. 📖 [Singleton Documentation](./singleton.md)
2. 📖 [Prototype Documentation](./prototype.md)
3. 📖 [Abstract Factory Documentation](./abstract_factory.md)
4. 📖 [Factory Method Documentation](./factory_method.md)
5. 📖 [Builder Documentation](./builder.md)

---

**Happy Learning! 🚀✨**
