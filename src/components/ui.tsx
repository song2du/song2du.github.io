import Link from "next/link";
import type { ReactNode } from "react";
import type { LinkKey, Links } from "@/lib/content";
import { site } from "@/lib/site";

export function PageTitle({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <div className="mb-12">
      <h1 className="font-serif text-[2.5rem] leading-tight font-medium tracking-[-0.01em]">{title}</h1>
      {description && <p className="mt-3 leading-7 text-muted">{description}</p>}
    </div>
  );
}

export function SectionTitle({ children, href }: { children: ReactNode; href?: string }) {
  return (
    <div className="mb-5 flex items-baseline justify-between">
      <h2 className="text-sm font-semibold tracking-wide text-faint uppercase">{children}</h2>
      {href && (
        <Link href={href} className="text-sm text-muted hover:text-fg">
          View all →
        </Link>
      )}
    </div>
  );
}

export function DraftBadge() {
  return (
    <span className="ml-2 rounded bg-danger/10 px-1.5 py-0.5 align-middle text-[0.7rem] font-medium text-danger">
      DRAFT
    </span>
  );
}

const LINK_LABELS: Record<LinkKey, string> = {
  paper: "Paper",
  code: "Code",
  demo: "Demo",
  project: "Project",
  video: "Video",
  slides: "Slides",
  poster: "Poster",
};

export function LinkButtons({ links, children }: { links: Links; children?: ReactNode }) {
  const entries = Object.entries(links) as [LinkKey, string][];
  if (!entries.length && !children) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([key, href]) => {
        const className =
          "rounded-md border border-line px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:border-fg hover:text-fg";
        return href.startsWith("/") || href.startsWith("#") ? (
          <Link key={key} href={href} className={className}>
            {LINK_LABELS[key]}
          </Link>
        ) : (
          <a key={key} href={href} target="_blank" rel="noreferrer" className={className}>
            {LINK_LABELS[key]}
          </a>
        );
      })}
      {children}
    </div>
  );
}

// Bolds the site owner's name. Append "*" to a name for equal contribution.
export function AuthorList({ authors }: { authors: string[] }) {
  return (
    <>
      {authors.map((author, i) => (
        <span key={author}>
          {author.replace(/\*$/, "") === site.name ? <span className="font-semibold text-fg">{author}</span> : author}
          {i < authors.length - 1 && ", "}
        </span>
      ))}
    </>
  );
}

export function TagList({ tags }: { tags: string[] }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span key={tag} className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">
          {tag}
        </span>
      ))}
    </span>
  );
}
