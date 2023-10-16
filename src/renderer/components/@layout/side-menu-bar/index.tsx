import React, { useEffect, useRef, useState } from 'react';
import * as _ from './style';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  GeneralSettingsConfigType,
  generalSettingsConfigState,
  summonerState,
} from '../../../@store/atom';
import SummonerProfile from './summoner-profile';
import SummonerRecord from './summoner-record';
import { IPC_KEY } from '../../../../const';
import { SummonerStatsType, SummonerType } from '../../../@type/summoner';
import { connectSocket } from '../../../utils/socket';
import { Socket } from 'socket.io-client';
import RecentSummonerList from './recent-summoner-list';
import AppHeader from './app-header';
import GeneralSettingModal from '../../general-setting-modal';
import electronStore from '../../../@store/electron';
import InfoBox from '../../@common/info-box';
const { ipcRenderer } = window.require('electron');

export type RecentSummonerType = SummonerType & { isRequested: boolean };

function SideMenuBar() {
  const summoner = useRecoilValue(summonerState);
  const summonerStatusSocket = useRef<Socket | null>(null);
  const [isConnectedSocket, setIsConnectedSocket] = useState(false);

  const [generalSettingModal, setGeneralSettingModal] = useState(false);
  const [settingsConfig, setSettingsConfig] = useRecoilState<GeneralSettingsConfigType | null>(
    generalSettingsConfigState
  );

  const [isSummonerRecord, setIsSummonerRecord] = useState(false);
  const [summonerRecordInfo, setSummonerRecordInfo] = useState<
    SummonerType | RecentSummonerType | null
  >(null);
  const [recentSummonerList, setRecentSummonerList] = useState<RecentSummonerType[] | null>(null);

  useEffect(() => {
    const socket = connectSocket('/summoner-manager');
    socket.on('connect', () => {
      summonerStatusSocket.current = socket;
      setIsConnectedSocket(true);
    });

    /* 롤 인게임 시작 */
    ipcRenderer.on(IPC_KEY.START_IN_GAME, (_, summonerIdList: string[]) => {
      socket.emit('start-in-game', summonerIdList);
    });

    /* 롤 게임 끝 */
    ipcRenderer.on(IPC_KEY.END_OF_THE_GAME, (_, summonerStats: SummonerStatsType) => {
      socket.emit('end-of-the-game', summonerStats);
    });

    return () => {
      socket.disconnect();
      ipcRenderer.removeAllListeners(IPC_KEY.START_IN_GAME);
      ipcRenderer.removeAllListeners(IPC_KEY.END_OF_THE_GAME);
    };
  }, []);

  useEffect(() => {
    if (summoner) {
      setSummonerRecordInfo(summoner);

      /* 앱 시작 - 온라인 */
      if (isConnectedSocket) {
        ipcRenderer.once('online-summoner', (_, friendSummonerIdList: any) => {
          summonerStatusSocket.current?.emit(
            'online-summoner',
            { summoner, friendSummonerIdList },
            (recentSummonerList: RecentSummonerType[]) => {
              setRecentSummonerList(recentSummonerList);
            }
          );
        });
      }
    }
  }, [summoner, isConnectedSocket]);

  useEffect(() => {
    electronStore.get('general-settings-config').then((config) => {
      setSettingsConfig(config);
    });
  }, [generalSettingModal]);

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
          recentSummoner.isRequested = recentSummonerInfo === recentSummoner;
          return recentSummoner;
        })
      );
    }
    ipcRenderer.send('friend-request', recentSummonerInfo);
    summonerStatusSocket.current?.emit('friend-request', recentSummonerInfo.summonerId);
  };

  return (
    <>
      {generalSettingModal && settingsConfig && (
        <GeneralSettingModal
          settingsConfig={settingsConfig}
          handleClickModalTrigger={() => setGeneralSettingModal((prev) => !prev)}
        />
      )}

      <_.SideBarContainer id="side-menu-bar">
        <AppHeader handleClickSettingModalTrigger={() => setGeneralSettingModal((prev) => !prev)} />

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
    </>
  );
}

export default SideMenuBar;
