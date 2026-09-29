/** Friend links — add more entries anytime. */
export type FriendLink = {
  id: string;
  name: string;
  url: string;
  description: string;
  avatar: string;
  /** Optional badge, e.g. Steam / Blog */
  tag?: string;
};

export const friends: FriendLink[] = [
  {
    id: "steam-ninja33",
    name: "ninja33",
    url: "https://steamcommunity.com/profiles/76561199513348738/",
    description: "Steam 主页",
    avatar: "https://avatars.akamai.steamstatic.com/de7aed4299406a52b01b0fc087ec5eb1d380b7e7_full.jpg",
    tag: "Steam",
  },
];
