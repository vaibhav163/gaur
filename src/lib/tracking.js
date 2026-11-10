// Consent + conversion tracking — ported from the static site's js/site.js.
// No cookies are written and no tracker loads until the visitor consents.
// Set SITE.gaId / SITE.metaPixelId in src/config.js to activate.
import { SITE } from "../config.js";

export const consent = { essential: true, analytics: false, marketing: false, decided: false };
const listeners = new Set();
export function onConsentChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function notify() {
  listeners.forEach((fn) => fn({ ...consent }));
}

let gaLoaded = false;
let pixelLoaded = false;

export function track(event, params) {
  const payload = { event, page: window.location.pathname, ...(params || {}) };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  if (consent.analytics && typeof window.gtag === "function") window.gtag("event", event, params || {});
  if (consent.marketing && typeof window.fbq === "function") window.fbq("trackCustom", event, params || {});
}

export function loadAnalytics() {
  const gid = SITE.gaId || SITE.googleAdsId;
  if (gaLoaded || !gid) return;
  gaLoaded = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(gid);
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function () {
      window.dataLayer.push(arguments);
    };
  window.gtag("js", new Date());
  if (SITE.gaId) window.gtag("config", SITE.gaId, { anonymize_ip: true });
  if (SITE.googleAdsId) window.gtag("config", SITE.googleAdsId);
}

export function loadPixel() {
  if (pixelLoaded || !SITE.metaPixelId) return;
  pixelLoaded = true;
  /* Meta Pixel base code (loads only after marketing consent) */
  const f = window;
  const b = document;
  const e = "script";
  const v = "https://connect.facebook.net/en_US/fbevents.js";
  if (f.fbq) return;
  const n = (f.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  });
  if (!f._fbq) f._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];
  const t = b.createElement(e);
  t.async = true;
  t.src = v;
  b.getElementsByTagName(e)[0].parentNode.insertBefore(t, null);
  window.fbq("init", SITE.metaPixelId);
  window.fbq("track", "PageView");
}

export function applyConsent() {
  if (consent.analytics) loadAnalytics();
  if (consent.marketing) loadPixel();
}

export function decideConsent(next) {
  Object.assign(consent, next, { decided: true });
  applyConsent();
  track("cookie_consent", { analytics: consent.analytics, marketing: consent.marketing });
  notify();
}
