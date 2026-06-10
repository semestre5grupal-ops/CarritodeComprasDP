
---

### 3. Copia esto en `docs/golden-rules.md`

```markdown
# Golden Rules - Frontend Engineering Principles

These rules are NON-NEGOTIABLE.

They protect the integrity of the Shopping Cart application and enforce deterministic AI workflows, architectural correctness, and academic reproducibility.

If any rule is violated: STOP implementation and review the project requirements.

---

# 1) Semantic HTML and Accessibility Rule (POUR)

The application MUST be fully accessible and structurally sound.

Why this exists:
- Ensures screen readers can interpret the UI.
- Enables proper keyboard navigation.
- Meets standard web compliance (Perceptible, Operable, Understandable, Robust).

Mandatory:
- Use semantic tags: `<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, `<article>`.
- Interactive elements MUST have visible focus states.
- Use ARIA roles (`aria-invalid`, `aria-describedby`) for dynamic elements and errors.
- Ensure high color contrast.

Forbidden:
- Using `<div>` for everything (Divitis).
- Removing focus outlines (`outline: none`) without providing a visible alternative.

---

# 2) Responsive Design Rule (Mobile-First)

The UI MUST adapt fluidly to all screen sizes using CSS3.

Why this exists:
- Modern web usage demands multi-device support.
- Hardcoded pixel values cause layout breakage.

Mandatory:
- Design mobile-first, using `@media (min-width: ...)` for larger screens.
- Use CSS Flexbox and CSS Grid for layout structuring.
- Define at least 3 optimal breakpoints (Mobile, Tablet, Desktop).

Forbidden:
- Fixed widths that cause horizontal scrolling on mobile.
- Using JavaScript to calculate layout positions (use CSS).

---

# 3) JavaScript Modularity Rule (ES6+)

JavaScript code MUST be modularized into distinct files based on responsibility.

Why this exists:
- Prevents spaghetti code in a single file.
- Follows MVC-inspired separation of concerns.

Mandatory:
- Split logic into files like `app.js` (init), `view.js` (DOM), `repo.js` (Data), `cart.js` (Logic).
- Use ES6 module imports/exports.
- Keep the DOM manipulation exclusively in the UI/View modules.

Forbidden:
- A single 1000-line `script.js` file.
- Mixing data fetching logic with HTML rendering logic in the same function.

---

# 4) Web Storage Persistence Rule

User data MUST survive browser reloads.

Why this exists:
- Simulates real-world application state without a backend.
- Proves mastery of browser APIs.

Mandatory:
- Implement all four required strategies: `localStorage`, `sessionStorage`, `IndexedDB`, and `Cookies`.
- Log a timestamp of the last update.
- Ensure the cart renders correctly from storage on initial load.

Forbidden:
- Losing the cart contents when the user hits F5.
- Storing complex objects directly without `JSON.stringify()`.

---

# 5) Regular Expression Validation Rule

All user inputs MUST be strictly validated before processing.

Why this exists:
- Protects application state from invalid data.
- Provides immediate user feedback.

Mandatory:
- Use Regex to validate text inputs (e.g., emails, names, quantities).
- Provide immediate, accessible error feedback using `aria-invalid`.

Forbidden:
- Relying solely on default HTML5 `required` attributes.
- Silent failures without user feedback.

---

# 6) Data Driven Rendering Rule

Products MUST be loaded dynamically from an external static file.

Why this exists:
- Proves capability to handle asynchronous data and JSON/XML parsing.

Mandatory:
- Fetch product data from `/data/productos.json` or `.xml`.
- Render product cards by looping over the parsed data using template literals (` ` `).

Forbidden:
- Hardcoding the 10+ product cards directly into `index.html`.

---

# Final Principle

Prefer explicitness over magic, simplicity over cleverness, and deterministic processes over improvisation. Every change MUST improve clarity, responsiveness, and accessibility.
