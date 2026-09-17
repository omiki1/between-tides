import { palette as p, rect, text, sectionLabel, build } from "./kit.mjs";

const W = 1120;

/**
 * 高度换算说明（本文件与 render.mjs 的既有行为对齐）
 * -------------------------------------------------
 * render.mjs 走的是 sharp(density:144).resize({ width: 1600 }) 这条路，
 * 实际出图尺寸 = 1600 × round(viewBox 高度 × 1600 / 1120)，即 viewBox 高度 × 1.4286。
 * 因此要让产出的 WebP 与文章里声明的尺寸严格一致：
 *   05-re-paradigms             声明 1600x880  -> viewBox 高度 616
 *   05-distant-supervision-noise 声明 1600x760 -> viewBox 高度 532
 * 而 check.mjs 的纵向余量要求只需 bodyBottom 与画布底部留出 34px 以上，
 * 所以正文区高度取“viewBox 高度 − 页眉(74) − 图注区(54)”，下面两个函数直接写死该值。
 */

/** 05-A 四种关系抽取范式的成本对照 */
function paradigms() {
  const body = [];
  const top = 26;
  const colW = 236;
  const gap = 19;
  const headerH = 58;
  const rowH = 52;
  const rowGap = 2;

  const columns = [
    {
      title: "模板 / 模式匹配",
      sub: "Pattern Matching",
      ink: p.blue,
      soft: p.blueSoft,
      rows: [
        ["标注需求", "无，人工写规则"],
        ["可扩展性", "差，换领域重写"],
        ["噪声来源", "模式覆盖的盲区"],
        ["典型代价", "准但召回低，难维护"],
      ],
    },
    {
      title: "Bootstrapping",
      sub: "半自动扩张",
      ink: p.amber,
      soft: p.amberSoft,
      rows: [
        ["标注需求", "极少量高精度种子"],
        ["可扩展性", "中，靠迭代扩张"],
        ["噪声来源", "语义漂移、细粒度混淆"],
        ["典型代价", "要限轮数并给候选打分"],
      ],
    },
    {
      title: "远程监督",
      sub: "Distant Supervision",
      ink: p.pink,
      soft: p.pinkSoft,
      rows: [
        ["标注需求", "知识库加无标注语料"],
        ["可扩展性", "高，可自动跑量"],
        ["噪声来源", "共现假设的假阳性"],
        ["典型代价", "标签噪声重，须配套去噪"],
      ],
    },
    {
      title: "全监督",
      sub: "Supervised",
      ink: p.mint,
      soft: p.mintSoft,
      rows: [
        ["标注需求", "大量人工标注"],
        ["可扩展性", "低，标注是瓶颈"],
        ["噪声来源", "标注一致性、领域漂移"],
        ["典型代价", "效果最好，也最贵"],
      ],
    },
  ];

  columns.forEach((col, index) => {
    const x = 48 + index * (colW + gap);
    body.push(rect({ x, y: top, w: colW, h: headerH, r: 12, fill: col.soft, stroke: p.border }));
    body.push(rect({ x, y: top, w: colW, h: 4, r: 2, fill: col.ink, stroke: "none" }));
    body.push(text(col.title, { x: x + colW / 2, y: top + 27, size: 13.5, weight: 650, fill: col.ink, align: "middle" }));
    body.push(text(col.sub, { x: x + colW / 2, y: top + 45, size: 9.5, fill: col.ink, align: "middle", maxUnits: 24 }));
    body.push(rect({ x: x + colW - 3, y: top + 12, w: 3, h: headerH - 24, r: 1.5, fill: col.ink, stroke: "none" }));

    let y = top + headerH + 10;
    col.rows.forEach(([key, value], rowIndex) => {
      body.push(rect({ x, y, w: colW, h: rowH, r: 8, fill: rowIndex % 2 === 0 ? p.card : p.canvas, stroke: p.border }));
      body.push(text(key, { x: x + 13, y: y + 19, size: 10.5, weight: 620, fill: col.ink, align: "start", maxUnits: 6 }));
      body.push(text(value, { x: x + 13, y: y + 36, size: 10.5, fill: p.inkSoft, align: "start", maxUnits: 16.4 }));
      y += rowH + rowGap;
    });
  });

  const rowsBottom = top + headerH + 10 + 4 * rowH + 3 * rowGap;

  // 底部结论
  const noteY = rowsBottom + 12;
  const noteH = 68;
  body.push(rect({ x: 48, y: noteY, w: W - 96, h: noteH, r: 12, fill: p.mintSoft, stroke: p.border }));
  body.push(text("范式选择是两种预算之间的取舍", { x: 72, y: noteY + 20, size: 12.5, weight: 650, fill: p.mint, align: "start" }));
  body.push(
    text("监督学习表现好，但需要大量标记数据与特征表示；无监督可扩展、适合开放式抽取，但表现比较差；弱监督是为了同时减少人力并利用无标记数据。", {
      x: 72,
      y: noteY + 39,
      size: 10.5,
      fill: p.inkSoft,
      align: "start",
      maxUnits: 130,
    }),
  );
  body.push(
    text("范式选择本质上是「标注预算」与「噪声容忍度」之间的取舍：标注预算越紧，越要靠假设换规模，噪声容忍度就必须跟着放宽。", {
      x: 72,
      y: noteY + 56,
      size: 10.5,
      fill: p.inkMuted,
      align: "start",
      maxUnits: 130,
    }),
  );

  return build({
    width: W,
    height: 488,
    title: "四种关系抽取范式的成本对照",
    caption: "四列从左到右标注需求递增；选择哪种范式，本质是在标注预算与噪声容忍度之间取舍。",
    body: body.join(""),
  });
}

