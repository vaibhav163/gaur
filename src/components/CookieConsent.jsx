import { useEffect, useRef, useState } from "react";
import { consent, decideConsent, onConsentChange } from "../lib/tracking.js";
import { useToast } from "./Toast.jsx";
import { OPEN_COOKIE_PREFS_EVENT } from "./Footer.jsx";

// Cookie consent banner + preferences modal — ported from the static site.
// Like the original, consent is held in memory for the session (not stored
// in a cookie/localStorage) and trackers load only after consent.
export default function CookieConsent() {
  const toast = useToast();
  const [banner, setBanner] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: consent.analytics, marketing: consent.marketing });
  const dialogRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!consent.decided) setBanner(true);
    }, 1200);
    const off = onConsentChange(() => setBanner(false));
    const open = () => {
      setPrefs({ analytics: consent.analytics, marketing: consent.marketing });
      const dlg = dialogRef.current;
      if (dlg && !dlg.open) {
        if (typeof dlg.showModal === "function") dlg.showModal();
        else dlg.setAttribute("open", "");
      }
    };
    window.addEventListener(OPEN_COOKIE_PREFS_EVENT, open);
    return () => {
      clearTimeout(t);
      off();
      window.removeEventListener(OPEN_COOKIE_PREFS_EVENT, open);
    };
  }, []);

  const close = () => {
    const dlg = dialogRef.current;
    if (dlg && dlg.open) dlg.close();
  };
  const decide = (next, silent) => {
    decideConsent(next);
    setBanner(false);
    if (!silent) toast("Cookie preferences saved.", "ok");
  };
  const openPrefs = () => {
    setBanner(false);
    window.dispatchEvent(new Event(OPEN_COOKIE_PREFS_EVENT));
  };

  return (
    <>
      {banner && (
        <div className="cookie-banner show" role="region" aria-label="Cookie consent">
          <h2>We value your privacy</h2>
          <p>
            We use cookies to understand which projects visitors like and to measure enquiries. Essential
            cookies always run; analytics and marketing cookies run only with your consent. You can change
            your mind anytime from “Cookie preferences” in the footer.
          </p>
          <div className="cookie-actions">
            <button className="btn small" type="button" onClick={() => decide({ analytics: true, marketing: true })}>
              Accept all
            </button>
            <button
              className="btn small ghost"
              type="button"
              onClick={() => decide({ analytics: false, marketing: false })}
            >
              Reject optional
            </button>
            <button className="btn small ghost" type="button" onClick={openPrefs}>
              Manage preferences
            </button>
          </div>
        </div>
      )}

      <dialog className="modal" ref={dialogRef} aria-labelledby="cookieModalH">
        <div className="modal-in">
          <h2 id="cookieModalH">Cookie preferences</h2>
          <div className="pref-row">
            <div>
              <b>Essential</b>
              <p>
                Required for the site to work — security, load balancing and remembering your cookie choice
                itself. Always on.
              </p>
            </div>
            <button
              className="switch"
              role="switch"
              aria-checked="true"
              data-pref="essential"
              disabled
              aria-label="Essential cookies (always on)"
            ></button>
          </div>
          <div className="pref-row">
            <div>
              <b>Analytics</b>
              <p>
                Anonymous usage statistics (e.g. Google Analytics) that show which projects and pages
                perform best.
              </p>
            </div>
            <button
              className="switch"
              role="switch"
              aria-checked={String(prefs.analytics)}
              data-pref="analytics"
              aria-label="Analytics cookies"
              onClick={() => setPrefs((s) => ({ ...s, analytics: !s.analytics }))}
            ></button>
          </div>
          <div className="pref-row">
            <div>
              <b>Marketing</b>
              <p>
                Advertising measurement (e.g. Meta Pixel / Google Ads) used to attribute enquiries to
                campaigns.
              </p>
            </div>
            <button
              className="switch"
              role="switch"
              aria-checked={String(prefs.marketing)}
              data-pref="marketing"
              aria-label="Marketing cookies"
              onClick={() => setPrefs((s) => ({ ...s, marketing: !s.marketing }))}
            ></button>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button className="btn ghost small" type="button" onClick={close}>
              Cancel
            </button>
            <button
              className="btn small"
              type="button"
              onClick={() => {
                decide({ analytics: prefs.analytics, marketing: prefs.marketing });
                close();
              }}
            >
              Save preferences
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
