# Prototype Pattern — Content Cloning

## Intent
Specify the kinds of objects to create using a prototypical instance,
and create new objects by copying this prototype.

## Application Context
The Prototype Pattern is used to duplicate `ContentItem` objects
(projects, research, blogs) without exposing construction logic to clients.

## Participants

### Prototype Interface — `Prototype<T>`
- Declares the `clone()` operation

### Concrete Prototype — `ContentItem`
- Implements deep cloning logic
- Generates new identifiers
- Logs cloning events via Singleton

## Responsibilities
- Encapsulate object duplication logic
- Ensure cloned data is independent from the original
- Handle side effects (logging) internally

## Collaboration
- `PersonalWebsiteUltimate` triggers cloning
- `SessionLogger` records clone events

## Why Prototype Fits Here
- Client does not need to know how items are constructed
- Supports runtime duplication of complex objects
- Keeps cloning logic close to the data

## Result
- Clean object duplication
- Reduced coupling between UI and data creation
