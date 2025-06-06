# CardWallet App: Issues Log

This document will be used to meticulously record all issues found during the component-by-component audit of the CardWallet app. Each entry will include:

- **Component/Subcomponent Name**
- **Short Description of the Issue**
- **Severity** (Critical, Major, Minor)

---

## Table of Contents

(To be filled as components are reviewed)

---

## Issues

---

### Additional Issues (Hooks, Utilities, Auth, List)

#### `src/hooks/useCards.ts`
- **[Major]** No persistence to local storage or backend; all state is in-memory and lost on reload.
- **[Major]** No error handling for duplicate card IDs or invalid card data.
- **[Medium]** No validation for unique fields (e.g., email, identifier).
- **[Medium]** Some business logic (isMyCard/type interaction) handled via console log, not robust.
- **[Medium]** No TypeScript type validation for groupedCards object keys.
- **[Medium]** No support for async operations or loading states.
- **[Major]** No security/auth checks on card actions.

#### `src/hooks/useSearch.ts`
- **[Low]** No debounce/throttling for search input (could cause unnecessary renders).
- **[Low]** No persistence of search state between sessions.
- **[Medium]** No accessibility features for keyboard navigation or screen readers.

#### `src/hooks/useFeedback.ts`
- **[Low]** Feedback is only transient; no persistent log/history.
- **[Low]** Only supports one message at a time.
- **[Low]** No support for different durations or custom feedback types.
- **[Medium]** No accessibility announcements (e.g., ARIA live region).

#### `src/utils/icons.ts` + `src/types/lucide-icons.d.ts`
- **[Low]** If icon list grows, maintenance could become harder.
- **[Low]** No dynamic icon loading or fallback for missing icons.
- **[Medium]** Shared `Icon` component could benefit from additional accessibility props (e.g., `aria-label`).

#### `src/components/FormComponents.tsx`
- **[Medium]** No ARIA attributes for error states or required fields (beyond `required`).
- **[Medium]** No validation feedback shown to users.
- **[Medium]** ActionButton and ContactAction may lack accessible labels for screen readers.
- **[Low]** No support for custom input types (date, number, etc.) in InputField.
- **[Low]** SelectField custom SVG arrow may not be accessible for all screen readers.

#### `src/components/AuthModal.tsx`
- **[Major]** No actual authentication logic (simulation only).
- **[Medium]** No password strength validation or error feedback.
- **[Medium]** Modal does not trap focus for accessibility.
- **[Medium]** No ARIA live region for error/success messages.
- **[Low]** No support for password visibility toggle.
- **[Low]** No support for OAuth or third-party sign-in.

#### `src/components/CardList.tsx` and `CardListItem.tsx`
- **[Medium]** No pagination or virtualization for large card sets.
- **[Major]** No confirmation dialog before deleting a card.
- **[Medium]** No keyboard navigation for cards (tab/arrow keys).
- **[Medium]** CardListItem does not support user-uploaded images.
- **[Low]** No drag-and-drop reordering of cards or categories.
- **[Medium]** Card color is used as background, but no contrast check for text accessibility.

---

### Issues from Initial Component-by-Component Audit

#### `src/components/card-detail/OptimizedCardDetailModal.tsx`
- **[Major]** Modal state logic is complex and hard to maintain due to many conditional branches.
- **[Medium]** Lazy loading improves performance but adds cognitive overhead for debugging.
- **[Medium]** No ARIA attributes for modal accessibility.
- **[Medium]** Feedback messages are transient and not accessible to screen readers.
- **[Low]** Scan functionality is simulated and not robust for real devices.

#### `src/components/card-detail/BusinessCardDetails.tsx`
- **[Medium]** Lacks field validation and error feedback for required fields.
- **[Low]** No support for custom fields or additional contact info.

#### `src/components/card-detail/NonBusinessCardDetails.tsx`
- **[Medium]** Conditional fields logic is hardcoded and not easily extensible.
- **[Low]** Expiry and event fields do not validate input format.

#### `src/components/card-detail/CardContactInfo.tsx`
- **[Medium]** No ARIA live region or role for contact info updates.
- **[Low]** Static links/icons may not be accessible to screen readers.

#### `src/components/card-detail/CardDetailActions.tsx`
- **[Major]** Destructive actions (delete) lack confirmation dialogs.
- **[Medium]** No keyboard shortcuts for quick actions.
- **[Low]** No tooltip or description for each action button.

#### `src/components/PlaceholderElements.tsx`
- **[Low]** SVG placeholders do not provide descriptive titles for screen readers.
- **[Low]** No fallback for broken/missing logos or avatars.

#### `src/components/QRCodeGenerator.tsx`
- **[Medium]** No error handling for QR code generation failures.
- **[Low]** Downloaded PNG lacks alt text or metadata.
- **[Low]** No customization options for QR code appearance.

#### `src/api/cardApi.ts`
- **[Major]** API layer is simulated; no real backend or data persistence.
- **[Medium]** No error simulation or handling for network failures.

#### `src/context/ThemeContext.tsx`
- **[Low]** No persistence of theme preference (resets on reload).
- **[Low]** No support for system theme detection.

#### `src/types/index.ts`
- **[Medium]** Some interfaces/types are too broad (e.g., optional fields for all card types).
- **[Low]** No strict typing for card categories or color values.

#### `src/utils/constants.ts`

