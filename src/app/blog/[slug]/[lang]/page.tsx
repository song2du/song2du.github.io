import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostArticle, postMetadata } from "@/components/post-article";
import { getPosts, translationParams } from "@/lib/content";

// A translated post, e.g. /blog/my-post/ko/ for blog/my-post.ko.mdx.
export const dynamicParams = false;

export async function generateStaticParams() {
  return translationParams(await getPosts());
}

async function findTranslation(slug: string, lang: string) {
  const posts = await getPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  const version = posts[index]?.translations.find((t) => t.lang === lang);
  if (!version) notFound();
  return { post: posts[index], version, newer: posts[index - 1], older: posts[index + 1] };
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]/[lang]">): Promise<Metadata> {
  const { slug, lang } = await params;
  const { post, version } = await findTranslation(slug, lang);
  return postMetadata(post, version);
}

export default async function TranslatedPostPage({ params }: PageProps<"/blog/[slug]/[lang]">) {
  const { slug, lang } = await params;
  const { post, version, newer, older } = await findTranslation(slug, lang);
  return <PostArticle post={post} version={version} newer={newer} older={older} />;
}
