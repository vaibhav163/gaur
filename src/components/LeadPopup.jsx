import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SITE } from "../config.js";
import { PROJECTS, projectBySlug } from "../data/projects.js";
import { submitLead, validName, validPhone } from "../lib/lead.js";
import { useToast } from "./Toast.jsx";

// Lead-capture popup — appears once per session, ~6 seconds after landing
// on the home page, a project page or a city page. Submits through the
// same lead pipeline as every other form on the site (EmailJS first,
// WhatsApp fallback), preselecting the project on project pages.
const SEEN_KEY = "leadpop-seen";

function eligible(pathname) {
  if (pathname === "/") return true;
  if (/^\/projects\/[a-z0-9-]+$/.test(pathname)) return true;
  if (/^\/projects-in-[a-z-]+$/.test(pathname)) return true;
  return false;
}

export default function LeadPopup() {
  const { pathname } = useLocation();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [project, setProject] = useState("");
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  const slugMatch = pathname.match(/^\/projects\/([a-z0-9-]+)$/);
  const urlProject = slugMatch ? projectBySlug(slugMatch[1]) : null;

  useEffect(() => {
    if (!eligible(pathname)) return;
    let seen = false;
    try {
      seen = !!sessionStorage.getItem(SEEN_KEY);
    } catch (e) {}
    if (seen) return;
    const t = setTimeout(() => {
      setProject(urlProject ? urlProject.slug : (PROJECTS[0] && PROJECTS[0].slug) || "general");
      setOpen(true);
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch (e) {}
    }, 6000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open ]);

  if (!open) return null;

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
    const projectName = (projectBySlug(project) || {}).name || "General enquiry";
    const source =
      pathname === "/" ? "homepage popup" : urlProject ? "project page popup (" + urlProject.name + ")" : "city page popup";
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      project: projectName,
      message: "Enquiry via " + source + ". Please share details.",
      _subject: "New enquiry (popup) — " + projectName,
      _template: "table",
    };
    setSending(true);
    const sent = await submitLead(payload, project, toast);
    setSending(false);
    if (sent) setOpen(false);
  }

  return (
    <div className="leadpop-overlay" onClick={() => setOpen(false)} role="presentation">
      <div className="leadpop-wrap">
        <button type="button" className="leadpop-close" aria-label="Close popup" onClick={() => setOpen(false)}>
          ×
        </button>
        <form
          className="enquiry leadpop-form"
          noValidate
          onSubmit={onSubmit}
          role="dialog"
          aria-modal="true"
          aria-label="Enquire now"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="serif" style={{ fontSize: "1.4rem", margin: 0 }}>
            Enquire Now
          </h2>
          <p style={{ margin: "-6px 0 2px", color: "var(--muted)" }}>
            {urlProject
              ? "Interested in " + urlProject.name + "? Get the price list, floor plans & a site-visit callback."
              : "Get price lists, floor plans & a callback from our desk."}
          </p>
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
            {errors.name && (
              <span className="field-err" data-err="name">
                {errors.name}
              </span>
            )}
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
            {errors.phone && (
              <span className="field-err" data-err="phone">
                {errors.phone}
              </span>
            )}
          </label>
          <label>
            Project of interest
            <select name="project" value={project} onChange={(e) => setProject(e.target.value)}>
              {PROJECTS.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name} — {p.location}
                </option>
              ))}
              <option value="general">General enquiry — help me choose</option>
            </select>
          </label>
          <button className="btn" type="submit" disabled={sending}>
            {sending ? "Sending…" : "Request Callback"}
          </button>
          <p className="fineprint">
            Prefer talking? Call{" "}
            <a href={"tel:+" + SITE.phoneIntl} data-track="call_click">
              {SITE.phoneDisplay}
            </a>
            . No spam, ever.
          </p>
        </form>
      </div>
    </div>
  );
}
