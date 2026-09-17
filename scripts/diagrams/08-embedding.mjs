import { palette as p, rect, text, arrow, chip, sectionLabel, build } from "./kit.mjs";

const W = 1120;

/** 08-A 从独热向量到稠密向量 */
function oneHotToDense() {
  const body = [];
  const top = 28;
  const noteH = 62;
  const panelH = 258;
  const noteBoxTop = top + 122;
  const noteBoxH = 76;
  const cellY = top + 88;
  const cellH = 30;
  const cellW = 14;

  // 左：独热
  const x1 = 48;
  const w1 = 300;
  body.push(rect({ x: x1, y: top, w: w1, h: panelH, r: 13, fill: p.card, stroke: p.border }));
  body.push(rect({ x: x1, y: top, w: w1, h: 4, r: 2, fill: p.blue, stroke: "none" }));
  body.push(text("独热向量 One-hot", { x: x1 + w1 / 2, y: top + 30, size: 15, weight: 650, fill: p.blue, align: "middle" }));
  body.push(text("维度 = 实体表的大小", { x: x1 + w1 / 2, y: top + 50, size: 11, fill: p.inkMuted, align: "middle" }));

  for (let index = 0; index < 16; index += 1) {
    const active = index === 5;
    body.push(
      rect({
        x: x1 + 22 + index * cellW,
        y: cellY,
        w: cellW - 2,
        h: cellH,
        r: 3,
        fill: active ? p.blue : p.canvas,
        stroke: p.border,
      }),
    );
    body.push(text(active ? "1" : "0", { x: x1 + 22 + index * cellW + (cellW - 2) / 2, y: cellY + cellH / 2, size: 11, weight: 650, fill: active ? p.card : p.inkMuted, align: "middle" }));
  }
  body.push(text("⋯", { x: x1 + w1 - 18, y: cellY + cellH / 2, size: 13, fill: p.inkMuted, align: "middle" }));
  body.push(text("只有一位是 1，其余全是 0", { x: x1 + w1 / 2, y: cellY + cellH + 22, size: 11.5, fill: p.inkSoft, align: "middle" }));

  body.push(rect({ x: x1 + 18, y: noteBoxTop, w: w1 - 36, h: noteBoxH, r: 10, fill: p.blueSoft, stroke: p.border }));
  body.push(text("任意两个实体两两正交", { x: x1 + w1 / 2, y: noteBoxTop + 24, size: 12, weight: 650, fill: p.blue, align: "middle" }));
  body.push(
    text("相似度恒为 0，没有远近之分，两种写法无法表达「苹果」和「梨」更像。", {
      x: x1 + w1 / 2,
      y: noteBoxTop + 52,
      size: 11,
      fill: p.inkSoft,
      align: "middle",
      maxUnits: 26,
    }),
  );

  // 中：稠密
  const x2 = 372;
  const w2 = 356;
  body.push(rect({ x: x2, y: top, w: w2, h: panelH, r: 13, fill: p.card, stroke: p.border }));
  body.push(rect({ x: x2, y: top, w: w2, h: 4, r: 2, fill: p.mint, stroke: "none" }));
  body.push(text("稠密向量 Dense", { x: x2 + w2 / 2, y: top + 30, size: 15, weight: 650, fill: p.mint, align: "middle" }));
  body.push(text("维度低得多，取值是实数", { x: x2 + w2 / 2, y: top + 50, size: 11, fill: p.inkMuted, align: "middle" }));

  const dense = ["0.82", "-0.31", "0.44", "0.07", "-0.66", "0.19", "0.51", "-0.09"];
  const dCellW = 41;
  dense.forEach((value, index) => {
    const x = x2 + 20 + index * (dCellW + 2);
    body.push(rect({ x, y: cellY, w: dCellW, h: cellH, r: 5, fill: p.mintSoft, stroke: p.border }));
    body.push(text(value, { x: x + dCellW / 2, y: cellY + cellH / 2, size: 10.5, weight: 600, fill: p.mint, align: "middle" }));
  });
  body.push(text("每一维都是实数，可正可负", { x: x2 + w2 / 2, y: cellY + cellH + 22, size: 11.5, fill: p.inkSoft, align: "middle" }));

  body.push(rect({ x: x2 + 18, y: noteBoxTop, w: w2 - 36, h: noteBoxH, r: 10, fill: p.mintSoft, stroke: p.border }));
  body.push(text("语义相近的实体，向量距离近", { x: x2 + w2 / 2, y: noteBoxTop + 24, size: 12, weight: 650, fill: p.mint, align: "middle" }));
  body.push(
    text("相似度变成可计算的数：余弦相似度、内积都能用了。", {
      x: x2 + w2 / 2,
      y: noteBoxTop + 52,
      size: 11,
      fill: p.inkSoft,
      align: "middle",
      maxUnits: 30,
    }),
  );

  // 右：二维坐标里聚成两簇
  const x3 = 752;
  const w3 = 320;
  body.push(rect({ x: x3, y: top, w: w3, h: panelH, r: 13, fill: p.card, stroke: p.border }));
  body.push(rect({ x: x3, y: top, w: w3, h: 4, r: 2, fill: p.pink, stroke: "none" }));
  body.push(text("相近的实体聚在一起", { x: x3 + w3 / 2, y: top + 30, size: 15, weight: 650, fill: p.pink, align: "middle" }));
  body.push(text("把向量投到二维平面上观察", { x: x3 + w3 / 2, y: top + 50, size: 11, fill: p.inkMuted, align: "middle" }));

  const plotX = x3 + 42;
  const plotY = top + 80;
  const plotW = 224;
  const plotH = 130;
  body.push(rect({ x: plotX, y: plotY, w: plotW, h: plotH, r: 10, fill: p.canvas, stroke: p.border }));
  body.push(`<line x1="${plotX + 12}" y1="${plotY + plotH - 10}" x2="${plotX + plotW - 12}" y2="${plotY + plotH - 10}" stroke="${p.borderStrong}" stroke-width="1.2"/>`);
  body.push(`<line x1="${plotX + 12}" y1="${plotY + 10}" x2="${plotX + 12}" y2="${plotY + plotH - 10}" stroke="${p.borderStrong}" stroke-width="1.2"/>`);
  body.push(text("维度 1", { x: plotX + plotW / 2, y: plotY + plotH + 14, size: 10, fill: p.inkMuted, align: "middle" }));
  body.push(text("维度 2", { x: plotX - 22, y: plotY + 12, size: 10, fill: p.inkMuted, align: "middle" }));

  const clusterA = [
    [66, 40],
    [86, 54],
    [108, 36],
    [128, 58],
    [150, 44],
  ];
  const clusterB = [
    [62, 84],
    [90, 100],
    [122, 82],
    [146, 102],
    [168, 88],
  ];
  clusterA.forEach(([dx, dy]) => {
    body.push(`<circle cx="${plotX + dx}" cy="${plotY + dy}" r="5.5" fill="${p.mint}" opacity="0.85"/>`);
  });
  clusterB.forEach(([dx, dy]) => {
    body.push(`<circle cx="${plotX + dx}" cy="${plotY + dy}" r="5.5" fill="${p.blue}" opacity="0.85"/>`);
  });
  body.push(text("同一簇之间：余弦接近 1", { x: plotX + 156, y: plotY + 26, size: 10.5, weight: 600, fill: p.mint, align: "middle" }));
  body.push(text("两簇之间：余弦接近 0", { x: plotX + 156, y: plotY + 114, size: 10.5, weight: 600, fill: p.blue, align: "middle" }));

  // 底部说明
  const noteY = top + panelH + 16;
  body.push(rect({ x: 48, y: noteY, w: W - 96, h: noteH, r: 12, fill: p.card, stroke: p.border }));
  body.push(text("换来的能力是「相似度可计算」，代价是每一维不再有可读含义", { x: W / 2, y: noteY + 23, size: 13, weight: 650, fill: p.ink, align: "middle" }));
  body.push(
    text("独热向量的每一维都能指回一个实体，稠密向量的第 37 维谁也说不清是什么——可解释性在这一步被换掉了。", {
      x: W / 2,
      y: noteY + 44,
      size: 11.5,
      fill: p.inkMuted,
      align: "middle",
      maxUnits: 118,
    }),
  );

  return build({
    width: W,
    height: noteY + noteH,
    title: "从独热向量到稠密向量",
    caption: "表示学习的第一步不是把向量变短，而是让「距离」这个词第一次有了意义。",
    body: body.join(""),
  });
}

