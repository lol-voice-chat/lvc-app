import React from 'react';
import * as _ from './style';

function AppHeader() {
  return (
    <_.AppHeader>
      <div>
        <img src="img/close_icon.svg" />
        <img src="img/settings_icon.svg" />
        <img src="img/quit_icon.svg" />
      </div>
    </_.AppHeader>
  );
}

export default AppHeader;
