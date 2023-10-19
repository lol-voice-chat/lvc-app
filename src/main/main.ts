import { app, BrowserWindow, ipcMain } from 'electron';
import onElectronStore, { store } from './store';
import { generalSettingsDefaultConfig, IPC_KEY } from '../const';
import { LvcApplication } from './lvc-application';
import { resolvePath } from './lib/common';
import handleGlobalKeyEvent from './event/global-key-event';
import handleFetchMatchHistoryEvent from './event/fetch-match-history';
import * as client from './lib/redis-client';

let mainWindow: BrowserWindow;

const isDifferentGeneralSetting =
  Object.keys(store.get('general-settings-config') ?? {}).length !==
  Object.keys(generalSettingsDefaultConfig).length;

if (!store.has('general-settings-config') || isDifferentGeneralSetting) {
  store.set('general-settings-config', generalSettingsDefaultConfig);
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    minWidth: 1300,
    minHeight: 800,
    width: 1400,
    height: 850,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: false,
    backgroundColor: '#313338',
    frame: false,
    autoHideMenuBar: true,
  });

  mainWindow.loadURL(resolvePath());

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  handleGlobalKeyEvent(mainWindow);
  handleFetchMatchHistoryEvent();
  handleLoadEvent();
};

async function handleLoadEvent() {
  mainWindow.webContents.on('did-finish-load', async () => {
    client.connect();
    const app = new LvcApplication(mainWindow.webContents);

    app.initialize().then(() => {
      app.handle();
    });
  });
}

ipcMain.on(IPC_KEY.CLICK_SUMMONER_PROFILE, (_, summonerData) => {
  mainWindow.webContents.send(IPC_KEY.CLICK_SUMMONER_PROFILE, summonerData);
});

ipcMain.on(IPC_KEY.QUIT_APP, () => {
  app.quit();
});

ipcMain.on(IPC_KEY.CLOSE_APP, () => {
  mainWindow.minimize();
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});

onElectronStore();
