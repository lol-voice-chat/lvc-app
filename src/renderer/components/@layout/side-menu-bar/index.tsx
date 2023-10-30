import React, { useEffect, useState } from 'react';
import * as _ from './style';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { generalSettingsModalState, summonerState } from '../../../@store/atom';
import SummonerProfile from './summoner-profile';
import SummonerRecord from './summoner-record';
import { IPC_KEY } from '../../../../const';
import { SummonerType } from '../../../@type/summoner';
import RecentSummonerList from './recent-summoner-list';
import AppHeader from './app-header';
const { ipcRenderer } = window.require('electron');

function SideMenuBar() {
  const summoner = useRecoilValue(summonerState);

  const setGeneralSettingsState = useSetRecoilState(generalSettingsModalState);

  const [isRecordPage, setIsRecordPage] = useState(false);
  const [curSummonerProfile, setCurSummonerProfile] = useState<SummonerType | null>(null);
  const [isFriendSummoner, setIsFriendSummoner] = useState(true);
  const [recentSummonerList, setRecentSummonerList] = useState<SummonerType[] | null>(null);

  useEffect(() => {
    /* 롤보챗 on - 최근 소환사 불러오기 */
    ipcRenderer.once(IPC_KEY.RECENT_SUMMONER, (_, recentSummonerList: SummonerType[]) => {
      setRecentSummonerList(recentSummonerList);
    });

    /* 롤 게임 end - 최근 함께한 소환사 갱신 */
    ipcRenderer.on(IPC_KEY.END_OF_THE_GAME, (_, recentSummonerList: SummonerType[]) => {
      setRecentSummonerList(recentSummonerList);
    });

    ipcRenderer.on('test', (_, data) => {
      console.log(data);
    });

    return () => {
      ipcRenderer.removeAllListeners(IPC_KEY.END_OF_THE_GAME);
    };
  }, []);

  useEffect(() => {
    if (summoner) {
      setCurSummonerProfile(summoner);
    }

    ipcRenderer.on(IPC_KEY.CLICK_SUMMONER_PROFILE, (_, summoner: SummonerType) => {
      setCurSummonerProfile(summoner);
      setIsRecordPage(true);
    });

    return () => {
      ipcRenderer.removeAllListeners(IPC_KEY.CLICK_SUMMONER_PROFILE);
    };
  }, [summoner]);

  const handleClickSummonerProfile = (target: SummonerType) => {
    if (isRecordPage) {
      setCurSummonerProfile(summoner);
      setIsFriendSummoner(true);
    } else {
      setCurSummonerProfile(target);
    }
    setIsRecordPage((prev) => !prev);
  };

  return (
    <_.SideBarContainer>
      <AppHeader handleClickSettingModalTrigger={() => setGeneralSettingsState((prev) => !prev)} />

      <SummonerProfile
        summoner={isRecordPage ? curSummonerProfile : summoner}
        isFriend={isFriendSummoner}
        isBackground={!isRecordPage}
        handleClickSummonerProfile={handleClickSummonerProfile}
      />

      {isRecordPage ? (
        /* 소환사 전적 */
        <SummonerRecord
          isMine={curSummonerProfile?.name === summoner?.name}
          puuid={curSummonerProfile?.puuid ?? 'leage-client-off'}
          setIsFriend={setIsFriendSummoner}
        />
      ) : (
        /* 최근 보이스한 소환사 리스트 */
        <RecentSummonerList
          recentSummonerList={recentSummonerList}
          handleClickSummonerBlock={handleClickSummonerProfile}
        />
      )}
    </_.SideBarContainer>
  );
}

export default SideMenuBar;
