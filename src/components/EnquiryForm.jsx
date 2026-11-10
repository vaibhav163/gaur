import { useState } from "react";
import { SITE } from "../config.js";
import { PROJECTS, projectBySlug } from "../data/projects.js";
import { submitLead, validName, validPhone } from "../lib/lead.js";
import { track } from "../lib/tracking.js";
import { useToast } from "./Toast.jsx";

// Full enquiry form — ported from the static site's #enquiryTpl + wireForm().
// Used on Home, Contact and at the bottom of every project page.
export default function EnquiryForm({ defaultProject = "", heading = "Request a callback" }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [project, setProject] = useState(defaultProject || PROJECTS[0].slug);
  const [message, setMessage] = useState("");
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
    const projectName = (projectBySlug(project) || {}).name || "General enquiry";
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      project: projectName,
      message: message.trim(),
      _subject: "New Gaurs enquiry — " + projectName,
      _template: "table",
    };
    setSending(true);
    const sent = await submitLead(payload, project, toast);
    if (sent) {
      setName("");
      setPhone("");
      setMessage("");
      setProject(defaultProject || PROJECTS[0].slug);
      setErrors({});
    }
    setSending(false);
  }

  return (
    <form className="enquiry" noValidate onSubmit={onSubmit}>
      <h2 className="serif" style={{ fontSize: "1.45rem" }}>
        {heading}
      </h2>
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
      <label>
        Message <span style={{ color: "var(--muted)", fontWeight: 500 }}>(optional)</span>
        <textarea
          name="message"
          rows="3"
          placeholder="Budget, preferred configuration, site-visit timing…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>
      <button className="btn" type="submit" disabled={sending}>
        {sending ? "Sending…" : "Send enquiry"}
      </button>
      <p className="fineprint">
        Submitting sends your details to our channel-partner desk by email. Prefer talking? Call{" "}
        <a href={"tel:+" + SITE.phoneIntl} data-track="call_click" onClick={() => track("call_click")}>
          {SITE.phoneDisplay}
        </a>
        .
      </p>
    </form>
  );
}
