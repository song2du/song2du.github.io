import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DraftBadge, LinkButtons, TagList } from "@/components/ui";
import { getProjects, slugParams } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { Mdx } from "@/lib/mdx";

export const dynamicParams = false;

export async function generateStaticParams() {
  return slugParams(await getProjects());
}

async function findProject(slug: string) {
  const project = (await getProjects()).find((p) => p.slug === slug);
  if (!project) notFound();
  return project;
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const p = await findProject((await params).slug);
  return { title: p.title, description: p.summary };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const p = await findProject((await params).slug);

  return (
    <article>
      <header className="mb-12">
        <p className="text-sm tabular-nums text-faint">{p.period ?? formatDate(p.date, "short")}</p>
        <h1 className="mt-3 text-3xl leading-tight font-bold tracking-tight sm:text-[2.1rem]">
          {p.title}
          {p.draft && <DraftBadge />}
        </h1>
        <p className="mt-4 text-lg leading-7 text-muted">{p.summary}</p>
        {p.award && <p className="mt-3 font-medium text-accent">{p.award}</p>}
        <div className="mt-6 flex flex-col gap-4">
          {p.tags.length > 0 && <TagList tags={p.tags} />}
          <LinkButtons links={p.links} />
        </div>
      </header>

      <Mdx source={p.body} />
    </article>
  );
}
