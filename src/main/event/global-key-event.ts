import { GeneralSettingsConfigType } from '../../renderer/@store/atom';
import { GlobalKeyboardListener } from 'node-global-key-listener';
import { BrowserWindow, ipcMain } from 'electron';
import localShortcut from 'electron-localshortcut';
import { IPC_KEY } from '../../const';
import { store } from '../store';

const globalKey = new GlobalKeyboardListener();
let isPressingKey = false;

export const handleGlobalKeyEvent = (mainWindow: BrowserWindow) => {
  localShortcut.register(mainWindow, 'Esc', () => {
    mainWindow.webContents.send(IPC_KEY.SETTINGS_SHORTCUT_KEY);
  });

  ipcMain.on(IPC_KEY.INPUT_SHORTCUT_KEY, () => {
    const calledOnce = (e: any) => {
      if (e.state === 'DOWN') {
        mainWindow.webContents.send(IPC_KEY.INPUT_SHORTCUT_KEY, e.name);
        globalKey.removeListener(calledOnce);
      }
    };
    globalKey.addListener(calledOnce);
  });

  globalKey.addListener((e) => {
    let settingsConfig = store.get('general-settings-config') as GeneralSettingsConfigType;

    if (settingsConfig) {
      const { isPressToTalk, pressToTalkShortcutKey, muteMicShortcutKey } = settingsConfig;

      /* 눌러서 말하기 off - default */
      if (!isPressToTalk && e.name === muteMicShortcutKey && e.state === 'DOWN') {
        mainWindow.webContents.send(IPC_KEY.SUMMONER_MUTE);
      }
      /* 눌러서 말하기 on */
      if (isPressToTalk && e.name === pressToTalkShortcutKey) {
        if (!isPressingKey && e.state === 'DOWN') {
          mainWindow.webContents.send(IPC_KEY.SUMMONER_MUTE);
          isPressingKey = true;
        }
        if (e.state === 'UP') {
          mainWindow.webContents.send(IPC_KEY.SUMMONER_MUTE);
          isPressingKey = false;
        }
      }
    }
  });
};

export default handleGlobalKeyEvent;
