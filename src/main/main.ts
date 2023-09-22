import { app, BrowserWindow } from 'electron';
import { LeagueHandler } from './league/LeagueHandler.v2';
import { onLeagueClientUx } from './league/league-client';
import onElectronStore from './store';
import { createWebSocketConnection } from 'league-connect';
import league from './utils/league';
import { LCU_ENDPOINT } from './constants';

let mainWindow: BrowserWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1350,
    height: 800,
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
    const { summoner, matchHistory } = await onLeagueClientUx();
    mainWindow.webContents.send('on-league-client', summoner);

    const [ws, gameflow] = await Promise.all([
      createWebSocketConnection(),
      league(LCU_ENDPOINT.GAMEFLOW_URL),
    ]);

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

onElectronStore();
