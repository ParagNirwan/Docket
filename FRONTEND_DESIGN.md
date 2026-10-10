# Docket Frontend Design System

## Grounding Concept
Docket is a document vault, not a generic dashboard. The visual language is that of a well-run physical archive: ledgers, folders, stamps, and registries. It conveys quiet authority, permanence, and professionalism.

## Color Palette

### Light Theme (The Paper Theme)
*Designed to feel like uncoated, high-quality archival paper.*

| Token | Hex | Role |
| :--- | :--- | :--- |
| `--color-ink` | `#1C1B18` | Primary text, headings (Warm near-black) |
| `--color-paper` | `#FAF8F4` | Base background (Warm matte paper) |
| `--color-vault` | `#2B3A4A` | Primary brand/action (Deep slate-navy) |
| `--color-vault-hover` | `#233040` | Hover state for primary actions |
| `--color-seal` | `#A6472E` | Rare accent (Muted brick/wax seal) |
| `--color-line` | `#E4DFD5` | Borders, dividers (Warm toned) |
| `--color-muted` | `#6B655C` | Secondary text, metadata (Warm grey) |
| `--color-success` | `#3D6B47` | Confirmations (Muted forest) |
| `--color-danger` | `#9B3B34` | Errors, destructive actions |
| `--color-warning` | `#8A6A1F` | Warnings (Muted ochre) |
| `--color-hover-paper` | `#F2EFE8` | Row hover state |

### Dark Theme (The Ink Theme)
*Designed to feel like a midnight library or a dark leather-bound ledger.*

| Token | Hex | Role |
| :--- | :--- | :--- |
| `--color-ink-dark` | `#E4DFD5` | Primary text (Warm silver/paper) |
| `--color-paper-dark` | `#1A1917` | Base background (Deep charcoal/ink) |
| `--color-vault-dark` | `#5C728A` | Primary brand/action (Muted slate-blue) |
| `--color-vault-hover-dark` | `#7088A8` | Hover state for primary actions |
| `--color-seal-dark` | `#C66D54` | Rare accent (Softened brick) |
| `--color-line-dark` | `#32302E` | Borders, dividers (Deep warm grey) |
| `--color-muted-dark` | `#A19B93` | Secondary text (Muted stone) |
| `--color-success-dark` | `#5C8B63` | Confirmations |
| `--color-danger-dark` | `#B3554D` | Errors, destructive actions |
| `--color-warning-dark` | `#B0954D` | Warnings |
| `--color-hover-paper-dark` | `#242220` | Row hover state |

## Typography
- **Headings/Display:** Serif (e.g., *Source Serif 4* or *Lora*). Conveys permanence and editorial weight.
- **Body/UI/Data:** Humanist Sans (e.g., *Inter* or *Public Sans*). Conveys clarity and efficiency.
- **Case:** Sentence case everywhere. No all-caps labels.

## Component Specifications

### 1. The Vault Sidebar (New)
- **Role:** High-level navigation for "Trays."
- **Styling:**
  - Background: Slightly darker than the main paper color (Light: `--color-line`, Dark: `--color-line-dark`).
  - Width: Fixed `w-64` (256px).
  - Active State: `--color-vault` text with a 3px left-border indicator.
  - Interaction: Snappy hover transition (`duration-150`).

### 2. The Explorer Grid
- **Folders:** Large, clickable tiles or rows with a clear folder icon.
- **Files:** Detailed rows including filename, size, and date.
- **Layout:** Centered with `max-w-5xl` to prevent excessive line lengths.

### 3. Contextual Overflow Menu (New)
- **Trigger:** A `...` (More) button at the end of every file/folder row.
- **Contents:** 
  - "Move to..." (Triggers a sub-menu or modal)
  - "Rename"
  - "Delete" (Destructive styling)
- **Styling:** Floating card with a tight, small shadow. Background matches `--color-paper` / `--color-paper-dark`.

## Motion & Interaction
- **Transitions:** `transition-colors duration-150` for all hover states.
- **No Animations:** No sliding panels, fading transitions, or scaling effects. The experience should feel static and solid, like a physical book.
