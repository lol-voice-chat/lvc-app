import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { PATH } from './const';
import NavBar from './components/@layout/nav-bar';
import SideMenuBar from './components/@layout/side-menu-bar';
import GeneralChatRoom from './components/general-chat-room';
import ModalBundle from './components/@layout/modal-bundle';

function Router() {
  return (
    <>
      <HashRouter>
        <NavBar />

        <Routes>
          <Route path={PATH.HOME} element={<GeneralChatRoom />} />
        </Routes>

        <SideMenuBar />

        <ModalBundle />
      </HashRouter>
    </>
  );
}

export default Router;
