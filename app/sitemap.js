import { SITE_URL } from "../lib/site";

export default function sitemap() {
  const now = new Date();
  return ["", "/terms", "/privacy", "/refund"].map((p) => ({
    url: SITE_URL + p,
    lastModified: now,
    changeFrequency: p === "" ? "weekly" : "yearly",
    priority: p === "" ? 1 : 0.3,
  }));
}
