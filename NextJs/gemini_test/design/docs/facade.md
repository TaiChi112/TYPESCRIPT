# 🏢 Facade Pattern - เอกสารภาษาไทย

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

**Facade Pattern** เป็น Structural Design Pattern ที่ให้ interface แบบง่ายๆ เพื่อใช้งานระบบย่อย (subsystem) ที่ซับซ้อน โดยซ่อนรายละเอียดที่ยุ่งยากไว้ข้างหลัง

### คำอธิบายแบบเปรียบเทียบ

**เหมือนพนักงานต้อนรับโรงแรม:**
- คุณไม่ต้องไปจัดการห้องพัก, ร้านอาหาร, สปา, แม่บ้าน ด้วยตัวเอง
- แค่บอกพนักงานต้อนรับว่าต้องการอะไร
- พนักงานจะประสานงานทุกแผนกให้

**ในโค้ด:**
- Client ไม่ต้องรู้จักทุก class ในระบบ
- เรียกผ่าน Facade (interface เดียว)
- Facade ประสานงานกับระบบย่อยทั้งหมด

---

## 🚨 ปัญหาที่พบ

### สถานการณ์

ในโปรเจกต์ Portfolio ของเรา มี Design Patterns หลายตัวทำงานร่วมกัน:

1. **Singleton** - SessionLogger สำหรับ logging
2. **Prototype** - ContentItem.clone() สำหรับ copy items
3. **Adapter** - JSONContentAdapter สำหรับ import ข้อมูล
4. **Decorator** - 5 decorators สำหรับเพิ่มฟีเจอร์
5. **Bridge** - 3 render strategies
6. **Composite** - Portfolio tree structure
7. **Builder + Factory** - Page construction

### ปัญหาสำหรับ Client

เมื่อต้องการ **สร้าง project พร้อม decorations** ต้องทำหลายขั้นตอน:

```typescript
// ❌ ซับซ้อน - Client ต้องรู้จักทุก pattern

// 1. สร้าง item
const item = new ContentItem(
  'proj-1',
  'My Project',
  'Description',
  '2024',
  ['React', 'TypeScript']
);

// 2. เพิ่มเข้า state
projects.push(item);

// 3. สร้าง decorators
const featured = new FeaturedDecorator(item);
const hot = new HotDecorator(featured);

// 4. เก็บ decorators
itemDecorators['proj-1'] = [featured, hot];

// 5. Log ด้วยตัวเอง
const logger = SessionLogger.getInstance();
logger.addLog('Created project with 2 decorations');

// 6. อัพเดท React state
setProjects([...projects]);
setItemDecorators({...itemDecorators});
```

### ปัญหาที่เจอ

1. **ความซับซ้อนสูง** - Client ต้องรู้จัก 7+ patterns
2. **โค้ดยาว** - ทำอะไรง่ายๆ ก็ต้องเขียนเยอะ
3. **ผูกแน่น (Tight Coupling)** - Client ขึ้นกับทุก class
4. **ยากต่อการดูแล** - เปลี่ยนที่ไหน Client ต้องเปลี่ยนตาม
5. **เสี่ยงต่อ bugs** - ลืมทำขั้นตอนใดขั้นตอนหนึ่ง
6. **Learning curve สูง** - คนใหม่งง ต้องเรียนรู้ทุก pattern

---

## 💡 โซลูชัน

### Facade Pattern แก้ปัญหาอย่างไร

สร้าง **PortfolioFacade** class ที่ให้ interface แบบง่ายๆ:

```typescript
// ✅ ง่าย - Client เรียก Facade

const facade = PortfolioFacade.getInstance();

const item = facade.createDecoratedItem(
  'project',
  'My Project',
  'Description',
  '2024',
  ['React', 'TypeScript'],
  ['Featured', 'Hot'] // decorations อยู่ที่นี่เลย!
);

// จบ! ทุกอย่างทำให้อัตโนมัติ:
// ✅ สร้าง ContentItem
// ✅ เพิ่มเข้า projects[]
// ✅ สร้าง decorators
// ✅ Log ผ่าน Singleton
// ✅ อัพเดท state
```

### จุดเด่น

1. **Interface เดียว** - เรียกผ่าน Facade
2. **ซ่อนความซับซ้อน** - Client ไม่ต้องรู้ internals
3. **ใช้งานง่าย** - One-liner operations
4. **ลดการผูกแน่น** - Client ไม่ขึ้นกับ subsystems
5. **ปลอดภัย** - Facade จัดการ edge cases
6. **Maintainable** - เปลี่ยน implementation ไม่กระทบ client

