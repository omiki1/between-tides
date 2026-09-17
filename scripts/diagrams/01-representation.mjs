import { palette as p, rect, text, arrow, chip, sectionLabel, build } from "./kit.mjs";

const W = 1120;

/** 01-A 表示方法的发展脉络（1960 → 今天），标注每次替换的动因 */
function timeline() {
  const body = [];
  const top = 84;
  const axisY = top + 96;

  const eras = [
    { from: "1960", to: "1970", name: "语义网络", en: "Semantic Network", note: "联想式表示", ink: p.rose, soft: p.roseSoft },
    { from: "1970", to: "1980", name: "产生式规则", en: "Production Rules", note: "IF–THEN 推理", ink: p.amber, soft: p.amberSoft },
    { from: "1980", to: "1990", name: "框架与 KL-ONE", en: "Frame & KL-ONE", note: "结构化描述", ink: p.mint, soft: p.mintSoft },
    { from: "1990", to: "2000", name: "描述逻辑", en: "Description Logic", note: "可判定推理", ink: p.blue, soft: p.blueSoft },
    { from: "2000", to: "2010", name: "语义网", en: "RDF / OWL", note: "Web 级共享", ink: p.pink, soft: p.pinkSoft },
    { from: "2013", to: "至今", name: "表示学习", en: "Embedding", note: "向量化语义", ink: p.accent, soft: p.roseSoft },
  ];

  const cardW = 158;
  const gap = 20;
  const cardH = 116;

  // 主轴
  body.push(`<line x1="48" y1="${axisY}" x2="${W - 48}" y2="${axisY}" stroke="${p.borderStrong}" stroke-width="2"/>`);
  body.push(arrow({ from: [W - 78, axisY], to: [W - 46, axisY], color: p.inkMuted, width: 2 }));

  eras.forEach((era, index) => {
    const x = 48 + index * (cardW + gap);
    // 年份标在轴上方
    body.push(text(`${era.from}`, { x: x + cardW / 2, y: axisY - 22, size: 11.5, weight: 650, fill: p.inkMuted, align: "middle" }));
    // 在每个时代的起点画一个节点
    body.push(`<circle cx="${x}" cy="${axisY}" r="5" fill="${era.ink}"/>`);

    const cardY = axisY + 22;
    body.push(rect({ x, y: cardY, w: cardW, h: cardH, r: 11, fill: era.soft, stroke: p.border }));
    body.push(rect({ x, y: cardY, w: cardW, h: 4, r: 2, fill: era.ink, stroke: "none" }));
    body.push(text(era.name, { x: x + cardW / 2, y: cardY + 30, size: 14, weight: 650, fill: era.ink, align: "middle" }));
    body.push(text(era.en, { x: x + cardW / 2, y: cardY + 50, size: 10, weight: 600, fill: era.ink, align: "middle" }));
    body.push(text(era.note, { x: x + cardW / 2, y: cardY + 76, size: 11.5, fill: p.inkSoft, align: "middle" }));
  });

  // 轴下方的动因说明：每次替换的原因
  const reasonY = axisY + 22 + cardH + 24;
  body.push(sectionLabel("每次替换的动因", { x: 48, y: reasonY - 10 }));

  const reasons = [
    ["语义网络 → 规则", "缺乏语义定义，无法判断推理是否正确"],
    ["规则 → 框架", "规则无法表达结构性知识"],
    ["框架 → 描述逻辑", "框架没有形式语义，推理无法保证"],
    ["描述逻辑 → RDF", "语义网需要 Web 级开放发布，先降低约束"],
    ["RDF → 表示学习", "规模到亿级后，形式推理跟不上"],
  ];
  let ry = reasonY + 10;
  reasons.forEach(([from, why], index) => {
    const rowH = 38;
    body.push(rect({ x: 48, y: ry, w: W - 96, h: rowH, r: 8, fill: index % 2 === 0 ? p.card : p.canvas, stroke: p.border }));
    body.push(text(from, { x: 66, y: ry + rowH / 2, size: 12, weight: 620, fill: p.ink, align: "start" }));
    body.push(text(why, { x: 268, y: ry + rowH / 2, size: 12, fill: p.inkSoft, align: "start", maxUnits: 62 }));
    ry += rowH + 4;
  });

  return build({
    width: W,
    height: ry + 4,
    title: "表示方法的发展脉络：五十年换了六次",
    caption: "每一次转向都不是因为上一代表示得不够多，而是它在自己承诺的那件事上没有做到。",
    body: body.join(""),
  });
}

