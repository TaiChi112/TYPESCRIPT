# Builder Pattern — Page Composition

## Intent
Separate the construction of a complex object from its representation
so that the same construction process can create different representations.

## Application Context
The Builder Pattern is used to assemble the web page dynamically
based on user persona and selected theme.

## Participants

### Builder Interface — `IPageBuilder`
- Declares steps for building page sections

### Concrete Builder — `PortfolioPageBuilder`
- Implements construction logic
- Maintains internal state during build process

### Product — `Page`
- Final composed ReactNode tree

### Director — `PersonalWebsiteUltimate`
- Controls the order of building steps
- Selects which sections to include

## Responsibilities
- Encapsulate page assembly logic
- Allow different personas to produce different pages
- Separate "what to build" from "how to build"

## Collaboration
- Uses Abstract Factory for styling
- Uses Factory Method for layout selection
- Renders Prototype data
- Logs via Singleton indirectly

## Why Builder Fits Here
- Page structure is complex and variable
- Construction depends on runtime decisions
- Improves readability and maintainability

## Result
- Flexible page composition
- Clear construction flow
