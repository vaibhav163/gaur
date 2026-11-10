// Photo safety net — ported from the static site's js/site.js.
// Watches for photos as they are rendered, promotes any lazy photo to
// eager as soon as it nears the viewport (native lazy stays as the first
// pass), retries a photo once if its load errors, and sweeps shortly
// after each render so a stalled lazy queue can never leave a page
// photoless.
export function startPhotoSafety() {
  const photoIO =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((en) => {
              if (en.isIntersecting) {
                en.target.loading = "eager";
                photoIO.unobserve(en.target);
              }
            });
          },
          { rootMargin: "900px 0px" }
        )
      : null;

  function watchPhoto(img) {
    if (!img || img.dataset.watched) return;
    img.dataset.watched = "1";
    if (photoIO && img.loading === "lazy") photoIO.observe(img);
  }
  function sweepPhotos() {
    document.querySelectorAll("img").forEach(watchPhoto);
    setTimeout(
      () =>
        document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
          img.loading = "eager";
        }),
      2500
    );
  }

  sweepPhotos();
  const mo = new MutationObserver(() => sweepPhotos());
  mo.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener(
    "error",
    (e) => {
      const img = e.target;
      if (img && img.tagName === "IMG" && !img.dataset.retried) {
        img.dataset.retried = "1";
        img.loading = "eager";
        const src = img.getAttribute("src");
        if (src) img.src = src; /* one re-request: transient failures recover */
      }
    },
    true
  );
  return () => mo.disconnect();
}
