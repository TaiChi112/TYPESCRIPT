# Factory Method Pattern — Section Layout System

## Intent
Define an interface for creating an object,
but let subclasses decide which class to instantiate.

## Application Context
Factory Method is used to select **section layout components**
based on the current layout style.

## Participants

### Product — `SectionComponent`
- Abstract representation of a layout component

### Concrete Products
- `ListLayout`
- `GridLayout`

### Creator — `SectionCreator`
- Declares the factory method `create()`

### Concrete Creators
- `MinimalSectionCreator`
- `AcademicSectionCreator`
- `CreativeSectionCreator`

Each creator decides which layout to instantiate.

## Responsibilities
- Replace conditional logic (`switch / if`)
- Delegate layout creation to subclasses
- Support easy extension of new layouts

## Collaboration
- `PortfolioPageBuilder` requests layouts
- `SectionFactory` acts as a façade/registry
- Concrete creators instantiate layouts

## Why Factory Method Fits Here
- Layout choice varies by style
- Creation logic should be extensible
- Avoids centralized conditional factories

## Result
- Polymorphic layout creation
- Open–Closed Principle respected


# Factory Method Pattern — Section Layout System (GoF Version)

## 📋 Overview

ระบบ Section Layout นี้ใช้ **Factory Method (GoF)** เพื่อจัดการการสร้าง Layout Component  
โดยแยก _การตัดสินใจว่าจะสร้าง Layout แบบใด_ ออกจาก client (Page Builder)

### ผลลัพธ์คือ:

- ✨ ลดการใช้ `switch` / `if` statement
- 🔧 รองรับการขยาย layout ใหม่โดยไม่แก้โค้ดเดิม
- 📐 สอดคล้องกับ **Open–Closed Principle**

---

## 🏗️ Participants

### 1. Product — SectionComponent

**Description**

`SectionComponent` เป็น abstraction ของ Layout Component ทั้งหมดในระบบ  
ในเชิงเทคนิคคือ `React.FC<SectionProps>`

**Responsibilities**

- กำหนด interface กลางสำหรับ layout ทุกประเภท
- ทำให้ client ใช้งาน layout ได้โดยไม่รู้ implementation จริง

**Key Methods**

```tsx
render(props: SectionProps): JSX.Element
```

---

### 2. Product Data — SectionProps

**Description**

โครงสร้างข้อมูลที่ layout ทุกแบบต้องรับเข้าไปเหมือนกัน

**Attributes**

| Attribute | Type | Description |
|-----------|------|-------------|
| `title` | `string` | ชื่อ section |
| `items` | `ContentItem[]` | ข้อมูลที่ใช้ render |
| `theme` | `UIThemeFactory` | theme ที่ถูกเลือก (Abstract Factory) |
| `icon?` | `React.ElementType` | icon ของ section |
| `onCloneItem` | `(item: ContentItem) => void` | handler สำหรับ Prototype Pattern |

---

### 3. Concrete Products

#### ListLayout

**Description**

Layout แบบเรียงรายการแนวตั้ง  
เหมาะกับ style `minimal` และ `academic`

**Responsibilities**

- แสดงข้อมูลแบบ text-heavy
- ใช้โครงสร้างเรียบง่าย อ่านง่าย

#### GridLayout

**Description**

Layout แบบ grid 2 column  
เหมาะกับ style `creative`

**Responsibilities**

- แสดงข้อมูลแบบ card-based
- เน้น visual และ interaction

---

## 🔨 Factory Method Structure

### 4. Creator — SectionCreator

**Description**

`SectionCreator` เป็น abstract class ที่ประกาศ Factory Method

**Responsibilities**

- กำหนดสัญญาว่า creator ทุกตัวต้องสร้าง `SectionComponent`
- บังคับให้ subclass เป็นผู้ตัดสินใจว่าจะสร้าง product ใด

**Key Method**

```tsx
abstract create(): SectionComponent
```

---

### 5. Concrete Creators

#### MinimalSectionCreator

| Property | Value |
|----------|-------|
| **Extends** | `SectionCreator` |
| **Returns** | `ListLayout` |
| **Suitable For** | `minimal` style |

#### AcademicSectionCreator

