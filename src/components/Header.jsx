import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { SITE } from "../config.js";
import { track } from "../lib/tracking.js";

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="site-head">
      <div className="wrap head-in">
        <Link className="brand" to="/" aria-label="Gaurs Projects — home" onClick={close}>
          <img className="brand-logo" src={SITE.logo} alt="Gaurs Group logo" width="120" height="38" />
          <span className="brand-text">
            {/* <span className="brand-name">
              GAURS <em>PROJECTS</em>
            </span> */}
            {/* <span className="brand-sub">Authorized Channel Partner</span> */}
          </span>
        </Link>
        <button
          className="nav-toggle"
          aria-expanded={String(open)}
          aria-controls="mainNav"
          onClick={() => setOpen((o) => !o)}
        >
          Menu
        </button>
        <nav className={"main-nav" + (open ? " open" : "")} id="mainNav" aria-label="Main">
          <NavLink to="/" end onClick={close}>
            Home
          </NavLink>
          <NavLink to="/projects" onClick={close}>
            Projects
          </NavLink>
          <NavLink to="/projects-in-noida" onClick={close}>
            Noida
          </NavLink>
          <NavLink to="/projects-in-greater-noida" onClick={close}>
            Greater Noida
          </NavLink>
          <NavLink to="/projects-in-ghaziabad" onClick={close}>
            Ghaziabad
          </NavLink>
          <NavLink to="/about" onClick={close}>
            About
          </NavLink>
          <NavLink to="/contact" onClick={close}>
            Contact
          </NavLink>
        </nav>
        <a
          className="head-call"
          href={"tel:+" + SITE.phoneIntl}
          data-track="call_click"
          onClick={() => track("call_click", { href: "tel:+" + SITE.phoneIntl })}
          aria-label={"Call " + SITE.phoneDisplay}
        >
          <span aria-hidden="true">☎</span>
          <span className="call-label">{SITE.phoneDisplay}</span>
        </a>
      </div>
    </header>
  );
}
