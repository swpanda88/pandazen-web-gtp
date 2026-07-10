# Testing Checklist

When an agent (AG or Codex) is tasked with testing a feature, verify these parameters locally:

1. [ ] **DOM Uniqueness**: Open modals/forms and confirm `document.querySelectorAll('#id')` returns exactly 1 element for every field ID.
2. [ ] **State Bleed**: Verify that closing a modal and reopening it resets or maintains the correct state without duplicating UI elements.
3. [ ] **Persistence**: Create or update an entity. Refresh the page entirely. Verify the changes persisted identically to what was entered.
4. [ ] **Partial Failures**: If a composite operation fails halfway (e.g., Customer creates successfully, but Property fails), verify the UI handles it gracefully (e.g., does not show a global success toast, stops loading spinners, and leaves the user in a recoverable state).
5. [ ] **Null Handling**: Ensure empty fields or unselected dropdowns do not throw `undefined` errors during rendering or DB writes.
6. [ ] **Cross-module impact**: If you modified a generic DB mapping, verify that the other modules relying on that mapping still load correctly.
