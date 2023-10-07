import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { PATH } from './const';
import NavBar from './components/@layout/nav-bar';
import SideMenuBar from './components/@layout/side-menu-bar';
import GeneralChatRoom from './components/general-chat-room';
import LvcOverlay from './components/lvc-overlay';

function Router() {
  return (
    <>
      <HashRouter>
        <NavBar />
        <Routes>
          <Route path={PATH.HOME} element={<GeneralChatRoom />} />

          <Route path={'/lvc-overlay'} element={<LvcOverlay />} />
        </Routes>
        <SideMenuBar />
      </HashRouter>
    </>
  );
}

export default Router;
