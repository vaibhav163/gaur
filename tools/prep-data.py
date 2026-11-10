#!/usr/bin/env python3
"""Gaurs site data prep.

Reads the verified inventory (workspace/research_notes/gaurs-group/inventory.json,
scraped from the OFFICIAL gaursonsindia.com on 2026-11-09), downloads the
official project images, converts them to WebP, generates branded
placeholders for projects without photos, builds the brand assets
(logo copy, favicons, OG image, city + home hero images) and writes
projects-data.json in the schema the React app consumes.

Facts, RERA numbers and prices come ONLY from the inventory (official
pages). Nothing is invented: no price -> "Price on Request" in the UI,
no RERA -> reraNote / Coming Soon handling in the UI.
"""
import io, json, os, sys, time, urllib.request
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WS = os.path.dirname(ROOT)
INV = json.load(open(os.path.join(WS, "research_notes/gaurs-group/inventory.json")))
LOGO_SRC = os.path.join(WS, "research_notes/gaurs-group/assets/gaurs-logo.png")
PUB = os.path.join(ROOT, "public")
IMG_DIR = os.path.join(PUB, "images", "projects")
os.makedirs(IMG_DIR, exist_ok=True)
os.makedirs(os.path.join(PUB, "images", "city"), exist_ok=True)
os.makedirs(os.path.join(PUB, "images", "home"), exist_ok=True)
os.makedirs(os.path.join(PUB, "assets"), exist_ok=True)

UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"}
NAVY = (13, 32, 66)
NAVY2 = (20, 46, 92)
CREAM = (248, 245, 238)
GOLD = (176, 141, 63)

CACHE = "/tmp/gaurs-img-cache"
os.makedirs(CACHE, exist_ok=True)
import hashlib, re

def fetch(url, tries=2):
    key = os.path.join(CACHE, hashlib.sha256(url.encode()).hexdigest())
    if os.path.exists(key):
        return open(key, "rb").read()
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=30) as r:
                data = r.read()
            open(key, "wb").write(data)
            return data
        except Exception as e:
            print("  fetch fail", url, e)
            time.sleep(1)
    return None

def slugify(text):
    s = re.sub(r"[^a-z0-9]+", "-", (text or "").lower()).strip("-")
    return re.sub(r"-+", "-", s)

def to_webp(raw, dest, max_w):
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    if im.width > max_w:
        im = im.resize((max_w, int(im.height * max_w / im.width)), Image.LANCZOS)
    im.save(dest, "WEBP", quality=82)
    return dest

SERIF_B = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
SANS_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

logo_im = Image.open(LOGO_SRC).convert("RGBA")

