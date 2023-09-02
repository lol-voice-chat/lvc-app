import { SummonerType } from '../@type/summoner';
import { atom } from 'recoil';

type GameStatus = 'none' | 'champ-select' | 'loading' | 'in-game';

type VoiceChatInfoType = {
  team: { roomName: string | null };
  league: { roomName: string | null; teamName: string | null };
};

export const gameStatusState = atom<GameStatus>({
  key: 'gameStatus',
  default: 'none',
});

export const voiceChatInfoState = atom<VoiceChatInfoType>({
  key: 'voiceChatInfo',
  default: { team: { roomName: null }, league: { roomName: null, teamName: null } },
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
