import React, { useEffect, useState } from 'react';
import * as _ from './style';
import { useRecoilValue } from 'recoil';
import { summonerState } from '../../../@store/atom';
import SummonerProfile from './SummonerProfile';
import SummonerRecord from './SummonerRecord';
import { IPC_KEY } from '../../../../const';
import { RecentSummonerType, SummonerRecordType } from '../../../@type/summoner';
import { connectSocket } from '../../../utils/socket';
import { Socket } from 'socket.io-client';
import RecentSummonerList from './RecentSummonerList';

const { ipcRenderer } = window.require('electron');

function SideMenuBar() {
  const summoner = useRecoilValue(summonerState);

  const [summonerStatusSocket, setSummonerStatusSocket] = useState<Socket | null>(null);

  const [isSummonerRecord, setIsSummonerRecord] = useState(false);
  const [summonerRecord, setSummonerRecord] = useState<SummonerRecordType | null>(null);

  const [recentSummonerList, setRecentSummonerList] = useState<RecentSummonerType[] | null>(null);

  useEffect(() => {
    const socket = connectSocket('/summoner-status');
    setSummonerStatusSocket(socket);

    /* 롤 인게임 시작 */
    ipcRenderer.once(IPC_KEY.START_IN_GAME, (_, summonerList) => {
      socket.emit('start-in-game', summonerList);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (summoner) {
      /* 앱 시작 - 온라인 */
      summonerStatusSocket?.emit(
        'online-summoner',
        {
          summoner: {
            puuid: summoner.puuid,
            summonerId: summoner.summonerId,
            profileImage: summoner.profileImage,
            displayName: summoner.displayName,
          },
        },
        ({ recentSummonerList }) => {
          setRecentSummonerList(recentSummonerList);
        }
      );

      /* 롤 종료 */
      ipcRenderer.once('shutdown-app', () => {
        summonerStatusSocket?.emit('offline-summoner', {
          puuid: summoner?.puuid,
          summonerId: summoner?.summonerId,
          profileImage: summoner?.profileImage,
          displayName: summoner?.displayName,
        });
      });
    }
  }, [summoner]);

  const getRecentSummonerRecord = (puuid: string) => {
    setSummonerRecord(null);
    setIsSummonerRecord(true);

    ipcRenderer.send(IPC_KEY.FRIEND_STATS, puuid);
    ipcRenderer.once(IPC_KEY.FRIEND_STATS, (_, summonerStatsData: SummonerRecordType) => {
      setSummonerRecord(summonerStatsData);
    });
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
        <RecentSummonerList
          recentSummonerList={recentSummonerList}
          handleClickSummonerBlock={getRecentSummonerRecord}
        />
      )}
    </_.SideBarContainer>
  );
}

export default SideMenuBar;
