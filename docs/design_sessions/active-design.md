# Active Design Specification

## Feature Name

Mobile-First Responsiveness Audit & Notification Refinement

---

## Problem Statement

The main objective is to ensure that the web application's design is truly "mobile-first" and adapts fluidly without any layout errors across all screens. Additionally, notifications (such as "add to cart" alerts, validation error messages, etc.) must be reviewed and adapted so they render correctly and do not disrupt the user experience or usability on mobile devices.

---

## Scope

**Included:**
- Audit of the presentation layer (CSS) to ensure the use of `@media (min-width: ...)` as the mobile-first standard.
- Verification of at least 3 optimal breakpoints (Mobile, Tablet, Desktop) following the "Golden Rules".
- Refinement of notification/toast design and positioning to prevent them from overflowing the screen on small devices, ensuring visibility and accessibility.
- Adjustment of Flexbox and CSS Grid layouts to prevent horizontal scroll (overflow-x) across all device sizes.
- Exhaustive UI component testing across defined resolutions.

**Excluded:**
- Modification of underlying business logic (shopping cart state, calculations) unless it directly affects the visual presentation.
- Integration of external CSS libraries or frameworks (like Bootstrap or Tailwind), which are strictly forbidden by the project architecture.

---

## Implementation Details

1. **Breakpoint Definition (Presentation Layer):**
   - Establish the base structural design assuming mobile screens (e.g., `< 768px`). Do not use `@media` queries for the base design.
   - Breakpoint 1 (Tablet): `@media (min-width: 768px)` to transition from single-column lists to multi-column grids.
   - Breakpoint 2 (Desktop): `@media (min-width: 1024px)` or `1200px` to apply `max-width` and center main containers.

2. **Structural Refinement:**
   - Confirm correct usage of the viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
   - Replace any fixed width values in pixels (e.g., `width: 500px`) in main containers with relative units (`%`, `vw`, `rem`) and fluid functions.

3. **Notifications and Toasts:**
   - **Mobile:** Modify notification styles so that, instead of floating in a tiny corner, they occupy a more visible space (e.g., pinned to the bottom `bottom: 1rem` or top, with `max-width: 90%` or `width: calc(100% - 2rem)`).
   - **Desktop:** Retain standard floating presentation (e.g., top-right or bottom-right corner).
   - **Accessibility:** Maintain `role="alert"` or `role="status"` on notification containers for screen reader support.

4. **Overflow Prevention:**
   - Apply `word-break: break-word` or `overflow-wrap: break-word` to long texts inside notifications or product details.
   - Adjust the cart summary layout for small screens (avoiding rigid `<table>` tags if they break, and favoring flexbox/grid stacked card layouts for each item).

---

## Test Plan

- **Extreme Mobile Test:** Emulate a 320px resolution (e.g., iPhone SE). Ensure zero horizontal scrolling and that notifications are legible.
- **Tablet Transition Test:** Vary viewport from 767px to 769px. Validate that the single-column to multi-column grid transition occurs smoothly.
- **Desktop Boundary Test:** Emulate Ultra-Wide screens (1920px+). Confirm that the main content does not expand infinitely and stays centered.
- **Notification Event Audit:** Trigger actions like "Add to Cart" or form validation failures at each breakpoint to guarantee that popups/notifications do not overlap crucial buttons or hinder navigation.

---

## Risks / Edge Cases

- **Cart Component:** Cart interfaces often include multiple columns (Image, Product, Price, Qty, Total). On mobile, this tabular structure collapses horizontally. It will likely need to be converted into a vertically stacked card layout.
- **Multiple Notifications:** If multiple notifications stack at once on mobile, they might cover the entire screen and prevent the user from operating the interface (violating the "Operable" POUR rule).

---

## Open Questions

- Do the current notifications use a specific CSS module or JavaScript file that we need to review in the codebase?
- Are there specific UI elements that have previously shown responsiveness issues known by the team?
