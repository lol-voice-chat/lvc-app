const { ipcRenderer } = window.require('electron');

const electronStore = {
  get: async (key: string) => {
    return await ipcRenderer.invoke('electron-store-get', { key });
  },
  set: (key: string, setValue: any) => {
    ipcRenderer.send('electron-store-set', { key, setValue });
  },
};

export default electronStore;
