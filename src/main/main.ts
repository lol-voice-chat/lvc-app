import { app, BrowserWindow, ipcMain } from 'electron';
import onElectronStore, { store } from './store';
import { generalSettingsDefaultConfig, IPC_KEY } from '../const';
import { LvcApplication } from './league/LvcApplication';
import { authenticate, createWebSocketConnection } from 'league-connect';
import path from 'path';
import isDev from 'electron-is-dev';
import { GlobalKeyboardListener } from 'node-global-key-listener';

const globalKey = new GlobalKeyboardListener();
let mainWindow: BrowserWindow;

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

  if (!store.has('general-settings-config')) {
    store.set('general-settings-config', generalSettingsDefaultConfig);
  }

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../build/index.html'));
  }

  handleLoadEvent();
};

async function handleLoadEvent() {
  mainWindow.webContents.on('did-finish-load', async () => {
    const { credentials, ws } = await onLeagueClientUx();
    const app = new LvcApplication(mainWindow.webContents, credentials, ws);

    app.initialize().then(() => {
      app.handle();
    });
  });
}

async function onLeagueClientUx() {
  const [credentials, ws] = await Promise.all([
    authenticate({
      awaitConnection: true,
    }),
    createWebSocketConnection({
      authenticationOptions: {
        awaitConnection: true,
      },
    }),
  ]);

  return { credentials, ws };
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
