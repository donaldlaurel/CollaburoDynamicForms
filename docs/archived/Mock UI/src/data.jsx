// Sample data — Collaburo admin workflow steps + fields.
// Field types align with what the user selected:
// text, textarea, number, select, multiselect, date, daterange, file, price, toggle, room, addons

const SAMPLE_STEPS = [
  {
    id: "s1",
    name: "Personal Details",
    description: "Who is booking the event? We use this to follow up and put a name on the calendar.",
    icon: "Users",
    fields: [
      { id: "f1", label: "First Name", type: "text", required: true, adminRequired: false,
        placeholder: "Enter first name", helpText: "", visibleToClient: true,
        internalNote: "", linkedToPricing: false, category: "Contact" },
      { id: "f2", label: "Last Name", type: "text", required: true, adminRequired: false,
        placeholder: "Enter last name", visibleToClient: true, category: "Contact" },
      { id: "f3", label: "Organization", type: "text", required: false, adminRequired: false,
        placeholder: "Company or group name", helpText: "If you're booking on behalf of a business or organization.",
        visibleToClient: true, category: "Contact" },
      { id: "f4", label: "Email", type: "text", required: true, adminRequired: false,
        placeholder: "you@example.com", visibleToClient: true, category: "Contact" },
      { id: "f5", label: "Phone Number", type: "number", required: true, adminRequired: false,
        placeholder: "+1 (___) ___-____", visibleToClient: true, category: "Contact" },
      { id: "f6", label: "Not for profit (only check this if you are a registered non-profit)",
        type: "toggle", required: false, adminRequired: false,
        helpText: "501(c)(3) organizations qualify for a 15% discount on hall rentals.",
        visibleToClient: true, linkedToPricing: true, category: "Discount" },
      { id: "f7", label: "Student Body Discount", type: "toggle", required: false, adminRequired: true,
        visibleToClient: true, linkedToPricing: true, category: "Discount",
        visibility: { field: "Organization", op: "has_value" } },
    ],
  },
  {
    id: "s2",
    name: "Event Details",
    description: "Tell us about your event so we can match it to the right space.",
    icon: "Cal",
    fields: [
      { id: "f10", label: "Event Name", type: "text", required: true, placeholder: "e.g. Maria & Daniel's Wedding", visibleToClient: true, category: "Event" },
      { id: "f11", label: "Event Type", type: "select", required: true, visibleToClient: true,
        placeholder: "Select an event type",
        options: ["Wedding", "Birthday", "Corporate", "Conference", "Workshop", "Photoshoot", "Other"],
        category: "Event" },
      { id: "f12", label: "Expected Guest Count", type: "number", required: true,
        placeholder: "0", helpText: "Used to filter venues by capacity.", visibleToClient: true, category: "Event" },
      { id: "f13", label: "Event Date", type: "daterange", required: true, visibleToClient: true, category: "Event" },
      { id: "f14", label: "Setup notes", type: "textarea", required: false, visibleToClient: true,
        placeholder: "Anything we should know upfront — VIPs, accessibility, surprises…",
        category: "Event" },
    ],
  },
  {
    id: "s3",
    name: "Venue Space",
    description: "Pick the room or rooms that fit your event.",
    icon: "Building",
    fields: [
      { id: "f20", label: "Primary Space", type: "room", required: true, visibleToClient: true,
        linkedToPricing: true, category: "Venue" },
      { id: "f21", label: "Add Outdoor Patio", type: "toggle", required: false, visibleToClient: true,
        linkedToPricing: true, helpText: "Patio is only available paired with Large Room.",
        visibility: { field: "Primary Space", op: "equals", value: "Large Room" }, category: "Venue" },
    ],
  },
  { id: "s4", name: "Layout", description: "Choose how the room will be arranged.", icon: "Layers",
    fields: [
      { id: "f30", label: "Seating Layout", type: "select", required: true, visibleToClient: true,
        options: ["Theater", "Banquet rounds", "Classroom", "U-shape", "Cocktail (standing)"], category: "Layout" },
      { id: "f31", label: "Floor plan upload", type: "file", required: false, visibleToClient: true,
        helpText: "Optional — upload a sketch or vendor floor plan.", category: "Layout" },
    ],
  },
  { id: "s5", name: "Rentals", description: "Tables, linens, chairs, AV…", icon: "Tag",
    fields: [
      { id: "f40", label: "Rental Items", type: "addons", required: false, visibleToClient: true,
        linkedToPricing: true, category: "Rentals" },
    ],
  },
  { id: "s6", name: "Catering", description: "Food & drink coming through the venue.", icon: "Tag",
    fields: [
      { id: "f50", label: "Bringing outside catering?", type: "toggle", required: true, visibleToClient: true, category: "Catering" },
      { id: "f51", label: "Bar service", type: "select", required: false, visibleToClient: true,
        options: ["None", "Beer & wine", "Full bar", "BYOB (licensed bartender required)"], category: "Catering" },
    ],
  },
  { id: "s7", name: "Additional Services", description: "Third-party vendors and extras.", icon: "Cards",
    fields: [
      { id: "f60", label: "Vendor add-ons", type: "addons", required: false, visibleToClient: true,
        helpText: "Florists, DJs, photographers — managed outside the platform.", category: "Vendors" },
    ],
  },
  { id: "s8", name: "Additional Info", description: "Anything else we should know.", icon: "File",
    fields: [
      { id: "f70", label: "Special requests", type: "textarea", required: false, visibleToClient: true, category: "Notes" },
      { id: "f71", label: "Heard about us from", type: "select", required: false, visibleToClient: true,
        options: ["Instagram", "Google", "Referral", "Past client", "Other"], category: "Marketing" },
    ],
  },
  { id: "s9", name: "Submit Request", description: "Review and send the booking request to our team.", icon: "Publish",
    fields: [
      { id: "f80", label: "I agree to the booking terms", type: "toggle", required: true, visibleToClient: true, category: "Legal" },
    ],
  },
];

