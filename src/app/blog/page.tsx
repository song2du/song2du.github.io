import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogFilter, BlogFilterView } from "@/components/blog-filter";
import { toSummary } from "@/components/post-list";
import { PageTitle } from "@/components/ui";
import { getPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description: "Personal reflections and paper reviews.",
};

export default async function BlogPage() {
  const posts = (await getPosts()).map(toSummary);
  return (
    <>
      <PageTitle title="Blog" description="Personal reflections and paper reviews." />
      {/* The filter reads the URL in the browser; the static HTML shows every post. */}
      <Suspense fallback={<BlogFilterView posts={posts} category={null} tag={null} />}>
        <BlogFilter posts={posts} />
      </Suspense>
    </>
  );
}
