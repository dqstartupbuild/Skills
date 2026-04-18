import type { Context, Meta } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import remarkGfm from "remark-gfm";

const passThroughCache: Context["cache"] = (input, fn) =>
  fn(input as never) as never;

export async function compileSkillMarkdown(
  slug: string,
  source: string,
  fileName = "README.md",
) {
  const meta: Meta = {
    directory: `skills/${slug}`,
    extension: ".md",
    fileName: fileName.replace(/\.[^.]+$/, ""),
    filePath: `skills/${slug}/${fileName}`,
    path: `/skills/${slug}`,
  };

  return compileMDX(
    { cache: passThroughCache },
    {
      content: source,
      _meta: meta,
    },
    {
      remarkPlugins: [remarkGfm],
    },
  );
}
