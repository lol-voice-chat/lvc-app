import { app, BrowserWindow } from 'electron';
import league from './league';

let mainWindow: BrowserWindow;

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 640,
    height: 480,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL('http://localhost:3000');

  mainWindow.webContents.on('did-finish-load', async () => {
    const { displayName } = await league('GET', '/lol-summoner/v1/current-summoner');
    mainWindow.webContents.send('summoner-name', { name: displayName });
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
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
