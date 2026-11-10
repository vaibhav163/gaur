import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import EnquiryForm from "../components/EnquiryForm.jsx";
import Seo, { PAGE_SEO } from "../components/Seo.jsx";
import { SITE } from "../config.js";
import { projectBySlug, waLink } from "../data/projects.js";
import { track } from "../lib/tracking.js";

export default function Contact() {
  const [searchParams] = useSearchParams();
  const pre = searchParams.get("project");
  const defaultProject = pre && projectBySlug(pre) ? pre : "";

  useEffect(() => {
    track("page_view", { view: "contact" });
  }, []);

  return (
    <div className="wrap">
      <Seo title={PAGE_SEO.contact.t} description={PAGE_SEO.contact.d} path="contact" />
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Contact</span>
      </nav>
      <section className="block" style={{ paddingTop: 18 }} aria-labelledby="contact-h">
        <div className="sec-head">
          <div>
            <h1 id="contact-h" style={{ fontSize: "clamp(2rem,4.5vw,3rem)" }}>
              Enquire about a Gaurs Group project
            </h1>
            <p>
              Tell us which project you’re considering and how to reach you. Your enquiry is emailed to our
              desk — and if the email ever fails, WhatsApp opens with your enquiry ready to send, so it is
              never lost. You can also reach us instantly on call or WhatsApp.
            </p>
          </div>
        </div>
        <div className="two-col">
          <div>
            <EnquiryForm key={defaultProject} defaultProject={defaultProject} />
          </div>
          <div className="contact-cards">
            <div className="contact-card">
              <h3>Call us</h3>
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
              <p>Fastest way to get the current price list and availability.</p>
            </div>
            <div className="contact-card">
              <h3>WhatsApp</h3>
              <p>
                <a
                  className="big"
                  target="_blank"
                  rel="noopener"
                  data-track="whatsapp_click"
                  onClick={() => track("whatsapp_click")}
                  href={waLink("Hi, I'm interested in a Gaurs Group project.")}
                >
                  Chat with us →
                </a>
              </p>
              <p>Send your preferred project and budget; we’ll reply with options.</p>
            </div>
            <div className="contact-card">
              <h3>Popular right now</h3>
              <p>
                <Link to="/projects/gaur-nyc-residences">Gaur NYC Residences</Link> ·{" "}
                <Link to="/projects/gaur-alaris">Gaur Alaris</Link> ·{" "}
                <Link to="/projects/gaur-chrysalis">Gaur Chrysalis</Link> ·{" "}
                <Link to="/projects/legacy-by-gaurs">Legacy by Gaurs</Link>
              </p>
              <p>
                Or browse the <Link to="/projects">complete portfolio</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
