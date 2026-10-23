"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CATEGORIES, isCategory, type Category } from "@/lib/categories";
import { PostList, type PostSummary } from "./post-list";

// Filters live in the URL (/blog/?category=paper-review&tag=llm) so a filtered view can be shared.
export function BlogFilter({ posts }: { posts: PostSummary[] }) {
  const params = useSearchParams();
  const category = params.get("category");
  return (
    <BlogFilterView
      posts={posts}
      category={isCategory(category) ? category : null}
      tag={params.get("tag")}
    />
  );
}

function href(category: Category | null, tag: string | null) {
  const query = new URLSearchParams();
  if (category) query.set("category", category);
  if (tag) query.set("tag", tag);
  const qs = query.toString();
  return qs ? `/blog/?${qs}` : "/blog/";
}

// Rendered on its own (no filters active) as the static HTML before the URL is read.
export function BlogFilterView({
  posts,
  category,
  tag,
}: {
  posts: PostSummary[];
  category: Category | null;
  tag: string | null;
}) {
  const inCategory = category ? posts.filter((p) => p.category === category) : posts;
  const visible = tag ? inCategory.filter((p) => p.tags.includes(tag)) : inCategory;

  // Tags available in the current category, most used first.
  const counts = new Map<string, number>();
  inCategory.forEach((p) => p.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
  const tags = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t);

  const tabs = [
    { slug: null, label: "All", count: posts.length },
    ...CATEGORIES.map((c) => ({ ...c, count: posts.filter((p) => p.category === c.slug).length })),
  ];

  return (
    <div>
      <nav aria-label="Categories" className="flex gap-5 border-b border-line text-[0.94rem]">
        {tabs.map((t) => {
          const active = t.slug === category;
          return (
            <Link
              key={t.label}
              href={href(t.slug, null)}
              scroll={false}
              replace
              aria-current={active ? "page" : undefined}
              className={`-mb-px border-b-2 pb-2.5 transition-colors ${
                active ? "border-fg font-medium text-fg" : "border-transparent text-muted hover:text-fg"
              }`}
            >
              {t.label} <span className="text-xs tabular-nums text-faint">{t.count}</span>
            </Link>
          );
        })}
      </nav>

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Tags">
          {tags.map((t) => {
            const active = t === tag;
            return (
              <Link
                key={t}
                href={href(category, active ? null : t)}
                scroll={false}
                replace
                aria-current={active ? "true" : undefined}
                className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                  active ? "bg-fg text-bg" : "bg-surface text-muted hover:text-fg"
                }`}
              >
                #{t}
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-10">
        <PostList posts={visible} empty="No posts match this filter." />
      </div>
    </div>
  );
}
