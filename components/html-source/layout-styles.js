/** Layout style filter cards (Round / Rectangular / Theater / … / Others). */

export const LAYOUT_STYLE_ORDER = [
  "circular",
  "rectangular",
  "rectangular_open",
  "theatre",
  "conference",
  "classroom",
  "cocktail",
  "bazaar",
  "ceremony",
  "others",
];

export const LAYOUT_STYLE_LABELS = {
  circular: "Round",
  rectangular: "Rectangular",
  rectangular_open: "Open Banquet",
  theatre: "Theater",
  conference: "Conference",
  classroom: "Classroom",
  cocktail: "Cocktail",
  bazaar: "Bazaar",
  ceremony: "Ceremony",
  others: "Others",
};

export const LAYOUT_STYLE_HEADINGS = {
  circular: "Round Tables",
  rectangular: "Rectangular Tables",
  rectangular_open: "Open Banquet",
  theatre: "Theater",
  conference: "Conference",
  classroom: "Classroom",
  cocktail: "Cocktail",
  bazaar: "Bazaar",
  ceremony: "Ceremony",
  others: "Others",
};

export const LAYOUT_STYLE_BLURBS = {
  circular: "3 tables · 8 chairs per table",
  rectangular: "3 tables · 10 chairs per table",
  rectangular_open: "Open banquet seating",
  theatre: "Rows of chairs facing the stage",
  conference: "4 tables in a square · outer seating",
  classroom: "Rows of tables facing forward",
  cocktail: "Standing cocktail tables",
  bazaar: "Market / vendor style layout",
  ceremony: "Ceremony seating rows",
  others: "Custom furniture arrangement",
};

export const LAYOUT_STYLE_CARD_SRC = {
  circular: "/images/layout_styles/card_circular.svg",
  rectangular: "/images/layout_styles/card_rectangular.svg",
  rectangular_open: "/images/layout_styles/rectangular_open.svg",
  theatre: "/images/layout_styles/card_theatre.svg",
  conference: "/images/layout_styles/card_conference.svg",
  classroom: "/images/layout_styles/classroom.svg",
  cocktail: "/images/layout_styles/cocktail.svg",
  bazaar: "/images/layout_styles/bazaar.svg",
  ceremony: "/images/layout_styles/ceremony.svg",
  others: "/images/layout_styles/card_others.svg",
};

const STYLE_FROM_PRESET = [
  [/circular|round/, "circular"],
  [/rectangular_open|open.?banquet/, "rectangular_open"],
  [/rectangular|rect\b/, "rectangular"],
  [/theatre|theater/, "theatre"],
  [/conference/, "conference"],
  [/classroom/, "classroom"],
  [/cocktail/, "cocktail"],
  [/bazaar|market/, "bazaar"],
  [/ceremony/, "ceremony"],
];

/** Infer style key from layoutStyle, old-site preset id, category, or name. */
export function inferLayoutStyle(layout = {}) {
  const explicit = String(layout.layoutStyle || "").trim().toLowerCase();
  if (explicit && (LAYOUT_STYLE_LABELS[explicit] || explicit === "others")) return explicit;
  const blob = [
    layout.oldSitePresetId,
    layout.category,
    layout.name,
  ].map((part) => String(part || "").toLowerCase()).join(" ");
  for (const [re, style] of STYLE_FROM_PRESET) {
    if (re.test(blob)) return style;
  }
  return "";
}

export function layoutStyleLabel(style) {
  return LAYOUT_STYLE_LABELS[style] || String(style || "");
}

export function isOthersLayoutStyle(style) {
  return String(style || "").toLowerCase() === "others";
}

/** Styles that have at least one matching floor plan for this area (Others always included). */
export function visibleLayoutStyles(layouts = []) {
  const present = new Set();
  (layouts || []).forEach((layout) => {
    const style = inferLayoutStyle(layout);
    if (style) present.add(style);
  });
  const keys = LAYOUT_STYLE_ORDER.filter((style) => style === "others" || present.has(style));
  if (!keys.includes("others")) keys.push("others");
  return keys;
}

export function layoutsForStyle(layouts = [], style) {
  if (isOthersLayoutStyle(style)) return [];
  return (layouts || []).filter((layout) => inferLayoutStyle(layout) === style);
}

