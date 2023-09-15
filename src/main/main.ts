import { app, BrowserWindow, ipcMain } from 'electron';
import { leagueHandler } from './league/leagueHandler';
import { onLeagueClientUx } from './league/onLeagueClientUx';
import onElectronStore from './store';
import { IPC_KEY } from '../const';

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
    const { summoner, pvpMatchList } = await onLeagueClientUx();
    mainWindow.webContents.send('on-league-client', summoner);

    await leagueHandler(mainWindow.webContents, summoner, pvpMatchList);
  });
};

ipcMain.on(IPC_KEY.MUTE_ALL_SPEAKER, (event, { isMuteSummonerSpeaker }) => {
  event.reply(IPC_KEY.MUTE_ALL_SPEAKER, { isMuteSummonerSpeaker });
});

ipcMain.on(IPC_KEY.MUTE_OFF_SUMMONER_SPEAKER, (event) => {
  event.reply(IPC_KEY.MUTE_OFF_SUMMONER_SPEAKER);
});

ipcMain.on(IPC_KEY.CONNECT_MANAGE_SOCKET, (event) => {
  event.reply(IPC_KEY.CONNECT_MANAGE_SOCKET);
});

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
