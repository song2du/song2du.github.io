import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { CATEGORIES, isCategory, type Category } from "./categories";
import type { DemoScenario } from "./demo-types";
import { isLang, LANGS, type Lang } from "./languages";

const CONTENT_DIR = path.join(process.cwd(), "src/content");

// Drafts show up in `npm run dev` (with a badge) and are left out of the production build.
const SHOW_DRAFTS = process.env.NODE_ENV !== "production";

const LINK_KEYS = ["paper", "code", "demo", "project", "video", "slides", "poster"] as const;
export type LinkKey = (typeof LINK_KEYS)[number];
export type Links = Partial<Record<LinkKey, string>>;

type Entry = {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  draft: boolean;
  body: string;
};

// One language version of a post.
export type PostVersion = {
  lang: Lang;
  title: string;
  description?: string;
  body: string;
  readingMinutes: number;
};

export type Post = Entry & {
  lang: Lang; // language of the original (`lang:` in frontmatter, default "en")
  description?: string;
  category: Category;
  tags: string[];
  readingMinutes: number;
  // Paper reviews only: the paper being reviewed.
  paper?: { title: string; authors?: string; venue?: string; url?: string };
  // The same post in other languages, from `<slug>.<lang>.mdx` next to the original.
  translations: PostVersion[];
};

export type Publication = Entry & {
  authors: string[];
  venue: string;
  status?: string; // e.g. "Under review"
  summary?: string;
  links: Links;
  bibtex?: string;
  selected: boolean;
};

export type Project = Entry & {
  summary: string;
  period?: string;
  tags: string[];
  links: Links;
  award?: string;
  selected: boolean;
};

// --- frontmatter helpers -------------------------------------------------

type Data = Record<string, unknown>;

class FrontmatterError extends Error {
  constructor(file: string, message: string) {
    super(`[content] ${file}: ${message}`);
  }
}

function str(data: Data, key: string, file: string): string {
  const value = data[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new FrontmatterError(file, `"${key}" is required and must be text`);
  }
  return value.trim();
}

function optStr(data: Data, key: string, file: string): string | undefined {
  if (data[key] === undefined || data[key] === null) return undefined;
  return str(data, key, file);
}

function strList(data: Data, key: string, file: string): string[] {
  const value = data[key] ?? [];
  if (!Array.isArray(value) || value.some((v) => typeof v !== "string")) {
    throw new FrontmatterError(file, `"${key}" must be a list of text`);
  }
  return value.map((v: string) => v.trim());
}

function date(data: Data, file: string): string {
  const value = data.date;
  // Unquoted YAML dates are parsed into Date objects at UTC midnight.
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  throw new FrontmatterError(file, `"date" is required and must look like 2026-01-30`);
}

function links(data: Data, file: string): Links {
  const value = (data.links ?? {}) as Data;
  const result: Links = {};
  for (const [key, href] of Object.entries(value)) {
    if (!LINK_KEYS.includes(key as LinkKey)) {
      throw new FrontmatterError(file, `unknown link "${key}" (use: ${LINK_KEYS.join(", ")})`);
    }
    if (typeof href !== "string") throw new FrontmatterError(file, `link "${key}" must be a URL`);
    result[key as LinkKey] = href;
  }
  return result;
}

function readingMinutes(body: string) {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

// --- collections ---------------------------------------------------------

// `my-post.ko.mdx` is the Korean version of `my-post.mdx`.
const TRANSLATION_FILE = new RegExp(`^(.+)\\.(${LANGS.join("|")})\\.mdx?$`);

async function readCollection(dir: string) {
  const folder = path.join(CONTENT_DIR, dir);
  const files = (await fs.readdir(folder)).filter((f) => /\.mdx?$/.test(f) && !TRANSLATION_FILE.test(f));
  return Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(folder, file), "utf8");
      const { data, content } = matter(raw);
      const relative = `${dir}/${file}`;
      return {
        file: relative,
        data: data as Data,
        entry: {
          slug: file.replace(/\.mdx?$/, ""),
          title: str(data, "title", relative),
          date: date(data, relative),
          draft: data.draft === true,
          body: content,
        } satisfies Entry,
      };
    }),
  );
}

// Translations carry only their own title, description, and body; date, category,
// tags, and draft come from the original.
async function readTranslations(dir: string) {
  const folder = path.join(CONTENT_DIR, dir);
  const files = (await fs.readdir(folder)).filter((f) => TRANSLATION_FILE.test(f));
  return Promise.all(
    files.map(async (file) => {
      const [, slug, lang] = file.match(TRANSLATION_FILE)!;
      const { data, content } = matter(await fs.readFile(path.join(folder, file), "utf8"));
      const relative = `${dir}/${file}`;
      return {
        file: relative,
        slug,
        version: {
          lang: lang as Lang,
          title: str(data, "title", relative),
          description: optStr(data, "description", relative),
          body: content,
          readingMinutes: readingMinutes(content),
        } satisfies PostVersion,
      };
    }),
  );
}

