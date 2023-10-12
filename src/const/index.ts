import { GeneralSettingsConfigType } from '../renderer/@store/atom';

export const IPC_KEY = {
  ON_LEAGUE_CLIENT: 'on-league-client',
  TEAM_JOIN_ROOM: 'team-join-room',
  LEAGUE_JOIN_ROOM: 'league-join-room',
  EXIT_CHAMP_SELECT: 'exit-champ-select',
  EXIT_IN_GAME: 'exit-in-game',
  START_IN_GAME: 'start-in-game',
  CHAMP_INFO: 'champion-info',
  SHUTDOWN_APP: 'shutdown-app',
  SUMMONER_MUTE: 'summoner-mute',
  INPUT_SHORTCUT_KEY: 'input-shortcut-key',
};

export const generalSettingsDefaultConfig = {
  isPressToTalk: false,
  pressToTalkShortcutKey: 'M',
  muteMicShortcutKey: 'M',
  micVolume: 100,
  speakerVolume: 100,
} as GeneralSettingsConfigType;
