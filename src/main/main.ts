import { app, BrowserWindow } from 'electron';
import { leagueHandler } from './league/leagueHandler';
import { onLeagueClientUx } from './league/onLeagueClientUx';
import onElectronStore from './store';

let mainWindow: BrowserWindow;

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1346,
    height: 779,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL('http://localhost:3000');

  const { summoner, pvpMatchlist } = await onLeagueClientUx();
  mainWindow.webContents.on('did-finish-load', async () => {
    mainWindow.webContents.send('on-league-client', summoner);

    await leagueHandler(mainWindow.webContents, summoner, pvpMatchlist);
  });
};

app.whenReady().then(async () => {
  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});

onElectronStore();
