# Template Method Pattern — Content Processing Pipeline

## 📖 Intent

**Define skeleton ของ algorithm** ใน base class  
ให้ subclasses **override specific steps**  
โดย **algorithm structure ยังคงอยู่**

## 🎨 Application Context

Template Method Pattern ถูกใช้เพื่อ **standardize content processing pipeline**  
ทุก content type (Project, Blog, Research) ผ่าน same processing steps:
1. **Validate** - check data integrity
2. **Normalize** - standardize data format
3. **Enrich** - add computed properties
4. **Save** - persist to collection

### ตัวอย่างการใช้งาน

```tsx
// Process content item (regardless of type)
const processor = new ProjectProcessor();
const processed = processor.process(rawItem);
// Calls: validate() → normalize() → enrich() → save()
```

---

## 🏗️ Participants

### 1. Template Method Base Class — `ContentProcessingTemplate`

**Description**

`ContentProcessingTemplate` define skeleton ของ processing pipeline

**Template Method**

```tsx
abstract class ContentProcessingTemplate {
  // Template Method — defines algorithm structure
  process(item: ContentItem): ContentItem {
    // Step 1: Validate
    const validated = this.validate(item);
    if (!validated) {
      throw new Error('Validation failed');
    }
    
    // Step 2: Normalize
    const normalized = this.normalize(item);
    
    // Step 3: Enrich
    const enriched = this.enrich(normalized);
    
    // Step 4: Save
    const saved = this.save(enriched);
    
    return saved;
  }

  // Abstract methods for subclasses to override
  protected abstract validate(item: ContentItem): boolean;
  protected abstract normalize(item: ContentItem): ContentItem;
  protected abstract enrich(item: ContentItem): ContentItem;
  protected abstract save(item: ContentItem): ContentItem;
}
```

**Algorithm Invariants**

1. **Step Order Fixed**: validate → normalize → enrich → save
2. **Cannot Skip Steps**: All steps execute ทั้งหมด
3. **Type-Specific Logic**: โดย subclass decide ว่าแต่ละ step ทำอะไร

---

### 2. Concrete Template Methods

#### ✅ ProjectProcessor

```tsx
class ProjectProcessor extends ContentProcessingTemplate {
  protected validate(item: ContentItem): boolean {
    // Validate project-specific rules
    return item.title.length > 0 && 
           item.description.length > 0 &&
           item.tags.length > 0;
  }

  protected normalize(item: ContentItem): ContentItem {
    // Remove extra whitespace, normalize dates
    return {
      ...item,
      title: item.title.trim(),
      description: item.description.trim(),
    };
  }

  protected enrich(item: ContentItem): ContentItem {
    // Add project-specific properties
    return {
      ...item,
      kind: 'project' as const,
      importance: item.tags.length > 3 ? 'high' : 'normal',
    };
  }

  protected save(item: ContentItem): ContentItem {
    // Log project save
    SessionLogger.getInstance().addLog(
      `✅ Project processed: "${item.title}"`
    );
    return item;
  }
}
```

#### 📝 BlogProcessor

```tsx
class BlogProcessor extends ContentProcessingTemplate {
  protected validate(item: ContentItem): boolean {
    // Blog-specific validation
    return item.title.length > 0 &&
           item.description.length > 50; // Longer minimum
  }

  protected normalize(item: ContentItem): ContentItem {
    return {
      ...item,
      title: item.title.trim(),
      description: item.description.trim(),
    };
  }

  protected enrich(item: ContentItem): ContentItem {
    return {
      ...item,
      kind: 'blog' as const,
      readTime: Math.ceil(item.description.split(' ').length / 200),
    };
  }

  protected save(item: ContentItem): ContentItem {
    SessionLogger.getInstance().addLog(
      `✅ Blog processed: "${item.title}" (${item.readTime}min read)`
    );
    return item;
  }
}
```

#### 🔬 ResearchProcessor

```tsx
class ResearchProcessor extends ContentProcessingTemplate {
  protected validate(item: ContentItem): boolean {
    // Research-specific validation
    return item.title.length > 0 &&
           item.tags.includes('academic');
  }

  protected normalize(item: ContentItem): ContentItem {
    return {
      ...item,
      title: item.title.trim(),
      description: item.description.trim(),
    };
  }

  protected enrich(item: ContentItem): ContentItem {
    return {
      ...item,
      kind: 'research' as const,
      academicScore: item.tags.length * 10,
    };
  }

  protected save(item: ContentItem): ContentItem {
    SessionLogger.getInstance().addLog(
      `✅ Research processed: "${item.title}" (score: ${item.academicScore})`
    );
    return item;
  }
}
```

---

## 🏗️ Class Hierarchy

```
ContentProcessingTemplate (Abstract Base)
├── ProjectProcessor
├── BlogProcessor
└── ResearchProcessor
```

**Each Concrete Class**
- Inherits `process()` template method (fixed structure)
- Overrides 4 abstract methods (validate, normalize, enrich, save)
- Type-specific logic encapsulated

---

## 📋 Implementation Example

### Processing Content Items

```tsx
const handleImportData = async () => {
  // ... validation code ...

  const processedProjects = importedProjects.map(p => {
    const processor = new ProjectProcessor();
    return processor.process(p);
  });

  const processedBlogs = importedBlogs.map(b => {
    const processor = new BlogProcessor();
    return processor.process(b);
  });

  const processedResearch = importedResearch.map(r => {
    const processor = new ResearchProcessor();
    return processor.process(r);
  });

  // Add processed items to portfolio
  setProjects(prev => [...prev, ...processedProjects]);
  setBlogs(prev => [...prev, ...processedBlogs]);
  setResearch(prev => [...prev, ...processedResearch]);
};
```

---

## 🔄 Template Method Execution

```
Client: processor.process(item)
        ↓
Template Method starts
        ↓
Step 1: validate(item)
        └─ ProjectProcessor.validate()
        └─ Check project-specific rules
        ↓
Step 2: normalize(item)
        └─ ProjectProcessor.normalize()
        └─ Clean whitespace
        ↓
Step 3: enrich(item)
        └─ ProjectProcessor.enrich()
        └─ Add project properties
        ↓
Step 4: save(item)
        └─ ProjectProcessor.save()
        └─ Log success via SessionLogger
        ↓
Return processed item
```

---

## 💡 Benefits

1. **Code Reuse**: Common algorithm structure ใน base class
2. **Consistency**: All content types ผ่าน same steps
3. **Easy Extension**: เพิ่ม new processor โดยไม่แก้ base
4. **Inversion of Control**: Subclass fill in details
5. **Maintainability**: Change algorithm logic once, affects all

---

## 📊 Processing Pipeline Summary

| Step | Purpose | Example |
|------|---------|---------|
| **Validate** | Check data integrity | Title not empty, tags present |
| **Normalize** | Standardize format | Trim whitespace, format dates |
| **Enrich** | Add computed properties | Calculate importance, read time |
| **Save** | Persist & log | Add to collection, log success |

---

## ⚙️ Invariants

✅ **Must maintain** (Template Method enforces):
- Step order always: validate → normalize → enrich → save
- All steps execute for every item
- Validation before enrichment (prevent invalid enrichment)

⚠️ **Subclass decides** (Override methods):
- Validation criteria
- Normalization rules
- Enrichment properties
- Logging details

---

## 🔗 Related Patterns

- **Singleton**: SessionLogger used in save() method
- **Strategy**: Could use strategy for validation/normalization rules
- **Factory**: Factory could create appropriate processor
- **Observer**: Subject notified after save
