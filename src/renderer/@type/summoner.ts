export type SummonerType = {
  summonerId: number;
  displayName: string;
  profileImage: string;
};

export type SummonerStatsType = {
  odds: number;
  winCount: number;
  failCount: number;
  summonerStatsList: { championIcon: string; kda: string; isVictory: boolean }[];
};

export type ChampionInfoType = {
  championIcon: string;
  name: string;
  kda: string;
  totalDamage: number;
  totalMinionsKilled: number;
};
