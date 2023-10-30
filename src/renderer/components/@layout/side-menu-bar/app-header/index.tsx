import React from 'react';
import * as _ from './style';
import { IPC_KEY } from '../../../../../const';
import close_icon from '../../../../asset/icon/close_icon.svg';
import quit_icon from '../../../../asset/icon/quit_icon.svg';
import settings_icon from '../../../../asset/icon/settings_icon.svg';

const { ipcRenderer } = window.require('electron');

function AppHeader(props: { handleClickSettingModalTrigger: () => void }) {
  return (
    <_.AppHeader>
      <div id="tool-container">
        <div onClick={() => ipcRenderer.send(IPC_KEY.CLOSE_APP)}>
          <img src={close_icon} />
        </div>
        <div onClick={props.handleClickSettingModalTrigger}>
          <img src={settings_icon} />
        </div>
        <div onClick={() => ipcRenderer.send(IPC_KEY.QUIT_APP)}>
          <img src={quit_icon} />
        </div>
      </div>
    </_.AppHeader>
  );
}

export default AppHeader;
