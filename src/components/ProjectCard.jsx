import { Link } from "react-router-dom";

export function projectLocLine(p) {
  if (!p.location) return p.cityName;
  return p.location.includes(p.cityName) ? p.location : p.location + ", " + p.cityName;
}

export default function ProjectCard({ p, eager = false }) {
  const img = p.hero || (p.gallery && p.gallery[0]) || "";
  return (
    <article className="card">
      <Link className="card-media" to={"/projects/" + p.slug} aria-label={"View " + p.name}>
        {img ? (
          <img
            src={img}
            alt={p.name + " — " + projectLocLine(p)}
            {...(eager ? { fetchPriority: "high" } : { loading: "lazy", decoding: "async" })}
            width="960"
            height="640"
          />
        ) : (
          <span className="card-noimg" aria-hidden="true">
            {p.name}
          </span>
        )}
        <span className="badge">{p.type}</span>
        {p.status ? (
          <span className="badge done" style={{ left: "auto", right: 12 }}>
            {p.status}
          </span>
        ) : null}
      </Link>
      <div className="card-body">
        <h3>
          <Link to={"/projects/" + p.slug}>{p.name}</Link>
        </h3>
        <p className="card-loc">
          <span aria-hidden="true">📍</span>
          {projectLocLine(p)}
        </p>
        {p.config ? <p className="card-conf">{p.config}</p> : null}
        <p className="card-desc">{p.metaDesc}</p>
        <div className="card-foot">
          <span className="price-note">{p.startingPrice ? "From " + p.startingPrice : "Price on request"}</span>
          <Link className="btn small ghost" to={"/projects/" + p.slug}>
            Details →
          </Link>
        </div>
      </div>
    </article>
  );
}

export function SkeletonCards({ n = 3 }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <div className="skel" aria-hidden="true" key={i}>
          <div className="sk-img shimmer"></div>
          <div className="sk-line shimmer"></div>
          <div className="sk-line short shimmer"></div>
          <div className="sk-line shimmer"></div>
        </div>
      ))}
    </>
  );
}
