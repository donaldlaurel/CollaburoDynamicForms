const SIDE_NAV = [
  { id: "workflow", label: "Workflow Steps", icon: "Layers", countKey: "workflow" },
  { id: "rentals",  label: "Rentals",        icon: "Tag",    countKey: "rentals" },
  { id: "pricing",  label: "Pricing Rules",  icon: "Dollar", countKey: "pricing" },
  { id: "email-settings", label: "Email Settings", icon: "Mail" },
  { id: "contract", label: "Contract", icon: "File" },
  { id: "site",     label: "Site Settings",  icon: "Settings" },
];

const SIDE_NAV_BOTTOM = [
  { id: "clients",  label: "Rentals Progress List", icon: "Users", countKey: "clients" },
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
  contract: "Contract",
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
  contract: "Settings",
  calendar: "Operations",
  reports: "Operations",
};

export { SIDE_NAV, SIDE_NAV_BOTTOM, SECTION_LABEL, SECTION_PARENT };
