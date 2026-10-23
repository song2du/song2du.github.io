import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Bibtex } from "@/components/bibtex";
import { AuthorList, DraftBadge, LinkButtons } from "@/components/ui";
import { getPublications, slugParams } from "@/lib/content";
import { Mdx } from "@/lib/mdx";

export const dynamicParams = false;

export async function generateStaticParams() {
  return slugParams(await getPublications());
}

async function findPublication(slug: string) {
  const publication = (await getPublications()).find((p) => p.slug === slug);
  if (!publication) notFound();
  return publication;
}

export async function generateMetadata({ params }: PageProps<"/publications/[slug]">): Promise<Metadata> {
  const p = await findPublication((await params).slug);
  return { title: p.title, description: p.summary ?? `${p.authors.join(", ")}. ${p.venue}.` };
}

export default async function PublicationPage({ params }: PageProps<"/publications/[slug]">) {
  const p = await findPublication((await params).slug);

  return (
    <article>
      <header className="mb-12">
        <p className="text-sm text-faint">
          {p.venue}
          {p.status && <span> · {p.status}</span>}
        </p>
        <h1 className="mt-3 text-3xl leading-tight font-bold tracking-tight sm:text-[2.1rem]">
          {p.title}
          {p.draft && <DraftBadge />}
        </h1>
        <p className="mt-4 leading-7 text-muted">
          <AuthorList authors={p.authors} />
        </p>
        <div className="mt-6">
          <LinkButtons links={p.links}>
            {p.bibtex && (
              <a
                href="#bibtex"
                className="rounded-md border border-line px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:border-fg hover:text-fg"
              >
                BibTeX
              </a>
            )}
          </LinkButtons>
        </div>
      </header>

      <Mdx source={p.body} />

      {p.bibtex && (
        <section id="bibtex" className="mt-16 scroll-mt-8">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-faint uppercase">BibTeX</h2>
          <Bibtex value={p.bibtex} />
        </section>
      )}
    </article>
  );
}
