# Proxy Pattern - Mermaid Diagrams

## Class Diagram
```mermaid
classDiagram
    direction LR
    class IContentAdapter {
      <<interface>>
      +adapt() ContentItem
    }
    class JSONContentAdapter {
      - rawData: Record<string, unknown>
      - type: 'blog' | 'project' | 'research'
      +adapt() ContentItem
    }
    class SafeJSONAdapterProxy {
      - jsonData: Record<string, unknown>
      - type: 'blog' | 'project' | 'research'
      - normalize() Record<string, unknown>
      +adapt() ContentItem
    }
    IContentAdapter <|.. JSONContentAdapter
    IContentAdapter <|.. SafeJSONAdapterProxy
    SafeJSONAdapterProxy ..> JSONContentAdapter : delegates
```

## Sequence: Cache Miss → Cache Set
```mermaid
sequenceDiagram
    participant UI as UI
    participant Proxy as SafeJSONAdapterProxy
    participant Adapter as JSONContentAdapter
    participant Logger as SessionLogger

    UI->>Proxy: adapt(json)
    Proxy->>Logger: log("normalize/validate")
    Proxy->>Adapter: adapt(normalized)
    Adapter-->>Proxy: ContentItem
    Proxy->>Logger: log("cache set")
    Proxy-->>UI: ContentItem
```

## Sequence: Cache Hit
```mermaid
sequenceDiagram
    participant UI as UI
    participant Proxy as SafeJSONAdapterProxy
    participant Logger as SessionLogger

    UI->>Proxy: adapt(json with same id)
    Proxy->>Logger: log("cache hit")
    Proxy-->>UI: ContentItem (from cache)
```

## Notes
- Proxy เพิ่ม cross-cutting concerns: validation/normalization + caching โดยไม่แก้ไข Adapter เดิม
- ใช้ร่วมกับ Facade: `PortfolioFacade.importFromJSON()` เรียกผ่าน Proxy โดยอัตโนมัติ
