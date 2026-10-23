import type { MetadataRoute } from "next";
import { getPosts, getProjects, getPublications, postVersions } from "@/lib/content";
import { postHref } from "@/lib/languages";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, projects, publications] = await Promise.all([getPosts(), getProjects(), getPublications()]);
  return [
    ...["", "publications/", "projects/", "blog/"].map((path) => ({ url: `${site.url}/${path}` })),
    ...publications.map((p) => ({ url: `${site.url}/publications/${p.slug}/`, lastModified: p.date })),
    ...projects.map((p) => ({ url: `${site.url}/projects/${p.slug}/`, lastModified: p.date })),
    ...posts.flatMap((p) =>
      postVersions(p).map((v) => ({ url: `${site.url}${postHref(p, v.lang)}`, lastModified: p.date })),
    ),
  ];
}
