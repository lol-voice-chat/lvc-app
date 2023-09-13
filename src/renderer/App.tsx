import React from 'react';
import { RecoilRoot } from 'recoil';
import Router from './router';
import GlobalStyle from './globalStyle';
import Helmets from './helmets';
import { TeamSocketContext, connectSocket } from './utils/socket';

function App() {
  return (
    <>
      <Helmets />

      <TeamSocketContext.Provider value={connectSocket('/team-voice-chat')}>
        <RecoilRoot>
          <GlobalStyle />
          <Router />
        </RecoilRoot>
      </TeamSocketContext.Provider>
    </>
  );
}

export default App;
