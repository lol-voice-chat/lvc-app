import { app, BrowserWindow, WebContents } from 'electron';
import { onLeagueClientUx, SummonerInfo } from './league/onLeagueClientUx';
import { LeagueConnection, ILeagueConnection } from './league/leagueConnection';
import { createWebSocketConnection, LeagueWebSocket } from 'league-connect';

let mainWindow: BrowserWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 640,
    height: 480,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL('http://localhost:3000');
  const webContents: WebContents = mainWindow.webContents;

  webContents.on('did-finish-load', async () => {
    const summoner: SummonerInfo = await onLeagueClientUx();
    webContents.send('on-league-client', summoner);

    const ws: LeagueWebSocket = await createWebSocketConnection({
      authenticationOptions: {
        awaitConnection: true,
      },
    });

    const leagueConnection: ILeagueConnection = new LeagueConnection(ws, webContents);
    leagueConnection.champSelect();
    leagueConnection.gameLoading();
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
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
