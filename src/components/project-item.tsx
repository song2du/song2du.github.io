import Link from "next/link";
import type { Project } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { DraftBadge, LinkButtons, TagList } from "./ui";

export function ProjectItem({ project: p }: { project: Project }) {
  return (
    <article>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h3 className="font-semibold leading-snug">
          <Link href={`/projects/${p.slug}/`} className="transition-colors hover:text-accent">
            {p.title}
          </Link>
          {p.draft && <DraftBadge />}
        </h3>
        <span className="text-xs tabular-nums text-faint">{p.period ?? formatDate(p.date, "short")}</span>
      </div>
      <p className="mt-1.5 text-[0.94rem] leading-6 text-muted">{p.summary}</p>
      {p.award && <p className="mt-1.5 text-sm font-medium text-accent">{p.award}</p>}
      {p.tags.length > 0 && (
        <div className="mt-3">
          <TagList tags={p.tags} />
        </div>
      )}
      {Object.keys(p.links).length > 0 && (
        <div className="mt-3">
          <LinkButtons links={p.links} />
        </div>
      )}
    </article>
  );
}
