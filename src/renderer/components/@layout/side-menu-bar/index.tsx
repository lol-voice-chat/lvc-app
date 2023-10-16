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
import { SummonerType } from '../../../@type/summoner';
import { connectSocket } from '../../../utils/socket';
import { Socket } from 'socket.io-client';
import RecentSummonerList from './recent-summoner-list';
import AppHeader from './app-header';
import GeneralSettingModal from '../../general-setting-modal';
import electronStore from '../../../@store/electron';
const { ipcRenderer } = window.require('electron');

export type RecentSummonerType = SummonerType & { isRequested: boolean };

function SideMenuBar() {
  const summoner = useRecoilValue(summonerState);
  const summonerStatusSocket = useRef<Socket | null>(null);

  const [generalSettingModal, setGeneralSettingModal] = useState(false);
  const [settingsConfig, setSettingsConfig] = useRecoilState<GeneralSettingsConfigType | null>(
    generalSettingsConfigState
  );

  const [isRecordPage, setIsRecordPage] = useState(false);
  const [curSummonerProfile, setCurSummonerProfile] = useState<
    SummonerType | RecentSummonerType | null
  >(null);

  const [recentSummonerList, setRecentSummonerList] = useState<RecentSummonerType[] | null>(null);

  useEffect(() => {
    const socket = connectSocket('/summoner-manager');

    socket.on('connect', () => {
      summonerStatusSocket.current = socket;
    });

    /* 롤보챗 on - 최근 소환사 불러오기 */
    ipcRenderer.once('online-summoner', (_, recentSummonerList: RecentSummonerType[]) => {
      setRecentSummonerList(recentSummonerList);
    });

    /* 롤 게임 end - 최근 함께한 소환사 갱신 */
    ipcRenderer.on(IPC_KEY.END_OF_THE_GAME, (_, recentSummonerList: RecentSummonerType[]) => {
      setRecentSummonerList(recentSummonerList);
    });

    return () => {
      socket.disconnect();
      ipcRenderer.removeAllListeners(IPC_KEY.END_OF_THE_GAME);
    };
  }, []);

  useEffect(() => {
    /* 전체 설정 갱신 */
    electronStore.get('general-settings-config').then((config) => {
      setSettingsConfig(config);
    });
  }, [generalSettingModal]);

  useEffect(() => {
    setCurSummonerProfile(summoner);
  }, [summoner]);

  const handleClickSummonerProfile = (target: SummonerType) => {
    setCurSummonerProfile(isRecordPage ? summoner : target);
    setIsRecordPage((prev) => !prev);
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
          summoner={isRecordPage ? curSummonerProfile : summoner}
          isMine={summoner}
          isBackground={!isRecordPage}
          handleClickSummonerProfile={handleClickSummonerProfile}
          handleClickAddFriend={handleClickAddFriend}
        />

        {isRecordPage ? (
          // 소환사 전적
          <SummonerRecord
            isMine={curSummonerProfile === summoner}
            puuid={curSummonerProfile?.puuid ?? ''}
          />
        ) : (
          // 최근 보이스한 소환사 리스트
          <RecentSummonerList
            recentSummonerList={recentSummonerList}
            handleClickSummonerBlock={handleClickSummonerProfile}
          />
        )}
      </_.SideBarContainer>
    </>
  );
}

export default SideMenuBar;
