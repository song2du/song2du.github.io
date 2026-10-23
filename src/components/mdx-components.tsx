import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { AgentDemo } from "./demo/agent-demo";
import { LineChart } from "./line-chart";

function Anchor({ href = "", ...props }: ComponentProps<"a">) {
  if (href.startsWith("/")) return <Link href={href} {...props} />;
  if (href.startsWith("#")) return <a href={href} {...props} />;
  return <a href={href} target="_blank" rel="noreferrer" {...props} />;
}

// <Callout title="Key idea">...</Callout>
function Callout({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <aside className="not-prose my-6 rounded-lg border border-line bg-surface px-5 py-4 text-[0.95rem] leading-7">
      {title && <p className="mb-1 font-semibold">{title}</p>}
      <div className="[&>p+p]:mt-3">{children}</div>
    </aside>
  );
}

// <Figure src="/images/blog/foo.png" alt="..." caption="..." width={400} />
// `width` (px) is optional; without it the image fills the column. It still shrinks on narrow screens.
function Figure({ src, alt, caption, width }: { src: string; alt: string; caption?: string; width?: number }) {
  return (
    <figure>
      {/* Static export: images are served as-is from /public. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={width} className="mx-auto rounded-lg border border-line" />
      {caption && <figcaption className="text-center">{caption}</figcaption>}
    </figure>
  );
}

// <Toggle title="...">...</Toggle> — collapsed until clicked.
function Toggle({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="my-6">
      <summary className="cursor-pointer select-none text-muted hover:text-fg">{title}</summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}

// <Bookmark href="https://github.com/user/repo" title="..." description="..." />
// A link card for pointing at a repo or page. Title and description are written by hand,
// since the static export can't fetch link previews.
function Bookmark({ href, title, description }: { href: string; title: string; description?: string }) {
  const url = new URL(href);
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="not-prose my-3 block rounded-lg border border-line px-4 py-3 transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent"
    >
      <span className="block font-medium text-fg">{title}</span>
      {description && <span className="mt-0.5 line-clamp-2 block text-sm text-muted">{description}</span>}
      <span className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-faint">
        {url.hostname === "github.com" && <GitHubMark />}
        <span className="truncate">{url.hostname + url.pathname.replace(/\/$/, "")}</span>
      </span>
    </a>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true" className="shrink-0">
      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
    </svg>
  );
}

export const mdxComponents: MDXComponents = {
  a: Anchor,
  AgentDemo,
  Bookmark,
  Callout,
  Figure,
  LineChart,
  Toggle,
};
