export type SummonerStatusType = '온라인' | '오프라인';

export type SummonerType = {
  puuid: string;
  summonerId: number;
  displayName: string;
  profileImage: string;
  tier: string;
  summonerStats: SummonerStatsType;
};

export type RecentSummonerType = {
  puuid: string;
  summonerId: number;
  profileImage: string;
  displayName: string;
};

export type SummonerStatsType = {
  kda: string;
  damage: string;
  cs: string;
  mostChampionList: string[];
  odds: number;
  winCount: number;
  failCount: number;
  statsList: {
    championIcon: string;
    kda: string;
    isWin: boolean;
    time: string;
    killInvolvement: string;
  }[];
};

export type SummonerRecordType = {
  displayName: string;
  profileImage: string;
  tier: string;
  summonerStats: SummonerStatsType;
};

export type ChampionInfoType = {
  summonerId: number;
  championIcon: string;
  name: string;
  kda: string;
  damage: number;
  cs: number;
};
