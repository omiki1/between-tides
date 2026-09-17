import { palette as p, rect, text, arrow, chip, line, sectionLabel, build } from "./kit.mjs";

const W = 1120;

/** 02-A 本体与数据库 schema 的差异 */
function ontologyVsSchema() {
  const body = [];
  const top = 26;
  const colW = 496;
  const gap = 32;
  const leftX = 48;
  const rightX = leftX + colW + gap;

  const cols = [
    {
      title: "本体 Ontology",
      sub: "面向共享与推理",
      ink: p.pink,
      soft: p.pinkSoft,
      rows: [
        ["用途", "共享知识与事实，支撑交互、搜索与推理"],
        ["语法", "以逻辑为基础的形式化语法"],
        ["概念层次", "有，且可以用子类关系表达"],
        ["语义", "定义概念与关系，讲一致性与完备性"],
        ["推理支持", "有，可从约束推出未显式存储的事实"],
        ["规模", "可以很大，跨系统共享"],
      ],
    },
    {
      title: "数据库 Schema",
      sub: "面向存储与查询",
      ink: p.blue,
      soft: p.blueSoft,
      rows: [
        ["用途", "结构化数据的组织与管理"],
        ["语法", "ER 图、DDL"],
        ["概念层次", "无，靠表结构模拟"],
        ["语义", "靠主外键约束，不定义概念含义"],
        ["推理支持", "无，只返回已存储的数据"],
        ["规模", "一般较小，限单个系统内"],
      ],
    },
  ];

  cols.forEach((col) => {
    const x = col === cols[0] ? leftX : rightX;
    const headerH = 70;
    body.push(rect({ x, y: top, w: colW, h: headerH, r: 12, fill: col.soft, stroke: p.border }));
    body.push(text(col.title, { x: x + colW / 2, y: top + 28, size: 16.5, weight: 650, fill: col.ink, align: "middle" }));
    body.push(text(col.sub, { x: x + colW / 2, y: top + 51, size: 11.5, fill: col.ink, align: "middle" }));

    let y = top + headerH + 10;
    col.rows.forEach(([key, value], index) => {
      const rowH = 52;
      body.push(rect({ x, y, w: colW, h: rowH, r: 9, fill: index % 2 === 0 ? p.card : p.canvas, stroke: p.border }));
      body.push(text(key, { x: x + 18, y: y + rowH / 2, size: 12.5, weight: 620, fill: col.ink, align: "start" }));
      body.push(text(value, { x: x + 112, y: y + rowH / 2, size: 11.5, fill: p.inkSoft, align: "start", maxUnits: 30 }));
      y += rowH + 4;
    });
  });

  // 底部：一句话区分
  const noteY = top + 70 + 10 + 6 * 56 + 8;
  body.push(rect({ x: 48, y: noteY, w: W - 96, h: 62, r: 12, fill: p.mintSoft, stroke: p.border }));
  body.push(text("区分标准不在语法，在于要不要推理", { x: W / 2, y: noteY + 22, size: 13, weight: 650, fill: p.mint, align: "middle" }));
  body.push(text("schema 回答「数据怎么存」，本体还要回答「从这个存法能推出什么」。后者要求形式语义，前者不要求。", { x: W / 2, y: noteY + 43, size: 11.5, fill: p.inkSoft, align: "middle" }));

  return build({
    width: W,
    height: noteY + 62,
    title: "本体与数据库 Schema 的六处差异",
    caption: "从后端转过来的人常问「这不就是 ER 图吗」，差别集中在语义与推理两行。",
    body: body.join(""),
  });
}

