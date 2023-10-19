import { GeneralSettingsConfigType } from '../renderer/@store/atom';

export const IPC_KEY = {
  QUIT_APP: 'quit-app',
  CLOSE_APP: 'close-app',
  SHUTDOWN_APP: 'shutdown-lol',

  ON_LEAGUE_CLIENT: 'on-league-client',
  RECENT_SUMMONER: 'recent-summoner',
  TEAM_JOIN_ROOM: 'team-join-room',
  LEAGUE_JOIN_ROOM: 'league-join-room',
  EXIT_CHAMP_SELECT: 'exit-champ-select',
  EXIT_IN_GAME: 'exit-in-game',
  END_OF_THE_GAME: 'end-of-the-game',
  START_IN_GAME: 'start-in-game',
  CHAMP_INFO: 'champion-info',
  SUMMONER_MUTE: 'summoner-mute',
  INPUT_SHORTCUT_KEY: 'input-shortcut-key',
  FETCH_MATCH_HISTORY: 'fetch-match-history',
  UPDATE_MATCH_HISTORY: 'update-match-history',
  CLICK_SUMMONER_PROFILE: 'click-summoner-profile',
  SETTINGS_SHORTCUT_KEY: 'settings-shortcut-key',
};

export const generalSettingsDefaultConfig = {
  isPressToTalk: false,
  pressToTalkShortcutKey: 'M',
  muteMicShortcutKey: 'M',
  micVolume: 100,
  speakerVolume: 100,
} as GeneralSettingsConfigType;
