# 🔌 Adapter Pattern - การประยุกต์ใช้งาน

## 📖 Introduction

**Adapter Pattern** เป็น Structural Design Pattern ที่ทำหน้าที่เป็น "ตัวแปลง" หรือ "สะพานเชื่อม" ระหว่าง 2 Interface ที่ไม่สามารถทำงานร่วมกันได้โดยตรง โดยไม่ต้องแก้ไข Source Code เดิม

---

## 🎯 ปัญหาที่แก้ไข

### สถานการณ์จริง
คุณกำลังพัฒนา Portfolio Website และต้องการ **import ข้อมูลจาก External APIs** เช่น:

1. **Blog Platform API** - ส่ง format:
```json
{
  "post_id": "abc123",
  "headline": "My Blog Post",
  "content": "Content here...",
  "published_date": "2024-01-15",
  "categories": ["Tech", "Design"]
}
```

2. **Project Management API** - ส่ง format:
```json
{
  "project_id": "proj-001",
  "name": "E-commerce Platform",
  "summary": "Full-stack online store",
  "year": 2024,
  "tech_stack": ["React", "Node.js", "MongoDB"]
}
```

3. **ระบบภายใน** - ใช้ format `ContentItem`:
```typescript
class ContentItem {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
}
```

### ❌ ปัญหา
- **Format ไม่เข้ากัน** - field names ต่างกัน (headline vs title, categories vs tags)
- **Data types ต่างกัน** - year เป็น number แต่ date ต้องเป็น string
- **ไม่สามารถแก้ External APIs** - คุณควบคุม Third-party APIs ไม่ได้
- **Code จะ messy** - ถ้าแปลงข้อมูลทุกที่ที่ใช้

---

## ✅ Solution: Adapter Pattern

สร้าง **Adapter Classes** ที่รับผิดชอบแปลง External Format → Internal Format

```
External API → Adapter → ContentItem → ระบบภายใน
```

---

## 🏗️ Structure

### 1. Target Interface (ContentItem)
Interface หรือ Class ที่ระบบภายในใช้งาน

```typescript
class ContentItem {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public date: string,
    public tags: string[]
  ) {}
  
  clone(): ContentItem { ... }
}
```

---

### 2. Adaptee (External Formats)
Interface ของข้อมูลภายนอกที่ต้องการแปลง

```typescript
// External Blog Format
interface ExternalBlogPost {
  post_id: string;
  headline: string;
  content: string;
  published_date: string;
  categories: string[];
}

// External Project Format
interface ExternalProject {
  project_id: string;
  name: string;
  summary: string;
  year: number;
  tech_stack: string[];
}
```

---

### 3. Adapter Interface
Contract ที่ทุก Adapter ต้อง implement

```typescript
interface IContentAdapter {
  adapt(): ContentItem;
}
```

---

### 4. Concrete Adapters
Adapter สำหรับแต่ละ External Format

#### 📰 ExternalBlogAdapter
```typescript
class ExternalBlogAdapter implements IContentAdapter {
  constructor(private externalData: ExternalBlogPost) {}

  adapt(): ContentItem {
    SessionLogger.getInstance().addLog(
      `Adapter Pattern: Converted blog "${this.externalData.headline}"`
    );

    return new ContentItem(
      this.externalData.post_id,        // → id
      this.externalData.headline,       // → title
      this.externalData.content,        // → description
      this.externalData.published_date, // → date
      this.externalData.categories      // → tags
    );
  }
}
```

**Field Mapping:**
- `post_id` → `id`
- `headline` → `title`
- `content` → `description`
- `published_date` → `date`
- `categories` → `tags`

---

#### 🚀 ExternalProjectAdapter
```typescript
class ExternalProjectAdapter implements IContentAdapter {
  constructor(private externalData: ExternalProject) {}

  adapt(): ContentItem {
    SessionLogger.getInstance().addLog(
      `Adapter Pattern: Converted project "${this.externalData.name}"`
    );

    return new ContentItem(
      this.externalData.project_id,
      this.externalData.name,
      this.externalData.summary,
      this.externalData.year.toString(), // number → string conversion
      this.externalData.tech_stack
    );
  }
}
```

**Field Mapping:**
- `project_id` → `id`
- `name` → `title`
- `summary` → `description`
- `year.toString()` → `date` (convert number to string)
- `tech_stack` → `tags`

---

#### 🎨 JSONContentAdapter (Generic Adapter)
Adapter ที่ยืดหยุ่น รองรับหลาย field names

