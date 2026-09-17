/**
 * 知识图谱系列的概念图生成器。
 *
 * 设计约束
 * --------
 * 站点有深浅两套主题，但文章里的图片不会随主题反色（图集与项目截图的既有约定）。
 * 因此所有图解统一使用「浅色画布」：浅底深字在深色页面上表现为一张纸片，
 * 可读性最好；在浅色页面上则与正文融为一体。
 *
 * 配色取自 styles/tokens.css 的语义 token，但固定使用其中的「浅色主题」取值，
 * 避免图解随主题切换而失效。
 */

const palette = {
  canvas: "#fbf9fc",
  grid: "#efe9f4",
  card: "#ffffff",
  border: "rgba(92,72,124,.16)",
  borderStrong: "rgba(92,72,124,.30)",
  ink: "#2c2340",
  inkSoft: "#4f4568",
  inkMuted: "#6b7c94",
  pink: "#a84e78",
  pinkSoft: "#f7e8f0",
  blue: "#1e6089",
  blueSoft: "#e4eff7",
  mint: "#2f7a63",
  mintSoft: "#e5f3ee",
  amber: "#8a6a1f",
  amberSoft: "#f8f1de",
  rose: "#b8506f",
  roseSoft: "#fbe9ee",
};

const font =
  "Inter, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif";

const esc = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** 把长文本按字数切成多行，中英混排按"一个汉字算 1、一个西文字符算 0.55"估算。 */
function wrap(text, maxUnits) {
  const lines = [];
  let line = "";
  let units = 0;
  for (const char of String(text)) {
    const width = /[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(char) ? 1 : 0.55;
    if (units + width > maxUnits && line) {
      lines.push(line);
      line = char;
      units = width;
    } else {
      line += char;
      units += width;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** 圆角矩形。 */
function rect({ x, y, w, h, r = 10, fill = palette.card, stroke = palette.border, strokeWidth = 1.5, dash }) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
}

/** 文本块。align 支持 start / middle / end，多行时按 lineHeight 排布。 */
function text(value, { x, y, size = 14, weight = 400, fill = palette.ink, align = "start", lineHeight = 1.5, maxUnits = 0, anchor = "middle" }) {
  const lines = maxUnits ? wrap(value, maxUnits) : String(value).split("\n");
  const startY = anchor === "middle" ? y - ((lines.length - 1) * size * lineHeight) / 2 : y;
  const anchorAttr = align === "middle" ? "middle" : align === "end" ? "end" : "start";
  return lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${startY + index * size * lineHeight}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchorAttr}" dominant-baseline="middle">${esc(line)}</text>`,
    )
    .join("");
}

/** 带标题与可选副标题的卡片。返回 svg 片段与内容区坐标。 */
function card({ x, y, w, h, title, subtitle, fill = palette.card, stroke = palette.border, titleSize = 14, subtitleSize = 11, accent }) {
  const parts = [rect({ x, y, w, h, fill, stroke })];
  if (accent) parts.unshift(rect({ x, y, w, h: 3.5, r: 2, fill: accent, stroke: "none" }));
  let cursor = y + (subtitle ? h / 2 - 9 : h / 2);
  if (subtitle) {
    parts.push(text(title, { x: x + w / 2, y: cursor, size: titleSize, weight: 600, align: "middle", maxUnits: (w - 24) / (titleSize * 0.62) }));
    cursor += titleSize * 1.45;
    parts.push(text(subtitle, { x: x + w / 2, y: cursor + 2, size: subtitleSize, fill: palette.inkMuted, align: "middle", maxUnits: (w - 20) / (subtitleSize * 0.62) }));
  } else {
    parts.push(text(title, { x: x + w / 2, y: cursor, size: titleSize, weight: 600, align: "middle", maxUnits: (w - 24) / (titleSize * 0.62) }));
  }
  return parts.join("");
}

/** 直线箭头。dash 用于表示"可选"或"弱关系"。 */
function arrow({ from, to, color = palette.inkMuted, width = 1.8, dash, curve = 0, label, labelSize = 11, labelFill }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 + curve;
  const path = curve
    ? `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`
    : `M ${x1} ${y1} L ${x2} ${y2}`;
  const parts = [
    `<path d="${path}" fill="none" stroke="${color}" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ""} marker-end="url(#arrow-${color.replace(/[^a-z0-9]/gi, "")})"/>`,
  ];
  if (label) {
    const lx = curve ? mx : (x1 + x2) / 2;
    const ly = (y1 + y2) / 2 - 8;
    const w = String(label).length * labelSize * 0.62 + 12;
    parts.push(rect({ x: lx - w / 2, y: ly - labelSize * 0.95, w, h: labelSize * 1.9, r: 4, fill: palette.canvas, stroke: "none" }));
    parts.push(text(label, { x: lx, y: ly, size: labelSize, fill: labelFill ?? palette.inkSoft, align: "middle" }));
  }
  return parts.join("");
}

/** 无箭头的连线（用于层级、邻接等对称关系）。 */
function line({ from, to, color = palette.borderStrong, width = 1.5, dash }) {
  return `<line x1="${from[0]}" y1="${from[1]}" x2="${to[0]}" y2="${to[1]}" stroke="${color}" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
}

/** 小标签（标签胶囊），用于三元组、类型标注等。 */
function chip({ x, y, w, h = 26, label, fill = palette.pinkSoft, ink = palette.pink, size = 12, stroke = "none" }) {
  return [
    rect({ x, y, w, h, r: h / 2, fill, stroke, strokeWidth: 1 }),
    text(label, { x: x + w / 2, y: y + h / 2, size, weight: 550, fill: ink, align: "middle" }),
  ].join("");
}

/** 椭圆/圆形节点。 */
function node({ cx, cy, rx, ry, label, fill = palette.card, stroke = palette.borderStrong, size = 12, ink = palette.ink, weight = 550 }) {
  return [
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>`,
    text(label, { x: cx, y: cy, size, weight, fill: ink, align: "middle", maxUnits: (rx * 1.7) / (size * 0.62) }),
  ].join("");
}

