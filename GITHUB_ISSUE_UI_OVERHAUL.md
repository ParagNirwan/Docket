# Issue: Complete UI/UX Overhaul of Archived Documents Workspace

## 🚩 Problem Statement
The current "View Archives" page is a basic list-based implementation. It lacks spatial hierarchy, suffers from high visual noise due to inline "Move to" dropdowns, and lacks a professional "Vault" aesthetic. It feels like a generic CRUD app rather than a high-end document archive.

## 🎯 Goal
Transform the Archives page into a professional **Workspace View** with a persistent sidebar for Trays, an explorer-style file navigation system, and a comprehensive theme system (Light/Dark).

---

## 🛠 Requirements

### 1. Vault Sidebar Implementation
- **Feature:** Introduce a fixed left-hand sidebar (`w-64`) to the `ViewArchivesPage`.
- **Functionality:** 
  - List all available **Trays** in the sidebar.
  - Selecting a Tray updates the main content area to show files/folders for that specific Tray.
  - Current active Tray must be visually highlighted (using `--color-vault` and a left-border indicator).
- **UX:** Remove the Tray selection dropdown from the main header to reduce clutter.

### 2. Explorer-Style Navigation
- **Layout:** 
  - Replace the current simple list with a clearer "Explorer" layout.
  - Folders should be visually distinct from files.
  - Implement a "Breadcrumb" navigation bar at the top (already exists but needs styling update to match `FRONTEND_DESIGN.md`).
- **Behavior:** Clicking a folder updates the view to that folder's contents; clicking a file triggers the download/view action.

### 3. Contextual Actions (Overflow Menu)
- **Feature:** Remove the `select` dropdown for "Move to..." from the file rows.
- **Functionality:** 
  - Add a `...` (More) button at the end of each row.
  - Clicking the button opens a floating **Overflow Menu**.
  - **Menu Items:**
    - `Move to...` $\rightarrow$ Opens a selection of available folders.
    - `Rename` (Future)
    - `Delete` (Future - style as `--color-danger`).

### 4. Dark Theme Support
- **Feature:** Implement a global theme toggle (Light/Dark).
- **Styling:** 
  - Follow the "Ink Theme" tokens defined in `FRONTEND_DESIGN.md`.
  - Ensure all borders (`--color-line`) and backgrounds (`--color-paper`) switch seamlessly.
- **Implementation:** Use Tailwind's `dark:` modifier or CSS Variables mapped to a `.dark` class on the `body` or `html` tag.

---

## 🎨 Design Specifications
Refer to `FRONTEND_DESIGN.md` for the exact hex codes and typography rules.

- **Light Theme:** "Paper" (Warm neutrals, slate-navy accents).
- **Dark Theme:** "Ink" (Deep charcoal, warm silver text).
- **Components:** No gradients, no heavy shadows, no all-caps labels.

## ✅ Acceptance Criteria
- [ ] Sidebar is functional and updates the main view without full page reload.
- [ ] "Move to" dropdown is removed from rows and moved into a contextual menu.
- [ ] Dark theme is fully implemented across the Archives page.
- [ ] UI matches the "Ledger/Vault" aesthetic (Serif headings, Sans body, warm palette).
- [ ] Responsive layout (sidebar collapses or hides on mobile).

