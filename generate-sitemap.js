// Generates public/sitemap.xml from Prismic content at build time.
// Run standalone: node generate-sitemap.js
// Runs automatically as part of `npm run build`.

const { createClient, filter } = require("@prismicio/client");
const { writeFileSync } = require("fs");
const { join } = require("path");
const sm = require("./slicemachine.config.json");

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://shapelanguage.studio"
).replace(/\/$/, "");

function formatDate(dateStr) {
  return dateStr ? dateStr.split("T")[0] : new Date().toISOString().split("T")[0];
}

function urlEntry(loc, lastmod, priority) {
  return [
    "  <url>",
    `    <loc>${SITE_URL}${loc}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");
}

async function generateSitemap() {
  const client = createClient(sm.repositoryName);
  const today = new Date().toISOString().split("T")[0];

  const [homePage, pages, workPages] = await Promise.all([
    client.getByUID("page", "home").catch(() => null),
    client.getAllByType("page", {
      filters: [filter.not("my.page.uid", "home")],
    }),
    client.getAllByType("work_content"),
  ]);

  const entries = [
    // Homepage
    urlEntry(
      "/",
      formatDate(homePage?.last_publication_date ?? today),
      "1.0"
    ),
    // Work listing (static page)
    urlEntry("/work", today, "0.8"),
    // Dynamic pages (e.g. /about, /contact)
    ...pages.map((page) =>
      urlEntry(
        `/${page.uid}`,
        formatDate(page.last_publication_date),
        "0.7"
      )
    ),
    // Individual work pages
    ...workPages.map((page) =>
      urlEntry(
        `/work/${page.uid}`,
        formatDate(page.last_publication_date),
        "0.7"
      )
    ),
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
  ].join("\n");

  const dest = join(__dirname, "public", "sitemap.xml");
  writeFileSync(dest, xml, "utf8");
  console.log(`Sitemap written to ${dest} (${entries.length} URLs)`);
}

generateSitemap().catch((err) => {
  console.error("Sitemap generation failed:", err);
  process.exit(1);
});