/** 01-B RDF 三元组的结构 */
function triple() {
  const body = [];
  const cy = 108;

  // 三个成分
  const parts = [
    { label: "主语", en: "Subject", value: "张三", sub: "资源 / URI", x: 92, w: 216 },
    { label: "谓语", en: "Predicate", value: "任职于", sub: "属性 / URI", x: 420, w: 216 },
    { label: "宾语", en: "Object", value: "北京大学", sub: "资源或文字", x: 748, w: 216 },
  ];

  parts.forEach((part) => {
    body.push(rect({ x: part.x, y: cy - 56, w: part.w, h: 112, r: 13, fill: p.card, stroke: p.border }));
    body.push(rect({ x: part.x, y: cy - 56, w: part.w, h: 26, r: 13, fill: p.pinkSoft, stroke: "none" }));
    body.push(text(`${part.label} · ${part.en}`, { x: part.x + part.w / 2, y: cy - 43, size: 11, weight: 650, fill: p.pink, align: "middle" }));
    body.push(text(part.value, { x: part.x + part.w / 2, y: cy + 6, size: 19, weight: 650, fill: p.ink, align: "middle" }));
    body.push(text(part.sub, { x: part.x + part.w / 2, y: cy + 34, size: 10.5, fill: p.inkMuted, align: "middle" }));
  });

  body.push(arrow({ from: [parts[0].x + parts[0].w + 8, cy], to: [parts[1].x - 8, cy], color: p.inkMuted, width: 1.8 }));
  body.push(arrow({ from: [parts[1].x + parts[1].w + 8, cy], to: [parts[2].x - 8, cy], color: p.inkMuted, width: 1.8 }));

  // 上方：一条声明 = 一个三元组
  body.push(text("一条 RDF 声明 = 一个三元组", { x: W / 2, y: 30, size: 13, weight: 650, fill: p.ink, align: "middle" }));

  // 下方：改写成图的形态
  const graphY = cy + 106;
  body.push(sectionLabel("同一个三元组写成图", { x: 48, y: graphY - 14 }));

  const nodeY = graphY + 56;
  body.push(`<ellipse cx="176" cy="${nodeY}" rx="66" ry="34" fill="${p.roseSoft}" stroke="${p.rose}" stroke-width="1.8"/>`);
  body.push(text("张三", { x: 176, y: nodeY, size: 15, weight: 650, fill: p.rose, align: "middle" }));
  body.push(`<ellipse cx="944" cy="${nodeY}" rx="82" ry="34" fill="${p.roseSoft}" stroke="${p.rose}" stroke-width="1.8"/>`);
  body.push(text("北京大学", { x: 944, y: nodeY, size: 15, weight: 650, fill: p.rose, align: "middle" }));

  body.push(arrow({ from: [250, nodeY], to: [854, nodeY], color: p.blue, width: 2.2, label: "任职于" }));

  // 图注说明：节点与边的对应关系
  const noteY = nodeY + 62;
  body.push(rect({ x: 48, y: noteY, w: W - 96, h: 52, r: 10, fill: p.blueSoft, stroke: p.border }));
  body.push(text("主语与宾语成为节点，谓语成为有向边。同一对实体之间可以有多种关系，因此边是带标签的。", { x: W / 2, y: noteY + 18, size: 12, fill: p.blue, align: "middle" }));
  body.push(text("开放世界假设下，图中没有这条边并不意味着「张三不任职于某处」，只意味着这条信息未被声明。", { x: W / 2, y: noteY + 37, size: 11.5, fill: p.inkSoft, align: "middle" }));

  return build({
    width: W,
    height: noteY + 52,
    title: "RDF 的基本单位：主语 — 谓语 — 宾语",
    caption: "所有 RDF 声明都表示为三元组，因此整份数据天然是一张有向标签图。",
    body: body.join(""),
  });
}

export const representation = [
  { slug: "01-representation-timeline", svg: timeline() },
  { slug: "01-rdf-triple", svg: triple() },
];
