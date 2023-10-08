import { BrowserWindow, WebContents, app, ipcMain, screen } from 'electron';
import { GlobalKeyboardListener } from 'node-global-key-listener';
import { IPC_KEY } from '../../const/index';
import { store } from '../store';

let lvcOverlayWindow: BrowserWindow;
const globalKey = new GlobalKeyboardListener();

export const createOverlayWindow = (mainWIndowWebContents: WebContents) => {
  const { width: screen_width, height: screen_height } = screen.getPrimaryDisplay().workAreaSize;
  const vw = Math.floor(screen_width / 100);
  const vh = Math.floor(screen_height / 100);

  lvcOverlayWindow = new BrowserWindow({
    width: Math.floor(vw * 4.3),
    height: Math.floor(vw * 20),
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

    // maximizable: false,
    fullscreenable: false,
    alwaysOnTop: true,
    x: Math.floor(vw * 1),
    y: Math.floor(vh * 25),
  });

  lvcOverlayWindow.setAlwaysOnTop(true, process.platform === 'darwin' ? 'floating' : 'normal');
  lvcOverlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  lvcOverlayWindow.loadURL('http://localhost:3000/#/lvc-overlay');

  lvcOverlayWindow.once('ready-to-show', () => {
    lvcOverlayWindow.show();
    app.dock.show();
  });

  const handleChangeMuteMicSummoner = () => {
    mainWIndowWebContents.send(IPC_KEY.SUMMONER_MUTE);
    lvcOverlayWindow.webContents.send(IPC_KEY.SUMMONER_MUTE);
  };

  let isPressingKey = false;

  globalKey.addListener((e) => {
    let settingsConfig = store.get('general-settings-config') as any;

    if (settingsConfig) {
      const { isPressToTalk, pressToTalkShortcutKey, muteMicShortcutKey } = settingsConfig;

      /* 눌러서 말하기 off - default */
      if (!isPressToTalk && e.name === muteMicShortcutKey && e.state === 'DOWN') {
        mainWIndowWebContents.send(IPC_KEY.SUMMONER_MUTE);
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

  ipcMain.on(IPC_KEY.SUMMONER_VISUALIZER, (_, value) => {
    lvcOverlayWindow.webContents.send(IPC_KEY.SUMMONER_VISUALIZER, value);
  });

  ipcMain.on(IPC_KEY.OVERLAY_SUMMONER, (_, summoner) => {
    lvcOverlayWindow.webContents.send(IPC_KEY.OVERLAY_SUMMONER, summoner);
  });

  ipcMain.on(IPC_KEY.OVERLAY_MY_TEAM_SUMMONERS, (_, summonerList) => {
    lvcOverlayWindow.webContents.send(IPC_KEY.OVERLAY_MY_TEAM_SUMMONERS, summonerList);
  });
};

export const closeOverlay = () => {
  lvcOverlayWindow.close();
};