export const EVENTPOLICY_INSURANCE = {
  enabled: true,
  taxLabel: "GST",
  taxRate: 8,
  attendeeLimits: [50, 100],
  groups: [
    {
      id: "ins_wedding_tier",
      name: "Weddings, parties & ceremonies",
      eventTypes: ["Social Event with dancing / Party", "Ceremony / Graduation", "Wedding & Reception"],
      rates: { "0_no": 25, "0_yes": 72.5, "1_no": 35, "1_yes": 72.5, "2_no": 60, "2_yes": 126.56 },
    },
    {
      id: "ins_standard_social",
      name: "Standard social events",
      eventTypes: ["Other - Social and/or alcoholic events", "Social Event without dancing / Banquet", "Memorial / End of Life Celebration", "Lecture / Theater / Movie", "Reception / Cocktail Party"],
      rates: { "0_no": 25, "0_yes": 72.5, "1_no": 35, "1_yes": 72.5, "2_no": 60, "2_yes": 126.56 },
    },
    {
      id: "ins_business",
      name: "Business events",
      eventTypes: ["Business / Board Meeting", "Conference", "Workshop / Training"],
      rates: { "0_no": 0, "0_yes": 72.5, "1_no": 0, "1_yes": 72.5, "2_no": 0, "2_yes": 126.56 },
    },
    {
      id: "ins_other_business",
      name: "Other business, festivals & markets",
      eventTypes: ["Other - Business and non-alcoholic events", "Festival / Market / Show"],
      rates: { "0_no": 0, "0_yes": 72.5, "1_no": 0, "1_yes": 72.5, "2_no": 0, "2_yes": 126.56 },
    },
  ],
};

export const DATE_OF_EVENT_FIELD_ID = "f_date_of_event";
export const DATE_NOT_DECIDED_FIELD_ID = "f_date_not_decided";
export const APPROX_EVENT_WHEN_FIELD_ID = "f_approx_event_when";

export function dateOfEventSeedFields() {
  return [
    {
      id: DATE_OF_EVENT_FIELD_ID,
      label: "Date of Event",
      type: "date",
      required: true,
      visibleToClient: true,
      category: "Event",
      rules: [
        {
          id: "rule_date_of_event_optional",
          action: "optional",
          match: "all",
          conditions: [{ fieldId: DATE_NOT_DECIDED_FIELD_ID, field: "Date still not decided", op: "is_true", value: "true" }],
        },
        {
          id: "rule_date_of_event_disable",
          action: "disable",
          match: "all",
          clearValue: true,
          conditions: [{ fieldId: DATE_NOT_DECIDED_FIELD_ID, field: "Date still not decided", op: "is_true", value: "true" }],
        },
      ],
    },
    {
      id: DATE_NOT_DECIDED_FIELD_ID,
      label: "Date still not decided",
      type: "toggle",
      required: false,
      visibleToClient: true,
      category: "Event",
    },
    {
      id: APPROX_EVENT_WHEN_FIELD_ID,
      label: "Approx when is the event?",
      type: "text",
      required: false,
      placeholder: "e.g. late spring, weekend in June",
      visibleToClient: true,
      category: "Event",
      rules: [
        {
          id: "rule_approx_event_show",
          action: "show",
          match: "all",
          clearValue: true,
          conditions: [{ fieldId: DATE_NOT_DECIDED_FIELD_ID, field: "Date still not decided", op: "is_true", value: "true" }],
        },
        {
          id: "rule_approx_event_require",
          action: "require",
          match: "all",
          conditions: [{ fieldId: DATE_NOT_DECIDED_FIELD_ID, field: "Date still not decided", op: "is_true", value: "true" }],
        },
      ],
    },
  ];
}

/** First venue booking start date across selected venues. */
export function firstVenueStartDate(answers = {}) {
  const bookings = answers._venueBookings || {};
  const ids = Array.isArray(answers._selectedVenueIds)
    ? answers._selectedVenueIds
    : answers._selectedVenueId
    ? [answers._selectedVenueId]
    : Object.keys(bookings);
  for (const id of ids) {
    const start = bookings[id]?.startDate;
    if (start) return String(start);
  }
  for (const booking of Object.values(bookings)) {
    if (booking?.startDate) return String(booking.startDate);
  }
  return "";
}

export function resolveEventDateDisplay(record = {}, answers = {}) {
  const fromAnswers = answers[DATE_OF_EVENT_FIELD_ID] || record.answers?.[DATE_OF_EVENT_FIELD_ID];
  if (fromAnswers) return String(fromAnswers);
  if (record.answers?.[DATE_NOT_DECIDED_FIELD_ID] || answers[DATE_NOT_DECIDED_FIELD_ID]) {
    const approx = answers[APPROX_EVENT_WHEN_FIELD_ID] || record.answers?.[APPROX_EVENT_WHEN_FIELD_ID] || "";
    return approx ? `Approx: ${approx}` : "Date still not decided";
  }
  const venueStart = firstVenueStartDate(answers._venueBookings ? answers : (record.answers || {}));
  if (venueStart) return venueStart;
  const bookingText = String(record.request?.bookingDateTime || "");
  const match = bookingText.match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
}
