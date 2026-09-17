import { palette as p, rect, text, arrow, chip, sectionLabel, build } from "./kit.mjs";

const W = 1120;

/** 07-A 知识融合的三条并行工作线：从多来源知识到一张统一的图 */
function fusionPipeline() {
  const body = [];

  const top = 34;

  // 左侧：多来源知识
  const inX = 48;
  const inW = 182;
  const inH = 290;
  body.push(rect({ x: inX, y: top, w: inW, h: inH, r: 13, fill: p.amberSoft, stroke: p.border }));
  body.push(text("多来源知识", { x: inX + inW / 2, y: top + 32, size: 14.5, weight: 650, fill: p.amber, align: "middle" }));
  body.push(
    text("来自不同文档、不同数据库的三批三元组，各自都对，放在一起却互相矛盾。", {
      x: inX + inW / 2,
      y: top + 88,
      size: 11,
      fill: p.inkSoft,
      align: "middle",
      maxUnits: 15,
    }),
  );

  const sources = ["文档抽取批", "合作方数据库", "历史遗留 CSV"];
  sources.forEach((label, index) => {
    const y = top + 158 + index * 38;
    body.push(rect({ x: inX + 16, y, w: inW - 32, h: 30, r: 8, fill: p.card, stroke: p.border }));
    body.push(text(label, { x: inX + inW / 2, y: y + 15, size: 11, weight: 550, fill: p.ink, align: "middle" }));
  });

  // 中间：三条并行工作线
  const lanes = [
    {
      x: 252,
      w: 192,
      name: "本体匹配",
      en: "Ontology Matching",
      ink: p.blue,
      soft: p.blueSoft,
      body: "先让两个 schema 说同一种语言：找出类与属性之间的映射。DBpedia Ontology 与 CN-DBpedia Ontology 对同一个「佛」的概念，类层次与属性组织方式完全不同。",
    },
    {
      x: 464,
      w: 192,
      name: "实体匹配",
      en: "Entity Matching",
      ink: p.mint,
      soft: p.mintSoft,
      body: "先用分块把候选降到可比较的量级，再判断「像不像」，最后确认「是不是」同一个实体。分块键的设计决定候选质量。",
    },
    {
      x: 676,
      w: 192,
      name: "冲突消解",
      en: "Conflict Resolution",
      ink: p.rose,
      soft: p.roseSoft,
      body: "多个来源对同一事实给出不同值时的取舍：投票、来源可信度、时间新旧三类信号按属性类型加权。",
    },
  ];

  // 三条线之间的并行标记
  body.push(sectionLabel("三条并行工作线", { x: 252, y: 20 }));

  lanes.forEach((lane) => {
    body.push(rect({ x: lane.x, y: top, w: lane.w, h: 290, r: 13, fill: lane.soft, stroke: p.border }));
    body.push(rect({ x: lane.x, y: top, w: lane.w, h: 4, r: 2, fill: lane.ink, stroke: "none" }));
    body.push(text(lane.name, { x: lane.x + lane.w / 2, y: top + 34, size: 15, weight: 650, fill: lane.ink, align: "middle" }));
    body.push(text(lane.en, { x: lane.x + lane.w / 2, y: top + 58, size: 10, weight: 600, fill: lane.ink, align: "middle" }));
    body.push(
      text(lane.body, {
        x: lane.x + lane.w / 2,
        y: top + 158,
        size: 10.5,
        fill: p.inkSoft,
        align: "middle",
        maxUnits: 17,
      }),
    );
  });

  // 左侧到三条线的输入箭头
  body.push(arrow({ from: [inX + inW + 6, top + inH / 2], to: [252 - 6, top + inH / 2], color: p.amber, width: 2.2 }));

  // 右侧：融合产出
  const outX = 892;
  const outW = W - 48 - outX;
  body.push(rect({ x: outX, y: top, w: outW, h: inH, r: 13, fill: p.pinkSoft, stroke: p.border }));
  body.push(text("融合产出", { x: outX + outW / 2, y: top + 34, size: 14.5, weight: 650, fill: p.pink, align: "middle" }));
  body.push(
    text("一张统一的图", {
      x: outX + outW / 2,
      y: top + 62,
      size: 12,
      weight: 620,
      fill: p.ink,
      align: "middle",
    }),
  );
  body.push(
    text("重复的合并，冲突的按规则取舍，等价的连起来。每条结论仍能回溯到原始来源。", {
      x: outX + outW / 2,
      y: top + 132,
      size: 10.5,
      fill: p.inkSoft,
      align: "middle",
      maxUnits: 13,
    }),
  );

  // 三条线汇入产出
  body.push(arrow({ from: [676 + 192 + 6, top + inH / 2], to: [outX - 6, top + inH / 2], color: p.pink, width: 2.2 }));

  // 底部：三条线的先后关系
  const flowLabel = 366;
  body.push(sectionLabel("三条线的先后关系", { x: 48, y: flowLabel }));

  const steps = [
    { label: "本体对齐", ink: p.blue, soft: p.blueSoft },
    { label: "实体对齐", ink: p.mint, soft: p.mintSoft },
    { label: "冲突消解", ink: p.rose, soft: p.roseSoft },
  ];
  const stepW = 168;
  const stepGap = 26;
  const stepY = flowLabel + 16;
  steps.forEach((step, index) => {
    const x = 48 + index * (stepW + stepGap);
    body.push(rect({ x, y: stepY, w: stepW, h: 36, r: 18, fill: step.soft, stroke: p.border }));
    body.push(text(step.label, { x: x + stepW / 2, y: stepY + 18, size: 12.5, weight: 620, fill: step.ink, align: "middle" }));
    if (index < steps.length - 1) {
      const from = x + stepW + 4;
      const to = x + stepW + stepGap - 4;
      body.push(arrow({ from: [from, stepY + 18], to: [to, stepY + 18], color: p.inkMuted, width: 1.6 }));
    }
  });

  const noteY = stepY + 36 + 16;
  const noteH = 52;
  body.push(rect({ x: 48, y: noteY, w: W - 96, h: noteH, r: 12, fill: p.card, stroke: p.border }));
  body.push(
    text("顺序颠倒会导致重复劳动：schema 没对齐就做实体匹配，等价的判断往往全部作废；实体身份没确定，冲突取值也无法归到同一个实体上。", {
      x: W / 2,
      y: noteY + 26,
      size: 11.5,
      weight: 550,
      fill: p.inkSoft,
      align: "middle",
      maxUnits: 66,
    }),
  );

  return build({
    width: W,
    height: noteY + noteH + 8,
    title: "知识融合的三条并行工作线",
    caption: "三条线汇入同一张统一的图，但它们的先后顺序是固定的：本体对齐 → 实体对齐 → 冲突消解。",
    body: body.join(""),
  });
}

