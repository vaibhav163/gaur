import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EnquiryForm from "../components/EnquiryForm.jsx";
import ProjectCard, { SkeletonCards } from "../components/ProjectCard.jsx";
import Seo, { PAGE_SEO } from "../components/Seo.jsx";
import { CITIES, SITE } from "../config.js";
import { PROJECTS, projectsByCity, waLink } from "../data/projects.js";
import { track } from "../lib/tracking.js";

const FEATURED = [
  "gaur-alaris",
  "gaur-chrysalis",
  "gaur-nyc-residences",
  "legacy-by-gaurs",
  "aspire-leisure-park-by-gaurs",
  "gaur-city-7th-avenue",
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    track("page_view", { view: "home" });
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);
  const featured = FEATURED.map((s) => PROJECTS.find((p) => p.slug === s)).filter(Boolean);
  const shown = featured.length ? featured : PROJECTS.slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "RealEstateAgent",
        "@id": SITE.url + "/#business",
        name: SITE.name,
        description:
          "Authorized channel partner for Gaurs Group (Gaursons India) projects across Noida, Greater Noida and Ghaziabad.",
        url: SITE.url + "/",
        logo: SITE.url + SITE.logo,
        telephone: "+91-8799756026",
        image: SITE.url + SITE.ogImage,
        areaServed: CITIES.map((c) => c.name),
        address: { "@type": "PostalAddress", addressLocality: "Noida", addressRegion: "Uttar Pradesh", addressCountry: "IN" },
      },
      { "@type": "WebSite", name: SITE.name, url: SITE.url + "/", publisher: { "@id": SITE.url + "/#business" } },
      {
        "@type": "ItemList",
        name: "Gaurs Group Projects",
        itemListElement: PROJECTS.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p.name + " — " + (p.location || p.cityName),
          url: SITE.url + "/projects/" + p.slug,
        })),
      },
    ],
  };

  return (
    <>
      <Seo title={PAGE_SEO.home.t} description={PAGE_SEO.home.d} path="" jsonLd={jsonLd} />
      <section className="hero">
        <img className="hero-bg" src={SITE.heroImage} alt="" fetchPriority="high" width="1920" height="860" />
        <div className="wrap hero-in">
          <p className="eyebrow">Gaurs Group · Gaursons India — </p>
          <h1>
            Gaurs Group projects, <em>one trusted desk</em>
          </h1>
          <p className="hero-sub">
            {PROJECTS.length} Gaurs Group projects across {CITIES.length} cities — residences, integrated
            townships, commercial and retail, with prices, galleries and RERA details on every page.
          </p>
          <div className="hero-actions">
            <Link className="btn" to="/projects">
              Browse all {PROJECTS.length} projects
            </Link>
            <a
              className="btn wa"
              target="_blank"
              rel="noopener"
              href={waLink("Hi, I'm interested in a Gaurs Group project. Please share options.")}
              data-track="whatsapp_click"
              onClick={() => track("whatsapp_click", { where: "hero" })}
            >
              WhatsApp us
            </a>
          </div>
          <div className="hero-stats">
            <div>
              <b>{PROJECTS.length}</b>
              <span>Projects listed</span>
            </div>
            <div>
              <b>{CITIES.length}</b>
              <span>Cities covered</span>
            </div>
            <div>
              <b>{projectsByCity("noida").length + projectsByCity("greater-noida").length}</b>
              <span>Noida + Gr. Noida projects</span>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap" aria-labelledby="cities-h">
        <div className="sec-head">
          <h2 className="sec-title" id="cities-h">
            Projects by city
          </h2>
          <Link className="sec-link" to="/projects">
            View all projects →
          </Link>
        </div>
        <div className="corridors">
          {CITIES.map((c) => (
            <Link key={c.slug} className="corridor" to={"/projects-in-" + c.slug}>
              <img src={c.img} alt={"Gaurs projects in " + c.name} loading="lazy" decoding="async" width="640" height="420" />
              <span className="corridor-in">
                <b>{c.name}</b>
                <span>
                  {projectsByCity(c.slug).length} project{projectsByCity(c.slug).length === 1 ? "" : "s"} →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap" aria-labelledby="feat-h">
        <div className="sec-head">
          <h2 className="sec-title" id="feat-h">
            Featured Gaurs projects
          </h2>
          <Link className="sec-link" to="/projects">
            All projects →
          </Link>
        </div>
        <div className="grid" aria-busy={loading}>
          {loading ? <SkeletonCards n={6} /> : shown.map((p) => <ProjectCard key={p.slug} p={p} />)}
        </div>
      </section>

      <section className="wrap two-col" aria-labelledby="why-h">
        <div>
          <h2 className="sec-title" id="why-h">
            Why buyers choose Gaurs
          </h2>
          <p className="detail-desc">
            Founded in 1995 by Shri Banwari Lal Gaur, Gaurs Group (Gaursons India) has delivered 75 projects
            and more than 75,000 homes across Delhi NCR — over 100 million sq. ft. of development, including
            the integrated townships Gaur City in Greater Noida West and Gaur Yamuna City on the Yamuna
            Expressway. Every project on this site shows its price, gallery and RERA registration exactly as
            published by the group, where available.
          </p>
          <ul className="about-points">
            <li>🏙️ Integrated townships — Gaur City and the 250-acre Gaur Yamuna City</li>
            <li>🏠 75,000+ homes delivered and 45,000+ possessions given since 2014</li>
            <li>🛡️ RERA numbers shown per project, exactly as published — verify before you book</li>
            <li>📞 One desk for all {PROJECTS.length} projects: price lists, site visits, booking support</li>
          </ul>
        </div>
        <EnquiryForm heading="Request a callback" />
      </section>
    </>
  );
}
