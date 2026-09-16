import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import type { Element, ElementContent } from "hast";
import type { State } from "mdast-util-to-hast";
import type { Image, Link, Paragraph } from "mdast";

export type Heading = { depth: number; id: string; text: string };

const external = (url:string) => /^https?:/i.test(url);
const text = (value:string):ElementContent => ({ type:"text", value });
const element = (tagName:string, properties:Element["properties"], children:ElementContent[]):Element => ({ type:"element", tagName, properties, children });

/* 竖幅插图（宽高比 < 1）在正文列宽下会被拉得过高，单独标记以便样式层限宽居中。
   宽高比从 Markdown 图片标题（`![alt](/path "1600x1128")`）读取，缺省按横幅处理。 */
const TALL_RATIO_THRESHOLD = 1;
const dimensions = /^(\d+)\s*[x×]\s*(\d+)$/;

function figureClassNames(title: string | null | undefined): string[] {
  const names = ["prose-figure"];
  const match = dimensions.exec((title || "").trim());
  if (match) {
    const width = Number(match[1]);
    const height = Number(match[2]);
    if (height > 0 && width / height < TALL_RATIO_THRESHOLD) names.push("is-tall");
  }
  return names;
}

/* All body HTML is produced from our own Markdown files at build time; raw HTML is never executed. */
function imageHandler(state: State, node: Image): Element {
  const src = node.url || "";
  const alt = node.alt || "";
  const image = element("img", { src, alt, loading:"lazy", decoding:"async" }, []);
  const picture:ElementContent = external(src)
    ? element("a", { href:src, target:"_blank", rel:["noreferrer","noopener"] }, [image])
    : image;
  /* Alt text keeps the credit; external files also link to their original source. */
  const caption:ElementContent[] = [text(alt)];
  if (external(src)) caption.push(element("a", { href:src, target:"_blank", rel:["noreferrer","noopener"] }, [text("原始文件 ↗")]));
  return element("figure", { className: figureClassNames(node.title) }, [picture, element("figcaption", {}, caption)]);
}

function linkHandler(state: State, node: Link): Element {
  const href = node.url || "";
  return element("a", external(href) ? { href, target:"_blank", rel:["noreferrer","noopener"] } : { href }, state.all(node));
}

/** A paragraph that only wraps one image becomes a block figure instead of an invalid <p><figure>. */
function paragraphHandler(state: State, node: Paragraph): ElementContent | ElementContent[] {
  const images = node.children.filter((child):child is Image => child.type === "image");
  if (node.children.length === 1 && images.length === 1) return imageHandler(state, images[0]);
  return element("p", {}, state.all(node));
}

export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { handlers: { image: imageHandler, link: linkHandler, paragraph: paragraphHandler } })
    .use(rehypeSlug)
    .use(rehypeHighlight, { detect:false, ignoreMissing:true })
    .use(rehypeKatex)
    .use(rehypeStringify, { allowDangerousHtml:false })
    .process(markdown);
  return String(file);
}

const entities: Record<string,string> = { amp:"&", lt:"<", gt:">", quot:'"', "#39":"'", nbsp:" " };
const decode = (value: string) => value.replace(/&(#?\w+);/g, (match, code) => entities[code] ?? match);

/** The table of contents is derived from the same rendered HTML, so anchors always match the body. */
export function extractHeadings(html: string): Heading[] {
  const headings: Heading[] = [];
  for (const match of html.matchAll(/<h([23])\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g)) {
    const text = decode(match[3].replace(/<[^>]+>/g, "")).trim();
    if (text) headings.push({ depth: Number(match[1]), id: match[2], text });
  }
  return headings;
}
