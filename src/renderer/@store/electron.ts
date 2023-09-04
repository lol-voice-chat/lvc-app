const { ipcRenderer } = window.require('electron');

const electronStore = {
  get: async (key: string) => {
    return await ipcRenderer.invoke(key + 'get');
  },
  set: (key: string, setValue: any) => {
    ipcRenderer.send(key + 'set', { setValue: setValue });
  },
};

export default electronStore;
