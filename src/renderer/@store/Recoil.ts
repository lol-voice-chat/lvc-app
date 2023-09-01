import { SummonerType } from '../@type/summoner';
import { atom } from 'recoil';

export const voiceChatInfoState = atom<{ teamRoomName: string | null }>({
  key: 'voiceChatInfo',
  default: { teamRoomName: null },
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
