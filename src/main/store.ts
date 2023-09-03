import { ipcMain } from 'electron';
import { STORE_KEY } from '../const';

import Store from 'electron-store';

const store = new Store();

const onElectronStore = () => {
  ipcMain.handle(STORE_KEY.TEAM_VOICE_ROOM_NAME + 'get', () => {
    return store.get(STORE_KEY.TEAM_VOICE_ROOM_NAME);
  });
  ipcMain.on(STORE_KEY.TEAM_VOICE_ROOM_NAME + 'set', (_, { setValue }) => {
    store.set(STORE_KEY.TEAM_VOICE_ROOM_NAME, setValue);
  });

  ipcMain.handle(STORE_KEY.LEAGUE_VOICE_ROOM_NAME + 'get', () => {
    return store.get(STORE_KEY.LEAGUE_VOICE_ROOM_NAME);
  });
  ipcMain.on(STORE_KEY.LEAGUE_VOICE_ROOM_NAME + 'set', (_, { setValue }) => {
    store.set(STORE_KEY.LEAGUE_VOICE_ROOM_NAME, setValue);
  });
};

export default onElectronStore;
