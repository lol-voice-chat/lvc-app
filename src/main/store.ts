import { ipcMain } from 'electron';

import Store from 'electron-store';
import { STORE_KEY } from '../const';

const store = new Store();

const STORE_KEY_LIST = [STORE_KEY.TEAM_VOICE_ROOM_NAME, STORE_KEY.LEAGUE_VOICE_ROOM_NAME];

const onElectronStore = () => {
  STORE_KEY_LIST.map((storeKey) => {
    ipcMain.handle(storeKey + 'get', () => {
      return store.get(storeKey);
    });
    ipcMain.on(storeKey + 'set', (_, { setValue }) => {
      store.set(storeKey, setValue);
    });
  });
};

export default onElectronStore;
