# A&S Quik Pik — Storefront Site

Static multi-page website for **A&S Quik Pik**, a convenience & smoke shop in Meriden, CT.

**Address:** 692 E Main St, Meriden, CT 06450  
**Phone:** [860-543-1287](tel:8605431287)

## Stack

- Plain HTML + Tailwind CSS (CDN)
- Vanilla JS (`js/products.js`, age gate, shop filters)
- No build step required

## Preview locally

From this folder:

```bash
python3 -m http.server 5173
```

Then open: **http://localhost:5173/** (or http://127.0.0.1:5173/)

## Pages

| Page | Path | Notes |
|------|------|--------|
| Home | `/index.html` | Public convenience CTAs; smoke aisles behind 21+ gate |
| Shop | `/shop.html` | Search + category filters; `?cat=vapes` etc. |
| Visit Us | `/about.html` | Address, phone, map, age policy |

## Age gate (21+)

- Uses `sessionStorage` key `quikpik_age_verified`
- Required before viewing: vapes, tobacco, papers/accessories, hookah, glass
- Home page stays public; smoke CTAs prompt the gate first

## Product catalog

~60 products in `js/products.js` covering ice cream, candy, snacks, vapes, tobacco, papers, hookah, glass, fragrance, phone cables, and a lottery info card.

Photos live in `public/images/products/`. Missing or failed downloads use branded SVG placeholders — no broken images.

## Disclaimers (footer)

- 21+ tobacco / nicotine notice  
- Prices may vary in store  
- Novelty gummies disclaimer  

## License / assets

Product photos from Open Food Facts and Wikimedia Commons where available; placeholders are original SVGs for this demo.