---

## 🏗️ โครงสร้าง

### Components

#### 1. **PortfolioFacade (Facade Class)**

**หน้าที่:**
- ให้ interface แบบง่ายๆ
- ประสานงานระบบย่อย 7+ patterns
- ซ่อนความซับซ้อน

**คุณสมบัติ:**
```typescript
class PortfolioFacade {
  // Singleton instance
  private static instance: PortfolioFacade;
  
  // Internal state (ซ่อนจาก client)
  private projects: ContentItem[] = [];
  private blogs: ContentItem[] = [];
  private research: ContentItem[] = [];
  private decorators: Record<string, ContentDecorator[]> = {};
  
  // Private constructor (ใช้ Singleton)
  private constructor() {
    SessionLogger.getInstance().addLog("Facade: Initialized");
  }
  
  // ===== Public API =====
  
  // Singleton access
  public static getInstance(): PortfolioFacade;
  
  // Simple CRUD
  public addProject(...): ContentItem;
  public addBlog(...): ContentItem;
  public addResearch(...): ContentItem;
  
  // Complex operations
  public cloneItem(id: string): ContentItem | null;
  public importFromJSON(data: any, type: string): ContentItem;
  public applyDecoration(id: string, type: string): void;
  public createDecoratedItem(..., decorations: string[]): ContentItem;
  public renderItem(item, mode): React.ReactNode;
  
  // Getters
  public getProjects(): ContentItem[];
  public getBlogs(): ContentItem[];
  public getResearch(): ContentItem[];
  public getDecorations(id: string): string[];
  public getAllDecorations(): Record<string, ContentDecorator[]>;
  
  // State synchronization (สำหรับ React)
  public setProjects(items: ContentItem[]): void;
  public setBlogs(items: ContentItem[]): void;
  public setResearch(items: ContentItem[]): void;
  public setDecorators(decs: Record<...>): void;
  
  // Private helpers
  private findItem(id: string): ContentItem | undefined;
}
```

---

#### 2. **Subsystem Classes (7+ Patterns)**

Facade ใช้งาน patterns เหล่านี้แบบอัตโนมัติ:

**a) Singleton - SessionLogger**
```typescript
// Facade log ทุก operation
SessionLogger.getInstance().addLog("...");
```

**b) Prototype - ContentItem**
```typescript
// Facade ใช้ clone items
const cloned = item.clone();
```

**c) Adapter - JSONContentAdapter**
```typescript
// Facade import external data
const adapter = new JSONContentAdapter(data, type);
const item = adapter.adapt();
```

**d) Decorator - 5 Decorators**
```typescript
// Facade สร้าง decorators
const featured = new FeaturedDecorator(item);
const hot = new HotDecorator(featured);
```

**e) Bridge - Render Strategies**
```typescript
// Facade delegate rendering
const strategy = getRenderStrategy(mode);
const renderer = new ProjectRenderer(strategy);
```

**f) Composite - Portfolio Tree**
```typescript
// Facade จัดการ hierarchical structure
```

**g) Builder + Factory**
```typescript
// Facade ใช้สร้าง complex objects
```

---

## ⚙️ การทำงาน

### Flow Diagram

```
Client
  │
  ├─ facade.createDecoratedItem(...)
  │
  ▼
PortfolioFacade
  │
  ├─ Generate ID
  ├─ new ContentItem(...) ─────────────► ContentItem created
  ├─ projects.push(item) ──────────────► Added to state
  │
  ├─ Loop decorations:
  │   ├─ new FeaturedDecorator(item) ──► Decorator 1
  │   ├─ decorators[id].push(...) ─────► Stored
  │   ├─ new HotDecorator(...) ────────► Decorator 2
  │   └─ decorators[id].push(...) ─────► Stored
  │
  ├─ SessionLogger.addLog(...) ────────► Logged via Singleton
  │
  └─ return item ──────────────────────► Return to client
```

---

### ขั้นตอนการทำงาน

#### Method: `createDecoratedItem()`

**Input:**
```typescript
facade.createDecoratedItem(
  'project',                    // type
  'My Project',                 // title
  'Cool project',               // description
  '2024',                       // date
  ['React', 'TypeScript'],      // tags
  ['Featured', 'Hot']           // decorations
);
```

**ขั้นตอนภายใน Facade:**

