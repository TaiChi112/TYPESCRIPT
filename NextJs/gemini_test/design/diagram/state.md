# State Pattern (Behavioral)

```mermaid
classDiagram
    direction LR
    class IPortfolioState {
      <<interface>>
      +getName(): string
      +onEnter(ctx: PortfolioStateContext)
      +onExit(ctx: PortfolioStateContext)
      +canImport(): boolean
      +canAdd(): boolean
      +canRestore(): boolean
      +canClone(): boolean
    }

    class PortfolioStateBase {
      <<abstract>>
      +getName()*
      +onEnter(ctx)
      +onExit(ctx)
      +canImport(): boolean
      +canAdd(): boolean
      +canRestore(): boolean
      +canClone(): boolean
    }

    class IdleState {
      +getName(): 'Idle'
      +canImport(): true
      +canAdd(): true
      +canRestore(): true
      +canClone(): true
    }

    class ImportingState {
      +getName(): 'Importing'
      +onEnter(ctx)
      +canImport(): false
      +canAdd(): false
      +canRestore(): false
      +canClone(): false
    }

    class AddingState {
      +getName(): 'Adding'
      +onEnter(ctx)
      +canImport(): false
      +canAdd(): false
      +canRestore(): false
      +canClone(): false
    }

    class RestoringState {
      +getName(): 'Restoring'
      +onEnter(ctx)
      +canImport(): false
      +canAdd(): false
      +canRestore(): false
      +canClone(): false
    }

    class CloningState {
      +getName(): 'Cloning'
      +onEnter(ctx)
      +canImport(): false
      +canAdd(): false
      +canRestore(): false
      +canClone(): false
    }

    class PortfolioStateContext {
      -currentState: IPortfolioState
      +setState(newState: IPortfolioState)
      +getState(): IPortfolioState
      +canImport(): boolean
      +canAdd(): boolean
      +canRestore(): boolean
      +canClone(): boolean
      +transitionToImporting()
      +transitionToAdding()
      +transitionToRestoring()
      +transitionToCloning()
      +transitionToIdle()
    }

    class PersonalWebsiteUltimate {
      -portfolioStateContextRef: PortfolioStateContext
      +handleCloneItem()
      +handleImportData()
      +handleRestoreMemento()
    }

    IPortfolioState <|.. PortfolioStateBase
    PortfolioStateBase <|-- IdleState
    PortfolioStateBase <|-- ImportingState
    PortfolioStateBase <|-- AddingState
    PortfolioStateBase <|-- RestoringState
    PortfolioStateBase <|-- CloningState
    PortfolioStateContext --> IPortfolioState : uses
    PersonalWebsiteUltimate --> PortfolioStateContext : holds
```

```mermaid
sequenceDiagram
    autonumber
    participant UI as User (Clone Button)
    participant CTX as PortfolioStateContext
    participant STATE as State Objects
    participant APP as PersonalWebsiteUltimate
    participant LOG as SessionLogger

    UI->>APP: Click Clone Item
    APP->>CTX: canClone()?
    CTX->>STATE: Check current state
    alt Can Clone (Idle)
      STATE-->>CTX: true
      CTX-->>APP: true
      APP->>CTX: transitionToCloning()
      CTX->>STATE: onExit() prev state
      STATE->>LOG: Log "Exited Idle"
      CTX->>CTX: currentState = CloningState
      STATE->>LOG: Log "Entered Cloning"
      APP->>APP: item.clone()
      APP->>APP: setProjects(cloned)
      APP->>CTX: transitionToIdle()
      CTX->>STATE: onExit() Cloning
      CTX->>CTX: currentState = IdleState
      STATE->>LOG: Log "Idle"
    else Cannot Clone (Importing/etc)
      STATE-->>CTX: false
      CTX-->>APP: false
      LOG->>LOG: Log "Clone blocked"
    end
```

## Pattern Overview

- **Purpose**: Manage state-dependent behavior; prevent invalid operations based on current state
- **Key Components**:
  - `IPortfolioState`: Defines interface all states must follow
  - `PortfolioStateBase`: Abstract base with default behavior
  - `IdleState`, `ImportingState`, `AddingState`, `RestoringState`, `CloningState`: Concrete states
  - `PortfolioStateContext`: Holds current state, delegates transitions and queries
  - `PersonalWebsiteUltimate`: Uses context to check state before operations

## How It Works

1. **Initial State**: `PortfolioStateContext` starts in `IdleState`
2. **State Transitions**: When an operation begins (clone, import, restore), context transitions to the appropriate state (CloningState, ImportingState, RestoringState)
3. **State Queries**: Before allowing an operation, handlers call `canClone()`, `canImport()`, `canRestore()` etc.
4. **Encapsulation**: Each state defines what operations are allowed; logic is distributed across states rather than in conditional statements
5. **Cleanup**: When an operation completes, context transitions back to `IdleState`
