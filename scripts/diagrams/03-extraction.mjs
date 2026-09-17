import { palette as p, rect, text, arrow, chip, sectionLabel, build } from "./kit.mjs";

const W = 1120;

/** 03-A 抽取的三大子任务：统一的「输入 → 输出」结构并排比较 */
function extractionTasks() {
  const body = [];
  const top = 28;
  const colW = 330;
  const gap = 17;
  const xOf = (index) => 48 + index * (colW + gap);
  const midOf = (index) => xOf(index) + colW / 2;

  // 三列共用的纵向骨架：标题 → 输入 → 输出 → 复杂度
  const headH = 62;
  const headBottom = top + headH;
  const inLabelY = headBottom + 22;
  const inY = headBottom + 30;
  const inH = 108;
  const outLabelY = inY + inH + 27;
  const outY = inY + inH + 35;
  const outH = 200;
  const outBottom = outY + outH;

  const cols = [
    {
      title: "命名实体识别",
      en: "Named Entity Recognition",
      ink: p.mint,
      soft: p.mintSoft,
      inputTitle: "输入：一句原文",
      inputLines: ["「北京时间3月23日，", "美国总统特朗普在白宫签署备忘录」"],
      outputTitle: "输出：原子信息",
      note: "答案的形状是「这里有个什么东西」——它不给实体之间建立任何联系。",
      render: () => {
        const items = [
          { label: "时间", value: "3月23日" },
          { label: "人名", value: "特朗普" },
          { label: "地理位置", value: "白宫" },
        ];
        const items2 = [];
        items.forEach((item, index) => {
          const y = outY + 40 + index * 33;
          items2.push(rect({ x: xOf(0) + 14, y, w: colW - 28, h: 28, r: 8, fill: p.canvas, stroke: p.border }));
          items2.push(chip({ x: xOf(0) + 20, y: y + 4, w: 62, h: 20, label: item.label, fill: p.mintSoft, ink: p.mint, size: 11 }));
          items2.push(text(item.value, { x: xOf(0) + 92, y: y + 14, size: 12, weight: 600, fill: p.ink, align: "start", maxUnits: 18 }));
        });
        return items2.join("");
      },
    },
    {
      title: "关系抽取",
      en: "Relation Extraction",
      ink: p.blue,
      soft: p.blueSoft,
      inputTitle: "输入：一对已确定的实体",
      inputLines: ["公司 A", "公司 B", "（由 NER 先给出，不再判断它们是什么）"],
      outputTitle: "输出：实体对 + 关系 + 时间 + 来源",
      note: "同一对实体在不同年份可以是不同关系，所以关系必须带时间和来源。",
      render: () => {
        const parts = [];
        const table = [
          ["实体对", "关系", "时间", "来源"],
          ["A → B", "合作伙伴", "2019", "年报"],
          ["A → B", "客户", "2022", "公告"],
        ];
        const colX = [0, 96, 192, 250];
        const tableY = outY + 38;
        table.forEach((row, index) => {
          const y = tableY + index * 25;
          const head = index === 0;
          parts.push(rect({ x: xOf(1) + 14, y, w: colW - 28, h: 25, r: head ? 7 : 0, fill: head ? p.blueSoft : index % 2 === 1 ? p.card : p.canvas, stroke: p.border }));
          row.forEach((cell, cellIndex) => {
            parts.push(
              text(cell, {
                x: xOf(1) + 20 + colX[cellIndex],
                y: y + 13,
                size: head ? 10.5 : 11.5,
                weight: head ? 650 : 520,
                fill: head ? p.blue : p.ink,
                align: "start",
                maxUnits: 14,
              }),
            );
          });
        });
        const noteY = tableY + 3 * 25 + 12;
        parts.push(rect({ x: xOf(1) + 14, y: noteY, w: colW - 28, h: 52, r: 8, fill: p.blueSoft, stroke: p.border }));
        parts.push(
          text("同一对实体，2019 年是合作伙伴、2022 年是客户；没有时间与来源，这两条记录会互相覆盖。", {
            x: xOf(1) + colW / 2,
            y: noteY + 26,
            size: 11,
            fill: p.blue,
            align: "middle",
            maxUnits: 32,
          }),
        );
        return parts.join("");
      },
    },
    {
      title: "事件抽取",
      en: "Event Extraction",
      ink: p.pink,
      soft: p.pinkSoft,
      inputTitle: "输入：一句（或一段）文本",
      inputLines: ["「某集团于 3 月完成", "对某科技的收购」"],
      outputTitle: "输出：事件类型 + 触发词 + 论元角色",
      note: "它要同时决定事件类型、触发词和多个论元的角色，三者互相约束。",
      render: () => {
        const parts = [];
        parts.push(chip({ x: xOf(2) + 14, y: outY + 38, w: 190, h: 26, label: "Transfer-Ownership", fill: p.pinkSoft, ink: p.pink, size: 11.5 }));
        parts.push(text("事件类型", { x: xOf(2) + 212, y: outY + 51, size: 10.5, fill: p.inkMuted, align: "start" }));
        parts.push(rect({ x: xOf(2) + 14, y: outY + 70, w: colW - 28, h: 28, r: 8, fill: p.amberSoft, stroke: p.border }));
        parts.push(text("触发词：完成（收购）", { x: xOf(2) + 22, y: outY + 84, size: 11.5, weight: 600, fill: p.amber, align: "start", maxUnits: 24 }));

        const roles = [
          ["Buyer", "某集团"],
          ["Seller", "（未出现）"],
          ["Artifact", "某科技"],
          ["Price", "未披露"],
        ];
        roles.forEach((role, index) => {
          const col = index % 2;
          const row = Math.floor(index / 2);
          const x = xOf(2) + 14 + col * 155;
          const y = outY + 104 + row * 31;
          parts.push(rect({ x, y, w: 145, h: 28, r: 8, fill: p.canvas, stroke: p.border }));
          parts.push(chip({ x: x + 6, y: y + 4, w: 66, h: 20, label: role[0], fill: p.pinkSoft, ink: p.pink, size: 10.5 }));
          parts.push(text(role[1], { x: x + 78, y: y + 14, size: 11, weight: 550, fill: p.ink, align: "start", maxUnits: 10 }));
        });
        return parts.join("");
      },
    },
  ];

  // 数据三处不同：列内结构一致，因此共用同一套坐标
  const structures = [
    { title: "结构复杂度", level: "一元", detail: "一问一个词", w: 78 },
    { title: "结构复杂度", level: "二元 + 属性", detail: "两个实体加若干限定", w: 118 },
    { title: "结构复杂度", level: "多元", detail: "一个类型加多个角色", w: 150 },
  ];

  cols.forEach((col, index) => {
    const x = xOf(index);
    body.push(rect({ x, y: top, w: colW, h: headH, r: 12, fill: col.soft, stroke: p.border }));
    body.push(rect({ x, y: top, w: colW, h: 4, r: 2, fill: col.ink, stroke: "none" }));
    body.push(text(col.title, { x: x + colW / 2, y: top + 31, size: 15.5, weight: 650, fill: col.ink, align: "middle" }));
    body.push(text(col.en.toUpperCase(), { x: x + colW / 2, y: top + 50, size: 9.5, weight: 600, fill: col.ink, align: "middle" }));

    // 输入
    body.push(sectionLabel("INPUT", { x: x + 2, y: inLabelY }));
    body.push(text(col.inputTitle, { x: x + 46, y: inLabelY, size: 12, weight: 620, fill: p.ink, align: "start" }));
    body.push(rect({ x, y: inY, w: colW, h: inH, r: 11, fill: p.card, stroke: p.border }));
    col.inputLines.forEach((line, lineIndex) => {
      const single = col.inputLines.length === 1;
      const y = inY + (single ? inH / 2 : 34 + lineIndex * 25);
      body.push(
        text(line, {
          x: col === cols[0] ? x + colW / 2 : x + 18,
          y,
          size: single ? 12 : 12.5,
          fill: line.startsWith("（") ? p.inkMuted : p.ink,
          align: col === cols[0] ? "middle" : "start",
          maxUnits: col === cols[0] ? 30 : 46,
        }),
      );
    });

    // 输入到输出：三列保持同一个指示符
    body.push(text("↓", { x: x + colW / 2, y: inY + inH + 17, size: 15, weight: 700, fill: p.inkMuted, align: "middle" }));

    // 输出
    body.push(sectionLabel("OUTPUT", { x: x + 2, y: outLabelY }));
    body.push(text(col.outputTitle, { x: x + 58, y: outLabelY, size: 12, weight: 620, fill: p.ink, align: "start" }));
    body.push(rect({ x, y: outY, w: colW, h: outH, r: 11, fill: p.card, stroke: p.border }));
    body.push(col.render());

    // 每列的收束：这句话回答什么问题
    const noteTop = outBottom + 4;
    body.push(rect({ x, y: noteTop, w: colW, h: 56, r: 10, fill: col.soft, stroke: p.border }));
    body.push(text(col.note, { x: x + colW / 2, y: noteTop + 29, size: 11, fill: col.ink, align: "middle", maxUnits: 32 }));

    // 底部：复杂度递增
    const struct = structures[index];
    const barY = noteTop + 56 + 18;
    body.push(sectionLabel(struct.title, { x, y: barY - 11 }));
    body.push(rect({ x, y: barY, w: struct.w, h: 11, r: 5.5, fill: col.ink, stroke: "none", dash: undefined }));
    body.push(rect({ x: x + struct.w, y: barY, w: colW - struct.w, h: 11, r: 5.5, fill: p.canvas, stroke: p.border, dash: "3 3" }));
    body.push(text(struct.level, { x, y: barY + 27, size: 12.5, weight: 650, fill: col.ink, align: "start" }));
    body.push(text(struct.detail, { x: x + struct.w + 8, y: barY + 27, size: 11, fill: p.inkMuted, align: "start", maxUnits: 30 }));
  });

  // 底部总结：让开三列的复杂度条（条底 = outBottom + 78 + 18 + 11，文字再往下 27）
  const bottomNoteTop = outBottom + 150;
  body.push(rect({ x: 48, y: bottomNoteTop, w: W - 96, h: 52, r: 12, fill: p.card, stroke: p.border }));
  body.push(
    text("三者的复杂度递增：事件抽取最重，它要同时决定事件类型、触发词与每个论元的角色，而不是只识别一串片段。", {
      x: 48 + (W - 96) / 2,
      y: bottomNoteTop + 27,
      size: 12.5,
      weight: 600,
      fill: p.ink,
      align: "middle",
      maxUnits: 120,
    }),
  );

  return build({
    width: W,
    height: bottomNoteTop + 52,
    title: "抽取的三大子任务：同一个「输入 → 输出」骨架",
    caption: "同一段文本喂给三个任务，产出三种形状：原子词、带时间和来源的边、带多个角色的事件。结构越往后越重。",
    body: body.join(""),
  });
}

