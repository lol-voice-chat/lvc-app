import { SummonerType } from '../@type/summoner';
import { atom } from 'recoil';

export const userStreamState = atom<MediaStream | null>({
  key: 'userStream',
  default: null,
});

type GameStatus = 'none' | 'champ-select' | 'loading' | 'in-game';

export const gameStatusState = atom<GameStatus>({
  key: 'gameStatus',
  default: 'none',
});

export const summonerState = atom<SummonerType | null>({
  key: 'summoner',
  default: null,
});

export const myTeamSummonersState = atom<SummonerType[] | null>({
  key: 'myTeamSummoners',
  default: null,
});

export const enemySummonersState = atom<SummonerType[] | null>({
  key: 'enemySummoners',
  default: null,
});

export type SummonerInfoType = { summonerId: number; championIcon: string; kda: string };
export const summonerInfoListState = atom<SummonerInfoType[] | null>({
  key: 'summonerInfoList',
  default: null,
});

export type LeagueTitleType = { summonerId: number; title: string; description: string };
export const leagueTitleListState = atom<LeagueTitleType[] | null>({
  key: 'leagueTitle',
  default: null,
});
