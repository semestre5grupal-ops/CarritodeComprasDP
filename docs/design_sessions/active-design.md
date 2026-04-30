# Active Design Specification

## Feature Name

Session Storage Temporal Persistence (Cart Last Update Timestamp)

---

## Problem Statement

To comply with the project's multi-tier persistence requirements (Rule 4), the application must utilize `sessionStorage` in addition to primary storage mechanisms. Specifically, the system needs to track the exact time of the most recent modification to the shopping cart and securely persist this timestamp during the active user session, subsequently displaying it to the user.

---

## Scope

**Included:**
- Extending the cart business logic (`cart.js` or equivalent) to record the current timestamp (`lastUpdate`) in `sessionStorage` upon any cart state mutation (add, remove, update quantity).
- Modifying the view layer (`view.js` or equivalent) to retrieve, format, and display the timestamp at the bottom of the cart UI container.
- Implementation of Accessible Rich Internet Applications (ARIA) attributes (e.g., `aria-live`) to ensure the time update is communicated to screen readers.

**Excluded:**
- Altering the primary `localStorage` mechanics for the cart items array.
- Complex date-time localization libraries (e.g., Moment.js); we will strictly use Vanilla JS Date APIs.

---

## Implementation Details

1. **State Mutation Tracking:**
   - Whenever the cart is updated, `sessionStorage.setItem('lastUpdate', new Date().toISOString())` will be invoked alongside the standard state updates.
   - This keeps the data format standardized (ISO 8601).

2. **View Layer Formatting:**
   - During the cart rendering cycle, the view will read `sessionStorage.getItem('lastUpdate')`.
   - If a value exists, it will be parsed into a local Date object.
   - The time will be extracted and formatted to `HH:MM` (e.g., via `Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' })`).

3. **UI Integration:**
   - A new semantic text element will be added to the cart footer: `<p id="cart-last-update" aria-live="polite" class="cart-timestamp">Última actualización: HH:MM</p>`.
   - The CSS will be updated to style `.cart-timestamp` discretely (e.g., small, muted text).

---

## Test Plan

1. **Storage Validation:** Modify the cart and verify via Developer Tools -> Application -> Session Storage that `lastUpdate` holds a valid ISO 8601 string.
2. **UI Rendering:** Confirm that "Última actualización: HH:MM" appears at the bottom of the cart after a modification.
3. **Reactivity:** Update cart quantities and verify the timestamp reflects the new time immediately.
4. **Session Persistence:** Reload the page (F5) and verify the timestamp persists.
5. **Session Isolation:** Open the application in a new tab or close/re-open the tab; verify the timestamp is cleared (as it's a new session).

---

## Risks / Edge Cases

- **Timezone Offset:** Saving as ISO string implies UTC time. The view must parse this back to local time correctly to prevent displaying incorrect hours.
- **Empty State Handling:** On the user's very first visit in a session, `lastUpdate` will be `null`. The UI must gracefully handle this by either omitting the timestamp element entirely or displaying a fallback message.

---

## Open Questions

- Should the timestamp display "Aún no actualizado" when the cart is initially loaded empty, or should the element remain hidden until the first interaction? (Recommendation: Hide until first interaction to keep the UI clean).
- Are there specific CSS classes from the existing system we should use to render text "discretely" (e.g., `text-muted`, `small`), or should we create a new utility class?
