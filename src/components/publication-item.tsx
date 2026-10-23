import Link from "next/link";
import type { Publication } from "@/lib/content";
import { AuthorList, DraftBadge, LinkButtons } from "./ui";

export function PublicationItem({ publication: p }: { publication: Publication }) {
  return (
    <article>
      <h3 className="font-semibold leading-snug">
        <Link href={`/publications/${p.slug}/`} className="transition-colors hover:text-accent">
          {p.title}
        </Link>
        {p.draft && <DraftBadge />}
      </h3>
      <p className="mt-1 text-sm leading-6 text-muted">
        <AuthorList authors={p.authors} />
      </p>
      <p className="text-sm leading-6">
        <span className="italic">{p.venue}</span>
        {p.status && <span className="ml-2 rounded bg-surface px-1.5 py-0.5 text-xs text-muted">{p.status}</span>}
      </p>
      {p.summary && <p className="mt-2 text-[0.94rem] leading-6 text-muted">{p.summary}</p>}
      <div className="mt-3">
        <LinkButtons links={p.links} />
      </div>
    </article>
  );
}
