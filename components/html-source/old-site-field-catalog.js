// Auto-generated from createevent_field_inventory.html — do not edit by hand.
// Regenerate: python scripts/generate-old-site-field-catalog.py
// Fields: 557 (shared-only counts: {"Personal Details": 8, "Event Details": 5, "Venue Space": 6, "Layout": 10, "Rentals": 0, "Catering": 23, "Additional Services": 2, "Additional Info": 6, "Review & Submit": 2})
export const OLD_SITE_FIELD_CATALOG_VERSION = "2026-09-21";
export const OLD_SITE_FIELD_CATALOG = {
  "Personal Details": [
    {
      "oldSiteName": "clientname",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Personal Details",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": true,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Client First Name",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "email",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Personal Details",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Email",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "Enter email address",
      "category": ""
    },
    {
      "oldSiteName": "lastname",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Personal Details",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Last Name",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "organization",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Personal Details",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Organization",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "phonenumber",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Personal Details",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Phone Number",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "notforprofit",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Personal Details",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Not for profit",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": true,
      "fieldDescription": "(only check this if you are a registered charity or a not-for-profit organization - proof may be requested)",
      "helpText": "",
      "placeholder": "",
      "category": "Discount"
    },
    {
      "oldSiteName": "studentbody",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Personal Details",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Student Body",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": true,
      "fieldDescription": "(only check this if event is fully related to a school or university/college - proof may be requested)",
      "helpText": "",
      "placeholder": "",
      "category": "Discount"
    },
    {
      "oldSiteName": "communityorg",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Personal Details",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Community Organization",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": true,
      "fieldDescription": "(only check this if you are a community group with an established public identity, such as a sports team, community theater, cultural or identity group or a religious gathering that are not a registered Not for Profit Group - proof may be requested)",
      "helpText": "",
      "placeholder": "",
      "category": "Discount"
    }
  ],
  "Event Details": [
    {
      "oldSiteName": "brief_desc_event",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Event Details",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Brief Description of Event",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "noof_attendees",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Event Details",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Expected Number of Attendees",
      "type": "number",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "typeofevent",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Event Details",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Event Type",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "Business / Board Meeting",
          "value": "Business / Board Meeting"
        },
        {
          "label": "Conference",
          "value": "Conference"
        },
        {
          "label": "Workshop / Training",
          "value": "Workshop / Training"
        },
        {
          "label": "Other - Business and non-alcoholic events",
          "value": "Other (B)"
        },
        {
          "label": "Lecture / Theater / Movie",
          "value": "Lecture / Theater / Movie"
        },
        {
          "label": "Social Event with dancing / Party",
          "value": "Social Event with dancing / Party"
        },
        {
          "label": "Social Event without dancing / Banquet",
          "value": "Social Event without dancing / Banquet"
        },
        {
          "label": "Reception / Cocktail Party",
          "value": "Reception / Cocktail Party"
        },
        {
          "label": "Wedding & Reception",
          "value": "Wedding & Reception"
        },
        {
          "label": "Ceremony / Graduation",
          "value": "Ceremony / Graduation"
        },
        {
          "label": "Memorial / End of Life Celebration",
          "value": "Memorial / End of Life Celebration"
        },
        {
          "label": "Festival / Market / Show",
          "value": "Festival / Market / Show"
        },
        {
          "label": "Other - Social and/or alcoholic events",
          "value": "Other"
        }
      ]
    },
    {
      "oldSiteName": "alcoholserved",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Event Details",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Alcohol on Site",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        "Yes|There will be alcohol/liquor/wine served at the party.",
        "No|There will not be any alcohol/liquor/wine served at the party."
      ]
    },
    {
      "oldSiteName": "eventprivacy",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Event Details",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Event Privacy",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        "Public|Events that are advertised publicly, tickets sold/given in advance or at the door.",
        "Semi Private|Invitation list to those mostly known to Client.",
        "Private|Invitation list to those known to Client such as family, friends, coworkers, etc."
      ]
    }
  ],
  "Venue Space": [
    {
      "oldSiteName": "bookingenddate_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Booking End Date",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "bookingstartdate_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Booking Start Date",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "totalspacerental_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Total Space Rental (including set-up, tear-down, and clean-up)",
      "type": "number",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "multipledates_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Other Dates",
      "type": "textarea",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "Please include the start and end times for all dates of your event. The quote provided will only cover the initial booking dates listed above. Any additional dates entered here wil",
      "category": ""
    },
    {
      "oldSiteName": "multipledates_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Multiple Dates",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "bookingenddate_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Booking End Date",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "bookingstartdate_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Booking Start Date",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "totalspacerental_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Total Space Rental (including set-up, tear-down, and clean-up)",
      "type": "number",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "multipledates_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Other Dates",
      "type": "textarea",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "Please include the start and end times for all dates of your event. The quote provided will only cover the initial booking dates listed above. Any additional dates entered here wil",
      "category": ""
    },
    {
      "oldSiteName": "chk_multipledates_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Multiple Dates",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "bookingenddate_la",
      "oldSiteSpace": "Lounge Area",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Booking End Date",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Lounge Area",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "bookingstartdate_la",
      "oldSiteSpace": "Lounge Area",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Booking Start Date",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Lounge Area",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "totalspacerental_la",
      "oldSiteSpace": "Lounge Area",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Total Space Rental (including set-up, tear-down, and clean-up)",
      "type": "number",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Lounge Area",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "bookingenddate_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Booking End Date",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "Please provide",
      "category": ""
    },
    {
      "oldSiteName": "bookingstartdate_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Booking Start Date",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "Please provide",
      "category": ""
    },
    {
      "oldSiteName": "totalspacerental_mh_space1",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "totalspacerental_mh_space1",
      "type": "number",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "multipledates",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Other Dates",
      "type": "textarea",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "Please include the start and end times for all dates of your event. The quote provided will only cover the initial booking dates listed above. Any additional dates entered here wil",
      "category": ""
    },
    {
      "oldSiteName": "chk_multipledates",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Multiple Dates",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "space_elevatedearea",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Optional Extension (Elevated Area)",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "space_mainhall",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Main Hall",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "space_largeroom",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Large Room",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "space_smallroom",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Small Room",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "space_backyardpatio",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Back Patio",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "space_loungearea",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Lounge Area",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "(admin-only toggle)",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "space_elevatedearea",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Elevated Area",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "(appears when Main Hall is selected)",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "bookingenddate_sr",
      "oldSiteSpace": "Small Room",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Booking End Date",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Small Room",
      "placeholder": "Please provide",
      "category": ""
    },
    {
      "oldSiteName": "bookingstartdate_sr",
      "oldSiteSpace": "Small Room",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Booking Start Date",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Small Room",
      "placeholder": "Please provide",
      "category": ""
    },
    {
      "oldSiteName": "totalspacerental_sr",
      "oldSiteSpace": "Small Room",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Total Space Rental (including set-up, tear-down, and clean-up)",
      "type": "number",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Small Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "multipledates_sr",
      "oldSiteSpace": "Small Room",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Other Dates",
      "type": "textarea",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Small Room",
      "placeholder": "Please include the start and end times for all dates of your event. The quote provided will only cover the initial booking dates listed above. Any additional dates entered here wil",
      "category": ""
    },
    {
      "oldSiteName": "chk_multipledates_sr",
      "oldSiteSpace": "Small Room",
      "oldSiteStep": "Venue Space",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Multiple Dates",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Small Room",
      "placeholder": "",
      "category": ""
    }
  ],
  "Layout": [
    {
      "oldSiteName": "layoutinstruction_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Floor Layout Instructions",
      "type": "textarea",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "Please describe your desired floor plan seating arrangement, or setup notes",
      "category": ""
    },
    {
      "oldSiteName": "colorofcocktaillinens_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "colorofcocktaillinens_bp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "1 to 7",
          "value": "1-7"
        }
      ]
    },
    {
      "oldSiteName": "colorofrectangl4linens_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "colorofrectangl4linens_bp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "colorofrectangl6linens_bp_disp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "colorofrectangl6linens_bp_disp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "colorofrectangl6linens_bp_fw",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "colorofrectangl6linens_bp_fw",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "colorofrectangl6linens_bp_hw",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "colorofrectangl6linens_bp_hw",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "colorofrectangl8linens_bp_disp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "colorofrectangl8linens_bp_disp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "colorofrectangl8linens_bp_fw",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "colorofrectangl8linens_bp_fw",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "colorofrectangl8linens_bp_hw",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "colorofrectangl8linens_bp_hw",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "colorofroundlinens_bp_disp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "colorofroundlinens_bp_disp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "colorofroundlinens_bp_fw",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "colorofroundlinens_bp_fw",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "colorofroundlinens_bp_hw",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "colorofroundlinens_bp_hw",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "create_noofseats_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Seats",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "1 to 54",
          "value": "1-54"
        }
      ]
    },
    {
      "oldSiteName": "create_typeofchairs_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_typeofchairs_bp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "1 to 9",
          "value": "1-9"
        }
      ]
    },
    {
      "oldSiteName": "create_typeofchairs_bp__INDEX__",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_typeofchairs_bp__INDEX__",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "1 to 9",
          "value": "1-9"
        }
      ]
    },
    {
      "oldSiteName": "noofacryliccocktailtables_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Acrylic Cocktail Tables",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "noofacrylicseats_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Clear Acrylic Bar Chair",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "0 to 100",
          "value": "0-100"
        }
      ]
    },
    {
      "oldSiteName": "noofblackfoldingseats_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Black Folding Bar Chair",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "0 to 100",
          "value": "0-100"
        }
      ]
    },
    {
      "oldSiteName": "noofcocktailtables_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Cocktail Tables",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "noofrectangl4tables_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Rectangular 4' Tables",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "noofrectangl6tables_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Rectangular 6' Tables",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "noofrectangl8tables_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Rectangular 8' Tables",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "noofroundtables_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Round Tables",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "spandex6tablecovers_black_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Black",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "0 to 4",
          "value": "0-4"
        }
      ]
    },
    {
      "oldSiteName": "spandex6tablecovers_white_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "White",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "0 to 4",
          "value": "0-4"
        }
      ]
    },
    {
      "oldSiteName": "rental_chairs_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_chairs_bp",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "rental_cocktailtable_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_cocktailtable_bp",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "rental_rectangular4table_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_rectangular4table_bp",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "rental_rectangular6table_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_rectangular6table_bp",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "rental_rectangular8table_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_rectangular8table_bp",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "rental_roundtable_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_roundtable_bp",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "cocktailtablelinens_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Yes",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Yes",
          "value": "1"
        },
        {
          "label": "No",
          "value": "2"
        }
      ]
    },
    {
      "oldSiteName": "create_bp_floor_layout",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_bp_floor_layout",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Others",
          "value": "Others"
        }
      ]
    },
    {
      "oldSiteName": "rdbtn_rectangl6tablelinens_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "No Linens required",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "No Linens required",
          "value": "1"
        },
        {
          "label": "Half-way to floor",
          "value": "2"
        },
        {
          "label": "Full-way to floor",
          "value": "3"
        },
        {
          "label": "Disposable Table Covers",
          "value": "4"
        }
      ]
    },
    {
      "oldSiteName": "floorplanfilebp[]",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Floor Layout Plans",
      "type": "file",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "acceptedFiles": "image/*,.pdf",
      "allowMultipleFiles": false
    },
    {
      "oldSiteName": "layoutinstruction_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Floor Layout Instructions",
      "type": "textarea",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "Please describe your desired floor plan seating arrangement, or setup notes",
      "category": ""
    },
    {
      "oldSiteName": "colorofcocktaillinens_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "colorofcocktaillinens_lr",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "White ($ each)",
          "value": "White"
        },
        {
          "label": "Black ($ each)",
          "value": "Black"
        },
        {
          "label": "Ivory ($ each)",
          "value": "Ivory"
        },
        {
          "label": "Other Solid Colour ($ each)",
          "value": "Other"
        },
        {
          "label": "Gold ($ each)",
          "value": "Gold"
        },
        {
          "label": "Silver ($ each)",
          "value": "Silver"
        },
        {
          "label": "Wavy Ivory ($ each)",
          "value": "Wavy_Ivory"
        }
      ]
    },
    {
      "oldSiteName": "colorofrectangl4linens_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "colorofrectangl4linens_lr",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "colorofrectangl5linens_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "colorofrectangl5linens_lr",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Blue",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "create_colorofrectangl6linens_lr_disp",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_colorofrectangl6linens_lr_disp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "create_colorofrectangl6linens_lr_fw",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_colorofrectangl6linens_lr_fw",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "create_colorofrectangl6linens_lr_hw",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_colorofrectangl6linens_lr_hw",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "create_colorofrectangl8linens_lr_disp",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_colorofrectangl8linens_lr_disp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "create_colorofrectangl8linens_lr_fw",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_colorofrectangl8linens_lr_fw",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "create_colorofrectangl8linens_lr_hw",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_colorofrectangl8linens_lr_hw",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "create_colorofroundlinens_lr_disp",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_colorofroundlinens_lr_disp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "create_colorofroundlinens_lr_fw",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_colorofroundlinens_lr_fw",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "create_colorofroundlinens_lr_hw",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_colorofroundlinens_lr_hw",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "create_noofrectangl8tables_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Rectangular 8' Tables",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "create_noofroundtables_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Round Tables",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "create_noofseats_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Seats",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "1 to 40",
          "value": "1-40"
        }
      ]
    },
    {
      "oldSiteName": "create_typeofchairs_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_typeofchairs_lr",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "/each\" Venue chairs - $ /each",
          "value": "Rust chairs - $<?php echo $raw_price["
        },
        {
          "label": "Blue chairs - Free",
          "value": "Blue chairs - Free"
        },
        {
          "label": "/each + delivery\" White Resin Chairs - $ /each",
          "value": "White Seats - $<?php echo $raw_price["
        },
        {
          "label": "Gold Chiavari Chairs - $ /each",
          "value": "Gold Chivalry Chairs - $11/each + delivery"
        },
        {
          "label": "Silver Chiavari Chairs - $ /each",
          "value": "Silver Chivalry Chairs - $11/each + delivery"
        },
        {
          "label": "Clear Chiavari Chairs - $ /each",
          "value": "Clear Chivalry Chairs - $11/each + delivery"
        },
        {
          "label": "selected",
          "value": "Phoenix Chiavari Chair - Crystal"
        },
        {
          "label": "selected",
          "value": "Phoenix Chiavari Chair - Black"
        },
        {
          "label": "selected",
          "value": "Crystal Chiavari Chair"
        }
      ]
    },
    {
      "oldSiteName": "create_typeofchairs_lr__INDEX__",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_typeofchairs_lr__INDEX__",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "/each\">Venue chairs - $ /each",
          "value": "Rust chairs - $<?php echo $raw_price["
        },
        {
          "label": "Blue chairs - Free",
          "value": "Blue chairs - Free"
        },
        {
          "label": "/each + delivery\">White Resin Chairs - $ /each",
          "value": "White Seats - $<?php echo $raw_price["
        },
        {
          "label": "Gold Chiavari Chairs - $ /each",
          "value": "Gold Chivalry Chairs - $11/each + delivery"
        },
        {
          "label": "Silver Chiavari Chairs - $ /each",
          "value": "Silver Chivalry Chairs - $11/each + delivery"
        },
        {
          "label": "Clear Chiavari Chairs - $ /each",
          "value": "Clear Chivalry Chairs - $11/each + delivery"
        },
        {
          "label": "Phoenix Chiavari Chair - Crystal",
          "value": "Phoenix Chiavari Chair - Crystal"
        },
        {
          "label": "Phoenix Chiavari Chair - Black",
          "value": "Phoenix Chiavari Chair - Black"
        },
        {
          "label": "Crystal Chiavari Chair",
          "value": "Crystal Chiavari Chair"
        }
      ]
    },
    {
      "oldSiteName": "lr_rentals_noofacryliccocktailtables",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Acrylic Cocktail Tables",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "noofacrylicseats_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Clear Acrylic Bar Chair",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "0 to 100",
          "value": "0-100"
        }
      ]
    },
    {
      "oldSiteName": "noofblackfoldingseats_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Black Folding Bar Chair",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "0 to 100",
          "value": "0-100"
        }
      ]
    },
    {
      "oldSiteName": "noofcocktailtables_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Cocktail Tables",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "noofrectangl4tables_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Rectangular 4' Tables",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "noofrectangl5tables_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Rectangular 5' Tables",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "noofrectangl6tables_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Rectangular 6' Tables",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "spandex6tablecovers_black_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Black",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "0 to 4",
          "value": "0-4"
        }
      ]
    },
    {
      "oldSiteName": "spandex6tablecovers_white_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "White",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "0 to 4",
          "value": "0-4"
        }
      ]
    },
    {
      "oldSiteName": "rental_chairs_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_chairs_lr",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "rental_cocktailtable_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_cocktailtable_lr",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "rental_rectangular4table_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_rectangular4table_lr",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "rental_rectangular5table_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_rectangular5table_lr",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "rental_rectangular6table_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_rectangular6table_lr",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "rental_rectangular8table_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_rectangular8table_lr",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "rental_roundtable_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_roundtable_lr",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "cocktailtablelinens_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Yes",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Yes",
          "value": "yes"
        },
        {
          "label": "No",
          "value": "no"
        }
      ]
    },
    {
      "oldSiteName": "create_lr_floor_layout",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_lr_floor_layout",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Others",
          "value": "Others"
        }
      ]
    },
    {
      "oldSiteName": "rdbtn_rectangl6tablelinens_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "No linens",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "No linens",
          "value": "1"
        },
        {
          "label": "Half-way to floor",
          "value": "2"
        },
        {
          "label": "Full-way to floor",
          "value": "3"
        },
        {
          "label": "Disposable Table Covers",
          "value": "4"
        }
      ]
    },
    {
      "oldSiteName": "rdbtn_roundtablelinens_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "No linens required",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "No linens required",
          "value": "1"
        },
        {
          "label": "Half-way to floor",
          "value": "2"
        },
        {
          "label": "Full-way to floor",
          "value": "3"
        },
        {
          "label": "Disposable Table Covers",
          "value": "4"
        }
      ]
    },
    {
      "oldSiteName": "floorplanfilelr[]",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Floor Layout Plans",
      "type": "file",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "acceptedFiles": "image/*,.pdf",
      "allowMultipleFiles": false
    },
    {
      "oldSiteName": "buffetlayoutinstruction_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Buffet Layout Instructions and Placement",
      "type": "textarea",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "Please describe your desired floor plan, seating arrangement, or setup notes",
      "category": ""
    },
    {
      "oldSiteName": "layoutinstruction_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Floor Layout Instructions",
      "type": "textarea",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "Please describe your desired floor plan seating arrangement, or setup notes",
      "category": ""
    },
    {
      "oldSiteName": "stagelayoutinstruction_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Stage Layout Instructions",
      "type": "textarea",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "Please describe your desired floor plan, seating arrangement, or setup notes",
      "category": ""
    },
    {
      "oldSiteName": "colorofcocktaillinens_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "colorofcocktaillinens_mh",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "White ($ each)",
          "value": "White"
        },
        {
          "label": "Black ($ each)",
          "value": "Black"
        },
        {
          "label": "Ivory ($ each)",
          "value": "Ivory"
        },
        {
          "label": "Other Solid Colour ($ each)",
          "value": "Other"
        },
        {
          "label": "Gold ($ each)",
          "value": "Gold"
        },
        {
          "label": "Silver ($ each)",
          "value": "Silver"
        },
        {
          "label": "Wavy Ivory ($ each)",
          "value": "Wavy_Ivory"
        }
      ]
    },
    {
      "oldSiteName": "create_colorofrectangl6linens_mh_disp",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_colorofrectangl6linens_mh_disp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "create_colorofrectangl6linens_mh_fw",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_colorofrectangl6linens_mh_fw",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "create_colorofrectangl6linens_mh_hw",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_colorofrectangl6linens_mh_hw",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "create_colorofrectangl8linens_mh_disp",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_colorofrectangl8linens_mh_disp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "create_colorofrectangl8linens_mh_fw",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_colorofrectangl8linens_mh_fw",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "create_colorofrectangl8linens_mh_hw",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_colorofrectangl8linens_mh_hw",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "create_colorofroundlinens_mh_disp",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_colorofroundlinens_mh_disp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "create_colorofroundlinens_mh_fw",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_colorofroundlinens_mh_fw",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "create_colorofroundlinens_mh_hw",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_colorofroundlinens_mh_hw",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Select one",
          "value": ">Select one"
        },
        {
          "label": ">White",
          "value": "1"
        },
        {
          "label": ">Ivory",
          "value": "2"
        },
        {
          "label": ">Other",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "create_noofseats_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Seats",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "1 to 100",
          "value": "1-100"
        }
      ]
    },
    {
      "oldSiteName": "create_typeofchairs_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_typeofchairs_mh",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "Venue chairs - Free",
          "value": "Rust chairs - Free"
        },
        {
          "label": "/each + delivery\" White Resin Chairs - $ /each",
          "value": "White Seats - $<?php echo $raw_price["
        },
        {
          "label": "Gold Chiavari Chairs - $ /each",
          "value": "Gold Chivalry Chairs - $11/each + delivery"
        },
        {
          "label": "Silver Chiavari Chairs - $ /each",
          "value": "Silver Chivalry Chairs - $11/each + delivery"
        },
        {
          "label": "Clear Chiavari Chairs - $ /each",
          "value": "Clear Chivalry Chairs - $11/each + delivery"
        },
        {
          "label": "selected",
          "value": "Phoenix Chiavari Chair - Crystal"
        },
        {
          "label": "selected",
          "value": "Phoenix Chiavari Chair - Black"
        },
        {
          "label": "selected",
          "value": "Crystal Chiavari Chair"
        }
      ]
    },
    {
      "oldSiteName": "create_typeofchairs_mh__INDEX__",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_typeofchairs_mh__INDEX__",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "Venue chairs - Free",
          "value": "Rust chairs - Free"
        },
        {
          "label": "/each + delivery\">White Resin Chairs - $ /each",
          "value": "White Seats - $<?php echo $raw_price["
        },
        {
          "label": "Gold Chiavari Chairs - $ /each",
          "value": "Gold Chivalry Chairs - $11/each + delivery"
        },
        {
          "label": "Silver Chiavari Chairs - $ /each",
          "value": "Silver Chivalry Chairs - $11/each + delivery"
        },
        {
          "label": "Clear Chiavari Chairs - $ /each",
          "value": "Clear Chivalry Chairs - $11/each + delivery"
        },
        {
          "label": "Phoenix Chiavari Chair - Crystal",
          "value": "Phoenix Chiavari Chair - Crystal"
        },
        {
          "label": "Phoenix Chiavari Chair - Black",
          "value": "Phoenix Chiavari Chair - Black"
        },
        {
          "label": "Crystal Chiavari Chair",
          "value": "Crystal Chiavari Chair"
        }
      ]
    },
    {
      "oldSiteName": "mh_rentals_noofacryliccocktailtables",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Acrylic Cocktail Tables",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "noofacrylicseats_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Clear Acrylic Bar Chair",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "0 to 100",
          "value": "0-100"
        }
      ]
    },
    {
      "oldSiteName": "noofblackfoldingseats_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Black Folding Bar Chair",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "0 to 100",
          "value": "0-100"
        }
      ]
    },
    {
      "oldSiteName": "noofcocktailtables_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Cocktail Tables",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "noofrectangl6tables_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Rectangular 6' Tables",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "noofrectangl8tables_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Rectangular 8' Tables",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "noofroundtables_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Round Tables",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "spandex6tablecovers_black_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Black",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "0 to 4",
          "value": "0-4"
        }
      ]
    },
    {
      "oldSiteName": "spandex6tablecovers_white_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "White",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "0 to 4",
          "value": "0-4"
        }
      ]
    },
    {
      "oldSiteName": "rental_chairs_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_chairs_mh",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "rental_cocktailtable_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_cocktailtable_mh",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "rental_rectangular6table_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_rectangular6table_mh",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "rental_rectangular8table_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_rectangular8table_mh",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "rental_roundtable_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_roundtable_mh",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "cocktailtablelinens_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Yes",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Yes",
          "value": "yes"
        },
        {
          "label": "No",
          "value": "no"
        }
      ]
    },
    {
      "oldSiteName": "create_mh_raised_area",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_mh_raised_area",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Others",
          "value": "Others"
        }
      ]
    },
    {
      "oldSiteName": "create_mh_stage_layout",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "create_mh_stage_layout",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Others",
          "value": "Others"
        }
      ]
    },
    {
      "oldSiteName": "floorlayout_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "floorlayout_mh",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Others",
          "value": "Others"
        }
      ]
    },
    {
      "oldSiteName": "rdbtn_rectangl6tablelinens_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "No Linens required",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "No Linens required",
          "value": "1"
        },
        {
          "label": "Half-way to floor",
          "value": "2"
        },
        {
          "label": "Full-way to floor",
          "value": "3"
        },
        {
          "label": "Disposable Table Covers",
          "value": "4"
        }
      ]
    },
    {
      "oldSiteName": "floorplanfilemh[]",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Floor Layout Plans",
      "type": "file",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "acceptedFiles": "image/*,.pdf",
      "allowMultipleFiles": false
    },
    {
      "oldSiteName": "space_buffet_food_table",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Buffet/Food Table",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "space_bar_table",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Bar Table",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "space_dance_area",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Dedicated Dance Area",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "space_photobooth",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Photo Booth Area",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "(photo booth not included)",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "space_dj_table_area",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "DJ Table/Area",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "space_cake_table",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Cake Table",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "space_registration_table",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Welcome/Registration Table",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "space_guestbook_table",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Favours/Guestbook Table",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "space_cleanup_area",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Clean-up Area",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "(used by servers)",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "\"<?=",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Space Requirements",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "layoutinstruction_sr",
      "oldSiteSpace": "Small Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Floor Layout Instructions",
      "type": "textarea",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Small Room",
      "placeholder": "Please describe your desired floor plan seating arrangement, or setup notes",
      "category": ""
    },
    {
      "oldSiteName": "floorlayout_sr",
      "oldSiteSpace": "Small Room",
      "oldSiteStep": "Layout",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Small Room Floor Layout",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Small Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Small Room Floor Layout",
          "value": "Small Room Floor Layout"
        }
      ]
    }
  ],
  "Rentals": [
    {
      "oldSiteName": "total_extra_amount_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Delivery (large quantities of items and/or furniture)",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_kettle_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Kettle",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "addcost_labourtime_helper_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "addcost_labourtime_helper_bp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_chafingdishesv_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_chafingdishesv_bp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_chafingkitsrollupv_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Chafing Dishes Rollup",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_chafingkitsroundv_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Round Chafing Kit",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_cutlerysimple_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_cutlerysimple_bp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "1 to 100",
          "value": "1-100"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_disposablecakeplates_sel_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_disposablecakeplates_sel_bp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "24 to 180",
          "value": "24-180"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_disposableplates_sel_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_disposableplates_sel_bp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "24 to 180",
          "value": "24-180"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_hotwater_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_hotwater_bp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_icetongs_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_icetongs_bp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$x.'",
          "value": "'.$x.'"
        },
        {
          "label": "'.$x.'",
          "value": "'.$x.'"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_napkins_color_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Colour",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Lime Green",
          "value": "Lime Green"
        },
        {
          "label": ">Jade",
          "value": "Jade"
        },
        {
          "label": ">Teal",
          "value": "Teal"
        },
        {
          "label": ">Burnt Orange",
          "value": "Burnt Orange"
        },
        {
          "label": ">Wedgewood Blue",
          "value": "Wedgewood Blue"
        },
        {
          "label": ">Terra Cotta",
          "value": "Terra Cotta"
        },
        {
          "label": ">School Bus Yellow",
          "value": "School Bus Yellow"
        },
        {
          "label": ">Ruby Red",
          "value": "Ruby Red"
        },
        {
          "label": ">Robins Egg Blue",
          "value": "Robins Egg Blue"
        },
        {
          "label": ">Pumpkin",
          "value": "Pumpkin"
        },
        {
          "label": ">Mustard",
          "value": "Mustard"
        },
        {
          "label": ">Mint Green",
          "value": "Mint Green"
        },
        {
          "label": ">Maize",
          "value": "Maize"
        },
        {
          "label": ">Lilac",
          "value": "Lilac"
        },
        {
          "label": ">Kiwi Green",
          "value": "Kiwi Green"
        },
        {
          "label": ">Hunter Green",
          "value": "Hunter Green"
        },
        {
          "label": ">Hot Pink",
          "value": "Hot Pink"
        },
        {
          "label": ">Forest Green",
          "value": "Forest Green"
        },
        {
          "label": ">Coral",
          "value": "Coral"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_platessimple_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_platessimple_bp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "1 to 100",
          "value": "1-100"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_quantity_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Quantity",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">12",
          "value": "12"
        },
        {
          "label": ">24",
          "value": "24"
        },
        {
          "label": ">36",
          "value": "36"
        },
        {
          "label": ">48",
          "value": "48"
        },
        {
          "label": ">60",
          "value": "60"
        },
        {
          "label": ">72",
          "value": "72"
        },
        {
          "label": ">84",
          "value": "84"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_saladspoonv_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_saladspoonv_bp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_servingspoonsv_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_servingspoonsv_bp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_soupwarmers_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_soupwarmers_bp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_sternosfirev_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_sternosfirev_bp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_tongsv_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Tongs",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$x.'",
          "value": "'.$x.'"
        },
        {
          "label": "'.$x.'",
          "value": "'.$x.'"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_waterjugs_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_waterjugs_bp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "inccost_fauxcandles_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "inccost_fauxcandles_bp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "inccost_marker_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "inccost_marker_bp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "+'.$x.'",
          "value": "'.$x.'"
        },
        {
          "label": "+'.$x.'",
          "value": "'.$x.'"
        }
      ]
    },
    {
      "oldSiteName": "noofcenterpieces_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Greenery (Plastic)",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "1 to 14",
          "value": "1-14"
        }
      ]
    },
    {
      "oldSiteName": "noofclearglassvases_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "noofclearglassvases_bp",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "0 to 14",
          "value": "0-14"
        }
      ]
    },
    {
      "oldSiteName": "stemless_glass_sel_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Stemless Glasses - Plastic - 14 oz",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "1 to 50",
          "value": "1-50"
        }
      ]
    },
    {
      "oldSiteName": "addcost_buffet_gazebo_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Buffet Gazebo",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_inflator_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Balloon Inflator",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_labourtime_helper_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Labour Time (Helper)",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_mobiletv_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Mobile TV (45\")",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_patio_heater_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Patio Heater (with propane tank)",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_ptzcamera_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "PTZ camera",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_tarp_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Clear tarp cover to floor on side to protect from wind and rain",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_webconferencecamera_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Web conference Camera",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addonflowers_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Additional flowers - at cost",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "bread_plates_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Bread Plates (6.5\")",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "coffee_mug_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Coffee Mugs",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dessert_plates_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Dessert Plates (7.5\")",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_cakeknife_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Cake Knife Server",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_chafingdishes_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Chafing Dishes",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_cutlery_simple_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Cutlery - Simple (set of 5)",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_disposablecakeplates_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Disposable Cake Plate (7\") with Fork",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_disposablenapkins_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Napkins (Disposable) - price based on pack size",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_disposableplates_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Disposable Dinner Plate (10\") with Fork and Knife",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_forks_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Forks",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_hotwater_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Green Carafe of Hot Water",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_icetongs_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Ice Tongs",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_knives_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Knives",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_napkins_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Napkins (Linens)",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_plates_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Dinnerware Plates (10.5\")",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_plates_simple_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Dinnerware Plates - Simple",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_saladspoon_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Salad Spoons",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_servingspoons_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Serving Spoons",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_soupwarmers_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Crock-Pot 8 Qt",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_spoons_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Spoons",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_sternosfire_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Sternos Fire",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_teaspoons_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Tea Spoons",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_waterjugs_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Water Jugs",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_caketable_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Cake Table",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_dripcoffeemachine_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Drip Coffee Machine",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_extensioncablesfortables_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Extension cables for tables",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_fauxcandles_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Faux Candles",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_flipchartwhiteboardeasel_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Flip chart/whiteboard Easel",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_marker_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Dry-Erase Markers",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_smallpodium_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Podium",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_speaker_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Mobile Speaker",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "multipurpose_glass_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Multi-purpose Glasses - 14 oz",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "rental_dinnerware_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_dinnerware_bp",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "rental_others_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_others_bp",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "saladsoup_bowl_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Salad/Soup Bowl",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "services_delivery_small_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Delivery (small items)",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "space_centerpieces_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "space_centerpieces_bp",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "speciality_glass_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Speciality Glass",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "teacup_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Tea Cups",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "waterwine_glass_bp_ckbx",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Water/Wine Glasses - 14 oz",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_caketable_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "1",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "1",
          "value": "1"
        },
        {
          "label": "2",
          "value": "2"
        }
      ]
    },
    {
      "oldSiteName": "bread_plates_circ_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Circular",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Circular",
          "value": "1"
        },
        {
          "label": "Square",
          "value": "2"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_forks_regu_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Regular",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Regular",
          "value": "1"
        },
        {
          "label": "Gold-edge",
          "value": "2"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_napkins_silver_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Yes",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Yes",
          "value": "1"
        },
        {
          "label": "No",
          "value": "2"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_teacup_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "with no saucer",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "with no saucer",
          "value": "1"
        },
        {
          "label": "with saucer",
          "value": "2"
        }
      ]
    },
    {
      "oldSiteName": "inccost_dripcoffeemachine_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "$ with no coffee",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "$ with no coffee",
          "value": "1"
        },
        {
          "label": "$ with coffee for 30 cups",
          "value": "2"
        }
      ]
    },
    {
      "oldSiteName": "inccost_speaker_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Mobile Speaker only $",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Mobile Speaker only $",
          "value": "1"
        },
        {
          "label": "Mobile Speaker with wireless microphone $",
          "value": "2"
        }
      ]
    },
    {
      "oldSiteName": "ea_phone_booths",
      "oldSiteSpace": "Elevated Area",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Phone Booth",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Elevated Area",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "total_extra_amount_lr_disp",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Delivery (large quantities of items and/or furniture)",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "tech_moredetails_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "More Details",
      "type": "textarea",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_kettle_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Kettle",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "1",
          "value": "1"
        },
        {
          "label": "2",
          "value": "2"
        }
      ]
    },
    {
      "oldSiteName": "addcost_labourtime_helper_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Labour Time (Helper)",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "addcost_labourtime_it_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Labour Time (IT Tech)",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_chafingdishesv_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_chafingdishesv_lr",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "1 to 10",
          "value": "1-10"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_chafingkitsrollupv_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Chafing Dishes Rollup",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_chafingkitsroundv_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Round Chafing Kit",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_cutlerysimple_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_cutlerysimple_lr",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "1 to 100",
          "value": "1-100"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_disposablecakeplates_sel_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_disposablecakeplates_sel_lr",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "24 to 180",
          "value": "24-180"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_disposableplates_sel_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_disposableplates_sel_lr",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "24 to 180",
          "value": "24-180"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_hotwater_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_hotwater_lr",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "\">",
          "value": "\"<?php"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_icetongs_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Ice Tongs",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "\">",
          "value": "\"<?php"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_napkins_color_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Colour",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$napkin_colours[$iter].'",
          "value": "'.$napkin_colours[$iter].'"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_platessimple_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_platessimple_lr",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "1 to 100",
          "value": "1-100"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_quantity_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Quantity",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "12",
          "value": "12"
        },
        {
          "label": "24",
          "value": "24"
        },
        {
          "label": "36",
          "value": "36"
        },
        {
          "label": "48",
          "value": "48"
        },
        {
          "label": "60",
          "value": "60"
        },
        {
          "label": "72",
          "value": "72"
        },
        {
          "label": "84",
          "value": "84"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_saladspoonv_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_saladspoonv_lr",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "1 to 6",
          "value": "1-6"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_servingspoonsv_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_servingspoonsv_lr",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "1 to 6",
          "value": "1-6"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_soupwarmers_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_soupwarmers_lr",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_sternosfirev_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_sternosfirev_lr",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "2 to 20",
          "value": "2-20"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_tongsv_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Tongs",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "2 to 6",
          "value": "2-6"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_waterjugs_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Water Jugs",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "\">",
          "value": "\"<?php"
        }
      ]
    },
    {
      "oldSiteName": "inccost_fauxcandles_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "inccost_fauxcandles_lr",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "1 to 8",
          "value": "1-8"
        }
      ]
    },
    {
      "oldSiteName": "inccost_marker_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Dry-Erase Markers",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "1 to 5",
          "value": "1-5"
        }
      ]
    },
    {
      "oldSiteName": "noofcenterpieces_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Greenery (Plastic)",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "1 to 14",
          "value": "1-14"
        }
      ]
    },
    {
      "oldSiteName": "noofclearglassvases_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "noofclearglassvases_lr",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "0 to 14",
          "value": "0-14"
        }
      ]
    },
    {
      "oldSiteName": "stemless_glass_sel_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Stemless Glasses - Plastic - 14 oz",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "1 to 50",
          "value": "1-50"
        }
      ]
    },
    {
      "oldSiteName": "addcost_conferencephone_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Conference Phone",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_extrawhiteboards_lr-chksh",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Extra Whiteboards",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_inflator_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Balloon Inflator",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_monitor_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Monitor",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_outdoorspeaker_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Mobile Speaker",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_panelpictures_lr-chksh",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Crush Velvet Panel Covers",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_presenterchair_lr-chksh",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Presenter Chairs",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_projectorscreen_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Projector / Projector Screen",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_ptzcamera_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "PTZ camera",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_webconferencecamera_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Web conference Camera",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_wirelessheadsets_lr-chksh",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Wireless Headsets",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_wirelessmics_lr-chksh",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Wireless Mics",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addonflowers_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Additional flowers - at cost",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "bread_plates_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Bread Plates (6.5\")",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "coffee_mug_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Coffee Mugs",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dessert_plates_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Dessert Plates (7.5\")",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_cakeknife_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Cake Knife Server",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_chafingdishes_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Chafing Dishes",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_cutlery_simple_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Cutlery - Simple (set of 5)",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_disposablecakeplates_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Disposable Cake Plate (7\") with Fork",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_disposablenapkins_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Napkins (Disposable) - price based on pack size",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_disposableplates_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Disposable Dinner Plate (10\") with Fork and Knife",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_forks_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Forks",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_hotwater_lr-ckbx",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Green Carafe of Hot Water",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_knives_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Knives",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_napkins_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Napkins (Linens)",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_plates_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Dinnerware Plates (10.5\")",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_plates_simple_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Dinnerware Plates - Simple",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_saladspoon_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Salad Spoons",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_servingspoons_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Serving Spoons",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_soupwarmers_lr-ckbx",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Crock-Pot 8 Qt",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_spoons_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Spoons",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_sternosfire_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Sternos Fire",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_teaspoons_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Tea Spoons",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_caketable_lr-chksh",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Cake Table",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_clicker_lr-chksh",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Powerpoint Presentation Clicker",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_discolights_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Disco Lights",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_dripcoffeemachine_lr-chksh",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Drip Coffee Machine",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_extensioncablesfortables_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Extension cables for tables",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_fauxcandles_lr-ckbx",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Faux Candles",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_flipchartwhiteboardeasel_lr-chksh",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Flip chart/whiteboard Easel",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_smallpodium_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Podium",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_soundsystem_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Sound System",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "lr_question11_ckbx",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Yes",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "lr_question7_1_ckbx",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Facilitator will need to be heard by online attendees",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "lr_question7_2_ckbx",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "In-room attendees will need to be heard by online attendees",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "lr_question7_3_ckbx",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Online attendee(s) will need to be heard by in-room attendees.",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "lr_question8_1_ckbx",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Myself or someone will bring a sound system from outside (speakers, bass, microphone, receiver, mixer, cables, etc.)",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "lr_question8_2_ckbx",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Myself or someone will bring a projector and projector screen",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "lr_question8_3_ckbx",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "None",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "lr_question8_4_ckbx",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Myself or someone will bring cameras and/or webcams",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "multipurpose_glass_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Multi-purpose Glasses - 14 oz",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "rental_dinnerware_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_dinnerware_lr",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "rental_others_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_others_lr",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "rental_tech_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_tech_lr",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "saladsoup_bowl_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Salad/Soup Bowl",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "services_delivery_small_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Delivery (small items)",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "space_centerpieces_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "space_centerpieces_lr",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "speciality_glass_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Speciality Glass",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "teacup_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Tea Cups",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "waterwine_glass_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Water/Wine Glasses - 14 oz",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "whiteboard_fullheight",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Whiteboard (full height)",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_caketable_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "1",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "1",
          "value": "1"
        },
        {
          "label": "2",
          "value": "2"
        }
      ]
    },
    {
      "oldSiteName": "addcost_outdoorspeaker_lr_select",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Mobile Speaker only",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Mobile Speaker only",
          "value": "1"
        },
        {
          "label": "Mobile Speaker with wireless microphone",
          "value": "2"
        }
      ]
    },
    {
      "oldSiteName": "addcost_panelpictures_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Cover all 9 panels (inc. logo)",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Cover all 9 panels (inc. logo)",
          "value": "1"
        },
        {
          "label": "Cover 3 logo panels",
          "value": "2"
        }
      ]
    },
    {
      "oldSiteName": "bread_plates_circ_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Circular",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Circular",
          "value": "circular"
        },
        {
          "label": "Square",
          "value": "square"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_forks_regu_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Regular",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Regular",
          "value": "regular"
        },
        {
          "label": "Gold-edge",
          "value": "goldedge"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_teacup_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "with no saucer",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "with no saucer",
          "value": "teacup_only"
        },
        {
          "label": "with saucer",
          "value": "teacup_with_saucer"
        }
      ]
    },
    {
      "oldSiteName": "inccost_dripcoffeemachine_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "$ with no coffee",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "$ with no coffee",
          "value": "1"
        },
        {
          "label": "$ with coffee for 30 cups",
          "value": "2"
        }
      ]
    },
    {
      "oldSiteName": "lr_question1",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "I plan to display only visuals on the projector screen (slides, images, video with no sound)",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "I plan to display only visuals on the projector screen (slides, images, video with no sound)",
          "value": "1"
        },
        {
          "label": "I plan to have audio with the visuals displayed on the projector screen (video with sound, music with slides, Zoom call)",
          "value": "2"
        }
      ]
    },
    {
      "oldSiteName": "lr_question10",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Webcam should be on facilitator's desk seeing the room's attendees.",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Webcam should be on facilitator's desk seeing the room's attendees.",
          "value": "1"
        },
        {
          "label": "Webcam should be high on post in middle of room pointing at the front half of the room including the facilitator.",
          "value": "2"
        },
        {
          "label": "Will decide on the day of event.",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "lr_question2",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Yes, I plan to use Collabüro's sound system via Bluetooth",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Yes, I plan to use Collabüro's sound system via Bluetooth",
          "value": "1"
        },
        {
          "label": "Yes, I plan to use Collabüro's sound system via laptop (using HDMI)",
          "value": "2"
        },
        {
          "label": "No, I am not using Collabüro's sound system for this event",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "lr_question3",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Yes, I plan to use a phone/tablet to connect to Collabüro's sound system via Bluetooth",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Yes, I plan to use a phone/tablet to connect to Collabüro's sound system via Bluetooth",
          "value": "1"
        },
        {
          "label": "Yes, I plan to use a different laptop than the one connected to projector to connect to Collabüro's sound system via HDMI (Not Recommended)",
          "value": "2"
        },
        {
          "label": "No, I will use the same laptop connected to the projector for all my audio/video needs (Recommended)",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "lr_question4",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Yes, there will be online attendees.",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Yes, there will be online attendees.",
          "value": "1"
        },
        {
          "label": "No, all attendees will be in the room.",
          "value": "2"
        }
      ]
    },
    {
      "oldSiteName": "lr_question5",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Yes, online attendees must see the MC/facilitator.",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Yes, online attendees must see the MC/facilitator.",
          "value": "1"
        },
        {
          "label": "Yes, online attendees must see the MC/facilitator and the in-person attendees in the room.",
          "value": "2"
        },
        {
          "label": "No, online attendees will not see anyone in the room.",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "lr_question6",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Yes, I need a microphone/headset/lavalier to speak to the attendees from the stage.",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Yes, I need a microphone/headset/lavalier to speak to the attendees from the stage.",
          "value": "1"
        },
        {
          "label": "No, it's not needed.",
          "value": "2"
        }
      ]
    },
    {
      "oldSiteName": "lr_question9",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Yes, the online meeting will have a dial number that can be used, if needed. Note that online attendees will be heard from the conference phone's speaker in this case, and not from",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Yes, the online meeting will have a dial number that can be used, if needed. Note that online attendees will be heard from the conference phone's speaker in this case, and not from",
          "value": "1"
        },
        {
          "label": "No, the online meeting does not have a dial number, but since attendees will all be sitting close in proximity to each other (all within 5' from microphone), the microphone on faci",
          "value": "2"
        },
        {
          "label": "No, the online meeting does not have a dial number, so the online attendees may not be able to hear the people far away from the microphone. Online attendees can be heard from the",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "total_extra_amount_mh_disp",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Delivery (large quantities of items and/or furniture)",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "tech_moredetails",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "More Details",
      "type": "textarea",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_kettle_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Kettle",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "\" >",
          "value": "\"<?php"
        }
      ]
    },
    {
      "oldSiteName": "addcost_labourtime_helper_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Labour Time (Helper)",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "addcost_labourtime_it_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "addcost_labourtime_it_mh",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_chafingdishesv_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_chafingdishesv_mh",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "1 to 10",
          "value": "1-10"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_chafingkitsrollupv_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Chafing Dishes Rollup",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_chafingkitsroundv_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Round Chafing Kit",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_cutlerysimple_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_cutlerysimple_mh",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "1 to 100",
          "value": "1-100"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_disposablecakeplates_sel_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_disposablecakeplates_sel_mh",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "24 to 180",
          "value": "24-180"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_disposableplates_sel_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_disposableplates_sel_mh",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "24 to 180",
          "value": "24-180"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_hotwater_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_hotwater_mh",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "\">",
          "value": "\"<?php"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_icetongs_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_icetongs_mh",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "\">",
          "value": "\"<?php"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_napkins_color_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Colour",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$napkin_colours[$iter].'",
          "value": "'.$napkin_colours[$iter].'"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_platessimple_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_platessimple_mh",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "1 to 100",
          "value": "1-100"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_quantity_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Quantity",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "12",
          "value": "12"
        },
        {
          "label": "24",
          "value": "24"
        },
        {
          "label": "36",
          "value": "36"
        },
        {
          "label": "48",
          "value": "48"
        },
        {
          "label": "60",
          "value": "60"
        },
        {
          "label": "72",
          "value": "72"
        },
        {
          "label": "84",
          "value": "84"
        },
        {
          "label": "96",
          "value": "96"
        },
        {
          "label": "108",
          "value": "108"
        },
        {
          "label": "120",
          "value": "120"
        },
        {
          "label": "132",
          "value": "132"
        },
        {
          "label": "144",
          "value": "144"
        },
        {
          "label": "156",
          "value": "156"
        },
        {
          "label": "168",
          "value": "168"
        },
        {
          "label": "180",
          "value": "180"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_saladspoonv_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_saladspoonv_mh",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "1 to 6",
          "value": "1-6"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_servingspoonsv_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_servingspoonsv_mh",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "1 to 6",
          "value": "1-6"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_soupwarmers_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_soupwarmers_mh",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        },
        {
          "label": "'.$i.'",
          "value": "'.$i.'"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_sternosfirev_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_sternosfirev_mh",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "2 to 20",
          "value": "2-20"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_tongsv_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_tongsv_mh",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "2 to 6",
          "value": "2-6"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_waterjugs_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "dinnerware_waterjugs_mh",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "\">",
          "value": "\"<?php"
        }
      ]
    },
    {
      "oldSiteName": "inccost_backdrop_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "inccost_backdrop_mh",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">White",
          "value": "White"
        },
        {
          "label": ">Black",
          "value": "Black"
        }
      ]
    },
    {
      "oldSiteName": "inccost_fauxcandles_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "inccost_fauxcandles_mh",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" \">",
          "value": "\"<?php"
        },
        {
          "label": "1 to 8",
          "value": "1-8"
        }
      ]
    },
    {
      "oldSiteName": "inccost_marker_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "inccost_marker_mh",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\"",
          "value": "\"<?php"
        },
        {
          "label": "\">",
          "value": "\"<?php"
        }
      ]
    },
    {
      "oldSiteName": "noofcenterpieces_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Greenery (Plastic)",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "1 to 14",
          "value": "1-14"
        }
      ]
    },
    {
      "oldSiteName": "noofclearglassvases_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "noofclearglassvases_mh",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "0 to 14",
          "value": "0-14"
        }
      ]
    },
    {
      "oldSiteName": "stemless_glass_sel_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Stemless Glasses - Plastic - 14 oz",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "1 to 50",
          "value": "1-50"
        }
      ]
    },
    {
      "oldSiteName": "addcost_avdeluxepackage_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "AV Deluxe Package",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_blackoutcurtainmainwindow_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Curtains for Big Window",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_curtainsfourwindows_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Curtains for 4 Side Windows",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_entrancemaindoor_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Inside Window Curtain",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_inflator_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Balloon Inflator",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_labourtime_it_mh-ckbx",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Labour Time (IT Tech)",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_monitor_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Monitor",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_projectorscreen_mh-chksh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Projector / Projector Screen",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_ptzcamera_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "PTZ camera",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_seatingwedge_mh_seat",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Seat",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_seatingwedge_mh_seatelec",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Seat with electric outlet",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_softseating_mh_greysofa",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Grey Sofa",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_softseating_mh_yellowchair",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Yellow Chair",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_webconferencecamera_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Web conference Camera",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addonflowers_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Additional flowers - at cost",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "bread_plates_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Bread Plates (6.5\")",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "coffee_mug_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Coffee Mugs",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dessert_plates_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Dessert Plates (7.5\")",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_cakeknife_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Cake Knife Server",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_chafingdishes_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Chafing Dishes",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_cutlery_simple_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Cutlery - Simple (set of 5)",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_disposablecakeplates_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Disposable Cake Plate (7\") with Fork",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_disposablenapkins_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Napkins (Disposable) - price based on pack size",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_disposableplates_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Disposable Dinner Plate (10\") with Fork and Knife",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_forks_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Forks",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_hotwater_mh-ckbx",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Green Carafe of Hot Water",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_icetongs_mh-chksh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Ice Tongs",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_knives_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Knives",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_napkins_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Napkins (Linens)",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_plates_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Dinnerware Plates (10.5\")",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_plates_simple_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Dinnerware Plates - Simple",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_saladspoon_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Salad Spoons",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_servingspoons_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Serving Spoons",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_soupwarmers_mh-ckbx",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Crock-Pot 8 Qt",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_spoons_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Spoons",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_sternosfire_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Sternos Fire",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_teaspoons_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Tea Spoons",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_tongs_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Tongs",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dinnerware_waterjugs_mh-ckbx",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Water Jugs",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_backdrop_mh-ckbx",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Backdrop",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_boothbenches_mh-chksh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Booth Benches",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_boothtable_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Booth Table",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_caketable_mh-chksh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Cake Table",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_clicker_mh-chksh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Powerpoint Presentation Clicker",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_colouredtable_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Coloured Table",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_discolights_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Disco Lights",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_dripcoffeemachine_mh-chksh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Drip Coffee Machine",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_extensioncablesfortables_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Extension cables for tables",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_fauxcandles_mh-ckbx",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Faux Candles",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_highchairsyellow_mh-chksh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "High Chairs Yellow",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_laptopchairs_mh-chksh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Laptop Chairs",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_marker_mh-ckbx",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Dry-Erase Markers",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_podium_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Podium",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_presenterchairs_mh-chksh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Presenter Chairs",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_seatingwedge_mh-chksh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Seating Wedge",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_softseating_mh-chksh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Soft Seating",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_soundsystem_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Sound System",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_whiteboards_mh-chksh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Whiteboards",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_wiredmic_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Wired Mic",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_wirelessheadsets_mh-chksh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Wireless Headsets",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_wirelessmics_mh-chksh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Wireless Mics",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "mh_others_mobiletv",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Mobile TV (45\")",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "mh_question7_1_ckbx",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Please confirm your agreement to these terms.",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "mh_question8_1_ckbx",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Myself or someone will bring a sound system from outside (speakers, bass, microphone, receiver, mixer, cables, etc.)",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "mh_question8_2_ckbx",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Myself or someone will bring a projector and projector screen",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "mh_question8_3_ckbx",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "None",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "mh_question8_4_ckbx",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Myself or someone will bring cameras and/or webcams",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "mh_question9_1_ckbx",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Yes",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "multipurpose_glass_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Multi-purpose Glasses - 14 oz",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "rental_dinnerware_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Space Contents",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "rental_others_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_others_mh",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "rental_tech_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "rental_tech_mh",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "saladsoup_bowl_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Salad/Soup Bowl",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "services_delivery_small_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Delivery (small items)",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "speciality_glass_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Speciality Glass",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "teacup_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Tea Cups",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "waterwine_glass_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Water/Wine Glasses - 14 oz",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_caketable_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "1",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "1",
          "value": "1"
        },
        {
          "label": "2",
          "value": "2"
        }
      ]
    },
    {
      "oldSiteName": "addcost_projectorscreen_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Middle of Stage",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Middle of Stage",
          "value": "1"
        },
        {
          "label": "Right Side of Stage",
          "value": "2"
        },
        {
          "label": "Suspended Middle of stage ($25 extra)",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "bread_plates_circ_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Circular",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Circular",
          "value": "circular"
        },
        {
          "label": "Square",
          "value": "square"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_forks_regu_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Regular",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Regular",
          "value": "regular"
        },
        {
          "label": "Gold-edge",
          "value": "goldedge"
        }
      ]
    },
    {
      "oldSiteName": "dinnerware_teacup_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "with no saucer",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "with no saucer",
          "value": "teacup_only"
        },
        {
          "label": "with saucer",
          "value": "teacup_with_saucer"
        }
      ]
    },
    {
      "oldSiteName": "inccost_dripcoffeemachine_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "$ with no coffee",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "$ with no coffee",
          "value": "1"
        },
        {
          "label": "$ with coffee for 30 cups",
          "value": "2"
        }
      ]
    },
    {
      "oldSiteName": "mh_question1",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "I plan to display only visuals on the projector screen (slides, images, video with no sound)",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "I plan to display only visuals on the projector screen (slides, images, video with no sound)",
          "value": "1"
        },
        {
          "label": "I plan to have audio with the visuals displayed on the projector screen (video with sound, music with slides, Zoom call)",
          "value": "2"
        }
      ]
    },
    {
      "oldSiteName": "mh_question2",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Yes, I plan to use Collabüro's sound system via Bluetooth",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Yes, I plan to use Collabüro's sound system via Bluetooth",
          "value": "1"
        },
        {
          "label": "Yes, I plan to use Collabüro's sound system via laptop (using HDMI)",
          "value": "2"
        },
        {
          "label": "No, I am not using Collabüro's sound system for this event",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "mh_question3",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Yes, I plan to use a phone/tablet to connect to Collabüro's sound system via Bluetooth",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Yes, I plan to use a phone/tablet to connect to Collabüro's sound system via Bluetooth",
          "value": "1"
        },
        {
          "label": "Yes, I plan to use a different laptop than the one connected to projector to connect to Collabüro's sound system via HDMI (Not Recommended)",
          "value": "2"
        },
        {
          "label": "No, I will use the same laptop connected to the projector for all my audio/video needs (Recommended)",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "mh_question4",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Yes, there will be online attendees that will just be listening (and possibly seeing shared screen)",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Yes, there will be online attendees that will just be listening (and possibly seeing shared screen)",
          "value": "1"
        },
        {
          "label": "Yes, there will be online attendees that will participate by speaking to the in-room and online attendees (and possibly share screen on call)",
          "value": "2"
        },
        {
          "label": "No, all attendees will be in the room.",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "mh_question5",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Yes, online attendees must see the MC/facilitator.",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Yes, online attendees must see the MC/facilitator.",
          "value": "1"
        },
        {
          "label": "Yes, online attendees must see the MC/facilitator and the in-person attendees in the room.",
          "value": "2"
        },
        {
          "label": "No, online attendees will not see anyone in the room.",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "mh_question6",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Yes, I need a microphone/headset/lavalier to speak to the attendees from the stage.",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Yes, I need a microphone/headset/lavalier to speak to the attendees from the stage.",
          "value": "1"
        },
        {
          "label": "Yes, I need a microphone/headset/lavalier to speak to the attendees from different spots in the room.",
          "value": "2"
        },
        {
          "label": "No, it's not needed.",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "mh_question7",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Yes, I will have a DJ/band perform at this event",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Yes, I will have a DJ/band perform at this event",
          "value": "1"
        },
        {
          "label": "Yes, I will get a professional AV company to run this event",
          "value": "2"
        },
        {
          "label": "Yes, I will have a DJ/band as well as a professional AV company to take care of all my Audio/Video needs.",
          "value": "3"
        },
        {
          "label": "No, I will get a sound system for small audio related needs.",
          "value": "4"
        }
      ]
    },
    {
      "oldSiteName": "rental_others_sr",
      "oldSiteSpace": "Small Room",
      "oldSiteStep": "Rentals",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Others",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Small Room",
      "placeholder": "",
      "category": ""
    }
  ],
  "Catering": [
    {
      "oldSiteName": "catering",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Catering",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Catering Specifics ( + for an additional cost )",
      "type": "textarea",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "buffettablespandex_select",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Catering",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "buffettablespandex_select",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "1 to 6",
          "value": "1-6"
        }
      ]
    },
    {
      "oldSiteName": "catering_required_breakfast",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Catering",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Breakfast",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "catering_required_lunch",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Catering",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Lunch",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "catering_required_dinner",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Catering",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Dinner",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "catering_required_snacks",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Catering",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Snack Food",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dietary_halal",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Catering",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Halal",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dietary_kosher",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Catering",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Kosher",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dietary_vegetarian",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Catering",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Vegetarian",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dietary_vegan",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Catering",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Vegan",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dietary_allergenfree",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Catering",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Allergen-free",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "dietary_glutenfree",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Catering",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Gluten-free",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "\"<?php",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Catering",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Dietary Restrictions (check all that apply for any of the attendees)",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_buffettablewithlinen_lr-chksh",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Catering",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Buffet Table with Wipeable Covers (for Large Room)(Free)",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "buffettablespandex_ckbx",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Catering",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Buffet Tables Spandex Covers",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_buffettablewithlinen_bp_ckbx",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Catering",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Buffet Table with Wipeable Covers (for Patio)",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_buffettablewithlinen_mh-chksh",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Catering",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Buffet Table with Wipeable Covers (for Main Hall)",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addcost_buffettablewithlinen_bp",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Catering",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Buffet Table with Wipeable Covers (Patio)",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "12'",
          "value": "12"
        },
        {
          "label": "16'",
          "value": "16"
        },
        {
          "label": "18'",
          "value": "18"
        },
        {
          "label": "24'",
          "value": "24"
        }
      ]
    },
    {
      "oldSiteName": "addcost_buffettablewithlinen_mh",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Catering",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Buffet Table with Wipeable Covers (Main Hall)",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "12'",
          "value": "12"
        },
        {
          "label": "16'",
          "value": "16"
        },
        {
          "label": "18'",
          "value": "18"
        },
        {
          "label": "24'",
          "value": "24"
        }
      ]
    },
    {
      "oldSiteName": "addon_beveragepackage_mh_radio",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Catering",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Beverage Package",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Hot/Cold Beverages (Coffee, Tea, Soft Drinks)",
          "value": "hotcoldbeverages"
        },
        {
          "label": "Up to 30 People",
          "value": "upto30people"
        },
        {
          "label": "Up to 50 People",
          "value": "upto50people"
        },
        {
          "label": "Up to 100 People",
          "value": "upto100people"
        },
        {
          "label": "No beverages required",
          "value": "no_beverages"
        }
      ]
    },
    {
      "oldSiteName": "catering_required_radio",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Catering",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Catering Required",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "No, there will be no food at the event",
          "value": "no_catering"
        },
        {
          "label": "No, I will be bringing my own catered food and/or snacks.",
          "value": "bring_own"
        },
        {
          "label": "Yes, please provide me catering options for",
          "value": "with_catering"
        }
      ]
    },
    {
      "oldSiteName": "upto100people_options_mh",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Catering",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Coffee only",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Coffee only",
          "value": "coffeeonly"
        },
        {
          "label": "Coffee and Tea",
          "value": "coffeeandtea"
        }
      ]
    },
    {
      "oldSiteName": "catering_dlvery_time",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Catering",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Catering Delivery Time",
      "type": "time",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    }
  ],
  "Additional Services": [
    {
      "oldSiteName": "services_dj_music",
      "oldSiteSpace": "3rd party services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Type of Music",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: 3rd party services",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "special_notes",
      "oldSiteSpace": "3rd party services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Special Notes",
      "type": "textarea",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: 3rd party services",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "services_child_minding_hrs",
      "oldSiteSpace": "3rd party services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of hours",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: 3rd party services",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "3 to 10",
          "value": "3-10"
        }
      ]
    },
    {
      "oldSiteName": "services_child_minding_people",
      "oldSiteSpace": "3rd party services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of people",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: 3rd party services",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "1",
          "value": "1"
        },
        {
          "label": "2",
          "value": "2"
        },
        {
          "label": "3",
          "value": "3"
        },
        {
          "label": "4",
          "value": "4"
        }
      ]
    },
    {
      "oldSiteName": "services_clowns_gender",
      "oldSiteSpace": "3rd party services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Sex",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: 3rd party services",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "0){ if(intval($row_svc[\"svc_clowns_gender\"]) == 1){ echo \"selected\"; } } ?>>Male",
          "value": "1"
        },
        {
          "label": "0){ if(intval($row_svc[\"svc_clowns_gender\"]) == 2){ echo \"selected\"; } } ?>>Female",
          "value": "2"
        },
        {
          "label": "0){ if(intval($row_svc[\"svc_clowns_gender\"]) == 3){ echo \"selected\"; } } ?>>Does Not Matter",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "services_balloon_stylist",
      "oldSiteSpace": "3rd party services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Floral Wall / Balloon Stylist",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: 3rd party services",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "services_bridalpackages",
      "oldSiteSpace": "3rd party services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Bridal Package",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: 3rd party services",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "services_child_minding",
      "oldSiteSpace": "3rd party services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Child Minding",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: 3rd party services",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "services_clowns",
      "oldSiteSpace": "3rd party services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Entertainers / Clowns",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: 3rd party services",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "services_decorators",
      "oldSiteSpace": "3rd party services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Decorators",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: 3rd party services",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "services_dj",
      "oldSiteSpace": "3rd party services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Disc Jockey (DJ)",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: 3rd party services",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "services_eventplanners",
      "oldSiteSpace": "3rd party services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Event Planners",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: 3rd party services",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "services_florist",
      "oldSiteSpace": "3rd party services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Florist",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: 3rd party services",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "services_helper",
      "oldSiteSpace": "3rd party services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Helper",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: 3rd party services",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "services_hotel",
      "oldSiteSpace": "3rd party services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Hotels",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: 3rd party services",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "services_mc",
      "oldSiteSpace": "3rd party services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Master of Ceremony (MC)",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: 3rd party services",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "services_officiant",
      "oldSiteSpace": "3rd party services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Officiant",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: 3rd party services",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "services_photobooth",
      "oldSiteSpace": "3rd party services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Photobooth",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: 3rd party services",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "services_photographers",
      "oldSiteSpace": "3rd party services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Photographers",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: 3rd party services",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "services_transportation",
      "oldSiteSpace": "3rd party services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Transportation Services (car, van, bus, limo, etc)",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: 3rd party services",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "services_videographers",
      "oldSiteSpace": "3rd party services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Videographers",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: 3rd party services",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "services_waiter_server_smart",
      "oldSiteSpace": "3rd party services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Waiter / Server (Smart Serve)",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: 3rd party services",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "svc_notes",
      "oldSiteSpace": "Event services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of hours",
      "type": "textarea",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Event services",
      "placeholder": "Please fill in any details about the required work.",
      "category": ""
    },
    {
      "oldSiteName": "services_security_people",
      "oldSiteSpace": "Event services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of Guards",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Event services",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "1",
          "value": "1"
        },
        {
          "label": "2",
          "value": "2"
        },
        {
          "label": "3",
          "value": "3"
        },
        {
          "label": "4",
          "value": "4"
        }
      ]
    },
    {
      "oldSiteName": "services_waiter_server_gender",
      "oldSiteSpace": "Event services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Sex",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Event services",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "0){ if(intval($row_svc[\"svc_waiter_server_gender\"]) == 1){ echo \"selected\"; } } ?>>Male",
          "value": "1"
        },
        {
          "label": "0){ if(intval($row_svc[\"svc_waiter_server_gender\"]) == 2){ echo \"selected\"; } } ?>>Female",
          "value": "2"
        },
        {
          "label": "0){ if(intval($row_svc[\"svc_waiter_server_gender\"]) == 3){ echo \"selected\"; } } ?>>Does Not Matter",
          "value": "3"
        }
      ]
    },
    {
      "oldSiteName": "services_waiter_server_people",
      "oldSiteSpace": "Event services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "# of people",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Event services",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": "\" >",
          "value": "\"<?php"
        },
        {
          "label": "1",
          "value": "1"
        },
        {
          "label": "2",
          "value": "2"
        },
        {
          "label": "3",
          "value": "3"
        },
        {
          "label": "4",
          "value": "4"
        }
      ]
    },
    {
      "oldSiteName": "services_eventplanners_on_day",
      "oldSiteSpace": "Event services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Event Planner ($30/hour) : This is time spent helping the organizer plan last-minute details in the weeks leading up to the big event. Creating a timeline for the day, coordinating",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Event services",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "services_ittechhelper",
      "oldSiteSpace": "Event services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "IT Services ($60/hour) - Basic IT services such as connecting to the Wi-Fi, projector, and sound system are included in your rental and can be handled at the start of the event eit",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Event services",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "services_security",
      "oldSiteSpace": "Event services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Security Services ($33/guard/hour) - Security Guards experienced in events are required for Public events (where guests are unknown to the client or the event is advertised on soci",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Event services",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "services_waiter_server",
      "oldSiteSpace": "Event services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Server ($30/server/hour) - Designated Collaburo staff (with black pants/shirt and Collaburo apron) will be the server for your event. These staff will help in all aspects of the ev",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Event services",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "svc_ondaycoord",
      "oldSiteSpace": "Event services",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Coordinator Services (during event) ($30/hour) : Client can request for one of our experienced Event Mangers to be on site for a period or entire time of their event. They will ens",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Event services",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "clearupservices",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Budget-friendly DIY Clean-up Service - included in cost - Client is expected to take home all their belongings (including any 3rd party items that the client rented without Collabü",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Budget-friendly DIY Clean-up Service - included in cost - Client is expected to take home all their belongings (including any 3rd party items that the client rented without Collabü",
          "value": "Budget-friendly DIY Clean-up Service"
        },
        {
          "label": "Walk-Away Service (Banquet) - $2.75 / person - Client can choose to select the Walk-Away Service, and leave the space as if they were leaving a restaurant. Client is still expected",
          "value": "Walk-Away Service (Bonquet)"
        },
        {
          "label": "Walk-Away Service (Reception/Cocktail Buffet) - $60 flat fee (for up 2 hours and $25 / additional hour) - Client can choose to select the Walk-Away Service from a reception/cocktai",
          "value": "Walk-Away Service (Reception/Cocktail Buffet)"
        }
      ]
    },
    {
      "oldSiteName": "setupservices",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Additional Services",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Budget-friendly DIY Set-up Service - included in cost - Service includes full room layout with placement of furniture as per agreed plan including linens and chair covers (if rente",
      "type": "radio",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "radio",
      "options": [
        {
          "label": "Budget-friendly DIY Set-up Service - included in cost - Service includes full room layout with placement of furniture as per agreed plan including linens and chair covers (if rente",
          "value": "Budget-friendly DIY Set-up Service"
        },
        {
          "label": "Concierge Set-up Service (Banquet) - $2.25 / person - Same as the 1st option (DIY Option), with full dinner service layout on tables (dishes, glasses, cutlery, napkins, centerpiece",
          "value": "Concierge Set-up Service (Banquet)"
        },
        {
          "label": "Concierge Set-up Service (Reception/Cocktail Buffet) - $50 flat fee (for up to 1 hour and $25 / additional hour) - Same as the 1st option (DIY Option), with the set up of the buffe",
          "value": "Concierge Set-up Service (Reception/Cocktail Buffet)"
        }
      ]
    }
  ],
  "Additional Info": [
    {
      "oldSiteName": "damagewaiverrefundable_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Security Deposit (refundable)",
      "type": "number",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addon_bigfridgeaccess_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Big Fridge Access",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addon_kitchenaccess_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Kitchen Access",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addon_wifi_bp",
      "oldSiteSpace": "Back Patio",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Wi-Fi",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Back Patio",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "damagewaiverrefundable_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Security Deposit (refundable)",
      "type": "number",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addon_accessibilityelevator_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Accessibility Elevator",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addon_bigfridgeaccess_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Big Fridge Access",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addon_kitchenaccess_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Kitchen Access",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addon_wifi_lr",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Wi-Fi",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_printer_lr-chksh",
      "oldSiteSpace": "Large Room",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Printer Access",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Large Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "damagewaiverrefundable_la",
      "oldSiteSpace": "Lounge Area",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Security Deposit (refundable)",
      "type": "number",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Lounge Area",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "floorlayout_la",
      "oldSiteSpace": "Lounge Area",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Floor Layout",
      "type": "select",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Lounge Area",
      "placeholder": "",
      "category": "",
      "hasOptions": true,
      "displayAs": "select",
      "options": [
        {
          "label": ">Open Space",
          "value": "Open Space"
        },
        {
          "label": ">Lounge with furniture (as-is)",
          "value": "Lounge with furniture (as-is)"
        },
        {
          "label": ">Lounge with specific furniture layout",
          "value": "Lounge with specific furniture layout"
        },
        {
          "label": ">Banquet Layout",
          "value": "Banquet Layout"
        }
      ]
    },
    {
      "oldSiteName": "damagewaiverrefundable_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Security Deposit (refundable)",
      "type": "number",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addon_accessibilityelevator_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Accessibility Elevator",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addon_minifridge_ctr_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Mini Fridge - Counter",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addon_minifridge_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Mini Fridge - Floor",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addon_sinkaccess_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Sink Access",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addon_wifi_mh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Wi-Fi",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_printer_mh-chksh",
      "oldSiteSpace": "Main Hall",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Printer Access",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Main Hall",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "expguesttime",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Expected Guest Arrival Time",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "message_mh",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Blackboard Sign Messsage",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "ex. Welcome to Joanna's 20th Bday Party",
      "category": ""
    },
    {
      "oldSiteName": "noone_onsite",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Period of time no one on site during booking",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "If leaving during your booking, enter start/end times.",
      "category": ""
    },
    {
      "oldSiteName": "sp_name",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Name",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "sp_phonenumber",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Phone Number",
      "type": "text",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "special_notes",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Special Notes",
      "type": "textarea",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "Share any details or special requests that will help us tailor your event to perfection!",
      "category": ""
    },
    {
      "oldSiteName": "damagewaiverrefundable_sr",
      "oldSiteSpace": "Small Room",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Security Deposit (refundable)",
      "type": "number",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Small Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addon_accessibilityelevator_sr",
      "oldSiteSpace": "Small Room",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Accessibility Elevator",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Small Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "addon_wifi_sr",
      "oldSiteSpace": "Small Room",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Wi-Fi",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Small Room",
      "placeholder": "",
      "category": ""
    },
    {
      "oldSiteName": "inccost_printer_sr-chksh",
      "oldSiteSpace": "Small Room",
      "oldSiteStep": "Additional Info",
      "oldSiteUserRequired": false,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "Printer Access",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "Old site space: Small Room",
      "placeholder": "",
      "category": ""
    }
  ],
  "Review & Submit": [
    {
      "oldSiteName": "createevent_ack1",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Review & Submit",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "I understand that this form is only a booking request. A staff member will review availability of the space and requested items, then contact me to confirm the booking and provide",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": "Legal"
    },
    {
      "oldSiteName": "createevent_ack2",
      "oldSiteSpace": "Shared",
      "oldSiteStep": "Review & Submit",
      "oldSiteUserRequired": true,
      "oldSiteAdminRequired": false,
      "source": "old_site_inventory",
      "safeImport": true,
      "label": "I understand that a 50% deposit of the space rental fee is required to confirm and hold the booking date, with the remaining balance due 5 or 6 business days prior to the event.",
      "type": "toggle",
      "required": false,
      "adminRequired": false,
      "visibleToClient": true,
      "linkedToPricing": false,
      "fieldDescription": "",
      "helpText": "",
      "placeholder": "",
      "category": "Legal"
    }
  ]
};

export function oldSitePresetsForStep(stepName = "") {
  const key = String(stepName || "").trim();
  return Array.isArray(OLD_SITE_FIELD_CATALOG[key]) ? OLD_SITE_FIELD_CATALOG[key] : [];
}

export function oldSiteSharedPresetsForStep(stepName = "") {
  return oldSitePresetsForStep(stepName).filter((p) => (p.oldSiteSpace || "Shared") === "Shared");
}
