import React, { useEffect, useState } from 'react';
import * as _ from './style';
import { useRecoilValue } from 'recoil';
import { summonerState } from '../../../@store/atom';
import SummonerFriendList from './SummonerFriendList';
import SummonerProfile from './SummonerProfile';
import SummonerRecord from './SummonerRecord';
import { IPC_KEY } from '../../../../const';
import { SummonerRecordType } from '../../../@type/summoner';
import { connectSocket } from '../../../utils/socket';
import { Socket } from 'socket.io-client';

const { ipcRenderer } = window.require('electron');

function SideMenuBar() {
  const summoner = useRecoilValue(summonerState);

  const [friendSocket, setFriendSocket] = useState<Socket | null>(null);

  const [isSummonerRecord, setIsSummonerRecord] = useState(false);
  const [summonerRecord, setSummonerRecord] = useState<SummonerRecordType | null>(null);

  useEffect(() => {
    const socket = connectSocket('/friend');
    setFriendSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  const getFriendSummonerRecord = (id: string, puuid: string) => {
    ipcRenderer.send(IPC_KEY.FRIEND_STATS, { id, puuid });
    ipcRenderer.once(IPC_KEY.FRIEND_STATS, (_, summonerStatsData: SummonerRecordType) => {
      setSummonerRecord(summonerStatsData);
    });
    setIsSummonerRecord(true);
  };

  const handleClickSummonerProfile = (displayName: string) => {
    if (summoner && summoner.displayName === displayName) {
      setSummonerRecord(summoner);
    }
    setIsSummonerRecord((curState) => !curState);
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
          friendSocket={friendSocket}
          summoner={summoner}
          handleClickSummonerBlock={getFriendSummonerRecord}
        />
      )}
    </_.SideBarContainer>
  );
}

export default SideMenuBar;