def placeholder(name, locality, city, dest):
    W, H = 1600, 1000
    im = Image.new("RGB", (W, H), CREAM)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 14], fill=GOLD)
    d.rectangle([0, H - 14, W, H], fill=GOLD)
    lg = logo_im.copy()
    lg.thumbnail((520, 210))
    im.paste(lg, ((W - lg.width) // 2, 150), lg)
    f1 = ImageFont.truetype(SERIF_B, 74)
    f2 = ImageFont.truetype(SANS, 40)
    f3 = ImageFont.truetype(SANS_B, 30)
    y = 430
    # wrap name to max ~24 chars/line
    words, lines, cur = name.split(), [], ""
    for w in words:
        if len(cur) + len(w) + 1 > 24:
            lines.append(cur); cur = w
        else:
            cur = (cur + " " + w).strip()
    if cur: lines.append(cur)
    for ln in lines[:2]:
        d.text((W // 2, y), ln, font=f1, fill=NAVY, anchor="ma")
        y += 92
    d.line([W // 2 - 90, y + 8, W // 2 + 90, y + 8], fill=GOLD, width=4)
    d.text((W // 2, y + 30), f"{locality}, {city}", font=f2, fill=(60, 60, 60), anchor="ma")
    d.text((W // 2, H - 110), "PROJECT PHOTO COMING SOON", font=f3, fill=GOLD, anchor="ma")
    im.save(dest, "WEBP", quality=85)

CITY_SLUG = {"Noida": "noida", "Greater Noida": "greater-noida", "Ghaziabad": "ghaziabad"}

SLUG_FIX = {
    "gauralaris.com": "gaur-alaris",
    "gaurchrysalis.com": "gaur-chrysalis",
    "legacybygaurs.com": "legacy-by-gaurs",
    "gaurnycresidences.com": "gaur-nyc-residences",
    "aspireleisureparkbygaurs.in": "aspire-leisure-park-by-gaurs",
    "aspirecenturianparkbygaurs.in": "aspire-centurian-park-by-gaurs",
}

projects, dl_fail = [], []
used_slugs = set()
for p in INV["projects"]:
    slug = SLUG_FIX.get(p.get("slug") or "", p.get("slug")) or slugify(p["name"])
    p = dict(p)
    for f in ("locality", "configuration", "unitSizes", "possession"):
        if p.get(f):
            p[f] = re.sub(r"\s*\([^)]*\)", "", str(p[f])).strip()
    if slug in used_slugs:
        slug = slug + "-" + slugify((p.get("locality") or "").split(",")[0])
    n = 2
    base = slug
    while slug in used_slugs:
        slug = f"{base}-{n}"; n += 1
    used_slugs.add(slug)
    city_slug = CITY_SLUG[p["city"]]
    loc = (p.get("locality") or "").strip()
    location = loc if (not loc or p["city"] in loc) else f"{loc}, {p['city']}"
    pdir = os.path.join(IMG_DIR, slug)
    os.makedirs(pdir, exist_ok=True)

    hero_path = ""
    if p.get("heroImage"):
        raw = fetch(p["heroImage"])
        if raw:
            try:
                to_webp(raw, os.path.join(pdir, "hero.webp"), 1600)
                hero_path = f"/images/projects/{slug}/hero.webp"
            except Exception as e:
                print("  hero convert fail", slug, e)
    if not hero_path:
        placeholder(p["name"], loc or p["city"], p["city"], os.path.join(pdir, "hero.webp"))
        hero_path = f"/images/projects/{slug}/hero.webp"
        dl_fail.append(slug)

    gallery = []
    seen = {p.get("heroImage")}
    for i, g in enumerate(p.get("galleryImages") or []):
        if g in seen: continue
        seen.add(g)
        raw = fetch(g)
        if not raw: continue
        try:
            to_webp(raw, os.path.join(pdir, f"gallery-{len(gallery)+1}.webp"), 1400)
            gallery.append(f"/images/projects/{slug}/gallery-{len(gallery)+1}.webp")
        except Exception as e:
            print("  gallery convert fail", slug, e)

    def clean_spec(s):
        # strip researcher parentheticals from short spec fields, e.g.
        # "4 BHK (as captioned in ...)" -> "4 BHK"
        s = re.sub(r"\s*\([^)]*\)", "", (s or "")).strip()
        return re.sub(r"\s+", " ", s).strip(" ,")
    raw_price = (p.get("price") or "").strip().rstrip("*").strip()
    if raw_price:
        price = raw_price.replace("Lakhs", "L").replace("Onwards", "onwards")
        if not price.startswith("₹"):
            price = "₹" + price
    elif (p.get("priceAsPrinted") or "").startswith("Leasing"):
        price = "Leasing options available"
    else:
        price = ""
    rera = (p.get("rera") or "").strip()
    status = p["status"]
    if "Units Available" in (p.get("statusAsPrinted") or ""):
        status = "Ready to Move"
    rera_note = ""
    if not rera:
        if "aspire" in slug:
            rera_note = "Supreme Court monitored project (executed through NBCC India Ltd.) — as stated on the official project page"
        elif status == "Delivered" or status == "Ready to Move":
            rera_note = "No RERA number published on the official project page"
    config = (p.get("configuration") or "").strip()
    sizes = (p.get("unitSizes") or "").strip()
    if not config and sizes:
        config = sizes
    overview = (p.get("overview") or "").strip()
    if len(overview) < 80:
        overview = (f"{p['name']} is a {p['type'].lower()} project by Gaurs Group at {location}, "
                    f"listed as {p['status'].lower()} on the official Gaurs website. "
                    f"Enquire for current availability, unit sizes and payment plans.")
    highlights = []
    if p.get("configuration"): highlights.append(p["configuration"] + (" homes" if "BHK" in p["configuration"] else ""))
    if sizes and sizes not in config: highlights.append("Unit sizes: " + sizes)
    if p.get("possession"): highlights.append("Possession: " + str(p["possession"]))
    if p.get("amenities"): highlights.append(p["amenities"][0])
    highlights = list(dict.fromkeys(highlights))[:4]

    price_txt = price if price else "Price on Request"
    segs = [s.strip() for s in location.split(",") if s.strip()]
    loc2 = ", ".join(segs[:2]) if len(segs) > 1 else location
    title = f"{p['name']} {loc2}"
    if config: title += f" | {config}"
    title += f" — {price_txt}"
    if len(title) > 82 and config:
        title = f"{p['name']} {loc2} — {price_txt}"
    if len(title) > 82:
        title = f"{p['name']} {segs[0]} — {price_txt}"
    desc = f"{p['name']} — {p['type']} project by Gaurs Group at {location}. "
    if p.get("configuration"): desc += f"Offers {p['configuration']}. "
    if rera: desc += f"RERA: {rera}. "
    desc += "Call +91 87997 56026 for details."

    projects.append({
        "slug": slug, "city": city_slug, "cityName": p["city"], "name": p["name"],
        "location": location, "type": p["type"], "status": status,
        "config": config, "startingPrice": price, "rera": rera, "reraNote": rera_note,
        "overview": overview, "highlights": highlights,
        "amenities": p.get("amenities") or [], "locationAdvantages": [],
        "priceHeader": [], "priceRows": [],
        "hero": hero_path, "gallery": gallery, "plans": [], "locationMap": "",
        "metaTitle": title, "metaDesc": desc,
        "sourceUrl": p.get("officialPageUrl") or "", "partial": len(p.get("galleryImages") or []) == 0 and not p.get("heroImage"),
    })
    print(f"{slug}: hero={'dl' if p.get('heroImage') and slug not in dl_fail else 'placeholder'} gallery={len(gallery)}")

json.dump({"projects": projects}, open(os.path.join(ROOT, "projects-data.json"), "w"), indent=1, ensure_ascii=False)
print("projects written:", len(projects), "| placeholder heroes:", len(dl_fail))

# ---------- brand assets ----------
logo_im.save(os.path.join(PUB, "assets", "gaurs-logo.png"))

def g_icon(size):
    im = Image.new("RGB", (size, size), NAVY)
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(SERIF_B, int(size * 0.68))
    d.text((size // 2, size // 2), "G", font=f, fill=(255, 255, 255), anchor="mm")
    d.rectangle([0, size - max(2, size // 40), size, size], fill=GOLD)
    return im

g_icon(180).save(os.path.join(PUB, "assets", "apple-touch-icon.png"))
g_icon(192).save(os.path.join(PUB, "assets", "icon-192.png"))
g_icon(512).save(os.path.join(PUB, "assets", "icon-512.png"))
g_icon(32).save(os.path.join(PUB, "assets", "favicon-32.png"))
g_icon(16).save(os.path.join(PUB, "assets", "favicon-16.png"))
g_icon(64).save(os.path.join(PUB, "assets", "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])

og = Image.new("RGB", (1200, 630), CREAM)
d = ImageDraw.Draw(og)
d.rectangle([0, 0, 1200, 10], fill=GOLD); d.rectangle([0, 620, 1200, 630], fill=GOLD)
lg = logo_im.copy(); lg.thumbnail((560, 226))
og.paste(lg, ((1200 - lg.width) // 2, 120), lg)
f = ImageFont.truetype(SANS_B, 44); f2 = ImageFont.truetype(SANS, 32)
d.text((600, 400), "Gaurs Group Projects", font=f, fill=NAVY, anchor="ma")
d.text((600, 465), "Noida · Greater Noida · Ghaziabad", font=f2, fill=(70, 70, 70), anchor="ma")
d.text((600, 535), "Authorized Channel Partner", font=f2, fill=GOLD, anchor="ma")
og.save(os.path.join(PUB, "assets", "og-image.jpg"), quality=88)

def reuse_image(src_rel, dest_rel, max_w=1400):
    src = os.path.join(PUB, src_rel)
    if os.path.exists(src):
        im = Image.open(src).convert("RGB")
        if im.width > max_w: im = im.resize((max_w, int(im.height * max_w / im.width)), Image.LANCZOS)
        im.save(os.path.join(PUB, dest_rel), "WEBP", quality=82)
        return True
    return False

by_slug = {p["slug"]: p for p in projects}
reuse_image(by_slug["gaur-city-7th-avenue"]["hero"].lstrip("/"), "images/home/slider-1.webp", 1920)
reuse_image(by_slug["gaur-city-7th-avenue"]["hero"].lstrip("/"), "images/city/projects-in-greater-noida.webp")
ghz = next((p for p in projects if p["city"] == "ghaziabad" and "placeholder" not in p["hero"]), None) or next(p for p in projects if p["city"] == "ghaziabad")
reuse_image(ghz["hero"].lstrip("/"), "images/city/projects-in-ghaziabad.webp")
noi = next(p for p in projects if p["city"] == "noida")
reuse_image(noi["hero"].lstrip("/"), "images/city/projects-in-noida.webp")
print("city/home images set; ghaziabad from", ghz["slug"], "| noida from", noi["slug"])

# palette sample from the logo (opaque pixels)
from collections import Counter
px = [pt[:3] for pt in logo_im.getdata() if pt[3] > 200]
print("logo dominant colors:", Counter(px).most_common(5))
