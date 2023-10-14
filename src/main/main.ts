import { app, BrowserWindow, ipcMain } from 'electron';
import onElectronStore, { store } from './store';
import { generalSettingsDefaultConfig, IPC_KEY } from '../const';
import { GlobalKeyboardListener } from 'node-global-key-listener';
import { LvcApplication } from './lvc-application';
import isDev from 'electron-is-dev';
import path from 'path';
import { RedisClient } from './lib/redis-client';
import { GeneralSettingsConfigType } from '../renderer/@store/atom';

const globalKey = new GlobalKeyboardListener();
let mainWindow: BrowserWindow;
const redisClient = new RedisClient();

if (
  !store.has('general-settings-config') ||
  Object.keys(store.get('general-settings-config') ?? {}).length !==
    Object.keys(generalSettingsDefaultConfig).length
) {
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
    frame: false,
    autoHideMenuBar: true,
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.resolve(__dirname, '../renderer/', 'index.html')}`
  );

  handleLoadEvent();
};

async function handleLoadEvent() {
  mainWindow.webContents.on('did-finish-load', async () => {
    const app = new LvcApplication(mainWindow.webContents, redisClient);

    app.initialize().then(() => {
      app.handle();
    });
  });
}

ipcMain.on(IPC_KEY.INPUT_SHORTCUT_KEY, () => {
  const calledOnce = (e: any) => {
    if (e.state === 'DOWN') {
      mainWindow.webContents.send(IPC_KEY.INPUT_SHORTCUT_KEY, e.name);
      globalKey.removeListener(calledOnce);
    }
  };
  globalKey.addListener(calledOnce);
});

ipcMain.on(IPC_KEY.QUIT_APP, () => {
  app.quit();
});

ipcMain.on(IPC_KEY.CLOSE_APP, () => {
  mainWindow.minimize();
});

let isPressingKey = false;

globalKey.addListener((e) => {
  let settingsConfig = store.get('general-settings-config') as GeneralSettingsConfigType;

  if (settingsConfig) {
    const { isPressToTalk, pressToTalkShortcutKey, muteMicShortcutKey } = settingsConfig;

    /* 눌러서 말하기 off - default */
    if (!isPressToTalk && e.name === muteMicShortcutKey && e.state === 'DOWN') {
      mainWindow.webContents.send(IPC_KEY.SUMMONER_MUTE);
    }
    /* 눌러서 말하기 on */
    if (isPressToTalk && e.name === pressToTalkShortcutKey) {
      if (!isPressingKey && e.state === 'DOWN') {
        mainWindow.webContents.send(IPC_KEY.SUMMONER_MUTE);
        isPressingKey = true;
      }
      if (e.state === 'UP') {
        mainWindow.webContents.send(IPC_KEY.SUMMONER_MUTE);
        isPressingKey = false;
      }
    }
  }
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
