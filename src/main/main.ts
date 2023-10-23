import { app, BrowserWindow, ipcMain } from 'electron';
import onElectronStore, { store } from './store';
import { generalSettingsDefaultConfig, IPC_KEY } from '../const';
import { LvcApplication } from './lvc-application';
import { resolvePath } from './lib/common';
import handleGlobalKeyEvent from './event/global-key-event';
import handleFetchMatchHistoryEvent from './event/fetch-match-history-event';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

let mainWindow: BrowserWindow;

const isDifferentGeneralSetting =
  Object.keys(store.get('general-settings-config') ?? {}).length !==
  Object.keys(generalSettingsDefaultConfig).length;

if (!store.has('general-settings-config') || isDifferentGeneralSetting) {
  store.set('general-settings-config', generalSettingsDefaultConfig);
}

autoUpdater.on('checking-for-update', () => {
  log.info('업데이트 확인중...');
});

autoUpdater.on('update-available', (info) => {
  log.info('업데이트가 가능합니다.');
});

autoUpdater.on('update-not-available', (info) => {
  log.info('현재 최신버전입니다.');
});

autoUpdater.on('error', (error) => {
  log.info('에러가 발생했습니다: ', error);
});

autoUpdater.on('download-progress', (progressObj) => {
  let message = '다운로드 속도: ' + progressObj.bytesPerSecond;
  message = message + ' - 현재 ' + progressObj.percent + '%';
  log.info(message);
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('업데이트가 완료되었습니다.');
  autoUpdater.quitAndInstall();
});

const createWindow = () => {
  mainWindow = new BrowserWindow({
    minWidth: 1300,
    minHeight: 800,
    width: 1400,
    height: 850,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: false,
    backgroundColor: '#313338',
    frame: false,
    autoHideMenuBar: true,
  });

  mainWindow.loadURL(resolvePath());

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  handleGlobalKeyEvent(mainWindow);
  handleLoadEvent();
};

async function handleLoadEvent() {
  mainWindow.webContents.on('did-finish-load', async () => {
    const app = new LvcApplication(mainWindow.webContents);

    app.initialize().then(() => {
      app.handle();
    });
  });
}

ipcMain.on(IPC_KEY.CLICK_SUMMONER_PROFILE, (_, summonerData) => {
  mainWindow.webContents.send(IPC_KEY.CLICK_SUMMONER_PROFILE, summonerData);
});

ipcMain.on(IPC_KEY.QUIT_APP, () => {
  app.quit();
});

ipcMain.on(IPC_KEY.CLOSE_APP, () => {
  mainWindow.minimize();
});

app.whenReady().then(() => {
  createWindow();
  autoUpdater.checkForUpdates();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('before-quit', () => {
  mainWindow.webContents.send(IPC_KEY.QUIT_APP);
});

handleFetchMatchHistoryEvent();
onElectronStore();
