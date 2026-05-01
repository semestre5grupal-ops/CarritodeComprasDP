# Mobile First Header Specification

## Feature Name

Mobile First Header

---

The application requires a robust, responsive header that adapts fluidly across device sizes. It must adhere to a mobile-first philosophy. On mobile devices, the header needs to display the logo on the left, the hamburger toggle in the center, and the user/cart actions on the right in a single coherent row. On larger screens, it must transition to a three-column layout: logo on the left, primary navigation centered, and action icons on the right. Crucially, the implementation must be highly accessible, providing clear focus indicators for keyboard navigation and appropriate ARIA states for screen readers.

---

## Scope

**In Scope:**
*   Restructuring the semantic HTML (`<header>`, `<nav>`) to support both mobile and desktop layouts.
*   Mobile-first CSS implementation utilizing Flexbox/Grid.
*   Implementation of the hamburger menu toggle logic using Vanilla JS.
*   Accessibility enhancements: `aria-expanded`, `aria-controls`, `aria-label`, and strict `:focus-visible` styling (distinct underline/outline).
*   Integration of the user "Login" SVG icon and cart icon into the right side of the header.

**Out of Scope:**
*   Business logic for populating the cart (this only handles the UI placement of the cart button).
*   Modifying the main content layouts below the header.

---

## Implementation Details

### 1. Semantic HTML Structure
```html
<header class="site-header">
  <div class="header-container">
    <!-- Left: Logo -->
    <a href="index.html" class="logo" aria-label="Home">
      <img src="assets/images/logo.svg" alt="Company Logo">
    </a>

    <!-- Mobile Toggle Button -->
    <button class="mobile-menu-toggle" aria-expanded="false" aria-controls="primary-navigation" aria-label="Open menu">
      <span class="hamburger-icon"></span>
    </button>

    <!-- Center: Navigation -->
    <nav id="primary-navigation" class="primary-nav">
      <ul class="nav-list">
        <li><a href="index.html" class="nav-link">Home</a></li>
        <li><a href="products.html" class="nav-link">Products</a></li>
        <li><a href="about.html" class="nav-link">About</a></li>
      </ul>
    </nav>

    <!-- Right: Actions (User & Cart) -->
    <div class="nav-actions" aria-label="Acciones rápidas">
        <button type="button" class="btn-user nav-pill" aria-label="Login">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span class="user-text">Login</span>
        </button>
        <button type="button" class="btn-cart nav-pill" aria-label="Abrir carrito, 0 artículos"
            aria-expanded="false">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span class="cart-badge" aria-hidden="true">0</span>
        </button>
    </div>
  </div>
</header>
```

### 2. CSS (Mobile-First approach)
*   **Base (Mobile):** The `.nav-bar` uses Flexbox with `.brand` taking `flex: 1` and `.nav-actions` taking `flex: 1` aligned right. This perfectly centers the `.mobile-menu-toggle`. The `.primary-nav` is pushed below using `order: 4` and is hidden by default. The word "Login" is hidden below `480px`.
*   **Breakpoint (Desktop - e.g., `@media (min-width: 1024px)`):**
    *   `.mobile-menu-toggle` is set to `display: none;`.
    *   `.primary-nav` is centered using `flex: 1; justify-content: center;` with `order: 0`.
    *   `.brand` and `.nav-actions` revert to their intrinsic widths (`flex: none`).
*   **Accessibility:** All interactive elements (`a`, `button`) will have a strict `:focus-visible` state applied, rendering a coherent, highly visible outline/line matching the design system (e.g., `outline: 2px solid var(--focus-color); outline-offset: 2px; text-decoration: underline;`).

### 3. JavaScript Logic (app.js / view.js)
*   Select `.mobile-menu-toggle` and `#primary-navigation`.
*   Attach a `click` event listener to the toggle button.
*   Toggle an `is-open` CSS class on the navigation.
*   Dynamically update `aria-expanded` on the toggle button (`true` when open, `false` when closed).

---

## Test Plan

1.  **Mobile Viewport (< 1024px):** Verify the hamburger button is perfectly centered, the logo is left, and the actions (User SVG + Cart) are right. Nav links should be hidden. Clicking the hamburger opens the menu and updates `aria-expanded` to true.
2.  **Desktop Viewport (>= 1024px):** Verify the hamburger button is hidden. Ensure the logo is left, nav links are centered, and the actions are on the right.
3.  **Keyboard Accessibility:** Navigate through the header using the `Tab` key. Verify that the focus indicator (line/outline) is clearly visible on every link and button.
4.  **Screen Readers:** Verify the state of the hamburger menu is announced correctly when toggled.
5.  **Resize Edge Case:** Open the mobile menu, then resize the window to desktop width. The menu should seamlessly transition to the desktop layout without breaking.

---

## Risks / Edge Cases

*   **Focus Trapping on Mobile:** When the mobile menu is open, tabbing might continue to the content below the overlay. Need to ensure appropriate focus management if the menu covers the screen.
*   **JavaScript Failure:** If JS fails to load, the mobile menu would be inaccessible. Ensuring a `<noscript>` fallback or ensuring structural robustness is necessary.

---

## Open Questions

1.  **Breakpoint definition:** Which exact pixel width should we use for the transition from mobile to desktop (e.g., `768px` or `1024px`)?
2.  **Visual specifics:** Is there a specific CSS variable or color code defined for the focus state line to ensure it matches the "rest of the page" perfectly?
