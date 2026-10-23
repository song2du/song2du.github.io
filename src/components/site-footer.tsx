import { site } from "@/lib/site";

export function SiteFooter() {
  const github = site.links.find((l) => l.label === "GitHub");
  return (
    <footer className="mt-24 flex flex-wrap gap-x-4 gap-y-1 border-t border-line py-8 text-sm text-faint">
      <span>© {new Date().getFullYear()} {site.name}</span>
      <span className="ml-auto flex gap-4">
        <a href="/feed.xml" className="hover:text-fg">
          RSS
        </a>
        {github && (
          <a href={github.href} target="_blank" rel="noreferrer" className="hover:text-fg">
            GitHub
          </a>
        )}
      </span>
    </footer>
  );
}
