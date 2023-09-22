import React, { useState } from 'react';
import * as _ from './style';
import { useRecoilValue } from 'recoil';
import { summonerState } from '../../@store/atom';
import SummonerFriendList from '../SummonerFriendList';
import SummonerProfile from './SummonerProfile';
import SummonerRecord from './SummonerRecord';

function SideMenuBar() {
  const summoner = useRecoilValue(summonerState);

  return (
    <_.SideBarContainer>
      <SummonerProfile summoner={summoner} isBackground={true} />

      <SummonerFriendList friendProfileList={summoner?.friendProfileList ?? null} />
    </_.SideBarContainer>
  );
}

export default SideMenuBar;
