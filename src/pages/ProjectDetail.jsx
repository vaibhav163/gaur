import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EnquiryForm from "../components/EnquiryForm.jsx";
import ProjectCard, { projectLocLine } from "../components/ProjectCard.jsx";
import Seo from "../components/Seo.jsx";
import { useToast } from "../components/Toast.jsx";
import { SITE } from "../config.js";
import { PROJECTS, projectBySlug, relatedProjects, waLink } from "../data/projects.js";
import { submitLead, validName, validPhone } from "../lib/lead.js";
import { track } from "../lib/tracking.js";
import NotFound from "./NotFound.jsx";

function iconFor(text) {
  const t = String(text).toLowerCase();
  if (t.includes("pool")) return "🏊";
  if (t.includes("gym") || t.includes("fitness")) return "🏋️";
  if (t.includes("club")) return "🏛️";
  if (t.includes("tennis") || t.includes("sport") || t.includes("cricket") || t.includes("basketball")) return "🏸";
  if (t.includes("garden") || t.includes("green") || t.includes("park")) return "🌳";
  if (t.includes("metro")) return "🚇";
  if (t.includes("expressway") || t.includes("highway") || t.includes("nh-") || t.includes("road")) return "🛣️";
  if (t.includes("school") || t.includes("education")) return "🎓";
  if (t.includes("hospital") || t.includes("health")) return "🏥";
  if (t.includes("mall") || t.includes("market") || t.includes("retail")) return "🛍️";
  if (t.includes("airport")) return "✈️";
  if (t.includes("security") || t.includes("cctv")) return "🛡️";
  if (t.includes("yoga") || t.includes("meditation")) return "🧘";
  if (t.includes("kid") || t.includes("children") || t.includes("play")) return "🧸";
  if (t.includes("golf")) return "⛳";
  return "✦";
}

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
}

