# Collaburo — Project Context Summary

**Last updated:** May 18, 2026
**Current milestone:** Step 6 (Catering) — just completed. Steps 7–9 next.

---

## What We're Building

Collaburo is a **hi-fi interactive prototype** for an event venue booking customization platform. It has two views:

1. **Collaburo-App.html** (~7,400+ lines) — The **admin view** where venue owners configure a multi-step booking workflow: add/remove/reorder fields, manage venues, set pricing, and preview what clients see.
2. **Client-View.html** (~2,000+ lines) — The **client-facing view** where customers fill out the booking form step by step. Reads its data from the same localStorage as the admin view.

Both files are **completely self-contained single HTML files** — all CSS, JSX, and data are inlined. No build tools, no bundler, no separate files.

---

## Tech Stack

- **React 18.3.1** (UMD build via CDN)
- **Babel Standalone 7.29.0** for in-browser JSX transpilation (`<script type="text/babel">`)
- **Google Fonts:** Geist, Manrope, IBM Plex Sans, Inter Tight, JetBrains Mono
- **No external component libraries** — all components are custom-built
- **localStorage** for persistence between admin and client views

### Storage Keys
- `collaburo.admin.workflow.v5` — stores the full workflow steps + fields data
- `collaburo.admin.savedAt.v5` — timestamp of last save

**Important:** If you change the data model significantly, bump the version suffix (e.g., `v5` → `v6`) in BOTH files so the app falls back to fresh `SAMPLE_STEPS` instead of loading stale cached data.

---

## Architecture Overview

### Data Flow
```
SAMPLE_STEPS (hardcoded default) → localStorage → Admin edits → localStorage → Client reads
```

### Key Data Structures

**Steps** (`SAMPLE_STEPS` array):
Each step has `{ id, name, description, icon, fields: [...] }`.

**Fields** (inside each step):
```
{
  id, label, type, required, adminRequired, visibleToClient,
  placeholder, helpText, fieldDescription, category,
  options: [...],           // string[] (legacy) or object[] (rich)
  displayAs: "radio"|"select"|"checkbox",  // how rich options render
  visibility: { fieldId, op, value },       // conditional visibility
  dietaryOptions: [...],    // for "dietary" type
  linkedToPricing: bool,    // for pricing integration
}
```

**Rich Options** (object-based, used in Catering step):
```
{
  label, price, enablePrice,
  hasSubOptions, subOptions: [
    { label, price, enablePrice, hasSelections, selections: [
      { label, price }
    ]}
  ]
}
```

Detection: `(f.options || []).some(o => typeof o === "object")` — if any option is an object, use `RichOptionsEditor`; otherwise use legacy `OptionsEditor`.

**Rich Value Objects** (stored in form state for radio-displayed selects):
```
{ main: "Yes, please provide me catering options for", subs: { Lunch: true, Dinner: true } }
```

The visibility engine extracts `v.main` from these when checking conditions.

### Three Preview Renderers
Every field type must be implemented in three places:
1. **PreviewField** (in Collaburo-App.html) — sidebar preview panel
2. **CVField** (in Collaburo-App.html) — fullscreen client preview
3. **DynField** (in Client-View.html) — actual client-facing form

### Venues (Step 3)
Rich data model with `SAMPLE_VENUES` containing: pricing tiers, booking hours per day, sub-spaces with options, gallery images, capacity, suitable event types, equipped-with lists, and advanced pricing (setup/cleanup fees, deposits, cancellation policy).

### Layouts (Step 4)
`SAMPLE_LAYOUTS` keyed by venue ID, containing: space requirements (with icons), floor layout plans (filterable by event type and space requirements, with capacity ranges).

---

## The 9 Workflow Steps

| # | Step ID | Name | Status | Notes |
|---|---------|------|--------|-------|
| 1 | s1 | Personal Details | DONE | Standard form fields (name, email, phone, etc.) |
| 2 | s2 | Event Details | DONE | Includes `radio` and `groupselect` custom types |
| 3 | s3 | Venue Space | DONE | Custom VenueEditor admin + venue cards preview, sub-spaces, pricing, booking hours, date blocking |
| 4 | s4 | Layout | DONE | Custom LayoutEditor admin + floor plan preview, space requirements, capacity filtering |
| 5 | s5 | Rentals | DONE (basic) | Uses `addons` type. Full rentals section (sidebar nav) not yet built |
| 6 | s6 | Catering | DONE | Rich options with sub-options, prices, selections. New types: `time`, `checkbox`, `dietary`. Conditional visibility. Recommended button with presets. |
| 7 | s7 | Additional Services | DATA EXISTS | Fields defined in SAMPLE_STEPS but no wireframe-matching polish yet |
| 8 | s8 | Additional Info | DATA EXISTS | Fields defined in SAMPLE_STEPS but no wireframe-matching polish yet |
| 9 | s9 | Submit Request | DATA EXISTS | Fields defined in SAMPLE_STEPS but no wireframe-matching polish yet |

