import { palette as p, rect, text, chip, sectionLabel, build } from "./kit.mjs";

const W = 1120;

/** 04-A NER 的三大类与八个细分类 */
function nerTypeSystem() {
  const body = [];
  const top = 28;
  const colW = 330;
  const gap = 17;
  const xOf = (index) => 48 + index * (colW + gap);

  const groups = [
    {
      title: "实体类",
      en: "Entity",
      ink: p.mint,
      soft: p.mintSoft,
      meaning: "「这里有个什么东西」",
      chips: [
        ["人名", "PER"],
        ["地名", "LOC"],
        ["机构名", "ORG"],
      ],
    },
    {
      title: "时间类",
      en: "Temporal",
      ink: p.blue,
      soft: p.blueSoft,
      meaning: "「什么时候」",
      chips: [
        ["时间", "TIME"],
        ["日期", "DATE"],
      ],
    },
    {
      title: "数字类",
      en: "Numeric",
      ink: p.amber,
      soft: p.amberSoft,
      meaning: "「多少」",
      chips: [
        ["百分比", "PERCENT"],
        ["金额", "MONEY"],
        ["数量", "QUANTITY"],
      ],
    },
  ];

  const headH = 68;
  const headBottom = top + headH;

  groups.forEach((group, index) => {
    const x = xOf(index);
    body.push(rect({ x, y: top, w: colW, h: headH, r: 12, fill: group.soft, stroke: p.border }));
    body.push(rect({ x, y: top, w: colW, h: 4, r: 2, fill: group.ink, stroke: "none" }));
    body.push(text(group.title, { x: x + colW / 2, y: top + 32, size: 16, weight: 650, fill: group.ink, align: "middle" }));
    body.push(text(group.en.toUpperCase(), { x: x + colW / 2, y: top + 52, size: 9.5, weight: 600, fill: group.ink, align: "middle" }));

    // 细分类
    const subLabelY = headBottom + 22;
    body.push(sectionLabel("细分类", { x: x + 2, y: subLabelY }));
    body.push(text(group.meaning, { x: x + 68, y: subLabelY, size: 11, fill: p.inkMuted, align: "start" }));

    const listY = headBottom + 34;
    const listH = 146;
    body.push(rect({ x, y: listY, w: colW, h: listH, r: 11, fill: p.card, stroke: p.border }));

    group.chips.forEach(([name, abbr], chipIndex) => {
      const y = listY + 24 + chipIndex * 38;
      body.push(rect({ x: x + 16, y, w: colW - 32, h: 32, r: 8, fill: p.canvas, stroke: p.border }));
      body.push(text(name, { x: x + 30, y: y + 16, size: 13, weight: 620, fill: p.ink, align: "start" }));
      body.push(chip({ x: x + colW - 32 - 86, y: y + 4, w: 78, h: 24, label: abbr, fill: group.soft, ink: group.ink, size: 11 }));
    });

    // 标注缩写
    const abbrLabelY = listY + listH + 28;
    body.push(sectionLabel("标注缩写", { x: x + 2, y: abbrLabelY }));

    const abbrY = listY + listH + 40;
    let cursor = x;
    group.chips.forEach(([, abbr]) => {
      const width = abbr.length * 7 + 26;
      body.push(rect({ x: cursor, y: abbrY, w: width, h: 34, r: 8, fill: group.soft, stroke: p.border }));
      body.push(text(abbr, { x: cursor + width / 2, y: abbrY + 17, size: 11, weight: 650, fill: group.ink, align: "middle" }));
      cursor += width + 8;
    });
  });

  // 底部说明
  const noteY = top + headH + 34 + 146 + 40 + 34 + 32;
  body.push(rect({ x: 48, y: noteY, w: W - 96, h: 84, r: 12, fill: p.pinkSoft, stroke: p.border }));
  body.push(text("标注体系决定了模型的上限", { x: 48 + 26, y: noteY + 22, size: 13, weight: 700, fill: p.pink, align: "start" }));
  body.push(
    text("模型只被允许输出标签体系里存在的类型：多标一类，需要标注一致的数据和足够的样本；少标一类，下游永远拿不到这个信息。", {
      x: 48 + 26,
      y: noteY + 44,
      size: 11.5,
      fill: p.inkSoft,
      align: "start",
      maxUnits: 120,
    }),
  );
  body.push(
    text("所以细分类不是越多越好，要看下游任务是否真的会区分它们——不会区分，就只是给标注和评测各加一份负担。", {
      x: 48 + 26,
      y: noteY + 64,
      size: 11.5,
      fill: p.inkSoft,
      align: "start",
      maxUnits: 120,
    }),
  );

  return build({
    width: W,
    height: noteY + 84,
    title: "NER 的类型体系：三大类，八个细分类",
    caption: "缩写只是标签体系的一种常见写法，不同语料库的取值不完全相同；重要的是体系本身而不是字母。",
    body: body.join(""),
  });
}