#### `src/components/forms/OptimizedAddCardModal.tsx`
- **[Medium]** Conditional field rendering logic is complex and not easily extensible for new card types.
- **[Medium]** No ARIA attributes or focus management for modal accessibility.
- **[Medium]** No validation feedback for required or invalid fields; only disables Add Card button.
- **[Low]** No support for custom card type input in UI (though partially present in code).
- **[Low]** No keyboard shortcuts for quick actions (scan, add, cancel).

#### `src/components/forms/InputField.tsx`
- **[Medium]** No ARIA attributes for error/invalid state or required fields (beyond required mark).
- **[Low]** No validation feedback for invalid input (e.g., email, phone, url types).
- **[Low]** Does not announce errors or state changes for screen readers.

#### `src/components/forms/SelectField.tsx`
- **[Medium]** No ARIA attributes or accessible description for select dropdown.
- **[Low]** No validation feedback for required selection.
- **[Low]** Custom dropdown arrow may not be accessible for all assistive technologies.

#### `src/components/forms/CheckboxField.tsx`
- **[Low]** No ARIA attributes for checked state or group labeling.
- **[Low]** No indeterminate state support for complex checkbox groups.
- **[Medium]** Category labels and types are hardcoded, making extension difficult.
- **[Low]** Initial state/sample data is static and not localized.

#### `src/components/OptimizedCardWallet.tsx`
- **[Major]** Main state and event logic is complex and spans many handlers, making maintainability challenging.
- **[Major]** No global error boundary for handling unexpected UI errors.
- **[Major]** Authentication state is simulated and not secure; no real user session or token management.
- **[Medium]** No ARIA live regions for feedback or error messages (feedback not accessible to screen readers).
- **[Medium]** No keyboard navigation for main actions (add, search, sync, logout).
- **[Medium]** No loading indicators for async actions (sync, add, delete, etc.).
- **[Medium]** No confirmation dialog for logout or destructive actions.
- **[Low]** Some event handlers (e.g., handleAddCard) duplicate validation logic already in hooks/components.
- **[Low]** No persistent user preferences (view mode, theme, etc.) across sessions.

#### `src/components/Footer.tsx`
- **[Medium]** No ARIA live region or feedback for status changes (theme, sync, view mode).
- **[Medium]** No keyboard navigation for footer buttons (tab/arrow keys, focus ring).
- **[Medium]** No visual or accessible indication of sync status (success, error, in progress).
- **[Low]** No haptic or mobile feedback for critical actions (add, sync, profile).
- **[Low]** No support for custom footer layouts or additional actions.

#### `src/components/Header.tsx`
- **[Medium]** No ARIA live region or accessible role for sync status notifications.
- **[Medium]** No keyboard navigation or focus management for header actions (if present).
- **[Low]** No support for custom header content or branding.
- **[Low]** No persistent sync status log or history for users.

#### `src/components/SearchBar.tsx`
- **[Medium]** No ARIA attributes or accessible labels for search input and sorting controls.
- **[Medium]** No keyboard navigation for sorting/filtering buttons.
- **[Medium]** No feedback or error message for invalid search input.
- **[Low]** No support for advanced search (e.g., fuzzy, multi-field).
- **[Low]** No persistent search state across sessions.

#### `src/components/CardListView.tsx`
- **[Medium]** No ARIA roles or accessible table markup for screen readers.
- **[Medium]** No keyboard navigation for rows, actions, or category toggles.
- **[Medium]** No confirmation dialog before deleting a card.
- **[Low]** No support for bulk actions (multi-select, delete).
- **[Low]** No persistent sort/filter state across sessions.

#### `src/components/card-detail/OptimizedCardDetailModal.tsx`
- **[Major]** No ARIA roles, focus trap, or keyboard navigation for modal dialog (inaccessible for screen readers).
- **[Major]** Feedback messages use direct DOM manipulation and are not accessible to screen readers or keyboard users.
- **[Medium]** No validation feedback for invalid or missing fields during editing.
- **[Medium]** No confirmation dialog before destructive actions (delete, close with unsaved changes).
- **[Medium]** No loading indicators for lazy-loaded sections/components.
- **[Low]** No support for undo/redo or edit history in card details.
- **[Low]** No persistent notes or activity log for card changes.

#### `src/components/card-detail/BusinessCardDetails.tsx`
- **[Medium]** No ARIA attributes or accessible labeling for form fields (checkbox, name, company, etc.).
- **[Medium]** No validation feedback for required fields during editing (e.g., name, company).
- **[Low]** No keyboard navigation or focus management for editable fields.

#### `src/components/card-detail/NonBusinessCardDetails.tsx`
- **[Medium]** No ARIA attributes or accessible labeling for editable fields (company, identifier, etc.).
- **[Medium]** No validation feedback for required or invalid fields.
- **[Low]** No support for custom field types or advanced input validation (date, url, etc.).

#### `src/components/card-detail/CardContactInfo.tsx`
- **[Medium]** No ARIA attributes or accessible labeling for contact fields and actions.
- **[Medium]** No validation feedback for invalid contact info (email, phone, url).
- **[Low]** No keyboard navigation for contact action links or inputs.
- **[Low]** No persistent contact history or log for cards.

#### `src/components/card-detail/CardDetailActions.tsx`
- **[Medium]** No ARIA labels or accessible descriptions for action buttons (edit, share, delete, scan, etc.).
- **[Medium]** No keyboard navigation or focus ring for action buttons.
- **[Medium]** No confirmation dialog before destructive actions (delete).
- **[Low]** No support for custom or additional actions (export, duplicate, etc.).

