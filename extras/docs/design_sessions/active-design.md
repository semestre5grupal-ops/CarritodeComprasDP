# Active Design Specification

## Feature Name

Luxury Sportswear Aesthetic Home Page Redesign

---

## Problem Statement

The current design of the home page is functional but lacks the premium, high-end aesthetic required for a modern luxury sportswear brand. It needs a visual overhaul to incorporate strategic editorial imagery, refine the mobile layout, and enhance the overall premium feel. This must be achieved while keeping the existing color palette, avoiding changes to the HTML structure or JavaScript logic, and strictly maintaining WCAG AA accessibility standards.

---

## Scope

**Included:**
- Elevating the home page design to a luxury, editorial aesthetic.
- Mobile-first layout refinements specifically for the first hero section (perfectly centered text card, smaller and subtler carousel arrows that remain usable).
- Strategic integration of new high-quality images (`mujer-correr.webp`, `yoga-mujer.avif`, `running-color-negro.webp`, `personas-corriendo.png`, `mujer-movimiento.jpg`, `top-mujer-vino.webp`) in places currently lacking imagery (e.g., Collection Banner, Materials, Promo Banner, Story Grid).
- Maintaining the current structure of the Hero, Contact section, and Products.
- Maintaining the existing color palette (`--bg`, `--surface`, `--ink`, `--accent`, etc.).

**Excluded:**
- Any changes to JavaScript logic (`app.js`, `cart.js`, `catalog.js`, etc.).
- Modifications to the underlying semantic HTML structure that would break existing functionality.
- Writing any code before the open design questions are resolved.

---

## Implementation Details

1. **Hero Refinements:**
   - Adjust flexbox alignments and padding for `.hero-copy` on mobile screens (`< 768px`) to ensure the text card is dead-center both vertically and horizontally.
   - Reduce `.carousel-btn` visual size (e.g., to 32px or 36px) and soften their contrast (e.g., lower opacity or glassmorphism), while padding out the actual element to maintain a minimum `44px x 44px` touch target for accessibility.

2. **Image Strategy:**
   - **Collection Banner:** Replace the current flat gradient with an editorial background image (`yoga-mujer.avif`).
   - **Materials Section:** Introduce visual depth by adding `running-color-negro.webp` as a background or split context to highlight the "Fibras" concept.
   - **Promo Banner:** Replace the solid blue gradient with a high-energy action shot (`personas-corriendo.png`), using a colored overlay to maintain the `--accent-3` brand vibe.
   - **Story Grid:** Replace the SVG pattern on the left card with `mujer-movimiento.jpg` and the flat background on the right card with `top-mujer-vino.webp`.

3. **Accessibility Overlays:**
   - Implement either dark gradients, solid semi-transparent backgrounds, or CSS backdrop filters (`blur()`) behind text placed over new imagery to guarantee WCAG AA text contrast.

---

## Test Plan

- **Accessibility Audit:** Run automated and manual checks to ensure all text over new images passes the 4.5:1 contrast ratio.
- **Mobile Usability:** Verify that the hero card is perfectly centered on standard mobile viewports (320px, 375px, 414px) and that carousel arrows are easy to tap without overlapping text.
- **Keyboard Navigation:** Ensure focus rings are highly visible against all new image backgrounds.

---

## Risks / Edge Cases

- **Contrast Failures:** High-contrast photography can make text illegible if overlays are too subtle or if the image loads slowly.
- **Touch Targets:** Making arrows "visually smaller" risks failing WCAG tap target requirements if the interactive area (`padding`) isn't increased proportionately.

---

## Open Questions

Before proceeding with the CSS implementation, please clarify the following to avoid assumptions:

1. **Beneficios & Trust Panel:** Currently, these sections (`.benefits-item`, `.trust-card`) use text and simple flat backgrounds. Do you want to keep them minimal and text-focused (which often feels cleaner/more luxury), or should we try to incorporate subtle background images/textures there as well?
2. **Text Overlays:** To maintain contrast over the new images, do you prefer a **dark aesthetic** (dark gradient overlays with white text) or a **light/glassmorphic aesthetic** (frosted translucent glass boxes with dark text)?
3. **Typography tweaks:** Luxury brands often use lighter font weights for headings combined with generous letter spacing. Are you open to adjusting the `font-weight` and `letter-spacing` rules in the CSS for headings to enhance the premium feel, or should typography remain exactly as it is?
