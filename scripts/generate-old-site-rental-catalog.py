"""Generate components/html-source/old-site-rental-catalog.js from createevent_field_inventory.html.

The old site split each rental into a checkbox (real label), a quantity select
(raw name label, range values like "1-100") and sometimes a style radio
(Regular / Gold-edge). This script folds those into one rental item per label.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "createevent_field_inventory.html"
OUT = ROOT / "components" / "html-source" / "old-site-rental-catalog.js"

SPACE_SUFFIX = re.compile(r"(?:[_-](?:mh|bp|lr|ea|sr))(?:[_-](?:ckbx|chksh|sel))?$|[_-](?:ckbx|chksh)$")

SKIP_PREFIXES = ("lr_question", "mh_question", "rental_", "services_", "space_", "total_")
SKIP_LABELS = {"yes", "no", "others", "space contents", "seat", "seat with electric outlet", "grey sofa", "yellow chair"}

SERVING_KEYWORDS = ("chafing", "sterno", "soupwarmer", "waterjug", "hotwater", "icetongs", "tongs", "servingspoon", "saladspoon", "cakeknife", "kettle", "coffeemachine")
AV_KEYWORDS = ("tv", "camera", "mic", "speaker", "monitor", "phone", "projector", "clicker", "sound", "headset", "cable", "labourtime_it", "avdeluxe")
TABLEWARE_PREFIXES = ("dinnerware_", "bread_", "coffee_", "dessert_", "saladsoup_", "teacup", "multipurpose_", "speciality_", "stemless_", "waterwine_")


def stem(name: str) -> str:
    return SPACE_SUFFIX.sub("", name or "")


def compact(text: str) -> str:
    return re.sub(r"[^a-z0-9]", "", (text or "").lower())


def slug(text: str) -> str:
    return re.sub(r"_+", "_", re.sub(r"[^a-z0-9]+", "_", (text or "").lower())).strip("_")


def category_for(base: str, label: str) -> str:
    key = compact(base)
    low = label.lower()
    if base.startswith(("addonflowers", "noofcenterpieces", "noofclearglassvases")):
        return "Centerpieces"
    if any(k in key for k in SERVING_KEYWORDS) or "crock-pot" in low:
        return "Serving Equipment"
    if base.startswith(TABLEWARE_PREFIXES):
        return "Dinnerware"
    if base.startswith(("addcost_", "inccost_")) and any(k in base.lower() for k in AV_KEYWORDS):
        return "AV / Tech"
    return "Decor / Other"


def quantity_range(options):
    for opt in options or []:
        m = re.match(r"^\s*(\d+)\s*-\s*(\d+)\s*$", str(opt.get("v") or ""))
        if m:
            return int(m.group(1)), int(m.group(2))
    return None


def clean_choice_label(text: str) -> str:
    return re.sub(r"\s*\(\s*\)\s*$", "", (text or "").strip())


def load_inventory():
    html = HTML.read_text(encoding="utf-8")
    m = re.search(r"const DATA = (\{.*?\});\s*\n\s*function", html, re.S)
    if not m:
        raise SystemExit("Could not find DATA in inventory HTML")
    return json.loads(m.group(1))


def build_items(data: dict):
    fields = [f for f in data.get("fields") or [] if str(f.get("step", "")).startswith("5.")]
    selects = [f for f in fields if f.get("kind") == "Select"]
    radios = [f for f in fields if f.get("kind") == "Radio group"]

    items = {}
    for field in fields:
        if field.get("kind") != "Checkbox":
            continue
        name = field.get("name") or ""
        label = (field.get("label") or "").strip()
        if not label or "_" in label or label.lower() in SKIP_LABELS or name.startswith(SKIP_PREFIXES):
            continue
        base = stem(name)
        space = field.get("space") or "Shared"
        key = compact(label)
        item = items.get(key)
        if not item:
            item = items[key] = {
                "id": "old_" + slug(base),
                "name": label,
                "category": category_for(base, label),
                "oldSiteName": base,
                "oldSiteSpaces": [],
                "optionGroups": [],
            }
        if space not in item["oldSiteSpaces"]:
            item["oldSiteSpaces"].append(space)

        base_key = compact(base)
        if "minUnits" not in item:
            for sel in selects:
                if (sel.get("space") or "Shared") != space:
                    continue
                sel_key = compact(re.sub(r"(v|_sel)$", "", stem(sel.get("name") or "")))
                if sel_key == base_key or sel_key.rstrip("v") == base_key:
                    rng = quantity_range(sel.get("options"))
                    if rng:
                        item["minUnits"], item["maxUnits"] = rng
                        break

        if not item["optionGroups"]:
            for radio in radios:
                if (radio.get("space") or "Shared") != space:
                    continue
                if not stem(radio.get("name") or "").startswith(base + "_"):
                    continue
                opts = [
                    {"id": slug(str(o.get("v") or o.get("l"))), "label": clean_choice_label(o.get("l") or o.get("v")), "pricingModel": "included", "unitPrice": 0}
                    for o in radio.get("options") or []
                    if (o.get("l") or o.get("v"))
                ]
                if len(opts) >= 2 and {o["id"] for o in opts} != {"yes", "no"}:
                    item["optionGroups"].append({
                        "id": slug(stem(radio.get("name") or "")),
                        "label": "Style",
                        "type": "radio",
                        "quantitySource": "fixed",
                        "required": False,
                        "options": opts,
                    })
                    break

    return sorted(items.values(), key=lambda i: (i["category"], i["name"].lower()))


def main():
    items = build_items(load_inventory())
    banner = (
        "// Auto-generated from createevent_field_inventory.html — do not edit by hand.\n"
        "// Regenerate: python scripts/generate-old-site-rental-catalog.py\n"
        f"// Items: {len(items)}\n"
    )
    body = "export const OLD_SITE_RENTAL_ITEMS = " + json.dumps(items, indent=2, ensure_ascii=False) + ";\n"
    OUT.write_text(banner + body, encoding="utf-8")
    print(f"Wrote {OUT} ({len(items)} items)")


if __name__ == "__main__":
    main()
