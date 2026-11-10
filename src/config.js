// SITE config — the ONLY file you need to edit for contact details,
// form keys and tracking IDs. Everything else reads from here.
export const SITE = {
  url: "https://www.gaurproject.in",
  name: "Gaurs Group Projects — ",
  builder: "Gaurs Group",
  phoneDisplay: "+91 87997 56026",
  phoneIntl: "918799756026",
  whatsapp: "918799756026",
  // EmailJS keys — the shared account used across the channel partner
  // sites (publicKey / serviceId / templateId).
  emailjs: {
    publicKey: "xLfYDZXLlR6IeQ-C6",
    serviceId: "service_fkmfynb",
    templateId: "template_bdjcyq6",
  },
  formEndpoint: "",
  // Conversion tracking — paste your real IDs to activate (trackers only
  // load after the visitor consents; events always queue to dataLayer).
  gaId: "", // e.g. "G-XXXXXXXXXX"
  googleAdsId: "", // e.g. "AW-XXXXXXXXX"
  metaPixelId: "", // e.g. "000000000000000"
  logo: "/assets/gaurs-logo.png",
  ogImage: "/assets/og-image.jpg",
  heroImage: "/images/home/slider-1.webp",
};

export const CITIES = [
  { slug: "noida", name: "Noida", img: "/images/city/projects-in-noida.webp" },
  { slug: "greater-noida", name: "Greater Noida", img: "/images/city/projects-in-greater-noida.webp" },
  { slug: "ghaziabad", name: "Ghaziabad", img: "/images/city/projects-in-ghaziabad.webp" },
];

export default SITE;
