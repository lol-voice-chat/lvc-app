const { ipcRenderer } = window.require('electron');

const electronStore = {
  get: async (key: string, ...defaultValue: any) => {
    return await ipcRenderer.invoke('electron-store-get', { key, defaultValue });
  },
  set: (key: string, setValue: any) => {
    ipcRenderer.send('electron-store-set', { key, setValue });
  },
};

export default electronStore;
