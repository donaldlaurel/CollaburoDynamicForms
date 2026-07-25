export const sideNav = [
  { id: "workflow", label: "Workflow Steps", icon: "Layers", count: "9", href: "/admin/workflow" },
  { id: "rentals", label: "Rentals", icon: "Tag", count: "59", href: "/admin/rentals" },
  { id: "pricing", label: "Pricing Rules", icon: "Dollar", count: "12", href: "/admin/pricing" },
  { id: "site", label: "Site Settings", icon: "Settings", href: "/admin/site" },
];

export const sideNavBottom = [
  { id: "clients", label: "Rentals Progress List", icon: "Users", count: "4", href: "/admin/clients" },
  { id: "email-settings", label: "Email Settings", icon: "Mail", href: "/admin/email-settings" },
  { id: "calendar", label: "Calendar", icon: "Cal", href: "/admin/calendar" },
  { id: "reports", label: "Reports", icon: "Chart", href: "/admin/reports" },
];

export const profileSection = { id: "profile", label: "Admin Profile", icon: "Users", href: "/admin/profile" };
export const allSections = [...sideNav, ...sideNavBottom, profileSection];
export const allSectionIds = allSections.map((item) => item.id);

export const sectionLabel = {
  workflow: "Client Intake Form",
  rentals: "Rentals Catalog",
  pricing: "Pricing Rules",
  site: "Site Settings",
  clients: "Rentals Progress List",
  "email-settings": "Email Settings",
  calendar: "Booking Calendar",
  reports: "Reports",
  profile: "Admin Profile",
};

export const sectionParent = {
  workflow: "Workflow Steps",
  rentals: "Catalog",
  pricing: "Pricing",
  site: "Settings",
  clients: "Progress",
  "email-settings": "Progress",
  calendar: "Operations",
  reports: "Operations",
  profile: "Admin",
};

export const sectionStubs = {
  calendar: { icon: "Cal", title: "Booking calendar", blurb: "Month, week, and day grid of confirmed bookings, holds, and tour appointments across all rooms." },
  reports: { icon: "Chart", title: "Reports", blurb: "Revenue by room, conversion from inquiry to booking, top-grossing add-ons, and lead source attribution." },
};
