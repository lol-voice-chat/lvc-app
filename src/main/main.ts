import { app, BrowserWindow, screen } from 'electron';
import { LeagueHandler } from './league/LeagueHandler';
import { onLeagueClientUx } from './league/onLeagueClientUx';
import onElectronStore from './store';
import { handleFriendRequest } from './league/handleFriendRequest';
import League from './utils';
import { GlobalKeyboardListener } from 'node-global-key-listener';
import { IPC_KEY } from '../const';

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

  lvcOverlayWindow.setIgnoreMouseEvents(true, { forward: true });
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
    await League.initialize(mainWindow);

    const { summonerInfo, matchHistory, gameflow } = await onLeagueClientUx();
    mainWindow.webContents.send('on-league-client', summonerInfo);

    const friendList = await League.httpRequest('/lol-chat/v1/friends');
    const friendSummonerIdList = friendList.map((friend: any) => friend.summonerId);
    mainWindow.webContents.send('online-summoner', friendSummonerIdList);

    const leagueHandler: LeagueHandler = new LeagueHandler(mainWindow.webContents, summonerInfo);
    await leagueHandler.handle(gameflow, matchHistory);
  });
}

app.whenReady().then(() => {
  createWindow();
  createOverlayWindow();

  globalKey.addListener((e) => {
    if (e.name === 'M' && e.state === 'DOWN') {
      mainWindow.webContents.send(IPC_KEY.SUMMONER_MUTE);
      lvcOverlayWindow.webContents.send(IPC_KEY.SUMMONER_MUTE);
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

handleFriendRequest();
onElectronStore();
