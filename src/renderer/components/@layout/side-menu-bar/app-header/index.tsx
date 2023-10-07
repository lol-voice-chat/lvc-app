import React from 'react';
import * as _ from './style';

function AppHeader(props: { handleClickSettingModalTrigger }) {
  return (
    <_.AppHeader>
      <div id="tool-container">
        <div>
          <img src="img/close_icon.svg" />
        </div>
        <div onClick={props.handleClickSettingModalTrigger}>
          <img src="img/settings_icon.svg" />
        </div>
        <div>
          <img src="img/quit_icon.svg" />
        </div>
      </div>
    </_.AppHeader>
  );
}

export default AppHeader;
