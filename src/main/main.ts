import { app, BrowserWindow } from 'electron';
import { LeagueHandler } from './league/LeagueHandler';
import { onLeagueClientUx } from './league/league-client';
import onElectronStore from './store';
import { createWebSocketConnection } from 'league-connect';
import { friendStatsEvent } from './league/friend-stats';
import { IPC_KEY } from '../const';

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

function handleLoadEvent() {
  mainWindow.webContents.on('did-finish-load', async () => {
    const { summoner, matchHistory, gameflow } = await onLeagueClientUx();
    mainWindow.webContents.send('on-league-client', summoner);

    const ws = await createWebSocketConnection();

    const leagueHandler: LeagueHandler = new LeagueHandler(mainWindow.webContents, ws, summoner);
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

friendStatsEvent.emit(IPC_KEY.FRIEND_STATS);
onElectronStore();
