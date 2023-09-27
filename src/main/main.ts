import { app, BrowserWindow } from 'electron';
import { LeagueHandler } from './league/LeagueHandler';
import { onLeagueClientUx } from './league/onLeagueClientUx';
import onElectronStore from './store';
import { createWebSocketConnection } from 'league-connect';
import { handleFriendStatsEvent } from './league/summonerStatsEvent';
import League from './utils';

let mainWindow: BrowserWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 850,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL('http://localhost:3000');

  handleLoadEvent();
};

async function handleLoadEvent() {
  mainWindow.webContents.on('did-finish-load', async () => {
    await League.initialize(mainWindow);

    const { summonerInfo, matchHistory, gameflow } = await onLeagueClientUx();
    mainWindow.webContents.send('on-league-client', summonerInfo);

    const ws = await createWebSocketConnection();

    const leagueHandler: LeagueHandler = new LeagueHandler(
      mainWindow.webContents,
      ws,
      summonerInfo
    );
    await leagueHandler.handle(gameflow, matchHistory);
  });
}

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

handleFriendStatsEvent();
onElectronStore();
