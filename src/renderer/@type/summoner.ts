export type SummonerStatusType = '온라인' | '오프라인';

export type SummonerType = {
  id: string;
  pid: string;
  puuid: string;
  summonerId: number;
  gameName: string;
  gameTag: string;
  name: string;
  profileImage: string;
  tier: string;
  summonerStats: SummonerStatsType;
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

export type ChampionInfoType = {
  summonerId: number;
  championIcon: string | null;
  name: string | null;
  kda: string | null;
  damage: string | null;
  cs: string | null;
  playCount: string | null;
};
