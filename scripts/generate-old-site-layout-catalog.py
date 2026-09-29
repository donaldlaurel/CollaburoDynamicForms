"""Generate components/html-source/old-site-layout-catalog.js from collaburo_layout/*.php.

Each old-site space page hard-coded its floor layouts as PHP arrays of
[image, includes, chairs, label, capacity] plus an event-type -> layout-category
map. This script flattens those into preset groups (one per layout area) that
the Layout step can import as floor layouts. Main Hall's per-attendee tiers
repeat the same layouts, so entries are de-duplicated by label + image.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "collaburo_layout"
OUT = ROOT / "components" / "html-source" / "old-site-layout-catalog.js"
IMAGE_BASE = "https://collaburo.space/"

CATEGORY_LABELS = {
    "circular": "Round Tables",
    "rectangular": "Rectangular Banquet",
    "rectangular_open": "Rectangular + Open Space",
    "theatre": "Theatre",
    "conference": "Conference / Boardroom",
    "classroom": "Classroom",
    "cocktail": "Cocktail",
    "bazaar": "Bazaar",
    "ceremony": "Ceremony",
}

EVENT_TYPE_NAMES = {
    "Other (B)": "Other - Business and non-alcoholic events",
    "Other": "Other - Social and/or alcoholic events",
}

STR = r'"((?:[^"\\]|\\.)*)"'


def block(text: str, start_pattern: str) -> str:
    """Return the PHP array literal that starts at start_pattern (bracket-balanced)."""
    m = re.search(start_pattern, text)
    if not m:
        raise ValueError(f"pattern not found: {start_pattern}")
    i = text.index("[", m.end() - 1)
    depth = 0
    in_str = escaped = False
    for j in range(i, len(text)):
        ch = text[j]
        if in_str:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == '"':
                in_str = False
        elif ch == '"':
            in_str = True
        elif ch == "[":
            depth += 1
        elif ch == "]":
            depth -= 1
            if depth == 0:
                return text[i:j + 1]
    raise ValueError(f"unbalanced array for {start_pattern}")


def lines_of(*parts: str) -> list:
    out = []
    for part in parts:
        for piece in re.split(r"<\s*/?\s*br\s*/?\s*>", part or "", flags=re.I):
            piece = re.sub(r"\s+", " ", piece).strip()
            if piece:
                out.append(piece)
    return out


def seats(capacity: str) -> int:
    m = re.search(r"\d+", capacity or "")
    return int(m.group(0)) if m else 0


def layout(preset_id, name, category, image, capacity, description, event_types):
    return {
        "presetId": preset_id,
        "name": re.sub(r"\s+", " ", name).strip(),
        "category": category,
        "image": IMAGE_BASE + image if image else "",
        "capacityText": capacity,
        "recommendedFor": seats(capacity),
        "description": description,
        "eventTypes": event_types,
        "guestMin": 0,
        "guestMax": 0,
    }


def parse_event_type_map(text: str, var: str) -> dict:
    """Invert $options_dict: layout category -> [event types]."""
    by_category = {}
    for event_type, cats in re.findall(STR + r"\s*=>\s*\[([^\]]*)\]", block(text, rf"\${var}\s*=\s*\[")):
        name = EVENT_TYPE_NAMES.get(event_type, event_type)
        for cat in re.findall(STR, cats):
            by_category.setdefault(cat, [])
            if name not in by_category[cat]:
                by_category[cat].append(name)
    return by_category


def guest_range(tiers: set, bounds: list) -> tuple:
    """Merge the attendee tiers a layout appears in into one guest range (0 = unbounded)."""
    if not bounds or len(tiers) == len(bounds):
        return 0, 0
    return bounds[min(tiers)][0], bounds[max(tiers)][1]


def parse_floor_layouts(text: str, mapping_var: str, options_var: str, tier_bounds=None) -> list:
    """tier_bounds: (min, max) guests per nested attendee tier, as in Main Hall's $capacityIndex."""
    body = block(text, rf"\${mapping_var}\s*=\s*\[")
    event_types = parse_event_type_map(text, options_var)
    cat_re = "|".join(CATEGORY_LABELS)
    token = re.compile(
        rf'"(?P<cat>{cat_re})"\s*=>|'
        + r'(?P<tier>\[)(?=\s*"[^"]*"\s*=>)|'
        + STR.replace("(", "(?P<id>", 1) + r"\s*=>\s*\[\s*"
        + r"\s*,\s*".join(STR.replace("(", f"(?P<f{n}>", 1) for n in range(5))
        + r"\s*\]"
    )
    out, by_key, category, tier = [], {}, None, -1
    for m in token.finditer(body):
        if m.group("cat"):
            category, tier = m.group("cat"), -1
            continue
        if m.group("tier"):
            tier += 1
            continue
        img, includes, chairs, label, capacity = (m.group(f"f{n}") for n in range(5))
        key = (label, img)
        if key not in by_key:
            by_key[key] = (layout(m.group("id"), label, CATEGORY_LABELS[category], img, capacity,
                                  lines_of(includes, chairs), event_types.get(category, [])), set())
            out.append(by_key[key][0])
        by_key[key][1].add(max(tier, 0))
    for entry, tiers in by_key.values():
        entry["guestMin"], entry["guestMax"] = guest_range(tiers, tier_bounds)
    return out


