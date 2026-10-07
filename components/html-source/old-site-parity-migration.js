// One-time migration that brings a saved admin config in line with the old
// createevent.php booking form (prices, rules, notices, catalog cleanup).
// Pure function: takes { steps, rentalCatalog, pricingRules, siteSettings }
// and returns a migrated copy plus a human-readable list of changes.
// Each version is a separate block that runs once; configs already at the
// current version are returned untouched. Ids created by later blocks are
// stable because the seed state is migrated again on every page load.

export const OLD_SITE_PARITY_VERSION = 2;

const SYS_VENUE_SOURCE = "__sys:venue";

const BOOKING_NOTICE_TEXT = "Collabüro will complete the agreed-upon room setup and furniture placement before your booking begins. Your booking start and end times must include any additional setup, decorating, teardown, cleanup, and removal of all personal items and equipment.";
const LAYOUT_HELPER_TEXT = "Choose the layout that most closely resembles your vision of how the furniture will be laid out.";
const ADDITIONAL_INFO_INTRO = "The below information is not required to submit a request, but will be required before the event booking.";

// Space rental formulas from the old site's total_space_rental.js. Setup and
// cleanup fees carry the fixed part of each formula, so plans hold only the
// hour-based part (e.g. Main Hall up to 6h = 4h minimum x $245 + $375 in fees).
const VENUE_PRICING = [
  {
    match: /main hall/i,
    setupFee: 200,
    cleanupFee: 175,
    plans: [
      { rateType: "per_hour", basePrice: 980, includedHours: 4, extraHourRate: 245, appliesFromHours: "", appliesToHours: 6 },
      { rateType: "per_day", basePrice: 1720, includedHours: 10, extraHourRate: 245, appliesFromHours: 6, appliesToHours: "" },
    ],
  },
  {
    match: /large room/i,
    setupFee: 100,
    cleanupFee: 60,
    plans: [
      { rateType: "per_hour", basePrice: 95, includedHours: 0, extraHourRate: 0, appliesFromHours: "", appliesToHours: 7 },
      { rateType: "per_day", basePrice: 735, includedHours: 10, extraHourRate: 95, appliesFromHours: 7, appliesToHours: "" },
    ],
  },
  {
    match: /patio/i,
    setupFee: 30,
    cleanupFee: 50,
    plans: [
      { rateType: "per_hour", basePrice: 75, includedHours: 0, extraHourRate: 0, appliesFromHours: "", appliesToHours: 7 },
      { rateType: "per_day", basePrice: 585, includedHours: 10, extraHourRate: 75, appliesFromHours: 7, appliesToHours: "" },
    ],
  },
  {
    match: /small (meeting )?room/i,
    setupFee: 0,
    cleanupFee: 0,
    plans: [
      { rateType: "per_hour", basePrice: 49, includedHours: 0, extraHourRate: 0, appliesFromHours: "", appliesToHours: 7 },
      { rateType: "per_day", basePrice: 385, includedHours: 10, extraHourRate: 49, appliesFromHours: 7, appliesToHours: "" },
    ],
  },
  {
    match: /lounge/i,
    setupFee: 0,
    cleanupFee: 0,
    plans: [
      { rateType: "flat", basePrice: 400, includedHours: 0, extraHourRate: 0, appliesFromHours: "", appliesToHours: "" },
    ],
  },
];

const ELEVATED_AREA_PRICES = [
  { match: /deep half/i, price: 600 },
  { match: /half/i, price: 500 },
  { match: /full/i, price: 900 },
];

const BUSINESS_TYPES = ["Business / Board Meeting", "Conference", "Other - Business and non-alcoholic events"];
const DANCING_TYPES = ["Social Event with dancing / Party", "Reception / Cocktail Party"];

// Old-site venue recommendation thresholds. First matching row wins, so the
// specific event types come before the catch-all "Social" group.
const RECOMMENDATION_TABLE = [
  { eventTypes: BUSINESS_TYPES, bands: [[1, 5, "small"], [6, 30, "large"], [31, "", "main"]] },
  { eventTypes: ["Workshop / Training"], bands: [[1, 5, "small"], [6, 36, "large"], [37, 51, "main"], [52, 63, "main+half"], [64, "", "main+full"]] },
  { eventTypes: ["Lecture / Theater / Movie"], bands: [[1, 5, "small"], [6, 40, "large"], [41, "", "main"]] },
  { eventTypes: DANCING_TYPES, bands: [[1, 60, "large|patio"], [61, 80, "main"], [81, 100, "main+half"], [101, "", "main+full"]] },
  { eventTypes: ["Social"], bands: [[1, 5, "small"], [6, 50, "large"], [51, 76, "main"], [77, 100, "main+half"], [101, "", "main+full"]] },
];

// Security deposit matrix observed on the old site, per venue:
// business events, business public events with alcohol, social events, public/dancing social events.
const DEPOSIT_MATRIX = [
  { match: /main hall/i, business: 0, businessAlcohol: 1000, businessAlcoholPublicOnly: true, social: 500, publicSocial: 1000 },
  { match: /large room/i, business: 0, businessAlcohol: 400, businessAlcoholPublicOnly: true, social: 400, publicSocial: 400 },
  { match: /patio/i, business: 0, businessAlcohol: 300, businessAlcoholPublicOnly: true, social: 300, publicSocial: 300 },
  { match: /small (meeting )?room/i, business: 0, businessAlcohol: 100, businessAlcoholPublicOnly: false, social: 100, publicSocial: 100 },
];

// Additional Info add-ons and the spaces they are offered for.
const ADD_ON_VENUES = [
  { match: /^wi-?fi/i, venues: null },
  { match: /sink/i, venues: [/main hall/i] },
  { match: /mini fridge/i, venues: [/main hall/i] },
  { match: /elevator/i, venues: [/main hall/i, /large room/i, /small (meeting )?room/i] },
  { match: /printer/i, venues: [/main hall/i, /large room/i, /small (meeting )?room/i] },
  { match: /big fridge/i, venues: [/large room/i, /patio/i] },
  { match: /kitchen/i, venues: [/large room/i, /patio/i] },
];
const NEW_ADD_ONS = [
  { label: "Big Fridge Access", price: 20, enablePrice: true, pricingStructure: "flat", infoText: "Access to the large fridge in the kitchen." },
  { label: "Kitchen Access", infoText: "Access to the shared kitchen." },
];

// Pairs that exist twice in the catalog (priced copy + "Quote" copy from the old-site import).
const DUPLICATE_ITEM_NAMES = [
  "Cake Knife Server", "Chafing Dishes", "Chafing Dishes Rollup", "Crock-Pot 8 Qt", "Green Carafe of Hot Water", "Ice Tongs",
  "Kettle", "Round Chafing Kit", "Salad Spoons", "Serving Spoons", "Sternos Fire", "Tongs", "Water Jugs", "Drip Coffee Machine",
];