/** 05-B 远程监督的噪声来源链路 */
function distantSupervisionNoise() {
  const body = [];
  const sectionTop = 22;
  const cardTop = 46;
  const cardW = 188;
  const gap = 19;
  const cardH = 84;

  const stages = [
    {
      n: "01",
      title: "知识库里已知的关系对",
      detail: "Freebase：102 种关系、17000 个种子实例",
      ink: p.blue,
      soft: p.blueSoft,
    },
    {
      n: "02",
      title: "回标到两个实体同现的句子",
      detail: "映射到 120 万篇维基百科文章",
      ink: p.blue,
      soft: p.blueSoft,
    },
    {
      n: "03",
      title: "假设「同现即为该关系」",
      detail: "Mintz 等 [2009]：「所有共现的实体对都表达相同的关系」",
      ink: p.rose,
      soft: p.roseSoft,
      bad: true,
    },
    {
      n: "04",
      title: "训练集里混入错误标注",
      detail: "假阳性被当成正例，无法逐条察觉",
      ink: p.rose,
      soft: p.roseSoft,
    },
    {
      n: "05",
      title: "模型学到错误模式",
      detail: "共现越频繁，被误标概率越高",
      ink: p.rose,
      soft: p.roseSoft,
    },
  ];

  const xs = stages.map((_, index) => 48 + index * (cardW + gap));
  const cardBottom = cardTop + cardH;

  body.push(sectionLabel("远程监督的标注链路", { x: 48, y: sectionTop }));

  // 第 3 步是噪声根源：先铺一圈醒目的外框，再把卡片叠上去
  const badX = xs[2];
  body.push(rect({ x: badX - 8, y: cardTop - 8, w: cardW + 16, h: cardH + 16, r: 14, fill: "none", stroke: p.rose, strokeWidth: 2, dash: "7 5" }));
  body.push(text("噪声根源", { x: badX + cardW / 2, y: cardTop - 6, size: 11, weight: 700, fill: p.rose, align: "middle" }));

  stages.forEach((stage, index) => {
    const x = xs[index];
    body.push(rect({ x, y: cardTop, w: cardW, h: cardH, r: 11, fill: stage.soft, stroke: stage.bad ? p.rose : p.border, strokeWidth: stage.bad ? 2 : 1.5 }));
    body.push(rect({ x, y: cardTop, w: cardW, h: 4, r: 2, fill: stage.ink, stroke: "none" }));
    body.push(text(stage.n, { x: x + 12, y: cardTop + 18, size: 10.5, weight: 700, fill: stage.ink, align: "start" }));
    body.push(text(stage.title, { x: x + 12, y: cardTop + 42, size: 11.5, weight: 650, fill: p.ink, align: "start", maxUnits: 15, anchor: "middle" }));
    body.push(text(stage.detail, { x: x + 12, y: cardTop + 68, size: 9.5, fill: p.inkSoft, align: "start", maxUnits: 19, anchor: "middle" }));

    if (index < stages.length - 1) {
      body.push(
        `<path d="M ${x + cardW + 4} ${cardTop + cardH / 2} L ${x + cardW + gap - 4} ${cardTop + cardH / 2}" fill="none" stroke="${p.inkMuted}" stroke-width="1.8" marker-end="url(#arrow-${p.inkMuted.replace(/[^a-z0-9]/gi, "")})"/>`,
      );
    }
  });

  // 两类典型误标
  const labelY = cardBottom + 32;
  body.push(sectionLabel("这一步会带来两类典型误标", { x: 48, y: labelY, fill: p.rose }));

  const boxY = labelY + 14;
  const boxH = 80;
  const boxW = 503;
  const boxes = [
    {
      title: "表达其他关系的句子被误标",
      detail: "句子里两个实体确实同时出现，但说的不是知识库里的那条关系。Mintz 等 [2009] 的「所有共现」假设把这类句子一并标成正例。",
    },
    {
      title: "一句话里多个实体对造成错配",
      detail: "一句里出现多个实体，关系被错配到另一对实体上。测试阶段把句子里每对实体都当潜在实例送进模型，这类错配不会被单独拦截。",
    },
  ];

  boxes.forEach((box, index) => {
    const x = 48 + index * (boxW + 16);
    body.push(rect({ x, y: boxY, w: boxW, h: boxH, r: 11, fill: p.card, stroke: p.border }));
    body.push(rect({ x, y: boxY, w: 4, h: boxH, r: 2, fill: p.rose, stroke: "none" }));
    body.push(text(box.title, { x: x + 18, y: boxY + 22, size: 12, weight: 650, fill: p.rose, align: "start" }));
    body.push(text(box.detail, { x: x + 18, y: boxY + 50, size: 10.5, fill: p.inkSoft, align: "start", maxUnits: 46, anchor: "middle" }));
  });

  const boxesBottom = boxY + boxH;

  // 修正方向
  const noteY = boxesBottom + 16;
  const noteH = 82;
  body.push(rect({ x: 48, y: noteY, w: W - 96, h: noteH, r: 11, fill: p.amberSoft, stroke: p.border }));
  body.push(text("后两代假设都在放宽这个「所有」", { x: 72, y: noteY + 22, size: 12, weight: 650, fill: p.amber, align: "start" }));
  body.push(
    text("Riedel 等 [2010] 改成「至少有一个上下文表达目标关系」，把标注粒度从实体对降到实体对下的句子集合；Ling 等 [2013] 进一步改成「有一定比例的实例是正例」，并让这个比例随关系而变。", {
      x: 72,
      y: noteY + 48,
      size: 10.5,
      fill: p.inkSoft,
      align: "start",
      maxUnits: 130,
    }),
  );

  return build({
    width: W,
    height: 404,
    title: "远程监督的噪声从哪里来",
    caption: "噪声不在数据里，而在第 3 步那个「同时出现即为该关系」的强假设上；后续去噪方法改的都是这一步。",
    body: body.join(""),
  });
}

export const relationExtraction = [
  { slug: "05-re-paradigms", svg: paradigms() },
  { slug: "05-distant-supervision-noise", svg: distantSupervisionNoise() },
];
