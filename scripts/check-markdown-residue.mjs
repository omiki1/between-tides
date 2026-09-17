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

/** 去掉代码区后统计残留。
 *
 *  返回两类：
 *  - double：字面 `**`，加粗完全没解析
 *  - single：字面单个 `*`，加粗被撕开（例如源文件里 `**` 中间混入空格变成 `* *`，
 *            渲染成一个孤立 `*` 加一段斜体）
 *
 *  只查 `**` 是不够的 —— 实际漏判过一次：源文件写成 `**文字* *后续`，
 *  渲染结果里没有 `**` 但有孤立的 `*`，校验通过而页面是坏的。
 */
async function residualOf(body) {
  const html = await renderMarkdown(body);
  const stripped = html
    .replace(/<pre[\s\S]*?<\/pre>/g, " ")
    .replace(/<code[\s\S]*?<\/code>/g, " ");
  return {
    double: (stripped.match(/\*\*/g) || []).length,
    single: (stripped.match(/\*/g) || []).length,
  };
}

/** 残留总数：两类都要算，任一不为 0 都算有问题。 */
async function residualCount(body) {
  const { double, single } = await residualOf(body);
  return double + single;
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

  const before = await residualCount(body);
  if (before === 0) continue;

  if (!fix) {
    const { double, single } = await residualOf(body);
    const detail = [double ? `字面 ** × ${double}` : null, single ? `孤立 * × ${single}` : null]
      .filter(Boolean)
      .join("，");
    problems.push(`${file}: 渲染后残留（${detail}）`);
    continue;
  }

  /*
   * 修复分三步。
   *
   * 步骤 1：先把被空格撕开的 `* *` 无条件归位成 `**`。
   *   这一步不做渲染比较，直接改。原因是它无歧义：正文里不会出现
   *   「星号 + 空格 + 星号」这种合法写法，而它的存在必然是 `**` 被写坏。
   *   之所以要先做，是因为「归位」这个动作单独看常常不让残留数下降 ——
   *   归位后的 `**` 往往又落入「后跟正文」的失败形态，需要接着补空格。
   *   若把两类改动放在同一个循环里逐次比较，就会在归位这一步卡住不动。
   *
   * 步骤 2：对「标点 + ** + 非空白」在 `**` 之后补空格。
   *   索引说明：CANDIDATE 匹配到的是「标点 + **」，标点可能是 `)` 或中文标点、
   *   均为单码元，因此插入点 = match.index + match[0].length，即 `**` 之后。
   *   早先误写成 +2，在「中文标点 + **」时落进 `**` 中间，把 `**` 撕成 `* *`。
   *
   * 步骤 3：全部改动写回后再渲染一次。若不干净就整个放弃，宁可报告失败，
   *   也不要静默写坏文件。
   */
  let current = body.replace(/\* +\*/g, "**");
  const normalized = current !== body;
  let applied = normalized ? 1 : 0;

  for (let guard = 0; guard < 200; guard += 1) {
    const base = await residualCount(current);
    let improved = false;
    for (const match of current.matchAll(CANDIDATE)) {
      const insertAt = match.index + match[0].length;
      const trial = `${current.slice(0, insertAt)} ${current.slice(insertAt)}`;
      if ((await residualCount(trial)) < base) {
        current = trial;
        applied += 1;
        improved = true;
        break;
      }
    }
    if (!improved) break;
  }

  const after = await residualCount(current);
  if (after !== 0) {
    problems.push(`${file}: 自动修复后仍有 ${after} 处残留，未写入`);
    continue;
  }

  // 写回后再读一次验证：宁可报告失败，也不要静默写坏文件
  const cleaned = current
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/, ""))
    .join("\n");
  const { body: verifyBody } = splitFrontmatter(head + cleaned);
  if ((await residualCount(verifyBody)) !== 0) {
    problems.push(`${file}: 写回验证未通过，已放弃修改`);
    continue;
  }

  writeFileSync(target, head + cleaned, "utf8");
  repairedFiles += 1;
  console.log(`  fixed  ${file}（残留 ${before} -> 0，改动 ${applied} 处）`);
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
    : "渲染后无 markdown 残留（同时检查字面 ** 与孤立 *；代码块内的星号属正常内容，已排除）。",
);
