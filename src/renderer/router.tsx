import React, { useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { PATH } from './const';
import NavBar from './components/@layout/nav-bar';
import SideMenuBar from './components/@layout/side-menu-bar';
import GeneralChatRoom from './components/general-chat-room';
import AppStartingModal from './components/@layout/app-starting-modal';

function Router() {
  const [onStartingModal, setOnStartingModal] = useState(true);

  return (
    <>
      {/* {onStartingModal && <AppStartingModal setIsOnAppStartingModal={setOnStartingModal} />} */}

      <HashRouter>
        <NavBar />

        <Routes>
          <Route path={PATH.HOME} element={<GeneralChatRoom />} />
        </Routes>

        <SideMenuBar />
      </HashRouter>
    </>
  );
}

export default Router;