/** 04-B NER 的六个未解难点 */
function nerOpenProblems() {
  const body = [];
  const top = 28;
  const cardW = 504;
  const cardH = 80;
  const colGap = 16;
  const rowGap = 10;
  const xOf = (col) => 48 + col * (cardW + colGap);
  const yOf = (row) => top + row * (cardH + rowGap);

  const problems = [
    {
      name: "嵌套实体",
      ink: p.pink,
      soft: p.pinkSoft,
      detail: "一个实体内部还套着另一个实体：「北京市海淀区」里还有「海淀区」；扁平标注只能留下一个。",
    },
    {
      name: "不连续实体",
      ink: p.rose,
      soft: p.roseSoft,
      detail: "实体的片段被别的词打断：「申请……并获得了专利」要拼成同一个事件名，标注形式无处安放。",
    },
    {
      name: "领域迁移",
      ink: p.blue,
      soft: p.blueSoft,
      detail: "新闻上训练到 90 分以上，换到病历、合同或工单常常往下掉十几个点，同名实体的边界约定也不同。",
    },
    {
      name: "标注噪声",
      ink: p.amber,
      soft: p.amberSoft,
      detail: "训练集的标签本身有错或不一致：同一类实体，不同标注员在边界上给出不同答案，模型学到的是噪声的平均。",
    },
    {
      name: "低资源与少样本",
      ink: p.mint,
      soft: p.mintSoft,
      detail: "新领域标不起几万条句子：几十条样本下，模型能认类型却常常认不准边界。",
    },
    {
      name: "边界歧义",
      ink: p.amber,
      soft: p.amberSoft,
      detail: "实体从哪个字开始、到哪个字结束：「北京大学第三医院」是整体，还是机构加机构？标注指南必须逐条约定。",
    },
  ];

  problems.forEach((problem, index) => {
    const x = xOf(index % 2);
    const y = yOf(Math.floor(index / 2));
    body.push(rect({ x, y, w: cardW, h: cardH, r: 12, fill: p.card, stroke: p.border }));
    body.push(rect({ x, y, w: 4.5, h: cardH, r: 2.5, fill: problem.ink, stroke: "none" }));
    body.push(rect({ x: x + 18, y: y + 22, w: cardW - 36, h: 26, r: 7, fill: problem.soft, stroke: p.border }));
    body.push(text(problem.name, { x: x + 32, y: y + 35, size: 13, weight: 650, fill: problem.ink, align: "start" }));
    body.push(text(problem.detail, { x: x + 32, y: y + 61, size: 11.5, fill: p.inkSoft, align: "start", maxUnits: 62 }));
  });

  const noteY = yOf(3) + 6;
  body.push(rect({ x: 48, y: noteY, w: W - 96, h: 76, r: 12, fill: p.roseSoft, stroke: p.border }));
  body.push(text("这些问题被缓解了，但没有被解决", { x: 48 + 26, y: noteY + 22, size: 13, weight: 700, fill: p.rose, align: "start" }));
  body.push(
    text("预训练与大模型时代，边界与领域迁移的表现被大幅拉高，嵌套、不连续与标注噪声仍然要靠专门的标注形式或评测设计去处理。", {
      x: 48 + 26,
      y: noteY + 45,
      size: 11.5,
      fill: p.inkSoft,
      align: "start",
      maxUnits: 120,
    }),
  );
  body.push(
    text("另外，评测口径不一致（语料、类型集合、边界规则不同）会让改进看起来比实际更大——跨论文比数字之前，先比口径。", {
      x: 48 + 26,
      y: noteY + 64,
      size: 11.5,
      fill: p.inkSoft,
      align: "start",
      maxUnits: 120,
    }),
  );

  return build({
    width: W,
    height: noteY + 76,
    title: "NER 的六个未解难点",
    caption: "六个难点的共同点：它们都不是「模型不够大」，而是标注形式、领域假设与评测口径的问题。",
    body: body.join(""),
  });
}

export const ner = [
  { slug: "04-ner-type-system", svg: nerTypeSystem() },
  { slug: "04-ner-open-problems", svg: nerOpenProblems() },
];
