import { palette as p, rect, text, card, arrow, line, chip, sectionLabel, build } from "./kit.mjs";

const W = 1120;

/** 00-A 知识图谱技术体系：五层结构 + 两条纵向贯穿的支撑 */
function techStack() {
  const body = [];
  const left = 48;
  const width = 720;
  const layers = [
    { name: "应用层", en: "Application", items: ["语义搜索", "智能问答", "推荐", "GraphRAG"], fill: p.pinkSoft, ink: p.pink },
    { name: "知识层", en: "Knowledge", items: ["知识表示", "知识建模", "知识推理"], fill: p.blueSoft, ink: p.blue },
    { name: "融合层", en: "Fusion", items: ["实体对齐", "冲突消解", "真值发现"], fill: p.mintSoft, ink: p.mint },
    { name: "抽取层", en: "Extraction", items: ["命名实体识别", "关系抽取", "事件抽取"], fill: p.amberSoft, ink: p.amber },
    { name: "数据层", en: "Data", items: ["结构化数据", "半结构化数据", "非结构化文本"], fill: p.roseSoft, ink: p.rose },
  ];

  const rowH = 64;
  const gap = 12;
  const top = 30;

  layers.forEach((layer, index) => {
    const y = top + index * (rowH + gap);
    body.push(rect({ x: left, y, w: width, h: rowH, r: 12, fill: layer.fill, stroke: p.border }));
    body.push(rect({ x: left, y, w: 5, h: rowH, r: 3, fill: layer.ink, stroke: "none" }));
    body.push(text(layer.name, { x: left + 30, y: y + rowH / 2 - 7, size: 16, weight: 650, fill: layer.ink, align: "start" }));
    body.push(text(layer.en.toUpperCase(), { x: left + 30, y: y + rowH / 2 + 13, size: 10, weight: 600, fill: layer.ink, align: "start" }));

    let x = left + 160;
    layer.items.forEach((item) => {
      const w = item.length * 12.5 + 30;
      body.push(rect({ x, y: y + rowH / 2 - 16, w, h: 32, r: 8, fill: p.card, stroke: p.border }));
      body.push(text(item, { x: x + w / 2, y: y + rowH / 2, size: 12.5, weight: 550, fill: p.ink, align: "middle" }));
      x += w + 10;
    });

    if (index < layers.length - 1) {
      body.push(arrow({ from: [left + width / 2, y + rowH + 1], to: [left + width / 2, y + rowH + gap - 1], color: p.inkMuted, width: 1.6 }));
    }
  });

  // 右侧两条纵向支撑
  const railX = left + width + 34;
  const railW = W - railX - 48;
  const railTop = top;
  // 内容真实底部：最后一行图层的上沿再加一行高度。
  // build() 的 height 参数是正文所需高度，页眉与图注由它自己加。
  const layerBottom = top + (layers.length - 1) * (rowH + gap) + rowH;

  const railGap = 14;
  const railH = (layerBottom - railTop - railGap) / 2;

  body.push(rect({ x: railX, y: railTop, w: railW, h: railH, r: 12, fill: p.card, stroke: p.border, dash: "6 5" }));
  body.push(text("质量与评测", { x: railX + railW / 2, y: railTop + 40, size: 14, weight: 650, align: "middle" }));
  body.push(text("准确率 / 召回率 / F1", { x: railX + railW / 2, y: railTop + 64, size: 11, fill: p.inkMuted, align: "middle" }));
  body.push(text("标注一致性、人工抽检", { x: railX + railW / 2, y: railTop + 84, size: 11, fill: p.inkMuted, align: "middle" }));
  body.push(text("作用于全部五层", { x: railX + railW / 2, y: railTop + railH - 18, size: 10.5, fill: p.inkMuted, align: "middle" }));

  const rail2Y = railTop + railH + railGap;
  body.push(rect({ x: railX, y: rail2Y, w: railW, h: railH, r: 12, fill: p.card, stroke: p.border, dash: "6 5" }));
  body.push(text("更新与维护", { x: railX + railW / 2, y: rail2Y + 40, size: 14, weight: 650, align: "middle" }));
  body.push(text("增量抽取、冲突检测", { x: railX + railW / 2, y: rail2Y + 64, size: 11, fill: p.inkMuted, align: "middle" }));
  body.push(text("版本管理与溯源", { x: railX + railW / 2, y: rail2Y + 84, size: 11, fill: p.inkMuted, align: "middle" }));
  body.push(text("作用于全部五层", { x: railX + railW / 2, y: rail2Y + railH - 18, size: 10.5, fill: p.inkMuted, align: "middle" }));

  return build({
    width: W,
    height: layerBottom + 14,
    title: "知识图谱的技术体系：五层结构",
    caption: "数据自下而上是流动方向，右侧的质量与更新支撑纵贯全部五层。",
    body: body.join(""),
  });
}

