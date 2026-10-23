import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostArticle, postMetadata } from "@/components/post-article";
import { getPosts, postVersions, slugParams } from "@/lib/content";

export const dynamicParams = false;

export async function generateStaticParams() {
  return slugParams(await getPosts());
}

async function findPost(slug: string) {
  const posts = await getPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();
  // Posts are sorted newest first.
  return { post: posts[index], newer: posts[index - 1], older: posts[index + 1] };
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { post } = await findPost((await params).slug);
  return postMetadata(post, postVersions(post)[0]);
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { post, newer, older } = await findPost((await params).slug);
  return <PostArticle post={post} version={postVersions(post)[0]} newer={newer} older={older} />;
}