```typescript
class JSONContentAdapter implements IContentAdapter {
  constructor(
    private jsonData: any, 
    private type: 'blog' | 'project' | 'research'
  ) {}

  adapt(): ContentItem {
    SessionLogger.getInstance().addLog(
      `Adapter Pattern: Imported ${this.type} from JSON`
    );

    // Flexible mapping with fallbacks
    const id = this.jsonData.id || 
               this.jsonData.post_id || 
               this.jsonData.project_id || 
               Math.random().toString(36).slice(2, 11);

    const title = this.jsonData.title || 
                  this.jsonData.name || 
                  this.jsonData.headline || 
                  'Untitled';

    const description = this.jsonData.description || 
                        this.jsonData.summary || 
                        this.jsonData.content || 
                        'No description';

    const date = this.jsonData.date || 
                 this.jsonData.year || 
                 this.jsonData.published_date || 
                 new Date().getFullYear().toString();

    const tags = this.jsonData.tags || 
                 this.jsonData.categories || 
                 this.jsonData.tech_stack || 
                 [];

    return new ContentItem(
      id, 
      title, 
      description, 
      date.toString(), 
      tags
    );
  }
}
```

**Advantages:**
- ✅ รองรับหลาย field names (`id` | `post_id` | `project_id`)
- ✅ มี fallback values สำหรับ missing fields
- ✅ ยืดหยุ่นกับ External APIs ที่มี structure แตกต่างกัน

---

## 🎮 การใช้งาน (Client Code)

### การ Import ข้อมูล
```typescript
// 1. รับ JSON จาก user หรือ API
const externalJSON = `{
  "project_id": "ext-001",
  "name": "ML Image Classifier",
  "summary": "Deep learning model...",
  "year": 2024,
  "tech_stack": ["Python", "TensorFlow"]
}`;

// 2. Parse JSON
const jsonData = JSON.parse(externalJSON);

// 3. สร้าง Adapter
const adapter = new JSONContentAdapter(jsonData, 'project');

// 4. แปลงข้อมูล
const contentItem = adapter.adapt();

// 5. เพิ่มเข้าระบบ
setProjects([contentItem, ...projects]);

// ✅ ผลลัพธ์: ContentItem ใหม่ถูกเพิ่มเข้า projects
// ✅ Log ถูกบันทึกใน SessionLogger
```

---

## 🖼️ UI Implementation

### Import Modal Features

#### 1. **Import Button**
```tsx
<button onClick={() => setShowImportModal(true)}>
  <Upload size={16} />
  Import Data
</button>
```

#### 2. **Type Selector**
เลือกว่าจะ import เป็น project, blog, หรือ research
```tsx
{(['project', 'blog', 'research'] as const).map(type => (
  <button onClick={() => setImportType(type)}>
    {type}
  </button>
))}
```

#### 3. **JSON Textarea**
ให้ user paste JSON data
```tsx
<textarea
  value={importJSON}
  onChange={(e) => setImportJSON(e.target.value)}
  placeholder="Paste JSON data here..."
/>
```

#### 4. **Sample Data Button**
โหลด sample JSON สำหรับทดสอบ
```tsx
<button onClick={getSampleJSON}>
  Load Sample
</button>
```

#### 5. **Import Button**
เรียกใช้ Adapter
```tsx
<button onClick={handleImportData}>
  <Upload size={16} />
  Import via Adapter
</button>
```

---

### Handler Function
```typescript
const handleImportData = () => {
  try {
    // Parse JSON
    const jsonData = JSON.parse(importJSON);
    
    // Create Adapter
    const adapter = new JSONContentAdapter(jsonData, importType);
    
    // Convert data
    const contentItem = adapter.adapt();

    // Add to appropriate collection
    switch (importType) {
      case 'project':
        setProjects([contentItem, ...projects]);
        break;
      case 'blog':
        setBlogs([contentItem, ...blogs]);
        break;
      case 'research':
        setResearch([contentItem, ...research]);
        break;
    }

    // Success feedback
    setShowImportModal(false);
    setImportJSON('');
    SessionLogger.getInstance().addLog(
      `✅ Successfully imported ${importType} via Adapter Pattern`
    );
  } catch (error) {
    // Error handling
    SessionLogger.getInstance().addLog(
      `❌ Import failed: ${error.message}`
    );
  }
};
```

---

## 🔄 Workflow Diagram

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ 1. Click Import
       ▼
┌─────────────────┐
│  Import Modal   │
└──────┬──────────┘
       │ 2. Paste JSON + Select Type
       ▼
