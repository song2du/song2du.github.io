"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/publications/", label: "Publications" },
  { href: "/projects/", label: "Projects" },
  { href: "/blog/", label: "Blog" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-8 sm:py-10">
      <Link href="/" className="font-semibold tracking-tight hover:text-accent">
        {site.name}
      </Link>
      <div className="-mx-2 flex items-center gap-1">
        <nav aria-label="Main" className="flex gap-1 text-[0.94rem]">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href.slice(0, -1));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-2 py-1 transition-colors ${
                  active ? "text-fg" : "text-muted hover:text-fg"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
