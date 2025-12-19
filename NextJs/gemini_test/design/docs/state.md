# State Pattern — Portfolio State Machine

## 📖 Intent

อนุญาต **object ให้เปลี่ยนแปลง behavior** เมื่อ **internal state เปลี่ยน**  
วัตถุจะดูเหมือนว่า **เปลี่ยน class เมื่อ state เปลี่ยน**

## 🎨 Application Context

State Pattern ถูกใช้เพื่อ **จัดการ Portfolio operation states**  
ป้องกัน operations ที่ขัดแย้งกัน เช่น:
- 🚫 ห้ามทำ clone ขณะที่กำลัง import
- 🚫 ห้ามทำ restore ขณะที่กำลัง cloning
- ✅ อนุญาต operations เมื่อ state เป็น Idle

### ตัวอย่างการใช้งาน

```tsx
// Check state ก่อนทำ operation
if (!portfolioStateContextRef.current!.canClone()) {
  SessionLogger.getInstance().addLog(
    `❌ Clone blocked: Portfolio in ${portfolioStateContextRef.current!.getState().getName()} state`
  );
  return;
}

// Transition to Cloning state
portfolioStateContextRef.current!.transitionToCloning();

// Perform cloning...

// Return to Idle state
portfolioStateContextRef.current!.transitionToIdle();
```

---

## 🏗️ Participants

### 1. State Interface — `IPortfolioState`

**Description**

`IPortfolioState` ประกาศ contract สำหรับทุก concrete states

**Methods**

```tsx
interface IPortfolioState {
  getName(): string;
  onEnter(ctx: PortfolioStateContext): void;
  onExit(ctx: PortfolioStateContext): void;
  canImport(): boolean;
  canAdd(): boolean;
  canRestore(): boolean;
  canClone(): boolean;
}
```

**Responsibilities**

- ประกาศ state behavior
- Guard methods ที่ check อนุญาต operations
- Hook methods สำหรับ enter/exit events

---

### 2. Abstract Base State — `PortfolioStateBase`

**Description**

`PortfolioStateBase` implement `IPortfolioState`  
ให้ default implementation สำหรับ hook methods

**Key Methods**

| Method | Description |
|--------|-------------|
| `onEnter()` | Log state entry via Singleton |
| `onExit()` | Log state exit via Singleton |
| `canImport/Add/Restore/Clone()` | Return false by default |

---

### 3. Concrete States

#### ⚡ IdleState
- **canImport()**: `true` — สามารถ import ได้
- **canAdd()**: `true` — สามารถเพิ่ม content ได้
- **canRestore()**: `true` — สามารถ restore snapshot ได้
- **canClone()**: `true` — สามารถ clone item ได้

#### 📥 ImportingState
- **Goal**: ป้องกัน operations อื่น ขณะ import
- **canImport()**: `false` — ห้ามทำ import ซ้ำ
- **canClone()**: `false` — ห้อง clone
- **Transition**: `Importing → Idle` (หลัง import สำเร็จ)

#### ➕ AddingState
- **Goal**: ป้องกัน operations อื่น ขณะเพิ่ม item
- **canAdd()**: `false` — ห้ามทำ add ซ้ำ
- **Transition**: `Adding → Idle`

#### ↩️ RestoringState
- **Goal**: ป้องกัน operations ขณะ restore
- **canRestore()**: `false` — ห้ามทำ restore ซ้ำ
- **Transition**: `Restoring → Idle`

#### 📋 CloningState
- **Goal**: ป้องกัน operations ขณะ clone
- **canClone()**: `false` — ห้ามทำ clone ซ้ำ
- **Transition**: `Cloning → Idle`

---

### 4. State Context — `PortfolioStateContext`

**Description**

`PortfolioStateContext` ที่จัดการ state transitions  
และ delegate behavior ไปยัง current state

**Constructor**

```tsx
class PortfolioStateContext {
  private currentState: IPortfolioState;

  constructor() {
    this.currentState = new IdleState();
    this.currentState.onEnter(this);
  }
```

**Transition Methods**

| Method | Next State |
|--------|-----------|
| `transitionToImporting()` | ImportingState |
| `transitionToAdding()` | AddingState |
| `transitionToRestoring()` | RestoringState |
| `transitionToCloning()` | CloningState |
| `transitionToIdle()` | IdleState |

**Guard Methods**

```tsx
canImport(): boolean { return this.currentState.canImport(); }
canAdd(): boolean { return this.currentState.canAdd(); }
canRestore(): boolean { return this.currentState.canRestore(); }
canClone(): boolean { return this.currentState.canClone(); }
```

---

## 🔄 State Transition Flow

```
START
  ↓
[Idle] ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←┐
  ├→ Import? → [Importing] ────────→ success → [Idle]
  ├→ Add? ────→ [Adding] ──────────→ success → [Idle]
  ├→ Clone? → [Cloning] ──────────→ success → [Idle]
  ├→ Restore? → [Restoring] ────→ success → [Idle]
  └→ END
```

---

## 📋 Implementation Example

### Preventing Concurrent Operations

```tsx
// Guard: Check if cloning is allowed
if (!portfolioStateContextRef.current!.canClone()) {
  SessionLogger.getInstance().addLog(
    `❌ Clone blocked: Portfolio in ${portfolioStateContextRef.current!.getState().getName()} state`
  );
  return;
}

// Enter Cloning state
portfolioStateContextRef.current!.transitionToCloning();

try {
  // Perform cloning
  const clonedItem = item.clone();
  
  // Add to collection
  setProjects([clonedItem, ...projects]);
  subjectRef.current!.notify('clone', { 
    kind: 'project', 
    action: 'clone', 
    payload: clonedItem 
  });
} finally {
  // Always return to Idle
  portfolioStateContextRef.current!.transitionToIdle();
}
```

---

## 💡 Benefits

1. **Encapsulation**: State logic encapsulated ใน state classes
2. **Single Responsibility**: แต่ละ state มี responsibility เดียว
3. **Prevention of Invalid Operations**: Guard methods ป้องกัน invalid state transitions
4. **Extensibility**: เพิ่ม state ใหม่ได้โดยไม่แก้ context
5. **Centralized State Logic**: ทุก state checks อยู่ที่ context

---

## 🔗 Related Patterns

- **Singleton**: SessionLogger ใช้เพื่อ log state transitions
- **Observer**: Subject notified เมื่อ operation complete
- **Strategy**: เลือก algorithm ตาม state (alternative approach)
