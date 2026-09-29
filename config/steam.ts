/** Steam showcase — static curated picks (no Web API key for v1). */
export type SteamGame = {
  name: string;
  /** Omit or 0 when playtime unknown from public profile. */
  hours?: number;
  appId: number;
  lastPlayed?: string;
  /** Portrait library capsule (anime-card style). */
  cover: string;
  storeUrl: string;
};

export type SteamConfig = {
  steamId64: string;
  profileUrl: string;
  displayName: string;
  avatar: string;
  level: number;
  gameCount: number;
  memberSince: string;
  favoriteGame: { name: string; hours: number; appId: number };
  /** Cover cards like bangumi (high playtime / favorites). */
  featured: SteamGame[];
};

function game(appId: number, name: string, hours?: number, lastPlayed?: string): SteamGame {
  return {
    name,
    hours,
    appId,
    lastPlayed,
    cover: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`,
    storeUrl: `https://store.steampowered.com/app/${appId}/`,
  };
}

// TODO: refresh hours from Steam Web API when library is public.
export const steam: SteamConfig = {
  steamId64: "76561199513348738",
  profileUrl: "https://steamcommunity.com/profiles/76561199513348738/",
  displayName: "ninja33",
  avatar: "https://avatars.akamai.steamstatic.com/de7aed4299406a52b01b0fc087ec5eb1d380b7e7_full.jpg",
  level: 18,
  gameCount: 68,
  memberSince: "June 9, 2023",
  favoriteGame: { name: "CHAOS;CHILD", hours: 36, appId: 970570 },
  featured: [
    game(970570, "CHAOS;CHILD", 36),
    game(1888160, "ARMORED CORE VI", 14.7),
    game(1384160, "GUILTY GEAR STRIVE"),
    game(1364780, "Street Fighter 6"),
    game(2627260, "NINJA GAIDEN 4"),
    game(3287520, "NINJA GAIDEN 2 Black"),
    game(1245620, "ELDEN RING"),
  ],
};
