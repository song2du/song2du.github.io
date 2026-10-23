import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { DraftBadge } from "@/components/ui";
import { categoryLabel } from "@/lib/categories";
import { postVersions, type Post, type PostVersion } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { LANG_LABEL, postHref, type Lang } from "@/lib/languages";
import { Mdx } from "@/lib/mdx";

// Renders one language version of a post. Used by /blog/<slug>/ and /blog/<slug>/<lang>/.
export function PostArticle({
  post,
  version,
  newer,
  older,
}: {
  post: Post;
  version: PostVersion;
  newer?: Post;
  older?: Post;
}) {
  // When a review is titled after the paper, a one-line byline replaces the card that would repeat the title.
  const paperIsTitle = post.paper?.title === version.title;
  return (
    <article lang={version.lang}>
      <header className="mb-12">
        <p className="text-sm text-faint">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span className="mx-1.5">·</span>
          <Link href={`/blog/?category=${post.category}`} className="hover:text-fg">
            {categoryLabel(post.category)}
          </Link>
          <span className="mx-1.5">·</span>
          {version.readingMinutes} min read
        </p>
        <h1 className="mt-3 text-3xl leading-tight font-bold tracking-tight sm:text-[2.1rem]">
          {version.title}
          {post.draft && <DraftBadge />}
        </h1>
        {version.description && <p className="mt-4 text-lg leading-7 text-muted">{version.description}</p>}
        {post.paper && paperIsTitle && <PaperByline paper={post.paper} />}
        <LanguageSwitch post={post} current={version.lang} />
        {post.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog/?tag=${encodeURIComponent(tag)}`}
                className="rounded-full bg-surface px-2.5 py-1 text-xs text-muted transition-colors hover:text-fg"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      {post.paper && !paperIsTitle && <PaperCard paper={post.paper} />}

      <Mdx source={version.body} />

      {(newer || older) && (
        <nav aria-label="More posts" className="mt-16 grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
          {older ? <NeighborLink post={older} lang={version.lang} label="Previous" /> : <span />}
          {newer && <NeighborLink post={newer} lang={version.lang} label="Next" align="right" />}
        </nav>
      )}
    </article>
  );
}

// Title, description, and hreflang alternates for one version of a post.
export function postMetadata(post: Post, version: PostVersion): Metadata {
  const versions = postVersions(post);
  return {
    title: version.title,
    description: version.description,
    alternates: {
      canonical: postHref(post, version.lang),
      languages: Object.fromEntries(versions.map((v) => [v.lang, postHref(post, v.lang)])),
    },
    openGraph: {
      type: "article",
      title: version.title,
      description: version.description,
      publishedTime: post.date,
      locale: version.lang === "ko" ? "ko_KR" : "en_US",
    },
  };
}

function LanguageSwitch({ post, current }: { post: Post; current: Lang }) {
  const versions = postVersions(post);
  if (versions.length < 2) return null;
  return (
    <nav aria-label="Language" className="mt-5 inline-flex rounded-lg border border-line p-0.5 text-sm">
      {versions.map((v) => (
        <Link
          key={v.lang}
          href={postHref(post, v.lang)}
          hrefLang={v.lang}
          lang={v.lang}
          aria-current={v.lang === current ? "page" : undefined}
          className={`rounded-md px-3 py-1 transition-colors ${
            v.lang === current ? "bg-surface font-medium text-fg" : "text-muted hover:text-fg"
          }`}
        >
          {LANG_LABEL[v.lang]}
        </Link>
      ))}
    </nav>
  );
}

// Jeongeon Park et al. · IUI 2026 · Paper ↗
function PaperByline({ paper }: { paper: NonNullable<Post["paper"]> }) {
  const parts = [
    paper.authors,
    paper.venue,
    paper.url && (
      <a href={paper.url} target="_blank" rel="noreferrer" className="hover:text-accent">
        Paper ↗
      </a>
    ),
  ].filter(Boolean);
  return (
    <p className="mt-3 text-sm text-muted">
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="mx-1.5">·</span>}
          {part}
        </Fragment>
      ))}
    </p>
  );
}

function PaperCard({ paper }: { paper: NonNullable<Post["paper"]> }) {
  return (
    <aside className="mb-10 rounded-lg border border-line px-5 py-4">
      <p className="text-xs font-medium tracking-wide text-faint uppercase">Paper reviewed</p>
      <p className="mt-1 font-semibold leading-snug">
        {paper.url ? (
          <a href={paper.url} target="_blank" rel="noreferrer" className="hover:text-accent">
            {paper.title} ↗
          </a>
        ) : (
          paper.title
        )}
      </p>
      {(paper.authors || paper.venue) && (
        <p className="mt-1 text-sm text-muted">{[paper.authors, paper.venue].filter(Boolean).join(" · ")}</p>
      )}
    </aside>
  );
}

// Links to the neighbor in the reader's language when it has one, otherwise the original.
function NeighborLink({ post, lang, label, align }: { post: Post; lang: Lang; label: string; align?: "right" }) {
  const version = postVersions(post).find((v) => v.lang === lang) ?? postVersions(post)[0];
  return (
    <Link href={postHref(post, version.lang)} className={`group block ${align === "right" ? "sm:text-right" : ""}`}>
      <span className="text-xs text-faint">{label}</span>
      <span lang={version.lang} className="mt-1 block font-medium leading-snug transition-colors group-hover:text-accent">
        {version.title}
      </span>
    </Link>
  );
}
