import { app, BrowserWindow, screen, ipcMain } from 'electron';
import onElectronStore, { store } from './store';
import { GlobalKeyboardListener } from 'node-global-key-listener';
import { IPC_KEY } from '../const';
import { LvcApplication } from './league/LvcApplication';
import { authenticate, createWebSocketConnection } from 'league-connect';

const globalKey = new GlobalKeyboardListener();

let mainWindow: BrowserWindow;
let lvcOverlayWindow: BrowserWindow;

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
    show: false,
    autoHideMenuBar: true,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
  mainWindow.loadURL('http://localhost:3000');
  handleLoadEvent();
};

const createOverlayWindow = () => {
  const { width: screen_width, height: screen_height } = screen.getPrimaryDisplay().workAreaSize;
  const vw = Math.floor(screen_width / 100);

  lvcOverlayWindow = new BrowserWindow({
    width: vw * 4.5,
    height: vw * 20,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    frame: false,
    resizable: false,
    autoHideMenuBar: true,
    transparent: true,
    skipTaskbar: true,
    hasShadow: false,
    show: false,
    x: 15,
    y: 170,
  });

  // lvcOverlayWindow.setIgnoreMouseEvents(true, { forward: true });
  lvcOverlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  lvcOverlayWindow.setAlwaysOnTop(true, process.platform === 'darwin' ? 'floating' : 'normal');

  lvcOverlayWindow.loadURL('http://localhost:3000/#/lvc-overlay');

  lvcOverlayWindow.once('ready-to-show', () => {
    lvcOverlayWindow.show();
    app.dock.show();
  });
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

ipcMain.on(IPC_KEY.SUMMONER_VISUALIZER, (_, value) => {
  lvcOverlayWindow.webContents.send(IPC_KEY.SUMMONER_VISUALIZER, value);
});

ipcMain.on(IPC_KEY.OVERLAY_SUMMONER, (_, summoner) => {
  lvcOverlayWindow.webContents.send(IPC_KEY.OVERLAY_SUMMONER, summoner);
});

ipcMain.on(IPC_KEY.OVERLAY_MY_TEAM_SUMMONERS, (_, summonerList) => {
  lvcOverlayWindow.webContents.send(IPC_KEY.OVERLAY_MY_TEAM_SUMMONERS, summonerList);
});

app.whenReady().then(() => {
  createWindow();
  createOverlayWindow();

  const handleChangeMuteMicSummoner = () => {
    mainWindow.webContents.send(IPC_KEY.SUMMONER_MUTE);
    lvcOverlayWindow.webContents.send(IPC_KEY.SUMMONER_MUTE);
  };

  let isPressingKey = false;

  globalKey.addListener((e) => {
    const settingsConfig = store.get('general-settings-config') as any;

    if (settingsConfig) {
      const { isPressToTalk, pressToTalkShortcutKey, muteMicShortcutKey } = settingsConfig;

      /* 눌러서 말하기 off - default */
      if (!isPressToTalk && e.name === muteMicShortcutKey && e.state === 'DOWN') {
        mainWindow.webContents.send(IPC_KEY.SUMMONER_MUTE);
        lvcOverlayWindow.webContents.send(IPC_KEY.SUMMONER_MUTE);
      }
      // 눌러서 말하기 on
      if (isPressToTalk && e.name === pressToTalkShortcutKey) {
        if (!isPressingKey && e.state === 'DOWN') {
          handleChangeMuteMicSummoner();
          isPressingKey = true;
        }
        if (e.state === 'UP') {
          handleChangeMuteMicSummoner();
          isPressingKey = false;
        }
      }
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      createOverlayWindow();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});

onElectronStore();
