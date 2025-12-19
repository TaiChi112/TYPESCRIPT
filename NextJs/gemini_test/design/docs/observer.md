# Observer Pattern — Event Notification

## 📖 Intent

**Define one-to-many dependency** ระหว่าง objects  
เมื่อ object (subject) **เปลี่ยน state**  
dependent objects (observers) **automatically notified**

## 🎨 Application Context

Observer Pattern ถูกใช้เพื่อ **notify observers เมื่อ portfolio events เกิด**  
เช่น content added, cloned, imported เป็นต้น

### ตัวอย่างการใช้งาน

```tsx
// Subject notifies observers
subjectRef.current!.notify('clone', {
  kind: 'project',
  action: 'clone',
  payload: clonedItem
});

// LoggerObserver automatically logs the event
// Result: SessionLogger entry created
```

---

## 🏗️ Participants

### 1. Observer Interface — `IObserver<T>`

**Description**

`IObserver<T>` ประกาศ contract สำหรับ observers

**Methods**

```tsx
interface IObserver<T> {
  update(event: string, data: T): void;
}
```

**Responsibilities**

- `event`: ชื่อของ event
- `data`: event data

---

### 2. Subject Interface — `ISubject<T>`

**Description**

`ISubject<T>` ประกาศ subject contract

**Methods**

```tsx
interface ISubject<T> {
  subscribe(o: IObserver<T>): void;
  unsubscribe(o: IObserver<T>): void;
  notify(event: string, data: T): void;
}
```

**Responsibilities**

- `subscribe()`: observers register themselves
- `unsubscribe()`: observers unregister
- `notify()`: inform all observers about changes

---

### 3. Concrete Subject — `PortfolioSubject`

**Description**

`PortfolioSubject` implement `ISubject<PortfolioEvent>`  
maintain list ของ observers และ notify พวกเขา

**Implementation**

```tsx
class PortfolioSubject implements ISubject<PortfolioEvent> {
  private observers = new Set<IObserver<PortfolioEvent>>();

  subscribe(o: IObserver<PortfolioEvent>): void {
    this.observers.add(o);
  }

  unsubscribe(o: IObserver<PortfolioEvent>): void {
    this.observers.delete(o);
  }

  notify(event: string, data: PortfolioEvent): void {
    this.observers.forEach(o => {
      o.update(event, data);
    });
  }
}
```

**Event Type**

```tsx
type PortfolioEvent = {
  kind: 'project' | 'blog' | 'research' | 'decorations' | 'snapshot' | 'iterator' | 'command';
  action: 'add' | 'remove' | 'import' | 'clone' | 'undo' | 'redo' | 'save' | 'restore' | 'reset';
  payload?: unknown;
};
```

---

### 4. Concrete Observer — `LoggerObserver`

**Description**

`LoggerObserver` implement `IObserver<PortfolioEvent>`  
log portfolio events ไปยัง SessionLogger

**Implementation**

```tsx
class LoggerObserver implements IObserver<PortfolioEvent> {
  update(event: string, data: PortfolioEvent): void {
    const msg = `Observer: ${data.kind}:${data.action} via ${event}`;
    SessionLogger.getInstance().addLog(msg);
  }
}
```

**Example Logs**

```
Observer: project:clone via clone
Observer: blog:import via import
Observer: research:add via add
Observer: decorations:add via decorator
```

---

## 📋 Implementation Example

### Observer Registration

```tsx
useEffect(() => {
  const loggerObserver = new LoggerObserver();
  subjectRef.current!.subscribe(loggerObserver);
  
  return () => subjectRef.current!.unsubscribe(loggerObserver);
}, []);
```

### Subject Notification

```tsx
// Clone event
subjectRef.current!.notify('clone', {
  kind: 'project',
  action: 'clone',
  payload: clonedItem
});

// Import event
subjectRef.current!.notify('import', {
  kind: 'blog',
  action: 'import',
  payload: contentItem
});

// Add decorator event
subjectRef.current!.notify('decorator', {
  kind: 'project',
  action: 'add',
  payload: { itemId, decorationType }
});
```

---

## 🔄 Observer Notification Flow

```
Action Performed (Clone/Import/Add)
        ↓
portfolioStateContextRef.current!.transitionTo(State)
        ↓
Perform operation
(clone item, add to collection)
        ↓
subjectRef.current!.notify(event, data)
        ↓
┌─────────────────────────────┐
│ Subject loops through       │
│ all registered observers    │
└─────────────────────────────┘
        ↓
┌─────────────────────────────┐
│ Each Observer.update() called
│ LoggerObserver:
│   → SessionLogger.addLog()
└─────────────────────────────┘
        ↓
Return to Idle state
```

---

## 💡 Benefits

1. **Loose Coupling**: Subject ไม่ต้องรู้ observers
2. **Dynamic Relationships**: Add/remove observers at runtime
3. **Automatic Updates**: Observers notified automatically
4. **Separation of Concerns**: Each observer handles specific concern
5. **Extensibility**: เพิ่ม new observers ได้ง่าย

---

## 🔗 Related Patterns

- **Singleton**: SessionLogger ใช้ by LoggerObserver
- **Mediator**: Could coordinate multiple subjects/observers
- **State**: State changes trigger observer notifications
- **Command**: Command completion notifies observers
