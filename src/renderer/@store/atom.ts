import { Socket } from 'socket.io-client';
import { SummonerStatsType, SummonerType } from '../@type/summoner';
import { atom } from 'recoil';

export const teamSocketState = atom<Socket | null>({
  key: 'teamSocket',
  default: null,
});

export const userStreamState = atom<MediaStream | null>({
  key: 'userStream',
  default: null,
});

type GameStatus = 'none' | 'champ-select' | 'loading' | 'in-game';

export const gameStatusState = atom<GameStatus>({
  key: 'gameStatus',
  default: 'none',
});

export const summonerState = atom<(SummonerType & SummonerStatsType) | null>({
  key: 'summoner',
  default: null,
});

export const myTeamSummonersState = atom<(SummonerType & SummonerStatsType)[] | null>({
  key: 'myTeamSummoners',
  default: null,
});

export const enemySummonersState = atom<SummonerType[] | null>({
  key: 'enemySummoners',
  default: null,
});
