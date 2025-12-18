# Chain of Responsibility - Mermaid Diagrams

## Class Diagram
```mermaid
classDiagram
    direction LR
    class IImportHandler {
      <<interface>>
      +setNext(h: IImportHandler) IImportHandler
      +handle(data) Record
    }
    class ImportHandler {
      - nextHandler: IImportHandler
      +setNext(h: IImportHandler) IImportHandler
      +handle(data) Record
      #process(data) Record
    }
    class TitleRequiredHandler {
      +process(data) Record
    }
    class DateStringHandler {
      +process(data) Record
    }
    class TagLimitHandler {
      - limit: number
      +process(data) Record
    }
    class SafeJSONAdapterProxy {
      - adapt(): ContentItem
    }
    IImportHandler <|.. ImportHandler
    ImportHandler <|-- TitleRequiredHandler
    ImportHandler <|-- DateStringHandler
    ImportHandler <|-- TagLimitHandler
    SafeJSONAdapterProxy ..> IImportHandler : uses chain
```

## Sequence: Import Pipeline
```mermaid
sequenceDiagram
    participant UI as UI
    participant Proxy as SafeJSONAdapterProxy
    participant H1 as TitleRequiredHandler
    participant H2 as DateStringHandler
    participant H3 as TagLimitHandler
    participant Adapter as JSONContentAdapter

    UI->>Proxy: adapt(raw JSON)
    Proxy->>Proxy: normalize()
    Proxy->>H1: handle(normalized)
    H1-->>H2: data (title ensured)
    H2-->>H3: data (date normalized)
    H3-->>Proxy: data (tags sanitized)
    Proxy->>Adapter: adapt(processed)
    Adapter-->>Proxy: ContentItem
    Proxy-->>UI: ContentItem (cached)
```

## Notes
- Chain of Responsibility แยก concerns เป็น handler เล็กๆ ต่อกันเป็นสาย
- Proxy เรียก chain เพื่อ validate/sanitize ก่อนส่งต่อให้ Adapter
- เพิ่ม/ลบ/เรียงลำดับ handler ได้โดยไม่กระทบ client code
