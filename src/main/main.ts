import { app, BrowserWindow, ipcMain } from 'electron';
import onElectronStore, { store } from './store';
import { generalSettingsDefaultConfig, IPC_KEY } from '../const';
import { GlobalKeyboardListener } from 'node-global-key-listener';
import { LvcApplication } from './lvc-application';
import isDev from 'electron-is-dev';
import path from 'path';
import { RedisClient } from './lib/redis-client';

const globalKey = new GlobalKeyboardListener();
let mainWindow: BrowserWindow;
const redisClient = new RedisClient();

if (!store.has('general-settings-config')) {
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