1. **Generate ID**
   ```typescript
   const id = `project-${Date.now()}-${Math.random()}`;
   ```

2. **Create Item** (ใช้ ContentItem)
   ```typescript
   const item = new ContentItem(id, title, description, date, tags);
   ```

3. **Add to State**
   ```typescript
   this.projects.push(item);
   ```

4. **Log Creation** (ใช้ Singleton)
   ```typescript
   SessionLogger.getInstance().addLog(`Facade: Added project "${title}"`);
   ```

5. **Apply Decorations** (Loop)
   ```typescript
   decorations.forEach(decorationType => {
     this.applyDecoration(item.id, decorationType);
   });
   ```

6. **Log Decorations**
   ```typescript
   SessionLogger.getInstance().addLog(
     `Facade: Created with ${decorations.length} decorations`
   );
   ```

7. **Return Item**
   ```typescript
   return item;
   ```

**Output:**
```typescript
ContentItem {
  id: 'project-1234567890',
  title: 'My Project',
  description: 'Cool project',
  date: '2024',
  tags: ['React', 'TypeScript']
}

// Decorations stored in facade.decorators
// Logs added to SessionLogger
// State updated automatically
```

---

#### Method: `cloneItem()`

**การทำงาน:**

```typescript
cloneItem(itemId: string): ContentItem | null {
  // 1. หา item จาก id
  const item = this.findItem(itemId);
  if (!item) {
    SessionLogger.getInstance().addLog(`Item ${itemId} not found`);
    return null;
  }
  
  // 2. Clone ด้วย Prototype Pattern
  const cloned = item.clone();
  
  // 3. Copy decorations (ถ้ามี)
  if (this.decorators[itemId]) {
    this.decorators[cloned.id] = [...this.decorators[itemId]];
  }
  
  // 4. เพิ่มเข้า collection ที่เหมาะสม
  if (this.projects.includes(item)) {
    this.projects.push(cloned);
  } else if (this.blogs.includes(item)) {
    this.blogs.push(cloned);
  } else if (this.research.includes(item)) {
    this.research.push(cloned);
  }
  
  // 5. Log
  SessionLogger.getInstance().addLog(
    `Facade: Cloned item "${item.title}" with ${
      this.decorators[itemId]?.length || 0
    } decorations`
  );
  
  return cloned;
}
```

**จุดเด่น:**
- ใช้ Prototype Pattern (clone)
- Copy decorations มาด้วย (preservation)
- เพิ่มเข้า collection อัตโนมัติ
- Log ผ่าน Singleton

---

#### Method: `importFromJSON()`

**การทำงาน:**

```typescript
importFromJSON(jsonData: any, type: string): ContentItem {
  // 1. สร้าง Adapter
  const adapter = new JSONContentAdapter(jsonData, type);
  
  // 2. Convert ด้วย Adapter Pattern
  const item = adapter.adapt();
  
  // 3. เพิ่มเข้า collection
  if (type === 'project') {
    this.projects.push(item);
  } else if (type === 'blog') {
    this.blogs.push(item);
  } else if (type === 'research') {
    this.research.push(item);
  }
  
  // 4. Log
  SessionLogger.getInstance().addLog(
    `Facade: Imported ${type} "${item.title}" via Adapter`
  );
  
  return item;
}
```

**ตัวอย่าง:**
```typescript
const externalData = {
  name: 'Project from API',
  summary: 'Cool stuff',
  year: 2024,
  tech_stack: ['React', 'Node']
};

// ง่ายมาก!
const item = facade.importFromJSON(externalData, 'project');

// Facade จัดการให้:
// - สร้าง Adapter
// - Convert format
// - เพิ่มเข้า projects[]
// - Log operation
```

---

#### Method: `applyDecoration()`

**การทำงาน:**

