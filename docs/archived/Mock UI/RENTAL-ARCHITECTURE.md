# Collaburo Rental Architecture

## Source of truth during migration

Until the old rental data is migrated, the legacy PHP flow remains the behavioral source of truth:

- `createevent.php?id=1240`
- `js/space.js`
- `js/collaburo_price_slots.js`
- `js/apply_recommended_tables.js`
- `js/total_space_rental.js`

The old flow should not be mirrored structurally. It mixes markup, price constants, DOM IDs, string parsing, hidden fields, and imperative show/hide behavior. The new model should preserve pricing outcomes while replacing the structure with normalized catalog data and declarative rules.

## Core model

Use catalog items with attached pricing, quantity, option, condition, and package metadata.

```js
{
  id,
  name,
  category,
  legacyKey,
  pricingModel,
  unitPrice,
  quantitySource,
  optionGroups,
  packageBehavior,
  migrationNotes
}
```

Pricing models:

- `flat_per_item`
- `flat_fee`
- `per_hour`
- `per_person`
- `per_person_per_hour`
- `package_fixed`
- `included`
- `quote`

Quantity sources:

- `own`
- `parent`
- `guest_count`
- `layout_recommendation`
- `fixed`
- `custom_override`

## First implemented legacy mappings

- Rectangular 6' Table: table quantity from Step 4 recommendations, conditional linens, linen color, and independent spandex quantities.
- Dinner Plate 10.5" Circular: parent dinnerware quantity with per-option override support.
- AV Deluxe Package: editable preset with included AV items and paid upgrades.
- IT Tech Labor and Helper Labor: per-hour pricing.

## Step 4 to Step 5 contract

Step 4 should emit structured layout recommendations instead of text to parse:

```js
{
  layoutId,
  includedItems: [{ itemId: "rt_rect6", quantity: 8 }],
  recommendedAddOns: [{ itemId: "rt_rect6", optionGroupId: "rect6_linens", quantitySource: "parent" }]
}
```

Step 5 consumes those as defaults. The client can accept, edit, or remove them.

## Migration rules

1. Extract all `space_*` constants from `space.js`.
2. Extract all `data-price-key` values from the PHP page.
3. Map legacy control names to canonical item, option, and variant IDs.
4. Preserve legacy IDs in `legacyKey` / migration metadata.
5. Mark ambiguous rows as `needs_review`.
6. Add parity fixtures for old scenarios before importing everything.