def parse_raised_area(text: str) -> dict:
    body = block(text, r"\$raised_area_options_map\s*=\s*\[")
    token = re.compile(
        r'"(?P<group>raised_area_\w+)"\s*=>|\[\s*'
        + r"\s*,\s*".join(STR.replace("(", f"(?P<f{n}>", 1) for n in range(5))
        + r"\s*\]"
    )
    groups, current = {}, None
    for m in token.finditer(body):
        if m.group("group"):
            current = m.group("group")
            groups[current] = []
            continue
        preset_id, label, img, includes, capacity = (m.group(f"f{n}") for n in range(5))
        groups[current].append(layout(preset_id, label, "Raised Area", img, capacity, lines_of(includes), []))
    return groups


def parse_stage(text: str) -> list:
    body = block(text, r"\$options_map\s*=\s*\[")
    entry = re.compile(
        STR + r"\s*=>\s*\[\s*" + r"\s*,\s*".join([STR] * 4) + r"\s*\]"
    )
    return [
        layout(preset_id, label, "Stage", img, capacity, lines_of(includes), [])
        for label, preset_id, img, includes, capacity in entry.findall(body)
    ]


def parse_small_room(text: str) -> list:
    return [
        layout("sr_floorlayout_" + str(i), label, "Small Room", "", "", [], [])
        for i, label in enumerate(re.findall(STR, block(text, r"\$options_sr\s*=\s*\[")))
    ]


def main() -> None:
    mh = (SRC / "createevent_layout_mh.php").read_text(encoding="utf-8")
    lr = (SRC / "createevent_layout_lr.php").read_text(encoding="utf-8")
    bp = (SRC / "createevent_layout_bp.php").read_text(encoding="utf-8")
    sr = (SRC / "createevent_layout_sr.php").read_text(encoding="utf-8")
    raised = parse_raised_area(mh)

    groups = [
        {"key": "mh_floor", "venue": "Main Hall", "title": "Main Hall - Floor layouts", "kind": "floor", "match": [],
         "layouts": parse_floor_layouts(mh, "image_mapping_dict", "options_dict", [(0, 40), (41, 60), (61, 0)])},
        {"key": "mh_raised_deep", "venue": "Main Hall", "title": "Main Hall - Raised Area + Deep Half Elevated Area", "kind": "area", "match": ["deep"],
         "layouts": raised.get("raised_area_deep", [])},
        {"key": "mh_raised_half", "venue": "Main Hall", "title": "Main Hall - Raised Area + Half Elevated Area", "kind": "area", "match": ["half"],
         "layouts": raised.get("raised_area_half", [])},
        {"key": "mh_raised_full", "venue": "Main Hall", "title": "Main Hall - Raised Area + Full Elevated Area", "kind": "area", "match": ["full"],
         "layouts": raised.get("raised_area_full", [])},
        {"key": "mh_stage", "venue": "Main Hall", "title": "Main Hall - Stage", "kind": "area", "match": ["stage"],
         "layouts": parse_stage(mh)},
        {"key": "mh_raised_only", "venue": "Main Hall", "title": "Main Hall - Raised Area (no Elevated Area)", "kind": "area", "match": ["raised", "elevated"],
         "layouts": raised.get("raised_area_only", [])},
        {"key": "lr_floor", "venue": "Large Room", "title": "Large Room - Floor layouts", "kind": "floor", "match": [],
         "layouts": parse_floor_layouts(lr, "image_mapping_dict_lr", "options_dict_lr")},
        {"key": "bp_floor", "venue": "Back Patio", "title": "Back Patio - Floor layouts", "kind": "floor", "match": [],
         "layouts": parse_floor_layouts(bp, "image_mapping_dict_bp", "options_dict_bp")},
        {"key": "sr_floor", "venue": "Small Room", "title": "Small Room - Floor layouts", "kind": "floor", "match": [],
         "layouts": parse_small_room(sr)},
    ]

    total = sum(len(g["layouts"]) for g in groups)
    OUT.write_text(
        "// Auto-generated from collaburo_layout/*.php - do not edit by hand.\n"
        "// Regenerate: python scripts/generate-old-site-layout-catalog.py\n"
        f"// Groups: {len(groups)}, layouts: {total}\n"
        "export const OLD_SITE_LAYOUT_GROUPS = "
        + json.dumps(groups, indent=2, ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )
    for g in groups:
        print(f"{g['key']:16} {len(g['layouts']):3} layouts")
    print(f"wrote {OUT.relative_to(ROOT)} ({total} layouts)")


if __name__ == "__main__":
    main()
