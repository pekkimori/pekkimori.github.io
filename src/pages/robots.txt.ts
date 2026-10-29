import type { APIRoute } from "astro";

const getRobotsTxt = (sitemapURL: URL) => `
User-agent: *
Allow: /

# Curious humans: /secrets/observatory.txt
# Humanos curiosos: /secrets/observatory.txt

Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL("sitemap-index.xml", site);
  return new Response(getRobotsTxt(sitemapURL));
};
