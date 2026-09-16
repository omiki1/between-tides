import data from "@/data/bangumi.json";

export type BangumiItem = {
  id: number;
  seasonId: number;
  title: string;
  cover: string;
  seasonType: number;
  seasonTypeName: string;
  rating: number;
  evaluate: string;
  followStatus: number;
  epStatus: string;
  areas: string[];
  link: string;
};

export const followLabels: Record<number, string> = {
  1: "想看",
  2: "在看",
  3: "看过",
};

export const bangumi = data as {
  uid: string;
  space: string;
  fetchedAt: string;
  animeTotal: number;
  dramaTotal: number;
  items: BangumiItem[];
};

export function getBangumi(): BangumiItem[] {
  return bangumi.items;
}

export function getBangumiStats() {
  const items = bangumi.items;
  const rated = items.filter((item) => item.rating > 0);
  const average =
    rated.length > 0
      ? (rated.reduce((sum, item) => sum + item.rating, 0) / rated.length).toFixed(1)
      : "0.0";
  const types = new Map<string, number>();
  const follows = new Map<string, number>();
  for (const item of items) {
    types.set(item.seasonTypeName, (types.get(item.seasonTypeName) ?? 0) + 1);
    const label = followLabels[item.followStatus] ?? "在看";
    follows.set(label, (follows.get(label) ?? 0) + 1);
  }
  return {
    total: items.length,
    average,
    types: [...types].sort((a, b) => b[1] - a[1]),
    follows: [...follows],
    watching: follows.get("在看") ?? 0,
    watched: follows.get("看过") ?? 0,
    uid: bangumi.uid,
    space: bangumi.space,
    fetchedAt: bangumi.fetchedAt,
  };
}
