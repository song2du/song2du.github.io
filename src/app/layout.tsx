import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "katex/dist/katex.min.css";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";
import { THEME_SCRIPT } from "@/lib/theme";

// Serif for display text (the home statement and page titles). Body text stays Pretendard.
const serif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
  icons: { icon: "/favicon.png" },
  openGraph: { siteName: site.name, type: "website" },
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The inline script may set data-theme before React hydrates.
    <html lang="en" className={serif.variable} suppressHydrationWarning>
      <head>
        {/* Browser extensions that inject into <head> can make this tag look different on the client. */}
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="font-sans">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