```typescript
applyDecoration(itemId: string, decorationType: string): void {
  // 1. หา item
  const item = this.findItem(itemId);
  if (!item) return;
  
  // 2. เช็คว่ามี decoration นี้แล้วหรือยัง
  const currentDecorators = this.decorators[itemId] || [];
  const hasDecoration = currentDecorators.some(
    d => d.decorationType === decorationType
  );
  
  // 3. ถ้ามีแล้ว = ลบออก (toggle)
  if (hasDecoration) {
    this.decorators[itemId] = currentDecorators.filter(
      d => d.decorationType !== decorationType
    );
    SessionLogger.getInstance().addLog(
      `Facade: Removed ${decorationType} from ${itemId}`
    );
    return;
  }
  
  // 4. ถ้ายังไม่มี = เพิ่ม
  // หา base (item สุดท้ายที่ถูก decorate)
  const base = currentDecorators.length > 0
    ? currentDecorators[currentDecorators.length - 1]
    : item;
  
  // 5. สร้าง decorator ตามประเภท
  let decorator: ContentDecorator;
  switch (decorationType) {
    case 'Featured':
      decorator = new FeaturedDecorator(base);
      break;
    case 'Pinned':
      decorator = new PinnedDecorator(base);
      break;
    case 'Award':
      decorator = new AwardDecorator(base);
      break;
    case 'Trending':
      decorator = new TrendingDecorator(base);
      break;
    case 'Hot':
      decorator = new HotDecorator(base);
      break;
    default:
      return;
  }
  
  // 6. เก็บ decorator
  this.decorators[itemId] = [...currentDecorators, decorator];
  
  // 7. Log
  SessionLogger.getInstance().addLog(
    `Facade: Applied ${decorationType} to ${itemId}`
  );
}
```

**จุดเด่น:**
- Toggle decoration (มีแล้วก็ลบ)
- Stack decorators (วางซ้อนกันได้)
- Auto-detect base item
- Log every operation

---

## 💻 ตัวอย่างการใช้งาน

### ตัวอย่างที่ 1: เพิ่ม Project แบบธรรมดา

#### ก่อนใช้ Facade (ซับซ้อน)
```typescript
// ❌ ยาว 15+ บรรทัด

const id = `project-${Date.now()}`;
const item = new ContentItem(
  id,
  'My Project',
  'Description here',
  '2024',
  ['React', 'TypeScript']
);

projects.push(item);

const logger = SessionLogger.getInstance();
logger.addLog(`Added project "${item.title}"`);

setProjects([...projects]);
```

#### หลังใช้ Facade (ง่าย)
```typescript
// ✅ สั้น 3 บรรทัด

const facade = PortfolioFacade.getInstance();
const item = facade.addProject(
  'auto-id', // Facade generate ID เอง
  'My Project',
  'Description here',
  '2024',
  ['React', 'TypeScript']
);

// Done! Facade ทำให้:
// - สร้าง item
// - เพิ่มเข้า projects[]
// - Log ด้วย Singleton
```

---

### ตัวอย่างที่ 2: สร้าง Project พร้อม Decorations

#### ก่อนใช้ Facade (ยุ่งยาก)
```typescript
// ❌ ยาว 25+ บรรทัด

// 1. สร้าง item
const id = `project-${Date.now()}`;
const item = new ContentItem(id, 'Title', 'Desc', '2024', ['tag']);

// 2. เพิ่มเข้า state
projects.push(item);

// 3. สร้าง decorators
const featured = new FeaturedDecorator(item);
const hot = new HotDecorator(featured);

// 4. เก็บ decorators
itemDecorators[id] = [featured, hot];

// 5. Log
const logger = SessionLogger.getInstance();
logger.addLog('Created item');
logger.addLog('Applied Featured');
logger.addLog('Applied Hot');

// 6. Update React state
setProjects([...projects]);
setItemDecorators({...itemDecorators});
```

#### หลังใช้ Facade (สั้น!)
```typescript
// ✅ สั้น 1 บรรทัด!

const facade = PortfolioFacade.getInstance();

facade.createDecoratedItem(
  'project',
  'Title',
  'Desc',
  '2024',
  ['tag'],
  ['Featured', 'Hot'] // decorations!
);

// Done! Facade ทำทุกอย่างให้:
// ✅ สร้าง item
// ✅ เพิ่มเข้า projects[]
// ✅ สร้าง Featured decorator
// ✅ สร้าง Hot decorator
// ✅ เก็บ decorators
// ✅ Log 3 ครั้ง (create, featured, hot)
```

---

### ตัวอย่างที่ 3: Clone Item พร้อม Decorations

#### ก่อนใช้ Facade
```typescript
// ❌ ต้องจัดการ cloning + decorations เอง

const original = projects.find(p => p.id === 'proj-1');
if (!original) return;

// Clone item (Prototype)
const cloned = original.clone();

// Copy decorations
const originalDecs = itemDecorators['proj-1'];
if (originalDecs) {
  itemDecorators[cloned.id] = [...originalDecs];
}

// เพิ่มเข้า projects
projects.push(cloned);

// Log
const logger = SessionLogger.getInstance();
logger.addLog(`Cloned project "${original.title}"`);

// Update state
setProjects([...projects]);
setItemDecorators({...itemDecorators});
```

