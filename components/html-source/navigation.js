const SIDE_NAV = [
  { id: "workflow", label: "Workflow Steps", icon: "Layers", count: "9" },
  { id: "rentals",  label: "Rentals",        icon: "Tag",    count: "59" },
  { id: "pricing",  label: "Pricing Rules",  icon: "Dollar", count: "12" },
  { id: "email-settings", label: "Email Settings", icon: "Mail" },
  { id: "site",     label: "Site Settings",  icon: "Settings" },
];

const SIDE_NAV_BOTTOM = [
  { id: "clients",  label: "Rentals Progress List", icon: "Users", count: "4" },
  { id: "calendar", label: "Calendar",       icon: "Cal" },
  { id: "reports",  label: "Reports",        icon: "Chart" },
];

const SECTION_LABEL = {
  workflow: "Client Intake Form",
  rentals: "Rentals Catalog",
  pricing: "Pricing Rules",
  site: "Site Settings",
  clients: "Rentals Progress List",
  "email-settings": "Email Settings",
  calendar: "Booking Calendar",
  reports: "Reports",
};

const SECTION_PARENT = {
  workflow: "Workflow Steps",
  rentals: "Catalog",
  pricing: "Pricing",
  site: "Settings",
  clients: "Progress",
  "email-settings": "Settings",
  calendar: "Operations",
  reports: "Operations",
};

export { SIDE_NAV, SIDE_NAV_BOTTOM, SECTION_LABEL, SECTION_PARENT };
