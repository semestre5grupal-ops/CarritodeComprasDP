# Technical Requirements

## System Overview
This system is a modular frontend web application implemented with vanilla web technologies. The architecture is intentionally designed for deterministic AI-assisted development, ensuring strict separation of concerns between structure (HTML), presentation (CSS), and behavior (JS).

The runtime is fully client-side and offline-capable. All required behavior must execute in a standard modern web browser with minimal setup friction. The system MUST remain fully functional without dynamic backend APIs.

The central technical challenge is managing complex application state (the shopping cart) and persisting it across reloads using local web storage, while maintaining a perfectly accessible (ARIA-compliant) and responsive user interface.

### Core Technical Principle
Presentation logic MUST live in CSS. Data structure MUST live in HTML. Business logic and state management MUST live exclusively in modular JavaScript files.

All JS implementation MUST favor ES6+ standards, utilizing modules, arrow functions, template literals, and asynchronous fetch operations.

### Runtime Principle
The application runs directly in a web browser. Primary execution path is opening `index.html` via the filesystem or a local development server (e.g., VS Code Live Server).

---

# System Architecture

## Layered Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│ Presentation Layer (/assets)                                │
│ CSS3 files, Flexbox/Grid layouts, images, icons             │
│ MUST NOT contain inline styles in HTML                      │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ Structure Layer (index.html)                                │
│ Semantic HTML5 tags, ARIA attributes, UI anchors            │
│ MUST remain unaware of JS business logic                    │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ Behavior & Logic Layer (/js)                                │
│ ES6+ Modules (app.js, view.js, cart.js, repo.js)            │
│ MUST be strictly modularized by responsibility              │
└──────────────────────────────────────────────────────────────┘
Layer responsibilities are strict and non-negotiable:

CSS Layer MUST handle all responsive breakpoints via @media queries.
HTML Layer MUST contain appropriate aria- attributes and semantic tags (header, main, footer).
JS Layer MUST NOT contain long strings of hardcoded HTML; use template literals dynamically.
JS Layer MUST handle data persistence and Regex validation.
Component Architecture
Directory Structure
Location: Root Directory

Key constraints:

index.html: Main semantic entry point.
/assets/: Must contain styles.css and multimedia.
/data/: Must contain productos.json or productos.xml.
/js/: Must contain all script files.
JavaScript Modular Logic Layer
Location: /js/

Key constraints:

app.js: Main orchestrator, initializes event listeners and data fetching.
repo.js: Responsible ONLY for fetching and parsing the local JSON/XML data.
cart.js: Responsible ONLY for shopping cart business logic (calculations, array manipulations).
view.js: Responsible ONLY for DOM manipulation and rendering HTML templates.
Infrastructure Architecture
The primary runtime target is any modern web browser running locally or hosted on Neocities.org.

Services:

Local File System or VS Code Live Server.
Client-side Web Storage APIs.
Constraint:

No backend server required. Must execute standalone.
Data and Persistence Requirements
Database: Client-side Web Storage (localStorage, sessionStorage, IndexedDB, Cookies).

Design Principles
Application state must survive page reloads.
Data fetching from /data/productos.json must be asynchronous.
Storage Strategy Implementation
localStorage: Use to save the cart array indefinitely.
sessionStorage: Use to store temporary user session flows or current UI state.
IndexedDB: Use to cache the product catalog locally.
Cookies: Use to save lightweight preferences (like theme) with a timestamp of the last update.
Constraints:

Data must be serialized to JSON strings before storing in localStorage/sessionStorage.
Performance Requirements
Semantic DOM structure must allow fast parsing.
Images inside /assets/ should be reasonably sized for fast loading.
Local JSON fetching must handle potential errors gracefully.
Version and Tooling Requirements
Required versions:

JavaScript: ES6+ (Modules, Arrow Functions, Promises).
CSS: CSS3 (Grid, Flexbox, Custom Properties).
HTML: HTML5 Semantic standard.
Quality gate checks (must be manually verified):

Fully responsive across 3 breakpoints without horizontal scroll.
Screen readers can navigate forms and cart successfully.
Regex validation passes all edge cases.