#### หลังใช้ Facade
```typescript
// ✅ One-liner!

const facade = PortfolioFacade.getInstance();

// Sync state ก่อน
facade.setProjects(projects);
facade.setDecorators(itemDecorators);

// Clone!
const cloned = facade.cloneItem('proj-1');

// Update React state
setProjects(facade.getProjects());
setItemDecorators(facade.getAllDecorations());

// Facade จัดการให้:
// ✅ หา item
// ✅ Clone ด้วย Prototype
// ✅ Copy decorations
// ✅ เพิ่มเข้า projects[]
// ✅ Log operation
```

---

### ตัวอย่างที่ 4: Import External Data

#### ก่อนใช้ Facade
```typescript
// ❌ ต้องรู้จัก Adapter Pattern

const externalData = {
  name: 'API Project',
  summary: 'From API',
  year: 2024,
  tech_stack: ['React']
};

// สร้าง Adapter
const adapter = new JSONContentAdapter(externalData, 'project');

// Convert
const item = adapter.adapt();

// เพิ่มเข้า state
projects.push(item);

// Log
const logger = SessionLogger.getInstance();
logger.addLog(`Imported project via Adapter`);

// Update state
setProjects([...projects]);
```

#### หลังใช้ Facade
```typescript
// ✅ ง่ายมาก!

const facade = PortfolioFacade.getInstance();

const externalData = {
  name: 'API Project',
  summary: 'From API',
  year: 2024,
  tech_stack: ['React']
};

// Import!
facade.importFromJSON(externalData, 'project');

// Facade จัดการให้:
// ✅ สร้าง Adapter
// ✅ Convert data
// ✅ เพิ่มเข้า projects[]
// ✅ Log operation
```

---

### ตัวอย่างที่ 5: ใช้งานใน React Component

```typescript
function PortfolioPage() {
  const [projects, setProjects] = useState<ContentItem[]>([]);
  const [itemDecorators, setItemDecorators] = useState<Record>({});
  
  // Get Facade instance
  const facade = PortfolioFacade.getInstance();
  
  // ฟังก์ชันเพิ่ม project แบบ decorated
  const handleAddDecoratedProject = () => {
    // Sync state เข้า Facade
    facade.setProjects(projects);
    facade.setDecorators(itemDecorators);
    
    // สร้าง project พร้อม decorations (One-liner!)
    facade.createDecoratedItem(
      'project',
      'Quick Project',
      'Created via Facade Pattern!',
      new Date().getFullYear().toString(),
      ['Facade', 'Quick'],
      ['Featured', 'Hot'] // 2 decorations!
    );
    
    // อัพเดท React state จาก Facade
    setProjects(facade.getProjects());
    setItemDecorators(facade.getAllDecorations());
  };
  
  // ฟังก์ชัน import ข้อมูล
  const handleImport = () => {
    facade.setProjects(projects);
    
    const sampleData = {
      name: 'Imported Project',
      summary: 'From external source',
      year: 2024,
      tech_stack: ['Facade', 'Adapter']
    };
    
    // Import! (One-liner!)
    facade.importFromJSON(sampleData, 'project');
    
    // อัพเดท state
    setProjects(facade.getProjects());
  };
  
  return (
    <div>
      <button onClick={handleAddDecoratedProject}>
        ➕ Add Decorated Project
      </button>
      
      <button onClick={handleImport}>
        📦 Import via Facade
      </button>
      
      {/* แสดง projects */}
      {projects.map(project => (
        <div key={project.id}>
          <h3>{project.title}</h3>
          
          {/* แสดง decorations */}
          {facade.getDecorations(project.id).map(dec => (
            <span key={dec}>{dec}</span>
          ))}
        </div>
      ))}
    </div>
  );
}
```

**จุดเด่นในการใช้กับ React:**
- Sync state ระหว่าง React และ Facade
- One-liner operations
- Easy state updates
- Type-safe

---

## ✅ ข้อดีและข้อเสีย

### ข้อดี

#### 1. **ความง่ายในการใช้งาน** 🎯
```typescript
// ✅ Before: 20+ lines
// ✅ After: 1 line
facade.createDecoratedItem(...);
```