/** 07-B 分块如何把比较量从平方级降下来 */
function blocking() {
  const body = [];
  const top = 26;
  const panelH = 232;
  const leftX = 48;
  const leftW = 448;
  const rightX = 552;
  const rightW = W - 48 - rightX;

  // 左：不做分块
  body.push(rect({ x: leftX, y: top, w: leftW, h: panelH, r: 13, fill: p.roseSoft, stroke: p.border }));
  body.push(rect({ x: leftX, y: top, w: leftW, h: 4, r: 2, fill: p.rose, stroke: "none" }));
  body.push(text("不做分块：两两比较", { x: leftX + leftW / 2, y: top + 32, size: 14.5, weight: 650, fill: p.rose, align: "middle" }));
  body.push(
    text("N 个实体全部两两比一遍，比较次数随实体数平方增长。", {
      x: leftX + leftW / 2,
      y: top + 56,
      size: 11,
      fill: p.inkSoft,
      align: "middle",
      maxUnits: 40,
    }),
  );

  // 实体圆点示意
  const dotTop = top + 92;
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const cx = leftX + 60 + col * 42;
      const cy = dotTop + row * 34;
      body.push(`<circle cx="${cx}" cy="${cy}" r="9" fill="${p.card}" stroke="${p.borderStrong}" stroke-width="1.4"/>`);
    }
  }
  body.push(text("…", { x: leftX + 60 + 8 * 42, y: dotTop + 34, size: 15, weight: 650, fill: p.inkMuted, align: "middle" }));

  body.push(
    text("复杂度 O(N²)，k 个属性时为 O(k·N²)", {
      x: leftX + leftW / 2,
      y: top + panelH - 30,
      size: 11.5,
      weight: 600,
      fill: p.rose,
      align: "middle",
    }),
  );

  // 右：先分块
  body.push(rect({ x: rightX, y: top, w: rightW, h: panelH, r: 13, fill: p.mintSoft, stroke: p.border }));
  body.push(rect({ x: rightX, y: top, w: rightW, h: 4, r: 2, fill: p.mint, stroke: "none" }));
  body.push(text("先分块：只在块内两两比", { x: rightX + rightW / 2, y: top + 32, size: 14.5, weight: 650, fill: p.mint, align: "middle" }));
  body.push(
    text("按规则把实体分到若干块：首字母、关键词倒排、局部敏感哈希（LSH）都是常用键。", {
      x: rightX + rightW / 2,
      y: top + 56,
      size: 11,
      fill: p.inkSoft,
      align: "middle",
      maxUnits: 38,
    }),
  );

  const blocks = [
    { x: rightX + 22, y: top + 84, w: (rightW - 44 - 24) / 2, h: 42, dots: 5 },
    { x: rightX + 22 + (rightW - 44 - 24) / 2 + 24, y: top + 84, w: (rightW - 44 - 24) / 2, h: 42, dots: 4 },
    { x: rightX + 22, y: top + 138, w: (rightW - 44 - 24) / 2, h: 42, dots: 4 },
    { x: rightX + 22 + (rightW - 44 - 24) / 2 + 24, y: top + 138, w: (rightW - 44 - 24) / 2, h: 42, dots: 3 },
  ];
  blocks.forEach((block, index) => {
    body.push(rect({ x: block.x, y: block.y, w: block.w, h: block.h, r: 9, fill: p.card, stroke: p.border }));
    const startX = block.x + 20;
    for (let n = 0; n < block.dots; n += 1) {
      body.push(
        `<circle cx="${startX + n * 24}" cy="${block.y + block.h / 2}" r="7" fill="${p.mintSoft}" stroke="${p.mint}" stroke-width="1.3"/>`,
      );
    }
  });

  body.push(
    text("一百万实体 → 约五千亿次比较；分块后只在块内比，量级大幅下降", {
      x: rightX + rightW / 2,
      y: top + panelH - 30,
      size: 11.5,
      weight: 600,
      fill: p.mint,
      align: "middle",
      maxUnits: 42,
    }),
  );

  // 中间箭头
  body.push(arrow({ from: [leftX + leftW + 8, top + panelH / 2], to: [rightX - 8, top + panelH / 2], color: p.inkMuted, width: 2 }));

  // 底部代价说明
  const noteY = top + panelH + 22;
  const noteH = 68;
  body.push(rect({ x: 48, y: noteY, w: W - 96, h: noteH, r: 12, fill: p.blueSoft, stroke: p.border }));
  body.push(text("代价：可能漏掉本应匹配但不共享块的实体对（召回损失）", { x: W / 2, y: noteY + 22, size: 13, weight: 650, fill: p.blue, align: "middle" }));
  body.push(
    text("分块是拿召回换效率，块键与块粒度没有通用最优值，参数需要在真实数据上调。", {
      x: W / 2,
      y: noteY + 46,
      size: 11,
      fill: p.inkSoft,
      align: "middle",
      maxUnits: 60,
    }),
  );

  return build({
    width: W,
    height: noteY + noteH + 8,
    title: "分块：把平方级的比较降下来",
    caption: "左侧是暴力两两比较，右侧是先分块再比。分块省下的是不必要的比较，付出的是召回。",
    body: body.join(""),
  });
}

export const fusion = [
  { slug: "07-fusion-pipeline", svg: fusionPipeline() },
  { slug: "07-blocking", svg: blocking() },
];