┌─────────────────────┐
│ JSONContentAdapter  │
└──────┬──────────────┘
       │ 3. Parse & Map Fields
       ▼
┌─────────────────┐
│  ContentItem    │
└──────┬──────────┘
       │ 4. Add to State
       ▼
┌─────────────────┐
│   UI Update     │ → แสดงข้อมูลใหม่
└─────────────────┘
       │
       ▼
┌─────────────────┐
│ SessionLogger   │ → บันทึก Log
└─────────────────┘
```

---

## 🧪 Test Cases

### ✅ Test Case 1: Complete Data
**Input:**
```json
{
  "id": "test-001",
  "title": "Test Project",
  "description": "Test description",
  "date": "2024",
  "tags": ["Test", "Sample"]
}
```

**Expected:**
- ✅ สร้าง ContentItem สำเร็จ
- ✅ แสดงใน UI
- ✅ Log "✅ Successfully imported..."

---

### ⚠️ Test Case 2: Missing Fields
**Input:**
```json
{
  "name": "Incomplete Project"
}
```

**Expected:**
- ✅ ใช้ fallback values
- ✅ Generate random ID
- ✅ title = "Incomplete Project"
- ✅ description = "No description"
- ✅ date = current year
- ✅ tags = []

---

### ⚠️ Test Case 3: Different Field Names
**Input:**
```json
{
  "post_id": "blog-001",
  "headline": "Blog Title",
  "content": "Blog content...",
  "published_date": "2024-01-15",
  "categories": ["Tech"]
}
```

**Expected:**
- ✅ แปลง post_id → id
- ✅ แปลง headline → title
- ✅ แปลง content → description
- ✅ แปลง published_date → date
- ✅ แปลง categories → tags

---

### ❌ Test Case 4: Invalid JSON
**Input:**
```
{ invalid json }
```

**Expected:**
- ❌ แสดง error ใน Logger
- ❌ ไม่ import data
- ❌ Modal ยังคงเปิดอยู่

---

## 🎯 Design Principles

### 1️⃣ Single Responsibility Principle (SRP)
แต่ละ Adapter รับผิดชอบเฉพาะการแปลง 1 External Format
- `ExternalBlogAdapter` → Blog format only
- `ExternalProjectAdapter` → Project format only
- `JSONContentAdapter` → Generic JSON

---

### 2️⃣ Open/Closed Principle (OCP)
เพิ่ม Adapter ใหม่ได้โดยไม่แก้ code เดิม

**Before:**
```typescript
// ❌ ต้องแก้ function นี้ทุกครั้งที่มี format ใหม่
function importData(data: any) {
  if (isBlogFormat(data)) {
    // handle blog
  } else if (isProjectFormat(data)) {
    // handle project
  }
  // ต้องเพิ่ม else if ใหม่เรื่อยๆ
}
```

**After (Adapter Pattern):**
```typescript
// ✅ เพิ่ม Adapter ใหม่โดยไม่แก้ code เดิม
class NewFormatAdapter implements IContentAdapter {
  adapt(): ContentItem { ... }
}
```

---

### 3️⃣ Dependency Inversion Principle (DIP)
Client depend on Interface (`IContentAdapter`) ไม่ใช่ Concrete Classes

```typescript
// ✅ Good: Depend on abstraction
function handleImport(adapter: IContentAdapter) {
  return adapter.adapt();
}

// ❌ Bad: Depend on concrete class
function handleImport(adapter: ExternalBlogAdapter) {
  return adapter.adapt();
}
```

---

## 🔗 Integration with Other Patterns

### 1. **Singleton Pattern** (SessionLogger)
- Adapter log ทุกครั้งที่แปลงข้อมูล
- User เห็น history การ import
```typescript
SessionLogger.getInstance().addLog(
  `Adapter Pattern: Converted blog "${title}"`
);
```

---

### 2. **Prototype Pattern** (ContentItem.clone())
- ContentItem ที่ Adapter สร้างสามารถ clone ได้
- User สามารถ duplicate imported items
```typescript
const cloned = contentItem.clone();
```

---

### 3. **Abstract Factory** (Theme System)
- Import Modal ใช้ theme colors จาก Factory
- UI สอดคล้องกับ theme ที่เลือก

---

### 4. **Builder Pattern** (Page Builder)
- Imported items ถูกเพิ่มเข้า sections ผ่าน Builder
```typescript
builder.addSection("Imported Projects", projects, Code);
```

---

## 📊 Benefits

| Benefit | Description | Example |
|---------|-------------|---------|
| **Flexibility** 🔄 | รองรับหลาย External Sources | Blog API, Project API, Research DB |
| **Maintainability** 🛠️ | แก้ไข Adapter โดยไม่กระทบ Client | เปลี่ยน field mapping ใน Adapter |
| **Testability** ✅ | Test Adapter แยกจาก Client | Unit test แต่ละ Adapter |
| **Scalability** 📈 | เพิ่ม Adapter ใหม่ง่าย | เพิ่ม `ExternalAPIAdapter` |
| **Reusability** ♻️ | Adapter ใช้ซ้ำได้หลายที่ | ใช้ในหลาย components |

---

## ⚠️ Trade-offs

### Cons
| Issue | Impact | Mitigation |
|-------|--------|------------|
| **Complexity** | เพิ่ม classes/interfaces | ใช้เมื่อมี External Sources หลายตัว |
| **Performance** | มี overhead จากการแปลง | Cache adapted results |
| **Over-engineering** | อาจซับซ้อนเกินไปถ้า Source น้อย | ประเมินจำนวน External Sources |

---

## 🚀 Advanced Features (Future)

### 1. **Async Adapters**
```typescript
interface IAsyncContentAdapter {
  adaptAsync(): Promise<ContentItem>;
}

