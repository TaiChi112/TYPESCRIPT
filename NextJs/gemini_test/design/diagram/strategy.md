# Strategy Pattern (Behavioral)

```mermaid
classDiagram
    direction LR
    class IPortfolioSortStrategy {
      <<interface>>
      +getName(): string
      +sort(items: ContentItem[]): ContentItem[]
    }

    class AlphabeticalSortStrategy {
      +getName(): 'Alphabetical'
      +sort(items): sorted by title A-Z
    }

    class DateSortStrategy {
      +getName(): 'Date (Newest)'
      +sort(items): sorted by date descending
    }

    class TagCountSortStrategy {
      +getName(): 'Tag Count'
      +sort(items): sorted by tag count descending
    }

    class ReverseSortStrategy {
      +getName(): 'Reverse'
      +sort(items): reversed order
    }

    class RandomSortStrategy {
      +getName(): 'Random'
      +sort(items): shuffled randomly
    }

    class PortfolioSortContext {
      -strategy: IPortfolioSortStrategy
      +setStrategy(strategy)
      +getStrategy(): IPortfolioSortStrategy
      +sort(items): ContentItem[]
      +getAvailableStrategies(): IPortfolioSortStrategy[]
    }

    class PersonalWebsiteUltimate {
      -sortStrategyContextRef: PortfolioSortContext
      -sortedProjects: ContentItem[]
      -sortedBlogs: ContentItem[]
      -sortedResearch: ContentItem[]
      -currentSortStrategy: string
      +handleApplySortStrategy(strategy)
    }

    IPortfolioSortStrategy <|.. AlphabeticalSortStrategy
    IPortfolioSortStrategy <|.. DateSortStrategy
    IPortfolioSortStrategy <|.. TagCountSortStrategy
    IPortfolioSortStrategy <|.. ReverseSortStrategy
    IPortfolioSortStrategy <|.. RandomSortStrategy
    PortfolioSortContext --> IPortfolioSortStrategy : uses
    PersonalWebsiteUltimate --> PortfolioSortContext : holds
    PersonalWebsiteUltimate --> IPortfolioSortStrategy : delegates to
```

```mermaid
sequenceDiagram
    autonumber
    participant UI as User (Sort Button)
    participant APP as PersonalWebsiteUltimate
    participant CTX as PortfolioSortContext
    participant STRAT as Sort Strategy
    participant LOG as SessionLogger

    UI->>APP: Click Sort by Date
    APP->>STRAT: new DateSortStrategy()
    APP->>CTX: setStrategy(DateStrategy)
    CTX->>LOG: Log "Using Date sorting"
    APP->>STRAT: sort(projects)
    STRAT->>STRAT: Compare dates, sort descending
    STRAT-->>APP: sorted projects[]
    APP->>APP: setSortedProjects(sorted)
    APP->>LOG: Log "Applied Date sorting"
    APP->>APP: render with sorted items
```

## Pattern Overview

**Purpose**: Encapsulate sorting/filtering algorithms into separate strategies that can be switched at runtime without changing the client code.

**Key Components**:
- `IPortfolioSortStrategy`: Interface all sorting strategies must implement
- **Concrete Strategies**:
  - `AlphabeticalSortStrategy`: Sort by title A-Z
  - `DateSortStrategy`: Sort by date (newest first)
  - `TagCountSortStrategy`: Sort by number of tags (most first)
  - `ReverseSortStrategy`: Reverse current order
  - `RandomSortStrategy`: Shuffle items randomly
- `PortfolioSortContext`: Holds and manages the current strategy
- `PersonalWebsiteUltimate`: Uses context to apply strategies

## How It Works

1. **Strategy Selection**: User clicks a sort button
2. **Context Switch**: `handleApplySortStrategy()` creates a new strategy and passes it to the context
3. **Algorithm Execution**: Context calls `sort()` on the selected strategy
4. **Result Application**: Sorted items are stored in state (`sortedProjects`, `sortedBlogs`, `sortedResearch`)
5. **Rendering**: Component renders with the newly sorted items
6. **Logging**: Each strategy logs its action to SessionLogger

## Benefits

- **Open/Closed Principle**: Can add new sorting strategies without modifying existing code
- **Runtime Flexibility**: Switch sorting strategies dynamically based on user input
- **Encapsulation**: Sorting logic is isolated in strategy classes
- **Reusability**: Same strategies can be applied to different collections (projects, blogs, research)
- **Testing**: Each strategy can be tested independently
