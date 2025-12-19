# Mediator Pattern — UI Coordination

## 📖 Intent

**ลด coupling** ระหว่าง objects ที่ communicate ด้วยการ  
define **object ที่ encapsulates** วิธี set ของ objects interact กับกัน

## 🎨 Application Context

Mediator Pattern ถูกใช้เพื่อ **coordinate UI changes** ตลอด application  
ลด dependencies ระหว่าง feature handlers

### ตัวอย่างการใช้งาน

```tsx
// Mediator notify ไปยัง multiple setState functions
mediatorRef.current!.notify('theme', 'change', { style: 'creative' });

// Mediator handles:
// 1. setStyle('creative')
// 2. setRenderMode('full')
// 3. resetIterator()
// Without requiring direct dependency
```

---

## 🏗️ Participants

### 1. Mediator Interface — `IMediator`

**Description**

`IMediator` ประกาศ communication protocol

**Methods**

```tsx
interface IMediator {
  notify(sender: string, event: string, data?: unknown): void;
}
```

**Responsibilities**

- `sender`: identify ใครเรียก
- `event`: เหตุการณ์ที่เกิด (type ของ change)
- `data`: optional payload associated กับ event

---

### 2. Concrete Mediator — `UIMediator`

**Description**

`UIMediator` implement `IMediator`  
จัดการ all UI coordination logic

**Constructor Dependencies**

```tsx
class UIMediator implements IMediator {
  constructor(
    private ctx: {
      setStyle: (s: LayoutStyle) => void;
      setPersona: (p: UserPersona) => void;
      setRenderMode: (m: RenderMode) => void;
      setShowImportModal: (b: boolean) => void;
      setProjects: (updater: (prev: ContentItem[]) => ContentItem[]) => void;
      setBlogs: (updater: (prev: ContentItem[]) => ContentItem[]) => void;
      setResearch: (updater: (prev: ContentItem[]) => ContentItem[]) => void;
      resetIterator: () => void;
      commandManager?: CommandManager;
      subject?: PortfolioSubject;
    }
  ) {}
}
```

**Key Handlers**

| Event | Handler | Actions |
|-------|---------|---------|
| `'theme'` | `change` | `setStyle()`, auto-adjust `renderMode` |
| `'persona'` | `change` | `setPersona()`, trigger mediator notifications |
| `'render-mode'` | `change` | `setRenderMode()` |
| `'import'` | `open` | `setShowImportModal(true)` |
| `'import'` | `close` | `setShowImportModal(false)` |
| `'iterator'` | `reset` | `resetIterator()` |

**Sample Notification**

```tsx
notify(sender: string, event: string, data?: unknown): void {
  switch (event) {
    case 'theme-change':
      this.ctx.setStyle(data.style as LayoutStyle);
      
      // Auto-adjust render mode based on style
      if (data.style === 'academic') {
        this.ctx.setRenderMode('preview');
      }
      break;
      
    case 'persona-change':
      this.ctx.setPersona(data.persona as UserPersona);
      break;
      
    // ... other cases
  }
}
```

---

### 3. Colleague Classes (Handlers)

**Description**

Colleagues (button handlers, feature functions) เรียก mediator  
แทนที่ communicate โดยตรง

**Example Colleague — Theme Change Handler**

```tsx
const handleStyleChange = (newStyle: LayoutStyle) => {
  SessionLogger.getInstance().addLog(`Theme: Switched to "${newStyle}" style`);
  // Instead of: setStyle(newStyle); setRenderMode(...);
  // Use mediator:
  mediatorRef.current!.notify('component', 'theme-change', { style: newStyle });
};
```

**Example Colleague — Persona Change Handler**

```tsx
const handlePersonaChange = (newPersona: UserPersona) => {
  SessionLogger.getInstance().addLog(`Persona: Switched to "${newPersona}" view`);
  mediatorRef.current!.notify('component', 'persona-change', { persona: newPersona });
};
```

---

## 📋 Implementation Example

### Mediator Initialization

```tsx
useEffect(() => {
  if (!portfolioRef.current) return;
  
  // Create mediator with all dependencies
  mediatorRef.current = new UIMediator({
    setStyle,
    setPersona,
    setRenderMode,
    setShowImportModal,
    setProjects: (updater) => setProjects(prev => updater(prev)),
    setBlogs: (updater) => setBlogs(prev => updater(prev)),
    setResearch: (updater) => setResearch(prev => updater(prev)),
    resetIterator: () => {
      if (portfolioRef.current) {
        iteratorRef.current = new PortfolioIterator(portfolioRef.current);
        setIterCurrent(null);
      }
    },
    commandManager: commandManagerRef.current!,
    subject: subjectRef.current!,
  });
}, []);
```

### Using Mediator

```tsx
// Colleague sends notification to mediator
const handleStyleChange = (newStyle: LayoutStyle) => {
  SessionLogger.getInstance().addLog(`Theme: Switched to "${newStyle}" style`);
  
  // Instead of calling multiple setState functions:
  // setStyle(newStyle);
  // setRenderMode('preview');
  // setPersona('developer');
  
  // Use mediator centralized logic:
  mediatorRef.current!.notify('component', 'theme-change', { style: newStyle });
};
```

---

## 🔄 Communication Flow

```
Colleague/Handler (Button Click)
        ↓
  notify() to UIMediator
        ↓
 UIMediator.notify()
        ↓
 Analyze event/sender
        ↓
 ┌─────────────────────────────────┐
 │ Execute coordinated actions:    │
 │ ├─ setStyle()                   │
 │ ├─ setRenderMode()              │
 │ ├─ setPersona()                 │
 │ ├─ resetIterator()              │
 │ └─ notify Subject (if needed)   │
 └─────────────────────────────────┘
        ↓
 UI Updates (re-render)
```

---

## 💡 Benefits

1. **Decoupling**: Colleagues ไม่ต้องรู้ about each other
2. **Centralized Control**: All coordination logic อยู่ที่ mediator
3. **Reusability**: Mediator สามารถ reuse กับ colleague sets ต่างๆ
4. **Testability**: Can mock mediator สำหรับ testing colleagues
5. **Flexibility**: เพิ่ม/ลบ colleagues โดยไม่แก้ mediator core

---

## ⚠️ Trade-offs

### Advantages
- Colleagues simplified (ต่อ feature)
- Coherent change management
- Easy to modify interaction rules

### Disadvantages
- Mediator becomes complex (God Object ปัญหา)
- Hard to trace execution flow
- Can become bottleneck

---

## 🔗 Related Patterns

- **Observer**: Subject notified from mediator
- **Singleton**: SessionLogger ใช้ by mediator
- **State**: State context activated by mediator
- **Command**: Commands executed from mediator
- **Strategy**: Strategy selection coordinated by mediator
