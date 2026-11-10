import { useEffect } from "react";
import { SITE } from "../config.js";

// Per-page SEO — the React equivalent of the static site's setMeta() plus
// the JSON-LD each static page carried in its head. Sets the page title,
// meta description, canonical, Open Graph and Twitter tags, and (optionally)
// a page-specific JSON-LD block (used for the project BreadcrumbList).
function upsertMeta(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(selector.startsWith("link") ? "link" : "meta");
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

export default function Seo({ title, description, path = "", image, jsonLd }) {
  useEffect(() => {
    const url = SITE.url + "/" + (path || "");
    const img = SITE.url + "/" + String(image || SITE.ogImage).replace(/^\//, "");
    document.title = title;
    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('link[rel="canonical"]', { rel: "canonical", href: url });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: img });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: img });

    let script = null;
    if (jsonLd) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "crumbLd";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
    return () => {
      if (script) script.remove();
    };
  }, [title, description, path, image, jsonLd]);
  return null;
}

// The per-page SEO values for the main (non-project) pages.
export const PAGE_SEO = {
  home: {
    t: "Gaurs Group Projects in Noida, Greater Noida & Ghaziabad | ",
    d: "Explore 49 Gaurs Group projects — Gaur NYC Residences, Gaur Alaris, Gaur Chrysalis, Legacy by Gaurs, Aspire Leisure Park, Gaur City and more across Noida, Greater Noida and Ghaziabad. Call +91 87997 56026.",
  },
  projects: {
    t: "All Gaurs Group Projects — Noida, Greater Noida & Ghaziabad",
    d: "Browse all 49 Gaurs Group (Gaursons India) projects: residences, integrated townships, commercial spaces and retail across Noida, Greater Noida and Ghaziabad. Prices, galleries and RERA details. Call +91 87997 56026.",
  },
  about: {
    t: "About Gaurs Group | Gaursons India — Channel Partner",
    d: "Gaurs Group (Gaursons India, founded 1995) is a Ghaziabad-based developer that has delivered 75 projects and 75,000+ homes across Delhi NCR. Learn about the portfolio and this channel-partner website.",
  },
  contact: {
    t: "Enquire — Gaurs Group Projects | Call +91 87997 56026",
    d: "Enquire about any Gaurs Group project: price lists, availability, site visits and booking assistance from the  desk. Call or WhatsApp +91 87997 56026.",
  },
  notfound: {
    t: "Page Not Found (404) | Gaurs Projects — ",
    d: "The page you requested could not be found. Browse all Gaurs Group projects in Noida, Greater Noida and Ghaziabad instead.",
  },
};
