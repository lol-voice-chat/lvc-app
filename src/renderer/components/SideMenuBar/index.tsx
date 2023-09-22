import React, { useState } from 'react';
import * as _ from './style';
import { useRecoilValue } from 'recoil';
import { summonerState } from '../../@store/atom';
import SummonerFriendList from '../SummonerFriendList';
import SummonerProfile from './SummonerProfile';
import SummonerRecord from './SummonerRecord';
import { IPC_KEY } from '../../../const';
import { SummonerRecordType } from '../../@type/summoner';

const { ipcRenderer } = window.require('electron');

function SideMenuBar() {
  const summoner = useRecoilValue(summonerState);

  const [isSummonerRecord, setIsSummonerRecord] = useState(false);
  const [summonerRecord, setSummonerRecord] = useState<SummonerRecordType | null>(null);

  const getFriendSummonerRecord = (summonerId: number, puuid: string) => {
    ipcRenderer.send(IPC_KEY.FRIEND_STATS, { summonerId, puuid });
    console.log('보냄');
    ipcRenderer.once(IPC_KEY.FRIEND_STATS, (_, summonerRecordData: SummonerRecordType) => {
      console.log('받음');
      setSummonerRecord(summonerRecordData);
    });
    setIsSummonerRecord(true);
  };

  const handleClickSummonerProfile = (displayName: string) => {
    if (summoner && summoner.displayName === displayName) {
      setSummonerRecord(summoner);
      setIsSummonerRecord(true);
    }
  };

  return (
    <_.SideBarContainer>
      <SummonerProfile
        summoner={isSummonerRecord ? summonerRecord ?? null : summoner}
        isBackground={!isSummonerRecord}
        handleClickSummonerProfile={handleClickSummonerProfile}
      />

      {isSummonerRecord ? (
        <SummonerRecord summonerRecord={summonerRecord} />
      ) : (
        <SummonerFriendList
          friendProfileList={summoner?.friendProfileList ?? null}
          handleClickSummonerBlock={getFriendSummonerRecord}
        />
      )}
    </_.SideBarContainer>
  );
}

export default SideMenuBar;
