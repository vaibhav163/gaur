# Deploy — gaurproject.in

The `dist/` folder in this package is the ready-to-deploy build.

**Option A (simplest, like the other sites):** upload the *contents* of
`dist/` to the root of the GitHub repo connected to Vercel for
gaurproject.in. `dist/vercel.json` already carries the SPA rewrite,
legacy-URL redirects and security headers. No build step needed on Vercel
(framework: Other / output directory: `.` if Vercel asks).

**Option B:** push the full source to a repo and let Vercel build it
(framework: Vite, build command `npm run build`, output `dist`), then copy
`vercel.json` into `dist/` once — or add a postbuild step that does it.

After deploy:
1. Open https://www.gaurproject.in/ and a project page — check both load.
2. Submit the contact form once — you should get the success toast and the
   enquiry email (EmailJS). If email fails it opens WhatsApp instead.
3. Submit https://www.gaurproject.in/sitemap.xml in Google Search Console.
