# Singleton Pattern — Session Logger

## 📖 Intent

ให้แน่ใจว่า **class มี instance เพียงตัวเดียว**  
และให้ **global access point** ไปยัง instance นั้น

## 🎨 Application Context

ระบบนี้ใช้ Singleton Pattern เพื่อจัดการ **session-level logging**  
และ **UI synchronization** ทั่วทั้ง application

### ตัวอย่างการใช้งาน

```tsx
// ทั้งที่ไหนก็ได้ในแอปพลิเคชัน
SessionLogger.getInstance().addLog("Theme changed to creative");

// Log เก็บใน instance เดียวเสมอ
const logs = SessionLogger.getInstance().getLogs(); // ได้ทั้งหมด
```

---

## 🏗️ Participants

### 1. Singleton — `SessionLogger`

**Description**

`SessionLogger` เป็น class ที่ **มี instance เพียงตัวเดียว**  
ตลอดการทำงานของแอปพลิเคชัน

**Key Attributes**

| Attribute | Type | Description |
|-----------|------|-------------|
| `instance` | `SessionLogger` | Static reference to the only instance |
| `logs` | `string[]` | Array เก็บ log messages |
| `listeners` | `(() => void)[]` | Callbacks สำหรับ UI re-render |

**Core Methods**

| Method | Parameters | Returns | Purpose |
|--------|-----------|---------|---------|
| `getInstance()` | — | `SessionLogger` | ได้ instance เดียว (Lazy initialization) |
| `addLog()` | `message: string` | `void` | เพิ่ม log message |
| `getLogs()` | — | `string[]` | ได้ list ของ logs ทั้งหมด |
| `clearLogs()` | — | `void` | ล้าง logs ทั้งหมด |
| `subscribe()` | `listener: () => void` | `() => void` | Subscribe to changes |

**Implementation Details**

```tsx
class SessionLogger {
  // 1. Static reference (global access point)
  private static instance: SessionLogger;

  // 2. Instance data
  private logs: string[] = [];
  private listeners: (() => void)[] = [];

  // 3. Private constructor (ป้องกัน new SessionLogger())
  private constructor() {
    this.addLog("Session started. Singleton initialized.");
  }

  // 4. Lazy initialization
  public static getInstance(): SessionLogger {
    if (!SessionLogger.instance) {
      SessionLogger.instance = new SessionLogger();
    }
    return SessionLogger.instance;
  }

  // 5. Business logic
  public addLog(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.unshift(`[${timestamp}] ${message}`);
    this.notifyListeners();
  }

  public getLogs(): string[] {
    return this.logs;
  }

  public clearLogs(): void {
    this.logs = [];
    this.addLog("Logs cleared.");
    this.notifyListeners();
  }

  // 6. Observer pattern for React integration
  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}
```

---

## ⚙️ Responsibilities

Singleton ต้องรับผิดชอบ:

- ✅ **Control Instantiation**  
  Private constructor ป้องกันการสร้าง instance หลายตัว

- ✅ **Provide Global Access**  
  `getInstance()` ให้ access ทั่วทั้ง application

- ✅ **Lazy Initialization**  
  สร้าง instance เมื่อจำเป็นเท่านั้น

- ✅ **Act as Infrastructure**  
  เป็น service layer ไม่ใช่ business logic

---

## 🔗 Collaboration

### Singleton Lifecycle

```
Application Start
       ↓
    Component 1 calls getInstance()
       ↓
    "if (!SessionLogger.instance)"
    ├─→ True: Create new instance
    │       └─→ Singleton.instance = new SessionLogger()
    │
    └─→ False: Return existing instance
                └─→ return SessionLogger.instance;
       ↓
    Component 2 calls getInstance()
       ↓
    ✓ Returns SAME instance from Component 1
       ↓
    All components share ONE instance
```

### Interaction Flow

