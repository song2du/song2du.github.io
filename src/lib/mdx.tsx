import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { mdxComponents } from "@/components/mdx-components";

// Compiles an MDX string at build time. Components in `mdxComponents`
// (e.g. <AgentDemo />, <Callout />) can be used in any post without importing them.
export async function Mdx({ source }: { source: string }) {
  const { default: Content } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [
      rehypeSlug,
      rehypeKatex,
      [rehypePrettyCode, { theme: { light: "github-light", dark: "github-dark" }, keepBackground: false }],
    ],
  });
  return (
    <div className="prose max-w-none">
      <Content components={mdxComponents} />
    </div>
  );
}
