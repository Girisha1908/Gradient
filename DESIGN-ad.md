# Design System: Kinetic Mono

### 1. Overview & Creative North Star
**Creative North Star: The Kinetic Editorial**
Kinetic Mono is a high-contrast, editorial-inspired design system that treats digital interfaces like premium broadsheet layouts. It eschews the "app-like" clutter of traditional SaaS in favor of expansive whitespace, razor-sharp typography, and a restricted monochromatic palette. The system breaks the rigid grid through intentional asymmetry—pairing heavy sans-serif displays with delicate, italicized serifs to create a rhythmic, conversational hierarchy.

### 2. Colors
The palette is rooted in absolute blacks (#000000) and off-whites (#FAFAVA), creating a high-fashion, high-contrast environment.

*   **The "No-Line" Rule:** Visual separation is achieved through background shifts (e.g., `#FFFFFF` cards on a `#FAFAFA` background) or extreme whitespace. 1px borders are permitted only when they function as "hairlines" for structural grounding, specifically using `outline` (#F4F4F5) at low visibility.
*   **Surface Hierarchy:** 
    *   **Level 0 (Background):** `#FAFAFA` – The canvas.
    *   **Level 1 (Main Containers):** `#FFFFFF` – Elevated content blocks.
    *   **Level 2 (In-Card Accents):** `#F4F4F5` – Nested inputs or secondary zones.
*   **Signature Textures:** Use high-gloss black surfaces (`#1D1D1D`) for primary actions to create a "liquid ink" effect.

### 3. Typography
The system uses a dual-font strategy to balance utility with personality. While the source uses "Geist" and "Instrument Serif," this system maps to **Plus Jakarta Sans** for precision and **Newsreader** (as a proxy for editorial serifs) for character.

**Ground Truth Scale:**
*   **Display (Hero Stats):** 60px (3.75rem) / Medium. Used for impact metrics.
*   **Headline 1:** 24px (1.5rem) / Medium. Used for section titles.
*   **Headline 2:** 20px (1.25rem) / Medium.
*   **Body & Navigation:** 13px / Bold or Medium. The "utility" size.
*   **Labels/Meta:** 10px-11px / Bold / Uppercase / Tracking [0.25em]. 

*Typographic Rhythm:* Sections often pair a Sans-Serif heading with an Italic Serif suffix (e.g., "Completion *Velocity*") to signal a blend of data and human insight.

### 4. Elevation & Depth
Depth is communicated through **Tonal Layering** and massive, diffused shadows rather than physical thickness.

*   **The Layering Principle:** Content floats on a `#FAFAFA` base. Cards use `#FFFFFF` to "pop" without needing dark borders.
*   **Ambient Shadows:** 
    *   *Editorial Shadow:* `0px 20px 50px rgba(0,0,0,0.03)` – A nearly invisible, wide-spread shadow that makes elements feel like they are hovering inches off the screen.
    *   *Functional Shadow (Buttons):* `shadow-lg` (re-interpreted as `0px 10px 15px rgba(0,0,0,0.05)`) for tactile response.
*   **Glassmorphism:** The Top Navigation uses a `white/80` blur (`backdrop-blur-md`) to maintain the editorial flow as the user scrolls, creating a "velum" overlay effect.

### 5. Components
*   **Glossy Buttons:** Pure black backgrounds with white text, using `tracking-widest` and uppercase labels. 
*   **Inputs:** Minimalist "underline-only" inputs for creation tasks, using `border-b` transitions from `outline` to `black`.
*   **Cards:** Massive corner radii (40px/2.5rem) to create a friendly, organic counter-balance to the sharp typography.
*   **Activity Feed:** Uses a "Vertical Hairline" timeline with 6px solid dots to denote state changes.
*   **Avatars:** High-contrast borders (2px Solid Black) to pull photography into the monochromatic theme.

### 6. Do's and Don'ts
*   **Do:** Use 10px uppercase labels with 25% letter spacing for all metadata.
*   **Do:** Mix Serif Italics into headings to highlight "human" or "dynamic" concepts.
*   **Don't:** Use vibrant colors for status. Use black for active, grey for pending, and subtle opacity shifts for inactive.
*   **Don't:** Use standard 8px or 12px border radii. Go "all-in" on 24px+ or stay completely sharp (0px). Consistency in extreme rounding is key.
*   **Do:** Embrace "The Void" (Whitespace). If a section feels crowded, double the padding before considering a border.