---

## Field Types

```
text, textarea, number, select, multiselect, date, daterange, file, price, toggle,
radio, groupselect, time, checkbox, dietary, room, addons, separator, instructional
```

Special types:
- **radio** — options with inline descriptions (used in Event Details)
- **groupselect** — grouped dropdown with category headers
- **time** — time-of-day picker (HH:MM AM/PM)
- **checkbox** — toggle with options, supports `displayAs: "radio"|"select"`
- **dietary** — preset dietary restriction checkbox list
- **room** — visual venue card selector (Step 3)
- **addons** — image cards with pricing (Step 5 Rentals)
- **separator** — visual divider line (display-only)
- **instructional** — display-only text block

---

## Key Components (Collaburo-App.html)

### Admin Side
- **`useReorderable` hook** — HTML5 drag-and-drop with position-aware indicators (above/below)
- **`FieldCard`** — collapsible field editor card with drag handle
- **`FieldEditor`** — the main step editor panel (field list + add/recommended buttons)
- **`RichOptionsEditor`** — nested option editor for rich options (sub-options, prices, selections)
- **`DietaryEditor`** — admin editor for dietary restriction presets
- **`OptionsEditor`** — legacy simple string-based options editor
- **`VenueEditor`** — full venue management (pricing, booking hours, sub-spaces, gallery)
- **`LayoutEditor`** — floor plans, space requirements, capacity management
- **`RecommendedFieldsModal`** — pre-populated field presets per step name
- **`STEP_PRESETS`** — object mapping step names to preset field arrays

### Preview Side
- **`PreviewField`** — sidebar preview renderer
- **`CVField`** — fullscreen preview renderer (interactive, stateful)
- **`ClientPreview`** — fullscreen preview shell with step navigation + cost sidebar

### Visibility System
- `isFieldVisible(field, allFields, values)` — checks `field.visibility` rules
- Supports `fieldId` references, `contains` operator
- Handles rich value objects by extracting `.main`

---

## CSS / Design System

- CSS variables for theming (`--accent`, `--surface-2`, `--line-strong`, etc.)
- Dark sidebar + light content area
- Position-aware drag indicators with animated line + dot (`.is-drop-above`, `.is-drop-below`)
- Red asterisk for required fields, orange checkbox for admin-required
- 2-column layout for preview fields
- Cards, modals, toast notifications all custom-styled

---

## What's Next (Planned Work Queue)

### Immediate
1. **Steps 7–9** (Additional Services, Additional Info, Submit Request) — need wireframe screenshots to match, then build out matching admin editors and preview renderers if needed
2. **Rentals section** — complex, spans Steps 4–5, uses the "Rentals" sidebar section. Needs dedicated admin UI for managing rental items with images and prices.

### Known Patterns for Adding New Steps
When building a new step from wireframes:
1. Add/update field data in `SAMPLE_STEPS`
2. If the step needs a custom editor (like Venue or Layout), build a dedicated editor component
3. Implement rendering in all three preview renderers: `PreviewField`, `CVField`, `DynField`
4. Update `STEP_PRESETS` for the Recommended button
5. Update `addMultipleFields` if new field properties are needed
6. Bump localStorage version keys if data model changes significantly
7. Test in both Collaburo-App.html and Client-View.html

### Sidebar Nav Sections (not yet built)
- **Rentals** (count: 42) — rental item management
- **Pricing Rules** (count: 12) — pricing configuration
- **Site Settings** — general settings
- **Clients** (count: 186) — client management
- **Calendar** — booking calendar
- **Reports** — analytics/reports

---

## File Locations

```
/Users/geianmarkdenorte/Downloads/Collaburo/Mock UI/
├── Collaburo-App.html    ← Admin view (~7,400+ lines)
├── Client-View.html      ← Client view (~2,000+ lines)
├── Admin View.html       ← Old version (not actively used)
└── PROJECT-CONTEXT.md    ← This file
```

---

## Tips for Continuing

- Always read the relevant section of the file before editing — line numbers shift frequently with edits
- When adding a new field type, remember to implement it in **three renderers** across **two files**
- The `type="text/babel"` scripts are transpiled at runtime — syntax errors won't show until the page loads
- Use `Grep` to find component definitions: `function ComponentName`
- Rich options vs legacy options: check `typeof option === "object"` to determine which path to take
- The Recommended button visibility is driven by `!!STEP_PRESETS[step.name]` — add a preset entry to enable it for any step
