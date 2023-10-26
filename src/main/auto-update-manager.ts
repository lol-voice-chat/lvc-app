import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { IPC_KEY } from '../const';
import { app, BrowserWindow } from 'electron';

export class AutoUpdateManager {
  public static initialize(mainWindow: BrowserWindow) {
    autoUpdater.checkForUpdates();

    autoUpdater.on('checking-for-update', () => {
      mainWindow.webContents.send(IPC_KEY.CHECKING_FOR_UPDATE);
      log.info('업데이트 확인중...');
    });

    autoUpdater.on('update-available', (info) => {
      mainWindow.webContents.send(IPC_KEY.UPDATE_AVAILABLE);
      log.info('업데이트가 가능합니다.');
    });

    autoUpdater.on('update-not-available', (info) => {
      mainWindow.webContents.send(IPC_KEY.UPDATE_NOT_AVAILABLE);
      log.info('현재 최신버전입니다: ', app.getVersion());
    });

    autoUpdater.on('error', (error) => {
      log.info('에러가 발생했습니다: ', error);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      const percent = Math.floor(progressObj.percent);
      mainWindow.webContents.send(IPC_KEY.DOWNLOAD_PROGRESS, percent);
      log.info(percent);
    });

    autoUpdater.on('update-downloaded', (info) => {
      mainWindow.webContents.send(IPC_KEY.UPDATE_DOWNLOADED);
      log.info('업데이트가 완료되었습니다.');
      autoUpdater.quitAndInstall();
    });
  }
}
