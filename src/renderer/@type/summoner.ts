export type SummonerStatusType = '온라인' | '오프라인';

export type SummonerType = {
  id: string;
  puuid: string;
  summonerId: number;
  displayName: string;
  profileImage: string;
  tier: string;
  statusMessage: string;
  summonerStats: SummonerStatsType;
  onlineFriendList: FriendType[];
  offlineFriendList: FriendType[];
  status: SummonerStatusType;
};

export type FriendType = {
  id: string;
  puuid: string;
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
  statsList: { championIcon: string; kda: string; isWin: boolean; killInvolvement: string }[];
};

export type SummonerRecordType = {
  displayName: string;
  profileImage: string;
  tier: string;
  statusMessage: string;
  summonerStats: SummonerStatsType;
  status: SummonerStatusType;
};

export type ChampionInfoType = {
  summonerId: number;
  championIcon: string;
  name: string;
  kda: string;
  damage: number;
  cs: number;
};
