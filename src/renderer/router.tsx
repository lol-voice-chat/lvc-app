import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { PATH } from './const';
import VoiceRoom from './components/VoiceRoom';
import Header from './components/Header';

function Router() {
  return (
    <HashRouter>
      <Header />

      <Routes>
        <Route path={PATH.HOME} element={<></>} />
        <Route path={PATH.VOICE_CHAT_ROOM} element={<VoiceRoom />} />
      </Routes>
    </HashRouter>
  );
}

export default Router;
