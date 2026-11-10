import { useEffect } from "react";
import { Link } from "react-router-dom";
import Seo, { PAGE_SEO } from "../components/Seo.jsx";
import { SITE } from "../config.js";
import { PROJECTS } from "../data/projects.js";
import { track } from "../lib/tracking.js";

export default function About() {
  useEffect(() => {
    track("page_view", { view: "about" });
  }, []);
  return (
    <div className="wrap">
      <Seo title={PAGE_SEO.about.t} description={PAGE_SEO.about.d} path="about" />
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">About</span>
      </nav>
      <section className="block" style={{ paddingTop: 18 }} aria-labelledby="about-h">
        <div className="two-col">
          <div>
            <h1 id="about-h" style={{ fontSize: "clamp(2rem,4.5vw,3rem)" }}>
              About Gaurs Group
            </h1>
            <p style={{ color: "var(--muted)", marginTop: 14 }}>
              Gaurs Group (Gaursons India) is a Ghaziabad-headquartered real estate developer founded in
              1995 by Shri Banwari Lal Gaur, starting with a single apartment project in Sahibabad,
              Ghaziabad. In the group's own numbers: 31 years of work, 75 projects delivered, more than
              75,000 homes delivered, 45,000+ possessions given since 2014 and over 100 million sq. ft.
              of area developed across Delhi NCR.
            </p>
            <p style={{ color: "var(--muted)", marginTop: 12 }}>
              The portfolio on this site spans {PROJECTS.length} projects across Greater Noida, Ghaziabad and Noida: the
              integrated townships Gaur City (Greater Noida West) and Gaur Yamuna City (Yamuna Expressway);
              new launches such as Gaur NYC Residences (Wave City, Ghaziabad), Gaur Alaris and Gaur
              Chrysalis (Sector 22D, Yamuna Expressway), Legacy by Gaurs (Jaypee Greens) and the Aspire
              projects in Techzone 4; commercial and retail addresses like Gaur City Mall, Gaur World
              SmartStreet and Gaur City Center; and delivered landmarks across Vaishali, Indirapuram, Raj
              Nagar Extension and Crossings Republik in Ghaziabad.
            </p>
            <ul className="about-points">
              <li>
                <span>
                  <b>This website</b> is operated by an  of Gaurs Group — it is not
                  the official Gaurs Group website. Your enquiry comes to us, and we arrange site visits,
                  price lists and booking assistance.
                </span>
              </li>
              <li>
                <span>
                  <b>Developer’s official website:</b>{" "}
                  <a href="https://www.gaursonsindia.com/" target="_blank" rel="noopener">
                    gaursonsindia.com
                  </a>{" "}
                  — project details there prevail over anything on this site.
                </span>
              </li>
              <li>
                <span>
                  <b>Looking to buy?</b> Start with the <Link to="/projects">full project list</Link>, browse
                  by city such as <Link to="/projects-in-noida">Noida</Link> or{" "}
                  <Link to="/projects-in-ghaziabad">Ghaziabad</Link>, or <Link to="/contact">talk to us</Link>{" "}
                  about budgets and site visits.
                </span>
              </li>
            </ul>
          </div>
          <div>
            <img
              src="/assets/og-image.jpg"
              alt="Gaurs Group residential project"
              loading="lazy"
              decoding="async"
              style={{ borderRadius: 18, boxShadow: "var(--shadow)", width: "100%" }}
            />
            <div className="contact-cards" style={{ marginTop: 18 }}>
              <div className="contact-card">
                <h3>Talk to the channel partner desk</h3>
                <p>
                  <a
                    className="big"
                    href={"tel:+" + SITE.phoneIntl}
                    data-track="call_click"
                    onClick={() => track("call_click")}
                  >
                    {SITE.phoneDisplay}
                  </a>
                </p>
                <p>Call or WhatsApp for price lists, availability and site visits.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
