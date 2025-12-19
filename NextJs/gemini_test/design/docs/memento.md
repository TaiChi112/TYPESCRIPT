# Memento Pattern — Snapshot & Restore

## 📖 Intent

**Capture and externalize** internal state ของ object  
โดยไม่ violate encapsulation  
และให้ object **restore** ไปยัง previous state ได้ในภายหลัง

## 🎨 Application Context

Memento Pattern ถูกใช้เพื่อ **save/restore Portfolio snapshots**  
ให้ user สามารถ undo ไปยัง previous portfolio state

### ตัวอย่างการใช้งาน

```tsx
// Save snapshot
const snap: PortfolioSnapshot = {
  projects: toDTO(projects),
  blogs: toDTO(blogs),
  research: toDTO(research),
  decorations: decorationsToDTO(itemDecorators)
};
const memento = mementoOriginatorRef.current!.createMemento(snap, `Snapshot #1`);
mementoHistoryRef.current!.save(memento);

// Later: Restore from memento
const memento = mementoHistoryRef.current!.restoreLast();
const restored = mementoOriginatorRef.current!.restore(memento);
// setProjects(fromDTO(restored.projects)); ...
```

---

## 🏗️ Participants

### 1. Memento — `PortfolioMemento`

**Description**

`PortfolioMemento` stores snapshot ของ portfolio state  
โดยไม่เปิดเผยรายละเอียด

**Attributes**

```tsx
class PortfolioMemento {
  private readonly ts: number;           // Timestamp of snapshot
  private readonly name: string;         // Human-readable name
  private readonly snapshot: PortfolioSnapshot; // State data
}
```

**Data Structure**

```tsx
type PortfolioSnapshot = {
  projects: ContentItemDTO[];
  blogs: ContentItemDTO[];
  research: ContentItemDTO[];
  decorations: DecorationsDTO;
};

type ContentItemDTO = {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
};
```

**Methods**

| Method | Returns | Purpose |
|--------|---------|---------|
| `getName()` | `string` | Get snapshot name |
| `getTimestamp()` | `number` | Get snapshot time |
| `getSnapshot()` | `PortfolioSnapshot` | Get state data |

---

### 2. Originator — `PortfolioStateOriginator`

**Description**

`PortfolioStateOriginator` create mementos  
และ restore state จาก mementos

**Methods**

```tsx
class PortfolioStateOriginator {
  // Create memento from current state
  createMemento(
    snapshot: PortfolioSnapshot, 
    name?: string
  ): PortfolioMemento {
    return new PortfolioMemento(snapshot, name);
  }

  // Restore state from memento
  restore(memento: PortfolioMemento): PortfolioSnapshot {
    return memento.getSnapshot();
  }
}
```

**Responsibilities**

- Create memento representing current state
- Extract state from memento (no reconstruction logic)
- Never modify memento after creation

---

### 3. Caretaker — `HistoryCaretaker`

**Description**

`HistoryCaretaker` maintains history ของ mementos  
ไม่รู้ memento content

**Storage**

```tsx
class HistoryCaretaker {
  private history: PortfolioMemento[] = [];
  
  save(m: PortfolioMemento) {
    this.history.push(m);
  }
  
  restoreLast(): PortfolioMemento | null {
    return this.history.pop() || null;
  }
  
  canRestore(): boolean {
    return this.history.length > 0;
  }
  