| Property | Value |
|----------|-------|
| **Extends** | `SectionCreator` |
| **Returns** | `ListLayout` |
| **Suitable For** | `academic` style |

#### CreativeSectionCreator

| Property | Value |
|----------|-------|
| **Extends** | `SectionCreator` |
| **Returns** | `GridLayout` |
| **Suitable For** | `creative` style |

---

## 🎯 Supporting Structure

### 6. Facade / Registry — SectionFactory

**Description**

`SectionFactory` ทำหน้าที่เป็น façade เพื่อ:

- Map ค่า `LayoutStyle` → `SectionCreator`
- ลดความซับซ้อนในการใช้งานจาก client

> **หมายเหตุ:**  
> `SectionFactory` ไม่ใช่ Factory Method หลัก  
> แต่เป็นตัวช่วยเพื่อไม่ให้ Builder Pattern ถูกกระทบ

**Key Method**

```tsx
function SectionFactory(layoutType: LayoutStyle): React.FC<SectionProps>
```

---

### 7. Enum — LayoutStyle

**Description**

กำหนดประเภท layout ที่ระบบรองรับ

**Supported Values**

```tsx
type LayoutStyle = 'minimal' | 'academic' | 'creative'
```

| Style | Creator | Returns |
|-------|---------|---------|
| `minimal` | `MinimalSectionCreator` | `ListLayout` |
| `academic` | `AcademicSectionCreator` | `ListLayout` |
| `creative` | `CreativeSectionCreator` | `GridLayout` |

---

## 👥 Client Interaction

### Client — PortfolioPageBuilder

**How It Works**

Client ไม่รู้จัก concrete layout หรือ creator ใด ๆ  
รู้เพียงว่าเรียก `SectionFactory` เพื่อขอ layout component

**Flow Diagram**

```
┌──────────────────┐
│ PortfolioPageBuilder
└────────┬─────────┘
         │
         ▼ (requests layout)
┌──────────────────────────────┐
│ SectionFactory(layoutStyle)  │
└────────┬─────────────────────┘
         │
    ┌────┴──────┬──────────┐
    │            │          │
    ▼            ▼          ▼
┌─────────────┐ ┌─────────────────┐ ┌──────────────────┐
│MinimalCreator│ │AcademicCreator  │ │CreativeCreator   │
└─────────────┘ └─────────────────┘ └──────────────────┘
    │                   │                     │
    └───────────────────┼─────────────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
        ┌──────────┐           ┌───────────┐
        │ListLayout│           │GridLayout │
        └──────────┘           └───────────┘
```

**Process**

1. Builder ระบุ `layoutStyle`
2. `SectionFactory` เลือก `SectionCreator` ที่เหมาะสม
3. `SectionCreator.create()` สร้าง `SectionComponent`
4. Builder render component โดยไม่รู้ implementation

---

## ✨ Design Benefits

- ✅ **ลดคู่ปลง (Decoupling)**  
  ลดความเชื่อมโยงระหว่าง Builder กับ Layout concrete classes

- ✅ **ยืดหยุ่นต่อการขยาย (Extensible)**  
  เพิ่ม layout ใหม่โดยไม่แก้โค้ดเดิม (Open–Closed Principle)

- ✅ **Polymorphism มากกว่า Switch-Case**  
  ใช้การแทนที่ (substitution) แทน conditional logic

- ✅ **สอดคล้องกับ GoF Factory Method**  
  ปฏิบัติตามหลักการ design pattern ที่ได้รับการยอมรับ

---

## 📚 Summary

Factory Method Pattern ในระบบนี้ทำให้:

1. **แยก "การสร้าง layout"** ออกจาก logic การสร้างหน้าเว็บ
2. **ทำให้โครงสร้างยืดหยุ่น** และขยายได้ง่ายขึ้น
3. **สะท้อนการใช้งาน design pattern ร่วมกัน:**
   - 🔨 **Factory Method** ← การสร้าง layout
   - 🎨 **Abstract Factory** ← theme system
   - 🏗️ **Builder** ← page composition
   - 🧬 **Prototype** ← data cloning
   - 🔒 **Singleton** ← session logger

---

**Happy Coding! 🚀**