/** 段落标题（图内的分区标题）。 */
function sectionLabel(label, { x, y, fill = palette.inkMuted, size = 11.5 }) {
  return `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="650" letter-spacing="0.6" fill="${fill}" dominant-baseline="middle">${esc(label)}</text>`;
}

/** 页眉占位：标题行 + 分隔线。 */
const HEADER_HEIGHT = 74;
/** 图注占位：分隔线 + 一行图注 + 下边距。
 *  下方 captionBlock 用到的位置必须落在本值之内：
 *  分隔线在 +6，文字基线在 +34，因此 54 刚好留出 20px 下边距。 */
const CAPTION_HEIGHT = 54;

/**
 * 组装成完整 SVG。
 *
 * 入参 `height` 是**正文区域所需的高度**，不是整幅画布高度。
 * 页眉与图注的占位由本函数自行加上（见 HEADER_HEIGHT / CAPTION_HEIGHT），
 * 调用方不需要也不应该自己加这两个数字——早先的版本让调用方手写 108，
 * 与实际占位不符，导致图注被推出画布。
 *
 * 每个图的箭头 marker 需要按颜色分别定义，因此先扫描所有片段收集用到的颜色。
 */
function build({ width, height, title, caption, body }) {
  const usedColors = [...new Set([...`${body}`.matchAll(/marker-end="url\(#arrow-([a-z0-9]+)\)"/gi)].map((m) => m[1]))];
  const markers = usedColors
    .map((key) => {
      // 从 palette 或原色值里找回真实颜色
      const color = Object.values(palette).find((v) => v.replace(/[^a-z0-9]/gi, "") === key) ?? `#${key}`;
      return `<marker id="arrow-${key}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 1 L 10 5 L 0 9 z" fill="${color}"/></marker>`;
    })
    .join("");

  const headerHeight = title ? HEADER_HEIGHT : 0;
  const captionHeight = caption ? CAPTION_HEIGHT : 0;
  // 入参 height 即正文所需高度
  const bodyHeight = Math.max(40, height);

  // 画布坐标（绝对值）：正文从 headerHeight 开始，到 bodyBottom 结束
  const bodyTop = headerHeight;
  const bodyBottom = bodyTop + bodyHeight;
  const total = bodyBottom + captionHeight;

  const header = title
    ? [
        text(title, { x: 48, y: 40, size: 21, weight: 650, fill: palette.ink, align: "start" }),
        `<line x1="48" y1="60" x2="${width - 48}" y2="60" stroke="${palette.grid}" stroke-width="1.5"/>`,
      ].join("")
    : "";

  // 图注位置全部由 bodyBottom 推导，不再另加一次 headerHeight，避免偏移被算两遍
  const captionBlock = caption
    ? [
        `<line x1="48" y1="${bodyBottom + 4}" x2="${width - 48}" y2="${bodyBottom + 4}" stroke="${palette.grid}" stroke-width="1.5"/>`,
        text(caption, { x: 48, y: bodyBottom + 26, size: 12, fill: palette.inkMuted, align: "start", maxUnits: (width - 96) / (12 * 0.62) }),
      ].join("")
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${total}" viewBox="0 0 ${width} ${total}">
<metadata>${JSON.stringify({ width, total, bodyTop, bodyBottom, captionBottom: total, header: Boolean(title), caption: Boolean(caption) })}</metadata>
<defs>${markers}
<pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1.2" cy="1.2" r="1.2" fill="${palette.grid}"/></pattern>
</defs>
<rect width="${width}" height="${total}" fill="${palette.canvas}"/>
<rect width="${width}" height="${total}" fill="url(#dots)" opacity="0.55"/>
${header}
<g transform="translate(0,${headerHeight})">${body}</g>
${captionBlock}
<rect x="1" y="1" width="${width - 2}" height="${total - 2}" rx="14" fill="none" stroke="${palette.border}" stroke-width="2"/>
</svg>`;
}


export { palette, font, wrap, rect, text, card, arrow, line, chip, node, sectionLabel, build, esc };
