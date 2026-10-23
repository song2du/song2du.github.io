import Link from "next/link";
import { categoryLabel } from "@/lib/categories";
import type { Post } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { LANG_LABEL, type Lang } from "@/lib/languages";
import { DraftBadge, TagList } from "./ui";

export type PostSummary = Omit<Post, "body" | "translations"> & { languages: Lang[] };

export function toSummary({ body, translations, ...summary }: Post): PostSummary {
  return { ...summary, languages: [summary.lang, ...translations.map((t) => t.lang)] };
}

export function PostList({ posts, empty = "No posts yet." }: { posts: PostSummary[]; empty?: string }) {
  if (!posts.length) return <p className="py-6 text-muted">{empty}</p>;
  return (
    <ul className="-my-5 divide-y divide-line">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link href={`/blog/${post.slug}/`} className="group block py-5">
            <p className="text-xs text-faint">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span className="mx-1.5">·</span>
              {categoryLabel(post.category)}
              {/* Only worth mentioning when it isn't the default English-only post. */}
              {(post.languages.length > 1 || post.lang !== "en") && (
                <>
                  <span className="mx-1.5">·</span>
                  {post.languages.map((l) => LANG_LABEL[l]).join(" / ")}
                </>
              )}
            </p>
            <h3 lang={post.lang} className="mt-1 text-[1.05rem] font-semibold leading-snug transition-colors group-hover:text-accent">
              {post.title}
              {post.draft && <DraftBadge />}
            </h3>
            {post.description && <p className="mt-1.5 line-clamp-2 text-[0.94rem] leading-6 text-muted">{post.description}</p>}
            {post.tags.length > 0 && (
              <div className="mt-2.5">
                <TagList tags={post.tags} />
              </div>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
