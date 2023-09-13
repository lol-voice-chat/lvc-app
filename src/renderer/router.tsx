import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { PATH } from './const';
import Navigator from './components/Navigator';
import VoiceRoomModal from './components/VoiceRoomModal';

function Router() {
  return (
    <HashRouter>
      <Navigator />

      <Routes>
        <Route path={PATH.HOME} element={<VoiceRoomModal />} />
      </Routes>
    </HashRouter>
  );
}

export default Router;
