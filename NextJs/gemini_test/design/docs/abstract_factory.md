# Abstract Factory Pattern — UI Theme System

## Intent
Provide an interface for creating families of related or dependent objects
without specifying their concrete classes.

## Application Context
The Abstract Factory Pattern is used to manage **UI themes**:
Minimal, Creative, and Academic.

Each theme provides a consistent family of UI components.

## Participants

### Abstract Factory — `UIThemeFactory`
Defines factory methods for:
- ActionButton
- Tag
- CardWrapper
- SectionWrapper
- HeroWrapper

### Concrete Factories
- `MinimalThemeFactory`
- `CreativeThemeFactory`
- `AcademicThemeFactory`

Each concrete factory produces a full set of compatible UI components.

## Responsibilities
- Ensure visual consistency within a theme
- Prevent mixing components from different themes
- Abstract UI creation from page construction

## Collaboration
- `PortfolioPageBuilder` uses `UIThemeFactory`
- Builder never references concrete UI components directly

## Why Abstract Factory Fits Here
- Themes are **product families**
- Switching theme changes the entire UI set
- Encourages consistent design systems

## Result
- Safe theme switching
- Clean separation of style and structure
