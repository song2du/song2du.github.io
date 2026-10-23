import { categoryLabel } from "@/lib/categories";
import { getPosts } from "@/lib/content";
import { site } from "@/lib/site";

// Same path as the old Jekyll feed, so existing subscribers keep working.
export const dynamic = "force-static";

function escape(text: string) {
  return text.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);
}

export async function GET() {
  const posts = await getPosts();
  const items = posts
    .map((post) => {
      const url = `${site.url}/blog/${post.slug}/`;
      return `    <item>
      <title>${escape(post.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
      <category>${escape(categoryLabel(post.category))}</category>${
        post.description ? `\n      <description>${escape(post.description)}</description>` : ""
      }
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escape(site.name)}</title>
    <link>${site.url}</link>
    <description>${escape(site.description)}</description>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