```
┌──────────────────────────┐
│ PersonalWebsiteUltimate  │
│ (Component/Director)     │
└───────────┬──────────────┘
            │
    ┌───────┼───────┐
    │       │       │
    ▼       ▼       ▼
┌─────────────────────────────────────┐
│ SessionLogger.getInstance()         │
│ (ทำให้ instance เดียวเท่านั้น)     │
└──────────┬────────────────────────────┘
           │
    ┌──────┴───────┬─────────────┐
    │              │             │
    ▼              ▼             ▼
addLog()      subscribe()    getLogs()
    │              │             │
    └──────┬───────┴─────────────┘
           │
    notifyListeners()
           │
    ▼
useReducer callback
(Force React re-render)
```

### Code Integration

```tsx
// 1. Component subscribes to Singleton
useEffect(() => {
  const unsubscribe = SessionLogger.getInstance().subscribe(() => {
    forceUpdate(); // Re-render when logs change
  });
  return () => unsubscribe();
}, []);

// 2. Various actions log events
const handleStyleChange = (newStyle: LayoutStyle) => {
  SessionLogger.getInstance().addLog(
    `Abstract Factory: Switched theme to "${newStyle}"`
  );
  setStyle(newStyle);
};

const handleCloneItem = (item: ContentItem) => {
  const clonedItem = item.clone();
  // Note: clone() already calls Singleton internally!
  setItems([clonedItem, ...items]);
};

// 3. Display logs in UI
<div className="log-console">
  {SessionLogger.getInstance().getLogs().map((log, idx) => (
    <div key={idx}>{log}</div>
  ))}
</div>
```

---

## 💡 Why Singleton Fits Here

### 1. **Logging Must Be Consistent Across App**

```tsx
// ❌ Without Singleton (Bad)
const logger1 = new SessionLogger();
const logger2 = new SessionLogger();

logger1.addLog("Theme changed");
logger2.getLogs(); // ❌ ไม่มี log ด้านบน!

// ✅ With Singleton (Good)
const logger1 = SessionLogger.getInstance();
const logger2 = SessionLogger.getInstance();

logger1.addLog("Theme changed");
logger2.getLogs(); // ✓ ได้ทั้งหมด
```

### 2. **Multiple Instances Would Fragment History**

```tsx
// ❌ Without Singleton
Instance A has: ["event1", "event2"]
Instance B has: ["event3", "event4"]
Instance C has: ["event5"]

// User ไม่เห็น session history ที่สมบูรณ์!

// ✅ With Singleton
Single Instance has: ["event5", "event4", "event3", "event2", "event1"]

// ✓ Complete chronological history
```

### 3. **Centralized Cross-Pattern Communication**

```tsx
// Prototype Pattern calls Singleton
item.clone() → SessionLogger.getInstance().addLog(...)

// Builder Pattern calls Singleton
builder.addSection(...) → SessionLogger.getInstance().addLog(...)

// All without tight coupling!
```

### 4. **Simple Global Service Access**

```tsx
// Anywhere in the app:
SessionLogger.getInstance().addLog("Something happened");

// No need to pass logger through props
// No need to use Context API
// No need dependency injection
```

---

## ✨ Design Benefits

- ✅ **Controlled Instantiation**  
  ตรวจสอบได้ว่ามี instance เดียว

- ✅ **Global Access Point**  
  ไปที่ไหนก็ `getInstance()` ได้

- ✅ **Lazy Initialization**  
  สร้างเมื่อต้องการ ไม่เมื่อ app start

- ✅ **Cross-Module Communication**  
  Patterns ต่างกันสามารถ access data เดียว

- ✅ **Easy to Test**  
  Mock `getInstance()` ได้ง่ายใน tests

---

## ⚠️ Design Considerations

### **Stateful Singleton (ในที่นี้)**

```tsx
private logs: string[] = []; // ← Mutable state

// สิ่งนี้ OK สำหรับ Infrastructure/Logger
// แต่ต้องระวังสำหรับ business logic singletons
```

