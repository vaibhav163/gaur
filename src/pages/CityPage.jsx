import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import EnquiryForm from "../components/EnquiryForm.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import Seo from "../components/Seo.jsx";
import { CITIES, SITE } from "../config.js";
import { projectsByCity } from "../data/projects.js";
import { track } from "../lib/tracking.js";
import NotFound from "./NotFound.jsx";

export default function CityPage({ citySlug }) {
  const { city: routeCity } = useParams();
  const city = citySlug || routeCity;
  const meta = CITIES.find((c) => c.slug === city);
  const list = meta ? projectsByCity(city) : [];
  useEffect(() => {
    if (meta) track("page_view", { view: "city", city });
  }, [city, meta]);
  if (!meta) return <NotFound />;

  const title = "Gaurs Projects in " + meta.name + " — Gaurs Group | Channel Partner";
  const description =
    "Explore " +
    list.length +
    " Gaurs Group projects in " +
    meta.name +
    ": " +
    list.slice(0, 4).map((p) => p.name).join(", ") +
    (list.length > 4 ? " and more" : "") +
    ". Prices, floor plans, galleries and RERA details. Call +91 87997 56026.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE.url + "/" },
          { "@type": "ListItem", position: 2, name: "Projects", item: SITE.url + "/projects" },
          { "@type": "ListItem", position: 3, name: "Gaurs Projects in " + meta.name, item: SITE.url + "/projects-in-" + city },
        ],
      },
      {
        "@type": "ItemList",
        name: "Gaurs Projects in " + meta.name,
        itemListElement: list.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p.name + " — " + (p.location || meta.name),
          url: SITE.url + "/projects/" + p.slug,
        })),
      },
    ],
  };

  const others = CITIES.filter((c) => c.slug !== city);

  return (
    <div className="wrap">
      <Seo title={title} description={description} path={"projects-in-" + city} image={meta.img} jsonLd={jsonLd} />
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> <span aria-hidden="true">›</span>
        <Link to="/projects">Projects</Link> <span aria-hidden="true">›</span>
        <span aria-current="page">{meta.name}</span>
      </nav>
      <div className="sec-head" style={{ marginTop: 10 }}>
        <h1 className="sec-title">Gaurs projects in {meta.name}</h1>
        <span className="result-count">
          {list.length} project{list.length === 1 ? "" : "s"}
        </span>
      </div>
      {list.length ? (
        <div className="grid">
          {list.map((p, i) => (
            <ProjectCard key={p.slug} p={p} eager={i < 3} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <h2>No Gaurs projects listed in {meta.name} right now</h2>
          <p>New launches are added as they are announced — ask us what’s coming up.</p>
          <Link className="btn" to="/projects">
            Browse all projects
          </Link>
        </div>
      )}

      <section aria-labelledby="other-cities" style={{ marginTop: 40 }}>
        <h2 className="sec-title" id="other-cities" style={{ fontSize: "1.4rem" }}>
          Gaurs projects in other cities
        </h2>
        <div className="chip-row" style={{ marginTop: 12 }}>
          {others.map((c) => (
            <Link key={c.slug} className="chip" to={"/projects-in-" + c.slug}>
              {c.name} ({projectsByCity(c.slug).length})
            </Link>
          ))}
        </div>
      </section>

      <div style={{ marginTop: 36 }}>
        <EnquiryForm heading={"Enquire about Gaurs projects in " + meta.name} />
      </div>
    </div>
  );
}