/** 03-B NER 方法演进与 F1 提升（2010 → 2022，纵轴放大） */
function nerTimeline() {
  const body = [];
  const left = 92;
  const right = 1040;
  const axisTop = 52;
  const axisBottom = 344;
  const lo = 84;
  const hi = 96;
  const yOf = (value) => axisBottom - ((value - lo) / (hi - lo)) * (axisBottom - axisTop);

  const points = [
    { year: "~2010", method: "HMM / CRF", f1: 85 },
    { year: "2011", method: "+NN / CNN", f1: 89 },
    { year: "2016", method: "+BiLSTM", f1: 91 },
    { year: "2018", method: "+BERT+BiLSTM", f1: 92.8 },
    { year: "2019", method: "+Fine Tune", f1: 93.5 },
    { year: "2022", method: "+Retrieval", f1: 94.6 },
  ];

  const xOf = (index) => left + (index * (right - left)) / (points.length - 1);

  // 刻度与网格线
  for (let value = lo; value <= hi; value += 2) {
    const y = yOf(value);
    body.push(`<line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="${p.grid}" stroke-width="1.2" stroke-dasharray="4 5"/>`);
    body.push(text(String(value), { x: left - 12, y, size: 11, weight: 600, fill: p.inkMuted, align: "end" }));
  }

  // 纵轴与横轴
  body.push(`<line x1="${left}" y1="${axisTop - 14}" x2="${left}" y2="${axisBottom + 4}" stroke="${p.borderStrong}" stroke-width="1.8"/>`);
  body.push(`<line x1="${left - 4}" y1="${axisBottom + 4}" x2="${right + 8}" y2="${axisBottom + 4}" stroke="${p.borderStrong}" stroke-width="1.8"/>`);
  body.push(text("F1", { x: 50, y: axisTop - 24, size: 12, weight: 650, fill: p.ink, align: "start" }));
  body.push(text("放大显示：纵轴只取 84 – 96，不是 0 – 100", { x: left + 26, y: axisTop - 24, size: 11, fill: p.rose, align: "start" }));

  // 折线
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${xOf(index)} ${yOf(point.f1)}`).join(" ");
  body.push(`<path d="${path}" fill="none" stroke="${p.blue}" stroke-width="2.4" stroke-linejoin="round"/>`);

  points.forEach((point, index) => {
    const x = xOf(index);
    const y = yOf(point.f1);
    body.push(`<circle cx="${x}" cy="${y}" r="6.5" fill="${p.card}" stroke="${p.blue}" stroke-width="2.4"/>`);
    body.push(`<circle cx="${x}" cy="${y}" r="2.6" fill="${p.blue}"/>`);
    body.push(text(`${point.f1}%`, { x, y: y - 26, size: 12.5, weight: 700, fill: p.blue, align: "middle" }));
    body.push(text(point.year, { x, y: y + 26, size: 11.5, weight: 650, fill: p.inkMuted, align: "middle" }));
    body.push(text(point.method, { x, y: y + 44, size: 11.5, weight: 600, fill: p.ink, align: "middle", maxUnits: 15 }));
  });

  // 每一代的增量说明：模型拿走的活越来越多
  const stageNotes = [
    { x: (xOf(0) + xOf(1)) / 2, note: "序列标注 + 人工特征" },
    { x: (xOf(2) + xOf(3)) / 2, note: "上下文由模型自己学" },
  ];
  stageNotes.forEach((stage) => {
    const y = axisBottom + 66;
    body.push(rect({ x: stage.x - 82, y: y - 13, w: 164, h: 26, r: 13, fill: p.roseSoft, stroke: p.border }));
    body.push(text(stage.note, { x: stage.x, y, size: 11, weight: 600, fill: p.rose, align: "middle" }));
  });
  body.push(`<line x1="${xOf(0)}" y1="${axisBottom + 12}" x2="${xOf(1)}" y2="${axisBottom + 48}" stroke="${p.rose}" stroke-width="1.1" stroke-dasharray="3 4"/>`);
  body.push(`<line x1="${xOf(2)}" y1="${axisBottom + 12}" x2="${xOf(3)}" y2="${axisBottom + 48}" stroke="${p.rose}" stroke-width="1.1" stroke-dasharray="3 4"/>`);

  // 底部注解
  const noteY = axisBottom + 106;
  body.push(rect({ x: 48, y: noteY, w: W - 96, h: 54, r: 12, fill: p.roseSoft, stroke: p.border }));
  body.push(text("「Feature, Better Feature」", { x: W / 2, y: noteY + 21, size: 13, weight: 700, fill: p.rose, align: "middle" }));
  body.push(
    text("每一代做的事，是把「造特征」这件事从人手里往外挪一点，而不是换一个要回答的问题。", {
      x: W / 2,
      y: noteY + 40,
      size: 11.5,
      fill: p.inkSoft,
      align: "middle",
      maxUnits: 110,
    }),
  );

  return build({
    width: W,
    height: noteY + 54,
    title: "NER 的方法演进与 F1 提升（2010 → 2022）",
    caption: "数值取自各代方法在通用英文 NER 基准上的代表性结果，口径不完全一致；趋势（每一代把特征工程外移）比单点数字更可靠。",
    body: body.join(""),
  });
}

export const extraction = [
  { slug: "03-extraction-tasks", svg: extractionTasks() },
  { slug: "03-ner-timeline", svg: nerTimeline() },
];