const FIELD_TYPES = [
  { type: "text",       label: "Short text",      desc: "Single-line input",     icon: "Type" },
  { type: "textarea",   label: "Long text",       desc: "Multi-line text area",  icon: "List" },
  { type: "number",     label: "Number",          desc: "Quantity or count",     icon: "Hash" },
  { type: "select",     label: "Dropdown",        desc: "Single select from list", icon: "Chevron" },
  { type: "multiselect",label: "Multi-select",    desc: "Checkboxes / multi pick", icon: "CheckSq" },
  { type: "date",       label: "Date & time",     desc: "Single moment",         icon: "Clock" },
  { type: "daterange",  label: "Date range",      desc: "Start to end",          icon: "Cal" },
  { type: "file",       label: "File upload",     desc: "Image or document",     icon: "File" },
  { type: "price",      label: "Price",           desc: "Currency value",        icon: "Dollar" },
  { type: "toggle",     label: "Toggle",          desc: "Yes / no switch",       icon: "Toggle" },
  { type: "room",       label: "Room selector",   desc: "Visual venue picker",   icon: "Building" },
  { type: "addons",     label: "Add-on cards",    desc: "Image cards with price", icon: "Cards" },
];

const SIDE_NAV = [
  { id: "workflow", label: "Workflow Steps", icon: "Layers", count: "9" },
  { id: "rentals",  label: "Rentals",        icon: "Tag",    count: "42" },
  { id: "pricing",  label: "Pricing Rules",  icon: "Dollar", count: "12" },
  { id: "site",     label: "Site Settings",  icon: "Settings" },
];

const SIDE_NAV_BOTTOM = [
  { id: "clients",  label: "Clients",        icon: "Users",   count: "186" },
  { id: "calendar", label: "Calendar",       icon: "Cal" },
  { id: "reports",  label: "Reports",        icon: "Chart" },
];

const ROOMS = [
  { id: "main",    name: "Main Hall",        capacity: "Up to 250 guests", hourly: "$450/hr", min: "6 hr min" },
  { id: "large",   name: "Large Room",       capacity: "Up to 80 guests",  hourly: "$220/hr", min: "4 hr min" },
  { id: "patio",   name: "Outdoor Patio",    capacity: "Up to 40 guests",  hourly: "$140/hr", min: "Add-on" },
  { id: "small",   name: "Small Meeting Rm", capacity: "Up to 4 guests",   hourly: "$60/hr",  min: "2 hr min" },
];

Object.assign(window, { SAMPLE_STEPS, FIELD_TYPES, SIDE_NAV, SIDE_NAV_BOTTOM, ROOMS });
