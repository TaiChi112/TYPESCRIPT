```mermaid
classDiagram
    %% =========================
    %% Product Abstraction
    %% (นามธรรมของ Layout Component)
    %% =========================
    class SectionComponent {
        <<React.FC>>
        +render(props: SectionProps)
    }

    class SectionProps {
        +title: string
        +items: ContentItem[]
        +theme: UIThemeFactory
        +icon?: React.ElementType
        +onCloneItem(item: ContentItem): void
    }

    %% =========================
    %% Concrete Products
    %% (Concrete Layout Components)
    %% =========================
    class ListLayout {
        +render(props: SectionProps)
    }

    class GridLayout {
        +render(props: SectionProps)
    }

    SectionComponent <|.. ListLayout
    SectionComponent <|.. GridLayout

    %% =========================
    %% Factory Method Pattern
    %% (Concrete Creators)
    %% =========================
    class SectionCreator {
        <<abstract>>
        +create(): SectionComponent
    }

    class MinimalSectionCreator {
        +create(): SectionComponent
    }

    class AcademicSectionCreator {
        +create(): SectionComponent
    }

    class CreativeSectionCreator {
        +create(): SectionComponent
    }

    SectionCreator <|-- MinimalSectionCreator
    SectionCreator <|-- AcademicSectionCreator
    SectionCreator <|-- CreativeSectionCreator

    %% =========================
    %% Registry / Facade
    %% (ตัวช่วยลดความซับซ้อน)
    %% =========================
    class SectionFactory {
        <<facade>>
        +getSection(layoutStyle: LayoutStyle): SectionComponent
    }

    SectionFactory ..> SectionCreator : delegates
    SectionCreator ..> SectionComponent : creates

    %% =========================
    %% Supporting Types
    %% (ประเภทสนับสนุน)
    %% =========================
    class LayoutStyle {
        <<enum>>
        minimal
        academic
        creative
    }

```

---

## 📊 Class Diagram Analysis

### **Product Family (ตระกูลของ Products)**

```
SectionComponent (นามธรรม)
    ↓
    ├─→ ListLayout (ลำดับแนวตั้ง)
    └─→ GridLayout (grid 2 คอลัมน์)
```

### **Creator Family (ตระกูลของ Creators)**

```
SectionCreator (abstract)
    ↓
    ├─→ MinimalSectionCreator ──→ สร้าง ListLayout
    ├─→ AcademicSectionCreator ──→ สร้าง ListLayout
    └─→ CreativeSectionCreator ──→ สร้าง GridLayout
```

---

## 🔄 Interaction Sequence

### **Step 1: Client ขอ Layout**
```
PortfolioPageBuilder
        ↓
    "ให้ layout สำหรับ creative style"
        ↓
    SectionFactory
```

### **Step 2: Factory เลือก Creator**
```
SectionFactory.getSection('creative')
        ↓
    switch (layoutStyle) {
        case 'creative': return GridLayout ✓
    }
```

### **Step 3: Creator สร้าง Product**
```
CreativeSectionCreator.create()
        ↓
    new GridLayout()
        ↓
    React.FC<SectionProps>
```

### **Step 4: Client ใช้ Product**
```
<GridLayout
    title="Featured Projects"
    items={projects}
    theme={CreativeThemeFactory}
    onCloneItem={handleClone}
/>
```

---

## 💡 Design Patterns Relationships

### **UML Relationships ใน Diagram**

| Symbol | ความหมาย | ตัวอย่าง |
|--------|---------|---------|
| `<\|..` | Implements Interface | `ListLayout <\|.. SectionComponent` |
| `<\|--` | Extends (Inheritance) | `MinimalSectionCreator <\|-- SectionCreator` |
| `..>` | Uses / Delegates | `SectionFactory ..> SectionCreator` |

---

## 📋 Key Takeaways

### **Factory Method Pattern ทำให้:**

1. **Decoupling** - Builder ไม่รู้จัก concrete layout
2. **Extensibility** - เพิ่ม layout ใหม่โดยเพิ่ม concrete creator ใหม่เท่านั้น
3. **Consistency** - ทุก layout มี interface เดียวกัน (SectionProps)
4. **Flexibility** - เลือก layout ตาม layoutStyle runtime

### **Mermaid Diagram ประโยชน์:**

- 📐 แสดง **class hierarchy** ชัดเจน
- 🔗 แสดง **relationships** ระหว่าง classes
- 📦 ช่วยให้ **visualization** ของ pattern
- 🎯 ทำให้เข้าใจ **GoF Factory Method** ได้ดีขึ้น

---

## 🚀 Implementation Tips

### **การเพิ่ม Layout ใหม่ (e.g., "Glassmorphism")**

```typescript
// 1. สร้าง Concrete Product
const GlassmorphismLayout: React.FC<SectionProps> = ({ ... }) => (
  <div className="backdrop-blur-md ...">
    {/* render */}
  </div>
);

// 2. สร้าง Concrete Creator
class GlassmorphismSectionCreator extends SectionCreator {
  create(): SectionComponent {
    return GlassmorphismLayout;
  }
}

// 3. ลงทะเบียนใน SectionFactory
const creatorRegistry: Record<LayoutStyle, SectionCreator> = {
  // ...
  glassmorphism: new GlassmorphismSectionCreator(),
};

// 4. ใช้ได้ทันที
builder.addSection("Title", items, Icon);
// มันจะ auto-select GlassmorphismLayout ตาม layoutStyle
```

---

## 📚 Related Patterns

```
Factory Method (Layout Selection)
        ↓
Abstract Factory (Theme System)
        ↓
Builder (Page Composition)
        ↓
Prototype (Data Cloning)
        ↓
Singleton (Session Logger)
```

**Factory Method** เป็นพื้นฐาน ของ **Abstract Factory**  
แต่ Factory Method ใช้สำหรับ **สร้าง individual objects**  
ขณะที่ Abstract Factory ใช้สำหรับ **create families of related objects**

---

**Happy Pattern Recognition! 🎯✨**