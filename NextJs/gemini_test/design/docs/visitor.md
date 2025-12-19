# Visitor Pattern — Portfolio Analysis & Export

## 📖 Intent

**Represent operation ให้ perform** ไปยัง elements ของ object structure  
ให้ visitor define new operations **ไม่ต้องเปลี่ยน classes** ของ elements

## 🎨 Application Context

Visitor Pattern ถูกใช้เพื่อ **perform various analyses and exports** ไปยัง portfolio:
- 📊 Generate statistics (count, tags analysis)
- 📝 Export to Markdown
- 🗂️ Export to JSON
- ✔️ Validate content integrity

### ตัวอย่างการใช้งาน

```tsx
// Same portfolio structure, different visitors
const statisticsVisitor = new StatisticsVisitor();
const stats = statisticsVisitor.visit(portfolioRef.current);

const markdownVisitor = new MarkdownExportVisitor();
const markdown = markdownVisitor.visit(portfolioRef.current);

// Portfolio structure unchanged — only visitor changes
```

---

## 🏗️ Participants

### 1. Visitor Interface — `IPortfolioVisitor`

**Description**

`IPortfolioVisitor` ประกาศ operations ที่ execute ไปยัง structure

**Methods**

```tsx
interface IPortfolioVisitor {
  visitPortfolio(portfolio: Portfolio): unknown;
  visitGroup(group: ContentGroup): unknown;
  visitItem(item: ContentItemLeaf): unknown;
}
```

**Responsibility**

- Define visit method for each element type
- Return type flexible (`unknown`) for different operation results

---

### 2. Element Interface — `IContentComponent`

**Description**

`IContentComponent` tree elements ที่ accept visitors  
(Composite pattern + Visitor pattern)

**Accept Method**

```tsx
interface IContentComponent {
  accept(visitor: IPortfolioVisitor): unknown;
  // ... other methods
}
```

**Double Dispatch**

```tsx
class Portfolio implements IContentComponent {
  accept(visitor: IPortfolioVisitor): unknown {
    return visitor.visitPortfolio(this);
  }
}

class ContentGroup implements IContentComponent {
  accept(visitor: IPortfolioVisitor): unknown {
    return visitor.visitGroup(this);
  }
}

class ContentItemLeaf implements IContentComponent {
  accept(visitor: IPortfolioVisitor): unknown {
    return visitor.visitItem(this);
  }
}
```

---

### 3. Concrete Visitors

#### 📊 StatisticsVisitor
```tsx
class StatisticsVisitor implements IPortfolioVisitor {
  private stats = {
    projectCount: 0,
    blogCount: 0,
    researchCount: 0,
    totalTags: new Set<string>(),
  };

  visitPortfolio(portfolio: Portfolio): PortfolioStats {
    // Visit root and all children
    portfolio.getChildren().forEach(child => child.accept(this));
    return {
      ...this.stats,
      uniqueTags: this.stats.totalTags.size,
    };
  }

  visitGroup(group: ContentGroup): void {
    // Visit all items in group
    group.getChildren().forEach(child => child.accept(this));
  }

  visitItem(item: ContentItemLeaf): void {
    // Count item type
    const contentItem = item.asItem();
    if (contentItem.kind === 'project') this.stats.projectCount++;
    else if (contentItem.kind === 'blog') this.stats.blogCount++;
    else if (contentItem.kind === 'research') this.stats.researchCount++;

    // Collect tags
    contentItem.tags.forEach(tag => this.stats.totalTags.add(tag));
  }
}
```

#### 📝 MarkdownExportVisitor
```tsx
class MarkdownExportVisitor implements IPortfolioVisitor {
  private markdown = '';

  visitPortfolio(portfolio: Portfolio): string {
    this.markdown = `# ${portfolio.getName()}\n\n`;
    portfolio.getChildren().forEach(child => child.accept(this));
    return this.markdown;
  }

  visitGroup(group: ContentGroup): void {
    this.markdown += `## ${group.getName()}\n\n`;
    group.getChildren().forEach(child => child.accept(this));
  }

  visitItem(item: ContentItemLeaf): void {
    const content = item.asItem();
    this.markdown += `### ${content.title}\n`;
    this.markdown += `${content.description}\n`;
    this.markdown += `**Tags:** ${content.tags.join(', ')}\n\n`;
  }
}
```

#### 🗂️ JSONExportVisitor
```tsx
class JSONExportVisitor implements IPortfolioVisitor {
  visitPortfolio(portfolio: Portfolio): PortfolioJSON {
    const groups = portfolio.getChildren().map(child => {
      const result = child.accept(this);
      return result;
    });
    return {
      name: portfolio.getName(),
      groups: groups as ContentGroupJSON[],
    };
  }

  visitGroup(group: ContentGroup): ContentGroupJSON {
    const items = group.getChildren().map(child => {
      const result = child.accept(this);
      return result;
    });
    return {
      name: group.getName(),
      items: items as ContentItemJSON[],
    };
  }

  visitItem(item: ContentItemLeaf): ContentItemJSON {
    const content = item.asItem();
    return {
      id: content.id,
      title: content.title,
      description: content.description,
      date: content.date,
      tags: content.tags,
    };
  }
}
```

#### ✔️ ValidationVisitor
```tsx
class ValidationVisitor implements IPortfolioVisitor {
  private errors: string[] = [];

