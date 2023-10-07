import { SummonerType } from '../@type/summoner';
import { atom } from 'recoil';
import { generalSettingsDefaultConfig } from '../components/general-setting-modal';

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

export const userStreamState = atom<MediaStream | null>({
  key: 'user-stream',
  default: null,
});

export type GeneralSettingsConfigType = {
  isPressToTalk: boolean;
  pressToTalkShortcutKey: string;
  muteMicShortcutKey: string;
};
export const generalSettingsConfigState = atom<GeneralSettingsConfigType>({
  key: 'general-settings-config',
  default: generalSettingsDefaultConfig,
});