#### 2. **ลดการผูกแน่น (Loose Coupling)** 🔓
- Client ไม่ต้องรู้จัก subsystem classes
- เปลี่ยน implementation ได้โดยไม่กระทบ client

#### 3. **ซ่อนความซับซ้อน** 🔒
- Client ไม่ต้องรู้ว่าข้างในทำอะไร
- แค่รู้ว่าเรียกยังไง

#### 4. **การประสานงาน Patterns** 🤝
- Facade จัดการ interaction ระหว่าง patterns
- Client ไม่ต้องประสานเอง

#### 5. **Testability** 🧪
- Mock Facade ได้ง่าย
- Test client code โดยไม่ต้อง setup subsystems

#### 6. **Maintainability** 🛠️
- เปลี่ยน subsystem แค่ที่ Facade
- Client code ไม่ต้องแก้

#### 7. **Learning Curve ต่ำ** 📚
- คนใหม่ใช้ Facade ได้เลย
- ไม่ต้องเรียนรู้ทุก pattern

---

### ข้อเสีย

#### 1. **God Object Risk** ⚠️
- Facade อาจใหญ่เกินไป
- ทำหน้าที่เยอะเกินไป

**แก้:** แยก Facade หลายตัว (เช่น ProjectFacade, BlogFacade)

#### 2. **Limited Flexibility** 🔒
- Facade อาจไม่ครอบคลุมทุก use case
- บางทีต้อง access subsystem ตรงๆ

**แก้:** ให้ escape hatch (เช็ค subsystems ได้)

#### 3. **Extra Layer** 📦
- เพิ่ม indirection หนึ่งชั้น
- อาจช้าลงเล็กน้อย (negligible)

**แก้:** ใช้เฉพาะกรณีที่จำเป็น

#### 4. **Maintenance Overhead** 🔧
- ต้องดูแล Facade อีกชั้น
- Subsystem เปลี่ยน Facade ต้องตาม

**แก้:** ทำ Facade เป็น thin wrapper (ไม่ใส่ logic เยอะ)

---

### เปรียบเทียบข้อดี - ข้อเสีย

| ข้อดี ✅ | ข้อเสีย ❌ | คะแนน |
|---------|----------|-------|
| ใช้งานง่าย | God Object | 9/10 |
| Loose Coupling | Limited Flexibility | 9/10 |
| ซ่อนความซับซ้อน | Extra Layer | 8/10 |
| ประสานงาน Patterns | Maintenance | 8/10 |
| Testable | - | 9/10 |
| Maintainable | - | 8/10 |
| Learning Curve ต่ำ | - | 10/10 |

**Overall: 9/10** - แนะนำใช้กับระบบที่ซับซ้อน

---

## 🤔 เมื่อไหร่ควรใช้

### ✅ ใช้ Facade เมื่อ:

#### 1. **ระบบซับซ้อน**
```
มี classes/patterns เยอะ (7+ patterns)
Subsystem ยุ่งยาก
Learning curve สูง
```

**ตัวอย่าง:**
- Portfolio ที่ใช้ 7+ patterns
- E-commerce system (Payment, Shipping, Inventory, etc.)
- Game engine (Rendering, Physics, Audio, Input, etc.)

#### 2. **ต้องการ Layer Abstraction**
```
ซ่อน implementation details
Client ไม่ควรรู้ internals
Minimize dependencies
```

**ตัวอย่าง:**
- Library wrapper (axios → custom API client)
- Database abstraction layer
- Third-party service wrapper

#### 3. **มีหลายวิธีทำเรื่องเดียว**
```
Subsystem มีหลาย entry points
ต้องการ standardized approach
Reduce complexity
```

**ตัวอย่าง:**
- User authentication (OAuth, JWT, Session, etc.)
- File upload (Local, S3, Cloudinary, etc.)
- Notification (Email, SMS, Push, etc.)

#### 4. **ต้องการ Decoupling**
```
Client ไม่ควรขึ้นกับ subsystem
ต้องการเปลี่ยน implementation ได้
Flexibility สูง
```

**ตัวอย่าง:**
- Microservices communication
- Plugin architecture
- Modular system

---

### ❌ ไม่ควรใช้ Facade เมื่อ:

#### 1. **ระบบง่าย**
```
มี class น้อย (< 5 classes)
ไม่ซับซ้อน
ไม่มีอะไรต้องซ่อน
```

**ตัวอย่าง:**
- Simple CRUD app
- Static website
- Single-file script

