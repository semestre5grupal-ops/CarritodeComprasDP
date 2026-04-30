# Active Design Specification

## Feature Name

Accessible Regex-Based Form Validation

---

## Problem Statement

The application must provide clear, immediate, and accessible feedback when a user inputs invalid data into a form (e.g., the checkout form). Currently, without strict client-side validation and proper ARIA integration, users—especially those using screen readers—may submit invalid data or remain unaware of the exact input errors preventing submission.

---

## Scope

**Included:**
- Regex-based validation logic for form fields (e.g., name, email, credit card number if applicable).
- Dynamic manipulation of the `aria-invalid` attribute on input fields based on validation state.
- Dynamic rendering of visual error messages in the DOM immediately adjacent to the invalid input.
- Linking the visual error message to the input field using the `aria-describedby` attribute for screen reader compatibility.
- Disabling the "Enviar / Finalizar Compra" (Submit) button if any input contains uncorrected errors.

**Excluded:**
- Backend submission logic (this is a frontend-only exercise).
- Use of third-party validation libraries (must be pure Vanilla JS).

---

## Implementation Details

1. **Validation Logic (Behavioral Layer - `js/cart.js` or `js/app.js`):**
   - Define a dictionary of strict Regular Expressions for each required input type (e.g., `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` for email).
   - Create a validation orchestration function that accepts an input element and its value, tests it against the appropriate Regex, and returns a boolean result along with an error string.

2. **DOM Manipulation (View Layer - `js/view.js`):**
   - Create a `renderInputError(inputElement, errorMessage, isValid)` function.
   - **If `isValid` is `false`:**
     - Set `inputElement.setAttribute('aria-invalid', 'true')`.
     - Check if an error message element (e.g., `<span id="${inputElement.id}-error" class="error-msg">`) exists next to the input. If not, insert it.
     - Set the text content of the error element to `errorMessage`.
     - Set `inputElement.setAttribute('aria-describedby', `${inputElement.id}-error`)` to link the description for screen readers.
     - Add an invalid CSS class to the input for visual styling (e.g., a red border).
   - **If `isValid` is `true`:**
     - Remove `aria-invalid` (or set it to `false`).
     - Remove the `aria-describedby` attribute (or update it if it described something else initially).
     - Hide or remove the error message element from the DOM.
     - Remove the invalid CSS class.

3. **Submit Button State Management:**
   - Create a `checkFormValidity(formElement)` function.
   - This function will iterate over all required inputs in the form.
   - If *any* input has `aria-invalid="true"`, or is empty but required, set the submit button's `disabled` property to `true`.
   - If all inputs are valid, remove the `disabled` attribute from the submit button.

---

## Test Plan

1. **Regex Accuracy:** Type invalid strings (e.g., email without `@`, numbers in name field) and verify the regex catches them. Type valid strings and verify they pass.
2. **Accessibility Verification:** Use browser dev tools (Accessibility tree) or a screen reader to confirm that when an input is invalid, it is announced as "invalid" and the specific error text is read out via `aria-describedby`.
3. **Visual Feedback:** Confirm that error messages appear immediately in the DOM when validation fails and disappear when the user corrects the input.
4. **Button Locking:** Confirm the "Finalizar Compra" button cannot be clicked (is fully disabled in HTML) while any field remains invalid, and becomes clickable the moment all fields pass validation.

---

## Risks / Edge Cases

- **Validation Timing (UX Risk):** Validating on every keystroke (`input` event) from the beginning can be aggressive and annoying (e.g., telling the user the email is invalid while they are still typing it). 
  - *Mitigation:* Validate on `blur` (when the input loses focus) the first time. Once an input is marked invalid, validate on `input` so the user sees the error disappear the exact moment they fix it.
- **Form Initialization:** The submit button should likely be disabled by default when the form is first loaded if there are required fields, preventing premature submission.

---

## Open Questions

- Which specific input fields (e.g., Nombre, Correo, Dirección, Tarjeta) are present in the checkout form that require Regex patterns?
- Should we apply a debounce function to the validation logic if we decide to validate on the `input` event, or is performance negligible for these simple regex checks?
