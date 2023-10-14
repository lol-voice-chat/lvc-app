import React from 'react';
import * as _ from './style';
import { IPC_KEY } from '../../../../../const';
const { ipcRenderer } = window.require('electron');

function AppHeader(props: { handleClickSettingModalTrigger: () => void }) {
  return (
    <_.AppHeader>
      <div id="tool-container">
        <div onClick={() => ipcRenderer.send(IPC_KEY.CLOSE_APP)}>
          <img src="img/close_icon.svg" />
        </div>
        <div onClick={props.handleClickSettingModalTrigger}>
          <img src="img/settings_icon.svg" />
        </div>
        <div onClick={() => ipcRenderer.send(IPC_KEY.QUIT_APP)}>
          <img src="img/quit_icon.svg" />
        </div>
      </div>
    </_.AppHeader>
  );
}

export default AppHeader;