class APIAdapter implements IAsyncContentAdapter {
  async adaptAsync(): Promise<ContentItem> {
    const data = await fetch(this.apiUrl);
    return this.transform(data);
  }
}
```

---

### 2. **Validation Layer**
```typescript
class ValidatedAdapter implements IContentAdapter {
  adapt(): ContentItem {
    this.validate();
    return this.transform();
  }

  private validate() {
    if (!this.data.id) throw new Error("Missing ID");
    if (!this.data.title) throw new Error("Missing title");
  }
}
```

---

### 3. **Transformation Pipeline**
```typescript
const result = new PipelineAdapter(data)
  .addTransform(normalizeFields)
  .addTransform(validateData)
  .addTransform(enrichMetadata)
  .adapt();
```

---

### 4. **Schema Mapping Config**
```typescript
const blogMapping = {
  id: 'post_id',
  title: 'headline',
  description: 'content',
  date: 'published_date',
  tags: 'categories'
};

const adapter = new ConfigurableAdapter(data, blogMapping);
```

---

## 🎓 When to Use

### ✅ Use Adapter Pattern When:
- มี **External Systems** ที่ interface ไม่เข้ากัน
- ต้องการ **integrate Third-party APIs** เข้าระบบ
- ต้องการ **import/export data** จากหลาย sources
- ไม่สามารถ **modify External Code**
- ต้องการ **maintain flexibility** สำหรับการเปลี่ยนแปลง

---

### ❌ Avoid When:
- มี **External Source เดียว** ที่ไม่น่าจะเปลี่ยน
- **Format เข้ากันอยู่แล้ว** ไม่ต้องแปลง
- Project **เล็กและไม่ซับซ้อน**
- **Performance** เป็นปัจจัยสำคัญที่สุด

---

## 📚 Related Patterns

### Facade Pattern
- **Facade**: Simplify complex subsystems
- **Adapter**: Convert interface compatibility
- **ความต่าง**: Facade ซ่อน complexity, Adapter แปลง interface

---

### Decorator Pattern
- **Decorator**: Add behavior dynamically
- **Adapter**: Convert interfaces
- **ความต่าง**: Decorator extends, Adapter converts

---

### Bridge Pattern
- **Bridge**: Separate abstraction from implementation
- **Adapter**: Make existing interfaces compatible
- **ความต่าง**: Bridge planned ahead, Adapter fixes incompatibility

---

### Strategy Pattern
- **Strategy**: Interchangeable algorithms
- **Adapter**: Interface compatibility
- **ความต่าง**: Strategy about behavior, Adapter about structure

---

## 💡 Key Takeaways

1. **Adapter = ตัวแปลงระหว่าง Interfaces ที่ไม่เข้ากัน**
2. **ใช้เมื่อต้อง integrate External Systems**
3. **รองรับหลาย External Sources พร้อมกัน**
4. **ไม่ต้องแก้ไข External Code**
5. **ทำให้ระบบ flexible และ maintainable**

---

## 📖 Resources

- **Implementation**: [page.tsx](../../app/page.tsx) (Lines 100-180)
- **Class Diagram**: [diagram/adapter.md](../diagram/adapter.md)
- **Pattern Type**: Structural Design Pattern
- **Gang of Four**: Object Structural Pattern

---

**Created**: 2024  
**Author**: Design Patterns Documentation  
**Version**: 1.0
