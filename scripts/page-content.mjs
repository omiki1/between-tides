/**
 * Extract the readable content of a remote page for structure comparison.
 * Only the <main> element (or body) is considered; scripts and styles are dropped.
 *   node scripts/page-content.mjs <url> [chars]
 */
const url = process.argv[2];
const limit = Number(process.argv[3] ?? 3500);
if (!url) {
  console.error("usage: node scripts/page-content.mjs <url> [chars]");
  process.exit(2);
}

const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (compatible; structure-audit)", "accept-language": "zh-CN,zh;q=0.9" } });
const html = new TextDecoder("utf-8").decode(Buffer.from(await response.arrayBuffer()));

const main = /<main[\s\S]*?<\/main>/i.exec(html)?.[0] ?? html;
const text = main
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
  .replace(/<dialog[\s\S]*?<\/dialog>/gi, " ")
  .replace(/<[^>]+>/g, "\n")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&nbsp;/g, " ")
  .split("\n").map((line) => line.trim()).filter(Boolean);

/* Collapse the repeated toolbar/greeting noise that every Fuwari page carries. */
const noise = /^(文|亮色|暗色|跟随系统|音乐|暂未播放|0:00|\/|暂无歌词|外观|壁纸|偏好|主题色相|请输入搜索关键词|MENU|朝朝听雨)$/;
const lines = text.filter((line) => !noise.test(line));

console.log(`=== ${url} ===`);
console.log(lines.slice(0, 160).join("\n").slice(0, limit));
