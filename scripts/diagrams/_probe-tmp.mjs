import * as mod from "./05-relation-extraction.mjs";

/** 粗略校验：所有图元与文字是否落在正文区内，以及底部余量。 */
for (const { slug, svg } of mod.relationExtraction) {
  const meta = JSON.parse(/<metadata>([^<]+)<\/metadata>/.exec(svg)[1]);
  const bodyBottom = meta.bodyBottom - meta.bodyTop;
  const body = svg.slice(svg.indexOf("<g transform=") , svg.indexOf("</g>"));

  const rects = [...body.matchAll(/<rect x="(-?[\d.]+)" y="(-?[\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)].map((m) => ({
    x: +m[1],
    y: +m[2],
    w: +m[3],
    h: +m[4],
  }));
  const texts = [...body.matchAll(/<text x="(-?[\d.]+)" y="(-?[\d.]+)"[^>]*font-size="([\d.]+)"[^>]*text-anchor="(\w+)"[^>]*>([^<]*)<\/text>/g)].map((m) => ({
    x: +m[1],
    y: +m[2],
    size: +m[3],
    anchor: m[4],
    value: m[5],
  }));

  const units = (v) => [...v].reduce((n, c) => n + (/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(c) ? 1 : 0.55), 0);

  console.log(`\n=== ${slug}  正文区 0..${bodyBottom}  画布 ${meta.total}`);
  const maxTextY = Math.max(...texts.map((t) => t.y));
  const minTextY = Math.min(...texts.map((t) => t.y));
  const maxRectBottom = Math.max(...rects.map((r) => r.y + r.h));
  const minY = Math.min(minTextY, Math.min(...rects.map((r) => r.y)));
  console.log(`  文字 y: ${minTextY.toFixed(1)} .. ${maxTextY.toFixed(1)}`);
  console.log(`  图元底部最大 y: ${maxRectBottom.toFixed(1)}  （须 <= ${bodyBottom}，且与画布留白 ${(bodyBottom - maxRectBottom).toFixed(1)}）`);
  console.log(`  顶部最小 y: ${minY.toFixed(1)}（须 >= 6）`);

  const overflow = texts.filter((t) => {
    const w = units(t.value) * t.size * 0.62;
    const left = t.anchor === "middle" ? t.x - w / 2 : t.anchor === "end" ? t.x - w : t.x;
    return left < 4 || left + w > meta.width - 4;
  });
  console.log(`  横向溢出文字: ${overflow.length}`);
  const bad = texts.filter((t) => t.y < 6 || t.y > bodyBottom - 2);
  console.log(`  纵向越界文字: ${bad.length}${bad.length ? " -> " + JSON.stringify(bad.map((b) => b.value)) : ""}`);
}