#### 2. **ต้องการ Full Control**
```
Client ต้องใช้ทุกฟีเจอร์ของ subsystem
Facade จำกัดเกินไป
Performance critical
```

**ตัวอย่าง:**
- Graphics rendering engine (ต้อง control ทุก detail)
- Low-level system programming
- Real-time applications

#### 3. **Subsystem ไม่เสถียร**
```
Subsystem เปลี่ยนบ่อย
Facade ต้องอัพเดทตลอด
Maintenance burden
```

**ตัวอย่าง:**
- Prototype phase (ยังทดลองอยู่)
- Early development (architecture ยังไม่ fix)

#### 4. **Over-engineering**
```
Adding complexity โดยไม่จำเป็น
YAGNI (You Aren't Gonna Need It)
Premature optimization
```

---

## 🌍 การประยุกต์ใช้จริง

### 1. **jQuery (JavaScript Library)**

```javascript
// jQuery เป็น Facade สำหรับ DOM API

// ❌ Without jQuery (ซับซ้อน)
const element = document.getElementById('myElement');
element.addEventListener('click', function() {
  element.classList.add('active');
  element.style.display = 'block';
});

// ✅ With jQuery (Facade)
$('#myElement').click(function() {
  $(this).addClass('active').show();
});
```

**jQuery ซ่อน:**
- DOM API ที่ซับซ้อน
- Browser compatibility issues
- Event handling
- Animation
- AJAX

---

### 2. **Stripe API Wrapper**

```typescript
// ❌ Without Facade (ยุ่งยาก)
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const customer = await stripe.customers.create({...});
const paymentMethod = await stripe.paymentMethods.create({...});
await stripe.paymentMethods.attach(paymentMethod.id, {
  customer: customer.id
});
const intent = await stripe.paymentIntents.create({...});
await stripe.paymentIntents.confirm(intent.id, {...});

// ✅ With Facade (ง่าย)
class PaymentFacade {
  async processPayment(amount, customerData, cardData) {
    // ซ่อนความซับซ้อนของ Stripe API
    const customer = await this.createCustomer(customerData);
    const paymentMethod = await this.attachPaymentMethod(customer, cardData);
    const result = await this.charge(customer, amount, paymentMethod);
    return result;
  }
}

const payment = new PaymentFacade();
const result = await payment.processPayment(1000, customer, card);
```

---

### 3. **Home Theater System**

```typescript
// ❌ Without Facade (เปิดดูหนัง = 10 steps)
tv.turnOn();
tv.setInput('HDMI1');
soundSystem.turnOn();
soundSystem.setInput('HDMI');
soundSystem.setVolume(50);
bluRayPlayer.turnOn();
bluRayPlayer.play();
lights.dim(20);
popcornMaker.turnOn();
popcornMaker.pop();

// ✅ With Facade (1 method!)
class HomeTheaterFacade {
  watchMovie(movie: string) {
    console.log('Get ready to watch ' + movie);
    this.popcornMaker.turnOn();
    this.popcornMaker.pop();
    this.lights.dim(20);
    this.tv.turnOn();
    this.tv.setInput('HDMI1');
    this.soundSystem.turnOn();
    this.soundSystem.setInput('HDMI');
    this.soundSystem.setVolume(50);
    this.bluRayPlayer.turnOn();
    this.bluRayPlayer.play(movie);
  }
  
  endMovie() {
    console.log('Shutting down...');
    // Turn everything off
  }
}

const homeTheater = new HomeTheaterFacade();
homeTheater.watchMovie('Inception');
```

---

### 4. **Database Abstraction Layer (Prisma, TypeORM)**

```typescript
// ❌ Without Facade (Raw SQL)
const connection = await mysql.createConnection({...});
await connection.execute(
  'INSERT INTO users (name, email) VALUES (?, ?)',
  ['John', 'john@example.com']
);
const [rows] = await connection.execute(
  'SELECT * FROM users WHERE email = ?',
  ['john@example.com']
);
await connection.end();

// ✅ With Facade (ORM = Facade)
const user = await prisma.user.create({
  data: {
    name: 'John',
    email: 'john@example.com'
  }
});

const found = await prisma.user.findUnique({
  where: { email: 'john@example.com' }
});
```

**ORMs เป็น Facade สำหรับ:**
- Raw SQL complexity
- Connection management
- Query building
- Transaction handling
- Migration management

---

### 5. **Next.js (Web Framework)**