/** 00-B 知识图谱与向量库的分工对比 */
function kgVsVector() {
  const body = [];
  const top = 30;
  const colW = 480;
  const colGap = 64;
  const leftX = 48;
  const rightX = leftX + colW + colGap;

  const columns = [
    {
      title: "向量库（Vector Store）",
      sub: "相似度检索",
      ink: p.blue,
      soft: p.blueSoft,
      rows: [
        ["存储单位", "一段文本的稠密向量"],
        ["检索依据", "向量距离，语义相近即相近"],
        ["擅长的问题", "「哪几段话和这句话像」"],
        ["不擅长", "多跳推理、聚合统计、关系约束"],
        ["可解释性", "低，命中的是一段无结构的文本"],
      ],
    },
    {
      title: "知识图谱（Knowledge Graph）",
      sub: "结构化关系",
      ink: p.pink,
      soft: p.pinkSoft,
      rows: [
        ["存储单位", "实体与关系构成的三元组"],
        ["检索依据", "图上的路径与逻辑约束"],
        ["擅长的问题", "「A 通过谁和 B 有关系」"],
        ["不擅长", "模糊语义匹配、开放域闲聊"],
        ["可解释性", "高，每条结论可以给出关系路径"],
      ],
    },
  ];

  columns.forEach((col) => {
    const x = col === columns[0] ? leftX : rightX;
    const headerH = 74;
    body.push(rect({ x, y: top, w: colW, h: headerH, r: 12, fill: col.soft, stroke: p.border }));
    body.push(text(col.title, { x: x + colW / 2, y: top + 30, size: 16.5, weight: 650, fill: col.ink, align: "middle" }));
    body.push(text(col.sub, { x: x + colW / 2, y: top + 54, size: 11.5, fill: col.ink, align: "middle" }));

    let y = top + headerH + 12;
    col.rows.forEach(([key, value], index) => {
      const rowH = 56;
      body.push(rect({ x, y, w: colW, h: rowH, r: 9, fill: index % 2 === 0 ? p.card : p.canvas, stroke: p.border }));
      body.push(text(key, { x: x + 20, y: y + rowH / 2, size: 12.5, weight: 620, fill: col.ink, align: "start" }));
      body.push(text(value, { x: x + 118, y: y + rowH / 2, size: 12, fill: p.inkSoft, align: "start", maxUnits: 40 }));
      y += rowH + 5;
    });
  });

  // 中间的分工连线
  const midX = (leftX + colW + rightX) / 2;
  const midY = top + 160;
  body.push(text("互补", { x: midX, y: midY - 16, size: 12, weight: 650, fill: p.mint, align: "middle" }));
  body.push(arrow({ from: [leftX + colW + 6, midY + 8], to: [rightX - 6, midY + 8], color: p.mint, width: 1.8 }));
  body.push(arrow({ from: [rightX - 6, midY + 34], to: [leftX + colW + 6, midY + 34], color: p.mint, width: 1.8 }));
  body.push(text("召回候选", { x: midX, y: midY - 2, size: 10.5, fill: p.inkMuted, align: "middle" }));
  body.push(text("补关系", { x: midX, y: midY + 50, size: 10.5, fill: p.inkMuted, align: "middle" }));

  const bottomY = top + 74 + 12 + 5 * 61 + 6;
  const blockH = 62;
  body.push(rect({ x: leftX, y: bottomY, w: W - 96, h: blockH, r: 12, fill: p.mintSoft, stroke: p.border }));
  body.push(text("实际系统的常见组合", { x: leftX + 24, y: bottomY + 22, size: 13, weight: 650, fill: p.mint, align: "start" }));
  body.push(
    text("向量检索负责在前一步把候选范围缩小，图谱负责在这一批候选里补上关系与约束，最终由语言模型组织成回答。两者不是替代关系。", {
      x: leftX + 24,
      y: bottomY + 43,
      size: 11.5,
      fill: p.inkSoft,
      align: "start",
      maxUnits: 120,
    }),
  );

  return build({
    width: W,
    height: bottomY + blockH,
    title: "知识图谱与向量库的分工",
    caption: "两者解决的是不同层次的问题，不是替代关系。",
    body: body.join(""),
  });
}

