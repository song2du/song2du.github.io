import Link from "next/link";
import { PostList, toSummary } from "@/components/post-list";
import { PublicationItem } from "@/components/publication-item";
import { ProjectItem } from "@/components/project-item";
import { SectionTitle } from "@/components/ui";
import { getPosts, getProjects, getPublications } from "@/lib/content";
import { site } from "@/lib/site";

export default async function Home() {
  const [publications, projects, posts] = await Promise.all([getPublications(), getProjects(), getPosts()]);
  const selectedPublications = publications.filter((p) => p.selected);
  const selectedProjects = projects.filter((p) => p.selected);

  return (
    <div className="space-y-20">
      <section>
        <h1 className="font-serif text-[2.6rem] leading-tight font-medium tracking-[-0.015em] sm:text-5xl">{site.name}</h1>
        <p className="mt-3 font-serif text-xl leading-snug text-muted sm:text-[1.45rem]">
          <Emphasized text={site.statement} className="whitespace-nowrap text-accent" />
        </p>
        <p className="mt-5 text-[0.94rem] leading-6 text-muted">
          {site.headline}
          <br />
          {site.affiliation}
        </p>

        <div className="mt-10 space-y-4 leading-7">
          {site.bio.map((paragraph) => (
            <p key={paragraph}>
              {/* Pretendard has no true italic, so body emphasis is color and weight. */}
              <Emphasized text={paragraph} className="font-medium text-accent not-italic" />
            </p>
          ))}
        </div>
        <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[0.94rem]">
          {site.links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer"
                className="text-muted underline decoration-line underline-offset-4 transition-colors hover:text-fg hover:decoration-fg"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {site.news.length > 0 && (
        <section>
          <SectionTitle>News</SectionTitle>
          <ul className="space-y-3">
            {site.news.map((item) => (
              <li key={item.date + item.text} className="flex gap-4 text-[0.94rem] leading-6">
                <span className="w-16 shrink-0 tabular-nums text-faint">{item.date.replace("-", ".")}</span>
                <span>
                  {item.text}
                  {item.href && (
                    <>
                      {" "}
                      <Link href={item.href} className="text-accent hover:underline">
                        Read more
                      </Link>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {selectedPublications.length > 0 && (
        <section>
          <SectionTitle href="/publications/">Selected Publications</SectionTitle>
          <div className="space-y-8">
            {selectedPublications.map((p) => (
              <PublicationItem key={p.slug} publication={p} />
            ))}
          </div>
        </section>
      )}

      {selectedProjects.length > 0 && (
        <section>
          <SectionTitle href="/projects/">Selected Projects</SectionTitle>
          <div className="space-y-8">
            {selectedProjects.map((p) => (
              <ProjectItem key={p.slug} project={p} />
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section>
          <SectionTitle href="/blog/">Recent Posts</SectionTitle>
          <PostList posts={posts.slice(0, 3).map(toSummary)} />
        </section>
      )}
    </div>
  );
}

// Renders text from site.ts, turning *words* into emphasis.
function Emphasized({ text, className }: { text: string; className: string }) {
  return text.split("*").map((part, i) =>
    i % 2 === 1 ? (
      <em key={i} className={className}>
        {part}
      </em>
    ) : (
      part
    ),
  );
}
