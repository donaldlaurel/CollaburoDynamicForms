// Placeholder views for sections that aren't built yet (admin is page 1 of 4).

function StubView({ icon, title, blurb, status = "Coming next" }) {
  const Ic = window.Icons;
  const IconCmp = window.Icons[icon] || Ic.Layers;
  return (
    <div className="stub">
      <div className="stub-card">
        <div className="ill"><IconCmp size={28} /></div>
        <div className="stub-meta">{status}</div>
        <h2>{title}</h2>
        <p>{blurb}</p>
        <button className="btn primary sm">
          <Ic.Plus size={12} /> Request this view
        </button>
      </div>
    </div>
  );
}

const SECTION_STUBS = {
  rentals: {
    icon: "Tag",
    title: "Rentals catalog",
    blurb: "Manage chairs, linens, AV kits, and other rental items with images, pricing, and stock. Fields tagged 'Linked to pricing' in the Workflow will pull from this catalog.",
  },
  pricing: {
    icon: "Dollar",
    title: "Pricing rules",
    blurb: "Define base hourly rates per room, surcharges, and conditional discounts (non-profit, student body, off-peak). The client-facing quote calculator runs on top of this.",
  },
  site: {
    icon: "Settings",
    title: "Site settings",
    blurb: "Brand colors, logo, contact email, terms & conditions, and integrations with your calendar and payment processor.",
  },
  clients: {
    icon: "Users",
    title: "Clients (page 3)",
    blurb: "A searchable, filterable table of every client who has filled out the form. We'll build this after you sign off on the admin and client views.",
    status: "Page 3 of 4",
  },
  calendar: {
    icon: "Cal",
    title: "Booking calendar",
    blurb: "Month / week / day grid of confirmed bookings, holds, and tour appointments across all four rooms.",
  },
  reports: {
    icon: "Chart",
    title: "Reports",
    blurb: "Revenue by room, conversion from inquiry to booking, top-grossing add-ons, lead source attribution.",
  },
};

window.StubView = StubView;
window.SECTION_STUBS = SECTION_STUBS;
