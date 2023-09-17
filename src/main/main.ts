import { app, BrowserWindow } from 'electron';
import { LeagueHandler } from './league/LeagueHandler.v2';
import { onLeagueClientUx } from './league/onLeagueClientUx';
import onElectronStore from './store';
import { LeagueWebSocket, createWebSocketConnection } from 'league-connect';

let mainWindow: BrowserWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1346,
    height: 779,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL('http://localhost:3000');

  mainWindow.webContents.on('did-finish-load', async () => {
    const { summoner, matchHistory, phase } = await onLeagueClientUx();
    mainWindow.webContents.send('on-league-client', summoner);

    const ws: LeagueWebSocket = await createWebSocketConnection();
    const leagueHandler: LeagueHandler = new LeagueHandler(mainWindow.webContents, ws, summoner);
    await leagueHandler.handle(phase, matchHistory);
  });
};

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