### **Threading Issues (ไม่เกี่ยวใน JavaScript)**

```tsx
// ใน Java/C++ ต้อง synchronize getInstance()
// JavaScript ใช้ single-threaded event loop
// ดังนั้น lazy initialization ปลอดภัย
```

### **Memory Considerations**

```tsx
// Logs array บวมได้ if session ยาว
// Solution: Cap log size หรือ archive old logs

public addLog(message: string): void {
  this.logs.unshift(`[${timestamp}] ${message}`);
  
  // Cap at 200 logs
  if (this.logs.length > 200) {
    this.logs = this.logs.slice(0, 200);
  }
  
  this.notifyListeners();
}
```

---

## 📚 Summary

Singleton Pattern ในระบบนี้:

1. **Ensure single instance** ของ logger ตลอด session

2. **Provide global access** ผ่าน `getInstance()`

3. **Enable centralized logging** จากทั้ง patterns

4. **Support React integration** ผ่าน listener/subscriber

### Integration with Other Patterns

```
Singleton (Logger)
    ↑
    └─ Called by ALL patterns:
       ├─ Abstract Factory (theme changes)
       ├─ Factory Method (layout selection)
       ├─ Builder (page composition)
       └─ Prototype (item cloning)
```

### Full Application Flow

```
User interaction
    ↓
handleStyleChange() / handleCloneItem() / etc.
    ↓
SessionLogger.getInstance().addLog(...)
    ↓
notifyListeners()
    ↓
useReducer callback (forceUpdate)
    ↓
Component re-renders with new logs
```

---

## 🚀 Implementation Tips

### **Adding Log Levels**

```tsx
class SessionLogger {
  enum LogLevel {
    INFO = 'ℹ️',
    SUCCESS = '✅',
    WARNING = '⚠️',
    ERROR = '❌'
  }

  public addLog(
    message: string,
    level: LogLevel = LogLevel.INFO
  ): void {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.unshift(
      `${level} [${timestamp}] ${message}`
    );
    this.notifyListeners();
  }
}

// Usage:
SessionLogger.getInstance().addLog("Theme changed", LogLevel.INFO);
SessionLogger.getInstance().addLog("Item cloned", LogLevel.SUCCESS);
```

### **Filtering and Searching Logs**

```tsx
public searchLogs(keyword: string): string[] {
  return this.logs.filter(log =>
    log.toLowerCase().includes(keyword.toLowerCase())
  );
}

public getLogsByTime(startTime: Date, endTime: Date): string[] {
  return this.logs.filter(log => {
    // Parse timestamp and filter...
  });
}
```

### **Exporting Logs**

```tsx
public exportLogs(format: 'json' | 'csv' = 'json'): string {
  if (format === 'json') {
    return JSON.stringify(this.logs, null, 2);
  } else if (format === 'csv') {
    return this.logs.join('\n');
  }
}

// Usage:
const logData = SessionLogger.getInstance().exportLogs('json');
downloadFile(logData, 'session-logs.json');
```

---

## 🎯 Common Pitfalls to Avoid

### **❌ Overusing Singleton**

```tsx
// Don't make everything a Singleton!
// ❌ Bad
class User {}
class UserManager extends Singleton { } // Why?

// ✓ Good
class Logger extends Singleton { } // Infrastructure service
```

### **❌ Storing Business Logic State**

```tsx
// ❌ Bad - Business logic in Singleton
class AppState extends Singleton {
  private userData: User;
  private cart: Product[];
  // Use Redux/Context instead!
}

// ✓ Good - Infrastructure only
class Logger extends Singleton {
  private logs: string[];
}
```

### **❌ Tight Coupling via Singleton**

```tsx
// ❌ Bad - Logger knows too much
SessionLogger.getInstance().log('user-specific-info');

// ✓ Better - Keep it generic
SessionLogger.getInstance().log('Action completed');
```

---

**Happy Logging! 📝✨**