  visitPortfolio(portfolio: Portfolio): ValidationResult {
    this.errors = [];
    portfolio.getChildren().forEach(child => child.accept(this));
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
    };
  }

  visitGroup(group: ContentGroup): void {
    if (!group.getName() || group.getName().length === 0) {
      this.errors.push(`Group has no name`);
    }
    group.getChildren().forEach(child => child.accept(this));
  }

  visitItem(item: ContentItemLeaf): void {
    const content = item.asItem();
    if (!content.title) this.errors.push(`Item missing title`);
    if (!content.description) this.errors.push(`Item missing description`);
    if (content.tags.length === 0) this.errors.push(`Item missing tags`);
  }
}
```

---

## 📋 Implementation Example

### Using Visitors with Dispatcher

```tsx
class PortfolioVisitorDispatcher {
  static analyzeStatistics(portfolio: Portfolio): PortfolioStats {
    const visitor = new StatisticsVisitor();
    return visitor.visitPortfolio(portfolio) as PortfolioStats;
  }

  static exportToMarkdown(portfolio: Portfolio): string {
    const visitor = new MarkdownExportVisitor();
    return visitor.visitPortfolio(portfolio) as string;
  }

  static exportToJSON(portfolio: Portfolio): PortfolioJSON {
    const visitor = new JSONExportVisitor();
    return visitor.visitPortfolio(portfolio) as PortfolioJSON;
  }

  static validate(portfolio: Portfolio): ValidationResult {
    const visitor = new ValidationVisitor();
    return visitor.visitPortfolio(portfolio) as ValidationResult;
  }
}
```

### Using Dispatcher in Component

```tsx
// Statistics
const handleGetStatistics = () => {
  const stats = PortfolioVisitorDispatcher.analyzeStatistics(
    portfolioRef.current!
  );
  SessionLogger.getInstance().addLog(
    `📊 Portfolio has ${stats.projectCount} projects, ` +
    `${stats.blogCount} blogs, ${stats.uniqueTags} unique tags`
  );
};

// Export Markdown
const handleExportMarkdown = () => {
  const markdown = PortfolioVisitorDispatcher.exportToMarkdown(
    portfolioRef.current!
  );
  const blob = new Blob([markdown], { type: 'text/markdown' });
  // Download blob...
};

// Export JSON
const handleExportJSON = () => {
  const json = PortfolioVisitorDispatcher.exportToJSON(
    portfolioRef.current!
  );
  const blob = new Blob([JSON.stringify(json, null, 2)], {
    type: 'application/json'
  });
  // Download blob...
};

// Validate
const handleValidate = () => {
  const result = PortfolioVisitorDispatcher.validate(
    portfolioRef.current!
  );
  if (result.isValid) {
    SessionLogger.getInstance().addLog('✅ Portfolio valid');
  } else {
    result.errors.forEach(error => {
      SessionLogger.getInstance().addLog(`❌ ${error}`);
    });
  }
};
```

---

## 🔄 Visitor Execution Flow

```
Client: portfolio.accept(visitor)
        ↓
Portfolio.accept(statisticsVisitor)
        ↓
statisticsVisitor.visitPortfolio(portfolio)
        ↓
For each child: child.accept(visitor)
        ├─ ProjectsGroup.accept(visitor)
        │  └─ visitor.visitGroup(projectsGroup)
        │     └─ For each item: item.accept(visitor)
        │        ├─ Project1.accept(visitor)
        │        │  └─ visitor.visitItem(project1) ✓ Count
        │        └─ Project2.accept(visitor)
        │           └─ visitor.visitItem(project2) ✓ Count
        │
        ├─ BlogsGroup.accept(visitor)
        │  └─ visitor.visitGroup(blogsGroup)
        │     └─ For each item: item.accept(visitor)
        │        └─ visitor.visitItem(blog) ✓ Count
        │
        └─ ResearchGroup.accept(visitor)
           └─ visitor.visitGroup(researchGroup)
              └─ For each item: item.accept(visitor)
                 └─ visitor.visitItem(research) ✓ Count
        ↓
Return aggregated statistics
```

---

## 💡 Benefits

1. **Separation**: Operation logic separated from element classes
2. **Easy Addition**: Add new visitor without changing elements
3. **Encapsulation**: Elements don't need to know about operations
4. **Consistency**: Same visitor traverses entire tree uniformly
5. **Composition**: Multiple visitors can traverse same structure

---

## 📊 Visitor Characteristics

| Visitor | Input | Output | Purpose |
|---------|-------|--------|---------|
| **Statistics** | Portfolio | Stats object | Analyze content |
| **Markdown** | Portfolio | Markdown string | Export readable |
| **JSON** | Portfolio | JSON object | Export structured |
| **Validation** | Portfolio | Errors array | Verify integrity |

---

## ⚠️ Double Dispatch

Visitor Pattern relies on **double dispatch**:

```
1st dispatch: portfolio.accept(visitor)
              ↓
              visitor.visitPortfolio(portfolio)

2nd dispatch: child.accept(visitor)
              ↓
              visitor.visitGroup(group)
              or
              visitor.visitItem(item)
```

This enables **runtime polymorphism** on both object AND visitor

---

## 🔗 Related Patterns

- **Composite**: Visitor traverses Composite structure
- **Iterator**: Could use Iterator for traversal (alternative)
- **Singleton**: SessionLogger used in visitors
- **Factory**: VisitorDispatcher factory creates visitors