```typescript
// ❌ Without Facade (Manual setup)
import express from 'express';
import webpack from 'webpack';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

const app = express();
const compiler = webpack(webpackConfig);

app.use(webpackMiddleware(compiler));
app.get('*', (req, res) => {
  const html = ReactDOMServer.renderToString(<App />);
  res.send(`<!DOCTYPE html>...${html}...`);
});

// ✅ With Facade (Next.js)
// app/page.tsx
export default function Page() {
  return <div>Hello World</div>;
}

// Next.js ซ่อน:
// - Webpack configuration
// - Server setup
// - SSR implementation
// - Routing
// - Code splitting
```

---

### 6. **AWS SDK Facade**

```typescript
// ❌ Without Facade (Complex AWS SDK)
import AWS from 'aws-sdk';

const s3 = new AWS.S3();
const lambda = new AWS.Lambda();
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Upload to S3
await s3.putObject({
  Bucket: 'my-bucket',
  Key: 'file.jpg',
  Body: buffer,
  ACL: 'public-read'
}).promise();

// Invoke Lambda
await lambda.invoke({
  FunctionName: 'my-function',
  Payload: JSON.stringify({...})
}).promise();

// Save to DynamoDB
await dynamodb.put({
  TableName: 'my-table',
  Item: {...}
}).promise();

// ✅ With Facade (Simple)
class CloudFacade {
  async uploadFile(file, filename) {
    const url = await this.s3.upload(file, filename);
    await this.lambda.processFile(filename);
    await this.db.saveFileRecord(filename, url);
    return url;
  }
}

const cloud = new CloudFacade();
const url = await cloud.uploadFile(buffer, 'file.jpg');
```

---

## 🎓 สรุป

### Key Takeaways

1. **Facade = Interface ที่ง่าย**
   - ซ่อนความซับซ้อนของ subsystem
   - ให้ high-level API ที่ใช้งานง่าย
   - One interface for complex subsystem

2. **Simplify, Don't Limit**
   - ทำให้ง่ายขึ้น แต่ไม่จำกัด
   - Client ยังเข้าถึง subsystem ได้ (ถ้าจำเป็น)
   - Balance between simplicity and flexibility

3. **Coordinate Patterns**
   - Facade ประสานงานหลาย patterns
   - จัดการ interaction อัตโนมัติ
   - Automatic logging, state management

4. **Loose Coupling**
   - Client ไม่ขึ้นกับ subsystem classes
   - เปลี่ยน implementation ได้ง่าย
   - Testable, maintainable

5. **Real-world Usage**
   - Libraries (jQuery, React, Next.js)
   - ORMs (Prisma, TypeORM)
   - API wrappers (Stripe, AWS)
   - System abstraction

---

### เมื่อไหร่ควรใช้

```
✅ ใช้เมื่อ:
- ระบบซับซ้อน (7+ patterns)
- ต้องการ layer abstraction
- Hide implementation details
- Reduce learning curve

❌ ไม่ใช้เมื่อ:
- ระบบง่าย (< 5 classes)
- ต้องการ full control
- Over-engineering
- Premature optimization
```

---

### ข้อควรระวัง

1. **Avoid God Object** - อย่าใส่ทุกอย่างใน Facade
2. **Keep It Simple** - Facade ควรเป็น thin wrapper
3. **Don't Limit** - ยังให้ access subsystem ได้
4. **Test Both** - Test Facade และ subsystems แยกกัน
5. **Document Well** - อธิบาย Facade ทำอะไร

---

### Next Steps

เรียนรู้ patterns อื่นๆ ที่ทำงานร่วมกับ Facade:
- [Adapter Pattern](./adapter.md) - Convert interfaces
- [Bridge Pattern](./bridge.md) - Decouple abstraction
- [Composite Pattern](./composite.md) - Tree structure
- [Decorator Pattern](./decorator.md) - Add features
- [Proxy Pattern](./proxy.md) - Control access

---

**Pattern Type**: Structural Design Pattern  
**Complexity**: Low-Medium  
**Use Frequency**: Very High ⭐⭐⭐⭐⭐  
**Real-world Examples**: jQuery, ORMs, AWS SDKs, Next.js

สร้างโดย: คุณชื่อ Portfolio Design Patterns Project  
อัพเดทล่าสุด: ธันวาคม 2024  
เอกสารที่เกี่ยวข้อง: [facade.md](../diagram/facade.md) (Mermaid Diagrams)
