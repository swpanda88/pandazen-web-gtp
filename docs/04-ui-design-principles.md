# 04: UI Design Principles

The PandaZen CleanOps dashboard relies on a highly bespoke, approved Vanilla CSS design system. We do not use external UI frameworks.

## 1. Visual Integrity
- The user has already approved the current visual design.
- **Do not alter layouts, paddings, colors, or typography** unless explicitly requested.
- If a screen looks "incomplete," do not redesign it to look fuller.

## 2. Component Reusability
- Re-use existing CSS classes (e.g., `.panel`, `.field-row`, `.grid-2`, `.button`, `.drawer-header`).
- Re-use existing JS UI helper functions (e.g., `escapeHtml()`, `button()`, `chip()`).
- Do not invent new CSS classes for one-off layouts if an existing utility or grid class suffices.

## 3. Preserving the UI
- **Do not hide or remove UI controls** simply because the backend API isn't ready for them yet. 
- A control without backend wiring should remain visible as a placeholder so the design intent is preserved and the visual layout remains stable.

## 4. Drawers & Modals
- We use sliding side drawers (`.client-modal`) and backdrops (`.client-modal-backdrop`) for complex data entry (e.g., New Client, New Request).
- Ensure z-indexes and scroll behaviors remain intact when adding new drawers.
- Rely on global `data-action` attributes for closing drawers (e.g., `data-action="close-modal"`) rather than creating bespoke event listeners every time.

## 5. Structured Inputs
- Prefer `<select>` dropdowns over text inputs for any constrained data (e.g., status, property type, preferred day).
- Provide clear fallbacks (e.g., "To confirm", "Not applicable") instead of "Unknown" or blank values, adhering to the standard dictionaries in the JS modules.
