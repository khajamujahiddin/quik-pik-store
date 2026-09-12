#!/usr/bin/env python3
"""Generate tasteful SVG placeholders for every product image filename."""
import os, re

OUT = "/workspace/quik-pik-store/public/images/products"
os.makedirs(OUT, exist_ok=True)

js = open("/workspace/quik-pik-store/js/products.js").read()
# Extract objects more reliably: find each image path and look backwards for name/brand
blocks = re.split(r"\n\s*\{", js)
items = []
for b in blocks:
    m_img = re.search(r'image:\s*"images/products/([^"]+)"', b)
    if not m_img:
        continue
    m_name = re.search(r'name:\s*"([^"]+)"', b)
    m_brand = re.search(r'brand:\s*"([^"]+)"', b)
    if m_name and m_brand:
        items.append((m_name.group(1), m_brand.group(1), m_img.group(1)))

print(f"Found {len(items)} products")
GOLD = "#d4a017"

def initials(brand, name):
    src = brand if brand and brand not in ("Generic", "Novelty", "Store Select") else name
    parts = re.split(r"[\s\-]+", src)
    letters = "".join(p[0] for p in parts if p)[:2].upper()
    return letters or "?"

for name, brand, fname in items:
    base = os.path.splitext(fname)[0]
    svg_path = os.path.join(OUT, base + ".svg")
    label = initials(brand, name)
    safe_brand = (brand or "")[:28].replace("&", "&amp;")
    safe_name = (name or "")[:36].replace("&", "&amp;")
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1c1917"/>
      <stop offset="100%" stop-color="#09090b"/>
    </linearGradient>
  </defs>
  <rect fill="url(#g)" width="400" height="400"/>
  <rect x="28" y="28" width="344" height="344" rx="20" fill="none" stroke="{GOLD}" stroke-width="1.5" opacity="0.4"/>
  <circle cx="200" cy="160" r="48" fill="none" stroke="{GOLD}" stroke-width="2" opacity="0.5"/>
  <text x="200" y="172" text-anchor="middle" fill="{GOLD}" font-family="Georgia,serif" font-size="36" font-weight="700">{label}</text>
  <text x="200" y="250" text-anchor="middle" fill="#e4e4e7" font-family="system-ui,sans-serif" font-size="15" font-weight="600">{safe_name}</text>
  <text x="200" y="275" text-anchor="middle" fill="#a1a1aa" font-family="system-ui,sans-serif" font-size="12">{safe_brand}</text>
  <text x="200" y="340" text-anchor="middle" fill="#52525b" font-family="system-ui,sans-serif" font-size="10">A&amp;S QUIK PIK</text>
</svg>'''
    with open(svg_path, "w") as f:
        f.write(svg)

print("SVG count:", len([x for x in os.listdir(OUT) if x.endswith(".svg")]))
# Write mapping for products to prefer jpg if exists else svg
with open("/workspace/quik-pik-store/scripts/image-map.txt", "w") as f:
    for name, brand, fname in items:
        f.write(fname + "\n")
