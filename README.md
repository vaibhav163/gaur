# Gaurs Group Projects —  (React)

A lead-capture showcase website for **Gaurs Group (Gaursons India)** projects:
49 projects across Noida, Greater Noida (incl. Greater Noida West & Yamuna
Expressway) and Ghaziabad, with project detail pages, city landing pages,
enquiry forms and full SEO plumbing. Live domain: **https://www.gaurproject.in/**

> **Disclaimer:** This is a channel-partner website. It is **not** the
> official Gaurs Group website (official: https://www.gaursonsindia.com/).

## Data provenance

All project facts, RERA numbers and prices were taken on 2026-11-09 from the
official Gaurs website and the official project microsites it links to —
see `../research_notes/gaurs-group/inventory.json` for the audit copy.
Projects whose official page prints no RERA show "Coming Soon" (ongoing) or a
note (delivered); projects with no printed price show **Price on Request**.
18 projects had no official photo available and use a clearly branded
"photo coming soon" placeholder image.

## Stack

Vite 5 + React 18 + react-router-dom 6 (SPA with clean URLs).
`tools/prep-data.py` builds `projects-data.json` from the inventory and
downloads/converts the official images; `tools/gen-data.mjs` generates
`src/data/projects.js`, `public/sitemap.xml` (56 URLs), `robots.txt`,
`_headers` and `vercel.json`.

## Develop / build

```bash
npm install
npm run dev     # local dev server
npm run build   # outputs dist/ (vercel.json is copied into dist/ after build)
```

## The one file to edit

`src/config.js` — domain, phone/WhatsApp (8799756026), the shared EmailJS
keys (service_fkmfynb / template_bdjcyq6), tracking IDs and image paths.
Enquiry forms send via EmailJS first and fall back to WhatsApp automatically
if the email send fails, so no lead is lost.
