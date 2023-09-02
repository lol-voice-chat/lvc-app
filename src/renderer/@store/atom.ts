import { SummonerType } from '../@type/summoner';
import { atom } from 'recoil';

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
