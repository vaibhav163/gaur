import { useEffect } from "react";
import { Link } from "react-router-dom";
import Seo, { PAGE_SEO } from "../components/Seo.jsx";
import { track } from "../lib/tracking.js";

export default function NotFound() {
  useEffect(() => {
    track("page_view", { view: "notfound" });
  }, []);
  return (
    <div className="wrap notfound">
      <Seo title={PAGE_SEO.notfound.t} description={PAGE_SEO.notfound.d} path="404" />
      <p className="code" aria-hidden="true">
        404
      </p>
      <h1>This address doesn’t exist — yet</h1>
      <p>
        The page you’re looking for may have moved, or the link has a typo. The projects, however, are very
        real.
      </p>
      <Link className="btn" to="/projects">
        Browse all projects
      </Link>
      <Link className="btn ghost" to="/" style={{ marginLeft: 8 }}>
        Back to home
      </Link>
    </div>
  );
}