/** 00-C 一句话从文本走到可推理的知识 */
function pipeline() {
  const body = [];
  const top = 40;
  const steps = [
    { label: "原始文本", detail: "「张三是北京大学的教授」", ink: p.rose, soft: p.roseSoft },
    { label: "实体识别", detail: "张三 / 北京大学 / 教授", ink: p.amber, soft: p.amberSoft },
    { label: "关系抽取", detail: "张三 —任职于→ 北京大学", ink: p.blue, soft: p.blueSoft },
    { label: "知识融合", detail: "与已有图谱中的「北京大学」对齐", ink: p.mint, soft: p.mintSoft },
    { label: "入库与推理", detail: "可回答「谁在北京大学任职」", ink: p.pink, soft: p.pinkSoft },
  ];

  const cardW = 190;
  const gap = 22;
  const cardH = 118;

  steps.forEach((step, index) => {
    const x = 48 + index * (cardW + gap);
    body.push(rect({ x, y: top, w: cardW, h: cardH, r: 12, fill: step.soft, stroke: p.border }));
    body.push(rect({ x, y: top, w: cardW, h: 4, r: 2, fill: step.ink, stroke: "none" }));
    body.push(text(`0${index + 1}`, { x: x + 18, y: top + 30, size: 12, weight: 700, fill: step.ink, align: "start" }));
    body.push(text(step.label, { x: x + cardW / 2, y: top + 56, size: 14.5, weight: 650, fill: step.ink, align: "middle" }));
    body.push(
      text(step.detail, {
        x: x + cardW / 2,
        y: top + 84,
        size: 11,
        fill: p.inkSoft,
        align: "middle",
        maxUnits: 20,
      }),
    );
    if (index < steps.length - 1) {
      body.push(arrow({ from: [x + cardW + 3, top + cardH / 2], to: [x + cardW + gap - 3, top + cardH / 2], color: p.inkMuted, width: 1.7 }));
    }
  });

  // 底部：每步产出的形态
  const shapeY = top + cardH + 22;
  const shapes = ["一段文本", "实体列表", "三元组", "消歧后的三元组", "可查询的图"];
  shapes.forEach((shape, index) => {
    const x = 48 + index * (cardW + gap);
    body.push(rect({ x: x + cardW / 2 - 56, y: shapeY, w: 112, h: 30, r: 15, fill: p.card, stroke: p.border }));
    body.push(text(shape, { x: x + cardW / 2, y: shapeY + 15, size: 11, weight: 550, fill: p.inkSoft, align: "middle" }));
    if (index < shapes.length - 1) {
      body.push(arrow({ from: [x + cardW / 2 + 58, shapeY + 15], to: [x + cardW / 2 + cardW + gap - 58, shapeY + 15], color: p.borderStrong, width: 1.3, dash: "4 4" }));
    }
  });
  body.push(sectionLabel("每一步的产出形态", { x: 48, y: shapeY + 52 }));

  const bottomY = shapeY + 72;
  const noteH = 56;
  body.push(rect({ x: 48, y: bottomY, w: W - 96, h: noteH, r: 12, fill: p.card, stroke: p.border }));
  body.push(text("这条链路上任何一步出错，都会以「查不到」或「查错」的形式出现在最后的问答环节。", { x: W / 2, y: bottomY + 22, size: 12.5, weight: 600, fill: p.ink, align: "middle" }));
  body.push(text("所以工程上必须能回溯：一条结论是从哪段原文、经过哪几步抽取得到的。", { x: W / 2, y: bottomY + 41, size: 11.5, fill: p.inkMuted, align: "middle" }));

  return build({
    width: W,
    height: bottomY + noteH + 6,
    title: "从一句话到可推理的知识",
    caption: "抽取层与融合层的工作都在这个流程里，其中任何一步出错都会以「查不到」或「查错」的形式出现在最后的问答环节。",
    body: body.join(""),
  });
}

export const overview = [
  { slug: "00-tech-stack", svg: techStack() },
  { slug: "00-kg-vs-vector", svg: kgVsVector() },
  { slug: "00-pipeline", svg: pipeline() },
];
