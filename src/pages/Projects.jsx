import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProjectCard, { SkeletonCards } from "../components/ProjectCard.jsx";
import Seo from "../components/Seo.jsx";
import { CITIES, SITE } from "../config.js";
import { PROJECTS } from "../data/projects.js";
import { track } from "../lib/tracking.js";

const TYPES = ["Residential", "Commercial", "Plots"];

export default function Projects() {
  const [params, setParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const q = params.get("q") || "";
  const city = params.get("city") || "";
  const type = params.get("type") || "";

  useEffect(() => {
    track("page_view", { view: "projects" });
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const set = (k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
  };

  const results = useMemo(() => {
    return PROJECTS.filter((p) => {
      if (city && p.city !== city) return false;
      if (type && p.type !== type) return false;
      if (q) {
        const hay = (p.name + " " + p.location + " " + p.cityName + " " + p.config + " " + p.type).toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [q, city, type]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "All Gaurs Group Projects",
    itemListElement: PROJECTS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name + " — " + (p.location || p.cityName),
      url: SITE.url + "/projects/" + p.slug,
    })),
  };

  return (
    <div className="wrap">
      <Seo
        title={"All Gaurs Group Projects (" + PROJECTS.length + ") — Noida, Greater Noida & Ghaziabad"}
        description={
          "Browse all " +
          PROJECTS.length +
          " Gaurs Group projects with prices, floor plans, galleries and RERA details across " +
          CITIES.length +
          " cities. Filter by city or type, or call +91 87997 56026."
        }
        path="projects"
        jsonLd={jsonLd}
      />
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> <span aria-hidden="true">›</span>
        <span aria-current="page">Projects</span>
      </nav>
      <div className="sec-head" style={{ marginTop: 10 }}>
        <h1 className="sec-title">All Gaurs projects</h1>
      </div>

      <div className="filters" role="search">
        <div className="search-row">
          <label className="hidden" htmlFor="pq">
            Search projects
          </label>
          <input
            id="pq"
            type="search"
            placeholder="Search by project, sector or city…"
            value={q}
            onChange={(e) => set("q", e.target.value)}
          />
        </div>
        <div className="chip-row" aria-label="Filter by city">
          <button type="button" className={"chip" + (!city ? " on" : "")} onClick={() => set("city", "")}>
            All cities
          </button>
          {CITIES.map((c) => (
            <button
              key={c.slug}
              type="button"
              className={"chip" + (city === c.slug ? " on" : "")}
              onClick={() => set("city", c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="chip-row" aria-label="Filter by type">
          <button type="button" className={"chip" + (!type ? " on" : "")} onClick={() => set("type", "")}>
            All types
          </button>
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              className={"chip" + (type === t ? " on" : "")}
              onClick={() => set("type", t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <p className="result-count" role="status">
        {results.length} of {PROJECTS.length} projects
      </p>
      <div className="grid" aria-busy={loading}>
        {loading ? (
          <SkeletonCards n={6} />
        ) : results.length ? (
          results.map((p, i) => <ProjectCard key={p.slug} p={p} eager={i < 3} />)
        ) : (
          <div className="empty">
            <h2>No projects match that search</h2>
            <p>Try a different city, type or keyword — or ask us on WhatsApp and we’ll suggest options.</p>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setParams({}, { replace: true })}
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
