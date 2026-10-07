"""Generate components/html-source/old-site-tooltip-catalog.js from the old createevent.php.

Every old-site info tooltip is a <span class="mytooltip"> placed right after the
form control it describes, holding product photos (thumbnail linked to a hi-res
copy, sometimes captioned with a choice such as "White") and/or text. This
script pairs each tooltip with the nearest preceding control and label, maps it
to a rental item / option group / form field of the new site, merges the copies
repeated per space (Main Hall, Large Room, Back Patio...), and downloads the
thumbnails to public/old-site/tooltips/ so they do not depend on the old server.

Usage:
  python scripts/generate-old-site-tooltip-catalog.py [path/to/createevent.html]
  (without a path the page is downloaded from https://collaburo.space/createevent.php)
"""
import json
import re
import sys
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "components" / "html-source" / "old-site-tooltip-catalog.js"
IMAGE_DIR = ROOT / "public" / "old-site" / "tooltips"
IMAGE_URL_PREFIX = "/old-site/tooltips/"
PAGE_URL = "https://collaburo.space/createevent.php"
OLD_SITE = "https://collaburo.space/"
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}

# Control-name suffixes the old site added per space / widget, in any order.
STEM_SUFFIX = re.compile(r"(?:__INDEX__|[_-](?:mh|lr|bp|sr|ea|ckbx|chksh|sel|chk))$")

# Tooltips that describe an option group rather than the rental item itself.
# control stem -> (item names, option group pattern)
GROUP_TARGETS = {
    "noofrectangl6tables": (["Rectangular 6' Table"], "^table covers"),
    "noofrectangl8tables": (["Rectangular 8' Table"], "^table covers"),
    "create_noofrectangl8tables": (["Rectangular 8' Table"], "^table covers"),
    "noofroundtables": (["Round Tables"], "^table covers"),
    "create_noofroundtables": (["Round Tables"], "^table covers"),
    "rdbtn_rectangl6tablelinens": (["Rectangular 6' Table"], "colou?r"),
    "rdbtn_rectangl8tablelinens": (["Rectangular 8' Table"], "colou?r"),
    "rdbtn_roundtablelinens": (["Round Tables"], "colou?r"),
    "rectangl4tablelinens": (["Rectangular 4' Table"], "colou?r"),
    "rectangl5tablelinens": (["Rectangular 5' Table"], "colou?r"),
    "cocktailtablelinens": (["Cocktail Tables"], "spandex"),
    "create_noofseats": (["Chairs"], "type"),
    "create_typeofchairs": (["Chairs"], "cover"),
}

# Tooltips that describe a single choice inside an option group.
# control stem -> (item names, option group pattern, option label)
OPTION_TARGETS = {
    "dinnerware_cutlery_dessertspoon": (["Cutlery - Simple"], "dessert", "Dessert Spoon"),
    "dinnerware_cutlery_dessertfork": (["Cutlery - Simple"], "dessert", "Dessert Fork"),
}

# Rental items whose new-site name differs from the old label; names ending in
# "*" match by prefix.
ITEM_NAMES = {
    "rental_others": ["Greenery*"],
    "noofcenterpieces": ["Clear Glass Vase*"],
    "dinnerware_disposableplates": ["Disposable Dinner Plate*"],
    "dinnerware_disposablecakeplates": ["Disposable Cake Plate*"],
    "dinnerware_cutlery_simple": ["Cutlery - Simple*"],
    "addcost_labourtime_helper": ["Labour Time - Helper", "Labour Time (Helper)"],
    "addcost_projectorscreen_lr": ["Projector - Large Room"],
    "mh_others_mobiletv": ["Mobile TV*"],
    "addcost_outdoorspeaker": ["Mobile Speaker"],
    "inccost_speaker": ["Mobile Speaker"],
}

# Form fields (non-rental steps). control stem -> (field label pattern, option label or None)
FIELD_TARGETS = {
    "special_notes": ("blackboard", None),
    # The old Beverage Package radio had no <label>, so its tooltip follows the Delivery checkbox.
    "thirdpartyrentals": ("beverage package", None),
    "addcost_buffettablewithlinen": ("^buffet table", "Buffet Table with Wipeable Covers (for Large Room)"),
    "buffettablespandex": ("^buffet table", "Buffet Tables Spandex Covers"),
    "addon_wifi": ("^add-?ons", "Wi-Fi"),
    "addon_sinkaccess": ("^add-?ons", "Sink Access"),
    "addon_minifridge": ("^add-?ons", "Mini Fridge - Floor"),
    "addon_minifridge_ctr": ("^add-?ons", "Mini Fridge - Counter"),
    "addon_accessibilityelevator": ("^add-?ons", "Accessibility Elevator"),
    "addon_bigfridgeaccess": ("^add-?ons", "Big Fridge Access"),
    "addon_kitchenaccess": ("^add-?ons", "Kitchen Access"),
    "inccost_printer": ("^add-?ons", "Printer Access"),
}

