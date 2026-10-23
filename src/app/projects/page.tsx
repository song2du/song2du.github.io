import type { Metadata } from "next";
import { ProjectItem } from "@/components/project-item";
import { PageTitle } from "@/components/ui";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description: "Things I've built, from competition prototypes to research tools.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <PageTitle title="Projects" description="Things I've built, from competition prototypes to research tools." />
      {projects.length === 0 ? (
        <p className="text-muted">Projects are on their way.</p>
      ) : (
        <div className="space-y-12">
          {projects.map((p) => (
            <ProjectItem key={p.slug} project={p} />
          ))}
        </div>
      )}
    </>
  );
}