// Single-price items from the old site's price table. Items with variant prices
// (plates, gold-edge cutlery, drip coffee, panel covers, speaker) are priced in the v2 block.
const ITEM_PRICES = [
  ["Multi-purpose Glasses - 14 oz", 0.75], ["Salad/Soup Bowl", 0.75], ["Water/Wine Glasses - 14 oz", 0.75],
  ["Speciality Glass", 1], ["Stemless Glasses - Plastic - 14 oz", 0.5], ["Coffee Mugs", 0.65], ["Tea Cups", 0.65],
  ["Bread Plates (6.5\")", 0.6], ["Dessert Plates (7.5\")", 0.6],
  ["Spoons", 0.65], ["Tea Spoons", 0.65], ["Forks", 0.65], ["Knives", 0.65],
  ["Tongs", 3], ["Ice Tongs", 1],
  ["AV Deluxe Package", 350], ["Wireless Mics", 10], ["Wireless Headsets", 10], ["Powerpoint Presentation Clicker", 10],
  ["Mobile TV (45\")", 75], ["PTZ camera", 100], ["Monitor", 35], ["Conference Phone", 40],
  ["Laptop Chairs", 5], ["Presenter Chairs", 5], ["Soft Seating", 5], ["Seating Wedge", 5], ["Faux Candles", 5],
  ["Dry-Erase Markers", 5], ["Cake Table", 15], ["Flip chart/whiteboard Easel", 10], ["Inside Window Curtain", 10],
  ["Balloon Inflator", 20], ["Patio Heater (with propane tank)", 100], ["Clear tarp cover to floor on side to protect from wind and rain", 30],
  ["Mobile Speaker", 30], ["Phone Booth", 70],
  ["Rectangular 4' Table", 8], ["Rectangular 5' Table", 0], ["Rectangular 6' Table", 12], ["Rectangular 8' Table", 12],
  ["Round Tables", 12.25], ["Cocktail Tables", 16.75],
];
const ITEM_MAX_UNITS = [
  ["Rectangular 4' Table", 2], ["Rectangular 5' Table", 14], ["Rectangular 6' Table", 8], ["Rectangular 8' Table", 8],
  ["Round Tables", 10], ["Cocktail Tables", 12],
];

const clone = (value) => (value == null ? value : JSON.parse(JSON.stringify(value)));
const norm = (value) => String(value ?? "").trim().toLowerCase();
const isBlank = (value) => value == null || String(value).trim() === "";
let idCounter = 0;
const parityId = (prefix) => `${prefix}_parity_${Date.now().toString(36)}_${(idCounter += 1).toString(36)}`;

export function migrateToOldSiteParity(input = {}) {
  const currentVersion = Number(input?.siteSettings?.migrations?.oldSiteParity || 0);
  if (currentVersion >= OLD_SITE_PARITY_VERSION) return { state: input, changes: [], applied: false };

  const state = clone(input) || {};
  const changes = [];
  const log = (message) => changes.push(message);
  if (!Array.isArray(state.steps)) state.steps = [];
  if (!Array.isArray(state.rentalCatalog)) state.rentalCatalog = [];
  if (!state.pricingRules || typeof state.pricingRules !== "object") state.pricingRules = {};

  if (currentVersion < 1) applyV1(state, parityContext(state), log);
  if (currentVersion < 2) applyV2(state, parityContext(state), log);

  state.siteSettings = {
    ...(state.siteSettings || {}),
    migrations: { ...(state.siteSettings?.migrations || {}), oldSiteParity: OLD_SITE_PARITY_VERSION },
  };
  return { state, changes, applied: true };
}

function parityContext(state) {
  const steps = state.steps;
  const nonVenueFields = steps.filter((step) => step.stepType !== "venue").flatMap((step) => step.fields || []);
  const allFields = steps.flatMap((step) => step.fields || []);
  const fieldBy = (id, labelPattern) => allFields.find((field) => field.id === id)
    || (labelPattern ? nonVenueFields.find((field) => labelPattern.test(field.label || "")) : null);
  const optionBy = (field, pattern) => (field?.options || []).find((option) => option && typeof option === "object" && pattern.test(option.label || ""));
  const venueStep = steps.find((step) => step.stepType === "venue");
  const venues = venueStep?.venues || [];
  const venueBy = (pattern) => venues.find((venue) => pattern.test(venue.name || ""));
  return {
    steps,
    allFields,
    fieldBy,
    optionBy,
    venueStep,
    venues,
    venueBy,
    mainHall: venueBy(/main hall/i),
    largeRoom: venueBy(/large room/i),
    patio: venueBy(/patio/i),
    smallRoom: venueBy(/small (meeting )?room/i),
    lounge: venueBy(/lounge/i),
  };
}