# Old photo captions that differ from the new choice labels.
CAPTION_ALIASES = {
    "Gray": "Grey Sofa",
    "Yellow": "Yellow Chair",
    "With Electricity": "Seat with electric outlet",
    "Without Electricity": "Seat",
    "White Seats": "White Resin Chairs",
}


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def absolute(url: str) -> str:
    url = (url or "").strip()
    if not url or re.match(r"^(https?:)?//", url) or url.startswith("data:"):
        return url
    return OLD_SITE + url.lstrip("/")


def stem(name: str) -> str:
    name = name or ""
    while True:
        shorter = STEM_SUFFIX.sub("", name)
        if shorter == name:
            return name
        name = shorter


def clean_label(label: str) -> str:
    return re.sub(r"\s*:\s*$", "", clean(label))


class TooltipParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tooltips = []
        self.last_control = ""
        self.last_label = ""
        self.label_buf = None
        self.label_depth = 0
        self.depth = 0
        self.tip = None
        self.tip_depth = 0
        self.link_href = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        cls = a.get("class") or ""
        if tag not in VOID:
            self.depth += 1

        if self.tip is not None:
            if tag == "a" and a.get("href"):
                self.link_href = a["href"]
            elif tag == "img" and a.get("src"):
                self.tip["images"].append({"thumb": absolute(a["src"]), "full": absolute(self.link_href or a["src"]), "caption": ""})
            elif tag in ("p", "br", "li", "div") and self.tip["text"] and not self.tip["text"][-1].endswith("\n"):
                self.tip["text"].append("\n")
            if "product_label" in cls:
                self.tip["caption_depth"] = self.depth
            return

        if tag == "span" and "mytooltip" in cls.split():
            self.tip = {"control": self.last_control, "label": self.last_label, "images": [], "text": [], "caption_depth": None}
            self.tip_depth = self.depth
            return

        if tag in ("input", "select", "textarea") and a.get("name"):
            if (a.get("type") or tag) not in ("hidden", "submit", "button"):
                self.last_control = a["name"]
        if tag == "label":
            self.label_buf = []
            self.label_depth = self.depth

    def handle_endtag(self, tag):
        if self.tip is not None:
            if tag == "a":
                self.link_href = None
            if self.tip["caption_depth"] is not None and self.depth == self.tip["caption_depth"]:
                self.tip["caption_depth"] = None
            if self.depth == self.tip_depth:
                self.finish_tip()
        elif tag == "label" and self.label_buf is not None and self.depth == self.label_depth:
            self.last_label = clean("".join(self.label_buf))
            self.label_buf = None
        if tag not in VOID:
            self.depth -= 1

    def handle_data(self, data):
        if self.tip is not None:
            if self.tip["caption_depth"] is not None and self.tip["images"]:
                img = self.tip["images"][-1]
                img["caption"] = clean(img["caption"] + " " + data)
            else:
                self.tip["text"].append(data)
        elif self.label_buf is not None:
            self.label_buf.append(data)

    def finish_tip(self):
        tip = self.tip
        self.tip = None
        lines = [clean(line) for line in "".join(tip.pop("text")).split("\n")]
        # Long "captions" are really the item description shown under the photo.
        for img in tip["images"]:
            if len(img["caption"].split()) > 5:
                lines.append(img["caption"])
                img["caption"] = ""
        tip["text"] = "\n".join(line for line in lines if line)
        tip.pop("caption_depth", None)
        self.tooltips.append(tip)


