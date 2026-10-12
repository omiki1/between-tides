/** 绝区零官方立绘（透明 WebP，© HoYoverse），文件在 public/art/zzz/，来源见同目录 SOURCES.md。 */
export const ZZZ_CREDIT = "角色立绘 © HoYoverse";
export const ZZZ_BANNER = {
  burnice: { w: 1199, h: 581 },
  claret: { w: 1174, h: 671 },
} as const;
export const ZZZ_FULL = {
  burnice: { w: 781, h: 1205 },
  claret: { w: 951, h: 1355 },
} as const;
export type ZzzName = keyof typeof ZZZ_BANNER;
