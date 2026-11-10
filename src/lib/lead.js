import { SITE } from "../config.js";
import { projectBySlug, waLink } from "../data/projects.js";
import { consent, track } from "./tracking.js";

// Shared lead delivery. Primary route: EmailJS REST (keys in config.js).
// IMPORTANT: if the email send fails for any reason, the lead is NOT lost —
// WhatsApp opens with the enquiry pre-filled so the visitor can send it
// there instead, so a failed form never silently loses a lead.
function openWhatsAppFallback(payload, projectName) {
  const msg =
    "Hi, I'm " +
    payload.name +
    ". I'm interested in " +
    projectName +
    ". " +
    (payload.message || "Please share details.") +
    " (My phone: " +
    payload.phone +
    ")";
  window.open(waLink(msg), "_blank", "noopener");
}

export async function submitLead(payload, projectSlug, toast) {
  const projectName = payload.project;
  try {
    if (SITE.emailjs && SITE.emailjs.serviceId) {
      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: SITE.emailjs.serviceId,
          template_id: SITE.emailjs.templateId,
          user_id: SITE.emailjs.publicKey,
          template_params: {
            from_name: payload.name,
            phone: payload.phone,
            project: projectName,
            message: payload.message || "",
          },
        }),
      });
      if (!res.ok) throw new Error("send failed");
      track("form_submit", { project: projectSlug, method: "emailjs" });
      if (typeof window.fbq === "function" && consent.marketing)
        window.fbq("track", "Lead", { content_name: projectName });
      toast("Enquiry sent — our desk will call you back shortly.", "ok");
      return true;
    }
    if (SITE.formEndpoint) {
      const res = await fetch(SITE.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("send failed");
      track("form_submit", { project: projectSlug, method: "email" });
      toast("Enquiry sent — our desk will call you back shortly.", "ok");
      return true;
    }
    track("form_submit", { project: projectSlug, method: "whatsapp_only" });
    toast("Opening WhatsApp to complete your enquiry…", "ok");
    openWhatsAppFallback(payload, projectName);
    return true;
  } catch (e) {
    track("form_error", { project: projectSlug });
    track("form_submit", { project: projectSlug, method: "whatsapp_fallback" });
    toast("Couldn't send online — opening WhatsApp so your enquiry isn't lost.", "err");
    openWhatsAppFallback(payload, projectName);
    return false;
  }
}

// Indian mobile validation (optional +91), starting 6–9.
export function validPhone(value) {
  return /^[6-9]\d{9}$/.test(value.replace(/[\s+\-]/g, "").replace(/^91/, ""));
}
export function validName(value) {
  return value.trim().length >= 2;
}
export { projectBySlug };