function applyV1(state, ctx, log) {
  const { steps, fieldBy, optionBy, venueStep, venueBy, mainHall, largeRoom, patio, smallRoom, lounge } = ctx;
  const catalog = state.rentalCatalog;
  const pricing = state.pricingRules;

  // ----- Venues -----
  VENUE_PRICING.forEach((spec) => {
    const venue = venueBy(spec.match);
    if (!venue) return;
    const existing = Array.isArray(venue.pricing) ? venue.pricing : [];
    venue.pricing = spec.plans.map((plan, index) => ({ ...(existing[index] || {}), ...plan, id: existing[index]?.id || `pp_${venue.id}_${index + 1}` }));
    venue.advancedPricing = {
      ...(venue.advancedPricing || {}),
      setupFee: spec.setupFee,
      cleanupFee: spec.cleanupFee,
      planSelection: "by_hours",
      timeStepMinutes: venue.advancedPricing?.timeStepMinutes || 30,
    };
    log(`${venue.name}: space rental priced by booking length like the old site.`);
  });

  if (mainHall?.subSpace?.options?.length) {
    mainHall.subSpace.options.forEach((option) => {
      const rule = ELEVATED_AREA_PRICES.find((item) => item.match.test(option.name || ""));
      if (rule && Number(option.price) !== rule.price) {
        option.price = rule.price;
        log(`${option.name}: price set to $${rule.price}.`);
      }
    });
  }

  if (mainHall) {
    const excluded = new Set(mainHall.excludedVenueIds || []);
    [smallRoom, lounge].filter(Boolean).forEach((venue) => {
      if (!excluded.has(venue.id)) {
        excluded.add(venue.id);
        log(`Main Hall can no longer be booked together with ${venue.name}.`);
      }
    });
    mainHall.excludedVenueIds = Array.from(excluded);
  }

  if (venueStep) {
    if (!venueStep.bookingNotice?.text) {
      venueStep.bookingNotice = { enabled: true, title: "", text: BOOKING_NOTICE_TEXT, style: "warning", icon: "Info" };
      log("Venue step: added the room setup notice.");
    }
    if (!(venueStep.recommendationRules || []).length) {
      const target = (key) => {
        if (key === "small") return { venue: smallRoom };
        if (key === "large") return { venue: largeRoom };
        if (key === "large|patio") return { venue: largeRoom, text: [largeRoom?.name, patio?.name].filter(Boolean).join(" or ") };
        if (key === "main") return { venue: mainHall };
        const subPattern = key === "main+half" ? /^half/i : /full/i;
        const subSpace = (mainHall?.subSpace?.options || []).find((option) => subPattern.test(option.name || ""));
        return { venue: mainHall, subSpace };
      };
      const rules = [];
      RECOMMENDATION_TABLE.forEach((row) => {
        row.bands.forEach(([minGuests, maxGuests, key]) => {
          const { venue, subSpace, text } = target(key);
          if (!venue) return;
          rules.push({
            id: parityId("rec"),
            eventTypes: row.eventTypes,
            minGuests,
            maxGuests,
            venueId: venue.id,
            subSpaceId: subSpace?.id || "",
            text: text || "",
            active: true,
          });
        });
      });
      venueStep.recommendationRules = rules;
      log(`Venue step: added ${rules.length} venue recommendation rules.`);
    }
  }

  // ----- Layout -----
  const layoutStep = steps.find((step) => step.stepType === "layout");
  if (layoutStep) {
    if (isBlank(layoutStep.layoutHelperText)) {
      layoutStep.layoutHelperText = LAYOUT_HELPER_TEXT;
      log("Layout step: added the layout helper text.");
    }
  }

  // ----- Personal details: Not for profit needs a real organization -----
  const organization = fieldBy("f3", /^organi[sz]ation/i);
  const notForProfit = fieldBy("f6", /not for profit/i);
  if (organization && notForProfit) {
    notForProfit.rules = [{
      id: parityId("rule"),
      action: "enable",
      match: "all",
      clearValue: true,
      conditions: [{ fieldId: organization.id, field: organization.label, op: "not_in", value: "na, n/a, none, no" }],
    }];
    delete notForProfit.visibility;
    log("Not for profit: enabled only when Organization has a real value.");
  }

  // ----- Pricing field mapping -----
  const eventType = fieldBy("f11", /event type|type of event/i);
  const alcohol = fieldBy("f13", /alcohol/i);
  const attendees = fieldBy("f14", /attendee|number of guest/i);
  const privacy = fieldBy("f10", /privacy/i);
  pricing.fieldMap = {
    ...(pricing.fieldMap || {}),
    eventTypeFieldId: pricing.fieldMap?.eventTypeFieldId || eventType?.id || "",
    alcoholFieldId: pricing.fieldMap?.alcoholFieldId || alcohol?.id || "",
    attendeesFieldId: pricing.fieldMap?.attendeesFieldId || attendees?.id || "",
    privacyFieldId: pricing.fieldMap?.privacyFieldId || privacy?.id || "",
  };

  // ----- Discounts: space rental only, highest one wins -----
  const discountRules = Array.isArray(pricing.discountRules) ? pricing.discountRules : [];
  const ensureDiscount = (field, name, amount) => {
    if (!field) return;
    let rule = discountRules.find((item) => (item.conditions || []).some((condition) => condition.fieldId === field.id));
    if (!rule) {
      rule = {
        id: parityId("disc"),
        name,
        valueType: "percentage",
        targets: [],
        conditionsMode: "all",
        conditions: [{ id: parityId("cond"), fieldId: field.id, fieldLabel: field.label, operator: "is_true", value: "true" }],
        stackable: true,
        priority: discountRules.length + 1,
        maxDiscount: { enabled: false, valueType: "flat", amount: 0 },
        active: true,
      };
      discountRules.push(rule);
    }
    rule.amount = amount;
    rule.valueType = "percentage";
    rule.applyTo = "space_rental";
    log(`${rule.name || name} discount: ${amount}% of the space rental.`);
  };
  ensureDiscount(notForProfit, "Not for Profit", 15);
  ensureDiscount(fieldBy("f7", /student/i), "Student Body", 10);
  ensureDiscount(fieldBy("f_mq29aykn_1001_m1jg", /community/i), "Community Organization", 10);
  pricing.discountRules = discountRules;
  pricing.discountSettings = { ...(pricing.discountSettings || {}), stacking: "highest_only" };
  log("Discounts no longer stack; only the largest applies.");

  // ----- Security deposit matrix -----
  const depositRows = [];
  DEPOSIT_MATRIX.forEach((spec) => {
    const venue = venueBy(spec.match);
    if (!venue) return;
    const row = (eventTypeValue, amount, extra = {}) => depositRows.push({
      id: parityId("dep"),
      venueId: venue.id,
      venueName: venue.name,
      eventPrivacy: "All",
      eventType: eventTypeValue,
      alcoholOnSite: "All",
      amount,
      active: true,
      ...extra,
    });
    row("Business", spec.business);
    row("Business", spec.businessAlcohol, { alcoholOnSite: "Yes", ...(spec.businessAlcoholPublicOnly ? { eventPrivacy: "Public" } : {}) });
    row("Social", spec.social);
    row("Social", spec.publicSocial, { eventPrivacy: "Public" });
    row("Social Event with dancing / Party", spec.publicSocial);
  });
  if (depositRows.length) {
    pricing.securityDeposits = depositRows;
    log(`Security deposits rebuilt as ${depositRows.length} rules (business / social / public by space).`);
  }

  // ----- Services -----
  const setup = fieldBy("f60", /set ?up services/i);
  const eventServices = fieldBy("f61", /event services/i);
  const cleanup = fieldBy("f62", /clean-?up services/i);
  const thirdParty = fieldBy("f63", /3rd party services/i);
  const servicesNotes = fieldBy("f64", null);
  [setup, cleanup].forEach((field) => {
    if (field && !field.required) {
      field.required = true;
      log(`${field.label}: now required.`);
    }
  });
  const concierge = optionBy(setup, /concierge.*reception/i);
  if (concierge) {
    Object.assign(concierge, { hasHoursOption: true, hoursRange: { min: 1, max: 10 }, includedHours: 1, extraHourRate: 25 });
    log(`${concierge.label}: $${concierge.price} for 1 hour, then $25 per extra hour.`);
  }
  const walkAway = optionBy(cleanup, /walk-?away.*reception/i);
  if (walkAway) {
    Object.assign(walkAway, { hasHoursOption: true, hoursRange: { min: 2, max: 10 }, includedHours: 2, extraHourRate: 25 });
    log(`${walkAway.label}: $${walkAway.price} for 2 hours, then $25 per extra hour.`);
  }
  const server = optionBy(eventServices, /^server/i);
  if (server) {
    server.hoursRange = { ...(server.hoursRange || {}), min: 3, max: 10, startBlank: true };
    server.peopleRange = { ...(server.peopleRange || {}), min: 1, max: 4, startBlank: true };
    log("Server: hours 3-10 and people 1-4, starting blank.");
  }
  if (thirdParty) {
    (thirdParty.options || []).forEach((option) => {
      if (!option || typeof option !== "object") return;
      if (/officiant/i.test(option.label || "")) {
        option.hasHoursOption = false;
        option.hasSexOption = false;
        return;
      }
      if (option.hasHoursOption) option.hoursRange = { ...(option.hoursRange || {}), min: 3, max: 10, startBlank: true };
      if (option.hasPeopleOption) option.peopleRange = { ...(option.peopleRange || {}), min: 1, max: 4, startBlank: true };
      if (/disc jockey|\bdj\b/i.test(option.label || "") && !(option.subFields || []).length) {
        option.subFields = [{ id: parityId("sf"), label: "Type of Music", type: "text", placeholder: "", required: true }];
      }
    });
    log("3rd party services: old-site hours/people ranges, DJ music type, Officiant without extra inputs.");
  }
  if (servicesNotes && eventServices && !(servicesNotes.rules || []).length && /notes/i.test(servicesNotes.label || "")) {
    servicesNotes.rules = [{
      id: parityId("rule"),
      action: "show",
      match: "any",
      clearValue: false,
      conditions: [{ fieldId: eventServices.id, field: eventServices.label, op: "has_value", value: "" }],
    }];
    log("Services notes: shown once an event service is selected.");
  }

  // ----- Catering -----
  const beverage = fieldBy("f50", /beverage package/i);
  if (beverage) {
    beverage.required = true;
    if (patio && !(beverage.rules || []).length) {
      beverage.rules = [{
        id: parityId("rule"),
        action: "hide",
        match: "all",
        clearValue: true,
        conditions: [{ fieldId: SYS_VENUE_SOURCE, field: "Selected venue", op: "equals", value: patio.name }],
      }];
    }
    log("Beverage package: required, and hidden when only the Back Patio is booked.");
  }

  // ----- Additional info -----
  const infoStep = steps.find((step) => /additional info/i.test(step.name || ""));
  if (infoStep) {
    if (isBlank(infoStep.description)) {
      infoStep.description = ADDITIONAL_INFO_INTRO;
      log("Additional Info: added the intro text.");
    }
    const before = (infoStep.fields || []).length;
    infoStep.fields = (infoStep.fields || []).filter((field) => !(field.id === "f_mrgrxlkx_1002_j6cs" || (field.type === "text" && norm(field.label) === "short answer")));
    if (infoStep.fields.length !== before) log("Additional Info: removed the stray \"Short Answer\" field.");
  }
  const secondPhone = fieldBy("f74", null);
  if (secondPhone && secondPhone.type !== "phone" && /phone/i.test(secondPhone.label || "")) {
    secondPhone.type = "phone";
    log("2nd contact phone number: now a phone field.");
  }
  const blackboard = fieldBy("f76", /blackboard/i);
  if (blackboard && isBlank(blackboard.placeholder)) blackboard.placeholder = "ex. Welcome to Joanna's 20th Bday Party";
  const addOns = fieldBy("f77", /add-?ons/i);
  if (addOns) {
    const options = Array.isArray(addOns.options) ? addOns.options : [];
    NEW_ADD_ONS.forEach((addOn) => {
      if (!options.some((option) => norm(option?.label ?? option) === norm(addOn.label))) {
        options.push({ ...addOn });
        log(`Add-ons: added ${addOn.label}.`);
      }
    });
    options.forEach((option) => {
      if (!option || typeof option !== "object") return;
      const spec = ADD_ON_VENUES.find((item) => item.match.test(option.label || ""));
      if (!spec?.venues || (option.rules || []).length) return;
      const names = spec.venues.map((pattern) => venueBy(pattern)?.name).filter(Boolean);
      if (!names.length) return;
      option.rules = [{
        id: parityId("rule"),
        action: "show",
        match: "any",
        clearValue: true,
        conditions: names.map((name) => ({ fieldId: SYS_VENUE_SOURCE, field: "Selected venue", op: "contains", value: name })),
      }];
    });
    addOns.options = options;
    addOns.linkedToPricing = true;
    log("Add-ons: each add-on is offered only for the spaces that have it.");
  }

  // ----- Checkout -----
  const checkoutStep = steps.find((step) => step.stepType === "checkout");
  if (checkoutStep) {
    const checkout = checkoutStep.checkout || {};
    const noticeSteps = steps
      .filter((step) => step.id !== checkoutStep.id && (step.fields || []).some((field) => field.type === "instructional" && /insurance|agco/i.test(field.label || "")))
      .map((step) => step.id);
    if (noticeSteps.length && !(checkout.showNoticesFromSteps || []).length) {
      checkout.showNoticesFromSteps = noticeSteps;
      log("Checkout: insurance and AGCO notices are repeated on the final step.");
    }
    (checkout.agreements || []).forEach((agreement) => {
      if (/remaining balance due 5 business days/i.test(agreement.label || "")) {
        agreement.label = agreement.label.replace(/5 business days/i, "5 or 6 business days");
        log("Checkout: deposit agreement now says \"5 or 6 business days\".");
      }
    });
    if (!checkout.submitLabel) checkout.submitLabel = "Submit";
    checkoutStep.checkout = checkout;
  }

  // ----- Rental catalog -----
  let catalogJson = null;
  const removedIds = new Map();
  DUPLICATE_ITEM_NAMES.forEach((name) => {
    const matches = catalog.filter((item) => norm(item.name).startsWith(norm(name)) && !removedIds.has(item.id));
    const exact = matches.filter((item) => norm(item.name) === norm(name) || norm(item.name).replace(/\s*\(set\)$/, "") === norm(name));
    const group = exact.length > 1 ? exact : matches;
    if (group.length < 2) return;
    const keeper = group.find((item) => item.category !== "Serving Equipment") || group[0];
    group.filter((item) => item !== keeper).forEach((duplicate) => {
      const keeperKeyIsWrong = /kettle/i.test(keeper.name) && keeper.oldSiteName === "inccost_fauxcandles";
      if (isBlank(keeper.oldSiteName) || keeperKeyIsWrong) {
        keeper.oldSiteName = duplicate.oldSiteName || keeper.oldSiteName || "";
        keeper.legacyKey = duplicate.legacyKey || duplicate.oldSiteName || keeper.legacyKey || "";
      }
      if (!(keeper.venueIds || []).length && (duplicate.venueIds || []).length) keeper.venueIds = [...duplicate.venueIds];
      if (isBlank(keeper.maxUnits) && !isBlank(duplicate.maxUnits)) {
        keeper.minUnits = duplicate.minUnits;
        keeper.maxUnits = duplicate.maxUnits;
      }
      removedIds.set(duplicate.id, keeper.id);
    });
    log(`${keeper.name}: merged the duplicate catalog entry.`);
  });
  let nextCatalog = catalog.filter((item) => !removedIds.has(item.id));
  if (removedIds.size) {
    catalogJson = JSON.stringify(nextCatalog);
    removedIds.forEach((keeperId, duplicateId) => {
      catalogJson = catalogJson.split(JSON.stringify(duplicateId)).join(JSON.stringify(keeperId));
    });
    nextCatalog = JSON.parse(catalogJson);
  }

  const itemNamed = (name) => nextCatalog.find((item) => norm(item.name) === norm(name));
  ITEM_PRICES.forEach(([name, price]) => {
    const item = itemNamed(name);
    if (!item || (Number(item.unitPrice || 0) === price && item.pricingModel !== "quote")) return;
    item.unitPrice = price;
    item.priceText = "$" + price;
    item.priceEnabled = price > 0;
    item.pricingModel = price > 0
      ? (["quote", "included"].includes(item.pricingModel) || !item.pricingModel ? "flat_per_item" : item.pricingModel)
      : "included";
    log(`${item.name}: price set to $${price}.`);
  });
  ITEM_MAX_UNITS.forEach(([name, max]) => {
    const item = itemNamed(name);
    if (item && Number(item.maxUnits) !== max) item.maxUnits = max;
  });
  const cutlery = nextCatalog.find((item) => /^cutlery - simple/i.test(item.name || ""));
  if (cutlery && !/set of 3/i.test(cutlery.name)) {
    cutlery.name = "Cutlery - Simple (set of 3)";
    cutlery.unitPrice = 1.5;
    cutlery.priceText = "$1.5";
    cutlery.priceEnabled = true;
    cutlery.pricingModel = "flat_per_item";
    log("Cutlery - Simple: now a set of 3 at $1.50.");
  }
  const phoneBooth = itemNamed("Phone Booth");
  if (phoneBooth && mainHall && !(phoneBooth.venueIds || []).includes(mainHall.id)) {
    phoneBooth.venueIds = [mainHall.id];
    log("Phone Booth: offered with the Main Hall (Elevated Area) instead of the Small Room.");
  }
  state.rentalCatalog = nextCatalog;
}

