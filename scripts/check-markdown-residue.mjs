/**
 * 校验并修复「加粗结束符紧贴标点」导致的 markdown 残留。
 *
 * 问题现象
 * --------
 * 页面上出现字面的 `**`。实测确定的失败条件是：
 *
 *     标点（中文标点或半角右括号）紧接 `**`，且 `**` 后面还有非空白字符
 *
 * 举例（均实测失败）：
 *
 *   **概念图（Conceptual Graph）**由 John 提出
 *   **把表示做对。**Zhou 2016 的 Attention-BiLSTM
 *   **实体识别（Named Entity Recognition，NER）**要抽的是
 *   这里要引入**稳定婚姻问题（Stable Marriage Problem）**和 **Gale 算法**
 *
 * 原因：CommonMark 规定作为结束分隔符的 `**`，其左侧不能是空白或数字。
 * 中文标点（`）`、`。`、`，`……）与半角 `)` 都不被识别为「标点」，
 * 于是这个 `**` 既不满足「左侧是标点」也不满足「左侧是空白」，无法作为结束符。
 *
 * 修复方式
 * --------
 * 在 `**` **之后**补一个空格：
 *
 *   **概念图（Conceptual Graph）** 由 John 提出
 *
 * 关键：空格必须在 `**` **之后**。若补在之前，正好违反「左侧不能是空白」，
 * 问题会更严重 —— 这一点在开发中搞反过一次，把 106 处改成了必然失败的形态。
 *
 * 为什么不能靠源码正则直接判定
 * --------------------------
 * `**` 既是开始符也是结束符，同一段文本里还可能出现连续的结束符
 * （如 `**A**内容**B**内容`），以及代码块里的字面 `**`（Python 的 `dim ** 0.5`）。
 * 开发中试用「按出现顺序奇偶配对」来判定，结果误伤了几十处开始符。
 *
 * 因此这里采用**渲染验证**：每试一处改动就真的调用站点的 markdown 渲染器，
 * 只有让残留数下降的改动才保留。渲染器怎么认为，校验就怎么认为。
 *
 * 用法：
 *   node --experimental-strip-types scripts/check-markdown-residue.mjs
 *   node --experimental-strip-types scripts/check-markdown-residue.mjs --fix
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";

const fix = process.argv.includes("--fix");
const postsDir = path.join(process.cwd(), "content", "posts");

/** 结束符左侧出现这些字符时，该 `**` 无法作为结束分隔符。 */
const CANDIDATE = /[)\]\u3001\u3002\uff0c\uff1a\uff1b\uff09\uff01\uff1f\u300d\u300f\u201d\uff05%]\*\*(?=\S)/g;

const { renderMarkdown } = await import("../lib/markdown.ts");

/** 去掉代码区后统计字面 `**` —— 代码块里的 `**` 属正常内容。 */
async function residualOf(body) {
  const html = await renderMarkdown(body);
  const stripped = html
    .replace(/<pre[\s\S]*?<\/pre>/g, " ")
    .replace(/<code[\s\S]*?<\/code>/g, " ");
  return (stripped.match(/\*\*/g) || []).length;
}

const splitFrontmatter = (source) => {
  const head = /^---[\s\S]*?---\n/.exec(source)?.[0] ?? "";
  return { head, body: source.slice(head.length) };
};

const problems = [];
let checked = 0;
let repairedFiles = 0;

for (const file of readdirSync(postsDir).filter((f) => f.endsWith(".md")).sort()) {
  const target = path.join(postsDir, file);
  const source = readFileSync(target, "utf8");
  const { head, body } = splitFrontmatter(source);
  checked += 1;

  const before = await residualOf(body);
  if (before === 0) continue;

  if (!fix) {
    problems.push(`${file}: 渲染后有 ${before} 处字面 **`);
    continue;
  }

  /*
   * 索引说明：正则匹配到的是「标点 + **」这一段，长度为 3 个字符以上
   * （标点可能是 `)` 这类单字符，也可能是中文标点，均为单码元）。
   * 因此插入点 = match.index + match[0].length，即 `**` 之后。
   *
   * 早先误写成 match.index + 2，在「中文标点 + **」时恰好落进 `**` 中间，
   * 把 `**` 撕成 `* *`，反而制造出新的残留。写入前的渲染验证就是为此加的。
   */
  let current = body;
  let applied = 0;
  for (let guard = 0; guard < 80; guard += 1) {
    const list = [...current.matchAll(CANDIDATE)];
    if (!list.length) break;
    let improved = false;
    for (const match of list) {
      const insertAt = match.index + match[0].length;
      const trial = `${current.slice(0, insertAt)} ${current.slice(insertAt)}`;
      if ((await residualOf(trial)) < (await residualOf(current))) {
        current = trial;
        applied += 1;
        improved = true;
        break;
      }
    }
    if (!improved) break;
  }

  const after = await residualOf(current);
  if (after !== 0) {
    problems.push(`${file}: 自动修复后仍有 ${after} 处，未写入`);
    continue;
  }

  // 写回后再读一次验证：宁可报告失败，也不要静默写坏文件
  const cleaned = current
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/, ""))
    .join("\n");
  const { body: verifyBody } = splitFrontmatter(head + cleaned);
  if ((await residualOf(verifyBody)) !== 0) {
    problems.push(`${file}: 写回验证未通过，已放弃修改`);
    continue;
  }

  writeFileSync(target, head + cleaned, "utf8");
  repairedFiles += 1;
  console.log(`  fixed  ${file}（残留 ${before} -> 0，补空格 ${applied} 处）`);
}

console.log(`\n检查 ${checked} 篇文章的渲染结果。`);
if (problems.length) {
  for (const message of problems) console.log(`  ! ${message}`);
  console.log(`${problems.length} 个问题需要处理。${fix ? "" : "可加 --fix 自动修复。"}`);
  process.exit(1);
}
console.log(
  fix
    ? `已修复 ${repairedFiles} 个文件，请重新运行本脚本确认。`
    : "渲染后无 markdown 残留（代码块内的字面 ** 属正常内容，已排除）。",
);
