/** 官方角色立绘（透明 WebP，© Kuro Games）。原图与 600 宽版本都在 public/art/characters/，来源见同目录 SOURCES.md。 */
export const CHARACTER_ART = {
  "denia-01": { w: 1069, h: 1160, who: "达妮娅" },
  "denia-02": { w: 1012, h: 1315, who: "达妮娅" },
  "denia-03": { w: 800, h: 800, who: "达妮娅" },
  "denia-04": { w: 877, h: 931, who: "达妮娅" },
  "denia-05": { w: 820, h: 870, who: "达妮娅" },
  "aemeath-01": { w: 971, h: 1159, who: "爱弥斯" },
  "aemeath-02": { w: 800, h: 800, who: "爱弥斯" },
  "aemeath-03": { w: 1080, h: 1760, who: "爱弥斯" },
  "aemeath-04": { w: 852, h: 708, who: "爱弥斯" },
  "aemeath-05": { w: 1139, h: 868, who: "爱弥斯" },
} as const;
export type CharacterArtName = keyof typeof CHARACTER_ART;
export const CHARACTER_ART_CREDIT = "角色立绘 © Kuro Games";
