# Singleton Pattern — Session Logger

## Intent
Ensure a class has only one instance and provide a global access point to it.

## Application Context
In this system, the Singleton Pattern is used to manage **session-level logging** and
UI synchronization across the application.

## Participants

### Singleton — `SessionLogger`
- Holds a single instance for the entire application lifecycle
- Stores logs of user actions (theme change, cloning, persona switch)
- Notifies subscribed UI components when state changes

## Responsibilities
- Control instantiation via a private constructor
- Provide global access through `getInstance()`
- Act as an application-level service, not a domain model

## Collaboration
- `ContentItem.clone()` logs cloning actions
- `PersonalWebsiteUltimate` subscribes to updates to re-render UI

## Why Singleton Fits Here
- Logging must be consistent across the app
- Multiple instances would fragment session history
- Centralized access simplifies cross-pattern communication

## Design Notes
- This Singleton is **stateful**
- Used intentionally as infrastructure, not business logic

## Result
- One shared log source
- Predictable and synchronized UI updates
