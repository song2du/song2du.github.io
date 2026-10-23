// Blog posts are written in one language, optionally with a translation in the other.
// The rest of the site is English.
export const LANGS = ["en", "ko"] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_LABEL: Record<Lang, string> = { en: "English", ko: "한국어" };

export function isLang(value: unknown): value is Lang {
  return LANGS.includes(value as Lang);
}

// The original lives at /blog/<slug>/, a translation at /blog/<slug>/<lang>/.
export function postHref(post: { slug: string; lang: Lang }, lang: Lang = post.lang) {
  return lang === post.lang ? `/blog/${post.slug}/` : `/blog/${post.slug}/${lang}/`;
}
