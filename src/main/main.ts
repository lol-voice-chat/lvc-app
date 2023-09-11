import { app, BrowserWindow } from 'electron';
import { leagueHandler } from './league/leagueHandler';
import { onLeagueClientUx, SummonerInfo } from './league/onLeagueClientUx';
import electronReload from 'electron-reload';
import onElectronStore from './store';

if (process.env.NODE_ENV === 'development') {
  electronReload(__dirname, {});
}

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
    const summoner: SummonerInfo = await onLeagueClientUx();
    mainWindow.webContents.send('on-league-client', summoner);

    await leagueHandler(mainWindow.webContents, summoner.summonerId);
  });
};

app.whenReady().then(async () => {
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

onElectronStore();