  size(): number {
    return this.history.length;
  }
}
```

**Responsibilities**

- Store mementos securely
- Provide undo capability (pop from history)
- Track history size
- Never inspect memento contents

---

## 📋 Implementation Example

### Saving Snapshot

```tsx
onClick={() => {
  // State Pattern: Check if restore is allowed
  if (!portfolioStateContextRef.current!.canRestore()) {
    SessionLogger.getInstance().addLog(
      `❌ Restore blocked: Portfolio in ${portfolioStateContextRef.current!.getState().getName()} state`
    );
    return;
  }

  // Create snapshot DTO
  const snap: PortfolioSnapshot = {
    projects: toDTO(projects),
    blogs: toDTO(blogs),
    research: toDTO(research),
    decorations: decorationsToDTO(itemDecorators as Record<string, ContentDecorator[]>)
  };

  // Create memento
  const m = mementoOriginatorRef.current!.createMemento(
    snap, 
    `Snapshot #${mementoHistoryRef.current!.size() + 1}`
  );

  // Save to history
  mementoHistoryRef.current!.save(m);
  
  SessionLogger.getInstance().addLog(
    `Memento: Saved ${m.getName()} (history=${mementoHistoryRef.current!.size()})`
  );
}}
```

### Restoring Snapshot

```tsx
onClick={() => {
  // State Pattern: transition to restoring
  portfolioStateContextRef.current!.transitionToRestoring();

  try {
    // Get last memento
    const m = mementoHistoryRef.current!.restoreLast();
    if (!m) return;

    // Restore state from memento
    const restored = mementoOriginatorRef.current!.restore(m);

    // Convert DTOs back to objects
    const newProjects = fromDTO(restored.projects);
    const newBlogs = fromDTO(restored.blogs);
    const newResearch = fromDTO(restored.research);

    // Update state
    setProjects(newProjects);
    setBlogs(newBlogs);
    setResearch(newResearch);

    // Rebuild decorators
    const allItems = [...newProjects, ...newBlogs, ...newResearch];
    const newDecorators = rebuildDecorators(allItems, restored.decorations);
    setItemDecorators(newDecorators);

    SessionLogger.getInstance().addLog(
      `Memento: Restored ${m.getName()} (remaining=${mementoHistoryRef.current!.size()})`
    );
  } finally {
    portfolioStateContextRef.current!.transitionToIdle();
  }
}}
```

---

## 🔄 Memento Workflow

```
User Click "Save Snapshot"
        ↓
Portfolio State Serialization (to DTO)
        ↓
Create Memento (with timestamp, name)
        ↓
Store in HistoryCaretaker
        ↓
SessionLogger.addLog(success)
        ↓
═════════════════════════════════════════════════════════════
Later: User Click "Restore"
        ↓
Check State: canRestore()?
        ↓
Get Last Memento from History
        ↓
Originator.restore(memento)
        ↓
Deserialize DTOs to Objects
        ↓
Update Component State
        ↓
Rebuild Decorators
        ↓
Return to Idle State
```

---

## 💡 Benefits

1. **Encapsulation**: Caretaker ไม่รู้ state structure
2. **Undo Capability**: User สามารถ revert changes
3. **Clean API**: Originator/Caretaker ไม่ expose state
4. **Flexible**: เพิ่ม multiple undo levels ได้ง่าย
5. **Serialization**: Snapshot สามารถ persist ได้ (future feature)

---

## 💾 Serialization Strategy

### Object → DTO (Serialize)

```tsx
const toDTO = (items: ContentItem[]): ContentItemDTO[] =>
  items.map(i => ({
    id: i.id,
    title: i.title,
    description: i.description,
    date: i.date,
    tags: [...i.tags]
  }));
```

### DTO → Object (Deserialize)

```tsx
const fromDTO = (dtos: ContentItemDTO[]): ContentItem[] =>
  dtos.map(d =>
    new ContentItem(d.id, d.title, d.description, d.date, [...d.tags])
  );
```

### Decorator Serialization

```tsx
const decorationsToDTO = (
  decoratorsMap: Record<string, ContentDecorator[]>
): DecorationsDTO => {
  const result: DecorationsDTO = {};
  Object.entries(decoratorsMap).forEach(([itemId, decorators]) => {
    result[itemId] = decorators.map(d => d.decorationType);
  });
  return result;
};
```

---

## 🔗 Related Patterns

- **Singleton**: SessionLogger logs memento operations
- **State**: State Pattern guards memento operations
- **Originator**: Creates/restores mementos
- **Caretaker**: Maintains memento history
- **Command**: Can use mementos for undo/redo
