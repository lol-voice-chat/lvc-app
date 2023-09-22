import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { PATH } from './const';
import Navigator from './components/Navigator';
import SideMenuBar from './components/SideMenuBar';

function Router() {
  return (
    <HashRouter>
      <Navigator />

      <Routes>
        <Route path={PATH.HOME} element={<></>} />
      </Routes>

      <SideMenuBar />
    </HashRouter>
  );
}

export default Router;
