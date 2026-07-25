"use client";

import React from "react";

import { useTweaks, TweaksPanel, TweakSection, TweakSlider, TweakToggle, TweakRadio, TweakSelect, TweakText, TweakNumber, TweakColor, TweakButton } from "./tweaks";


import "./icons";
import "./runtime-widgets";
import { SIDE_NAV, SIDE_NAV_BOTTOM, SECTION_LABEL, SECTION_PARENT } from "./navigation";
import { SAMPLE_STEPS, FIELD_TYPES, SIMPLE_FIELD_GROUPS, ROOMS } from "./app-data";




Object.assign(window, { SAMPLE_STEPS, FIELD_TYPES, SIMPLE_FIELD_GROUPS, SIDE_NAV, SIDE_NAV_BOTTOM, ROOMS });

const ClientPricingVisibilityContext = React.createContext({ pricesVisible: true });

function useClientPricingVisible() {
  return React.useContext(ClientPricingVisibilityContext).pricesVisible !== false;
}



const SAMPLE_PRICING_RULES = {
  fees: [
    { id: "fee_tax", label: "Tax", valueType: "percentage", amount: 13, applyTo: "final_total", active: true },
  ],
  securityDeposits: [
    { id: "dep_main_private_social_yes", venueId: "v1", venueName: "Main Hall", eventPrivacy: "Private", eventType: "Social Event without dancing / Banquet", alcoholOnSite: "Yes", amount: 500, active: true },
    { id: "dep_main_private_business_yes", venueId: "v1", venueName: "Main Hall", eventPrivacy: "Private", eventType: "Business / Board Meeting", alcoholOnSite: "Yes", amount: 750, active: true },
    { id: "dep_main_semiprivate_social_no", venueId: "v1", venueName: "Main Hall", eventPrivacy: "Semi-private", eventType: "Social Event without dancing / Banquet", alcoholOnSite: "No", amount: 500, active: true },
    { id: "dep_main_public_all_no", venueId: "v1", venueName: "Main Hall", eventPrivacy: "Public", eventType: "All", alcoholOnSite: "No", amount: 1000, active: true },
  ],
  discountSettings: {
    maxCombinedDiscount: { enabled: false, valueType: "percentage", amount: 0 },
  },
  discountRules: [
    {
      id: "disc_not_for_profit",
      name: "Not for Profit Discount",
      valueType: "percentage",
      amount: 0,
      applyTo: "subtotal",
      targets: [],
      conditionsMode: "all",
      conditions: [{ id: "cond_not_for_profit", fieldId: "f6", fieldLabel: "Not for profit", operator: "is_true", value: "true" }],
      stackable: true,
      priority: 10,
      maxDiscount: { enabled: false, valueType: "flat", amount: 0 },
      active: true,
    },
  ],
};

const DISCOUNT_TARGET_OPTIONS = [
  { value: "venue_only", label: "Venue Rental" },
  { value: "space_content_rentals", label: "Space Content Rentals" },
  { value: "catering", label: "Catering" },
  { value: "setup_services", label: "Set up Services" },
  { value: "event_services", label: "Event Services" },
  { value: "cleanup_services", label: "Clear up Services" },
];

const DISCOUNT_CONDITION_OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Does not equal" },
  { value: "contains", label: "Contains" },
  { value: "greater_than", label: "Greater than" },
  { value: "less_than", label: "Less than" },
  { value: "has_value", label: "Has value" },
  { value: "is_empty", label: "Is empty" },
  { value: "is_true", label: "Is checked" },
  { value: "is_false", label: "Is not checked" },
];

const DEFAULT_DELIVERY_OPTIONS = [
  { id: "delivery_small", label: "Delivery - Small Items", amount: 45, active: true, description: "Small supplier drop-off or courier-sized rentals." },
  { id: "delivery_large", label: "Delivery - Large Items / Furniture", amount: 100, active: true, description: "Furniture, tables, chairs, and other bulky rentals." },
];

const PROCUREMENT_TYPES = [
  { value: "internal", label: "Internal" },
  { value: "external", label: "External" },
  { value: "disposable", label: "Disposable" },
];

function normalizeDeliveryOptions(options = DEFAULT_DELIVERY_OPTIONS) {
  const source = Array.isArray(options) && options.length ? options : DEFAULT_DELIVERY_OPTIONS;
  return source.map((option, index) => ({
    id: option.id || uid("delivery"),
    label: option.label || option.name || `Delivery option ${index + 1}`,
    amount: Number(option.amount ?? option.cost ?? option.price ?? 0),
    active: option.active !== false,
    description: option.description || option.notes || "",
  }));
}

function defaultDeliveryOptionIdForClass(deliveryClass = "") {
  const key = String(deliveryClass || "").toLowerCase();
  if (key === "small") return "delivery_small";
  if (key === "large") return "delivery_large";
  return "";
}

function inferProcurementType(item = {}) {
  if (item.procurementType || item.fulfillmentType) return item.procurementType || item.fulfillmentType;
  const text = `${item.name || ""} ${item.category || ""} ${item.priceKey || ""}`.toLowerCase();
  if (text.includes("disposable")) return "disposable";
  return defaultDeliveryOptionIdForClass(item.deliveryClass) ? "external" : "internal";
}

function rentalRequiresDelivery(item = {}) {
  return item.procurementType === "external" && !!item.deliveryRequired && !!item.deliveryOptionId;
}

function deliveryOptionById(siteSettings = SAMPLE_SITE_SETTINGS, id = "") {
  const options = normalizeSiteSettings(siteSettings).fulfillment?.deliveryOptions || [];
  return options.find((option) => String(option.id) === String(id)) || null;
}

function textMatchesDeliveryLine(text = "", line = {}) {
  const source = String(text || "").toLowerCase();
  if (!source || !line) return false;
  const label = String(line.label || "").toLowerCase();
  const amount = Number(line.total || 0);
  const normalizedLabel = label.replace(/^delivery\s*[-–]\s*/i, "").trim();
  return source.includes("delivery")
    && (
      (label && source.includes(label))
      || (normalizedLabel && source.includes(normalizedLabel))
      || (amount > 0 && (source.includes(`$${amount}`) || source.includes(`$${amount.toFixed(0)}`) || source.includes(amount.toFixed(2))))
      || (/small/i.test(source) && /small/i.test(label))
      || (/large|furniture/i.test(source) && /large|furniture/i.test(label))
    );
}

function fieldAutoDeliveryLines(field = {}, deliveryLines = []) {
  if (!String(field.label || "").toLowerCase().includes("delivery")) return [];
  return (deliveryLines || []).filter((line) => !line.manual && textMatchesDeliveryLine(field.label, line));
}

function DeliveryIndicator({ title = "Delivery required" }) {
  const Ic = window.Icons;
  return (
    <span className="delivery-indicator" title={title} aria-label={title}>
      <Ic.Truck size={12} />
    </span>
  );
}

function isDeliveryOptionsField(field = {}) {
  if (field.dynamicSource === "delivery_options") return true;
  if (field.dynamicSource === "static") return false;
  const label = String(field.label || "").toLowerCase();
  if (!["multiselect", "checkbox"].includes(field.type)) return false;
  if (label.includes("3rd party rentals") || label.includes("third party rentals")) return true;
  return label.includes("delivery") && (field.options || []).some((option) => String(optionLabel(option)).toLowerCase().includes("delivery"));
}

function deliveryOptionsForField(siteSettings = null) {
  const site = siteSettings || window.CURRENT_SITE_SETTINGS || SAMPLE_SITE_SETTINGS;
  return normalizeSiteSettings(site).fulfillment?.deliveryOptions || DEFAULT_DELIVERY_OPTIONS;
}

function deliveryOptionFieldRows(siteSettings = null) {
  return deliveryOptionsForField(siteSettings)
    .filter((option) => option.active !== false)
    .map((option) => ({
      id: option.id,
      label: option.label || "Delivery",
      amount: Number(option.amount || 0),
      description: option.description || "",
      display: `${option.label || "Delivery"} ($${Number(option.amount || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })})`,
    }));
}

function deliveryOptionIdFromAnswer(answer, siteSettings = null) {
  const text = String(answer || "");
  if (!text) return "";
  const options = deliveryOptionsForField(siteSettings);
  const byId = options.find((option) => String(option.id) === text);
  if (byId) return byId.id;
  const byText = options.find((option) => textMatchesDeliveryLine(text, { label: option.label, total: option.amount }));
  return byText?.id || "";
}

const RENTAL_CATEGORIES = [
  "Tables",
  "Chairs",
  "Linens",
  "Centerpieces",
  "Dinnerware",
  "Glassware",
  "Cutlery",
  "Serving Equipment",
  "AV / Tech",
  "Decor / Other",
  "Delivery",
];

const SAMPLE_RENTAL_CATALOG = [
  { id: "rt_rect4", name: "Rectangular 4' Table", category: "Tables", priceText: "$8 each", unit: "each", priceKey: "space_rectangle4table", deliveryClass: "large", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rt_rect5", name: "Rectangular 5' Table", category: "Tables", priceText: "Free", unit: "each", priceKey: "space_rectangle5table", deliveryClass: "large", clientVisible: true, active: true, source: "Old site Step 5", notes: "Used heavily in Step 4 layout inclusions." },
  { id: "rt_rect6", name: "Rectangular 6' Table", category: "Tables", priceText: "$12 each", unit: "each", priceKey: "space_rectangle6table", deliveryClass: "large", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rt_rect8", name: "Rectangular 8' Table", category: "Tables", priceText: "$12 each", unit: "each", priceKey: "space_rectangle8table", deliveryClass: "large", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rt_round", name: "Round Table", category: "Tables", priceText: "$12.25 each", unit: "each", priceKey: "space_roundtable", deliveryClass: "large", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rt_cocktail", name: "Cocktail Table", category: "Tables", priceText: "$15 each", unit: "each", priceKey: "space_cocktail_table", deliveryClass: "large", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rt_acrylic_cocktail", name: "Acrylic Cocktail Table", category: "Tables", priceText: "Quote", unit: "each", priceKey: "space_acrylic_cocktail_table", deliveryClass: "large", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },

  { id: "rc_rust", name: "Rust Chair", category: "Chairs", priceText: "$2 each", unit: "each", priceKey: "space_chair_rust", deliveryClass: "large", clientVisible: true, active: true, source: "Old site price JSON", notes: "Often included by selected floor layout." },
  { id: "rc_black_folding", name: "Black Folding Chair", category: "Chairs", priceText: "$2 each", unit: "each", priceKey: "space_black_folding_chair", deliveryClass: "large", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rc_white_folding", name: "White Folding Chair", category: "Chairs", priceText: "$2.25 each", unit: "each", priceKey: "space_white_folding_chair", deliveryClass: "large", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rc_phoenix_crystal", name: "Phoenix Chiavari Chair - Crystal", category: "Chairs", priceText: "$8.50 each", unit: "each", priceKey: "space_phoenix_chiavari_chair_crystal", deliveryClass: "large", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rc_phoenix_black", name: "Phoenix Chiavari Chair - Black", category: "Chairs", priceText: "$8.50 each", unit: "each", priceKey: "space_phoenix_chiavari_chair_black", deliveryClass: "large", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rc_chiavari_crystal", name: "Crystal Chiavari Chair", category: "Chairs", priceText: "$8.50 each", unit: "each", priceKey: "space_chiavari_chair_crystal", deliveryClass: "large", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rc_cover_mh", name: "Chair Cover - Main Hall", category: "Chairs", priceText: "$5 per cover installed", unit: "each", priceKey: "space_chair_cover_mh", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "Installed on Rust chairs." },

  { id: "rl_rect6_hw", name: "6' Table Linen - Halfway", category: "Linens", priceText: "$11.25 each", unit: "each", priceKey: "space_rectangle6_table_linens_white_hw", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "White, ivory, and other share the same old-site price." },
  { id: "rl_rect6_fw", name: "6' Table Linen - Full", category: "Linens", priceText: "$20 each", unit: "each", priceKey: "space_rectangle6_table_linens_white_fw", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rl_rect8_hw", name: "8' Table Linen - Halfway", category: "Linens", priceText: "$11.25 each", unit: "each", priceKey: "space_rectangle8_table_linens_white_hw", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rl_rect8_fw", name: "8' Table Linen - Full", category: "Linens", priceText: "$22.25 each", unit: "each", priceKey: "space_rectangle8_table_linens_white_fw", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rl_round_hw", name: "Round Table Linen - Halfway", category: "Linens", priceText: "$11.25 each", unit: "each", priceKey: "space_round_table_linens_white_hw", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rl_round_fw", name: "Round Table Linen - Full", category: "Linens", priceText: "$20 each", unit: "each", priceKey: "space_round_table_linens_white_fw", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rl_spandex6_white", name: "Spandex 6' Table Cover - White", category: "Linens", priceText: "$18 each", unit: "each", priceKey: "space_spandex6tablecovers_white", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rl_spandex8_black", name: "Spandex 8' Table Cover - Black", category: "Linens", priceText: "$22.25 each", unit: "each", priceKey: "space_spandex8tablecovers_black", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rl_napkins", name: "Napkins - Linen", category: "Linens", priceText: "$0.75 each", unit: "each", priceKey: "space_napkins", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "Old site has many color choices." },

  { id: "rd_greenery", name: "Greenery - Plastic", category: "Centerpieces", priceText: "$1 each", unit: "each", priceKey: "space_centerpiece", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rd_clear_vase", name: "Clear Glass Vase with White Flowers", category: "Centerpieces", priceText: "$5 each", unit: "each", priceKey: "space_clearvase", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },

  { id: "rw_dinner_plate_105", name: "Dinnerware Plates (10.5\")", category: "Dinnerware", priceText: "Included", unit: "each", priceKey: "space_dinnerware_plate", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "Client chooses Circular or Square, each with its own quantity.", hideBaseQuantity: true },
  { id: "rw_dinner_simple_plate", name: "Dinnerware Plates - Simple", category: "Dinnerware", priceText: "$0.65 each", unit: "each", priceKey: "space_dinnerware_plates_simple", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "", minUnits: 1, maxUnits: 100, increment: 1 },
  { id: "rw_disposable_dinner_plate", name: "Disposable Dinner Plate (10\") with Fork and Knife", category: "Dinnerware", priceText: "$7 per dozen", unit: "each", priceKey: "space_disposable_dinner_plate_fork_knife", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "Old site uses dozen-style increments.", minUnits: 12, maxUnits: 180, increment: 12 },
  { id: "rw_disposable_cake_plate", name: "Disposable Cake Plate (7\") with Fork", category: "Dinnerware", priceText: "$3.50 per dozen", unit: "each", priceKey: "space_disposable_cake_plate_fork", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "Old site uses dozen-style increments.", minUnits: 12, maxUnits: 180, increment: 12 },
  { id: "rw_dessert_plate", name: "Dessert Plates (7.5\")", category: "Dinnerware", priceText: "$0.60 each", unit: "each", priceKey: "space_dessert_plate_circular", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "", minUnits: 1, maxUnits: 180, increment: 1 },
  { id: "rw_bread_plate", name: "Bread Plates (6.5\")", category: "Dinnerware", priceText: "$0.60 each", unit: "each", priceKey: "space_bread_plate_circular", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "", minUnits: 1, maxUnits: 180, increment: 1 },
  { id: "rw_salad_bowl", name: "Salad/Soup Bowl", category: "Dinnerware", priceText: "$0.75 each", unit: "each", priceKey: "space_salad_soup_bowl", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "", minUnits: 1, maxUnits: 180, increment: 1 },
  { id: "rw_multipurpose_glass", name: "Multi-purpose Glasses - 14 oz", category: "Dinnerware", priceText: "$0.75 each", unit: "each", priceKey: "space_mp_glasses", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "", minUnits: 1, maxUnits: 180, increment: 1 },
  { id: "rw_speciality_glass", name: "Speciality Glass", category: "Dinnerware", priceText: "$1 each", unit: "each", priceKey: "space_speciality_glass", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "", minUnits: 1, maxUnits: 180, increment: 1 },
  { id: "rw_water_wine_glass", name: "Water/Wine Glasses - 14 oz", category: "Dinnerware", priceText: "$0.75 each", unit: "each", priceKey: "space_water_wine_glasses", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "", minUnits: 1, maxUnits: 180, increment: 1 },
  { id: "rw_stemless_plastic", name: "Stemless Glasses - Plastic - 14 oz", category: "Dinnerware", priceText: "$0.50 each", unit: "each", priceKey: "space_stemless_plastic_glasses", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "Old site uses 24-count increments.", minUnits: 24, maxUnits: 180, increment: 24 },
  { id: "rw_tea_cups", name: "Tea Cups", category: "Dinnerware", priceText: "Included", unit: "each", priceKey: "space_tea_cups", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "Client chooses with or without saucer.", hideBaseQuantity: true },
  { id: "rw_coffee_mugs", name: "Coffee Mugs", category: "Dinnerware", priceText: "$0.65 each", unit: "each", priceKey: "space_coffee_mug", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "", minUnits: 1, maxUnits: 180, increment: 1 },
  { id: "rw_spoons", name: "Spoons", category: "Dinnerware", priceText: "$0.65 each", unit: "each", priceKey: "space_spoons", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "", minUnits: 1, maxUnits: 180, increment: 1 },
  { id: "rw_tea_spoons", name: "Tea Spoons", category: "Dinnerware", priceText: "Quote", unit: "each", priceKey: "space_tea_spoons", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "Old site shows this as selectable without a clear fixed price.", minUnits: 1, maxUnits: 180, increment: 1 },
  { id: "rw_forks", name: "Forks", category: "Dinnerware", priceText: "$0.65 each", unit: "each", priceKey: "space_forks", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "", minUnits: 1, maxUnits: 180, increment: 1 },
  { id: "rw_knives", name: "Knives", category: "Dinnerware", priceText: "$0.65 each", unit: "each", priceKey: "space_knives", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "", minUnits: 1, maxUnits: 180, increment: 1 },
  { id: "rw_cutlery_simple", name: "Cutlery - Simple (set of 5)", category: "Dinnerware", priceText: "$2.50 per set", unit: "set", priceKey: "space_dinnerware_cutlery_simple", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "", minUnits: 1, maxUnits: 100, increment: 1 },
  { id: "rw_linen_napkins", name: "Napkins (Linens)", category: "Dinnerware", priceText: "$0.75 each", unit: "each", priceKey: "space_napkins", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "Includes color and wrapped-cutlery choices.", minUnits: 1, maxUnits: 180, increment: 1 },

  { id: "rg_multipurpose", name: "Multi-purpose Glass 14 oz", category: "Glassware", priceText: "$0.75 each", unit: "each", priceKey: "space_mp_glasses", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rg_speciality", name: "Speciality Glass", category: "Glassware", priceText: "$1 each", unit: "each", priceKey: "space_speciality_glass", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rg_water_wine", name: "Water / Wine Glass 14 oz", category: "Glassware", priceText: "$0.75 each", unit: "each", priceKey: "space_water_wine_glasses", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },

  { id: "rk_spoon_reg", name: "Spoon - Regular", category: "Cutlery", priceText: "$0.65 each", unit: "each", priceKey: "space_spoons_reg", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rk_spoon_gold", name: "Spoon - Gold-edge", category: "Cutlery", priceText: "$1.25 each", unit: "each", priceKey: "space_spoons_ge", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rk_fork_reg", name: "Fork - Regular", category: "Cutlery", priceText: "$0.65 each", unit: "each", priceKey: "space_forks_reg", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rk_knife_reg", name: "Knife - Regular", category: "Cutlery", priceText: "$0.65 each", unit: "each", priceKey: "space_knives_reg", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rk_simple_set", name: "Cutlery - Simple Set of 5", category: "Cutlery", priceText: "$2.50 per set", unit: "set", priceKey: "space_dinnerware_cutlery_simple", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },

  { id: "rs_chafing", name: "Chafing Dish", category: "Serving Equipment", priceText: "$23.25 each", unit: "each", priceKey: "space_chafing_dishes", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rs_chafing_rollup", name: "Chafing Dish Rollup", category: "Serving Equipment", priceText: "$33.25 each", unit: "each", priceKey: "space_chafing_kits_rollup", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rs_sterno", name: "Sternos Fire", category: "Serving Equipment", priceText: "$7 each", unit: "each", priceKey: "space_sternos_fire", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rs_crockpot", name: "Crock-Pot 8 Qt", category: "Serving Equipment", priceText: "$20 each", unit: "each", priceKey: "space_soupwarmers", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },
  { id: "rs_water_jug", name: "Water Jug", category: "Serving Equipment", priceText: "$3 each", unit: "each", priceKey: "space_water_jugs", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "" },

  { id: "ra_sound_system", name: "Sound System", category: "AV / Tech", priceText: "Free", unit: "flat", priceKey: "space_tech_sound_system", deliveryClass: "none", clientVisible: true, active: true, source: "Old site Step 5", notes: "", clientSelectable: true, hideBaseQuantity: true },
  { id: "ra_wired_mic", name: "Wired Mic", category: "AV / Tech", priceText: "Free", unit: "each", priceKey: "space_tech_wired_mic", deliveryClass: "none", clientVisible: true, active: true, source: "Old site Step 5", notes: "", clientSelectable: true, hideBaseQuantity: true },
  { id: "ra_extension_cables", name: "Extension cables for tables", category: "AV / Tech", priceText: "Free", unit: "flat", priceKey: "space_tech_extension_cables", deliveryClass: "none", clientVisible: true, active: true, source: "Old site Step 5", notes: "Subject to availability.", clientSelectable: true, hideBaseQuantity: true },
  { id: "ra_av_deluxe", name: "AV Deluxe Package", category: "AV / Tech", priceText: "$350", unit: "package", priceKey: "space_other_avdeluxepackage", deliveryClass: "none", clientVisible: true, active: true, source: "Old site Step 5", notes: "Package preset that includes PTZ camera, wireless mics, presentation support, and IT labor.", clientSelectable: true, hideBaseQuantity: true },
  { id: "ra_projector", name: "Projector / Projector Screen", category: "AV / Tech", priceText: "$100", unit: "flat", priceKey: "space_other_projectorscreen", deliveryClass: "none", clientVisible: true, active: true, source: "Old site Step 5", notes: "Suspended middle stage option adds $25 extra.", clientSelectable: true, hideBaseQuantity: true },
  { id: "ra_web_conference_camera", name: "Web conference Camera", category: "AV / Tech", priceText: "$30", unit: "flat", priceKey: "space_tech_web_conference_camera", deliveryClass: "none", clientVisible: true, active: true, source: "Old site Step 5", notes: "Subject to availability.", clientSelectable: true, hideBaseQuantity: true },
  { id: "ra_mobile_tv", name: "Mobile TV (45\")", category: "AV / Tech", priceText: "$75", unit: "flat", priceKey: "space_other_mobiletv", deliveryClass: "none", clientVisible: true, active: true, source: "Old site Step 5", notes: "", clientSelectable: true, hideBaseQuantity: true },
  { id: "ra_ptz", name: "PTZ camera", category: "AV / Tech", priceText: "$100", unit: "flat", priceKey: "space_other_ptzcamera", deliveryClass: "none", clientVisible: true, active: true, source: "Old site Step 5", notes: "", clientSelectable: true, hideBaseQuantity: true },
  { id: "ra_wireless_mic", name: "Wireless Mics", category: "AV / Tech", priceText: "$25 first, $10 additional", unit: "each", priceKey: "space_other_wirelessmic", deliveryClass: "none", clientVisible: true, active: true, source: "Old site Step 5", notes: "$25 for one, $10 for each additional one.", clientSelectable: true, hideBaseQuantity: true },
  { id: "ra_wireless_headsets", name: "Wireless Headsets", category: "AV / Tech", priceText: "$25 first, $10 additional", unit: "each", priceKey: "space_tech_wireless_headsets", deliveryClass: "none", clientVisible: true, active: true, source: "Old site Step 5", notes: "$25 for one, $10 for each additional one.", clientSelectable: true, hideBaseQuantity: true },
  { id: "ra_powerpoint_clicker", name: "Powerpoint Presentation Clicker", category: "AV / Tech", priceText: "$10 each", unit: "each", priceKey: "space_tech_powerpoint_clicker", deliveryClass: "none", clientVisible: true, active: true, source: "Old site Step 5", notes: "", clientSelectable: true, hideBaseQuantity: true },
  { id: "ra_it_labour", name: "Labour Time - IT Tech", category: "AV / Tech", priceText: "$60/hour for 1 person", unit: "hour", priceKey: "space_other_labourtimeittech", deliveryClass: "none", clientVisible: true, active: true, source: "Old site Step 5", notes: "", clientSelectable: true, minUnits: 1, maxUnits: 12, increment: 1 },
  { id: "ra_tech_setup_questions", name: "Tech setup questions", category: "AV / Tech", priceText: "Included", unit: "flat", priceKey: "space_tech_setup_questions", deliveryClass: "none", clientVisible: true, active: true, source: "Old site Step 5 questions", notes: "Non-priced questions that help the team prepare AV setup.", clientSelectable: false, hideBaseQuantity: true },

  { id: "ro_podium", name: "Podium", category: "Decor / Other", priceText: "$30", unit: "flat", priceKey: "space_other_podium", deliveryClass: "none", clientVisible: true, active: true, source: "Old site Step 5", notes: "", clientSelectable: true, hideBaseQuantity: true },
  { id: "ro_disco_lights", name: "Disco Lights", category: "Decor / Other", priceText: "Free", unit: "flat", priceKey: "space_other_disco_lights", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "", clientSelectable: true, hideBaseQuantity: true },
  { id: "ro_booth_table", name: "Booth Table", category: "Decor / Other", priceText: "Free", unit: "flat", priceKey: "space_other_booth_table", deliveryClass: "large", clientVisible: true, active: true, source: "Old site Step 5", notes: "", clientSelectable: true, hideBaseQuantity: true },
  { id: "ro_coloured_table", name: "Coloured Table", category: "Decor / Other", priceText: "Free", unit: "flat", priceKey: "space_other_coloured_table", deliveryClass: "large", clientVisible: true, active: true, source: "Old site Step 5", notes: "", clientSelectable: true, hideBaseQuantity: true },
  { id: "ro_helper_labour", name: "Labour Time - Helper", category: "Decor / Other", priceText: "$30/hour for 1 person", unit: "hour", priceKey: "space_other_labourtimehelper", deliveryClass: "none", clientVisible: true, active: true, source: "Old site Step 5", notes: "", clientSelectable: true, minUnits: 1, maxUnits: 12, increment: 1, defaultUnits: 2 },
  { id: "ro_backdrop", name: "Backdrop", category: "Decor / Other", priceText: "$180", unit: "flat", priceKey: "space_other_backdrop", deliveryClass: "large", clientVisible: true, active: true, source: "Old site Step 5", notes: "Old site asks for backdrop color.", clientSelectable: true, hideBaseQuantity: true },
  { id: "ro_curtains_side_windows", name: "Curtains for 4 Side Windows", category: "Decor / Other", priceText: "$40", unit: "flat", priceKey: "space_other_curtains_4_side_windows", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "", clientSelectable: true, hideBaseQuantity: true },
  { id: "ro_curtains_big_window", name: "Curtains for Big Window", category: "Decor / Other", priceText: "$20", unit: "flat", priceKey: "space_other_curtains_big_window", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "", clientSelectable: true, hideBaseQuantity: true },
  { id: "ro_inside_window_curtain", name: "Inside Window Curtain", category: "Decor / Other", priceText: "$10", unit: "flat", priceKey: "space_other_inside_window_curtain", deliveryClass: "small", clientVisible: true, active: true, source: "Old site Step 5", notes: "", clientSelectable: true, hideBaseQuantity: true },
  { id: "ro_whiteboards", name: "Whiteboards", category: "Decor / Other", priceText: "Free", unit: "each", priceKey: "space_other_whiteboards", deliveryClass: "large", clientVisible: true, active: true, source: "Old site Step 5", notes: "Old site lets client choose 1 or 2.", clientSelectable: true, hideBaseQuantity: true },
  { id: "ro_booth_benches", name: "Booth Benches", category: "Decor / Other", priceText: "Free", unit: "each", priceKey: "space_other_booth_benches", deliveryClass: "large", clientVisible: true, active: true, source: "Old site Step 5", notes: "Old site lets client choose 1 or 2.", clientSelectable: true, hideBaseQuantity: true },
  { id: "ro_caketable", name: "Cake Table", category: "Decor / Other", priceText: "$15 each", unit: "each", priceKey: "space_other_caketable", deliveryClass: "large", clientVisible: true, active: true, source: "Old site Step 5", notes: "Old site lets client choose 1 or 2.", clientSelectable: true, hideBaseQuantity: true },
  { id: "ro_high_chairs_yellow", name: "High Chairs Yellow", category: "Decor / Other", priceText: "Free", unit: "each", priceKey: "space_other_high_chairs_yellow", deliveryClass: "large", clientVisible: true, active: true, source: "Old site Step 5", notes: "Old site lets client choose 1 to 4.", clientSelectable: true, hideBaseQuantity: true },

  { id: "ry_delivery_small", name: "Delivery - Small Items", category: "Delivery", priceText: "$45", unit: "flat", priceKey: "delivery_small_items", deliveryClass: "none", clientVisible: true, active: true, source: "Old site Step 5 note", notes: "Old site note: linens, utensils, dinnerware, or glassware may only be $45." },
  { id: "ry_delivery_large", name: "Delivery - Large / Furniture", category: "Delivery", priceText: "$100", unit: "flat", priceKey: "delivery_large_items", deliveryClass: "none", clientVisible: true, active: true, source: "Old site Step 5 note", notes: "Old site note: round tables or Chiavari chairs may include $100 delivery." },
];

const RENTAL_PRICING_MODELS = [
  { value: "flat_per_item", label: "Flat per item", unit: "/ item" },
  { value: "flat_fee", label: "Flat fee", unit: "flat" },
  { value: "per_hour", label: "Per hour", unit: "/ hr" },
  { value: "per_person", label: "Per person", unit: "/ person" },
  { value: "per_person_per_hour", label: "Per person per hour", unit: "/ person / hr" },
  { value: "package_fixed", label: "Package fixed", unit: "package" },
  { value: "included", label: "Included", unit: "included" },
  { value: "quote", label: "Quote separately", unit: "quote" },
];

const RENTAL_QUANTITY_SOURCES = [
  { value: "own", label: "Ask for this item" },
  { value: "parent", label: "Inherit parent quantity" },
  { value: "guest_count", label: "Use guest count" },
  { value: "layout_recommendation", label: "Default from Step 4" },
  { value: "fixed", label: "Fixed package quantity" },
  { value: "custom_override", label: "Inherit, allow override" },
];

const LEGACY_RENTAL_ARCHITECTURE = {
  rt_rect6: {
    schemaVersion: 1,
    legacyKey: "space_rectangle6table",
    pricingModel: "flat_per_item",
    unitPrice: 12,
    quantitySource: "layout_recommendation",
    optionGroups: [
      {
        id: "rect6_quantity",
        label: "# of Rectangular 6' Tables",
        type: "quantity",
        required: true,
        quantitySource: "layout_recommendation",
        min: 0,
        max: 99,
        rules: [{ effect: "default_from_step", source: "layout_recommendation.rect6_table_count" }],
      },
      {
        id: "rect6_linens",
        label: "Table Covers / Linens",
        type: "radio",
        required: false,
        quantitySource: "parent",
        options: [
          { id: "no_linens", label: "No Linens required", pricingModel: "included", unitPrice: 0 },
          { id: "half_floor", label: "Half-way to floor", pricingModel: "flat_per_item", unitPrice: 11.25, legacyKey: "space_rectangle6_table_linens_white_hw" },
          { id: "full_floor", label: "Full-way to floor", pricingModel: "flat_per_item", unitPrice: 20, legacyKey: "space_rectangle6_table_linens_white_fw" },
          { id: "disposable", label: "Disposable Table Covers", pricingModel: "flat_per_item", unitPrice: 5, legacyKey: "space_rectangle6_table_linens_white_disp" },
        ],
      },
      {
        id: "linen_color",
        label: "Linen Color",
        type: "select",
        quantitySource: "parent",
        options: ["White", "Ivory", "Other"],
        visibility: { mode: "conditional", sourceGroupId: "rect6_linens", operator: "not_equals", value: "no_linens" },
      },
      {
        id: "rect6_spandex",
        label: "Add additional Spandex table cover",
        type: "multi_quantity",
        required: false,
        quantitySource: "own",
        options: [
          { id: "white", label: "White", pricingModel: "flat_per_item", unitPrice: 18, legacyKey: "space_spandex6tablecovers_white" },
          { id: "black", label: "Black", pricingModel: "flat_per_item", unitPrice: 22.25, legacyKey: "space_spandex6tablecovers_black" },
        ],
      },
    ],
    migrationNotes: [
      "Old site shows linen color only when a paid linen/disposable option is selected.",
      "Spandex quantities are separate add-ons, not inherited from table count.",
      "Step 4 can prefill this quantity from selected layout includes.",
    ],
  },
  rw_dinner_plate_105: {
    schemaVersion: 1,
    pricingModel: "included",
    unitPrice: 0,
    quantitySource: "fixed",
    hideBaseQuantity: true,
    optionGroups: [
      {
        id: "dinnerware_plate_shape",
        label: "Plate style",
        type: "multi_quantity",
        quantitySource: "own",
        options: [
          { id: "circular", label: "Circular", pricingModel: "flat_per_item", priceEnabled: true, unitPrice: 0.7, quantitySource: "own", minCount: 1, maxCount: 180, stepCount: 1 },
          { id: "square", label: "Square", pricingModel: "flat_per_item", priceEnabled: true, unitPrice: 1, quantitySource: "own", minCount: 1, maxCount: 180, stepCount: 1 },
        ],
      },
    ],
    migrationNotes: ["This replaces the old nested Dinnerware section row for 10.5-inch plates."],
  },
  rw_tea_cups: {
    schemaVersion: 1,
    pricingModel: "included",
    unitPrice: 0,
    quantitySource: "fixed",
    hideBaseQuantity: true,
    optionGroups: [
      {
        id: "tea_cup_style",
        label: "Tea cup style",
        type: "multi_quantity",
        quantitySource: "own",
        options: [
          { id: "no_saucer", label: "With no saucer", pricingModel: "flat_per_item", priceEnabled: true, unitPrice: 0.65, quantitySource: "own", minCount: 1, maxCount: 180, stepCount: 1 },
          { id: "with_saucer", label: "With saucer", pricingModel: "flat_per_item", priceEnabled: true, unitPrice: 1.24, quantitySource: "own", minCount: 1, maxCount: 180, stepCount: 1 },
        ],
      },
    ],
    migrationNotes: ["This keeps the old site's two tea-cup variants inside one rental item."],
  },
  rw_linen_napkins: {
    schemaVersion: 1,
    pricingModel: "flat_per_item",
    unitPrice: 0.75,
    quantitySource: "own",
    optionGroups: [
      {
        id: "napkin_color",
        label: "Napkin Colour",
        type: "select",
        quantitySource: "fixed",
        options: ["White", "Black", "Ivory", "Other"],
      },
      {
        id: "wrapped_napkin",
        label: "Cutlery Wrapped in Napkin?",
        type: "radio",
        quantitySource: "own",
        options: [
          { id: "yes", label: "Yes", pricingModel: "flat_per_item", priceEnabled: true, unitPrice: 1, quantitySource: "parent" },
          { id: "no", label: "No", pricingModel: "included", unitPrice: 0, quantitySource: "fixed" },
        ],
      },
    ],
    migrationNotes: ["Napkin color and wrapped-cutlery are options on the Napkins rental item."],
  },
  ro_helper_labour: {
    schemaVersion: 1,
    pricingModel: "per_hour",
    unitPrice: 30,
    quantitySource: "own",
    clientSelectable: true,
    defaultUnits: 2,
    migrationNotes: ["Old site dropdown appears beside the checkbox; mapped as hours after selecting this item."],
  },
  ro_backdrop: {
    schemaVersion: 1,
    pricingModel: "flat_fee",
    unitPrice: 180,
    quantitySource: "fixed",
    hideBaseQuantity: true,
    clientSelectable: true,
    optionGroups: [
      {
        id: "backdrop_color",
        label: "Backdrop color",
        type: "select",
        quantitySource: "fixed",
        options: ["White", "Black", "Other"],
        placeholder: "Select color",
      },
    ],
    migrationNotes: ["Old site shows a color dropdown after Backdrop is selected."],
  },
  ro_whiteboards: {
    schemaVersion: 1,
    pricingModel: "included",
    unitPrice: 0,
    quantitySource: "fixed",
    hideBaseQuantity: true,
    clientSelectable: true,
    optionGroups: [
      {
        id: "whiteboard_count",
        label: "How many whiteboards?",
        type: "radio",
        quantitySource: "fixed",
        options: ["1", "2"],
      },
    ],
  },
  ro_booth_benches: {
    schemaVersion: 1,
    pricingModel: "included",
    unitPrice: 0,
    quantitySource: "fixed",
    hideBaseQuantity: true,
    clientSelectable: true,
    optionGroups: [
      {
        id: "booth_bench_count",
        label: "How many booth benches?",
        type: "radio",
        quantitySource: "fixed",
        options: ["1", "2"],
      },
    ],
  },
  ro_caketable: {
    schemaVersion: 1,
    pricingModel: "included",
    unitPrice: 0,
    quantitySource: "fixed",
    hideBaseQuantity: true,
    clientSelectable: true,
    optionGroups: [
      {
        id: "cake_table_count",
        label: "How many cake tables?",
        type: "radio",
        quantitySource: "fixed",
        options: [
          { id: "one", label: "1", pricingModel: "flat_fee", priceEnabled: true, unitPrice: 15, quantitySource: "fixed" },
          { id: "two", label: "2", pricingModel: "flat_fee", priceEnabled: true, unitPrice: 30, quantitySource: "fixed" },
        ],
      },
    ],
    migrationNotes: ["Old site price is $15 each, but the UI uses radio counts 1 or 2."],
  },
  ro_high_chairs_yellow: {
    schemaVersion: 1,
    pricingModel: "included",
    unitPrice: 0,
    quantitySource: "fixed",
    hideBaseQuantity: true,
    clientSelectable: true,
    optionGroups: [
      {
        id: "high_chair_count",
        label: "How many high chairs?",
        type: "radio",
        quantitySource: "fixed",
        options: ["1", "2", "3", "4"],
      },
    ],
  },
  rw_dinnerware_old_site: {
    schemaVersion: 1,
    pricingModel: "included",
    unitPrice: 0,
    quantitySource: "fixed",
    hideBaseQuantity: true,
    optionGroups: [
      {
        id: "dinnerware_plate_shape",
        label: "Dinnerware Plates (10.5\")",
        type: "checkbox_row",
        required: false,
        quantitySource: "own",
        description: "",
        options: [
          { id: "circular", label: "Circular", pricingModel: "flat_per_item", priceEnabled: true, unitPrice: 0.7, quantitySource: "own", minCount: 1, maxCount: 180, stepCount: 1 },
          { id: "square", label: "Square", pricingModel: "flat_per_item", priceEnabled: true, unitPrice: 1, quantitySource: "own", minCount: 1, maxCount: 180, stepCount: 1 },
        ],
      },
      {
        id: "dinnerware_simple_plate",
        label: "Dinnerware Plates - Simple",
        type: "checkbox_row",
        quantitySource: "own",
        priceMode: "priced",
        priceEnabled: true,
        pricingModel: "flat_per_item",
        unitPrice: 0.65,
        settings: { min: 1, max: 100, step: 1, defaultValue: 1 },
      },
      {
        id: "dinnerware_disposable_dinner",
        label: "Disposable Dinner Plate (10\") with Fork and Knife",
        type: "checkbox_row",
        quantitySource: "own",
        priceMode: "priced",
        priceEnabled: true,
        pricingModel: "flat_per_item",
        unitPrice: 7,
        settings: { min: 12, max: 180, step: 12, defaultValue: 24 },
      },
      {
        id: "dinnerware_disposable_cake",
        label: "Disposable Cake Plate (7\") with Fork",
        type: "checkbox_row",
        quantitySource: "own",
        priceMode: "priced",
        priceEnabled: true,
        pricingModel: "flat_per_item",
        unitPrice: 3.5,
        settings: { min: 12, max: 180, step: 12, defaultValue: 48 },
      },
      {
        id: "dinnerware_dessert_plate",
        label: "Dessert Plates (7.5\")",
        type: "checkbox_row",
        quantitySource: "own",
        priceMode: "priced",
        priceEnabled: true,
        pricingModel: "flat_per_item",
        unitPrice: 0.6,
        settings: { min: 1, max: 180, step: 1, defaultValue: 1 },
      },
      {
        id: "dinnerware_bread_plate",
        label: "Bread Plates (6.5\")",
        type: "checkbox_row",
        quantitySource: "own",
        priceMode: "priced",
        priceEnabled: true,
        pricingModel: "flat_per_item",
        unitPrice: 0.6,
        settings: { min: 1, max: 180, step: 1, defaultValue: 1 },
      },
      {
        id: "dinnerware_salad_bowl",
        label: "Salad/Soup Bowl",
        type: "checkbox_row",
        quantitySource: "own",
        priceMode: "priced",
        priceEnabled: true,
        pricingModel: "flat_per_item",
        unitPrice: 0.75,
        settings: { min: 1, max: 180, step: 1, defaultValue: 1 },
      },
      {
        id: "dinnerware_multi_glass",
        label: "Multi-purpose Glasses - 14 oz",
        type: "checkbox_row",
        quantitySource: "own",
        priceMode: "priced",
        priceEnabled: true,
        pricingModel: "flat_per_item",
        unitPrice: 0.75,
        settings: { min: 1, max: 180, step: 1, defaultValue: 1 },
      },
      {
        id: "dinnerware_speciality_glass",
        label: "Speciality Glass",
        type: "checkbox_row",
        quantitySource: "own",
        priceMode: "priced",
        priceEnabled: true,
        pricingModel: "flat_per_item",
        unitPrice: 1,
        settings: { min: 1, max: 180, step: 1, defaultValue: 1 },
      },
      {
        id: "dinnerware_water_wine_glass",
        label: "Water/Wine Glasses - 14 oz",
        type: "checkbox_row",
        quantitySource: "own",
        priceMode: "priced",
        priceEnabled: true,
        pricingModel: "flat_per_item",
        unitPrice: 0.75,
        settings: { min: 1, max: 180, step: 1, defaultValue: 1 },
      },
      {
        id: "dinnerware_stemless_plastic",
        label: "Stemless Glasses - Plastic - 14 oz",
        type: "checkbox_row",
        quantitySource: "own",
        priceMode: "priced",
        priceEnabled: true,
        pricingModel: "flat_per_item",
        unitPrice: 0.5,
        settings: { min: 24, max: 180, step: 24, defaultValue: 24 },
      },
      {
        id: "dinnerware_tea_cups",
        label: "Tea Cups",
        type: "checkbox_row",
        quantitySource: "own",
        options: [
          { id: "no_saucer", label: "with no saucer", pricingModel: "flat_per_item", priceEnabled: true, unitPrice: 0.65, quantitySource: "own", minCount: 1, maxCount: 180, stepCount: 1 },
          { id: "with_saucer", label: "with saucer", pricingModel: "flat_per_item", priceEnabled: true, unitPrice: 1.24, quantitySource: "own", minCount: 1, maxCount: 180, stepCount: 1 },
        ],
      },
      {
        id: "dinnerware_coffee_mugs",
        label: "Coffee Mugs",
        type: "checkbox_row",
        quantitySource: "own",
        priceMode: "priced",
        priceEnabled: true,
        pricingModel: "flat_per_item",
        unitPrice: 0.65,
        settings: { min: 1, max: 180, step: 1, defaultValue: 1 },
      },
      {
        id: "dinnerware_spoons",
        label: "Spoons",
        type: "checkbox_row",
        quantitySource: "own",
        priceMode: "priced",
        priceEnabled: true,
        pricingModel: "flat_per_item",
        unitPrice: 0.65,
        settings: { min: 1, max: 180, step: 1, defaultValue: 1 },
      },
      {
        id: "dinnerware_tea_spoons",
        label: "Tea Spoons",
        type: "checkbox_row",
        quantitySource: "own",
        priceMode: "quote",
        pricingModel: "quote",
        settings: { min: 1, max: 180, step: 1, defaultValue: 1 },
      },
      {
        id: "dinnerware_forks",
        label: "Forks",
        type: "checkbox_row",
        quantitySource: "own",
        priceMode: "priced",
        priceEnabled: true,
        pricingModel: "flat_per_item",
        unitPrice: 0.65,
        settings: { min: 1, max: 180, step: 1, defaultValue: 1 },
      },
      {
        id: "dinnerware_knives",
        label: "Knives",
        type: "checkbox_row",
        quantitySource: "own",
        priceMode: "priced",
        priceEnabled: true,
        pricingModel: "flat_per_item",
        unitPrice: 0.65,
        settings: { min: 1, max: 180, step: 1, defaultValue: 1 },
      },
      {
        id: "dinnerware_cutlery_simple",
        label: "Cutlery - Simple (set of 5)",
        type: "checkbox_row",
        quantitySource: "own",
        priceMode: "priced",
        priceEnabled: true,
        pricingModel: "flat_per_item",
        unitPrice: 2.5,
        settings: { min: 1, max: 100, step: 1, defaultValue: 1 },
      },
      {
        id: "dinnerware_linen_napkins",
        label: "Napkins (Linens)",
        type: "checkbox_row",
        quantitySource: "own",
        priceMode: "priced",
        priceEnabled: true,
        pricingModel: "flat_per_item",
        unitPrice: 0.75,
        settings: { min: 1, max: 180, step: 1, defaultValue: 1 },
      },
      {
        id: "dinnerware_napkin_color",
        label: "Napkin Colour",
        type: "select",
        quantitySource: "fixed",
        options: ["White", "Black", "Ivory", "Other"],
        visibility: { mode: "conditional", sourceGroupId: "dinnerware_linen_napkins", operator: "answered" },
      },
      {
        id: "dinnerware_wrapped_napkin",
        label: "Cutlery Wrapped in Napkin?",
        type: "radio",
        quantitySource: "own",
        visibility: { mode: "conditional", sourceGroupId: "dinnerware_linen_napkins", operator: "answered" },
        options: [
          { id: "yes", label: "Yes", pricingModel: "flat_per_item", priceEnabled: true, unitPrice: 1, quantitySource: "parent" },
          { id: "no", label: "No", pricingModel: "included", unitPrice: 0, quantitySource: "fixed" },
        ],
      },
    ],
    migrationNotes: [
      "Removed the old parent Dinnerware quantity to avoid hidden inheritance rules.",
      "Each dinnerware line keeps old-site order and appears as a checkbox row.",
      "When a client checks a row, that row reveals its quantity field or its variant quantities.",
    ],
  },
  rw_dinner_circular: {
    schemaVersion: 1,
    legacyKey: "space_dinnerware_plate_circular",
    pricingModel: "flat_per_item",
    unitPrice: 0.7,
    quantitySource: "custom_override",
    optionGroups: [
      {
        id: "dinnerware_parent_quantity",
        label: "Dinnerware quantity",
        type: "quantity",
        quantitySource: "own",
        rules: [{ effect: "default_for_children", target: "checked dinnerware options" }],
      },
      {
        id: "dinner_plate_shape",
        label: "Plate shape",
        type: "radio",
        quantitySource: "parent",
        options: [
          { id: "circular", label: "Circular", unitPrice: 0.7, legacyKey: "space_dinnerware_plate_circular" },
          { id: "square", label: "Square", unitPrice: 1, legacyKey: "space_dinnerware_plate_square" },
        ],
      },
    ],
    migrationNotes: [
      "Use the parent dinnerware quantity by default.",
      "Expose per-option override only when an item needs a different count.",
    ],
  },
  ra_av_deluxe: {
    schemaVersion: 1,
    legacyKey: "space_other_avdeluxepackage",
    pricingModel: "package_fixed",
    unitPrice: 350,
    quantitySource: "fixed",
    clientSelectable: true,
    hideBaseQuantity: true,
    packageBehavior: {
      type: "editable_preset",
      includedItemsRemovable: true,
      includedItemPricing: "included_by_package",
      allowIndividualExtras: true,
      includedItems: [
        { itemId: "ra_ptz", label: "PTZ camera", removable: true },
        { itemId: "ra_wireless_mic", label: "Wireless Mics", removable: true },
        { itemId: "ra_powerpoint_clicker", label: "Powerpoint Presentation Clicker", removable: true },
        { itemId: "ra_it_labour", label: "Labour Time - IT Tech", removable: true },
      ],
      upgrades: [
        { id: "add_projector", label: "Projector / Projector Screen", pricingModel: "flat_fee", unitPrice: 100 },
      ],
    },
    migrationNotes: [
      "Old site checks included AV items when AV Deluxe is selected.",
      "Model this as an editable preset package: included items auto-appear, but admin can still sell items individually.",
    ],
  },
  ra_projector: {
    schemaVersion: 1,
    pricingModel: "flat_fee",
    unitPrice: 100,
    quantitySource: "fixed",
    clientSelectable: true,
    hideBaseQuantity: true,
    optionGroups: [
      {
        id: "projector_suspend",
        label: "Projector setup",
        type: "checkbox",
        quantitySource: "fixed",
        options: [
          { id: "suspended_middle_stage", label: "Suspended middle stage projector", pricingModel: "flat_fee", priceEnabled: true, unitPrice: 25, quantitySource: "fixed" },
        ],
      },
    ],
  },
  ra_wireless_mic: {
    schemaVersion: 1,
    pricingModel: "included",
    unitPrice: 0,
    quantitySource: "fixed",
    clientSelectable: true,
    hideBaseQuantity: true,
    optionGroups: [
      {
        id: "wireless_mic_count",
        label: "How many wireless mics?",
        type: "radio",
        quantitySource: "fixed",
        options: [
          { id: "one", label: "1 mic", pricingModel: "flat_fee", priceEnabled: true, unitPrice: 25, quantitySource: "fixed" },
          { id: "two", label: "2 mics", pricingModel: "flat_fee", priceEnabled: true, unitPrice: 35, quantitySource: "fixed" },
          { id: "three", label: "3 mics", pricingModel: "flat_fee", priceEnabled: true, unitPrice: 45, quantitySource: "fixed" },
          { id: "four", label: "4 mics", pricingModel: "flat_fee", priceEnabled: true, unitPrice: 55, quantitySource: "fixed" },
        ],
      },
    ],
  },
  ra_wireless_headsets: {
    schemaVersion: 1,
    pricingModel: "included",
    unitPrice: 0,
    quantitySource: "fixed",
    clientSelectable: true,
    hideBaseQuantity: true,
    optionGroups: [
      {
        id: "wireless_headset_count",
        label: "How many wireless headsets?",
        type: "radio",
        quantitySource: "fixed",
        options: [
          { id: "one", label: "1 headset", pricingModel: "flat_fee", priceEnabled: true, unitPrice: 25, quantitySource: "fixed" },
          { id: "two", label: "2 headsets", pricingModel: "flat_fee", priceEnabled: true, unitPrice: 35, quantitySource: "fixed" },
          { id: "three", label: "3 headsets", pricingModel: "flat_fee", priceEnabled: true, unitPrice: 45, quantitySource: "fixed" },
          { id: "four", label: "4 headsets", pricingModel: "flat_fee", priceEnabled: true, unitPrice: 55, quantitySource: "fixed" },
        ],
      },
    ],
  },
  ra_it_labour: {
    schemaVersion: 1,
    legacyKey: "space_other_labourtimeittech",
    pricingModel: "per_hour",
    unitPrice: 60,
    quantitySource: "own",
    clientSelectable: true,
    defaultUnits: 2,
  },
  ra_tech_setup_questions: {
    schemaVersion: 1,
    pricingModel: "included",
    unitPrice: 0,
    quantitySource: "fixed",
    clientSelectable: false,
    hideBaseQuantity: true,
    optionGroups: [
      {
        id: "sound_system_plan",
        label: "Do you plan to use Collaburo's sound system?",
        type: "radio",
        required: true,
        quantitySource: "fixed",
        options: [
          { id: "bluetooth", label: "Yes, via Bluetooth", pricingModel: "included", unitPrice: 0 },
          { id: "laptop_hdmi", label: "Yes, via laptop using HDMI", pricingModel: "included", unitPrice: 0 },
          { id: "not_using", label: "No, not using Collaburo's sound system", pricingModel: "included", unitPrice: 0 },
        ],
      },
      {
        id: "external_av_equipment",
        label: "Will anyone bring any Audio/Video equipment?",
        type: "checkbox",
        required: true,
        quantitySource: "fixed",
        options: [
          { id: "sound_system", label: "Bringing a sound system from outside", pricingModel: "included", unitPrice: 0 },
          { id: "projector_screen", label: "Bringing a projector and projector screen", pricingModel: "included", unitPrice: 0 },
          { id: "cameras_webcams", label: "Bringing cameras and/or webcams", pricingModel: "included", unitPrice: 0 },
          { id: "none", label: "None", pricingModel: "included", unitPrice: 0 },
        ],
      },
      {
        id: "microphone_need",
        label: "Do you need a microphone?",
        type: "radio",
        required: true,
        quantitySource: "fixed",
        options: [
          { id: "stage", label: "Yes, for speaking from the stage", pricingModel: "included", unitPrice: 0 },
          { id: "different_spots", label: "Yes, for speaking from different spots in the room", pricingModel: "included", unitPrice: 0 },
          { id: "no", label: "No microphone needed", pricingModel: "included", unitPrice: 0 },
        ],
      },
      {
        id: "microphone_followup",
        label: "Microphone setup notes",
        type: "select",
        quantitySource: "fixed",
        placeholder: "Select setup style",
        visibility: { mode: "conditional", sourceGroupId: "microphone_need", operator: "in", values: ["stage", "different_spots"] },
        options: ["Handheld mic", "Headset / lavalier", "Not sure yet"],
      },
    ],
    migrationNotes: ["These are planning questions, not priced rentals, but they belong with Tech because they change setup requirements."],
  },
  ro_helper_labour: {
    schemaVersion: 1,
    legacyKey: "space_other_labourtimehelper",
    pricingModel: "per_hour",
    unitPrice: 30,
    quantitySource: "own",
    clientSelectable: true,
    defaultUnits: 2,
  },
};

function rentalPriceFromText(text) {
  if (!text || /free/i.test(text)) return 0;
  const match = String(text).replace(/,/g, "").match(/\$?\s*(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function rentalUnitPrice(item = {}) {
  const explicitPrice = Number(item.unitPrice || 0);
  if (explicitPrice > 0) return explicitPrice;
  return rentalPriceFromText(item.priceText || "");
}

function rentalPricingModel(item = {}) {
  const model = item.pricingModel || "flat_per_item";
  const hasPrice = rentalUnitPrice(item) > 0;
  if (hasPrice && item.priceEnabled !== false && (model === "included" || model === "quote")) return "flat_per_item";
  return model;
}

function pricingModelFromLegacyUnit(unit, priceText) {
  if (/quote/i.test(priceText || "")) return "quote";
  if (/free/i.test(priceText || "")) return "included";
  if (unit === "hour") return "per_hour";
  if (unit === "package") return "package_fixed";
  if (unit === "flat") return "flat_fee";
  return "flat_per_item";
}

function withRentalArchitecture(item) {
  const legacy = LEGACY_RENTAL_ARCHITECTURE[item.id] || {};
  const priceText = item.priceText || "";
  const optionGroups = normalizeRentalQuestionGroups(item.optionGroups ?? legacy.optionGroups ?? []);
  const procurementType = inferProcurementType({ ...legacy, ...item });
  const deliveryOptionId = item.deliveryOptionId || item.deliveryTypeId || legacy.deliveryOptionId || defaultDeliveryOptionIdForClass(item.deliveryClass || legacy.deliveryClass);
  const deliveryRequired = procurementType === "external" && (item.deliveryRequired ?? legacy.deliveryRequired ?? !!deliveryOptionId);
  return {
    schemaVersion: 1,
    pricingModel: pricingModelFromLegacyUnit(item.unit, priceText),
    quantitySource: item.unit === "package" ? "fixed" : "own",
    unitPrice: rentalPriceFromText(priceText),
    legacyKey: item.priceKey || "",
    optionGroups: [],
    migrationNotes: [],
    ...legacy,
    ...item,
    imageUrl: item.imageUrl || legacy.imageUrl || "",
    groupImageUrl: item.groupImageUrl || legacy.groupImageUrl || "",
    infoImageUrl: item.infoImageUrl || legacy.infoImageUrl || "",
    infoImageUrls: item.infoImageUrls || legacy.infoImageUrls || (item.infoImageUrl || legacy.infoImageUrl ? [item.infoImageUrl || legacy.infoImageUrl] : []),
    layoutRecommendationEnabled: item.layoutRecommendationEnabled ?? legacy.layoutRecommendationEnabled ?? ["Tables", "Chairs"].includes(item.category),
    optionGroups,
    migrationNotes: item.migrationNotes ?? legacy.migrationNotes ?? [],
    packageBehavior: item.packageBehavior ?? legacy.packageBehavior,
    groupSelectionRule: item.groupSelectionRule || legacy.groupSelectionRule || "optional",
    groupOrder: item.groupOrder ?? legacy.groupOrder ?? RENTAL_CATEGORIES.indexOf(item.category),
    clientSelectable: item.clientSelectable ?? legacy.clientSelectable ?? (item.category === "Dinnerware" && item.source === "Old site Step 5"),
    procurementType,
    fulfillmentType: procurementType,
    deliveryRequired,
    deliveryOptionId: deliveryRequired ? deliveryOptionId : "",
  };
}

function normalizeRentalCatalog(catalog) {
  return (catalog || []).map(withRentalArchitecture);
}

function rentalPricingLabel(model) {
  return (RENTAL_PRICING_MODELS.find((m) => m.value === model) || {}).label || model || "Flat per item";
}

function quantitySourceLabel(source) {
  return (RENTAL_QUANTITY_SOURCES.find((q) => q.value === source) || {}).label || source || "Ask for this item";
}

function rentalQuantitySourceIsFixed(source) {
  const normalized = String(source || "").toLowerCase().replace(/[\s-]+/g, "_");
  return ["fixed", "fixed_package", "package_fixed", "fixed_package_quantity"].includes(normalized) || (normalized.includes("fixed") && normalized.includes("package"));
}

function rentalUsesFixedBaseQuantity(item = {}) {
  return rentalQuantitySourceIsFixed(item.quantitySource);
}

function rentalOptionGroupsNeedParentQuantity(item = {}) {
  if (rentalUsesFixedBaseQuantity(item)) return false;
  return (item.optionGroups || []).some((group) => {
    const type = group.type || "radio";
    if (!["radio", "select", "checkbox", "checkbox_row"].includes(type)) return false;
    return (group.options || []).some((option) => {
      const normalized = normalizeRentalChoiceOption(option);
      const optionQuantitySource = option && typeof option === "object" && option.quantitySource ? option.quantitySource : group.quantitySource;
      const fallbackQuantitySource = ["radio", "select"].includes(type) ? "parent" : "fixed";
      const quantitySource = optionQuantitySource || fallbackQuantitySource;
      return Number(normalized.unitPrice || 0) > 0 && quantitySource !== "fixed";
    });
  });
}

function rentalAvailableVenueIds(item = {}) {
  const ids = Array.isArray(item.venueIds) ? item.venueIds.filter(Boolean) : [];
  return ids.length > 0 ? ids : [];
}

function rentalAvailableForVenue(item = {}, venueId = "") {
  const ids = rentalAvailableVenueIds(item);
  if (!venueId || ids.length === 0) return true;
  return ids.includes(venueId);
}

function computeRentalQuoteLine(item, quantity, context = {}) {
  const model = rentalPricingModel(item);
  const unitPrice = rentalUnitPrice(item);
  const qty = rentalUsesFixedBaseQuantity(item) ? 1 : Number(quantity || 0);
  const hours = Number(context.hours || 0);
  const guests = Number(context.guests || 0);
  let multiplier = qty;
  if (model === "flat_fee" || model === "package_fixed") multiplier = qty > 0 ? 1 : 0;
  if (model === "per_hour") multiplier = hours || qty || 0;
  if (model === "per_person") multiplier = guests || qty || 0;
  if (model === "per_person_per_hour") multiplier = (guests || 0) * (hours || 0);
  if (model === "included" || model === "quote") multiplier = 0;
  return {
    itemId: item.id,
    label: item.name,
    pricingModel: model,
    quantity: qty,
    unitPrice,
    multiplier,
    total: unitPrice * multiplier,
  };
}

function RentalGroups({ groups, active, onActive, onAddGroup }) {
  const Ic = window.Icons;
  return (
    <div>
      <h3 className="rental-groups-title">Rental Groups</h3>
      <div className="rental-group-list">
        {groups.map((g) => (
          <button key={g.name} className={"rental-group-card" + (active === g.name ? " active" : "")} onClick={() => onActive(g.name)}>
            <span><b>{g.name}</b><span>{g.count} item{g.count === 1 ? "" : "s"}</span></span>
            {active === g.name && <Ic.Trash size={13} />}
          </button>
        ))}
        <button className="rental-add-group" onClick={onAddGroup}><Ic.Plus size={13} /> Add new rental group</button>
      </div>
    </div>
  );
}

function FieldMini({ label, required, children, full }) {
  return (
    <div className={full ? "full" : ""}>
      <label className="rental-mini-label">{label} {required && <span className="req">*</span>}</label>
      {children}
    </div>
  );
}

function RentalAdvancedBox() {
  return (
    <div className="rental-adv">
      <div className="rental-adv-head"><span>Advanced settings</span><span>⌃</span></div>
      <div className="rental-adv-body">
        <FieldMini label="Information icon (i)">
          <input className="input" placeholder="Enter tooltip text..." />
        </FieldMini>
        <FieldMini label="Information gallery icon (i)">
          <button className="btn sm">Upload Image</button>
        </FieldMini>
      </div>
    </div>
  );
}

function SpecificationRows({ values }) {
  const Ic = window.Icons;
  return (
    <>
      {values.map((v) => (
        <div className="spec-row" key={v}>
          <span className="rental-drag">⁝</span>
          <span>{v}</span>
          <label className="chk orange-check"><input type="checkbox" /> Price</label>
          <Ic.Edit size={13} color="#7b8288" />
          <Ic.Close size={13} color="#ff2b2b" />
        </div>
      ))}
      <button className="orange-link" style={{ marginLeft: "auto" }}><Ic.Plus size={12} /> Add specifications</button>
    </>
  );
}

function SelectionBlock({ title, specs }) {
  const Ic = window.Icons;
  return (
    <div className="nested-accent">
      <div className="nested-row">
        <div className="nested-row-head">
          <span className="name">{title}</span>
          <label className="chk orange-check"><input type="checkbox" defaultChecked /> Has specifications</label>
          <Ic.Edit size={13} color="#7b8288" />
          <Ic.Close size={13} color="#ff2b2b" />
        </div>
        <div className="nested-body">
          <div className="rental-grid">
            <FieldMini label="Field name" required><input className="input" defaultValue={title} /></FieldMini>
            <FieldMini label="Display field as" required><select className="select" defaultValue="Dropdown Select"><option>Dropdown Select</option><option>Radio</option></select></FieldMini>
          </div>
          <label className="chk orange-check" style={{ marginTop: 14 }}><input type="checkbox" defaultChecked /> Require specifications <span className="req">*</span></label>
          <hr className="rental-divider" />
          <SpecificationRows values={specs} />
        </div>
      </div>
    </div>
  );
}

function SubOptionRow({ name, hasSelections }) {
  const Ic = window.Icons;
  return (
    <>
      <div className="nested-row">
        <div className="nested-row-head">
          <span className="rental-drag">⁝</span>
          <span className="name">{name}</span>
          <label className="chk orange-check"><input type="checkbox" /> Price</label>
          <label className="chk orange-check"><input type="checkbox" defaultChecked={hasSelections} /> Has selections</label>
          <Ic.Sliders size={13} color="#7b8288" />
          <Ic.Edit size={13} color="#7b8288" />
          <Ic.Close size={13} color="#ff2b2b" />
        </div>
        <div className="nested-body">
          <div className="rental-adv-body" style={{ padding: 0 }}>
            <FieldMini label="Information icon (i)"><input className="input" placeholder="Enter tooltip text..." /></FieldMini>
            <FieldMini label="Information gallery icon (i)"><button className="btn sm">Upload Image</button></FieldMini>
          </div>
        </div>
      </div>
      {hasSelections && (
        <>
          <div className="config-head" style={{ marginTop: 12 }}>
            <label className="chk orange-check"><input type="checkbox" defaultChecked /> Require selection <span className="req">*</span></label>
            <button className="orange-link"><Ic.Plus size={12} /> Add selection</button>
          </div>
          <SelectionBlock title="Linen Colour" specs={["White", "Ivory", "Others"]} />
        </>
      )}
    </>
  );
}

function RentalOptionsDemo({ item }) {
  const Ic = window.Icons;
  const tableItem = /rectangular 6/i.test(item.name || "");
  if (!tableItem) return null;
  return (
    <>
      <hr className="rental-divider" />
      <div className="config-head">
        <b>Configure options</b>
        <button className="orange-link"><Ic.Plus size={12} /> Add option</button>
      </div>
      <div className="rental-option">
        <div className="rental-option-head"><span className="rental-drag">⁝</span><span className="rental-option-title"># of Tables</span><Ic.Edit size={14} color="#7b8288" /></div>
        <div className="rental-option-body">
          <div className="rental-grid">
            <FieldMini label="Field name" required><input className="input" defaultValue="# of Tables" /></FieldMini>
            <FieldMini label="Display field as" required><select className="select" defaultValue="Dropdown"><option>Dropdown</option><option>Stepper</option></select></FieldMini>
            <FieldMini label="Minimum value"><input className="input" defaultValue="2" /></FieldMini>
            <FieldMini label="Maximum value"><input className="input" defaultValue="8" /></FieldMini>
            <FieldMini label="Increment"><input className="input" defaultValue="1" /></FieldMini>
          </div>
          <RentalAdvancedBox />
        </div>
      </div>
      <div className="rental-option">
        <div className="rental-option-head"><span className="rental-drag">⁝</span><span className="rental-option-title">Table Covers / Linens</span><Ic.Edit size={14} color="#7b8288" /><Ic.Close size={14} color="#ff2b2b" /></div>
        <div className="rental-option-body">
          <div className="rental-grid">
            <FieldMini label="Field name" required><input className="input" defaultValue="Table Covers / Linens" /></FieldMini>
            <FieldMini label="Rental image" required><div className="rental-img-row"><div className="rental-img-ph"></div><button className="btn sm">Upload Image</button></div></FieldMini>
            <FieldMini label="Display field as" required><select className="select" defaultValue="Radio"><option>Radio</option><option>Dropdown</option></select></FieldMini>
            <FieldMini label="Enable base price $" required><label className="chk orange-check"><input type="checkbox" /></label></FieldMini>
          </div>
          <label className="chk orange-check" style={{ marginTop: 14 }}><input type="checkbox" defaultChecked /> Has sub-option</label>
          <RentalAdvancedBox />
          <div className="config-head" style={{ marginTop: 20 }}>
            <label className="chk orange-check"><input type="checkbox" defaultChecked /> Require sub-option <span className="req">*</span></label>
            <button className="orange-link"><Ic.Plus size={12} /> Add sub-option</button>
          </div>
          <SubOptionRow name="No Linens required" hasSelections={false} />
          <SubOptionRow name="Half-way to floor" hasSelections={true} />
          <SubOptionRow name="Full-way to floor" hasSelections={true} />
        </div>
      </div>
      <div className="rental-option">
        <div className="rental-option-head"><span className="rental-drag">⁝</span><span className="rental-option-title">Add additional Spandex table cover:</span><Ic.Edit size={14} color="#7b8288" /><Ic.Close size={14} color="#ff2b2b" /></div>
        <div className="rental-option-body">
          <div className="rental-grid">
            <FieldMini label="Field name" required><input className="input" defaultValue="Add additional Spandex table cover" /></FieldMini>
            <FieldMini label="Rental image" required><div className="rental-img-row"><div className="rental-img-ph"></div><button className="btn sm">Upload Image</button></div></FieldMini>
            <FieldMini label="Display field as" required><select className="select" defaultValue="Radio"><option>Radio</option><option>Dropdown</option></select></FieldMini>
          </div>
          <label className="chk orange-check" style={{ marginTop: 14 }}><input type="checkbox" defaultChecked /> Has sub-option</label>
          <RentalAdvancedBox />
          <div className="config-head" style={{ marginTop: 20 }}>
            <label className="chk orange-check"><input type="checkbox" defaultChecked /> Require sub-option <span className="req">*</span></label>
            <button className="orange-link"><Ic.Plus size={12} /> Add sub-option</button>
          </div>
          <SubOptionRow name="White" hasSelections={true} />
          <SubOptionRow name="Black" hasSelections={true} />
        </div>
      </div>
    </>
  );
}

function RentalCatalogArchitectureSummary({ rows }) {
  const richItems = rows.filter((r) => (r.optionGroups || []).length > 0).length;
  const packages = rows.filter((r) => r.packageBehavior).length;
  const hourly = rows.filter((r) => /hour/.test(r.pricingModel || "")).length;
  return (
    <div className="rental-architecture">
      <h2>Rental Architecture</h2>
      <p>Legacy price keys stay attached for migration, but admin configuration now separates catalog items, pricing models, nested options, quantity sources, conditional rules, and editable package presets.</p>
      <div className="rental-architecture-grid">
        <div className="rental-architecture-stat"><b>{rows.length}</b><span>catalog items</span></div>
        <div className="rental-architecture-stat"><b>{richItems}</b><span>items with nested option rules</span></div>
        <div className="rental-architecture-stat"><b>{packages}</b><span>editable package presets</span></div>
        <div className="rental-architecture-stat"><b>{rows.filter((r) => r.clientVisible !== false).length}</b><span>visible client items</span></div>
      </div>
      <div className="rental-pill-row" style={{ marginTop: 14 }}>
        <span className="rental-pill accent">{hourly} hourly pricing items</span>
        <span className="rental-pill">Step 4 recommendations supported</span>
        <span className="rental-pill">Inherited and override quantities</span>
        <span className="rental-pill">Conditional visibility rules</span>
      </div>
    </div>
  );
}

function RentalSchemaPanel({ item, onPatch }) {
  const optionGroups = item.optionGroups || [];
  const packageBehavior = item.packageBehavior;
  return (
    <div className="rental-schema-box">
      <div className="rental-schema-head">
        <div>
          <h4>Pricing and logic schema</h4>
          <div className="rental-schema-note">This is the normalized replacement for legacy show/hide scripts and price text parsing.</div>
        </div>
        <div className="rental-pill-row">
          {packageBehavior && <span className="rental-pill accent">Editable preset</span>}
        </div>
      </div>
      <div className="rental-grid">
        <FieldMini label="Pricing model">
          <select className="select" value={item.pricingModel || "flat_per_item"} onChange={(e) => onPatch({ pricingModel: e.target.value })}>
            {RENTAL_PRICING_MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </FieldMini>
        <FieldMini label="Unit price">
          <input className="input" type="number" step="0.01" value={item.unitPrice ?? ""} onChange={(e) => onPatch({ unitPrice: e.target.value === "" ? "" : Number(e.target.value) })} />
        </FieldMini>
        <FieldMini label="Quantity source">
          <select className="select" value={item.quantitySource || "own"} onChange={(e) => onPatch({ quantitySource: e.target.value })}>
            {RENTAL_QUANTITY_SOURCES.map((q) => <option key={q.value} value={q.value}>{q.label}</option>)}
          </select>
        </FieldMini>
        <FieldMini label="Legacy price key">
          <input className="input" value={item.legacyKey || item.priceKey || ""} onChange={(e) => onPatch({ legacyKey: e.target.value, priceKey: e.target.value })} />
        </FieldMini>
      </div>
      <div className="rental-rule-list" style={{ marginTop: 14 }}>
        <div className="rental-rule"><b>Model</b><span>{rentalPricingLabel(item.pricingModel)} at ${Number(item.unitPrice || 0).toFixed(2)}</span></div>
        <div className="rental-rule"><b>Quantity</b><span>{quantitySourceLabel(item.quantitySource)}</span></div>
        {optionGroups.length > 0 && <div className="rental-rule"><b>Options</b><span>{optionGroups.map((g) => g.label).join(", ")}</span></div>}
        {(item.migrationNotes || []).map((note, i) => <div className="rental-rule" key={i}><b>Legacy note</b><span>{note}</span></div>)}
      </div>
      {packageBehavior && (
        <div className="rental-engine-preview">
          <h4>Package behavior</h4>
          {(packageBehavior.includedItems || []).map((it) => (
            <div className="rental-engine-row" key={it.itemId}>
              <span>{it.label}<span className="muted">{it.removable ? "Client can uncheck" : "Locked into package"}</span></span>
              <span>Included</span>
            </div>
          ))}
          {(packageBehavior.upgrades || []).map((up) => (
            <div className="rental-engine-row" key={up.id}>
              <span>{up.label}<span className="muted">Optional upgrade</span></span>
              <span>${Number(up.unitPrice || 0).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RentalEnginePreview({ item }) {
  const sampleQty = item.pricingModel === "per_hour" ? 3 : 2;
  const line = computeRentalQuoteLine(item, sampleQty, { hours: 3, guests: 50 });
  return (
    <div className="rental-engine-preview">
      <h4>Pricing engine preview</h4>
      <div className="rental-engine-row">
        <span>{line.label}<span className="muted">{rentalPricingLabel(line.pricingModel)} · multiplier {line.multiplier || 0}</span></span>
        <span>${Number(line.total || 0).toFixed(2)}</span>
      </div>
    </div>
  );
}

function RentalItemCard({ item, open, onToggle, onPatch, onDelete, onDuplicate }) {
  const Ic = window.Icons;
  return (
    <div className="rental-card2">
      <div className="rental-card2-head" onClick={onToggle}>
        <span className="rental-drag">⁝</span>
        <span className="rental-card2-title">{item.name || "Untitled rental item"}</span>
        <div className="rental-card2-tools">
          <Ic.Sliders size={15} />
          <button className="btn icon sm danger-ghost" onClick={(e) => { e.stopPropagation(); onDelete(); }}><Ic.Trash size={13} /></button>
        </div>
      </div>
      {open && (
        <div className="rental-card2-body">
          <div className="rental-grid">
            <FieldMini label="Rental name" required><input className="input" value={item.name || ""} onChange={(e) => onPatch({ name: e.target.value })} /></FieldMini>
            <FieldMini label="Rental image" required><div className="rental-img-row"><div className="rental-img-ph"></div><button className="btn sm">Upload Image</button></div></FieldMini>
            <FieldMini label="Short description" required full><input className="input" value={item.notes || ""} placeholder="Choose the number of items you wish to add to quote" onChange={(e) => onPatch({ notes: e.target.value })} /></FieldMini>
            <FieldMini label="Total stock inventory #">
              <label className="chk orange-check"><input type="checkbox" checked={item.deliveryClass === "none"} onChange={(e) => onPatch({ deliveryClass: e.target.checked ? "none" : "large" })} /> No Stock Inventory</label>
              <div className="rental-stock-row"><input className="input" value={item.stock || "8"} onChange={(e) => onPatch({ stock: e.target.value })} /><span>units available</span></div>
            </FieldMini>
            <FieldMini label="Enable base price $" required>
              <label className="chk orange-check"><input type="checkbox" checked={!!item.priceText && item.priceText !== "Free"} onChange={() => {}} /> </label>
              <input className="input" style={{ width: 96 }} value={item.priceText || ""} onChange={(e) => onPatch({ priceText: e.target.value })} />
            </FieldMini>
          </div>
          <div className="rental-checks">
            <label className="chk orange-check"><input type="checkbox" checked={item.active !== false} onChange={(e) => onPatch({ active: e.target.checked })} /> Required<span className="req">*</span></label>
            <label className="chk orange-check"><input type="checkbox" /> Admin Required<span className="req">*</span></label>
            <label className="chk orange-check"><input type="checkbox" checked={item.clientVisible !== false} onChange={(e) => onPatch({ clientVisible: e.target.checked })} /> Visible to client</label>
            <button className="btn sm" onClick={onDuplicate}><Ic.Copy size={12} /> Duplicate</button>
          </div>
          <RentalSchemaPanel item={item} onPatch={onPatch} />
          <RentalEnginePreview item={item} />
          <RentalOptionsDemo item={item} />
        </div>
      )}
    </div>
  );
}

function AddRentalModal({ onClose, onConfirm }) {
  return (
    <div className="rental-modal-backdrop" onClick={onClose}>
      <div className="rental-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Add item</h3>
        <div className="rental-modal-body">
          <label className="rental-modal-choice"><span><b>New Rental Item</b><span>Enter rental name...</span></span><input type="checkbox" checked readOnly /></label>
          <label className="rental-modal-choice"><span><b>Instructional Text Block</b><span>Static text</span></span><input type="checkbox" readOnly /></label>
          <label className="rental-modal-choice"><span><b>Separator Line</b><span>Visual break between sections</span></span><input type="checkbox" readOnly /></label>
        </div>
        <div className="rental-modal-actions">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

const RENTAL_CLIENT_CHOICE_TYPES = [
  { value: "quantity", label: "Quantity", help: "Client enters how many they need." },
  { value: "radio", label: "Pick one", help: "Client chooses one option from a short list." },
  { value: "select", label: "Dropdown", help: "Client chooses one option from a compact menu." },
  { value: "checkbox", label: "Checkboxes", help: "Client can choose multiple options." },
  { value: "checkbox_row", label: "Checkbox row", help: "Client checks the item first, then quantity/options appear." },
  { value: "multi_quantity", label: "Multi-quantity", help: "Client can enter a quantity for each option." },
  { value: "number", label: "Number", help: "Client enters a number with optional limits." },
];

const RENTAL_CHOICE_TYPES_WITH_OPTIONS = new Set(["radio", "select", "checkbox", "checkbox_row", "multi_quantity"]);
const RENTAL_CHOICE_TYPES_WITH_LIMITS = new Set(["quantity", "number", "checkbox_row"]);
const RENTAL_CHOICE_TYPES_WITH_PLACEHOLDER = new Set(["quantity", "number", "select"]);
const RENTAL_GROUP_SELECTION_RULES = [
  { value: "optional", label: "Optional", help: "Can choose 0" },
  { value: "at_least_one", label: "Require at least one", help: "Must choose 1 or more" },
  { value: "exactly_one", label: "Require exactly one", help: "Must choose 1" },
];
const RENTAL_PRICE_MODES = [
  { value: "included", label: "Included / no price" },
  { value: "priced", label: "Set price" },
  { value: "quote", label: "Separate quote" },
];

const LAYOUT_RENTAL_RECOMMENDATION_FIELDS = [
  { key: "rt_rect6", label: "Rectangular 6' Tables", aliases: [/rectangular\s*6['’]?\s*tables?/i, /\b6['’]?\s*tables?/i] },
  { key: "rt_rect8", label: "Rectangular 8' Tables", aliases: [/rectangular\s*8['’]?\s*tables?/i, /\b8['’]?\s*tables?/i] },
  { key: "rt_round", label: "Round Tables", aliases: [/round\s*tables?/i, /circular\s*tables?/i] },
  { key: "rt_cocktail", label: "Cocktail Tables", aliases: [/cocktail\s*tables?/i] },
  { key: "chairs", label: "Chairs", aliases: [/rust\s*chairs?/i, /\bchairs?/i] },
];

function layoutRecommendationAliasesForItem(item = {}) {
  const name = item.name || "";
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\'/g, "['’]?").replace(/\s+/g, "\\s+");
  const aliases = [new RegExp(escaped + "s?", "i")];
  if (/chair/i.test(name)) aliases.push(/rust\s*chairs?/i, /\bchairs?/i);
  if (/6['’]?|6\s*ft/i.test(name)) aliases.push(/rectangular\s*6['’]?\s*tables?/i, /\b6['’]?\s*tables?/i);
  if (/8['’]?|8\s*ft/i.test(name)) aliases.push(/rectangular\s*8['’]?\s*tables?/i, /\b8['’]?\s*tables?/i);
  if (/round|circular/i.test(name)) aliases.push(/round\s*tables?/i, /circular\s*tables?/i);
  if (/cocktail/i.test(name)) aliases.push(/cocktail\s*tables?/i);
  return aliases;
}

function rentalLayoutRecommendationEnabled(item = {}) {
  return item.layoutRecommendationEnabled ?? ["Tables", "Chairs"].includes(item.category);
}

function layoutRecommendationFieldsForStep(step = {}, venueId = "") {
  const groupNames = (step.fields || [])
    .filter((field) => field.type === "rental_group")
    .map((field) => field.rentalGroup || field.label)
    .filter(Boolean);
  const items = groupNames.flatMap((group) => workflowRentalCatalogItems(group, venueId));
  const seen = new Set();
  return items
    .filter((item) => item && item.active !== false && rentalLayoutRecommendationEnabled(item))
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .map((item) => ({ key: item.id, label: item.name, item, aliases: layoutRecommendationAliasesForItem(item) }));
}

function getLayoutRentalRecommendations(layout = {}, fields = LAYOUT_RENTAL_RECOMMENDATION_FIELDS) {
  const counts = { ...(layout.rentalRecommendations || {}) };
  const text = layout.recommendedDescription || "";
  fields.forEach((field) => {
    if (Number(counts[field.key] || 0) > 0) return;
    for (const alias of field.aliases) {
      const match = text.match(new RegExp("(\\d+)\\s+" + alias.source, "i"));
      if (match) {
        counts[field.key] = Number(match[1] || 0);
        break;
      }
    }
  });
  return counts;
}

function layoutRecommendationCountForItem(item, recommendations = {}) {
  if (!item) return 0;
  if (recommendations[item.id] != null) return Number(recommendations[item.id] || 0);
  const name = (item.name || "").toLowerCase();
  if (item.category === "Chairs" || name === "chairs" || name.includes("chair")) return Number(recommendations.chairs || 0);
  if (name.includes("6'") || name.includes("6’") || name.includes("6 ft")) return Number(recommendations.rt_rect6 || 0);
  if (name.includes("8'") || name.includes("8’") || name.includes("8 ft")) return Number(recommendations.rt_rect8 || 0);
  if (name.includes("round")) return Number(recommendations.rt_round || 0);
  if (name.includes("cocktail")) return Number(recommendations.rt_cocktail || 0);
  return 0;
}

function addLayoutRecommendations(base = {}, next = {}) {
  const merged = { ...base };
  Object.entries(next || {}).forEach(([key, value]) => {
    merged[key] = Number(merged[key] || 0) + Number(value || 0);
  });
  return merged;
}

function normalizeRentalChoiceOption(option, index) {
  if (typeof option === "string") return { id: "choice_" + index, label: option, unitPrice: 0, pricingModel: "included", priceKey: "" };
  const parsedPrice = rentalPriceFromText(option?.priceText || option?.label || "");
  const optionPrice = Number(option?.unitPrice ?? option?.price ?? parsedPrice ?? 0);
  return {
    id: option?.id || "choice_" + index,
    label: option?.label || "Option " + (index + 1),
    description: option?.description || option?.notes || "",
    imageUrl: option?.imageUrl || "",
    infoText: option?.infoText || "",
    infoImageUrl: option?.infoImageUrl || "",
    infoImageUrls: option?.infoImageUrls || (option?.infoImageUrl ? [option.infoImageUrl] : []),
    required: !!option?.required,
    adminRequired: !!option?.adminRequired,
    priceMode: option?.pricingModel === "quote" || option?.priceMode === "quote" ? "quote" : (option?.priceEnabled ?? optionPrice > 0) ? "priced" : "included",
    priceEnabled: option?.pricingModel === "quote" || option?.priceMode === "quote" ? false : option?.priceEnabled ?? optionPrice > 0,
    minCount: option?.minCount ?? "",
    maxCount: option?.maxCount ?? "",
    stepCount: option?.stepCount ?? 1,
    unitPrice: optionPrice,
    pricingModel: option?.pricingModel || (optionPrice > 0 ? "flat_per_item" : "included"),
    priceKey: option?.priceKey || option?.legacyKey || "",
    quantitySource: option?.quantitySource || "parent",
  };
}

function normalizeRentalQuestionGroups(groups = []) {
  const flattened = [];
  groups.forEach((group) => {
    const rawOptions = group.options || [];
    const options = rawOptions.map(normalizeRentalChoiceOption);
    const childGroups = group.childGroups || [];
    const cleanGroup = { ...group, infoImageUrls: group.infoImageUrls || (group.infoImageUrl ? [group.infoImageUrl] : []), options };
    delete cleanGroup.childGroups;
    flattened.push(cleanGroup);
    childGroups.forEach((child) => {
      const triggerIds = rawOptions.filter((option) => option && typeof option === "object" && option.childGroupId === child.id).map((option) => option.id);
      flattened.push({
        ...child,
        visibility: child.visibility || {
          mode: "conditional",
          sourceGroupId: group.id,
          operator: triggerIds.length === 1 ? "equals" : "in",
          value: triggerIds[0] || "",
          values: triggerIds,
        },
      });
    });
  });
  return flattened;
}

function rentalChoiceTypeHelp(type) {
  return (RENTAL_CLIENT_CHOICE_TYPES.find((t) => t.value === type) || RENTAL_CLIENT_CHOICE_TYPES[1]).help;
}

function recommendedRentalsForGroup(group) {
  return recommendedRentalCatalogRows().filter((item) => item.category === group);
}

function recommendedRentalCatalogRows() {
  const source = window.RECOMMENDED_RENTAL_CATALOG || window.CURRENT_RENTAL_CATALOG || window.SAMPLE_RENTAL_CATALOG || [];
  return window.normalizeRentalCatalog ? window.normalizeRentalCatalog(source) : source;
}

function orderedRentalCategories(rows) {
  const rowNames = rows.map((r) => r.category).filter(Boolean);
  const names = Array.from(new Set(rowNames.length ? rowNames : RENTAL_CATEGORIES));
  const orderOf = (name) => {
    const explicit = rows.filter((r) => r.category === name && r.groupOrder != null).map((r) => Number(r.groupOrder));
    if (explicit.length > 0) return Math.min(...explicit);
    const builtIn = RENTAL_CATEGORIES.indexOf(name);
    return builtIn >= 0 ? builtIn : 999;
  };
  return names.sort((a, b) => orderOf(a) - orderOf(b) || a.localeCompare(b));
}

function rentalGroupImageForRows(rows, category) {
  const match = (rows || []).find((item) => item.category === category && item.groupImageUrl);
  return match?.groupImageUrl || "";
}

function currentRentalCatalogGroups() {
  const source = window.CURRENT_RENTAL_CATALOG || window.SAMPLE_RENTAL_CATALOG || [];
  const rows = window.normalizeRentalCatalog ? window.normalizeRentalCatalog(source) : source;
  return orderedRentalCategories((rows || []).filter((item) => item && item.active !== false && item.category));
}

function setRecommendedRentalCatalogSnapshot(catalog = []) {
  window.RECOMMENDED_RENTAL_CATALOG = cloneData(catalog || []);
}

function groupSelectionRuleFor(rows, category) {
  return rows.find((r) => r.category === category && r.groupSelectionRule)?.groupSelectionRule || "optional";
}

function groupSelectionRuleLabel(value) {
  return (RENTAL_GROUP_SELECTION_RULES.find((rule) => rule.value === value) || RENTAL_GROUP_SELECTION_RULES[0]).label;
}

function RentalGroupSelectionRule({ value, onChange }) {
  return (
    <div className="rental-group-rule">
      <b>How should clients select items from this group?</b>
      <div className="rental-group-rule-options">
        {RENTAL_GROUP_SELECTION_RULES.map((rule) => (
          <label key={rule.value}>
            <input type="radio" name="rental_group_rule" checked={value === rule.value} onChange={() => onChange(rule.value)} />
            <span className="rental-group-rule-copy">
              <span>{rule.label}</span>
              <span className="rental-muted">({rule.help})</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function RentalCatalogList({ rows, activeId, activeGroup, groupSelectionRule, onGroupSelectionRuleChange, onSelectGroup, onSelect, onAdd, onDuplicate, onDelete, onMoveItem, onManageGroups, onOpenRecommended }) {
  const Ic = window.Icons;
  const [query, setQuery] = React.useState("");
  const [movingItem, setMovingItem] = React.useState(null);
  const categories = orderedRentalCategories([...rows, ...recommendedRentalCatalogRows()]);
  const recommendedTotal = recommendedRentalsForGroup(activeGroup).length;
  const groupItems = rows.filter((r) => r.category === activeGroup);
  const filtered = rows.filter((r) => {
    const q = query.trim().toLowerCase();
    const matchQuery = !q || [r.name, r.category, r.legacyKey, r.priceKey].some((v) => String(v || "").toLowerCase().includes(q));
    const matchCategory = r.category === activeGroup;
    return matchQuery && matchCategory;
  });
  const moveItem = (item, direction) => {
    setMovingItem({ id: item.id, direction });
    onMoveItem(item.id, direction);
    setTimeout(() => setMovingItem(null), 240);
  };

  return (
    <>
      <div className="steps-col rental-group-col">
        <div className="col-head">
          <h3>Groups</h3>
          <div className="col-head-actions">
            <button className="btn icon sm ghost" title="Manage groups" onClick={onManageGroups}><Ic.Sliders size={13} /></button>
          </div>
        </div>
        <div className="steps-body">
          {categories.map((category) => {
            const count = rows.filter((r) => r.category === category).length;
            const rule = groupSelectionRuleFor(rows, category);
            return (
              <button key={category} className={"rental-group-button" + (activeGroup === category ? " active" : "")} onClick={() => onSelectGroup(category)}>
                <span><b>{category}</b><span className="rental-group-meta">{groupSelectionRuleLabel(rule)}</span></span>
                <span className="rental-group-count">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="rental-group-actions">
          <button className="btn sm rental-add-btn" onClick={() => onOpenRecommended(activeGroup)} disabled={recommendedTotal === 0}>
            <Ic.Plus size={12} /> Add recommended
          </button>
          <button className="btn sm" onClick={onManageGroups}><Ic.Edit size={12} /> Add / edit groups</button>
        </div>
      </div>

      <div className="steps-col">
        <div className="col-head">
          <h3>Rental Items</h3>
          <div className="col-head-actions">
            <button className="btn icon sm rental-add-btn" title="Add rental" onClick={onAdd}><Ic.Plus size={13} /></button>
          </div>
        </div>
        <RentalGroupSelectionRule value={groupSelectionRule} onChange={onGroupSelectionRuleChange} />
        <div className="col-search">
          <div className="col-search-wrap">
            <span className="ic"><Ic.Search size={13} /></span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={"Search " + activeGroup + "..."} />
          </div>
        </div>
        <div className="steps-body">
          {filtered.map((item, index) => {
            const isActive = item.id === activeId;
            const price = item.pricingModel === "quote" ? "Quote" : item.pricingModel === "included" ? "Included" : "$" + Number(item.unitPrice || 0).toFixed(2);
            const groupIndex = groupItems.findIndex((r) => r.id === item.id);
            return (
              <div key={item.id} className={"step-card rental-item-card" + (isActive ? " active" : "") + (movingItem?.id === item.id ? (movingItem.direction < 0 ? " move-up" : " move-down") : "")} onClick={() => onSelect(item.id)}>
                <span className="step-drag"><Ic.Tag size={14} /></span>
                <span className="step-card-num">{index + 1}</span>
                <div className="step-card-body">
                  <span className="step-card-name">{item.name}</span>
                  <span className="step-card-meta">
                    {price}
                    {rentalRequiresDelivery(item) && <DeliveryIndicator />}
                  </span>
                </div>
                <div className="step-card-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="btn icon sm ghost" title="Move up" disabled={groupIndex <= 0} onClick={() => moveItem(item, -1)}><Ic.ArrUp size={12} /></button>
                  <button className="btn icon sm ghost" title="Move down" disabled={groupIndex < 0 || groupIndex >= groupItems.length - 1} onClick={() => moveItem(item, 1)}><Ic.ArrDn size={12} /></button>
                  <button className="btn icon sm danger-ghost" title="Delete rental" onClick={() => onDelete(item.id)}><Ic.Trash size={12} /></button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: "12px 4px", fontSize: 12, color: "var(--ink-3)" }}>
              No rentals in {activeGroup} yet.
            </div>
          )}
          <button className="add-step" onClick={onAdd}><Ic.Plus size={13} /> Add rental to {activeGroup}</button>
        </div>
      </div>
    </>
  );
}

function rentalParentVisibilitySource(item) {
  return {
    id: "__parent_quantity__",
    _reorderId: "__parent_quantity__",
    label: item?.name ? `# of ${item.name}` : "Parent rental quantity",
    type: "parent_quantity",
    options: [],
  };
}

function RentalVisibilityEditor({ group, allGroups, parentItem, onChange }) {
  const visibility = group.visibility || { mode: "always" };
  const groupKey = group.id || group._reorderId;
  const parentSource = rentalParentVisibilitySource(parentItem);
  const candidates = [parentSource, ...(allGroups || []).filter((g) => (g.id || g._reorderId) !== groupKey)];
  const source = candidates.find((g) => (g.id || g._reorderId) === visibility.sourceGroupId) || candidates[0];
  const sourceOptions = (source?.options || []).map(normalizeRentalChoiceOption);
  const mode = visibility.mode || "always";
  const operator = visibility.operator || (sourceOptions.length > 0 ? "equals" : "has_value");
  const values = visibility.values || (visibility.value ? [visibility.value] : []);
  const patchVisibility = (patch) => onChange({ ...group, visibility: { ...visibility, ...patch } });
  return (
    <details className="rental-accordion">
      <summary>Show / hide rules</summary>
      <div className="rental-accordion-body">
      <div className="rental-editor-grid">
        <div>
          <label className="lbl">Visibility</label>
          <select className="select" value={mode} onChange={(e) => {
            const nextOperator = sourceOptions.length > 0 ? "equals" : "has_value";
            e.target.value === "always" ? onChange({ ...group, visibility: { mode: "always" } }) : patchVisibility({ mode: "conditional", sourceGroupId: source ? (source.id || source._reorderId) : "", operator: nextOperator, value: sourceOptions[0]?.id || "", values: sourceOptions[0]?.id ? [sourceOptions[0].id] : [] });
          }}>
            <option value="always">Always show</option>
            <option value="conditional">Only when...</option>
          </select>
        </div>
        {mode === "conditional" && (
          <>
            <div>
              <label className="lbl">Question</label>
              <select className="select" value={visibility.sourceGroupId || (source ? (source.id || source._reorderId) : "")} onChange={(e) => {
                const nextSource = candidates.find((candidate) => (candidate.id || candidate._reorderId) === e.target.value);
                const nextOptions = (nextSource?.options || []).map(normalizeRentalChoiceOption);
                patchVisibility({ sourceGroupId: e.target.value, operator: nextOptions.length > 0 ? "equals" : "has_value", value: nextOptions[0]?.id || "", values: nextOptions[0]?.id ? [nextOptions[0].id] : [] });
              }} disabled={candidates.length === 0}>
                {candidates.length === 0 && <option value="">Add another choice first</option>}
                {candidates.map((candidate) => <option key={candidate.id || candidate._reorderId} value={candidate.id || candidate._reorderId}>{candidate.label || candidate.id || candidate._reorderId}</option>)}
              </select>
            </div>
            <div>
              <label className="lbl">Condition</label>
              <select className="select" value={operator} onChange={(e) => patchVisibility({ operator: e.target.value })}>
                {sourceOptions.length > 0 && <option value="equals">is</option>}
                {sourceOptions.length > 0 && <option value="not_equals">is not</option>}
                {sourceOptions.length > 0 && <option value="in">is any of</option>}
                <option value="has_value">has a value</option>
                <option value="answered">is answered</option>
              </select>
            </div>
            {operator !== "answered" && operator !== "has_value" && operator !== "in" && sourceOptions.length > 0 && (
              <div>
                <label className="lbl">Answer</label>
                <select className="select" value={visibility.value || ""} onChange={(e) => patchVisibility({ value: e.target.value, values: [e.target.value] })}>
                  <option value="">Choose answer</option>
                  {sourceOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                </select>
              </div>
            )}
            {operator !== "answered" && operator !== "has_value" && sourceOptions.length === 0 && (
              <div className="rental-muted" style={{ alignSelf: "end", paddingBottom: 8 }}>
                This question has no answer options, so visibility can use whether it has a value.
              </div>
            )}
          </>
        )}
      </div>
      {mode === "conditional" && operator === "in" && sourceOptions.length > 0 && (
        <div className="rental-visibility-checks">
          {sourceOptions.map((option) => (
            <label key={option.id}>
              <input
                type="checkbox"
                checked={values.includes(option.id)}
                onChange={(e) => patchVisibility({ values: e.target.checked ? [...values, option.id] : values.filter((id) => id !== option.id), value: "" })}
              /> {option.label}
            </label>
          ))}
        </div>
      )}
      </div>
    </details>
  );
}

function RentalImageField({ label, imageUrl, onChange }) {
  const inputId = React.useMemo(() => "upload_" + Math.random().toString(36).slice(2), []);
  const upload = (files) => {
    const file = files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result || "");
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <label className="lbl">{label}</label>
      <div className="rental-upload-row">
        <div className="rental-image-preview">{imageUrl ? <img src={imageUrl} alt="" /> : "No image"}</div>
        <div className="rental-upload-actions">
          <label className="btn sm" htmlFor={inputId}>Upload image</label>
          <input id={inputId} type="file" accept="image/*" onChange={(e) => upload(e.target.files)} />
          {imageUrl && <button className="btn sm ghost" onClick={() => onChange("")}>Remove</button>}
        </div>
      </div>
    </div>
  );
}

function RentalGroupImageControl({ imageUrl, onChange }) {
  const Ic = window.Icons;
  const inputId = React.useMemo(() => "group_upload_" + Math.random().toString(36).slice(2), []);
  const upload = (files) => {
    const file = files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result || "");
    reader.readAsDataURL(file);
  };
  return (
    <div className="rental-group-image-control">
      <label className="lbl">Group photo</label>
      <div className="rental-group-image-row">
        <div className="rental-image-preview">{imageUrl ? <img src={imageUrl} alt="" /> : "No image"}</div>
        <div className="rental-group-image-actions">
          <label className="btn icon sm" title="Upload group photo" htmlFor={inputId}><Ic.Img size={12} /></label>
          <input id={inputId} type="file" accept="image/*" onChange={(e) => upload(e.target.files)} />
          {imageUrl && <button className="btn icon sm ghost" title="Remove group photo" onClick={() => onChange("")}><Ic.Trash size={12} /></button>}
        </div>
      </div>
    </div>
  );
}

function RentalMultiImageField({ label, images = [], onChange }) {
  const inputId = React.useMemo(() => "upload_multi_" + Math.random().toString(36).slice(2), []);
  const upload = (files) => {
    const list = Array.from(files || []);
    if (list.length === 0) return;
    Promise.all(list.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result || "");
      reader.readAsDataURL(file);
    }))).then((urls) => onChange([...(images || []), ...urls.filter(Boolean)]));
  };
  const remove = (index) => requestDeleteConfirmation({
    action: "remove",
    itemType: "image",
    itemName: `Image ${index + 1}`,
    onConfirm: () => onChange((images || []).filter((_, i) => i !== index)),
  });
  const clearAll = () => requestDeleteConfirmation({
    action: "remove",
    itemType: "images",
    itemName: "all images",
    confirmLabel: "Remove",
    onConfirm: () => onChange([]),
  });
  return (
    <div>
      <label className="lbl">{label}</label>
      <div className="rental-upload-actions">
        <label className="btn sm" htmlFor={inputId}>Upload images</label>
        <input id={inputId} type="file" accept="image/*" multiple onChange={(e) => upload(e.target.files)} />
        {(images || []).length > 0 && <button className="btn sm ghost" onClick={clearAll}>Clear all</button>}
      </div>
      {(images || []).length > 0 && (
        <div className="rental-upload-gallery">
          {(images || []).map((src, index) => (
            <span className="rental-upload-thumb" key={src + index}>
              <img src={src} alt="" />
              <button type="button" title="Remove image" onClick={() => remove(index)}>x</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function RentalTooltipFields({ value, onChange, accordion = true }) {
  const next = value || {};
  const images = next.infoImageUrls || (next.infoImageUrl ? [next.infoImageUrl] : []);
  const body = (
      <div className="rental-editor-grid">
        <div className="full">
          <label className="lbl">Tooltip text</label>
          <textarea className="textarea" rows={2} value={next.infoText || ""} placeholder="Text shown when the info icon is hovered" onChange={(e) => onChange({ ...next, infoText: e.target.value })} />
        </div>
        <div className="full">
          <RentalMultiImageField label="Tooltip images" images={images} onChange={(urls) => onChange({ ...next, infoImageUrls: urls, infoImageUrl: urls[0] || "" })} />
        </div>
      </div>
  );
  if (accordion) {
    return (
      <details className="rental-accordion">
        <summary>Info tooltip</summary>
        <div className="rental-accordion-body">{body}</div>
      </details>
    );
  }
  return (
    <div className="rental-subsection">
      <h4>Info tooltip</h4>
      {body}
    </div>
  );
}

function RentalOptionSimpleEditor({ group, onChange, onDelete, allGroups = [], parentItem = null, dragHandlers = {}, dropHandlers = {}, isDragging = false, overPosition = null }) {
  const Ic = window.Icons;
  const type = group.type || "radio";
  const options = (group.options || []).map(normalizeRentalChoiceOption);
  const hasOptions = group.allowOptions || RENTAL_CHOICE_TYPES_WITH_OPTIONS.has(type) || options.length > 0;
  const pricedStyleOptionsUseItemQuantity = ["radio", "select"].includes(type) && !rentalQuantitySourceIsFixed(group.quantitySource) && options.some((option) => Number(option.unitPrice || 0) > 0 && (option.quantitySource || group.quantitySource || "parent") !== "fixed");
  const [openOptions, setOpenOptions] = React.useState(() => new Set());
  const [optionDragIdx, setOptionDragIdx] = React.useState(null);
  const [optionOverIdx, setOptionOverIdx] = React.useState(null);
  const [optionOverPos, setOptionOverPos] = React.useState(null);
  const toggleOption = (key) => {
    setOpenOptions((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };
  const updateOption = (index, patch) => {
    const next = [...options];
    next[index] = { ...next[index], ...patch };
    onChange({ ...group, options: next });
  };
  const addOption = () => {
    const next = [...options, { id: "choice_" + Date.now(), label: "New option", unitPrice: 0, pricingModel: "included", priceMode: "included", priceEnabled: false, priceKey: "", quantitySource: type === "multi_quantity" || type === "checkbox_row" ? "own" : "parent", minCount: "", maxCount: "", stepCount: 1, infoText: "", infoImageUrl: "", infoImageUrls: [] }];
    onChange({ ...group, options: next });
  };
  const deleteOption = (index) => {
    const option = options[index];
    requestDeleteConfirmation({
      action: "remove",
      itemType: "option",
      itemName: option?.label || `Option ${index + 1}`,
      onConfirm: () => onChange({ ...group, options: options.filter((_, i) => i !== index) }),
    });
  };
  const onOptionDragStart = (index) => (e) => {
    e.stopPropagation();
    setOptionDragIdx(index);
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", String(index)); } catch (_) {}
  };
  const onOptionDragOver = (index) => (e) => {
    if (optionDragIdx == null) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setOptionOverIdx(index);
    setOptionOverPos(e.clientY < rect.top + rect.height / 2 ? "above" : "below");
  };
  const clearOptionDrag = () => {
    setOptionDragIdx(null);
    setOptionOverIdx(null);
    setOptionOverPos(null);
  };
  const onOptionDrop = (index) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (optionDragIdx == null) {
      clearOptionDrag();
      return;
    }
    onChange({ ...group, options: moveListItem(options, optionDragIdx, index, optionOverPos) });
    clearOptionDrag();
  };
  const updateNumberSetting = (key, value) => {
    onChange({ ...group, settings: { ...(group.settings || {}), [key]: value } });
  };

  return (
    <details
      className={
        "rental-option-simple" +
        (isDragging ? " is-dragging" : "") +
        (overPosition === "above" ? " is-drop-above" : "") +
        (overPosition === "below" ? " is-drop-below" : "")
      }
      {...dropHandlers}
    >
      <summary className="rental-option-simple-head">
        <span className="rental-choice-drag" title="Drag to reorder" onClick={(e) => e.stopPropagation()} {...dragHandlers}>
          <Ic.Grip size={14} />
        </span>
        <b>{group.label || "Option group"}</b>
        <span className="rental-edit-indicator" title="Open to edit this client choice"><Ic.Edit size={12} /></span>
        <button className="btn icon sm danger-ghost" title="Remove option group" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}><Ic.Trash size={12} /></button>
      </summary>
      <div className="rental-editor-grid">
        <div>
          <label className="lbl">Client sees</label>
          <input className="input" value={group.label || ""} onChange={(e) => onChange({ ...group, label: e.target.value })} />
        </div>
        <RentalImageField label="Image" imageUrl={group.imageUrl || ""} onChange={(url) => onChange({ ...group, imageUrl: url })} />
        <div className="full">
          <label className="lbl">Short description</label>
          <textarea className="textarea" rows={2} value={group.description || ""} placeholder="Optional helper text for this client question" onChange={(e) => onChange({ ...group, description: e.target.value })} />
        </div>
        <div>
          <label className="lbl">Input type</label>
          <select className="select" value={type} onChange={(e) => onChange({ ...group, type: e.target.value })}>
            {RENTAL_CLIENT_CHOICE_TYPES.map((choiceType) => <option key={choiceType.value} value={choiceType.value}>{choiceType.label}</option>)}
          </select>
        </div>
        <div>
          <label className="lbl">Quantity rule</label>
          <select className="select" value={group.quantitySource || "own"} onChange={(e) => onChange({ ...group, quantitySource: e.target.value })}>
            {RENTAL_QUANTITY_SOURCES.map((q) => <option key={q.value} value={q.value}>{q.label}</option>)}
          </select>
        </div>
        <div>
          <label className="lbl">Pricing</label>
          <select className="select" value={group.pricingModel === "quote" ? "quote" : group.priceEnabled ? "priced" : "included"} onChange={(e) => onChange({ ...group, priceMode: e.target.value, priceEnabled: e.target.value === "priced", pricingModel: e.target.value === "quote" ? "quote" : e.target.value === "priced" ? "flat_per_item" : "included", unitPrice: e.target.value === "included" ? 0 : group.unitPrice })}>
            {RENTAL_PRICE_MODES.map((mode) => <option key={mode.value} value={mode.value}>{mode.label}</option>)}
          </select>
        </div>
        {!!group.priceEnabled && group.pricingModel !== "quote" && (
          <div>
            <label className="lbl">Price</label>
            <input className="input" type="number" min="0" step="0.01" value={group.unitPrice || ""} onChange={(e) => onChange({ ...group, unitPrice: Number(e.target.value || 0), pricingModel: Number(e.target.value || 0) > 0 ? "flat_per_item" : "included", priceEnabled: true })} />
          </div>
        )}
        <div>
          <label className="lbl">Required</label>
          <div className="rental-inline-checks">
            <label className="chk"><input type="checkbox" checked={!!group.required} onChange={(e) => onChange({ ...group, required: e.target.checked })} /> Required</label>
            <label className="chk"><input type="checkbox" checked={!!group.adminRequired} onChange={(e) => onChange({ ...group, adminRequired: e.target.checked })} /> Admin required</label>
          </div>
        </div>
        {RENTAL_CHOICE_TYPES_WITH_PLACEHOLDER.has(type) && (
          <div>
            <label className="lbl">Placeholder</label>
            <input className="input" value={group.placeholder || ""} placeholder="Optional placeholder" onChange={(e) => onChange({ ...group, placeholder: e.target.value })} />
          </div>
        )}
        <div>
          <label className="lbl">Answer options</label>
          <label className="chk"><input type="checkbox" checked={hasOptions} onChange={(e) => onChange({ ...group, allowOptions: e.target.checked, options: e.target.checked ? options : [] })} /> This choice has options</label>
        </div>
      </div>

      <RentalTooltipFields value={group} onChange={(next) => onChange({ ...group, infoText: next.infoText, infoImageUrl: next.infoImageUrl, infoImageUrls: next.infoImageUrls || [] })} />

      <RentalVisibilityEditor group={group} allGroups={allGroups} parentItem={parentItem} onChange={onChange} />

      <div className="rental-choice-help">{rentalChoiceTypeHelp(type)}</div>
      {pricedStyleOptionsUseItemQuantity && (
        <div className="rental-choice-help" style={{ color: "var(--accent)", fontWeight: 650 }}>
          Priced options will be multiplied by the rental item quantity above.
        </div>
      )}

      {hasOptions && (
        <div className="rental-choice-options">
          {options.map((option, index) => {
            const optionKey = option.id || "option_" + index;
            const isOpen = openOptions.has(optionKey);
            return (
            <div
              className={
                "rental-choice-option-details" +
                (isOpen ? " open" : "") +
                (optionDragIdx === index ? " is-dragging" : "") +
                (optionOverIdx === index && optionDragIdx !== index && optionOverPos === "above" ? " is-drop-above" : "") +
                (optionOverIdx === index && optionDragIdx !== index && optionOverPos === "below" ? " is-drop-below" : "")
              }
              key={optionKey}
              onDragOver={onOptionDragOver(index)}
              onDrop={onOptionDrop(index)}
              onDragEnd={clearOptionDrag}
            >
              <div className="rental-choice-option-summary" onClick={() => toggleOption(optionKey)} role="button" tabIndex="0" onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleOption(optionKey); } }}>
                <span className="rental-choice-drag" title="Drag to reorder option" draggable onClick={(e) => e.stopPropagation()} onDragStart={onOptionDragStart(index)} onDragEnd={clearOptionDrag}>
                  <Ic.Grip size={13} />
                </span>
                <span>{option.label || "Untitled option"}</span>
                <span className="rental-choice-option-price">{option.pricingModel === "quote" ? "Quote" : option.priceEnabled && Number(option.unitPrice || 0) > 0 ? "$" + Number(option.unitPrice || 0).toFixed(2) : "No price"}</span>
                <span className="rental-edit-indicator" title="Open to edit this option"><Ic.Edit size={12} /></span>
                <button className="btn icon sm danger-ghost" title="Remove option" onClick={(e) => { e.stopPropagation(); deleteOption(index); }}><Ic.Trash size={12} /></button>
              </div>
              {isOpen && <div className="rental-choice-option-row">
              <div>
                <label className="lbl">Option label</label>
                <input className="input" value={option.label || ""} onChange={(e) => updateOption(index, { label: e.target.value })} />
              </div>
              <div>
                <label className="lbl">Pricing</label>
                <div className="rental-option-controls">
                  <div className="rental-price-inline">
                    <select className="select" value={option.pricingModel === "quote" ? "quote" : option.priceEnabled ? "priced" : "included"} onChange={(e) => updateOption(index, { priceMode: e.target.value, priceEnabled: e.target.value === "priced", pricingModel: e.target.value === "quote" ? "quote" : e.target.value === "priced" ? "flat_per_item" : "included", unitPrice: e.target.value === "included" ? 0 : option.unitPrice })}>
                      {RENTAL_PRICE_MODES.map((mode) => <option key={mode.value} value={mode.value}>{mode.label}</option>)}
                    </select>
                    {!!option.priceEnabled && option.pricingModel !== "quote" && (
                      <input className="input" type="number" min="0" step="0.01" value={option.unitPrice || ""} onChange={(e) => updateOption(index, { unitPrice: Number(e.target.value || 0), pricingModel: Number(e.target.value || 0) > 0 ? "flat_per_item" : "included", priceEnabled: true })} />
                    )}
                  </div>
                  <div className="rental-inline-checks">
                    <label className="chk"><input type="checkbox" checked={!!option.required} onChange={(e) => updateOption(index, { required: e.target.checked })} /> Required</label>
                    <label className="chk"><input type="checkbox" checked={!!option.adminRequired} onChange={(e) => updateOption(index, { adminRequired: e.target.checked })} /> Admin required</label>
                  </div>
                  {(type === "multi_quantity" || type === "checkbox_row") && (
                    <>
                    <label className="lbl">Quantity rule</label>
                    <select className="select" value={option.quantitySource || "own"} onChange={(e) => updateOption(index, { quantitySource: e.target.value })}>
                      {RENTAL_QUANTITY_SOURCES.map((q) => <option key={q.value} value={q.value}>{q.label}</option>)}
                    </select>
                    <div className="rental-editor-grid">
                      <div>
                        <label className="lbl">Minimum count</label>
                        <input className="input" type="number" min="0" value={option.minCount ?? ""} placeholder="No minimum" onChange={(e) => updateOption(index, { minCount: e.target.value === "" ? "" : Number(e.target.value) })} />
                      </div>
                      <div>
                        <label className="lbl">Maximum count</label>
                        <input className="input" type="number" min="0" value={option.maxCount ?? ""} placeholder="No maximum" onChange={(e) => updateOption(index, { maxCount: e.target.value === "" ? "" : Number(e.target.value) })} />
                      </div>
                      <div>
                        <label className="lbl">Increment</label>
                        <input className="input" type="number" min="1" value={option.stepCount ?? 1} onChange={(e) => updateOption(index, { stepCount: Number(e.target.value || 1) })} />
                      </div>
                    </div>
                    </>
                  )}
                </div>
              </div>
              <div className="full">
                <RentalTooltipFields value={option} onChange={(next) => updateOption(index, { infoText: next.infoText, infoImageUrl: next.infoImageUrl, infoImageUrls: next.infoImageUrls || [] })} />
              </div>
              </div>}
            </div>
          );})}
          {options.length > 0 && (
            <div className="rental-choice-actions">
              <span className="rental-muted">{type === "checkbox_row" ? "Use this when the client should check the row first, then enter quantity or pick variants." : type === "checkbox" ? "Use this for upgrades or add-ons where more than one answer can be chosen." : type === "multi_quantity" ? "Use this when each option needs its own amount, like plates, forks, and glasses." : "Use this when the client should choose exactly one answer."}</span>
              <button className="btn sm rental-add-btn" onClick={addOption}><Ic.Plus size={12} /> Add option</button>
            </div>
          )}
        </div>
      )}

      {RENTAL_CHOICE_TYPES_WITH_LIMITS.has(type) && (
        <div className="rental-number-settings">
          <div className="rental-editor-grid">
            <div>
              <label className="lbl">Minimum</label>
              <input className="input" type="number" value={group.settings?.min ?? ""} placeholder="No minimum" onChange={(e) => updateNumberSetting("min", e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
            <div>
              <label className="lbl">Maximum</label>
              <input className="input" type="number" value={group.settings?.max ?? ""} placeholder="No maximum" onChange={(e) => updateNumberSetting("max", e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
            <div>
              <label className="lbl">Step</label>
              <input className="input" type="number" min="1" value={group.settings?.step ?? 1} onChange={(e) => updateNumberSetting("step", Number(e.target.value || 1))} />
            </div>
            <div>
              <label className="lbl">Default value</label>
              <input className="input" type="number" value={group.settings?.defaultValue ?? ""} placeholder="Blank" onChange={(e) => updateNumberSetting("defaultValue", e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
          </div>
        </div>
      )}

      {hasOptions && options.length === 0 && (
        <div className="rental-choice-option-row compact" style={{ marginTop: 10 }}>
          <span className="rental-muted">Add the answers, variants, or add-ons the client can pick from.</span>
          <button className="btn sm rental-add-btn" onClick={addOption}><Ic.Plus size={12} /> Add first option</button>
        </div>
      )}

      {(group.rules || []).length > 0 && (
        <div className="rental-muted" style={{ marginTop: 8 }}>
          Rule: {(group.rules || []).map((r) => r.effect + (r.target ? " " + r.target : "")).join(", ")}
        </div>
      )}
    </details>
  );
}

function RentalPackageSummary({ item }) {
  const behavior = item.packageBehavior;
  if (!behavior) return null;
  return (
    <div className="rental-simple-card">
      <div className="rental-simple-card-head"><b>Package contents</b><span className="field-type-pill">Editable preset</span></div>
      <div className="rental-simple-card-body">
        {(behavior.includedItems || []).map((it) => (
          <div className="rental-quick-row" key={it.itemId}>
            <span><b>{it.label}</b><span>{it.removable ? "Client can remove it" : "Always included"}</span></span>
            <span className="rental-pill ok">Included</span>
          </div>
        ))}
        {(behavior.upgrades || []).map((up) => (
          <div className="rental-quick-row" key={up.id}>
            <span><b>{up.label}</b><span>Optional upgrade</span></span>
            <strong>${Number(up.unitPrice || 0).toFixed(2)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function previewGroupKey(group) {
  return group.id || group.label || "choice";
}

function previewPriceLabel(option) {
  if (option.pricingModel === "quote" || option.priceMode === "quote") return "Quote";
  return Number(option.unitPrice || 0) > 0 ? "+$" + Number(option.unitPrice || 0).toFixed(2) : "Included";
}

function previewChoicePriceLabel(group) {
  if (group.pricingModel === "quote" || group.priceMode === "quote") return "Quote";
  if ((group.priceEnabled === false && group.priceMode !== "priced") || Number(group.unitPrice || 0) <= 0) return "";
  const type = group.type || "radio";
  const price = "$" + Number(group.unitPrice || 0).toFixed(2);
  return type === "quantity" || type === "number" || type === "multi_quantity" || type === "checkbox_row" ? price + " each" : "+" + price;
}

function previewItemPriceLabel(item) {
  if ((item.priceEnabled === false || item.pricingModel === "included") || Number(item.unitPrice || 0) <= 0) return "";
  const price = "$" + Number(item.unitPrice || 0).toFixed(2);
  if (item.pricingModel === "per_hour") return price + "/hour";
  if (rentalUsesFixedBaseQuantity(item) || item.pricingModel === "package_fixed" || item.pricingModel === "flat_fee") return price;
  return price + " each";
}

function RentalInfoIcon({ text, imageUrl, images }) {
  const imageList = Array.from(new Set([...(Array.isArray(images) ? images : []), imageUrl].filter(Boolean)));
  const [tip, setTip] = React.useState(null);
  const hideTip = () => setTip(null);
  if (!text && imageList.length === 0) return null;
  const showTip = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const showAbove = rect.top > 180;
    setTip({
      left: Math.min(window.innerWidth - 236, Math.max(12, rect.left + rect.width / 2 - 110)),
      top: showAbove ? rect.top - 10 : rect.bottom + 10,
      transform: showAbove ? "translateY(-100%)" : "translateY(0)",
    });
  };
  return (
    <>
      <button
        type="button"
        className="rental-info-icon"
        aria-label="Show rental information"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          tip ? hideTip() : showTip(e);
        }}
        onMouseEnter={showTip}
        onMouseLeave={hideTip}
        onFocus={showTip}
        onBlur={hideTip}
      >
        i
      </button>
      {tip && <span className="rental-info-tip" style={{ left: tip.left, top: tip.top, transform: tip.transform }}>
        {imageList.map((src, index) => <img src={src} alt="" key={src + index} />)}
        {text && <span>{text}</span>}
      </span>}
    </>
  );
}

function rentalTooltipImages(entity) {
  return Array.from(new Set([
    ...(Array.isArray(entity?.infoImageUrls) ? entity.infoImageUrls : []),
    ...(Array.isArray(entity?.infoImages) ? entity.infoImages : []),
    entity?.infoImageUrl,
  ].filter(Boolean)));
}

function selectedAnswerIdsForPreview(group, values) {
  const value = values[previewGroupKey(group)];
  if (Array.isArray(value)) return value;
  if ((group.type || "radio") === "checkbox_row") return value && typeof value === "object" && value.checked ? ["checked"] : [];
  if (value && typeof value === "object" && value.checked) return ["checked"];
  if (value && typeof value === "object") return Object.keys(value).filter((id) => Number(value[id] || 0) > 0);
  return value ? [value] : [];
}

function rentalQuestionHasValue(group, values) {
  const value = values[previewGroupKey(group)];
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") {
    if ((group.type || "radio") === "checkbox_row") return !!value.checked;
    if (value.checked !== undefined) return !!value.checked;
    return Object.values(value).some((entry) => {
      if (typeof entry === "number") return entry > 0;
      if (typeof entry === "string") return entry.trim() !== "" && Number(entry || 0) > 0;
      return !!entry;
    });
  }
  if (typeof value === "number") return value > 0;
  if (typeof value === "string") return value.trim() !== "" && value !== "0";
  return !!value;
}

function isRentalQuestionVisible(group, allGroups, values, seen = new Set()) {
  const visibility = group.visibility || { mode: "always" };
  if (!visibility || visibility.mode !== "conditional") return true;
  const groupKey = group.id || group._reorderId || group.label || "choice";
  if (seen.has(groupKey)) return true;
  const source = (allGroups || []).find((candidate, index) => (candidate.id || candidate._reorderId || "option_group_" + index) === visibility.sourceGroupId);
  if (!source) return true;
  if (!isRentalQuestionVisible(source, allGroups, values, new Set([...seen, groupKey]))) return false;
  const selected = selectedAnswerIdsForPreview(source, values);
  const hasSelection = selected.length > 0;
  if (visibility.operator === "has_value") return rentalQuestionHasValue(source, values);
  if (visibility.operator === "answered") return hasSelection;
  if (visibility.operator === "not_equals") return hasSelection && !selected.includes(visibility.value);
  if (visibility.operator === "in") return selected.some((id) => (visibility.values || []).includes(id));
  return selected.includes(visibility.value);
}

function visibleRentalQuestionsForPreview(groups, values) {
  return (groups || []).filter((group) => isRentalQuestionVisible(group, groups, values));
}

function previewMultiplierForQuantitySource(source, fallbackQty, context = {}) {
  if (source === "parent" || source === "layout_recommendation" || source === "custom_override") return Number(context.parentQty || 0);
  if (source === "guest_count") return Number(context.guests || 0);
  if (source === "fixed") return 1;
  return Number(fallbackQty || 0);
}

function chargeLabelWithMultiplier(label, multiplier) {
  return Number(multiplier || 0) > 1 ? label + " x " + multiplier : label;
}

function collectPreviewCharges(groups, values, context = {}) {
  const lines = [];
  const visibilityGroups = context.parentItem ? [rentalParentVisibilitySource(context.parentItem), ...(groups || [])] : groups;
  const visibilityValues = context.parentItem ? { ...values, __parent_quantity__: context.parentQty } : values;
  visibleRentalQuestionsForPreview(visibilityGroups, visibilityValues).filter((group) => group.id !== "__parent_quantity__").forEach((group) => {
    const type = group.type || "radio";
    const key = previewGroupKey(group);
    const options = (group.options || []).map(normalizeRentalChoiceOption);
    const checkboxRowValue = values[key] && typeof values[key] === "object" && !Array.isArray(values[key]) ? values[key] : {};
    const hasValue = type === "radio" || type === "select" ? !!values[key] : type === "checkbox" ? (values[key] || []).length > 0 : type === "multi_quantity" ? Object.values(values[key] || {}).some((qty) => Number(qty || 0) > 0) : type === "checkbox_row" ? !!checkboxRowValue.checked : type === "quantity" || type === "number" ? true : values[key] !== undefined && values[key] !== "";
    if ((group.pricingModel === "quote" || group.priceMode === "quote") && hasValue) {
      lines.push({ label: group.label || "Client choice", quote: true });
    } else if (group.priceEnabled && hasValue && Number(group.unitPrice || 0) > 0) {
      if (type === "quantity" || type === "number") {
        const enteredQty = Number(values[key] ?? group.settings?.defaultValue ?? (type === "quantity" ? 2 : 1));
        const multiplier = previewMultiplierForQuantitySource(group.quantitySource || "own", enteredQty, context);
        if (multiplier > 0) lines.push({ label: chargeLabelWithMultiplier(group.label || "Client choice", multiplier), total: Number(group.unitPrice || 0) * multiplier });
      } else if (type === "checkbox_row") {
        const optionQtyTotal = Object.values(checkboxRowValue.options || {}).reduce((sum, count) => sum + Number(count || 0), 0);
        const enteredQty = options.length > 0 ? optionQtyTotal : Number(checkboxRowValue.quantity ?? group.settings?.defaultValue ?? 1);
        const multiplier = previewMultiplierForQuantitySource(group.quantitySource || "own", enteredQty, context);
        if (multiplier > 0) lines.push({ label: chargeLabelWithMultiplier(group.label || "Client choice", multiplier), total: Number(group.unitPrice || 0) * multiplier });
      } else if (type === "multi_quantity") {
        const enteredQty = Object.values(values[key] || {}).reduce((sum, count) => sum + Number(count || 0), 0);
        const multiplier = previewMultiplierForQuantitySource(group.quantitySource || "own", enteredQty, context);
        if (multiplier > 0) lines.push({ label: chargeLabelWithMultiplier(group.label || "Client choice", multiplier), total: Number(group.unitPrice || 0) * multiplier });
      } else {
        const multiplier = previewMultiplierForQuantitySource(group.quantitySource || "fixed", 1, context);
        if (multiplier > 0) lines.push({ label: chargeLabelWithMultiplier(group.label || "Client choice", multiplier), total: Number(group.unitPrice || 0) * multiplier });
      }
    }
    if (type === "radio" || type === "select") {
      const selected = options.find((option) => option.id === values[key]);
      if (selected && (selected.pricingModel === "quote" || selected.priceMode === "quote")) {
        lines.push({ label: selected.label, quote: true });
      } else if (selected && Number(selected.unitPrice || 0) > 0) {
        const multiplier = previewMultiplierForQuantitySource(selected.quantitySource || group.quantitySource || "fixed", 1, context);
        if (multiplier > 0) lines.push({ label: chargeLabelWithMultiplier(selected.label, multiplier), total: Number(selected.unitPrice || 0) * multiplier });
      }
    } else if (type === "checkbox") {
      const selectedIds = values[key] || [];
      options.filter((option) => selectedIds.includes(option.id)).forEach((option) => {
        if (option.pricingModel === "quote" || option.priceMode === "quote") {
          lines.push({ label: option.label, quote: true });
        } else if (Number(option.unitPrice || 0) > 0) {
          const multiplier = previewMultiplierForQuantitySource(option.quantitySource || group.quantitySource || "fixed", 1, context);
          if (multiplier > 0) lines.push({ label: chargeLabelWithMultiplier(option.label, multiplier), total: Number(option.unitPrice || 0) * multiplier });
        }
      });
    } else if (type === "multi_quantity") {
      const quantities = values[key] || {};
      options.forEach((option) => {
        const enteredQty = Number(quantities[option.id] || 0);
        const multiplier = previewMultiplierForQuantitySource(option.quantitySource || "own", enteredQty, context);
        if (multiplier > 0 && (option.pricingModel === "quote" || option.priceMode === "quote")) lines.push({ label: chargeLabelWithMultiplier(option.label, multiplier), quote: true });
        else if (multiplier > 0 && Number(option.unitPrice || 0) > 0) lines.push({ label: chargeLabelWithMultiplier(option.label, multiplier), total: Number(option.unitPrice || 0) * multiplier });
      });
    } else if (type === "checkbox_row" && checkboxRowValue.checked) {
      const quantities = checkboxRowValue.options || {};
      options.forEach((option) => {
        const enteredQty = Number(quantities[option.id] || 0);
        const multiplier = previewMultiplierForQuantitySource(option.quantitySource || "own", enteredQty, context);
        if (multiplier > 0 && (option.pricingModel === "quote" || option.priceMode === "quote")) lines.push({ label: chargeLabelWithMultiplier(option.label, multiplier), quote: true });
        else if (multiplier > 0 && Number(option.unitPrice || 0) > 0) lines.push({ label: chargeLabelWithMultiplier(option.label, multiplier), total: Number(option.unitPrice || 0) * multiplier });
      });
    }
  });
  return lines;
}

function RentalClientChoicePreview({ group, values, onValueChange }) {
  const type = group.type || "radio";
  const options = (group.options || []).map(normalizeRentalChoiceOption);
  const label = group.label || "Client choice";
  const key = previewGroupKey(group);
  const value = values[key];
  const checkboxRowValue = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const setValue = (next) => onValueChange(key, next);
  const inputProps = { className: "input", placeholder: group.placeholder || "" };
  const toggleCheckbox = (optionId) => {
    const selected = Array.isArray(value) ? value : [];
    setValue(selected.includes(optionId) ? selected.filter((id) => id !== optionId) : [...selected, optionId]);
  };
  const clampQty = (settings, qty, emptyDefault = 0) => {
    const min = settings?.minCount ?? settings?.min ?? emptyDefault;
    const max = settings?.maxCount ?? settings?.max ?? Infinity;
    return Math.min(max === "" || max == null ? Infinity : Number(max), Math.max(min === "" || min == null ? emptyDefault : Number(min), Number(qty || 0)));
  };
  const setMultiQty = (option, qty) => {
    setValue({ ...(value || {}), [option.id]: clampQty(option, qty) });
  };
  const toggleMultiQty = (option) => {
    const current = Number((value || {})[option.id] || 0);
    const next = current > 0 ? 0 : clampQty(option, option.minCount === "" || option.minCount == null ? 1 : option.minCount, 1);
    setValue({ ...(value || {}), [option.id]: next });
  };
  const setCheckboxRow = (patch) => setValue({ checked: false, quantity: group.settings?.defaultValue ?? 1, options: {}, ...checkboxRowValue, ...patch });
  const setCheckboxRowOptionQty = (option, qty) => {
    setCheckboxRow({ options: { ...(checkboxRowValue.options || {}), [option.id]: clampQty(option, qty) } });
  };
  const toggleCheckboxRowOptionQty = (option) => {
    const current = Number((checkboxRowValue.options || {})[option.id] || 0);
    setCheckboxRowOptionQty(option, current > 0 ? 0 : (option.minCount === "" || option.minCount == null ? 1 : option.minCount));
  };
  return (
    <div className="rental-client-field">
      {group.imageUrl && <div className="rental-client-media"><img src={group.imageUrl} alt="" /></div>}
      <div className="rental-client-label-row">
        <label>{label}{group.required ? " *" : ""}</label>
        {previewChoicePriceLabel(group) && <strong>{previewChoicePriceLabel(group)}</strong>}
        <RentalInfoIcon text={group.infoText} images={rentalTooltipImages(group)} />
      </div>
      {group.description && <small>{group.description}</small>}
      {type === "quantity" && <input {...inputProps} min={group.settings?.min ?? 0} max={group.settings?.max || undefined} step={group.settings?.step ?? 1} type="number" value={value ?? group.settings?.defaultValue ?? 2} onChange={(e) => setValue(Number(e.target.value || 0))} />}
      {type === "number" && <input {...inputProps} min={group.settings?.min ?? 0} max={group.settings?.max || undefined} step={group.settings?.step ?? 1} type="number" value={value ?? group.settings?.defaultValue ?? 1} onChange={(e) => setValue(Number(e.target.value || 0))} />}
      {type === "checkbox_row" && (
        <div className="rental-client-options">
          <button type="button" className={"rental-client-option" + (checkboxRowValue.checked ? " active" : "")} onClick={() => setCheckboxRow({ checked: !checkboxRowValue.checked })}>
            <span><i className="rental-client-dot square"></i>Add</span>
            <strong></strong>
          </button>
          {checkboxRowValue.checked && options.length === 0 && (
            <input className="input" min={group.settings?.min ?? 0} max={group.settings?.max || undefined} step={group.settings?.step ?? 1} type="number" value={checkboxRowValue.quantity ?? group.settings?.defaultValue ?? 1} onChange={(e) => setCheckboxRow({ quantity: clampQty(group.settings || {}, e.target.value, 1) })} />
          )}
          {checkboxRowValue.checked && options.length > 0 && options.map((option) => (
            <button type="button" className={"rental-client-option" + (Number((checkboxRowValue.options || {})[option.id] || 0) > 0 ? " active" : "")} key={option.id || option.label} onClick={() => toggleCheckboxRowOptionQty(option)}>
              <span>
                <i className="rental-client-dot square"></i>
                {option.label}
                <RentalInfoIcon text={option.infoText || option.description} images={rentalTooltipImages(option)} />
              </span>
              <span className="rental-client-option-actions">
                <strong>{previewPriceLabel(option)}</strong>
                <input className="input" style={{ width: 70, padding: "6px 8px" }} type="number" min={option.minCount === "" ? 0 : option.minCount} max={option.maxCount === "" ? undefined : option.maxCount} step={option.stepCount || 1} value={Number((checkboxRowValue.options || {})[option.id] || 0)} onClick={(e) => e.stopPropagation()} onChange={(e) => setCheckboxRowOptionQty(option, e.target.value)} />
              </span>
            </button>
          ))}
        </div>
      )}
      {type === "select" && (
        <select className="select" value={value || ""} onChange={(e) => setValue(e.target.value)}>
          <option value="">{group.placeholder || "Select one"}</option>
          {options.map((option) => <option key={option.id || option.label} value={option.id}>{option.label}{Number(option.unitPrice || 0) > 0 ? " (+" + Number(option.unitPrice || 0).toFixed(2) + ")" : ""}</option>)}
        </select>
      )}
      {(type === "radio" || type === "checkbox" || type === "multi_quantity") && (
        <div className="rental-client-options">
          {(options.length ? options : [{ id: "sample", label: "Option preview", unitPrice: 0 }]).map((option) => (
            <button
              type="button"
              className={"rental-client-option" + ((type === "radio" && value === option.id) || (type === "checkbox" && Array.isArray(value) && value.includes(option.id)) || (type === "multi_quantity" && Number((value || {})[option.id] || 0) > 0) ? " active" : "")}
              key={option.id || option.label}
              onClick={() => type === "radio" ? setValue(option.id) : type === "checkbox" ? toggleCheckbox(option.id) : toggleMultiQty(option)}
            >
              <span>
                <i className={"rental-client-dot" + (type === "checkbox" || type === "multi_quantity" ? " square" : "")}></i>
                {option.imageUrl && <span className="rental-client-option-media"><img src={option.imageUrl} alt="" /></span>}
                {option.label}
                <RentalInfoIcon text={option.infoText || option.description} images={rentalTooltipImages(option)} />
              </span>
              {type === "multi_quantity" ? (
                <span className="rental-client-option-actions">
                  <strong>{previewPriceLabel(option)}</strong>
                  <input className="input" style={{ width: 70, padding: "6px 8px" }} type="number" min={option.minCount === "" ? 0 : option.minCount} max={option.maxCount === "" ? undefined : option.maxCount} step={option.stepCount || 1} value={Number((value || {})[option.id] || 0)} onClick={(e) => e.stopPropagation()} onChange={(e) => setMultiQty(option, e.target.value)} />
                </span>
              ) : <strong>{previewPriceLabel(option)}</strong>}
            </button>
          ))}
        </div>
      )}
      {type !== "select" && type !== "radio" && type !== "checkbox" && type !== "multi_quantity" && type !== "checkbox_row" && options.length > 0 && (
        <div className="rental-client-options" style={{ marginTop: 8 }}>
          {options.map((option) => <button type="button" className="rental-client-option" key={option.id || option.label} onClick={() => setValue(option.id)}><span>{option.label}</span><strong>{previewPriceLabel(option)}</strong></button>)}
        </div>
      )}
    </div>
  );
}

function RentalClientPreviewPanel({ item }) {
  const Ic = window.Icons;
  const fixedBaseQuantity = rentalUsesFixedBaseQuantity(item);
  const defaultQty = fixedBaseQuantity ? 1 : item.defaultUnits ?? (item.quantitySource === "guest_count" ? 50 : item.pricingModel === "per_hour" ? 3 : 2);
  const [baseQty, setBaseQty] = React.useState(defaultQty);
  const [values, setValues] = React.useState({});
  const clientSelectable = item.clientSelectable === true;
  const [itemChecked, setItemChecked] = React.useState(!clientSelectable);
  React.useEffect(() => {
    setBaseQty(defaultQty);
    setValues({});
    setItemChecked(!clientSelectable);
  }, [item.id, item.pricingModel, item.quantitySource, clientSelectable]);
  const effectiveQty = clientSelectable && !itemChecked ? 0 : fixedBaseQuantity ? 1 : baseQty;
  const base = computeRentalQuoteLine(item, effectiveQty, { guests: effectiveQty, hours: effectiveQty });
  const selectedOptions = itemChecked ? collectPreviewCharges(item.optionGroups || [], values, { parentItem: item, parentQty: effectiveQty, guests: effectiveQty, hours: effectiveQty }) : [];
  const optionsTotal = selectedOptions.reduce((sum, line) => sum + Number(line.total || 0), 0);
  const total = Number(base.total || 0) + optionsTotal;
  const updateValue = (key, next) => setValues((prev) => ({ ...prev, [key]: next }));
  const needsParentQuantity = rentalOptionGroupsNeedParentQuantity(item);
  const showBaseQuantity = !fixedBaseQuantity && (needsParentQuantity || !item.hideBaseQuantity);
  const showBaseField = showBaseQuantity || item.imageUrl || item.infoText || item.notes || clientSelectable;
  const showBasePriceLine = itemChecked && !(item.hideBaseQuantity && Number(base.total || 0) === 0);
  return (
    <div className="rental-client-preview">
      <div className="rental-client-preview-head">
        <div>
          <h3>Client preview</h3>
          <p>This is how this rental can appear to a client, including visible choices and an example total.</p>
        </div>
      </div>
      <div className="rental-client-preview-body">
        <div className="rental-client-form">
          {showBaseField && <div className="rental-client-field">
            {item.imageUrl && <div className="rental-client-media"><img src={item.imageUrl} alt="" /></div>}
            <div className="rental-client-label-row">
              {clientSelectable ? (
                <label className={"rental-client-item-check" + (itemChecked ? " active" : "")}>
                  <input type="checkbox" checked={itemChecked} onChange={(e) => setItemChecked(e.target.checked)} />
                  <span>{item.name || "Untitled rental"}</span>
                  {rentalRequiresDelivery(item) && <DeliveryIndicator />}
                </label>
              ) : (
                <label>
                  {item.name || "Untitled rental"}
                  {rentalRequiresDelivery(item) && <DeliveryIndicator />}
                </label>
              )}
              {previewItemPriceLabel(item) && <strong>{previewItemPriceLabel(item)}</strong>}
              <RentalInfoIcon text={item.infoText} images={rentalTooltipImages(item)} />
            </div>
            {item.notes && <small>{item.notes}</small>}
            {itemChecked && showBaseQuantity && <input className="input" type="number" min={item.minUnits ?? 0} max={item.maxUnits || undefined} step={item.increment || 1} value={baseQty} onChange={(e) => setBaseQty(Math.max(Number(item.minUnits || 0), Number(e.target.value || 0)))} />}
            {itemChecked && item.packageBehavior && (
              <div className="rental-client-included">
                <b>Included with package</b>
                {(item.packageBehavior.includedItems || []).map((included) => (
                  <label key={included.itemId}>
                    <input type="checkbox" checked readOnly />
                    <span>{included.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>}
          {itemChecked && ((item.optionGroups || []).length > 0 ? visibleRentalQuestionsForPreview(
            [rentalParentVisibilitySource(item), ...(item.optionGroups || [])],
            { ...values, __parent_quantity__: effectiveQty }
          ).filter((group) => group.id !== "__parent_quantity__").map((group) => <RentalClientChoicePreview key={group.id || group.label} group={group} values={values} onValueChange={updateValue} />) : item.packageBehavior ? null : (
            <div className="rental-muted">No extra choices. Client only sees the rental quantity and price.</div>
          ))}
        </div>
        <div className="rental-client-summary">
          <h4>Example price</h4>
          {showBasePriceLine && <div className="rental-client-summary-row"><span>{item.name || "Base rental"}</span><strong>${Number(base.total || 0).toFixed(2)}</strong></div>}
          {itemChecked && item.packageBehavior && (item.packageBehavior.includedItems || []).map((included) => (
            <div className="rental-client-summary-row" key={included.itemId}><span>{included.label}</span><strong>Included</strong></div>
          ))}
          {selectedOptions.map((line, index) => (
            <div className="rental-client-summary-row" key={line.label + index}><span>{line.label}</span><strong>{line.quote ? "Quote" : "$" + Number(line.total || 0).toFixed(2)}</strong></div>
          ))}
          <div className="rental-client-summary-row"><span>Total preview</span><strong>${total.toFixed(2)}</strong></div>
        </div>
      </div>
    </div>
  );
}

function groupQuantityForPreview(item, option) {
  if (option.quantitySource === "own") return 1;
  if (item.quantitySource === "guest_count") return 50;
  return item.pricingModel === "per_hour" ? 3 : 2;
}

function RentalSelectedEditor({ item, rows, venues = [], deliveryOptions = [], onPatch, onAddOptionGroup, onUpdateOptionGroup, onDeleteOptionGroup, onReorderOptionGroups }) {
  const Ic = window.Icons;
  const categories = Array.from(new Set([...RENTAL_CATEGORIES, ...rows.map((r) => r.category).filter(Boolean)]));
  const optionGroups = (item.optionGroups || []).map((group, index) => {
    const id = group.id || "option_group_" + index;
    return { ...group, id, _reorderId: id };
  });
  const choiceDnd = window.useReorderable({
    items: optionGroups,
    idKey: "_reorderId",
    onReorder: (next) => onReorderOptionGroups(next.map(({ _reorderId, ...group }) => group)),
  });
  const preview = computeRentalQuoteLine(item, item.pricingModel === "per_hour" ? 3 : 2, { hours: 3, guests: 50 });
  const venueIds = rentalAvailableVenueIds(item);
  const activeDeliveryOptions = normalizeDeliveryOptions(deliveryOptions).filter((option) => option.active !== false || option.id === item.deliveryOptionId);
  const selectedDeliveryOption = activeDeliveryOptions.find((option) => option.id === item.deliveryOptionId);
  const requiresDelivery = item.procurementType === "external" && !!item.deliveryRequired;
  const basePriceEnabled = item.priceEnabled ?? item.pricingModel !== "included";
  const setProcurementType = (procurementType) => {
    const patch = { procurementType, fulfillmentType: procurementType };
    if (procurementType !== "external") {
      patch.deliveryRequired = false;
      patch.deliveryOptionId = "";
    } else {
      patch.deliveryRequired = item.deliveryRequired ?? !!item.deliveryOptionId;
      patch.deliveryOptionId = item.deliveryOptionId || activeDeliveryOptions[0]?.id || "";
    }
    onPatch(patch);
  };
  const setDeliveryRequired = (checked) => onPatch({ deliveryRequired: checked, deliveryOptionId: checked ? (item.deliveryOptionId || activeDeliveryOptions[0]?.id || "") : "" });
  const toggleVenue = (venueId) => {
    const next = venueIds.includes(venueId) ? venueIds.filter((id) => id !== venueId) : [...venueIds, venueId];
    onPatch({ venueIds: next });
  };
  const selectAllVenues = () => onPatch({ venueIds: [] });
  return (
    <div className="editor-col">
      <div className="editor-inner">
        <div className="editor-head">
          <div>
            <div className="editor-head-tag">Rental Item</div>
            <h1>{item.name || "Untitled rental"}</h1>
            <p>Keep this simple: name the rental, choose how it is priced, then add any choices the client must answer.</p>
          </div>
          <div className="rental-pill-row">
            {item.packageBehavior && <span className="rental-pill accent">Package</span>}
            {requiresDelivery && <span className="rental-pill accent" title="Delivery required"><Ic.Truck size={11} /></span>}
          </div>
        </div>

        <div className="rental-help">
          Start with the basics. The client form should feel like a short checklist, not a maze.
        </div>

        <div className="section-bar"><h2>Rental details <span className="count">1</span></h2></div>
        <div className="rental-simple-card">
          <div className="rental-simple-card-body">
            <div className="rental-subsection">
              <h4>Display</h4>
              <div className="rental-editor-grid">
                <div>
                  <label className="lbl">Rental name</label>
                  <input className="input" value={item.name || ""} onChange={(e) => onPatch({ name: e.target.value })} />
                </div>
                <div>
                  <label className="lbl">Group</label>
                  <select className="select" value={item.category || "Tables"} onChange={(e) => onPatch({ category: e.target.value })}>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <RentalImageField label="Rental image" imageUrl={item.imageUrl || ""} onChange={(url) => onPatch({ imageUrl: url })} />
                <div className="full">
                  <label className="lbl">Short description</label>
                  <textarea className="textarea" rows={2} value={item.notes || ""} onChange={(e) => onPatch({ notes: e.target.value })} placeholder="Short helper text for admins and clients." />
                </div>
              </div>
            </div>

            <div className="rental-subsection">
              <h4>Inventory</h4>
              <div className="rental-editor-grid">
                <div>
                  <label className="lbl">Stock inventory</label>
                  <label className="chk"><input type="checkbox" checked={!!item.noStockInventory} onChange={(e) => onPatch({ noStockInventory: e.target.checked })} /> No stock inventory</label>
                </div>
                {!item.noStockInventory && (
                  <div className="full rental-inventory-grid">
                    <div>
                      <label className="lbl"># of units available</label>
                      <input className="input" type="number" min="0" value={item.stock ?? ""} onChange={(e) => onPatch({ stock: Number(e.target.value || 0) })} />
                    </div>
                    <div>
                      <label className="lbl">Minimum units</label>
                      <input className="input" type="number" min="0" value={item.minUnits ?? ""} onChange={(e) => onPatch({ minUnits: e.target.value === "" ? "" : Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="lbl">Maximum units</label>
                      <input className="input" type="number" min="0" value={item.maxUnits ?? ""} onChange={(e) => onPatch({ maxUnits: e.target.value === "" ? "" : Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="lbl">Increment</label>
                      <input className="input" type="number" min="1" value={item.increment ?? 1} onChange={(e) => onPatch({ increment: Number(e.target.value || 1) })} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rental-subsection">
              <h4>Pricing</h4>
              <div className="rental-editor-grid">
                <div>
                  <label className="lbl">Base price</label>
                  <label className="chk"><input type="checkbox" checked={basePriceEnabled} onChange={(e) => onPatch({ priceEnabled: e.target.checked, pricingModel: e.target.checked ? (item.pricingModel === "included" ? "flat_per_item" : item.pricingModel) : "included" })} /> Enable base price</label>
                </div>
                {basePriceEnabled ? (
                  <div>
                    <label className="lbl">Price</label>
                    <input className="input" type="number" min="0" step="0.01" value={item.unitPrice || ""} onChange={(e) => {
                      const nextPrice = Number(e.target.value || 0);
                      onPatch({
                        unitPrice: nextPrice,
                        priceText: "$" + nextPrice,
                        priceEnabled: true,
                        pricingModel: nextPrice > 0 && ["included", "quote"].includes(item.pricingModel) ? "flat_per_item" : item.pricingModel,
                      });
                    }} />
                  </div>
                ) : (
                  <div aria-hidden="true" />
                )}
                <div>
                  <label className="lbl">Charge type</label>
                  <select className="select" value={item.pricingModel || "flat_per_item"} onChange={(e) => onPatch({ pricingModel: e.target.value, priceEnabled: e.target.value !== "included" })}>
                    {RENTAL_PRICING_MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="lbl">Quantity rule</label>
                  <select className="select" value={item.quantitySource === "parent" ? "own" : item.quantitySource || "own"} onChange={(e) => onPatch({ quantitySource: e.target.value })}>
                    {RENTAL_QUANTITY_SOURCES.filter((q) => q.value !== "parent").map((q) => <option key={q.value} value={q.value}>{q.label}</option>)}
                  </select>
                  {item.quantitySource === "parent" && (
                    <div className="rental-muted" style={{ marginTop: 4 }}>Top-level rentals cannot inherit a parent quantity. This will behave as “Ask for this item.”</div>
                  )}
                </div>
              </div>
            </div>

            <div className="rental-subsection">
              <h4>Procurement & delivery</h4>
              <div className="rental-editor-grid">
                <div>
                  <label className="lbl">Procurement type</label>
                  <select className="select" value={item.procurementType || "internal"} onChange={(e) => setProcurementType(e.target.value)}>
                    {PROCUREMENT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="lbl">Delivery required</label>
                  <label className={"chk" + (item.procurementType !== "external" ? " rental-disabled-field" : "")}>
                    <input type="checkbox" disabled={item.procurementType !== "external"} checked={requiresDelivery} onChange={(e) => setDeliveryRequired(e.target.checked)} />
                    Show delivery indicator and add fee
                  </label>
                </div>
                <div className={!requiresDelivery ? "rental-disabled-field" : ""}>
                  <label className="lbl">Delivery type</label>
                  <select className="select" disabled={!requiresDelivery} value={item.deliveryOptionId || ""} onChange={(e) => onPatch({ deliveryOptionId: e.target.value })}>
                    <option value="">Select delivery type</option>
                    {activeDeliveryOptions.map((option) => <option key={option.id} value={option.id}>{option.label} (${Number(option.amount || 0).toFixed(2)})</option>)}
                  </select>
                </div>
                <div>
                  <label className="lbl">Current delivery fee</label>
                  <div className="input" style={{ display: "flex", alignItems: "center", color: "var(--ink-3)" }}>
                    {requiresDelivery && selectedDeliveryOption ? "$" + Number(selectedDeliveryOption.amount || 0).toFixed(2) : "No delivery fee"}
                  </div>
                </div>
              </div>
            </div>

            <div className="rental-subsection">
              <h4>Venue availability</h4>
              <div className="rental-muted" style={{ marginBottom: 8 }}>Choose where this rental item can be offered. Leave all venues selected to make it available everywhere.</div>
              {venues.length > 0 ? (
                <div className="rental-venue-checks">
                  <label className="chk">
                    <input type="checkbox" checked={venueIds.length === 0} onChange={selectAllVenues} />
                    All venues
                  </label>
                  {venues.map((venue) => (
                    <label className="chk" key={venue.id}>
                      <input
                        type="checkbox"
                        checked={venueIds.length === 0 || venueIds.includes(venue.id)}
                        onChange={() => toggleVenue(venue.id)}
                      />
                      {venue.name || "Untitled venue"}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="rental-muted">Add venues in the Venue step to restrict rentals by space.</div>
              )}
            </div>

            <div className="rental-subsection">
              <h4>Requirements</h4>
              <div className="rental-inline-checks">
                <label className="chk"><input type="checkbox" checked={!!item.required} onChange={(e) => onPatch({ required: e.target.checked })} /> Required</label>
                <label className="chk"><input type="checkbox" checked={!!item.adminRequired} onChange={(e) => onPatch({ adminRequired: e.target.checked })} /> Admin required</label>
                <label className="chk"><input type="checkbox" checked={item.active !== false} onChange={(e) => onPatch({ active: e.target.checked })} /> Available</label>
                <label className="chk"><input type="checkbox" checked={item.clientVisible !== false} onChange={(e) => onPatch({ clientVisible: e.target.checked })} /> Show to client</label>
                <label className="chk"><input type="checkbox" checked={rentalLayoutRecommendationEnabled(item)} onChange={(e) => onPatch({ layoutRecommendationEnabled: e.target.checked })} /> Use in layout recommendations</label>
              </div>
            </div>

            <RentalTooltipFields value={item} onChange={(next) => onPatch({ infoText: next.infoText, infoImageUrl: next.infoImageUrl, infoImageUrls: next.infoImageUrls || [] })} />

            <div className="rental-preview-card" style={{ marginTop: 14 }}>
              <h3>Example total</h3>
              <div className="rental-muted">{rentalPricingLabel(item.pricingModel)} · {quantitySourceLabel(item.quantitySource)}</div>
              <div className="rental-preview-line"><span>{preview.multiplier || 0} × ${Number(preview.unitPrice || 0).toFixed(2)}</span><strong>${Number(preview.total || 0).toFixed(2)}</strong></div>
            </div>
          </div>
        </div>

        <details className="rental-accordion no-summary-indicator" open>
          <summary>
            <span>Client choices <span className="count">{(item.optionGroups || []).length}</span></span>
          </summary>
          <div className="rental-accordion-body">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
              <button className="btn sm rental-add-btn" onClick={onAddOptionGroup}><Ic.Plus size={12} /> Add choice</button>
            </div>
            {optionGroups.length === 0 ? (
              <div className="rental-simple-card">
                <div className="rental-simple-card-body">
                  <div className="rental-muted">No extra choices yet. This rental will only ask for quantity.</div>
                </div>
              </div>
            ) : (
              optionGroups.map((group, index) => (
                <RentalOptionSimpleEditor
                  key={group._reorderId}
                  group={group}
                  allGroups={optionGroups}
                  parentItem={item}
                  dragHandlers={choiceDnd.sourceHandlers(group)}
                  dropHandlers={choiceDnd.targetHandlers(group)}
                  isDragging={choiceDnd.isDragging(group._reorderId)}
                  overPosition={choiceDnd.overPosition(group._reorderId)}
                  onChange={(next) => onUpdateOptionGroup(index, next)}
                  onDelete={() => onDeleteOptionGroup(index)}
                />
              ))
            )}
          </div>
        </details>

        <RentalPackageSummary item={item} />

        <div className="section-bar"><h2>Client preview</h2></div>
        <RentalClientPreviewPanel item={item} />
      </div>
    </div>
  );
}

function RentalGroupManager({ rows, onClose, onAddGroup, onRenameGroup, onDeleteGroup, onMoveGroup, onGroupImageChange }) {
  const Ic = window.Icons;
  const groups = orderedRentalCategories(rows);
  const [drafts, setDrafts] = React.useState(() => Object.fromEntries(groups.map((group) => [group, group])));
  const [newGroup, setNewGroup] = React.useState("");
  const [moving, setMoving] = React.useState(null);
  const countByGroup = groups.reduce((acc, group) => {
    acc[group] = rows.filter((r) => r.category === group).length;
    return acc;
  }, {});
  const saveRename = (oldName) => {
    const nextName = String(drafts[oldName] || "").trim();
    if (!nextName || nextName === oldName) return;
    onRenameGroup(oldName, nextName);
    setDrafts((prev) => ({ ...prev, [nextName]: nextName }));
  };
  const addGroup = () => {
    const name = newGroup.trim();
    if (!name) return;
    onAddGroup(name);
    setNewGroup("");
  };
  const moveGroup = (group, direction) => {
    setMoving({ group, direction });
    onMoveGroup(group, direction);
    setTimeout(() => setMoving(null), 240);
  };

  return (
    <div className="rental-modal-backdrop" onClick={onClose}>
      <div className="rental-modal" style={{ width: 700 }} onClick={(e) => e.stopPropagation()}>
        <h3>Rental groups</h3>
        <div className="rental-modal-body">
          <div className="rental-muted">Groups are the left-side buckets clients and admins use to understand the rental catalog.</div>
          {groups.map((group, index) => (
            <div className={"rental-group-row manage" + (moving?.group === group ? (moving.direction < 0 ? " move-up" : " move-down") : "")} key={group}>
              <div>
                <label className="lbl">Group name</label>
                <input className="input" value={drafts[group] ?? group} onChange={(e) => setDrafts((prev) => ({ ...prev, [group]: e.target.value }))} />
              </div>
              <RentalGroupImageControl imageUrl={rentalGroupImageForRows(rows, group)} onChange={(url) => onGroupImageChange(group, url)} />
              <span>{countByGroup[group] || 0} items</span>
              <div className="rental-order-buttons">
                <button className="btn icon sm" title="Move up" disabled={index === 0} onClick={() => moveGroup(group, -1)}><Ic.ArrUp size={12} /></button>
                <button className="btn icon sm" title="Move down" disabled={index === groups.length - 1} onClick={() => moveGroup(group, 1)}><Ic.ArrDn size={12} /></button>
              </div>
              <button className="btn sm" onClick={() => saveRename(group)}>Save</button>
              <button className="btn icon sm danger-ghost" title="Delete group" onClick={() => onDeleteGroup(group)}><Ic.Trash size={12} /></button>
            </div>
          ))}
          <div className="rental-group-row">
            <div>
              <label className="lbl">New group</label>
              <input className="input" value={newGroup} onChange={(e) => setNewGroup(e.target.value)} placeholder="Example: Lighting" />
            </div>
            <span>New</span>
            <button className="btn sm rental-add-btn" onClick={addGroup}><Ic.Plus size={12} /> Add</button>
          </div>
        </div>
        <div className="rental-modal-actions">
          <button className="btn primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

function RentalRecommendedModal({ group, rows, onClose, onAddSelected }) {
  const Ic = window.Icons;
  const recommended = recommendedRentalsForGroup(group);
  const existingIds = new Set(rows.map((r) => r.id));
  const available = recommended.filter((item) => !existingIds.has(item.id));
  const [selectedIds, setSelectedIds] = React.useState(() => available.map((item) => item.id));
  const toggle = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };
  const addSelected = () => {
    const selected = recommended.filter((item) => selectedIds.includes(item.id) && !existingIds.has(item.id));
    if (selected.length === 0) return;
    onAddSelected(group, selected);
  };

  return (
    <div className="rental-modal-backdrop" onClick={onClose}>
      <div className="rental-modal" style={{ width: 680 }} onClick={(e) => e.stopPropagation()}>
        <h3>Add recommended {group}</h3>
        <div className="rental-modal-body">
          <div className="rental-muted">Choose the saved rental items you want available in this group.</div>
          <div className="rental-recommend-list">
            {recommended.map((item) => {
              const exists = existingIds.has(item.id);
              const checked = selectedIds.includes(item.id) || exists;
              return (
                <label className="rental-recommend-row" key={item.id}>
                  <input type="checkbox" checked={checked} disabled={exists} onChange={() => toggle(item.id)} />
                  <span>
                    <b>{item.name}</b>
                    {rentalRequiresDelivery(item) && <DeliveryIndicator />}
                    <span>{exists ? "Already in catalog" : item.notes || item.priceKey || "Saved recommended rental"}</span>
                  </span>
                  <strong>{item.pricingModel === "quote" ? "Quote" : item.pricingModel === "included" ? "Included" : "$" + Number(item.unitPrice || 0).toFixed(2)}</strong>
                </label>
              );
            })}
            {recommended.length === 0 && <div className="rental-muted">No recommended rentals found for this group yet.</div>}
          </div>
        </div>
        <div className="rental-modal-actions">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn rental-add-btn" onClick={addSelected} disabled={selectedIds.filter((id) => !existingIds.has(id)).length === 0}>
            <Ic.Plus size={12} /> Add selected
          </button>
        </div>
      </div>
    </div>
  );
}

function RentalEmptySelection({ activeGroup, onAddBlank, onOpenRecommended }) {
  const Ic = window.Icons;
  const recommendedCount = recommendedRentalsForGroup(activeGroup).length;
  return (
    <div className="editor-col">
      <div className="rental-empty-config">
        <div className="rental-empty-config-card">
          <h2>No rental selected</h2>
          <p>Add a new rental item to {activeGroup}, or choose from recommended old-site items.</p>
          <button className="btn rental-add-btn" onClick={() => onOpenRecommended(activeGroup)} disabled={recommendedCount === 0}>
            <Ic.Plus size={12} /> Add recommended items
          </button>
          <button className="btn" onClick={() => onAddBlank(activeGroup)}>
            <Ic.Edit size={12} /> Add new item
          </button>
        </div>
      </div>
    </div>
  );
}

function RentalsCatalogView({ catalog, onChange, venues = [], siteSettings = SAMPLE_SITE_SETTINGS }) {
  const rows = normalizeRentalCatalog(catalog || []);
  const deliveryOptions = normalizeSiteSettings(siteSettings).fulfillment?.deliveryOptions || DEFAULT_DELIVERY_OPTIONS;
  const [activeId, setActiveId] = React.useState(() => rows[0]?.id || null);
  const [activeGroup, setActiveGroup] = React.useState(() => rows[0]?.category || RENTAL_CATEGORIES[0]);
  const [groupManagerOpen, setGroupManagerOpen] = React.useState(false);
  const [recommendedGroup, setRecommendedGroup] = React.useState(null);
  const selected = rows.find((r) => r.id === activeId) || null;

  React.useEffect(() => {
    if (activeId && !selected && rows[0]) setActiveId(rows[0].id);
  }, [activeId, selected, rows]);
  React.useEffect(() => {
    if (selected?.category && selected.category !== activeGroup) setActiveGroup(selected.category);
  }, [selected, activeGroup]);

  const patchItem = (id, patch) => onChange(rows.map((r) => r.id === id ? { ...r, ...patch } : r));
  const duplicateItem = (item) => {
    const id = "rental_" + Date.now();
    onChange([...rows, { ...item, id, name: item.name + " (copy)" }]);
    setActiveGroup(item.category || activeGroup);
    setActiveId(id);
  };
  const deleteItem = (id) => {
    const current = rows.find((r) => r.id === id);
    if (!current) return;
    const category = current?.category || activeGroup;
    requestDeleteConfirmation({
      itemType: "rental",
      itemName: current.name || "Untitled rental item",
      onConfirm: () => {
        const next = rows.filter((r) => r.id !== id);
        onChange(next);
        if (activeId === id) setActiveId(next.find((r) => r.category === category)?.id || null);
      },
    });
  };
  const addItem = (category = "Tables") => {
    const id = "rental_" + Date.now();
    const item = { id, schemaVersion: 1, name: "New Rental Item", category, imageUrl: "", groupImageUrl: rentalGroupImageForRows(rows, category), priceText: "$0", unit: "each", priceKey: "", legacyKey: "", pricingModel: "flat_per_item", priceEnabled: false, unitPrice: 0, quantitySource: "own", optionGroups: [], deliveryClass: "none", procurementType: "internal", fulfillmentType: "internal", deliveryRequired: false, deliveryOptionId: "", noStockInventory: false, stock: "", minUnits: 0, maxUnits: "", increment: 1, required: false, adminRequired: false, clientVisible: true, active: true, venueIds: [], layoutRecommendationEnabled: ["Tables", "Chairs"].includes(category), notes: "", infoText: "", infoImageUrl: "", infoImageUrls: [], groupSelectionRule: groupSelectionRuleFor(rows, category), groupOrder: orderedRentalCategories(rows).indexOf(category) };
    onChange([...rows, item]);
    setActiveGroup(category);
    setActiveId(id);
  };
  const addGroup = (category) => {
    const id = "rental_" + Date.now();
    const item = { id, schemaVersion: 1, name: "New " + category + " Rental", category, imageUrl: "", groupImageUrl: "", priceText: "$0", unit: "each", priceKey: "", legacyKey: "", pricingModel: "flat_per_item", priceEnabled: false, unitPrice: 0, quantitySource: "own", optionGroups: [], deliveryClass: "none", procurementType: "internal", fulfillmentType: "internal", deliveryRequired: false, deliveryOptionId: "", noStockInventory: false, stock: "", minUnits: 0, maxUnits: "", increment: 1, required: false, adminRequired: false, clientVisible: true, active: true, venueIds: [], layoutRecommendationEnabled: ["Tables", "Chairs"].includes(category), notes: "", infoText: "", infoImageUrl: "", infoImageUrls: [], groupSelectionRule: "optional", groupOrder: orderedRentalCategories(rows).length };
    onChange([...rows, item]);
    setActiveGroup(category);
    setActiveId(id);
  };
  const renameGroup = (oldName, nextName) => {
    onChange(rows.map((r) => r.category === oldName ? { ...r, category: nextName } : r));
    if (activeGroup === oldName) setActiveGroup(nextName);
  };
  const deleteGroup = (category) => {
    requestDeleteConfirmation({
      itemType: "rental group",
      itemName: category,
      tail: " rental group and all items inside it? This action cannot be undone.",
      onConfirm: () => {
        const next = rows.filter((r) => r.category !== category);
        onChange(next);
        if (activeGroup === category) {
          const nextGroup = orderedRentalCategories(next)[0] || RENTAL_CATEGORIES[0];
          setActiveGroup(nextGroup);
          setActiveId(next.find((r) => r.category === nextGroup)?.id || null);
        }
      },
    });
  };
  const moveGroup = (category, direction) => {
    const groups = orderedRentalCategories(rows);
    const from = groups.indexOf(category);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= groups.length) return;
    const nextGroups = [...groups];
    [nextGroups[from], nextGroups[to]] = [nextGroups[to], nextGroups[from]];
    onChange(rows.map((r) => ({ ...r, groupOrder: nextGroups.indexOf(r.category) })));
  };
  const updateGroupImage = (category, groupImageUrl) => {
    onChange(rows.map((r) => r.category === category ? { ...r, groupImageUrl } : r));
  };
  const moveItem = (id, direction) => {
    const current = rows.find((r) => r.id === id);
    if (!current) return;
    const groupRows = rows.filter((r) => r.category === current.category);
    const from = groupRows.findIndex((r) => r.id === id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= groupRows.length) return;
    const swapWith = groupRows[to];
    const next = [...rows];
    const fromIndex = next.findIndex((r) => r.id === id);
    const toIndex = next.findIndex((r) => r.id === swapWith.id);
    [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
    onChange(next.map((r) => r.category === current.category ? { ...r, itemOrder: next.filter((candidate) => candidate.category === current.category).findIndex((candidate) => candidate.id === r.id) } : r));
  };
  const addRecommendedItems = (category, selectedItems) => {
    const existingIds = new Set(rows.map((r) => r.id));
    const additions = (selectedItems || []).filter((item) => !existingIds.has(item.id));
    if (additions.length === 0) return;
    onChange([...rows, ...additions]);
    setActiveGroup(category);
    setActiveId(additions[0].id);
    setRecommendedGroup(null);
  };
  const selectGroup = (category) => {
    setActiveGroup(category);
    const first = rows.find((r) => r.category === category);
    setActiveId(first?.id || null);
  };
  const updateGroupSelectionRule = (category, rule) => {
    onChange(rows.map((r) => r.category === category ? { ...r, groupSelectionRule: rule } : r));
  };

  const addOptionGroup = () => {
    if (!selected) return;
    const group = { id: "option_" + Date.now(), label: "New client choice", type: "radio", quantitySource: "own", required: false, priceMode: "included", priceEnabled: false, pricingModel: "included", unitPrice: 0, options: [] };
    patchItem(selected.id, { optionGroups: [...(selected.optionGroups || []), group] });
  };
  const updateOptionGroup = (index, nextGroup) => {
    const { _reorderId, ...cleanGroup } = nextGroup || {};
    const groups = [...(selected.optionGroups || [])];
    groups[index] = cleanGroup;
    patchItem(selected.id, { optionGroups: groups });
  };
  const reorderOptionGroups = (nextGroups) => {
    patchItem(selected.id, { optionGroups: nextGroups });
  };
  const deleteOptionGroup = (index) => {
    const group = selected.optionGroups?.[index];
    requestDeleteConfirmation({
      action: "remove",
      itemType: "client choice",
      itemName: group?.label || `Client choice ${index + 1}`,
      confirmLabel: "Remove",
      onConfirm: () => {
        const groups = (selected.optionGroups || []).filter((_, i) => i !== index);
        patchItem(selected.id, { optionGroups: groups });
      },
    });
  };

  return (
    <div className="workspace rental-workspace">
      <RentalCatalogList rows={rows} activeId={selected?.id} activeGroup={activeGroup} groupSelectionRule={groupSelectionRuleFor(rows, activeGroup)} onGroupSelectionRuleChange={(rule) => updateGroupSelectionRule(activeGroup, rule)} onSelectGroup={selectGroup} onSelect={setActiveId} onAdd={() => addItem(activeGroup)} onDuplicate={duplicateItem} onDelete={deleteItem} onMoveItem={moveItem} onManageGroups={() => setGroupManagerOpen(true)} onOpenRecommended={setRecommendedGroup} />
      {selected ? (
        <RentalSelectedEditor
          item={selected}
          rows={rows}
          venues={venues}
          deliveryOptions={deliveryOptions}
          onPatch={(patch) => patchItem(selected.id, patch)}
          onAddOptionGroup={addOptionGroup}
          onUpdateOptionGroup={updateOptionGroup}
          onDeleteOptionGroup={deleteOptionGroup}
          onReorderOptionGroups={reorderOptionGroups}
        />
      ) : (
        <RentalEmptySelection activeGroup={activeGroup} onAddBlank={addItem} onOpenRecommended={setRecommendedGroup} />
      )}
      {groupManagerOpen && <RentalGroupManager rows={rows} onClose={() => setGroupManagerOpen(false)} onAddGroup={addGroup} onRenameGroup={renameGroup} onDeleteGroup={deleteGroup} onMoveGroup={moveGroup} onGroupImageChange={updateGroupImage} />}
      {recommendedGroup && <RentalRecommendedModal group={recommendedGroup} rows={rows} onClose={() => setRecommendedGroup(null)} onAddSelected={addRecommendedItems} />}
    </div>
  );
}

window.SAMPLE_PRICING_RULES = SAMPLE_PRICING_RULES;
window.RENTAL_CATEGORIES = RENTAL_CATEGORIES;
window.SAMPLE_RENTAL_CATALOG = SAMPLE_RENTAL_CATALOG;
window.RENTAL_PRICING_MODELS = RENTAL_PRICING_MODELS;
window.RENTAL_QUANTITY_SOURCES = RENTAL_QUANTITY_SOURCES;
window.LEGACY_RENTAL_ARCHITECTURE = LEGACY_RENTAL_ARCHITECTURE;
window.normalizeRentalCatalog = normalizeRentalCatalog;
window.computeRentalQuoteLine = computeRentalQuoteLine;
window.RentalsCatalogView = RentalsCatalogView;



// Sidebar — left navigation, collapsible.

function initialsForName(name = "Admin") {
  return String(name || "Admin")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "A";
}

function Sidebar({ collapsed, onToggle, active, onChangeSection, siteSettings, currentAdmin }) {
  const Ic = window.Icons;
  const branding = siteSettings?.branding || {};
  const shortTitle = (branding.adminBrandName || branding.siteTitle || "Collaburo").replace(/^Customize Your Event\s*[-·]\s*/i, "").trim() || "Collaburo";
  const profileName = currentAdmin?.displayName || currentAdmin?.username || "Admin";
  const profileTitle = currentAdmin?.title || currentAdmin?.role || "Admin";
  return (
    <aside className="side">
      <div className="side-brand">
        <div className="side-brand-mark">
          {branding.favicon ? <img src={branding.favicon} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 7 }} /> : (shortTitle[0] || "C")}
        </div>
        {!collapsed && (
          <div className="side-brand-name">
            {shortTitle}
            <span>Admin</span>
          </div>
        )}
        <button className="side-toggle" onClick={onToggle} aria-label="Toggle sidebar">
          <Ic.PanelLeft size={16} />
        </button>
      </div>

      <div className="side-section">Operations</div>
      <nav className="side-nav">
        {SIDE_NAV_BOTTOM.map((n) => {
          const IconCmp = Ic[n.icon];
          return (
            <a
              key={n.id}
              className={"side-link" + (active === n.id ? " active" : "")}
              onClick={() => onChangeSection && onChangeSection(n.id)}
              title={collapsed ? n.label : undefined}
            >
              <span className="side-link-icon"><IconCmp size={16} /></span>
              <span className="side-link-label">{n.label}</span>
              {n.count && <span className="side-link-count">{n.count}</span>}
            </a>
          );
        })}
      </nav>

      <div className="side-section">Configuration</div>
      <nav className="side-nav">
        {SIDE_NAV.map((n) => {
          const IconCmp = Ic[n.icon];
          return (
            <a
              key={n.id}
              className={"side-link" + (active === n.id ? " active" : "")}
              onClick={() => onChangeSection && onChangeSection(n.id)}
              title={collapsed ? n.label : undefined}
            >
              <span className="side-link-icon"><IconCmp size={16} /></span>
              <span className="side-link-label">{n.label}</span>
              {n.count && <span className="side-link-count">{n.count}</span>}
            </a>
          );
        })}
      </nav>

      <button className={"side-foot" + (active === "profile" ? " active" : "")} onClick={() => onChangeSection && onChangeSection("profile")} title="Open admin profile">
        <div className="side-avatar">{initialsForName(profileName)}</div>
        <div className="side-user">
          <b>{profileName}</b>
          <span>{profileTitle}</span>
        </div>
      </button>
    </aside>
  );
}

window.Sidebar = Sidebar;



// Topbar — breadcrumb + preview / save / publish actions.


function Topbar({ section, onTogglePreview, previewOpen, isDirty, lastSaved, onSave, onPublish, onUndo, onRedo, canUndo = false, canRedo = false }) {
  const Ic = window.Icons;
  const isWorkflow = section === "workflow";
  const hasUndoRedo = section === "workflow" || section === "rentals";
  const undoLabel = section === "rentals" ? "Undo rental catalog change" : "Undo workflow change";
  const redoLabel = section === "rentals" ? "Redo rental catalog change" : "Redo workflow change";
  const sectionLabel = section === "profile" ? "Profile" : (SECTION_LABEL[section] || section);
  return (
    <header className="topbar">
      <div className="crumbs">
        <span className="past">{SECTION_PARENT[section] || "Admin"}</span>
        <span className="sep">/</span>
        <span className="here">{sectionLabel}</span>
      </div>
      <span className="draft-pill" title={isDirty ? "Unsaved changes — press ⌘S to save" : "All changes saved"}>
        {isDirty ? "Unsaved changes" : `Saved ${lastSaved}`}
      </span>

      <div className="topbar-actions">
        {hasUndoRedo && (
          <>
            <button className="btn icon sm ghost" title={undoLabel} onClick={onUndo} disabled={!canUndo} style={!canUndo ? { opacity: 0.35, pointerEvents: "none" } : {}}>
              <Ic.Undo size={14} />
            </button>
            <button className="btn icon sm ghost" title={redoLabel} onClick={onRedo} disabled={!canRedo} style={!canRedo ? { opacity: 0.35, pointerEvents: "none" } : {}}>
              <Ic.Redo size={14} />
            </button>
          </>
        )}
        {isWorkflow && (
          <>
            <button
              className="btn"
              onClick={onTogglePreview}
              title="Open client-view preview"
            >
              <Ic.Eye size={14} />
              Preview
            </button>
          </>
        )}
        <button className="btn" onClick={onSave} disabled={!isDirty} style={!isDirty ? { opacity: 0.5 } : {}}>
          <Ic.Save size={14} /> Save changes
          <span className="kbd" style={{ marginLeft: 4 }}>⌘S</span>
        </button>
        {isWorkflow && (
          <button className="btn primary" onClick={onPublish}>
            <Ic.Publish size={14} /> Publish
          </button>
        )}
        <span className="admin-badge">Admin</span>
      </div>
    </header>
  );
}

window.Topbar = Topbar;



// Step list — middle column. Reorder (DnD), delete, add steps, search.

function StepList({ steps, activeId, onSelect, onMove, onDelete, onAdd, onRename, onReorder }) {
  const Ic = window.Icons;
  const [renaming, setRenaming] = React.useState(null);
  const [draft, setDraft] = React.useState("");
  const [query, setQuery] = React.useState("");

  const filtered = query.trim()
    ? steps.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    : steps;

  // DnD only when not filtering
  const dnd = window.useReorderable({
    items: steps,
    onReorder,
  });

  return (
    <div className="steps-col">
      <div className="col-head">
        <h3>Step Sequence</h3>
        <div className="col-head-actions">
          <button className="btn icon sm ghost" title="Add step" onClick={onAdd}>
            <Ic.Plus size={13} />
          </button>
        </div>
      </div>

      <div className="col-search">
        <div className="col-search-wrap">
          <span className="ic"><Ic.Search size={13} /></span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search steps…"
          />
          {!query && <span className="col-search-kbd">⌘ K</span>}
        </div>
      </div>

      <div className="steps-body">
        {filtered.length === 0 && (
          <div style={{ padding: "12px 4px", fontSize: 12, color: "var(--ink-3)" }}>
            No steps match "{query}".
          </div>
        )}
        {filtered.map((s) => {
          // overall index in unfiltered list (for numbering)
          const idx = steps.findIndex((x) => x.id === s.id);
          const isActive = s.id === activeId;
          const isRenaming = renaming === s.id;
          const fields = s.fields || [];
          const requiredCount = fields.filter((f) => f.required).length;
          const requiredLine = requiredCount > 0 ? (
            <span>{requiredCount} required</span>
          ) : null;
          // Don't allow drag when filtering or renaming (so text selection / input works)
          const dndActive = !query && !isRenaming;
          const source = dndActive ? dnd.sourceHandlers(s) : {};
          const target = dndActive ? dnd.targetHandlers(s) : {};
          const cls =
            "step-card" +
            (isActive ? " active" : "") +
            (dnd.isDragging(s.id) ? " is-dragging" : "") +
            (dnd.overPosition(s.id) === "above" ? " is-drop-above" : "") +
            (dnd.overPosition(s.id) === "below" ? " is-drop-below" : "");
          return (
            <div
              key={s.id}
              className={cls}
              onClick={() => !isRenaming && onSelect(s.id)}
              {...source}
              {...target}
            >
              <span className="step-drag" onClick={(e) => e.stopPropagation()} title="Drag to reorder">
                <Ic.Grip size={14} />
              </span>
              <span className="step-card-num">{idx + 1}</span>
              <div className="step-card-body">
                {isRenaming ? (
                  <input
                    className="input"
                    style={{ padding: "3px 6px", fontSize: 13, fontWeight: 500 }}
                    value={draft}
                    autoFocus
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => { onRename(s.id, draft.trim() || s.name); setRenaming(null); }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.target.blur();
                      if (e.key === "Escape") setRenaming(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <span className="step-card-name">{s.name}</span>
                    <span className="step-card-meta">
                      {s.stepType === "venue"
                        ? <><span>{(s.venues || []).length} {(s.venues || []).length === 1 ? "venue" : "venues"}</span>{requiredLine}</>
                        : s.stepType === "layout"
                        ? <><span>{(s.spaceRequirements || []).length} space reqs · {Object.values(s.floorLayouts || {}).reduce((n, v) => n + (v.layouts || []).length, 0)} layouts</span>{requiredLine}</>
                        : <><span>{fields.length} {fields.length === 1 ? "field" : "fields"}</span>{requiredLine}</>
                      }
                    </span>
                  </>
                )}
              </div>
              <div className="step-card-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn icon sm ghost"
                  title="Rename"
                  onClick={() => { setDraft(s.name); setRenaming(s.id); }}
                >
                  <Ic.Edit size={12} />
                </button>
                <button
                  className="btn icon sm ghost"
                  title="Move up"
                  onClick={() => onMove(s.id, -1)}
                  disabled={idx === 0}
                  style={idx === 0 ? { opacity: 0.3, pointerEvents: "none" } : {}}
                >
                  <Ic.ArrUp size={12} />
                </button>
                <button
                  className="btn icon sm ghost"
                  title="Move down"
                  onClick={() => onMove(s.id, 1)}
                  disabled={idx === steps.length - 1}
                  style={idx === steps.length - 1 ? { opacity: 0.3, pointerEvents: "none" } : {}}
                >
                  <Ic.ArrDn size={12} />
                </button>
                <button
                  className="btn icon sm danger-ghost"
                  title="Delete step"
                  onClick={() => onDelete(s.id)}
                >
                  <Ic.Trash size={12} />
                </button>
              </div>
            </div>
          );
        })}
        <button className="add-step" onClick={onAdd}>
          <Ic.Plus size={13} /> Add new step
        </button>
      </div>
    </div>
  );
}

window.StepList = StepList;



// Field editor — right column. Cards for each field, expand to reveal config.

const TYPE_META = {
  text:        { label: "Text",        pillIcon: "Type" },
  textarea:    { label: "Long text",   pillIcon: "List" },
  email:       { label: "Email",       pillIcon: "Mail" },
  phone:       { label: "Phone",       pillIcon: "Phone" },
  number:      { label: "Number",      pillIcon: "Hash" },
  select:      { label: "Dropdown",    pillIcon: "Chevron" },
  multiselect: { label: "Multi-select",pillIcon: "CheckSq" },
  date:        { label: "Date",        pillIcon: "Clock" },
  daterange:   { label: "Date range",  pillIcon: "Cal" },
  file:        { label: "File",        pillIcon: "File" },
  price:       { label: "Price",       pillIcon: "Dollar" },
  toggle:      { label: "Toggle",      pillIcon: "Toggle" },
  radio:       { label: "Radio",       pillIcon: "List" },
  groupselect: { label: "Grouped",     pillIcon: "Sliders" },
  time:        { label: "Time",        pillIcon: "Clock" },
  checkbox:    { label: "Checkbox",    pillIcon: "CheckSq" },
  dietary:     { label: "Dietary",     pillIcon: "List" },
  room:        { label: "Room",        pillIcon: "Building" },
  addons:      { label: "Add-ons",     pillIcon: "Cards" },
  rental_group:{ label: "Rental group", pillIcon: "Tag" },
  extras:      { label: "Extras",      pillIcon: "Dollar" },
  separator:   { label: "Separator",   pillIcon: "Minus" },
  instructional: { label: "Info text", pillIcon: "Info" },
};

const SIMPLE_FIELD_TYPES = ["text", "textarea", "email", "phone", "number", "date", "time", "file", "radio", "multiselect", "select", "toggle", "extras", "separator", "instructional"];
const SIMPLE_OPTION_FIELD_TYPES = ["radio", "multiselect", "select"];
const SIMPLE_PLACEHOLDER_TYPES = ["text", "textarea", "email", "phone", "number", "select"];

function simpleTypeOptions() {
  const seen = new Set();
  return (window.SIMPLE_FIELD_GROUPS || []).flatMap((group) => group.items || []).filter((item) => {
    if (seen.has(item.type)) return false;
    seen.add(item.type);
    return SIMPLE_FIELD_TYPES.includes(item.type);
  });
}

function optionLabel(option) {
  return typeof option === "string" ? option : (option?.label || "");
}

function moveListItem(items = [], fromIndex, toIndex, position = "above") {
  if (fromIndex == null || toIndex == null || fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return items;
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  let insertAt = toIndex;
  if (position === "below") insertAt = fromIndex < toIndex ? toIndex : toIndex + 1;
  else insertAt = fromIndex < toIndex ? Math.max(0, toIndex - 1) : toIndex;
  next.splice(Math.max(0, Math.min(insertAt, next.length)), 0, moved);
  return next;
}

function optionPrice(option) {
  if (typeof option !== "object" || !option) return 0;
  return Number(option.unitPrice ?? option.price ?? 0) || 0;
}

function simpleOptionPricingStructure(option) {
  const value = typeof option === "object" && option ? option.pricingStructure : "";
  if (value === "per_person") return "per_person";
  if (value === "included") return "included";
  if (value === "quote") return "quote";
  return "flat";
}

function simpleOptionPriceDisplay(option) {
  const price = optionPrice(option);
  if (!optionHasPricing(option) || price <= 0) return "";
  return "$" + price.toFixed(2) + (simpleOptionPricingStructure(option) === "per_person" ? " per person" : "");
}

function simpleOptionCostLine(option, guestCount = 0, depth = 0, level = "option") {
  if (!optionHasPricing(option)) return null;
  const pricingStructure = simpleOptionPricingStructure(option);
  const basePrice = optionPrice(option);
  const qtyPeople = Math.max(0, Number(guestCount) || 0);
  const multiplier = pricingStructure === "per_person" ? qtyPeople : 1;
  return {
    label: option.label || "Selected option",
    price: basePrice * multiplier,
    basePrice,
    qtyPeople,
    qtyHours: 1,
    multiplier,
    depth,
    enablePrice: true,
    level,
    pricingStructure,
  };
}

function optionHasPricing(option) {
  if (typeof option !== "object" || !option) return false;
  return !!(option.priceEnabled || option.enablePrice || option.priceMode === "priced" || option.pricingModel === "quote" || optionPrice(option) > 0);
}

function normalizeSimpleOption(option, fallback = "Option") {
  if (typeof option === "string") return { label: option || fallback };
  return { label: option?.label || fallback, ...option };
}

function normalizeSimpleOptionGroups(options = []) {
  const source = options && options.length ? options : [{ label: "Option 1" }, { label: "Option 2" }];
  const groups = [];
  let current = null;
  source.forEach((option) => {
    if (typeof option === "string" && option.startsWith("@")) {
      current = { id: "group_" + groups.length, label: option.slice(1) || "New group", options: [] };
      groups.push(current);
      return;
    }
    if (option && typeof option === "object" && option.type === "group") {
      groups.push({ id: option.id || "group_" + groups.length, label: option.label || "New group", options: (option.options || []).map((o, i) => normalizeSimpleOption(o, `Option ${i + 1}`)) });
      current = groups[groups.length - 1];
      return;
    }
    if (!current) {
      current = { id: "group_0", label: "Group 1", options: [] };
      groups.push(current);
    }
    current.options.push(normalizeSimpleOption(option, `Option ${current.options.length + 1}`));
  });
  return groups.length ? groups : [{ id: "group_0", label: "Group 1", options: [] }];
}

function groupedOptionCategoryForValue(field, value) {
  if (!field?.groupOptions) return "";
  const selectedLabel = value && typeof value === "object" ? value.__selected || value.main || "" : value || "";
  if (!selectedLabel) return "";
  const groups = normalizeSimpleOptionGroups(field.options || []);
  const match = groups.find((group) => (group.options || []).some((option) => String(option.label || "") === String(selectedLabel)));
  return match?.label || "";
}

function isRichWorkflowOption(option) {
  return !!(typeof option === "object" && option && (
    option.type === "group" ||
    option.hasSubOptions ||
    option.subOptions ||
    option.hasSelections ||
    option.selections ||
    option.hasSpecifications ||
    option.specifications ||
    option.options ||
    option.hasPeopleOption ||
    option.hasHoursOption ||
    option.pricingStructure === "quote"
  ));
}

function workflowRentalCatalogItems(groupName, venueId = "") {
  const source = window.CURRENT_RENTAL_CATALOG || window.SAMPLE_RENTAL_CATALOG || [];
  const catalog = window.normalizeRentalCatalog ? window.normalizeRentalCatalog(source) : source;
  return catalog.filter((item) => item.category === groupName && item.active !== false && rentalAvailableForVenue(item, venueId));
}

function workflowRentalPriceLabel(item) {
  if (!item) return "";
  const model = rentalPricingModel(item);
  if (model === "quote") return "Quote";
  const unitPrice = rentalUnitPrice(item);
  if (model === "included" || unitPrice <= 0) return "Included";
  return "$" + unitPrice.toFixed(2);
}

function RentalGroupFieldEditor({ field, onChange }) {
  const catalogGroups = currentRentalCatalogGroups();
  const groups = Array.from(new Set([...(catalogGroups || []), field.rentalGroup || field.label].filter(Boolean)));
  const selectedGroup = field.rentalGroup || groups[0] || "";
  const items = workflowRentalCatalogItems(selectedGroup);
  const previewItems = items.slice(0, 6);
  const set = (patch) => onChange({ ...field, ...patch });
  return (
    <>
      <div className="field-grid">
        <div>
          <label className="lbl">Field label</label>
          <input className="input" value={field.label || ""} onChange={(e) => set({ label: e.target.value })} />
        </div>
        <div>
          <label className="lbl">Connected rental group</label>
          <select className="select" value={selectedGroup} onChange={(e) => set({ rentalGroup: e.target.value, label: field.label || e.target.value })}>
            {groups.map((group) => <option key={group} value={group}>{group}</option>)}
          </select>
        </div>
      </div>
      <div className="field-grid one">
        <div>
          <label className="lbl">Short description</label>
          <textarea className="textarea" rows={2} value={field.fieldDescription || ""} placeholder="Optional helper text shown above this rental group." onChange={(e) => set({ fieldDescription: e.target.value })} />
        </div>
      </div>
      <div className="field-grid">
        <div>
          <label className="lbl">Show rentals as</label>
          <select className="select" value={field.rentalDisplayMode || (selectedGroup === "Tables" ? "separate_items" : "grouped")} onChange={(e) => set({ rentalDisplayMode: e.target.value })}>
            <option value="grouped">One group</option>
            <option value="separate_items">Individual items</option>
          </select>
        </div>
        <div>
          <label className="lbl">Group heading in preview</label>
          <input className="input" value={field.rentalPreviewHeading || ""} placeholder="Example: Space Contents" onChange={(e) => set({ rentalPreviewHeading: e.target.value })} />
        </div>
      </div>
      <div className="workflow-rental-box">
        <div className="workflow-rental-head">
          <b>{selectedGroup}</b>
          <span>{items.length} catalog item{items.length === 1 ? "" : "s"} connected</span>
        </div>
        <div className="workflow-rental-list">
          {previewItems.map((item) => (
            <div className="workflow-rental-chip" key={item.id}>
              <b>{item.name}</b>
              <span>{workflowRentalPriceLabel(item)}</span>
            </div>
          ))}
        </div>
        <div className="workflow-rental-note">
          This field pulls from the Rentals catalog. To edit item names, prices, options, packages, or conditions, use the Rentals page.
        </div>
      </div>
      <div className="field-flag-row">
        <label className="chk"><input type="checkbox" checked={!!field.required} onChange={(e) => set({ required: e.target.checked })} /> Required <span className="req">*</span></label>
        <label className="chk"><input type="checkbox" checked={!!field.adminRequired} onChange={(e) => set({ adminRequired: e.target.checked })} /> Admin required <span className="req">*</span></label>
        <label className="chk"><input type="checkbox" checked={field.visibleToClient !== false} onChange={(e) => set({ visibleToClient: e.target.checked })} /> Visible to client</label>
        <label className="chk"><input type="checkbox" checked={field.linkedToPricing !== false} onChange={(e) => set({ linkedToPricing: e.target.checked })} /> Linked to pricing</label>
      </div>
    </>
  );
}

function ExtrasFieldEditor({ field, onChange }) {
  const set = (patch) => onChange({ ...field, ...patch });
  return (
    <>
      <div className="field-grid">
        <div>
          <label className="lbl">Section label</label>
          <input className="input" value={field.label || ""} onChange={(e) => set({ label: e.target.value })} />
        </div>
        <div>
          <label className="lbl">Amount label</label>
          <input className="input" value={field.amountLabel || ""} placeholder="Total Extra Amount" onChange={(e) => set({ amountLabel: e.target.value })} />
        </div>
      </div>
      <div className="field-grid one">
        <div>
          <label className="lbl">Description field label</label>
          <input className="input" value={field.descriptionLabel || ""} placeholder="Description" onChange={(e) => set({ descriptionLabel: e.target.value })} />
        </div>
      </div>
      <div className="field-grid one">
        <div>
          <label className="lbl">Client helper text</label>
          <textarea className="textarea" rows={3} value={field.placeholder || ""} placeholder="Text shown inside the description box." onChange={(e) => set({ placeholder: e.target.value })} />
        </div>
      </div>
      <div className="field-flag-row">
        <label className="chk"><input type="checkbox" checked={field.visibleToClient !== false} onChange={(e) => set({ visibleToClient: e.target.checked })} /> Visible to client</label>
        <label className="chk"><input type="checkbox" checked={field.linkedToPricing !== false} onChange={(e) => set({ linkedToPricing: e.target.checked })} /> Linked to pricing</label>
      </div>
      <div className="rental-help" style={{ marginTop: 10 }}>
        The amount is entered from the Rentals Progress List for each booking. Clients can see the amount but can only edit the description.
      </div>
    </>
  );
}

function rentalGroupFieldPreset(group) {
  const labelMap = { "AV / Tech": "Tech", "Decor / Other": "Others" };
  return {
    type: "rental_group",
    label: labelMap[group] || group,
    rentalGroup: group,
    rentalDisplayMode: group === "Tables" ? "separate_items" : "grouped",
    rentalPreviewHeading: "Space Contents",
    required: false,
    visibleToClient: true,
    linkedToPricing: true,
    category: "Rentals",
  };
}

function RentalGroupPickerModal({ existingFields = [], onConfirm, onClose }) {
  const Ic = window.Icons;
  const existingGroups = new Set((existingFields || []).filter((field) => field.type === "rental_group").map((field) => field.rentalGroup || field.label));
  const catalogGroups = currentRentalCatalogGroups();
  const available = catalogGroups.map((group) => {
    const items = workflowRentalCatalogItems(group);
    return { group, items, disabled: existingGroups.has(group) };
  });
  const [selected, setSelected] = React.useState(() => available.filter((row) => !row.disabled).map((row) => row.group));
  const toggle = (group) => {
    setSelected((prev) => prev.includes(group) ? prev.filter((item) => item !== group) : [...prev, group]);
  };
  const chosen = available.filter((row) => selected.includes(row.group) && !row.disabled).map((row) => rentalGroupFieldPreset(row.group));
  return (
    <div className="rec-overlay" onClick={onClose}>
      <div className="rec-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Add Rental Groups</h3>
        <div className="sub">Choose which Rentals catalog groups should appear in this workflow step.</div>
        {available.length === 0 && (
          <div className="rental-muted" style={{ padding: "18px 4px" }}>No rental groups are connected in the Rentals catalog yet.</div>
        )}
        {available.map((row) => (
          <label key={row.group} className={"rec-field" + (selected.includes(row.group) || row.disabled ? " sel" : "")} style={row.disabled ? { opacity: 0.55 } : {}} onClick={(e) => { e.preventDefault(); if (!row.disabled) toggle(row.group); }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" checked={selected.includes(row.group) || row.disabled} disabled={row.disabled} readOnly />
              <span>
                <b>{row.group}</b>
                <span style={{ display: "block", fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                  {row.disabled ? "Already in this step" : row.items.length + " catalog item" + (row.items.length === 1 ? "" : "s")}
                </span>
              </span>
            </span>
            <span className="field-type-pill" style={{ fontSize: 10.5 }}>Rental group</span>
          </label>
        ))}
        <div className="rec-actions">
          <button className="btn-gray" onClick={onClose}>Cancel</button>
          <button className="btn-accent" disabled={chosen.length === 0} style={chosen.length === 0 ? { opacity: 0.5, pointerEvents: "none" } : {}} onClick={() => onConfirm(chosen)}>
            <Ic.Plus size={13} /> Add selected ({chosen.length})
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Field card ----------------
function FieldCard({ field, allFields, stepType, open, onToggle, onUpdate, onDuplicate, onDelete, sourceHandlers, targetHandlers, isDragging, isOver, overPosition }) {
  const Ic = window.Icons;
  const [advOpen, setAdvOpen] = React.useState(false);
  const set = (patch) => onUpdate({ ...field, ...patch });
  const supportsOptions = SIMPLE_OPTION_FIELD_TYPES.includes(field.type) || ["groupselect", "checkbox"].includes(field.type);
  const simpleEditable = SIMPLE_FIELD_TYPES.includes(field.type);
  const dynamicDeliveryField = isDeliveryOptionsField(field);
  const deliveryRows = deliveryOptionFieldRows();
  const needsAdvancedOptions = (field.options || []).some((option) => {
    if (!option || typeof option !== "object") return false;
    if (field.groupOptions && option.type === "group") return false;
    if (option.hasSelections || option.selections || option.hasSpecifications || option.specifications || option.options) return true;
    if (option.hasPeopleOption || option.hasHoursOption) return true;
    return stepType === "services" && ["per_person", "per_hour", "per_person_hour", "quote"].includes(option.pricingStructure);
  });
  // hasOptions is now a persisted field property. Backward-compat: derive from existing data if not set.
  const hasOptionsResolved = field.hasOptions !== undefined
    ? !!field.hasOptions
    : (supportsOptions || (field.options && field.options.length > 0));
  const setHasOptions = (val) => {
    // Toggle visibility only — preserve existing options data so it comes back when re-enabled.
    set({ hasOptions: val });
  };
  // When the user changes "Display Field As", snap hasOptions to the new type's natural default
  // so the body visibly reflects the change. The user can still manually toggle Has options.
  const changeFieldType = (newType) => {
    const patch = { type: newType };
    const newSupportsOptions = SIMPLE_OPTION_FIELD_TYPES.includes(newType);
    patch.hasOptions = newSupportsOptions;
    if (newType === "email") patch.placeholder = "name@example.com";
    if (newType === "phone") patch.placeholder = "(123) 123-1234";
    if (newType === "number") patch.step = field.step || 1;
    if (newSupportsOptions && !(field.options || []).length) patch.options = [{ label: "Option 1" }, { label: "Option 2" }];
    // Clear displayAs when no longer relevant
    if (!newSupportsOptions) patch.displayAs = undefined;
    // Clear type-incompatible props
    if (newType !== "dietary") patch.dietaryOptions = undefined;
    if (newType !== "number") { patch.min = undefined; patch.max = undefined; }
    onUpdate({ ...field, ...patch });
  };
  const fieldGalleryImages = (field.galleryImages && field.galleryImages.length)
    ? field.galleryImages
    : (field.galleryImage ? [field.galleryImage] : []);
  const addFieldGalleryImages = (files) => {
    const selected = Array.from(files || []);
    if (!selected.length) return;
    Promise.all(selected.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target.result);
      reader.readAsDataURL(file);
    }))).then((urls) => {
      const next = [...fieldGalleryImages, ...urls];
      set({ galleryImages: next, galleryImage: next[0] || "" });
    });
  };
  const removeFieldGalleryImage = (index) => {
    requestDeleteConfirmation({
      action: "remove",
      itemType: "image",
      itemName: `Image ${index + 1}`,
      confirmLabel: "Remove",
      onConfirm: () => {
        const next = fieldGalleryImages.filter((_, i) => i !== index);
        set({ galleryImages: next, galleryImage: next[0] || "" });
      },
    });
  };
  const galleryUploadControl = (
    <>
      <label className="lbl">
        Information gallery icon <Ic.Img size={11} style={{ verticalAlign: "middle", marginLeft: 2 }} />
      </label>
      <div className="upload-wrap">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            addFieldGalleryImages(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="upload">
          <Ic.Img size={16} />
          <span><b>Upload images</b> · drag or click</span>
        </div>
      </div>
      {fieldGalleryImages.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          {fieldGalleryImages.map((image, imageIndex) => (
            <div className="upload-preview" key={imageIndex} style={{ marginTop: 0 }}>
              <img src={image} alt="Gallery preview" style={{ width: 72, height: 54, objectFit: "cover" }} />
              <span className="remove" onClick={() => removeFieldGalleryImage(imageIndex)} title="Remove image">×</span>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const src = sourceHandlers || {};
  const tgt = targetHandlers || {};
  const gripSource = {
    ...src,
    onDragStart: (e) => {
      if (open) onToggle();
      if (src.onDragStart) src.onDragStart(e);
    },
  };

  return (
    <div
      className={
        "field" + (open ? " open" : "") +
        (isDragging ? " is-dragging" : "") +
        (overPosition === "above" ? " is-drop-above" : "") +
        (overPosition === "below" ? " is-drop-below" : "")
      }
      data-comment-anchor={`field-${field.id}`}
      data-admin-item-id={field.id}
      {...tgt}
    >
      <div className="field-row" onClick={onToggle}>
        <span className="field-grip" onClick={(e) => e.stopPropagation()} {...gripSource}>
          <Ic.Grip size={14} />
        </span>
        <span className="field-name">
          {field.label}
          {field.required && <span className="req">*</span>}
        </span>
        <span className="field-row-spacer" />
        <span className="field-type-pill">{TYPE_META[field.type]?.label || field.type}</span>
        <div className="field-actions" onClick={(e) => e.stopPropagation()}>
          <button className="btn icon sm ghost" title="Duplicate" onClick={onDuplicate}>
            <Ic.Copy size={13} />
          </button>
          <button
            className="btn icon sm ghost"
            title={open ? "Close editor" : "Edit field"}
            onClick={onToggle}
          >
            <Ic.Edit size={13} />
          </button>
          <button className="btn icon sm danger-ghost" title="Delete" onClick={onDelete}>
            <Ic.Trash size={13} />
          </button>
        </div>
      </div>

      {open && (
        <div className="field-body">
          {field.type === "separator" ? (
            <div style={{ padding: "8px 0" }}>
              <div style={{ borderTop: "2px solid var(--line)", margin: "8px 0 12px" }} />
              <div style={{ fontSize: 11, color: "var(--ink-4)" }}>This adds a visual divider line between sections in the client view. No configuration needed.</div>
            </div>
          ) : field.type === "dietary" ? (
            <DietaryEditor
              dietaryOptions={field.dietaryOptions || []}
              onChange={(dietaryOptions) => set({ dietaryOptions })}
            />
          ) : field.type === "instructional" ? (
            <div>
              <div className="field-grid one">
                <div>
                  <label className="lbl">Display Text</label>
                  <textarea className="textarea" rows={3} value={field.label || ""} placeholder="Enter the instructional text to display to clients..." onChange={(e) => set({ label: e.target.value })} />
                </div>
              </div>
              <div className="field-grid one" style={{ marginTop: 8 }}>
                <div>
                  <label className="lbl">Description <span className="hint">optional secondary text</span></label>
                  <textarea className="textarea" rows={2} value={field.fieldDescription || ""} placeholder="Additional detail or context..." onChange={(e) => set({ fieldDescription: e.target.value })} />
                </div>
              </div>
              <div className="adv" style={{ marginTop: 12 }}>
                <div className="adv-head" onClick={() => setAdvOpen((o) => !o)}>
                  <span>Advanced settings</span>
                  <Ic.Chevron
                    size={13}
                    style={{
                      transform: advOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.15s",
                      color: "var(--ink-3)"
                    }}
                  />
                </div>
                {advOpen && (
                  <div className="adv-body">
                    <div className="field-grid">
                      <div>
                        <label className="lbl">
                          Information icon <Ic.Info size={11} style={{ verticalAlign: "middle", marginLeft: 2 }} />
                        </label>
                        <input
                          className="input"
                          value={field.helpText || ""}
                          placeholder="Enter tooltip text..."
                          onChange={(e) => set({ helpText: e.target.value })}
                        />
                      </div>
                      <div>
                        {galleryUploadControl}
                      </div>
                    </div>
                    <div>
                      <label className="lbl">Internal-only note <span className="hint">visible to staff only</span></label>
                      <textarea
                        className="textarea"
                        rows={2}
                        value={field.internalNote || ""}
                        placeholder="Notes for the operations team..."
                        onChange={(e) => set({ internalNote: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="lbl">
                        Visibility condition <Ic.Branch size={11} style={{ verticalAlign: "middle", marginLeft: 2 }} />
                      </label>
                      <VisibilityRule
                        rule={field.visibility}
                        allFields={allFields.filter((f) => f.id !== field.id)}
                        onChange={(visibility) => set({ visibility })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : field.type === "rental_group" ? (
            <RentalGroupFieldEditor field={field} onChange={onUpdate} />
          ) : field.type === "extras" ? (
            <ExtrasFieldEditor field={field} onChange={onUpdate} />
          ) : (
          <>
          <div className="field-grid">
            <div>
              <label className="lbl">Field Label</label>
              <input
                className="input"
                value={field.label}
                onChange={(e) => set({ label: e.target.value })}
              />
            </div>
            <div>
              <label className="lbl">Simple field type</label>
              {simpleEditable ? (
                <select
                  className="select"
                  value={field.type}
                  onChange={(e) => changeFieldType(e.target.value)}
                >
                  {simpleTypeOptions().map((t) => (
                    <option key={t.type} value={t.type}>{t.label}</option>
                  ))}
                </select>
              ) : (
                <div className="input" style={{ background: "var(--surface-3)", color: "var(--ink-3)" }}>
                  {TYPE_META[field.type]?.label || field.type}
                </div>
              )}
            </div>
          </div>

          {SIMPLE_PLACEHOLDER_TYPES.includes(field.type) && (
            <div className="field-grid one">
              <div>
                <label className="lbl">
                  Placeholder
                  <span className="hint" style={{ marginLeft: 8 }}>shown to clients before they type</span>
                </label>
                <input
                  className="input"
                  value={field.placeholder || ""}
                  placeholder=""
                  onChange={(e) => set({ placeholder: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="field-flag-row">
            <label className="chk">
              <input
                type="checkbox"
                checked={!!field.required}
                onChange={(e) => set({ required: e.target.checked })}
              />
              Required <span className="req">*</span>
            </label>
            <label className="chk">
              <input
                type="checkbox"
                checked={!!field.adminRequired}
                onChange={(e) => set({ adminRequired: e.target.checked })}
              />
              Admin required <span className="req">*</span>
            </label>
            <label className="chk">
              <input
                type="checkbox"
                checked={field.visibleToClient !== false}
                onChange={(e) => set({ visibleToClient: e.target.checked })}
              />
              Visible to client
            </label>
            <label className="chk">
              <input
                type="checkbox"
                checked={!!field.linkedToPricing}
                onChange={(e) => set({ linkedToPricing: e.target.checked })}
              />
              Linked to pricing
            </label>
            {supportsOptions && (
              <label className="chk" style={{ marginLeft: "auto" }}>
                <input
                  type="checkbox"
                  checked={hasOptionsResolved}
                  onChange={(e) => setHasOptions(e.target.checked)}
                />
                Has options
              </label>
            )}
          </div>

          {hasOptionsResolved && supportsOptions && (
            <div style={{ paddingBottom: 14 }}>
              {["multiselect", "checkbox"].includes(field.type) && (
                <div className="rental-help" style={{ marginBottom: 12 }}>
                  <label className="chk" style={{ justifyContent: "space-between", gap: 12 }}>
                    <span>
                      <b>Use delivery options from Site Settings</b>
                      <span style={{ display: "block", color: "var(--ink-3)", fontSize: 11.5, marginTop: 2 }}>
                        New delivery options and price changes will appear on the client form automatically.
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={dynamicDeliveryField}
                      onChange={(e) => set({ dynamicSource: e.target.checked ? "delivery_options" : "static", linkedToPricing: e.target.checked ? true : field.linkedToPricing })}
                    />
                  </label>
                </div>
              )}
              {dynamicDeliveryField ? (
                <>
                  <label className="lbl">Dynamic delivery options</label>
                  <div className="simple-options">
                    {deliveryRows.map((option) => (
                      <div className="simple-option-row" key={option.id} style={{ gridTemplateColumns: "1fr 100px" }}>
                        <div>
                          <b>{option.label}</b>
                          {option.description && <div className="rental-muted" style={{ marginTop: 2 }}>{option.description}</div>}
                        </div>
                        <span style={{ textAlign: "right", fontWeight: 750 }}>${Number(option.amount || 0).toFixed(2)}</span>
                      </div>
                    ))}
                    {deliveryRows.length === 0 && <div className="rental-muted">No active delivery options. Add them in Site Settings.</div>}
                  </div>
                </>
              ) : needsAdvancedOptions || !SIMPLE_OPTION_FIELD_TYPES.includes(field.type) ? (
                <>
                  <label className="lbl">{stepType === "services" ? "Services" : "Options"}</label>
                  <RichOptionsEditor field={field} onFieldChange={set} stepType={stepType} />
                </>
              ) : (
                <>
                  <label className="lbl">Options</label>
                  <SimpleOptionsEditor
                    options={field.options || []}
                    onChange={(options) => set({ options })}
                    fieldType={field.type}
                    groupOptions={!!field.groupOptions}
                    subOptionDisplayAs={field.subOptionDisplayAs || "checkbox"}
                    requireSubOptions={!!field.requireSubOptions}
                    onSettingsChange={(patch) => set(patch)}
                  />
                </>
              )}
            </div>
          )}

          {/* Advanced disclosure */}
          <div className="adv">
            <div className="adv-head" onClick={() => setAdvOpen((o) => !o)}>
              <span>Advanced settings</span>
              <Ic.Chevron
                size={13}
                style={{
                  transform: advOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.15s",
                  color: "var(--ink-3)"
                }}
              />
            </div>
            {advOpen && (
              <div className="adv-body">
                <div className="field-grid">
                  <div>
                    <label className="lbl">
                      Information icon <Ic.Info size={11} style={{ verticalAlign: "middle", marginLeft: 2 }} />
                    </label>
                    <input
                      className="input"
                      value={field.helpText || ""}
                      placeholder="Enter tooltip text…"
                      onChange={(e) => set({ helpText: e.target.value })}
                    />
                  </div>
                  <div>
                    {galleryUploadControl}
                  </div>
                </div>

                <div>
                  <label className="lbl">Field description <span className="hint">additional detail shown to clients</span></label>
                  <textarea
                    className="textarea"
                    rows={2}
                    value={field.fieldDescription || ""}
                    placeholder="Add a longer description, instructions, or context for this field…"
                    onChange={(e) => set({ fieldDescription: e.target.value })}
                  />
                </div>

                <div>
                  <label className="lbl">Internal-only note <span className="hint">visible to staff only</span></label>
                  <textarea
                    className="textarea"
                    rows={2}
                    value={field.internalNote || ""}
                    placeholder="Notes for the operations team…"
                    onChange={(e) => set({ internalNote: e.target.value })}
                  />
                </div>

                <div>
                  <label className="lbl">
                    Visibility condition <Ic.Branch size={11} style={{ verticalAlign: "middle", marginLeft: 2 }} />
                  </label>
                  <VisibilityRule
                    rule={field.visibility}
                    allFields={allFields.filter((f) => f.id !== field.id)}
                    onChange={(visibility) => set({ visibility })}
                  />
                </div>

                {field.type === "number" && (
                  <div className="field-grid">
                    <div>
                      <label className="lbl">Minimum value</label>
                      <input
                        className="input"
                        type="number"
                        value={field.min ?? ""}
                        placeholder="No minimum"
                        onChange={(e) => set({ min: e.target.value === "" ? null : Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="lbl">Maximum value</label>
                      <input
                        className="input"
                        type="number"
                        value={field.max ?? ""}
                        placeholder="No maximum"
                        onChange={(e) => set({ max: e.target.value === "" ? null : Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="lbl">Increment</label>
                      <input
                        className="input"
                        type="number"
                        value={field.step ?? 1}
                        placeholder="1"
                        onChange={(e) => set({ step: e.target.value === "" ? 1 : Number(e.target.value) || 1 })}
                      />
                    </div>
                  </div>
                )}

                {field.type === "file" && (
                  <div className="field-grid">
                    <div>
                      <label className="lbl">Allowed files</label>
                      <select className="select" value={field.acceptedFiles || "image/*,.pdf,.doc,.docx"} onChange={(e) => set({ acceptedFiles: e.target.value })}>
                        <option value="image/*,.pdf,.doc,.docx">Images and documents</option>
                        <option value="image/*">Images only</option>
                        <option value=".pdf">PDF only</option>
                        <option value="*">Any file</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "end" }}>
                      <label className="chk" style={{ marginBottom: 7 }}>
                        <input type="checkbox" checked={!!field.allowMultipleFiles} onChange={(e) => set({ allowMultipleFiles: e.target.checked })} />
                        Allow multiple files
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          </>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------- Visibility rule ----------------
function VisibilityRule({ rule, allFields, onChange }) {
  const Ic = window.Icons;
  if (!rule) {
    return (
      <button
        className="btn sm ghost"
        style={{ border: "1px dashed var(--line-strong)", color: "var(--ink-3)" }}
        onClick={() =>
          onChange({ field: allFields[0]?.label || "", op: "has_value", value: "" })
        }
      >
        <Ic.Plus size={12} /> Add visibility condition
      </button>
    );
  }
  const selectedField = allFields.find((f) => f.id === rule.fieldId) || allFields.find((f) => f.label === rule.field) || allFields[0];
  const selectedFieldGroups = selectedField?.groupOptions ? normalizeSimpleOptionGroups(selectedField.options || []) : [];
  const hasGroupedSource = selectedFieldGroups.length > 0;
  const needsValue = ["equals", "not_equals", "contains", "in_group"].includes(rule.op);
  const valueControl = rule.op === "in_group" && hasGroupedSource ? (
    <select
      className="select"
      value={rule.value || selectedFieldGroups[0]?.label || ""}
      onChange={(e) => onChange({ ...rule, value: e.target.value })}
    >
      {selectedFieldGroups.map((group) => (
        <option key={group.id || group.label} value={group.label}>{group.label}</option>
      ))}
    </select>
  ) : (
    <input
      className="input"
      value={rule.value || ""}
      placeholder={rule.op === "in_group" ? "category" : "value"}
      onChange={(e) => onChange({ ...rule, value: e.target.value })}
    />
  );
  return (
    <div className="vis-row">
      <span className="word">Show this field if</span>
      <select
        className="select"
        value={selectedField?.id || ""}
        onChange={(e) => {
          const nextField = allFields.find((f) => f.id === e.target.value);
          const nextGroups = nextField?.groupOptions ? normalizeSimpleOptionGroups(nextField.options || []) : [];
          onChange({
            ...rule,
            fieldId: nextField?.id || "",
            field: nextField?.label || "",
            ...(rule.op === "in_group" ? { value: nextGroups[0]?.label || "" } : {}),
          });
        }}
      >
        {allFields.map((f) => (
          <option key={f.id} value={f.id}>{f.label}</option>
        ))}
      </select>
      <select
        className="select"
        value={rule.op}
        onChange={(e) => onChange({
          ...rule,
          op: e.target.value,
          ...(e.target.value === "in_group" ? { value: selectedFieldGroups[0]?.label || "" } : {}),
        })}
      >
        <option value="has_value">has a value</option>
        <option value="is_empty">is empty</option>
        <option value="equals">equals</option>
        <option value="not_equals">does not equal</option>
        <option value="contains">contains</option>
        {hasGroupedSource && <option value="in_group">belongs to category</option>}
        <option value="is_true">is checked</option>
        <option value="is_false">is unchecked</option>
      </select>
      {needsValue && valueControl}
      <button
        className="btn icon sm danger-ghost"
        title="Remove condition"
        onClick={() => requestDeleteConfirmation({
          action: "remove",
          itemType: "condition",
          itemName: "this condition",
          confirmLabel: "Remove",
          onConfirm: () => onChange(null),
        })}
      >
        <Ic.Close size={12} />
      </button>
    </div>
  );
}

// ---------------- Nested Options editor (4 levels: options → sub-options → selections → specifications) ----------------
// Per-level config. Each level declares: how items render, whether they support display-as, whether they expose info/gallery, what their children are called.
const LEVEL_CONFIG = {
  option: {
    title: "option",
    requireLabel: "Require option",
    addLabel: "Add option",
    hasChildKey: "hasSubOptions",
    hasChildLabel: "Has sub-options",
    childKey: "subOptions",
    childLevel: "subOption",
    showDisplayAs: false,
    showAdvanced: true,
    placeholderPrefix: "Option",
    markerStyle: { width: 14, height: 14, borderRadius: 3, background: "var(--accent)", display: "inline-block", flexShrink: 0 },
  },
  subOption: {
    title: "sub-option",
    requireLabel: "Require sub-option",
    addLabel: "Add sub-option",
    hasChildKey: "hasSelections",
    hasChildLabel: "Has selections",
    childKey: "selections",
    childLevel: "selection",
    showDisplayAs: true,
    showAdvanced: true,
    placeholderPrefix: "Sub-option",
    markerStyle: { width: 14, height: 14, borderRadius: "50%", border: "2px solid var(--accent)", display: "inline-block", flexShrink: 0 },
  },
  selection: {
    title: "selection",
    requireLabel: "Require selection",
    addLabel: "Add selection",
    hasChildKey: "hasSpecifications",
    hasChildLabel: "Has specifications",
    childKey: "specifications",
    childLevel: "specification",
    showDisplayAs: true,
    showAdvanced: true,
    placeholderPrefix: "Selection",
    markerStyle: { width: 12, height: 12, borderRadius: 2, border: "1.5px solid var(--accent)", display: "inline-block", flexShrink: 0 },
  },
  specification: {
    title: "specification",
    requireLabel: "Require specification",
    addLabel: "Add specification",
    hasChildKey: null,
    hasChildLabel: null,
    childKey: null,
    childLevel: null,
    showDisplayAs: true,
    showAdvanced: false,
    placeholderPrefix: "Specification",
    markerStyle: { width: 10, height: 10, borderRadius: 1, background: "var(--ink-4)", display: "inline-block", flexShrink: 0 },
  },
};

const DEPTH_TINT = ["transparent", "rgba(237,122,60,0.35)", "rgba(237,122,60,0.25)", "rgba(237,122,60,0.18)"];

// Pricing structure presets — shared by admin editor + client renderers + cost sidebar.
const PRICING_STRUCTURES = [
  { value: "flat",            label: "Flat base rate", unit: "flat fee" },
  { value: "per_person",      label: "Per person rate", unit: "/ person" },
  { value: "per_hour",        label: "Per hour rate",   unit: "/ hour" },
  { value: "per_person_hour", label: "Per person per hour", unit: "/ person / hr" },
  { value: "included",        label: "Included in cost", unit: "included" },
  { value: "quote",           label: "Quote separately", unit: "quote on request" },
];
window.PRICING_STRUCTURES = PRICING_STRUCTURES;
window.pricingUnitFor = function(structure) {
  const found = PRICING_STRUCTURES.find(s => s.value === structure);
  return found ? found.unit : "";
};

function NestedOptionRow({ item, level, depth, onChange, onRemove, levelDisplays, dragHandlers }) {
  const Ic = window.Icons;
  const cfg = LEVEL_CONFIG[level];
  const [advOpen, setAdvOpen] = React.useState(false);
  const update = (patch) => onChange({ ...item, ...patch });

  const updateChild = (idx, patch) => {
    const arr = [...(item[cfg.childKey] || [])];
    arr[idx] = { ...arr[idx], ...patch };
    update({ [cfg.childKey]: arr });
  };
  const removeChild = (idx) => {
    const arr = (item[cfg.childKey] || []).filter((_, j) => j !== idx);
    update({ [cfg.childKey]: arr });
  };
  const addChild = () => {
    const arr = [...(item[cfg.childKey] || []), { label: "" }];
    update({ [cfg.childKey]: arr });
  };

  const addImages = (files) => {
    readFilesAsDataUrls(files).then((urls) => {
      if (!urls.length) return;
      update({ infoImages: [...(item.infoImages || []), ...urls] });
    });
  };
  const removeImage = (idx) => {
    requestDeleteConfirmation({
      action: "remove",
      itemType: "image",
      itemName: `Image ${idx + 1}`,
      confirmLabel: "Remove",
      onConfirm: () => {
        const imgs = (item.infoImages || []).filter((_, j) => j !== idx);
        update({ infoImages: imgs });
      },
    });
  };

  const hasInfo = !!(item.infoText || (item.infoImages && item.infoImages.length));

  return (
    <div
      style={{
        marginBottom: 6,
        ...(dragHandlers && dragHandlers.isDragging ? { opacity: 0.4 } : {}),
        ...(dragHandlers && dragHandlers.overPosition === "above" ? { boxShadow: "inset 0 2px 0 var(--accent)" } : {}),
        ...(dragHandlers && dragHandlers.overPosition === "below" ? { boxShadow: "inset 0 -2px 0 var(--accent)" } : {}),
      }}
      draggable={!!dragHandlers}
      onDragStart={dragHandlers && dragHandlers.onDragStart}
      onDragOver={dragHandlers && dragHandlers.onDragOver}
      onDragLeave={dragHandlers && dragHandlers.onDragLeave}
      onDrop={dragHandlers && dragHandlers.onDrop}
      onDragEnd={dragHandlers && dragHandlers.onDragEnd}
    >
      {/* Main row */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 0" }}>
        <span style={{ cursor: "grab", color: "var(--ink-5)", flexShrink: 0 }} title="Drag to reorder"><Ic.Grip size={12} /></span>
        <span style={cfg.markerStyle} />
        <input
          className="input"
          style={{ flex: 1, fontSize: 12 }}
          value={item.label || ""}
          placeholder={cfg.placeholderPrefix}
          onChange={(e) => update({ label: e.target.value })}
        />
        {/* Enable price */}
        <label className="chk" style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap", color: "var(--ink-4)", gap: 4 }}>
          <input type="checkbox" checked={!!item.enablePrice} onChange={(e) => update({ enablePrice: e.target.checked, price: e.target.checked ? (item.price ?? 0) : item.price, pricingStructure: e.target.checked ? (item.pricingStructure || "flat") : item.pricingStructure })} style={{ accentColor: "var(--accent)" }} />
          Enable price $
        </label>
        {item.enablePrice && (
          <>
            <select
              className="select"
              value={item.pricingStructure || "flat"}
              onChange={(e) => {
                const v = e.target.value;
                const patch = { pricingStructure: v };
                if (v === "included") patch.price = 0;
                update(patch);
              }}
              title="Pricing structure"
              style={{ fontSize: 11, padding: "2px 18px 2px 6px", height: 24, maxWidth: 130 }}
            >
              {window.PRICING_STRUCTURES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <input
              className="input"
              type="text"
              value={item.price ?? ""}
              placeholder="$0"
              onChange={(e) => update({ price: e.target.value })}
              disabled={item.pricingStructure === "included"}
              style={{ width: 60, textAlign: "right", fontSize: 12, opacity: item.pricingStructure === "included" ? 0.5 : 1 }}
            />
          </>
        )}
        {/* Advanced toggle (info + gallery) */}
        {cfg.showAdvanced && (
          <button
            className={"btn icon sm " + (hasInfo ? "primary" : "ghost")}
            title={hasInfo ? "Info / gallery configured — click to edit" : "Add info icon / gallery"}
            onClick={() => setAdvOpen((o) => !o)}
          >
            <Ic.Info size={12} />
          </button>
        )}
        <button className="btn icon sm danger-ghost" title="Delete" onClick={() => requestDeleteConfirmation({
          itemType: cfg.title || "option",
          itemName: item.label || cfg.placeholderPrefix,
          onConfirm: onRemove,
        })}>
          <Ic.Close size={12} />
        </button>
      </div>

      {/* Advanced panel (info text + gallery images) */}
      {cfg.showAdvanced && advOpen && (
        <div style={{ marginLeft: 24, marginBottom: 6, padding: 10, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--line)" }}>
          <div className="field-grid">
            <div>
              <label className="lbl" style={{ fontSize: 10 }}>
                Information icon <Ic.Info size={10} style={{ verticalAlign: "middle", marginLeft: 2 }} />
              </label>
              <input
                className="input"
                style={{ fontSize: 12 }}
                value={item.infoText || ""}
                placeholder="Tooltip / popover text…"
                onChange={(e) => update({ infoText: e.target.value })}
              />
            </div>
            <div>
              <label className="lbl" style={{ fontSize: 10 }}>
                Information gallery icon <Ic.Img size={10} style={{ verticalAlign: "middle", marginLeft: 2 }} />
              </label>
              <div className="upload-wrap">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => { addImages(e.target.files); e.target.value = ""; }}
                />
                <div className="upload" style={{ fontSize: 11 }}>
                  <Ic.Img size={13} />
                  <span><b>Add image</b> · drag or click</span>
                </div>
              </div>
            </div>
          </div>
          {(item.infoImages || []).length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {item.infoImages.map((img, idx) => (
                <div key={idx} style={{ position: "relative", width: 56, height: 56, borderRadius: 4, overflow: "hidden", border: "1px solid var(--line)" }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <span
                    onClick={() => removeImage(idx)}
                    style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", lineHeight: 1 }}
                  >×</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Has-child toggle + child editor (display-as is now configured at field level, not per-item) */}
      {cfg.hasChildKey && (
        <div style={{ paddingLeft: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "2px 0 4px" }}>
            <label className="chk" style={{ fontSize: 11 }}>
              <input
                type="checkbox"
                checked={!!item[cfg.hasChildKey]}
                onChange={(e) => update({ [cfg.hasChildKey]: e.target.checked, [cfg.childKey]: e.target.checked ? (item[cfg.childKey] || []) : [] })}
              />
              {cfg.hasChildLabel}
            </label>
          </div>
          {item[cfg.hasChildKey] && (
            <div style={{ paddingLeft: 8, borderLeft: `2px solid ${DEPTH_TINT[Math.min(depth + 1, DEPTH_TINT.length - 1)]}`, marginLeft: 4, marginTop: 2, paddingBottom: 4 }}>
              <NestedOptionsList
                items={item[cfg.childKey] || []}
                level={cfg.childLevel}
                depth={depth + 1}
                onChange={(items) => update({ [cfg.childKey]: items })}
                levelDisplays={levelDisplays}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NestedOptionsList({ items, level, depth, onChange, levelDisplays, stepType }) {
  const Ic = window.Icons;
  const cfg = LEVEL_CONFIG[level];
  // Use the expanded card style for service steps at the top level (option level).
  // Deeper levels fall back to compact NestedOptionRow.
  const useServiceCard = stepType === "services" && level === "option";
  const [dragIdx, setDragIdx] = React.useState(null);
  const [overIdx, setOverIdx] = React.useState(null);
  const [overPos, setOverPos] = React.useState(null);

  const updateAt = (i, newItem) => {
    const next = items.map((it, j) => (j === i ? newItem : it));
    onChange(next);
  };
  const removeAt = (i) => onChange(items.filter((_, j) => j !== i));
  const add = () => onChange([...items, { label: "" }]);

  const onDragStart = (i) => (e) => {
    e.stopPropagation();
    setDragIdx(i);
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", String(i)); } catch (_) {}
  };
  const onDragOver = (i) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const pos = e.clientY < midY ? "above" : "below";
    setOverIdx(i);
    setOverPos(pos);
  };
  const onDragLeave = () => { /* handled by next over */ };
  const onDragEnd = () => { setDragIdx(null); setOverIdx(null); setOverPos(null); };
  const onDrop = (i) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragIdx == null || dragIdx === i) { onDragEnd(); return; }
    const next = [...items];
    const [moved] = next.splice(dragIdx, 1);
    let targetIdx = i;
    if (dragIdx < i) targetIdx = overPos === "above" ? i - 1 : i;
    else targetIdx = overPos === "above" ? i : i + 1;
    next.splice(targetIdx, 0, moved);
    onChange(next);
    onDragEnd();
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 6px" }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-4)", letterSpacing: 0.4 }}>
          {cfg.title}s
        </span>
        <button
          className="btn ghost sm"
          onClick={add}
          style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--accent)" }}
        >
          <Ic.Plus size={10} /> {cfg.addLabel}
        </button>
      </div>
      {items.length === 0 && (
        <div style={{ fontSize: 11, color: "var(--ink-4)", fontStyle: "italic", padding: "4px 0 8px" }}>
          No {cfg.title}s yet — click "{cfg.addLabel}" to add one.
        </div>
      )}
      {items.map((item, idx) => {
        const RowComp = useServiceCard ? ServiceOptionCard : NestedOptionRow;
        return (
          <RowComp
            key={idx}
            item={typeof item === "string" ? { label: item } : item}
            level={level}
            depth={depth}
            onChange={(newItem) => updateAt(idx, newItem)}
            onRemove={() => removeAt(idx)}
            levelDisplays={levelDisplays}
            dragHandlers={{
              onDragStart: onDragStart(idx),
              onDragOver: onDragOver(idx),
              onDragLeave: onDragLeave,
              onDrop: onDrop(idx),
              onDragEnd: onDragEnd,
              isDragging: dragIdx === idx,
              overPosition: overIdx === idx && dragIdx !== idx ? overPos : null,
            }}
          />
        );
      })}
    </div>
  );
}

// ---------------- ServiceOptionCard — expanded inline option editor for stepType="services" ----------------
// Each option is shown as an always-expanded card (matches the Additional Services mockup).
// Same underlying data shape as NestedOptionRow, just a richer visual treatment.
function ServiceOptionCard({ item, level, depth, onChange, onRemove, levelDisplays, dragHandlers, index }) {
  const Ic = window.Icons;
  const cfg = LEVEL_CONFIG[level];
  const update = (patch) => onChange({ ...item, ...patch });

  const addImages = (files) => {
    readFilesAsDataUrls(files).then((urls) => {
      if (!urls.length) return;
      update({ infoImages: [...(item.infoImages || []), ...urls] });
    });
  };
  const removeImage = (idx) => requestDeleteConfirmation({
    action: "remove",
    itemType: "image",
    itemName: `Image ${idx + 1}`,
    confirmLabel: "Remove",
    onConfirm: () => update({ infoImages: (item.infoImages || []).filter((_, j) => j !== idx) }),
  });

  const ps = item.pricingStructure || "flat";

  return (
    <div
      style={{
        marginBottom: 14,
        padding: 14,
        border: "1px solid var(--line)",
        borderRadius: 8,
        background: "#fff",
        ...(dragHandlers && dragHandlers.isDragging ? { opacity: 0.4 } : {}),
        ...(dragHandlers && dragHandlers.overPosition === "above" ? { boxShadow: "inset 0 3px 0 var(--accent)" } : {}),
        ...(dragHandlers && dragHandlers.overPosition === "below" ? { boxShadow: "inset 0 -3px 0 var(--accent)" } : {}),
      }}
      draggable={!!dragHandlers}
      onDragStart={dragHandlers && dragHandlers.onDragStart}
      onDragOver={dragHandlers && dragHandlers.onDragOver}
      onDragLeave={dragHandlers && dragHandlers.onDragLeave}
      onDrop={dragHandlers && dragHandlers.onDrop}
      onDragEnd={dragHandlers && dragHandlers.onDragEnd}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ cursor: "grab", color: "var(--ink-5)" }} title="Drag to reorder"><Ic.Grip size={14} /></span>
        <input
          className="input"
          value={item.label || ""}
          placeholder={cfg.placeholderPrefix}
          onChange={(e) => update({ label: e.target.value })}
          style={{ flex: 1, fontWeight: 600 }}
        />
        <button className="btn icon sm danger-ghost" title="Delete" onClick={() => requestDeleteConfirmation({
          itemType: cfg.title || "option",
          itemName: item.label || cfg.placeholderPrefix,
          onConfirm: onRemove,
        })}>
          <Ic.Trash size={13} />
        </button>
      </div>

      {/* Field name + display field as */}
      <div className="field-grid" style={{ marginBottom: 10 }}>
        <div>
          <label className="lbl" style={{ fontSize: 10 }}>Field name</label>
          <input
            className="input"
            value={item.label || ""}
            onChange={(e) => update({ label: e.target.value })}
          />
        </div>
        <div>
          <label className="lbl" style={{ fontSize: 10 }}>Display field as</label>
          <input
            className="input"
            value={(levelDisplays && levelDisplays[level]) ? (levelDisplays[level].charAt(0).toUpperCase() + levelDisplays[level].slice(1)) : ""}
            readOnly
            style={{ background: "var(--surface-2)", color: "var(--ink-3)", cursor: "not-allowed" }}
            title="Configured at the field level above"
          />
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 10 }}>
        <label className="lbl" style={{ fontSize: 10 }}>Description</label>
        <textarea
          className="textarea"
          rows={2}
          value={item.infoText || ""}
          onChange={(e) => update({ infoText: e.target.value })}
          placeholder="Describe this service…"
        />
      </div>

      {/* Pricing plan panel */}
      <div style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 6, padding: 10, marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
          Pricing plan
        </div>
        <label className="chk" style={{ fontSize: 11, marginBottom: 8 }}>
          <input
            type="checkbox"
            checked={!!item.enablePrice}
            onChange={(e) => update({ enablePrice: e.target.checked, pricingStructure: e.target.checked ? (item.pricingStructure || "flat") : item.pricingStructure })}
            style={{ accentColor: "var(--accent)" }}
          />
          Enable price
        </label>
        {item.enablePrice && (
          <div className="field-grid">
            <div>
              <label className="lbl" style={{ fontSize: 10 }}>Pricing structure</label>
              <select
                className="select"
                value={ps}
                onChange={(e) => {
                  const v = e.target.value;
                  const patch = { pricingStructure: v };
                  if (v === "included") patch.price = 0;
                  update(patch);
                }}
              >
                {window.PRICING_STRUCTURES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="lbl" style={{ fontSize: 10 }}>Price $</label>
              <input
                className="input price-input"
                type="text"
                value={item.price ?? ""}
                placeholder="$0"
                onChange={(e) => update({ price: e.target.value })}
                disabled={ps === "included"}
                style={{ opacity: ps === "included" ? 0.5 : 1 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Info gallery (optional, collapsed) */}
      {cfg.showAdvanced && (item.infoImages && item.infoImages.length > 0) && (
        <div style={{ marginBottom: 10 }}>
          <label className="lbl" style={{ fontSize: 10 }}>Information gallery</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {item.infoImages.map((img, idx) => (
              <div key={idx} style={{ position: "relative", width: 56, height: 56, borderRadius: 4, overflow: "hidden", border: "1px solid var(--line)" }}>
                <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <span
                  onClick={() => removeImage(idx)}
                  style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", lineHeight: 1 }}
                >×</span>
              </div>
            ))}
            <label style={{ width: 56, height: 56, borderRadius: 4, border: "1px dashed var(--line-strong)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink-4)" }}>
              <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { addImages(e.target.files); e.target.value = ""; }} />
              <Ic.Plus size={14} />
            </label>
          </div>
        </div>
      )}
      {cfg.showAdvanced && !(item.infoImages && item.infoImages.length) && (
        <label style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--ink-4)", cursor: "pointer", marginBottom: 10 }}>
          <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { addImages(e.target.files); e.target.value = ""; }} />
          <Ic.Img size={11} /> Add information gallery image
        </label>
      )}

      {/* Has sub-options + recursive children */}
      {cfg.hasChildKey && (
        <div>
          <label className="chk" style={{ fontSize: 11 }}>
            <input
              type="checkbox"
              checked={!!item[cfg.hasChildKey]}
              onChange={(e) => update({ [cfg.hasChildKey]: e.target.checked, [cfg.childKey]: e.target.checked ? (item[cfg.childKey] || []) : [] })}
            />
            {cfg.hasChildLabel}
          </label>
          {item[cfg.hasChildKey] && (
            <div style={{ marginTop: 10, paddingLeft: 12, borderLeft: `2px solid ${DEPTH_TINT[Math.min(depth + 1, DEPTH_TINT.length - 1)]}` }}>
              <NestedOptionsList
                items={item[cfg.childKey] || []}
                level={cfg.childLevel}
                depth={depth + 1}
                onChange={(items) => update({ [cfg.childKey]: items })}
                levelDisplays={levelDisplays}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Field-level wrapper. Reads/writes whole field so it can surface per-LEVEL display settings
// (subOptionDisplayAs, selectionDisplayAs, specificationDisplayAs) instead of per-item.
function RichOptionsEditor({ field, onFieldChange, stepType }) {
  const Ic = window.Icons;
  const options = field.options || [];
  const normalized = options.map((o) => (typeof o === "string" ? { label: o } : o));

  // Field-level display settings (one per level, applies to all items at that level)
  const levelDisplays = {
    option: field.displayAs || "radio",
    subOption: field.subOptionDisplayAs || "checkbox",
    selection: field.selectionDisplayAs || "checkbox",
    specification: field.specificationDisplayAs || "checkbox",
  };

  const setLevelDisplay = (level, value) => {
    const key = level === "option" ? "displayAs"
      : level === "subOption" ? "subOptionDisplayAs"
      : level === "selection" ? "selectionDisplayAs"
      : "specificationDisplayAs";
    onFieldChange({ [key]: value });
  };

  const setOptions = (opts) => onFieldChange({ options: opts });

  // Detect which levels are in use (used to highlight active dropdowns)
  const usesSubOptions = normalized.some(o => o.hasSubOptions);
  const usesSelections = normalized.some(o => (o.subOptions || []).some(s => s.hasSelections));
  const usesSpecs = normalized.some(o => (o.subOptions || []).some(s => (s.selections || []).some(sel => sel.hasSpecifications)));
  const levelActive = { option: true, subOption: usesSubOptions, selection: usesSelections, specification: usesSpecs };

  const DisplayPicker = ({ level, label }) => {
    const active = levelActive[level];
    return (
      <div style={{ opacity: active ? 1 : 0.45 }}>
        <label className="lbl" style={{ fontSize: 10 }}>{label}</label>
        <select
          className="select"
          value={levelDisplays[level]}
          onChange={(e) => setLevelDisplay(level, e.target.value)}
          style={{ fontSize: 12 }}
        >
          <option value="radio">Radio</option>
          <option value="select">Dropdown</option>
          <option value="checkbox">Checkbox</option>
        </select>
      </div>
    );
  };

  return (
    <div>
      {/* One display picker per level — replaces all per-item Display As dropdowns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 12, padding: 10, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <DisplayPicker level="option" label="Display options as" />
        <DisplayPicker level="subOption" label="Display sub-options as" />
        <DisplayPicker level="selection" label="Display selections as" />
        <DisplayPicker level="specification" label="Display specifications as" />
      </div>

      {/* Require option header + add */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        {stepType === "services" ? (
          <span style={{ fontSize: 12, fontWeight: 700 }}>Services in this group</span>
        ) : (
          <label
            className="chk"
            style={{ fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
            title="If the client engages with this field, they must pick one of its options. Independent of the field-level 'Required' flag."
          >
            <input
              type="checkbox"
              checked={!!field.requireOption}
              onChange={(e) => onFieldChange({ requireOption: e.target.checked })}
              style={{ accentColor: "var(--accent)" }}
            />
            Require option <span className="req" style={{ fontSize: 11, color: "#d44" }}>*</span>
          </label>
        )}
        <button
          className={stepType === "services" ? "btn primary sm" : "btn ghost sm"}
          onClick={() => setOptions([...normalized, { label: "" }])}
          style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}
        >
          <Ic.Plus size={11} /> {stepType === "services" ? "Add Service" : "Add"}
        </button>
      </div>

      {normalized.length === 0 && (
        <div style={{ fontSize: 11, color: "var(--ink-4)", fontStyle: "italic", padding: "6px 0 10px" }}>
          {stepType === "services"
            ? 'No services yet — click "Add Service" to create the first one.'
            : 'No options yet — click "Add" to create the first one.'}
        </div>
      )}

      <NestedOptionsList
        items={normalized}
        level="option"
        depth={0}
        onChange={setOptions}
        levelDisplays={levelDisplays}
        stepType={stepType}
      />
    </div>
  );
}

// ---------------- Dietary Restrictions editor ----------------
function DietaryEditor({ dietaryOptions, onChange }) {
  const Ic = window.Icons;
  const [newName, setNewName] = React.useState("");
  const [showInput, setShowInput] = React.useState(false);
  const inputRef = React.useRef(null);
  const commit = () => {
    if (!newName.trim()) return;
    onChange([...(dietaryOptions || []), newName.trim()]);
    setNewName("");
    // Keep the input open so the user can add multiple in a row.
    setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
  };
  const remove = (i) => requestDeleteConfirmation({
    action: "remove",
    itemType: "dietary restriction",
    itemName: dietaryOptions?.[i] || `Dietary restriction ${i + 1}`,
    confirmLabel: "Remove",
    onConfirm: () => onChange((dietaryOptions || []).filter((_, j) => j !== i)),
  });
  const openInput = () => {
    setShowInput(true);
    setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
  };
  const closeInput = () => {
    setShowInput(false);
    setNewName("");
  };
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <label className="chk"><input type="checkbox" checked style={{ accentColor: "var(--accent)" }} readOnly /> Required <span className="req">*</span></label>
        <label className="chk"><input type="checkbox" checked style={{ accentColor: "var(--accent)" }} readOnly /> Admin Required <span className="req">*</span></label>
        <button
          className="btn sm"
          onClick={openInput}
          style={{
            marginLeft: "auto",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            background: "var(--ink)",
            color: "#fff",
            border: "1px solid var(--ink)",
          }}
        >
          <Ic.Plus size={11} /> Add dietary restrictions
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {(dietaryOptions || []).map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", border: "1px solid var(--line)", borderRadius: 6, background: "var(--surface-2)" }}>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{d}</span>
            <button className="btn icon sm danger-ghost" onClick={() => remove(i)}><Ic.Close size={12} /></button>
          </div>
        ))}
      </div>
      {showInput && (
        <div style={{ marginTop: 12 }}>
          <label className="lbl">Dietary restrictions name</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              ref={inputRef}
              className="input"
              value={newName}
              placeholder="Enter the name of the dietary restriction…"
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); commit(); }
                if (e.key === "Escape") closeInput();
              }}
              style={{ flex: 1 }}
            />
            <button
              className="btn sm"
              onClick={commit}
              disabled={!newName.trim()}
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                background: newName.trim() ? "var(--accent)" : "var(--surface-3)",
                color: newName.trim() ? "#fff" : "var(--ink-4)",
                border: "1px solid " + (newName.trim() ? "var(--accent)" : "var(--line)"),
                cursor: newName.trim() ? "pointer" : "not-allowed",
                whiteSpace: "nowrap",
              }}
            >
              <Ic.Plus size={11} /> Add
            </button>
            <button
              className="btn icon sm ghost"
              onClick={closeInput}
              title="Close"
            >
              <Ic.Close size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- Options editor (for select / multiselect / radio / groupselect) ----------------
function OptionsEditor({ options, onChange, fieldType }) {
  const Ic = window.Icons;
  const [dragIdx, setDragIdx] = React.useState(null);
  const [overIdx, setOverIdx] = React.useState(null);

  const update = (i, v) => {
    const next = [...options];
    next[i] = v;
    onChange(next);
  };
  const remove = (i) => requestDeleteConfirmation({
    itemType: fieldType === "groupselect" && options[i]?.startsWith?.("@") ? "option group" : "option",
    itemName: String(options[i] || `Option ${i + 1}`).replace(/^@/, ""),
    onConfirm: () => onChange(options.filter((_, j) => j !== i)),
  });
  const add = () => onChange([...options, ""]);
  const addGroup = () => onChange([...options, "@New Group"]);

  const onDragStart = (e, i) => { setDragIdx(i); e.dataTransfer.effectAllowed = "move"; };
  const onDragOver = (e, i) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setOverIdx(i); };
  const onDragEnd = () => { setDragIdx(null); setOverIdx(null); };
  const onDrop = (e, i) => {
    e.preventDefault();
    if (dragIdx == null || dragIdx === i) { onDragEnd(); return; }
    const next = [...options];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(i, 0, moved);
    onChange(next);
    onDragEnd();
  };

  const hint = fieldType === "radio"
    ? "Use pipe to add description: Label|Description text"
    : fieldType === "groupselect"
    ? "Prefix with @ for group header: @Business"
    : null;

  return (
    <div className="opts">
      {hint && (
        <div style={{ fontSize: 11, color: "var(--ink-4)", marginBottom: 6, lineHeight: 1.4 }}>
          {hint}
        </div>
      )}
      {options.map((o, i) => {
        const isGroup = fieldType === "groupselect" && o.startsWith("@");
        return (
          <div
            className="opt-row"
            key={i}
            draggable
            onDragStart={(e) => onDragStart(e, i)}
            onDragOver={(e) => onDragOver(e, i)}
            onDrop={(e) => onDrop(e, i)}
            onDragEnd={onDragEnd}
            style={{
              ...(isGroup ? { background: "var(--surface-active)", borderRadius: 4 } : {}),
              ...(dragIdx === i ? { opacity: 0.4 } : {}),
              ...(overIdx === i && dragIdx !== i ? { borderTop: "2px solid var(--accent)" } : {}),
            }}
          >
            <span className="grip"><Ic.Grip size={13} /></span>
            <input
              className="input"
              value={o}
              placeholder={isGroup ? "Group name (e.g. @Business)" : `Option ${i + 1}`}
              onChange={(e) => update(i, e.target.value)}
              style={isGroup ? { fontWeight: 700 } : {}}
            />
            <button className="btn icon sm danger-ghost" onClick={() => remove(i)}>
              <Ic.Trash size={12} />
            </button>
          </div>
        );
      })}
      <div style={{ display: "flex", gap: 8 }}>
        <button className="opt-add" onClick={add}>
          <Ic.Plus size={12} /> Add option
        </button>
        {fieldType === "groupselect" && (
          <button className="opt-add" onClick={addGroup} style={{ color: "var(--accent)" }}>
            <Ic.Plus size={12} /> Add group
          </button>
        )}
      </div>
    </div>
  );
}

function SimpleOptionsEditor({ options, onChange, fieldType, groupOptions = false, subOptionDisplayAs = "checkbox", requireSubOptions = false, onSettingsChange }) {
  const Ic = window.Icons;
  const rows = (options && options.length ? options : [{ label: "Option 1" }]).map((option, i) => normalizeSimpleOption(option, `Option ${i + 1}`));
  const groupedRows = normalizeSimpleOptionGroups(options);
  const hasAnyGroupedSubOptions = groupedRows.some((group) => (group.options || []).some((option) => (option.subOptions || []).length > 0));
  const hasAnySubOptions = rows.some((option) => (option.subOptions || []).length > 0);
  const [openKeys, setOpenKeys] = React.useState({});
  const [groupDragIdx, setGroupDragIdx] = React.useState(null);
  const [groupOverIdx, setGroupOverIdx] = React.useState(null);
  const [groupOverPos, setGroupOverPos] = React.useState(null);
  const cleanOption = (option) => {
    const next = { ...option, label: option.label || "" };
    const price = Number(next.unitPrice ?? next.price ?? 0) || 0;
    if (optionHasPricing(next)) {
      const pricingStructure = simpleOptionPricingStructure(next);
      next.priceEnabled = true;
      next.enablePrice = true;
      next.priceMode = "priced";
      next.pricingModel = "flat_per_item";
      next.pricingStructure = pricingStructure;
      next.unitPrice = price;
      next.price = price;
    } else {
      next.priceEnabled = false;
      next.enablePrice = false;
      next.priceMode = "included";
      next.pricingModel = "included";
      next.pricingStructure = "included";
      next.unitPrice = 0;
      next.price = 0;
    }
    if (next.subOptions && next.subOptions.length) next.hasSubOptions = true;
    if (next.infoImages && !next.infoImages.length) delete next.infoImages;
    return next;
  };
  const commit = (next) => onChange(next.map(cleanOption));
  const update = (index, patch) => commit(rows.map((option, i) => i === index ? { ...option, ...patch } : option));
  const remove = (index) => commit(rows.filter((_, i) => i !== index));
  const add = () => commit([...rows, { label: `Option ${rows.length + 1}` }]);
  const toggleOpen = (key) => setOpenKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  const commitGroups = (groups) => onChange(groups.map((group, index) => ({ type: "group", id: group.id || "group_" + index, label: group.label || `Group ${index + 1}`, options: (group.options || []).map(cleanOption) })));
  const updateGroup = (index, patch) => commitGroups(groupedRows.map((group, i) => i === index ? { ...group, ...patch } : group));
  const updateGroupOptions = (index, nextOptions) => updateGroup(index, { options: nextOptions });
  const addGroup = () => commitGroups([...groupedRows, { id: "group_" + Date.now(), label: `Group ${groupedRows.length + 1}`, options: [] }]);
  const onGroupDragStart = (index) => (e) => {
    e.stopPropagation();
    setGroupDragIdx(index);
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", String(index)); } catch (_) {}
  };
  const onGroupDragOver = (index) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setGroupOverIdx(index);
    setGroupOverPos(e.clientY < rect.top + rect.height / 2 ? "above" : "below");
  };
  const onGroupDragEnd = () => {
    setGroupDragIdx(null);
    setGroupOverIdx(null);
    setGroupOverPos(null);
  };
  const onGroupDrop = (index) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (groupDragIdx == null) { onGroupDragEnd(); return; }
    commitGroups(moveListItem(groupedRows, groupDragIdx, index, groupOverPos));
    onGroupDragEnd();
  };
  const help = fieldType === "multiselect"
    ? "Client can check more than one."
    : fieldType === "select"
    ? "Client chooses one from a dropdown."
    : "Client chooses exactly one.";

  return (
    <div className="simple-options">
      <div style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.4 }}>{help}</div>
      {fieldType === "select" && (
        <label className="chk" style={{ alignSelf: "flex-start" }}>
          <input
            type="checkbox"
            checked={!!groupOptions}
            onChange={(e) => onSettingsChange && onSettingsChange({ groupOptions: e.target.checked })}
          />
          Group options
        </label>
      )}
      {(groupOptions ? hasAnyGroupedSubOptions : hasAnySubOptions) && (
        <div className="simple-sub-settings">
          <div>
            <label className="lbl">Sub-options display as</label>
            <select className="select" value={subOptionDisplayAs || "checkbox"} onChange={(e) => onSettingsChange && onSettingsChange({ subOptionDisplayAs: e.target.value })}>
              <option value="checkbox">Multiple choice</option>
              <option value="radio">Single choice</option>
              <option value="select">Dropdown</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", minHeight: 34 }}>
            <label className="chk">
              <input type="checkbox" checked={!!requireSubOptions} onChange={(e) => onSettingsChange && onSettingsChange({ requireSubOptions: e.target.checked })} />
              Require sub-option when a selected option has sub-options
            </label>
          </div>
        </div>
      )}
      {groupOptions ? (
        <div className="simple-options">
          {groupedRows.map((group, groupIndex) => (
            <div
              className={
                "simple-option-card" +
                (groupDragIdx === groupIndex ? " is-dragging" : "") +
                (groupOverIdx === groupIndex && groupDragIdx !== groupIndex && groupOverPos === "above" ? " is-drop-above" : "") +
                (groupOverIdx === groupIndex && groupDragIdx !== groupIndex && groupOverPos === "below" ? " is-drop-below" : "")
              }
              key={group.id || groupIndex}
              onDragOver={onGroupDragOver(groupIndex)}
              onDrop={onGroupDrop(groupIndex)}
              onDragEnd={onGroupDragEnd}
            >
              <div className="simple-option-row" style={{ gridTemplateColumns: "auto 1fr auto auto", background: "var(--surface-2)" }}>
                <span className="simple-option-drag" title="Drag to reorder group" draggable onDragStart={onGroupDragStart(groupIndex)} onDragEnd={onGroupDragEnd}>
                  <Ic.Grip size={13} />
                </span>
                <input className="input" value={group.label || ""} placeholder={`Group ${groupIndex + 1}`} onChange={(e) => updateGroup(groupIndex, { label: e.target.value })} style={{ fontWeight: 700 }} />
                <button className="btn sm ghost" onClick={() => updateGroupOptions(groupIndex, [...(group.options || []), { label: `Option ${(group.options || []).length + 1}` }])}>
                  <Ic.Plus size={12} /> Option
                </button>
                <button className="btn icon sm danger-ghost" title="Delete group" onClick={() => requestDeleteConfirmation({
                  itemType: "option group",
                  itemName: group.label || `Group ${groupIndex + 1}`,
                  onConfirm: () => commitGroups(groupedRows.filter((_, i) => i !== groupIndex)),
                })}>
                  <Ic.Trash size={12} />
                </button>
              </div>
              {(group.options || []).length > 0 && (
                <div className="simple-sub-options" style={{ borderLeftColor: "var(--accent-soft-line)" }}>
                  <SimpleChoiceOptionList
                    rows={(group.options || []).map((option, i) => normalizeSimpleOption(option, `Option ${i + 1}`))}
                    level="option"
                    path={`group_${groupIndex}_option`}
                    openKeys={openKeys}
                    onToggleOpen={toggleOpen}
                    onChange={(nextOptions) => updateGroupOptions(groupIndex, nextOptions)}
                    onRemove={(optionIndex) => updateGroupOptions(groupIndex, (group.options || []).filter((_, i) => i !== optionIndex))}
                  />
                </div>
              )}
            </div>
          ))}
          <button className="btn dark sm" style={{ alignSelf: "flex-start" }} onClick={addGroup}>
            <Ic.Plus size={12} /> Add group
          </button>
        </div>
      ) : (
        <>
          <SimpleChoiceOptionList
            rows={rows}
            level="option"
            path="option"
            openKeys={openKeys}
            onToggleOpen={toggleOpen}
            onChange={commit}
            onRemove={remove}
          />
          <button className="btn dark sm" style={{ alignSelf: "flex-start" }} onClick={add}>
            <Ic.Plus size={12} /> Add option
          </button>
        </>
      )}
    </div>
  );
}

function SimpleChoiceOptionList({ rows, level, path, openKeys, onToggleOpen, onChange, onRemove }) {
  const Ic = window.Icons;
  const isSub = level === "subOption";
  const [dragIdx, setDragIdx] = React.useState(null);
  const [overIdx, setOverIdx] = React.useState(null);
  const [overPos, setOverPos] = React.useState(null);
  const update = (index, patch) => onChange(rows.map((option, i) => i === index ? { ...option, ...patch } : option));
  const onDragStart = (index) => (e) => {
    e.stopPropagation();
    setDragIdx(index);
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", String(index)); } catch (_) {}
  };
  const onDragOver = (index) => (e) => {
    if (dragIdx == null) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setOverIdx(index);
    setOverPos(e.clientY < rect.top + rect.height / 2 ? "above" : "below");
  };
  const onDragEnd = () => {
    setDragIdx(null);
    setOverIdx(null);
    setOverPos(null);
  };
  const onDrop = (index) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragIdx == null) { onDragEnd(); return; }
    onChange(moveListItem(rows, dragIdx, index, overPos));
    onDragEnd();
  };
  const togglePricing = (index, checked) => {
    const current = rows[index];
    const price = optionPrice(current);
    update(index, checked
      ? { priceEnabled: true, enablePrice: true, priceMode: "priced", pricingModel: "flat_per_item", pricingStructure: simpleOptionPricingStructure(current), unitPrice: price, price }
      : { priceEnabled: false, enablePrice: false, priceMode: "included", pricingModel: "included", pricingStructure: "included", unitPrice: 0, price: 0 }
    );
  };
  const uploadInfoImages = (index, files) => {
    readFilesAsDataUrls(files).then((urls) => {
      if (!urls.length) return;
      const current = rows[index] || {};
      update(index, { infoImages: [...(current.infoImages || []), ...urls] });
    });
  };
  const updateSubOptions = (index, subOptions) => {
    update(index, { subOptions, hasSubOptions: subOptions.length > 0 });
  };
  const addSubOption = (index) => {
    const current = rows[index] || {};
    updateSubOptions(index, [...(current.subOptions || []), { label: `Sub-option ${(current.subOptions || []).length + 1}` }]);
  };
  return (
    <div className="simple-options">
      {rows.map((option, index) => {
        const key = `${path || level}_${index}`;
        const priced = optionHasPricing(option);
        const open = !!openKeys[key];
        const subOptions = (option.subOptions || []).map((sub, subIndex) => normalizeSimpleOption(sub, `Sub-option ${subIndex + 1}`));
        return (
          <div
            className={
              "simple-option-card" +
              (dragIdx === index ? " is-dragging" : "") +
              (overIdx === index && dragIdx !== index && overPos === "above" ? " is-drop-above" : "") +
              (overIdx === index && dragIdx !== index && overPos === "below" ? " is-drop-below" : "")
            }
            key={key}
            onDragOver={onDragOver(index)}
            onDrop={onDrop(index)}
            onDragEnd={onDragEnd}
          >
            <div className="simple-option-row" style={isSub ? { gridTemplateColumns: "auto 1fr auto auto auto" } : { gridTemplateColumns: "auto 1fr auto auto auto auto" }}>
              <span className="simple-option-drag" title={`Drag to reorder ${isSub ? "sub-option" : "option"}`} draggable onDragStart={onDragStart(index)} onDragEnd={onDragEnd}>
                <Ic.Grip size={13} />
              </span>
              <input
                className="input"
                value={option.label || ""}
                placeholder={`${isSub ? "Sub-option" : "Option"} ${index + 1}`}
                onChange={(e) => update(index, { label: e.target.value })}
              />
              <div className="simple-option-price">
                <label className="chk">
                  <input type="checkbox" checked={priced} onChange={(e) => togglePricing(index, e.target.checked)} />
                  Price
                </label>
                {priced && (
                  <>
                    <select
                      className="select"
                      value={simpleOptionPricingStructure(option)}
                      onChange={(e) => update(index, { pricingStructure: e.target.value, priceEnabled: true, enablePrice: true, priceMode: "priced", pricingModel: "flat_per_item" })}
                      style={{ width: 132 }}
                    >
                      <option value="flat">Fixed fee</option>
                      <option value="per_person">Per attendee</option>
                    </select>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={optionPrice(option) || ""}
                      onChange={(e) => update(index, { unitPrice: Number(e.target.value) || 0, price: Number(e.target.value) || 0 })}
                    />
                  </>
                )}
              </div>
              {!isSub && (
                <button
                  className={"btn sm " + (subOptions.length > 0 ? "primary" : "ghost")}
                  title="Add sub-option"
                  onClick={() => addSubOption(index)}
                  style={{ padding: "5px 8px", whiteSpace: "nowrap" }}
                >
                  <Ic.Plus size={12} /> Sub
                </button>
              )}
              <button className="btn icon sm ghost" title={open ? "Close editor" : "Edit option"} onClick={() => onToggleOpen(key)}>
                <Ic.Edit size={12} />
              </button>
              <button className="btn icon sm danger-ghost" title={`Delete ${isSub ? "sub-option" : "option"}`} onClick={() => requestDeleteConfirmation({
                itemType: isSub ? "sub-option" : "option",
                itemName: option.label || `${isSub ? "Sub-option" : "Option"} ${index + 1}`,
                onConfirm: () => onRemove(index),
              })}>
                <Ic.Trash size={12} />
              </button>
            </div>
            {open && (
              <div className="simple-option-body">
                <div className="field-grid">
                  <div>
                    <label className="lbl">Short description</label>
                    <input className="input" value={option.description || option.desc || ""} placeholder="Optional helper text" onChange={(e) => update(index, { description: e.target.value, desc: e.target.value })} />
                  </div>
                  <div>
                    <label className="lbl">Information icon</label>
                    <input className="input" value={option.infoText || ""} placeholder="Tooltip text" onChange={(e) => update(index, { infoText: e.target.value })} />
                  </div>
                </div>
                <div className="field-grid one">
                  <div>
                    <label className="lbl">Information gallery icon</label>
                    <div className="upload-wrap">
                      <input type="file" accept="image/*" multiple onChange={(e) => { uploadInfoImages(index, e.target.files); e.target.value = ""; }} />
                      <div className="upload"><Ic.Img size={15} /><span><b>Upload images</b> · drag or click</span></div>
                    </div>
                    {option.infoImages && option.infoImages.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                        {option.infoImages.map((img, imageIndex) => (
                          <div className="upload-preview" key={imageIndex} style={{ marginTop: 0 }}>
                            <img src={img} alt="" style={{ width: 72, height: 54, objectFit: "cover" }} />
                            <span className="remove" onClick={() => requestDeleteConfirmation({
                              action: "remove",
                              itemType: "image",
                              itemName: `Image ${imageIndex + 1}`,
                              confirmLabel: "Remove",
                              onConfirm: () => update(index, { infoImages: option.infoImages.filter((_, i) => i !== imageIndex) }),
                            })}>×</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {!isSub && subOptions.length > 0 && (
              <div
                className="simple-sub-options"
                onDragOver={(e) => {
                  if (dragIdx == null) return;
                  e.preventDefault();
                  e.stopPropagation();
                  setOverIdx(null);
                  setOverPos(null);
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                  <label className="lbl" style={{ marginBottom: 0 }}>Sub-options for {option.label || `Option ${index + 1}`}</label>
                </div>
                <SimpleChoiceOptionList
                  rows={subOptions}
                  level="subOption"
                  path={`${key}_sub`}
                  openKeys={openKeys}
                  onToggleOpen={onToggleOpen}
                  onChange={(nextSubOptions) => updateSubOptions(index, nextSubOptions)}
                  onRemove={(subIndex) => updateSubOptions(index, subOptions.filter((_, i) => i !== subIndex))}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------- Step-specific recommended fields ----------------
const STEP_PRESETS = {
  "Personal Details": [
    { label: "Client First Name", type: "text", required: true, placeholder: "Enter first name", category: "Contact" },
    { label: "Last Name", type: "text", required: true, placeholder: "Enter last name", category: "Contact" },
    { label: "Organization", type: "text", required: false, placeholder: "Enter organization or charity name if any", helpText: "If booking on behalf of a business, non-profit, or organization.", category: "Contact" },
    { label: "Email", type: "text", required: true, placeholder: "Enter email address", category: "Contact" },
    { label: "Phone Number", type: "number", required: true, placeholder: "Enter valid phone number: (123) 123-1234", category: "Contact" },
    { label: "Not for profit", type: "toggle", required: false, linkedToPricing: true, fieldDescription: "(only check this if you are a registered charity or a not for profit organization)", category: "Discount" },
    { label: "Student Body", type: "toggle", required: false, adminRequired: true, linkedToPricing: true, fieldDescription: "(only check this if event is fully related to a school or university/college)", category: "Discount" },
  ],
  "Event Details": [
    { label: "Event Privacy", type: "radio", required: true, options: ["Public|Events advertised publicly, tickets sold/given in advance or at the door.", "Semi-private|A mostly private event but some guests may be from the general public.", "Private|A private event for family, friends, coworkers, or invited guests only."], category: "Event" },
    { label: "Event Type", type: "select", hasOptions: true, displayAs: "select", groupOptions: true, required: true, placeholder: "Select one event type", options: [
      { type: "group", label: "Business", options: [
        { label: "Business / Board Meeting" },
        { label: "Conference" },
        { label: "Workshop / Training" },
        { label: "Other - Business" },
      ]},
      { type: "group", label: "Social", options: [
        { label: "Lecture / Theater / Movie" },
        { label: "Social Event with dancing / Party" },
        { label: "Social Event without dancing / Banquet" },
        { label: "Reception / Cocktail Party" },
        { label: "Wedding & Reception" },
        { label: "Ceremony / Graduation" },
        { label: "Memorial / End of Life Celebration" },
        { label: "Festival / Market / Show" },
        { label: "Other - Social" },
      ]},
    ], category: "Event" },
    { label: "Brief Description of Event", type: "text", required: true, placeholder: 'What type of event is this?', category: "Event" },
    { label: "Alcohol on Site", type: "radio", required: true, options: ["Yes|There will be alcohol/liquor/wine served at the event.", "No|There will not be any alcohol served at the event."], category: "Event" },
    { label: "Expected Number of Attendees", type: "number", required: true, placeholder: "Enter expected number", min: 10, max: 500, category: "Event" },
  ],
  "Venue Space": [
    { label: "Preferred Room", type: "room", required: true, category: "Venue" },
    { label: "Setup Style", type: "select", required: false, options: ["Theater", "Classroom", "Banquet", "Cocktail", "Boardroom"], category: "Venue" },
    { label: "Special Venue Notes", type: "textarea", required: false, placeholder: "Any special requirements for the space…", category: "Venue" },
  ],
  "Layout": [
    { label: "Table Layout", type: "select", required: false, options: ["Rounds of 8", "Rounds of 10", "Long tables", "No tables"], category: "Layout" },
    { label: "Stage Required", type: "toggle", required: false, category: "Layout" },
    { label: "Dance Floor", type: "toggle", required: false, category: "Layout" },
    { label: "Layout Notes", type: "textarea", required: false, placeholder: "Describe preferred layout…", category: "Layout" },
  ],
  "Rentals": [
    { label: "Add-on Rentals", type: "addons", required: false, category: "Rentals" },
    { label: "Extra Tables Needed", type: "number", required: false, placeholder: "0", category: "Rentals" },
    { label: "Extra Chairs Needed", type: "number", required: false, placeholder: "0", category: "Rentals" },
    { label: "Linens Color", type: "select", required: false, options: ["White", "Black", "Ivory", "Custom"], category: "Rentals" },
  ],
  "Catering": [
    { label: "Beverage Package", type: "radio", hasOptions: true, displayAs: "radio",
      subOptionDisplayAs: "radio", selectionDisplayAs: "checkbox", specificationDisplayAs: "checkbox",
      required: false, visibleToClient: true,
      helpText: "Select your preferred beverage service package",
      options: [
        { label: "Hot/Cold Beverages (Coffee, Tea, Soft Drinks)", enablePrice: false,
          hasSubOptions: true, subOptions: [
            { label: "Up to 30 People", price: 10, enablePrice: true, hasSelections: true, selections: [
              { label: "Coffee only", price: 10 }, { label: "Coffee and Tea", price: 11 }
            ]},
            { label: "Up to 50 People", enablePrice: false },
            { label: "Up to 100 People", enablePrice: false },
          ]},
        { label: "No beverages required" }
      ], category: "Catering" },
    { label: "Buffet Table with Wipeable Covers", type: "checkbox", displayAs: "radio",
      required: false, visibleToClient: true, fieldDescription: "for Main Hall",
      options: [
        { label: "12'", price: 10, enablePrice: true },
        { label: "16'" }, { label: "18'" }, { label: "24'" }
      ], category: "Catering" },
    { label: "Buffet Tables Spandex Covers", type: "checkbox", displayAs: "select",
      required: false, visibleToClient: true, helpText: "Number of spandex covers needed",
      options: [
        { label: "1" }, { label: "2" }, { label: "3" }, { label: "4" }, { label: "5" }, { label: "6" }
      ], category: "Catering" },
    { label: "Do you require catering?", type: "radio", hasOptions: true,
      displayAs: "radio", subOptionDisplayAs: "checkbox",
      required: true, visibleToClient: true,
      options: [
        { label: "No, there will be no food at the event" },
        { label: "No, I will be bringing my own catered food and/or snacks." },
        { label: "Yes, please provide me catering options for",
          hasSubOptions: true, subOptions: [
            { label: "Breakfast" },
            { label: "Lunch" },
            { label: "Dinner" },
            { label: "Snack Food" }
          ]}
      ], category: "Catering" },
    { label: "Catering Specifics ( + for an additional cost )", type: "textarea",
      required: false, visibleToClient: true,
      placeholder: "Specify the catering you would like Collaburo to organize for you (ex. Continental Breakfast, Italian Dinner, etc) with the budget in mind. This will not be included in the quote and will be calculated separately.",
      category: "Catering" },
    { label: "Catering Delivery Time", type: "time", required: false, visibleToClient: true,
      placeholder: "02:00 PM", category: "Catering" },
    { label: "Dietary Restrictions", type: "multiselect", hasOptions: true, displayAs: "checkbox",
      required: false, adminRequired: true, visibleToClient: true,
      fieldDescription: "Check all dietary restrictions that apply.",
      options: [
        { label: "Halal" },
        { label: "Kosher" },
        { label: "Vegetarian" },
        { label: "Vegan" },
        { label: "Allergen Free" },
        { label: "Gluten-free" },
      ],
      category: "Catering" },
  ],
  "Services": [
    { label: "AV Equipment", type: "multiselect", required: false, options: ["Projector", "Microphone", "Speakers", "Screen", "Lighting"], category: "Services" },
    { label: "Photography", type: "toggle", required: false, category: "Services" },
    { label: "Security", type: "toggle", required: false, category: "Services" },
    { label: "Cleaning Fee", type: "toggle", required: false, linkedToPricing: true, category: "Services" },
  ],
  "Additional Services": [
    { label: "Set up Services", type: "radio", hasOptions: true, displayAs: "radio",
      required: false, linkedToPricing: true,
      fieldDescription: "Collaburo has 3 types of set-up services to choose from",
      options: [
        { label: "Budget-friendly DIY Set-up Service", enablePrice: true, price: 0, pricingStructure: "included",
          infoText: "Full room layout with placement of furniture, linens, and chair covers." },
        { label: "Concierge Set-up Service (Banquet)", enablePrice: true, price: 2.25, pricingStructure: "per_person",
          hasPeopleOption: true, peopleLinkedToGuests: true,
          infoText: "Full dinner service layout with dishes, glasses, cutlery, napkins, centerpieces, and buffet set up." },
        { label: "Concierge Set-up Service (Reception/Cocktail Buffet)", enablePrice: true, price: 50, pricingStructure: "flat",
          infoText: "Set up of the buffet table. Up to 1 hour, $25/additional hour." },
      ], category: "Services" },
    { label: "Event Services", type: "multiselect", hasOptions: true, displayAs: "checkbox",
      required: false, linkedToPricing: true,
      options: [
        { label: "Server", enablePrice: true, price: 30, pricingStructure: "per_hour",
          infoText: "Designated Collaburo staff to serve food, plate, clear, and assist throughout the event. 1 waiter per 25 attendees recommended." },
        { label: "Security Services", enablePrice: true, price: 33, pricingStructure: "per_hour",
          infoText: "Experienced event security. Required for public events, optional for private events." },
        { label: "Event Planner", enablePrice: true, price: 30, pricingStructure: "per_hour",
          infoText: "Planning help in the weeks leading up to the event. Timeline creation and vendor coordination." },
        { label: "Coordinator Services during event", enablePrice: true, price: 30, pricingStructure: "per_hour",
          infoText: "Experienced event manager on site to ensure the smooth running of the event." },
        { label: "IT Services", enablePrice: true, price: 60, pricingStructure: "per_hour",
          infoText: "Wi-Fi, projector, sound system support, PTZ camera operation, microphone control." },
      ], category: "Services" },
    { label: "Notes", type: "textarea", required: false,
      placeholder: "Please fill in any details about the required work.", category: "Services" },
    { label: "Clean-up Services", type: "radio", hasOptions: true, displayAs: "radio",
      required: false, linkedToPricing: true,
      fieldDescription: "Once an event is done, Collaburo has 3 types of clean-up services to choose from",
      options: [
        { label: "Budget-friendly DIY Clean-up Service", enablePrice: true, price: 0, pricingStructure: "included",
          infoText: "Client takes home all belongings and sorts trash/recycling." },
        { label: "Walk-Away Service (Banquet)", enablePrice: true, price: 2.75, pricingStructure: "per_person",
          hasPeopleOption: true, peopleLinkedToGuests: true,
          infoText: "Leave the space as if leaving a restaurant. 1 hour of service included." },
        { label: "Walk-Away Service (Reception/Cocktail Buffet)", enablePrice: true, price: 60, pricingStructure: "flat",
          infoText: "Walk-Away from a reception/cocktail space without cleaning. Up to 2 hours, $25/additional hour." },
      ], category: "Services" },
    { label: "3rd Party Services", type: "multiselect", hasOptions: true, displayAs: "checkbox",
      required: false,
      fieldDescription: "We'll connect you with vetted partners for the services you check.",
      options: [
        { label: "Bridal Package" }, { label: "Child Minding" }, { label: "Decorators" },
        { label: "Disc Jockey (DJ)" }, { label: "Entertainers / Clowns" }, { label: "Event Planners" },
        { label: "Floral Wall / Balloon Stylist" }, { label: "Florist" }, { label: "Helper" },
        { label: "Hotels" }, { label: "Master of Ceremony (MC)" }, { label: "Officiant" },
        { label: "Photobooth" }, { label: "Photographers" },
        { label: "Transportation Services (car, van, bus, limo, etc.)" }, { label: "Videographers" },
        { label: "Waiter / Server (Smart Serve)" },
      ], category: "Services" },
  ],
  "Additional Info": [
    { label: "Expected Guest Arrival Time", type: "text", required: false,
      placeholder: "Enter the time communicated to majority of guests to come at",
      category: "Info" },
    { label: "Period of time no one on site during booking", type: "text", required: false,
      helpText: "If there's a gap during the booking where no one will be on site, specify here.",
      category: "Info" },
    { label: "2nd Person Contact on the day of Event", type: "instructional",
      fieldDescription: "Provide a backup contact in case the primary contact is unavailable on event day.",
      category: "Info" },
    { label: "Name", type: "text", required: false, placeholder: "Enter name of emergency contact", category: "Info" },
    { label: "Phone Number", type: "number", required: false, placeholder: "Enter valid phone number: (123) 123-1234", category: "Info" },
    { label: "Special Notes", type: "textarea", required: false,
      placeholder: "Share any details or special requests that will help us tailor your event to perfection!",
      category: "Info" },
    { label: "Blackboard Sign Message", type: "text", required: false,
      placeholder: "ex. Welcome to Joanna's 20th Bday Party",
      helpText: "Custom message displayed on the venue's chalkboard sign greeting your guests.",
      category: "Info" },
    { label: "Add-Ons", type: "multiselect", hasOptions: true, displayAs: "checkbox", required: false,
      fieldDescription: "Main Hall",
      helpText: "Check any additional amenities needed for the event.",
      options: [
        { label: "Wi-Fi", infoText: "High-speed wireless internet available throughout the venue." },
        { label: "Sink Access", infoText: "Access to the venue's sink for food prep, cleaning, or beverages." },
        { label: "Mini Fridge - Floor", infoText: "Floor-standing mini fridge located in the kitchen area." },
        { label: "Mini Fridge - Counter", infoText: "Countertop mini fridge for drinks within easy reach." },
        { label: "Accessibility Elevator", infoText: "Wheelchair-accessible elevator service available throughout the venue." },
        { label: "Printer Access", infoText: "Use of the venue's printer for last-minute signage or programs." },
      ],
      category: "Info" },
  ],
  "Review & Submit": [
    { label: "Terms & Conditions", type: "toggle", required: true, helpText: "You must agree to proceed.", category: "Legal" },
    { label: "Marketing Opt-in", type: "toggle", required: false, category: "Legal" },
  ],
};

function recommendedFieldPresetFromField(field = {}) {
  const preset = cloneData(field) || {};
  delete preset.id;
  delete preset.legacyDuplicateId;
  delete preset.excludeFromRecommended;
  return preset;
}

function buildRecommendedFieldPresetsByStep(steps = []) {
  return (steps || []).reduce((acc, step) => {
    const presets = (step.fields || [])
      .filter((field) => !field.excludeFromRecommended)
      .map(recommendedFieldPresetFromField);
    acc[step.id] = presets;
    if (step.name) acc[step.name] = presets;
    return acc;
  }, {});
}

// ---------------- Recommended Fields Modal ----------------
function RecommendedFieldsModal({ stepName, existingFields, presets = [], onConfirm, onClose }) {
  const Ic = window.Icons;
  const existingLabels = new Set(existingFields.map((f) => String(f.label || "").toLowerCase()).filter(Boolean));
  const isExistingPreset = (preset) => existingLabels.has(String(preset.label || "").toLowerCase());

  const [selected, setSelected] = React.useState(() => {
    const init = {};
    presets.forEach((p, i) => {
      init[i] = true;
    });
    return init;
  });

  const allSelected = presets.length > 0 && presets.every((_, i) => selected[i]);
  const selectedMissingCount = presets.filter((preset, i) => selected[i] && !isExistingPreset(preset)).length;
  const noneSelected = selectedMissingCount === 0;

  const toggleAll = () => {
    const next = {};
    const val = !allSelected;
    presets.forEach((preset, i) => { next[i] = isExistingPreset(preset) ? true : val; });
    setSelected(next);
  };

  const toggle = (i) => {
    if (isExistingPreset(presets[i])) return;
    setSelected({ ...selected, [i]: !selected[i] });
  };

  const handleConfirm = () => {
    const chosen = presets.filter((preset, i) => selected[i] && !isExistingPreset(preset));
    onConfirm(chosen);
  };

  return (
    <div className="rec-overlay" onClick={onClose}>
      <div className="rec-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Add Field</h3>
        <div className="sub">Step: {stepName}</div>
        <div className="rec-toggle-all" onClick={toggleAll}>
          {allSelected ? "Deselect all" : "Select all"}
        </div>
        {presets.map((p, i) => (
          <div
            key={i}
            className={"rec-field" + (selected[i] ? " sel" : "")}
            onClick={() => toggle(i)}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" checked={!!selected[i]} disabled={isExistingPreset(p)} readOnly />
              <span>{p.label}</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {isExistingPreset(p) && <span className="rental-muted" style={{ fontSize: 10.5 }}>Already in workflow</span>}
              <span className="field-type-pill" style={{ fontSize: 10.5 }}>{TYPE_META[p.type]?.label || p.type}</span>
            </span>
          </div>
        ))}
        <div className="rec-new" onClick={() => { onClose(); }}>
          <Ic.Plus size={14} /> New custom field
        </div>
        <div className="rec-actions">
          <button className="btn-gray" onClick={onClose}>Cancel</button>
          <button
            className="btn-accent"
            disabled={noneSelected}
            style={noneSelected ? { opacity: 0.5, pointerEvents: "none" } : {}}
            onClick={handleConfirm}
          >
            Confirm ({selectedMissingCount})
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Delete Confirmation Modal ----------------
function deleteConfirmCopy(config = {}) {
  const { action = "delete", itemType = "item", itemName = "", title, body, highlight, tail } = config;
  const verb = action === "remove" ? "remove" : "delete";
  const titleVerb = action === "remove" ? "Remove" : "Delete";
  const type = itemType || "item";
  const name = String(itemName || type || "item").trim();
  return {
    title: title || `${titleVerb} ${type}`,
    body: body || `Are you sure you want to ${verb} the `,
    highlight: highlight || name,
    tail: tail || ` ${type}? This action cannot be undone.`,
  };
}

function requestDeleteConfirmation(config = {}) {
  const request = window.requestCollaburoDeleteConfirmation;
  if (typeof request === "function") {
    request(config);
    return;
  }
  const copy = deleteConfirmCopy(config);
  if (window.confirm(`${copy.body}${copy.highlight}${copy.tail}`)) {
    config.onConfirm && config.onConfirm();
  }
}

function revealAddedAdminItem(id) {
  if (!id || typeof window === "undefined") return;
  window.setTimeout(() => {
    const selectorId = typeof CSS !== "undefined" && CSS.escape ? CSS.escape(id) : String(id).replace(/"/g, '\\"');
    const el = document.querySelector(`[data-admin-item-id="${selectorId}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.remove("admin-item-added-pulse");
    window.setTimeout(() => el.classList.add("admin-item-added-pulse"), 40);
    window.setTimeout(() => el.classList.remove("admin-item-added-pulse"), 1900);
  }, 80);
}

function ConfirmDeleteModal({ fieldName, title, body, highlight, tail, confirmLabel = "Delete", onConfirm, onCancel }) {
  const copy = fieldName
    ? deleteConfirmCopy({ itemType: "field", itemName: fieldName })
    : { title: title || "Delete item", body: body || "Are you sure you want to delete this ", highlight: highlight || "item", tail: tail || "? This action cannot be undone." };
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{copy.title}</h3>
        <p>{copy.body}<span className="field-name-highlight">{copy.highlight}</span>{copy.tail}</p>
        <div className="actions">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function ResetWarningModal({ onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Reset all changes?</h3>
        <p>
          Resetting will replace the current workflow, rentals, pricing rules, site settings, and progress records with the sample data.
          If you save or publish after resetting, those sample values will overwrite the database.
        </p>
        <div className="actions">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Reset anyway</button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Field editor (column) ----------------
// ============================================================
// SimpleServicesEditor — dedicated dumb-proof editor for stepType="services".
// Each field is a "Service Group" (Set up / Event / Clean-up / 3rd Party / etc).
// Each group has a flat list of "Services" with: name, description, pricing (Free or Charged).
// No type dropdowns, no display-as, no nested options. Just services and prices.
// Saves to the same field.options schema, so client renderer + cost sidebar keep working.
// ============================================================
function SimpleServicesEditor({ step, onUpdateStep, onUpdateField, onDeleteField, onAddField, openFieldId, onToggleField, onDuplicateField, onReorderFields, onDeleteStep }) {
  const Ic = window.Icons;
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const confirmDeleteField = (field) => requestDeleteConfirmation({
    itemType: isServiceGroup(field) ? "service group" : "field",
    itemName: field.label || "Untitled field",
    onConfirm: () => onDeleteField(field.id),
  });

  const addServiceGroup = () => {
    const id = "f" + Math.random().toString(36).slice(2, 8);
    const newField = {
      id,
      type: "radio",
      label: "New Service Group",
      hasOptions: true,
      displayAs: "radio",
      required: false,
      visibleToClient: true,
      linkedToPricing: true,
      fieldDescription: "",
      options: [],
      category: "Services",
    };
    onUpdateStep({ ...step, fields: [...step.fields, newField] });
    revealAddedAdminItem(id);
  };

  // Heuristic: a field is treated as a service group when it has rich options + radio/multiselect/checkbox.
  // Everything else (textarea, number, date, etc.) renders via the normal FieldCard.
  const isServiceGroup = (f) => {
    const supportsOptions = ["radio", "multiselect", "checkbox", "select"].includes(f.type);
    const hasRichOptions = (f.options || []).some(o => typeof o === "object");
    return supportsOptions && (f.hasOptions || hasRichOptions);
  };

  const fields = step.fields || [];
  const dnd = window.useReorderable({
    items: fields,
    onReorder: (next) => onReorderFields ? onReorderFields(next) : onUpdateStep({ ...step, fields: next }),
  });

  return (
    <div className="editor-col">
      <div className="editor-inner">
        <div className="editor-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="editor-head-tag">
              <Ic.Layers size={11} /> Step {(window.SAMPLE_STEPS.findIndex(s => s.id === step.id) + 1)}
            </span>
            <h1>{step.name}</h1>
            <p>{step.description}</p>
          </div>
          {onDeleteStep && (
            <button className="btn icon ghost danger-ghost" title="Delete step" onClick={onDeleteStep}>
              <Ic.Trash size={14} />
            </button>
          )}
        </div>

        <div className="section-bar">
          <h2>
            <Ic.List size={13} /> Components in this step
            <span className="count">{fields.length}</span>
          </h2>
          <div style={{ position: "relative", display: "flex", gap: 6 }}>
            <button className="btn ghost sm" onClick={addServiceGroup}>
              <Ic.Plus size={13} /> Add Service Group
            </button>
            <button className="btn dark sm" onClick={() => setPickerOpen((o) => !o)}>
              <Ic.Plus size={13} /> Add field
            </button>
            {pickerOpen && (
              <FieldTypePicker
                onPick={(t) => { onAddField(t); setPickerOpen(false); }}
                onClose={() => setPickerOpen(false)}
              />
            )}
          </div>
        </div>

        {fields.length === 0 ? (
          <div className="empty-state" style={{ padding: 30, textAlign: "center", border: "1px dashed var(--line-strong)", borderRadius: 8, color: "var(--ink-3)" }}>
            <div style={{ marginBottom: 12 }}>No components yet. Start with a service group or any field type.</div>
            <button className="btn primary sm" onClick={addServiceGroup}>
              <Ic.Plus size={12} /> Add first service group
            </button>
            <button className="btn ghost sm" style={{ marginLeft: 8 }} onClick={() => setPickerOpen(true)}>
              <Ic.Plus size={12} /> Add field
            </button>
          </div>
        ) : (
          <div className="service-group-list" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {fields.map((field) => (
              isServiceGroup(field) ? (
                <ServiceGroupCard
                  key={field.id}
                  field={field}
                  onUpdate={(next) => onUpdateField(field.id, next)}
                  onDelete={() => confirmDeleteField(field)}
                  sourceHandlers={dnd.sourceHandlers(field)}
                  targetHandlers={dnd.targetHandlers(field)}
                  isDragging={dnd.isDragging(field.id)}
                  overPosition={dnd.overPosition(field.id)}
                />
              ) : (
                <FieldCard
                  key={field.id}
                  field={field}
                  allFields={fields}
                  stepType={step.stepType}
                  open={openFieldId === field.id}
                  onToggle={() => onToggleField && onToggleField(field.id)}
                  onUpdate={(next) => onUpdateField(field.id, next)}
                  onDuplicate={() => onDuplicateField && onDuplicateField(field.id)}
                  onDelete={() => confirmDeleteField(field)}
                  sourceHandlers={dnd.sourceHandlers(field)}
                  targetHandlers={dnd.targetHandlers(field)}
                  isDragging={dnd.isDragging(field.id)}
                  isOver={dnd.isOver(field.id)}
                  overPosition={dnd.overPosition(field.id)}
                />
              )
            ))}
          </div>
        )}

        <button className="add-field" onClick={addServiceGroup} style={{ marginTop: 16 }}>
          <Ic.Plus size={14} /> Add another service group
        </button>
        <button className="add-field" onClick={() => setPickerOpen(true)} style={{ marginTop: 8 }}>
          <Ic.Plus size={14} /> Add another field
        </button>
      </div>
    </div>
  );
}

function ServiceGroupCard({ field, onUpdate, onDelete, sourceHandlers = {}, targetHandlers = {}, isDragging = false, overPosition = null }) {
  const Ic = window.Icons;
  const services = field.options || [];
  const isMulti = field.type === "multiselect";
  const [serviceDragIdx, setServiceDragIdx] = React.useState(null);
  const [serviceOverIdx, setServiceOverIdx] = React.useState(null);
  const [serviceOverPos, setServiceOverPos] = React.useState(null);
  const serviceDragIdxRef = React.useRef(null);
  // Keep each row component (including its accordion state) attached to the
  // same service while the array is reordered. An index key transfers the
  // open state to whichever service takes over the old array position.
  const serviceRowKeys = React.useRef([]);
  while (serviceRowKeys.current.length < services.length) {
    serviceRowKeys.current.push(`service_row_${Math.random().toString(36).slice(2, 10)}`);
  }
  if (serviceRowKeys.current.length > services.length) {
    serviceRowKeys.current.length = services.length;
  }

  const setSelectionMode = (multi) => {
    onUpdate({ ...field, type: multi ? "multiselect" : "radio", displayAs: multi ? "checkbox" : "radio" });
  };
  const updateService = (i, patch) => {
    const next = services.map((s, j) => j === i ? { ...(typeof s === "string" ? { label: s } : s), ...patch } : s);
    onUpdate({ ...field, options: next });
  };
  const removeService = (i) => requestDeleteConfirmation({
    action: "remove",
    itemType: "service",
    itemName: (typeof services[i] === "string" ? services[i] : services[i]?.label) || `Service ${i + 1}`,
    confirmLabel: "Remove",
    onConfirm: () => {
      serviceRowKeys.current.splice(i, 1);
      onUpdate({ ...field, options: services.filter((_, j) => j !== i) });
    },
  });
  const addService = () => {
    serviceRowKeys.current.push(`service_row_${Math.random().toString(36).slice(2, 10)}`);
    onUpdate({ ...field, options: [...services, { label: "New Service", icon: "" }] });
  };
  const onServiceDragStart = (index) => (e) => {
    e.stopPropagation();
    serviceDragIdxRef.current = index;
    setServiceDragIdx(index);
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", String(index)); } catch (_) {}
  };
  const onServiceDragOver = (index) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const position = e.clientY < rect.top + rect.height / 2 ? "above" : "below";
    setServiceOverIdx(index);
    setServiceOverPos(position);
  };
  const onServiceDragEnd = () => {
    serviceDragIdxRef.current = null;
    setServiceDragIdx(null);
    setServiceOverIdx(null);
    setServiceOverPos(null);
  };
  const onServiceDrop = (index) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    let fromIndex = serviceDragIdxRef.current;
    if (fromIndex == null) {
      try {
        const transferredIndex = Number(e.dataTransfer.getData("text/plain"));
        if (Number.isInteger(transferredIndex)) fromIndex = transferredIndex;
      } catch (_) {}
    }
    if (fromIndex == null) { onServiceDragEnd(); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const position = e.clientY < rect.top + rect.height / 2 ? "above" : "below";
    serviceRowKeys.current = moveListItem(serviceRowKeys.current, fromIndex, index, position);
    onUpdate({ ...field, options: moveListItem(services, fromIndex, index, position) });
    onServiceDragEnd();
  };

  return (
    <div
      className={
        "service-group-card" +
        (isDragging ? " is-dragging" : "") +
        (overPosition === "above" ? " is-drop-above" : "") +
        (overPosition === "below" ? " is-drop-below" : "")
      }
      style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: 18 }}
      data-admin-item-id={field.id}
      {...targetHandlers}
    >
      {/* Group header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
        <span className="service-option-drag" title="Drag to reorder service group" {...sourceHandlers}>
          <Ic.Grip size={14} />
        </span>
        <div style={{ flex: 1 }}>
          <label className="lbl" style={{ fontSize: 10 }}>Group label</label>
          <input
            className="input"
            value={field.label || ""}
            onChange={(e) => onUpdate({ ...field, label: e.target.value })}
            style={{ fontWeight: 600 }}
          />
        </div>
        <button className="btn icon sm danger-ghost" title="Delete group" onClick={onDelete}>
          <Ic.Trash size={13} />
        </button>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label className="lbl" style={{ fontSize: 10 }}>Description (shown to clients)</label>
        <textarea
          className="textarea"
          rows={2}
          value={field.fieldDescription || ""}
          onChange={(e) => onUpdate({ ...field, fieldDescription: e.target.value })}
          placeholder="e.g. Collaburo has 3 types of set-up services to choose from"
        />
      </div>

      {/* Selection mode */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14, padding: "10px 12px", background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-4)" }}>Client picks:</span>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
          <input type="radio" checked={!isMulti} onChange={() => setSelectionMode(false)} style={{ accentColor: "var(--accent)" }} />
          One service
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
          <input type="radio" checked={isMulti} onChange={() => setSelectionMode(true)} style={{ accentColor: "var(--accent)" }} />
          Multiple services
        </label>
      </div>

      {/* Services list */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-4)", letterSpacing: 0.4 }}>
          Services ({services.length})
        </span>
        <button
          className="btn ghost sm"
          onClick={addService}
          style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--accent)" }}
        >
          <Ic.Plus size={11} /> Add Service
        </button>
      </div>

      {services.length === 0 && (
        <div style={{ fontSize: 12, color: "var(--ink-4)", fontStyle: "italic", padding: "10px 0", textAlign: "center", border: "1px dashed var(--line)", borderRadius: 6 }}>
          No services yet — click "Add Service" to create the first one.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {services.map((svc, i) => (
          <SimpleServiceRow
            key={serviceRowKeys.current[i]}
            service={typeof svc === "string" ? { label: svc } : svc}
            onUpdate={(patch) => updateService(i, patch)}
            onRemove={() => removeService(i)}
            dragHandlers={{
              onDragStart: onServiceDragStart(i),
              onDragEnd: onServiceDragEnd,
            }}
            targetHandlers={{
              onDragOver: onServiceDragOver(i),
              onDrop: onServiceDrop(i),
              onDragEnd: onServiceDragEnd,
            }}
            isDragging={serviceDragIdx === i}
            overPosition={serviceOverIdx === i && serviceDragIdx !== i ? serviceOverPos : null}
          />
        ))}
      </div>
    </div>
  );
}

// Default option values for the 3 admin-controlled selectors.
const DEFAULT_SEX_OPTIONS = ["No Preference", "Male Only", "Female Only"];
const DEFAULT_PEOPLE_RANGE = { min: 1, max: 50 };
const DEFAULT_HOURS_RANGE = { min: 1, max: 24 };

function SimpleServiceRow({ service, onUpdate, onRemove, dragHandlers = {}, targetHandlers = {}, isDragging = false, overPosition = null }) {
  const Ic = window.Icons;
  // Accordion state — new services (no label) start open; saved services start collapsed.
  const [open, setOpen] = React.useState(!service.label);
  const serviceIconImage = service.iconImage || service.iconUrl || "";
  const isQuote = service.pricingStructure === "quote";
  const isFree = !isQuote && (!service.enablePrice || service.pricingStructure === "included");
  const isCharged = !isQuote && !!service.enablePrice && service.pricingStructure !== "included";

  const setFree = () => onUpdate({ enablePrice: true, price: 0, pricingStructure: "included" });
  const setQuote = () => onUpdate({ enablePrice: true, price: 0, pricingStructure: "quote" });
  const setCharged = () => onUpdate({
    enablePrice: true,
    price: Number(service.price) > 0 ? service.price : "",
    pricingStructure: service.pricingStructure && service.pricingStructure !== "included" && service.pricingStructure !== "quote" ? service.pricingStructure : "flat",
  });

  // Pricing summary chip for the collapsed header
  const summaryChip = () => {
    if (isQuote) return { text: "Quote on request", color: "var(--ink-3)" };
    if (isFree) return { text: "Included in cost", color: "var(--ink-3)" };
    if (isCharged) {
      const unit = window.pricingUnitFor ? window.pricingUnitFor(service.pricingStructure) : "";
      const amount = Number(service.price) > 0 ? `+$${service.price}` : "Set price";
      return { text: `${amount}${unit ? " " + unit : ""}`, color: "var(--accent)" };
    }
    return { text: "No pricing set", color: "var(--ink-4)" };
  };
  const chip = summaryChip();

  // Auto-enable matching selector when admin picks a per-person / per-hour pricing structure.
  const setStructure = (struct) => {
    const patch = { pricingStructure: struct };
    if ((struct === "per_person" || struct === "per_person_hour") && !service.hasPeopleOption) {
      patch.hasPeopleOption = true;
      patch.peopleRange = service.peopleRange || DEFAULT_PEOPLE_RANGE;
    }
    if ((struct === "per_hour" || struct === "per_person_hour") && !service.hasHoursOption) {
      patch.hasHoursOption = true;
      patch.hoursRange = service.hoursRange || DEFAULT_HOURS_RANGE;
    }
    onUpdate(patch);
  };

  const STRUCT_OPTIONS = [
    { value: "flat", label: "flat fee" },
    { value: "per_person", label: "per person" },
    { value: "per_hour", label: "per hour" },
    { value: "per_person_hour", label: "per person / hour" },
  ];

  // Sex options list editor
  const sexOptions = service.sexOptions || (service.hasSexOption ? DEFAULT_SEX_OPTIONS : []);
  const updateSex = (i, val) => {
    const next = [...sexOptions];
    next[i] = val;
    onUpdate({ sexOptions: next });
  };
  const removeSex = (i) => requestDeleteConfirmation({
    action: "remove",
    itemType: "selection option",
    itemName: sexOptions[i] || `Option ${i + 1}`,
    confirmLabel: "Remove",
    onConfirm: () => onUpdate({ sexOptions: sexOptions.filter((_, j) => j !== i) }),
  });
  const addSex = () => onUpdate({ sexOptions: [...sexOptions, ""] });

  const peopleRange = service.peopleRange || DEFAULT_PEOPLE_RANGE;
  const hoursRange = service.hoursRange || DEFAULT_HOURS_RANGE;
  const uploadServiceIcon = (files) => {
    readFilesAsDataUrls(files).then(([url]) => {
      if (url) onUpdate({ iconImage: url, iconUrl: url, icon: "" });
    });
  };

  const ToggleHeader = ({ checked, onToggle, label }) => (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
      <input type="checkbox" checked={!!checked} onChange={(e) => onToggle(e.target.checked)} style={{ accentColor: "var(--accent)" }} />
      {label}
    </label>
  );

  return (
    <div
      className={
        "service-option-row" +
        (isDragging ? " is-dragging" : "") +
        (overPosition === "above" ? " is-drop-above" : "") +
        (overPosition === "below" ? " is-drop-below" : "")
      }
      style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}
      {...targetHandlers}
    >
      {/* Accordion header (always visible, click to toggle) */}
      <div
        onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", gap: 8, padding: 12, cursor: "pointer", userSelect: "none" }}
      >
        <span
          className="service-option-drag"
          title="Drag to reorder service"
          onClick={(e) => e.stopPropagation()}
          draggable
          {...dragHandlers}
          onDragStart={(e) => {
            setOpen(false);
            dragHandlers.onDragStart && dragHandlers.onDragStart(e);
          }}
        >
          <Ic.Grip size={13} />
        </span>
        <span style={{ flex: 1, fontWeight: 600, fontSize: 13, color: service.label ? "var(--ink)" : "var(--ink-4)", fontStyle: service.label ? "normal" : "italic" }}>
          {serviceIconImage && <img className="service-option-icon-preview" src={serviceIconImage} alt="" />}
          {service.label || "New service"}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700, color: chip.color, whiteSpace: "nowrap",
          padding: "3px 8px", borderRadius: 10,
          background: chip.color === "var(--accent)" ? "var(--accent-soft)" : "#eee",
        }}>
          {chip.text}
        </span>
        <button
          className="btn icon sm ghost"
          title={open ? "Close editor" : "Edit service"}
          onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        >
          <Ic.Edit size={13} />
        </button>
        <button
          className="btn icon sm danger-ghost"
          title="Remove service"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
        >
          <Ic.Close size={12} />
        </button>
      </div>

      {!open && null}
      {open && (
      <div style={{ padding: "0 12px 12px", borderTop: "1px solid var(--line)" }}>
      <div style={{ height: 12 }} />
      {/* Name (editable inline when expanded) */}
      <div className="service-name-grid" style={{ marginBottom: 8 }}>
        <div>
          <label className="lbl" style={{ fontSize: 10 }}>Small icon</label>
          <div className="service-icon-upload">
            <label className="service-icon-drop" title="Upload service icon">
              {serviceIconImage ? <img src={serviceIconImage} alt="" /> : <span>+</span>}
              <input type="file" accept="image/*" onChange={(e) => { uploadServiceIcon(e.target.files); e.target.value = ""; }} />
            </label>
            {serviceIconImage && (
              <button className="btn icon sm ghost" title="Remove icon" onClick={() => onUpdate({ iconImage: "", iconUrl: "", icon: "" })}>
                <Ic.Close size={11} />
              </button>
            )}
          </div>
        </div>
        <div>
          <label className="lbl" style={{ fontSize: 10 }}>Service name</label>
          <input
            className="input"
            value={service.label || ""}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Service name"
            style={{ fontWeight: 600 }}
          />
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 8 }}>
        <label className="lbl" style={{ fontSize: 10 }}>Description</label>
        <textarea
          className="textarea"
          rows={2}
          value={service.infoText || ""}
          onChange={(e) => onUpdate({ infoText: e.target.value })}
          placeholder="Description (optional, shown to clients)"
        />
      </div>

      {/* Pricing — three radio modes */}
      <div className="service-pricing-row">
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-4)" }}>Pricing:</span>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <input type="radio" checked={isFree} onChange={setFree} style={{ accentColor: "var(--accent)" }} />
          Free / Included
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <input type="radio" checked={isCharged} onChange={setCharged} style={{ accentColor: "var(--accent)" }} />
          Charged
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <input type="radio" checked={isQuote} onChange={setQuote} style={{ accentColor: "var(--accent)" }} />
          Quote separately
        </label>
        {isCharged && (
          <span className="service-price-controls">
            <span style={{ color: "var(--ink-3)" }}>at</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontWeight: 600 }}>
              <span style={{ color: "var(--ink-3)" }}>$</span>
              <input
                className="input price-input"
                type="text"
                value={service.price ?? ""}
                onChange={(e) => onUpdate({ price: e.target.value })}
                placeholder="0"
                style={{ width: 70, textAlign: "right" }}
              />
            </span>
            <select
              className="select service-price-structure"
              value={service.pricingStructure || "flat"}
              onChange={(e) => setStructure(e.target.value)}
            >
              {STRUCT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </span>
        )}
        {isQuote && (
          <span style={{ fontSize: 11, color: "var(--ink-3)", fontStyle: "italic" }}>
            · won't appear in the cost summary; a staff member will follow up with a quote.
          </span>
        )}
      </div>

      {/* Selections / Extras — admin-controlled dropdowns shown to client when service is picked */}
      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: 0.4 }}>
            Selections for this service
          </div>
          <label className="chk" style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <input
              type="checkbox"
              checked={!!service.requireSelections}
              onChange={(e) => onUpdate({ requireSelections: e.target.checked })}
              style={{ accentColor: "var(--accent)" }}
            />
            Require option <span className="req">*</span>
          </label>
        </div>

        {/* Sex selector */}
        <div style={{ marginBottom: 8 }}>
          <ToggleHeader
            checked={service.hasSexOption}
            onToggle={(on) => onUpdate({ hasSexOption: on, sexOptions: on ? (service.sexOptions || DEFAULT_SEX_OPTIONS) : service.sexOptions })}
            label='Sex selector'
          />
          {service.hasSexOption && (
            <div style={{ marginTop: 6, paddingLeft: 24 }}>
              {sexOptions.map((opt, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <input className="input" value={opt} onChange={(e) => updateSex(i, e.target.value)} placeholder="Option label" style={{ flex: 1, fontSize: 12 }} />
                  <button className="btn icon sm danger-ghost" onClick={() => removeSex(i)}><Ic.Close size={11} /></button>
                </div>
              ))}
              <button className="btn ghost sm" onClick={addSex} style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700 }}>
                <Ic.Plus size={10} /> Add option
              </button>
            </div>
          )}
        </div>

        {/* People selector */}
        <div style={{ marginBottom: 8 }}>
          <ToggleHeader
            checked={service.hasPeopleOption}
            onToggle={(on) => onUpdate({ hasPeopleOption: on, peopleRange: on ? (service.peopleRange || DEFAULT_PEOPLE_RANGE) : service.peopleRange })}
            label='"# of people" selector'
          />
          {service.hasPeopleOption && (
            <div style={{ marginTop: 6, paddingLeft: 24 }}>
              {/* Source picker: link to guest count OR custom range */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12, marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-4)" }}>Where does the count come from?</span>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, cursor: "pointer", marginBottom: 4 }}>
                <input
                  type="radio"
                  checked={!!service.peopleLinkedToGuests}
                  onChange={() => onUpdate({ peopleLinkedToGuests: true })}
                  style={{ accentColor: "var(--accent)" }}
                />
                <span>Use <b>total guest count</b> from Step 2</span>
                <span style={{ fontSize: 11, color: "var(--ink-4)", fontStyle: "italic" }}>(auto-multiplied — no client input)</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, cursor: "pointer", marginBottom: 4 }}>
                <input
                  type="radio"
                  checked={!service.peopleLinkedToGuests}
                  onChange={() => onUpdate({ peopleLinkedToGuests: false })}
                  style={{ accentColor: "var(--accent)" }}
                />
                <span>Let client pick from a range</span>
              </label>
              {!service.peopleLinkedToGuests && (
                <div style={{ paddingLeft: 24, display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span>From</span>
                  <input className="input" type="number" min={1} value={peopleRange.min} onChange={(e) => onUpdate({ peopleRange: { ...peopleRange, min: Number(e.target.value) || 1 } })} style={{ width: 70 }} />
                  <span>to</span>
                  <input className="input" type="number" min={1} value={peopleRange.max} onChange={(e) => onUpdate({ peopleRange: { ...peopleRange, max: Number(e.target.value) || 1 } })} style={{ width: 70 }} />
                </div>
              )}
              {(service.pricingStructure === "per_person" || service.pricingStructure === "per_person_hour") && (
                <div style={{ marginTop: 4, fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>· multiplies price</div>
              )}
            </div>
          )}
        </div>

        {/* Hours selector */}
        <div>
          <ToggleHeader
            checked={service.hasHoursOption}
            onToggle={(on) => onUpdate({ hasHoursOption: on, hoursRange: on ? (service.hoursRange || DEFAULT_HOURS_RANGE) : service.hoursRange })}
            label='"# of hours" selector'
          />
          {service.hasHoursOption && (
            <div style={{ marginTop: 6, paddingLeft: 24, display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
              <span>From</span>
              <input className="input" type="number" min={1} value={hoursRange.min} onChange={(e) => onUpdate({ hoursRange: { ...hoursRange, min: Number(e.target.value) || 1 } })} style={{ width: 70 }} />
              <span>to</span>
              <input className="input" type="number" min={1} value={hoursRange.max} onChange={(e) => onUpdate({ hoursRange: { ...hoursRange, max: Number(e.target.value) || 1 } })} style={{ width: 70 }} />
              {service.pricingStructure === "per_hour" || service.pricingStructure === "per_person_hour" ? (
                <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>· multiplies price</span>
              ) : null}
            </div>
          )}
        </div>
      </div>
      </div>
      )}
    </div>
  );
}

function CheckoutEditor({ step, onUpdateStep, onAddField, onDuplicateField, onDeleteField, onUpdateField, openFieldId, onToggleField, onReorderFields, onDeleteStep }) {
  const Ic = window.Icons;
  const [editingHead, setEditingHead] = React.useState(false);
  const [headDraft, setHeadDraft] = React.useState({ name: "", description: "" });
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const checkout = step.checkout || {};
  const summaryItems = checkout.summaryItems || {};
  const agreements = checkout.agreements || [];
  const simpleFields = step.fields || [];

  React.useEffect(() => {
    if (!editingHead && step) setHeadDraft({ name: step.name, description: step.description || "" });
  }, [step?.id, editingHead]);

  const update = (patch) => onUpdateStep({ ...step, ...patch });
  const updateCheckout = (patch) => update({ checkout: { ...checkout, ...patch } });
  const updateSummaryItem = (key, value) => updateCheckout({ summaryItems: { ...summaryItems, [key]: value } });
  const updateAgreement = (id, patch) => updateCheckout({ agreements: agreements.map((agreement) => agreement.id === id ? { ...agreement, ...patch } : agreement) });
  const addAgreement = () => updateCheckout({ agreements: [...agreements, { id: uid("agr"), label: "I understand and agree to this booking policy.", required: true }] });
  const deleteAgreement = (id) => {
    const agreement = agreements.find((item) => item.id === id);
    requestDeleteConfirmation({
      itemType: "agreement",
      itemName: agreement?.label || "Agreement",
      onConfirm: () => updateCheckout({ agreements: agreements.filter((item) => item.id !== id) }),
    });
  };

  const summaryOptions = [
    ["spaceRental", "Space Rental"],
    ["spaceContentRentals", "Space Content Rentals"],
    ["cateringCost", "Catering Cost"],
    ["setupServiceCost", "Set up Service Cost"],
    ["eventServiceCost", "Event Service Cost"],
    ["cleanupServiceCost", "Clear up Service Cost"],
    ["tax", "Tax"],
    ["securityDeposit", "Security Deposit"],
    ["totalWithSecurityDeposit", "Total with Security Deposit"],
  ];

  const dnd = window.useReorderable({
    items: simpleFields,
    onReorder: (next) => onReorderFields(next),
  });

  return (
    <div className="editor-col">
      <div className="editor-inner">
        <div className="editor-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="editor-head-tag"><Ic.Layers size={11} /> Checkout step</span>
            {editingHead ? (
              <>
                <input className="input" style={{ fontSize: "var(--text-xl)", fontWeight: 600, marginBottom: 6, letterSpacing: "-0.02em" }} value={headDraft.name} autoFocus onChange={(e) => setHeadDraft({ ...headDraft, name: e.target.value })} />
                <textarea className="textarea" rows={2} value={headDraft.description} placeholder="Description shown above this step in the client view" onChange={(e) => setHeadDraft({ ...headDraft, description: e.target.value })} />
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button className="btn primary sm" onClick={() => { update({ name: headDraft.name.trim() || step.name, description: headDraft.description }); setEditingHead(false); }}>Save</button>
                  <button className="btn ghost sm" onClick={() => setEditingHead(false)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <h1>{step.name}</h1>
                <p>{step.description || <em style={{ color: "var(--ink-4)" }}>Add a description to give clients context for this step.</em>}</p>
              </>
            )}
          </div>
          {!editingHead && (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {onDeleteStep && (
                <button className="btn icon ghost danger-ghost" title="Delete step" onClick={onDeleteStep}>
                  <Ic.Trash size={14} />
                </button>
              )}
              <button className="btn icon ghost" title="Edit step info" onClick={() => setEditingHead(true)}>
                <Ic.Edit size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="section-bar">
          <h2><Ic.List size={13} /> Checkout configuration <span className="count">{agreements.length}</span></h2>
          <div style={{ position: "relative", display: "flex", gap: 6 }}>
            <button className="btn dark sm" onClick={() => setPickerOpen((o) => !o)}>
              <Ic.Plus size={13} /> Add field
            </button>
            {pickerOpen && (
              <FieldTypePicker
                onPick={(t) => { onAddField(t); setPickerOpen(false); }}
                onClose={() => setPickerOpen(false)}
              />
            )}
          </div>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15 }}>Summary of Cost</h3>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--ink-3)" }}>Choose which quote rows appear on the final checkout step.</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
              {summaryOptions.map(([key, label]) => (
                <label key={key} className="chk" style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 7, padding: "8px 10px" }}>
                  <input type="checkbox" checked={summaryItems[key] !== false} onChange={(e) => updateSummaryItem(key, e.target.checked)} />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: 16 }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 15 }}>Confirmation Message</h3>
            <textarea
              className="textarea"
              rows={3}
              value={checkout.confirmationMessage || ""}
              onChange={(e) => updateCheckout({ confirmationMessage: e.target.value })}
              placeholder="Text shown above the agreement checkboxes."
            />
          </div>

          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: 16 }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 15 }}>Final Step Note</h3>
            <textarea
              className="textarea"
              rows={4}
              value={checkout.planningNote || ""}
              onChange={(e) => updateCheckout({ planningNote: e.target.value })}
              placeholder="NOTE: This planning tool helps you manage your event budget. Submitting a booking request lets our staff know you're interested..."
            />
          </div>

          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15 }}>Required Agreements</h3>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--ink-3)" }}>Required rows must be checked by the client before Submit is enabled.</p>
              </div>
              <button className="btn dark sm" onClick={addAgreement}><Ic.Plus size={12} /> Add agreement</button>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {agreements.map((agreement, index) => (
                <div key={agreement.id} style={{ border: "1px solid var(--line)", borderRadius: 8, background: "var(--surface-2)", padding: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <strong style={{ fontSize: 12, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".04em" }}>Agreement {index + 1}</strong>
                    <label className="chk" style={{ marginLeft: "auto" }}>
                      <input type="checkbox" checked={agreement.required !== false} onChange={(e) => updateAgreement(agreement.id, { required: e.target.checked })} />
                      Required to submit
                    </label>
                    <button className="btn icon sm ghost danger-ghost" title="Delete agreement" onClick={() => deleteAgreement(agreement.id)}>
                      <Ic.Trash size={13} />
                    </button>
                  </div>
                  <textarea
                    className="textarea"
                    rows={3}
                    value={agreement.label || ""}
                    onChange={(e) => updateAgreement(agreement.id, { label: e.target.value })}
                    placeholder="Agreement text shown beside the checkbox"
                  />
                </div>
              ))}
              {agreements.length === 0 && (
                <div style={{ color: "var(--ink-3)", fontSize: 13, border: "1px dashed var(--line-strong)", borderRadius: 8, padding: 18, textAlign: "center" }}>No agreements yet.</div>
              )}
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: 16 }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 15 }}>Submit Button</h3>
            <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12 }}>
              <div>
                <label className="lbl">Button label</label>
                <input className="input" value={checkout.submitLabel || "Submit"} onChange={(e) => updateCheckout({ submitLabel: e.target.value })} />
              </div>
              <div>
                <label className="lbl">Success message</label>
                <input className="input" value={checkout.successMessage || ""} onChange={(e) => updateCheckout({ successMessage: e.target.value })} placeholder="Message after submit" />
              </div>
            </div>
          </div>
        </div>

        {simpleFields.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>Additional fields</div>
            <div className="field-list">
              {simpleFields.map((f) => (
                <FieldCard
                  key={f.id}
                  field={f}
                  allFields={simpleFields}
                  stepType={step.stepType}
                  open={openFieldId === f.id}
                  onToggle={() => onToggleField(f.id)}
                  onUpdate={(next) => onUpdateField(f.id, next)}
                  onDuplicate={() => onDuplicateField(f.id)}
                  onDelete={() => setDeleteTarget({ id: f.id, label: f.label })}
                  sourceHandlers={dnd.sourceHandlers(f)}
                  targetHandlers={dnd.targetHandlers(f)}
                  isDragging={dnd.isDragging(f.id)}
                  isOver={dnd.isOver(f.id)}
                  overPosition={dnd.overPosition(f.id)}
                />
              ))}
            </div>
          </div>
        )}

        {deleteTarget && (
          <ConfirmDeleteModal
            fieldName={deleteTarget.label}
            onConfirm={() => { onDeleteField(deleteTarget.id); setDeleteTarget(null); }}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </div>
    </div>
  );
}

function FieldEditor({ step, recommendedFields = [], onUpdateStep, onAddField, onAddMultipleFields, onDuplicateField, onDeleteField, onUpdateField, openFieldId, onToggleField, onReorderFields, onDeleteStep }) {
  const Ic = window.Icons;
  const [editingHead, setEditingHead] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [recOpen, setRecOpen] = React.useState(false);
  const [rentalPickerOpen, setRentalPickerOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const [headDraft, setHeadDraft] = React.useState({ name: "", description: "" });
  const rentalGroupCount = (step?.fields || []).filter((field) => field.type === "rental_group").length;
  const isRentalGroupSection = step?.name === "Rentals" || rentalGroupCount > 0;

  React.useEffect(() => {
    if (!editingHead && step) {
      setHeadDraft({ name: step.name, description: step.description || "" });
    }
  }, [step?.id, editingHead]);

  const dnd = window.useReorderable({
    items: step?.fields || [],
    onReorder: (next) => onReorderFields(next),
  });

  if (!step) {
    return (
      <div className="editor-col">
        <div className="editor-inner">
          <div className="empty">
            <div className="ill"><Ic.Layers size={24} /></div>
            <h3>No step selected</h3>
            <p>Pick a step from the sequence on the left to start editing its fields.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-col">
      <div className="editor-inner">
        <div className="editor-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="editor-head-tag">
              <Ic.Layers size={11} /> Step {(window.SAMPLE_STEPS.findIndex(s => s.id === step.id) + 1)}
            </span>
            {editingHead ? (
              <>
                <input
                  className="input"
                  style={{ fontSize: "var(--text-xl)", fontWeight: 600, marginBottom: 6, letterSpacing: "-0.02em" }}
                  value={headDraft.name}
                  autoFocus
                  onChange={(e) => setHeadDraft({ ...headDraft, name: e.target.value })}
                />
                <textarea
                  className="textarea"
                  rows={2}
                  value={headDraft.description}
                  placeholder="Description shown above this step in the client view"
                  onChange={(e) => setHeadDraft({ ...headDraft, description: e.target.value })}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button
                    className="btn primary sm"
                    onClick={() => {
                      onUpdateStep({ ...step, name: headDraft.name.trim() || step.name, description: headDraft.description });
                      setEditingHead(false);
                    }}
                  >
                    Save
                  </button>
                  <button className="btn ghost sm" onClick={() => setEditingHead(false)}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1>{step.name}</h1>
                <p>{step.description || <em style={{ color: "var(--ink-4)" }}>Add a description to give clients context for this step.</em>}</p>
              </>
            )}
          </div>
          {!editingHead && (
            <div style={{ position: "relative", display: "flex", gap: 6, alignItems: "center" }}>
              {onDeleteStep && (
                <button className="btn icon ghost danger-ghost" title="Delete step" onClick={onDeleteStep}>
                  <Ic.Trash size={14} />
                </button>
              )}
              <button className="btn icon ghost" title="Edit step info" onClick={() => setEditingHead(true)}>
                <Ic.Edit size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="section-bar">
          <h2>
            <Ic.List size={13} /> {isRentalGroupSection ? "Rental Groups" : "Components in this step"}
            <span className="count">{step.fields.length}</span>
          </h2>
          <div style={{ position: "relative", display: "flex", gap: 6 }}>
            {isRentalGroupSection && (
              <button className="btn ghost sm" onClick={() => setRentalPickerOpen(true)}>
                <Ic.Plus size={13} /> Add rental groups
              </button>
            )}
            {recommendedFields.length > 0 && (
              <button className="btn ghost sm" onClick={() => setRecOpen(true)} title="Recommended fields for this step">
                <Ic.CheckSq size={13} /> Recommended
              </button>
            )}
            <button className="btn dark sm" onClick={() => setPickerOpen((o) => !o)}>
              <Ic.Plus size={13} /> Add field
            </button>
            {pickerOpen && (
              <FieldTypePicker
                onPick={(t) => { onAddField(t); setPickerOpen(false); }}
                onClose={() => setPickerOpen(false)}
              />
            )}
          </div>
        </div>

        {recOpen && (
          <RecommendedFieldsModal
            stepName={step.name}
            existingFields={step.fields}
            presets={recommendedFields}
            onConfirm={(chosen) => {
              onAddMultipleFields(chosen);
              setRecOpen(false);
            }}
            onClose={() => setRecOpen(false)}
          />
        )}
        {rentalPickerOpen && (
          <RentalGroupPickerModal
            existingFields={step.fields}
            onConfirm={(chosen) => {
              onAddMultipleFields(chosen);
              setRentalPickerOpen(false);
            }}
            onClose={() => setRentalPickerOpen(false)}
          />
        )}

        {step.fields.length === 0 ? (
          <div className="empty" style={{ background: "var(--surface-2)", border: "1px dashed var(--line-strong)", borderRadius: 10 }}>
            <div className="ill"><Ic.Plus size={22} /></div>
            <h3>{isRentalGroupSection ? "No rental groups yet" : "No fields yet"}</h3>
            <p>{isRentalGroupSection ? "Choose rental groups from the Rentals catalog for this workflow step." : "Add the first field clients will see when they reach this step."}</p>
            <button className="btn primary sm" onClick={() => setPickerOpen(true)}>
              <Ic.Plus size={12} /> Add first field
            </button>
          </div>
        ) : (
          <div className="field-list">
            {step.fields.map((f) => (
              <FieldCard
                key={f.id}
                field={f}
                allFields={step.fields}
                stepType={step.stepType}
                open={openFieldId === f.id}
                onToggle={() => onToggleField(f.id)}
                onUpdate={(next) => onUpdateField(f.id, next)}
                onDuplicate={() => onDuplicateField(f.id)}
                onDelete={() => setDeleteTarget({ id: f.id, label: f.label })}
                sourceHandlers={dnd.sourceHandlers(f)}
                targetHandlers={dnd.targetHandlers(f)}
                isDragging={dnd.isDragging(f.id)}
                isOver={dnd.isOver(f.id)}
                overPosition={dnd.overPosition(f.id)}
              />
            ))}
          </div>
        )}

        {deleteTarget && (
          <ConfirmDeleteModal
            fieldName={deleteTarget.label}
            onConfirm={() => { onDeleteField(deleteTarget.id); setDeleteTarget(null); }}
            onCancel={() => setDeleteTarget(null)}
          />
        )}

        <button className="add-field" onClick={() => setPickerOpen(true)}>
          <Ic.Plus size={14} /> {step.stepType === "services" ? "Add another field" : "Add another field"}
        </button>
      </div>
    </div>
  );
}

// ---------------- Field type picker popover ----------------
function FieldTypePicker({ onPick, onClose }) {
  const Ic = window.Icons;
  const ref = React.useRef(null);
  const [q, setQ] = React.useState("");

  React.useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onClose]);

  const term = q.trim().toLowerCase();
  const groups = (window.SIMPLE_FIELD_GROUPS || []).map((group) => ({
    ...group,
    items: (group.items || []).filter((t) =>
      !term ||
      t.label.toLowerCase().includes(term) ||
      t.desc.toLowerCase().includes(term) ||
      group.group.toLowerCase().includes(term)
    ),
  })).filter((group) => group.items.length);

  return (
    <div className="type-picker" ref={ref} style={{ top: "100%", right: 0, marginTop: 6 }}>
      <div className="type-picker-search">
        <input
          className="input"
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search field types…"
        />
      </div>
      {groups.map((group) => (
        <div key={group.group}>
          <div className="type-picker-group-title">{group.group}</div>
          <div className="type-picker-grid">
            {group.items.map((t) => {
              const I = window.Icons[t.icon] || window.Icons.Type;
              return (
                <button
                  key={t.key || t.type}
                  className="type-picker-item"
                  onClick={() => onPick(t)}
                >
                  <span className="ic"><I size={15} /></span>
                  <span>
                    <div className="nm">{t.label}</div>
                    <div className="ds">{t.desc}</div>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {groups.length === 0 && (
        <div style={{ padding: 14, fontSize: 12, color: "var(--ink-3)" }}>No simple fields found.</div>
      )}
    </div>
  );
}

Object.assign(window, { FieldEditor, FieldCard, RecommendedFieldsModal, ConfirmDeleteModal, STEP_PRESETS });



// ---------- Venue Editor (admin) ----------
// Replaces FieldEditor when step.stepType === "venue"

function VenueGalleryModal({ images, onAdd, onRemove, onClose }) {
  const Ic = window.Icons;
  return (
    <div className="gallery-modal-overlay" onClick={onClose}>
      <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3>Venue Gallery</h3>
          <button className="btn icon sm ghost" onClick={onClose}><Ic.Close size={16} /></button>
        </div>
        <div className="gallery-grid">
          {images.map((img, i) => (
            <div key={i} className="gallery-item">
              <img src={img} alt={"Gallery " + (i + 1)} />
              <button className="remove" onClick={() => requestDeleteConfirmation({
                action: "remove",
                itemType: "image",
                itemName: `Image ${i + 1}`,
                confirmLabel: "Remove",
                onConfirm: () => onRemove(i),
              })}>×</button>
            </div>
          ))}
        </div>
        <div className="upload-wrap">
          <input type="file" accept="image/*" multiple onChange={(e) => {
            readFilesAsDataUrls(e.target.files).then((urls) => {
              if (urls.length) onAdd(urls);
            });
            e.target.value = "";
          }} />
          <div className="upload">
            <Ic.Img size={16} />
            <span><b>Upload images</b> · drag or click</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function escapeHtmlText(value = "") {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function looksLikeHtml(value = "") {
  return /<\/?[a-z][\s\S]*>/i.test(String(value || ""));
}

function richTextDisplayHtml(value = "", { listFallback = false } = {}) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (looksLikeHtml(text)) return text;
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  if (listFallback && lines.length > 0) {
    return `<ul>${lines.map((line) => `<li>${escapeHtmlText(line)}</li>`).join("")}</ul>`;
  }
  return escapeHtmlText(text).replace(/\n/g, "<br>");
}

function RichTextEditor({ value = "", onChange, placeholder = "", rows = 4 }) {
  const Ic = window.Icons;
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || "")) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);
  const run = (command) => {
    document.execCommand(command, false, null);
    ref.current?.focus();
    onChange(ref.current?.innerHTML || "");
  };
  const onInput = () => onChange(ref.current?.innerHTML || "");
  return (
    <div className="rich-editor">
      <div className="rich-editor-toolbar" onMouseDown={(e) => e.preventDefault()}>
        <button type="button" title="Bold" onClick={() => run("bold")}><b>B</b></button>
        <button type="button" title="Italic" onClick={() => run("italic")}><i>I</i></button>
        <button type="button" title="Underline" onClick={() => run("underline")}><u>U</u></button>
        <button type="button" title="Bulleted list" onClick={() => run("insertUnorderedList")}><Ic.List size={14} /></button>
        <button type="button" title="Numbered list" onClick={() => run("insertOrderedList")}>1.</button>
        <button type="button" title="Clear formatting" onClick={() => run("removeFormat")}>Clear</button>
      </div>
      <div
        ref={ref}
        className="rich-editor-input"
        contentEditable
        data-placeholder={placeholder}
        onInput={onInput}
        onBlur={onInput}
        style={{ minHeight: rows * 24 }}
        suppressContentEditableWarning
      />
    </div>
  );
}

function RichTextDisplay({ value = "", listFallback = false, className = "" }) {
  const html = richTextDisplayHtml(value, { listFallback });
  if (!html) return null;
  return <div className={className || "rich-text-display"} dangerouslySetInnerHTML={{ __html: html }} />;
}

function VenueCard({ venue, onUpdate, onDelete }) {
  const Ic = window.Icons;
  const [open, setOpen] = React.useState(false);
  const [advOpen, setAdvOpen] = React.useState(false);
  const [galleryOpen, setGalleryOpen] = React.useState(false);
  const [subGalleryIdx, setSubGalleryIdx] = React.useState(null);
  const set = (patch) => onUpdate({ ...venue, ...patch });
  const setAdv = (patch) => set({ advancedPricing: { ...venue.advancedPricing, ...patch } });
  const setSub = (patch) => set({ subSpace: { ...venue.subSpace, ...patch } });
  const autoSwitchBestPricing = venue.advancedPricing?.autoSwitchBestPricing !== false;
  const setHours = (day, val) => {
    const h = { ...(venue.advancedPricing.bookingHours || {}) };
    h[day] = val;
    setAdv({ bookingHours: h });
  };

  const addPricing = () => set({ pricing: [...venue.pricing, { id: "pp_" + Date.now(), rateType: "per_hour", basePrice: 0, includedHours: 1, extraHourRate: 0 }] });
  const updatePricing = (i, patch) => { const p = [...venue.pricing]; p[i] = { ...p[i], ...patch }; set({ pricing: p }); };
  const removePricing = (i) => requestDeleteConfirmation({
    action: "remove",
    itemType: "pricing plan",
    itemName: `Pricing plan ${i + 1}`,
    confirmLabel: "Remove",
    onConfirm: () => set({ pricing: venue.pricing.filter((_, j) => j !== i) }),
  });

  const addSubOpt = () => setSub({ options: [...(venue.subSpace.options || []), { id: "ss_" + Date.now(), name: "", price: 0, description: "", thumbnail: null, gallery: [] }] });
  const updateSubOpt = (i, patch) => { const o = [...venue.subSpace.options]; o[i] = { ...o[i], ...patch }; setSub({ options: o }); };
  const removeSubOpt = (i) => requestDeleteConfirmation({
    action: "remove",
    itemType: "sub-space option",
    itemName: venue.subSpace.options?.[i]?.name || `Sub-space option ${i + 1}`,
    confirmLabel: "Remove",
    onConfirm: () => setSub({ options: venue.subSpace.options.filter((_, j) => j !== i) }),
  });

  const DAYS = ["mon","tue","wed","thu","fri","sat","sun"];
  const DAY_LABELS = { mon:"Mon", tue:"Tu", wed:"We", thu:"Th", fri:"Fr", sat:"Sa", sun:"Sun" };
  const bh = venue.advancedPricing.bookingHours || {};

  return (
    <div className="venue-card">
      <div className="venue-card-head" onClick={() => setOpen(!open)}>
        <span className="venue-card-name">{venue.name || "Untitled Venue"}</span>
        <span className={"venue-tag " + (venue.active ? "active" : "inactive")}>{venue.active ? "Active" : "Inactive"}</span>
        <span className={"venue-tag " + (venue.visibility === "admin_only" ? "admin" : "user")}>{venue.visibility === "admin_only" ? "Admin only" : "Admin & User"}</span>
        <div className="venue-card-actions" onClick={(e) => e.stopPropagation()}>
          <button className="btn icon sm danger-ghost" title="Delete venue" onClick={onDelete}><Ic.Trash size={13} /></button>
          <button className="btn icon sm ghost" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}>
            <Ic.Chevron size={13} />
          </button>
        </div>
      </div>

      {open && (
        <div className="venue-card-body">
          <div className="venue-grid-2">
            {/* Thumbnail */}
            <div>
              <label className="lbl">Venue Thumbnail</label>
              <div className="venue-thumb-wrap">
                {venue.thumbnail ? <img src={venue.thumbnail} alt={venue.name} /> : (
                  <span className="upload-label"><Ic.Img size={20} /><span>Upload</span></span>
                )}
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => set({ thumbnail: ev.target.result });
                  reader.readAsDataURL(file);
                  e.target.value = "";
                }} />
              </div>
            </div>
            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label className="lbl">Venue Name</label>
                <input className="input" value={venue.name} onChange={(e) => set({ name: e.target.value })} />
              </div>
              <div>
                <label className="lbl">Active Status</label>
                <label className="chk" style={{ marginTop: 4 }}>
                  <input type="checkbox" checked={venue.active} onChange={(e) => set({ active: e.target.checked })} />
                  Allow this venue to be booked
                </label>
              </div>
              <div>
                <label className="lbl">Visible to User</label>
                <select className="select" value={venue.visibility} onChange={(e) => set({ visibility: e.target.value })}>
                  <option value="admin_and_user">Admin and User</option>
                  <option value="admin_only">Admin only</option>
                </select>
              </div>
              <div>
                <label className="lbl">Venue Gallery</label>
                <button className="btn sm" onClick={() => setGalleryOpen(true)}>
                  <Ic.Img size={12} /> {(venue.gallery || []).length} images · Manage
                </button>
              </div>
            </div>
          </div>

          {/* Description + Equipped */}
          <div className="venue-grid-2">
            <div>
              <label className="lbl">Marketing Description</label>
              <RichTextEditor
                rows={4}
                value={venue.description || ""}
                onChange={(description) => set({ description })}
                placeholder="Brief description of the venue. Highlight the spaces, atmosphere, size, and what makes it ideal for events."
              />
            </div>
            <div>
              <label className="lbl">Equipped with <span className="hint">(one per line)</span></label>
              <RichTextEditor
                rows={4}
                value={venue.equippedWith || ""}
                onChange={(equippedWith) => set({ equippedWith })}
                placeholder="List what is included with the venue (e.g., chairs, stage, sound system). Enter one item per line."
              />
            </div>
          </div>

          {/* By Request + Max Capacity */}
          <div className="venue-grid-2">
            <div>
              <label className="lbl">By Request <span className="hint">(one per line)</span></label>
              <RichTextEditor
                rows={4}
                value={venue.byRequest || ""}
                onChange={(byRequest) => set({ byRequest })}
                placeholder="List items or services available upon request. Enter one item per line."
              />
            </div>
            <div>
              <label className="lbl">Recommended Max Capacity <span className="hint">(one per line)</span></label>
              <RichTextEditor
                rows={4}
                value={venue.maxCapacity || ""}
                onChange={(maxCapacity) => set({ maxCapacity })}
                placeholder="Enter the recommended maximum capacity for different seating layouts (e.g., Round Tables - 70 people)."
              />
            </div>
          </div>

          {/* Recommendation Settings */}
          <div className="venue-grid-2" style={{ marginTop: 0 }}>
            <div>
              <label className="lbl">Venue Capacity <span className="hint">(used for recommendation)</span></label>
              <input className="input" type="number" min={0} value={venue.venueCapacity || 0} onChange={(e) => set({ venueCapacity: Number(e.target.value) })} placeholder="Max number of people" />
              <p style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 3 }}>The maximum number of people this venue can accommodate. Used for matching attendee count to the right venue.</p>
            </div>
            <div>
              <label className="lbl">Suitable Event Types <span className="hint">(used for recommendation)</span></label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
                {["Business / Board Meeting","Conference","Workshop / Training","Lecture / Theater / Movie","Social Event with dancing / Party","Social Event without dancing / Banquet","Reception / Cocktail Party","Wedding & Reception","Ceremony / Graduation","Memorial / End of Life Celebration","Festival / Market / Show"].map((et) => {
                  const sel = (venue.suitableEventTypes || []).includes(et);
                  return (
                    <button key={et} className="btn sm" style={{ fontSize: 10, padding: "3px 8px", borderRadius: 12, background: sel ? "var(--accent)" : "var(--surface-2)", color: sel ? "#fff" : "var(--ink-2)", border: sel ? "1px solid var(--accent)" : "1px solid var(--line)" }}
                      onClick={() => set({ suitableEventTypes: sel ? (venue.suitableEventTypes || []).filter((x) => x !== et) : [...(venue.suitableEventTypes || []), et] })}>
                      {et}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 3 }}>Select which event types are appropriate for this venue. Used to recommend the best venue to clients.</p>
            </div>
          </div>

          {/* Pricing plans */}
          <div className="venue-section">
            <div className="venue-section-head">
              <h4>Pricing Plan</h4>
              <button className="btn sm" onClick={addPricing}><Ic.Plus size={11} /> Add Pricing</button>
            </div>
            <label className="chk" style={{ margin: "0 0 12px", alignItems: "flex-start" }}>
              <input type="checkbox" checked={autoSwitchBestPricing} onChange={(e) => setAdv({ autoSwitchBestPricing: e.target.checked })} />
              <span>
                Automatically switch customer to the lowest-priced pricing plan based on booking duration
                <span style={{ display: "block", fontSize: 10.5, color: "var(--ink-4)", marginTop: 2 }}>
                  Compares rental subtotal only. Setup, cleanup, deposits, taxes, and add-ons are added afterward.
                </span>
              </span>
            </label>
            {venue.pricing.map((p, i) => (
              <div key={p.id} className="pricing-row">
                <div>
                  <label className="lbl" style={{ fontSize: 10 }}>Rate Type</label>
                  <select className="select" value={p.rateType} onChange={(e) => updatePricing(i, { rateType: e.target.value })}>
                    <option value="per_hour">Per hour</option>
                    <option value="per_day">Per day</option>
                    <option value="flat">Flat rate</option>
                  </select>
                </div>
                <div>
                  <label className="lbl" style={{ fontSize: 10 }}>{p.rateType === "per_hour" ? "Minimum/Base Price ($)" : "Plan Price ($)"}</label>
                  <input className="input" type="number" min="0" step="0.01" value={p.basePrice || ""} onChange={(e) => updatePricing(i, { basePrice: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="lbl" style={{ fontSize: 10 }}>Minimum Booking Hours</label>
                  <input className="input" type="number" value={p.includedHours} onChange={(e) => updatePricing(i, { includedHours: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="lbl" style={{ fontSize: 10 }}>Extra Hour Rate ($)</label>
                  <input className="input" type="number" min="0" step="0.01" value={p.extraHourRate || ""} onChange={(e) => updatePricing(i, { extraHourRate: Number(e.target.value) })} />
                </div>
                <button className="btn icon sm danger-ghost" style={{ marginTop: 14 }} onClick={() => removePricing(i)}><Ic.Close size={12} /></button>
              </div>
            ))}
          </div>

          {/* Advanced pricing */}
          <div className="adv" style={{ marginTop: 14 }}>
            <div className="adv-head" onClick={() => setAdvOpen(!advOpen)}>
              <span>Advanced Pricing Settings</span>
              <Ic.Chevron size={13} style={{ transform: advOpen ? "rotate(180deg)" : "none", transition: "transform .15s", color: "var(--ink-3)" }} />
            </div>
            {advOpen && (
              <div className="adv-body adv-pricing">
                <div className="adv-pricing-grid">
                  <div><label className="lbl">Set Up Fee ($)</label><input className="input" type="number" min="0" step="0.01" value={venue.advancedPricing.setupFee || ""} onChange={(e) => setAdv({ setupFee: Number(e.target.value) })} /></div>
                  <div><label className="lbl">Clean Up Fee ($)</label><input className="input" type="number" min="0" step="0.01" value={venue.advancedPricing.cleanupFee || ""} onChange={(e) => setAdv({ cleanupFee: Number(e.target.value) })} /></div>
                  <div><label className="lbl">Security Deposit ($)</label><input className="input" type="number" min="0" step="0.01" value={venue.advancedPricing.securityDeposit || ""} onChange={(e) => setAdv({ securityDeposit: Number(e.target.value) })} /></div>
                </div>

                {/* Discount Eligibility */}
                <div style={{ marginTop: 12 }}>
                  <label className="lbl">Discount Eligibility</label>
                  <label className="chk" style={{ marginTop: 4 }}>
                    <input type="checkbox" checked={!!venue.advancedPricing.discountEligible} onChange={(e) => setAdv({ discountEligible: e.target.checked })} />
                    Eligible for discount
                  </label>
                </div>

                {/* Booking Hours */}
                <div style={{ marginTop: 12 }}>
                  <label className="lbl">Booking Hours</label>
                  <p style={{ fontSize: 10.5, color: "var(--ink-4)", margin: "2px 0 8px", fontStyle: "italic" }}>Set available booking windows per day. Leave blank for closed.</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                    {DAYS.map((d) => {
                      const val = bh[d] || "";
                      const parts = val.split("-");
                      const startH = parts[0] || "";
                      const endH = parts[1] || "";
                      return (
                        <div key={d} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: "var(--ink-2)" }}>{DAY_LABELS[d]}</div>
                          <input className="input" type="time" style={{ fontSize: 11, padding: "4px 2px", textAlign: "center" }} value={startH} onChange={(e) => setHours(d, e.target.value + "-" + endH)} />
                          <input className="input" type="time" style={{ fontSize: 11, padding: "4px 2px", textAlign: "center", marginTop: 4 }} value={endH} onChange={(e) => setHours(d, startH + "-" + e.target.value)} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Payment & Deposit Rules */}
                <div style={{ marginTop: 12 }}>
                  <label className="lbl">Payment & Deposit Rules</label>
                  <div style={{ marginTop: 6 }}>
                    <label className="lbl" style={{ fontSize: 10 }}>To hold the date</label>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input className="input" type="number" style={{ width: 60 }} value={venue.advancedPricing.holdAmount || 50} onChange={(e) => setAdv({ holdAmount: Number(e.target.value) })} />
                      <select className="select" style={{ width: 120 }} value={venue.advancedPricing.holdType || "percentage"} onChange={(e) => setAdv({ holdType: e.target.value })}>
                        <option value="percentage">Percentage %</option>
                        <option value="fixed">Fixed $</option>
                      </select>
                      <span style={{ fontSize: 12, color: "var(--ink-3)" }}>due upfront</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <label className="lbl" style={{ fontSize: 10 }}>Final Payment</label>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                      <input className="input" type="number" style={{ width: 60 }} value={venue.advancedPricing.finalAmount || 50} onChange={(e) => setAdv({ finalAmount: Number(e.target.value) })} />
                      <select className="select" style={{ width: 120 }} value={venue.advancedPricing.finalType || "percentage"} onChange={(e) => setAdv({ finalType: e.target.value })}>
                        <option value="percentage">Percentage %</option>
                        <option value="fixed">Fixed $</option>
                      </select>
                      <span style={{ fontSize: 12, color: "var(--ink-3)" }}>payment due</span>
                      <input className="input" type="number" style={{ width: 50 }} value={venue.advancedPricing.finalDaysBefore || 7} onChange={(e) => setAdv({ finalDaysBefore: Number(e.target.value) })} />
                      <span style={{ fontSize: 12, color: "var(--ink-3)" }}>days before booking date</span>
                    </div>
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div style={{ marginTop: 12 }}>
                  <label className="lbl">Cancellation Policy</label>
                  <textarea className="textarea" rows={3} value={venue.advancedPricing.cancellationPolicy || ""} onChange={(e) => setAdv({ cancellationPolicy: e.target.value })} />
                </div>
              </div>
            )}
          </div>

          {/* Sub-space */}
          <div className="venue-section">
            <label className="chk" style={{ fontWeight: 600, fontSize: 13 }}>
              <input type="checkbox" checked={!!venue.subSpace.enabled} onChange={(e) => setSub({ enabled: e.target.checked })} />
              Optional Sub-Space
            </label>
            <p style={{ fontSize: 11.5, color: "var(--ink-3)", margin: "4px 0 0 22px", lineHeight: 1.5 }}>
              Add optional venue extensions here. These are additional spaces that can be attached to a venue booking so customers can select them as add-ons.
            </p>
            {venue.subSpace.enabled && (
              <div className="subspace-section" style={{ marginTop: 12 }}>
                <div className="venue-grid-2" style={{ marginBottom: 12 }}>
                  <div>
                    <label className="lbl">Sub-Space Header Title</label>
                    <input className="input" value={venue.subSpace.title || ""} onChange={(e) => setSub({ title: e.target.value })} />
                  </div>
                  <div>
                    <label className="lbl">Short Description</label>
                    <textarea className="textarea" rows={2} value={venue.subSpace.description || ""} onChange={(e) => setSub({ description: e.target.value })} />
                  </div>
                </div>
                <div className="venue-section-head">
                  <h4>Sub-Space Options</h4>
                  <button className="btn sm" onClick={addSubOpt}><Ic.Plus size={11} /> Add Options</button>
                </div>
                {(venue.subSpace.options || []).map((opt, i) => (
                  <div key={opt.id} className="subspace-option">
                    {/* Top row: thumbnail + fields side by side */}
                    <div style={{ display: "flex", gap: 14 }}>
                      <div style={{ flexShrink: 0 }}>
                        <label className="lbl">Sub-Space Thumbnail</label>
                        <div className="venue-thumb-wrap">
                          {opt.thumbnail ? <img src={opt.thumbnail} alt={opt.name} /> : (
                            <span className="upload-label"><Ic.Img size={16} /><span style={{ fontSize: 10 }}>Upload</span></span>
                          )}
                          <input type="file" accept="image/*" onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => updateSubOpt(i, { thumbnail: ev.target.result });
                            reader.readAsDataURL(file);
                            e.target.value = "";
                          }} />
                        </div>
                      </div>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <div style={{ flex: 1 }}><label className="lbl">Sub-Space Name</label><input className="input" value={opt.name} onChange={(e) => updateSubOpt(i, { name: e.target.value })} /></div>
                          <button className="btn icon sm danger-ghost" style={{ marginTop: 16 }} onClick={() => removeSubOpt(i)}><Ic.Close size={12} /></button>
                        </div>
                        <div><label className="lbl">Price ($)</label><input className="input" type="number" min="0" step="0.01" value={opt.price || ""} onChange={(e) => updateSubOpt(i, { price: Number(e.target.value) })} /></div>
                        <div>
                          <label className="lbl">Description / Capacity</label>
                          <RichTextEditor
                            rows={2}
                            value={opt.description || ""}
                            onChange={(description) => updateSubOpt(i, { description })}
                            placeholder="Describe this sub-space and its capacity."
                          />
                        </div>
                      </div>
                    </div>
                    {/* Gallery row */}
                    <div style={{ paddingTop: 8, borderTop: "1px solid var(--line)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <label className="lbl" style={{ margin: 0 }}>Venue Gallery</label>
                        {(opt.gallery || []).length > 0 && (
                          <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{opt.gallery.length} image{opt.gallery.length !== 1 ? "s" : ""}</span>
                        )}
                        <button className="btn sm" onClick={() => setSubGalleryIdx(i)}>
                          <Ic.Img size={11} /> Manage
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {galleryOpen && (
        <VenueGalleryModal
          images={venue.gallery || []}
          onAdd={(imgs) => set({ gallery: [...(venue.gallery || []), ...imgs] })}
          onRemove={(i) => set({ gallery: (venue.gallery || []).filter((_, j) => j !== i) })}
          onClose={() => setGalleryOpen(false)}
        />
      )}

      {subGalleryIdx != null && venue.subSpace.options[subGalleryIdx] && (
        <VenueGalleryModal
          images={venue.subSpace.options[subGalleryIdx].gallery || []}
          onAdd={(imgs) => {
            const opts = [...venue.subSpace.options];
            opts[subGalleryIdx] = { ...opts[subGalleryIdx], gallery: [...(opts[subGalleryIdx].gallery || []), ...imgs] };
            setSub({ options: opts });
          }}
          onRemove={(gi) => {
            const opts = [...venue.subSpace.options];
            opts[subGalleryIdx] = { ...opts[subGalleryIdx], gallery: opts[subGalleryIdx].gallery.filter((_, j) => j !== gi) };
            setSub({ options: opts });
          }}
          onClose={() => setSubGalleryIdx(null)}
        />
      )}
    </div>
  );
}

function VenueEditor({ step, onUpdateStep, onAddField, onDeleteField, onUpdateField, openFieldId, onToggleField, allSteps, onReorderFields, onDeleteStep }) {
  const Ic = window.Icons;
  const [filter, setFilter] = React.useState("all");
  const [editingHead, setEditingHead] = React.useState(false);
  const [headDraft, setHeadDraft] = React.useState({ name: "", description: "" });
  const [pickerOpen, setPickerOpen] = React.useState(false);

  React.useEffect(() => {
    if (!editingHead && step) setHeadDraft({ name: step.name, description: step.description || "" });
  }, [step?.id, editingHead]);

  const venues = step.venues || [];
  const setVenues = (next) => onUpdateStep({ ...step, venues: next });
  const fieldDnd = window.useReorderable({
    items: step.fields || [],
    onReorder: (next) => onReorderFields ? onReorderFields(next) : onUpdateStep({ ...step, fields: next }),
  });
  const addVenue = () => setVenues([...venues, {
    id: "v_" + Date.now(), name: "New Venue", active: true, visibility: "admin_and_user",
    thumbnail: null, gallery: [], venueCapacity: 0, suitableEventTypes: [],
    description: "", equippedWith: "", byRequest: "", maxCapacity: "",
    pricing: [{ id: "pp_" + Date.now(), rateType: "per_hour", basePrice: 0, includedHours: 1, extraHourRate: 0 }],
    advancedPricing: { setupFee: 0, cleanupFee: 0, securityDeposit: 0, bookingMinHours: 1, bookingMinUnit: "hours", discountEligible: false,
      autoSwitchBestPricing: true,
      bookingHours: { mon: "07:00-23:00", tue: "07:00-23:00", wed: "07:00-23:00", thu: "07:00-23:00", fri: "07:00-23:00", sat: "08:00-23:00", sun: "07:00-23:00" },
      holdAmount: 50, holdType: "percentage", finalAmount: 50, finalType: "percentage", finalDaysBefore: 7, cancellationPolicy: "" },
    subSpace: { enabled: false, title: "", description: "", options: [] },
  }]);
  const updateVenue = (id, next) => setVenues(venues.map((v) => v.id === id ? next : v));
  const deleteVenue = (id) => {
    const venue = venues.find((v) => v.id === id);
    requestDeleteConfirmation({
      itemType: "venue",
      itemName: venue?.name || "Untitled venue",
      onConfirm: () => setVenues(venues.filter((v) => v.id !== id)),
    });
  };
  const confirmDeleteField = (field) => requestDeleteConfirmation({
    itemType: "field",
    itemName: field.label || "Untitled field",
    onConfirm: () => onDeleteField(field.id),
  });

  const inactiveCount = venues.filter((v) => !v.active).length;
  const adminOnlyCount = venues.filter((v) => v.visibility === "admin_only").length;
  const filtered = filter === "all" ? venues : filter === "inactive" ? venues.filter((v) => !v.active) : venues.filter((v) => v.visibility === "admin_only");

  return (
    <div className="editor-col">
      <div className="editor-inner">
        <div className="editor-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="editor-head-tag">
              <Ic.Layers size={11} /> Step {(allSteps || window.SAMPLE_STEPS).findIndex(s => s.id === step.id) + 1}
            </span>
            {editingHead ? (
              <>
                <input className="input" style={{ fontSize: "var(--text-xl)", fontWeight: 600, marginBottom: 6, letterSpacing: "-0.02em" }} value={headDraft.name} autoFocus onChange={(e) => setHeadDraft({ ...headDraft, name: e.target.value })} />
                <textarea className="textarea" rows={2} value={headDraft.description} placeholder="Description shown above this step in the client view" onChange={(e) => setHeadDraft({ ...headDraft, description: e.target.value })} />
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button className="btn primary sm" onClick={() => { onUpdateStep({ ...step, name: headDraft.name.trim() || step.name, description: headDraft.description }); setEditingHead(false); }}>Save</button>
                  <button className="btn ghost sm" onClick={() => setEditingHead(false)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <h1>{step.name}</h1>
                <p>{step.description || <em style={{ color: "var(--ink-4)" }}>Add a description to give clients context for this step.</em>}</p>
              </>
            )}
          </div>
          {!editingHead && (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {onDeleteStep && (
                <button className="btn icon ghost danger-ghost" title="Delete step" onClick={onDeleteStep}>
                  <Ic.Trash size={14} />
                </button>
              )}
              <button className="btn icon ghost" title="Edit step info" onClick={() => setEditingHead(true)}>
                <Ic.Edit size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="section-bar">
          <h2>
            <Ic.List size={13} /> Components in this step
            <span className="count">{venues.length + (step.fields || []).length}</span>
          </h2>
          <div style={{ position: "relative", display: "flex", gap: 6, marginLeft: "auto", alignItems: "center" }}>
            {inactiveCount > 0 && (
              <button className={"venue-tag inactive" + (filter === "inactive" ? " active-filter" : "")} style={{ cursor: "pointer", border: filter === "inactive" ? "2px solid var(--danger)" : "1px solid transparent" }} onClick={() => setFilter(filter === "inactive" ? "all" : "inactive")}>
                Inactive
              </button>
            )}
            {adminOnlyCount > 0 && (
              <button className={"venue-tag admin" + (filter === "admin_only" ? " active-filter" : "")} style={{ cursor: "pointer", border: filter === "admin_only" ? "2px solid #7c5cbf" : "1px solid transparent" }} onClick={() => setFilter(filter === "admin_only" ? "all" : "admin_only")}>
                Admin only
              </button>
            )}
            <button className="btn ghost sm" onClick={addVenue}>
              <Ic.Building size={13} /> Add Venue
            </button>
            <button className="btn dark sm" onClick={() => setPickerOpen((o) => !o)}>
              <Ic.Plus size={13} /> Add field
            </button>
            {pickerOpen && (
              <FieldTypePicker
                onPick={(t) => { onAddField(t); setPickerOpen(false); }}
                onClose={() => setPickerOpen(false)}
              />
            )}
          </div>
        </div>

        <div className="venue-list">
          {filtered.map((v) => (
            <VenueCard
              key={v.id}
              venue={v}
              onUpdate={(next) => updateVenue(v.id, next)}
              onDelete={() => deleteVenue(v.id)}
            />
          ))}
        </div>

        {venues.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink-3)" }}>
            <p>No venues yet. Click <b>Add Venue</b> to get started.</p>
          </div>
        )}

        {/* Additional fields added via "Add field" */}
        {(step.fields || []).length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>Additional Fields</div>
            {(step.fields || []).map((f) => (
              <FieldCard
                key={f.id}
                field={f}
                allFields={step.fields || []}
                open={openFieldId === f.id}
                onToggle={() => onToggleField(f.id)}
	                onUpdate={(next) => onUpdateField(f.id, next)}
	                onDuplicate={() => {}}
	                onDelete={() => confirmDeleteField(f)}
	                sourceHandlers={fieldDnd.sourceHandlers(f)}
	                targetHandlers={fieldDnd.targetHandlers(f)}
	                isDragging={fieldDnd.isDragging(f.id)}
	                isOver={fieldDnd.isOver(f.id)}
	                overPosition={fieldDnd.overPosition(f.id)}
	              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

window.VenueEditor = VenueEditor;

// =========================================================================
// LAYOUT EDITOR  (stepType === "layout")
// =========================================================================
function LayoutEditor({ step, onUpdateStep, onAddField, onDeleteField, onUpdateField, openFieldId, onToggleField, allSteps, onReorderFields, onDeleteStep }) {
  const Ic = window.Icons;
  const [expandedLayout, setExpandedLayout] = React.useState(null);
  const [previewAsset, setPreviewAsset] = React.useState(null);
  const [editingSR, setEditingSR] = React.useState(null);
  const [showAddSR, setShowAddSR] = React.useState(false);
  const [newSRName, setNewSRName] = React.useState("");
  const [newSRIcon, setNewSRIcon] = React.useState("📦");
  const [showAddLayoutSpace, setShowAddLayoutSpace] = React.useState(false);
  const [editingLayoutSpace, setEditingLayoutSpace] = React.useState(null);
  const [newLayoutSpaceName, setNewLayoutSpaceName] = React.useState("");
  const [newLayoutSpaceVenueId, setNewLayoutSpaceVenueId] = React.useState("");
  const [editingHead, setEditingHead] = React.useState(false);
  const [headDraft, setHeadDraft] = React.useState({ name: "", description: "" });
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [rentalPickerOpen, setRentalPickerOpen] = React.useState(false);

  React.useEffect(() => {
    if (!editingHead && step) setHeadDraft({ name: step.name, description: step.description || "" });
  }, [step?.id, editingHead]);

  React.useEffect(() => {
    if (!previewAsset) return;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setPreviewAsset(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [previewAsset]);

  const venueStep = allSteps.find((s) => s.stepType === "venue");
  const allVenues = venueStep ? (venueStep.venues || []).filter((v) => v.active) : [];

  const spaceReqs = step.spaceRequirements || [];
  const floorLayouts = step.floorLayouts || {};
  const customLayoutSpaces = step.layoutSpaces || [];
  const layoutRentalRecommendationFields = layoutRecommendationFieldsForStep(step);
  const layoutRentalRecommendationFieldsForVenue = (venueId) => layoutRecommendationFieldsForStep(step, venueId);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const update = (patch) => onUpdateStep({ ...step, ...patch });
  const fieldDnd = window.useReorderable({
    items: step.fields || [],
    onReorder: (next) => onReorderFields ? onReorderFields(next) : update({ fields: next }),
  });
  const rentalGroupFields = (step.fields || []).filter((field) => field.type === "rental_group");
  const simpleLayoutFields = (step.fields || []).filter((field) => field.type !== "rental_group");

  // File upload → data URL (event handler version)
  const handleFileUpload = (callback) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => callback(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  // Programmatic file picker — avoids React.useRef inside map()
  const pickFile = (accept, callback) => {
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = accept || "image/*";
    inp.onchange = () => {
      const f = inp.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = (ev) => callback(ev.target.result);
      r.readAsDataURL(f);
    };
    inp.click();
  };
  const isPdfAsset = (src = "") => /^data:application\/pdf/i.test(src) || /\.pdf(?:$|[?#])/i.test(src);
  const openAssetPreview = (src, title) => {
    if (!src) return;
    setPreviewAsset({ src, title: title || "Floor layout preview", pdf: isPdfAsset(src) });
  };

  // Space Requirements
  const addSpaceReq = () => {
    if (!newSRName.trim()) return false;
    update({ spaceRequirements: [...spaceReqs, { id: "sr_" + uid(), name: newSRName.trim(), icon: newSRIcon, active: true }] });
    setNewSRName(""); setNewSRIcon("📦");
    return true;
  };
  const updateSpaceReq = (id, patch) => update({ spaceRequirements: spaceReqs.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  const deleteSpaceReq = (id) => {
    const req = spaceReqs.find((r) => r.id === id);
    requestDeleteConfirmation({
      itemType: "space requirement",
      itemName: req?.name || "Untitled space requirement",
      onConfirm: () => update({ spaceRequirements: spaceReqs.filter((r) => r.id !== id) }),
    });
  };
  const addRentalGroups = (groups) => {
    const newFields = (groups || []).map((preset) => ({ ...preset, id: "f_" + uid() }));
    if (newFields.length === 0) return;
    update({ fields: [...(step.fields || []), ...newFields] });
    setRentalPickerOpen(false);
    revealAddedAdminItem(newFields[0].id);
  };
  const baseLayoutAreas = allVenues.flatMap((venue) => [
    { id: venue.id, name: venue.name, venueId: venue.id, system: true },
    ...((venue.subSpace?.options || []).map((sub) => ({ id: sub.id, name: sub.name + " (" + venue.name + ")", venueId: venue.id, system: true }))),
  ]);
  const unorderedLayoutAreas = [
    ...baseLayoutAreas,
    ...customLayoutSpaces.map((space) => ({
      id: space.id,
      name: space.name || "Untitled space",
      venueId: space.venueId || allVenues[0]?.id || "",
      visibilityMode: space.visibilityMode || "always",
      system: false,
    })),
  ];
  const layoutAreaOrder = Array.isArray(step.layoutAreaOrder) ? step.layoutAreaOrder : [];
  const layoutAreaOrderMap = new Map(layoutAreaOrder.map((id, index) => [id, index]));
  const layoutAreas = unorderedLayoutAreas
    .map((area, index) => ({ ...area, _originalIndex: index }))
    .sort((a, b) => {
      const aOrder = layoutAreaOrderMap.has(a.id) ? layoutAreaOrderMap.get(a.id) : Number.MAX_SAFE_INTEGER;
      const bOrder = layoutAreaOrderMap.has(b.id) ? layoutAreaOrderMap.get(b.id) : Number.MAX_SAFE_INTEGER;
      return aOrder === bOrder ? a._originalIndex - b._originalIndex : aOrder - bOrder;
    })
    .map(({ _originalIndex, ...area }) => area);
  const layoutAreaDnd = window.useReorderable({
    items: layoutAreas,
    onReorder: (next) => update({ layoutAreaOrder: next.map((area) => area.id) }),
  });
  const addLayoutSpace = () => {
    const venueId = newLayoutSpaceVenueId || allVenues[0]?.id || "";
    if (!newLayoutSpaceName.trim() || !venueId) return;
    const id = "la_" + uid();
    update({
      layoutSpaces: [...customLayoutSpaces, { id, name: newLayoutSpaceName.trim(), venueId, visibilityMode: "always" }],
      layoutAreaOrder: [...layoutAreas.map((area) => area.id), id],
    });
    setNewLayoutSpaceName("");
    setNewLayoutSpaceVenueId(venueId);
    setShowAddLayoutSpace(false);
  };
  const updateLayoutSpace = (id, patch) => update({ layoutSpaces: customLayoutSpaces.map((space) => space.id === id ? { ...space, ...patch } : space) });
  const deleteLayoutSpace = (id) => {
    const space = customLayoutSpaces.find((item) => item.id === id);
    requestDeleteConfirmation({
      itemType: "layout space",
      itemName: space?.name || "Untitled layout space",
      onConfirm: () => update({
        layoutSpaces: customLayoutSpaces.filter((item) => item.id !== id),
        layoutAreaOrder: layoutAreas.map((area) => area.id).filter((areaId) => areaId !== id),
        floorLayouts: Object.fromEntries(Object.entries(floorLayouts).filter(([key]) => key !== id)),
      }),
    });
  };

  // Floor layouts
  const getVL = (vid) => ({ hasFloorLayoutPlan: true, layouts: [], blankFloorPlan: "", ...(floorLayouts[vid] || {}) });
  const setVL = (vid, patch) => { const c = getVL(vid); update({ floorLayouts: { ...floorLayouts, [vid]: { ...c, ...patch } } }); };
  const addFL = (vid) => {
    const nl = { id: "fl_" + uid(), name: "", image: "", capacityMin: 0, capacityMax: 0, applicableEventTypes: [], applicableSpaceReqs: [], recommendedFor: 0, recommendedDescription: "", rentalRecommendations: {} };
    setVL(vid, { layouts: [...getVL(vid).layouts, nl] }); setExpandedLayout(nl.id);
  };
  const setFL = (vid, lid, patch) => setVL(vid, { layouts: getVL(vid).layouts.map((l) => (l.id === lid ? { ...l, ...patch } : l)) });
  const setFLRentalCount = (areaId, recommendationVenueId, lid, key, value) => {
    const layout = getVL(areaId).layouts.find((l) => l.id === lid) || {};
    const fieldsForVenue = layoutRentalRecommendationFieldsForVenue(recommendationVenueId);
    setFL(areaId, lid, { rentalRecommendations: { ...getLayoutRentalRecommendations(layout, fieldsForVenue), [key]: Number(value || 0) } });
  };
  const delFL = (vid, lid) => {
    const layout = getVL(vid).layouts.find((item) => item.id === lid);
    requestDeleteConfirmation({
      itemType: "floor layout",
      itemName: layout?.name || "Untitled layout",
      onConfirm: () => setVL(vid, { layouts: getVL(vid).layouts.filter((l) => l.id !== lid) }),
    });
  };
  const removeBlankFloorPlan = (area) => requestDeleteConfirmation({
    action: "remove",
    itemType: "blank floor layout plan",
    itemName: area.name || "blank floor layout plan",
    confirmLabel: "Remove",
    onConfirm: () => setVL(area.id, { blankFloorPlan: "" }),
  });
  const confirmDeleteField = (field) => requestDeleteConfirmation({
    itemType: "field",
    itemName: field.label || "Untitled field",
    onConfirm: () => onDeleteField(field.id),
  });

  const BIZ_TYPES = ["Business / Board Meeting", "Conference", "Workshop / Training", "Other - Business and non-alcoholic events"];
  const SOCIAL_TYPES = ["Lecture / Theater / Movie", "Social Event with dancing / Party", "Social Event without dancing / Banquet", "Reception / Cocktail Party", "Wedding & Reception", "Ceremony / Graduation", "Memorial / End of Life Celebration", "Festival / Market / Show", "Other - Social and/or alcoholic events"];
  const ALL_TYPES = [...BIZ_TYPES, ...SOCIAL_TYPES];

  const toggleET = (vid, lid, et, current) => {
    const sel = (current || []).includes(et);
    setFL(vid, lid, { applicableEventTypes: sel ? current.filter((x) => x !== et) : [...(current || []), et] });
  };
  const toggleSR = (vid, lid, sr, current) => {
    const sel = (current || []).includes(sr);
    setFL(vid, lid, { applicableSpaceReqs: sel ? current.filter((x) => x !== sr) : [...(current || []), sr] });
  };

  // Dropdown multi-select checkbox component
  const MultiSelectDropdown = ({ options, selected, onToggle, onSelectAll, placeholder }) => {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef(null);
    React.useEffect(() => {
      if (!open) return;
      const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
      document.addEventListener("mousedown", h);
      return () => document.removeEventListener("mousedown", h);
    }, [open]);
    const count = (selected || []).filter((s) => options.some((o) => !o.isHeader && o.value === s)).length;
    return (
      <div ref={ref} style={{ position: "relative" }}>
        <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 12, cursor: "pointer", background: "#fff", minHeight: 34, userSelect: "none" }}>
          <span style={{ color: count > 0 ? "var(--ink)" : "var(--ink-4)" }}>{count > 0 ? count + " selected" : (placeholder || "Select...")}</span>
          <span style={{ fontSize: 10, color: "var(--ink-4)", transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}>▾</span>
        </div>
        {open && (
          <div style={{ position: "fixed", left: ref.current ? ref.current.getBoundingClientRect().left : 0, top: ref.current ? ref.current.getBoundingClientRect().bottom + 2 : 0, width: ref.current ? ref.current.getBoundingClientRect().width : 240, zIndex: 9999, background: "#fff", border: "1px solid var(--line)", borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,.15)", maxHeight: 280, overflowY: "auto" }}>
            {onSelectAll && (
              <div onClick={onSelectAll} style={{ padding: "6px 10px", fontSize: 11, color: "var(--accent)", cursor: "pointer", borderBottom: "1px solid var(--line)", fontWeight: 600, position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>Select All</div>
            )}
            {options.map((opt, i) =>
              opt.isHeader ? (
                <div key={"h_" + i} style={{ padding: "6px 10px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-3)", background: "var(--surface-2)", letterSpacing: ".04em", position: "sticky", top: onSelectAll ? 28 : 0, zIndex: 1 }}>{opt.label}</div>
              ) : (
                <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer" }} onClick={(e) => { e.preventDefault(); onToggle(opt.value); }}>
                  <input type="checkbox" readOnly checked={(selected || []).includes(opt.value)} style={{ accentColor: "var(--accent)", pointerEvents: "none" }} />
                  {opt.label}
                </label>
              )
            )}
          </div>
        )}
      </div>
    );
  };

  const eventTypeOptions = [
    { isHeader: true, label: "Business" },
    ...BIZ_TYPES.map((t) => ({ value: t, label: t })),
    { isHeader: true, label: "Social" },
    ...SOCIAL_TYPES.map((t) => ({ value: t, label: t })),
  ];
  const spaceReqOptions = spaceReqs.filter((r) => r.name).map((r) => ({ value: r.id, label: (r.icon || "") + " " + r.name }));

  // Render a single layout card (expanded)
  const renderLayoutCard = (venue, layout) => {
    const recommendationVenueId = venue.venueId || venue.id;
    const availableRecommendationFields = layoutRentalRecommendationFieldsForVenue(recommendationVenueId);
    const counts = getLayoutRentalRecommendations(layout, availableRecommendationFields);
    return (
      <div className="layout-card-body">
        <div className="venue-grid-2">
          <div>
            <label className="lbl" style={{ textTransform: "uppercase", fontSize: 10, letterSpacing: ".05em" }}>Floor Layout Name</label>
            <input className="input" value={layout.name} placeholder="Enter the name of the floor layout." onChange={(e) => setFL(venue.id, layout.id, { name: e.target.value })} />
          </div>
          <div>
            <label className="lbl" style={{ textTransform: "uppercase", fontSize: 10, letterSpacing: ".05em" }}>Floor Layout Image</label>
            <div className="layout-image-shell">
              <button
                type="button"
                className="layout-image-preview-button"
                onClick={() => layout.image
                  ? openAssetPreview(layout.image, layout.name || `${venue.name} floor layout`)
                  : pickFile("image/*", (dataUrl) => setFL(venue.id, layout.id, { image: dataUrl }))}
                title={layout.image ? "Open large preview" : "Upload floor layout image"}
              >
                {layout.image ? (
                  <React.Fragment>
                    <img src={layout.image} alt={`${layout.name || venue.name} floor layout`} />
                    <span className="layout-image-preview-hint">Click to preview</span>
                  </React.Fragment>
                ) : (
                  <span>Click to upload image</span>
                )}
              </button>
              {layout.image && (
                <button
                  type="button"
                  className="layout-image-change"
                  onClick={() => pickFile("image/*", (dataUrl) => setFL(venue.id, layout.id, { image: dataUrl }))}
                >Change</button>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <label className="lbl" style={{ textTransform: "uppercase", fontSize: 10, letterSpacing: ".05em" }}>Capacity Range (Guests)</label>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input className="input" type="number" min={0} value={layout.capacityMin || 0} style={{ width: 80 }} onChange={(e) => setFL(venue.id, layout.id, { capacityMin: Number(e.target.value) })} />
            <span style={{ fontSize: 12, color: "var(--ink-3)" }}>to</span>
            <input className="input" type="number" min={0} value={layout.capacityMax || 0} style={{ width: 80 }} onChange={(e) => setFL(venue.id, layout.id, { capacityMax: Number(e.target.value) })} />
            <span style={{ fontSize: 11, color: "var(--ink-4)" }}>guests</span>
          </div>
        </div>

        <div className="venue-grid-2" style={{ marginTop: 10 }}>
          <div>
            <label className="lbl" style={{ textTransform: "uppercase", fontSize: 10, letterSpacing: ".05em" }}>Applicable Event Types</label>
            <MultiSelectDropdown
              options={eventTypeOptions}
              selected={layout.applicableEventTypes || []}
              onToggle={(et) => toggleET(venue.id, layout.id, et, layout.applicableEventTypes)}
              onSelectAll={() => setFL(venue.id, layout.id, { applicableEventTypes: [...ALL_TYPES] })}
              placeholder="Select event types..."
            />
          </div>
          <div>
            <label className="lbl" style={{ textTransform: "uppercase", fontSize: 10, letterSpacing: ".05em" }}>Applicable Space Requirements</label>
            <MultiSelectDropdown
              options={spaceReqOptions}
              selected={layout.applicableSpaceReqs || []}
              onToggle={(sr) => toggleSR(venue.id, layout.id, sr, layout.applicableSpaceReqs)}
              onSelectAll={() => setFL(venue.id, layout.id, { applicableSpaceReqs: spaceReqs.map((r) => r.id) })}
              placeholder="Select space requirements..."
            />
          </div>
        </div>

        <div style={{ marginTop: 12, padding: 10, background: "var(--accent-soft)", border: "1px solid var(--accent-line)", borderRadius: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: 13 }}>Recommended for</span>
            <input className="input" type="number" min={0} value={layout.recommendedFor || 0} style={{ width: 60, textAlign: "center" }} onChange={(e) => setFL(venue.id, layout.id, { recommendedFor: Number(e.target.value) })} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>people</span>
          </div>
          <div style={{ marginBottom: 8, padding: 9, background: "#fff", border: "1px solid var(--line)", borderRadius: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-3)", marginBottom: 8 }}>Included rental counts</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
              {availableRecommendationFields.map((field) => {
                return (
                  <div key={field.key}>
                    <label className="lbl" style={{ fontSize: 10, lineHeight: 1.2, minHeight: 24 }}>{field.label}</label>
                    <input className="input" type="number" min={0} value={counts[field.key] || 0} onChange={(e) => setFLRentalCount(venue.id, recommendationVenueId, layout.id, field.key, e.target.value)} />
                  </div>
                );
              })}
            </div>
            {availableRecommendationFields.length === 0 && (
              <div className="rental-muted">No connected rental items are enabled for this venue. Open Rentals, check this venue under Venue Availability, and turn on “Use in layout recommendations” for the items that should appear here.</div>
            )}
            <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 6 }}>These numbers come from actual rental items connected to this step.</div>
          </div>
          <textarea className="input" rows={4} value={layout.recommendedDescription || ""} placeholder={"Enter a recommendation setup with number of tables, chairs to be rented. (e.g.)\n- 3 Rectangular 6' Tables\n- 5 Rectangular 8' Tables\n70 Rust Chairs"} style={{ width: "100%", fontSize: 12, lineHeight: 1.5 }} onChange={(e) => setFL(venue.id, layout.id, { recommendedDescription: e.target.value })} />
        </div>
      </div>
    );
  };

  return (
    <div className="editor-col">
      <div className="editor-inner">
        <div className="editor-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="editor-head-tag">
              <Ic.Layers size={11} /> Step {allSteps.findIndex(s => s.id === step.id) + 1}
            </span>
            {editingHead ? (
              <>
                <input className="input" style={{ fontSize: "var(--text-xl)", fontWeight: 600, marginBottom: 6, letterSpacing: "-0.02em" }} value={headDraft.name} autoFocus onChange={(e) => setHeadDraft({ ...headDraft, name: e.target.value })} />
                <textarea className="textarea" rows={2} value={headDraft.description} placeholder="Description shown above this step in the client view" onChange={(e) => setHeadDraft({ ...headDraft, description: e.target.value })} />
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button className="btn primary sm" onClick={() => { update({ name: headDraft.name.trim() || step.name, description: headDraft.description }); setEditingHead(false); }}>Save</button>
                  <button className="btn ghost sm" onClick={() => setEditingHead(false)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <h1>{step.name}</h1>
                <p>{step.description || <em style={{ color: "var(--ink-4)" }}>Add a description to give clients context for this step.</em>}</p>
              </>
            )}
          </div>
          {!editingHead && (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {onDeleteStep && (
                <button className="btn icon ghost danger-ghost" title="Delete step" onClick={onDeleteStep}>
                  <Ic.Trash size={14} />
                </button>
              )}
              <button className="btn icon ghost" title="Edit step info" onClick={() => setEditingHead(true)}>
                <Ic.Edit size={14} />
              </button>
            </div>
          )}
        </div>

      {/* ========== SPACE REQUIREMENTS ========== */}
      <div className="layout-admin-panel">
        <div className="layout-admin-head">
          <h3>Space Requirements</h3>
          <button className="btn dark sm" onClick={() => { setNewSRName(""); setNewSRIcon("📦"); setShowAddSR(true); }}>+ Add Space Requirement</button>
        </div>
        <div className="layout-admin-checks">
          <label>
            <input type="checkbox" checked={step.srRequired || false} onChange={() => update({ srRequired: !step.srRequired })} /> Required <span style={{ color: "#e53e3e", fontWeight: 700 }}>*</span>
          </label>
          <label>
            <input type="checkbox" checked={step.srAdminRequired || false} onChange={() => update({ srAdminRequired: !step.srAdminRequired })} /> Admin Required <span style={{ color: "#e53e3e", fontWeight: 700 }}>*</span>
          </label>
        </div>

        {spaceReqs.map((sr) => {
          const isEditing = editingSR === sr.id;
          return (
            <div key={sr.id} className={"layout-req-row" + (isEditing ? " editing" : "")}>
              {isEditing ? (
                <React.Fragment>
                  {/* Icon — emoji or image */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    {sr.iconType === "image" && sr.icon && sr.icon.startsWith("data:") ? (
                      <img src={sr.icon} style={{ width: 30, height: 30, objectFit: "contain", borderRadius: 4, border: "1px solid var(--line)", cursor: "pointer" }} onClick={() => pickFile("image/*", (dataUrl) => updateSpaceReq(sr.id, { icon: dataUrl, iconType: "image" }))} title="Click to change" />
                    ) : (
                      <input className="input" value={sr.icon || ""} onChange={(e) => updateSpaceReq(sr.id, { icon: e.target.value, iconType: "emoji" })} style={{ width: 38, height: 30, textAlign: "center", fontSize: 16, padding: 0 }} title="Type an emoji" />
                    )}
                    <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                      <button className="btn sm" style={{ fontSize: 8, padding: "1px 4px", background: sr.iconType !== "image" ? "var(--ink)" : "var(--surface-3)", color: sr.iconType !== "image" ? "#fff" : "var(--ink-3)", borderRadius: 3, border: "none", cursor: "pointer" }} onClick={() => updateSpaceReq(sr.id, { iconType: "emoji" })}>Emoji</button>
                      <button className="btn sm" style={{ fontSize: 8, padding: "1px 4px", background: sr.iconType === "image" ? "var(--ink)" : "var(--surface-3)", color: sr.iconType === "image" ? "#fff" : "var(--ink-3)", borderRadius: 3, border: "none", cursor: "pointer" }} onClick={() => pickFile("image/*", (dataUrl) => updateSpaceReq(sr.id, { icon: dataUrl, iconType: "image" }))}>Image</button>
                    </div>
                  </div>
                  <input className="input" value={sr.name} placeholder="Space requirement name" style={{ flex: 1, fontSize: 13 }} onChange={(e) => updateSpaceReq(sr.id, { name: e.target.value })} autoFocus />
                  <button className="btn sm" style={{ fontSize: 11, padding: "4px 10px", background: "var(--ink)", color: "#fff", borderRadius: 4, border: "none", cursor: "pointer" }} onClick={() => setEditingSR(null)}>Done</button>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {sr.iconType === "image" && sr.icon && sr.icon.startsWith("data:") ? (
                    <span className="layout-req-icon"><img src={sr.icon} /></span>
                  ) : (
                    <span className="layout-req-icon">{sr.icon}</span>
                  )}
                  <span className="layout-req-name">{sr.name || "Untitled"}</span>
                  <button className="btn icon sm ghost" title="Edit" onClick={() => setEditingSR(sr.id)}><Ic.Edit size={13} /></button>
                  <button className="btn icon sm ghost" style={{ color: "var(--danger)" }} title="Delete" onClick={() => deleteSpaceReq(sr.id)}>✕</button>
                </React.Fragment>
              )}
            </div>
          );
        })}

        {/* Add new space requirement form — toggled by button */}
        {showAddSR && (
          <div className="layout-add-row">
            <div style={{ display: "flex", gap: 10, alignItems: "end" }}>
              <div style={{ flex: 1 }}>
                <label className="lbl" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".04em" }}>Name</label>
                <input className="input" value={newSRName} onChange={(e) => setNewSRName(e.target.value)} placeholder="Enter the name of the space requirement" style={{ width: "100%" }} onKeyDown={(e) => { if (e.key === "Enter") { if (addSpaceReq()) setShowAddSR(false); } }} autoFocus />
              </div>
              <div>
                <label className="lbl" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".04em" }}>Emoji Icon</label>
                <input className="input" value={newSRIcon} onChange={(e) => setNewSRIcon(e.target.value)} style={{ width: 44, textAlign: "center", fontSize: 16, padding: "4px" }} />
              </div>
              <button className="btn dark sm" style={{ height: 34, whiteSpace: "nowrap" }} onClick={() => { if (addSpaceReq()) setShowAddSR(false); }}>Add</button>
              <button className="btn sm" style={{ height: 34, whiteSpace: "nowrap" }} onClick={() => setShowAddSR(false)}>Cancel</button>
            </div>
            <div style={{ fontSize: 10, color: "var(--ink-4)", marginTop: 6 }}>Tip: You can change to an image icon later by editing the space requirement.</div>
          </div>
        )}
      </div>

      {/* ========== FLOOR LAYOUT PLANS ========== */}
      <div style={{ marginBottom: 18 }}>
        <h3 className="layout-section-title">Floor Layout Plans</h3>

        {allVenues.length === 0 && <div style={{ color: "var(--ink-3)", fontStyle: "italic", fontSize: 12 }}>No venues found. Add venues in the Venue Space step first.</div>}

        {allVenues.length > 0 && (
          <div className="layout-admin-panel">
            <div className="layout-admin-head">
              <div>
                <h4>Layout Spaces</h4>
                <div className="layout-admin-sub">Add venue-connected areas like Stage, Elevated Area, Patio tent, or any other place that needs its own floor plans.</div>
              </div>
              <button className="btn dark sm" onClick={() => { setNewLayoutSpaceVenueId(allVenues[0]?.id || ""); setNewLayoutSpaceName(""); setShowAddLayoutSpace(true); }}>+ Add layout space</button>
            </div>
            <div className="layout-space-list">
              {layoutAreas.map((space) => {
                const isEditingSpace = editingLayoutSpace === space.id;
                const sourceHandlers = layoutAreaDnd.sourceHandlers(space);
                const targetHandlers = layoutAreaDnd.targetHandlers(space);
                const rowClass =
                  "layout-space-row" +
                  (!space.system ? " custom" : "") +
                  (isEditingSpace ? " editing" : "") +
                  (layoutAreaDnd.isDragging(space.id) ? " is-dragging" : "") +
                  (layoutAreaDnd.overPosition(space.id) === "above" ? " is-drop-above" : "") +
                  (layoutAreaDnd.overPosition(space.id) === "below" ? " is-drop-below" : "");
                return (
                  <div
                    key={space.id}
                    className={rowClass}
                    style={isEditingSpace ? { gridTemplateColumns: "auto 1fr 180px 220px auto auto" } : undefined}
                    {...targetHandlers}
                  >
                    <span className="layout-space-drag" title="Drag to reorder layout space" onClick={(e) => e.stopPropagation()} {...sourceHandlers}>
                      <Ic.Grip size={14} />
                    </span>
                    {isEditingSpace ? (
                      <React.Fragment>
                        <input className="input" value={space.name || ""} placeholder="Example: Stage" onChange={(e) => updateLayoutSpace(space.id, { name: e.target.value })} autoFocus />
                        <select className="select" value={space.venueId || ""} onChange={(e) => updateLayoutSpace(space.id, { venueId: e.target.value })}>
                          {allVenues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name}</option>)}
                        </select>
                        <select className="select" value={space.visibilityMode || "always"} onChange={(e) => updateLayoutSpace(space.id, { visibilityMode: e.target.value })}>
                          <option value="always">Always show with parent venue</option>
                          <option value="parent_without_subspace">Only when no sub-space is selected</option>
                        </select>
                        <button className="btn sm" style={{ height: 32, whiteSpace: "nowrap", background: "var(--ink)", color: "#fff", border: "none", borderRadius: 6, padding: "0 12px", cursor: "pointer" }} onClick={() => setEditingLayoutSpace(null)}>Done</button>
                        <button className="btn icon sm ghost" style={{ color: "var(--danger)" }} title="Delete layout space" onClick={() => deleteLayoutSpace(space.id)}>✕</button>
                      </React.Fragment>
                    ) : space.system ? (
                      <React.Fragment>
                        <strong style={{ fontSize: 12 }}>{space.name}</strong>
                        <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{allVenues.find((v) => v.id === space.venueId)?.name || "Venue"}</span>
                        <span style={{ fontSize: 10.5, color: "var(--ink-4)", textAlign: "right" }}>From venue</span>
                        <span />
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <strong style={{ fontSize: 12 }}>{space.name || "Untitled space"}</strong>
                        <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{allVenues.find((v) => v.id === space.venueId)?.name || "Venue"}</span>
                        <span style={{ fontSize: 10.5, color: "var(--ink-4)" }}>{space.visibilityMode === "parent_without_subspace" ? "Hidden when a sub-space is selected" : "Always shown with parent venue"}</span>
                        <span style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                          <button className="btn icon sm ghost" title="Edit layout space" onClick={() => setEditingLayoutSpace(space.id)}><Ic.Edit size={13} /></button>
                          <button className="btn icon sm ghost" style={{ color: "var(--danger)" }} title="Delete layout space" onClick={() => deleteLayoutSpace(space.id)}>✕</button>
                        </span>
                      </React.Fragment>
                    )}
                  </div>
                );
              })}
            </div>
            {showAddLayoutSpace && (
              <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 180px auto auto", gap: 8, alignItems: "end", padding: 10, background: "var(--surface-2)", border: "1px dashed var(--line)", borderRadius: 6 }}>
                <div>
                  <label className="lbl" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".04em" }}>Space name</label>
                  <input className="input" value={newLayoutSpaceName} placeholder="Example: Stage" onChange={(e) => setNewLayoutSpaceName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addLayoutSpace(); }} autoFocus />
                </div>
                <div>
                  <label className="lbl" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".04em" }}>Connected venue</label>
                  <select className="select" value={newLayoutSpaceVenueId || allVenues[0]?.id || ""} onChange={(e) => setNewLayoutSpaceVenueId(e.target.value)}>
                    {allVenues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name}</option>)}
                  </select>
                </div>
                <button className="btn sm" style={{ height: 34, whiteSpace: "nowrap", background: "var(--ink)", color: "#fff", border: "none", borderRadius: 6, padding: "0 14px", cursor: "pointer" }} onClick={addLayoutSpace}>Add</button>
                <button className="btn sm" style={{ height: 34, whiteSpace: "nowrap" }} onClick={() => setShowAddLayoutSpace(false)}>Cancel</button>
              </div>
            )}
          </div>
        )}

        {layoutAreas.map((area) => {
          const vl = getVL(area.id);
          const hasFloorLayoutPlan = vl.hasFloorLayoutPlan !== false;
          return (
            <div key={area.id} className="layout-area-card">
              {/* Venue header */}
              <div className="layout-area-head">
                <div>
                  <h4>{area.name}</h4>
                  <div className="layout-admin-sub">Connected to {allVenues.find((v) => v.id === area.venueId)?.name || "venue"}</div>
                </div>
                <button className="btn dark sm" disabled={!hasFloorLayoutPlan} onClick={() => addFL(area.id)}>+ Add Floor Layout</button>
              </div>

              <div className="layout-admin-checks">
                <label>
                  <input type="checkbox" checked={hasFloorLayoutPlan} onChange={(e) => setVL(area.id, { hasFloorLayoutPlan: e.target.checked })} /> Has floor layout plan
                </label>
                <label>
                  <input type="checkbox" checked={vl.floorRequired || false} disabled={!hasFloorLayoutPlan} onChange={() => setVL(area.id, { floorRequired: !vl.floorRequired })} /> Required <span style={{ color: "#e53e3e", fontWeight: 700 }}>*</span>
                </label>
                <label>
                  <input type="checkbox" checked={vl.floorAdminRequired || false} disabled={!hasFloorLayoutPlan} onChange={() => setVL(area.id, { floorAdminRequired: !vl.floorAdminRequired })} /> Admin Required <span style={{ color: "#e53e3e", fontWeight: 700 }}>*</span>
                </label>
              </div>

              {/* Layout list */}
              {hasFloorLayoutPlan && vl.layouts.map((layout) => {
                const isOpen = expandedLayout === layout.id;
                return (
                  <div key={layout.id} style={{ marginBottom: 8, borderRadius: 6, overflow: "hidden", background: "#fff", border: "1px solid var(--line)", boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
                    {/* Header bar */}
                    <div
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", background: isOpen ? "var(--ink)" : "#fff", color: isOpen ? "#fff" : "var(--ink)", cursor: "pointer" }}
                      onClick={() => setExpandedLayout(isOpen ? null : layout.id)}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{layout.name || "Untitled layout"}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button className="btn icon sm ghost" title="Edit" style={{ color: isOpen ? "#fff" : "var(--ink-3)" }} onClick={(e) => { e.stopPropagation(); setExpandedLayout(layout.id); }}><Ic.Edit size={13} /></button>
                        <button className="btn icon sm ghost" title="Delete" style={{ color: isOpen ? "rgba(255,255,255,.8)" : "var(--danger)" }} onClick={(e) => { e.stopPropagation(); delFL(area.id, layout.id); }}>✕</button>
                      </div>
                    </div>
                    {isOpen && renderLayoutCard(area, layout)}
                  </div>
                );
              })}

              {hasFloorLayoutPlan && vl.layouts.length === 0 && (
                <div style={{ color: "var(--ink-3)", fontStyle: "italic", fontSize: 12, padding: "8px 0" }}>No floor layouts yet.</div>
              )}
              {!hasFloorLayoutPlan && (
                <div className="rental-muted" style={{ padding: "8px 0" }}>Floor layout plan is disabled for this venue.</div>
              )}
            </div>
          );
        })}
      </div>

      {/* ========== BLANK FLOOR LAYOUT PLAN ========== */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, borderBottom: "3px solid var(--ink)", paddingBottom: 8, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".03em" }}>Blank Floor Layout Plan</h3>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.6 }}>
          <span style={{ color: "var(--accent)" }}>📋</span> <strong>Add a blank floor layout plan</strong><br />
          Upload your blank floor layout to show table setup, spacing, and capacity. This helps clients better visualize the setup for their event.
        </div>
        <div className="blank-layout-list">
          {layoutAreas.map((area) => {
            const vl = getVL(area.id);
            const hasFloorLayoutPlan = vl.hasFloorLayoutPlan !== false;
            return (
              <div key={area.id} className={"blank-layout-row" + (!hasFloorLayoutPlan ? " disabled" : "")}>
                <strong className="blank-layout-name">{area.name}</strong>
                <span className="blank-layout-venue">{allVenues.find((v) => v.id === area.venueId)?.name || "Venue"}</span>
                <button className="btn sm" disabled={!hasFloorLayoutPlan} style={{ fontSize: 11, justifySelf: "start" }} onClick={() => pickFile("image/*,.pdf", (dataUrl) => setVL(area.id, { blankFloorPlan: dataUrl }))}>Upload File</button>
                {vl.blankFloorPlan ? (
                  <div className="blank-layout-status">
                    <button
                      type="button"
                      className="blank-layout-preview-trigger"
                      onClick={() => openAssetPreview(vl.blankFloorPlan, `${area.name} blank floor layout`)}
                      title="Open large preview"
                    >
                      {isPdfAsset(vl.blankFloorPlan)
                        ? <span className="blank-layout-pdf-thumb">PDF</span>
                        : <img src={vl.blankFloorPlan} alt={`${area.name} blank floor layout`} className="blank-layout-thumb" />}
                    </button>
                    <span>Uploaded</span>
                    <button type="button" className="btn icon sm ghost blank-layout-action" onClick={() => openAssetPreview(vl.blankFloorPlan, `${area.name} blank floor layout`)} title="Preview" aria-label={`Preview ${area.name} blank floor layout`}><Ic.Eye size={15} /></button>
                    <a className="btn icon sm ghost blank-layout-action" href={vl.blankFloorPlan} download={`${area.name || "blank-floor-layout"}-blank-layout${isPdfAsset(vl.blankFloorPlan) ? ".pdf" : ".png"}`} title="Download" aria-label={`Download ${area.name} blank floor layout`}><Ic.Download size={15} /></a>
                    <button className="btn icon sm ghost blank-layout-action" disabled={!hasFloorLayoutPlan} style={{ color: "var(--danger)" }} onClick={() => removeBlankFloorPlan(area)} title="Remove" aria-label={`Remove ${area.name} blank floor layout`}><Ic.Close size={14} /></button>
                  </div>
                ) : (
                  <span className="blank-layout-status" style={{ color: "var(--ink-4)" }}>{hasFloorLayoutPlan ? "No file uploaded" : "Disabled - no floor layout plan"}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Rental groups connected from the Rentals catalog */}
      <div style={{ marginTop: 24 }}>
        <div className="section-bar">
          <h2>
            <Ic.Tag size={13} /> Rental Groups
            <span className="count">{rentalGroupFields.length}</span>
          </h2>
          <div style={{ position: "relative", display: "flex", gap: 6 }}>
            <button className="btn dark sm" onClick={() => setRentalPickerOpen(true)}>
              <Ic.Plus size={13} /> Add rental groups
            </button>
          </div>
        </div>
        {rentalPickerOpen && (
          <RentalGroupPickerModal
            existingFields={step.fields || []}
            onConfirm={addRentalGroups}
            onClose={() => setRentalPickerOpen(false)}
          />
        )}
        {rentalGroupFields.length === 0 ? (
          <div className="workflow-rental-box">
            <div className="workflow-rental-head">
              <b>No rental groups yet</b>
              <span>Choose from the Rentals catalog</span>
            </div>
            <div className="workflow-rental-note">
              Add groups like Tables or Chairs here so this workflow step pulls live rental items, options, and pricing from the Rentals catalog.
            </div>
          </div>
        ) : (
          <div className="field-list">
            {rentalGroupFields.map((f) => (
              <FieldCard
                key={f.id}
                field={f}
                allFields={rentalGroupFields}
                open={openFieldId === f.id}
                onToggle={() => onToggleField(f.id)}
                onUpdate={(next) => onUpdateField(f.id, next)}
                onDuplicate={() => update({ fields: [...(step.fields || []), { ...cloneData(f), id: "f_" + uid(), label: (f.label || "Rental group") + " copy" }] })}
                onDelete={() => confirmDeleteField(f)}
                sourceHandlers={fieldDnd.sourceHandlers(f)}
                targetHandlers={fieldDnd.targetHandlers(f)}
                isDragging={fieldDnd.isDragging(f.id)}
                isOver={fieldDnd.isOver(f.id)}
                overPosition={fieldDnd.overPosition(f.id)}
              />
            ))}
          </div>
        )}
      </div>
      <div style={{ marginTop: 24 }}>
        <div className="section-bar">
          <h2>
            <Ic.List size={13} /> Additional Fields
            <span className="count">{simpleLayoutFields.length}</span>
          </h2>
          <div style={{ position: "relative", display: "flex", gap: 6 }}>
            <button className="btn dark sm" onClick={() => setPickerOpen((o) => !o)}>
              <Ic.Plus size={13} /> Add field
            </button>
            {pickerOpen && (
              <FieldTypePicker
                onPick={(t) => { onAddField(t); setPickerOpen(false); }}
                onClose={() => setPickerOpen(false)}
              />
            )}
          </div>
        </div>
        {simpleLayoutFields.length > 0 ? (
          <div className="field-list">
            {simpleLayoutFields.map((f) => (
              <FieldCard
                key={f.id}
                field={f}
                allFields={simpleLayoutFields}
                stepType={step.stepType}
                open={openFieldId === f.id}
                onToggle={() => onToggleField(f.id)}
	                onUpdate={(next) => onUpdateField(f.id, next)}
	                onDuplicate={() => update({ fields: [...(step.fields || []), { ...cloneData(f), id: "f_" + uid(), label: (f.label || "Field") + " copy" }] })}
	                onDelete={() => confirmDeleteField(f)}
	                sourceHandlers={fieldDnd.sourceHandlers(f)}
	                targetHandlers={fieldDnd.targetHandlers(f)}
	                isDragging={fieldDnd.isDragging(f.id)}
	                isOver={fieldDnd.isOver(f.id)}
	                overPosition={fieldDnd.overPosition(f.id)}
	              />
            ))}
          </div>
        ) : (
          <div className="workflow-rental-box">
            <div className="workflow-rental-head">
              <b>No additional fields yet</b>
              <span>Optional simple fields for this step</span>
            </div>
            <div className="workflow-rental-note">
              Add regular fields like notes, dropdowns, checkboxes, files, or contact details if this custom step needs extra questions.
            </div>
          </div>
        )}
      </div>
      {previewAsset && (
        <div className="layout-preview-overlay" onClick={() => setPreviewAsset(null)} role="presentation">
          <div className="layout-preview-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={previewAsset.title}>
            <div className="layout-preview-head">
              <div>
                <strong>{previewAsset.title}</strong>
                <span>{previewAsset.pdf ? "PDF floor plan" : "Floor plan image"}</span>
              </div>
              <div className="layout-preview-actions">
                <a className="btn sm" href={previewAsset.src} download>Download</a>
                <button type="button" className="btn icon sm ghost" onClick={() => setPreviewAsset(null)} title="Close preview" aria-label="Close preview"><Ic.Close size={16} /></button>
              </div>
            </div>
            <div className="layout-preview-body">
              {previewAsset.pdf
                ? <iframe src={previewAsset.src} title={previewAsset.title} />
                : <img src={previewAsset.src} alt={previewAsset.title} />}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

window.LayoutEditor = LayoutEditor;



// Preview drawer — shows the current step as the client would see it.

function PreviewDrawer({ step, stepIndex, totalSteps, onClose }) {
  const Ic = window.Icons;
  if (!step) return null;
  return (
    <aside className="preview">
      <div className="preview-head">
        <h4>Client Preview · Step {stepIndex + 1} of {totalSteps}</h4>
        <button className="btn icon sm ghost" onClick={onClose} title="Close preview">
          <Ic.Close size={14} />
        </button>
      </div>
      <div className="preview-body">
        <div className="preview-card">
          <div className="preview-progress">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={i < stepIndex ? "done" : i === stepIndex ? "active" : ""}
              />
            ))}
          </div>
          <h2>{step.name}</h2>
          <p className="sub">{step.description || "—"}</p>
          {step.stepType === "venue" ? (
            <div style={{ fontSize: 12, color: "var(--ink-3)", padding: "8px 0" }}>
              {(step.venues || []).filter((v) => v.active && v.visibility !== "admin_only").map((v) => (
                <div key={v.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                  <div style={{ fontWeight: 600, color: "var(--ink)" }}>{v.name}</div>
                  {v.pricing[0] && <div style={{ fontSize: 11 }}>from ${v.pricing[0].basePrice}</div>}
                </div>
              ))}
              <div style={{ fontStyle: "italic", marginTop: 8 }}>Open full preview to interact with venue selection.</div>
            </div>
          ) : step.stepType === "layout" ? (
            <div style={{ fontSize: 12, color: "var(--ink-3)", padding: "8px 0" }}>
              <div style={{ fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>Space Requirements: {(step.spaceRequirements || []).length}</div>
              <div style={{ fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>Floor Layouts: {Object.values(step.floorLayouts || {}).reduce((n, v) => n + (v.layouts || []).length, 0)}</div>
              <div style={{ fontStyle: "italic", marginTop: 8 }}>Open full preview to interact with layout selection.</div>
            </div>
          ) : (
            step.fields
              .filter((f) => f.visibleToClient !== false)
              .map((f) => <PreviewField key={f.id} f={f} />)
          )}
          <div className="preview-foot">
            <button className="btn sm" disabled={stepIndex === 0}>Back</button>
            <button className="btn primary sm">
              {stepIndex === totalSteps - 1 ? "Submit Request" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function PreviewField({ f }) {
  const Ic = window.Icons;
  if (f.type === "separator") {
    return <div style={{ gridColumn: "1 / -1", borderTop: "1.5px solid var(--line)", margin: "12px 0" }} />;
  }
  if (f.type === "instructional") {
    return (
      <div style={{ gridColumn: "1 / -1", padding: "8px 0" }}>
        <p style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.6, margin: 0 }}>{f.label}</p>
        {f.fieldDescription && <p style={{ fontSize: 11.5, color: "var(--ink-3)", margin: "4px 0 0", lineHeight: 1.5 }}>{f.fieldDescription}</p>}
      </div>
    );
  }
  if (f.type === "rental_group") {
    const items = workflowRentalCatalogItems(f.rentalGroup || f.label);
    return (
      <div className="preview-field" style={{ gridColumn: "1 / -1" }}>
        <label style={{ display: "block", marginBottom: 8 }}>
          <span>{f.label}{f.required && <span className="req"> *</span>}</span>
          {f.fieldDescription && <span className="field-desc-preview">{f.fieldDescription}</span>}
        </label>
        <div className="workflow-rental-list">
          {items.slice(0, 8).map((item) => (
            <label className="workflow-rental-chip" key={item.id}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <input type="checkbox" readOnly style={{ accentColor: "var(--accent)" }} />
                <b>{item.name}</b>
              </span>
              <span>{workflowRentalPriceLabel(item)}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }
  const fieldGalleryImages = (f.galleryImages && f.galleryImages.length) ? f.galleryImages : (f.galleryImage ? [f.galleryImage] : []);
  const hasTooltip = f.helpText || fieldGalleryImages.length > 0;
  const labelEl = (
    <label style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
      <span>{f.label}{f.required && <span className="req"> *</span>}</span>
      {hasTooltip && (
        <span className="info-trigger">
          i
          <span className="preview-tooltip">
            {f.helpText && <span className="preview-tooltip-text">{f.helpText}</span>}
            {fieldGalleryImages.map((image, imageIndex) => (
              <img key={imageIndex} src={image} alt="Info" className="preview-tooltip-img" />
            ))}
          </span>
        </span>
      )}
      {f.fieldDescription && (
        <span className="field-desc-preview">{f.fieldDescription}</span>
      )}
    </label>
  );

  if (f.type === "textarea") {
    return (
      <div className="preview-field">
        {labelEl}
        <textarea className="ptextarea" placeholder={f.placeholder || ""} defaultValue={f.defaultValue || ""} />
      </div>
    );
  }
  if (f.type === "toggle") {
    return (
      <div className="preview-field" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className={"swt" + (f.defaultValue ? " on" : "")} />
        <span style={{ fontSize: 12.5, position: "relative" }}>
          {f.label}{f.required && <span className="req"> *</span>}
          {hasTooltip && (
            <span className="info-trigger" style={{ marginLeft: 5 }}>
              i
              <span className="preview-tooltip">
                {f.helpText && <span className="preview-tooltip-text">{f.helpText}</span>}
                {fieldGalleryImages.map((image, imageIndex) => (
                  <img key={imageIndex} src={image} alt="Info" className="preview-tooltip-img" />
                ))}
              </span>
            </span>
          )}
          {f.fieldDescription && (
            <span className="field-desc-preview" style={{ display: "block", marginTop: 2 }}>{f.fieldDescription}</span>
          )}
        </span>
      </div>
    );
  }
  // Shared static rich-options preview tree — used for radio/select/multiselect with object options
  const richPreviewTree = () => {
    const levelDisplays = {
      option: f.displayAs || (f.type === "radio" ? "radio" : f.type === "select" ? "select" : f.type === "multiselect" ? "checkbox" : "radio"),
      subOption: f.subOptionDisplayAs || "checkbox",
      selection: f.selectionDisplayAs || "checkbox",
      specification: f.specificationDisplayAs || "checkbox",
      requireSubOptions: !!f.requireSubOptions,
    };
    const renderLevel = (items, displayAs, level, keyPrefix) => {
      const items_ = (items || []).map(o => typeof o === "string" ? { label: o } : o);
      const hasChildKey = window.RICH_HAS_CHILD_KEY[level];
      const childKey = window.RICH_CHILD_KEY[level];
      const nextLevel = window.RICH_NEXT_LEVEL[level];
      if (displayAs === "select") {
        return (
          <select className="pinput" defaultValue={items_[0] ? items_[0].label : ""}>
            {items_.map((o, i) => (
              <option key={i} value={o.label}>{o.label}{o.enablePrice && o.price ? ` (+$${o.price})` : ""}</option>
            ))}
          </select>
        );
      }
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {items_.map((o, i) => (
            <div key={i}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, cursor: "default" }}>
                <input
                  type={displayAs === "checkbox" ? "checkbox" : "radio"}
                  name={keyPrefix}
                  defaultChecked={level === "option" && i === 0}
                  readOnly
                  style={{ accentColor: "var(--accent)" }}
                />
                <span>
                  {o.label}
                  {o.enablePrice && o.price ? <span style={{ color: "var(--accent)", marginLeft: 4, fontWeight: 600 }}>+${o.price}</span> : null}
                  {o.infoText && <span className="info-trigger" style={{ marginLeft: 4 }}>i<span className="preview-tooltip"><span className="preview-tooltip-text">{o.infoText}</span></span></span>}
                  {o.infoImages && o.infoImages.length > 0 && <span className="info-trigger" style={{ marginLeft: 3, fontSize: 8, fontWeight: 800 }}>IMG<span className="preview-tooltip">{o.infoImages.map((im, ii) => <img key={ii} src={im} className="preview-tooltip-img" />)}</span></span>}
                </span>
              </label>
              {hasChildKey && o[hasChildKey] && (o[childKey] || []).length > 0 && (
                <div style={{ paddingLeft: 18, marginTop: 2, marginBottom: 2, borderLeft: "1.5px solid var(--line)" }}>
                  {levelDisplays.requireSubOptions && <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 700, marginBottom: 4 }}>Required *</div>}
                  {renderLevel(o[childKey], levelDisplays[nextLevel] || "checkbox", nextLevel, keyPrefix + "_" + i)}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    };
    return (
      <div className="preview-field">
        {labelEl}
        {renderLevel(f.options || [], levelDisplays.option, "option", f.id + "_prev")}
      </div>
    );
  };

  if (f.type === "select" || f.type === "multiselect") {
    if (f.type === "select" && f.groupOptions) {
      const groups = normalizeSimpleOptionGroups(f.options || []);
      return (
        <div className="preview-field">
          {labelEl}
          <select className="pinput">
            <option value="">{f.placeholder || "Select…"}</option>
            {groups.map((group, groupIndex) => (
              <optgroup key={group.id || groupIndex} label={group.label || `Group ${groupIndex + 1}`}>
                {(group.options || []).map((option, optionIndex) => {
                  const suffix = optionHasPricing(option) ? " ($" + optionPrice(option).toFixed(2) + ")" : "";
                  return <option key={optionIndex}>{option.label}{suffix}</option>;
                })}
              </optgroup>
            ))}
          </select>
        </div>
      );
    }
    const hasRichOpts = (f.options || []).some(isRichWorkflowOption);
    if (hasRichOpts) return richPreviewTree();
    const optLabels = (f.options || []).map((o) => typeof o === "string" ? o : `${o.label}${optionHasPricing(o) ? " ($" + optionPrice(o).toFixed(2) + ")" : ""}`);
    return (
      <div className="preview-field">
        {labelEl}
        <select className="pinput">
          <option value="">{f.placeholder || "Select…"}</option>
          {optLabels.map((o, i) => <option key={i}>{o}</option>)}
        </select>
      </div>
    );
  }
  if (f.type === "room") {
    return (
      <div className="preview-field">
        {labelEl}
        {window.ROOMS.map((r, i) => (
          <div key={r.id} className={"proom" + (i === 0 ? " sel" : "")}>
            <div className="proom-thumb" />
            <div className="proom-info">
              <b>{r.name}</b>
              <span>{r.capacity} · {r.hourly}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (f.type === "addons") {
    return (
      <div className="preview-field">
        {labelEl}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {["Tables", "Linens", "AV Kit", "Stage lights"].map((n, i) => (
            <div key={i} style={{
              border: "1px solid var(--line)", borderRadius: 8, padding: 10,
              fontSize: 12, display: "flex", flexDirection: "column", gap: 4
            }}>
              <div style={{ height: 48, borderRadius: 5, background: "linear-gradient(135deg,var(--surface-3),var(--surface-active))" }} />
              <b style={{ fontSize: 12 }}>{n}</b>
              <span style={{ color: "var(--ink-3)", fontSize: 11 }}>From ${[12, 18, 80, 120][i]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (f.type === "date") {
    return (
      <div className="preview-field">
        {labelEl}
        <input className="pinput" type="date" />
      </div>
    );
  }
  if (f.type === "daterange") {
    return (
      <div className="preview-field">
        {labelEl}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input className="pinput" type="date" />
          <input className="pinput" type="date" />
        </div>
      </div>
    );
  }
  if (f.type === "file") {
    return (
      <div className="preview-field">
        {labelEl}
        <div className="upload" style={{ background: "var(--surface-2)" }}>
          <Ic.File size={14} /> <span>Drop a file or click to upload</span>
        </div>
      </div>
    );
  }
  if (f.type === "price") {
    return (
      <div className="preview-field">
        {labelEl}
        <input className="pinput" placeholder={f.placeholder || "$0.00"} />
      </div>
    );
  }
  if (f.type === "radio") {
    const hasRichOpts = (f.options || []).some(isRichWorkflowOption);
    if (hasRichOpts) return richPreviewTree();
    const opts = (f.options || []).map((o) => {
      if (typeof o === "string") {
        const parts = o.split("|");
        return { label: parts[0], desc: parts[1] || "", price: null };
      }
      return { label: o.label || "", desc: o.desc || o.description || "", price: optionHasPricing(o) ? optionPrice(o) : null, infoText: o.infoText || "", infoImages: o.infoImages || [] };
    });
    return (
      <div className="preview-field">
        {labelEl}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {opts.map((o, i) => (
            <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, border: "1px solid var(--line)", borderRadius: 6, padding: "8px 10px", fontSize: 12, cursor: "pointer" }}>
              <input type="radio" name={f.id + "_prev"} style={{ marginTop: 2, accentColor: "var(--accent)" }} />
              <span>
                <b style={{ fontSize: 12 }}>{o.label}</b>
                {o.price !== null && <span style={{ color: "var(--accent)", marginLeft: 5, fontWeight: 700 }}>+${o.price.toFixed(2)}</span>}
                {o.infoText && <span className="info-trigger" style={{ marginLeft: 5 }}>i<span className="preview-tooltip"><span className="preview-tooltip-text">{o.infoText}</span></span></span>}
                {o.infoImages && o.infoImages.length > 0 && <span className="info-trigger" style={{ marginLeft: 5, background: "#fff4eb", color: "var(--accent)" }}><span style={{ fontSize: 9, fontWeight: 800 }}>IMG</span><span className="preview-tooltip">{o.infoImages.map((img, ii) => <img key={ii} src={img} alt="" className="preview-tooltip-img" />)}</span></span>}
                {o.desc && <span style={{ display: "block", fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>{o.desc}</span>}
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  }
  if (f.type === "groupselect") {
    const groups = [];
    let cur = { label: "", items: [] };
    (f.options || []).forEach((o) => {
      if (o.startsWith("@")) {
        if (cur.label || cur.items.length) groups.push(cur);
        cur = { label: o.slice(1), items: [] };
      } else {
        cur.items.push(o);
      }
    });
    if (cur.label || cur.items.length) groups.push(cur);
    return (
      <div className="preview-field">
        {labelEl}
        <select className="pinput">
          <option value="">{f.placeholder || "Select…"}</option>
          {groups.map((g, gi) =>
            g.label ? (
              <optgroup key={gi} label={g.label}>
                {g.items.map((it, ii) => <option key={ii}>{it}</option>)}
              </optgroup>
            ) : (
              g.items.map((it, ii) => <option key={`u${ii}`}>{it}</option>)
            )
          )}
        </select>
      </div>
    );
  }
  if (f.type === "number") {
    return (
      <div className="preview-field">
        {labelEl}
        <input className="pinput" type="tel" placeholder={f.placeholder || ""} />
        {(f.min != null || f.max != null) && (
          <span style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 2 }}>
            {f.min != null && f.max != null ? `Between ${f.min} and ${f.max}` : f.min != null ? `Min: ${f.min}` : `Max: ${f.max}`}
          </span>
        )}
      </div>
    );
  }
  if (f.type === "time") {
    return (
      <div className="preview-field">
        {labelEl}
        <input className="pinput" type="time" defaultValue="14:00" />
      </div>
    );
  }
  if (f.type === "checkbox") {
    const richOpts = (f.options || []).map((o) => typeof o === "string" ? { label: o } : o);
    return (
      <div className="preview-field" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
          <input type="checkbox" defaultChecked style={{ accentColor: "var(--accent)" }} />
          <b>{f.label}{f.required && <span className="req"> *</span>}</b>
          {hasTooltip && (
            <span className="info-trigger">i
              <span className="preview-tooltip">
                {f.helpText && <span className="preview-tooltip-text">{f.helpText}</span>}
                {f.galleryImage && <img src={f.galleryImage} alt="" className="preview-tooltip-img" />}
              </span>
            </span>
          )}
          {f.fieldDescription && <span style={{ fontSize: 11, color: "var(--ink-3)" }}>({f.fieldDescription})</span>}
        </label>
        {f.displayAs === "radio" && richOpts.map((o, i) => (
          <label key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
            <input type="radio" name={f.id + "_prev"} defaultChecked={i === 1} style={{ accentColor: "var(--accent)" }} />
            {o.label}
          </label>
        ))}
        {f.displayAs === "select" && (
          <select className="pinput" style={{ width: "auto", minWidth: 60 }}>
            {richOpts.map((o, i) => <option key={i}>{o.label}</option>)}
          </select>
        )}
      </div>
    );
  }
  if (f.type === "dietary") {
    return (
      <div className="preview-field">
        {labelEl}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {(f.dietaryOptions || []).map((d, i) => (
            <label key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <input type="checkbox" style={{ accentColor: "var(--accent)" }} /> {d}
            </label>
          ))}
        </div>
      </div>
    );
  }
  // text, default
  return (
    <div className="preview-field">
      {labelEl}
      <input
        className="pinput"
        type="text"
        placeholder={f.placeholder || ""}
        defaultValue={f.defaultValue || ""}
      />
    </div>
  );
}

window.PreviewDrawer = PreviewDrawer;



// Fullscreen client preview — styled like Client-View.html
// Full multi-step wizard, progress bar at top, two-column layout (no cost sidebar for now).

function venueRateTypeLabel(rateType) {
  if (rateType === "per_hour") return "Per Hour";
  if (rateType === "per_day") return "Per Day";
  if (rateType === "per_week") return "Per Week";
  return "Flat";
}

function venuePlanRentalSubtotal(plan = {}, actualHours = 0) {
  const rate = Number(plan.basePrice || 0);
  const minimumHours = Math.max(0, Number(plan.includedHours || 0));
  const hours = Number(actualHours || 0);
  const extraRate = Number(plan.extraHourRate || 0);
  if (minimumHours > 0 && extraRate > 0) {
    return rate + Math.max(0, hours - minimumHours) * extraRate;
  }
  if (plan.rateType === "per_hour") return Math.max(hours, minimumHours) * rate;
  return rate;
}

// ----- Venue Preview Body (for stepType === "venue" inside ClientPreview) -----
function VenuePreviewBody({ step, answers, allSteps, onVenueCost, onAnswer, validationMessages = {} }) {
  const Ic = window.Icons;
  const pricesVisible = useClientPricingVisible();
  const dateTimeRequirementMessage = validationMessages.dateTimeRequirementMessage || "Select booking dates and times to calculate an accurate venue quote.";
  const initialSelectedVenueIds = Array.isArray(answers._selectedVenueIds)
    ? answers._selectedVenueIds
    : answers._selectedVenueId
    ? [answers._selectedVenueId]
    : [];
  const [selectedIds, _setSelectedIds] = React.useState(initialSelectedVenueIds);
  const setSelectedIds = (ids) => {
    const nextIds = Array.from(new Set((ids || []).filter(Boolean)));
    _setSelectedIds(nextIds);
    if (onAnswer) {
      onAnswer("_selectedVenueIds", nextIds);
      onAnswer("_selectedVenueId", nextIds[0] || "");
    }
  };
  const toggleVenue = (id) => {
    setSelectedIds(selectedIds.includes(id) ? selectedIds.filter((venueId) => venueId !== id) : [...selectedIds, id]);
  };
  const [bookingByVenue, setBookingByVenue] = React.useState(() => answers._venueBookings || {});
  const [subSpaceByVenue, setSubSpaceByVenue] = React.useState(() => answers._venueSubSpaces || {});
  const [subSpaceOpenByVenue, setSubSpaceOpenByVenue] = React.useState(() => answers._venueSubSpaceOpen || {});
  const [dateWarningByVenue, setDateWarningByVenue] = React.useState({});
  const [showGallery, setShowGallery] = React.useState(false);
  const [galleryIdx, setGalleryIdx] = React.useState(0);
  const [galleryVenueId, setGalleryVenueId] = React.useState("");

  // Get visible venues
  const venues = (step.venues || []).filter((v) => v.active && v.visibility !== "admin_only");
  const selectedIdSet = new Set(selectedIds);
  const selectedVenues = venues.filter((venue) => selectedIdSet.has(venue.id));
  const selected = selectedVenues[0] || null;
  const setVenueBooking = (venueId, patch) => {
    const next = { ...bookingByVenue, [venueId]: { ...(bookingByVenue[venueId] || {}), ...patch } };
    setBookingByVenue(next);
    if (onAnswer) onAnswer("_venueBookings", next);
  };
  const setVenueSubSpaceId = (venueId, value) => {
    setSubSpaceByVenue((prev) => {
      const next = { ...prev, [venueId]: value || "" };
      return next;
    });
  };
  const setVenueSubSpaceOpen = (venueId, value) => {
    setSubSpaceOpenByVenue((prev) => {
      const next = { ...prev, [venueId]: !!value };
      return next;
    });
  };
  const setVenueWarning = (venueId, value) => {
    setDateWarningByVenue((prev) => ({ ...prev, [venueId]: value || "" }));
  };

  React.useEffect(() => {
    if (onAnswer) onAnswer("_venueBookings", bookingByVenue);
  }, [JSON.stringify(bookingByVenue)]);
  React.useEffect(() => {
    if (onAnswer) onAnswer("_venueSubSpaces", subSpaceByVenue);
  }, [JSON.stringify(subSpaceByVenue)]);
  React.useEffect(() => {
    if (onAnswer) onAnswer("_venueSubSpaceOpen", subSpaceOpenByVenue);
  }, [JSON.stringify(subSpaceOpenByVenue)]);

  // --- Recommendation logic: uses venueCapacity + suitableEventTypes ---
  const getRecommendation = () => {
    let eventType = "";
    let attendeeCount = 0;
    allSteps.forEach((s) => {
      if (s.stepType === "venue") return;
      (s.fields || []).forEach((f) => {
        const val = answers[f.id];
        if (!val) return;
        const lab = (f.label || "").toLowerCase();
        if (lab.includes("event type") || lab.includes("type of event")) eventType = String(val);
        if (lab.includes("attendee") || lab.includes("number of guest") || lab.includes("number of attendees")) attendeeCount = parseInt(val, 10) || 0;
      });
    });

    if (!attendeeCount && !eventType) return null;

    // Score each venue: capacity fit + event type match
    const scored = venues.map((v) => {
      const cap = v.venueCapacity || 0;
      const types = v.suitableEventTypes || [];
      let score = 0;
      let capFits = !attendeeCount || (cap >= attendeeCount);
      let typeFits = !eventType || types.length === 0 || types.includes(eventType);
      if (capFits) score += 10;
      if (typeFits) score += 10;
      // Prefer smallest venue that still fits
      if (capFits && cap > 0) score += (1000 - cap) / 1000;
      return { venue: v, cap, score, capFits, typeFits };
    });

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];
    if (!best || best.score === 0) return null;

    const parts = [];
    if (eventType) parts.push(`your ${eventType}`);
    if (attendeeCount) parts.push(`${attendeeCount} attendees`);
    return { venue: best.venue, reason: parts.length > 0 ? `Based on ${parts.join(" with ")}, we recommend:` : "We recommend:" };
  };

  const rec = getRecommendation();

  // --- Price calculator (auto-select best plan) ---
  const calcPriceForVenue = (venue) => {
    const booking = bookingByVenue[venue.id] || {};
    const { startDate, startTime, endDate, endTime } = booking;
    if (!venue || !startDate || !startTime || !endDate || !endTime) return null;
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    if (isNaN(start) || isNaN(end) || end <= start) return null;

    const diffMs = end - start;
    const totalHours = Math.ceil(diffMs / (1000 * 60 * 60) * 10) / 10;

    const plans = (venue.pricing || []).filter(Boolean);
    const defaultPlan = plans[0];
    const autoSwitch = venue.advancedPricing?.autoSwitchBestPricing !== false;
    const pricedPlans = plans.map((p) => ({ plan: p, rentalSubtotal: venuePlanRentalSubtotal(p, totalHours) }));
    const best = autoSwitch
      ? pricedPlans.reduce((winner, candidate) => candidate.rentalSubtotal < winner.rentalSubtotal ? candidate : winner, pricedPlans[0])
      : pricedPlans[0];
    const plan = best?.plan || defaultPlan;
    if (!plan) return null;

    const minimumHours = Math.max(0, Number(plan.includedHours || 0));
    const billableHours = plan.rateType === "per_hour" ? Math.max(totalHours, minimumHours) : totalHours;
    const extraHourRate = Number(plan.extraHourRate || 0);
    const usesExtraHourRate = minimumHours > 0 && extraHourRate > 0;
    const extraHours = usesExtraHourRate ? Math.max(0, totalHours - minimumHours) : 0;
    const venueBase = best ? best.rentalSubtotal : venuePlanRentalSubtotal(plan, totalHours);
    const minimumApplied = plan.rateType === "per_hour" && minimumHours > 0 && totalHours < minimumHours;
    const bestValueApplied = !!(autoSwitch && defaultPlan && plan.id !== defaultPlan.id);
    const planLabel = venueRateTypeLabel(plan.rateType) + (bestValueApplied ? " (Best Value)" : "");

    const adv = venue.advancedPricing || {};
    const setup = adv.setupFee || 0;
    const cleanup = adv.cleanupFee || 0;
    const deposit = adv.securityDeposit || 0;

    // Sub-space cost
    let subCost = 0;
    let subName = "";
    const subSpaceId = subSpaceByVenue[venue.id];
    if (subSpaceId && venue.subSpace?.enabled) {
      const opt = (venue.subSpace.options || []).find((o) => o.id === subSpaceId);
      if (opt) { subCost = opt.price || 0; subName = opt.name; }
    }

    const subtotal = venueBase + setup + cleanup + subCost;
    const total = subtotal + deposit;

    return {
      plan, planLabel, totalHours, billableHours, minimumHours, minimumApplied, bestValueApplied, extraHourRate, extraHours, usesExtraHourRate, venueBase,
      setup, cleanup, deposit, subCost, subName, subtotal, total,
      booking,
    };
  };

  const fmt = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Booking hours helper
  const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const dayNames = { sun: "Sundays", mon: "Mondays", tue: "Tuesdays", wed: "Wednesdays", thu: "Thursdays", fri: "Fridays", sat: "Saturdays" };
  const getHoursForDate = (venue, dateStr) => {
    if (!dateStr || !venue) return null;
    const d = new Date(dateStr + "T00:00:00");
    if (isNaN(d)) return null;
    const bh = (venue.advancedPricing || {}).bookingHours || {};
    const val = bh[DAY_KEYS[d.getDay()]];
    if (!val || val.toLowerCase() === "closed") return "closed";
    const m = val.match(/^(\d{2}:\d{2})-(\d{2}:\d{2})$/);
    return m ? { open: m[1], close: m[2] } : null;
  };
  const isDateClosed = (venue, dateStr) => getHoursForDate(venue, dateStr) === "closed";
  const closedDaysListForVenue = (venue) => DAY_KEYS.filter((k) => { const v = ((venue.advancedPricing || {}).bookingHours || {})[k]; return v && v.toLowerCase() === "closed"; });

  // Validate date on change — reject closed days
  const handleStartDate = (venue, val) => {
    if (isDateClosed(venue, val)) {
      const d = new Date(val + "T00:00:00");
      setVenueWarning(venue.id, `This venue is closed on ${dayNames[DAY_KEYS[d.getDay()]] || "this day"}. Please pick another date.`);
      setVenueBooking(venue.id, { startDate: "", startTime: "" });
      return;
    }
    const booking = bookingByVenue[venue.id] || {};
    setVenueWarning(venue.id, "");
    setVenueBooking(venue.id, { startDate: val, ...(booking.endDate && val > booking.endDate ? { endDate: val } : {}) });
  };
  const handleEndDate = (venue, val) => {
    if (isDateClosed(venue, val)) {
      const d = new Date(val + "T00:00:00");
      setVenueWarning(venue.id, `This venue is closed on ${dayNames[DAY_KEYS[d.getDay()]] || "this day"}. Please pick another date.`);
      setVenueBooking(venue.id, { endDate: "", endTime: "" });
      return;
    }
    setVenueWarning(venue.id, "");
    setVenueBooking(venue.id, { endDate: val });
  };

  // Clamp time to booking hours
  const clampTime = (venue, timeVal, dateStr) => {
    const hrs = getHoursForDate(venue, dateStr);
    if (!hrs || hrs === "closed" || !timeVal) return timeVal;
    if (timeVal < hrs.open) return hrs.open;
    if (timeVal > hrs.close) return hrs.close;
    return timeVal;
  };
  const copyBookingFromVenueAbove = (targetVenue, sourceVenue) => {
    if (!targetVenue || !sourceVenue) return;
    const sourceBooking = bookingByVenue[sourceVenue.id] || {};
    if (!sourceBooking.startDate && !sourceBooking.startTime && !sourceBooking.endDate && !sourceBooking.endTime) {
      setVenueWarning(targetVenue.id, `Add a booking date and time for ${sourceVenue.name} first.`);
      return;
    }
    if (sourceBooking.startDate && isDateClosed(targetVenue, sourceBooking.startDate)) {
      const d = new Date(sourceBooking.startDate + "T00:00:00");
      setVenueWarning(targetVenue.id, `${targetVenue.name} is closed on ${dayNames[DAY_KEYS[d.getDay()]] || "that start date"}. Please choose a different date.`);
      return;
    }
    if (sourceBooking.endDate && isDateClosed(targetVenue, sourceBooking.endDate)) {
      const d = new Date(sourceBooking.endDate + "T00:00:00");
      setVenueWarning(targetVenue.id, `${targetVenue.name} is closed on ${dayNames[DAY_KEYS[d.getDay()]] || "that end date"}. Please choose a different date.`);
      return;
    }
    setVenueWarning(targetVenue.id, "");
    setVenueBooking(targetVenue.id, {
      startDate: sourceBooking.startDate || "",
      startTime: clampTime(targetVenue, sourceBooking.startTime || "", sourceBooking.startDate),
      endDate: sourceBooking.endDate || "",
      endTime: clampTime(targetVenue, sourceBooking.endTime || "", sourceBooking.endDate),
    });
  };
  const buildVenueQuote = (venue) => {
    const price = calcPriceForVenue(venue);
    const basePrice = venue.pricing[0] ? venue.pricing[0].basePrice : 0;
    const baseLabel = price ? price.planLabel : (venue.pricing[0] ? venueRateTypeLabel(venue.pricing[0].rateType) : "");
    const subSpaceId = subSpaceByVenue[venue.id];
    let subCost = 0, subName = "";
    if (subSpaceId && venue.subSpace?.enabled) {
      const opt = (venue.subSpace.options || []).find((o) => o.id === subSpaceId);
      if (opt) { subCost = opt.price || 0; subName = opt.name; }
    }
    const adv = venue.advancedPricing || {};
    const setup = price ? (price.setup || 0) : 0;
    const cleanup = price ? (price.cleanup || 0) : 0;
    const venueBase = price ? price.venueBase : basePrice;
    return {
      venueId: venue.id,
      venueName: venue.name,
      booking: bookingByVenue[venue.id] || {},
      venueBase,
      baseLabel,
      planLabel: price ? price.planLabel : baseLabel,
      billableHours: price ? price.billableHours : 0,
      minimumHours: price ? price.minimumHours : 0,
      minimumApplied: !!price?.minimumApplied,
      bestValueApplied: !!price?.bestValueApplied,
      extraHourRate: price ? price.extraHourRate : 0,
      extraHours: price ? price.extraHours : 0,
      usesExtraHourRate: !!price?.usesExtraHourRate,
      totalHours: price ? price.totalHours : 0,
      setup,
      cleanup,
      subCost,
      subName,
      securityDeposit: price ? (price.deposit || 0) : (adv.securityDeposit || 0),
      total: venueBase + setup + cleanup + subCost,
      totalWithDeposit: venueBase + setup + cleanup + subCost + (price ? (price.deposit || 0) : (adv.securityDeposit || 0)),
      hasBooking: !!price,
      price,
    };
  };

  // Report cost to parent for sidebar
  React.useEffect(() => {
    if (!onVenueCost) return;
    if (!selected) { onVenueCost(null); return; }
    const venueCosts = selectedVenues.map(buildVenueQuote);
    const first = venueCosts[0];
    onVenueCost({
      venueId: first.venueId,
      venueIds: selectedVenues.map((venue) => venue.id),
      venueName: first.venueName,
      venueNames: selectedVenues.map((venue) => venue.name),
      venueBase: first.venueBase,
      baseLabel: first.baseLabel,
      planLabel: first.planLabel,
      billableHours: first.billableHours,
      minimumHours: first.minimumHours,
      minimumApplied: first.minimumApplied,
      bestValueApplied: first.bestValueApplied,
      totalHours: first.totalHours,
      subCost: first.subCost,
      subName: first.subName,
      securityDeposit: venueCosts.reduce((sum, item) => sum + Number(item.securityDeposit || 0), 0),
      total: venueCosts.reduce((sum, item) => sum + Number(item.total || 0), 0),
      hasBooking: venueCosts.some((item) => item.hasBooking),
      venueCosts,
    });
  }, [selectedIds.join(","), JSON.stringify(bookingByVenue), JSON.stringify(subSpaceByVenue)]);
  const openVenueGallery = (venue) => {
    if (!venue || !(venue.gallery || []).length) return;
    setGalleryVenueId(venue.id);
    setGalleryIdx(0);
    setShowGallery(true);
  };

  return (
    <div className="cv-venue-preview">
      {/* Recommendation banner */}
      {rec && (
        <div className="cv-recommend" onClick={() => { setSelectedIds(selectedIds.includes(rec.venue.id) ? selectedIds : [...selectedIds, rec.venue.id]); }}>
          <div className="cv-recommend-icon">✦</div>
          <div>
            <div className="cv-recommend-label">{rec.reason}</div>
            <div className="cv-recommend-venue">{rec.venue.name}</div>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>{selectedIds.includes(rec.venue.id) ? "Selected" : "Add"}</span>
        </div>
      )}

      {/* Venue selector grid */}
      <div className="cv-venue-select-grid">
        {venues.map((v) => (
          <div
            key={v.id}
            className={"cv-venue-select-item" + (selectedIds.includes(v.id) ? " active" : "")}
            onClick={() => { toggleVenue(v.id); }}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(v.id)}
              onChange={() => {}}
              aria-label={`Select ${v.name}`}
              className="cv-venue-select-check"
            />
            <div className="cv-venue-select-thumb">
              {v.thumbnail ? <img src={v.thumbnail} alt={v.name} /> : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-3)", color: "var(--ink-4)", fontSize: 11 }}>
                  <Ic.Img size={20} />
                </div>
              )}
            </div>
            <div className="cv-venue-select-name">{v.name}</div>
            {pricesVisible && v.pricing[0] && (
              <div className="cv-venue-select-price">
                from {fmt(v.pricing[0].basePrice)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Gallery modal (venue or sub-space) */}
      {showGallery && (() => {
        const galleryVenue = venues.find((v) => v.id === galleryVenueId) || selected;
        if (!galleryVenue) return null;
        let imgs = [];
        let galleryTitle = galleryVenue.name + " Gallery";
        if (showGallery === true) {
          imgs = galleryVenue.gallery || [];
        } else if (typeof showGallery === "string" && showGallery.startsWith("sub_")) {
          const subId = showGallery.replace("sub_", "");
          const opt = (galleryVenue.subSpace?.options || []).find((o) => o.id === subId);
          imgs = opt?.gallery || [];
          galleryTitle = (opt?.name || galleryVenue.name) + " Gallery";
        }
        if (imgs.length === 0) return null;
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,.85)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowGallery(false)}>
            <div style={{ position: "relative", maxWidth: 720, width: "90%", background: "#000", borderRadius: 12, overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 2, padding: "14px 56px 28px 18px", color: "#fff", fontSize: 15, fontWeight: 700, background: "linear-gradient(rgba(0,0,0,.74), rgba(0,0,0,0))" }}>
                {galleryTitle}
              </div>
              <img src={imgs[galleryIdx]} alt={`Gallery ${galleryIdx + 1}`} style={{ width: "100%", maxHeight: "70vh", objectFit: "contain", display: "block" }} />
              <div style={{ position: "absolute", top: 12, right: 12, zIndex: 3, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "grid", placeItems: "center", cursor: "pointer", color: "#fff", fontSize: 18 }} onClick={() => setShowGallery(false)}>✕</div>
              {imgs.length > 1 && (
                <>
                  <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "grid", placeItems: "center", cursor: "pointer", color: "#fff", fontSize: 18 }} onClick={() => setGalleryIdx((galleryIdx - 1 + imgs.length) % imgs.length)}>‹</div>
                  <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "grid", placeItems: "center", cursor: "pointer", color: "#fff", fontSize: 18 }} onClick={() => setGalleryIdx((galleryIdx + 1) % imgs.length)}>›</div>
                </>
              )}
              <div style={{ textAlign: "center", padding: "10px 0", color: "#fff", fontSize: 12 }}>{galleryIdx + 1} / {imgs.length}</div>
            </div>
          </div>
        );
      })()}

      {/* Selected venue details */}
      {selectedVenues.map((selected, selectedIndex) => (
        <div className="cv-venue-detail" key={selected.id}>
          <div className="cv-venue-detail-top">
            <div
              className={"cv-venue-detail-img" + ((selected.gallery || []).length > 0 ? " clickable" : "")}
              onClick={() => openVenueGallery(selected)}
              role={(selected.gallery || []).length > 0 ? "button" : undefined}
              tabIndex={(selected.gallery || []).length > 0 ? 0 : undefined}
              onKeyDown={(e) => {
                if ((selected.gallery || []).length > 0 && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  openVenueGallery(selected);
                }
              }}
              title={(selected.gallery || []).length > 0 ? "Open gallery" : undefined}
            >
              {selected.thumbnail ? <img src={selected.thumbnail} alt={selected.name} /> : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-3)", color: "var(--ink-4)" }}>
                  <Ic.Img size={32} />
                </div>
              )}
            </div>
            <div className="cv-venue-detail-info">
              <h3>{selected.name}</h3>
              {selected.description && <RichTextDisplay value={selected.description} className="cv-rich-text" />}
              {(selected.gallery || []).length > 0 && (
                <div className="cv-venue-gallery-link" onClick={() => openVenueGallery(selected)} style={{ cursor: "pointer" }}>
                  <Ic.Img size={14} /> View gallery ({selected.gallery.length} photos)
                </div>
              )}
            </div>
          </div>

          <div className="cv-venue-detail-cols" style={{ padding: "16px 24px 20px" }}>
            {selected.equippedWith && (
              <div className="cv-venue-detail-list">
                <h4>Equipped With</h4>
                <RichTextDisplay value={selected.equippedWith} listFallback className="cv-rich-text" />
              </div>
            )}
            {selected.byRequest && (
              <div className="cv-venue-detail-list">
                <h4>By Request</h4>
                <RichTextDisplay value={selected.byRequest} listFallback className="cv-rich-text" />
              </div>
            )}
          </div>

          {selected.maxCapacity && (
            <div className="cv-venue-detail-list" style={{ padding: "0 24px 20px" }}>
              <h4>Recommended Max Capacity</h4>
              <RichTextDisplay value={selected.maxCapacity} listFallback className="cv-rich-text" />
            </div>
          )}

          {/* Sub-space — checkbox + accordion */}
          {selected.subSpace?.enabled && (selected.subSpace.options || []).length > 0 && (
            <div style={{ padding: "0 24px 20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                <input type="checkbox" checked={!!subSpaceOpenByVenue[selected.id]} onChange={(e) => { setVenueSubSpaceOpen(selected.id, e.target.checked); if (!e.target.checked) setVenueSubSpaceId(selected.id, ""); }} style={{ width: 16, height: 16, accentColor: "var(--accent)" }} />
                {selected.subSpace.title || "Add Optional Sub-Space"}
              </label>
              {selected.subSpace.description && <p style={{ fontSize: 12, color: "var(--ink-3)", margin: "4px 0 0", paddingLeft: 24 }}>{selected.subSpace.description}</p>}
              {!!subSpaceOpenByVenue[selected.id] && (
                <div className="cv-subspace-opts" style={{ marginTop: 12 }}>
                  {selected.subSpace.options.map((opt) => (
                    <div
                      key={opt.id}
                      className={"cv-subspace-opt" + (subSpaceByVenue[selected.id] === opt.id ? " active" : "")}
                      onClick={() => setVenueSubSpaceId(selected.id, opt.id)}
                      style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
                    >
                      {opt.thumbnail && (
                        <img src={opt.thumbnail} alt={opt.name} style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                          <div className="cv-subspace-opt-name">{opt.name}</div>
                          {pricesVisible && <div className="cv-subspace-opt-price" style={{ flexShrink: 0 }}>{fmt(opt.price)}</div>}
                        </div>
                        {opt.description && <RichTextDisplay value={opt.description} className="cv-subspace-opt-desc cv-rich-text" />}
                        {(opt.gallery || []).length > 0 && (
                          <div className="cv-venue-gallery-link" onClick={(e) => { e.stopPropagation(); setGalleryVenueId(selected.id); setGalleryIdx(0); setShowGallery("sub_" + opt.id); }} style={{ marginTop: 4, fontSize: 11 }}>
                            <Ic.Img size={12} /> {opt.gallery.length} photo{opt.gallery.length !== 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Booking date/time */}
          {(() => {
            const booking = bookingByVenue[selected.id] || {};
            const startHours = getHoursForDate(selected, booking.startDate);
            const endHours = getHoursForDate(selected, booking.endDate);
            const closedDaysList = closedDaysListForVenue(selected);
            const dateWarning = dateWarningByVenue[selected.id] || "";
            const quote = buildVenueQuote(selected);
            const price = quote.price;
            const previousVenue = selectedVenues[selectedIndex - 1];
            return (
              <div className="cv-booking-calc" style={{ margin: "0 24px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Booking Date & Time</h4>
                  {selectedIndex > 0 && previousVenue && (
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() => copyBookingFromVenueAbove(selected, previousVenue)}
                    >
                      Copy date and time above
                    </button>
                  )}
                </div>
                {closedDaysList.length > 0 && (
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 10, background: "var(--surface-2)", padding: "8px 10px", borderRadius: 6, lineHeight: 1.5 }}>
                    <strong>Note:</strong> This venue is closed on {closedDaysList.map((k) => dayNames[k]).join(", ")}. These days cannot be selected.
                  </div>
                )}
                {dateWarning && (
                  <div style={{ fontSize: 12, color: "#d44", marginBottom: 10, background: "#fef2f2", padding: "8px 10px", borderRadius: 6, border: "1px solid #fecaca" }}>
                    ⚠ {dateWarning}
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--ink-3)", display: "block", marginBottom: 3 }}>Start Date</label>
                    <input className="cv-input" type="date" value={booking.startDate || ""} onInput={(e) => handleStartDate(selected, e.target.value)} onChange={(e) => handleStartDate(selected, e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--ink-3)", display: "block", marginBottom: 3 }}>Start Time{startHours && startHours !== "closed" && startHours ? ` (${startHours.open} – ${startHours.close})` : ""}</label>
                    <input className="cv-input" type="time" value={booking.startTime || ""} min={startHours && startHours !== "closed" ? startHours.open : undefined} max={startHours && startHours !== "closed" ? startHours.close : undefined} onInput={(e) => setVenueBooking(selected.id, { startTime: clampTime(selected, e.target.value, booking.startDate) })} onChange={(e) => setVenueBooking(selected.id, { startTime: clampTime(selected, e.target.value, booking.startDate) })} disabled={!booking.startDate} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--ink-3)", display: "block", marginBottom: 3 }}>End Date</label>
                    <input className="cv-input" type="date" value={booking.endDate || ""} min={booking.startDate || undefined} onInput={(e) => handleEndDate(selected, e.target.value)} onChange={(e) => handleEndDate(selected, e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--ink-3)", display: "block", marginBottom: 3 }}>End Time{endHours && endHours !== "closed" && endHours ? ` (${endHours.open} – ${endHours.close})` : ""}</label>
                    <input className="cv-input" type="time" value={booking.endTime || ""} min={endHours && endHours !== "closed" ? endHours.open : undefined} max={endHours && endHours !== "closed" ? endHours.close : undefined} onInput={(e) => setVenueBooking(selected.id, { endTime: clampTime(selected, e.target.value, booking.endDate) })} onChange={(e) => setVenueBooking(selected.id, { endTime: clampTime(selected, e.target.value, booking.endDate) })} disabled={!booking.endDate} />
                  </div>
                </div>
                {pricesVisible && price && (
                  <div style={{ marginTop: 16, padding: 14, background: "var(--surface-2)", borderRadius: 10, border: "1px solid var(--line)", fontSize: 13 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span>{selected.name} — {price.planLabel}</span><span>{fmt(price.venueBase)}</span></div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 4 }}>
                      Duration: {price.totalHours} hr{price.totalHours === 1 ? "" : "s"}
                      {(price.plan.rateType === "per_hour" || price.usesExtraHourRate) && <> · Billable: {price.billableHours} hr{price.billableHours === 1 ? "" : "s"}</>}
                      {price.usesExtraHourRate && <> · Extra hour rate: {fmt(price.extraHourRate)}/hr</>}
                    </div>
                    {price.extraHours > 0 && (
                      <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 4 }}>
                        Includes {price.minimumHours} minimum hour{price.minimumHours === 1 ? "" : "s"} plus {price.extraHours} extra hour{price.extraHours === 1 ? "" : "s"}.
                      </div>
                    )}
                    {price.minimumApplied && (
                      <div style={{ margin: "8px 0", padding: "8px 10px", border: "1px solid var(--accent-soft-line)", background: "var(--accent-soft)", borderRadius: 6, color: "var(--ink-2)", fontSize: 12, lineHeight: 1.4 }}>
                        Minimum booking for this venue is {price.minimumHours} hours. Although your booking is only {price.totalHours} hour{price.totalHours === 1 ? "" : "s"}, you will be charged the {price.minimumHours}-hour minimum.
                      </div>
                    )}
                    {price.subCost > 0 && <div style={{ display: "flex", justifyContent: "space-between" }}><span>{price.subName}</span><span>{fmt(price.subCost)}</span></div>}
                    {price.setup > 0 && <div style={{ display: "flex", justifyContent: "space-between" }}><span>Set up fee</span><span>{fmt(price.setup)}</span></div>}
                    {price.cleanup > 0 && <div style={{ display: "flex", justifyContent: "space-between" }}><span>Clean up fee</span><span>{fmt(price.cleanup)}</span></div>}
                    {price.deposit > 0 && <div style={{ display: "flex", justifyContent: "space-between" }}><span>Security deposit</span><span>{fmt(price.deposit)}</span></div>}
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--line)", marginTop: 8, paddingTop: 8, fontWeight: 700, fontSize: 15 }}><span>Estimated Total</span><span>{fmt(price.total)}</span></div>
                  </div>
                )}
                {pricesVisible && !price && (
                  <div style={{ marginTop: 12, fontSize: 11, color: "var(--ink-3)" }}>
                    {dateTimeRequirementMessage}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      ))}

      {venues.length === 0 && (
        <div style={{ color: "var(--ink-3)", fontStyle: "italic", padding: "20px 0" }}>
          No venues available for selection.
        </div>
      )}
    </div>
  );
}


// ----- Layout Preview Body (for stepType === "layout" inside ClientPreview) -----
function LayoutPreviewBody({ step, allSteps, answers, onAnswer, onLayoutRecommendations }) {
  const Ic = window.Icons;
  const spaceReqs = step.spaceRequirements || [];
  const floorLayouts = step.floorLayouts || {};
  const customLayoutSpaces = step.layoutSpaces || [];
  const layoutRentalRecommendationFields = layoutRecommendationFieldsForStep(step);
  const layoutRentalRecommendationFieldsForVenue = (venueId) => layoutRecommendationFieldsForStep(step, venueId);
  const [selectedSpaceReqs, setSelectedSpaceReqs] = React.useState([]);
  // Kept in answers so the selected layouts are retained in saved drafts and submissions.
  const selectedLayouts = answers._selectedLayouts || {}; // areaId -> layoutId
  const otherPlans = answers._layoutOtherPlans || {};
  const setOtherPlan = (areaId, patch) => {
    if (!onAnswer) return;
    onAnswer("_layoutOtherPlans", {
      ...otherPlans,
      [areaId]: {
        ...(otherPlans[areaId] || {}),
        ...patch,
      },
    });
  };
  const uploadOtherPlan = (areaId, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setOtherPlan(areaId, {
      fileName: file.name || "Floor layout plan",
      fileData: event.target.result || "",
    });
    reader.readAsDataURL(file);
  };

  // Find the venue step and selected venues
  const venueStep = allSteps.find((s) => s.stepType === "venue");
  const allVenues = venueStep ? (venueStep.venues || []).filter((v) => v.active && v.visibility !== "admin_only") : [];
  const selectedVenueIds = Array.isArray(answers._selectedVenueIds)
    ? answers._selectedVenueIds
    : answers._selectedVenueId
    ? [answers._selectedVenueId]
    : [];
  const selectedSubSpacesByVenue = answers._venueSubSpaces || {};

  // Get guest count from step 2 answers
  let guestCount = 0;
  allSteps.forEach((s) => {
    if (s.stepType === "venue" || s.stepType === "layout") return;
    (s.fields || []).forEach((f) => {
      const lab = (f.label || "").toLowerCase();
      if ((lab.includes("attendee") || lab.includes("number of guest") || lab.includes("number of attendees")) && answers[f.id]) {
        guestCount = parseInt(answers[f.id], 10) || 0;
      }
    });
  });

  const layoutAreaOrder = Array.isArray(step.layoutAreaOrder) ? step.layoutAreaOrder : [];
  const layoutAreaOrderMap = new Map(layoutAreaOrder.map((id, index) => [id, index]));

  // Get venue areas — only show for selected venues (or all if none selected), using the admin's saved order.
  const unorderedVenueAreas = [];
  allVenues.forEach((v) => {
    if (selectedVenueIds.length > 0 && !selectedVenueIds.includes(v.id)) return;
    if (floorLayouts[v.id]?.hasFloorLayoutPlan !== false && floorLayouts[v.id] && (floorLayouts[v.id].layouts || []).length > 0) {
      const layouts = floorLayouts[v.id].layouts || [];
      if (layouts.length > 0) unorderedVenueAreas.push({ id: v.id, venueId: v.id, name: v.name, layouts, blankFloorPlan: floorLayouts[v.id].blankFloorPlan || "" });
    }
    if (v.subSpace?.enabled) {
      const selectedSubSpaceId = selectedSubSpacesByVenue[v.id] || "";
      if (selectedSubSpaceId) {
        (v.subSpace.options || []).forEach((sub) => {
          if (sub.id !== selectedSubSpaceId) return;
          if (floorLayouts[sub.id]?.hasFloorLayoutPlan !== false && floorLayouts[sub.id] && (floorLayouts[sub.id].layouts || []).length > 0) {
            const layouts = floorLayouts[sub.id].layouts || [];
            if (layouts.length > 0) unorderedVenueAreas.push({ id: sub.id, venueId: v.id, name: sub.name + " (sub-space of " + v.name + ")", layouts, blankFloorPlan: floorLayouts[sub.id].blankFloorPlan || "" });
          }
        });
      }
    }
    customLayoutSpaces.filter((space) => space.venueId === v.id).forEach((space) => {
      const selectedSubSpaceId = selectedSubSpacesByVenue[v.id] || "";
      if (space.visibilityMode === "parent_without_subspace" && selectedSubSpaceId) return;
      if (floorLayouts[space.id]?.hasFloorLayoutPlan !== false && floorLayouts[space.id] && (floorLayouts[space.id].layouts || []).length > 0) {
        const layouts = floorLayouts[space.id].layouts || [];
        if (layouts.length > 0) unorderedVenueAreas.push({ id: space.id, venueId: v.id, name: space.name + " (" + v.name + ")", layouts, blankFloorPlan: floorLayouts[space.id].blankFloorPlan || "" });
      }
    });
  });
  const venueAreas = unorderedVenueAreas
    .map((area, index) => ({ ...area, _originalIndex: index }))
    .sort((a, b) => {
      const aOrder = layoutAreaOrderMap.has(a.id) ? layoutAreaOrderMap.get(a.id) : Number.MAX_SAFE_INTEGER;
      const bOrder = layoutAreaOrderMap.has(b.id) ? layoutAreaOrderMap.get(b.id) : Number.MAX_SAFE_INTEGER;
      return aOrder === bOrder ? a._originalIndex - b._originalIndex : aOrder - bOrder;
    })
    .map(({ _originalIndex, ...area }) => area);

  const toggleSpaceReq = (srId) => {
    setSelectedSpaceReqs((prev) => prev.includes(srId) ? prev.filter((x) => x !== srId) : [...prev, srId]);
  };

  const selectLayout = (venueId, layoutId) => {
    const next = { ...selectedLayouts, [venueId]: layoutId };
    onAnswer?.("_selectedLayouts", next);
    const byVenue = {};
    const aggregate = Object.entries(next).reduce((sum, [areaId, selectedLayoutId]) => {
      const layout = (floorLayouts[areaId]?.layouts || []).find((l) => l.id === selectedLayoutId);
      if (!layout) return sum;
      const area = venueAreas.find((candidate) => candidate.id === areaId);
      const fieldsForVenue = layoutRentalRecommendationFieldsForVenue(area?.venueId || areaId);
      const counts = getLayoutRentalRecommendations(layout, fieldsForVenue);
      byVenue[areaId] = addLayoutRecommendations(byVenue[areaId] || {}, counts);
      return addLayoutRecommendations(sum, counts);
    }, {});
    onLayoutRecommendations?.({ ...aggregate, __byVenue: byVenue });
  };

  const selectedLayoutSummary = venueAreas
    .map((area) => {
      const chosenId = selectedLayouts[area.id];
      const layout = area.layouts.find((l) => l.id === chosenId);
      if (!layout) return null;
      const maxSeats = Number(layout.capacityMax || layout.recommendedFor || 0);
      return {
        id: area.id,
        areaName: area.name.replace(/\s*\(sub-space of .*?\)\s*$/i, "").replace(/\s*\(.*?\)\s*$/i, ""),
        layoutName: layout.name || "Selected layout",
        people: maxSeats,
      };
    })
    .filter(Boolean);
  const totalLayoutCapacity = selectedLayoutSummary.reduce((sum, item) => sum + item.people, 0);
  const hasSelectedLayoutCapacity = totalLayoutCapacity > 0;
  const isGuestCountOverSelectedCapacity = !!guestCount && hasSelectedLayoutCapacity && guestCount > totalLayoutCapacity;

  return (
    <div>
      {/* ======= Space Requirements ======= */}
      <div style={{ marginBottom: 28 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Space Requirements</h4>
        <p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 10, lineHeight: 1.5 }}>Select the spaces you need for your event.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
          {spaceReqs.filter((sr) => sr.active && sr.name).map((sr) => (
            <label key={sr.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", padding: "5px 0" }}>
              <input type="checkbox" checked={selectedSpaceReqs.includes(sr.id)} onChange={() => toggleSpaceReq(sr.id)} style={{ accentColor: "var(--accent)", width: 15, height: 15, flexShrink: 0 }} />
              <span style={{ fontSize: 15 }}>{sr.icon}</span>
              <span>{sr.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ======= Floor Layouts per venue area ======= */}
      {venueAreas.map((area) => {
        const chosenId = selectedLayouts[area.id] || null;
        const chosenLayout = area.layouts.find((l) => l.id === chosenId) || null;
        const chosenMaxSeats = Number(chosenLayout?.capacityMax || chosenLayout?.recommendedFor || 0);

        return (
          <div key={area.id} style={{ marginBottom: 32, borderTop: "2px solid var(--line)", paddingTop: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{area.name} Floor Layout:</h4>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
              {/* Radio list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {area.layouts.map((layout) => (
                  <label key={layout.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, cursor: "pointer", padding: "6px 0" }}>
                    <input type="radio" name={"layout_" + area.id} checked={chosenId === layout.id} onChange={() => selectLayout(area.id, layout.id)} style={{ accentColor: "var(--accent)", marginTop: 2 }} />
                    <span>{layout.name}</span>
                  </label>
                ))}
                <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, cursor: "pointer", padding: "6px 0" }}>
                  <input type="radio" name={"layout_" + area.id} checked={chosenId === "_other_" + area.id} onChange={() => selectLayout(area.id, "_other_" + area.id)} style={{ accentColor: "var(--accent)", marginTop: 2 }} />
                  <span>Others</span>
                </label>
              </div>

              {/* Layout image */}
              <div style={{ minHeight: 180, background: "var(--surface-2)", borderRadius: 8, border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {chosenLayout && chosenLayout.image ? (
                  <img src={chosenLayout.image} alt={chosenLayout.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  <span style={{ fontSize: 12, color: "var(--ink-4)", textAlign: "center", padding: 20 }}>
                    {chosenLayout ? "No image available for this layout" : "Select a layout to see the floor plan"}
                  </span>
                )}
              </div>
            </div>

            {/* Recommended info box */}
            {chosenLayout && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 12 }}>
                <div style={{ gridColumn: "2 / 3", padding: "12px 14px", background: "var(--accent-soft)", border: "1px solid var(--accent-soft-line)", borderRadius: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ color: "var(--accent)", fontSize: 14 }}>i</span>
                    <strong style={{ fontSize: 13 }}>Maximum seating: {chosenMaxSeats || "TBD"} guests</strong>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--ink)", color: "#fff", display: "inline-grid", placeItems: "center", fontSize: 9, cursor: "help" }} title="This is a suggested layout and may/may not include all the space requirements you have selected.">●</span>
                  </div>
                  {chosenLayout.recommendedDescription && (
                    <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.6, paddingLeft: 20, marginTop: 6 }}>
                      {chosenLayout.recommendedDescription.split("\n").map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 6, fontStyle: "italic" }}>
                    This is a guide only. Final seating can be adjusted during review.
                  </div>
                </div>
              </div>
            )}
            {chosenId === "_other_" + area.id && (
              <div style={{ marginTop: 14, padding: 14, background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 8 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Floor Layout Plan:</h4>
                <p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 12, lineHeight: 1.5 }}>
                  Upload a floor layout you have in mind for {area.name}. Use one of our blank copies to help with sizes and proportions.
                  {area.blankFloorPlan && " "}
                  {area.blankFloorPlan && (
                    <a href={area.blankFloorPlan} download={area.name.replace(/\s+/g, "_") + "_blank_layout.png"} style={{ color: "var(--accent)", cursor: "pointer", textDecoration: "underline" }}>
                      Download {area.name} blank
                    </a>
                  )}
                </p>
                <div style={{ marginBottom: 10 }}>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    style={{ fontSize: 12 }}
                    onChange={(e) => {
                      uploadOtherPlan(area.id, e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                  {otherPlans[area.id]?.fileName && (
                    <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 6 }}>
                      Uploaded: {otherPlans[area.id].fileName}
                    </div>
                  )}
                </div>
                <textarea
                  className="cv-input"
                  rows={4}
                  value={otherPlans[area.id]?.notes || ""}
                  onChange={(e) => setOtherPlan(area.id, { notes: e.target.value })}
                  placeholder={`Please describe your desired floor plan, seating arrangement, or setup notes for ${area.name}.`}
                  style={{ width: "100%", fontSize: 13, lineHeight: 1.5 }}
                />
              </div>
            )}
          </div>
        );
      })}

      {selectedLayoutSummary.length > 0 && (
        <div
          className="cv-layout-summary cv-layout-summary-sticky"
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 14,
            alignItems: "center",
            margin: "6px 0 28px",
            padding: "10px 14px",
            border: `1px solid ${isGuestCountOverSelectedCapacity ? "#f1bca5" : "var(--accent-soft-line)"}`,
            borderRadius: 8,
            background: isGuestCountOverSelectedCapacity ? "#fff2ed" : "var(--accent-soft)",
            boxShadow: "0 8px 22px rgba(18, 24, 38, 0.08)",
          }}
        >
          <div className="cv-layout-summary-icon" style={{ color: "var(--accent)", display: "grid", placeItems: "center" }}>
            <Ic.Users size={34} />
          </div>
          <div>
            <div className="cv-layout-summary-kicker" style={{ color: "var(--ink-3)", fontSize: 11, marginBottom: 2 }}>Seating Summary</div>
            <div className="cv-layout-summary-total" style={{ color: "var(--ink)", fontSize: 15, fontWeight: 800 }}>
              Maximum seating for all selected layouts: {totalLayoutCapacity} guests
            </div>
            {!!guestCount && hasSelectedLayoutCapacity && (
              <div style={{ marginTop: 4, fontSize: 12, color: isGuestCountOverSelectedCapacity ? "var(--danger)" : "var(--ink-2)", fontWeight: isGuestCountOverSelectedCapacity ? 750 : 600, lineHeight: 1.35 }}>
                {isGuestCountOverSelectedCapacity
                  ? `Your guest count is ${guestCount}, which exceeds the available seating. Consider selecting a different layout or adding another area.`
                  : `Your guest count is ${guestCount}, which fits within the selected layouts.`}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

function rentalGroupDisplayMode(field) {
  return field.rentalDisplayMode || ((field.rentalGroup || field.label) === "Tables" ? "separate_items" : "grouped");
}

function rentalItemImage(item) {
  return item?.imageUrl || item?.rentalImageUrl || item?.rentalImage || item?.image || "";
}

function rentalGroupTileImage(items, groupName = "") {
  return rentalGroupImageForRows(items || [], groupName || items?.[0]?.category || "");
}

function rentalOptionPriceLabel(option) {
  if (!option || option.pricingModel === "included" || option.unitPrice === 0) return "";
  if (option.pricingModel === "quote") return "Quote";
  const price = Number(option.unitPrice || option.price || 0);
  return price > 0 ? "$" + price.toFixed(2) : "";
}

function RentalItemNameWithImage({ item, children }) {
  const image = rentalItemImage(item);
  return (
    <span className={"cv-rental-item-name" + (image ? " has-image" : "")}>
      {image && <span className="cv-rental-item-thumb"><img src={image} alt="" /></span>}
      <span className="cv-rental-item-copy">{children}</span>
    </span>
  );
}

function rentalCountOptions(min = 0, max = 99, step = 1) {
  const safeMin = Math.max(0, Number(min || 0));
  const safeMax = Math.max(safeMin, Math.min(Number(max || 99), 240));
  const safeStep = Math.max(1, Number(step || 1));
  const vals = [];
  for (let n = safeMin; n <= safeMax; n += safeStep) vals.push(n);
  return vals;
}

function rentalOptionGroupVisibilityValues(optionGroups = [], itemValue = {}, parentQty = itemValue.quantity) {
  const groupValues = itemValue.optionGroups || {};
  return (optionGroups || []).reduce((acc, group) => {
    const key = previewGroupKey(group);
    if (key === "__parent_quantity__") {
      acc[key] = parentQty;
      return acc;
    }
    const current = groupValues[key];
    acc[key] = current && typeof current === "object" && !Array.isArray(current) && Object.prototype.hasOwnProperty.call(current, "value")
      ? current.value
      : current;
    return acc;
  }, { __parent_quantity__: parentQty });
}

function RentalOptionGroupPreview({ item, group, allGroups, itemValue, onItemValue }) {
  const pricesVisible = useClientPricingVisible();
  const groupValues = itemValue.optionGroups || {};
  const current = groupValues[group.id];
  const visibilityGroups = [rentalParentVisibilitySource(item), ...(allGroups || item.optionGroups || [])];
  const visibilityValues = rentalOptionGroupVisibilityValues(visibilityGroups, itemValue);
  if (!isRentalQuestionVisible(group, visibilityGroups, visibilityValues)) return null;
  const setGroup = (value) => onItemValue({ ...itemValue, optionGroups: { ...groupValues, [group.id]: value } });
  const options = (group.options || []).map(normalizeRentalChoiceOption);
  const groupPrice = previewChoicePriceLabel(group);
  const groupLabel = (fallback) => (
    <div className="cv-rental-field-label cv-rental-priced-label">
      <span>
        {group.label || fallback}{group.required && <span className="cv-req"> *</span>}
        <RentalInfoIcon text={group.infoText || group.description} imageUrl={group.infoImageUrl || group.imageUrl} images={rentalTooltipImages(group)} />
      </span>
      {pricesVisible && groupPrice && <span className="cv-rental-field-price">{groupPrice}</span>}
    </div>
  );

  if (group.type === "quantity") {
    return (
      <div>
        {groupLabel(item.name)}
        <select className="cv-input cv-select" value={current ?? ""} onChange={(e) => setGroup(Number(e.target.value))}>
          <option value="">Select one</option>
          {rentalCountOptions(group.min || 0, group.max || 99, group.step || 1).map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
    );
  }

  if (group.type === "number") {
    return (
      <div>
        {groupLabel(item.name)}
        <input
          className="cv-input"
          type="number"
          min={group.min ?? group.minCount ?? 0}
          max={group.max ?? group.maxCount ?? undefined}
          step={group.step ?? group.stepCount ?? 1}
          value={current ?? ""}
          placeholder={group.placeholder || ""}
          onChange={(e) => setGroup(e.target.value === "" ? "" : Number(e.target.value))}
        />
      </div>
    );
  }

  if (group.type === "select") {
    return (
      <div>
        {groupLabel("Select option")}
        <select className="cv-input cv-select cv-rental-inline-select" value={current || ""} onChange={(e) => setGroup(e.target.value)}>
          <option value="">{group.placeholder || "Select one"}</option>
          {options.map((opt) => <option key={opt.id || opt.label} value={opt.id || opt.label}>{opt.label}</option>)}
        </select>
      </div>
    );
  }

  if (group.type === "multi_quantity") {
    return (
      <div>
        <div className="cv-rental-subline cv-rental-priced-label">
          <span>
            {group.label}
            <RentalInfoIcon text={group.infoText || group.description} imageUrl={group.infoImageUrl || group.imageUrl} images={rentalTooltipImages(group)} />
          </span>
          {pricesVisible && groupPrice && <span className="cv-rental-field-price">{groupPrice}</span>}
        </div>
        {options.map((opt) => {
          const optId = opt.id || opt.label;
          const val = (current && current[optId]) || "";
          return (
            <label className="cv-rental-option-row" key={optId}>
              <span>
                {opt.label}
                <RentalInfoIcon text={opt.infoText || opt.description} imageUrl={opt.infoImageUrl || opt.imageUrl} images={rentalTooltipImages(opt)} />
                :{pricesVisible && rentalOptionPriceLabel(opt) && <span className="cv-rental-price">({rentalOptionPriceLabel(opt)} each)</span>}
              </span>
              <select className="cv-input cv-select cv-rental-inline-select" value={val} onChange={(e) => setGroup({ ...(current || {}), [optId]: Number(e.target.value) })}>
                <option value="">Select one</option>
                {rentalCountOptions(opt.minCount || 0, opt.maxCount || 99, opt.stepCount || 1).map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      {groupLabel("Select option")}
      {options.map((opt) => {
        const optId = opt.id || opt.label;
        const selected = (typeof current === "object" ? current?.value : current) === optId;
        return (
          <label className="cv-rental-option-row" key={optId}>
            <input type="radio" name={item.id + "_" + group.id} checked={selected} onChange={() => setGroup({ value: optId, label: opt.label })} />
            <span>
              {opt.label}
              <RentalInfoIcon text={opt.infoText || opt.description} imageUrl={opt.infoImageUrl || opt.imageUrl} images={rentalTooltipImages(opt)} />
              {pricesVisible && rentalOptionPriceLabel(opt) && <span className="cv-rental-price">({rentalOptionPriceLabel(opt)} each)</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function RentalItemDetailPreview({ item, value, onChange, grouped, recommendedCount }) {
  const Ic = window.Icons;
  const pricesVisible = useClientPricingVisible();
  const itemValue = value || {};
  const hasOptionGroups = (item.optionGroups || []).length > 0;
  const priceLabel = workflowRentalPriceLabel(item);
  const needsParentQuantity = rentalOptionGroupsNeedParentQuantity(item);
  const showBaseQuantity = !rentalUsesFixedBaseQuantity(item) && (needsParentQuantity || !item.hideBaseQuantity);
  const applyRecommendedQuantity = () => {
    const qty = Number(recommendedCount || 0);
    if (!qty) return;
    const groupValues = itemValue.optionGroups || {};
    const nextGroups = { ...groupValues };
    (item.optionGroups || []).forEach((group) => {
      if (["quantity", "number"].includes(group.type)) nextGroups[group.id] = qty;
    });
    onChange({ ...itemValue, quantity: qty, optionGroups: nextGroups });
  };
  return (
    <div className={grouped ? "cv-rental-group-item" : "cv-rental-detail"}>
      {!grouped && (
        <div className="cv-rental-detail-head" style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <RentalItemNameWithImage item={item}>
            {item.name}: <RentalInfoIcon text={item.infoText} imageUrl={item.infoImageUrl} images={rentalTooltipImages(item)} />
            {rentalRequiresDelivery(item) && <DeliveryIndicator />}
          </RentalItemNameWithImage>
          {pricesVisible && <span style={{ fontWeight: 500 }}>{priceLabel}</span>}
        </div>
      )}
      <div className="cv-rental-detail-body">
        {item.notes && <p className="cv-rental-detail-desc">{item.notes}</p>}
        {showBaseQuantity && (
          <div>
            {Number(recommendedCount || 0) > 0 && (
              <p className="cv-rental-detail-desc" style={{ marginBottom: 6 }}>
                Choose the number you wish to add to quote, or{" "}
                <button type="button" onClick={applyRecommendedQuantity} style={{ border: 0, background: "transparent", color: "var(--accent)", textDecoration: "underline", padding: 0, cursor: "pointer", font: "inherit" }}>
                  click here
                </button>{" "}
                to add the recommended {recommendedCount} based on the selected floor layout.
              </p>
            )}
            <div className="cv-rental-field-label cv-rental-priced-label">
              <span># of {item.name}</span>
              {pricesVisible && previewItemPriceLabel(item) && <span className="cv-rental-field-price">{previewItemPriceLabel(item)}</span>}
            </div>
            <select className="cv-input cv-select" value={itemValue.quantity ?? ""} onChange={(e) => onChange({ ...itemValue, quantity: Number(e.target.value) })}>
              <option value="">Select one</option>
              {rentalCountOptions(item.minUnits || 0, item.maxUnits || 99, item.increment || 1).map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        )}
        {hasOptionGroups ? (
          (item.optionGroups || []).map((group) => (
            <RentalOptionGroupPreview key={group.id} item={item} group={group} allGroups={item.optionGroups || []} itemValue={itemValue} onItemValue={onChange} />
          ))
        ) : (
          !grouped && pricesVisible && <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{workflowRentalPriceLabel(item)}</div>
        )}
      </div>
    </div>
  );
}

function rentalItemNeedsDetail(item) {
  if (!item) return false;
  if ((item.optionGroups || []).length > 0) return true;
  if (item.packageBehavior) return true;
  if (rentalOptionGroupsNeedParentQuantity(item) || (!item.hideBaseQuantity && !rentalUsesFixedBaseQuantity(item))) return true;
  return false;
}

function rentalSelectedQuantity(item, itemValue = {}) {
  if (itemValue.quantity !== undefined && itemValue.quantity !== "") return Number(itemValue.quantity || 0);
  const groupValues = itemValue.optionGroups || {};
  const quantityGroup = (item.optionGroups || []).find((group) => ["quantity", "number"].includes(group.type));
  if (quantityGroup && groupValues[quantityGroup.id] !== undefined && groupValues[quantityGroup.id] !== "") {
    return Number(groupValues[quantityGroup.id] || 0);
  }
  if (rentalUsesFixedBaseQuantity(item)) return 1;
  if (rentalOptionGroupsNeedParentQuantity(item)) return 0;
  if (item.hideBaseQuantity) return 1;
  return 0;
}

function rentalOptionCharge(option, quantity, parentQty) {
  if (!option) return null;
  const parsedPrice = rentalPriceFromText(option.priceText || option.label || "");
  const unitPrice = Number(option.unitPrice ?? option.price ?? parsedPrice ?? 0);
  const hasPrice = unitPrice > 0 || option.priceEnabled || option.priceMode === "priced";
  const model = option.pricingModel || (option.priceMode === "quote" ? "quote" : option.priceMode === "priced" ? "flat_per_item" : hasPrice ? "flat_per_item" : "included");
  if (model === "quote") return { label: option.label || "Quoted option", total: 0, quote: true };
  if (model === "included" || unitPrice <= 0) return null;
  const qty = Number(quantity || 0);
  const multiplier = (option.quantitySource || "fixed") === "parent" ? Number(parentQty || 0) : ((option.quantitySource || "own") === "own" ? qty : 1);
  if (multiplier <= 0) return null;
  return { label: option.label || "Rental option", unitPrice, quantity: multiplier, total: unitPrice * multiplier };
}

function rentalOptionGroupsCost(item, itemValue = {}, parentQty = 1) {
  const lines = [];
  const values = itemValue.optionGroups || {};
  const visibilityGroups = [rentalParentVisibilitySource(item), ...(item.optionGroups || [])];
  const visibilityValues = rentalOptionGroupVisibilityValues(visibilityGroups, itemValue, parentQty);
  visibleRentalQuestionsForPreview(visibilityGroups, visibilityValues).filter((group) => group.id !== "__parent_quantity__").forEach((group) => {
    const options = (group.options || []).map((opt) => typeof opt === "string" ? { id: opt, label: opt } : opt);
    const current = values[group.id];
    if (!current) return;
    if (["quantity", "number"].includes(group.type)) {
      const charge = rentalOptionCharge({ ...group, label: group.label || item.name, quantitySource: group.quantitySource || "own" }, Number(current || 0), parentQty);
      if (charge) lines.push({ ...charge, parentLabel: item.name || "" });
    } else if (["radio", "select"].includes(group.type)) {
      // A priced client-choice group is an additional charge of its own. It
      // must be included alongside (not replaced by) the selected option's
      // price, matching the admin preview calculation.
      const groupCharge = rentalOptionCharge({
        ...group,
        label: group.label || "Client choice",
        quantitySource: group.quantitySource || "fixed",
      }, 1, parentQty);
      if (groupCharge) lines.push({ ...groupCharge, parentLabel: "" });

      const selectedId = typeof current === "object" ? current.value : current;
      const currentLabel = typeof current === "object" ? current.label : "";
      const option = options.find((opt) => String(opt.id || opt.label) === String(selectedId)) || (currentLabel ? { label: currentLabel } : null);
      const optionLabel = option?.label || "";
      const cleanOptionLabel = optionLabel.replace(/\s*\([^)]*\$\d[^)]*\)\s*/g, "").trim();
      const label = /^(yes|add)$/i.test(cleanOptionLabel) ? (group.label || cleanOptionLabel || optionLabel) : (cleanOptionLabel || optionLabel);
      const charge = rentalOptionCharge({ ...option, label, priceText: option?.priceText || optionLabel, quantitySource: option?.quantitySource || group.quantitySource || "parent" }, parentQty, parentQty);
      if (charge) lines.push({ ...charge, parentLabel: group.label || "" });
    } else if (group.type === "multi_quantity") {
      options.forEach((option) => {
        const optId = option.id || option.label;
        const charge = rentalOptionCharge(option, Number(current[optId] || 0), parentQty);
        if (charge) lines.push({ ...charge, parentLabel: group.label || "" });
      });
    } else if (group.type === "checkbox_row") {
      const checked = typeof current === "object" ? current.checked !== false : !!current;
      if (!checked) return;
      const rowQty = typeof current === "object" ? Number(current.quantity || current.count || current.value || 0) : parentQty;
      const charge = rentalOptionCharge({ ...group, label: group.label || item.name, quantitySource: group.quantitySource || "own" }, rowQty || parentQty, parentQty);
      if (charge) lines.push({ ...charge, parentLabel: group.label || "" });
    }
  });
  return { lines, total: lines.reduce((sum, line) => sum + Number(line.total || 0), 0) };
}

function rentalItemCostLine(item, itemValue = {}) {
  const qty = rentalSelectedQuantity(item, itemValue);
  const base = computeRentalQuoteLine(item, qty, { hours: qty, guests: qty });
  const optionCost = rentalOptionGroupsCost(item, itemValue, qty);
  const lines = [];
  if (base.total > 0) lines.push({ label: base.multiplier > 1 ? item.name + " x " + base.multiplier : item.name, total: base.total });
  optionCost.lines.forEach((line) => lines.push(line));
  return { label: item.name, total: base.total + optionCost.total, lines };
}

function computeRentalFieldsCost(step, stepState = {}, venue = null) {
  const groups = [];
  const venueId = venue?.id || "";
  (step.fields || []).filter((field) => field.type === "rental_group" && field.visibleToClient !== false).forEach((field) => {
    const fieldState = stepState[field.id] || {};
    const items = workflowRentalCatalogItems(field.rentalGroup || field.label, venueId);
    const mode = rentalGroupDisplayMode(field);
    // Grouped rentals only count while their parent group is checked. This
    // also protects totals from stale nested selections in older saved drafts.
    const selectedIds = new Set(
      mode === "separate_items" || fieldState.groupSelected
        ? Object.keys(fieldState.selectedItems || {})
        : []
    );
    if (mode === "grouped" && fieldState.groupSelected && items.length === 1) selectedIds.add(items[0].id);
    const lines = [];
    const deliveryItems = [];
    items.filter((item) => selectedIds.has(item.id)).forEach((item) => {
      const result = rentalItemCostLine(item, (fieldState.itemValues || {})[item.id] || {});
      result.lines.forEach((line) => lines.push(line));
      if (rentalRequiresDelivery(item)) deliveryItems.push({ itemId: item.id, label: item.name, deliveryOptionId: item.deliveryOptionId });
    });
    if (lines.length > 0 || deliveryItems.length > 0) {
      groups.push({
        fieldId: field.id,
        fieldLabel: field.label || field.rentalGroup || "Rentals",
        venueId,
        venueName: venue?.name || "",
        total: lines.reduce((sum, line) => sum + Number(line.total || 0), 0),
        lines,
        deliveryItems,
      });
    }
  });
  return groups;
}

function computeWorkflowRentalCost(steps, rentalAnswers = {}) {
  const groups = [];
  (steps || []).forEach((step) => {
    const stepState = rentalAnswers[step.id] || {};
    if (stepState.__byVenue && typeof stepState.__byVenue === "object") {
      Object.entries(stepState.__byVenue).forEach(([venueId, venueState]) => {
        const venueName = stepState.__venueNames?.[venueId] || "";
        groups.push(...computeRentalFieldsCost(step, venueState || {}, { id: venueId, name: venueName }));
      });
    } else {
      groups.push(...computeRentalFieldsCost(step, stepState, null));
    }
  });
  return groups;
}

function defaultRentalExtrasField() {
  return {
    id: "f_rent_extras",
    label: "Extras",
    type: "extras",
    required: false,
    visibleToClient: true,
    linkedToPricing: true,
    category: "Rentals",
    amountLabel: "Total Extra Amount",
    descriptionLabel: "Description",
    placeholder: "Enter any details here for any item you wish to have at your event that is not listed above.\nCollaburo will try to get you the items you are looking for but makes no promises.",
  };
}

function rentalExtrasFieldsFromSteps(steps = []) {
  return (steps || [])
    .flatMap((step) => (step.fields || []).map((field) => ({ ...field, stepId: step.id, stepName: step.name || "" })))
    .filter((field) => field.type === "extras");
}

function rentalExtrasLinesFromAnswers(steps = [], answers = {}) {
  return rentalExtrasFieldsFromSteps(steps)
    .map((field) => {
      const value = answers[field.id];
      const current = value && typeof value === "object" ? value : {};
      const total = Number(current.amount || 0);
      if (!total || field.linkedToPricing === false) return null;
      return {
        id: field.id,
        label: field.label || "Extras",
        group: field.stepName || "Rentals",
        meta: current.description || "",
        quantity: 1,
        total,
        rentalExtraLine: true,
      };
    })
    .filter(Boolean);
}

function splitSpaceContentCost(costData = {}) {
  const allLines = costData.spaceContentLines || [];
  const extrasLines = allLines.filter((line) => line.adminRentalExtra || line.rentalExtraLine);
  const lineExtrasTotal = extrasLines.reduce((sum, line) => sum + Number(line.total || 0), 0);
  const extrasTotal = Number(costData.rentalExtrasTotal ?? costData.adminAdjustments?.rentalExtras ?? lineExtrasTotal);
  return {
    rentalsTotal: Math.max(0, Number(costData.spaceContentTotal || 0) - extrasTotal),
    extrasTotal,
    rentalLines: allLines.filter((line) => !line.adminRentalExtra && !line.rentalExtraLine),
    extrasLines,
  };
}

function costSubtotalForDisplay(costs = {}) {
  return (costs.discountLines || []).length > 0 ? Number(costs.discountedSubtotal ?? costs.subtotal ?? 0) : Number(costs.subtotal || 0);
}

function summaryDiscountRows(costs = {}) {
  const automaticTotal = (costs.discountLines || [])
    .filter((line) => !(line?.adminOnly || line?.id === "additional_discount"))
    .reduce((sum, line) => sum + Math.abs(Number(line.total || 0)), 0);
  const adminTotal = (costs.discountLines || [])
    .filter((line) => line?.adminOnly || line?.id === "additional_discount")
    .reduce((sum, line) => sum + Math.abs(Number(line.total || 0)), 0);
  return [
    ...(automaticTotal > 0 ? [{ id: "discount_total", label: "Discount", total: -automaticTotal }] : []),
    ...(adminTotal > 0 ? [{ id: "additional_discount", label: "Additional Discount", total: -adminTotal }] : []),
  ];
}

function ClientRentalGroupsPreview({ fields, value, onChange, title, layoutRecommendations, venueId = "" }) {
  const Ic = window.Icons;
  const pricesVisible = useClientPricingVisible();
  const rentalState = value || {};
  const allTiles = [];
  fields.forEach((field) => {
    const mode = rentalGroupDisplayMode(field);
    const items = workflowRentalCatalogItems(field.rentalGroup || field.label, venueId);
    if (mode === "separate_items") {
      items.forEach((item) => allTiles.push({ type: "item", field, item, key: field.id + ":" + item.id }));
    } else {
      allTiles.push({ type: "group", field, items, key: field.id + ":group" });
    }
  });
  const isTileSelected = (tile) => {
    const fieldState = rentalState[tile.field.id] || {};
    return tile.type === "group" ? !!fieldState.groupSelected : !!fieldState.selectedItems?.[tile.item.id];
  };
  const setFieldState = (fieldId, nextFieldState) => onChange({ ...rentalState, [fieldId]: nextFieldState });
  const toggleTile = (tile) => {
    const fieldState = rentalState[tile.field.id] || {};
    if (tile.type === "group") {
      if (fieldState.groupSelected) {
        // Deselecting a group is a full reset: nested item checks, quantities,
        // and client-choice answers must not survive in the cost summary.
        setFieldState(tile.field.id, { ...fieldState, groupSelected: false, selectedItems: {}, itemValues: {} });
      } else {
        setFieldState(tile.field.id, { ...fieldState, groupSelected: true });
      }
      return;
    }
    const selectedItems = { ...(fieldState.selectedItems || {}) };
    const itemValues = { ...(fieldState.itemValues || {}) };
    if (selectedItems[tile.item.id]) {
      delete selectedItems[tile.item.id];
      delete itemValues[tile.item.id];
    } else {
      selectedItems[tile.item.id] = true;
    }
    setFieldState(tile.field.id, { ...fieldState, selectedItems, itemValues });
  };
  const heading = title || fields[0]?.rentalPreviewHeading || "Rental Groups";
  return (
    <div className="rental-client-preview cv-rental-groups">
      <div className="rental-client-preview-head">
        <div>
          <h3>{fields[0]?.stepRentalTitle || "Rental Groups"}</h3>
          <p>Select the rental groups or items needed for this event. Details appear after a selection is checked.</p>
        </div>
      </div>
      <div className="rental-client-preview-body">
        <div className="rental-client-form">
          <div className="rental-client-field">
            <div className="rental-client-label-row">
              <label>{heading}</label>
            </div>
            <div className="cv-rental-picker-row">
              {allTiles.map((tile) => {
                const selected = isTileSelected(tile);
                const label = tile.type === "group" ? tile.field.label : tile.item.name.replace(/Table$/, "Tables");
                const img = tile.type === "item" ? rentalItemImage(tile.item) : rentalGroupTileImage(tile.items, tile.field.rentalGroup || tile.field.label);
                return (
                  <div key={tile.key} className={"cv-rental-pick" + (selected ? " sel" : "")} onClick={() => toggleTile(tile)}>
                    <input className="cv-rental-pick-check" type="checkbox" checked={selected} readOnly />
                    <div className="cv-rental-pick-thumb">
                      {img ? <img src={img} alt={label} /> : <span style={{ fontSize: 11, color: "#777", fontWeight: 700 }}>{label}</span>}
                    </div>
                    <div className="cv-rental-pick-name">
                      {label}
                      {tile.type === "item" && <RentalInfoIcon text={tile.item.infoText} imageUrl={tile.item.infoImageUrl} images={rentalTooltipImages(tile.item)} />}
                      {tile.type === "item" && rentalRequiresDelivery(tile.item) && <DeliveryIndicator />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="cv-rental-detail-grid">
            {fields.map((field) => {
              const mode = rentalGroupDisplayMode(field);
              const fieldState = rentalState[field.id] || {};
              const items = workflowRentalCatalogItems(field.rentalGroup || field.label, venueId);
              if (mode === "separate_items") {
                return items.filter((item) => fieldState.selectedItems?.[item.id]).map((item) => (
                  <RentalItemDetailPreview
                    key={field.id + "_" + item.id}
                    item={item}
                    recommendedCount={layoutRecommendationCountForItem(item, layoutRecommendations)}
                    value={(fieldState.itemValues || {})[item.id]}
                    onChange={(nextItem) => setFieldState(field.id, { ...fieldState, itemValues: { ...(fieldState.itemValues || {}), [item.id]: nextItem } })}
                  />
                ));
              }
              if (!fieldState.groupSelected) return null;
              const singleGroupedItem = mode === "grouped" && items.length === 1 ? items[0] : null;
              if (singleGroupedItem) {
                return (
                  <RentalItemDetailPreview
                    key={field.id + "_" + singleGroupedItem.id}
                    item={singleGroupedItem}
                    recommendedCount={layoutRecommendationCountForItem(singleGroupedItem, layoutRecommendations)}
                    value={(fieldState.itemValues || {})[singleGroupedItem.id]}
                    onChange={(nextItem) => setFieldState(field.id, { ...fieldState, itemValues: { ...(fieldState.itemValues || {}), [singleGroupedItem.id]: nextItem } })}
                  />
                );
              }
              return (
                <div key={field.id} className="cv-rental-detail cv-rental-group-panel">
                  <div className="cv-rental-detail-head">{field.label}:</div>
                  <div className="cv-rental-detail-body">
                    <div className="cv-rental-group-list">
                      {items.map((item) => {
                        const itemOn = !!fieldState.selectedItems?.[item.id];
                        return (
                          <div className="cv-rental-group-item" key={item.id}>
                            <label className="cv-rental-option-row" style={{ margin: 0 }}>
                              <input
                                type="checkbox"
                                checked={itemOn}
                                onChange={() => {
                                  const selectedItems = { ...(fieldState.selectedItems || {}) };
                                  const itemValues = { ...(fieldState.itemValues || {}) };
                                  if (selectedItems[item.id]) {
                                    delete selectedItems[item.id];
                                    delete itemValues[item.id];
                                  } else {
                                    selectedItems[item.id] = true;
                                  }
                                  setFieldState(field.id, { ...fieldState, selectedItems, itemValues });
                                }}
                              />
                              <RentalItemNameWithImage item={item}>
                                <strong>{item.name}</strong>
                                <RentalInfoIcon text={item.infoText} imageUrl={item.infoImageUrl} images={rentalTooltipImages(item)} />
                                {rentalRequiresDelivery(item) && <DeliveryIndicator />}
                              </RentalItemNameWithImage>
                              {pricesVisible && <span>{workflowRentalPriceLabel(item)}</span>}
                            </label>
                        {itemOn && rentalItemNeedsDetail(item) && (
                          <RentalItemDetailPreview
                                item={item}
                                grouped
                                recommendedCount={layoutRecommendationCountForItem(item, layoutRecommendations)}
                                value={(fieldState.itemValues || {})[item.id]}
                                onChange={(nextItem) => setFieldState(field.id, { ...fieldState, itemValues: { ...(fieldState.itemValues || {}), [item.id]: nextItem } })}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientVenueRentalGroupsPreview({ fields, value, onChange, title, layoutRecommendations, venues = [] }) {
  const rentalValue = value || {};
  const scopedVenues = (venues || []).filter((venue) => venue && venue.id);
  if (scopedVenues.length === 0) {
    return (
      <ClientRentalGroupsPreview
        fields={fields}
        value={rentalValue}
        onChange={onChange}
        title={title}
        layoutRecommendations={layoutRecommendations}
      />
    );
  }
  const byVenue = rentalValue.__byVenue || {};
  const venueNames = Object.fromEntries(scopedVenues.map((venue) => [venue.id, venue.name || "Venue"]));
  const legacyVenueValue = Object.fromEntries(Object.entries(rentalValue).filter(([key]) => !key.startsWith("__")));
  const setVenueValue = (venueId, nextVenueValue) => {
    onChange({
      ...rentalValue,
      __venueNames: venueNames,
      __byVenue: {
        ...byVenue,
        [venueId]: nextVenueValue,
      },
    });
  };
  return (
    <div className="cv-rental-venue-stack">
      {scopedVenues.map((venue) => {
        const venueRecommendations = layoutRecommendations?.__byVenue?.[venue.id] || layoutRecommendations;
        return (
          <section className="cv-rental-venue-section" key={venue.id}>
            {scopedVenues.length > 1 && <h4>{venue.name} Rentals</h4>}
            <ClientRentalGroupsPreview
              fields={fields}
              value={byVenue[venue.id] || (scopedVenues.length === 1 ? legacyVenueValue : {})}
              onChange={(next) => setVenueValue(venue.id, next)}
              title={title}
              layoutRecommendations={venueRecommendations}
              venueId={venue.id}
            />
          </section>
        );
      })}
    </div>
  );
}

function CheckoutPreviewBody({ step, costData, value, onChange, onBreakdown, summaryLocked, lockedMessage }) {
  const pricesVisible = useClientPricingVisible();
  const checkout = step.checkout || {};
  const summaryItems = checkout.summaryItems || {};
  const agreements = checkout.agreements || [];
  const fmt = (n) => "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const planningNoteLines = String(checkout.planningNote || "").split("\n").filter((line) => line.trim());
  const splitContent = splitSpaceContentCost(costData);
  const visibleQuoteRows = [
    ["spaceRental", "Space Rental", costData.spaceRentalTotal, costData.spaceLines],
    ["spaceContentRentals", "Space Content Rentals", splitContent.rentalsTotal, splitContent.rentalLines],
    ["spaceExtraCosts", "Space Extra Costs", splitContent.extrasTotal, splitContent.extrasLines],
    ["cateringCost", "Catering Cost", costData.cateringTotal, costData.cateringLines],
    ["setupServiceCost", "Set up Service Cost", costData.setupTotal, costData.setupLines],
    ["eventServiceCost", "Event Service Cost", costData.eventTotal, costData.eventLines],
    ["cleanupServiceCost", "Clear up Service Cost", costData.cleanupTotal, costData.cleanupLines],
  ].filter(([key]) => summaryItems[key] !== false);
  const setAgreement = (id, checked) => onChange({ ...(value || {}), [id]: checked });
  const agreementsEl = (
    <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
      {agreements.map((agreement) => (
        <label key={agreement.id} className="cv-toggle-row" style={{ alignItems: "flex-start", lineHeight: 1.35 }}>
          <input
            type="checkbox"
            checked={!!value?.[agreement.id]}
            onChange={(e) => setAgreement(agreement.id, e.target.checked)}
            style={{ marginTop: 2, accentColor: "var(--accent)" }}
          />
          <span>{agreement.label}{agreement.required !== false && <span className="cv-req"> *</span>}</span>
        </label>
      ))}
      {planningNoteLines.length > 0 && (
        <div style={{ marginTop: 18, fontSize: 13, lineHeight: 1.55, color: "var(--ink)" }}>
          {planningNoteLines.map((line, index) => {
            const match = line.match(/^\s*(NOTE:)(.*)$/i);
            return (
              <p key={index} style={{ margin: index === 0 ? 0 : "10px 0 0" }}>
                {match ? (
                  <>
                    <strong>{match[1]}</strong>{match[2]}
                  </>
                ) : line}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
  if (!pricesVisible) {
    return (
      <div style={{ maxWidth: 720, margin: "8px auto 0" }}>
        <div style={{ color: "var(--danger)", background: "var(--danger-soft)", border: "1px solid #f0c9c0", borderRadius: 6, padding: "12px 14px", fontSize: 12.5, fontWeight: 650, lineHeight: 1.4 }}>
          {lockedMessage || "Verify your email address to view pricing and the cost summary."}
        </div>
        {checkout.confirmationMessage && (
          <div style={{ borderTop: "1px solid #e6ded8", marginTop: 14, paddingTop: 14, fontSize: 12.5, fontWeight: 700, lineHeight: 1.45 }}>
            {checkout.confirmationMessage}
          </div>
        )}
        {agreementsEl}
      </div>
    );
  }
  return (
    <div style={{ maxWidth: 720, margin: "8px auto 0" }}>
      <div className="cv-cost-sidebar" style={{ width: "100%", position: "static", boxShadow: "0 6px 18px rgba(40,31,20,.04)", padding: 22, fontSize: 13 }}>
        <div className="cv-cost-title">Summary</div>
        {summaryLocked ? (
          <div style={{ color: "var(--danger)", background: "var(--danger-soft)", border: "1px solid #f0c9c0", borderRadius: 6, padding: "12px 14px", fontSize: 12.5, fontWeight: 650, lineHeight: 1.4 }}>
            {lockedMessage || "Please provide a valid email to view the final cost breakdown."}
          </div>
        ) : (
          <>
            <div className="cv-cost-section-title">Total Quote:</div>
            {visibleQuoteRows.map(([key, label, amount, lines]) => (
              <div className="cv-cost-row" key={key}>
                <span className="cv-cost-bullet">
                  <span className="cv-cost-bullet-dot">•</span>
                  <button className="cv-cost-link" type="button" onClick={() => onBreakdown(label, amount, lines || [])}>{label}</button>
                </span>
                <span>{fmt(amount)}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid #e6ded8", marginTop: 12, paddingTop: 10 }}>
              {summaryDiscountRows(costData).map((discount) => (
                <div className="cv-cost-row" key={discount.id || discount.label}>
                  <span>{discount.label}</span>
                  <span>{fmt(discount.total)}</span>
                </div>
              ))}
              <div className="cv-cost-row"><span>Subtotal</span><span>{fmt(costSubtotalForDisplay(costData))}</span></div>
              {(costData.feeLines || []).filter((fee) => summaryItems.tax !== false || !/tax/i.test(fee.label)).map((fee) => (
                <div className="cv-cost-row" key={fee.id || fee.label}>
                  <span>{fee.displayLabel || fee.label}</span>
                  <span>{fmt(fee.total)}</span>
                </div>
              ))}
            </div>
            <div className="cv-cost-row cv-cost-total-band"><span>Total</span><span>{fmt(costData.total)}</span></div>
            {summaryItems.securityDeposit !== false && (
              <div className="cv-cost-row"><span>Security Deposit (refundable)</span><span>{fmt(costData.securityDeposit)}</span></div>
            )}
            {summaryItems.totalWithSecurityDeposit !== false && (
              <div className="cv-cost-row"><span>Total with Security Deposit</span><span>{fmt(costData.totalWithDeposit)}</span></div>
            )}
          </>
        )}
        {checkout.confirmationMessage && (
          <div style={{ borderTop: "1px solid #e6ded8", marginTop: 14, paddingTop: 14, fontSize: 12.5, fontWeight: 700, lineHeight: 1.45 }}>
            {checkout.confirmationMessage}
          </div>
        )}
        {agreementsEl}
      </div>
    </div>
  );
}

// Central policy for the shared form's admin-only exceptions. Future field-level
// overrides can be added by field id without branching the client form.
const ADMIN_BOOKING_FORM_OVERRIDES = {
  validations: { strictProgression: true, emailVerification: true, requiredFields: true },
  fieldIds: {},
};

function ClientPreview({ steps, pricingRules, siteSettings, onSubmitRequest, onClose, startStepId, publicMode = false, adminEditMode = false, initialDraft = null, renderAdminActions = null }) {
  const Ic = window.Icons;
  const site = normalizeSiteSettings(siteSettings || SAMPLE_SITE_SETTINGS);
  const branding = site.branding || {};
  const validations = site.validations || {};
  const list = steps.filter((s) =>
    s.stepType === "venue"
      ? (s.venues || []).some((v) => v.active && v.visibility !== "admin_only")
      : s.stepType === "layout"
      ? true
      : s.stepType === "checkout"
      ? true
      : s.fields.length > 0 && s.fields.some((f) => f.visibleToClient !== false)
  );
  const startIdx = startStepId ? Math.max(0, list.findIndex((s) => s.id === startStepId)) : 0;
  const initialClientDraft = (publicMode || adminEditMode) ? initialDraft : null;
  const [costAdminAdjustments, setCostAdminAdjustments] = React.useState(() => initialClientDraft?.costAdminAdjustments || {});
  const [additionalDiscountEditing, setAdditionalDiscountEditing] = React.useState(false);
  const [rentalExtrasEditing, setRentalExtrasEditing] = React.useState(false);
  const [securityDepositEditing, setSecurityDepositEditing] = React.useState(false);

  const [stepIdx, setStepIdx] = React.useState(() => initialClientDraft ? Math.min(initialClientDraft.stepIdx, Math.max(0, list.length - 1)) : startIdx);
  const [answers, setAnswers] = React.useState(() => initialClientDraft?.answers || {});
  const [venueCost, setVenueCost] = React.useState(() => initialClientDraft?.venueCost || null);
  const [layoutRecommendations, setLayoutRecommendations] = React.useState(() => initialClientDraft?.layoutRecommendations || {});
  const [costBreakdown, setCostBreakdown] = React.useState(null);
  const [validationErrors, setValidationErrors] = React.useState({});
  const [validationPulseKey, setValidationPulseKey] = React.useState(0);
  const [clientNotice, setClientNotice] = React.useState(null);
  const [submitState, setSubmitState] = React.useState({ status: "idle", message: "" });
  const [draftRecordId, setDraftRecordId] = React.useState(() => initialClientDraft?.recordId || "");
  const [draftSubmittedAt, setDraftSubmittedAt] = React.useState(() => initialClientDraft?.submittedAt || "");
  const [savedStepIds, setSavedStepIds] = React.useState(() => initialClientDraft?.stepProgress?.completedStepIds || []);
  const [emailVerification, setEmailVerification] = React.useState(() => initialClientDraft?.emailVerification || {});
  const [emailVerificationStatus, setEmailVerificationStatus] = React.useState({ status: "idle", message: "" });
  const [emailFieldPulseKey, setEmailFieldPulseKey] = React.useState(0);
  const [mobileCostOpen, setMobileCostOpen] = React.useState(false);
  const [progressScrollState, setProgressScrollState] = React.useState({ left: false, right: false });
  const progressBarRef = React.useRef(null);
  const lastActivityPingRef = React.useRef(0);

  const updateProgressScrollState = React.useCallback(() => {
    const el = progressBarRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setProgressScrollState({
      left: el.scrollLeft > 2,
      right: maxScroll > 2 && el.scrollLeft < maxScroll - 2,
    });
  }, []);

  React.useEffect(() => {
    if ((!publicMode && !adminEditMode) || !initialDraft) return;
    setStepIdx(Math.min(initialDraft.stepIdx || 0, Math.max(0, list.length - 1)));
    setAnswers(initialDraft.answers || {});
    setVenueCost(initialDraft.venueCost || null);
    setLayoutRecommendations(initialDraft.layoutRecommendations || {});
    setDraftRecordId(initialDraft.recordId || "");
    setDraftSubmittedAt(initialDraft.submittedAt || "");
    setSavedStepIds(initialDraft.stepProgress?.completedStepIds || []);
    setEmailVerification(initialDraft.emailVerification || {});
    setCostAdminAdjustments(initialDraft.costAdminAdjustments || {});
    setEmailVerificationStatus({ status: "idle", message: "" });
    setCostBreakdown(null);
    setSubmitState({ status: "idle", message: "" });
  }, [publicMode, adminEditMode, initialDraft?.key, list.length]);

  // Reset when steps change identity
  React.useEffect(() => {
    if (publicMode || adminEditMode) {
      setStepIdx((current) => Math.min(current, Math.max(0, list.length - 1)));
      return;
    }
    setStepIdx(0);
    setAnswers({});
    setVenueCost(null);
    setLayoutRecommendations({});
    setCostBreakdown(null);
  }, [steps.length, publicMode, adminEditMode, list.length]);

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(updateProgressScrollState);
    window.addEventListener("resize", updateProgressScrollState);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateProgressScrollState);
    };
  }, [list.length, stepIdx, updateProgressScrollState]);

  React.useEffect(() => {
    const el = progressBarRef.current;
    const active = el?.querySelector(`[data-progress-step="${stepIdx}"]`);
    if (!active) return;
    active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    window.setTimeout(updateProgressScrollState, 220);
  }, [stepIdx, updateProgressScrollState]);

  React.useEffect(() => {
    if (!publicMode) return;
    try {
      saveJsonSafely(CLIENT_DRAFT_STORAGE_KEY, {
        stepIdx,
        answers,
        venueCost,
        layoutRecommendations,
        recordId: draftRecordId,
        submittedAt: draftSubmittedAt,
        stepProgress: { completedStepIds: savedStepIds },
        emailVerification,
        costAdminAdjustments,
        savedAt: Date.now(),
      });
    } catch (_) {}
  }, [publicMode, stepIdx, answers, venueCost, layoutRecommendations, draftRecordId, draftSubmittedAt, savedStepIds, emailVerification, costAdminAdjustments]);
  React.useEffect(() => {
    if (!clientNotice) return;
    const timeout = window.setTimeout(() => setClientNotice(null), clientNotice.duration || 3200);
    return () => window.clearTimeout(timeout);
  }, [clientNotice]);

  React.useEffect(() => {
    if (!publicMode) return;
    const onBeforeUnload = (event) => {
      if (!answerHasValue(answers)) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [publicMode, answers]);

  const step = list[stepIdx];
  const isLast = stepIdx === list.length - 1;

  const setAnswer = (fid, value) => {
    setValidationErrors((current) => {
      const next = { ...current };
      if (fid === "__rentalGroups") {
        (step?.fields || []).filter((field) => field.type === "rental_group").forEach((field) => {
          delete next[field.id];
        });
        return Object.keys(next).length === Object.keys(current).length ? current : next;
      }
      if (!current[fid]) return current;
      delete next[fid];
      return next;
    });
    setAnswers((a) => ({ ...a, [fid]: value }));
    if (adminEditMode && list.some((owner) => (owner.fields || []).some((field) => field.id === fid && field.type === "extras"))) {
      setCostAdminAdjustments((current) => ({ ...current, rentalExtras: Math.max(0, Number(value?.amount || 0)) }));
    }
    touchClientActivity();
  };
  const touchClientActivity = () => {
    if (!publicMode) return;
    const id = draftRecordId || initialDraft?.recordId;
    if (!id) return;
    const now = Date.now();
    if (now - lastActivityPingRef.current < 30000) return;
    lastActivityPingRef.current = now;
    collaburoApi("/api/submissions", {
      method: "POST",
      body: JSON.stringify({ action: "touch-progress-record", recordId: id }),
    }).catch(() => {});
  };
  React.useEffect(() => {
    if (!publicMode) return;
    const onActivity = () => touchClientActivity();
    window.addEventListener("click", onActivity);
    window.addEventListener("keydown", onActivity);
    return () => {
      window.removeEventListener("click", onActivity);
      window.removeEventListener("keydown", onActivity);
    };
  }, [publicMode, draftRecordId, initialDraft?.recordId]);
  const cleanAnswerLabel = (value) => {
    if (Array.isArray(value)) return value.map(cleanAnswerLabel).filter(Boolean).join(", ");
    if (value && typeof value === "object") {
      if (value.__selected) return cleanAnswerLabel(value.__selected);
      if (value.label) return cleanAnswerLabel(value.label);
      if (value.value) return cleanAnswerLabel(value.value);
      const firstTruthy = Object.entries(value).find(([key, val]) => !key.startsWith("__") && !!val);
      return firstTruthy ? cleanAnswerLabel(firstTruthy[0]) : "";
    }
    return String(value || "").split("|")[0].trim();
  };
  const answerHasValue = (value) => {
    if (value === null || value === undefined || value === "") return false;
    if (typeof value === "boolean") return value;
    if (Array.isArray(value)) return value.length > 0 && value.some(answerHasValue);
    if (typeof value === "object") {
      if (value.__selected) return true;
      if (value.groupSelected || Object.keys(value.selectedItems || {}).length > 0) return true;
      return Object.keys(value).some((key) => !key.startsWith("__"));
    }
    return true;
  };
  const selectedOptionNeedsChildAnswer = (item, valueSlice, level = "option") => {
    if (!item || typeof item !== "object" || !valueSlice || typeof valueSlice !== "object") return false;
    const childKey = window.RICH_CHILD_KEY?.[level] || (level === "option" ? "subOptions" : level === "subOption" ? "selections" : "specifications");
    const nextLevel = window.RICH_NEXT_LEVEL?.[level] || (level === "option" ? "subOption" : level === "subOption" ? "selection" : "specification");
    const children = childKey ? (item[childKey] || []) : [];
    const childValue = valueSlice[item.label];
    if (childValue === undefined) return false;
    if (children.length > 0 && !answerHasValue(childValue)) return true;
    return children.some((child) => selectedOptionNeedsChildAnswer(normalizeSimpleOption(child), childValue, nextLevel));
  };
  const fieldMissingRequiredSubOption = (field, rawValue) => {
    if (!field?.requireSubOptions || !rawValue) return false;
    if (field.type === "select" && field.groupOptions) {
      const selectedLabel = rawValue && typeof rawValue === "object" ? rawValue.__selected : rawValue;
      if (!selectedLabel) return false;
      const selectedOption = normalizeSimpleOptionGroups(field.options || [])
        .flatMap((group) => group.options || [])
        .find((option) => option.label === selectedLabel);
      const children = selectedOption?.subOptions || [];
      if (!children.length) return false;
      const childValue = rawValue && typeof rawValue === "object" ? rawValue.__sub : undefined;
      if (!answerHasValue(childValue)) return true;
      return children.some((child) => selectedOptionNeedsChildAnswer(normalizeSimpleOption(child), childValue, "subOption"));
    }
    return (field.options || [])
      .map((option) => normalizeSimpleOption(option))
      .some((option) => selectedOptionNeedsChildAnswer(option, rawValue, "option"));
  };
  const findAnswerByLabel = (needles) => {
    const lowered = (needles || []).map((needle) => String(needle).toLowerCase());
    for (const s of list) {
      for (const f of (s.fields || [])) {
        const label = String(f.label || "").toLowerCase();
        if (lowered.some((needle) => label.includes(needle))) {
          const answer = cleanAnswerLabel(answers[f.id]);
          if (answer) return answer;
        }
      }
    }
    return "";
  };
  const findFieldByLabel = (needles) => {
    const lowered = (needles || []).map((needle) => String(needle).toLowerCase());
    for (const s of list) {
      for (const f of (s.fields || [])) {
        const label = String(f.label || "").toLowerCase();
        if (lowered.some((needle) => label.includes(needle))) return f;
      }
    }
    return null;
  };

  // Evaluate field visibility based on current answers (simple rule engine)
  const isFieldVisible = (f, ownerStep = step) => {
    const adminOverride = adminEditMode ? ADMIN_BOOKING_FORM_OVERRIDES.fieldIds[f.id] : null;
    if (adminOverride?.visible === true) return true;
    if (adminOverride?.visible === false) return false;
    if (f.visibleToClient === false) return false;
    if (!f.visibility) return true;
    const r = f.visibility;
    // find field by ID or by label
    const allFields = list.flatMap((s) => s.fields || []);
    const ref = r.fieldId ? allFields.find((x) => x.id === r.fieldId) : allFields.find((x) => x.label === r.field);
    if (!ref) return true;
    let v = ref.type === "rental_group"
      ? answers.__rentalGroups?.[ownerStep?.id]?.[ref.id]
      : answers[ref.id];
    // Handle rich value objects (4-level tree). Backward-compat: old shape was { main, subs }.
    if (v && typeof v === "object") {
      if (ref.type === "rental_group") {
        v = !!(v.groupSelected || Object.keys(v.selectedItems || {}).length);
      } else if (v.__selected !== undefined) v = v.__selected;
      else if (v.main !== undefined) v = v.main;
      else v = Object.keys(v).join(" "); // new shape: keys are selected option labels
    }
    switch (r.op) {
      case "has_value": return v != null && v !== "" && v !== false;
      case "is_empty":  return v == null || v === "" || v === false;
      case "equals":    return String(v) === String(r.value);
      case "not_equals":return String(v) !== String(r.value);
      case "contains":  return String(v || "").toLowerCase().includes(String(r.value || "").toLowerCase());
      case "in_group":  return String(groupedOptionCategoryForValue(ref, v)).toLowerCase() === String(r.value || "").toLowerCase();
      case "is_true":   return !!v;
      case "is_false":  return !v;
      default: return true;
    }
  };

  const visibleFields = step ? step.fields.filter((f) => isFieldVisible(f, step)) : [];
  const rentalGroupFields = visibleFields.filter((f) => f.type === "rental_group");
  const normalVisibleFields = visibleFields.filter((f) => f.type !== "rental_group");
  const venueStepForRentals = list.find((s) => s.stepType === "venue");
  const selectedVenueIdsForRentals = Array.isArray(answers._selectedVenueIds)
    ? answers._selectedVenueIds
    : answers._selectedVenueId
    ? [answers._selectedVenueId]
    : [];
  const selectedRentalVenues = (venueStepForRentals?.venues || [])
    .filter((venue) => venue.active !== false && venue.visibility !== "admin_only")
    .filter((venue) => selectedVenueIdsForRentals.includes(venue.id));
  const getMissingRequiredFields = (targetStep) => {
    if (!targetStep || targetStep.stepType === "checkout") return [];
    return (targetStep.fields || [])
      .filter((f) => isFieldVisible(f, targetStep))
      .filter((f) => {
        const rawValue = f.type === "rental_group" ? answers.__rentalGroups?.[targetStep.id]?.[f.id] : answers[f.id];
        return (!!f.required && !answerHasValue(rawValue)) || fieldMissingRequiredSubOption(f, rawValue);
      });
  };
  const validationMessageForField = (field, targetStep) => {
    const rawValue = field.type === "rental_group" ? answers.__rentalGroups?.[targetStep.id]?.[field.id] : answers[field.id];
    if (fieldMissingRequiredSubOption(field, rawValue)) return validations.requiredSubOptionMessage || "Choose a required sub-option.";
    return validations.requiredFieldMessage || "This field is required.";
  };
  const fieldErrorFor = (fieldId) => {
    if (!validationErrors[fieldId]) return "";
    for (const ownerStep of list) {
      const field = (ownerStep.fields || []).find((item) => item.id === fieldId);
      if (field) return validationMessageForField(field, ownerStep);
    }
    return validationErrors[fieldId] || "";
  };
  const renderFieldError = (fieldId) => {
    const fieldError = fieldErrorFor(fieldId);
    return fieldError ? (
      <div className="cv-field-error" key={`${fieldId}-${validationPulseKey}`}>
        {fieldError}
      </div>
    ) : null;
  };
  const renderRentalGroupErrors = () => {
    const errors = rentalGroupFields.filter((field) => fieldErrorFor(field.id));
    if (errors.length === 0) return null;
    return (
      <div style={{ display: "grid", gap: 4, marginTop: 8 }}>
        {errors.map((field) => (
          <div
            key={field.id}
            data-cv-field-id={field.id}
            className="cv-field-has-error"
          >
            {renderFieldError(field.id)}
          </div>
        ))}
      </div>
    );
  };
  const missingRequiredFields = getMissingRequiredFields(step);
  const emailField = findFieldByLabel(["email"]);
  const emailAnswer = findAnswerByLabel(["email"]);
  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAnswer);
  const emailVerificationMatches = String(emailVerification.email || "").trim().toLowerCase() === String(emailAnswer || "").trim().toLowerCase();
  const emailVerified = !!emailLooksValid && !!emailVerification.verifiedAt && emailVerificationMatches;
  const pricesVisible = adminEditMode && ADMIN_BOOKING_FORM_OVERRIDES.validations.emailVerification
    ? true
    : !validations.emailVerification || emailVerified;
  const costSummaryLocked = !adminEditMode && !!validations.emailVerification && !emailVerified;
  const costSummaryLockedMessage = !emailLooksValid
    ? "Enter your email address in Step 1, then click Validate to unlock pricing."
    : (validations.emailVerificationMessage || "Please verify your email address to view pricing and the summary of cost.");
  const pulseEmailField = () => {
    setEmailFieldPulseKey((key) => key + 1);
    const emailStepIndex = list.findIndex((s) => (s.fields || []).some((field) => field.id === emailField?.id));
    if (emailStepIndex >= 0 && emailStepIndex !== stepIdx) setStepIdx(emailStepIndex);
    window.setTimeout(() => {
      const input = document.querySelector("[data-collaburo-email-field='1']");
      if (input) {
        input.scrollIntoView({ behavior: "smooth", block: "center" });
        input.focus?.();
      }
    }, 80);
  };
  const requestEmailVerification = async (email) => {
    const targetEmail = String(email || emailAnswer || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      setEmailVerificationStatus({ status: "error", message: "Enter a valid email address first." });
      pulseEmailField();
      return;
    }
    setEmailVerification({ email: targetEmail, verifiedAt: new Date().toISOString(), dummy: true });
    setEmailVerificationStatus({ status: "verified", message: "Email validated. Pricing is now visible." });
  };
  React.useEffect(() => {
    if (!publicMode || !validations.emailVerification) return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get("verify_email");
    if (!token) return;
    let cancelled = false;
    setEmailVerificationStatus({ status: "checking", message: "Checking verification link..." });
    collaburoApi("/api/email-verification", {
      method: "POST",
      body: JSON.stringify({ action: "verify", token }),
    })
      .then((data) => {
        if (cancelled) return;
        const verified = { email: data.email || "", verifiedAt: data.verifiedAt || new Date().toISOString(), sessionToken: data.sessionToken || "" };
        setEmailVerification(verified);
        if (emailField?.id && data.email && !answers[emailField.id]) {
          setAnswers((current) => ({ ...current, [emailField.id]: data.email }));
        }
        setEmailVerificationStatus({ status: "verified", message: "Email verified. Pricing is now visible." });
        const url = new URL(window.location.href);
        url.searchParams.delete("verify_email");
        window.history.replaceState({}, "", url.toString());
      })
      .catch((error) => {
        if (!cancelled) setEmailVerificationStatus({ status: "error", message: error.message || "Verification link could not be used." });
      });
    return () => {
      cancelled = true;
    };
  }, [publicMode, validations.emailVerification, emailField?.id]);
  const guestCount = window.findGuestCount ? window.findGuestCount(list, answers) : 0;
  React.useEffect(() => {
    if (!publicMode || !validations.emailVerification || !emailVerified || draftRecordId || !emailVerification.sessionToken) return;
    let cancelled = false;
    setEmailVerificationStatus((current) => current.status === "verified" ? current : { status: "checking", message: "Checking for your saved booking..." });
    collaburoApi("/api/submissions", {
      method: "POST",
      body: JSON.stringify({
        action: "get-progress-record-by-email",
        email: emailAnswer,
        emailSessionToken: emailVerification.sessionToken,
      }),
    })
      .then((data) => {
        if (cancelled || !data?.record) return;
        const draft = buildClientDraftFromProgressRecord(normalizeProgressRecord(data.record), list);
        if (!draft) return;
        setAnswers(draft.answers || {});
        setVenueCost(draft.venueCost || null);
        setLayoutRecommendations(draft.layoutRecommendations || {});
        setDraftRecordId(draft.recordId || "");
        setDraftSubmittedAt(draft.submittedAt || "");
        setSavedStepIds(draft.stepProgress?.completedStepIds || []);
        setStepIdx(Math.min(draft.stepIdx || 0, Math.max(0, list.length - 1)));
        setEmailVerification((current) => ({ ...current, email: emailAnswer, sessionToken: current.sessionToken || emailVerification.sessionToken }));
        setEmailVerificationStatus({ status: "verified", message: "Saved booking loaded for this verified email." });
        if (draft.recordId) {
          const url = new URL(window.location.href);
          url.searchParams.set("record", bookingCodeFromId(draft.recordId));
          window.history.replaceState({ record: bookingCodeFromId(draft.recordId) }, "", url.toString());
        }
      })
      .catch((error) => {
        if (!cancelled && error.message && !/not found/i.test(error.message)) {
          setEmailVerificationStatus({ status: "error", message: error.message });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [publicMode, validations.emailVerification, emailVerified, emailAnswer, emailVerification.sessionToken, draftRecordId, list.length]);
  const canLeaveStep = (targetStep, { forceRequired = false } = {}) => {
    if (!publicMode || (adminEditMode && ADMIN_BOOKING_FORM_OVERRIDES.validations.requiredFields)) return true;
    if (!forceRequired && (!publicMode || !validations.strictProgression)) return true;
    const missing = getMissingRequiredFields(targetStep);
    if (missing.length === 0) return true;
    const nextErrors = missing.reduce((acc, field) => {
      acc[field.id] = validationMessageForField(field, targetStep);
      return acc;
    }, {});
    setValidationErrors(nextErrors);
    setValidationPulseKey((key) => key + 1);
    window.setTimeout(() => {
      const firstField = missing[0]?.id;
      const node = firstField ? document.querySelector(`[data-cv-field-id="${CSS.escape(firstField)}"]`) : null;
      node?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 30);
    return false;
  };
  const canReachStep = (targetIndex, { forceCurrent = false } = {}) => {
    if (!publicMode || (adminEditMode && ADMIN_BOOKING_FORM_OVERRIDES.validations.strictProgression)) return true;
    if (targetIndex <= stepIdx) return true;
    if (publicMode && validations.strictProgression) {
      for (let j = 0; j < targetIndex; j += 1) {
        if (!canLeaveStep(list[j], { forceRequired: true })) return false;
      }
      return true;
    }
    return !forceCurrent || canLeaveStep(step, { forceRequired: true });
  };
  const goTo = (i) => {
    touchClientActivity();
    if (!canReachStep(i)) return;
    setStepIdx(i);
  };
  React.useEffect(() => {
    const onKey = (e) => {
      if (!publicMode && e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && stepIdx < list.length - 1) goTo(stepIdx + 1);
      if (e.key === "ArrowLeft" && stepIdx > 0) setStepIdx(stepIdx - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stepIdx, list.length, onClose, publicMode, goTo]);
  const formatPreviewMoney = (n) => "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const buildCostSummaryData = () => {
    const fmt = (n) => "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const pricing = normalizePricingRules(pricingRules || window.SAMPLE_PRICING_RULES);
    const matchesRuleValue = (ruleValue, actualValue) => {
      const rule = String(ruleValue || "All").trim().toLowerCase();
      const actual = String(actualValue || "").trim().toLowerCase();
      return rule === "all" || rule === "" || (!!actual && rule === actual);
    };
    const ruleSpecificity = (row, context) => {
      let score = 0;
      if (row.venueId && row.venueId !== "All" && String(row.venueId) === String(context.venueId || "")) score += 3;
      else if (row.venueName && row.venueName !== "All" && matchesRuleValue(row.venueName, context.venueName)) score += 2;
      if (row.eventPrivacy && String(row.eventPrivacy).toLowerCase() !== "all") score += 1;
      if (row.eventType && String(row.eventType).toLowerCase() !== "all") score += 1;
      if (row.alcoholOnSite && String(row.alcoholOnSite).toLowerCase() !== "all") score += 1;
      return score;
    };
    const optionsCost = window.computeWorkflowOptionsCost(list, answers)
      .map((fc) => {
        const pricedLines = fc.lines.filter((ln) => ln.enablePrice);
        return { ...fc, lines: pricedLines, total: pricedLines.reduce((sum, ln) => sum + Number(ln.price || 0), 0) };
      })
      .filter((fc) => fc.lines.length > 0);
    const rentalCost = computeWorkflowRentalCost(list, answers.__rentalGroups || {});
    const rentalExtrasFromAnswers = rentalExtrasLinesFromAnswers(list, answers);
    const savedRentalExtrasAmount = Math.max(0, Number(costAdminAdjustments.rentalExtras || 0));
    const rentalExtrasLines = rentalExtrasFromAnswers.length > 0
      ? rentalExtrasFromAnswers
      : savedRentalExtrasAmount > 0
      ? [{ id: "f_rent_extras", label: "Extras", group: "Rentals", meta: "", quantity: 1, total: savedRentalExtrasAmount, rentalExtraLine: true }]
      : [];
    const rentalExtrasTotal = rentalExtrasLines.reduce((sum, line) => sum + Number(line.total || 0), 0);
    const manualDeliverySelections = list
      .flatMap((s) => s.fields || [])
      .filter((field) => isDeliveryOptionsField(field))
      .flatMap((field) => {
        const selected = Array.isArray(answers[field.id]) ? answers[field.id] : [];
        return selected.map((answer) => deliveryOptionIdFromAnswer(answer, site)).filter(Boolean);
      });
    const deliveryLines = Object.values(rentalCost.reduce((acc, group) => {
      (group.deliveryItems || []).forEach((deliveryItem) => {
        const option = deliveryOptionById(site, deliveryItem.deliveryOptionId);
        if (!option || option.active === false) return;
        const key = option.id;
        if (!acc[key]) {
          acc[key] = {
            id: key,
            label: option.label || "Delivery",
            group: "Delivery",
            metaItems: [],
            quantity: 1,
            total: Number(option.amount || 0),
          };
        }
        acc[key].metaItems.push(deliveryItem.label);
      });
      return acc;
    }, {}));
    manualDeliverySelections.forEach((optionId) => {
      const option = deliveryOptionById(site, optionId);
      if (!option || option.active === false) return;
      if (!deliveryLines[option.id]) {
        deliveryLines[option.id] = {
          id: option.id,
          label: option.label || "Delivery",
          group: "Delivery",
          metaItems: [],
          quantity: 1,
          total: Number(option.amount || 0),
        };
      }
      deliveryLines[option.id].manual = true;
    });
    const resolvedDeliveryLines = Object.values(deliveryLines).map((line) => ({
      ...line,
      meta: line.metaItems.length ? `Applies to ${line.metaItems.join(", ")}` : (line.manual ? "Selected delivery option" : ""),
    }));
    const deliveryTotal = resolvedDeliveryLines.reduce((sum, line) => sum + Number(line.total || 0), 0);
    const stepNameText = (fc) => String(fc.stepName || "").toLowerCase();
    const lineText = (fc) => [fc.fieldLabel, ...(fc.lines || []).map((ln) => ln.label)].join(" ").toLowerCase();
    const costTotal = (groups) => groups.reduce((sum, c) => sum + Number(c.total || 0), 0);
    const withParentLabel = (parent, label) => {
      const p = String(parent || "").trim();
      const l = String(label || "").trim();
      if (!p || !l) return l || p || "Selected item";
      if (l.toLowerCase().startsWith(p.toLowerCase() + ":") || l.toLowerCase() === p.toLowerCase()) return l;
      if (/^types?\s+of\s+/i.test(p)) return l;
      return `${p}: ${l}`;
    };
    const flattenOptionGroups = (groups) => groups.flatMap((fc) => (fc.lines || []).map((ln) => {
      const meta = [];
      if (ln.multiplier > 1 && ln.basePrice > 0) {
        if (ln.pricingStructure === "per_person_hour") meta.push(`${ln.qtyPeople} people x ${ln.qtyHours} hr x ${fmt(ln.basePrice)}`);
        else if (ln.pricingStructure === "per_person") meta.push(`${ln.qtyPeople} people x ${fmt(ln.basePrice)}`);
        else if (ln.pricingStructure === "per_hour") meta.push(`${ln.qtyHours} hr x ${fmt(ln.basePrice)}`);
      }
      return {
        label: withParentLabel(fc.fieldLabel, ln.label),
        group: fc.fieldLabel,
        meta: meta.join(" · "),
        quantity: ln.multiplier > 1 ? ln.multiplier : 1,
        total: Number(ln.price || 0),
      };
    }));
    const flattenRentalGroups = (groups) => groups.flatMap((fc) => (fc.lines || []).map((ln) => ({
      label: withParentLabel(ln.parentLabel, ln.label),
      group: fc.venueName ? `${fc.venueName} Rentals` : fc.fieldLabel,
      meta: "",
      quantity: Number(ln.quantity || String(ln.label || "").match(/\sx\s(\d+)$/i)?.[1] || 1),
      total: Number(ln.total || 0),
    })));
    const cateringGroups = optionsCost.filter((fc) => stepNameText(fc).includes("catering"));
    const serviceGroups = optionsCost.filter((fc) => fc.stepType === "services" || stepNameText(fc) === "additional services");
    const setupGroups = serviceGroups.filter((fc) => /set[\s-]*up|setup/.test(lineText(fc)));
    const cleanupGroups = serviceGroups.filter((fc) => /clear[\s-]*up|cleanup|clean[\s-]*up|cleaning/.test(lineText(fc)));
    const eventGroups = serviceGroups.filter((fc) => !setupGroups.includes(fc) && !cleanupGroups.includes(fc));
    const venueCosts = Array.isArray(venueCost?.venueCosts) ? venueCost.venueCosts : (venueCost ? [venueCost] : []);
    const spaceRentalTotal = venueCosts.reduce((sum, item) => sum + Number(item.total || 0), 0);
    const spaceContentTotal = costTotal(rentalCost) + deliveryTotal + rentalExtrasTotal;
    const cateringTotal = costTotal(cateringGroups);
    const setupTotal = costTotal(setupGroups);
    const eventTotal = costTotal(eventGroups);
    const cleanupTotal = costTotal(cleanupGroups);
    const subtotal = spaceRentalTotal + spaceContentTotal + cateringTotal + setupTotal + eventTotal + cleanupTotal;
    const discountBasis = {
      subtotal,
      venue_only: spaceRentalTotal,
      space_content_rentals: spaceContentTotal,
      catering: cateringTotal,
      setup_services: setupTotal,
      event_services: eventTotal,
      cleanup_services: cleanupTotal,
      services: setupTotal + eventTotal + cleanupTotal,
    };
    const allFields = list.flatMap((s) => (s.fields || []).map((field) => ({ ...field, stepId: s.id, stepName: s.name || "" })));
    const valueForCondition = (condition) => {
      const field = allFields.find((f) => f.id === condition.fieldId) || allFields.find((f) => f.label === condition.fieldLabel);
      if (!field) return { field: null, raw: undefined, clean: "" };
      const raw = field.type === "rental_group" ? answers.__rentalGroups?.[field.stepId]?.[field.id] : answers[field.id];
      return { field, raw, clean: cleanAnswerLabel(raw) };
    };
    const conditionMatches = (condition) => {
      const { raw, clean } = valueForCondition(condition);
      const operator = condition.operator || "equals";
      const expected = condition.value;
      if (operator === "has_value") return answerHasValue(raw);
      if (operator === "is_empty") return !answerHasValue(raw);
      if (operator === "is_true") return raw === true || String(clean || raw).toLowerCase() === "true" || String(clean || raw).toLowerCase() === "yes";
      if (operator === "is_false") return raw === false || !answerHasValue(raw) || String(clean || raw).toLowerCase() === "false" || String(clean || raw).toLowerCase() === "no";
      const actualText = String(clean || raw || "").trim().toLowerCase();
      const expectedText = String(expected || "").trim().toLowerCase();
      if (operator === "not_equals") return actualText !== expectedText;
      if (operator === "contains") return !!expectedText && actualText.includes(expectedText);
      if (operator === "greater_than") return Number(clean || raw || 0) > Number(expected || 0);
      if (operator === "less_than") return Number(clean || raw || 0) < Number(expected || 0);
      return actualText === expectedText;
    };
    const ruleMatches = (rule) => {
      const conditions = rule.conditions || [];
      if (conditions.length === 0) return true;
      return rule.conditionsMode === "any" ? conditions.some(conditionMatches) : conditions.every(conditionMatches);
    };
    const discountCapAmount = (cap, basis) => {
      if (!cap?.enabled || Number(cap.amount || 0) <= 0) return Infinity;
      return cap.valueType === "percentage" ? basis * (Number(cap.amount || 0) / 100) : Number(cap.amount || 0);
    };
    const globalDiscountCap = discountCapAmount(pricing.discountSettings?.maxCombinedDiscount, subtotal);
    let remainingGlobalDiscount = Number.isFinite(globalDiscountCap) ? Math.max(0, globalDiscountCap) : Infinity;
    let nonStackableApplied = false;
    const automaticDiscountLines = (pricing.discountRules || [])
      .filter((rule) => rule.active !== false && Number(rule.amount || 0) > 0)
      .filter(ruleMatches)
      .sort((a, b) => Number(a.priority || 0) - Number(b.priority || 0))
      .reduce((lines, rule) => {
        if (remainingGlobalDiscount <= 0 || nonStackableApplied) return lines;
        if (rule.stackable === false && lines.length > 0) return lines;
        const selectedTargets = rule.applyTo === "line_items" ? (rule.targets || []) : ["subtotal"];
        const basis = selectedTargets.reduce((sum, target) => sum + Number(discountBasis[target] || 0), 0);
        if (basis <= 0) return lines;
        const rawTotal = rule.valueType === "flat" ? Number(rule.amount || 0) : basis * (Number(rule.amount || 0) / 100);
        const ruleCap = discountCapAmount(rule.maxDiscount, basis);
        const cappedTotal = Math.min(rawTotal, basis, ruleCap, remainingGlobalDiscount);
        if (cappedTotal <= 0) return lines;
        remainingGlobalDiscount -= cappedTotal;
        if (rule.stackable === false) nonStackableApplied = true;
        lines.push({
          id: rule.id,
          label: rule.name || "Discount",
          displayLabel: rule.valueType === "percentage" ? `${rule.name || "Discount"} (${Number(rule.amount || 0)}%)` : (rule.name || "Discount"),
          applyTo: rule.applyTo || "subtotal",
          targets: selectedTargets,
          basis,
          total: -cappedTotal,
        });
        return lines;
      }, []);
    const automaticDiscountTotal = automaticDiscountLines.reduce((sum, line) => sum + Math.abs(Number(line.total || 0)), 0);
    const adminAdditionalDiscount = Math.max(0, Number(costAdminAdjustments.additionalDiscount || 0));
    const adminAdditionalDiscountLine = adminAdditionalDiscount > 0 ? {
      id: "additional_discount",
      label: "Additional Discount",
      displayLabel: "Additional Discount",
      applyTo: "subtotal",
      targets: ["subtotal"],
      basis: subtotal,
      total: -Math.min(adminAdditionalDiscount, Math.max(0, subtotal - automaticDiscountTotal)),
      adminOnly: true,
    } : null;
    const discountLines = adminAdditionalDiscountLine && Math.abs(adminAdditionalDiscountLine.total) > 0
      ? [...automaticDiscountLines, adminAdditionalDiscountLine]
      : automaticDiscountLines;
    const discountTotal = discountLines.reduce((sum, line) => sum + Math.abs(Number(line.total || 0)), 0);
    const discountedSubtotal = Math.max(0, subtotal - discountTotal);
    const feeBasis = {
      final_total: discountedSubtotal,
      venue_only: spaceRentalTotal,
      space_content_rentals: spaceContentTotal,
      catering: cateringTotal,
      services: setupTotal + eventTotal + cleanupTotal,
    };
    const feeLines = pricing.fees
      .filter((fee) => fee.active !== false)
      .map((fee) => {
        const basis = Number(feeBasis[fee.applyTo || "final_total"] || 0);
        const amount = Number(fee.amount || 0);
        const total = fee.valueType === "flat" ? amount : basis * (amount / 100);
        return {
          id: fee.id,
          label: fee.label || "Fee",
          displayLabel: fee.valueType === "flat" ? (fee.label || "Fee") : `${fee.label || "Fee"} (${amount}%)`,
          applyTo: fee.applyTo || "final_total",
          basis,
          total,
        };
      })
      .filter((fee) => Number(fee.total || 0) !== 0 || fee.label.toLowerCase().includes("tax"));
    const feesTotal = feeLines.reduce((sum, fee) => sum + Number(fee.total || 0), 0);
    const total = discountedSubtotal + feesTotal;
    const tax = feeLines.filter((fee) => /tax/i.test(fee.label)).reduce((sum, fee) => sum + Number(fee.total || 0), 0);
    const baseDepositContext = {
      eventPrivacy: findAnswerByLabel(["event privacy", "privacy"]),
      eventType: findAnswerByLabel(["event type", "type of event"]),
      alcoholOnSite: findAnswerByLabel(["alcohol"]),
    };
    const depositForVenue = (item) => {
      const depositContext = {
        ...baseDepositContext,
        venueId: item?.venueId || "",
        venueName: item?.venueName || "",
      };
      const depositMatch = pricing.securityDeposits
        .filter((row) => row.active !== false)
        .filter((row) => {
          const venueMatches = String(row.venueId || "All") === "All" || String(row.venueId) === String(depositContext.venueId || "") || matchesRuleValue(row.venueName, depositContext.venueName);
          return venueMatches
            && matchesRuleValue(row.eventPrivacy, depositContext.eventPrivacy)
            && matchesRuleValue(row.eventType, depositContext.eventType)
            && matchesRuleValue(row.alcoholOnSite, depositContext.alcoholOnSite);
        })
        .sort((a, b) => ruleSpecificity(b, depositContext) - ruleSpecificity(a, depositContext))[0];
      return Number(depositMatch ? depositMatch.amount : item?.securityDeposit || 0);
    };
    const calculatedSecurityDeposit = venueCosts.reduce((sum, item) => sum + depositForVenue(item), 0);
    const hasSecurityDepositOverride = Object.prototype.hasOwnProperty.call(costAdminAdjustments, "securityDeposit");
    const securityDeposit = hasSecurityDepositOverride
      ? Math.max(0, Number(costAdminAdjustments.securityDeposit || 0))
      : calculatedSecurityDeposit;
    const spaceLines = venueCosts.flatMap((item) => [
      {
        label: `${item.venueName || "Selected venue"}${item.planLabel ? ` — ${item.planLabel}` : ""}`,
        group: item.venueName || "Venue",
        meta: [
          item.totalHours ? `Duration: ${item.totalHours} hr${item.totalHours === 1 ? "" : "s"}` : "",
          item.billableHours && item.billableHours !== item.totalHours ? `Billable: ${item.billableHours} hr${item.billableHours === 1 ? "" : "s"}` : "",
          item.usesExtraHourRate ? `Extra hour rate: ${fmt(item.extraHourRate)}/hr` : "",
          item.minimumApplied ? `Minimum booking: ${item.minimumHours} hr${item.minimumHours === 1 ? "" : "s"}` : "",
        ].filter(Boolean).join(" · ") || "Base rental",
        quantity: 1,
        total: item.venueBase || 0,
      },
      ...(item.subCost > 0 ? [{ label: item.subName || "Optional extension", group: item.venueName, meta: "Sub-space", quantity: 1, total: item.subCost }] : []),
      ...(item.setup > 0 ? [{ label: "Set up fee", group: item.venueName, meta: "", quantity: 1, total: item.setup }] : []),
      ...(item.cleanup > 0 ? [{ label: "Clean up fee", group: item.venueName, meta: "", quantity: 1, total: item.cleanup }] : []),
    ]);
    const spaceContentLines = [...flattenRentalGroups(rentalCost), ...resolvedDeliveryLines, ...rentalExtrasLines];
    const cateringLines = flattenOptionGroups(cateringGroups);
    const setupLines = flattenOptionGroups(setupGroups);
    const eventLines = flattenOptionGroups(eventGroups);
    const cleanupLines = flattenOptionGroups(cleanupGroups);
    return {
      optionsCost, rentalCost, spaceRentalTotal, spaceContentTotal, cateringTotal,
      setupTotal, eventTotal, cleanupTotal, deliveryTotal, rentalExtrasTotal, subtotal, discountLines, discountTotal, discountedSubtotal, tax, feeLines, feesTotal, total,
      securityDeposit, totalWithDeposit: total + securityDeposit,
      spaceLines, spaceContentLines, cateringLines, setupLines, eventLines, cleanupLines, deliveryLines: resolvedDeliveryLines,
      adminAdjustments: { ...costAdminAdjustments, additionalDiscount: adminAdditionalDiscount },
      calculatedSecurityDeposit,
      fmt,
    };
  };
  const checkoutCostData = buildCostSummaryData();
  const autoDeliveryKey = JSON.stringify((checkoutCostData.deliveryLines || []).map((line) => [line.id, line.label, line.total]));
  React.useEffect(() => {
    const deliveryLines = checkoutCostData.deliveryLines || [];
    const deliveryFields = list
      .flatMap((s) => s.fields || [])
      .filter((field) => field.type === "checkbox" && String(field.label || "").toLowerCase().includes("delivery"));
    if (deliveryFields.length === 0) return;
    setAnswers((current) => {
      let changed = false;
      const next = { ...current };
      deliveryFields.forEach((field) => {
        const autoLines = fieldAutoDeliveryLines(field, deliveryLines);
        const existing = typeof next[field.id] === "object" && next[field.id] !== null ? next[field.id] : { on: !!next[field.id] };
        if (autoLines.length > 0) {
          if (!existing.on || !existing.__autoDelivery) {
            next[field.id] = { ...existing, on: true, __autoDelivery: true };
            changed = true;
          }
          return;
        }
        if (existing.__autoDelivery) {
          next[field.id] = { ...existing, on: false, __autoDelivery: false };
          changed = true;
        }
      });
      return changed ? next : current;
    });
  }, [autoDeliveryKey, list]);
  const checkoutAgreementValue = answers.__checkoutAgreements?.[step?.id] || {};
  const checkoutAgreements = step?.stepType === "checkout" ? (step.checkout?.agreements || []) : [];
  const missingCheckoutAgreements = checkoutAgreements.filter((agreement) => agreement.required !== false && !checkoutAgreementValue[agreement.id]);
  const checkoutCanSubmit = adminEditMode || step?.stepType !== "checkout" || (
    missingCheckoutAgreements.length === 0
    && (!validations.emailVerification || emailVerified)
  );
  const costModalGroups = costBreakdown ? Object.values((costBreakdown.lines || []).reduce((acc, line) => {
    const key = line.group || costBreakdown.title || "Details";
    if (!acc[key]) acc[key] = { title: key, total: 0, lines: [] };
    acc[key].lines.push(line);
    acc[key].total += Number(line.total || 0);
    return acc;
  }, {})) : [];
  const previewStepLabel = (name = "") => {
    const label = String(name || "");
    const lower = label.toLowerCase();
    if (lower.includes("personal")) return "Personal";
    if (lower.includes("event detail")) return "Event";
    if (lower.includes("venue")) return "Venue";
    if (lower.includes("additional service")) return "Addtl Services";
    if (lower.includes("additional info")) return "Addtl Info";
    if (lower.includes("submit") || lower.includes("checkout")) return "Submit";
    return label;
  };
  const isEditMode = (publicMode || adminEditMode) && !!initialDraft?.recordId;
  const auditDisplayChanges = () => {
    if (!adminEditMode || !initialDraft?.answers) return [];
    const changes = [];
    const beforeAnswers = initialDraft.answers || {};
    const safeValue = (value) => {
      if (typeof value === "string" && /^data:(image|application)\//i.test(value)) return "Uploaded file";
      if (Array.isArray(value)) return value.map(safeValue);
      if (!value || typeof value !== "object") return value;
      if (value.name && (value.url || value.secureUrl || value.data || value.type)) return value.name;
      return Object.fromEntries(Object.entries(value).filter(([key]) => !/^(data|fileData|base64)$/i.test(key)).map(([key, child]) => [key, safeValue(child)]));
    };
    const add = (section, label, before, after) => {
      const changed = JSON.stringify(before ?? null) !== JSON.stringify(after ?? null);
      changes.push({ section: section || "Space Rental Request", label, before: safeValue(before), after: safeValue(after), changed });
    };
    const venueStep = list.find((owner) => owner.stepType === "venue");
    const venues = venueStep?.venues || [];
    const venueName = (id) => venues.find((venue) => String(venue.id) === String(id))?.name || String(id || "Space");
    const selectedVenueNames = (source) => {
      const ids = Array.isArray(source?._selectedVenueIds) ? source._selectedVenueIds : source?._selectedVenueId ? [source._selectedVenueId] : [];
      return ids.map(venueName).join(", ");
    };
    add(venueStep?.name || "Venue", "Selected space", selectedVenueNames(beforeAnswers), selectedVenueNames(answers));
    const bookingLabels = { startDate: "Start date", startTime: "Start time", endDate: "End date", endTime: "End time" };
    const bookingsFromVenueCost = (cost) => {
      if (!cost || typeof cost !== "object") return {};
      const rows = Array.isArray(cost.venueCosts) ? cost.venueCosts : cost.venueId ? [cost] : [];
      return Object.fromEntries(rows.filter((row) => row?.venueId).map((row) => [row.venueId, row.booking || {}]));
    };
    // VenuePreviewBody owns its date/time controls and synchronizes them back to
    // answers in an effect. venueCost is updated from the same live controls, so
    // merge it in to ensure a save on the venue step cannot miss those changes.
    const beforeBookings = { ...(beforeAnswers._venueBookings || {}), ...bookingsFromVenueCost(initialDraft.venueCost) };
    const afterBookings = { ...(answers._venueBookings || {}), ...bookingsFromVenueCost(venueCost) };
    const bookingVenueIds = new Set([
      ...Object.keys(beforeBookings), ...Object.keys(afterBookings),
      ...(Array.isArray(beforeAnswers._selectedVenueIds) ? beforeAnswers._selectedVenueIds : beforeAnswers._selectedVenueId ? [beforeAnswers._selectedVenueId] : []),
      ...(Array.isArray(answers._selectedVenueIds) ? answers._selectedVenueIds : answers._selectedVenueId ? [answers._selectedVenueId] : []),
    ]);
    bookingVenueIds.forEach((venueId) => Object.entries(bookingLabels).forEach(([key, label]) => add(venueStep?.name || "Venue", `${venueName(venueId)} — ${label}`, beforeBookings[venueId]?.[key], afterBookings[venueId]?.[key])));

    const rentalDisplay = (field, fieldState = {}, venueId = "") => {
      const items = workflowRentalCatalogItems(field.rentalGroup || field.label, venueId);
      const mode = rentalGroupDisplayMode(field);
      const selectedIds = new Set((mode === "separate_items" || fieldState?.groupSelected) ? Object.keys(fieldState?.selectedItems || {}).filter((id) => fieldState.selectedItems[id]) : []);
      if (fieldState?.groupSelected && selectedIds.size === 0 && items.length === 1) selectedIds.add(items[0].id);
      const lines = [];
      if (fieldState?.groupSelected && selectedIds.size === 0) lines.push(`${field.label}: Selected`);
      selectedIds.forEach((itemId) => {
        const item = items.find((candidate) => String(candidate.id) === String(itemId));
        const itemName = item?.name || itemId;
        const value = fieldState?.itemValues?.[itemId] || {};
        const details = [];
        if (value.quantity !== undefined && value.quantity !== "") details.push(`Quantity: ${value.quantity}`);
        (item?.optionGroups || []).forEach((group) => {
          const current = value.optionGroups?.[group.id];
          if (current === undefined || current === null || current === "") return;
          const options = (group.options || []).map(normalizeRentalChoiceOption);
          if (group.type === "multi_quantity") {
            Object.entries(current || {}).filter(([, qty]) => Number(qty || 0) !== 0).forEach(([optionId, qty]) => {
              const option = options.find((candidate) => String(candidate.id || candidate.label) === String(optionId));
              details.push(`${group.label || "Option"} — ${option?.label || optionId}: ${qty}`);
            });
          } else if (group.type === "checkbox_row") {
            const checked = typeof current === "object" ? current.checked !== false : !!current;
            details.push(`${group.label || "Option"}: ${checked ? "Selected" : "Not selected"}${typeof current === "object" && current.quantity ? ` (${current.quantity})` : ""}`);
          } else {
            const selectedId = typeof current === "object" ? current.value : current;
            const selectedLabel = typeof current === "object" && current.label ? current.label : options.find((candidate) => String(candidate.id || candidate.label) === String(selectedId))?.label || selectedId;
            details.push(`${group.label || "Option"}: ${selectedLabel}`);
          }
        });
        lines.push([itemName, ...details].join("\n  "));
      });
      return lines.join("\n");
    };

    list.forEach((owner) => {
      (owner.fields || []).forEach((field) => {
        if (field.visibleToClient === false || ["separator", "instructional"].includes(field.type)) return;
        if (field.type !== "rental_group") {
          add(owner.name, field.label || "Untitled field", beforeAnswers[field.id], answers[field.id]);
          return;
        }
        const beforeRoot = beforeAnswers.__rentalGroups?.[owner.id] || {};
        const afterRoot = answers.__rentalGroups?.[owner.id] || {};
        const scopedVenueIds = new Set([
          ...Object.keys(beforeRoot.__byVenue || {}), ...Object.keys(afterRoot.__byVenue || {}),
        ]);
        if (scopedVenueIds.size) {
          scopedVenueIds.forEach((venueId) => add(owner.name, `${field.label} — ${venueName(venueId)}`, rentalDisplay(field, beforeRoot.__byVenue?.[venueId]?.[field.id], venueId), rentalDisplay(field, afterRoot.__byVenue?.[venueId]?.[field.id], venueId)));
        } else {
          add(owner.name, field.label || field.rentalGroup || "Rental items", rentalDisplay(field, beforeRoot[field.id]), rentalDisplay(field, afterRoot[field.id]));
        }
      });
      (owner.checkout?.agreements || []).forEach((agreement) => add(owner.name, agreement.label || "Agreement", !!beforeAnswers.__checkoutAgreements?.[owner.id]?.[agreement.id], !!answers.__checkoutAgreements?.[owner.id]?.[agreement.id]));
    });

    const layoutSteps = list.filter((owner) => owner.stepType === "layout");
    const layoutAreaIds = new Set([
      ...layoutSteps.flatMap((owner) => Object.keys(owner.floorLayouts || {})),
      ...Object.keys(beforeAnswers._selectedLayouts || {}), ...Object.keys(answers._selectedLayouts || {}),
    ]);
    layoutAreaIds.forEach((areaId) => {
      const owner = layoutSteps.find((candidate) => candidate.floorLayouts?.[areaId]) || layoutSteps[0];
      const layouts = owner?.floorLayouts?.[areaId]?.layouts || [];
      const layoutLabel = (id) => layouts.find((layout) => String(layout.id) === String(id))?.name || (id === `_other_${areaId}` ? "Other" : id || "No layout");
      add(owner?.name || "Layout", `${venueName(areaId)} — Floor layout`, layoutLabel(beforeAnswers._selectedLayouts?.[areaId]), layoutLabel(answers._selectedLayouts?.[areaId]));
      add(owner?.name || "Layout", `${venueName(areaId)} — Layout notes`, beforeAnswers._layoutOtherPlans?.[areaId]?.notes, answers._layoutOtherPlans?.[areaId]?.notes);
      add(owner?.name || "Layout", `${venueName(areaId)} — Uploaded layout`, beforeAnswers._layoutOtherPlans?.[areaId]?.fileName, answers._layoutOtherPlans?.[areaId]?.fileName);
    });

    // Capture any custom/system answer keys not covered by the known form structures.
    const knownFieldIds = new Set(list.flatMap((owner) => (owner.fields || []).map((field) => field.id)));
    const handledSystemKeys = new Set(["_selectedVenueId", "_selectedVenueIds", "_venueBookings", "_selectedLayouts", "_layoutOtherPlans", "__rentalGroups", "__checkoutAgreements"]);
    new Set([...Object.keys(beforeAnswers), ...Object.keys(answers)]).forEach((key) => {
      if (knownFieldIds.has(key) || handledSystemKeys.has(key)) return;
      add("Other form data", key.replace(/^_+/, "").replace(/([a-z])([A-Z])/g, "$1 $2"), beforeAnswers[key], answers[key]);
    });
    const costLabels = {
      spaceRentalTotal: "Space rental", spaceContentTotal: "Content rentals", cateringTotal: "Catering",
      setupTotal: "Set-up services", eventTotal: "Event services", cleanupTotal: "Clean-up services",
      subtotal: "Subtotal", total: "Total", securityDeposit: "Security deposit", totalWithDeposit: "Total with security deposit",
    };
    Object.entries(costLabels).forEach(([key, label]) => {
      const before = initialDraft.auditBefore?.costs?.[key];
      const after = checkoutCostData?.[key];
      add("Summary of Cost", label, before, after);
    });
    return changes;
  };
  const editSubmitPayload = () => ({
    recordId: draftRecordId || initialDraft?.recordId || "",
    steps: list,
    answers,
    costData: checkoutCostData,
    venueCost,
    layoutRecommendations,
    emailVerification,
    adminEditMode,
    auditBefore: initialDraft?.auditBefore || null,
    auditDisplayChanges: auditDisplayChanges(),
    submittedAt: draftSubmittedAt || initialDraft?.submittedAt || new Date().toISOString(),
    stepProgress: { completedStepIds: savedStepIds },
  });
  const stepHasSavedData = (targetStep) => savedStepIds.includes(targetStep?.id);
  const saveCurrentStep = async ({ finalSubmit = false } = {}) => {
    if ((!publicMode && !adminEditMode) || !onSubmitRequest) return null;
    const stepId = step?.id;
    const nextSavedIds = stepId ? Array.from(new Set([...savedStepIds, stepId])) : savedStepIds;
    const submittedAt = draftSubmittedAt || initialDraft?.submittedAt || new Date().toISOString();
    const payload = {
      recordId: draftRecordId || initialDraft?.recordId || "",
      steps: list,
      answers,
      costData: checkoutCostData,
      venueCost,
      layoutRecommendations,
      emailVerification,
      adminEditMode,
      auditBefore: initialDraft?.auditBefore || null,
      auditDisplayChanges: auditDisplayChanges(),
      submittedAt,
      savedStepId: stepId,
      finalSubmit,
      stepProgress: { completedStepIds: nextSavedIds },
    };
    try {
      setSubmitState({ status: "submitting", message: "" });
      const savedRecord = await onSubmitRequest(payload);
      const nextRecordId = savedRecord?.id || payload.recordId;
      const nextBookingCode = savedRecord ? bookingCodeForRecord(savedRecord) : bookingCodeFromId(nextRecordId);
      if (nextRecordId) {
        setDraftRecordId(nextRecordId);
        const url = new URL(window.location.href);
        url.searchParams.set("record", nextBookingCode);
        window.history.replaceState({ record: nextBookingCode }, "", url.toString());
      }
      setDraftSubmittedAt(submittedAt);
      setSavedStepIds(nextSavedIds);
      setSubmitState({ status: "success", message: finalSubmit ? "Your request was saved successfully." : "Progress saved." });
      setClientNotice({ kind: "success", title: finalSubmit ? "Request saved" : "Progress saved", message: finalSubmit ? "Your request was saved successfully." : "You can continue when ready." });
      return savedRecord;
    } catch (error) {
      console.error("Save failed", error);
      setSubmitState({ status: "error", message: error.message || "We could not save your progress. Please try again." });
      setClientNotice({ kind: "danger", title: "Could not save", message: error.message || "Please try again.", duration: 4600 });
      throw error;
    }
  };
  const saveEditChanges = async () => {
    if (!isEditMode || !onSubmitRequest) return;
    try {
      setSubmitState({ status: "submitting", message: "" });
      await onSubmitRequest(editSubmitPayload());
      setSubmitState({ status: "success", message: "Your changes were saved successfully." });
      setClientNotice({ kind: "success", title: "Changes saved", message: "Your booking updates were saved." });
    } catch (error) {
      console.error("Save failed", error);
      setSubmitState({ status: "error", message: error.message || "We could not save the changes. Please try again." });
      setClientNotice({ kind: "danger", title: "Could not save", message: error.message || "Please try again.", duration: 4600 });
    }
  };
  const emailVerificationPropsFor = (field) => {
    if (!validations.emailVerification || field?.id !== emailField?.id) return null;
    const message = emailVerified
      ? (emailVerificationStatus.message || "Email verified. Pricing is now visible.")
      : (emailVerificationStatus.status === "verified" ? "" : emailVerificationStatus.message);
    return {
      enabled: true,
      verified: emailVerified,
      status: emailVerified ? "verified" : emailVerificationStatus.status,
      message,
      pulseKey: emailFieldPulseKey,
      onValidate: requestEmailVerification,
    };
  };
  const validateButtonLabel = emailVerificationStatus.status === "sending"
    ? "Sending..."
    : emailVerificationStatus.status === "checking"
    ? "Checking..."
    : "Validate";
  const validateButtonDisabled = emailVerificationStatus.status === "sending" || emailVerificationStatus.status === "checking" || emailVerified;
  const lockedCostSummaryPrompt = (
    <>
      <div style={{ borderTop: "1px solid #d9d4cf", margin: "14px 0 0", paddingTop: 18, textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)", marginBottom: 18 }}>
          Pricing and cost summaries are available after email validation.
        </div>
        <p style={{ margin: "0 auto 22px", maxWidth: 560, color: "var(--ink)", fontSize: 13, lineHeight: 1.55 }}>
          To see the pricing and cost summary, enter your email address in Step 1 and click Validate.
        </p>
        <button
          type="button"
          className="btn"
          style={{ justifyContent: "center", minWidth: 92, background: "#f7c75d", borderColor: "#f7c75d", color: "#5e4b12", fontSize: 16, fontWeight: 500 }}
          disabled={validateButtonDisabled}
          onClick={() => requestEmailVerification(emailAnswer)}
        >
          {validateButtonLabel}
        </button>
        {!emailLooksValid && (
          <div style={{ marginTop: 12, color: "var(--danger)", fontSize: 12, fontWeight: 650 }}>
            Enter your email address in Step 1 first.
          </div>
        )}
        {emailVerificationStatus.message && emailVerificationStatus.status !== "verified" && (
          <div style={{ marginTop: 12, color: emailVerificationStatus.status === "error" ? "var(--danger)" : "var(--ink-3)", fontSize: 12, fontWeight: 650 }}>
            {emailVerificationStatus.message}
          </div>
        )}
      </div>
    </>
  );
  const renderCostSummaryCard = (className = "cv-cost-sidebar") => {
    const fmt = checkoutCostData.fmt;
    const splitContent = splitSpaceContentCost(checkoutCostData);
    const hasAnything = !!venueCost || checkoutCostData.optionsCost.length > 0 || checkoutCostData.rentalCost.length > 0;
    const openBreakdown = (title, amount, lines) => {
      setMobileCostOpen(false);
      setCostBreakdown({ title, amount, lines: lines.filter((ln) => Number(ln.total || 0) !== 0 || ln.meta || ln.label) });
    };
    const updateRentalExtrasAmount = (value) => {
      const amount = Math.max(0, Number(value || 0));
      setCostAdminAdjustments((current) => ({ ...current, rentalExtras: amount }));
      const extrasFields = rentalExtrasFieldsFromSteps(list);
      setAnswers((current) => {
        const next = { ...current };
        extrasFields.forEach((field) => {
          const existing = next[field.id] && typeof next[field.id] === "object" ? next[field.id] : {};
          next[field.id] = { ...existing, amount };
        });
        return next;
      });
    };
    const quoteLine = (label, amount, lines, { editableRentalExtras = false } = {}) => (
      <div className="cv-cost-row" key={label}>
        <span className="cv-cost-bullet">
          <span className="cv-cost-bullet-dot">•</span>
          <button className="cv-cost-link" type="button" onClick={() => openBreakdown(label, amount, lines)}>{label}</button>
          {adminEditMode && editableRentalExtras && !rentalExtrasEditing && (
            <button type="button" className="btn sm" style={{ padding: "3px 7px", minHeight: 0, fontSize: 10 }} onClick={() => setRentalExtrasEditing(true)}>Edit</button>
          )}
        </span>
        {adminEditMode && editableRentalExtras && rentalExtrasEditing ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              aria-label="Space Extra Costs amount"
              value={(costAdminAdjustments.rentalExtras ?? amount) || ""}
              onChange={(event) => updateRentalExtrasAmount(event.target.value)}
              style={{ width: 92, minHeight: 30, padding: "4px 7px", textAlign: "right" }}
            />
            <button type="button" className="btn sm" style={{ padding: "3px 7px", minHeight: 0, fontSize: 10 }} onClick={() => setRentalExtrasEditing(false)}>Done</button>
          </span>
        ) : <span className="cv-cost-amount">{fmt(amount)}</span>}
      </div>
    );
    const discountRows = summaryDiscountRows(checkoutCostData);
    const additionalDiscountRow = discountRows.find((discount) => discount.id === "additional_discount");
    const automaticDiscountRows = discountRows.filter((discount) => discount.id !== "additional_discount");
    const updateAdditionalDiscount = (value) => {
      setCostAdminAdjustments((current) => ({ ...current, additionalDiscount: Math.max(0, Number(value || 0)) }));
    };
    const updateSecurityDeposit = (value) => {
      setCostAdminAdjustments((current) => ({ ...current, securityDeposit: Math.max(0, Number(value || 0)) }));
    };
    const resetSecurityDeposit = () => {
      setCostAdminAdjustments((current) => {
        const next = { ...current };
        delete next.securityDeposit;
        return next;
      });
      setSecurityDepositEditing(false);
    };
    return (
      <div className={className}>
        <div className="cv-cost-title">Summary of Cost</div>
        {costSummaryLocked ? (
          lockedCostSummaryPrompt
        ) : (
          <>
            <div className="cv-cost-section-title">Total Quote:</div>
            {quoteLine("Space Rental", checkoutCostData.spaceRentalTotal, checkoutCostData.spaceLines)}
            {quoteLine("Space Content Rentals", splitContent.rentalsTotal, splitContent.rentalLines)}
            {quoteLine("Space Extra Costs", splitContent.extrasTotal, splitContent.extrasLines, { editableRentalExtras: true })}
            {quoteLine("Catering Cost", checkoutCostData.cateringTotal, checkoutCostData.cateringLines)}
            {quoteLine("Set up Service Cost", checkoutCostData.setupTotal, checkoutCostData.setupLines)}
            {quoteLine("Event Service Cost", checkoutCostData.eventTotal, checkoutCostData.eventLines)}
            {quoteLine("Clear up Service Cost", checkoutCostData.cleanupTotal, checkoutCostData.cleanupLines)}
            <div style={{ borderTop: "1px solid #e6ded8", marginTop: 12, paddingTop: 10 }}>
              {automaticDiscountRows.map((discount) => (
                <div className="cv-cost-row" key={discount.id || discount.label}>
                  <span>{discount.label}</span>
                  <span>{fmt(discount.total)}</span>
                </div>
              ))}
              {(adminEditMode || additionalDiscountRow) && (
                <div className="cv-cost-row" key="additional_discount" style={{ alignItems: "center" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                    Additional Discount
                    {adminEditMode && !additionalDiscountEditing && (
                      <button type="button" className="btn sm" style={{ padding: "3px 7px", minHeight: 0, fontSize: 10 }} onClick={() => setAdditionalDiscountEditing(true)}>Edit</button>
                    )}
                  </span>
                  {adminEditMode && additionalDiscountEditing ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        step="0.01"
                        aria-label="Additional Discount amount"
                        value={costAdminAdjustments.additionalDiscount || ""}
                        onChange={(event) => updateAdditionalDiscount(event.target.value)}
                        style={{ width: 92, minHeight: 30, padding: "4px 7px", textAlign: "right" }}
                      />
                      <button type="button" className="btn sm" style={{ padding: "3px 7px", minHeight: 0, fontSize: 10 }} onClick={() => setAdditionalDiscountEditing(false)}>Done</button>
                    </span>
                  ) : (
                    <span>{fmt(additionalDiscountRow?.total || 0)}</span>
                  )}
                </div>
              )}
              <div className="cv-cost-row"><span>Subtotal</span><span>{fmt(costSubtotalForDisplay(checkoutCostData))}</span></div>
              {(checkoutCostData.feeLines || []).map((fee) => (
                <div className="cv-cost-row" key={fee.id || fee.label}>
                  <span>{fee.displayLabel || fee.label}</span>
                  <span>{fmt(fee.total)}</span>
                </div>
              ))}
            </div>
            <div className="cv-cost-row cv-cost-total-band"><span>Total</span><span>{fmt(checkoutCostData.total)}</span></div>
            <div className="cv-cost-row" style={{ alignItems: "center" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                Security Deposit (refundable)
                {adminEditMode && !securityDepositEditing && (
                  <button type="button" className="btn sm" style={{ padding: "3px 7px", minHeight: 0, fontSize: 10 }} onClick={() => setSecurityDepositEditing(true)}>Edit</button>
                )}
                {adminEditMode && (
                  <button
                    type="button"
                    className="btn sm"
                    style={{ padding: "3px 7px", minHeight: 0, fontSize: 14, lineHeight: 1 }}
                    onClick={resetSecurityDeposit}
                    title={`Reset to calculated value (${fmt(checkoutCostData.calculatedSecurityDeposit || 0)})`}
                    aria-label="Reset security deposit to calculated value"
                  >↺</button>
                )}
              </span>
              {adminEditMode && securityDepositEditing ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    aria-label="Security Deposit amount"
                    value={(costAdminAdjustments.securityDeposit ?? checkoutCostData.securityDeposit) || ""}
                    onChange={(event) => updateSecurityDeposit(event.target.value)}
                    style={{ width: 92, minHeight: 30, padding: "4px 7px", textAlign: "right" }}
                  />
                  <button type="button" className="btn sm" style={{ padding: "3px 7px", minHeight: 0, fontSize: 10 }} onClick={() => setSecurityDepositEditing(false)}>Done</button>
                </span>
              ) : <span>{fmt(checkoutCostData.securityDeposit)}</span>}
            </div>
            <div className="cv-cost-row"><span>Total with Security Deposit</span><span>{fmt(checkoutCostData.totalWithDeposit)}</span></div>
          </>
        )}
        {hasAnything && !costSummaryLocked && (
          <div className="cv-cost-note">
            {venueCost && !venueCost.hasBooking
              ? (validations.dateTimeRequirementMessage || "Select booking dates and times for a more accurate estimate.")
              : "Estimate updates as you make selections."}
          </div>
        )}
      </div>
    );
  };

  return (
    <ClientPricingVisibilityContext.Provider value={{ pricesVisible }}>
    <div className="cv-overlay" data-screen-label="Client Preview">
      {/* Close button */}
      {!publicMode && !adminEditMode && (
        <>
          <button className="cv-close" onClick={onClose} title="Close preview (Esc)">
            <Ic.Close size={18} />
          </button>
        </>
      )}

      <div className="cv-page">
        {adminEditMode && (
          <div className="cv-admin-bar">
            <div className="cv-admin-bar-identity">
              <strong>Admin Edit Mode</strong>
              <span>Booking ID {bookingCodeFromId(initialDraft?.recordId)}</span>
            </div>
            <div className="cv-admin-bar-actions">
              <span className="cv-admin-bar-note">Admin-only controls and overrides</span>
              <button className="cv-admin-save-btn" type="button" onClick={saveEditChanges} disabled={submitState.status === "submitting"}>
                {submitState.status === "submitting" ? "Saving..." : "Save changes"}
              </button>
              <button className="cv-admin-exit-btn" type="button" onClick={onClose}>
                <Ic.Close size={15} /> Exit
              </button>
            </div>
          </div>
        )}
        {adminEditMode && renderAdminActions && (
          <div data-admin-booking-actions>{renderAdminActions({ answers, setAnswer, step, recordId: initialDraft?.recordId })}</div>
        )}
        {/* Header with progress bar */}
        <div className="cv-header">
          {isEditMode && !adminEditMode && (
            <button className="cv-save-edit-btn" onClick={saveEditChanges} disabled={submitState.status === "submitting"}>
              {submitState.status === "submitting" ? "Saving..." : "Save changes"}
            </button>
          )}
          <h1 className="cv-title">{branding.siteTitle || "Customize Your Event"}</h1>
          <div className="cv-intro-note">
            This is just a planning tool. Fill in what you can, and it is okay if some details are missing or change later. Your saved form lets us know you are interested in the space, and we can look back, update details, and finalize everything together afterward.
          </div>
          <div className={"cv-progress-shell" + (progressScrollState.left ? " has-left-shadow" : "") + (progressScrollState.right ? " has-right-shadow" : "")}>
            <div className="cv-progress-bar" ref={progressBarRef} onScroll={updateProgressScrollState}>
              {list.map((s, i) => (
                <React.Fragment key={s.id}>
                  {i > 0 && <div className={"cv-progress-line" + (stepHasSavedData(s) ? " saved" : i <= stepIdx ? " done" : "")} />}
                  <div className="cv-progress-step" data-progress-step={i} onClick={() => goTo(i)}>
                    <div className={"cv-progress-dot" + (i === stepIdx ? " active" : stepHasSavedData(s) ? " saved" : "")}>
                      <span>{i + 1}</span>
                      {stepHasSavedData(s) && <span className="cv-progress-check">✓</span>}
                    </div>
                    <span
                      className={"cv-progress-label" + (i === stepIdx ? " active" : stepHasSavedData(s) ? " saved" : "")}
                      title={s.name}
                    >
                      {previewStepLabel(s.name)}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <div className="cv-divider" />

        {/* Body — fields + cost sidebar */}
        <div className="cv-body">
          <div className="cv-main">
            {step ? (
              <>
                <div className="cv-step-title">{step.name}</div>
                {step.description && <p className="cv-step-desc">{step.description}</p>}

                {step.stepType === "checkout" ? (
                  <>
                    <CheckoutPreviewBody
                      step={step}
                      costData={checkoutCostData}
                      value={checkoutAgreementValue}
                      onChange={(v) => setAnswer("__checkoutAgreements", { ...(answers.__checkoutAgreements || {}), [step.id]: v })}
                      onBreakdown={(title, amount, lines) => setCostBreakdown({ title, amount, lines: (lines || []).filter((ln) => Number(ln.total || 0) !== 0 || ln.meta || ln.label) })}
                      summaryLocked={costSummaryLocked}
                      lockedMessage={costSummaryLockedMessage}
                    />
                    {normalVisibleFields.length > 0 && (
                      <div className="cv-fields-grid" style={{ marginTop: 20 }}>
                        {normalVisibleFields.map((f) => {
                          const wide = ["textarea", "radio", "multiselect", "toggle", "room", "addons", "separator", "instructional", "checkbox", "dietary", "extras"].includes(f.type) || f.displayAs === "radio";
                          const fieldError = fieldErrorFor(f.id);
                          return (
                            <div
                              key={f.id}
                              data-cv-field-id={f.id}
                              className={fieldError ? "cv-field-has-error" : ""}
                              style={wide ? { gridColumn: "1 / -1" } : {}}
                            >
                              <CVField f={f} value={answers[f.id]} onChange={(v) => setAnswer(f.id, v)} fullWidth={wide} stepType={step.stepType} guestCount={guestCount} autoDeliveryLines={checkoutCostData.deliveryLines} emailVerification={emailVerificationPropsFor(f)} adminEditMode={adminEditMode} />
                              {renderFieldError(f.id)}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : step.stepType === "venue" ? (
                  <>
                    <VenuePreviewBody step={step} answers={answers} allSteps={list} onVenueCost={setVenueCost} onAnswer={setAnswer} validationMessages={validations} />
                    {rentalGroupFields.length > 0 && (
                      <>
                        <ClientVenueRentalGroupsPreview
                          fields={rentalGroupFields}
                          value={answers.__rentalGroups?.[step.id]}
                          onChange={(v) => setAnswer("__rentalGroups", { ...(answers.__rentalGroups || {}), [step.id]: v })}
                          title={rentalGroupFields[0]?.rentalPreviewHeading || "Space Contents"}
                          layoutRecommendations={layoutRecommendations}
                          venues={selectedRentalVenues}
                        />
                        {renderRentalGroupErrors()}
                      </>
                    )}
                    {normalVisibleFields.length > 0 && (
                      <div className="cv-fields-grid" style={{ marginTop: 20 }}>
                        {normalVisibleFields.map((f) => {
                          const wide = ["textarea", "radio", "multiselect", "toggle", "room", "addons", "separator", "instructional", "checkbox", "dietary", "extras"].includes(f.type) || f.displayAs === "radio";
                          const fieldError = fieldErrorFor(f.id);
                          return (
                            <div
                              key={f.id}
                              data-cv-field-id={f.id}
                              className={fieldError ? "cv-field-has-error" : ""}
                              style={wide ? { gridColumn: "1 / -1" } : {}}
                            >
                              <CVField f={f} value={answers[f.id]} onChange={(v) => setAnswer(f.id, v)} fullWidth={wide} stepType={step.stepType} guestCount={guestCount} autoDeliveryLines={checkoutCostData.deliveryLines} emailVerification={emailVerificationPropsFor(f)} adminEditMode={adminEditMode} />
                              {renderFieldError(f.id)}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : step.stepType === "layout" ? (
                  <>
                    <LayoutPreviewBody step={step} allSteps={list} answers={answers} onAnswer={setAnswer} onLayoutRecommendations={setLayoutRecommendations} />
                    {rentalGroupFields.length > 0 && (
                      <>
                        <ClientVenueRentalGroupsPreview
                          fields={rentalGroupFields}
                          value={answers.__rentalGroups?.[step.id]}
                          onChange={(v) => setAnswer("__rentalGroups", { ...(answers.__rentalGroups || {}), [step.id]: v })}
                          title={rentalGroupFields[0]?.rentalPreviewHeading || "Space Contents"}
                          layoutRecommendations={layoutRecommendations}
                          venues={selectedRentalVenues}
                        />
                        {renderRentalGroupErrors()}
                      </>
                    )}
                    {normalVisibleFields.length > 0 && (
                      <div className="cv-fields-grid" style={{ marginTop: 20 }}>
                        {normalVisibleFields.map((f) => {
                          const wide = ["textarea", "radio", "multiselect", "toggle", "room", "addons", "separator", "instructional", "checkbox", "dietary", "extras"].includes(f.type) || f.displayAs === "radio";
                          const fieldError = fieldErrorFor(f.id);
                          return (
                            <div
                              key={f.id}
                              data-cv-field-id={f.id}
                              className={fieldError ? "cv-field-has-error" : ""}
                              style={wide ? { gridColumn: "1 / -1" } : {}}
                            >
                              <CVField f={f} value={answers[f.id]} onChange={(v) => setAnswer(f.id, v)} fullWidth={wide} stepType={step.stepType} guestCount={guestCount} autoDeliveryLines={checkoutCostData.deliveryLines} emailVerification={emailVerificationPropsFor(f)} adminEditMode={adminEditMode} />
                              {renderFieldError(f.id)}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {visibleFields.length === 0 ? (
                      <div style={{ color: "var(--ink-3)", fontStyle: "italic", padding: "20px 0" }}>
                        No client-visible fields on this step.
                      </div>
                    ) : (
                      <>
                        {rentalGroupFields.length > 0 && (
                          <>
                            <ClientVenueRentalGroupsPreview
                              fields={rentalGroupFields}
                              value={answers.__rentalGroups?.[step.id]}
                              onChange={(v) => setAnswer("__rentalGroups", { ...(answers.__rentalGroups || {}), [step.id]: v })}
                              title={rentalGroupFields[0]?.rentalPreviewHeading || "Rental Groups"}
                              layoutRecommendations={layoutRecommendations}
                              venues={selectedRentalVenues}
                            />
                            {renderRentalGroupErrors()}
                          </>
                        )}
	                        {normalVisibleFields.length > 0 && (
	                          <div className="cv-fields-grid">
	                            {normalVisibleFields.map((f) => {
	                              const wide = ["textarea", "radio", "multiselect", "toggle", "room", "addons", "separator", "instructional", "checkbox", "dietary", "extras"].includes(f.type) || f.displayAs === "radio";
	                              const fieldError = fieldErrorFor(f.id);
	                              return (
	                                <div
	                                  key={f.id}
	                                  data-cv-field-id={f.id}
	                                  className={fieldError ? "cv-field-has-error" : ""}
	                                  style={wide ? { gridColumn: "1 / -1" } : {}}
	                                >
	                                  <CVField
	                                    f={f}
	                                    value={answers[f.id]}
	                                    onChange={(v) => setAnswer(f.id, v)}
	                                    fullWidth={wide}
                                    stepType={step.stepType}
                                    guestCount={guestCount}
	                                    autoDeliveryLines={checkoutCostData.deliveryLines}
	                                    emailVerification={emailVerificationPropsFor(f)}
	                                    adminEditMode={adminEditMode}
	                                  />
	                                  {fieldError && (
	                                    <div className="cv-field-error" key={`${f.id}-${validationPulseKey}`}>
	                                      {fieldError}
	                                    </div>
	                                  )}
	                                </div>
	                              );
	                            })}
	                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

	                {clientNotice && (
	                  <div className={"cv-client-toast cv-client-toast-" + (clientNotice.kind || "info")}>
	                    <span className="cv-client-toast-dot" />
	                    <span>
	                      <b>{clientNotice.title}</b>
	                      {clientNotice.message && <small>{clientNotice.message}</small>}
	                    </span>
	                  </div>
	                )}

		                <div className="cv-nav">
	                  {step?.stepType === "checkout" && costSummaryLocked && (
                    <div style={{ gridColumn: "1 / -1", width: "100%", color: "var(--danger)", background: "var(--danger-soft)", border: "1px solid #f0c9c0", borderRadius: 6, padding: "10px 12px", fontSize: 12, fontWeight: 650 }}>
                      {costSummaryLockedMessage}
                    </div>
                  )}
                  {step?.stepType === "checkout" && missingCheckoutAgreements.length > 0 && (
                    <div style={{ gridColumn: "1 / -1", width: "100%", color: "var(--danger)", background: "var(--danger-soft)", border: "1px solid #f0c9c0", borderRadius: 6, padding: "10px 12px", fontSize: 12, fontWeight: 650 }}>
                      Check all required agreement boxes before submitting.
                    </div>
                  )}
                  {stepIdx > 0 && (
                    <button className="cv-btn-prev" onClick={() => { setStepIdx(stepIdx - 1); }}>
                      Previous
                    </button>
                  )}
                  <button
                    className="cv-btn-next"
                    disabled={submitState.status === "submitting"}
		                    title={isLast && !checkoutCanSubmit ? "Complete the required checkout items before saving." : undefined}
		                    onClick={async () => {
		                      if (!canReachStep(stepIdx + 1, { forceCurrent: true })) return;
		                      if (isLast) {
	                        if (missingCheckoutAgreements.length > 0) {
                          return;
                        }
                        if (costSummaryLocked) {
                          return;
                        }
                        try {
                          await saveCurrentStep({ finalSubmit: true });
                        } catch (error) {
                          return;
                        }
                        if (!publicMode) onClose();
                      } else {
                        try {
                          await saveCurrentStep();
                          goTo(stepIdx + 1);
                        } catch (_) {}
                      }
                    }}
                  >
                    {submitState.status === "submitting" ? "Saving..." : isLast ? "Save" : "Save & Next"}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ color: "var(--ink-3)", fontStyle: "italic" }}>No steps in this workflow.</div>
            )}
          </div>

          {/* Dynamic cost summary sidebar */}
          {(adminEditMode || step?.stepType !== "checkout") && renderCostSummaryCard("cv-cost-sidebar cv-cost-sidebar-desktop")}
        </div>
        {(adminEditMode || step?.stepType !== "checkout") && (
          <>
            <button type="button" className="cv-mobile-cost-tab" onClick={() => setMobileCostOpen(true)}>
              <span>Summary of Cost</span>
              <strong>{costSummaryLocked ? "Validate email" : checkoutCostData.fmt(checkoutCostData.totalWithDeposit)}</strong>
            </button>
            {mobileCostOpen && (
              <div className="cv-mobile-cost-backdrop" onClick={() => setMobileCostOpen(false)}>
                <div className="cv-mobile-cost-sheet" onClick={(e) => e.stopPropagation()}>
                  <button type="button" className="cv-mobile-cost-handle" onClick={() => setMobileCostOpen(false)} aria-label="Close summary" />
                  {renderCostSummaryCard("cv-cost-sidebar cv-cost-sidebar-mobile")}
                </div>
              </div>
            )}
          </>
        )}
        {pricesVisible && costBreakdown && (
          <div className="cv-cost-modal-backdrop" onClick={() => setCostBreakdown(null)}>
            <div className="cv-cost-modal" onClick={(e) => e.stopPropagation()}>
              <div className="cv-cost-modal-head">
                <div>
                  <div className="cv-cost-modal-title">{costBreakdown.title} Breakdown</div>
                  <div className="cv-cost-modal-total">{formatPreviewMoney(costBreakdown.amount || 0)}</div>
                </div>
                <button className="cv-cost-modal-close" type="button" onClick={() => setCostBreakdown(null)} title="Close">
                  <Ic.Close size={18} />
                  Close
                </button>
              </div>
              <div className="cv-cost-modal-body">
                {costModalGroups.length > 0 ? (
                  <>
                    {costModalGroups.map((group) => (
                      <details className="cv-cost-breakdown-card" key={group.title} open={costModalGroups.length === 1}>
                        <summary className="cv-cost-breakdown-head">
                          <div className="cv-cost-breakdown-name">{group.title}</div>
                          <div className="cv-cost-breakdown-sum">{formatPreviewMoney(group.total || 0)}</div>
                          <div className="cv-cost-breakdown-caret">⌄</div>
                        </summary>
                        <div className="cv-cost-breakdown-table">
                          <div className="cv-cost-breakdown-header">
                            <span>Item</span>
                            <span style={{ textAlign: "center" }}>Qty</span>
                            <span style={{ textAlign: "right" }}>Amount</span>
                          </div>
                          {group.lines.map((line, i) => (
                            <div className="cv-cost-detail-row" key={i}>
                              <div>
                                <div className="cv-cost-detail-main">{line.label}</div>
                                {line.meta && <div className="cv-cost-detail-meta">{line.meta}</div>}
                              </div>
                              <div className="cv-cost-detail-qty">{Number(line.quantity || 1).toLocaleString("en-US")}</div>
                              <div className="cv-cost-detail-amount">{formatPreviewMoney(line.total || 0)}</div>
                            </div>
                          ))}
                        </div>
                      </details>
                    ))}
                    <div className="cv-cost-breakdown-footer">
                      <span>Total {costBreakdown.title}</span>
                      <span>{formatPreviewMoney(costBreakdown.amount || 0)}</span>
                    </div>
                  </>
                ) : (
                  <div style={{ color: "var(--ink-3)", fontSize: 13 }}>No priced items selected in this category yet.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </ClientPricingVisibilityContext.Provider>
  );
}

// ----- Client-View styled per-type field renderer -----
// Helpers for 4-level rich options tree (options → sub-options → selections → specifications)
// Attached to window so PreviewField (in an earlier script block) can also reference them.
window.RICH_HAS_CHILD_KEY = { option: "hasSubOptions", subOption: "hasSelections", selection: "hasSpecifications", specification: null };
window.RICH_CHILD_KEY     = { option: "subOptions",    subOption: "selections",    selection: "specifications",    specification: null };
window.RICH_NEXT_LEVEL    = { option: "subOption",     subOption: "selection",     selection: "specification",     specification: null };
const RICH_HAS_CHILD_KEY = window.RICH_HAS_CHILD_KEY;
const RICH_CHILD_KEY = window.RICH_CHILD_KEY;
const RICH_NEXT_LEVEL = window.RICH_NEXT_LEVEL;

// Scans the workflow for a field representing total guest count and returns its numeric answer.
// Matches labels containing "attendees", "guests", or "number of guests" (case-insensitive).
window.findGuestCount = function(steps, answers) {
  for (const step of (steps || [])) {
    for (const f of (step.fields || [])) {
      const lab = (f.label || "").toLowerCase();
      if (lab.includes("attendees") || lab.includes("guests") || lab.includes("number of people")) {
        const v = answers ? answers[f.id] : null;
        const n = Number(v);
        if (v != null && v !== "" && !isNaN(n) && n > 0) return n;
      }
    }
  }
  return 0;
};

// Walks a rich-options field's selected value tree and returns priced lines + total.
// guestCount is used as the multiplier when an option has peopleLinkedToGuests=true.
window.computeRichCost = function(field, value, guestCount) {
  if (!field || !value || typeof value !== "object") return { total: 0, lines: [] };
  const lines = [];
  let total = 0;
  const walk = (items, valueSlice, level, depth) => {
    if (!items || !valueSlice || typeof valueSlice !== "object") return;
    const items_ = items.map(i => typeof i === "string" ? { label: i } : i);
    items_.forEach(item => {
      const childValue = valueSlice[item.label];
      if (childValue === undefined) return; // not selected at this level
      const basePrice = item.enablePrice ? (Number(item.price) || 0) : 0;
      const guests = Number(guestCount) || 0;
      // If there is no separate people selector, per-person pricing uses the total attendee count from Step 2.
      let qtyPeople = item.peopleLinkedToGuests
        ? guests
        : item.hasPeopleOption
        ? ((childValue && Number(childValue.__qty_people)) || 1)
        : guests;
      const qtyHours = (childValue && Number(childValue.__qty_hours)) || 1;
      // Multiplier based on pricing structure
      let multiplier = 1;
      if (item.pricingStructure === "per_person") multiplier = qtyPeople;
      else if (item.pricingStructure === "per_hour") multiplier = qtyHours;
      else if (item.pricingStructure === "per_person_hour") multiplier = qtyPeople * qtyHours;
      const price = basePrice * multiplier;
      lines.push({
        label: item.label, price, basePrice, qtyPeople, qtyHours, multiplier,
        depth, enablePrice: !!item.enablePrice, level, pricingStructure: item.pricingStructure
      });
      total += price;
      const childKey = window.RICH_CHILD_KEY[level];
      const nextLevel = window.RICH_NEXT_LEVEL[level];
      const hasChildKey = window.RICH_HAS_CHILD_KEY[level];
      if (childKey && nextLevel && hasChildKey && item[hasChildKey] && item[childKey]) {
        walk(item[childKey], childValue, nextLevel, depth + 1);
      }
    });
  };
  walk(field.options || [], value, "option", 0);
  return { total, lines };
};

// Walks the whole workflow and collects priced lines per rich-options field.
// Resolves guest count once from the workflow answers and passes it down to computeRichCost.
window.computeWorkflowOptionsCost = function(steps, answers) {
  const guestCount = window.findGuestCount(steps, answers);
  const result = [];
  (steps || []).forEach(step => {
    (step.fields || []).forEach(f => {
      if (f.visibleToClient === false) return;
      const hasRich = (f.options || []).some(isRichWorkflowOption);
      const value = answers[f.id];
      if (f.type === "select" && f.groupOptions) {
        const selectedLabel = value && typeof value === "object" ? value.__selected : value;
        if (!selectedLabel) return;
        const selectedOption = normalizeSimpleOptionGroups(f.options || [])
          .flatMap((group) => group.options || [])
          .find((option) => option.label === selectedLabel);
        if (!selectedOption) return;
        const lines = [];
        if (optionHasPricing(selectedOption)) {
          const line = simpleOptionCostLine(selectedOption, guestCount, 0, "option");
          if (line) lines.push(line);
        }
        if (value && typeof value === "object" && value.__sub && (selectedOption.subOptions || []).length) {
          const subCost = window.computeRichCost({ options: selectedOption.subOptions || [] }, value.__sub, guestCount);
          subCost.lines.forEach((line) => lines.push({ ...line, depth: line.depth + 1 }));
        }
        const total = lines.reduce((sum, line) => sum + line.price, 0);
        if (lines.length) result.push({ stepId: step.id, stepName: step.name, stepType: step.stepType, fieldId: f.id, fieldLabel: f.label, total, lines });
        return;
      }
      if (hasRich) {
        if (!value || typeof value !== "object" || Object.keys(value).length === 0) return;
        const { total, lines } = window.computeRichCost(f, value, guestCount);
        if (lines.length === 0) return;
        result.push({ stepId: step.id, stepName: step.name, stepType: step.stepType, fieldId: f.id, fieldLabel: f.label, total, lines });
        return;
      }
      if (!f.linkedToPricing || !["radio", "select", "multiselect"].includes(f.type)) return;
      const selectedLabels = Array.isArray(value) ? value : value ? [value] : [];
      if (!selectedLabels.length) return;
      const lines = (f.options || [])
        .map((option) => normalizeSimpleOption(option))
        .filter((option) => selectedLabels.includes(option.label) && optionHasPricing(option))
        .map((option) => simpleOptionCostLine(option, guestCount, 0, "option"))
        .filter(Boolean);
      const total = lines.reduce((sum, line) => sum + line.price, 0);
      if (lines.length) result.push({ stepId: step.id, stepName: step.name, stepType: step.stepType, fieldId: f.id, fieldLabel: f.label, total, lines });
    });
  });
  return result;
};

// Inline description with See more / See less for long text.
function CVInlineDescription({ text }) {
  const [expanded, setExpanded] = React.useState(false);
  if (!text) return null;
  const isLong = text.length > 220;
  const shown = (!isLong || expanded) ? text : text.slice(0, 220).trimEnd() + "…";
  return (
    <div style={{ fontSize: 12.5, color: "#444", lineHeight: 1.55, marginTop: 4, marginBottom: 4, paddingLeft: 26 }}>
      {shown.split("\n").map((para, i) => (
        <span key={i}>{i > 0 && <br />}{para}</span>
      ))}
      {isLong && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded((x) => !x); }}
          style={{ background: "none", border: "none", color: "var(--ink-3)", fontSize: 12, fontWeight: 500, cursor: "pointer", padding: 0, marginLeft: 4, textDecoration: "underline" }}
        >
          {expanded ? "See less" : "See more…"}
        </button>
      )}
    </div>
  );
}

function CVFileUploadField({ field, value, onChange, labelEl, compact = false }) {
  const Ic = window.Icons;
  const inputRef = React.useRef(null);
  const [uploading, setUploading] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [error, setError] = React.useState("");
  const multiple = !!field.allowMultipleFiles;
  const accept = field.acceptedFiles && field.acceptedFiles !== "*" ? field.acceptedFiles : undefined;
  const files = (Array.isArray(value) ? value : value ? [value] : [])
    .map((file, index) => typeof file === "string" ? { name: `Uploaded file ${index + 1}`, url: file } : file)
    .filter(Boolean);
  const uploadFiles = async (selectedFiles) => {
    const selected = Array.from(selectedFiles || []).filter(Boolean);
    if (!selected.length || uploading) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = [];
      for (const file of (multiple ? selected : selected.slice(0, 1))) {
        const [dataUrl] = await readFilesAsDataUrls([file]);
        const response = await collaburoApi("/api/uploads/images", {
          method: "POST",
          body: JSON.stringify({ dataUrl, filename: file.name, folder: "collaburo/booking-files" }),
        });
        const stored = response.file || response.image || {};
        uploaded.push({
          name: file.name || stored.originalFilename || "Uploaded file",
          type: file.type || stored.format || "",
          size: Number(file.size || stored.bytes || 0),
          url: stored.secureUrl || "",
          publicId: stored.publicId || "",
        });
      }
      onChange(multiple ? [...files, ...uploaded] : (uploaded[0] || null));
    } catch (uploadError) {
      setError(uploadError.message || "This file could not be uploaded. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };
  const removeFile = (index) => {
    const next = files.filter((_, fileIndex) => fileIndex !== index);
    onChange(multiple ? next : null);
  };
  const uploadLabel = (
    <label
      className={`cv-file-upload${compact ? " compact" : ""}${dragging ? " dragging" : ""}${uploading ? " uploading" : ""}`}
      onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
      onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
      onDragLeave={(event) => { event.preventDefault(); if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false); }}
      onDrop={(event) => { event.preventDefault(); setDragging(false); uploadFiles(event.dataTransfer.files); }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={uploading}
        onChange={(event) => uploadFiles(event.target.files)}
      />
      <Ic.File size={16} />
      <span>{uploading ? "Uploading file…" : "Drop a file or click to upload"}</span>
    </label>
  );
  const fileList = files.length > 0 && (
    <div className={"cv-file-list" + (compact ? " compact" : "")}>
      {files.map((file, index) => (
        <div className="cv-file-item" key={`${file.publicId || file.url || file.name}_${index}`}>
          <Ic.File size={14} />
          <a href={file.url} target="_blank" rel="noreferrer" title={file.name}>{file.name || `Uploaded file ${index + 1}`}</a>
          {file.size > 0 && <span>{formatFileSize(file.size)}</span>}
          <button type="button" onClick={() => removeFile(index)} aria-label={`Remove ${file.name || "uploaded file"}`} title="Remove file"><Ic.Close size={13} /></button>
        </div>
      ))}
    </div>
  );
  if (compact) {
    return (
      <>
        {labelEl}
        {uploadLabel}
        {error && <div className="cv-file-error compact">{error}</div>}
        {fileList}
      </>
    );
  }
  return (
    <div className="cv-form-group">
      {labelEl}
      {uploadLabel}
      {error && <div className="cv-file-error">{error}</div>}
      {fileList}
    </div>
  );
}

function formatFileSize(bytes = 0) {
  const size = Number(bytes || 0);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 102.4) / 10} KB`;
  return `${Math.round(size / (1024 * 102.4)) / 10} MB`;
}

// Renders admin-controlled selectors when a service is selected.
// Three independent dropdowns: Sex / # of people / # of hours.
// When the People selector is linked to the total guest count, the dropdown is replaced
// by a "× N attendees" indicator pulled from Step 2.
function CVQuantityRow({ item, value, onChange, label, guestCount }) {
  const hasSex = !!item.hasSexOption;
  const peopleLinked = !!item.peopleLinkedToGuests;
  const hasPeopleSelector = !!item.hasPeopleOption && !peopleLinked;
  const showLinkedIndicator = !!item.hasPeopleOption && peopleLinked;
  const hasHours = !!item.hasHoursOption;
  if (!hasSex && !hasPeopleSelector && !hasHours && !showLinkedIndicator) return null;

  const cur = value[label] || {};
  const peopleRange = item.peopleRange || { min: 1, max: 50 };
  const hoursRange = item.hoursRange || { min: 1, max: 24 };
  const sexOptions = item.sexOptions || [];

  const peopleVals = Array.from({ length: Math.max(0, peopleRange.max - peopleRange.min + 1) }, (_, i) => peopleRange.min + i);
  const hoursVals = Array.from({ length: Math.max(0, hoursRange.max - hoursRange.min + 1) }, (_, i) => hoursRange.min + i);

  const setVal = (key, val) => onChange({ ...value, [label]: { ...cur, [key]: val } });

  const req = !!item.requireSelections;
  const reqMark = req ? <span style={{ color: "#d44", fontWeight: 700, marginLeft: 2 }}>*</span> : null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, paddingLeft: 26, marginTop: 4, marginBottom: 6, fontSize: 12, flexWrap: "wrap" }}>
      {showLinkedIndicator && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-3)", fontStyle: "italic" }}>
          <span>📊</span>
          <span># of people: <b style={{ color: "var(--ink)" }}>{guestCount || 0}</b> {guestCount ? "(from total guest count)" : "(set total guest count in Step 2)"}</span>
        </span>
      )}
      {hasSex && sexOptions.length > 0 && (
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 600 }}>Sex{reqMark}:</span>
          <select
            className="cv-input cv-select"
            value={cur.__sex || ""}
            onChange={(e) => setVal("__sex", e.target.value)}
            style={{ width: "auto", minWidth: 110, padding: "4px 24px 4px 8px" }}
          >
            <option value="">Select…</option>
            {sexOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
          </select>
        </label>
      )}
      {hasPeopleSelector && (
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 600 }}># of people{reqMark}:</span>
          <select
            className="cv-input cv-select"
            value={cur.__qty_people || peopleRange.min}
            onChange={(e) => setVal("__qty_people", Number(e.target.value))}
            style={{ width: "auto", minWidth: 64, padding: "4px 24px 4px 8px" }}
          >
            {peopleVals.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      )}
      {hasHours && (
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 600 }}># of hours{reqMark}:</span>
          <select
            className="cv-input cv-select"
            value={cur.__qty_hours || hoursRange.min}
            onChange={(e) => setVal("__qty_hours", Number(e.target.value))}
            style={{ width: "auto", minWidth: 64, padding: "4px 24px 4px 8px" }}
          >
            {hoursVals.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      )}
    </div>
  );
}

// Renders a level of the rich-options tree with full interactivity. Used by CVField (fullscreen preview).
// levelDisplays = { option, subOption, selection, specification } — field-wide display setting per level.
function CVRichTree({ items, level, displayAs, value, onChange, fieldId, depth, levelDisplays, stepType, guestCount }) {
  const pricesVisible = useClientPricingVisible();
  const items_ = (items || []).map(i => typeof i === "string" ? { label: i } : i);
  const hasChildKey = RICH_HAS_CHILD_KEY[level];
  const childKey = RICH_CHILD_KEY[level];
  const nextLevel = RICH_NEXT_LEVEL[level];

  const isSelected = (label) => !!(value && value[label]);
  const setSelected = (label, selected) => {
    if (displayAs === "checkbox") {
      const next = { ...(value || {}) };
      if (selected) {
        if (next[label] === undefined) next[label] = {};
      } else {
        delete next[label];
      }
      onChange(next);
    } else {
      if (selected) {
        onChange({ [label]: (value && value[label]) || {} });
      } else {
        onChange({});
      }
    }
  };

  const renderInfoIcons = (it) => (
    <>
      {it.infoText && (
        <span className="info-trigger" style={{ marginLeft: 6 }}>i
          <span className="preview-tooltip">
            <span className="preview-tooltip-text">{it.infoText}</span>
          </span>
        </span>
      )}
      {it.infoImages && it.infoImages.length > 0 && (
        <span className="info-trigger" title="View images" style={{ marginLeft: 4, background: "#fff4eb", color: "var(--accent)" }}>
          <span style={{ fontSize: 9, fontWeight: 800 }}>IMG</span>
          <span className="preview-tooltip" style={{ minWidth: 180 }}>
            {it.infoImages.map((img, ii) => (
              <img key={ii} src={img} alt="" className="preview-tooltip-img" style={{ marginBottom: 4 }} />
            ))}
          </span>
        </span>
      )}
    </>
  );

  // Select dropdown rendering
  if (displayAs === "select") {
    const selLabel = Object.keys(value || {})[0] || "";
    const selItem = items_.find(it => it.label === selLabel);
    return (
      <div>
        <select
          className="cv-input cv-select"
          value={selLabel}
          onChange={(e) => {
            const lbl = e.target.value;
            if (!lbl) onChange({});
            else onChange({ [lbl]: (value && value[lbl]) || {} });
          }}
        >
          <option value="">Select…</option>
          {items_.map((it, i) => {
            const unit = window.pricingUnitFor ? window.pricingUnitFor(it.pricingStructure) : "";
            const suffix = !pricesVisible ? "" : it.enablePrice && it.pricingStructure === "included"
              ? " (included)"
              : it.enablePrice && Number(it.price) > 0
              ? ` (+$${it.price}${unit ? " " + unit : ""})`
              : "";
            return (
              <option key={i} value={it.label}>{it.label}{suffix}</option>
            );
          })}
        </select>
        {selItem && hasChildKey && selItem[hasChildKey] && (selItem[childKey] || []).length > 0 && (
          <div style={{ paddingLeft: 14, marginTop: 8, borderLeft: "2px solid var(--line)" }}>
            {levelDisplays && levelDisplays.requireSubOptions && (
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", marginBottom: 5 }}>
                Required <span className="cv-req">*</span>
              </div>
            )}
            <CVRichTree
              items={selItem[childKey]}
              level={nextLevel}
              displayAs={(levelDisplays && levelDisplays[nextLevel]) || "checkbox"}
              value={(value && value[selLabel]) || {}}
              onChange={(nv) => onChange({ [selLabel]: nv })}
              fieldId={fieldId + "_" + selLabel.replace(/\s+/g, "_")}
              depth={depth + 1}
              levelDisplays={levelDisplays}
              guestCount={guestCount}
            />
          </div>
        )}
      </div>
    );
  }

  // Radio or checkbox rendering
  const isServicesStep = stepType === "services";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {items_.map((it, i) => {
        const sel = isSelected(it.label);
        return (
          <div key={i}>
            <label className="cv-choice-row">
              <input
                type={displayAs === "checkbox" ? "checkbox" : "radio"}
                name={fieldId}
                checked={sel}
                onChange={(e) => setSelected(it.label, e.target.checked)}
              />
              <span style={{ flex: 1 }}>
                {isServicesStep && (it.iconImage || it.iconUrl) && <img className="cv-service-icon" src={it.iconImage || it.iconUrl} alt="" />}
                {it.label}
                {pricesVisible && it.enablePrice && it.pricingStructure === "included" && (
                  <span style={{ color: "var(--ink-3)", marginLeft: 6, fontSize: 11, fontStyle: "italic" }}>Included in cost</span>
                )}
                {pricesVisible && it.enablePrice && it.pricingStructure === "quote" && (
                  <span style={{ color: "var(--ink-3)", marginLeft: 6, fontSize: 11, fontStyle: "italic", border: "1px solid var(--line)", padding: "1px 6px", borderRadius: 10 }}>Quote on request</span>
                )}
                {pricesVisible && it.enablePrice && it.pricingStructure !== "included" && it.pricingStructure !== "quote" && Number(it.price) > 0 && (
                  <span style={{ color: "var(--accent)", marginLeft: 6, fontWeight: 600, fontSize: 12 }}>
                    +${it.price}{window.pricingUnitFor && window.pricingUnitFor(it.pricingStructure) ? " " + window.pricingUnitFor(it.pricingStructure) : ""}
                  </span>
                )}
                {/* For non-services steps, keep the (i) popover. For services, description shown inline below. */}
                {!isServicesStep && renderInfoIcons(it)}
                {isServicesStep && it.infoImages && it.infoImages.length > 0 && (
                  <span className="info-trigger" title="View images" style={{ marginLeft: 4, background: "#fff4eb", color: "var(--accent)" }}>
                    <span style={{ fontSize: 9, fontWeight: 800 }}>IMG</span>
                    <span className="preview-tooltip" style={{ minWidth: 180 }}>
                      {it.infoImages.map((img, ii) => (<img key={ii} src={img} alt="" className="preview-tooltip-img" style={{ marginBottom: 4 }} />))}
                    </span>
                  </span>
                )}
                {!isServicesStep && (it.description || it.desc) && (
                  <span style={{ display: "block", color: "var(--ink-3)", fontSize: 11.5, lineHeight: 1.35, marginTop: 2 }}>
                    {it.description || it.desc}
                  </span>
                )}
              </span>
            </label>
            {/* Inline description (services step only) */}
            {isServicesStep && it.infoText && <CVInlineDescription text={it.infoText} />}
            {/* Quantity dropdowns when the option is selected and its pricing structure needs them */}
            {sel && <CVQuantityRow item={it} value={value || {}} onChange={onChange} label={it.label} guestCount={guestCount} />}
            {sel && hasChildKey && it[hasChildKey] && (it[childKey] || []).length > 0 && (
              <div style={{ paddingLeft: 26, marginTop: 4, marginBottom: 4, borderLeft: "2px solid var(--line)" }}>
                {levelDisplays && levelDisplays.requireSubOptions && (
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", marginBottom: 5 }}>
                    Required <span className="cv-req">*</span>
                  </div>
                )}
                <CVRichTree
                  items={it[childKey]}
                  level={nextLevel}
                  displayAs={(levelDisplays && levelDisplays[nextLevel]) || "checkbox"}
                  value={(value && value[it.label]) || {}}
                  onChange={(nv) => {
                    const next = { ...(value || {}) };
                    next[it.label] = nv;
                    onChange(next);
                  }}
                  fieldId={fieldId + "_" + it.label.replace(/\s+/g, "_")}
                  depth={depth + 1}
                  levelDisplays={levelDisplays}
                  guestCount={guestCount}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CVTimeInput({ f, value, onChange, labelEl }) {
  const defaultValue = f.defaultValue || "14:00";
  React.useEffect(() => {
    if (value === undefined || value === null || value === "") onChange(defaultValue);
  }, [value, onChange, defaultValue]);
  return (
    <div className="cv-form-group">
      {labelEl}
      <input className="cv-input" type="time" value={value || defaultValue} onChange={(e) => onChange(e.target.value)} style={{ maxWidth: 200 }} />
    </div>
  );
}

function CVField({ f, value, onChange, fullWidth, stepType, guestCount, autoDeliveryLines = [], emailVerification = null, adminEditMode = false }) {
  const Ic = window.Icons;
  const pricesVisible = useClientPricingVisible();
  if (f.type === "separator") {
    return <div style={{ borderTop: "1.5px solid var(--line)", margin: "12px 0" }} />;
  }
  if (f.type === "instructional") {
    return (
      <div style={{ padding: "6px 0" }}>
        <p style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.6, margin: 0 }}>{f.label}</p>
        {f.fieldDescription && <p style={{ fontSize: 11.5, color: "var(--ink-3)", margin: "4px 0 0", lineHeight: 1.5 }}>{f.fieldDescription}</p>}
      </div>
    );
  }
  const fieldGalleryImages = (f.galleryImages && f.galleryImages.length) ? f.galleryImages : (f.galleryImage ? [f.galleryImage] : []);
  const hasTooltip = f.helpText || fieldGalleryImages.length > 0;

  const tooltipEl = hasTooltip ? (
    <span className="info-trigger" style={{ marginLeft: 4 }}>
      i
      <span className="preview-tooltip">
        {f.helpText && <span className="preview-tooltip-text">{f.helpText}</span>}
        {fieldGalleryImages.map((image, imageIndex) => (
          <img key={imageIndex} src={image} alt="Info" className="preview-tooltip-img" />
        ))}
      </span>
    </span>
  ) : null;

  const descEl = f.fieldDescription ? (
    <span className="cv-field-desc">{f.fieldDescription}</span>
  ) : null;

  // Compute per-field running total for rich-options fields (shown inline beside the label)
  const _hasRichOpts = (f.options || []).some(isRichWorkflowOption);
  const fieldTotal = (_hasRichOpts && window.computeRichCost) ? window.computeRichCost(f, value, guestCount).total : 0;
  // For services step always show the total (even $0). Other steps only when > 0.
  const _showTotal = pricesVisible && _hasRichOpts && (stepType === "services" || fieldTotal > 0);
  const totalChip = _showTotal ? (
    <span style={{ marginLeft: "auto", color: "var(--accent)", fontWeight: 700, fontSize: 13, paddingLeft: 12 }}>
      Total: ${fieldTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  ) : null;
  const labelEl = (
    <label className="cv-label" style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
      <span>
        {f.label}{f.required && <span className="cv-req"> *</span>}
        {tooltipEl}
      </span>
      {totalChip}
      {descEl}
    </label>
  );
  const optionInfoEl = (option) => (
    <>
      {option.infoText && (
        <span className="info-trigger" style={{ marginLeft: 6 }}>i
          <span className="preview-tooltip">
            <span className="preview-tooltip-text">{option.infoText}</span>
          </span>
        </span>
      )}
      {option.infoImages && option.infoImages.length > 0 && (
        <span className="info-trigger" title="View images" style={{ marginLeft: 4, background: "#fff4eb", color: "var(--accent)" }}>
          <span style={{ fontSize: 9, fontWeight: 800 }}>IMG</span>
          <span className="preview-tooltip" style={{ minWidth: 180 }}>
            {option.infoImages.map((img, ii) => (
              <img key={ii} src={img} alt="" className="preview-tooltip-img" style={{ marginBottom: 4 }} />
            ))}
          </span>
        </span>
      )}
    </>
  );
  const autoFieldDeliveryLines = fieldAutoDeliveryLines(f, autoDeliveryLines);
  const autoFieldDeliveryOn = autoFieldDeliveryLines.length > 0;
  const autoDeliveryNote = autoFieldDeliveryOn ? (
    <span className="cv-field-desc" style={{ display: "block", marginTop: 2 }}>
      Auto-selected based on the rental items added above.
    </span>
  ) : null;
  const renderEmailVerificationInput = () => (
    <div className="cv-form-group">
      {labelEl}
      <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
        <input
          key={`email-input-${emailVerification?.pulseKey || 0}`}
          className={"cv-input" + (emailVerification?.pulseKey ? " cv-email-attention" : "")}
          data-collaburo-email-field="1"
          type="email"
          placeholder={f.placeholder || "name@example.com"}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
        {emailVerification?.enabled && (
          <button
            type="button"
            className="btn"
            style={{ minWidth: 96, justifyContent: "center" }}
            disabled={emailVerification.status === "sending" || emailVerification.status === "checking" || emailVerification.verified}
            onClick={() => emailVerification.onValidate?.(value)}
          >
            {emailVerification.verified ? "Verified" : emailVerification.status === "sending" ? "Sending..." : "Validate"}
          </button>
        )}
      </div>
      {emailVerification?.message && (
        <div style={{ marginTop: 6, fontSize: 12, fontWeight: 650, color: emailVerification.status === "error" ? "var(--danger)" : emailVerification.verified || emailVerification.status === "verified" ? "#276738" : "var(--ink-3)" }}>
          {emailVerification.message}
        </div>
      )}
    </div>
  );

  switch (f.type) {
    case "textarea":
      return (
        <div className="cv-form-group">
          {labelEl}
          <textarea className="cv-input" style={{ minHeight: 80, resize: "vertical" }} placeholder={f.placeholder || ""} value={value || ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case "extras": {
      const current = value && typeof value === "object" ? value : {};
      return (
        <div className="cv-form-group" style={{ gridColumn: "1 / -1" }}>
          {labelEl}
          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ display: "grid", gridTemplateColumns: "max-content minmax(120px, 180px)", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 650 }}>{f.amountLabel || "Total Extra Amount"}: $</span>
              <input
                className="cv-input"
                type="number"
                value={current.amount || ""}
                min="0"
                step="0.01"
                readOnly={!adminEditMode}
                aria-readonly={!adminEditMode}
                onChange={adminEditMode ? (e) => onChange({ ...current, amount: Math.max(0, Number(e.target.value || 0)) }) : undefined}
                style={!adminEditMode ? { background: "var(--surface-2)", color: "var(--ink)", cursor: "not-allowed" } : undefined}
              />
            </label>
            <textarea
              className="cv-input"
              style={{ minHeight: 80, resize: "vertical" }}
              placeholder={f.placeholder || ""}
              value={current.description || ""}
              onChange={(e) => onChange({ ...current, description: e.target.value })}
            />
          </div>
        </div>
      );
    }
    case "toggle":
      return (
        <div className="cv-form-group">
          <label className="cv-toggle-row">
            <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} style={{ accentColor: "var(--accent)" }} />
            <span>
              <b>{f.label}{f.required && <span className="cv-req"> *</span>}</b>
              {tooltipEl}
              {f.fieldDescription && <span className="cv-field-desc" style={{ display: "block", marginTop: 2 }}>{f.fieldDescription}</span>}
            </span>
          </label>
        </div>
      );
    case "select":
    case "multiselect": {
      if (f.type === "select" && f.groupOptions) {
        const groups = normalizeSimpleOptionGroups(f.options || []);
        const selectedLabel = value && typeof value === "object" ? value.__selected || "" : value || "";
        const selectedOption = groups.flatMap((group) => group.options || []).find((option) => option.label === selectedLabel);
        const levelDisplays = {
          option: "select",
          subOption: f.subOptionDisplayAs || "checkbox",
          selection: f.selectionDisplayAs || "checkbox",
          specification: f.specificationDisplayAs || "checkbox",
          requireSubOptions: !!f.requireSubOptions,
        };
        return (
          <div className="cv-form-group">
            {labelEl}
            <select
              className="cv-input cv-select"
              value={selectedLabel}
              onChange={(e) => {
                const label = e.target.value;
                const option = groups.flatMap((group) => group.options || []).find((row) => row.label === label);
                onChange(option && (option.subOptions || []).length ? { __selected: label, __sub: {} } : label);
              }}
            >
              <option value="">{f.placeholder || "Select…"}</option>
              {groups.map((group, groupIndex) => (
                <optgroup key={group.id || groupIndex} label={group.label || `Group ${groupIndex + 1}`}>
                  {(group.options || []).map((option, optionIndex) => {
                    const priceLabel = simpleOptionPriceDisplay(option);
                    const suffix = pricesVisible && priceLabel ? ` (${priceLabel})` : "";
                    return <option key={optionIndex} value={option.label}>{option.label}{suffix}</option>;
                  })}
                </optgroup>
              ))}
            </select>
            {selectedOption && (selectedOption.subOptions || []).length > 0 && (
              <div style={{ paddingLeft: 14, marginTop: 8, borderLeft: "2px solid var(--line)" }}>
                {f.requireSubOptions && (
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", marginBottom: 5 }}>
                    Required <span className="cv-req">*</span>
                  </div>
                )}
                <CVRichTree
                  items={selectedOption.subOptions || []}
                  level="subOption"
                  displayAs={f.subOptionDisplayAs || "checkbox"}
                  value={(value && typeof value === "object" && value.__sub) || {}}
                  onChange={(nextSub) => onChange({ __selected: selectedLabel, __sub: nextSub })}
                  fieldId={f.id + "_sub"}
                  depth={1}
                  levelDisplays={levelDisplays}
                  stepType={stepType}
                  guestCount={guestCount}
                />
              </div>
            )}
          </div>
        );
      }
      const hasRichOpts = (f.options || []).some(isRichWorkflowOption);
      if (hasRichOpts) {
        const treeValue = (value && typeof value === "object" && !value.main) ? value : {};
        const levelDisplays = {
          option: f.displayAs || (f.type === "radio" ? "radio" : f.type === "select" ? "select" : f.type === "multiselect" ? "checkbox" : f.type === "checkbox" ? "checkbox" : "radio"),
          subOption: f.subOptionDisplayAs || "checkbox",
          selection: f.selectionDisplayAs || "checkbox",
          specification: f.specificationDisplayAs || "checkbox",
          requireSubOptions: !!f.requireSubOptions,
        };
        return (
          <div className="cv-form-group">
            {labelEl}
            <CVRichTree
              items={f.options || []}
              level="option"
              displayAs={levelDisplays.option}
              value={treeValue}
              onChange={(v) => onChange(v)}
              fieldId={f.id}
              depth={0}
              levelDisplays={levelDisplays}
              stepType={stepType}
              guestCount={guestCount}
            />
          </div>
        );
      }
      const dynamicDelivery = isDeliveryOptionsField(f);
      const optRows = dynamicDelivery
        ? deliveryOptionFieldRows().map((option) => ({ ...option, label: option.id, rawLabel: option.label }))
        : (f.options || []).map((o) => ({
            label: typeof o === "string" ? o : o.label,
            display: typeof o === "string" ? o : `${o.label}${pricesVisible && simpleOptionPriceDisplay(o) ? " (" + simpleOptionPriceDisplay(o) + ")" : ""}`,
          }));
      if (f.type === "multiselect") {
        const selected = Array.isArray(value) ? value : [];
        const autoLabels = optRows
          .filter((option) => (autoDeliveryLines || []).some((line) => !line.manual && (dynamicDelivery ? String(line.id) === String(option.id) : (textMatchesDeliveryLine(option.label, line) || textMatchesDeliveryLine(option.display, line)))))
          .map((option) => option.label);
        const effectiveSelected = Array.from(new Set([...selected, ...autoLabels]));
        const toggle = (label) => {
          if (autoLabels.includes(label)) return;
          onChange(selected.includes(label) ? selected.filter((item) => item !== label) : [...selected, label]);
        };
        return (
          <div className="cv-form-group">
            {labelEl}
            <div className="cv-radio-group">
              {optRows.map((o, i) => {
                const raw = dynamicDelivery ? { label: o.rawLabel, description: o.description } : normalizeSimpleOption((f.options || [])[i], o.label);
                const isAuto = autoLabels.includes(o.label);
                return (
                  <div
                    key={i}
                    className={"cv-radio-option" + (effectiveSelected.includes(o.label) ? " sel" : "")}
                    onClick={() => toggle(o.label)}
                    role="checkbox"
                    aria-checked={effectiveSelected.includes(o.label)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggle(o.label);
                      }
                    }}
                  >
                    <input type="checkbox" checked={effectiveSelected.includes(o.label)} readOnly />
                    <span>
                      <div className="cv-radio-label">{o.display}{optionInfoEl(raw)}</div>
                      {isAuto && autoDeliveryNote}
                      {(raw.description || raw.desc) && <div className="cv-radio-desc">{raw.description || raw.desc}</div>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      return (
        <div className="cv-form-group">
          {labelEl}
          <select className="cv-input cv-select" value={value || ""} onChange={(e) => onChange(e.target.value)}>
            <option value="">{f.placeholder || "Select…"}</option>
            {optRows.map((o, i) => <option key={i} value={o.label}>{o.display}</option>)}
          </select>
        </div>
      );
    }
    case "room":
      return (
        <div className="cv-form-group">
          {labelEl}
          <div className="cv-venue-grid">
            {window.ROOMS.map((r) => (
              <div key={r.id} className={"cv-venue-thumb" + (value === r.name ? " sel" : "")} onClick={() => onChange(r.name)}>
                <div className="cv-venue-ph">{r.name}</div>
                <div className="cv-venue-name">{r.name}</div>
              </div>
            ))}
          </div>
        </div>
      );
    case "addons": {
      const items = [
        { id: "tbl", name: "Round tables (8 pax)", price: "$12 ea" },
        { id: "lin", name: "White linen runners", price: "$8 ea" },
        { id: "av", name: "AV kit (mic + speakers)", price: "$120" },
        { id: "stg", name: "Stage lighting", price: "$240" },
        { id: "uplt", name: "Custom uplighting", price: "$180" },
        { id: "phot", name: "Photo backdrop", price: "$90" },
      ];
      const sel = value || {};
      return (
        <div className="cv-form-group">
          {labelEl}
          <div className="cv-rental-grid">
            {items.map((it) => {
              const n = sel[it.id] || 0;
              return (
                <div key={it.id} className={"cv-rental-card" + (n > 0 ? " sel" : "")}>
                  <div className="cv-rental-thumb" />
                  <div className="cv-rental-name">{it.name}</div>
                  {pricesVisible && <div className="cv-rental-price">{it.price}</div>}
                  <div className="cv-rental-qty">
                    <button onClick={() => onChange({ ...sel, [it.id]: Math.max(0, n - 1) })}>−</button>
                    <span>{n}</span>
                    <button onClick={() => onChange({ ...sel, [it.id]: n + 1 })}>+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    case "date":
      return (
        <div className="cv-form-group">
          {labelEl}
          <input className="cv-input" type="date" value={value || ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case "daterange":
      return (
        <div className="cv-form-group">
          {labelEl}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <input className="cv-input" type="date" value={(value && value.start) || ""} onChange={(e) => onChange({ ...(value || {}), start: e.target.value })} />
            <input className="cv-input" type="date" value={(value && value.end) || ""} onChange={(e) => onChange({ ...(value || {}), end: e.target.value })} />
          </div>
        </div>
      );
    case "file":
      return <CVFileUploadField field={f} value={value} onChange={onChange} labelEl={labelEl} />;
    case "price":
      if (!pricesVisible) {
        return (
          <div className="cv-form-group">
            {labelEl}
            <div className="cv-input" style={{ color: "var(--ink-3)", background: "var(--surface-2)" }}>Verify your email to view pricing.</div>
          </div>
        );
      }
      return (
        <div className="cv-form-group">
          {labelEl}
          <input className="cv-input" placeholder={f.placeholder || "$0.00"} value={value || ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case "radio": {
      const hasRichOpts = (f.options || []).some(isRichWorkflowOption);
      if (hasRichOpts) {
        // Route through 4-level rich tree, rendering top level as radio
        const treeValue = (value && typeof value === "object" && !value.main) ? value : {};
        const levelDisplays = {
          option: "radio",
          subOption: f.subOptionDisplayAs || "checkbox",
          selection: f.selectionDisplayAs || "checkbox",
          specification: f.specificationDisplayAs || "checkbox",
          requireSubOptions: !!f.requireSubOptions,
        };
        return (
          <div className="cv-form-group">
            {labelEl}
            <CVRichTree
              items={f.options || []}
              level="option"
              displayAs="radio"
              value={treeValue}
              onChange={(v) => onChange(v)}
              fieldId={f.id}
              depth={0}
              levelDisplays={levelDisplays}
              stepType={stepType}
              guestCount={guestCount}
            />
          </div>
        );
      }
      const opts = (f.options || []).map((o) => {
        if (typeof o === "string") {
          const parts = o.split("|");
          return { label: parts[0], desc: parts[1] || "", price: null };
        }
        return {
          label: o.label || "",
          desc: o.desc || o.description || "",
          price: optionHasPricing(o) ? optionPrice(o) : null,
          priceLabel: simpleOptionPriceDisplay(o),
          infoText: o.infoText || "",
          infoImages: o.infoImages || [],
        };
      });
      return (
        <div className="cv-form-group">
          {labelEl}
          <div className="cv-radio-group">
            {opts.map((o, i) => (
              <div
                key={i}
                className={"cv-radio-option" + (value === o.label ? " sel" : "")}
                onClick={() => onChange(o.label)}
                role="radio"
                aria-checked={value === o.label}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChange(o.label);
                  }
                }}
              >
                <input type="radio" name={f.id} checked={value === o.label} readOnly />
                <span>
                  <div className="cv-radio-label">{o.label}{optionInfoEl(o)}</div>
                  {pricesVisible && o.priceLabel && <span style={{ color: "var(--accent)", fontSize: 11.5, fontWeight: 700 }}>+{o.priceLabel}</span>}
                  {o.desc && <div className="cv-radio-desc">{o.desc}</div>}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "groupselect": {
      const groups = [];
      let cur = { label: "", items: [] };
      (f.options || []).forEach((o) => {
        if (o.startsWith("@")) {
          if (cur.label || cur.items.length) groups.push(cur);
          cur = { label: o.slice(1), items: [] };
        } else {
          cur.items.push(o);
        }
      });
      if (cur.label || cur.items.length) groups.push(cur);
      return (
        <div className="cv-form-group">
          {labelEl}
          <select className="cv-input cv-select" value={value || ""} onChange={(e) => onChange(e.target.value)}>
            <option value="">{f.placeholder || "Select…"}</option>
            {groups.map((g, gi) =>
              g.label ? (
                <optgroup key={gi} label={g.label}>
                  {g.items.map((it, ii) => <option key={ii} value={it}>{it}</option>)}
                </optgroup>
              ) : (
                g.items.map((it, ii) => <option key={`u${ii}`} value={it}>{it}</option>)
              )
            )}
          </select>
        </div>
      );
    }
    case "number":
      return (
        <div className="cv-form-group">
          {labelEl}
          <input className="cv-input" type="number" placeholder={f.placeholder || ""} value={value || ""} onChange={(e) => onChange(e.target.value)} min={f.min} max={f.max} step={f.step || 1} />
          {(f.min != null || f.max != null) && (
            <span className="cv-minmax-hint">
              {f.min != null && f.max != null ? `Between ${f.min} and ${f.max}` : f.min != null ? `Minimum: ${f.min}` : `Maximum: ${f.max}`}
            </span>
          )}
        </div>
      );
    case "email":
      return renderEmailVerificationInput();
    case "phone":
      return (
        <div className="cv-form-group">
          {labelEl}
          <input className="cv-input" type="tel" placeholder={f.placeholder || "(123) 123-1234"} value={value || ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case "time":
      return <CVTimeInput f={f} value={value} onChange={onChange} labelEl={labelEl} />;
    case "checkbox": {
      const richOpts = (f.options || []).map((o) => typeof o === "string" ? { label: o } : o);
      const checked = typeof value === "object" ? value : { on: !!value };
      const effectiveOn = !!checked.on || autoFieldDeliveryOn;
      const setChecked = (patch) => onChange({ ...checked, ...patch });
      return (
        <div className="cv-form-group">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label className="cv-toggle-row">
              <input type="checkbox" checked={effectiveOn} readOnly={autoFieldDeliveryOn} onChange={(e) => !autoFieldDeliveryOn && setChecked({ on: e.target.checked })} />
              <span>
                <b>{f.label}{f.required && <span className="cv-req"> *</span>}{tooltipEl}</b>
                {f.fieldDescription && <span className="cv-field-desc" style={{ display: "block", marginTop: 2 }}>{f.fieldDescription}</span>}
                {autoDeliveryNote}
              </span>
            </label>
            {effectiveOn && f.displayAs === "radio" && richOpts.map((o, i) => (
              <label key={i} className="cv-choice-row" style={{ marginLeft: 26 }}>
                <input type="radio" name={f.id} checked={checked.sub === o.label} onChange={() => setChecked({ sub: o.label })} />
                <span>{o.label}</span>
              </label>
            ))}
            {effectiveOn && f.displayAs === "select" && (
              <select className="cv-input cv-select" style={{ width: "auto", minWidth: 70 }}
                value={checked.sub || ""} onChange={(e) => setChecked({ sub: e.target.value })}>
                <option value="">Select…</option>
                {richOpts.map((o, i) => <option key={i} value={o.label}>{o.label}</option>)}
              </select>
            )}
          </div>
        </div>
      );
    }
    case "dietary": {
      const dietSel = value || {};
      return (
        <div className="cv-form-group">
          {labelEl}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {(f.dietaryOptions || []).map((d, i) => (
              <label key={i} className="cv-choice-row">
                <input type="checkbox" checked={!!dietSel[d]} onChange={(e) => onChange({ ...dietSel, [d]: e.target.checked })} />
                <span>{d}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }
    default:
      if (emailVerification?.enabled) return renderEmailVerificationInput();
      return (
        <div className="cv-form-group">
          {labelEl}
          <input className="cv-input" type="text" placeholder={f.placeholder || ""} value={value || ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
  }
}

window.ClientPreview = ClientPreview;



// Main app — composes sidebar, topbar, step list, field editor, preview.
// Persists steps to localStorage. Routes between sections.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#ed7a3c",
  "fontFamily": "geist",
  "density": "comfortable",
  "sidebarCollapsed": false,
  "populated": true
}/*EDITMODE-END*/;

const FONT_OPTIONS = {
  geist:    { stack: '"Geist", ui-sans-serif, system-ui, sans-serif', mono: '"Geist Mono", ui-monospace, monospace' },
  manrope:  { stack: '"Manrope", ui-sans-serif, system-ui, sans-serif', mono: '"JetBrains Mono", ui-monospace, monospace' },
  plex:     { stack: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif', mono: '"IBM Plex Mono", ui-monospace, monospace' },
  inter:    { stack: '"Inter Tight", ui-sans-serif, system-ui, sans-serif', mono: '"JetBrains Mono", ui-monospace, monospace' },
};

const STORAGE_KEY = "collaburo.admin.workflow.v15";
const SAVED_KEY = "collaburo.admin.savedAt.v5";
const RENTALS_STORAGE_KEY = "collaburo.admin.rentalsCatalog.v13";
const PRICING_STORAGE_KEY = "collaburo.admin.pricingRules.v1";
const SITE_SETTINGS_STORAGE_KEY = "collaburo.admin.siteSettings.v1";
const PROGRESS_STORAGE_KEY = "collaburo.admin.rentalsProgress.v1";
const HISTORY_KEY = "collaburo.admin.activityHistory.v1";
const CLIENT_DRAFT_STORAGE_KEY = "collaburo.client.bookingDraft.v1";
const MAX_STORED_DATA_URL_LENGTH = 180000;

const EMAIL_TEMPLATE_TYPES = [
  { id: "fill-form", label: "Fill Form", icon: "File", actionLabel: "Send fill form email" },
  { id: "sign-form", label: "Sign Form", icon: "Edit", actionLabel: "Send sign form email" },
  { id: "insurance", label: "Insurance", icon: "CheckSq", actionLabel: "Send insurance email" },
  { id: "agco-license", label: "AGCO License", icon: "Key", actionLabel: "Send AGCO license email" },
];

const DEFAULT_EMAIL_ADDRESS = "kristelleddc+collaburo@gmail.com";

const DEFAULT_EMAIL_TEMPLATES = {
  "fill-form": {
    from: DEFAULT_EMAIL_ADDRESS,
    cc: DEFAULT_EMAIL_ADDRESS,
    subject: "Your booking request details for {{Space}} on {{Booking_Start_datetime}}",
    content: "Hello {{Client_Name}},\n\nThank you for your interest in renting {{Space}}.\n\nTo get all the details of your booking on {{Booking_Start_datetime}}, please complete the online form using the link below.\n\n{{Copy_Link}}\n\nWe have already filled in some of the details for you to get started. You can update anything that needs to be accurate before submitting.",
  },
  "sign-form": {
    from: DEFAULT_EMAIL_ADDRESS,
    cc: DEFAULT_EMAIL_ADDRESS,
    subject: "Contract to Sign for Booking the {{Space}} on {{Booking_Start_datetime}}",
    content: "Hello {{Client_Name}},\n\nBelow is a link to the contract for your {{Booking_Start_datetime}} booking of the {{Space}}.\n\nPlease go through the contract and sign electronically, then submit. It does not need to be a perfect signature on the first page. You can use the duplicate signature option on the second page to automatically insert the same signature.\n\n{{Contract_Link}}\n\nOnce submitted, we will both automatically receive a copy by email.",
  },
  insurance: {
    from: DEFAULT_EMAIL_ADDRESS,
    cc: DEFAULT_EMAIL_ADDRESS,
    subject: "Required Event Insurance for {{Space}} on {{Booking_Start_datetime}}",
    content: "Hello {{Client_Name}},\n\nFor all events, we require clients to obtain event insurance. Duuo offers a discount to our customers and provides a full refund up to the date before the event.\n\nPlease use the link below to arrange coverage:\n\n{{Insurance_Link}}\n\nIf you already have coverage, reply with the certificate and we will add it to your rental progress record.",
  },
  "agco-license": {
    from: DEFAULT_EMAIL_ADDRESS,
    cc: DEFAULT_EMAIL_ADDRESS,
    subject: "AGCO License required to bring alcohol on site on {{Booking_Start_datetime}}",
    content: "Hello {{Client_Name}},\n\nSince you indicated there will be alcohol on site, please submit the AGCO Special Occasion Permit application before your event.\n\n{{AGCO_Link}}\n\nOnce approved, send us the permit or a screenshot so we can attach it to your rental progress record.",
  },
};

const DYNAMIC_EMAIL_FIELDS = [
  ["{{Client_Name}}", "Name of Client"],
  ["{{Organization}}", "Organization Name of Client"],
  ["{{Email}}", "Contact Email of Client"],
  ["{{Copy_Link}}", "Unique rental progress link"],
  ["{{Contract_Link}}", "Contract or sign form link"],
  ["{{Insurance_Link}}", "Insurance quote link"],
  ["{{AGCO_Link}}", "AGCO application link"],
  ["{{Event_Privacy}}", "Public, Semi-private, or Private"],
  ["{{Alcohol_On_Site}}", "Alcohol on site answer"],
  ["{{Expected_Number_of_Attendees}}", "Guest count"],
  ["{{Space}}", "Selected space"],
  ["{{Booking_Start_datetime}}", "Starting date/time of booking"],
  ["{{Booking_end_datetime}}", "Ending date/time of booking"],
  ["{{Set_up_Service}}", "Selected set-up service"],
  ["{{Clean_up_Service}}", "Selected clean-up service"],
];

const SAMPLE_SITE_SETTINGS = {
  branding: {
    siteTitle: "Customize Your Event - Collaburo",
    adminBrandName: "Collaburo",
    favicon: "",
    colors: {
      primary: "#232323",
      secondary: "#4a3f33",
      text: "#232323",
      accent: "#ed7a3c",
    },
    fonts: {
      primary: { family: "geist", size: 28, color: "#000000" },
      secondary: { family: "geist", size: 20, color: "#4a3f33" },
      text: { family: "geist", size: 16, color: "#232323" },
      accent: { family: "geist", size: 14, color: "#ed7a3c" },
    },
  },
  validations: {
    strictProgression: false,
    emailVerification: true,
    requiredFieldMessage: "This field is required.",
    requiredSubOptionMessage: "Choose a required sub-option.",
    dateTimeRequirementMessage: "A booking date and specific time-slot are required to calculate accurate pricing.",
    emailVerificationMessage: "Please provide a valid email to view the final cost breakdown.",
    postSubmissionNote: "Your event blueprint is ready! Our team will contact you shortly.",
  },
  emailSettings: {
    provider: "resend",
    replyTo: DEFAULT_EMAIL_ADDRESS,
    templates: DEFAULT_EMAIL_TEMPLATES,
  },
  fulfillment: {
    deliveryOptions: DEFAULT_DELIVERY_OPTIONS,
  },
};

const SAMPLE_PROGRESS_RECORDS = [
  {
    id: "rp_1566",
    progressNo: 1566,
    submittedAt: "2026-06-01T20:02:00",
    client: { name: "Mohamed Farah", organization: "", email: "maxfarah64@gmail.com", phone: "613-762-1670" },
    request: {
      eventPrivacy: "",
      eventType: "",
      alcoholOnSite: "",
      attendeeCount: "",
      description: "",
      space: "Large Room",
      bookingDateTime: "Jun 18, 2026 04:00 pm - Jun 18, 2026 08:00 pm",
      guestsArrival: "1 p.m. (Men) 5 p.m. (women)",
      noOneOnSite: "",
    },
    progress: {
      interestLevel: "",
      status: "In Discussion",
      age: "New",
      signed: false,
      agreementFile: null,
      insurance: false,
      insuranceStatus: "Not Received",
      insuranceFile: null,
      agcoLicense: false,
      agcoLicenseStatus: "Not Received",
      agcoLicenseFile: null,
      infoComplete: false,
      lockedForUser: false,
      agreement: "Not Signed",
      contract: "Not Generated",
      draft: "Draft",
      duuoEventType: "Select One",
      notForProfit: "No",
      studentBody: "No",
      source: "",
      createdBy: "Hazel",
      accessibleByRecordLink: true,
      securityDepositCost: "TBD",
      securityDepositNote: "TBD",
      internalNotes: "",
      issues: "",
      attachments: [],
    },
    costs: {
      spaceRentalTotal: 0,
      spaceContentTotal: 0,
      cateringTotal: 0,
      setupTotal: 0,
      eventTotal: 0,
      cleanupTotal: 0,
      subtotal: 0,
      feeLines: [],
      total: 0,
      securityDeposit: 0,
      totalWithDeposit: 0,
      spaceLines: [],
      spaceContentLines: [],
      cateringLines: [],
      setupLines: [],
      eventLines: [],
      cleanupLines: [],
    },
    adminSections: { instructions: "", specialNotes: "", cateringSpecifics: "", serviceNotes: "" },
    emails: [
      { label: "Fill Form", status: "Resend", at: "Jun 01 2026 08:02 pm" },
      { label: "Fill Form", status: "Resend", at: "Jun 02 2026 03:44 pm" },
    ],
    log: [{ label: "Hazel", at: "Jun 01, 2026 08:00 pm", action: "Created progress record" }],
  },
  {
    id: "rp_1496",
    progressNo: 1496,
    submittedAt: "2026-05-27T09:30:00",
    client: { name: "Premala", organization: "", email: "", phone: "" },
    request: { eventType: "Anniversary", space: "Main Hall", attendeeCount: 65, bookingDateTime: "Aug 28, 2026 05:00 pm - Aug 28, 2026 11:00 pm", description: "Anniversary" },
    progress: { interestLevel: "Likely", status: "In Discussion", age: "", signed: false, insurance: false, agcoLicense: false, securityDepositCost: "$500 - Mn", securityDepositNote: "Not Refunded Yet", createdBy: "Admin" },
    costs: { spaceRentalTotal: 0, spaceContentTotal: 0, cateringTotal: 0, setupTotal: 0, eventTotal: 0, cleanupTotal: 0, subtotal: 0, feeLines: [], total: 0, securityDeposit: 500, totalWithDeposit: 500, spaceLines: [], spaceContentLines: [], cateringLines: [], setupLines: [], eventLines: [], cleanupLines: [] },
    adminSections: { instructions: "", specialNotes: "", cateringSpecifics: "", serviceNotes: "" },
    emails: [],
    log: [],
  },
  {
    id: "rp_1488",
    progressNo: 1488,
    submittedAt: "2026-05-25T11:00:00",
    client: { name: "Sarah Monesa", organization: "", email: "", phone: "" },
    request: { eventType: "Wedding Reception", space: "Main Hall", attendeeCount: 60, bookingDateTime: "Jun 06, 2026 01:30 pm - Jun 06, 2026 06:00 pm", description: "Wedding Reception" },
    progress: { interestLevel: "", status: "In Discussion", age: "", signed: false, insurance: false, agcoLicense: false, securityDepositCost: "TBD", createdBy: "Admin" },
    costs: { spaceRentalTotal: 0, spaceContentTotal: 0, cateringTotal: 0, setupTotal: 0, eventTotal: 0, cleanupTotal: 0, subtotal: 0, feeLines: [], total: 0, securityDeposit: 0, totalWithDeposit: 0, spaceLines: [], spaceContentLines: [], cateringLines: [], setupLines: [], eventLines: [], cleanupLines: [] },
    adminSections: { instructions: "", specialNotes: "", cateringSpecifics: "", serviceNotes: "" },
    emails: [],
    log: [],
  },
  {
    id: "rp_1485",
    progressNo: 1485,
    submittedAt: "2026-05-19T14:00:00",
    client: { name: "Anthony Hill", organization: "", email: "", phone: "" },
    request: { eventType: "Child's Birthday Party", space: "Back Patio", attendeeCount: 40, bookingDateTime: "Aug 08, 2026 09:30 am - Aug 08, 2026 12:30 pm", description: "Child's Birthday Party" },
    progress: { interestLevel: "", status: "In Discussion", age: "", signed: false, insurance: false, agcoLicense: true, securityDepositCost: "TBD", createdBy: "Admin" },
    costs: { spaceRentalTotal: 0, spaceContentTotal: 0, cateringTotal: 0, setupTotal: 0, eventTotal: 0, cleanupTotal: 0, subtotal: 0, feeLines: [], total: 0, securityDeposit: 0, totalWithDeposit: 0, spaceLines: [], spaceContentLines: [], cateringLines: [], setupLines: [], eventLines: [], cleanupLines: [] },
    adminSections: { instructions: "", specialNotes: "", cateringSpecifics: "", serviceNotes: "" },
    emails: [],
    log: [],
  },
];

let _uid = 1000;
const uid = (p) => `${p}_${Date.now().toString(36)}_${++_uid}_${Math.random().toString(36).slice(2, 6)}`;
const bookingId = () => `B${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
function bookingCodeFromId(id = "") {
  const value = String(id || "").trim();
  if (/^B[A-Z0-9]{5}$/.test(value)) return value;
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash * 31) + value.charCodeAt(i)) >>> 0;
  }
  return `B${hash.toString(36).toUpperCase().padStart(5, "0").slice(-5)}`;
}

function bookingCodeForRecord(record = {}) {
  return record.bookingCode || bookingCodeFromId(record.id || record.progressNo || "");
}

function cloneData(value) {
  if (value === undefined || value === null) return value;
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch (_) {}
  }
  return JSON.parse(JSON.stringify(value, (_key, val) => typeof val === "function" ? undefined : val));
}

function isEmbeddedUpload(value) {
  return typeof value === "string" && /^data:image\//.test(value);
}

function readFilesAsDataUrls(files) {
  const selected = Array.from(files || []).filter(Boolean);
  if (!selected.length) return Promise.resolve([]);
  return Promise.all(selected.map((file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => resolve(ev.target.result);
    reader.readAsDataURL(file);
  })));
}

function makeStorageSafe(value, stats = { removedImages: 0 }) {
  if (Array.isArray(value)) {
    return value
      .map((item) => makeStorageSafe(item, stats))
      .filter((item) => item !== null && item !== undefined && item !== "");
  }
  if (!value || typeof value !== "object") {
    if (isEmbeddedUpload(value) && value.length > MAX_STORED_DATA_URL_LENGTH) {
      stats.removedImages += 1;
      return "";
    }
    return value;
  }
  const next = {};
  Object.entries(value).forEach(([key, item]) => {
    const safe = makeStorageSafe(item, stats);
    if (safe === undefined) return;
    if ((key === "imageUrl" || key === "groupImageUrl" || key === "infoImageUrl" || key === "galleryImage") && safe === "") {
      next[key] = "";
      return;
    }
    if ((key === "infoImages" || key === "infoImageUrls") && Array.isArray(safe)) {
      next[key] = safe.filter(Boolean);
      return;
    }
    next[key] = safe;
  });
  return next;
}

function saveJsonSafely(key, value) {
  const stats = { removedImages: 0 };
  const safeValue = makeStorageSafe(value, stats);
  const json = JSON.stringify(safeValue);
  localStorage.removeItem(key);
  localStorage.setItem(key, json);
  return stats;
}

function normalizeGroupedDropdownOptions(options = []) {
  const groups = [];
  let current = null;
  (options || []).forEach((option) => {
    if (typeof option === "string" && option.startsWith("@")) {
      current = { type: "group", label: option.slice(1) || "New group", options: [] };
      groups.push(current);
      return;
    }
    if (option && typeof option === "object" && option.type === "group") {
      groups.push({ ...option, options: option.options || [] });
      current = groups[groups.length - 1];
      return;
    }
    if (!current) {
      current = { type: "group", label: "Group 1", options: [] };
      groups.push(current);
    }
    current.options.push(typeof option === "string" ? { label: option } : option);
  });
  return groups;
}

function normalizeWorkflowField(field = {}) {
  if (isDeliveryOptionsField(field)) {
    return {
      ...field,
      type: "multiselect",
      hasOptions: true,
      displayAs: "checkbox",
      dynamicSource: "delivery_options",
      linkedToPricing: true,
    };
  }
  if (field.type === "groupselect" || (field.label === "Event Type" && field.type === "groupselect")) {
    return {
      ...field,
      type: "select",
      hasOptions: true,
      displayAs: "select",
      groupOptions: true,
      options: normalizeGroupedDropdownOptions(field.options || []),
    };
  }
  if (field.type === "extras") {
    return {
      ...defaultRentalExtrasField(),
      ...field,
      linkedToPricing: field.linkedToPricing !== false,
    };
  }
  if (field.type !== "dietary") return field;
  const options = (field.dietaryOptions || field.options || ["Halal", "Kosher", "Vegetarian", "Vegan", "Allergen Free", "Gluten-free"])
    .map((option) => typeof option === "string" ? { label: option } : { label: option.label || String(option) });
  return {
    ...field,
    type: "multiselect",
    hasOptions: true,
    displayAs: "checkbox",
    fieldDescription: field.fieldDescription || "Check all dietary restrictions that apply.",
    options,
    dietaryOptions: undefined,
  };
}

function normalizeWorkflowSteps(steps = []) {
  const seenFieldIds = new Set();
  const defaultCheckoutSummaryItems = {
    spaceRental: true,
    spaceContentRentals: true,
    cateringCost: true,
    setupServiceCost: true,
    eventServiceCost: true,
    cleanupServiceCost: true,
    tax: true,
    securityDeposit: true,
    totalWithSecurityDeposit: true,
  };
  const normalizeCheckout = (step, fields) => {
    if (step.stepType !== "checkout" && !/submit|checkout/i.test(step.name || "")) return step.checkout;
    const oldAgreements = (fields || []).filter((field) => field.type === "toggle").map((field) => ({
      id: field.id || uid("agr"),
      label: field.helpText || field.label || "Agreement",
      required: field.required !== false,
    }));
    const existing = step.checkout || {};
    return {
      summaryItems: { ...defaultCheckoutSummaryItems, ...(existing.summaryItems || {}) },
      confirmationMessage: existing.confirmationMessage || "Check all required boxes to submit. You'll receive a confirmation email with a link to edit your request.",
      planningNote: existing.planningNote || "NOTE: This planning tool helps you manage your event budget. Submitting a booking request lets our staff know you're interested in the selected date and space. Details such as floor layout, rentals, and additional services can be updated and finalized later.",
      agreements: (existing.agreements && existing.agreements.length ? existing.agreements : oldAgreements).map((agreement) => ({
        id: agreement.id || uid("agr"),
        label: agreement.label || agreement.text || "Agreement",
        required: agreement.required !== false,
      })),
      submitLabel: existing.submitLabel || "Submit",
      successMessage: existing.successMessage || "This would submit the booking request.",
    };
  };
  return (steps || []).map((step) => {
    const sourceFields = (step.fields || []);
    const shouldAddRentalExtras = /rentals/i.test(step.name || "") && !sourceFields.some((field) => field.type === "extras" || field.id === "f_rent_extras");
    const fieldsWithMigrations = shouldAddRentalExtras ? [...sourceFields, defaultRentalExtrasField()] : sourceFields;
    const normalizedFields = fieldsWithMigrations.map((field) => {
      const normalized = normalizeWorkflowField(field);
      if (!normalized.id || seenFieldIds.has(normalized.id)) {
        const oldId = normalized.id;
        const nextId = uid("f");
        seenFieldIds.add(nextId);
        return { ...normalized, id: nextId, legacyDuplicateId: oldId || "" };
      }
      seenFieldIds.add(normalized.id);
      return normalized;
    });
    const isCheckout = step.stepType === "checkout" || /submit|checkout/i.test(step.name || "");
    return {
      ...step,
      stepType: isCheckout ? "checkout" : step.stepType,
      checkout: normalizeCheckout(step, normalizedFields),
      fields: isCheckout ? normalizedFields.filter((field) => field.type !== "toggle") : normalizedFields,
    };
  });
}

function normalizePricingRules(rules = {}) {
  const sample = window.SAMPLE_PRICING_RULES || SAMPLE_PRICING_RULES || { fees: [], securityDeposits: [] };
  const source = rules && typeof rules === "object" ? rules : sample;
  const maxCombined = source.discountSettings?.maxCombinedDiscount || sample.discountSettings?.maxCombinedDiscount || {};
  return {
    fees: (source.fees || []).map((fee) => ({
      id: fee.id || uid("fee"),
      label: fee.label || "New fee",
      valueType: fee.valueType === "flat" ? "flat" : "percentage",
      amount: Number(fee.amount || 0),
      applyTo: fee.applyTo || "final_total",
      active: fee.active !== false,
    })),
    securityDeposits: (source.securityDeposits || []).map((row) => ({
      id: row.id || uid("dep"),
      venueId: row.venueId || "All",
      venueName: row.venueName || "All",
      eventPrivacy: row.eventPrivacy || "All",
      eventType: row.eventType || "All",
      alcoholOnSite: row.alcoholOnSite || "All",
      amount: Number(row.amount || 0),
      active: row.active !== false,
    })),
    discountSettings: {
      maxCombinedDiscount: {
        enabled: !!maxCombined.enabled,
        valueType: maxCombined.valueType === "flat" ? "flat" : "percentage",
        amount: Number(maxCombined.amount || 0),
      },
    },
    discountRules: (source.discountRules || []).map((rule) => ({
      id: rule.id || uid("disc"),
      name: rule.name || rule.label || "New discount",
      valueType: rule.valueType === "flat" ? "flat" : "percentage",
      amount: Number(rule.amount || 0),
      applyTo: rule.applyTo === "line_items" ? "line_items" : "subtotal",
      targets: Array.isArray(rule.targets) ? rule.targets.filter(Boolean) : [],
      conditionsMode: rule.conditionsMode === "any" ? "any" : "all",
      conditions: (rule.conditions || []).map((condition) => ({
        id: condition.id || uid("cond"),
        fieldId: condition.fieldId || "",
        fieldLabel: condition.fieldLabel || condition.field || "",
        operator: condition.operator || "equals",
        value: condition.value ?? "",
      })),
      stackable: rule.stackable !== false,
      priority: Number(rule.priority || 0),
      maxDiscount: {
        enabled: !!rule.maxDiscount?.enabled,
        valueType: rule.maxDiscount?.valueType === "percentage" ? "percentage" : "flat",
        amount: Number(rule.maxDiscount?.amount || 0),
      },
      active: rule.active !== false,
    })),
  };
}

function normalizeSiteSettings(settings = {}) {
  const sample = SAMPLE_SITE_SETTINGS;
  const source = settings && typeof settings === "object" ? settings : sample;
  const colors = { ...sample.branding.colors, ...(source.branding?.colors || {}) };
  const fonts = {
    primary: { ...sample.branding.fonts.primary, ...(source.branding?.fonts?.primary || {}) },
    secondary: { ...sample.branding.fonts.secondary, ...(source.branding?.fonts?.secondary || {}) },
    text: { ...sample.branding.fonts.text, ...(source.branding?.fonts?.text || {}) },
    accent: { ...sample.branding.fonts.accent, ...(source.branding?.fonts?.accent || {}) },
  };
  const safeEmailAddress = (value) => {
    const email = String(value || "").trim();
    if (!email || email === "info@collaburo.com" || email === "kristelleddc@gmail.com") return DEFAULT_EMAIL_ADDRESS;
    return email;
  };
  return {
    branding: {
      ...sample.branding,
      ...(source.branding || {}),
      colors,
      fonts,
    },
    validations: {
      ...sample.validations,
      ...(source.validations || {}),
      strictProgression: !!source.validations?.strictProgression,
      emailVerification: source.validations?.emailVerification !== false,
    },
    emailSettings: {
      ...sample.emailSettings,
      ...(source.emailSettings || {}),
      replyTo: safeEmailAddress(source.emailSettings?.replyTo || sample.emailSettings.replyTo),
      templates: EMAIL_TEMPLATE_TYPES.reduce((acc, type) => {
        const existing = source.emailSettings?.templates?.[type.id] || {};
        acc[type.id] = {
          ...(DEFAULT_EMAIL_TEMPLATES[type.id] || {}),
          ...existing,
          from: safeEmailAddress(existing.from || DEFAULT_EMAIL_TEMPLATES[type.id]?.from),
          cc: safeEmailAddress(existing.cc || DEFAULT_EMAIL_TEMPLATES[type.id]?.cc),
        };
        return acc;
      }, {}),
    },
    fulfillment: {
      ...(sample.fulfillment || {}),
      ...(source.fulfillment || {}),
      deliveryOptions: normalizeDeliveryOptions(source.fulfillment?.deliveryOptions || sample.fulfillment?.deliveryOptions),
    },
  };
}

function normalizeProgressRecord(record = {}, index = 0) {
  const id = record.id || uid("rp");
  const completedStepIds = Array.isArray(record.stepProgress?.completedStepIds)
    ? record.stepProgress.completedStepIds.filter(Boolean)
    : [];
  const defaults = {
    id,
    bookingCode: record.bookingCode || bookingCodeFromId(id),
    progressNo: record.progressNo || (1600 + index),
    submittedAt: record.submittedAt || new Date().toISOString(),
    client: { name: "", organization: "", email: "", phone: "", ...(record.client || {}) },
    request: {
      eventPrivacy: "",
      eventType: "",
      alcoholOnSite: "",
      attendeeCount: "",
      description: "",
      space: "",
      bookingDateTime: "",
      guestsArrival: "",
      noOneOnSite: "",
      ...(record.request || {}),
    },
    progress: {
      interestLevel: "",
      status: "In Discussion",
      age: "New",
      signed: false,
      agreementFile: null,
      insurance: false,
      agcoLicense: false,
      infoComplete: false,
      lockedForUser: false,
      agreement: "Not Signed",
      contract: "Not Generated",
      draft: "Draft",
      duuoEventType: "Select One",
      notForProfit: "No",
      studentBody: "No",
      source: "",
      createdBy: "Admin",
      accessibleByRecordLink: true,
      securityDepositCost: "TBD",
      securityDepositNote: "",
      internalNotes: "",
      issues: "",
      attachments: [],
      ...(record.progress || {}),
      status: normalizeProgressStatus(record.progress?.status, "In Discussion"),
      insuranceStatus: record.progress?.insuranceStatus || (record.progress?.insurance ? "Obtained DUUO" : "Not Received"),
      insuranceFile: record.progress?.insuranceFile || null,
      agcoLicenseStatus: record.progress?.agcoLicenseStatus || (record.progress?.agcoLicense ? "Obtained" : "Not Received"),
      agcoLicenseFile: record.progress?.agcoLicenseFile || null,
      agreement: record.progress?.agreement === "Signed" ? "Signed" : "Not Signed",
      agreementFile: record.progress?.agreementFile || null,
    },
    venueCost: record.venueCost || null,
    layoutRecommendations: record.layoutRecommendations || {},
    layoutSelections: Array.isArray(record.layoutSelections) ? record.layoutSelections : [],
    costs: {
      spaceRentalTotal: 0,
      spaceContentTotal: 0,
      cateringTotal: 0,
      setupTotal: 0,
      eventTotal: 0,
      cleanupTotal: 0,
      subtotal: 0,
      feeLines: [],
      total: 0,
      securityDeposit: 0,
      totalWithDeposit: 0,
      spaceLines: [],
      spaceContentLines: [],
      cateringLines: [],
      setupLines: [],
      eventLines: [],
      cleanupLines: [],
      ...(record.costs || {}),
    },
    answers: record.answers || {},
    answerSummary: record.answerSummary || [],
    emailVerification: record.emailVerification || {},
    stepProgress: {
      completedStepIds,
      totalSteps: Number(record.stepProgress?.totalSteps || 0),
      completedCount: Number(record.stepProgress?.completedCount || completedStepIds.length),
      updatedAt: record.stepProgress?.updatedAt || "",
    },
    adminSections: { instructions: "", specialNotes: "", cateringSpecifics: "", serviceNotes: "", ...(record.adminSections || {}) },
    emails: record.emails || [],
    log: record.log || [],
    adminAudit: record.adminAudit || [],
  };
  return defaults;
}

function normalizeProgressRecords(records = []) {
  return (records || []).map((record, index) => normalizeProgressRecord(record, index));
}

function mergeProgressRecords(existing = [], incoming = []) {
  const seen = new Set();
  const keyFor = (record = {}) => {
    const id = String(record.id || "");
    if (id) return `id:${id}`;
    return [
      String(record.client?.email || "").trim().toLowerCase(),
      String(record.submittedAt || ""),
      String(record.request?.space || "").trim().toLowerCase(),
    ].join("|");
  };
  return [...existing, ...incoming].filter((record) => {
    const key = keyFor(record);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function progressRecordsFromSubmissionRows(rows = []) {
  const payloads = (rows || []).map((row) => {
    const payload = row?.payload;
    if (!payload) return null;
    if (typeof payload === "string") {
      try {
        return JSON.parse(payload);
      } catch (_) {
        return null;
      }
    }
    return typeof payload === "object" ? payload : null;
  });
  return normalizeProgressRecords(payloads.filter(Boolean));
}

function loadProgressRecords() {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (raw) return normalizeProgressRecords(JSON.parse(raw));
  } catch (_) {}
  return null;
}

function answerToProgressText(value) {
  if (value === null || value === undefined || value === "") return "";
  if (Array.isArray(value)) return value.map(answerToProgressText).filter(Boolean).join(", ");
  if (typeof value === "object") {
    if (value.name && (value.url || value.publicId || value.type)) return String(value.name);
    if (Object.prototype.hasOwnProperty.call(value, "amount") || Object.prototype.hasOwnProperty.call(value, "description")) {
      return [Number(value.amount || 0) ? `$${Number(value.amount || 0).toFixed(2)}` : "", value.description].filter(Boolean).join(" - ");
    }
    if (Object.prototype.hasOwnProperty.call(value, "on")) return value.on ? "Yes" : "";
    if (value.__selected) return answerToProgressText(value.__selected);
    if (value.label) return answerToProgressText(value.label);
    if (value.value) return answerToProgressText(value.value);
    if (value.groupSelected || value.selectedItems) {
      return Object.keys(value.selectedItems || {}).join(", ") || (value.groupSelected ? "Selected" : "");
    }
    return Object.entries(value)
      .filter(([key, val]) => !key.startsWith("__") && !!val)
      .map(([key, val]) => val === true ? key : `${key}: ${answerToProgressText(val)}`)
      .filter(Boolean)
      .join(", ");
  }
  return String(value).split("|")[0].trim();
}

function clientAnswerHasValue(value) {
  if (value === null || value === undefined || value === "") return false;
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.length > 0 && value.some(clientAnswerHasValue);
  if (typeof value === "object") {
    if (value.groupSelected || Object.keys(value.selectedItems || {}).length > 0) return true;
    return Object.entries(value).some(([key, val]) => !key.startsWith("__") && clientAnswerHasValue(val));
  }
  return true;
}

function layoutSelectionsFromAnswers(steps = [], answers = {}) {
  const selectedLayouts = answers._selectedLayouts || {};
  const otherPlans = answers._layoutOtherPlans || {};
  const venueStep = (steps || []).find((step) => step.stepType === "venue");
  const venues = venueStep?.venues || [];
  const layoutSteps = (steps || []).filter((step) => step.stepType === "layout");
  const areaName = (areaId) => {
    const venue = venues.find((item) => item.id === areaId);
    if (venue) return venue.name || areaId;
    for (const item of venues) {
      const subSpace = (item.subSpace?.options || []).find((sub) => sub.id === areaId);
      if (subSpace) return subSpace.name || areaId;
    }
    const customArea = layoutSteps.flatMap((step) => step.layoutSpaces || []).find((area) => area.id === areaId);
    return customArea?.name || areaId;
  };
  return Object.entries(selectedLayouts)
    .map(([areaId, layoutId]) => {
      const layoutStep = layoutSteps.find((step) => step.floorLayouts?.[areaId]);
      const layout = (layoutStep?.floorLayouts?.[areaId]?.layouts || []).find((item) => item.id === layoutId);
      const otherPlan = otherPlans[areaId] || {};
      const isOther = layoutId === `_other_${areaId}`;
      if (!layout && !isOther) return null;
      return {
        areaId,
        areaName: areaName(areaId),
        layoutName: layout?.name || "Others",
        image: layout?.image || "",
        fileName: otherPlan.fileName || "",
        fileData: otherPlan.fileData || "",
        instructions: otherPlan.notes || "",
      };
    })
    .filter(Boolean);
}

function createProgressRecordFromSubmission(payload = {}) {
  const steps = payload.steps || [];
  const answers = payload.answers || {};
  const { fmt: _fmt, ...costData } = payload.costData || {};
  const venueCost = payload.venueCost || {};
  const submittedAt = payload.submittedAt || new Date().toISOString();
  const fields = steps.flatMap((step) => (step.fields || []).map((field) => ({ ...field, stepName: step.name, stepType: step.stepType })));
  const findByLabel = (needles) => {
    const lowered = (needles || []).map((needle) => String(needle).toLowerCase());
    for (const field of fields) {
      const label = String(field.label || "").toLowerCase();
      if (lowered.some((needle) => label.includes(needle))) {
        const text = answerToProgressText(answers[field.id]);
        if (text) return text;
      }
    }
    return "";
  };
  const venueCosts = Array.isArray(venueCost.venueCosts) ? venueCost.venueCosts : (venueCost.venueName ? [venueCost] : []);
  const bookingDateTime = venueCosts
    .filter((item) => item.booking?.startDate || item.booking?.endDate)
    .map((item) => {
      const booking = item.booking || {};
      const start = [booking.startDate, booking.startTime].filter(Boolean).join(" ");
      const end = [booking.endDate, booking.endTime].filter(Boolean).join(" ");
      return `${item.venueName || "Venue"}: ${start}${end ? ` - ${end}` : ""}`;
    })
    .join("; ");
  const firstName = findByLabel(["client first name", "first name"]);
  const lastName = findByLabel(["last name"]);
  const clientName = [firstName, lastName].filter(Boolean).join(" ") || findByLabel(["name"]) || "New Client";
  const answerSummary = fields
    .filter((field) => field.visibleToClient !== false && field.type !== "rental_group")
    .map((field) => ({
      fieldId: field.id,
      stepName: field.stepName,
      label: field.label,
      value: answerToProgressText(answers[field.id]),
      rawValue: cloneData(answers[field.id]),
    }))
    .filter((row) => row.value);
  const completedStepIds = Array.from(new Set([
    ...((payload.stepProgress?.completedStepIds || []).filter(Boolean)),
    ...(payload.savedStepId ? [payload.savedStepId] : []),
  ]));
  const totalSteps = steps.length;
  const completedCount = completedStepIds.length;
  return normalizeProgressRecord({
    id: payload.recordId || bookingId(),
    progressNo: Math.floor(Date.now() / 1000) % 100000,
    submittedAt,
    client: {
      name: clientName,
      organization: findByLabel(["organization"]),
      email: findByLabel(["email"]),
      phone: findByLabel(["phone"]),
    },
    request: {
      eventPrivacy: findByLabel(["event privacy"]),
      eventType: findByLabel(["event type", "type of event"]),
      alcoholOnSite: findByLabel(["alcohol"]),
      attendeeCount: findByLabel(["expected number", "attendees", "guests", "number of people"]),
      description: findByLabel(["brief description", "description of event"]),
      space: (venueCost.venueNames || []).join(", ") || venueCost.venueName || findByLabel(["space", "venue"]),
      bookingDateTime: bookingDateTime || (venueCost.hasBooking ? "Booking dates selected in preview" : ""),
      guestsArrival: findByLabel(["guest arrival"]),
      noOneOnSite: findByLabel(["no one on site"]),
    },
    progress: {
      status: payload.adminEditMode ? "In Discussion" : "Not Contacted",
      age: "New",
      interestLevel: "",
      signed: false,
      agreement: "Not Signed",
      agreementFile: null,
      insurance: false,
      agcoLicense: false,
      securityDepositCost: Number(costData.securityDeposit || 0) ? `$${Number(costData.securityDeposit || 0).toLocaleString("en-US")}` : "TBD",
      createdBy: payload.createdBy || (payload.adminEditMode ? "Admin" : "Client form"),
      accessibleByRecordLink: true,
      lastActivityAt: new Date().toISOString(),
    },
    costs: cloneData(costData),
    venueCost: cloneData(venueCost),
    layoutRecommendations: cloneData(payload.layoutRecommendations || {}),
    layoutSelections: layoutSelectionsFromAnswers(steps, answers),
    answers: cloneData(answers),
    answerSummary,
    emailVerification: cloneData(payload.emailVerification || {}),
    stepProgress: {
      completedStepIds,
      totalSteps,
      completedCount,
      updatedAt: new Date().toISOString(),
    },
    emails: [{ label: payload.finalSubmit ? "Submitted request" : "Saved draft", status: "Saved", at: new Date(submittedAt).toLocaleString() }],
    log: [{ label: payload.adminEditMode ? "Admin" : "Client", at: new Date(submittedAt).toLocaleString(), action: payload.finalSubmit ? "Submitted request" : "Saved booking form progress" }],
  });
}

function buildClientDraftFromProgressRecord(record, steps = []) {
  if (!record) return null;
  const answers = cloneData(record.answers || {});
  const normalizedSteps = normalizeWorkflowSteps(steps || []);
  const answerSummary = record.answerSummary || [];
  const summaryByLabel = new Map(answerSummary.map((row) => [String(row.label || "").toLowerCase(), row.value]));
  const setByNeedles = (needles, value, preferredStepName = "") => {
    if (value === null || value === undefined || value === "") return;
    const lowered = (needles || []).map((needle) => String(needle).toLowerCase());
    const orderedSteps = preferredStepName
      ? [...normalizedSteps].sort((a, b) => Number(String(b.name || "").toLowerCase() === String(preferredStepName).toLowerCase()) - Number(String(a.name || "").toLowerCase() === String(preferredStepName).toLowerCase()))
      : normalizedSteps;
    for (const exactOnly of [true, false]) {
      for (const step of orderedSteps) {
        for (const field of (step.fields || [])) {
          const label = String(field.label || "").toLowerCase();
          const matches = exactOnly ? lowered.some((needle) => label === needle) : lowered.some((needle) => label.includes(needle));
          if (matches && !clientAnswerHasValue(answers[field.id])) {
            answers[field.id] = cloneData(value);
            return;
          }
        }
      }
    }
  };
  const client = record.client || {};
  const request = record.request || {};
  const nameParts = String(client.name || "").trim().split(/\s+/);
  setByNeedles(["client first name", "first name"], nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : client.name);
  setByNeedles(["last name"], nameParts.length > 1 ? nameParts[nameParts.length - 1] : "");
  setByNeedles(["organization"], client.organization);
  setByNeedles(["email"], client.email);
  setByNeedles(["phone"], client.phone);
  setByNeedles(["event privacy"], request.eventPrivacy);
  setByNeedles(["event type", "type of event"], request.eventType);
  setByNeedles(["brief description", "description of event"], request.description || request.eventType);
  setByNeedles(["alcohol"], request.alcoholOnSite);
  setByNeedles(["expected number", "attendees", "number of people"], request.attendeeCount);
  answerSummary.forEach((row) => {
    const fieldById = row.fieldId
      ? normalizedSteps.flatMap((step) => step.fields || []).find((field) => String(field.id) === String(row.fieldId))
      : null;
    if (fieldById && !clientAnswerHasValue(answers[fieldById.id]) && Object.prototype.hasOwnProperty.call(row, "rawValue")) {
      answers[fieldById.id] = cloneData(row.rawValue);
      return;
    }
    setByNeedles([row.label], Object.prototype.hasOwnProperty.call(row, "rawValue") ? row.rawValue : row.value, row.stepName);
  });

  // Older saved records can contain the display text from answerSummary instead
  // of the raw option value (for example, "Public:" instead of "Public").
  // Reconnect those values to the current options so the controls and pricing
  // engine can recognize them after a reload.
  const optionMatchKey = (value) => String(value || "")
    .trim()
    .replace(/[,:;]+\s*$/, "")
    .trim()
    .toLowerCase();
  normalizedSteps.forEach((step) => {
    (step.fields || []).forEach((field) => {
      const current = answers[field.id];
      if (field.type === "toggle" && typeof current === "string" && /^(true|false)$/i.test(current.trim())) {
        answers[field.id] = current.trim().toLowerCase() === "true";
        return;
      }
      if (typeof current !== "string" || !(field.options || []).length) return;
      const options = field.groupOptions
        ? normalizeSimpleOptionGroups(field.options || []).flatMap((group) => group.options || [])
        : (field.options || []).map((option) => normalizeSimpleOption(option));
      const matched = options.find((option) => optionMatchKey(option.label) === optionMatchKey(current));
      if (!matched) return;
      const fieldUsesRichValues = (field.options || []).some(isRichWorkflowOption);
      if (fieldUsesRichValues) answers[field.id] = { [matched.label]: {} };
      else if (field.type === "multiselect") answers[field.id] = [matched.label];
      else answers[field.id] = matched.label;
    });
  });

  const venueStep = normalizedSteps.find((step) => step.stepType === "venue");
  const allVenues = venueStep?.venues || [];
  const requestedVenueNames = String(request.space || "").split(",").map((name) => name.trim().toLowerCase()).filter(Boolean);
  const savedVenueIds = Array.isArray(answers._selectedVenueIds)
    ? answers._selectedVenueIds.map(String)
    : answers._selectedVenueId
    ? [String(answers._selectedVenueId)]
    : [];
  const selectedVenues = allVenues.filter((venue) =>
    savedVenueIds.includes(String(venue.id)) || requestedVenueNames.includes(String(venue.name || "").trim().toLowerCase())
  );
  const savedVenueCost = record.venueCost && typeof record.venueCost === "object" ? cloneData(record.venueCost) : null;
  const savedSpaceLines = record.costs?.spaceLines || [];
  const rebuiltVenueCosts = selectedVenues.map((venue, index) => {
    const lines = savedSpaceLines.filter((line) => String(line.group || "").trim().toLowerCase() === String(venue.name || "").trim().toLowerCase());
    const setup = lines.filter((line) => /set[\s-]*up/i.test(line.label || "")).reduce((sum, line) => sum + Number(line.total || 0), 0);
    const cleanup = lines.filter((line) => /clear[\s-]*up|clean[\s-]*up|cleaning/i.test(line.label || "")).reduce((sum, line) => sum + Number(line.total || 0), 0);
    const subCost = lines.filter((line) => /sub[\s-]*space|optional extension/i.test(`${line.label || ""} ${line.meta || ""}`)).reduce((sum, line) => sum + Number(line.total || 0), 0);
    const lineTotal = lines.reduce((sum, line) => sum + Number(line.total || 0), 0);
    const fallbackTotal = selectedVenues.length === 1 ? Number(record.costs?.spaceRentalTotal || 0) : 0;
    const total = lineTotal || fallbackTotal;
    const booking = answers._venueBookings?.[venue.id] || {};
    const securityDeposit = Number(venue.advancedPricing?.securityDeposit || (selectedVenues.length === 1 ? record.costs?.securityDeposit : 0) || 0);
    return {
      venueId: venue.id,
      venueName: venue.name,
      booking,
      venueBase: Math.max(0, total - setup - cleanup - subCost),
      baseLabel: "",
      planLabel: String(lines.find((line) => !/set[\s-]*up|clear[\s-]*up|clean[\s-]*up|cleaning/i.test(line.label || ""))?.label || "").split("—")[1]?.trim() || "",
      billableHours: 0,
      minimumHours: 0,
      minimumApplied: false,
      bestValueApplied: false,
      extraHourRate: 0,
      extraHours: 0,
      usesExtraHourRate: false,
      totalHours: 0,
      setup,
      cleanup,
      subCost,
      subName: "",
      securityDeposit,
      total,
      totalWithDeposit: total + securityDeposit,
      hasBooking: !!(booking.startDate && booking.startTime && booking.endDate && booking.endTime),
      _restoreIndex: index,
    };
  });
  const venueCost = savedVenueCost || (rebuiltVenueCosts.length ? {
    venueId: rebuiltVenueCosts[0].venueId,
    venueIds: rebuiltVenueCosts.map((item) => item.venueId),
    venueName: rebuiltVenueCosts[0].venueName,
    venueNames: rebuiltVenueCosts.map((item) => item.venueName),
    venueBase: rebuiltVenueCosts[0].venueBase,
    baseLabel: rebuiltVenueCosts[0].baseLabel,
    planLabel: rebuiltVenueCosts[0].planLabel,
    billableHours: rebuiltVenueCosts[0].billableHours,
    minimumHours: rebuiltVenueCosts[0].minimumHours,
    minimumApplied: rebuiltVenueCosts[0].minimumApplied,
    bestValueApplied: rebuiltVenueCosts[0].bestValueApplied,
    extraHourRate: rebuiltVenueCosts[0].extraHourRate,
    extraHours: rebuiltVenueCosts[0].extraHours,
    usesExtraHourRate: rebuiltVenueCosts[0].usesExtraHourRate,
    totalHours: rebuiltVenueCosts[0].totalHours,
    subCost: rebuiltVenueCosts[0].subCost,
    subName: rebuiltVenueCosts[0].subName,
    securityDeposit: rebuiltVenueCosts.reduce((sum, item) => sum + Number(item.securityDeposit || 0), 0),
    total: rebuiltVenueCosts.reduce((sum, item) => sum + Number(item.total || 0), 0),
    hasBooking: rebuiltVenueCosts.some((item) => item.hasBooking),
    venueCosts: rebuiltVenueCosts.map(({ _restoreIndex, ...item }) => item),
  } : null);
  if (selectedVenues.length) {
    answers._selectedVenueIds = selectedVenues.map((venue) => venue.id);
    answers._selectedVenueId = selectedVenues[0].id;
  }

  const firstUnansweredStep = normalizedSteps.findIndex((step) =>
    (step.fields || []).some((field) => field.visibleToClient !== false && !clientAnswerHasValue(answers[field.id]))
  );
  return {
    key: `record_${record.id}_${record.submittedAt || ""}`,
    recordId: record.id || "",
    submittedAt: record.submittedAt || "",
    stepIdx: Math.max(0, firstUnansweredStep === -1 ? 0 : firstUnansweredStep),
    answers,
    venueCost,
    costAdminAdjustments: record.costs?.adminAdjustments || {},
    layoutRecommendations: cloneData(record.layoutRecommendations || {}),
    stepProgress: record.stepProgress || { completedStepIds: [] },
    emailVerification: record.emailVerification || {},
    auditBefore: cloneData({
      client: record.client || {}, request: record.request || {}, venueCost: record.venueCost || null,
      layoutRecommendations: record.layoutRecommendations || {}, answers: record.answers || {}, answerSummary: record.answerSummary || [],
      costs: record.costs || {}, emailVerification: record.emailVerification || {}, stepProgress: record.stepProgress || {},
    }),
    savedAt: Date.now(),
  };
}

function loadSteps() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeWorkflowSteps(JSON.parse(raw));
  } catch (_) {}
  return null;
}

function loadRentalCatalog() {
  try {
    const raw = localStorage.getItem(RENTALS_STORAGE_KEY);
    if (raw) return window.normalizeRentalCatalog ? window.normalizeRentalCatalog(JSON.parse(raw)) : JSON.parse(raw);
  } catch (_) {}
  return null;
}

function loadPricingRules() {
  try {
    const raw = localStorage.getItem(PRICING_STORAGE_KEY);
    if (raw) return normalizePricingRules(JSON.parse(raw));
  } catch (_) {}
  return null;
}

function loadSiteSettings() {
  try {
    const raw = localStorage.getItem(SITE_SETTINGS_STORAGE_KEY);
    if (raw) return normalizeSiteSettings(JSON.parse(raw));
  } catch (_) {}
  return null;
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

function loadClientDraft() {
  try {
    const raw = localStorage.getItem(CLIENT_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (!draft || typeof draft !== "object") return null;
    return {
      recordId: draft.recordId || "",
      submittedAt: draft.submittedAt || "",
      stepIdx: Math.max(0, Number(draft.stepIdx || 0)),
      answers: draft.answers && typeof draft.answers === "object" ? draft.answers : {},
      venueCost: draft.venueCost || null,
      layoutRecommendations: draft.layoutRecommendations && typeof draft.layoutRecommendations === "object" ? draft.layoutRecommendations : {},
      stepProgress: draft.stepProgress && typeof draft.stepProgress === "object" ? draft.stepProgress : { completedStepIds: [] },
      emailVerification: draft.emailVerification && typeof draft.emailVerification === "object" ? draft.emailVerification : {},
      costAdminAdjustments: draft.costAdminAdjustments && typeof draft.costAdminAdjustments === "object" ? draft.costAdminAdjustments : {},
      savedAt: draft.savedAt || 0,
    };
  } catch (_) {}
  return null;
}

function saveHistoryList(list) {
  try {
    saveJsonSafely(HISTORY_KEY, (list || []).slice(0, 12));
  } catch (_) {}
}

async function collaburoApi(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    const error = new Error(data.error || `Request failed: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

// updated_at of the database state this browser last loaded or saved. Sent with
// every PUT so the server can reject stale writes (409) instead of letting two
// tabs/devices silently clobber each other.
let lastDatabaseUpdatedAt = null;
let adminStateWriteQueue = Promise.resolve();

async function putAdminStateToDatabase(databaseState) {
  const runWrite = async () => {
    const writeWithCurrentBase = () => collaburoApi("/api/admin-state", {
      method: "PUT",
      body: JSON.stringify({ ...databaseState, baseUpdatedAt: lastDatabaseUpdatedAt }),
    });
    let result;
    try {
      result = await writeWithCurrentBase();
    } catch (error) {
      if (error.status !== 409 || !error.data?.updatedAt) throw error;
      lastDatabaseUpdatedAt = error.data.updatedAt;
      result = await writeWithCurrentBase();
    }
    if (result?.updatedAt) lastDatabaseUpdatedAt = result.updatedAt;
    return result;
  };
  const queuedWrite = adminStateWriteQueue.then(runWrite, runWrite);
  adminStateWriteQueue = queuedWrite.catch(() => {});
  return queuedWrite;
}

async function uploadEmbeddedImages(value, cache = new Map()) {
  if (Array.isArray(value)) {
    const next = [];
    for (const item of value) {
      next.push(await uploadEmbeddedImages(item, cache));
    }
    return next;
  }
  if (isEmbeddedUpload(value)) {
    if (cache.has(value)) return cache.get(value);
    const response = await collaburoApi("/api/uploads/images", {
      method: "POST",
      body: JSON.stringify({ dataUrl: value, folder: "collaburo" }),
    });
    const url = response.image?.secureUrl || "";
    cache.set(value, url);
    return url;
  }
  if (!value || typeof value !== "object") return value;
  const next = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === "function") continue;
    next[key] = await uploadEmbeddedImages(item, cache);
  }
  return next;
}

function buildPublicStatePayload(steps, rentalCatalog, pricingRules, siteSettings) {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    steps: cloneData(steps),
    rentalCatalog: cloneData(rentalCatalog),
    pricingRules: cloneData(pricingRules),
    siteSettings: cloneData(siteSettings),
  };
}

function buildAdminStatePayload(steps, rentalCatalog, pricingRules, siteSettings, progressRecords, liveState = null) {
  return {
    ...buildPublicStatePayload(steps, rentalCatalog, pricingRules, siteSettings),
    progressRecords: cloneData(progressRecords),
    liveState: liveState ? cloneData(liveState) : null,
  };
}

async function buildDatabaseAdminStatePayload(steps, rentalCatalog, pricingRules, siteSettings, progressRecords, liveState = null) {
  return uploadEmbeddedImages(buildAdminStatePayload(steps, rentalCatalog, pricingRules, siteSettings, progressRecords, liveState));
}

async function buildDatabaseSubmissionRecord(record) {
  return uploadEmbeddedImages(cloneData(record));
}

async function buildDatabaseAdminBookingUpdateRecord(record) {
  const editable = ["client", "request", "venueCost", "layoutRecommendations", "answers", "answerSummary", "costs", "emailVerification", "stepProgress"];
  const update = { id: record.id };
  editable.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(record, key)) update[key] = cloneData(record[key]);
  });
  return uploadEmbeddedImages(update);
}

function normalizeAdminStatePayload(payload) {
  if (!payload || typeof payload !== "object") return null;
  return {
    steps: normalizeWorkflowSteps(payload.steps || window.SAMPLE_STEPS),
    rentalCatalog: window.normalizeRentalCatalog ? window.normalizeRentalCatalog(payload.rentalCatalog || window.SAMPLE_RENTAL_CATALOG) : (payload.rentalCatalog || window.SAMPLE_RENTAL_CATALOG),
    pricingRules: normalizePricingRules(payload.pricingRules || window.SAMPLE_PRICING_RULES),
    siteSettings: normalizeSiteSettings(payload.siteSettings || SAMPLE_SITE_SETTINGS),
    progressRecords: normalizeProgressRecords(payload.progressRecords || []),
    liveState: payload.liveState && typeof payload.liveState === "object" ? {
      steps: normalizeWorkflowSteps(payload.liveState.steps || payload.steps || window.SAMPLE_STEPS),
      rentalCatalog: window.normalizeRentalCatalog ? window.normalizeRentalCatalog(payload.liveState.rentalCatalog || payload.rentalCatalog || window.SAMPLE_RENTAL_CATALOG) : (payload.liveState.rentalCatalog || payload.rentalCatalog || window.SAMPLE_RENTAL_CATALOG),
      pricingRules: normalizePricingRules(payload.liveState.pricingRules || payload.pricingRules || window.SAMPLE_PRICING_RULES),
      siteSettings: normalizeSiteSettings(payload.liveState.siteSettings || payload.siteSettings || SAMPLE_SITE_SETTINGS),
    } : null,
  };
}

function shouldShowDatabaseError(error) {
  const message = String(error?.message || "");
  return message && !/failed to fetch|database is not configured|api route not found/i.test(message);
}

function blankAdminAccount() {
  return {
    username: "",
    displayName: "",
    title: "Admin",
    email: "",
    phone: "",
    role: "Admin",
    notes: "",
    active: true,
    password: "",
  };
}

function AdminProfileView({ accounts, currentAdmin, onSaveAccount, onCreateAccount, onDeleteAccount, onLogout }) {
  const Ic = window.Icons;
  const [editingId, setEditingId] = React.useState(null);
  const [draft, setDraft] = React.useState(blankAdminAccount);
  const [saving, setSaving] = React.useState(false);
  const editableAccounts = accounts || [];
  const selected = editingId ? editableAccounts.find((account) => account.id === editingId) : null;
  const startCreate = () => {
    setEditingId("new");
    setDraft(blankAdminAccount());
  };
  const startEdit = (account) => {
    setEditingId(account.id);
    setDraft({ ...blankAdminAccount(), ...account, password: "" });
  };
  const cancel = () => {
    setEditingId(null);
    setDraft(blankAdminAccount());
  };
  const submit = () => {
    setSaving(true);
    const action = editingId === "new" ? onCreateAccount(draft) : onSaveAccount(editingId, draft);
    Promise.resolve(action).then(cancel).catch(() => {}).finally(() => setSaving(false));
  };
  const currentName = currentAdmin?.displayName || currentAdmin?.username || "Admin";
  const currentTitle = currentAdmin?.title || currentAdmin?.role || "Admin";

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="profile-identity">
          <div className="profile-avatar">{initialsForName(currentName)}</div>
          <div>
            <span className="editor-head-tag"><Ic.Users size={11} /> Admin Profile</span>
            <h1>{currentName}</h1>
            <p>{currentTitle}</p>
          </div>
        </div>
        <button className="btn danger-ghost" onClick={onLogout}>Logout</button>
      </div>

      <div className="profile-grid">
        <section className="profile-panel">
          <div className="profile-panel-head">
            <div>
              <h2>Admin Accounts</h2>
              <p>Add people who can sign in and manage Collaburo.</p>
            </div>
            <button className="btn dark sm" onClick={startCreate}><Ic.Plus size={13} /> Add account</button>
          </div>
          <div className="account-list">
            {editableAccounts.map((account) => (
              <div className="account-row" key={account.id}>
                <div className="account-avatar">{initialsForName(account.displayName || account.username)}</div>
                <div className="account-main">
                  <b>{account.displayName || account.username}</b>
                  <span>{account.title || account.role || "Admin"} · @{account.username}</span>
                  {account.email && <small>{account.email}</small>}
                </div>
                <span className={"account-status" + (account.active ? " active" : "")}>{account.active ? "Active" : "Inactive"}</span>
                <button className="btn sm" onClick={() => startEdit(account)}>Edit</button>
                <button className="btn icon sm danger-ghost" title="Delete account" onClick={() => onDeleteAccount(account)} disabled={account.bootstrap}>
                  <Ic.Trash size={13} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="profile-panel">
          <div className="profile-panel-head">
            <div>
              <h2>{editingId === "new" ? "New Admin" : selected ? "Edit Admin" : "Account Details"}</h2>
              <p>{selected?.bootstrap ? "This account is managed by server environment variables." : "Names, contact details, and sign-in access live here."}</p>
            </div>
          </div>
          {editingId ? (
            <div className="account-form">
              <label><span>Name</span><input className="input" value={draft.displayName} onChange={(e) => setDraft({ ...draft, displayName: e.target.value })} /></label>
              <label><span>Username</span><input className="input" value={draft.username} disabled={!!selected?.bootstrap} onChange={(e) => setDraft({ ...draft, username: e.target.value })} /></label>
              <label><span>Title</span><input className="input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
              <label><span>Email</span><input className="input" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></label>
              <label><span>Phone</span><input className="input" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></label>
              <label><span>Role</span><input className="input" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} /></label>
              <label className="account-form-wide"><span>Notes</span><textarea className="textarea" rows={3} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /></label>
              <label><span>{editingId === "new" ? "Password" : "New password"}</span><input className="input" type="password" value={draft.password} disabled={!!selected?.bootstrap} onChange={(e) => setDraft({ ...draft, password: e.target.value })} placeholder={selected?.bootstrap ? "Managed on the server" : editingId === "new" ? "At least 8 characters" : "Leave blank to keep current"} /></label>
              <label className="chk account-active"><input type="checkbox" checked={!!draft.active} disabled={!!selected?.bootstrap} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} /> Active</label>
              <div className="account-form-actions">
                <button className="btn" onClick={cancel}>Cancel</button>
                <button className="btn primary" onClick={submit} disabled={saving}>{saving ? "Saving..." : "Save account"}</button>
              </div>
            </div>
          ) : (
            <div className="profile-empty">
              <div className="profile-avatar sm">{initialsForName(currentName)}</div>
              <b>Select an account to edit, or add a new admin.</b>
              <span>The server-managed bootstrap admin is always available as a fallback.</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function snapshotDraft(label, steps, rentalCatalog, pricingRules, siteSettings, progressRecords) {
  return {
    id: "hist_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
    label,
    createdAt: Date.now(),
    steps,
    rentalCatalog,
    pricingRules,
    siteSettings,
    progressRecords,
  };
}

function HistoryModal({ history, onRestore, onClose }) {
  const Ic = window.Icons;
  return (
    <div className="rec-overlay" onClick={onClose}>
      <div className="rec-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Activity Timeline</h3>
        <div className="sub">Restore an earlier workflow, rentals, pricing, site settings, and progress-list version.</div>
        {(history || []).length === 0 ? (
          <div className="rental-muted">No saved timeline entries yet. Saving, publishing, reset, and restore actions will create versions from now on.</div>
        ) : (
          (history || []).map((entry) => (
            <div className="rec-field" key={entry.id} style={{ cursor: "default" }}>
              <span>
                <b>{entry.label || "Saved version"}</b>
                <span style={{ display: "block", fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                  {new Date(entry.createdAt).toLocaleString()} · {(entry.steps || []).length} steps · {(entry.rentalCatalog || []).length} rentals · {(entry.pricingRules?.fees || []).length} fees · {(entry.progressRecords || []).length} progress records
                </span>
              </span>
              <button className="btn sm rental-add-btn" onClick={() => onRestore(entry)}>
                <Ic.Clock size={12} /> Restore
              </button>
            </div>
          ))
        )}
        <div className="rec-actions">
          <button className="btn-gray" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

function PricingRulesView({ rules, steps, onChange }) {
  const Ic = window.Icons;
  const pricingRules = rules || window.SAMPLE_PRICING_RULES || { fees: [], securityDeposits: [] };
  const [openDiscountIds, setOpenDiscountIds] = React.useState(() => new Set());
  const fees = pricingRules.fees || [];
  const deposits = pricingRules.securityDeposits || [];
  const discounts = pricingRules.discountRules || [];
  const discountSettings = pricingRules.discountSettings || {};
  const maxCombinedDiscount = discountSettings.maxCombinedDiscount || { enabled: false, valueType: "percentage", amount: 0 };
  const venueStep = (steps || []).find((step) => step.stepType === "venue");
  const venues = venueStep?.venues || [];
  const discountFields = (steps || [])
    .flatMap((step) => (step.fields || []).map((field) => ({ ...field, stepId: step.id, stepName: step.name || "Step" })))
    .filter((field) => field.visibleToClient !== false && field.type !== "file" && field.type !== "rental_group");
  const eventTypeField = (steps || []).flatMap((step) => step.fields || []).find((field) => /event type/i.test(field.label || ""));
  const groupedEventTypes = eventTypeField?.groupOptions ? normalizeGroupedDropdownOptions(eventTypeField.options || []) : [];
  const flatEventTypes = groupedEventTypes.length
    ? groupedEventTypes.flatMap((group) => group.options || []).map((option) => option.label || String(option)).filter(Boolean)
    : (eventTypeField?.options || []).map((option) => typeof option === "string" ? option.split("|")[0] : option.label).filter(Boolean);
  const eventTypes = ["All", ...Array.from(new Set(flatEventTypes))];
  const eventPrivacyOptions = ["All", "Private", "Semi-private", "Public"];
  const alcoholOptions = ["All", "Yes", "No"];
  const update = (patch) => onChange({ ...pricingRules, ...patch });
  const updateFee = (id, patch) => update({ fees: fees.map((fee) => fee.id === id ? { ...fee, ...patch } : fee) });
  const updateDeposit = (id, patch) => update({ securityDeposits: deposits.map((row) => row.id === id ? { ...row, ...patch } : row) });
  const updateDiscountSettings = (patch) => update({ discountSettings: { ...discountSettings, ...patch } });
  const updateMaxCombinedDiscount = (patch) => updateDiscountSettings({ maxCombinedDiscount: { ...maxCombinedDiscount, ...patch } });
  const updateDiscount = (id, patch) => update({ discountRules: discounts.map((rule) => rule.id === id ? { ...rule, ...patch } : rule) });
  const toggleDiscountOpen = (id) => setOpenDiscountIds((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
  const addFee = () => update({ fees: [...fees, { id: uid("fee"), label: "New fee", valueType: "percentage", amount: 0, applyTo: "final_total", active: true }] });
  const addDeposit = () => update({ securityDeposits: [...deposits, { id: uid("dep"), venueId: venues[0]?.id || "All", venueName: venues[0]?.name || "All", eventPrivacy: "All", eventType: "All", alcoholOnSite: "All", amount: 0, active: true }] });
  const addDiscount = () => {
    const id = uid("disc");
    const defaultField = discountFields.find((field) => /not for profit|non[-\s]?profit/i.test(field.label || "")) || discountFields[0];
    setOpenDiscountIds((current) => new Set([...current, id]));
    update({
      discountRules: [
        ...discounts,
        {
          id,
          name: "New discount",
          valueType: "percentage",
          amount: 0,
          applyTo: "subtotal",
          targets: [],
          conditionsMode: "all",
          conditions: defaultField ? [{ id: uid("cond"), fieldId: defaultField.id, fieldLabel: defaultField.label, operator: defaultField.type === "toggle" ? "is_true" : "equals", value: defaultField.type === "toggle" ? "true" : "" }] : [],
          stackable: true,
          priority: discounts.length + 1,
          maxDiscount: { enabled: false, valueType: "flat", amount: 0 },
          active: true,
        },
      ],
    });
  };
  const deleteFee = (id) => {
    const fee = fees.find((item) => item.id === id);
    requestDeleteConfirmation({
      itemType: "fee",
      itemName: fee?.label || "New fee",
      onConfirm: () => update({ fees: fees.filter((item) => item.id !== id) }),
    });
  };
  const deleteDeposit = (id) => {
    const row = deposits.find((item) => item.id === id);
    requestDeleteConfirmation({
      itemType: "security deposit rule",
      itemName: row?.venueName || row?.venueId || "Security deposit rule",
      onConfirm: () => update({ securityDeposits: deposits.filter((item) => item.id !== id) }),
    });
  };
  const deleteDiscount = (id) => {
    const rule = discounts.find((item) => item.id === id);
    requestDeleteConfirmation({
      itemType: "discount rule",
      itemName: rule?.name || "New discount",
      onConfirm: () => update({ discountRules: discounts.filter((item) => item.id !== id) }),
    });
  };
  const setDepositVenue = (id, venueId) => {
    const venue = venues.find((v) => v.id === venueId);
    updateDeposit(id, { venueId, venueName: venue?.name || "All" });
  };
  const discountFieldById = (fieldId) => discountFields.find((field) => field.id === fieldId);
  const fieldOptionLabels = (field) => {
    if (!field) return [];
    if (field.type === "toggle") return ["true", "false"];
    if (field.groupOptions) {
      return normalizeGroupedDropdownOptions(field.options || [])
        .flatMap((group) => group.options || [])
        .map((option) => option.label || String(option))
        .filter(Boolean);
    }
    return (field.options || []).map((option) => typeof option === "string" ? option.split("|")[0] : option.label).filter(Boolean);
  };
  const updateDiscountCondition = (ruleId, conditionId, patch) => {
    updateDiscount(ruleId, {
      conditions: (discounts.find((rule) => rule.id === ruleId)?.conditions || []).map((condition) => (
        condition.id === conditionId ? { ...condition, ...patch } : condition
      )),
    });
  };
  const addDiscountCondition = (ruleId) => {
    const defaultField = discountFields[0];
    const rule = discounts.find((item) => item.id === ruleId);
    updateDiscount(ruleId, {
      conditions: [
        ...(rule?.conditions || []),
        { id: uid("cond"), fieldId: defaultField?.id || "", fieldLabel: defaultField?.label || "", operator: defaultField?.type === "toggle" ? "is_true" : "equals", value: defaultField?.type === "toggle" ? "true" : "" },
      ],
    });
  };
  const removeDiscountCondition = (ruleId, conditionId) => {
    const rule = discounts.find((item) => item.id === ruleId);
    updateDiscount(ruleId, { conditions: (rule?.conditions || []).filter((condition) => condition.id !== conditionId) });
  };
  const setDiscountTarget = (rule, target, checked) => {
    const nextTargets = checked
      ? Array.from(new Set([...(rule.targets || []), target]))
      : (rule.targets || []).filter((item) => item !== target);
    updateDiscount(rule.id, { targets: nextTargets });
  };

  return (
    <div className="editor-col" style={{ flex: 1 }}>
      <div className="editor-inner">
        <div className="editor-head">
          <div>
            <span className="editor-head-tag"><Ic.Dollar size={11} /> Pricing</span>
            <h1>Pricing Rules</h1>
            <p>Manage global fees, taxes, and security deposit rules used by the client preview and checkout totals.</p>
          </div>
        </div>

        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderBottom: "1px solid var(--line)", paddingBottom: 12, marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>Fees & Tax</h2>
              <button className="btn dark sm" onClick={addFee}><Ic.Plus size={13} /> Add</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr 1.1fr 34px", gap: 10, alignItems: "center", marginBottom: 8 }}>
              {["Label", "Value Type", "Amount", "Apply To", ""].map((label) => <div key={label} className="lbl">{label}</div>)}
              {fees.map((fee) => (
                <React.Fragment key={fee.id}>
                  <input className="input" value={fee.label || ""} onChange={(e) => updateFee(fee.id, { label: e.target.value })} />
                  <select className="select" value={fee.valueType || "percentage"} onChange={(e) => updateFee(fee.id, { valueType: e.target.value })}>
                    <option value="percentage">% Percentage</option>
                    <option value="flat">$ Flat Fee</option>
                  </select>
                  <input className="input" type="number" min="0" step="0.01" value={fee.amount || ""} onChange={(e) => updateFee(fee.id, { amount: Number(e.target.value || 0) })} />
                  <select className="select" value={fee.applyTo || "final_total"} onChange={(e) => updateFee(fee.id, { applyTo: e.target.value })}>
                    <option value="final_total">Final Total</option>
                    <option value="venue_only">Venue Only</option>
                    <option value="space_content_rentals">Space Content Rentals</option>
                    <option value="catering">Catering</option>
                    <option value="services">Services</option>
                  </select>
                  <button className="btn icon sm danger-ghost" title="Delete fee" onClick={() => deleteFee(fee.id)}><Ic.Trash size={14} /></button>
                </React.Fragment>
              ))}
            </div>
            {fees.length === 0 && <div className="rental-muted">No fees or taxes yet.</div>}
          </div>

          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderBottom: "1px solid var(--line)", paddingBottom: 12, marginBottom: 14 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20 }}>Discount Rules</h2>
                <p style={{ margin: "4px 0 0", color: "var(--ink-3)", fontSize: 12 }}>Apply conditional discounts from booking-field answers, then cap the combined discount if needed.</p>
              </div>
              <button className="btn dark sm" onClick={addDiscount}><Ic.Plus size={13} /> Add</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(180px,.7fr) 150px 130px 130px", gap: 10, alignItems: "end", paddingBottom: 14, borderBottom: "1px solid var(--line)", marginBottom: 14 }}>
              <label className="chk" style={{ marginBottom: 8 }}>
                <input type="checkbox" checked={!!maxCombinedDiscount.enabled} onChange={(e) => updateMaxCombinedDiscount({ enabled: e.target.checked })} />
                Max combined discount
              </label>
              <div>
                <label className="lbl">Cap Type</label>
                <select className="select" value={maxCombinedDiscount.valueType || "percentage"} onChange={(e) => updateMaxCombinedDiscount({ valueType: e.target.value })}>
                  <option value="percentage">% of subtotal</option>
                  <option value="flat">$ amount</option>
                </select>
              </div>
              <div>
                <label className="lbl">Cap Amount</label>
                <input className="input" type="number" min="0" step="0.01" value={maxCombinedDiscount.amount || ""} onChange={(e) => updateMaxCombinedDiscount({ amount: Number(e.target.value || 0) })} />
              </div>
              <div className="rental-muted" style={{ fontSize: 11 }}>Leave off for no global limit.</div>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {discounts.map((rule) => {
                const targetSummary = rule.applyTo === "subtotal"
                  ? "Subtotal"
                  : (rule.targets || []).map((target) => DISCOUNT_TARGET_OPTIONS.find((option) => option.value === target)?.label || target).join(", ");
                const isOpen = openDiscountIds.has(rule.id);
                const amountSummary = rule.valueType === "flat" ? `$${Number(rule.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${Number(rule.amount || 0)}%`;
                const conditionCount = (rule.conditions || []).length;
                return (
                  <div key={rule.id} style={{ border: "1px solid var(--line)", borderRadius: 8, padding: 0, background: "var(--surface-2)", overflow: "hidden" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "34px minmax(180px,1fr) 90px minmax(120px,.7fr) 112px 78px 34px", gap: 10, alignItems: "center", padding: "12px 14px", borderBottom: isOpen ? "1px solid var(--line)" : 0 }}>
                      <button className="btn icon sm" type="button" title={isOpen ? "Collapse discount" : "Expand discount"} onClick={() => toggleDiscountOpen(rule.id)}>
                        <Ic.Chevron size={14} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .15s", color: "var(--ink-3)" }} />
                      </button>
                      <button type="button" onClick={() => toggleDiscountOpen(rule.id)} style={{ border: 0, background: "transparent", padding: 0, textAlign: "left", cursor: "pointer", minWidth: 0 }}>
                        <div style={{ fontWeight: 800, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rule.name || "New discount"}</div>
                        <div className="rental-muted" style={{ fontSize: 11 }}>{rule.applyTo === "subtotal" ? "Overall subtotal" : (targetSummary || "No cost lines selected")}</div>
                      </button>
                      <div style={{ fontWeight: 800 }}>{amountSummary}</div>
                      <div className="rental-muted" style={{ fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{targetSummary || "No target"}</div>
                      <div className="rental-muted" style={{ fontSize: 11 }}>{conditionCount} condition{conditionCount === 1 ? "" : "s"}</div>
                      <ProgressBadge tone={rule.active !== false ? "success" : "neutral"}>{rule.active !== false ? "Active" : "Off"}</ProgressBadge>
                      <button className="btn icon sm danger-ghost" title="Delete discount" onClick={() => deleteDiscount(rule.id)}><Ic.Trash size={14} /></button>
                    </div>
                    {isOpen && <div style={{ padding: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(180px,1fr) 135px 120px 95px", gap: 10, alignItems: "end", marginBottom: 12 }}>
                      <div>
                        <label className="lbl">Discount Name</label>
                        <input className="input" value={rule.name || ""} onChange={(e) => updateDiscount(rule.id, { name: e.target.value })} />
                      </div>
                      <div>
                        <label className="lbl">Type</label>
                        <select className="select" value={rule.valueType || "percentage"} onChange={(e) => updateDiscount(rule.id, { valueType: e.target.value })}>
                          <option value="percentage">% Percent</option>
                          <option value="flat">$ Fixed</option>
                        </select>
                      </div>
                      <div>
                        <label className="lbl">Amount</label>
                        <input className="input" type="number" min="0" step="0.01" value={rule.amount || ""} onChange={(e) => updateDiscount(rule.id, { amount: Number(e.target.value || 0) })} />
                      </div>
                      <label className="chk" style={{ marginBottom: 8 }}>
                        <input type="checkbox" checked={rule.active !== false} onChange={(e) => updateDiscount(rule.id, { active: e.target.checked })} />
                        Active
                      </label>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "170px 1fr", gap: 12, alignItems: "start", marginBottom: 12 }}>
                      <div>
                        <label className="lbl">Apply To</label>
                        <select className="select" value={rule.applyTo || "subtotal"} onChange={(e) => updateDiscount(rule.id, { applyTo: e.target.value })}>
                          <option value="subtotal">Overall subtotal</option>
                          <option value="line_items">Selected cost lines</option>
                        </select>
                      </div>
                      <div>
                        <label className="lbl">Cost Lines</label>
                        {rule.applyTo === "line_items" ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {DISCOUNT_TARGET_OPTIONS.map((option) => (
                              <label key={option.value} className="chk" style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 6, padding: "7px 9px" }}>
                                <input type="checkbox" checked={(rule.targets || []).includes(option.value)} onChange={(e) => setDiscountTarget(rule, option.value, e.target.checked)} />
                                {option.label}
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div className="rental-muted" style={{ paddingTop: 9 }}>Applies to the full subtotal.</div>
                        )}
                        {rule.applyTo === "line_items" && !targetSummary && <div className="rental-muted" style={{ marginTop: 6 }}>Select at least one cost line.</div>}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "140px 130px 150px 1fr", gap: 10, alignItems: "end", marginBottom: 12 }}>
                      <div>
                        <label className="lbl">Condition Match</label>
                        <select className="select" value={rule.conditionsMode || "all"} onChange={(e) => updateDiscount(rule.id, { conditionsMode: e.target.value })}>
                          <option value="all">All conditions</option>
                          <option value="any">Any condition</option>
                        </select>
                      </div>
                      <div>
                        <label className="lbl">Priority</label>
                        <input className="input" type="number" step="1" value={rule.priority ?? 0} onChange={(e) => updateDiscount(rule.id, { priority: Number(e.target.value || 0) })} />
                      </div>
                      <label className="chk" style={{ marginBottom: 8 }}>
                        <input type="checkbox" checked={rule.stackable !== false} onChange={(e) => updateDiscount(rule.id, { stackable: e.target.checked })} />
                        Can stack
                      </label>
                      <div className="rental-muted" style={{ fontSize: 11 }}>Applies to: {targetSummary || "No cost lines selected"}</div>
                    </div>

                    <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                        <label className="lbl" style={{ margin: 0 }}>Eligibility Conditions</label>
                        <button className="btn sm" onClick={() => addDiscountCondition(rule.id)}><Ic.Plus size={13} /> Condition</button>
                      </div>
                      {(rule.conditions || []).map((condition) => {
                        const field = discountFieldById(condition.fieldId);
                        const valueOptions = fieldOptionLabels(field);
                        const needsValue = !["has_value", "is_empty", "is_true", "is_false"].includes(condition.operator);
                        return (
                          <div key={condition.id} style={{ display: "grid", gridTemplateColumns: "minmax(180px,1fr) 150px minmax(150px,1fr) 34px", gap: 8, alignItems: "center" }}>
                            <select className="select" value={condition.fieldId || ""} onChange={(e) => {
                              const nextField = discountFieldById(e.target.value);
                              updateDiscountCondition(rule.id, condition.id, { fieldId: nextField?.id || "", fieldLabel: nextField?.label || "", operator: nextField?.type === "toggle" ? "is_true" : "equals", value: nextField?.type === "toggle" ? "true" : "" });
                            }}>
                              <option value="">Choose field</option>
                              {discountFields.map((fieldOption) => <option key={fieldOption.id} value={fieldOption.id}>{fieldOption.stepName} - {fieldOption.label}</option>)}
                            </select>
                            <select className="select" value={condition.operator || "equals"} onChange={(e) => updateDiscountCondition(rule.id, condition.id, { operator: e.target.value })}>
                              {DISCOUNT_CONDITION_OPERATORS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </select>
                            {needsValue ? (
                              valueOptions.length > 0 ? (
                                <select className="select" value={condition.value ?? ""} onChange={(e) => updateDiscountCondition(rule.id, condition.id, { value: e.target.value })}>
                                  <option value="">Choose value</option>
                                  {valueOptions.map((option) => <option key={option} value={option}>{option === "true" ? "Yes" : option === "false" ? "No" : option}</option>)}
                                </select>
                              ) : (
                                <input className="input" value={condition.value ?? ""} onChange={(e) => updateDiscountCondition(rule.id, condition.id, { value: e.target.value })} />
                              )
                            ) : (
                              <div className="rental-muted">No value needed</div>
                            )}
                            <button className="btn icon sm danger-ghost" title="Remove condition" onClick={() => removeDiscountCondition(rule.id, condition.id)}><Ic.Trash size={13} /></button>
                          </div>
                        );
                      })}
                      {(rule.conditions || []).length === 0 && <div className="rental-muted">No conditions yet. This discount will apply to every booking.</div>}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "170px 135px 120px 1fr", gap: 10, alignItems: "end" }}>
                      <label className="chk" style={{ marginBottom: 8 }}>
                        <input type="checkbox" checked={!!rule.maxDiscount?.enabled} onChange={(e) => updateDiscount(rule.id, { maxDiscount: { ...(rule.maxDiscount || {}), enabled: e.target.checked } })} />
                        Rule max
                      </label>
                      <div>
                        <label className="lbl">Max Type</label>
                        <select className="select" value={rule.maxDiscount?.valueType || "flat"} onChange={(e) => updateDiscount(rule.id, { maxDiscount: { ...(rule.maxDiscount || {}), valueType: e.target.value } })}>
                          <option value="flat">$ amount</option>
                          <option value="percentage">% of target</option>
                        </select>
                      </div>
                      <div>
                        <label className="lbl">Max Amount</label>
                        <input className="input" type="number" min="0" step="0.01" value={rule.maxDiscount?.amount || ""} onChange={(e) => updateDiscount(rule.id, { maxDiscount: { ...(rule.maxDiscount || {}), amount: Number(e.target.value || 0) } })} />
                      </div>
                      <div className="rental-muted" style={{ fontSize: 11 }}>Use priority to decide which discounts consume the global cap first.</div>
                    </div>
                    </div>}
                  </div>
                );
              })}
              {discounts.length === 0 && <div className="rental-muted">No discount rules yet.</div>}
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderBottom: "1px solid var(--line)", paddingBottom: 12, marginBottom: 14 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20 }}>Security Deposit Matrix</h2>
                <p style={{ margin: "4px 0 0", color: "var(--ink-3)", fontSize: 12 }}>The first matching row sets the refundable security deposit. Use “All” as a fallback.</p>
              </div>
              <button className="btn dark sm" onClick={addDeposit}><Ic.Plus size={13} /> Add</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.15fr 1fr 1fr 34px", gap: 10, alignItems: "center", marginBottom: 8 }}>
              {["Venue", "Event Privacy", "Event Type", "Alcohol On Site", "Amount", ""].map((label) => <div key={label} className="lbl">{label}</div>)}
              {deposits.map((row) => (
                <React.Fragment key={row.id}>
                  <select className="select" value={row.venueId || "All"} onChange={(e) => setDepositVenue(row.id, e.target.value)}>
                    <option value="All">All venues</option>
                    {venues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name}</option>)}
                  </select>
                  <select className="select" value={row.eventPrivacy || "All"} onChange={(e) => updateDeposit(row.id, { eventPrivacy: e.target.value })}>
                    {eventPrivacyOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                  <select className="select" value={row.eventType || "All"} onChange={(e) => updateDeposit(row.id, { eventType: e.target.value })}>
                    {eventTypes.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                  <select className="select" value={row.alcoholOnSite || "All"} onChange={(e) => updateDeposit(row.id, { alcoholOnSite: e.target.value })}>
                    {alcoholOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                  <input className="input" type="number" min="0" step="0.01" value={row.amount || ""} onChange={(e) => updateDeposit(row.id, { amount: Number(e.target.value || 0) })} />
                  <button className="btn icon sm danger-ghost" title="Delete rule" onClick={() => deleteDeposit(row.id)}><Ic.Trash size={14} /></button>
                </React.Fragment>
              ))}
            </div>
            {deposits.length === 0 && <div className="rental-muted">No deposit matrix rules yet. Venue-level security deposits will be used as fallback.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function SiteSettingsView({ settings, onChange, onReset, onOpenHistory }) {
  const Ic = window.Icons;
  const site = normalizeSiteSettings(settings);
  const branding = site.branding || {};
  const validations = site.validations || {};
  const fulfillment = site.fulfillment || {};
  const deliveryOptions = normalizeDeliveryOptions(fulfillment.deliveryOptions || DEFAULT_DELIVERY_OPTIONS);
  const colors = branding.colors || {};
  const fonts = branding.fonts || {};
  const update = (patch) => onChange(normalizeSiteSettings({ ...site, ...patch }));
  const updateBranding = (patch) => update({ branding: { ...branding, ...patch } });
  const updateColors = (patch) => updateBranding({ colors: { ...colors, ...patch } });
  const updateFont = (key, patch) => updateBranding({ fonts: { ...fonts, [key]: { ...(fonts[key] || {}), ...patch } } });
  const updateValidations = (patch) => update({ validations: { ...validations, ...patch } });
  const updateFulfillment = (patch) => update({ fulfillment: { ...fulfillment, ...patch } });
  const updateDeliveryOption = (id, patch) => updateFulfillment({ deliveryOptions: deliveryOptions.map((option) => option.id === id ? { ...option, ...patch } : option) });
  const addDeliveryOption = () => updateFulfillment({ deliveryOptions: [...deliveryOptions, { id: uid("delivery"), label: "New delivery option", amount: 0, active: true, description: "" }] });
  const deleteDeliveryOption = (id) => {
    const option = deliveryOptions.find((item) => item.id === id);
    requestDeleteConfirmation({
      itemType: "delivery option",
      itemName: option?.label || "New delivery option",
      onConfirm: () => updateFulfillment({ deliveryOptions: deliveryOptions.filter((item) => item.id !== id) }),
    });
  };
  const removeFavicon = () => requestDeleteConfirmation({
    action: "remove",
    itemType: "favicon",
    itemName: "current favicon",
    confirmLabel: "Remove",
    onConfirm: () => updateBranding({ favicon: "" }),
  });
  const uploadFavicon = (files) => {
    const file = files && files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateBranding({ favicon: reader.result });
    reader.readAsDataURL(file);
  };
  const fontOptions = Object.keys(FONT_OPTIONS);
  const fontLabel = (key) => ({ geist: "Geist", manrope: "Manrope", plex: "IBM Plex Sans", inter: "Inter Tight" }[key] || key);
  const colorBox = (key, label) => (
    <div>
      <label className="lbl">{label}</label>
      <div style={{ display: "grid", gridTemplateColumns: "46px 1fr", gap: 8, alignItems: "center" }}>
        <input type="color" value={colors[key] || "#000000"} onChange={(e) => updateColors({ [key]: e.target.value })} style={{ width: 46, height: 38, padding: 0, border: "1px solid var(--line)", borderRadius: 6, background: "transparent" }} />
        <input className="input" value={colors[key] || ""} onChange={(e) => updateColors({ [key]: e.target.value })} />
      </div>
    </div>
  );
  const fontRow = (key, label, sample) => {
    const value = fonts[key] || {};
    return (
      <div style={{ display: "grid", gridTemplateColumns: "minmax(220px,1fr) 170px 90px 120px", gap: 12, alignItems: "center", padding: "12px 0", borderTop: "1px solid var(--line)" }}>
        <div>
          <div className="lbl">{label}</div>
          <div style={{ fontFamily: (FONT_OPTIONS[value.family]?.stack || FONT_OPTIONS.geist.stack), fontSize: Number(value.size || 16), color: value.color || "#000", fontWeight: key === "text" ? 500 : 750, lineHeight: 1.15 }}>
            {sample}
          </div>
        </div>
        <div>
          <label className="lbl">{label} Font</label>
          <select className="select" value={value.family || "geist"} onChange={(e) => updateFont(key, { family: e.target.value })}>
            {fontOptions.map((option) => <option key={option} value={option}>{fontLabel(option)}</option>)}
          </select>
        </div>
        <div>
          <label className="lbl">Size</label>
          <input className="input" type="number" min="10" max="56" value={value.size || 16} onChange={(e) => updateFont(key, { size: Number(e.target.value || 16) })} />
        </div>
        <div>
          <label className="lbl">Color</label>
          <input className="input" type="color" value={value.color || "#000000"} onChange={(e) => updateFont(key, { color: e.target.value })} style={{ padding: 4 }} />
        </div>
      </div>
    );
  };
  return (
    <div className="editor-col" style={{ flex: 1 }}>
      <div className="editor-inner">
        <div className="editor-head">
          <div>
            <span className="editor-head-tag"><Ic.Settings size={11} /> Settings</span>
            <h1>Site Settings</h1>
            <p>Control the client-facing title, brand styling, and validation messages used by the preview.</p>
          </div>
        </div>

        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: 18 }}>
            <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: 12, marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>System Branding</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(280px,1fr) 180px", gap: 16, alignItems: "start", marginBottom: 20 }}>
              <div>
                <label className="lbl">Site Title</label>
                <input className="input" value={branding.siteTitle || ""} onChange={(e) => updateBranding({ siteTitle: e.target.value })} />
              </div>
              <div>
                <label className="lbl">Favicon / Brand Mark</label>
                <div className="rental-upload-row" style={{ gridTemplateColumns: "48px 1fr" }}>
                  <div className="rental-upload-thumb" style={{ width: 48, height: 48 }}>
                    {branding.favicon ? <img src={branding.favicon} alt="" /> : <span style={{ display: "grid", placeItems: "center", height: "100%", color: "var(--ink-4)", fontWeight: 800 }}>{(branding.adminBrandName || "C")[0]}</span>}
                  </div>
                  <div className="rental-upload-actions">
                    <label className="btn sm">
                      Upload
                      <input type="file" accept="image/*" onChange={(e) => { uploadFavicon(e.target.files); e.target.value = ""; }} />
                    </label>
                    {branding.favicon && <button className="btn icon sm danger-ghost" title="Remove favicon" onClick={removeFavicon}><Ic.Trash size={13} /></button>}
                  </div>
                </div>
              </div>
            </div>

            <h3 style={{ margin: "0 0 12px", fontSize: 14 }}>System Colors</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12, marginBottom: 22 }}>
              {colorBox("primary", "Primary")}
              {colorBox("secondary", "Secondary")}
              {colorBox("text", "Text")}
              {colorBox("accent", "Accent")}
            </div>

            <h3 style={{ margin: "0 0 4px", fontSize: 14 }}>System Fonts</h3>
            {fontRow("primary", "Primary", "Lorem ipsum dolor sit amet")}
            {fontRow("secondary", "Secondary", "Lorem ipsum dolor sit amet")}
            {fontRow("text", "Text", "Lorem ipsum dolor sit amet")}
            {fontRow("accent", "Accent", "Lorem ipsum dolor sit amet")}
          </div>

          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: 18 }}>
            <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: 12, marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>Validations</h2>
            </div>
            <div style={{ display: "grid", gap: 12, marginBottom: 18 }}>
              <label className="chk" style={{ justifyContent: "space-between", maxWidth: 520 }}>
                <span><b>Strict Progression</b><span style={{ display: "block", color: "var(--ink-3)", fontSize: 12, marginTop: 2 }}>Users cannot skip required fields before continuing.</span></span>
                <input type="checkbox" checked={!!validations.strictProgression} onChange={(e) => updateValidations({ strictProgression: e.target.checked })} />
              </label>
              <label className="chk" style={{ justifyContent: "space-between", maxWidth: 520 }}>
                <span><b>Email Verification</b><span style={{ display: "block", color: "var(--ink-3)", fontSize: 12, marginTop: 2 }}>Require a verified email before showing prices and cost summaries.</span></span>
                <input type="checkbox" checked={!!validations.emailVerification} onChange={(e) => updateValidations({ emailVerification: e.target.checked })} />
              </label>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label className="lbl">Required Parent Field</label>
                <textarea className="textarea" rows={3} value={validations.requiredFieldMessage || ""} onChange={(e) => updateValidations({ requiredFieldMessage: e.target.value })} />
              </div>
              <div>
                <label className="lbl">Required Options/Sub-options</label>
                <textarea className="textarea" rows={3} value={validations.requiredSubOptionMessage || ""} onChange={(e) => updateValidations({ requiredSubOptionMessage: e.target.value })} />
              </div>
              <div>
                <label className="lbl">Date/Time Requirement</label>
                <textarea className="textarea" rows={3} value={validations.dateTimeRequirementMessage || ""} onChange={(e) => updateValidations({ dateTimeRequirementMessage: e.target.value })} />
              </div>
              <div>
                <label className="lbl">Email Verification</label>
                <textarea className="textarea" rows={3} value={validations.emailVerificationMessage || ""} onChange={(e) => updateValidations({ emailVerificationMessage: e.target.value })} />
              </div>
              <div>
                <label className="lbl">Post-Submission Note</label>
                <textarea className="textarea" rows={3} value={validations.postSubmissionNote || ""} onChange={(e) => updateValidations({ postSubmissionNote: e.target.value })} />
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderBottom: "1px solid var(--line)", paddingBottom: 12, marginBottom: 14 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20 }}>Delivery Options</h2>
                <p style={{ margin: "4px 0 0", color: "var(--ink-3)", fontSize: 12 }}>Reusable delivery fees selected by external rental catalog items.</p>
              </div>
              <button className="btn dark sm" onClick={addDeliveryOption}><Ic.Plus size={13} /> Add</button>
            </div>
            <div className="delivery-options-grid">
              <div className="lbl">Name</div>
              <div className="lbl">Cost</div>
              <div className="lbl">Description</div>
              <div className="lbl">Active</div>
              <div />
              {deliveryOptions.map((option) => (
                <React.Fragment key={option.id}>
                  <input className="input" value={option.label || ""} onChange={(e) => updateDeliveryOption(option.id, { label: e.target.value })} />
                  <input className="input" type="number" min="0" step="0.01" value={option.amount || ""} onChange={(e) => updateDeliveryOption(option.id, { amount: Number(e.target.value || 0) })} />
                  <input className="input" value={option.description || ""} onChange={(e) => updateDeliveryOption(option.id, { description: e.target.value })} />
                  <label className="chk" style={{ justifyContent: "center" }}><input type="checkbox" checked={option.active !== false} onChange={(e) => updateDeliveryOption(option.id, { active: e.target.checked })} /></label>
                  <button className="btn icon sm danger-ghost" title="Delete delivery option" onClick={() => deleteDeliveryOption(option.id)}><Ic.Trash size={13} /></button>
                </React.Fragment>
              ))}
            </div>
            {deliveryOptions.length === 0 && <div className="rental-muted">No delivery options yet.</div>}
          </div>

          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: 18 }}>
            <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: 12, marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>System Maintenance</h2>
              <p style={{ margin: "4px 0 0", color: "var(--ink-3)", fontSize: 12 }}>
                Review previous saved versions or reset the admin workspace back to the sample configuration.
              </p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <button className="btn" onClick={onOpenHistory} title="Open activity timeline">
                <Ic.Clock size={14} /> History
              </button>
              <button className="btn danger-ghost" onClick={onReset} title="Reset to sample data">
                <Ic.Key size={14} /> Reset to sample
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getEmailTemplate(settings, typeId) {
  const normalized = normalizeSiteSettings(settings || SAMPLE_SITE_SETTINGS);
  return normalized.emailSettings?.templates?.[typeId] || DEFAULT_EMAIL_TEMPLATES[typeId] || DEFAULT_EMAIL_TEMPLATES["fill-form"];
}

function emailTokenMap(record = {}) {
  const bookingText = record.request?.bookingDateTime || "";
  const [bookingStart = bookingText, bookingEnd = ""] = String(bookingText).split(/\s+-\s+/);
  return {
    "{{Client_Name}}": record.client?.name || "",
    "{{Organization}}": record.client?.organization || "",
    "{{Email}}": record.client?.email || "",
    "{{Copy_Link}}": `https://collaburo.app/book?record=${bookingCodeForRecord(record)}`,
    "{{Contract_Link}}": `https://collaburo.app/book?record=${bookingCodeForRecord(record)}&action=sign`,
    "{{Insurance_Link}}": "https://duuo.ca/event-insurance",
    "{{AGCO_Link}}": "https://www.agco.ca/",
    "{{Event_Privacy}}": record.request?.eventPrivacy || "",
    "{{Alcohol_On_Site}}": record.request?.alcoholOnSite || "",
    "{{Expected_Number_of_Attendees}}": record.request?.attendeeCount || "",
    "{{Space}}": record.request?.space || "",
    "{{Booking_Start_datetime}}": bookingStart.trim(),
    "{{Booking_end_datetime}}": bookingEnd.trim(),
    "{{Set_up_Service}}": record.adminSections?.serviceNotes || "",
    "{{Clean_up_Service}}": record.adminSections?.serviceNotes || "",
  };
}

function fillEmailTokens(text, record) {
  const map = emailTokenMap(record);
  return String(text || "").replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}?/g, (token, name) => {
    const canonical = `{{${name}}}`;
    return map[canonical] ?? token;
  });
}

function EmailPreviewBox({ content }) {
  const html = String(content || "")
    .split("\n")
    .map((line) => line.trim() ? line.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "<br />")
    .join("<br />");
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
      <div style={{ height: 36, borderBottom: "1px solid var(--line)", background: "var(--surface-2)", display: "flex", alignItems: "center", gap: 7, padding: "0 10px", color: "var(--ink-3)", fontSize: 11 }}>
        <b>B</b><i>I</i><span>•</span><span>List</span><span>Link</span><span>Image</span><span>Source</span>
      </div>
      <div style={{ minHeight: 150, maxHeight: 260, overflow: "auto", padding: 14, fontSize: 12, lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

function EmailSettingsView({ settings, onChange }) {
  const Ic = window.Icons;
  const site = normalizeSiteSettings(settings);
  const emailSettings = site.emailSettings || {};
  const update = (patch) => onChange(normalizeSiteSettings({ ...site, emailSettings: { ...emailSettings, ...patch } }));
  const updateTemplate = (typeId, patch) => update({
    templates: {
      ...(emailSettings.templates || {}),
      [typeId]: { ...getEmailTemplate(site, typeId), ...patch },
    },
  });
  return (
    <div className="editor-col" style={{ flex: 1 }}>
      <div className="editor-inner">
        <div className="editor-head">
          <div>
            <span className="editor-head-tag"><Ic.Mail size={11} /> Email</span>
            <h1>Email Settings</h1>
            <p>Manage the default Resend sender details and the four progress-list email templates.</p>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="lbl">Provider</label>
              <select className="select" value={emailSettings.provider || "resend"} onChange={(e) => update({ provider: e.target.value })}>
                <option value="resend">Resend</option>
              </select>
            </div>
            <div>
              <label className="lbl">Reply To</label>
              <input className="input" value={emailSettings.replyTo || ""} onChange={(e) => update({ replyTo: e.target.value })} />
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 18 }}>
          {EMAIL_TEMPLATE_TYPES.map((type) => {
            const template = getEmailTemplate(site, type.id);
            const IconCmp = Ic[type.icon] || Ic.Mail;
            return (
              <div key={type.id} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 6, background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center" }}><IconCmp size={15} /></span>
                  <h2 style={{ margin: 0, fontSize: 20 }}>{type.label} Email</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(260px,.9fr) minmax(360px,1.25fr)", gap: 18, alignItems: "start" }}>
                  <div style={{ display: "grid", gap: 10 }}>
                    <div><label className="lbl">From <span style={{ color: "var(--danger)" }}>*</span></label><input className="input" value={template.from || ""} onChange={(e) => updateTemplate(type.id, { from: e.target.value })} /></div>
                    <div><label className="lbl">CC</label><input className="input" value={template.cc || ""} onChange={(e) => updateTemplate(type.id, { cc: e.target.value })} /></div>
                    <div><label className="lbl">Subject <span style={{ color: "var(--danger)" }}>*</span></label><input className="input" value={template.subject || ""} onChange={(e) => updateTemplate(type.id, { subject: e.target.value })} /></div>
                  </div>
                  <div>
                    <label className="lbl">Email Content <span style={{ color: "var(--danger)" }}>*</span></label>
                    <textarea className="textarea" rows={8} value={template.content || ""} onChange={(e) => updateTemplate(type.id, { content: e.target.value })} />
                    <EmailPreviewBox content={template.content} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 18, background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: 16 }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 14 }}>Dynamic Fields List</h3>
          <div style={{ columns: 2, fontSize: 12, lineHeight: 1.6 }}>
            {DYNAMIC_EMAIL_FIELDS.map(([token, desc]) => <div key={token}><b>{token}</b> = {desc}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressBadge({ children, tone = "neutral" }) {
  return <span className={"progress-badge " + tone}>{children}</span>;
}

function progressCompletion(record = {}, fallbackTotal = 0) {
  const completedIds = Array.isArray(record.stepProgress?.completedStepIds) ? record.stepProgress.completedStepIds : [];
  const total = Number(record.stepProgress?.totalSteps || fallbackTotal || 0);
  const completed = Math.min(Number(record.stepProgress?.completedCount || completedIds.length || 0), total || completedIds.length || 0);
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percent };
}

function isProgressRecordActive(record = {}, now = Date.now()) {
  const last = new Date(record.progress?.lastActivityAt || record.stepProgress?.updatedAt || 0).getTime() || 0;
  return last > 0 && now - last <= 5 * 60 * 1000;
}

const PROGRESS_STATUS_OPTIONS = ["Draft", "Not Contacted", "Initiated Contact", "In Discussion", "Partially Paid", "Paid", "Cancelled", "Completed"];
const AGCO_LICENSE_STATUS_OPTIONS = ["Not Received", "Not Required", "Pending AGCO Approval", "Obtained"];
const INSURANCE_STATUS_OPTIONS = ["Not Received", "Not Required", "Obtained DUUO", "Client has own"];
const AGREEMENT_STATUS_OPTIONS = ["Not Signed", "Signed"];
const DOCUMENT_UPLOAD_ACCEPT = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv";

function normalizeProgressStatus(status, fallback = "In Discussion") {
  const text = String(status || fallback).trim();
  const canonical = {
    draft: "Draft",
    "not contacted": "Not Contacted",
    "initiated contact": "Initiated Contact",
    "in discussion": "In Discussion",
    "partially paid": "Partially Paid",
    paid: "Paid",
    cancelled: "Cancelled",
    completed: "Completed",
  };
  return canonical[text.toLowerCase()] || text || fallback;
}
const progressStatusClass = (status = "In Discussion") => String(status || "In Discussion").toLowerCase().replace(/[^a-z0-9]+/g, "-");
const progressFileUrl = (file) => typeof file === "string" ? file : (file?.url || file?.secureUrl || "");
const progressHasUploadedFile = (file) => !!progressFileUrl(file);
const progressAgcoLicenseComplete = (progress = {}) => progress.agcoLicenseStatus === "Obtained" && progressHasUploadedFile(progress.agcoLicenseFile);
const progressInsuranceComplete = (progress = {}) => ["Obtained DUUO", "Client has own"].includes(progress.insuranceStatus) && progressHasUploadedFile(progress.insuranceFile);
const progressAgreementComplete = (progress = {}) => progress.agreement === "Signed" && progressHasUploadedFile(progress.agreementFile);

function ProgressStatusMultiSelect({ value = [], onChange }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const closeOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);
  const toggle = (status) => {
    onChange(value.includes(status) ? value.filter((item) => item !== status) : [...value, status]);
  };
  return (
    <div className="progress-status-filter" ref={rootRef}>
      <button type="button" className="select progress-status-filter-trigger" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
        {value.length === 0 ? (
          <span>All</span>
        ) : (
          <span className="progress-status-filter-summary">
            <span className="progress-status-filter-dots">
              {value.slice(0, 4).map((status) => <i key={status} className={"progress-status-filter-dot " + progressStatusClass(status)} />)}
            </span>
            <span>{value.length === 1 ? value[0] : `${value.length} selected`}</span>
          </span>
        )}
      </button>
      {open && (
        <div className="progress-status-filter-menu">
          <button type="button" className="progress-status-filter-all" onClick={() => onChange([])}>All statuses</button>
          {PROGRESS_STATUS_OPTIONS.map((status) => (
            <label key={status} className={"progress-status-filter-option " + progressStatusClass(status)}>
              <input type="checkbox" checked={value.includes(status)} onChange={() => toggle(status)} />
              <span>{status}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function formatProgressBookingDateTime(value = "") {
  const text = String(value || "").trim();
  if (!text) return "";
  const withoutVenue = text.replace(/(^|;\s*)[^:;]+:\s*(?=\d{4}-\d{2}-\d{2}|\w{3,9}\s+\d{1,2},\s+\d{4})/g, "$1");
  const formatPiece = (piece = "") => {
    const raw = piece.trim();
    if (!raw) return "";
    const normalized = raw.replace(/\s+/g, " ");
    const match = normalized.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2})(?::\d{2})?$/);
    const date = match ? new Date(`${match[1]}T${match[2]}:00`) : new Date(normalized);
    if (Number.isNaN(date.getTime())) return normalized;
    const dateText = date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    const timeText = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
    return `${dateText}, ${timeText}`;
  };
  return withoutVenue
    .split(";")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => segment.split(/\s+-\s+/).map(formatPiece).filter(Boolean).join(" - "))
    .join("; ");
}

function ProgressCostBreakdownModal({ title, amount, lines = [], onClose }) {
  const Ic = window.Icons;
  const fmt = (value) => "$" + Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const groups = Object.values(lines.reduce((all, line) => {
    const groupTitle = line.group || title || "Details";
    if (!all[groupTitle]) all[groupTitle] = { title: groupTitle, total: 0, lines: [] };
    all[groupTitle].lines.push(line);
    all[groupTitle].total += Number(line.total || 0);
    return all;
  }, {}));
  React.useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);
  return (
    <div className="cv-cost-modal-backdrop" onClick={onClose} role="presentation">
      <div className="cv-cost-modal progress-cost-breakdown-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="progress-cost-breakdown-title">
        <div className="cv-cost-modal-head">
          <div>
            <div className="cv-cost-modal-title" id="progress-cost-breakdown-title">Cost Breakdown</div>
            <div className="cv-cost-modal-total">{title} {fmt(amount || 0)}</div>
          </div>
          <button className="cv-cost-modal-close" type="button" onClick={onClose} title="Close cost breakdown"><Ic.Close size={18} /> Close</button>
        </div>
        <div className="cv-cost-modal-body">
          {groups.length ? groups.map((group) => (
            <section className="progress-cost-breakdown-group" key={group.title}>
              <div className="progress-cost-breakdown-group-head"><strong>{group.title}</strong><strong>{fmt(group.total || 0)}</strong></div>
              <div className="cv-cost-breakdown-table">
                <div className="cv-cost-breakdown-header"><span>Item</span><span style={{ textAlign: "center" }}>Qty</span><span style={{ textAlign: "right" }}>Amount</span></div>
                {group.lines.map((line, index) => (
                  <div className="cv-cost-detail-row" key={`${line.id || line.label || "item"}-${index}`}>
                    <div><div className="cv-cost-detail-main">{line.label || "Item"}</div>{line.meta && <div className="cv-cost-detail-meta">{line.meta}</div>}</div>
                    <div className="cv-cost-detail-qty">{Number(line.quantity || 1).toLocaleString("en-US")}</div>
                    <div className="cv-cost-detail-amount">{fmt(line.total || 0)}</div>
                  </div>
                ))}
              </div>
            </section>
          )) : <div className="progress-cost-breakdown-empty">No priced items were recorded for this category.</div>}
          <div className="progress-cost-breakdown-totals">
            <div className="cv-cost-row progress-cost-breakdown-final"><strong>Total {title}</strong><strong>{fmt(amount || 0)}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressCostSummary({ costs = {}, onOpenBreakdown, onChange, showTitle = true }) {
  const [rentalExtrasEditing, setRentalExtrasEditing] = React.useState(false);
  const [additionalDiscountEditing, setAdditionalDiscountEditing] = React.useState(false);
  const [securityDepositEditing, setSecurityDepositEditing] = React.useState(false);
  const fmt = (n) => "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const splitContent = splitSpaceContentCost(costs);
  const rows = [
    ["Space Rental", costs.spaceRentalTotal, costs.spaceLines || []],
    ["Space Content Rentals", splitContent.rentalsTotal, splitContent.rentalLines || []],
    ["Space Extra Costs", splitContent.extrasTotal, splitContent.extrasLines || []],
    ["Catering Cost", costs.cateringTotal, costs.cateringLines || []],
    ["Set up Service Cost", costs.setupTotal, costs.setupLines || []],
    ["Event Service Cost", costs.eventTotal, costs.eventLines || []],
    ["Clear up Service Cost", costs.cleanupTotal, costs.cleanupLines || []],
  ];
  const additionalDiscountRow = summaryDiscountRows(costs).find((discount) => discount.id === "additional_discount");
  const automaticDiscountRows = summaryDiscountRows(costs).filter((discount) => discount.id !== "additional_discount");
  const updateRentalExtras = (value) => {
    const amount = Math.max(0, Number(value || 0));
    const extrasLines = amount > 0 ? [{
      id: "f_rent_extras",
      label: "Extras",
      group: "Space Content Rentals",
      meta: "",
      quantity: 1,
      total: amount,
      rentalExtraLine: true,
    }] : [];
    onChange?.(applyRentalExtrasCostAdjustment(costs, extrasLines));
  };
  const updateAdditionalDiscount = (value) => {
    onChange?.(applyAdminCostAdjustment(costs, {
      ...(costs.adminAdjustments || {}),
      additionalDiscount: Math.max(0, Number(value || 0)),
    }));
  };
  const updateSecurityDeposit = (value) => {
    onChange?.(applySecurityDepositCostAdjustment(costs, Math.max(0, Number(value || 0))));
  };
  const resetSecurityDeposit = () => {
    onChange?.(applySecurityDepositCostAdjustment(costs));
    setSecurityDepositEditing(false);
  };
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
      {showTitle && <div style={{ padding: "12px 14px", fontWeight: 800, borderBottom: "1px solid var(--line)" }}>Summary of Cost</div>}
      <div style={{ padding: 14, display: "grid", gap: 7, fontSize: 12 }}>
        <b>Total Quote:</b>
        {rows.map(([label, amount, lines]) => {
          const editableRentalExtras = label === "Space Extra Costs";
          return (
            <div className="cv-cost-row" key={label} style={{ alignItems: "center" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                <button className="cv-cost-link" type="button" onClick={() => onOpenBreakdown?.({ title: label, amount, lines })}>{label}</button>
                {editableRentalExtras && !rentalExtrasEditing && <button type="button" className="btn sm" style={{ padding: "3px 7px", minHeight: 0, fontSize: 10 }} onClick={() => setRentalExtrasEditing(true)}>Edit</button>}
              </span>
              {editableRentalExtras && rentalExtrasEditing ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <input className="input" type="number" min="0" step="0.01" aria-label="Space Extra Costs amount" value={(costs.adminAdjustments?.rentalExtras ?? amount) || ""} onChange={(event) => updateRentalExtras(event.target.value)} style={{ width: 92, minHeight: 30, padding: "4px 7px", textAlign: "right" }} />
                  <button type="button" className="btn sm" style={{ padding: "3px 7px", minHeight: 0, fontSize: 10 }} onClick={() => setRentalExtrasEditing(false)}>Done</button>
                </span>
              ) : <span>{fmt(amount)}</span>}
            </div>
          );
        })}
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 8, marginTop: 4 }}>
          {automaticDiscountRows.map((discount) => <div className="cv-cost-row" key={discount.id || discount.label}><span>{discount.label}</span><span>{fmt(discount.total)}</span></div>)}
          <div className="cv-cost-row" key="additional_discount" style={{ alignItems: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              Additional Discount
              {!additionalDiscountEditing && <button type="button" className="btn sm" style={{ padding: "3px 7px", minHeight: 0, fontSize: 10 }} onClick={() => setAdditionalDiscountEditing(true)}>Edit</button>}
            </span>
            {additionalDiscountEditing ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <input className="input" type="number" min="0" step="0.01" aria-label="Additional Discount amount" value={costs.adminAdjustments?.additionalDiscount || ""} onChange={(event) => updateAdditionalDiscount(event.target.value)} style={{ width: 92, minHeight: 30, padding: "4px 7px", textAlign: "right" }} />
                <button type="button" className="btn sm" style={{ padding: "3px 7px", minHeight: 0, fontSize: 10 }} onClick={() => setAdditionalDiscountEditing(false)}>Done</button>
              </span>
            ) : <span>{fmt(additionalDiscountRow?.total || 0)}</span>}
          </div>
          <div className="cv-cost-row"><span>Subtotal</span><span>{fmt(costSubtotalForDisplay(costs))}</span></div>
          {(costs.feeLines || []).map((fee) => <div className="cv-cost-row" key={fee.id || fee.label}><span>{fee.displayLabel || fee.label}</span><span>{fmt(fee.total)}</span></div>)}
        </div>
        <div className="cv-cost-row cv-cost-total-band"><span>Total</span><span>{fmt(costs.total)}</span></div>
        <div className="cv-cost-row" style={{ alignItems: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            Security Deposit (refundable)
            {!securityDepositEditing && <button type="button" className="btn sm" style={{ padding: "3px 7px", minHeight: 0, fontSize: 10 }} onClick={() => setSecurityDepositEditing(true)}>Edit</button>}
            <button type="button" className="btn sm" style={{ padding: "3px 7px", minHeight: 0, fontSize: 14, lineHeight: 1 }} onClick={resetSecurityDeposit} title={`Reset to calculated value (${fmt(costs.calculatedSecurityDeposit ?? costs.securityDeposit)})`} aria-label="Reset security deposit to calculated value">↺</button>
          </span>
          {securityDepositEditing ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <input className="input" type="number" min="0" step="0.01" aria-label="Security Deposit amount" value={(costs.adminAdjustments?.securityDeposit ?? costs.securityDeposit) || ""} onChange={(event) => updateSecurityDeposit(event.target.value)} style={{ width: 92, minHeight: 30, padding: "4px 7px", textAlign: "right" }} />
              <button type="button" className="btn sm" style={{ padding: "3px 7px", minHeight: 0, fontSize: 10 }} onClick={() => setSecurityDepositEditing(false)}>Done</button>
            </span>
          ) : <span>{fmt(costs.securityDeposit)}</span>}
        </div>
        <div className="cv-cost-row"><span>Total with Security Deposit</span><span>{fmt(costs.totalWithDeposit)}</span></div>
      </div>
    </div>
  );
}

function ProgressRequestSelections({ costs = {} }) {
  const fmt = (value) => "$" + Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const splitContent = splitSpaceContentCost(costs);
  const venueLines = [
    ...(costs.spaceLines || []),
    ...(Number(costs.securityDeposit || 0) > 0 ? [{
      id: "security_deposit",
      label: "Security Deposit (refundable)",
      quantity: 1,
      total: costs.securityDeposit,
    }] : []),
  ];
  const groups = [
    { title: "Selected Venue Costs", lines: venueLines },
    { title: "Rental Items", lines: [...(splitContent.rentalLines || []), ...(splitContent.extrasLines || [])] },
  ].filter((group) => group.lines.length > 0);
  const serviceTitle = (title) => /Services$/.test(title);
  const lineDetail = (line, isService) => {
    const details = [];
    if (line.meta) details.push(line.meta);
    if (!isService && Number(line.quantity || 1) > 1) details.push(`Quantity: ${Number(line.quantity).toLocaleString("en-US")}`);
    return details.join(" · ");
  };
  if (!groups.length) return null;
  return (
    <div className="progress-request-selections" style={{ display: "grid", gap: 12, marginTop: 12, borderTop: "1px solid var(--line)", paddingTop: 12, fontSize: 13, lineHeight: 1.35 }}>
      {groups.map((group) => (
        <section key={group.title} style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ borderBottom: "1px solid var(--line)", fontWeight: 800, fontSize: 15, padding: "9px 12px" }}>{group.title}</div>
          <ul style={{ display: "grid", gap: 7, margin: 0, padding: "10px 14px 11px 30px" }}>
            {group.lines.map((line, index) => {
              const detail = lineDetail(line, serviceTitle(group.title));
              return (
                <li key={`${line.id || line.label || "item"}-${index}`} style={{ paddingLeft: 1 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 12, alignItems: "baseline" }}>
                    <b>{line.label || "Selected item"}</b>
                    <b style={{ whiteSpace: "nowrap" }}>{fmt(line.total)}</b>
                  </div>
                  {detail && <div style={{ color: "var(--ink-2)", fontSize: 12, marginTop: 2 }}>{detail}</div>}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ProgressRequestCostSummary({ costs = {} }) {
  const fmt = (value) => "$" + Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const splitContent = splitSpaceContentCost(costs);
  const rows = [
    ["Space Rental", costs.spaceRentalTotal],
    ["Space Content Rentals", splitContent.rentalsTotal],
    ["Space Extra Costs", splitContent.extrasTotal],
    ["Catering Cost", costs.cateringTotal],
    ["Set-up Service Cost", costs.setupTotal],
    ["Event Service Cost", costs.eventTotal],
    ["Clear-up Service Cost", costs.cleanupTotal],
    ...summaryDiscountRows(costs).map((row) => [row.label, row.total]),
    ...(costs.feeLines || []).map((fee) => [fee.displayLabel || fee.label, fee.total]),
  ];
  return (
    <section style={{ marginTop: 12, border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden", fontSize: 13 }}>
      <div style={{ background: "var(--canvas, #f7f5f2)", borderBottom: "1px solid var(--line)", fontWeight: 800, fontSize: 14, padding: "7px 10px" }}>Summary of Cost</div>
      <div style={{ display: "grid", gap: 4, padding: "8px 10px" }}>
        {rows.map(([label, value]) => <div className="cv-cost-row" key={label}><span>{label}</span><b>{fmt(value)}</b></div>)}
        <div className="cv-cost-row" style={{ borderTop: "1px solid var(--line)", marginTop: 3, paddingTop: 7 }}><b>Total</b><b>{fmt(costs.total)}</b></div>
        <div className="cv-cost-row"><span>Security Deposit (refundable)</span><b>{fmt(costs.securityDeposit)}</b></div>
        <div className="cv-cost-row" style={{ fontWeight: 800 }}><b>Total with Security Deposit</b><b>{fmt(costs.totalWithDeposit)}</b></div>
      </div>
    </section>
  );
}

function applyAdminCostAdjustment(costs = {}, adjustment = {}) {
  const amount = Math.max(0, Number(adjustment.additionalDiscount || 0));
  const existingLines = Array.isArray(costs.discountLines) ? costs.discountLines : [];
  const previousAdminLines = existingLines.filter((line) => line?.adminOnly || line?.id === "additional_discount");
  const automaticDiscountLines = existingLines.filter((line) => !(line?.adminOnly || line?.id === "additional_discount"));
  const previousAdminTotal = previousAdminLines.reduce((sum, line) => sum + Math.abs(Number(line.total || 0)), 0);
  const baseDiscountedSubtotal = Number(costs.discountedSubtotal ?? Math.max(0, Number(costs.subtotal || 0) - automaticDiscountLines.reduce((sum, line) => sum + Math.abs(Number(line.total || 0)), 0))) + previousAdminTotal;
  const cappedAmount = Math.min(amount, Math.max(0, baseDiscountedSubtotal));
  const adminLine = cappedAmount > 0 ? {
    id: "additional_discount",
    label: "Additional Discount",
    displayLabel: "Additional Discount",
    applyTo: "subtotal",
    targets: ["subtotal"],
    basis: Number(costs.subtotal || 0),
    total: -cappedAmount,
    adminOnly: true,
  } : null;
  const discountLines = adminLine ? [...automaticDiscountLines, adminLine] : automaticDiscountLines;
  const discountTotal = discountLines.reduce((sum, line) => sum + Math.abs(Number(line.total || 0)), 0);
  const discountedSubtotal = Math.max(0, Number(costs.subtotal || 0) - discountTotal);
  const feeLines = (costs.feeLines || []).map((fee) => {
    const rate = Number(fee.basis || 0) > 0 ? Number(fee.total || 0) / Number(fee.basis || 0) : 0;
    const basis = fee.applyTo === "final_total" ? discountedSubtotal : Number(fee.basis || 0);
    return rate ? { ...fee, basis, total: basis * rate } : fee;
  });
  const feesTotal = feeLines.reduce((sum, fee) => sum + Number(fee.total || 0), 0);
  const total = discountedSubtotal + feesTotal;
  const totalWithDeposit = total + Number(costs.securityDeposit || 0);
  return {
    ...costs,
    adminAdjustments: { ...(costs.adminAdjustments || {}), additionalDiscount: amount },
    discountLines,
    discountTotal,
    discountedSubtotal,
    feeLines,
    feesTotal,
    tax: feeLines.filter((fee) => /tax/i.test(fee.label)).reduce((sum, fee) => sum + Number(fee.total || 0), 0),
    total,
    totalWithDeposit,
  };
}

function applyRentalExtrasCostAdjustment(costs = {}, extrasLines = []) {
  const amount = extrasLines.reduce((sum, line) => sum + Number(line.total || 0), 0);
  const savedExtraLinesTotal = (costs.spaceContentLines || [])
    .filter((line) => line.adminRentalExtra || line.rentalExtraLine)
    .reduce((sum, line) => sum + Number(line.total || 0), 0);
  const previousAmount = Number(costs.adminAdjustments?.rentalExtras ?? costs.rentalExtrasTotal ?? savedExtraLinesTotal ?? 0);
  const delta = amount - previousAmount;
  const spaceContentTotal = Number(costs.spaceContentTotal || 0) + delta;
  const subtotal = Number(costs.subtotal || 0) + delta;
  const discountedSubtotal = Math.max(0, Number(costs.discountedSubtotal ?? Math.max(0, Number(costs.subtotal || 0) - Number(costs.discountTotal || 0))) + delta);
  const feeLines = (costs.feeLines || []).map((fee) => {
    const rate = Number(fee.basis || 0) > 0 ? Number(fee.total || 0) / Number(fee.basis || 0) : 0;
    const basis = fee.applyTo === "space_content_rentals" ? spaceContentTotal : fee.applyTo === "final_total" ? discountedSubtotal : Number(fee.basis || 0);
    return rate ? { ...fee, basis, total: basis * rate } : fee;
  });
  const feesTotal = feeLines.reduce((sum, fee) => sum + Number(fee.total || 0), 0);
  const total = discountedSubtotal + feesTotal;
  const spaceContentLines = [
    ...(costs.spaceContentLines || []).filter((line) => !line.adminRentalExtra && !line.rentalExtraLine),
    ...extrasLines.map((line) => ({ ...line, adminRentalExtra: true, rentalExtraLine: true })),
  ];
  return {
    ...costs,
    spaceContentTotal,
    subtotal,
    discountedSubtotal,
    feeLines,
    feesTotal,
    tax: feeLines.filter((fee) => /tax/i.test(fee.label)).reduce((sum, fee) => sum + Number(fee.total || 0), 0),
    total,
    totalWithDeposit: total + Number(costs.securityDeposit || 0),
    spaceContentLines,
    adminAdjustments: { ...(costs.adminAdjustments || {}), rentalExtras: amount },
  };
}

function applySecurityDepositCostAdjustment(costs = {}, amount) {
  const adminAdjustments = { ...(costs.adminAdjustments || {}) };
  const calculatedSecurityDeposit = Number(costs.calculatedSecurityDeposit ?? costs.securityDeposit ?? 0);
  const hasOverride = amount !== undefined;
  const securityDeposit = hasOverride ? Math.max(0, Number(amount || 0)) : calculatedSecurityDeposit;
  if (hasOverride) adminAdjustments.securityDeposit = securityDeposit;
  else delete adminAdjustments.securityDeposit;
  return {
    ...costs,
    adminAdjustments,
    calculatedSecurityDeposit,
    securityDeposit,
    totalWithDeposit: Number(costs.total || 0) + securityDeposit,
  };
}

function applyStoredAdminCostAdjustments(costs = {}, adjustments = {}) {
  let nextCosts = costs || {};
  if (Number(adjustments.rentalExtras || 0) > 0) {
    nextCosts = applyRentalExtrasCostAdjustment(nextCosts, [{
      id: "f_rent_extras",
      label: "Extras",
      group: "Space Content Rentals",
      meta: "",
      quantity: 1,
      total: Number(adjustments.rentalExtras || 0),
      rentalExtraLine: true,
    }]);
  }
  if (Number(adjustments.additionalDiscount || 0) > 0) {
    nextCosts = applyAdminCostAdjustment(nextCosts, adjustments);
  }
  if (Object.prototype.hasOwnProperty.call(adjustments, "securityDeposit")) {
    nextCosts = applySecurityDepositCostAdjustment(nextCosts, adjustments.securityDeposit);
  }
  return nextCosts;
}

function EmailSendModal({ record, typeId, siteSettings, onClose, onSent, onError }) {
  const Ic = window.Icons;
  const type = EMAIL_TEMPLATE_TYPES.find((item) => item.id === typeId) || EMAIL_TEMPLATE_TYPES[0];
  const template = getEmailTemplate(siteSettings, typeId);
  const [draft, setDraft] = React.useState(() => ({
    from: template.from || "",
    to: record?.client?.email || "",
    cc: template.cc || "",
    subject: fillEmailTokens(template.subject, record),
    content: fillEmailTokens(template.content, record),
    preview: false,
  }));
  const [sending, setSending] = React.useState(false);
  if (!record) return null;
  const update = (patch) => setDraft((prev) => ({ ...prev, ...patch }));
  const send = () => {
    setSending(true);
    collaburoApi("/api/send-email", {
      method: "POST",
      body: JSON.stringify({
        type: type.id,
        from: draft.from,
        to: draft.to,
        cc: draft.cc,
        subject: draft.subject,
        text: draft.content,
        replyTo: siteSettings?.emailSettings?.replyTo,
      }),
    })
      .then(() => onSent(type, draft))
      .catch((error) => onError && onError(error))
      .finally(() => setSending(false));
  };
  return (
    <div className="rec-overlay" onClick={onClose}>
      <div className="rec-modal" onClick={(e) => e.stopPropagation()} style={{ width: 760, maxWidth: "calc(100vw - 32px)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
          <div>
            <h3 style={{ margin: 0 }}>Send {type.label} email</h3>
            <div className="sub" style={{ marginBottom: 0 }}>To {record.client?.name || "client"}</div>
          </div>
          <button className="btn icon sm" onClick={onClose} title="Close"><Ic.Close size={14} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "8px 10px", alignItems: "center", marginBottom: 12 }}>
          <label className="lbl" style={{ margin: 0 }}>From</label><input className="input" value={draft.from} onChange={(e) => update({ from: e.target.value })} />
          <label className="lbl" style={{ margin: 0 }}>To</label><input className="input" value={draft.to} onChange={(e) => update({ to: e.target.value })} />
          <label className="lbl" style={{ margin: 0 }}>Subject</label><input className="input" value={draft.subject} onChange={(e) => update({ subject: e.target.value })} />
          <label className="lbl" style={{ margin: 0 }}>CC</label><input className="input" value={draft.cc} onChange={(e) => update({ cc: e.target.value })} />
        </div>
        <label className="lbl">Email Content</label>
        <textarea className="textarea" rows={9} value={draft.content} onChange={(e) => update({ content: e.target.value })} />
        {draft.preview && <EmailPreviewBox content={draft.content} />}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 14 }}>
          <label className="chk"><input type="checkbox" checked={draft.preview} onChange={(e) => update({ preview: e.target.checked })} /> Preview Email</label>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-gray" onClick={onClose}>Cancel</button>
            <button className="btn dark sm" onClick={send} disabled={sending || !draft.to || !draft.subject || !draft.content}>
              <Ic.Mail size={13} /> {sending ? "Sending..." : "Send Email"}
            </button>
          </div>
        </div>
        <div style={{ marginTop: 14, fontSize: 11.5, color: "var(--ink-3)" }}>
          {DYNAMIC_EMAIL_FIELDS.slice(0, 8).map(([token, desc]) => <div key={token}><b>{token}</b> = {desc}</div>)}
        </div>
      </div>
    </div>
  );
}

function RentalsProgressListView({ records, onOpenDetail, onEditClient, onAdd, onUpdateRecord, onEmail, onCopyLink, onDelete }) {
  const Ic = window.Icons;
  const [now, setNow] = React.useState(Date.now());
  const [filters, setFilters] = React.useState({ query: "", space: "All", from: "", to: "", interest: "All", statuses: [], age: "Current and New" });
  const spaces = ["All", ...Array.from(new Set((records || []).map((record) => record.request?.space).filter(Boolean)))];
  const interestOptions = ["All", "Unlikely", "Not sure", "Likely", "Very Likely"];
  const emailActionLabels = {
    "fill-form": "Fill form",
    "sign-form": "Contract",
    insurance: "Insurance",
    "agco-license": "AGCO",
  };
  const updateFilter = (patch) => setFilters((prev) => ({ ...prev, ...patch }));
  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  const filtered = (records || []).filter((record) => {
    const hay = [record.client?.name, record.client?.organization, record.client?.email, record.request?.description].join(" ").toLowerCase();
    if (filters.query && !hay.includes(filters.query.toLowerCase())) return false;
    if (filters.space !== "All" && record.request?.space !== filters.space) return false;
    if (filters.interest !== "All" && record.progress?.interestLevel !== filters.interest) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(normalizeProgressStatus(record.progress?.status))) return false;
    if (filters.age === "Current and New" && record.progress?.age && !["New", "Current", ""].includes(record.progress.age)) return false;
    const submitted = new Date(record.submittedAt);
    if (filters.from && submitted < new Date(filters.from + "T00:00:00")) return false;
    if (filters.to && submitted > new Date(filters.to + "T23:59:59")) return false;
    return true;
  });
  const fmtDate = (value) => value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "";
  const yesNoIcon = (value) => value ? <ProgressBadge tone="success">✓</ProgressBadge> : <ProgressBadge tone="danger">✕</ProgressBadge>;
  const updateStatus = (record, status) => {
    onUpdateRecord(record.id, { progress: { ...(record.progress || {}), status } });
  };
  const truncateText = (value, limit = 42) => {
    const text = String(value || "");
    return text.length > limit ? `${text.slice(0, Math.max(0, limit - 3)).trimEnd()}...` : text;
  };
  return (
    <div className="editor-col" style={{ flex: 1 }}>
      <div className="editor-inner progress-list-inner">
        <div className="editor-head">
          <div>
            <span className="editor-head-tag"><Ic.Users size={11} /> Progress</span>
            <h1>Rentals Progress List</h1>
            <p>Submitted event requests appear here. Open a client name to review the request, admin progress, documents, deposits, and internal notes.</p>
          </div>
          <button className="btn dark sm" onClick={onAdd}><Ic.Plus size={13} /> Add Rental Progress</button>
        </div>

        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.35fr .8fr .7fr .7fr .9fr 1fr .9fr auto", gap: 10, alignItems: "end" }}>
            <div><label className="lbl">Client / Org / Email</label><input className="input" value={filters.query} onChange={(e) => updateFilter({ query: e.target.value })} /></div>
            <div><label className="lbl">Space</label><select className="select" value={filters.space} onChange={(e) => updateFilter({ space: e.target.value })}>{spaces.map((space) => <option key={space}>{space}</option>)}</select></div>
            <div><label className="lbl">Bookings From</label><input className="input" type="date" value={filters.from} onChange={(e) => updateFilter({ from: e.target.value })} /></div>
            <div><label className="lbl">Bookings To</label><input className="input" type="date" value={filters.to} onChange={(e) => updateFilter({ to: e.target.value })} /></div>
            <div><label className="lbl">Interest Level</label><select className="select" value={filters.interest} onChange={(e) => updateFilter({ interest: e.target.value })}>{interestOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
            <div><label className="lbl">Status</label><ProgressStatusMultiSelect value={filters.statuses} onChange={(statuses) => updateFilter({ statuses })} /></div>
            <div><label className="lbl">Age</label><select className="select" value={filters.age} onChange={(e) => updateFilter({ age: e.target.value })}>{["Current and New", "All", "New", "Current", "Archived"].map((option) => <option key={option}>{option}</option>)}</select></div>
            <button className="btn dark sm" onClick={() => updateFilter({ ...filters })}>Filter</button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: "var(--ink-3)", fontSize: 12 }}>
          <select className="select" style={{ width: 76 }} defaultValue="25"><option>25</option><option>50</option><option>100</option></select>
          entries per page
        </div>

        <div className="progress-table-shell">
          <table className="progress-list-table">
            <thead>
              <tr>
                {["ID", "Client", "Description", "Submitted Date", "Space", "No. of People", "Booking Date/Time", "Interest Level", "Status", "Signed", "Security Deposit", "Insure", "AGCO License", "Email actions", "Actions"].map((head) => (
                  <th key={head}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((record) => (
                <tr key={record.id}>
                  <td className="progress-id" title={record.id}>{bookingCodeForRecord(record)}</td>
                  <td className="progress-client-cell">
                    {(() => {
                      const completion = progressCompletion(record);
                      const active = isProgressRecordActive(record, now);
                      return (
                        <>
                          <div className="progress-client-name-row">
                            <button type="button" className="progress-client-link" onClick={() => onOpenDetail(record.id)}>
                              {record.client?.name || "Unnamed Client"}
                            </button>
                            {active && <span className="progress-active-badge">Active</span>}
                          </div>
                          {completion.total > 0 && (
                            <div className="progress-completion">
                              <div className="progress-completion-label">{completion.completed}/{completion.total} completed</div>
                              <div className="progress-completion-track"><span style={{ width: `${completion.percent}%` }} /></div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                    {record.client?.email && <div className="progress-subtle">{record.client.email}</div>}
                  </td>
                  <td className="progress-desc-cell" title={record.request?.description || record.request?.eventType || ""}>
                    {truncateText(record.request?.description || record.request?.eventType || "", 36)}
                  </td>
                  <td className="progress-date-cell">{fmtDate(record.submittedAt)}</td>
                  <td><span className={"progress-space-chip " + String(record.request?.space || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}>{record.request?.space || "No space"}</span></td>
                  <td className="progress-number-cell">{record.request?.attendeeCount || ""}</td>
                  <td className="progress-booking-cell" title={formatProgressBookingDateTime(record.request?.bookingDateTime) || ""}>
                    {formatProgressBookingDateTime(record.request?.bookingDateTime) || ""}
                  </td>
                  <td title={record.progress?.interestLevel || ""}>{record.progress?.interestLevel ? <span className="progress-interest-pill">{truncateText(record.progress.interestLevel, 18)}</span> : <span className="progress-subtle">-</span>}</td>
                  <td>
                    <select
                      className={"progress-status-select " + progressStatusClass(normalizeProgressStatus(record.progress?.status))}
                      value={normalizeProgressStatus(record.progress?.status)}
                      onChange={(e) => updateStatus(record, e.target.value)}
                    >
                      {PROGRESS_STATUS_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                    </select>
                    {record.progress?.age && <div className="progress-age">{record.progress.age}</div>}
                  </td>
                  <td className="progress-check-cell">{yesNoIcon(progressAgreementComplete(record.progress || {}))}</td>
                  <td className="progress-money-cell">{record.progress?.securityDepositCost || "TBD"}{record.progress?.securityDepositNote && <div className="progress-subtle">{record.progress.securityDepositNote}</div>}</td>
                  <td className="progress-check-cell">{yesNoIcon(progressInsuranceComplete(record.progress || {}))}</td>
                  <td className="progress-check-cell">{yesNoIcon(progressAgcoLicenseComplete(record.progress || {}))}</td>
                  <td className="progress-email-cell">
                    <div className="progress-email-grid">
                      {EMAIL_TEMPLATE_TYPES.map((type) => {
                        return (
                          <button key={type.id} className={"progress-email-btn " + type.id.replace(/[^a-z0-9]+/g, "-")} title={type.actionLabel} onClick={() => onEmail(record.id, type.id)}>
                            {emailActionLabels[type.id] || type.label}
                          </button>
                        );
                      })}
                    </div>
                    {(record.emails || []).slice(0, 2).map((email, index) => (
                      <div key={index} className="progress-email-log">{email.label}: {email.at}</div>
                    ))}
                  </td>
                  <td className="progress-actions-cell">
                    <div className="progress-row-actions">
                      <button className="btn icon sm" title="Edit in client view" onClick={() => onEditClient(record)}><Ic.Edit size={13} /></button>
                      <button className="btn icon sm" title="Copy client link" onClick={() => onCopyLink(record)}><Ic.Copy size={13} /></button>
                      <button className="btn icon sm danger-ghost" title="Delete progress record" onClick={() => onDelete(record)}><Ic.Trash size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="15" style={{ padding: 24, textAlign: "center", color: "var(--ink-3)" }}>No progress records match the filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function bookingFieldOptionRows(field = {}) {
  const source = field.groupOptions
    ? normalizeSimpleOptionGroups(field.options || []).flatMap((group) => group.options || [])
    : field.options || field.dietaryOptions || [];
  return source.map((option) => typeof option === "string"
    ? { label: option.split("|")[0], description: option.split("|")[1] || "" }
    : { ...option, label: option.label || option.name || "", description: option.description || option.desc || "", image: option.image || option.imageUrl || "" });
}

function bookingOptionSelected(value, label) {
  if (Array.isArray(value)) return value.includes(label);
  if (value && typeof value === "object") {
    if (value.__selected) return value.__selected === label;
    if (value.label || value.value) return (value.label || value.value) === label;
    if (Object.prototype.hasOwnProperty.call(value, label)) return !!value[label] || typeof value[label] === "object";
  }
  return value === label;
}

function BookingReadOnlyRichOptionDetails({ option, selection, guestCount = 0, depth = 0 }) {
  const current = selection && typeof selection === "object" && !Array.isArray(selection) ? selection : {};
  const details = [];
  if (option.peopleLinkedToGuests) details.push(["# of people", guestCount || 0]);
  else if (option.hasPeopleOption) details.push(["# of people", current.__qty_people ?? option.peopleRange?.min ?? 1]);
  if (option.hasHoursOption) details.push(["# of hours", current.__qty_hours ?? option.hoursRange?.min ?? 1]);
  if (option.hasSexOption) details.push(["Sex", current.__sex || "Not specified"]);
  const children = option.subOptions || option.selections || option.specifications || option.options || [];
  const childSource = current.__sub && typeof current.__sub === "object" ? current.__sub : current;
  const configuredChildren = children
    .map((child) => typeof child === "string" ? { label: child } : child)
    .filter((child) => Object.prototype.hasOwnProperty.call(childSource, child.label));
  const configuredLabels = new Set(configuredChildren.map((child) => child.label));
  const selectedChildren = [
    ...configuredChildren,
    ...Object.keys(childSource).filter((key) => !key.startsWith("__") && !configuredLabels.has(key)).map((label) => ({ label })),
  ];
  if (!details.length && !selectedChildren.length) return null;
  return (
    <div style={{ display: "grid", gap: 6, margin: "7px 0 1px 30px", padding: "8px 10px", borderLeft: "3px solid var(--accent)", background: "var(--surface-2, #f7f7f7)", borderRadius: "0 5px 5px 0", fontSize: 12 }}>
      {details.map(([label, answer]) => <div key={label} style={{ display: "grid", gridTemplateColumns: "minmax(90px, auto) 1fr", gap: 8 }}><strong>{label}:</strong><span>{String(answer)}</span></div>)}
      {selectedChildren.map((child) => <div key={child.label} style={{ paddingLeft: depth ? 8 : 0 }}><div style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 700 }}><span className="booking-readonly-choice selected">✓</span><span>{child.label}</span></div><BookingReadOnlyRichOptionDetails option={child} selection={childSource[child.label]} guestCount={guestCount} depth={depth + 1} /></div>)}
    </div>
  );
}

function BookingReadOnlyField({ field, value, previousValue, guestCount = 0 }) {
  if (field.type === "separator") return <div className="booking-readonly-separator" />;
  if (field.type === "instructional") return <div className="booking-readonly-instruction"><strong>{field.label}</strong>{field.fieldDescription && <span>{field.fieldDescription}</span>}</div>;
  const options = bookingFieldOptionRows(field);
  const gallery = (field.galleryImages || (field.galleryImage ? [field.galleryImage] : [])).filter(Boolean);
  const isChoice = ["radio", "multiselect", "dietary"].includes(field.type) && options.length > 0;
  const checked = typeof value === "object" && value !== null ? !!value.on : !!value;
  const isBoolean = ["toggle", "checkbox"].includes(field.type);
  const files = Array.isArray(value) ? value : value ? [value] : [];
  const answer = answerToProgressText(value);
  const previousAnswer = answerToProgressText(previousValue);
  const changed = previousValue !== undefined && JSON.stringify(previousValue ?? null) !== JSON.stringify(value ?? null);
  const displayValue = answer || field.placeholder || "";
  const wide = ["textarea", "radio", "multiselect", "dietary", "checkbox", "toggle", "file", "extras"].includes(field.type) || field.displayAs === "radio";
  return (
    <div className={`booking-readonly-field${wide ? " wide" : ""}`}>
      {isBoolean ? (
        <div className="booking-readonly-boolean">
          <span className={`booking-answer-check${checked ? " checked" : ""}`}>{checked ? "✓" : ""}</span>
          <div><strong>{field.label}{field.required && <span className="cv-req"> *</span>}</strong>{field.fieldDescription && <span>{field.fieldDescription}</span>}{changed && <span className="booking-answer-change-note"><del>{previousValue ? "Selected" : "Not selected"}</del><span>{checked ? "Selected" : "Not selected"}</span></span>}</div>
        </div>
      ) : (
        <>
          <div className="booking-answer-label">{field.label || "Untitled field"}{field.required && <span className="cv-req"> *</span>}</div>
          {field.fieldDescription && <div className="booking-readonly-description">{field.fieldDescription}</div>}
          {gallery.length > 0 && <div className="booking-readonly-gallery">{gallery.map((image, index) => <img key={index} src={image} alt="" />)}</div>}
          {isChoice ? (
            <div className="booking-readonly-options">
              {options.map((option) => {
                const selected = bookingOptionSelected(value, option.label);
                return <div className={`booking-readonly-option${selected ? " selected" : ""}`} key={option.label}>
                  <span className={`booking-readonly-choice${selected ? " selected" : ""}`}>{selected ? "✓" : ""}</span>
                  {option.image && <img src={option.image} alt="" />}
                  <div><strong>{option.label}</strong>{option.description && <small>{option.description}</small>}{selected && <BookingReadOnlyRichOptionDetails option={option} selection={value && typeof value === "object" && !Array.isArray(value) ? value[option.label] : {}} guestCount={guestCount} />}</div>
                </div>;
              })}
            </div>
          ) : field.type === "file" ? (
            <div className="booking-readonly-files">
              {files.length ? files.map((file, index) => {
                const url = typeof file === "string" ? file : file?.url || file?.secureUrl || "";
                const name = typeof file === "string" ? `Uploaded file ${index + 1}` : file?.name || `Uploaded file ${index + 1}`;
                return url ? <a key={index} href={url} target="_blank" rel="noreferrer">{name}</a> : <span key={index}>{name}</span>;
              }) : <span className="booking-answer-control empty">{field.placeholder || "No file uploaded"}</span>}
            </div>
          ) : (
            <div className={`booking-answer-control${!answer ? " empty" : ""}${field.type === "textarea" ? " textarea" : ""}${changed ? " booking-answer-changed" : ""}`}>
              {changed && <del className="booking-answer-previous">{previousAnswer || "No previous value"}</del>}
              <span>{displayValue}</span>
            </div>
          )}
          {isChoice && changed && <div className="booking-answer-change-note"><del>{previousAnswer || "No previous selection"}</del><span>{answer || "No selection"}</span></div>}
        </>
      )}
    </div>
  );
}

function BookingReadOnlyVenue({ step, answers }) {
  const selectedIds = Array.isArray(answers._selectedVenueIds) ? answers._selectedVenueIds : answers._selectedVenueId ? [answers._selectedVenueId] : [];
  const selectedVenues = (step.venues || []).filter((venue) => selectedIds.includes(venue.id));
  return (
    <section className="booking-readonly-section">
      <h2>{step.name}</h2>
      {step.description && <p>{step.description}</p>}
      <div className="booking-readonly-venues">
        {selectedVenues.length ? selectedVenues.map((venue) => {
          const booking = answers._venueBookings?.[venue.id] || {};
          const images = [venue.thumbnail, ...(venue.gallery || [])].filter(Boolean);
          return <article className="booking-readonly-venue" key={venue.id}>
            {images[0] && <img src={images[0]} alt={venue.name} />}
            <div><h3>{venue.name}</h3>{venue.description && <p>{venue.description}</p>}
              <div className="booking-readonly-venue-meta">
                <span>Start: {[booking.startDate, booking.startTime].filter(Boolean).join(" ") || "Not provided"}</span>
                <span>End: {[booking.endDate, booking.endTime].filter(Boolean).join(" ") || "Not provided"}</span>
              </div>
            </div>
          </article>;
        }) : <div className="booking-readonly-empty">No space selected.</div>}
      </div>
    </section>
  );
}

function BookingReadOnlyRentalDetail({ item, value = {} }) {
  const optionGroups = item.optionGroups || [];
  const groupValues = value.optionGroups || {};
  const visibilityValues = rentalOptionGroupVisibilityValues([rentalParentVisibilitySource(item), ...optionGroups], value);
  const showBaseQuantity = !rentalUsesFixedBaseQuantity(item) && (rentalOptionGroupsNeedParentQuantity(item) || !item.hideBaseQuantity);
  return <div className="booking-rental-detail">
    {showBaseQuantity && <div className="booking-rental-control"><label># of {item.name}</label><div className="booking-rental-select">{value.quantity ?? rentalSelectedQuantity(item, value) ?? ""}</div></div>}
    {optionGroups.map((group) => {
      if (!isRentalQuestionVisible(group, [rentalParentVisibilitySource(item), ...optionGroups], visibilityValues)) return null;
      const current = groupValues[group.id];
      const options = (group.options || []).map(normalizeRentalChoiceOption);
      if (["quantity", "number", "select"].includes(group.type)) {
        const valueText = current && typeof current === "object" ? current.label || current.value || "" : current ?? "";
        return <div className="booking-rental-control" key={group.id}><label>{group.label || item.name}</label><div className="booking-rental-select">{valueText}</div></div>;
      }
      if (group.type === "multi_quantity") {
        return <div className="booking-rental-control-group" key={group.id}><label>{group.label}</label>{options.map((option) => {
          const optionId = option.id || option.label;
          return <div className="booking-rental-inline-control" key={optionId}><span>{option.label}</span><div className="booking-rental-select">{current?.[optionId] ?? ""}</div></div>;
        })}</div>;
      }
      const selectedId = current && typeof current === "object" ? current.value : current;
      return <div className="booking-rental-control-group" key={group.id}><label>{group.label || "Select option"}</label>{options.map((option) => {
        const selected = selectedId === (option.id || option.label);
        return <div className={`booking-rental-radio${selected ? " selected" : ""}`} key={option.id || option.label}><span className={`booking-readonly-choice${selected ? " selected" : ""}`}>{selected ? "✓" : ""}</span><span>{option.label}</span></div>;
      })}</div>;
    })}
  </div>;
}

function BookingReadOnlyRentals({ step, answers, showHeading = true }) {
  const fields = (step.fields || []).filter((field) => field.type === "rental_group" && field.visibleToClient !== false);
  if (!fields.length) return null;
  const root = answers.__rentalGroups?.[step.id] || {};
  const scopes = root.__byVenue ? Object.entries(root.__byVenue).map(([venueId, state]) => ({ venueId, state })) : [{ venueId: "", state: root }];
  const content = <>
    {fields.map((field) => {
      const itemRows = scopes.flatMap(({ venueId, state }) => {
        const current = state?.[field.id] || {};
        const items = workflowRentalCatalogItems(field.rentalGroup || field.label, venueId);
        const selectedIds = Object.keys(current.selectedItems || {});
        if (current.groupSelected && selectedIds.length === 0 && items.length === 1) selectedIds.push(items[0].id);
        return items.map((item) => ({ item, current, selected: selectedIds.includes(item.id), key: `${venueId}:${item.id}` }));
      });
      const selectedItems = itemRows.filter((row) => row.selected);
      return <div className="booking-readonly-rental-group" key={field.id}>
        <h3>{field.label}</h3>{field.fieldDescription && <p>{field.fieldDescription}</p>}
        <div className="booking-readonly-rental-grid">{itemRows.map(({ item, current, selected, key }) => {
          const image = rentalItemImage(item);
          const hasDetail = selected && rentalItemNeedsDetail(item);
          return <article className={`booking-readonly-rental-card${selected ? " selected" : ""}`} key={key}>
            <div className="booking-rental-row-summary">
              <span className={`booking-rental-card-check${selected ? " selected" : ""}`}>{selected ? "✓" : ""}</span>
              {image ? <img src={image} alt={item.name} /> : <div className="booking-readonly-rental-image">{item.name}</div>}
              <div><strong>{item.name}</strong>{item.description && <p>{item.description}</p>}</div>
              <span className="booking-rental-card-price">{workflowRentalPriceLabel(item)}</span>
            </div>
            {hasDetail && <BookingReadOnlyRentalDetail item={item} value={current.itemValues?.[item.id] || {}} />}
          </article>;
        })}</div>
        {!selectedItems.length && <div className="booking-readonly-empty">No items selected.</div>}
      </div>;
    })}
  </>;
  return showHeading ? <section className="booking-readonly-section"><h2>{step.name}</h2>{step.description && <p>{step.description}</p>}{content}</section> : <div className="booking-readonly-rentals">{content}</div>;
}

function BookingReadOnlyCostSummary({ costs = {} }) {
  const fmt = (value) => "$" + Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const splitContent = splitSpaceContentCost(costs);
  const rows = [
    ["Space Rental", costs.spaceRentalTotal], ["Space Content Rentals", splitContent.rentalsTotal], ["Space Extra Costs", splitContent.extrasTotal],
    ["Catering Cost", costs.cateringTotal], ["Set up Service Cost", costs.setupTotal], ["Event Service Cost", costs.eventTotal], ["Clear up Service Cost", costs.cleanupTotal],
  ];
  return <section className="booking-readonly-costs"><h2>Summary of Cost</h2>
    {rows.map(([label, value]) => <div className="booking-readonly-cost-row" key={label}><span>{label}</span><strong>{fmt(value)}</strong></div>)}
    {summaryDiscountRows(costs).map((row) => <div className="booking-readonly-cost-row" key={row.id}><span>{row.label}</span><strong>{fmt(row.total)}</strong></div>)}
    <div className="booking-readonly-cost-row subtotal"><span>Subtotal</span><strong>{fmt(costSubtotalForDisplay(costs))}</strong></div>
    {(costs.feeLines || []).map((fee) => <div className="booking-readonly-cost-row" key={fee.id || fee.label}><span>{fee.displayLabel || fee.label}</span><strong>{fmt(fee.total)}</strong></div>)}
    <div className="booking-readonly-cost-row total"><span>Total</span><strong>{fmt(costs.total)}</strong></div>
    <div className="booking-readonly-cost-row"><span>Security Deposit (refundable)</span><strong>{fmt(costs.securityDeposit)}</strong></div>
    <div className="booking-readonly-cost-row final"><span>Total with Security Deposit</span><strong>{fmt(costs.totalWithDeposit)}</strong></div>
  </section>;
}

function ClientBookingAnswersView({ record, steps = [], previousRecord = null }) {
  if (!record) return null;
  const answers = record.answers || {};
  const guestCount = window.findGuestCount ? window.findGuestCount(steps, answers) : Number(record.request?.attendeeCount || 0);
  return <div className="booking-answers-page">
    <h1>Space Rental Request</h1>
    {steps.map((step) => {
      if (step.stepType === "venue") return <BookingReadOnlyVenue key={step.id} step={step} answers={answers} />;
      if (step.stepType === "layout") return <BookingReadOnlyRentals key={step.id} step={step} answers={answers} />;
      return <section className="booking-readonly-section" key={step.id}><h2>{step.name}</h2>{step.description && <p>{step.description}</p>}
        <div className="booking-answers-form">
          {(step.fields || []).filter((field) => field.visibleToClient !== false && field.type !== "rental_group").map((field) => <BookingReadOnlyField key={field.id} field={field} value={answers[field.id]} previousValue={previousRecord?.answers?.[field.id]} guestCount={guestCount} />)}
          {(step.checkout?.agreements || []).map((agreement) => <BookingReadOnlyField key={agreement.id} field={{ label: agreement.label, type: "checkbox", required: agreement.required !== false }} value={!!answers.__checkoutAgreements?.[step.id]?.[agreement.id]} previousValue={previousRecord ? !!previousRecord.answers?.__checkoutAgreements?.[step.id]?.[agreement.id] : undefined} guestCount={guestCount} />)}
        </div>
        <BookingReadOnlyRentals step={step} answers={answers} showHeading={false} />
      </section>;
    })}
    <BookingReadOnlyCostSummary costs={record.costs || {}} />
  </div>;
}

function AdminBookingAnswersView({ record, steps = [], onBack }) {
  return <div className="editor-col booking-answers-admin-view">
    <div className="booking-answers-admin-toolbar"><button className="btn sm" type="button" onClick={onBack}>Back to Space Client Detailed Progress</button></div>
    <ClientBookingAnswersView record={record} steps={steps} />
  </div>;
}

function ProgressLayoutInstructions({ layouts = [] }) {
  if (!layouts.length) return <div className="rental-muted">No floor layout details were submitted.</div>;
  return (
    <div style={{ display: "grid", gap: 18 }}>
      {layouts.map((layout) => {
        const uploadedImage = /^data:image\//i.test(layout.fileData || "");
        return (
          <section key={layout.areaId} style={{ display: "grid", gap: 9 }}>
            <div style={{ fontWeight: 800 }}>{layout.areaName}:</div>
            <div><b>Layout Instructions:</b> {layout.layoutName}</div>
            {layout.image && <img src={layout.image} alt={`${layout.layoutName} floor plan`} style={{ display: "block", width: "100%", maxWidth: 660, maxHeight: 480, objectFit: "contain", border: "1px solid var(--line)", borderRadius: 6 }} />}
            {layout.fileName && (
              <div>
                <b>Uploaded Floor Layout:</b>{" "}
                {layout.fileData ? <a href={layout.fileData} download={layout.fileName}>{layout.fileName}</a> : <span>{layout.fileName}</span>}
              </div>
            )}
            {uploadedImage && <img src={layout.fileData} alt={layout.fileName || "Uploaded floor layout"} style={{ display: "block", width: "100%", maxWidth: 660, maxHeight: 480, objectFit: "contain", border: "1px solid var(--line)", borderRadius: 6 }} />}
            {layout.instructions && <div><b>Floor Layout Instructions:</b><div style={{ marginTop: 3, whiteSpace: "pre-wrap" }}>{layout.instructions}</div></div>}
          </section>
        );
      })}
    </div>
  );
}

function ProgressCateringSpecifics({ costs = {}, steps = [], answers = {} }) {
  const cateringStep = (steps || []).find((step) => String(step.name || "").trim().toLowerCase() === "catering");
  const fields = cateringStep?.fields || [];
  const fieldByLabel = (label) => fields.find((field) => String(field.label || "").trim().toLowerCase() === label);
  const cateringRequirement = fieldByLabel("do you require catering?");
  const cateringDetails = fields.find((field) => String(field.label || "").trim().toLowerCase().startsWith("catering specifics"));
  const deliveryTime = fieldByLabel("catering delivery time");
  const dietaryRestrictions = fieldByLabel("dietary restrictions");
  const cateringRequirementText = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return answerToProgressText(value);
    return Object.entries(value)
      .filter(([key]) => !key.startsWith("__"))
      .map(([label, selections]) => {
        if (selections === true || !selections || typeof selections !== "object") return label;
        const selectedLabels = Object.keys(selections).filter((key) => !key.startsWith("__"));
        return selectedLabels.length ? `${label}: ${selectedLabels.join(", ")}` : label;
      })
      .join(", ");
  };
  const cateringRequirementValue = cateringRequirement ? cateringRequirementText(answers[cateringRequirement.id]) : "";
  const cateringDetailsValue = cateringDetails ? answerToProgressText(answers[cateringDetails.id]) : "";
  const deliveryTimeValue = deliveryTime ? answerToProgressText(answers[deliveryTime.id]) : "";
  const dietaryRestrictionsValue = dietaryRestrictions ? answerToProgressText(answers[dietaryRestrictions.id]) : "";
  const formatTime = (value) => {
    const match = String(value || "").match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return value;
    const hour = Number(match[1]);
    return `${((hour + 11) % 12) + 1}:${match[2]} ${hour >= 12 ? "PM" : "AM"}`;
  };
  // Older submissions showed the time control's 2:00 PM default without storing it.
  const deliveryTimeDisplay = deliveryTimeValue || (/^yes\b/i.test(cateringRequirementValue) ? "14:00" : "");
  const selectedPackageFields = fields.filter((field) => {
    const label = String(field.label || "").toLowerCase();
    return !/require catering|catering specifics|delivery time|dietary restrictions/.test(label) && answerToProgressText(answers[field.id]);
  });
  const pricedPackages = costs.cateringLines || [];
  const unpricedPackages = selectedPackageFields
    .filter((field) => !pricedPackages.some((line) => String(line.label || "").toLowerCase().startsWith(String(field.label || "").toLowerCase())))
    .map((field) => ({ label: `${field.label}: ${answerToProgressText(answers[field.id])}`, total: null }));
  const packages = [...pricedPackages, ...unpricedPackages];
  const fmt = (value) => "$" + Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div>Catering Total Amount: <b>{fmt(costs.cateringTotal)}</b></div>
      {packages.length > 0 && (
        <ul style={{ display: "grid", gap: 4, margin: 0, paddingLeft: 20 }}>
          {packages.map((item, index) => <li key={`${item.id || item.label}-${index}`}><b>{item.label}</b>{item.total !== null && item.total !== undefined && ` — ${fmt(item.total)}`}</li>)}
        </ul>
      )}
      <div>Catering Specifics: {cateringRequirementValue || "Not set"}</div>
      {cateringDetailsValue && <div><b>{cateringDetails.label}:</b><div style={{ marginTop: 3, whiteSpace: "pre-wrap" }}>{cateringDetailsValue}</div></div>}
      <div>Catering Delivery Time: {formatTime(deliveryTimeDisplay) || "Not set"}</div>
      <div>Dietary Restrictions: {dietaryRestrictionsValue || "None specified"}</div>
    </div>
  );
}

function ProgressAdditionalServices({ costs = {}, steps = [], answers = {} }) {
  const servicesStep = (steps || []).find((step) => String(step.name || "").trim().toLowerCase() === "additional services");
  const fields = servicesStep?.fields || [];
  const serviceFields = fields.filter((field) => /set up services|event services|clean-up services/i.test(field.label || ""));
  const thirdPartyField = fields.find((field) => /3rd party services/i.test(field.label || ""));
  const notesField = fields.find((field) => String(field.label || "").trim().toLowerCase() === "notes");
  const costLines = [...(costs.setupLines || []), ...(costs.eventLines || []), ...(costs.cleanupLines || [])];
  const guestCount = window.findGuestCount ? window.findGuestCount(steps, answers) : 0;
  const selectedOptions = (field) => {
    const value = answers[field.id];
    const options = (field.options || []).map((option) => typeof option === "string" ? { label: option } : option);
    const selectedLabels = Array.isArray(value)
      ? value
      : typeof value === "string"
      ? [value]
      : value && typeof value === "object"
      ? Object.keys(value).filter((key) => !key.startsWith("__"))
      : [];
    return options
      .filter((option) => selectedLabels.includes(option.label))
      .map((option) => ({ option, selection: value && typeof value === "object" && !Array.isArray(value) ? value[option.label] || {} : {} }));
  };
  const priceFor = (field, option) => costLines.find((line) => {
    const label = String(line.label || "").toLowerCase();
    return label.includes(String(option.label || "").toLowerCase()) && (label.includes(String(field.label || "").toLowerCase()) || !field.label);
  });
  const selectedServicesByField = serviceFields.map((field) => ({
    field,
    services: selectedOptions(field).map(({ option, selection }) => ({ option, selection, line: priceFor(field, option) })),
  })).filter((group) => group.services.length > 0);
  const thirdPartyServices = Array.from(new Map(selectedOptions(thirdPartyField || {}).map((service) => [service.option.label, service])).values());
  const eventNotes = notesField ? answerToProgressText(answers[notesField.id]) : "";
  const fmt = (value) => "$" + Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const detailsFor = (option, selection) => {
    const details = [];
    if (option.peopleLinkedToGuests) details.push(`# of people: ${guestCount || 0}`);
    else if (option.hasPeopleOption) details.push(`# of people: ${selection.__qty_people || option.peopleRange?.min || 1}`);
    if (option.hasHoursOption) details.push(`# of hours: ${selection.__qty_hours || option.hoursRange?.min || 1}`);
    if (option.hasSexOption && selection.__sex) details.push(`Sex: ${selection.__sex}`);
    return details;
  };
  const selectedSubOptions = (option, selection) => {
    const childItems = option.subOptions || option.selections || option.specifications || option.options || [];
    if (!selection || typeof selection !== "object" || Array.isArray(selection)) return [];
    const configuredSelections = childItems
      .map((child) => typeof child === "string" ? { label: child } : child)
      .filter((child) => Object.prototype.hasOwnProperty.call(selection, child.label))
      .map((child) => {
        const nested = selectedSubOptions(child, selection[child.label]);
        return nested.length ? `${child.label}: ${nested.join(", ")}` : child.label;
      });
    if (configuredSelections.length) return configuredSelections;
    const rawSelectionLabels = (value) => {
      if (Array.isArray(value)) return value.flatMap(rawSelectionLabels);
      if (!value || typeof value !== "object") return value === true ? [] : [String(value)];
      const source = value.__sub && typeof value.__sub === "object" ? value.__sub : value;
      return Object.entries(source)
        .filter(([key]) => !key.startsWith("__"))
        .flatMap(([label, nestedValue]) => {
          if (nestedValue === true || nestedValue === "" || nestedValue == null) return [label];
          if (typeof nestedValue === "object") {
            const nested = rawSelectionLabels(nestedValue);
            return nested.length ? [`${label}: ${nested.join(", ")}`] : [label];
          }
          return [`${label}: ${nestedValue}`];
        });
    };
    return rawSelectionLabels(selection);
  };
  if (!selectedServicesByField.length && !thirdPartyServices.length && !eventNotes) return <div className="rental-muted">No additional services selected.</div>;
  const ServiceCard = ({ title, children }) => <section style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
    <div style={{ borderBottom: "1px solid var(--line)", fontWeight: 800, fontSize: 15, padding: "9px 12px" }}>{title}</div>
    <div style={{ padding: "10px 14px 11px" }}>{children}</div>
  </section>;
  return (
    <div style={{ display: "grid", gap: 12, fontSize: 13, lineHeight: 1.35 }}>
      {selectedServicesByField.map(({ field, services }) => (
        <ServiceCard key={field.id} title={field.label}>
          <ul style={{ display: "grid", gap: 7, margin: 0, paddingLeft: 16 }}>
            {services.map(({ option, selection, line }) => {
              const details = detailsFor(option, selection);
              const subOptionDetails = [line?.meta, ...(selection.__sex ? [`Sex: ${selection.__sex}`] : []), ...(!line?.meta ? details : [])].filter(Boolean).join(" · ");
              return <li key={option.label} style={{ paddingLeft: 1 }}>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 12, alignItems: "baseline" }}>
                  <b>{field.label}: {option.label}</b>
                  <b style={{ whiteSpace: "nowrap" }}>{line ? (line.total ? fmt(line.total) : "$0.00") : "Included"}</b>
                </div>
                {subOptionDetails && <div style={{ color: "var(--ink-2)", fontSize: 12, marginTop: 2 }}>{subOptionDetails}</div>}
              </li>;
            })}
          </ul>
          {field.label === "Event Services" && eventNotes && <div style={{ marginTop: 8 }}><b>Event Services Notes:</b><div style={{ marginTop: 3, whiteSpace: "pre-wrap" }}>{eventNotes}</div></div>}
        </ServiceCard>
      ))}
      {!selectedServicesByField.some((group) => group.field.label === "Event Services") && eventNotes && <div><b>Event Services Notes:</b><div style={{ marginTop: 3, whiteSpace: "pre-wrap" }}>{eventNotes}</div></div>}
      {thirdPartyServices.length > 0 && (
        <ServiceCard title="3rd Party Services">
          <ul style={{ display: "grid", gap: 7, margin: 0, paddingLeft: 16 }}>
            {thirdPartyServices.map(({ option, selection }) => {
              const subOptions = selectedSubOptions(option, selection);
              const controlAnswers = detailsFor(option, selection);
              return <li key={option.label} style={{ paddingLeft: 1 }}>
                <b>3rd Party Services: {option.label}</b>
                {[...controlAnswers, ...subOptions].length > 0 && <div style={{ color: "var(--ink-2)", fontSize: 12, marginTop: 2 }}>{[...controlAnswers, ...subOptions].join(" · ")}</div>}
              </li>;
            })}
          </ul>
        </ServiceCard>
      )}
    </div>
  );
}

function bookingAuditValueText(value) {
  if (value === null || value === undefined || value === "") return "No value";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return answerToProgressText(value) || JSON.stringify(value);
}

function bookingAuditFormChanges(before = {}, after = {}, steps = []) {
  const rows = [];
  const add = (section, label, oldValue, newValue) => {
    if (JSON.stringify(oldValue ?? null) !== JSON.stringify(newValue ?? null)) rows.push({ section, label, before: oldValue, after: newValue });
  };
  const labels = {
    client: { name: "Client name", organization: "Organization", email: "Email", phone: "Phone number" },
    request: { eventPrivacy: "Event privacy", eventType: "Event type", alcoholOnSite: "Alcohol on site", attendeeCount: "Expected attendees", description: "Event description", space: "Space", bookingDateTime: "Booking date and time", guestsArrival: "Guest arrival time", noOneOnSite: "Time with nobody on site" },
    costs: { spaceRentalTotal: "Space rental", spaceContentTotal: "Content rentals", cateringTotal: "Catering", setupTotal: "Set-up services", eventTotal: "Event services", cleanupTotal: "Clean-up services", subtotal: "Subtotal", total: "Total", securityDeposit: "Security deposit", totalWithDeposit: "Total with security deposit" },
  };
  ["client", "request", "costs"].forEach((section) => Object.entries(labels[section]).forEach(([key, label]) => add(section, label, before?.[section]?.[key], after?.[section]?.[key])));
  const fields = (steps || []).flatMap((step) => step.fields || []).filter((field) => field.visibleToClient !== false && !["separator", "instructional", "rental_group"].includes(field.type));
  fields.forEach((field) => add("Form answers", field.label || "Untitled field", before?.answers?.[field.id], after?.answers?.[field.id]));
  add("Form answers", "Selected space", before?.answers?._selectedVenueId || before?.answers?._selectedVenueIds, after?.answers?._selectedVenueId || after?.answers?._selectedVenueIds);
  return rows;
}

function BookingAuditModal({ audit, steps = [], onClose }) {
  const Ic = window.Icons;
  const before = audit?.before;
  const after = audit?.after;
  const hasSnapshot = before && after;
  const hasDisplayChanges = Array.isArray(audit?.displayChanges) && audit.displayChanges.length > 0;
  const formChanges = hasDisplayChanges
    ? audit.displayChanges
    : hasSnapshot ? bookingAuditFormChanges(before, after, steps) : [];
  return (
    <div className="rec-overlay" onClick={onClose}>
      <div className="rec-modal" onClick={(e) => e.stopPropagation()} style={{ width: 1060, maxWidth: "calc(100vw - 32px)", maxHeight: "calc(100vh - 32px)", overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div><h3 style={{ margin: 0 }}>Booking form change</h3><div className="sub" style={{ marginBottom: 0 }}>{audit?.adminUser || "Admin"} · {audit?.editedAt ? new Date(audit.editedAt).toLocaleString() : "Date unavailable"}</div></div>
          <button className="btn icon sm" type="button" onClick={onClose} title="Close"><Ic.Close size={14} /></button>
        </div>
        {!hasSnapshot && !hasDisplayChanges ? <div className="rental-muted">This older log entry does not include saved field-level changes.</div> : <>
          <div style={{ display: "grid", gap: 8, marginBottom: 18 }}>
            <div style={{ fontWeight: 800 }}>All booking form fields</div>
            <div style={{ fontSize: 12, color: "var(--ink-2)" }}>Every field is listed with its Before and After answer. Changed rows are highlighted in yellow and the original answer is crossed out.</div>
            {formChanges.length ? formChanges.map((change, index) => {
              const changed = change.changed !== undefined ? !!change.changed : JSON.stringify(change.before ?? null) !== JSON.stringify(change.after ?? null);
              const BeforeTag = changed ? "del" : "span";
              return <div key={`${change.section}-${change.label}-${index}`} style={{ display: "grid", gridTemplateColumns: "minmax(170px, .65fr) 1fr 28px 1fr", gap: 10, alignItems: "center", border: `1px solid ${changed ? "#e4bd52" : "var(--line)"}`, borderRadius: 6, padding: "10px 12px", fontSize: 13, background: changed ? "#fffaf0" : "#fff" }}><div><strong>{change.label}</strong><div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{change.section} · {changed ? "Changed" : "Unchanged"}</div></div><BeforeTag style={{ color: changed ? "var(--ink-3)" : "var(--ink-2)", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{bookingAuditValueText(change.before)}</BeforeTag><span style={{ color: "var(--ink-3)", textAlign: "center" }}>→</span><span style={{ background: changed ? "#fff0c7" : "transparent", borderRadius: 3, padding: "3px 5px", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{bookingAuditValueText(change.after)}</span></div>;
            }) : <div className="rental-muted">This log entry does not contain booking form fields.</div>}
          </div>
        </>}
      </div>
    </div>
  );
}

function ProgressDetailView({ record, steps = [], onBack, onUpdate, onViewBookingAnswers, onViewSubmittedAnswers, onEditClient, onSave }) {
  const Ic = window.Icons;
  const [costBreakdown, setCostBreakdown] = React.useState(null);
  const [selectedAudit, setSelectedAudit] = React.useState(null);
  const [logPage, setLogPage] = React.useState(1);
  const logPageSize = 10;
  const logEntries = record?.log || [];
  const logPageCount = Math.max(1, Math.ceil(logEntries.length / logPageSize));
  const visibleLogEntries = logEntries.slice((logPage - 1) * logPageSize, logPage * logPageSize);
  React.useEffect(() => {
    setLogPage(1);
  }, [record?.id, logEntries.length]);
  React.useEffect(() => {
    if (logPage > logPageCount) setLogPage(logPageCount);
  }, [logPage, logPageCount]);
  if (!record) return null;
  const patch = (section, patchValue) => onUpdate(record.id, { [section]: { ...(record[section] || {}), ...patchValue } });
  const patchProgress = (patchValue) => patch("progress", patchValue);
  const patchAdmin = (patchValue) => patch("adminSections", patchValue);
  const updateCosts = (costs) => onUpdate(record.id, { costs });
  const layoutSelections = (record.layoutSelections || []).length ? record.layoutSelections : layoutSelectionsFromAnswers(steps, record.answers || {});
  const additionalInfoStep = (steps || []).find((step) => String(step.name || "").trim().toLowerCase() === "additional info");
  const specialNotesField = (additionalInfoStep?.fields || []).find((field) => String(field.label || "").trim().toLowerCase() === "special notes");
  const specialNotes = specialNotesField
    ? answerToProgressText(record.answers?.[specialNotesField.id])
    : (record.answerSummary || []).find((row) => String(row.label || "").trim().toLowerCase() === "special notes")?.value || "";
  const sectionTitle = (title) => <div style={{ background: "var(--ink)", color: "#fff", padding: "7px 10px", fontWeight: 800, borderRadius: "6px 6px 0 0", marginTop: 16 }}>{title}</div>;
  const line = (label, value) => value ? <div className="progress-request-line"><b>{label}:</b><span>{value}</span></div> : null;
  const agcoStatus = record.progress?.agcoLicenseStatus || (record.progress?.agcoLicense ? "Obtained" : "Not Received");
  const insuranceStatus = record.progress?.insuranceStatus || (record.progress?.insurance ? "Obtained DUUO" : "Not Received");
  const agreementStatus = record.progress?.agreement === "Signed" ? "Signed" : "Not Signed";
  const agcoNeedsFile = agcoStatus === "Obtained";
  const insuranceNeedsFile = ["Obtained DUUO", "Client has own"].includes(insuranceStatus);
  const agreementNeedsFile = agreementStatus === "Signed";
  const updateAgcoStatus = (status) => patchProgress({
    agcoLicenseStatus: status,
    agcoLicense: status === "Obtained" && progressHasUploadedFile(record.progress?.agcoLicenseFile),
  });
  const updateInsuranceStatus = (status) => patchProgress({
    insuranceStatus: status,
    insurance: ["Obtained DUUO", "Client has own"].includes(status) && progressHasUploadedFile(record.progress?.insuranceFile),
  });
  const updateAgcoFile = (file) => patchProgress({
    agcoLicenseFile: file,
    agcoLicense: agcoStatus === "Obtained" && progressHasUploadedFile(file),
  });
  const updateInsuranceFile = (file) => patchProgress({
    insuranceFile: file,
    insurance: insuranceNeedsFile && progressHasUploadedFile(file),
  });
  const updateAgreementStatus = (status) => patchProgress({
    agreement: status,
    signed: status === "Signed" && progressHasUploadedFile(record.progress?.agreementFile),
  });
  const updateAgreementFile = (file) => patchProgress({
    agreementFile: file,
    signed: agreementStatus === "Signed" && progressHasUploadedFile(file),
  });
  const printProgress = () => {
    const previousTitle = document.title;
    document.title = `Space Client Detailed Progress - ${record.client?.name || bookingCodeForRecord(record)}`;
    window.print();
    window.setTimeout(() => { document.title = previousTitle; }, 0);
  };
  return (
    <div className="editor-col progress-detail-view" style={{ flex: 1 }}>
      <div className="editor-inner">
        <div className="editor-head">
          <div>
            <span className="editor-head-tag"><Ic.Users size={11} /> Booking ID {bookingCodeForRecord(record)}</span>
            <h1>Space Client Detailed Progress</h1>
            <p>Review the submitted request and maintain internal progress details for this client.</p>
          </div>
          <button className="btn sm" onClick={onBack}>Back to list</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
          <div className="progress-detail-print-include">
            {sectionTitle("Client")}
            <div style={{ border: "1px solid var(--line)", borderTop: 0, borderRadius: "0 0 8px 8px", padding: 14, display: "grid", gap: 10 }}>
              <div className="progress-client-contact">
              <div><b>{record.client?.name}</b></div>
              <div>{record.client?.phone}</div>
              <div>{record.client?.email}</div>
              </div>
              <div className="progress-client-admin-details">
              <button className="btn sm" style={{ justifySelf: "start", color: "var(--accent)" }}>Check/Create Nexudus User</button>
              <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
                <label className="lbl">Interest Level</label>
                <select className="select" value={record.progress?.interestLevel || ""} onChange={(e) => patchProgress({ interestLevel: e.target.value })}>
                  {["", "Unlikely", "Not sure", "Likely", "Very Likely"].map((option) => <option key={option} value={option}>{option || "Select one"}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Status</label>
                <select className={"select progress-status-select " + progressStatusClass(normalizeProgressStatus(record.progress?.status))} value={normalizeProgressStatus(record.progress?.status)} onChange={(e) => patchProgress({ status: e.target.value })}>
                  {PROGRESS_STATUS_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                  <label className="lbl" style={{ margin: 0 }}>Source</label>
                  <span style={{ fontSize: 12, color: "var(--ink-2)" }}><b style={{ color: "var(--ink)" }}>Created by:</b> {record.progress?.createdBy || "Admin"}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px 16px" }}>
                  {["Walk-In", "Phone", "Collaburo site", "Kijiji", "Social Media", "Eventective", "Giggster", "Wedding Wire", "Liquidspace", "Coworker", "Desana", "Just Boardrooms", "Returning Client", "Friend", "Other"].map((source) => (
                    <label className="chk" key={source} style={{ whiteSpace: "nowrap" }}>
                      <input type="radio" name={`source-${record.id}`} checked={(record.progress?.source || "") === source} onChange={() => patchProgress({ source })} /> {source}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="lbl">Internal Notes</label>
                <textarea className="textarea" rows={4} value={record.progress?.internalNotes || ""} onChange={(e) => patchProgress({ internalNotes: e.target.value })} />
              </div>
              </div>
            </div>
          </div>

          <div>
            <div className="progress-detail-print-exclude">
            {sectionTitle("Status")}
            <div style={{ border: "1px solid var(--line)", borderTop: 0, borderRadius: "0 0 8px 8px", padding: 14, display: "grid", gridTemplateColumns: "1fr", gap: 10, justifyItems: "stretch", textAlign: "left" }}>
              {[
                ["infoComplete", "Info given Complete?"],
                ["lockedForUser", "Lock Form for User"],
              ].map(([key, label]) => (
                <div className="progress-status-check-row" key={key}>
                  <label className="chk"><input type="checkbox" checked={!!record.progress?.[key]} onChange={(e) => patchProgress({ [key]: e.target.checked })} /> {label}</label>
                  {key === "infoComplete" && (
                    <span className="progress-status-actions">
                      <button className="btn icon sm" type="button" title="View client booking answers" aria-label="View client booking answers" onClick={() => onViewBookingAnswers?.(record)}><Ic.Eye size={13} /></button>
                      <button className="btn icon sm" type="button" title="Open client booking in admin edit mode" aria-label="Open client booking in admin edit mode" onClick={() => onEditClient?.(record)}><Ic.Edit size={13} /></button>
                    </span>
                  )}
                </div>
              ))}
              <div>
                <label className="lbl">AGCO License</label>
                <div className="progress-document-row">
                  <select className="select" value={agcoStatus} onChange={(e) => updateAgcoStatus(e.target.value)}>
                    {AGCO_LICENSE_STATUS_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                  </select>
                  {agcoNeedsFile && (
                    <CVFileUploadField
                      field={{ acceptedFiles: DOCUMENT_UPLOAD_ACCEPT }}
                      value={record.progress?.agcoLicenseFile || null}
                      onChange={updateAgcoFile}
                      compact
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="lbl">Insurance</label>
                <div className="progress-document-row">
                  <select className="select" value={insuranceStatus} onChange={(e) => updateInsuranceStatus(e.target.value)}>
                    {INSURANCE_STATUS_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                  </select>
                  {insuranceNeedsFile && (
                    <CVFileUploadField
                      field={{ acceptedFiles: DOCUMENT_UPLOAD_ACCEPT }}
                      value={record.progress?.insuranceFile || null}
                      onChange={updateInsuranceFile}
                      compact
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="lbl">Agreement Signed</label>
                <div className="progress-document-row">
                  <select className="select" value={agreementStatus} onChange={(e) => updateAgreementStatus(e.target.value)}>
                    {AGREEMENT_STATUS_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                  </select>
                  {agreementNeedsFile && (
                    <CVFileUploadField
                      field={{ acceptedFiles: DOCUMENT_UPLOAD_ACCEPT }}
                      value={record.progress?.agreementFile || null}
                      onChange={updateAgreementFile}
                      compact
                    />
                  )}
                </div>
              </div>
              <div><label className="lbl">Generate Contract</label><select className="select" value={record.progress?.contract || "Not Generated"} onChange={(e) => patchProgress({ contract: e.target.value })}>{["Not Generated", "Generated", "Sent"].map((o) => <option key={o}>{o}</option>)}</select></div>
            </div>

            </div>
            <div className="progress-detail-print-exclude">
            {sectionTitle("Security Deposit")}
            <div style={{ border: "1px solid var(--line)", borderTop: 0, borderRadius: "0 0 8px 8px", padding: 14 }}>
              <label className="lbl">Security Deposit Cost</label>
              <input className="input" value={record.progress?.securityDepositCost || ""} onChange={(e) => patchProgress({ securityDepositCost: e.target.value })} />
            </div>
            </div>
          </div>
        </div>

        <div className="progress-detail-print-exclude">
        {sectionTitle("Records")}
        <div style={{ border: "1px solid var(--line)", borderTop: 0, borderRadius: "0 0 8px 8px", padding: 14, display: "grid", gap: 10 }}>
          <label className="chk"><input type="checkbox" checked={!!record.progress?.accessibleByRecordLink} onChange={(e) => patchProgress({ accessibleByRecordLink: e.target.checked })} /> Accessible using Record Link</label>
          <div><label className="lbl">Issues</label><textarea className="textarea" rows={4} value={record.progress?.issues || ""} onChange={(e) => patchProgress({ issues: e.target.value })} /></div>
          <div><label className="lbl">Attachments</label><input type="file" multiple /></div>
        </div>
        </div>

        <div className="progress-detail-print-include">
        {sectionTitle("Request")}
        <div style={{ border: "1px solid var(--line)", borderTop: 0, borderRadius: "0 0 8px 8px", padding: 14 }}>
          <div className="progress-request-list" style={{ fontSize: 13, lineHeight: 1.45 }}>
            {line("Event Privacy", record.request?.eventPrivacy)}
            {line("Event Type", record.request?.eventType)}
            {line("Alcohol on Site", record.request?.alcoholOnSite)}
            {line("Expected Number of Attendees", record.request?.attendeeCount)}
            {line("Brief Description of Event", record.request?.description)}
            {line("Space", record.request?.space)}
            {line("Booking Date", formatProgressBookingDateTime(record.request?.bookingDateTime))}
            {line("Guests arriving at", record.request?.guestsArrival)}
            {line("Period of time no one is on site during booking", record.request?.noOneOnSite)}
            <button className="btn sm" type="button" style={{ marginTop: 4 }} onClick={() => onViewSubmittedAnswers?.(record)}>View Submitted Answers</button>
          </div>
          <ProgressRequestSelections costs={record.costs} />
        </div>
        </div>

        <div className="progress-detail-print-include">
        {sectionTitle("Summary of Cost")}
        <ProgressCostSummary costs={record.costs} onOpenBreakdown={setCostBreakdown} onChange={updateCosts} showTitle={false} />
        </div>

        <div className="progress-detail-print-include">
        {sectionTitle("Instructions")}
        <div style={{ border: "1px solid var(--line)", borderTop: 0, borderRadius: "0 0 8px 8px", padding: 14 }}>
          <ProgressLayoutInstructions layouts={layoutSelections} />
        </div>
        </div>

        <div className="progress-detail-print-include">
        {sectionTitle("Special Notes")}
        <div style={{ border: "1px solid var(--line)", borderTop: 0, borderRadius: "0 0 8px 8px", padding: 14, whiteSpace: "pre-wrap" }}>
          {specialNotes || <span className="rental-muted">No special notes submitted.</span>}
        </div>
        </div>

        <div className="progress-detail-print-include">
        {sectionTitle("Catering Specifics")}
        <div style={{ border: "1px solid var(--line)", borderTop: 0, borderRadius: "0 0 8px 8px", padding: 14 }}>
          <ProgressCateringSpecifics costs={record.costs} steps={steps} answers={record.answers || {}} />
        </div>
        </div>

        <div className="progress-detail-print-include">
        {sectionTitle("Set up / Event / Clear up Services")}
        <div style={{ border: "1px solid var(--line)", borderTop: 0, borderRadius: "0 0 8px 8px", padding: 14 }}>
          <ProgressAdditionalServices costs={record.costs} steps={steps} answers={record.answers || {}} />
        </div>
        </div>

        <div className="progress-detail-print-exclude">
        {sectionTitle("Emails")}
        <div style={{ border: "1px solid var(--line)", borderTop: 0, borderRadius: "0 0 8px 8px", padding: 14, fontSize: 12 }}>
          {(record.emails || []).length ? record.emails.map((email, index) => <div key={index}>{email.label} - <span style={{ color: "var(--accent)" }}>{email.status}</span><br />{email.at}</div>) : <div className="rental-muted">No email records yet.</div>}
        </div>

        {sectionTitle("Log")}
        <div style={{ border: "1px solid var(--line)", borderTop: 0, borderRadius: "0 0 8px 8px", padding: 14, fontSize: 12 }}>
          {logEntries.length ? visibleLogEntries.map((item, index) => {
            const audit = (record.adminAudit || []).find((entry) => entry.auditId && entry.auditId === item.auditId) || null;
            return <button key={`${(logPage - 1) * logPageSize + index}-${item.auditId || item.at}`} type="button" onClick={() => setSelectedAudit(audit || { adminUser: item.label, editedAt: item.at })} title="View booking change" style={{ display: "block", width: "100%", border: 0, padding: "3px 0", background: "transparent", textAlign: "left", font: "inherit", cursor: "pointer" }}><span style={{ color: "var(--accent)" }}>{item.label}</span> - {item.at} | {item.action}</button>;
          }) : <div className="rental-muted">No log entries yet.</div>}
          {logEntries.length > logPageSize && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderTop: "1px solid var(--line)", marginTop: 10, paddingTop: 10 }}>
              <span style={{ color: "var(--ink-3)" }}>Showing {(logPage - 1) * logPageSize + 1}–{Math.min(logPage * logPageSize, logEntries.length)} of {logEntries.length}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <button className="btn sm" type="button" disabled={logPage === 1} onClick={() => setLogPage((page) => Math.max(1, page - 1))}>Previous</button>
                {Array.from({ length: logPageCount }, (_, index) => index + 1).map((page) => <button key={page} className={`btn sm${page === logPage ? " dark" : ""}`} type="button" onClick={() => setLogPage(page)} style={{ minWidth: 32, paddingInline: 8 }}>{page}</button>)}
                <button className="btn sm" type="button" disabled={logPage === logPageCount} onClick={() => setLogPage((page) => Math.min(logPageCount, page + 1))}>Next</button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
      <div className="progress-detail-actions" aria-label="Detailed progress actions">
        <button className="btn" type="button" onClick={printProgress}><Ic.Print size={15} /> Print</button>
        <button className="btn" type="button" onClick={() => onEditClient?.(record)}><Ic.Edit size={15} /> Edit</button>
        <button className="btn primary" type="button" onClick={onSave}><Ic.Save size={15} /> Save</button>
      </div>
      {costBreakdown && <ProgressCostBreakdownModal {...costBreakdown} onClose={() => setCostBreakdown(null)} />}
      {selectedAudit && <BookingAuditModal audit={selectedAudit} steps={steps} onClose={() => setSelectedAudit(null)} />}
    </div>
  );
}

function HtmlSourceApp({ initialSection = "workflow", forcePublicMode = false, bookingSummaryMode = false }) {
  const Ic = window.Icons;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const { toasts, push: pushToast, dismiss: dismissToast } = window.useToasts();
  const publicMode = forcePublicMode || bookingSummaryMode || ["/", "/book", "/book/"].includes(window.location.pathname) || new URLSearchParams(window.location.search).get("mode") === "public";

  // Steps — load from localStorage, fallback to sample
  const [steps, setSteps] = React.useState(() => loadSteps() || normalizeWorkflowSteps(window.SAMPLE_STEPS));
  const [recommendedFieldPresets, setRecommendedFieldPresets] = React.useState(() => buildRecommendedFieldPresetsByStep(loadSteps() || normalizeWorkflowSteps(window.SAMPLE_STEPS)));
  const [rentalCatalog, setRentalCatalog] = React.useState(() => {
    const initial = loadRentalCatalog() || window.normalizeRentalCatalog(window.SAMPLE_RENTAL_CATALOG);
    setRecommendedRentalCatalogSnapshot(initial);
    return initial;
  });
  const [pricingRules, setPricingRules] = React.useState(() => loadPricingRules() || normalizePricingRules(window.SAMPLE_PRICING_RULES));
  const [siteSettings, setSiteSettings] = React.useState(() => loadSiteSettings() || normalizeSiteSettings(SAMPLE_SITE_SETTINGS));
  const [progressRecords, setProgressRecords] = React.useState(() => loadProgressRecords() || normalizeProgressRecords(SAMPLE_PROGRESS_RECORDS));
  const [publicEditRecord, setPublicEditRecord] = React.useState(null);
  const [activeProgressId, setActiveProgressId] = React.useState(null);
  const [submittedAnswersRecordId, setSubmittedAnswersRecordId] = React.useState(null);
  const [adminEditRecordId, setAdminEditRecordId] = React.useState(() => new URLSearchParams(window.location.search).get("edit") || null);
  const [emailDraft, setEmailDraft] = React.useState(null);
  const [activeStepId, setActiveStepId] = React.useState(() => (loadSteps() || normalizeWorkflowSteps(window.SAMPLE_STEPS))[0]?.id || "s1");
  const [openFieldId, setOpenFieldId] = React.useState("f1");
  const [activeSection, setActiveSection] = React.useState(() => initialSection || new URLSearchParams(window.location.search).get("section") || "workflow");
  const [isDirty, setIsDirty] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [resetWarningOpen, setResetWarningOpen] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState(null);
  const [history, setHistory] = React.useState(() => loadHistory());
  const [workflowUndo, setWorkflowUndo] = React.useState([]);
  const [workflowRedo, setWorkflowRedo] = React.useState([]);
  const [rentalUndo, setRentalUndo] = React.useState([]);
  const [rentalRedo, setRentalRedo] = React.useState([]);
  const [publishedState, setPublishedState] = React.useState(null);
  const [adminAccounts, setAdminAccounts] = React.useState([]);
  const [currentAdminUsername, setCurrentAdminUsername] = React.useState("");
  const [initialDataLoaded, setInitialDataLoaded] = React.useState(publicMode);
  const [lastSavedAt, setLastSavedAt] = React.useState(() => {
    const v = parseInt(localStorage.getItem(SAVED_KEY) || "0", 10);
    return v || Date.now();
  });

  const stepsRef = React.useRef(steps);
  stepsRef.current = steps;
  const rentalCatalogRef = React.useRef(rentalCatalog);
  rentalCatalogRef.current = rentalCatalog;
  const pricingRulesRef = React.useRef(pricingRules);
  pricingRulesRef.current = pricingRules;
  const siteSettingsRef = React.useRef(siteSettings);
  siteSettingsRef.current = siteSettings;
  const progressRecordsRef = React.useRef(progressRecords);
  progressRecordsRef.current = progressRecords;
  const publishedStateRef = React.useRef(publishedState);
  publishedStateRef.current = publishedState;
  const currentPublishedState = () => publishedStateRef.current || buildPublicStatePayload(stepsRef.current, rentalCatalogRef.current, pricingRulesRef.current, siteSettingsRef.current);
  React.useEffect(() => {
    window.requestCollaburoDeleteConfirmation = (config = {}) => {
      setDeleteConfirm({ ...config, requestId: Date.now() });
    };
    return () => {
      delete window.requestCollaburoDeleteConfirmation;
    };
  }, []);
  React.useEffect(() => {
    if (!publishedStateRef.current) {
      setPublishedState(buildPublicStatePayload(stepsRef.current, rentalCatalogRef.current, pricingRulesRef.current, siteSettingsRef.current));
    }
  }, []);
  React.useEffect(() => {
    const selectNumericValue = (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || (input.type !== "number" && !input.classList.contains("price-input")) || input.disabled || input.readOnly) return;
      // Selecting after pointerup prevents the browser from immediately
      // collapsing the selection back to the exact spot that was clicked.
      try { input.select(); } catch (_) {}
    };
    document.addEventListener("pointerup", selectNumericValue);
    return () => document.removeEventListener("pointerup", selectNumericValue);
  }, []);

  React.useEffect(() => {
    if (publicMode) return;
    const nextPath = `/admin/${activeSection || "workflow"}`;
    try {
      if (window.parent && window.parent !== window && window.parent.location.pathname !== nextPath) {
        window.parent.history.pushState({ collaburoSection: activeSection }, "", nextPath);
      } else if (window.location.pathname.startsWith("/admin/") && window.location.pathname !== nextPath) {
        window.history.pushState({ collaburoSection: activeSection }, "", nextPath);
      }
    } catch (_) {}
  }, [activeSection, publicMode]);
  React.useEffect(() => {
    if (publicMode) return;
    const url = new URL(window.location.href);
    if (adminEditRecordId) url.searchParams.set("edit", bookingCodeFromId(adminEditRecordId));
    else url.searchParams.delete("edit");
    window.history.replaceState({ collaburoSection: activeSection, edit: adminEditRecordId || null }, "", `${url.pathname}${url.search}${url.hash}`);
  }, [adminEditRecordId, activeSection, publicMode]);
  React.useEffect(() => {
    window.CURRENT_RENTAL_CATALOG = rentalCatalog;
  }, [rentalCatalog]);
  React.useEffect(() => {
    window.CURRENT_SITE_SETTINGS = siteSettings;
  }, [siteSettings]);
  const loadAdminAccounts = React.useCallback(() => {
    if (publicMode) return Promise.resolve();
    return collaburoApi("/api/admin-accounts")
      .then((data) => {
        setAdminAccounts(data.accounts || []);
        setCurrentAdminUsername(data.currentUsername || "");
      })
      .catch((error) => {
        pushToast({ kind: "danger", title: "Couldn't load admin accounts", desc: error.message || "Please try again." });
      });
  }, [publicMode, pushToast]);
  React.useEffect(() => {
    loadAdminAccounts();
  }, [loadAdminAccounts]);
  React.useEffect(() => {
    let cancelled = false;
    collaburoApi("/api/admin-state")
      .then((data) => {
        // Remember the database version we loaded so saves can detect conflicts —
        // even when the local-newer guard below skips applying it.
        lastDatabaseUpdatedAt = data.updatedAt || null;
        const next = normalizeAdminStatePayload(data.state);
        if (!next || cancelled) return;
        // Never silently overwrite a local draft that is newer than the database
        // state. A 2-minute tolerance absorbs clock skew between devices.
        const databaseSavedAt = new Date(data.state?.savedAt || data.updatedAt || 0).getTime() || 0;
        const localSavedAt = parseInt(localStorage.getItem(SAVED_KEY) || "0", 10) || 0;
        if (!publicMode && loadSteps() && localSavedAt > databaseSavedAt + 2 * 60 * 1000) {
          pushToast({
            kind: "info",
            title: "Local draft is newer",
            desc: "This browser has work newer than the database, so the database draft was not loaded. Click Save to sync this draft to the database.",
            duration: 10000,
          });
          return;
        }
        setSteps(next.steps);
        setRecommendedFieldPresets(buildRecommendedFieldPresetsByStep(next.steps));
        setRentalCatalog(next.rentalCatalog);
        setRecommendedRentalCatalogSnapshot(next.rentalCatalog);
        setPricingRules(next.pricingRules);
        setSiteSettings(next.siteSettings);
        setProgressRecords(next.progressRecords);
        setPublishedState(next.liveState || buildPublicStatePayload(next.steps, next.rentalCatalog, next.pricingRules, next.siteSettings));
        setActiveStepId(next.steps[0]?.id || "s1");
        setOpenFieldId(next.steps[0]?.fields?.[0]?.id || null);
        setIsDirty(false);
        if (data.updatedAt) setLastSavedAt(new Date(data.updatedAt).getTime());
        if (!publicMode) pushToast({ kind: "success", title: "Loaded database draft", desc: "Admin data was restored from the database." });
        if (!publicMode) {
          return collaburoApi("/api/submissions")
            .then((submissionData) => {
              if (cancelled) return;
              const submittedRecords = progressRecordsFromSubmissionRows(submissionData.submissions || []);
              if (!submittedRecords.length) return;
              setProgressRecords((records) => mergeProgressRecords(records, submittedRecords));
            })
            .catch(() => {});
        }
      })
      .catch((error) => {
        if (cancelled || publicMode) return;
        pushToast({
          kind: "danger",
          title: "Couldn't load from database",
          desc: `${error.message || "Network error."} Showing this browser's local copy — it may be out of date. Check the connection before saving.`,
          duration: 10000,
        });
      })
      .finally(() => {
        if (!cancelled) setInitialDataLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  React.useEffect(() => {
    if (!publicMode) return;
    const recordId = new URLSearchParams(window.location.search).get("record");
    if (!recordId) return;
    collaburoApi("/api/submissions", {
      method: "POST",
      body: JSON.stringify({ action: "get-progress-record", recordId }),
    })
      .then((data) => {
        if (data?.record) setPublicEditRecord(normalizeProgressRecord(data.record));
      })
      .catch((error) => {
        pushToast({ kind: "danger", title: "Could not load request", desc: error.message || "The edit link may no longer be available." });
      });
  }, [publicMode, pushToast]);

  // Empty-vs-populated tweak
  const populatedRef = React.useRef(t.populated);
  React.useEffect(() => {
    if (populatedRef.current === t.populated) return;
    populatedRef.current = t.populated;
    if (!t.populated) {
      const empty = [{ id: "s_empty", name: "Untitled Step", description: "", fields: [] }];
      setSteps(empty);
      setActiveStepId("s_empty");
      setOpenFieldId(null);
    } else {
      const next = loadSteps() || normalizeWorkflowSteps(window.SAMPLE_STEPS);
      setSteps(next);
      setActiveStepId(next[0]?.id);
      setOpenFieldId(next[0]?.fields[0]?.id || null);
    }
  }, [t.populated]);

  // Apply font via CSS vars
  React.useEffect(() => {
    const f = FONT_OPTIONS[t.fontFamily] || FONT_OPTIONS.geist;
    document.documentElement.style.setProperty("--font-sans", f.stack);
    document.documentElement.style.setProperty("--font-mono", f.mono);
  }, [t.fontFamily]);

  // Apply accent
  React.useEffect(() => {
    const accent = siteSettings.branding?.colors?.accent || t.accent;
    const text = siteSettings.branding?.colors?.text || "#2c2418";
    const primary = siteSettings.branding?.colors?.primary || "#2c2418";
    const secondary = siteSettings.branding?.colors?.secondary || "#4a3f33";
    const bodyFont = FONT_OPTIONS[siteSettings.branding?.fonts?.text?.family || t.fontFamily] || FONT_OPTIONS.geist;
    document.documentElement.style.setProperty("--font-sans", bodyFont.stack);
    document.documentElement.style.setProperty("--accent", accent);
    document.documentElement.style.setProperty("--accent-soft", `color-mix(in oklch, ${accent} 14%, white)`);
    document.documentElement.style.setProperty("--accent-soft-line", `color-mix(in oklch, ${accent} 35%, white)`);
    document.documentElement.style.setProperty("--surface-active", `color-mix(in oklch, ${accent} 10%, var(--surface-2))`);
    document.documentElement.style.setProperty("--ink", primary);
    document.documentElement.style.setProperty("--ink-2", secondary);
    document.body.style.color = text;
    document.title = siteSettings.branding?.siteTitle || "Collaburo · Admin";
    let icon = document.querySelector("link[rel='icon']");
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      document.head.appendChild(icon);
    }
    if (siteSettings.branding?.favicon) icon.href = siteSettings.branding.favicon;
  }, [siteSettings, t.accent, t.fontFamily]);

  const activeStep = steps.find((s) => s.id === activeStepId) || steps[0];
  const activeStepIndex = steps.findIndex((s) => s.id === activeStepId);

  // ----- mutators -----
  const markDirty = () => setIsDirty(true);
  const rememberWorkflowState = React.useCallback((previous) => {
    setWorkflowUndo((items) => [cloneData(previous), ...items].slice(0, 50));
    setWorkflowRedo([]);
  }, []);
  const rememberRentalState = React.useCallback((previous) => {
    setRentalUndo((items) => [cloneData(previous), ...items].slice(0, 50));
    setRentalRedo([]);
  }, []);
  const commitSteps = React.useCallback((nextOrUpdater) => {
    const previous = stepsRef.current;
    const next = typeof nextOrUpdater === "function" ? nextOrUpdater(previous) : nextOrUpdater;
    if (next === previous) return previous;
    rememberWorkflowState(previous);
    setSteps(next);
    markDirty();
    return next;
  }, [rememberWorkflowState]);
  const commitRentalCatalog = React.useCallback((nextOrUpdater) => {
    const previous = rentalCatalogRef.current;
    const next = typeof nextOrUpdater === "function" ? nextOrUpdater(previous) : nextOrUpdater;
    if (next === previous) return previous;
    rememberRentalState(previous);
    setRentalCatalog(next);
    markDirty();
    return next;
  }, [rememberRentalState]);
  const undoWorkflow = React.useCallback(() => {
    setWorkflowUndo((items) => {
      if (!items.length) return items;
      const [target, ...rest] = items;
      const current = cloneData(stepsRef.current);
      const nextSteps = normalizeWorkflowSteps(target);
      setWorkflowRedo((redoItems) => [current, ...redoItems].slice(0, 50));
      setSteps(nextSteps);
      setActiveStepId((id) => nextSteps.some((step) => step.id === id) ? id : (nextSteps[0]?.id || "s1"));
      setOpenFieldId((id) => nextSteps.some((step) => (step.fields || []).some((field) => field.id === id)) ? id : null);
      markDirty();
      return rest;
    });
  }, []);
  const redoWorkflow = React.useCallback(() => {
    setWorkflowRedo((items) => {
      if (!items.length) return items;
      const [target, ...rest] = items;
      const current = cloneData(stepsRef.current);
      const nextSteps = normalizeWorkflowSteps(target);
      setWorkflowUndo((undoItems) => [current, ...undoItems].slice(0, 50));
      setSteps(nextSteps);
      setActiveStepId((id) => nextSteps.some((step) => step.id === id) ? id : (nextSteps[0]?.id || "s1"));
      setOpenFieldId((id) => nextSteps.some((step) => (step.fields || []).some((field) => field.id === id)) ? id : null);
      markDirty();
      return rest;
    });
  }, []);
  const undoRentalCatalog = React.useCallback(() => {
    setRentalUndo((items) => {
      if (!items.length) return items;
      const [target, ...rest] = items;
      const current = cloneData(rentalCatalogRef.current);
      setRentalRedo((redoItems) => [current, ...redoItems].slice(0, 50));
      setRentalCatalog(window.normalizeRentalCatalog(target));
      markDirty();
      return rest;
    });
  }, []);
  const redoRentalCatalog = React.useCallback(() => {
    setRentalRedo((items) => {
      if (!items.length) return items;
      const [target, ...rest] = items;
      const current = cloneData(rentalCatalogRef.current);
      setRentalUndo((undoItems) => [current, ...undoItems].slice(0, 50));
      setRentalCatalog(window.normalizeRentalCatalog(target));
      markDirty();
      return rest;
    });
  }, []);
  const pushHistoryEntry = React.useCallback((label, nextSteps = stepsRef.current, nextRentals = rentalCatalogRef.current, nextPricing = pricingRulesRef.current, nextSite = siteSettingsRef.current, nextProgress = progressRecordsRef.current) => {
    const entry = snapshotDraft(label, nextSteps, nextRentals, nextPricing, nextSite, nextProgress);
    setHistory((prev) => {
      const list = [entry, ...(prev || [])].slice(0, 30);
      saveHistoryList(list);
      return list;
    });
    return entry;
  }, []);
  const updateStep = (next) => { commitSteps((current) => current.map((s) => s.id === next.id ? next : s)); };
  const renameStep = (id, name) => { commitSteps((current) => current.map((s) => s.id === id ? { ...s, name } : s)); };
  const moveStep = (id, delta) => {
    const i = steps.findIndex((s) => s.id === id);
    const j = i + delta;
    if (j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[i], next[j]] = [next[j], next[i]];
    commitSteps(next);
  };
  const reorderSteps = (next) => { commitSteps(next); };
  const deleteStep = (id) => {
    if (steps.length === 1) return;
    const i = steps.findIndex((s) => s.id === id);
    if (i === -1) return;
    requestDeleteConfirmation({
      itemType: "step",
      itemName: steps[i].name,
      onConfirm: () => {
        const next = steps.filter((s) => s.id !== id);
        commitSteps(next);
        if (activeStepId === id) setActiveStepId(next[Math.max(0, i - 1)].id);
        pushToast({ kind: "info", title: "Step deleted", desc: steps[i].name });
      },
    });
  };
  const addStep = () => {
    const ns = { id: uid("s"), name: `New step ${steps.length + 1}`, description: "", fields: [] };
    commitSteps([...steps, ns]);
    setActiveStepId(ns.id);
  };

  const addField = (typeOrPreset) => {
    const preset = typeof typeOrPreset === "object" && typeOrPreset ? cloneData(typeOrPreset) : { type: typeOrPreset };
    const type = preset.type;
    const id = uid("f");
    const defaults = {
      id,
      type,
      label: preset.label || defaultLabelFor(type),
      required: !!preset.required,
      adminRequired: !!preset.adminRequired,
      placeholder: preset.placeholder || "",
      visibleToClient: preset.visibleToClient !== false,
      helpText: preset.helpText || "",
      fieldDescription: preset.fieldDescription || "",
      linkedToPricing: !!preset.linkedToPricing,
      category: preset.category || "",
      excludeFromRecommended: true,
      ...(preset.hasOptions !== undefined ? { hasOptions: preset.hasOptions } : {}),
      ...(preset.options ? { options: cloneData(preset.options) } : {}),
      ...(preset.displayAs ? { displayAs: preset.displayAs } : {}),
      ...(preset.dynamicSource ? { dynamicSource: preset.dynamicSource } : {}),
      ...(preset.groupOptions !== undefined ? { groupOptions: preset.groupOptions } : {}),
      ...(preset.requireSubOptions !== undefined ? { requireSubOptions: preset.requireSubOptions } : {}),
      ...(preset.subOptionDisplayAs ? { subOptionDisplayAs: preset.subOptionDisplayAs } : {}),
      ...(preset.min !== undefined ? { min: preset.min } : {}),
      ...(preset.max !== undefined ? { max: preset.max } : {}),
      ...(preset.step !== undefined ? { step: preset.step } : {}),
      ...(preset.acceptedFiles ? { acceptedFiles: preset.acceptedFiles } : {}),
      ...(preset.allowMultipleFiles !== undefined ? { allowMultipleFiles: preset.allowMultipleFiles } : {}),
      ...(type === "rental_group" ? { rentalGroup: "Tables", linkedToPricing: true, category: "Rentals" } : {}),
      ...(type === "extras" ? { ...defaultRentalExtrasField(), id, label: preset.label || "Extras", ...preset } : {}),
    };
    commitSteps((current) => current.map((s) =>
      s.id === activeStepId ? { ...s, fields: [...s.fields, defaults] } : s
    ));
    setOpenFieldId(id);
    revealAddedAdminItem(id);
  };
  const addMultipleFields = (presets) => {
    const newFields = presets.map((source) => {
      const p = cloneData(source);
      delete p.id;
      delete p.legacyDuplicateId;
      return ({
      ...p,
      id: uid("f"),
      type: p.type || "text",
      label: p.label || defaultLabelFor(p.type || "text"),
      required: !!p.required,
      adminRequired: !!p.adminRequired,
      placeholder: p.placeholder || "",
      visibleToClient: p.visibleToClient !== false,
      helpText: p.helpText || "",
      fieldDescription: p.fieldDescription || "",
      linkedToPricing: !!p.linkedToPricing,
      category: p.category || "",
      ...(p.options ? { options: cloneData(p.options) } : {}),
      ...(p.type === "extras" ? { ...defaultRentalExtrasField(), ...p, id: uid("f") } : {}),
    });
    });
    commitSteps((current) => current.map((s) =>
      s.id === activeStepId ? { ...s, fields: [...s.fields, ...newFields] } : s
    ));
    if (newFields.length > 0) setOpenFieldId(newFields[0].id);
    if (newFields.length > 0) revealAddedAdminItem(newFields[0].id);
    pushToast({ kind: "success", title: `${newFields.length} field${newFields.length > 1 ? "s" : ""} added`, desc: `Recommended fields added to ${activeStep.name}` });
  };
  const updateField = (fid, next) => {
    commitSteps((current) => current.map((s) =>
      s.id === activeStepId
        ? { ...s, fields: s.fields.map((f) => f.id === fid ? next : f) }
        : s
    ));
  };
  const duplicateField = (fid) => {
    let dupId = null;
    commitSteps((current) => current.map((s) => {
      if (s.id !== activeStepId) return s;
      const i = s.fields.findIndex((f) => f.id === fid);
      const orig = s.fields[i];
      const copy = { ...cloneData(orig), id: uid("f"), label: orig.label + " (copy)", excludeFromRecommended: true };
      dupId = copy.id;
      const next = [...s.fields];
      next.splice(i + 1, 0, copy);
      return { ...s, fields: next };
    }));
    if (dupId) setOpenFieldId(dupId);
    if (dupId) revealAddedAdminItem(dupId);
  };
  const deleteField = (fid) => {
    commitSteps((current) => current.map((s) =>
      s.id === activeStepId
        ? { ...s, fields: s.fields.filter((f) => f.id !== fid) }
        : s
    ));
    if (openFieldId === fid) setOpenFieldId(null);
  };
  const reorderFields = (nextFields) => {
    commitSteps((current) => current.map((s) => s.id === activeStepId ? { ...s, fields: nextFields } : s));
  };
  const updateRentalCatalog = (next) => {
    commitRentalCatalog(next);
  };
  const updatePricingRules = (next) => {
    setPricingRules(normalizePricingRules(next));
    markDirty();
  };
  const updateSiteSettings = (next) => {
    setSiteSettings(normalizeSiteSettings(next));
    markDirty();
  };
  const updateProgressRecord = (id, patch) => {
    setProgressRecords((records) => records.map((record) => record.id === id ? normalizeProgressRecord({ ...record, ...patch }) : record));
    markDirty();
  };
  const persistProgressRecordsToDatabase = (records) => {
    try {
      saveJsonSafely(PROGRESS_STORAGE_KEY, records);
    } catch (_) {}
    return buildDatabaseAdminStatePayload(stepsRef.current, rentalCatalogRef.current, pricingRulesRef.current, siteSettingsRef.current, records, currentPublishedState())
      .then((databaseState) => putAdminStateToDatabase(databaseState));
  };
  const progressClientLink = (record = {}) => `${window.location.origin}/book${record.id ? `?record=${bookingCodeForRecord(record)}` : ""}`;
  const progressSummaryLink = (record = {}) => `${window.location.origin}/booking-summary${record.id ? `?record=${bookingCodeForRecord(record)}` : ""}`;
  const openBookingSummary = (record = {}) => {
    if (!record?.id) return;
    window.open(progressSummaryLink(record), "_blank", "noopener,noreferrer");
  };
  const startAdminBooking = () => {
    const record = createProgressRecordFromSubmission({
      recordId: bookingId(),
      steps,
      answers: {},
      costData: {},
      venueCost: {},
      adminEditMode: true,
      createdBy: "Admin",
    });
    const nextRecords = [record, ...progressRecordsRef.current];
    setProgressRecords(nextRecords);
    setAdminEditRecordId(record.id);
    markDirty();
    persistProgressRecordsToDatabase(nextRecords).catch((error) => {
      if (shouldShowDatabaseError(error)) {
        pushToast({ kind: "danger", title: "Booking save skipped", desc: error.message });
      }
    });
  };
  const openClientProgress = (record = {}) => {
    if (record?.id) setAdminEditRecordId(record.id);
    else startAdminBooking();
  };
  const copyProgressLink = (record) => {
    const link = progressClientLink(record);
    navigator.clipboard?.writeText(link).then(
      () => pushToast({ kind: "success", title: "Client link copied", desc: link }),
      () => pushToast({ kind: "info", title: "Client link", desc: link, duration: 5000 })
    );
  };
  const deleteProgressRecord = (record) => {
    if (!record) return;
    const name = record.client?.name || `#${record.progressNo}`;
    requestDeleteConfirmation({
      itemType: "progress record",
      itemName: name,
      onConfirm: () => {
        setProgressRecords((records) => records.filter((item) => item.id !== record.id));
        if (activeProgressId === record.id) setActiveProgressId(null);
        markDirty();
        pushToast({ kind: "success", title: "Progress record deleted", desc: name });
      },
    });
  };
  const recordSentEmail = (recordId, type, draft) => {
    const at = new Date().toLocaleString();
    setProgressRecords((records) => records.map((record) => {
      if (record.id !== recordId) return record;
      return normalizeProgressRecord({
        ...record,
        emails: [{ label: type.label, status: "Sent", at, subject: draft.subject }, ...(record.emails || [])],
        log: [{ label: "Admin", at, action: `Sent ${type.label} email` }, ...(record.log || [])],
      });
    }));
    setEmailDraft(null);
    markDirty();
    pushToast({ kind: "success", title: `${type.label} email sent`, desc: draft.to });
  };
  const addProgressRecordFromSubmission = (payload) => {
    const record = createProgressRecordFromSubmission(payload);
    if (payload?.recordId) {
      const existing = progressRecordsRef.current.find((item) => String(item.id) === String(payload.recordId)) || publicEditRecord;
      const completedStepIds = Array.from(new Set([
        ...((existing?.stepProgress?.completedStepIds || []).filter(Boolean)),
        ...((record.stepProgress?.completedStepIds || []).filter(Boolean)),
        ...(payload.savedStepId ? [payload.savedStepId] : []),
      ]));
      const mergedRecord = normalizeProgressRecord({
        ...(existing || {}),
        ...record,
        id: payload.recordId,
        costs: !payload.adminEditMode && existing?.costs?.adminAdjustments
          ? applyStoredAdminCostAdjustments(record.costs || {}, existing.costs.adminAdjustments)
          : record.costs,
        progress: {
          ...(existing?.progress || {}),
          ...(record.progress || {}),
          status: normalizeProgressStatus(
            existing?.progress?.status || record.progress?.status || (payload.adminEditMode ? "In Discussion" : "Not Contacted")
          ),
          lastActivityAt: new Date().toISOString(),
        },
        stepProgress: {
          ...(existing?.stepProgress || {}),
          ...(record.stepProgress || {}),
          completedStepIds,
          completedCount: completedStepIds.length,
          totalSteps: (payload.steps || stepsRef.current || []).length,
          updatedAt: new Date().toISOString(),
        },
        emails: [
          { label: payload.finalSubmit ? "Client request saved" : payload.adminEditMode ? "Admin booking saved" : "Client progress saved", status: "Saved", at: new Date().toLocaleString() },
          ...((existing?.emails || record.emails || []).filter((email) => !["Client changes saved", "Client request saved", "Client progress saved"].includes(email.label))),
        ],
        log: [
          { label: payload.adminEditMode ? "Admin" : "Client", at: new Date().toLocaleString(), action: payload.finalSubmit ? "Saved final booking form step" : payload.adminEditMode ? "Saved booking form" : "Saved booking form step" },
          ...((existing?.log || record.log || [])),
        ],
      });
      const nextRecords = progressRecordsRef.current.some((item) => String(item.id) === String(payload.recordId))
        ? progressRecordsRef.current.map((item) => String(item.id) === String(payload.recordId) ? mergedRecord : item)
        : [mergedRecord, ...progressRecordsRef.current];
      setProgressRecords(nextRecords);
      if (publicMode) setPublicEditRecord(mergedRecord);
      if (payload.adminEditMode) {
        return buildDatabaseAdminBookingUpdateRecord(mergedRecord)
          .then((databaseRecord) => collaburoApi("/api/submissions", {
          method: "POST",
            body: JSON.stringify({ action: "admin-update-booking", record: databaseRecord, auditDisplayChanges: payload.auditDisplayChanges }),
          }))
          .then((result) => {
            const saved = normalizeProgressRecord(result.record || mergedRecord);
            setProgressRecords((records) => records.map((item) => String(item.id) === String(saved.id) ? saved : item));
            pushToast({ kind: "success", title: "Admin changes saved", desc: result.changedFields?.length ? `Updated: ${result.changedFields.join(", ")}` : "No booking fields changed." });
            return saved;
          })
          .catch((error) => {
            pushToast({ kind: "danger", title: "Save failed", desc: error.message || "Please try again." });
            throw error;
          });
      }
      const saveExistingRecord = publicMode
        ? buildDatabaseSubmissionRecord(mergedRecord).then((databaseRecord) => collaburoApi("/api/submissions", {
          method: "POST",
          body: JSON.stringify({ action: "update-progress-record", record: databaseRecord }),
        }))
        : persistProgressRecordsToDatabase(nextRecords);
      return saveExistingRecord
        .then(() => {
          pushToast({ kind: "success", title: "Changes saved", desc: `${mergedRecord.client.name || "Client"} was updated in the progress list.` });
          return mergedRecord;
        })
        .catch((error) => {
          pushToast({ kind: "danger", title: "Save failed", desc: error.message || "Please try again." });
          throw error;
        });
    }
    if (publicMode) {
      return buildDatabaseSubmissionRecord(record)
        .then((databaseRecord) => collaburoApi("/api/submissions", {
          method: "POST",
          body: JSON.stringify({ record: databaseRecord }),
        }))
        .then((result) => {
          if (result?.duplicate) {
            pushToast({ kind: "success", title: "Request already submitted", desc: "We already have this request saved for review." });
          } else {
            pushToast({ kind: "success", title: "Request submitted", desc: "Your request was sent to Collaburo for review." });
          }
          return record;
        })
        .catch((error) => {
          pushToast({ kind: "danger", title: "Submit failed", desc: error.message || "Please try again." });
          throw error;
        });
    }
    const nextRecords = [record, ...progressRecordsRef.current];
    setProgressRecords(nextRecords);
    try {
      saveJsonSafely(PROGRESS_STORAGE_KEY, nextRecords);
    } catch (_) {}
    buildDatabaseSubmissionRecord(record)
      .then((databaseRecord) => collaburoApi("/api/submissions", {
        method: "POST",
        body: JSON.stringify({ record: databaseRecord }),
      }))
      .then(() => buildDatabaseAdminStatePayload(stepsRef.current, rentalCatalogRef.current, pricingRulesRef.current, siteSettingsRef.current, nextRecords, currentPublishedState()))
      .then((databaseState) => putAdminStateToDatabase(databaseState))
      .catch((error) => {
        if (shouldShowDatabaseError(error)) {
          pushToast({ kind: "danger", title: "Database save skipped", desc: error.message });
        }
      });
    setActiveSection("clients");
    setActiveProgressId(record.id);
    markDirty();
    pushToast({ kind: "success", title: "Request added to progress list", desc: `${record.client.name} is ready for admin review.` });
    return record;
  };

  // ----- save / publish -----
  const save = React.useCallback(() => {
    try {
      const workflowStats = saveJsonSafely(STORAGE_KEY, stepsRef.current);
      const rentalStats = saveJsonSafely(RENTALS_STORAGE_KEY, rentalCatalogRef.current);
      const pricingStats = saveJsonSafely(PRICING_STORAGE_KEY, pricingRulesRef.current);
      const siteStats = saveJsonSafely(SITE_SETTINGS_STORAGE_KEY, siteSettingsRef.current);
      const progressStats = saveJsonSafely(PROGRESS_STORAGE_KEY, progressRecordsRef.current);
      const now = Date.now();
      localStorage.setItem(SAVED_KEY, String(now));
      buildDatabaseAdminStatePayload(stepsRef.current, rentalCatalogRef.current, pricingRulesRef.current, siteSettingsRef.current, progressRecordsRef.current, currentPublishedState())
        .then((databaseState) => putAdminStateToDatabase(databaseState))
        .then(() => {
          setRecommendedFieldPresets(buildRecommendedFieldPresetsByStep(stepsRef.current));
          setRecommendedRentalCatalogSnapshot(rentalCatalogRef.current);
          pushToast({ kind: "success", title: "Database saved", desc: "Configuration was saved, and uploaded images were moved to Cloudinary." });
        })
        .catch((error) => {
          pushToast({
            kind: "danger",
            title: "Database save failed",
            desc: `${error.message || "Unknown error."} Changes are only in this browser until the database save succeeds.`,
            duration: 8000,
          });
        });
      pushHistoryEntry("Saved changes", stepsRef.current, rentalCatalogRef.current, pricingRulesRef.current, siteSettingsRef.current, progressRecordsRef.current);
      setLastSavedAt(now);
      setIsDirty(false);
      const removedImages = (workflowStats.removedImages || 0) + (rentalStats.removedImages || 0) + (pricingStats.removedImages || 0) + (siteStats.removedImages || 0) + (progressStats.removedImages || 0);
      pushToast({
        kind: "success",
        title: "Changes saved",
        desc: removedImages ? `Saved configuration. ${removedImages} oversized uploaded image${removedImages > 1 ? "s were" : " was"} skipped for browser storage.` : "Workflow draft updated",
      });
    } catch (e) {
      pushToast({ kind: "danger", title: "Save failed", desc: e.message });
    }
  }, [pushToast, pushHistoryEntry]);

  const publish = () => {
    const liveState = buildPublicStatePayload(stepsRef.current, rentalCatalogRef.current, pricingRulesRef.current, siteSettingsRef.current);
    const previousPublishedState = publishedStateRef.current;
    pushHistoryEntry("Before publish", stepsRef.current, rentalCatalogRef.current, pricingRulesRef.current, siteSettingsRef.current, progressRecordsRef.current);
    publishedStateRef.current = liveState;
    setPublishedState(liveState);
    buildDatabaseAdminStatePayload(stepsRef.current, rentalCatalogRef.current, pricingRulesRef.current, siteSettingsRef.current, progressRecordsRef.current, liveState)
      .then((databaseState) => putAdminStateToDatabase(databaseState))
      .then(() => {
        const now = Date.now();
        localStorage.setItem(SAVED_KEY, String(now));
        setLastSavedAt(now);
        setIsDirty(false);
        pushToast({
          kind: "success",
          title: "Published to clients",
          desc: "The latest draft is now live on the booking form.",
          duration: 4000,
        });
      })
      .catch((error) => {
        publishedStateRef.current = previousPublishedState;
        setPublishedState(previousPublishedState);
        pushToast({ kind: "danger", title: "Publish failed", desc: error.message || "Please try again.", duration: 8000 });
      });
  };

  const resetToSample = () => {
    pushHistoryEntry("Before reset to sample", stepsRef.current, rentalCatalogRef.current, pricingRulesRef.current, siteSettingsRef.current, progressRecordsRef.current);
    const sampleSteps = normalizeWorkflowSteps(window.SAMPLE_STEPS);
    setSteps(sampleSteps);
    setRentalCatalog(window.normalizeRentalCatalog(window.SAMPLE_RENTAL_CATALOG));
    setPricingRules(normalizePricingRules(window.SAMPLE_PRICING_RULES));
    setSiteSettings(normalizeSiteSettings(SAMPLE_SITE_SETTINGS));
    setProgressRecords(normalizeProgressRecords(SAMPLE_PROGRESS_RECORDS));
    setActiveProgressId(null);
    setActiveStepId(sampleSteps[0].id);
    setOpenFieldId(sampleSteps[0].fields[0]?.id || null);
    setIsDirty(true);
    pushToast({ kind: "info", title: "Reset to sample", desc: "Click Save to persist" });
  };
  const requestResetToSample = () => setResetWarningOpen(true);
  const confirmResetToSample = () => {
    setResetWarningOpen(false);
    resetToSample();
  };
  const restoreSavedDraft = () => {
    const savedSteps = loadSteps();
    const savedRentals = loadRentalCatalog();
    const savedPricing = loadPricingRules();
    const savedSiteSettings = loadSiteSettings();
    const savedProgress = loadProgressRecords();
    if (!savedSteps && !savedRentals && !savedPricing && !savedSiteSettings && !savedProgress) {
      pushToast({ kind: "danger", title: "No saved draft found", desc: "There is no local saved version to restore." });
      return;
    }
    pushHistoryEntry("Before restore saved draft", stepsRef.current, rentalCatalogRef.current, pricingRulesRef.current, siteSettingsRef.current, progressRecordsRef.current);
    const nextSteps = savedSteps || normalizeWorkflowSteps(window.SAMPLE_STEPS);
    const nextRentals = savedRentals || window.normalizeRentalCatalog(window.SAMPLE_RENTAL_CATALOG);
    const nextPricing = savedPricing || normalizePricingRules(window.SAMPLE_PRICING_RULES);
    const nextSite = savedSiteSettings || normalizeSiteSettings(SAMPLE_SITE_SETTINGS);
    const nextProgress = savedProgress || normalizeProgressRecords(SAMPLE_PROGRESS_RECORDS);
    setSteps(nextSteps);
    setRentalCatalog(nextRentals);
    setPricingRules(nextPricing);
    setSiteSettings(nextSite);
    setProgressRecords(nextProgress);
    setActiveProgressId(null);
    setActiveStepId(nextSteps[0]?.id || "s1");
    setOpenFieldId(nextSteps[0]?.fields?.[0]?.id || null);
    setIsDirty(false);
    pushToast({ kind: "success", title: "Saved draft restored", desc: "Recovered the last version stored locally." });
  };
  const restoreHistoryEntry = (entry) => {
    if (!entry) return;
    pushHistoryEntry("Before timeline restore", stepsRef.current, rentalCatalogRef.current, pricingRulesRef.current, siteSettingsRef.current, progressRecordsRef.current);
    const nextSteps = normalizeWorkflowSteps(entry.steps || window.SAMPLE_STEPS);
    const nextRentals = window.normalizeRentalCatalog ? window.normalizeRentalCatalog(entry.rentalCatalog || window.SAMPLE_RENTAL_CATALOG) : (entry.rentalCatalog || []);
    const nextPricing = normalizePricingRules(entry.pricingRules || window.SAMPLE_PRICING_RULES);
    const nextSite = normalizeSiteSettings(entry.siteSettings || SAMPLE_SITE_SETTINGS);
    const nextProgress = normalizeProgressRecords(entry.progressRecords || SAMPLE_PROGRESS_RECORDS);
    setSteps(nextSteps);
    setRentalCatalog(nextRentals);
    setPricingRules(nextPricing);
    setSiteSettings(nextSite);
    setProgressRecords(nextProgress);
    setActiveProgressId(null);
    setActiveStepId(nextSteps[0]?.id || "s1");
    setOpenFieldId(nextSteps[0]?.fields?.[0]?.id || null);
    setIsDirty(true);
    setHistoryOpen(false);
    pushToast({ kind: "success", title: "Version restored", desc: "Review it, then click Save changes." });
  };
  const createAdminAccount = (draft) => (
    collaburoApi("/api/admin-accounts", {
      method: "POST",
      body: JSON.stringify(draft),
    })
      .then((data) => {
        setAdminAccounts((accounts) => [...accounts, data.account].filter(Boolean));
        pushToast({ kind: "success", title: "Admin account added", desc: `${data.account?.displayName || data.account?.username} can now sign in.` });
      })
      .catch((error) => {
        pushToast({ kind: "danger", title: "Could not add admin", desc: error.message || "Please try again." });
        throw error;
      })
  );
  const saveAdminAccount = (id, draft) => (
    collaburoApi("/api/admin-accounts", {
      method: "PUT",
      body: JSON.stringify({ ...draft, id }),
    })
      .then((data) => {
        setAdminAccounts((accounts) => accounts.map((account) => account.id === id ? data.account : account));
        pushToast({ kind: "success", title: "Admin account saved", desc: data.account?.displayName || data.account?.username });
      })
      .catch((error) => {
        pushToast({ kind: "danger", title: "Could not save admin", desc: error.message || "Please try again." });
        throw error;
      })
  );
  const deleteAdminAccount = (account) => {
    if (!account || account.bootstrap) return;
    requestDeleteConfirmation({
      itemType: "admin account",
      itemName: account.displayName || account.username,
      onConfirm: () => {
        collaburoApi("/api/admin-accounts", {
          method: "DELETE",
          body: JSON.stringify({ id: account.id }),
        })
          .then(() => {
            setAdminAccounts((accounts) => accounts.filter((item) => item.id !== account.id));
            pushToast({ kind: "success", title: "Admin account deleted", desc: account.displayName || account.username });
          })
          .catch((error) => {
            pushToast({ kind: "danger", title: "Could not delete admin", desc: error.message || "Please try again." });
          });
      },
    });
  };
  const logout = React.useCallback(() => {
    collaburoApi("/api/admin-logout", { method: "POST", body: JSON.stringify({}) })
      .catch(() => {})
      .finally(() => {
        window.location.assign("/login");
      });
  }, []);

  // ----- keyboard shortcuts -----
  React.useEffect(() => {
    const onKey = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (isDirty) save();
      }
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const inp = document.querySelector(".col-search input");
        inp && inp.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDirty, save]);

  // ----- rendering -----
  const currentAdmin = adminAccounts.find((account) => account.username === currentAdminUsername) || adminAccounts[0] || { username: "admin", displayName: "Admin", title: "Admin" };
  const renderMain = () => {
    const rentalVenueOptions = (steps.find((step) => step.stepType === "venue")?.venues || []).filter((venue) => venue.active !== false && venue.visibility !== "admin_only");
    if (activeSection !== "workflow") {
      if (activeSection === "profile") {
        return (
          <AdminProfileView
            accounts={adminAccounts}
            currentAdmin={currentAdmin}
            onCreateAccount={createAdminAccount}
            onSaveAccount={saveAdminAccount}
            onDeleteAccount={deleteAdminAccount}
            onLogout={logout}
          />
        );
      }
      if (activeSection === "rentals") {
        return (
          <RentalsCatalogView
            catalog={rentalCatalog}
            venues={rentalVenueOptions}
            siteSettings={siteSettings}
            onChange={updateRentalCatalog}
          />
        );
      }
      if (activeSection === "pricing") {
        return (
          <PricingRulesView
            rules={pricingRules}
            steps={steps}
            onChange={updatePricingRules}
          />
        );
      }
      if (activeSection === "site") {
        return (
          <SiteSettingsView
            settings={siteSettings}
            onChange={updateSiteSettings}
            onReset={requestResetToSample}
            onOpenHistory={() => setHistoryOpen(true)}
          />
        );
      }
      if (activeSection === "email-settings") {
        return (
          <EmailSettingsView
            settings={siteSettings}
            onChange={updateSiteSettings}
          />
        );
      }
      if (activeSection === "clients") {
        const submittedAnswersRecord = progressRecords.find((record) => record.id === submittedAnswersRecordId);
        const activeRecord = progressRecords.find((record) => record.id === activeProgressId);
        if (submittedAnswersRecord) {
          return <AdminBookingAnswersView record={submittedAnswersRecord} steps={steps} onBack={() => setSubmittedAnswersRecordId(null)} />;
        }
        return activeRecord ? (
          <ProgressDetailView
            record={activeRecord}
            steps={steps}
            onBack={() => setActiveProgressId(null)}
            onUpdate={updateProgressRecord}
            onViewBookingAnswers={openBookingSummary}
            onViewSubmittedAnswers={(record) => setSubmittedAnswersRecordId(record.id)}
            onEditClient={openClientProgress}
            onSave={save}
          />
        ) : (
          <RentalsProgressListView
            records={progressRecords}
            onOpenDetail={setActiveProgressId}
            onEditClient={openClientProgress}
            onAdd={() => openClientProgress({})}
            onUpdateRecord={updateProgressRecord}
            onEmail={(recordId, typeId) => setEmailDraft({ recordId, typeId })}
            onCopyLink={copyProgressLink}
            onDelete={deleteProgressRecord}
          />
        );
      }
      const stub = window.SECTION_STUBS[activeSection];
      return stub ? <StubView {...stub} /> : null;
    }
    return (
      <div className="workspace">
        <StepList
          steps={steps}
          activeId={activeStepId}
          onSelect={(id) => { setActiveStepId(id); setOpenFieldId(null); }}
          onMove={moveStep}
          onDelete={deleteStep}
          onAdd={addStep}
          onRename={renameStep}
          onReorder={reorderSteps}
        />
        {activeStep && activeStep.stepType === "venue" ? (
          <VenueEditor step={activeStep} onUpdateStep={updateStep} onAddField={addField} onDeleteField={deleteField} onUpdateField={updateField} openFieldId={openFieldId} onToggleField={(id) => setOpenFieldId(openFieldId === id ? null : id)} allSteps={steps} onReorderFields={reorderFields} onDeleteStep={steps.length > 1 ? () => deleteStep(activeStep.id) : null} />
        ) : activeStep && activeStep.stepType === "layout" ? (
          <LayoutEditor step={activeStep} onUpdateStep={updateStep} onAddField={addField} onDeleteField={deleteField} onUpdateField={updateField} openFieldId={openFieldId} onToggleField={(id) => setOpenFieldId(openFieldId === id ? null : id)} allSteps={steps} onReorderFields={reorderFields} onDeleteStep={steps.length > 1 ? () => deleteStep(activeStep.id) : null} />
        ) : activeStep && activeStep.stepType === "checkout" ? (
          <CheckoutEditor
            step={activeStep}
            onUpdateStep={updateStep}
            onAddField={addField}
            onDuplicateField={duplicateField}
            onDeleteField={deleteField}
            onUpdateField={updateField}
            openFieldId={openFieldId}
            onToggleField={(id) => setOpenFieldId(openFieldId === id ? null : id)}
            onReorderFields={reorderFields}
            onDeleteStep={steps.length > 1 ? () => deleteStep(activeStep.id) : null}
          />
        ) : activeStep && activeStep.stepType === "services" ? (
          <SimpleServicesEditor
            step={activeStep}
            onUpdateStep={updateStep}
            onUpdateField={updateField}
            onDeleteField={deleteField}
            onAddField={addField}
            onDuplicateField={duplicateField}
            openFieldId={openFieldId}
            onToggleField={(id) => setOpenFieldId(openFieldId === id ? null : id)}
            onReorderFields={reorderFields}
            onDeleteStep={steps.length > 1 ? () => deleteStep(activeStep.id) : null}
          />
        ) : (
          <FieldEditor
            step={activeStep}
            recommendedFields={recommendedFieldPresets[activeStep?.id] || recommendedFieldPresets[activeStep?.name] || []}
            onUpdateStep={updateStep}
            onAddField={addField}
            onAddMultipleFields={addMultipleFields}
            onDuplicateField={duplicateField}
            onDeleteField={deleteField}
            onUpdateField={updateField}
            openFieldId={openFieldId}
            onToggleField={(id) => setOpenFieldId(openFieldId === id ? null : id)}
            onReorderFields={reorderFields}
            onDeleteStep={steps.length > 1 ? () => deleteStep(activeStep.id) : null}
          />
        )}
      </div>
    );
  };

  const lastSavedLabel = relativeTime(lastSavedAt);
  const sidebarCollapsed = t.sidebarCollapsed;
  const clientRecordId = publicMode ? new URLSearchParams(window.location.search).get("record") : "";
  const clientEditRecord = clientRecordId ? (publicEditRecord || progressRecords.find((record) => String(record.id) === String(clientRecordId) || bookingCodeForRecord(record) === String(clientRecordId))) : null;
  const clientInitialDraft = clientEditRecord ? buildClientDraftFromProgressRecord(clientEditRecord, steps) : (publicMode ? loadClientDraft() : null);

  if (!publicMode && !initialDataLoaded) {
    return <div className="booking-answers-loading" style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontWeight: 700 }}>Loading current Collaburo data…</div>;
  }

  const adminEditRecord = !publicMode && adminEditRecordId
    ? progressRecords.find((record) => String(record.id) === String(adminEditRecordId) || bookingCodeForRecord(record) === String(adminEditRecordId))
    : null;
  if (adminEditRecord) {
    return (
      <ClientPreview
        key={`admin-edit-${adminEditRecord.id}`}
        steps={steps}
        pricingRules={pricingRules}
        siteSettings={siteSettings}
        onSubmitRequest={addProgressRecordFromSubmission}
        onClose={() => setAdminEditRecordId(null)}
        adminEditMode
        initialDraft={buildClientDraftFromProgressRecord(adminEditRecord, steps)}
      />
    );
  }

  if (bookingSummaryMode) {
    return publicEditRecord
      ? <ClientBookingAnswersView record={publicEditRecord} steps={steps} />
      : <div className="booking-answers-loading">Loading booking answers…</div>;
  }

  if (publicMode) {
    return (
      <>
	        <ClientPreview
	          key={clientInitialDraft?.key || "client-public"}
	          steps={steps}
	          pricingRules={pricingRules}
	          siteSettings={siteSettings}
          onSubmitRequest={addProgressRecordFromSubmission}
          onClose={() => {}}
	          publicMode
	          initialDraft={clientInitialDraft}
	        />
	      </>
	    );
	  }
  return (
    <div
      className={
        "app" +
        (sidebarCollapsed ? " side-collapsed" : "") +
        (t.density === "compact" ? " density-compact" : "")
      }
      data-screen-label={`Admin · ${SECTION_LABEL[activeSection] || activeSection}`}
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setTweak("sidebarCollapsed", !t.sidebarCollapsed)}
        active={activeSection}
        onChangeSection={setActiveSection}
        siteSettings={siteSettings}
        currentAdmin={currentAdmin}
      />

      <main className="main">
        <Topbar
          section={activeSection}
          previewOpen={previewOpen}
          onTogglePreview={() => setPreviewOpen(true)}
          isDirty={isDirty}
          lastSaved={lastSavedLabel}
          onSave={save}
          onPublish={publish}
          onUndo={activeSection === "rentals" ? undoRentalCatalog : undoWorkflow}
          onRedo={activeSection === "rentals" ? redoRentalCatalog : redoWorkflow}
          canUndo={activeSection === "rentals" ? rentalUndo.length > 0 : workflowUndo.length > 0}
          canRedo={activeSection === "rentals" ? rentalRedo.length > 0 : workflowRedo.length > 0}
        />
        {renderMain()}
      </main>

      {previewOpen && (
        <ClientPreview
          steps={steps}
          pricingRules={pricingRules}
          siteSettings={siteSettings}
          onSubmitRequest={addProgressRecordFromSubmission}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {historyOpen && (
        <HistoryModal
          history={history}
          onRestore={restoreHistoryEntry}
          onClose={() => setHistoryOpen(false)}
        />
      )}

      {emailDraft && (
        <EmailSendModal
          record={progressRecords.find((record) => record.id === emailDraft.recordId)}
          typeId={emailDraft.typeId}
          siteSettings={siteSettings}
          onClose={() => setEmailDraft(null)}
          onSent={(type, draft) => recordSentEmail(emailDraft.recordId, type, draft)}
          onError={(error) => pushToast({ kind: "danger", title: "Email not sent", desc: error.message || "Check Resend settings." })}
        />
      )}

      {resetWarningOpen && (
        <ResetWarningModal
          onCancel={() => setResetWarningOpen(false)}
          onConfirm={confirmResetToSample}
        />
      )}

      {deleteConfirm && (
        <ConfirmDeleteModal
          {...deleteConfirmCopy(deleteConfirm)}
          confirmLabel={deleteConfirm.confirmLabel || (deleteConfirm.action === "remove" ? "Remove" : "Delete")}
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={() => {
            const action = deleteConfirm.onConfirm;
            setDeleteConfirm(null);
            action && action();
          }}
        />
      )}

      <ToastHost toasts={toasts} onDismiss={dismissToast} />

      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakColor
          label="Accent"
          value={t.accent}
          options={["#ed7a3c", "#2a6fdb", "#1f8a5b", "#7a5ae0", "#262626"]}
          onChange={(v) => setTweak("accent", v)}
        />
        <TweakSelect
          label="Font"
          value={t.fontFamily}
          options={[
            { value: "geist", label: "Geist" },
            { value: "manrope", label: "Manrope" },
            { value: "plex", label: "IBM Plex Sans" },
            { value: "inter", label: "Inter Tight" },
          ]}
          onChange={(v) => setTweak("fontFamily", v)}
        />
        <TweakRadio
          label="Density"
          value={t.density}
          options={["comfortable", "compact"]}
          onChange={(v) => setTweak("density", v)}
        />

        <TweakSection label="Layout" />
        <TweakToggle
          label="Sidebar collapsed"
          value={t.sidebarCollapsed}
          onChange={(v) => setTweak("sidebarCollapsed", v)}
        />

        <TweakSection label="State" />
        <TweakRadio
          label="Content"
          value={t.populated ? "populated" : "empty"}
          options={["populated", "empty"]}
          onChange={(v) => setTweak("populated", v === "populated")}
        />
        <TweakButton label="Reset to sample" onClick={requestResetToSample} />
      </TweaksPanel>
    </div>
  );
}

function defaultLabelFor(type) {
  return {
    text: "Untitled field",
    textarea: "Long answer",
    email: "Email",
    phone: "Phone",
    number: "Number",
    select: "Choose one",
    multiselect: "Choose any",
    date: "Date",
    daterange: "Date range",
    file: "Upload",
    price: "Price",
    toggle: "Toggle",
    time: "Time",
    checkbox: "Checkbox",
    dietary: "Dietary Restrictions",
    room: "Choose a room",
    addons: "Add-ons",
    rental_group: "Rental group",
    extras: "Extras",
    radio: "Choose one",
    groupselect: "Choose one",
    separator: "Separator Line",
    instructional: "Instructional text",
  }[type] || "Untitled field";
}

function relativeTime(ts) {
  const diff = Date.now() - ts;
  const s = Math.round(diff / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.round(h / 24)} d ago`;
}




export default function CollaburoHtmlApp({ initialSection = "workflow", publicMode = false, bookingSummaryMode = false }) {
  return <HtmlSourceApp initialSection={initialSection} forcePublicMode={publicMode} bookingSummaryMode={bookingSummaryMode} />;
}
