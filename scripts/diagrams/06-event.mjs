import { palette as p, rect, text, arrow, chip, node, sectionLabel, build } from "./kit.mjs";

const W = 1120;

/** 06-A 关系与事件的结构差异 */
function relationVsEvent() {
  const body = [];
  const top = 28;
  const colW = 496;
  const gap = 32;
  const leftX = 48;
  const rightX = leftX + colW + gap;
  const headH = 74;

  // 左：关系
  body.push(rect({ x: leftX, y: top, w: colW, h: headH, r: 12, fill: p.blueSoft, stroke: p.border }));
  body.push(text("关系 Relation", { x: leftX + colW / 2, y: top + 30, size: 16.5, weight: 650, fill: p.blue, align: "middle" }));
  body.push(text("两个实体之间的静态联系", { x: leftX + colW / 2, y: top + 53, size: 11.5, fill: p.blue, align: "middle" }));

  const relationY = top + 180;
  body.push(
    node({ cx: leftX + 108, cy: relationY, rx: 62, ry: 34, label: "张三", fill: p.blueSoft, stroke: p.blue, size: 14.5, ink: p.blue }),
  );
  body.push(
    node({ cx: leftX + 388, cy: relationY, rx: 62, ry: 34, label: "某公司", fill: p.blueSoft, stroke: p.blue, size: 14.5, ink: p.blue }),
  );
  body.push(arrow({ from: [leftX + 178, relationY], to: [leftX + 318, relationY], color: p.blue, width: 2.2, label: "任职于" }));
  body.push(text("一条边：两个节点，一个标签", { x: leftX + colW / 2, y: relationY + 62, size: 11.5, fill: p.inkMuted, align: "middle" }));

  const leftNoteY = relationY + 92;
  body.push(rect({ x: leftX, y: leftNoteY, w: colW, h: 92, r: 11, fill: p.card, stroke: p.border }));
  body.push(sectionLabel("它能表达什么", { x: leftX + 20, y: leftNoteY + 22 }));
  body.push(
    text("· 只回答「这两个东西之间有没有关系、是什么关系」", {
      x: leftX + 20,
      y: leftNoteY + 44,
      size: 11.5,
      fill: p.inkSoft,
      align: "start",
      maxUnits: 62,
    }),
  );
  body.push(
    text("· 时间、地点、原因要额外挂属性，或者干脆丢掉", {
      x: leftX + 20,
      y: leftNoteY + 65,
      size: 11.5,
      fill: p.inkSoft,
      align: "start",
      maxUnits: 62,
    }),
  );

  // 右：事件
  body.push(rect({ x: rightX, y: top, w: colW, h: headH, r: 12, fill: p.pinkSoft, stroke: p.border }));
  body.push(text("事件 Event", { x: rightX + colW / 2, y: top + 30, size: 16.5, weight: 650, fill: p.pink, align: "middle" }));
  body.push(text("「发生了什么」：一个类型加多个角色", { x: rightX + colW / 2, y: top + 53, size: 11.5, fill: p.pink, align: "middle" }));

  const cardY = top + headH + 12;
  const cardH = 296;
  body.push(rect({ x: rightX, y: cardY, w: colW, h: cardH, r: 13, fill: p.card, stroke: p.border, dash: "6 5" }));

  const cx = rightX + colW / 2;
  const cy = cardY + 148;
  body.push(text("任职事件", { x: cx, y: cy - 9, size: 13, weight: 650, fill: p.pink, align: "middle" }));
  body.push(text("类型", { x: cx, y: cy + 11, size: 10, fill: p.inkMuted, align: "middle" }));
  body.push(
    `<ellipse cx="${cx}" cy="${cy}" rx="72" ry="42" fill="${p.pinkSoft}" stroke="${p.pink}" stroke-width="2"/>`,
  );

  const args = [
    { label: "触发词", value: "任职", x: cx, y: cardY + 28 },
    { label: "参与者 / 人物", value: "张三", x: rightX + 66, y: cardY + 86 },
    { label: "机构", value: "某公司", x: rightX + colW - 66, y: cardY + 86 },
    { label: "时间", value: "2024 年 3 月", x: rightX + 66, y: cardY + 216 },
    { label: "地点", value: "北京", x: rightX + colW - 66, y: cardY + 216 },
  ];

  args.forEach((arg) => {
    const w = 150;
    const h = 54;
    body.push(rect({ x: arg.x - w / 2, y: arg.y - h / 2, w, h, r: 10, fill: p.canvas, stroke: p.border }));
    body.push(text(arg.label, { x: arg.x, y: arg.y - 10, size: 10, weight: 600, fill: p.pink, align: "middle" }));
    body.push(text(arg.value, { x: arg.x, y: arg.y + 9, size: 12, weight: 650, fill: p.ink, align: "middle" }));

    const isTrigger = arg.y < cardY + 60;
    const start = isTrigger ? arg.y + h / 2 + 4 : arg.y + (arg.y < cy ? -h / 2 - 4 : h / 2 + 4);
    const end = isTrigger ? cy - 46 : arg.y + (arg.y < cy ? 46 : -46);
    body.push(arrow({ from: [arg.x, start], to: [arg.x, end], color: p.pink, width: 1.6 }));
  });

  const rightNoteY = cardY + cardH + 12;
  body.push(rect({ x: rightX, y: rightNoteY, w: colW, h: 92, r: 11, fill: p.card, stroke: p.border }));
  body.push(sectionLabel("它会回答", { x: rightX + 20, y: rightNoteY + 22 }));
  body.push(
    text("· 发生了什么、谁参与、什么时候、在哪里", {
      x: rightX + 20,
      y: rightNoteY + 44,
      size: 11.5,
      fill: p.inkSoft,
      align: "start",
      maxUnits: 62,
    }),
  );
  body.push(
    text("· 角色固定挂在事件类型上，多个论元互相约束", {
      x: rightX + 20,
      y: rightNoteY + 65,
      size: 11.5,
      fill: p.inkSoft,
      align: "start",
      maxUnits: 62,
    }),
  );

  // 底部
  const noteY = Math.max(leftNoteY + 92, rightNoteY + 92) + 14;
  body.push(rect({ x: 48, y: noteY, w: W - 96, h: 62, r: 12, fill: p.mintSoft, stroke: p.border }));
  body.push(text("关系是二元边，事件是带类型的多元结构", { x: W / 2, y: noteY + 24, size: 13.5, weight: 700, fill: p.mint, align: "middle" }));
  body.push(
    text("事件比关系多出来的正是时间与角色，因此结构更重：抽取时要在类型、触发词与多个论元之间同时做决定。", {
      x: W / 2,
      y: noteY + 45,
      size: 11.5,
      fill: p.inkSoft,
      align: "middle",
      maxUnits: 100,
    }),
  );

  return build({
    width: W,
    height: noteY + 62,
    title: "关系与事件：同一件事的两种结构",
    caption: "「张三任职于某公司」既可以写成一条边，也可以写成一个事件——区别在于要不要把时间与角色一起留住。",
    body: body.join(""),
  });
}