function publish<T extends Entry>(items: T[]): T[] {
  return items
    .filter((item) => SHOW_DRAFTS || !item.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export const getPosts = cache(async (): Promise<Post[]> => {
  const [raw, translations] = await Promise.all([readCollection("blog"), readTranslations("blog")]);
  for (const t of translations) {
    if (!raw.some(({ entry }) => entry.slug === t.slug)) {
      throw new FrontmatterError(t.file, `translation without an original: add blog/${t.slug}.mdx`);
    }
  }
  return publish(
    raw.map(({ file, data, entry }) => {
      const lang = data.lang ?? "en";
      if (!isLang(lang)) throw new FrontmatterError(file, `"lang" must be one of: ${LANGS.join(", ")}`);
      const own = translations.filter((t) => t.slug === entry.slug).map((t) => t.version);
      if (own.some((t) => t.lang === lang)) {
        throw new FrontmatterError(file, `has a translation in its own language ("${lang}")`);
      }
      const category = str(data, "category", file);
      if (!isCategory(category)) {
        throw new FrontmatterError(
          file,
          `"category" must be one of: ${CATEGORIES.map((c) => c.slug).join(", ")}`,
        );
      }
      const paper = data.paper as Data | undefined;
      return {
        ...entry,
        lang,
        description: optStr(data, "description", file),
        category,
        tags: strList(data, "tags", file),
        readingMinutes: readingMinutes(entry.body),
        paper: paper && {
          title: str(paper, "title", `${file} (paper)`),
          authors: optStr(paper, "authors", file),
          venue: optStr(paper, "venue", file),
          url: optStr(paper, "url", file),
        },
        translations: own,
      };
    }),
  );
});

// The original first, then its translations.
export function postVersions(post: Post): PostVersion[] {
  const { lang, title, description, body, readingMinutes } = post;
  return [{ lang, title, description, body, readingMinutes }, ...post.translations];
}

export const getPublications = cache(async (): Promise<Publication[]> => {
  const raw = await readCollection("publications");
  return publish(
    raw.map(({ file, data, entry }) => ({
      ...entry,
      authors: strList(data, "authors", file),
      venue: str(data, "venue", file),
      status: optStr(data, "status", file),
      summary: optStr(data, "summary", file),
      links: links(data, file),
      bibtex: optStr(data, "bibtex", file),
      selected: data.selected === true,
    })),
  );
});

export const getProjects = cache(async (): Promise<Project[]> => {
  const raw = await readCollection("projects");
  return publish(
    raw.map(({ file, data, entry }) => ({
      ...entry,
      summary: str(data, "summary", file),
      period: optStr(data, "period", file),
      tags: strList(data, "tags", file),
      links: links(data, file),
      award: optStr(data, "award", file),
      selected: data.selected === true,
    })),
  );
});

// --- demos ---------------------------------------------------------------

export const getDemo = cache(async (id: string): Promise<DemoScenario> => {
  const file = `demos/${id}.json`;
  let scenario: DemoScenario;
  try {
    scenario = JSON.parse(await fs.readFile(path.join(CONTENT_DIR, file), "utf8"));
  } catch (error) {
    throw new Error(`[content] could not read ${file}: ${(error as Error).message}`);
  }
  if (!scenario.participants?.length || !scenario.replay?.length) {
    throw new Error(`[content] ${file}: needs at least one participant and one replay turn`);
  }
  const ids = new Set(scenario.participants.map((p) => p.id));
  scenario.replay.forEach((turn, i) => {
    if (!ids.has(turn.speaker)) {
      throw new Error(`[content] ${file}: replay[${i}].speaker "${turn.speaker}" is not a participant`);
    }
  });
  if (scenario.live && (!ids.has(scenario.live.agent) || !ids.has(scenario.live.human))) {
    throw new Error(`[content] ${file}: live.agent and live.human must be participant ids`);
  }
  return scenario;
});

// `output: "export"` fails the build when a dynamic route generates no pages, which
// happens while every entry in a collection is still a draft. The placeholder slug
// matches nothing, so it renders the 404 page.
export function slugParams(items: { slug: string }[]) {
  return items.length ? items.map(({ slug }) => ({ slug })) : [{ slug: "__empty__" }];
}

// Same for /blog/<slug>/<lang>/ while no post has a translation yet.
export function translationParams(posts: Post[]) {
  const params = posts.flatMap((post) => post.translations.map((t) => ({ slug: post.slug, lang: t.lang })));
  return params.length ? params : [{ slug: "__empty__", lang: "__empty__" }];
}
