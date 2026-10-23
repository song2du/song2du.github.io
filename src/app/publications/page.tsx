import type { Metadata } from "next";
import { PublicationItem } from "@/components/publication-item";
import { PageTitle } from "@/components/ui";
import { getPublications, type Publication } from "@/lib/content";

export const metadata: Metadata = {
  title: "Publications",
  description: "Papers and preprints, with interactive demos where possible.",
};

export default async function PublicationsPage() {
  const publications = await getPublications();
  const byYear = new Map<string, Publication[]>();
  for (const p of publications) {
    const year = p.date.slice(0, 4);
    byYear.set(year, [...(byYear.get(year) ?? []), p]);
  }

  return (
    <>
      <PageTitle
        title="Publications"
        description="Papers and preprints. Where I can, each one comes with a demo you can try in the browser."
      />
      {publications.length === 0 ? (
        <p className="text-muted">Nothing published yet. Check back soon.</p>
      ) : (
        <div className="space-y-14">
          {[...byYear].map(([year, items]) => (
            <section key={year}>
              <h2 className="mb-6 text-sm font-semibold tabular-nums text-faint">{year}</h2>
              <div className="space-y-10">
                {items.map((p) => (
                  <PublicationItem key={p.slug} publication={p} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
