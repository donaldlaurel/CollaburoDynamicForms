"""Generate components/html-source/old-site-field-catalog.js from createevent_field_inventory.html."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "createevent_field_inventory.html"
OUT = ROOT / "components" / "html-source" / "old-site-field-catalog.js"

STEP_NAME_MAP = {
    "1. Personal Details": "Personal Details",
    "2. Event Details": "Event Details",
    "3. Venue Space": "Venue Space",
    "4. Layout": "Layout",
    "5. Rentals": "Rentals",
    "6. Catering": "Catering",
    "7. Additional Services": "Additional Services",
    "8. Additional Info": "Additional Info",
    "9. Submit Request": "Review & Submit",
}

# Old-site radio groups often use the first option text as the field label.
LABEL_BY_NAME = {
    "alcoholserved": "Alcohol on Site",
    "eventprivacy": "Event Privacy",
    "catering_required_radio": "Catering Required",
    "addon_beveragepackage_mh_radio": "Beverage Package",
    "addcost_buffettablewithlinen_mh": "Buffet Table with Wipeable Covers (Main Hall)",
    "addcost_buffettablewithlinen_bp": "Buffet Table with Wipeable Covers (Patio)",
}

DISCOUNT_FLAG_NAMES = {"notforprofit", "studentbody", "communityorg"}

DISCOUNT_FLAG_META = {
    "notforprofit": {
        "label": "Not for profit",
        "fieldDescription": "(only check this if you are a registered charity or a not-for-profit organization - proof may be requested)",
    },
    "studentbody": {
        "label": "Student Body",
        "fieldDescription": "(only check this if event is fully related to a school or university/college - proof may be requested)",
    },
    "communityorg": {
        "label": "Community Organization",
        "fieldDescription": "(only check this if you are a community group with an established public identity, such as a sports team, community theater, cultural or identity group or a religious gathering that are not a registered Not for Profit Group - proof may be requested)",
    },
}


def strip_step(step: str) -> str:
    return STEP_NAME_MAP.get(step, re.sub(r"^\d+\.\s*", "", step))


def kind_to_type(kind: str) -> str:
    return {
        "Text": "text",
        "Number": "number",
        "Textarea": "textarea",
        "Select": "select",
        "Radio group": "radio",
        "Checkbox": "toggle",
        "Checkbox group": "toggle",
        "Time": "time",
        "File": "file",
    }.get(kind, "text")


def option_objects(options):
    out = []
    for opt in options or []:
        label = str(opt.get("l") or opt.get("v") or "").strip()
        value = str(opt.get("v") or label).strip()
        if not label:
            continue
        # Admin radio/select often uses "Label|help" or plain label objects.
        if ":" in label and label.split(":", 1)[0].strip() in (
            "Public",
            "Semi Private",
            "Semi-private",
            "Private",
            "Yes",
            "No",
        ):
            head, rest = label.split(":", 1)
            out.append(f"{head.strip()}|{rest.strip()}")
        else:
            out.append({"label": label, "value": value})
    return out


def split_parenthetical(text: str):
    text = (text or "").strip()
    m = re.match(r"^(.*?)\s*\((.*)\)\s*$", text)
    if not m:
        return text, ""
    return m.group(1).strip(), f"({m.group(2).strip()})"


def expand_inventory_field(field: dict):
    step = strip_step(field["step"])
    space = field.get("space") or "Shared"
    kind = field.get("kind") or "Text"
    name = field.get("name") or ""
    label = LABEL_BY_NAME.get(name) or (field.get("label") or name or "Field").strip()
    user_req = bool(field.get("userReq"))
    admin_req = bool(field.get("adminReq"))
    placeholder = field.get("placeholder") or ""
    options = field.get("options") or []

    base_meta = {
        "oldSiteName": name,
        "oldSiteSpace": space,
        "oldSiteStep": step,
        "oldSiteUserRequired": user_req,
        "oldSiteAdminRequired": admin_req,
        "source": "old_site_inventory",
        "safeImport": True,
    }

    if kind == "Checkbox group" and options:
        expanded = []
        for opt in options:
            raw_label = str(opt.get("l") or "").strip()
            opt_name = str(opt.get("n") or "").strip()
            known = DISCOUNT_FLAG_META.get(opt_name)
            if known:
                field_label = known["label"]
                desc = known["fieldDescription"]
            else:
                short, desc = split_parenthetical(raw_label)
                field_label = short if desc else (raw_label or opt_name or label)
            expanded.append(
                {
                    **base_meta,
                    "oldSiteName": opt_name or name,
                    "label": field_label,
                    "type": "toggle",
                    "required": False,  # safest: never force required on import
                    "adminRequired": False,
                    "visibleToClient": True,
                    "linkedToPricing": opt_name in DISCOUNT_FLAG_NAMES
                    or any(k in (opt_name or "").lower() for k in ("notforprofit", "studentbody", "community")),
                    "fieldDescription": desc or "",
                    "helpText": "",
                    "placeholder": "",
                    "category": "Discount"
                    if opt_name in DISCOUNT_FLAG_NAMES
                    else ("Legal" if step == "Review & Submit" else ""),
                }
            )
        return expanded

    preset = {
        **base_meta,
        "label": label,
        "type": kind_to_type(kind),
        "required": False,
        "adminRequired": False,
        "visibleToClient": True,
        "linkedToPricing": False,
        "fieldDescription": "",
        "helpText": "",
        "placeholder": placeholder,
        "category": "",
    }

    if kind in ("Select", "Radio group") and options:
        preset["hasOptions"] = True
        preset["displayAs"] = "select" if kind == "Select" else "radio"
        mapped = option_objects(options)
        # Prefer pipe strings for simple radios with help text.
        if all(isinstance(o, str) for o in mapped):
            preset["options"] = mapped
        else:
            preset["options"] = [
                o if isinstance(o, dict) else {"label": str(o)} for o in mapped
            ]

    if kind == "File":
        preset["acceptedFiles"] = "image/*,.pdf"
        preset["allowMultipleFiles"] = False

    if space and space != "Shared":
        preset["helpText"] = f"Old site space: {space}"

    return [preset]


def load_inventory():
    html = HTML.read_text(encoding="utf-8")
    m = re.search(r"const DATA = (\{.*?\});\s*\n\s*function", html, re.S)
    if not m:
        raise SystemExit("Could not find DATA in inventory HTML")
    return json.loads(m.group(1))


def build_catalog(data: dict):
    by_step = {name: [] for name in STEP_NAME_MAP.values()}
    seen = set()  # (step, space, label_lower)

    for field in data.get("fields") or []:
        for preset in expand_inventory_field(field):
            step = preset["oldSiteStep"]
            key = (
                step,
                preset.get("oldSiteSpace") or "Shared",
                (preset.get("label") or "").strip().lower(),
            )
            if key in seen:
                continue
            seen.add(key)
            by_step.setdefault(step, []).append(preset)

    return by_step


def main():
    data = load_inventory()
    catalog = build_catalog(data)
    shared_counts = {
        step: sum(1 for p in presets if (p.get("oldSiteSpace") or "Shared") == "Shared")
        for step, presets in catalog.items()
    }
    total = sum(len(v) for v in catalog.values())

    banner = (
        "// Auto-generated from createevent_field_inventory.html — do not edit by hand.\n"
        "// Regenerate: python scripts/generate-old-site-field-catalog.py\n"
        f"// Fields: {total} (shared-only counts: {json.dumps(shared_counts)})\n"
    )
    body = (
        "export const OLD_SITE_FIELD_CATALOG_VERSION = \"2026-09-21\";\n"
        "export const OLD_SITE_FIELD_CATALOG = "
        + json.dumps(catalog, indent=2, ensure_ascii=False)
        + ";\n\n"
        "export function oldSitePresetsForStep(stepName = \"\") {\n"
        "  const key = String(stepName || \"\").trim();\n"
        "  return Array.isArray(OLD_SITE_FIELD_CATALOG[key]) ? OLD_SITE_FIELD_CATALOG[key] : [];\n"
        "}\n\n"
        "export function oldSiteSharedPresetsForStep(stepName = \"\") {\n"
        "  return oldSitePresetsForStep(stepName).filter((p) => (p.oldSiteSpace || \"Shared\") === \"Shared\");\n"
        "}\n"
    )
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(banner + body, encoding="utf-8")
    print(f"Wrote {OUT} ({total} presets)")


if __name__ == "__main__":
    main()
