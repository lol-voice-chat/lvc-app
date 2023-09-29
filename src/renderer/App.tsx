import React from 'react';
import { RecoilRoot } from 'recoil';
import Router from './router';
import GlobalStyle from './global-style';
import Helmets from './helmets';

function App() {
  return (
    <>
      <Helmets />

      <RecoilRoot>
        <GlobalStyle />
        <Router />
      </RecoilRoot>
    </>
  );
}

export default App;