function MiniForm({ p }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  async function onSubmit(ev) {
    ev.preventDefault();
    const errs = {};
    if (!validName(name)) errs.name = "Please enter your name.";
    if (!validPhone(phone)) errs.phone = "Enter a valid 10-digit mobile number.";
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast("Please fix the highlighted fields and try again.", "err");
      return;
    }
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      project: p.name,
      message:
        "Express Your Interest form on the " +
        p.name +
        " page — please share the price list, availability and site-visit options.",
      _subject: "New Gaurs enquiry — " + p.name,
      _template: "table",
    };
    setSending(true);
    const sent = await submitLead(payload, p.slug, toast);
    if (sent) {
      setName("");
      setPhone("");
      setErrors({});
    }
    setSending(false);
  }

  return (
    <form className="mini" noValidate onSubmit={onSubmit}>
      <h2 className="serif">Express your interest</h2>
      <p>Get the price list, availability and a site-visit slot for {p.name}.</p>
      <label>
        Your name
        <input
          type="text"
          name="name"
          autoComplete="name"
          placeholder="e.g. Rohit Sharma"
          value={name}
          aria-invalid={String(!!errors.name)}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <span className="field-err">{errors.name}</span>}
      </label>
      <label>
        Mobile number
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          inputMode="tel"
          placeholder="10-digit mobile number"
          value={phone}
          aria-invalid={String(!!errors.phone)}
          onChange={(e) => setPhone(e.target.value)}
        />
        {errors.phone && <span className="field-err">{errors.phone}</span>}
      </label>
      <button className="btn" type="submit" disabled={sending}>
        {sending ? "Sending…" : "Request callback"}
      </button>
      <p className="fineprint">
        Or call{" "}
        <a href={"tel:+" + SITE.phoneIntl} data-track="call_click" onClick={() => track("call_click")}>
          {SITE.phoneDisplay}
        </a>{" "}
        ·{" "}
        <a
          href={waLink("Hi, I'm interested in " + p.name + " (" + projectLocLine(p) + "). Please share details.")}
          target="_blank"
          rel="noopener"
          data-track="whatsapp_click"
          onClick={() => track("whatsapp_click", { project: p.slug })}
        >
          WhatsApp
        </a>
      </p>
    </form>
  );
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const p = projectBySlug(slug);
  useEffect(() => {
    if (p) {
      track("page_view", { view: "project", project: p.slug });
      track("view_project", { project: p.slug, city: p.city });
    }
  }, [p]);
  if (!p) return <NotFound />;

  const loc = projectLocLine(p);
  const gallery = [p.hero, ...(p.gallery || [])].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
  const related = relatedProjects(p, 3);

  const faqs = [];
  faqs.push({
    q: "Where is " + p.name + " located?",
    a: p.name + " is located at " + loc + "." + (p.locationAdvantages[0] ? " " + p.locationAdvantages[0] + "." : ""),
  });
  if (p.config)
    faqs.push({
      q: "What configurations does " + p.name + " offer?",
      a: p.name + " offers " + p.config + ". See the price list section on this page for sizes, or enquire for the full configuration and availability sheet.",
    });
  faqs.push({
    q: "What is the price of " + p.name + "?",
    a: p.startingPrice
      ? p.name + " prices start from " + p.startingPrice.replace(/\*$/, "") + " as published by the developer (indicative; final pricing is confirmed on enquiry). Call " + SITE.phoneDisplay + " for the current price list."
      : p.name + " is priced on request. Call " + SITE.phoneDisplay + " or send an enquiry for the current price list and offers.",
  });
  faqs.push({
    q: "Is " + p.name + " RERA registered?",
    a: p.rera
      ? "Yes — the project RERA number published for " + p.name + " is " + p.rera + ". Please verify the current registration on the state RERA portal before booking."
      : p.reraNote
        ? "No RERA number has been published for " + p.name + " yet — the project page states: " + p.reraNote + ". Please verify registration status on the state RERA portal before booking."
        : p.name + " is an upcoming/coming-soon project and no RERA number has been published for it yet. Please verify registration status on the state RERA portal before booking.",
  });

  const anchors = [
    ["overview", "Overview"],
    ...(p.highlights.length ? [["highlights", "Highlights"]] : []),
    ...(p.amenities.length ? [["amenities", "Amenities"]] : []),
    ...(p.priceRows.length ? [["price-list", "Price List"]] : []),
    ...(p.plans.length ? [["floor-plans", "Plans"]] : []),
    ...(gallery.length ? [["gallery", "Gallery"]] : []),
    ...(p.locationAdvantages.length || p.locationMap ? [["location", "Location"]] : []),
    ["enquire", "Enquire"],
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE.url + "/" },
          { "@type": "ListItem", position: 2, name: "Projects", item: SITE.url + "/projects" },
          { "@type": "ListItem", position: 3, name: "Gaurs Projects in " + p.cityName, item: SITE.url + "/projects-in-" + p.city },
          { "@type": "ListItem", position: 4, name: p.name, item: SITE.url + "/projects/" + p.slug },
        ],
      },
      {
        "@type": "Product",
        name: p.name,
        description: p.metaDesc,
        image: gallery.map((g) => SITE.url + g),
        brand: { "@type": "Organization", name: "Gaurs Group" },
        category: p.type,
        ...(p.rera ? { identifier: p.rera } : {}),
      },
      {
        "@type": "Residence",
        name: p.name,
        description: p.metaDesc,
        address: { "@type": "PostalAddress", streetAddress: p.location || undefined, addressLocality: p.cityName, addressRegion: "Uttar Pradesh", addressCountry: "IN" },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  const title = p.metaTitle || p.name + " — " + loc + " | Gaurs Projects";
  const facts = [
    ...(p.config ? [[iconFor(p.config), p.config, "Configuration"]] : []),
    ["📍", loc, "Location"],
    [iconFor(p.type), p.type, "Project type"],
    ...(p.status ? [["🔑", p.status, "Status"]] : []),
    ...(p.rera ? [["🛡️", p.rera, "RERA number"]] : [["🛡️", p.reraNote || "Coming Soon", "RERA status"]]),
    ["🏷️", p.startingPrice || "On Request", "Starting price"],
  ];

  return (
    <div className="wrap">
      <Seo title={title} description={p.metaDesc} path={"projects/" + p.slug} image={p.hero || undefined} jsonLd={jsonLd} />

      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> <span aria-hidden="true">›</span>
        <Link to="/projects">Projects</Link> <span aria-hidden="true">›</span>
        <Link to={"/projects-in-" + p.city}>{p.cityName}</Link> <span aria-hidden="true">›</span>
        <span aria-current="page">{p.name}</span>
      </nav>

      <section className="p-hero">
        {p.hero ? <img src={p.hero} alt={p.name + " — " + loc} fetchPriority="high" width="1680" height="720" /> : null}
        <div className="p-hero-in">
          <div className="offer-badges">
            <span className="offer-badge">{p.type}</span>
            {p.status ? <span className="offer-badge alt">{p.status}</span> : null}
            {p.rera ? <span className="offer-badge alt">RERA: {p.rera}</span> : null}
          </div>
          <h1>{p.name}</h1>
          <p className="p-loc">
            📍 {loc}
            {p.config ? " · " + p.config : ""}
          </p>
          {p.startingPrice ? <p className="p-tagline">Starting from {p.startingPrice}</p> : null}
        </div>
      </section>

      <div className="anchor-nav">
        <nav aria-label="On this page">
          {anchors.map(([id, label]) => (
            <a
              key={id}
              href={"#" + id}
              onClick={(e) => {
                e.preventDefault();
                scrollToId(id);
              }}
            >
              {label}
            </a>
          ))}
        </nav>
        <a className="anchor-cta" href={"tel:+" + SITE.phoneIntl} onClick={() => track("call_click", { project: p.slug })}>
          ☎ {SITE.phoneDisplay}
        </a>
      </div>

      <div className="ribbon" aria-label="Quick facts">
        {facts.map(([icon, label, sub], i) => (
          <div className="ribbon-item" key={i}>
            <span className="ric" aria-hidden="true">
              {icon}
            </span>
            <b>{label}</b>
            <span>{sub}</span>
          </div>
        ))}
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <section id="overview" className="sec-anchor">
            <h2 className="sec-title">Overview</h2>
            <p className="detail-desc">{p.overview}</p>
            {p.rera ? (
              <p className="detail-desc">
                <b>RERA:</b> {p.rera} — as published for this project; please verify on the state RERA portal
                before booking.
              </p>
            ) : (
              <p className="detail-desc">
                <b>RERA:</b> {p.reraNote ? "Status as published: " + p.reraNote + " — no RERA number published yet. " : "No RERA number has been published for this upcoming project yet — "}
                please verify registration status before booking.
              </p>
            )}
          </section>

          {p.highlights.length ? (
            <section id="highlights" className="sec-anchor">
              <h2 className="sec-title">Project highlights</h2>
              <ul className="highlights">
                {p.highlights.map((h, i) => (
                  <li key={i}>
                    <span aria-hidden="true">{iconFor(h)}</span> {h}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {p.amenities.length ? (
            <section id="amenities" className="sec-anchor">
              <h2 className="sec-title">Amenities</h2>
              <div className="amen-grid">
                {p.amenities.map((a, i) => (
                  <div className="amen-card" key={i}>
                    <span aria-hidden="true">{iconFor(a)}</span>
                    <b>{a}</b>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {p.priceRows.length ? (
            <section id="price-list" className="sec-anchor">
              <h2 className="sec-title">Price list</h2>
              <div className="price-wrap">
                <table className="price">
                  <thead>
                    <tr>
                      {p.priceHeader.map((h, i) => (
                        <th key={i}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {p.priceRows.map((row, i) => (
                      <tr key={i}>
                        {row.map((c, j) => (
                          <td key={j} className={j === row.length - 1 ? "price" : j === 1 ? "type" : undefined}>
                            {c}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="fineprint">
                Prices as published on the project page; “On Request” units are priced on enquiry. Final
                pricing, payment plans and availability are confirmed by our desk — call {SITE.phoneDisplay}.
              </p>
            </section>
          ) : (
            <section id="price-list" className="sec-anchor">
              <h2 className="sec-title">Price</h2>
              <p className="detail-desc">
                {p.startingPrice
                  ? "Prices start from " + p.startingPrice + " as published by the developer. "
                  : ""}
                Full price list on request — send an enquiry or call {SITE.phoneDisplay}.
              </p>
            </section>
          )}

          {p.plans.length ? (
            <section id="floor-plans" className="sec-anchor">
              <h2 className="sec-title">Floor plans &amp; master plan</h2>
              <div className="plan-grid">
                {p.plans.map((src, i) => (
                  <figure className="plan-card" key={i}>
                    <img src={src} alt={p.name + ", " + loc + " — floor plan " + (i + 1)} loading="lazy" decoding="async" width="900" height="640" />
                    <figcaption>
                      {p.name} — Plan {i + 1}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          ) : null}

          {gallery.length ? (
            <section id="gallery" className="sec-anchor">
              <h2 className="sec-title">Gallery</h2>
              <div className="plan-grid">
                {gallery.map((src, i) => (
                  <figure className="plan-card" key={i}>
                    <img
                      src={src}
                      alt={p.name + ", " + loc + " — gallery image " + (i + 1)}
                      loading="lazy"
                      decoding="async"
                      width="900"
                      height="640"
                    />
                    <figcaption>
                      {p.name} — {loc}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          ) : null}

          {p.locationAdvantages.length || p.locationMap ? (
            <section id="location" className="sec-anchor">
              <h2 className="sec-title">Location advantages</h2>
              {p.locationAdvantages.length ? (
                <div className="loc-grid">
                  {p.locationAdvantages.map((l, i) => (
                    <div className="loc-card" key={i}>
                      <span aria-hidden="true">{iconFor(l)}</span>
                      <b>{l}</b>
                    </div>
                  ))}
                </div>
              ) : null}
              {p.locationMap ? (
                <figure className="plan-card" style={{ marginTop: 16 }}>
                  <img src={p.locationMap} alt={p.name + ", " + loc + " — location map"} loading="lazy" decoding="async" width="1200" height="800" />
                  <figcaption>
                    {p.name} — location map, {loc}
                  </figcaption>
                </figure>
              ) : null}
            </section>
          ) : null}

          <section className="sec-anchor" aria-labelledby="faq-h">
            <h2 className="sec-title" id="faq-h">
              Frequently asked questions
            </h2>
            {faqs.map((f, i) => (
              <details key={i} className="faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </section>
        </div>

        <aside className="sticky-side">
          <MiniForm p={p} />
          <div className="facts">
            <h3>Quick facts</h3>
            <ul>
              <li>
                <span>Location</span>
                <b>{loc}</b>
              </li>
              <li>
                <span>Type</span>
                <b>{p.type}</b>
              </li>
              {p.config ? (
                <li>
                  <span>Configuration</span>
                  <b>{p.config}</b>
                </li>
              ) : null}
              {p.status ? (
                <li>
                  <span>Status</span>
                  <b>{p.status}</b>
                </li>
              ) : null}
              <li>
                <span>RERA</span>
                <b>{p.rera || p.reraNote || "Coming Soon"}</b>
              </li>
              <li>
                <span>Price</span>
                <b>{p.startingPrice || "On Request"}</b>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {related.length ? (
        <section aria-labelledby="rel-h" style={{ marginTop: 44 }}>
          <div className="sec-head">
            <h2 className="sec-title" id="rel-h">
              Related projects
            </h2>
            <Link className="sec-link" to={"/projects-in-" + p.city}>
              All Gaurs projects in {p.cityName} →
            </Link>
          </div>
          <div className="grid">
            {related.map((r) => (
              <ProjectCard key={r.slug} p={r} />
            ))}
          </div>
        </section>
      ) : null}

      <section id="enquire" className="sec-anchor" style={{ marginTop: 44 }}>
        <EnquiryForm defaultProject={p.slug} heading={"Enquire about " + p.name} />
      </section>
    </div>
  );
}

export { PROJECTS };
