import { app, BrowserWindow } from 'electron';
// import { authenticate, createHttp1Request, Credentials, Http1Response } from 'league-connect';

let mainWindow: BrowserWindow;

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 640,
    height: 480,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL('http://localhost:3000');

  // const credentials: Credentials = await authenticate({
  //   awaitConnection: true,
  // });

  // const response: Http1Response = await createHttp1Request(
  //   {
  //     method: 'GET',
  //     url: '/lol-champ-select/v1/session',
  //   },
  //   credentials
  // );

  // const { displayName } = JSON.parse(response.text());
  mainWindow.webContents.send('start', 'test');
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