def target_for(tip: dict) -> dict:
    control = tip["control"]
    base = stem(control)
    label = clean_label(tip["label"])
    if base in FIELD_TARGETS:
        field, option = FIELD_TARGETS[base]
        return {"kind": "field", "field": field, "option": option}
    if base in OPTION_TARGETS:
        names, group, option = OPTION_TARGETS[base]
        return {"kind": "rental", "items": names, "group": group, "option": option}
    if base in GROUP_TARGETS:
        names, group = GROUP_TARGETS[base]
        return {"kind": "rental", "items": names, "group": group, "option": None}
    names = ITEM_NAMES.get(re.sub(r"-.*$", "", control)) or ITEM_NAMES.get(base)
    if names:
        return {"kind": "rental", "items": names, "group": None, "option": None}
    return {"kind": "rental", "items": [label], "keys": [base], "group": None, "option": None}


def target_key(target: dict) -> str:
    return json.dumps({k: target.get(k) for k in ("kind", "items", "field", "group", "option")}, sort_keys=True)


IMAGE_MAGIC = (b"\xff\xd8", b"\x89PNG", b"GIF8", b"RIFF")


def local_image(url: str, cache: dict) -> str:
    """Local copy of an old-site image, or "" when the old link is broken."""
    if url in cache:
        return cache[url]
    name = re.sub(r"[^A-Za-z0-9._-]+", "_", url.rsplit("/", 1)[-1])
    if any(IMAGE_URL_PREFIX + name == used for used in cache.values()):
        name = re.sub(r"[^A-Za-z0-9._-]+", "_", url.split("/images/", 1)[-1])
    path = IMAGE_DIR / name
    if not path.exists():
        try:
            with urllib.request.urlopen(url, timeout=60) as res:
                path.write_bytes(res.read())
        except OSError:
            cache[url] = ""
            return ""
    # Missing old-site files come back as an HTML page instead of an error.
    if not path.read_bytes()[:4].startswith(IMAGE_MAGIC):
        path.unlink()
        cache[url] = ""
        return ""
    cache[url] = IMAGE_URL_PREFIX + name
    return cache[url]


def fits_item(src: str, entry: dict) -> bool:
    names = " ".join(entry.get("items") or []).lower()
    file = src.rsplit("/", 1)[-1].lower()
    return ("rectang" in names and "rect" in file) or ("round" in names and "round" in file)


def build_targets(tips: list) -> list:
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    merged, cache = {}, {}
    for tip in tips:
        if not tip["images"] and not tip["text"]:
            continue
        target = target_for(tip)
        entry = merged.setdefault(target_key(target), {**target, "text": "", "images": []})
        for key in target.get("keys") or []:
            if key not in entry.setdefault("keys", []):
                entry["keys"].append(key)
        if tip["text"] and not entry["text"]:
            entry["text"] = tip["text"]
        for img in tip["images"]:
            src = local_image(img["thumb"], cache)
            if not src or any(existing["src"] == src for existing in entry["images"]):
                continue
            caption = CAPTION_ALIASES.get(img["caption"], img["caption"])
            same_caption = next((existing for existing in entry["images"] if caption and existing.get("caption") == caption), None)
            if same_caption:
                # Some spaces reused another table's swatches; keep the photo that matches the item.
                if fits_item(src, entry) and not fits_item(same_caption["src"], entry):
                    same_caption["src"] = src
                continue
            entry["images"].append({"src": src, "caption": caption} if caption else {"src": src})
    return list(merged.values())


def main():
    if len(sys.argv) > 1:
        html = Path(sys.argv[1]).read_text(encoding="utf-8", errors="replace")
    else:
        with urllib.request.urlopen(PAGE_URL, timeout=180) as res:
            html = res.read().decode("utf-8", errors="replace")
    parser = TooltipParser()
    parser.feed(html)
    targets = build_targets(parser.tooltips)
    images = {img["src"] for t in targets for img in t["images"]}
    for path in IMAGE_DIR.iterdir():
        if IMAGE_URL_PREFIX + path.name not in images:
            path.unlink()
    OUT.write_text(
        "// Auto-generated from the old createevent.php info tooltips - do not edit by hand.\n"
        "// Regenerate: python scripts/generate-old-site-tooltip-catalog.py [path/to/createevent.html]\n"
        f"// Old-site tooltips: {len(parser.tooltips)}, targets: {len(targets)}, images: {len(images)}\n"
        "export const OLD_SITE_TOOLTIPS = "
        + json.dumps(targets, indent=2, ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )
    print(f"wrote {OUT.relative_to(ROOT)}: {len(parser.tooltips)} tooltips -> {len(targets)} targets, {len(images)} images in {IMAGE_DIR.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
