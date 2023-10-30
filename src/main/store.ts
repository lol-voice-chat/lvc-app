import { ipcMain } from 'electron';
import Store from 'electron-store';

export const store = new Store();

const onElectronStore = () => {
  ipcMain.handle('electron-store-get', (_, { key }) => {
    return store.get(key);
  });

  ipcMain.on('electron-store-set', (_, { key, setValue }) => {
    store.set(key, setValue);
  });
};

export default onElectronStore;
