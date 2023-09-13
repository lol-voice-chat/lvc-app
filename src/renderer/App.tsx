import React from 'react';
import { RecoilRoot } from 'recoil';
import Router from './router';
import GlobalStyle from './globalStyle';
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
