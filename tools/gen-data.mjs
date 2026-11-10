// Generates src/data/projects.js, public/sitemap.xml, public/robots.txt,
// public/_headers, vercel.json and the index.html ItemList from the
// verified dataset (projects-data.json, produced by tools/prep-data.py from the official-site inventory).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const raw = JSON.parse(fs.readFileSync(path.join(ROOT, "projects-data.json"), "utf8"));
const BASE = "https://www.gaurproject.in";
const LASTMOD = "2026-11-09";

// Final user-confirmed scope: only these three cities are published.
const CITIES = ["noida", "greater-noida", "ghaziabad"];
const projects = raw.projects.filter((p) => CITIES.includes(p.city));

// ---------- src/data/projects.js ----------
const dataJs = `// Project data — taken from the official gaursonsindia.com project pages on 2026-11-09 (see research_notes/gaurs-group/inventory.json for the audit copy)
// (see projects-data.json in the project root for the raw audit copy).
// Prices and RERA numbers are exactly as published on the source pages;
// projects without a published price show "Price on Request" and projects
// without a published RERA number show "Coming Soon".
import { SITE } from "../config.js";

export const PROJECTS = ${JSON.stringify(projects, null, 1)};

export function projectBySlug(slug) {
  return PROJECTS.find((p) => p.slug === slug) || null;
}
export function projectsByCity(city) {
  return PROJECTS.filter((p) => p.city === city);
}
export function relatedProjects(p, n = 3) {
  const sameCity = PROJECTS.filter((x) => x.slug !== p.slug && x.city === p.city);
  const sameType = PROJECTS.filter((x) => x.slug !== p.slug && x.city !== p.city && x.type === p.type);
  return [...sameCity, ...sameType].slice(0, n);
}
export function waLink(text) {
  return "https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent(text);
}
`;
fs.writeFileSync(path.join(ROOT, "src/data/projects.js"), dataJs);

// ---------- sitemap ----------
const urls = [
  { loc: BASE + "/", priority: "1.0" },
  { loc: BASE + "/projects", priority: "0.9" },
  ...CITIES.map((c) => ({ loc: `${BASE}/projects-in-${c}`, priority: "0.8" })),
  { loc: BASE + "/about", priority: "0.6" },
  { loc: BASE + "/contact", priority: "0.6" },
  ...projects.map((p) => ({ loc: `${BASE}/projects/${p.slug}`, priority: "0.7" })),
];
const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`
    )
    .join("\n") +
  "\n</urlset>\n";
fs.writeFileSync(path.join(ROOT, "public/sitemap.xml"), xml);

// ---------- robots.txt ----------
fs.writeFileSync(
  path.join(ROOT, "public/robots.txt"),
  `User-agent: *\nAllow: /\nDisallow: /404\n\nSitemap: ${BASE}/sitemap.xml\n`
);

// ---------- _headers (Netlify-style, mirrors vercel.json headers) ----------
fs.writeFileSync(
  path.join(ROOT, "public/_headers"),
  `/*\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: SAMEORIGIN\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload\n  Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://api.emailjs.com https://www.google-analytics.com https://connect.facebook.net; frame-ancestors 'self'\n`
);

// ---------- vercel.json ----------
const redirects = [
  { source: "/index.html", destination: "/", permanent: true },
  ...CITIES.flatMap((c) => [
    { source: `/projects-in-${c}/index.html`, destination: `/projects-in-${c}`, permanent: true },
    { source: `/projects-in-${c}`, destination: `/projects-in-${c}`, permanent: false },
  ]),
  ...projects.flatMap((p) => [
    { source: `/projects-in-${p.city}/${p.slug}/index.html`, destination: `/projects/${p.slug}`, permanent: true },
    { source: `/projects-in-${p.city}/${p.slug}`, destination: `/projects/${p.slug}`, permanent: true },
    { source: `/${p.slug}/index.html`, destination: `/projects/${p.slug}`, permanent: true },
  ]),
];
// remove the no-op self redirects for city roots (they would loop)
const cleanRedirects = redirects.filter((r) => r.source !== r.destination);
const headers = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://api.emailjs.com https://www.google-analytics.com https://connect.facebook.net; frame-ancestors 'self'",
  },
];
fs.writeFileSync(
  path.join(ROOT, "vercel.json"),
  JSON.stringify(
    {
      redirects: cleanRedirects,
      headers: [{ source: "/(.*)", headers }],
      rewrites: [{ source: "/(.*)", destination: "/index.html" }],
    },
    null,
    2
  ) + "\n"
);

// ---------- index.html ItemList ----------
const itemList = projects.map((p, i) => ({
  "@type": "ListItem",
  position: i + 1,
  name: `${p.name} — ${p.location || p.cityName}`,
  url: `${BASE}/projects/${p.slug}`,
}));
const idxPath = path.join(ROOT, "index.html");
let idx = fs.readFileSync(idxPath, "utf8");
if (idx.includes('"__ITEMLIST__"')) {
  idx = idx.replace('"__ITEMLIST__"', JSON.stringify(itemList, null, 6));
} else {
  // Re-running the generator: replace the whole JSON-LD graph's ItemList
  // with the current in-scope list instead of relying on the placeholder.
  idx = idx.replace(
    /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,
    (match, open, body, close) => {
      const graph = JSON.parse(body);
      const listNode = graph["@graph"].find((node) => node["@type"] === "ItemList");
      if (listNode) listNode.itemListElement = itemList;
      return open + "\n" + JSON.stringify(graph, null, 2) + "\n" + close;
    }
  );
}
fs.writeFileSync(idxPath, idx);

console.log(
  `gen-data: ${projects.length} projects | sitemap ${urls.length} URLs | vercel redirects ${cleanRedirects.length}`
);
