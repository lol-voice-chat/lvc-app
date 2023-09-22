export type SummonerType = {
  summonerId: number;
  displayName: string;
  profileImage: string;
  tier: string;
  statusMessage: string;
  summonerStats: SummonerStatsType;
  friendProfileList: FriendProfileType[];
  status: string;
};

export type FriendProfileType = {
  puuid: string;
  summonerId: number;
  profileImage: string;
  displayName: string;
  status: string;
};

type SummonerStatsType = {
  odds: number;
  winCount: number;
  failCount: number;
  statsList: { championIcon: string; kda: string; isWin: boolean }[];
};

export type ChampionInfoType = {
  summonerId: number;
  championIcon: string;
  name: string;
  kda: string;
  totalDamage: number;
  cs: number;
};