/** 06-B 事件图谱与事理图谱的层次关系 */
function eventGraphLayers() {
  const body = [];
  const boxX = 48;
  const boxW = W - 96;

  // 上层：事理图谱（类型层）
  const upperY = 62;
  const upperH = 134;
  body.push(rect({ x: boxX, y: upperY, w: boxW, h: upperH, r: 14, fill: p.pinkSoft, stroke: p.borderStrong, dash: "7 6" }));

  const typeBoxes = [
    { x: 72, label: "收购完成", fill: p.card, ink: p.pink },
    { x: 396, label: "股价波动", fill: p.card, ink: p.pink },
    { x: 720, label: "融资", fill: p.card, ink: p.pink },
    { x: 888, label: "业务扩张", fill: p.card, ink: p.pink },
  ];
  const typeWide = 288;
  const typeNarrow = 144;
  typeBoxes.forEach((box) => {
    const width = (box.x === 72 || box.x === 396) ? typeWide : typeNarrow;
    body.push(rect({ x: box.x, y: upperY + 46, w: width, h: 48, r: 10, fill: box.fill, stroke: p.pink }));
    body.push(text(box.label, { x: box.x + width / 2, y: upperY + 70, size: 14, weight: 650, fill: box.ink, align: "middle", maxUnits: 10 }));
    box.width = width;
  });

  body.push(arrow({ from: [typeBoxes[0].x + typeWide + 5, upperY + 70], to: [typeBoxes[1].x - 5, upperY + 70], color: p.pink, width: 1.8 }));
  body.push(text("因果", { x: 378, y: upperY + 52, size: 10.5, weight: 600, fill: p.pink, align: "middle" }));
  body.push(arrow({ from: [typeBoxes[2].x + typeNarrow + 5, upperY + 70], to: [typeBoxes[3].x - 5, upperY + 70], color: p.pink, width: 1.8 }));
  body.push(text("顺承", { x: 870, y: upperY + 52, size: 10.5, weight: 600, fill: p.pink, align: "middle" }));

  body.push(sectionLabel("事理图谱 · 类型层　事理逻辑 Event Logic Graph", { x: boxX + 22, y: upperY + 22 }));
  body.push(text("边 = 因果 / 顺承 / 条件", { x: boxX + boxW - 22, y: upperY + 22, size: 11, fill: p.pink, align: "end" }));

  // 归纳方向
  const inductiveY = upperY + upperH + 16;
  body.push(text("归纳", { x: 700, y: inductiveY - 8, size: 11, weight: 650, fill: p.inkMuted, align: "middle" }));
  [120, 450, 780].forEach((x) => {
    body.push(arrow({ from: [x, inductiveY + 50], to: [x, inductiveY + 7], color: p.inkMuted, width: 1.7, dash: "5 4" }));
  });

  // 下层：事件图谱（实例层）
  const lowerY = inductiveY + 58;
  const lowerH = 168;
  body.push(rect({ x: boxX, y: lowerY, w: boxW, h: lowerH, r: 14, fill: p.mintSoft, stroke: p.borderStrong, dash: "7 6" }));
  body.push(sectionLabel("事件图谱 · 实例层　已抽取的具体事件及其论元", { x: boxX + 22, y: lowerY + 24 }));

  const instances = [
    { name: "收购完成", detail: "买方 = 某集团　卖方 = 某科技　时间 = 2024 年 3 月　金额 = 未披露" },
    { name: "股价波动", detail: "标的 = 某科技　方向 = 上涨　时间 = 2024 年 3 月" },
    { name: "融资", detail: "轮次 = B 轮　金额 = 5 亿元　时间 = 2024 年 6 月" },
  ];
  instances.forEach((item, index) => {
    const y = lowerY + 44 + index * 40;
    body.push(rect({ x: 72, y, w: 936, h: 34, r: 9, fill: p.card, stroke: p.border }));
    body.push(chip({ x: 82, y: y + 5, w: 92, h: 24, label: item.name, fill: p.mintSoft, ink: p.mint, size: 11 }));
    body.push(text(item.detail, { x: 188, y: y + 17, size: 11.5, fill: p.inkSoft, align: "start", maxUnits: 86 }));
  });

  // 底部说明
  const noteY = lowerY + lowerH + 16;
  body.push(rect({ x: 48, y: noteY, w: W - 96, h: 74, r: 12, fill: p.card, stroke: p.border }));
  body.push(text("上一层是从下一层归纳出来的，不是另一个抽取任务", { x: 48 + 26, y: noteY + 22, size: 13, weight: 700, fill: p.ink, align: "start" }));
  body.push(
    text("具体事件实例由文本抽取得到；事理图谱的边则来自大量文本里的统计共现，再经过人工校验与筛选，不是从单篇文本里抽出来的。", {
      x: 48 + 26,
      y: noteY + 45,
      size: 11.5,
      fill: p.inkSoft,
      align: "start",
      maxUnits: 118,
    }),
  );
  body.push(
    text("因此它的边是概率性的：表达的是「经常一起发生」，而不是「必然如此」。", {
      x: 48 + 26,
      y: noteY + 64,
      size: 11.5,
      fill: p.inkSoft,
      align: "start",
      maxUnits: 118,
    }),
  );

  return build({
    width: W,
    height: noteY + 74,
    title: "事件图谱与事理图谱：实例层与类型层",
    caption: "下层的每个实例都能追到原文；上层的每条边都是跨文本统计出来的规律，可靠性与代价都不在同一个量级。",
    body: body.join(""),
  });
}

export const event = [
  { slug: "06-relation-vs-event", svg: relationVsEvent() },
  { slug: "06-event-graph-layers", svg: eventGraphLayers() },
];
