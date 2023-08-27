import { SummonerType } from '../@type/summoner';
import { atom } from 'recoil';

export const voiceChatInfoState = atom<{ roomName: string | null }>({
  key: 'voiceChatInfo',
  default: { roomName: null },
});

export const summonerState = atom<SummonerType | null>({
  key: 'summoner',
  default: null,
});

export const myTeamSummonersState = atom<SummonerType[] | []>({
  key: 'myTeamSummoners',
  default: [],
});
