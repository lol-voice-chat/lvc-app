import { SummonerType } from '../@type/summoner';
import { atom } from 'recoil';

export const userStreamState = atom<MediaStream | null>({
  key: 'user-stream',
  default: null,
});

type GameStatus = 'none' | 'champ-select' | 'loading' | 'in-game';

export const gameStatusState = atom<GameStatus>({
  key: 'game-status',
  default: 'none',
});

export const summonerState = atom<SummonerType | null>({
  key: 'summoner',
  default: null,
});

export const myTeamSummonersState = atom<SummonerType[] | null>({
  key: 'my-team-summoners',
  default: null,
});

export const enemySummonersState = atom<SummonerType[] | null>({
  key: 'enemy-summoners',
  default: null,
});
