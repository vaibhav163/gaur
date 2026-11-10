import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import CookieConsent from "./components/CookieConsent.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import { CITIES } from "./config.js";
import { projectBySlug } from "./data/projects.js";
import { startPhotoSafety } from "./lib/photoSafety.js";
import About from "./pages/About.jsx";
import CityPage from "./pages/CityPage.jsx";
import Contact from "./pages/Contact.jsx";
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProjectDetail from "./pages/ProjectDetail.jsx";
import Projects from "./pages/Projects.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

// Legacy URLs from the old static site:
//   /projects-in-{city}/{slug}/index.html  ->  /projects/{slug}
//   /projects-in-{city}/index.html         ->  /projects-in-{city}
//   /{slug}/index.html (root-level)        ->  /projects/{slug} when it is a project
//   /index.html                            ->  /
// Server-side 301s for these live in vercel.json; this is the in-app net
// for anyone who lands on the SPA with a legacy path.
function LegacyRedirects() {
  const { pathname, search } = useLocation();
  if (!pathname.endsWith(".html") && !pathname.endsWith("/index")) return null;
  let clean = pathname.replace(/\/index\.html$/, "").replace(/\.html$/, "");
  if (clean === "" || clean === "/index") clean = "/";
  const cityProj = clean.match(/^\/projects-in-([a-z-]+)\/([a-z0-9-]+)$/);
  if (cityProj && projectBySlug(cityProj[2])) {
    return <Navigate to={"/projects/" + cityProj[2] + search} replace />;
  }
  const rootProj = clean.match(/^\/([a-z0-9-]+)$/);
  if (rootProj && projectBySlug(rootProj[1])) {
    return <Navigate to={"/projects/" + rootProj[1] + search} replace />;
  }
  if (clean !== pathname) return <Navigate to={clean + search} replace />;
  return null;
}

export default function App() {
  useEffect(() => startPhotoSafety(), []);
  return (
    <BrowserRouter>
      <ToastProvider>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Header />
        <LegacyRedirects />
        <ScrollToTop />
        <main id="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            {CITIES.map((c) => (
              <Route
                key={c.slug}
                path={"/projects-in-" + c.slug}
                element={<CityPage citySlug={c.slug} />}
              />
            ))}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <CookieConsent />
      </ToastProvider>
    </BrowserRouter>
  );
}
