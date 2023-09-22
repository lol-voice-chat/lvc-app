export type SummonerType = {
  id: string;
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
  id: string;
  profileImage: string;
  displayName: string;
  status: string;
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

export type ChampionInfoType = {
  summonerId: number;
  championIcon: string;
  name: string;
  kda: string;
  damage: number;
  cs: number;
};

export type SummonerRecordType = {
  displayName: string;
  profileImage: string;
  tier: string;
  statusMessage: string;
  summonerStats: SummonerStatsType;
};
