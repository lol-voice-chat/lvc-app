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

const { ipcRenderer } = window.require('electron');

function SideMenuBar() {
  const summoner = useRecoilValue(summonerState);
  const [summonerStatusSocket, setSummonerStatusSocket] = useState<Socket | null>(null);

  const [isSummonerRecord, setIsSummonerRecord] = useState(false);
  const [summonerRecordInfo, setSummonerRecordInfo] = useState<SummonerType | null>(null);
  const [recentSummonerList, setRecentSummonerList] = useState<SummonerType[] | null>(null);

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
      summonerStatusSocket?.emit(
        'online-summoner',
        summoner,
        (recentSummonerList: SummonerType[]) => {
          setRecentSummonerList(recentSummonerList);
        }
      );
      /* 롤 종료 - 오프라인 */
      ipcRenderer.once('shutdown-app', () => {
        // summonerStatusSocket?.emit('offline-summoner');
      });
    }
  }, [summoner]);

  const getRecentSummonerData = (summonerData: SummonerType) => {
    setSummonerRecordInfo(summonerData);
    setIsSummonerRecord(true);
  };

  const handleClickSummonerProfile = (isMine: boolean) => {
    if (isMine) setSummonerRecordInfo(summoner);

    setIsSummonerRecord((curState) => !curState);
  };

  console.log(summoner?.name, summonerRecordInfo?.name);

  return (
    <_.SideBarContainer>
      <SummonerProfile
        summoner={isSummonerRecord ? summonerRecordInfo : summoner}
        isMine={summonerRecordInfo?.name === summoner?.name}
        isBackground={!isSummonerRecord}
        handleClickSummonerProfile={handleClickSummonerProfile}
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