// ===== v2: catalog parity =====

const RAISED_LAYOUT_NAMES = [
  [/extra seats for 14/i, "14 extra seats - facing stage"],
  [/extra seats for 15/i, "Extra seats for 15 people"],
  [/raised area.*\b8 people\b.*long table/i, "Rect. Banquet - 8 ppl - 1 long table"],
  [/raised area.*\b12 people\b.*long table/i, "Rect. Banquet - 12 ppl - 1 long table"],
];

// Dinnerware the old site sizes with one "Quantity" for the whole group.
const SHARED_QUANTITY_ITEMS = [
  /^dinnerware plates \(10/i, /^dessert plates/i, /^bread plates/i, /^salad\/soup bowl/i, /^multi-purpose glasses/i,
  /^speciality glass/i, /^water\/wine glasses/i, /^tea cups/i, /^coffee mugs/i, /^spoons$/i, /^tea spoons$/i,
  /^forks$/i, /^knives$/i, /^napkins \(linens\)/i,
];

// [name, min, max, step] from the old site's quantity dropdowns.
const ITEM_RANGES = [
  [/^dinnerware plates - simple/i, 1, 59], [/^cutlery - simple/i, 1, 59], [/^stemless glasses/i, 1, 50],
  [/^disposable (dinner|cake) plate/i, 12, 180, 12], [/^crock-?pot/i, 1, 3], [/^chafing dishes$/i, 1, 10],
  [/^chafing dishes rollup/i, 1, 10], [/^round chafing kit/i, 1, 10], [/^sternos/i, 2, 20], [/^serving spoons/i, 1, 6],
  [/^tongs$/i, 2, 6, 2], [/^salad spoons/i, 1, 6], [/^ice tongs/i, 2, 6, 2], [/^water jugs/i, 1, 14],
  [/^green carafe/i, 1, 8], [/^greenery/i, 1, 14], [/^clear glass vase/i, 1, 14], [/^whiteboards$/i, 1, 2],
  [/^extra whiteboards/i, 1, 2], [/^booth benches/i, 1, 2], [/^cake table/i, 1, 2], [/^high chairs/i, 1, 4],
  [/^laptop chairs/i, 1, 4], [/^presenter chairs/i, 1, 4], [/^faux candles/i, 1, 8], [/^kettle$/i, 1, 2],
  [/^flip chart/i, 1, 3], [/^wireless (mics|headsets)/i, 1, 2], [/^labour time/i, 1, 10], [/^dry-erase markers/i, 4, 20, 4],
];

// Old-site items that were free but imported as "Quote".
const FREE_ITEMS = [/^booth benches/i, /^whiteboards$/i, /^extra whiteboards/i, /^whiteboard \(full height\)/i, /^buffet gazebo/i, /^high chairs/i];

const NAPKIN_COLOURS = [
  "White", "Ivory", "Black", "Apple Green", "Blush", "Burgundy", "Burnt Orange", "Champagne", "Chocolate Brown",
  "Chocolate Brown Classic", "Coral", "Dusty Rose", "Dusty Sage Green", "Eggplant", "Eggplant Classic", "Forest Green",
  "Fuchsia", "Gold", "Hot Pink", "Hunter Green", "Ivory Classic", "Jade", "Kiwi Green", "Lavender", "Lilac", "Lime Green",
  "Maize", "Mint Green", "Mustard", "Navy Blue", "Navy Blue Classic", "Navy Pink", "Nude", "Pink Classic", "Pumpkin",
  "Purple", "Purple Classic", "Red", "Red Classic", "Robins Egg Blue", "Royal Blue", "Ruby Red", "Sage Green",
  "School Bus Yellow", "Silver", "Silver Classic", "Teal", "Terra Cotta", "Turquoise", "Wedgewood Blue", "Willow Green", "Yellow",
];
const PATIO_NAPKIN_COLOURS = [
  "Lime Green", "Jade", "Teal", "Burnt Orange", "Wedgewood Blue", "Terra Cotta", "School Bus Yellow", "Ruby Red",
  "Robins Egg Blue", "Pumpkin", "Mustard", "Mint Green", "Maize", "Lilac", "Kiwi Green", "Hunter Green", "Hot Pink",
  "Forest Green", "Coral",
];

const slug = (value) => norm(value).replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
const money = (amount) => "$" + (Number.isInteger(amount) ? String(amount) : amount.toFixed(2));

function priceFields(price, quantitySource) {
  const priced = price > 0;
  return {
    unitPrice: price,
    priceEnabled: priced,
    priceMode: priced ? "priced" : "included",
    pricingModel: priced ? "flat_per_item" : "included",
    ...(quantitySource ? { quantitySource } : {}),
  };
}

function newChoice(id, label, price, quantitySource) {
  return {
    id, label, description: "", required: false, adminRequired: false, stepCount: 1,
    venueIds: [], excludedVenueIds: [], venuePrices: {}, ...priceFields(price, quantitySource),
  };
}

// Updates a group's choices in place (keeping ids so saved answers survive) and
// adds missing ones. With exclusive, choices not listed are removed.
function setChoices(group, specs, { quantitySource = "parent", exclusive = false } = {}) {
  const existing = (group.options || []).filter((option) => option && typeof option === "object");
  const used = new Set();
  const next = specs.map((spec) => {
    const match = spec.match || new RegExp(`^${norm(spec.label).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    const found = existing.find((option) => !used.has(option) && match.test(norm(option.label)));
    if (found) {
      used.add(found);
      Object.assign(found, priceFields(spec.price, quantitySource), spec.extra || {});
      if (spec.rename) found.label = spec.label;
      return found;
    }
    return { ...newChoice(`${group.id}_${slug(spec.label)}`, spec.label, spec.price, quantitySource), ...(spec.extra || {}) };
  });
  const rest = exclusive ? [] : existing.filter((option) => !used.has(option));
  group.options = [...next, ...rest];
}

function ensureGroup(item, { match, id, label, type }) {
  item.optionGroups = Array.isArray(item.optionGroups) ? item.optionGroups : [];
  let group = item.optionGroups.find((candidate) => match.test(candidate.label || ""));
  if (!group) {
    group = { id, type, label, options: [], required: false, quantitySource: "parent" };
    item.optionGroups.push(group);
  }
  return group;
}

function setItemPrice(item, price, priceText) {
  Object.assign(item, {
    unitPrice: price,
    priceText: priceText || money(price),
    priceEnabled: price > 0,
    pricingModel: price > 0
      ? (["quote", "included", "", undefined].includes(item.pricingModel) ? "flat_per_item" : item.pricingModel)
      : "included",
  });
}

// One checkbox, no quantity picker; the price lives in the choices.
function makeSingleUnit(item) {
  item.quantitySource = "fixed";
  item.hideBaseQuantity = true;
}

function applyV2(state, ctx, log) {
  const { steps, fieldBy, venues, mainHall, largeRoom, patio } = ctx;
  const catalog = state.rentalCatalog;
  const item = (pattern) => catalog.find((entry) => pattern.test(entry.name || ""));
  const items = (pattern) => catalog.filter((entry) => pattern.test(entry.name || ""));
  const groupOf = (entry, pattern) => (entry?.optionGroups || []).find((group) => pattern.test(group.label || ""));
  const rentalVenueIds = [mainHall, largeRoom, patio].filter(Boolean).map((venue) => venue.id);

  // ----- Layouts -----
  const layoutStep = steps.find((step) => step.stepType === "layout");
  if (layoutStep) {
    (layoutStep.layoutSpaces || []).forEach((space) => {
      if (/raised/i.test(space.name || "") && space.visibilityMode === "when_subspace_selected") {
        space.visibilityMode = "parent_without_subspace";
        log(`${space.name} layouts: shown again when no Elevated Area is selected.`);
      }
    });
    let renamed = 0;
    Object.values(layoutStep.floorLayouts || {}).forEach((area) => {
      (area?.layouts || []).forEach((layout) => {
        const rename = RAISED_LAYOUT_NAMES.find(([pattern]) => pattern.test(layout.name || ""));
        const name = rename ? rename[1] : String(layout.name || "").trim();
        if (name !== layout.name) {
          layout.name = name;
          renamed += 1;
        }
      });
    });
    if (renamed) log(`Layouts: ${renamed} layout names cleaned up to the old-site labels.`);
  }

  // ----- Venue availability -----
  let opened = 0;
  catalog.forEach((entry) => {
    if (!(entry.venueIds || []).length && rentalVenueIds.length) {
      entry.venueIds = [...rentalVenueIds];
      opened += 1;
    }
  });
  if (opened) log(`${opened} rental items limited to the Main Hall, Large Room and Back Patio (the Small Room and Lounge had no rentals).`);
  const itLabour = item(/^labour time \(it/i);
  if (itLabour) itLabour.venueIds = [mainHall, largeRoom].filter(Boolean).map((venue) => venue.id);

  // ----- Phone Booth: only with an Elevated Area -----
  const phoneBooth = item(/^phone booth/i);
  if (phoneBooth && mainHall) {
    phoneBooth.venueIds = [mainHall.id];
    phoneBooth.subSpaceIds = (mainHall.subSpace?.options || []).map((option) => option.id).filter(Boolean);
    setItemPrice(phoneBooth, 70);
    makeSingleUnit(phoneBooth);
    log("Phone Booth: $70, offered only when an Elevated Area is booked.");
  }

  // ----- Free items -----
  FREE_ITEMS.forEach((pattern) => items(pattern).forEach((entry) => {
    if (entry.pricingModel !== "quote") return;
    setItemPrice(entry, 0, "Free");
    log(`${entry.name}: free, as on the old site.`);
  }));

  // ----- Variant prices (base price + choice extras) -----
  const variant = (pattern, base, groupMatch, choices) => {
    const entry = item(pattern);
    if (!entry) return null;
    setItemPrice(entry, base);
    const group = groupOf(entry, groupMatch);
    if (group) {
      setChoices(group, choices);
      group.required = true;
      group.quantitySource = "parent";
    }
    log(`${entry.name}: ${money(base)}${choices.filter((choice) => choice.price > 0).map((choice) => `, ${choice.label} +${money(choice.price)}`).join("")}.`);
    return entry;
  };
  variant(/^dinnerware plates \(10/i, 0.7, /style/i, [{ label: "Circular", price: 0 }, { label: "Square", price: 0.3 }]);
  variant(/^dessert plates/i, 0.6, /style/i, [{ label: "Circular", price: 0 }, { label: "Square", price: 0.5 }]);
  variant(/^bread plates/i, 0.6, /style/i, [{ label: "Circular", price: 0 }, { label: "Square", price: 0.5 }]);
  [/^spoons$/i, /^tea spoons$/i, /^forks$/i, /^knives$/i].forEach((pattern) => {
    variant(pattern, 0.65, /style/i, [{ label: "Regular", price: 0 }, { label: "Gold-edge", price: 0.6 }]);
  });
  const teaCups = item(/^tea cups/i);
  if (teaCups) {
    const saucer = ensureGroup(teaCups, { match: /saucer/i, id: "parity_teacup_saucer", label: "Saucer", type: "radio" });
    setChoices(saucer, [{ label: "with no saucer", price: 0 }, { label: "with saucer", price: 0.59 }]);
    saucer.required = true;
    setItemPrice(teaCups, 0.65);
    log("Tea Cups: $0.65, with saucer +$0.59.");
  }

  // Single-unit items whose price depends on the choice.
  const singleChoice = (pattern, base, priceText, groupSpec, choices) => {
    const entry = item(pattern);
    if (!entry) return;
    makeSingleUnit(entry);
    setItemPrice(entry, base, priceText);
    if (base === 0) Object.assign(entry, { pricingModel: "flat_per_item", priceEnabled: false });
    const group = ensureGroup(entry, groupSpec);
    setChoices(group, choices, { quantitySource: "fixed", exclusive: true });
    Object.assign(group, { required: true, quantitySource: "fixed", unitPrice: 0, priceEnabled: false, priceMode: "included", pricingModel: "included" });
    log(`${entry.name}: ${choices.map((choice) => `${choice.label} ${money(base + choice.price)}`).join(", ")}.`);
  };
  singleChoice(/^mobile speaker/i, 30, "", { match: /style|speaker/i, id: "parity_speaker_style", label: "Style", type: "radio" }, [
    { label: "Mobile Speaker only", price: 0 },
    { label: "Mobile Speaker with wireless microphone", price: 15 },
  ]);
  singleChoice(/^crush velvet/i, 0, "From $25", { match: /panel/i, id: "parity_crush_velvet_panels", label: "Panels", type: "radio" }, [
    { label: "Cover all 9 panels (inc. logo)", price: 45 },
    { label: "Cover 3 logo panels", price: 25 },
  ]);
  singleChoice(/^drip coffee machine/i, 0, "From $25", { match: /select|coffee/i, id: "parity_drip_coffee", label: "Select:", type: "radio" }, [
    { label: "with no coffee", match: /no coffee/i, price: 25 },
    { label: "with coffee for 30 cups", match: /with coffee/i, price: 35 },
  ]);
  singleChoice(/^soft seating/i, 0, "$5 each", { match: /seating|sofa/i, id: "parity_soft_seating", label: "Soft Seating", type: "checkbox" }, [
    { label: "Grey Sofa", price: 5 },
    { label: "Yellow Chair", price: 5 },
  ]);
  singleChoice(/^seating wedge/i, 0, "$5 each", { match: /seat/i, id: "parity_seating_wedge", label: "Seating Wedge", type: "checkbox" }, [
    { label: "Seat", price: 5 },
    { label: "Seat with electric outlet", price: 5 },
  ]);
  const backdrop = item(/^backdrop/i);
  const backdropColour = groupOf(backdrop, /colou?r/i);
  if (backdropColour) {
    setChoices(backdropColour, [{ label: "White", price: 0 }, { label: "Black", price: 0 }], { quantitySource: "fixed", exclusive: true });
    backdropColour.required = true;
    log("Backdrop: White or Black, required.");
  }
  const projector = item(/^projector \/ projector screen/i);
  const placement = groupOf(projector, /placement/i);
  if (placement && Number(placement.unitPrice || 0) > 0) {
    Object.assign(placement, { unitPrice: 0, priceEnabled: false, priceMode: "included", pricingModel: "included" });
    log("Projector placement: removed the stray $5 charge.");
  }

  // Panel covers on the Main Hall stage (no catalog entry yet).
  if (mainHall && backdrop && !item(/^panel covers/i)) {
    catalog.push({
      ...clone(backdrop),
      id: "parity_panel_covers_stage",
      name: "Panel Covers (on Stage)",
      venueIds: [mainHall.id],
      optionGroups: [],
      imageUrl: "",
      infoImageUrl: "",
      infoImageUrls: [],
      infoText: "",
      priceKey: "space_other_panelcovers",
      legacyKey: "addcost_panelcovers",
      oldSiteName: "addcost_panelcovers_mh",
      unitPrice: 45,
      priceText: "$45",
      priceEnabled: true,
      pricingModel: "flat_fee",
      quantitySource: "fixed",
      hideBaseQuantity: true,
    });
    log("Added Panel Covers (on Stage), $45, Main Hall.");
  }

  // ----- Shared dinnerware quantity -----
  let sharedCount = 0;
  SHARED_QUANTITY_ITEMS.forEach((pattern) => items(pattern).forEach((entry) => {
    entry.quantitySource = "category";
    entry.hideBaseQuantity = false;
    (entry.optionGroups || []).forEach((group) => (group.options || []).forEach((option) => {
      if (option && typeof option === "object" && Number(option.unitPrice || 0) > 0 && option.quantitySource === "own") option.quantitySource = "parent";
      if (option && typeof option === "object") {
        option.minCount = "";
        option.maxCount = "";
      }
    }));
    sharedCount += 1;
  }));
  const maxByVenue = {};
  if (largeRoom) maxByVenue[largeRoom.id] = 84;
  if (patio) maxByVenue[patio.id] = 84;
  steps.flatMap((step) => step.fields || []).filter((field) => field.type === "rental_group" && /dinnerware/i.test(field.rentalGroup || field.label || "")).forEach((field) => {
    if (field.sharedQuantity?.max) return;
    field.sharedQuantity = { label: "Quantity", min: 12, max: 180, step: 12, maxByVenue, required: true };
    log(`${field.label}: one shared Quantity (12-180 in steps of 12; up to 84 in the Large Room and Back Patio) for ${sharedCount} items.`);
  });

  // ----- Own quantity ranges -----
  ITEM_RANGES.forEach(([pattern, min, max, step = 1]) => items(pattern).forEach((entry) => {
    Object.assign(entry, { minUnits: min, maxUnits: max, increment: step, hideBaseQuantity: false });
    if (["fixed", "parent", "category"].includes(entry.quantitySource)) entry.quantitySource = "own";
  }));
  log(`Quantity ranges set on ${ITEM_RANGES.length} item types (old-site dropdown limits).`);
  const markers = item(/^dry-erase markers/i);
  if (markers) {
    setItemPrice(markers, 1.25, "$5 per 4");
    log("Dry-Erase Markers: packs of 4 at $5.");
  }

  // ----- Cutlery: dessert spoon and fork add-ons -----
  const cutlery = item(/^cutlery - simple/i);
  if (cutlery) {
    const dessert = ensureGroup(cutlery, { match: /dessert/i, id: "parity_dessert_cutlery", label: "Add dessert cutlery", type: "multi_quantity" });
    setChoices(dessert, [{ label: "Dessert Spoon", price: 0.5 }, { label: "Dessert Fork", price: 0.5 }], { quantitySource: "own" });
    dessert.options.forEach((option) => Object.assign(option, { minCount: 0, maxCount: 59 }));
    dessert.quantitySource = "own";
    log("Cutlery - Simple: dessert spoon and dessert fork add-ons at $0.50 each (up to 59).");
  }

  // ----- Napkins -----
  const napkins = item(/^napkins \(linens\)/i);
  const napkinColour = groupOf(napkins, /colou?r/i);
  if (napkinColour) {
    setChoices(napkinColour, NAPKIN_COLOURS.map((label) => ({ label, price: 0 })), { quantitySource: "fixed", exclusive: true });
    const patioColours = new Set(PATIO_NAPKIN_COLOURS.map(norm));
    napkinColour.options.forEach((option) => {
      option.excludedVenueIds = patio && !patioColours.has(norm(option.label)) ? [patio.id] : [];
    });
    napkinColour.required = true;
    const wrapped = groupOf(napkins, /wrapped/i);
    if (wrapped) wrapped.required = true;
    log(`Napkins: ${NAPKIN_COLOURS.length} colours (${PATIO_NAPKIN_COLOURS.length} on the Back Patio); colour and wrapping required.`);
  }

  // ----- Tables and linens -----
  const linenGroup = (entry) => (entry?.optionGroups || []).find((group) => group.type === "radio" && /linen|cover/i.test(group.label || "") && !/spandex/i.test(group.label || ""));
  const requireColour = (entry) => {
    const colour = groupOf(entry, /colou?r/i);
    if (colour) colour.required = true;
  };
  const table4 = item(/^rectangular 4'/i);
  if (linenGroup(table4)) {
    setChoices(linenGroup(table4), [{ label: "Yes", price: 8.75 }, { label: "No", price: 0 }]);
    requireColour(table4);
  }
  const table5 = item(/^rectangular 5'/i);
  if (linenGroup(table5)) {
    setChoices(linenGroup(table5), [{ label: "Yes", price: 0 }, { label: "No", price: 0 }]);
    const colour = groupOf(table5, /colou?r/i);
    if (colour) {
      setChoices(colour, [{ label: "White", price: 5 }, { label: "Blue", price: 5 }, { label: "Other", price: 11 }]);
      colour.required = true;
    }
  }
  [[/^rectangular 6'/i, 20], [/^rectangular 8'/i, 22.25], [/^round tables/i, 20]].forEach(([pattern, fullPrice]) => {
    const entry = item(pattern);
    const linens = linenGroup(entry);
    if (!linens) return;
    setChoices(linens, [
      { label: "No Linens required", match: /^no/i, price: 0 },
      { label: "Half-way to floor", match: /half/i, price: 11.25 },
      { label: "Full-way to floor", match: /full/i, price: fullPrice },
      { label: "Disposable Table Covers", match: /disposable/i, price: 5 },
    ]);
    if (/^round/i.test(entry.name)) linens.required = true;
    requireColour(entry);
    const spandex = groupOf(entry, /spandex/i);
    (spandex?.options || []).forEach((option) => Object.assign(option, { minCount: 0, maxCount: 4 }));
  });
  log("Table linens: old-site prices (4' $8.75; 5' White/Blue $5, Other $11; half-way $11.25; full-way $20, 8' $22.25; disposable $5), colour required.");

  const cocktail = item(/^cocktail tables/i);
  if (cocktail) {
    const linens = groupOf(cocktail, /linens/i);
    if (linens) linens.required = true;
    const cover = groupOf(cocktail, /spandex|colou?r/i);
    if (cover) {
      setChoices(cover, [
        { label: "White", price: 13.5 }, { label: "Black", price: 13.5 }, { label: "Ivory", price: 13.5 },
        { label: "Other Solid Colour", match: /^other/i, price: 13.5 },
        { label: "Gold", price: 16.75 }, { label: "Silver", price: 16.75 }, { label: "Wavy Ivory", price: 16.75 },
      ], { exclusive: true });
      cover.required = true;
    }
    (cocktail.optionGroups || []).filter((group) => group.type === "quantity").forEach((group) => {
      group.settings = { ...(group.settings || {}), max: /bar chair/i.test(group.label || "") ? 58 : 12 };
    });
    log("Cocktail tables: linen choice required, 7 colours ($13.50 solid, $16.75 Gold/Silver/Wavy Ivory), old-site maximums.");
  }

  // ----- Chairs -----
  const chairs = catalog.find((entry) => entry.category === "Chairs" && /^chairs$/i.test(entry.name || ""));
  const chairTypes = groupOf(chairs, /type/i);
  if (chairTypes) {
    chairTypes.required = true;
    const venueChairs = (chairTypes.options || []).find((option) => /^venue chairs/i.test(option.label || ""));
    const blueChairs = (chairTypes.options || []).find((option) => /^blue chairs/i.test(option.label || ""));
    const clearChairs = (chairTypes.options || []).find((option) => /^clear chiavari/i.test(option.label || ""));
    if (venueChairs) {
      Object.assign(venueChairs, { pricingModel: "flat_per_item", priceEnabled: true, priceMode: "priced", unitPrice: 0 });
      if (largeRoom) venueChairs.venuePrices = { ...(venueChairs.venuePrices || {}), [largeRoom.id]: 2 };
    }
    if (clearChairs) {
      clearChairs.unitPrice = 11;
      if (patio) clearChairs.venuePrices = { ...(clearChairs.venuePrices || {}), [patio.id]: 11.25 };
    }
    const covers = groupOf(chairs, /cover/i);
    if (covers) {
      Object.assign(covers, { unitPrice: 0, priceEnabled: false, priceMode: "included", pricingModel: "included", required: true });
      const freeChairIds = [venueChairs, blueChairs].filter(Boolean).map((option) => option.id);
      if (freeChairIds.length) {
        covers.visibility = { mode: "conditional", sourceGroupId: chairTypes.id, operator: "in", value: freeChairIds[0], values: freeChairIds };
      }
      const addCovers = (covers.options || []).find((option) => /add|yes/i.test(option.label || ""));
      if (addCovers) {
        Object.assign(addCovers, priceFields(5, "parent"));
        addCovers.venuePrices = Object.fromEntries([largeRoom, patio].filter(Boolean).map((venue) => [venue.id, 3]));
      }
    }
    const seatMax = {};
    [[mainHall, 59], [largeRoom, 40], [patio, 54]].forEach(([venue, max]) => { if (venue) seatMax[venue.id] = max; });
    chairs.maxUnitsByVenue = { ...(chairs.maxUnitsByVenue || {}), ...seatMax };
    if (!Number(chairs.unitPrice || 0)) chairs.priceText = "Price by chair type";
    log("Chairs: type required; venue chairs $2 in the Large Room; Clear Chiavari $11 ($11.25 on the Patio); covers $5 ($3 outside the Main Hall) for free chairs only; seats up to 59 / 40 / 54.");
  }

  // ----- Catering: buffet table spandex covers -----
  const buffet = fieldBy("f_mq4ynz1a_1001_fdg1", /buffet table/i);
  const buffetSpandex = (buffet?.options || []).find((option) => option && typeof option === "object" && /spandex/i.test(option.label || ""));
  if (buffetSpandex) {
    const onlyDateRule = (buffetSpandex.rules || []).every((rule) => (rule.conditions || []).every((condition) => /^__sys:booking:.*:startDate$/.test(condition.fieldId || "")));
    Object.assign(buffetSpandex, {
      price: 15,
      unitPrice: 15,
      enablePrice: true,
      priceEnabled: true,
      priceMode: "priced",
      pricingModel: "flat_per_item",
      pricingStructure: "per_person",
      hasPeopleOption: true,
      peopleLinkedToGuests: false,
      peopleLabel: "# of covers",
      peopleRange: { min: 1, max: 6, startBlank: true },
      requireSelections: true,
      ...(onlyDateRule ? { rules: [] } : {}),
    });
    log("Buffet Tables Spandex Covers: $15 each, 1-6 covers, offered for every space.");
  }

  if (!venues.length) log("No venues found; venue-specific catalog settings were skipped.");
}
