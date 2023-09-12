export type SummonerType = {
  summonerId: number;
  displayName: string;
  profileImage: string;
  tier: string;
  statusMessage: string;
};

export type SummonerStatsType = {
  odds: number;
  winCount: number;
  failCount: number;
  statsList: { championIcon: string; kda: string; isWin: boolean }[];
};

export type ChampionInfoType = {
  championIcon: string;
  name: string;
  kda: string;
  totalDamage: number;
  totalMinionsKilled: number;
};
