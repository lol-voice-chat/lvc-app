import React, { useEffect, useState } from 'react';
import * as _ from './style';
import { useRecoilValue } from 'recoil';
import { summonerState } from '../../../@store/atom';
import SummonerProfile from './summoner-profile';
import SummonerRecord from './summoner-record';
import { IPC_KEY } from '../../../../const';
import { SummonerType } from '../../../@type/summoner';
import { connectSocket } from '../../../utils/socket';
import { Socket } from 'socket.io-client';
import RecentSummonerList from './recent-summoner-list';
import AppHeader from './app-header';
const { ipcRenderer } = window.require('electron');

export type RecentSummonerType = SummonerType & { isRequested: boolean };

function SideMenuBar() {
  const summoner = useRecoilValue(summonerState);
  const [summonerStatusSocket, setSummonerStatusSocket] = useState<Socket | null>(null);

  const [isSummonerRecord, setIsSummonerRecord] = useState(false);
  const [summonerRecordInfo, setSummonerRecordInfo] = useState<
    SummonerType | RecentSummonerType | null
  >(null);
  const [recentSummonerList, setRecentSummonerList] = useState<RecentSummonerType[] | null>(null);

  useEffect(() => {
    const socket = connectSocket('/summoner-status');
    setSummonerStatusSocket(socket);

    /* 롤 인게임 시작 */
    ipcRenderer.once(IPC_KEY.START_IN_GAME, (_, summonerIdList) => {
      socket.emit('start-in-game', summonerIdList);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (summoner) {
      setSummonerRecordInfo(summoner);

      /* 앱 시작 - 온라인 */
      ipcRenderer.once('online-summoner', (_, friendSummonerIdList) => {
        summonerStatusSocket?.emit(
          'online-summoner',
          { summoner, friendSummonerIdList },
          (recentSummonerList: RecentSummonerType[]) => {
            setRecentSummonerList(recentSummonerList);
          }
        );
      });

      /* 롤 종료 - 오프라인 */
      ipcRenderer.once('shutdown-app', () => {
        // summonerStatusSocket?.emit('offline-summoner');
      });
    }
  }, [summoner]);

  const getRecentSummonerData = (summonerInfo: SummonerType | RecentSummonerType) => {
    setSummonerRecordInfo(summonerInfo);
    setIsSummonerRecord(true);
  };

  const handleClickSummonerProfile = (isMine: boolean) => {
    if (isMine) setSummonerRecordInfo(summoner);

    setIsSummonerRecord((curState) => !curState);
  };

  const handleClickAddFriend = (recentSummonerInfo: RecentSummonerType) => {
    if (recentSummonerList) {
      setRecentSummonerList(
        [...recentSummonerList].map((recentSummoner) => {
          if (recentSummonerInfo === recentSummoner) {
            recentSummoner.isRequested = true;
          }
          return recentSummoner;
        })
      );
    }
    ipcRenderer.send('friend-request', recentSummonerInfo);
    summonerStatusSocket?.emit('friend-request', recentSummonerInfo.summonerId);
  };

  return (
    <_.SideBarContainer id="side-menu-bar">
      <AppHeader />

      <SummonerProfile
        summoner={isSummonerRecord ? summonerRecordInfo : summoner}
        isMine={summoner}
        isBackground={!isSummonerRecord}
        handleClickSummonerProfile={handleClickSummonerProfile}
        handleClickAddFriend={handleClickAddFriend}
      />

      {isSummonerRecord ? (
        // 소환사 전적
        <SummonerRecord summonerData={summonerRecordInfo} />
      ) : (
        // 최근 보이스한 소환사 리스트
        <RecentSummonerList
          recentSummonerList={recentSummonerList}
          handleClickSummonerBlock={getRecentSummonerData}
        />
      )}
    </_.SideBarContainer>
  );
}

export default SideMenuBar;