/** 08-B GraphRAG 与纯向量检索的流程差别 */
function graphragVsVector() {
  const body = [];
  const top = 28;
  const colW = 496;
  const gap = 32;
  const leftX = 48;
  const rightX = leftX + colW + gap;

  const columns = [
    {
      title: "纯向量检索（Vector RAG）",
      sub: "找相似段落",
      ink: p.blue,
      soft: p.blueSoft,
      rows: ["问题", "向量化：编码成查询向量", "相似度检索：取 Top-K 文本块", "取回若干文本块", "组织成回答"],
      good: "擅长找相似段落：答案集中在一两段原文里时又快又准。",
      bad: "不擅长多跳与聚合：需要跨段落把线索连起来、或要统计「一共有几家」时，取回的块各自为政。",
    },
    {
      title: "GraphRAG（图谱增强）",
      sub: "关系推理与聚合",
      ink: p.mint,
      soft: p.mintSoft,
      rows: [
        "问题",
        "向量检索：定位入口实体",
        "在图上游走：补上关系，可以多跳",
        "取回与问题相关的子图",
        "组织成回答",
      ],
      good: "擅长关系推理与聚合：路径、约束与统计都能顺着图算出来。",
      bad: "代价是需要先建图：抽取、对齐、更新都要成本，图的质量直接决定回答质量。",
    },
  ];

  const headH = 74;
  const rowH = 40;
  const rowGap = 6;
  const flowBottom = top + headH + 12 + 5 * rowH + 4 * rowGap;

  columns.forEach((col, colIndex) => {
    const x = colIndex === 0 ? leftX : rightX;
    body.push(rect({ x, y: top, w: colW, h: headH, r: 12, fill: col.soft, stroke: p.border }));
    body.push(text(col.title, { x: x + colW / 2, y: top + 30, size: 16, weight: 650, fill: col.ink, align: "middle" }));
    body.push(text(col.sub, { x: x + colW / 2, y: top + 53, size: 11.5, fill: col.ink, align: "middle" }));

    let y = top + headH + 12;
    col.rows.forEach((row, index) => {
      body.push(rect({ x, y, w: colW, h: rowH, r: 9, fill: index % 2 === 0 ? p.card : p.canvas, stroke: p.border }));
      body.push(text(`0${index + 1}`, { x: x + 18, y: y + rowH / 2, size: 11, weight: 700, fill: col.ink, align: "start" }));
      body.push(text(row, { x: x + 52, y: y + rowH / 2, size: 12.5, weight: index === 0 ? 650 : 520, fill: p.ink, align: "start", maxUnits: 46 }));
      if (index < col.rows.length - 1) {
        body.push(arrow({ from: [x + colW / 2, y + rowH + 1], to: [x + colW / 2, y + rowH + rowGap - 1], color: p.inkMuted, width: 1.5 }));
      }
      y += rowH + rowGap;
    });
  });

  // 中间：级联关系
  const midX = (leftX + colW + rightX) / 2;
  body.push(text("候选", { x: midX, y: top + headH + 62, size: 10.5, weight: 650, fill: p.inkMuted, align: "middle" }));
  body.push(arrow({ from: [leftX + colW + 6, top + headH + 84], to: [rightX - 6, top + headH + 84], color: p.mint, width: 2 }));
  body.push(text("缩小范围", { x: midX, y: top + headH + 74, size: 10, fill: p.inkMuted, align: "middle" }));
  body.push(arrow({ from: [rightX - 6, top + headH + 122], to: [leftX + colW + 6, top + headH + 122], color: p.mint, width: 2 }));
  body.push(text("补关系", { x: midX, y: top + headH + 134, size: 10, fill: p.inkMuted, align: "middle" }));

  // 能力与代价
  columns.forEach((col, colIndex) => {
    const x = colIndex === 0 ? leftX : rightX;
    const y = flowBottom + 14;
    body.push(rect({ x, y, w: colW, h: 76, r: 11, fill: p.card, stroke: p.border }));
    body.push(text(col.good, { x: x + 18, y: y + 24, size: 11.5, fill: col.ink, align: "start", maxUnits: 62 }));
    body.push(text(col.bad, { x: x + 18, y: y + 52, size: 11.5, fill: p.inkSoft, align: "start", maxUnits: 62 }));
  });

  // 底部
  const noteY = flowBottom + 14 + 76 + 16;
  body.push(rect({ x: 48, y: noteY, w: W - 96, h: 60, r: 12, fill: p.pinkSoft, stroke: p.border }));
  body.push(text("两者是级联关系，不是替代关系", { x: W / 2, y: noteY + 23, size: 13, weight: 700, fill: p.pink, align: "middle" }));
  body.push(
    text("向量负责把候选范围缩小，图负责在这一批候选里补上关系与约束，最后由语言模型组织成回答。", {
      x: W / 2,
      y: noteY + 43,
      size: 11.5,
      fill: p.inkSoft,
      align: "middle",
      maxUnits: 110,
    }),
  );

  return build({
    width: W,
    height: noteY + 60,
    title: "GraphRAG 与纯向量检索：两条流程的差别",
    caption: "左边省掉了建图成本，右边省掉了「关系接不上」的失败；工程上常见的做法是两者串联。",
    body: body.join(""),
  });
}

export const embedding = [
  { slug: "08-onehot-to-dense", svg: oneHotToDense() },
  { slug: "08-graphrag-vs-vector", svg: graphragVsVector() },
];