/** 02-B 建模流程与一次推理是怎么发生的 */
function modelingFlow() {
  const body = [];
  const top = 26;

  // 上半：七步流程
  const steps = [
    { n: "1", name: "界定领域与范围" },
    { n: "2", name: "考虑重用现有本体" },
    { n: "3", name: "列出重要术语" },
    { n: "4", name: "定义类与继承" },
    { n: "5", name: "定义属性与关系" },
    { n: "6", name: "定义属性限制" },
    { n: "7", name: "创建实例" },
  ];

  const stepW = 138;
  const stepGap = 12;
  const stepH = 72;

  steps.forEach((step, index) => {
    const x = 48 + index * (stepW + stepGap);
    body.push(rect({ x, y: top, w: stepW, h: stepH, r: 10, fill: p.card, stroke: p.border }));
    body.push(chip({ x: x + 10, y: top + 10, w: 24, h: 22, label: step.n, fill: p.pinkSoft, ink: p.pink, size: 12 }));
    body.push(text(step.name, { x: x + stepW / 2, y: top + 50, size: 11.5, weight: 600, fill: p.ink, align: "middle", maxUnits: 11 }));
    if (index < steps.length - 1) {
      body.push(arrow({ from: [x + stepW + 1, top + stepH / 2], to: [x + stepW + stepGap - 1, top + stepH / 2], color: p.inkMuted, width: 1.5 }));
    }
  });

  // 回环：第 7 步回到第 1 步
  const loopY = top + stepH + 26;
  body.push(`<path d="M ${48 + 6 * (stepW + stepGap) + stepW / 2} ${top + stepH} L ${48 + 6 * (stepW + stepGap) + stepW / 2} ${loopY} L ${48 + stepW / 2} ${loopY} L ${48 + stepW / 2} ${top + stepH + 4}" fill="none" stroke="${p.rose}" stroke-width="1.6" stroke-dasharray="6 5" marker-end="url(#arrow-${p.rose.replace(/[^a-z0-9]/gi, "")})"/>`);
  body.push(rect({ x: W / 2 - 130, y: loopY - 12, w: 260, h: 24, r: 12, fill: p.canvas, stroke: "none" }));
  body.push(text("范围与约束会随开发变化，需要迭代", { x: W / 2, y: loopY, size: 11, weight: 600, fill: p.rose, align: "middle" }));

  // 下半：推理示例
  const demoY = loopY + 42;
  body.push(sectionLabel("领域与值域约束如何产生新结论", { x: 48, y: demoY }));

  const boxY = demoY + 20;
  const boxH = 132;

  // 已知
  body.push(rect({ x: 48, y: boxY, w: 470, h: boxH, r: 12, fill: p.blueSoft, stroke: p.border }));
  body.push(text("已知（显式写入图里的）", { x: 68, y: boxY + 24, size: 12.5, weight: 650, fill: p.blue, align: "start" }));
  const known = [
    "裴文德、裴休 都是「人物」的实例",
    "裴文德 的 父亲 是 裴休",
    "父亲的 domain = 人物，range = 男人",
  ];
  known.forEach((item, index) => {
    body.push(text(`· ${item}`, { x: 68, y: boxY + 54 + index * 26, size: 11.5, fill: p.inkSoft, align: "start", maxUnits: 42 }));
  });

  // 箭头
  body.push(arrow({ from: [526, boxY + boxH / 2], to: [594, boxY + boxH / 2], color: p.mint, width: 2.2 }));
  body.push(text("推理机", { x: 560, y: boxY + boxH / 2 - 16, size: 10.5, weight: 650, fill: p.mint, align: "middle" }));

  // 推出
  body.push(rect({ x: 602, y: boxY, w: W - 602 - 48, h: boxH, r: 12, fill: p.mintSoft, stroke: p.border }));
  body.push(text("推出（图中并未存储）", { x: 622, y: boxY + 24, size: 12.5, weight: 650, fill: p.mint, align: "start" }));
  body.push(text("裴休 是 男人", { x: 622, y: boxY + 58, size: 15, weight: 650, fill: p.ink, align: "start" }));
  body.push(text("因为「裴文德 的父亲 是 裴休」触发了 range 约束：", { x: 622, y: boxY + 86, size: 11, fill: p.inkSoft, align: "start", maxUnits: 38 }));
  body.push(text("父亲的取值只能是男人，所以裴休被归入男人。", { x: 622, y: boxY + 106, size: 11, fill: p.inkSoft, align: "start", maxUnits: 38 }));

  return build({
    width: W,
    height: boxY + boxH,
    title: "建模流程，以及约束如何变成推理",
    caption: "七步法出自 Noy 与 McGuinness 的 Ontology Development 101。第 6 步的定义域与值域不只是校验规则，推理机会用它们产生新结论。",
    body: body.join(""),
  });
}

export const modeling = [
  { slug: "02-ontology-vs-schema", svg: ontologyVsSchema() },
  { slug: "02-modeling-flow", svg: modelingFlow() },
];
