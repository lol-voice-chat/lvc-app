import React, { useEffect, useState } from 'react';
import { SummonerType } from '../../../@type/summoner';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { summonerState, gameStatusState, leagueChampInfoListState } from '../../../@store/atom';
import { IPC_KEY } from '../../../../const';
import electronStore from '../../../@store/electron';
import VoiceRoomModal from '../../voice-room-modal';
import * as S from './style';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../../../const';

const { ipcRenderer } = window.require('electron');

function NavBar() {
  const [gameStatus, setGameStatus] = useRecoilState(gameStatusState);
  const setSummoner = useSetRecoilState(summonerState);
  const setLeagueChampInfoList = useSetRecoilState(leagueChampInfoListState);

  const [onClickTag, setOnClickTag] = useState(PATH.HOME);

  const navigate = useNavigate();

  useEffect(() => {
    /* 롤 클라이언트 on */
    ipcRenderer.on(IPC_KEY.ON_LEAGUE_CLIENT, (_, summoner: SummonerType) => {
      setSummoner(summoner);
    });

    /* 롤 클라이언트 off */
    ipcRenderer.on(IPC_KEY.SHUTDOWN_APP, () => {
      setGameStatus('none');
    });

    /* 챔피언 선택창 on */
    ipcRenderer.on(IPC_KEY.TEAM_JOIN_ROOM, (_, { roomName }) => {
      setGameStatus('champ-select');
      electronStore.set('team-voice-room-name', roomName);
    });

    /* 인게임 전 로딩창 on */
    ipcRenderer.on(IPC_KEY.LEAGUE_JOIN_ROOM, (_, { roomName, teamName, summonerDataList }) => {
      if (teamName === roomName) return;

      setGameStatus('loading');
      setLeagueChampInfoList(summonerDataList);
      electronStore.set('league-voice-room-name', { roomName, teamName });
    });

    return () => {
      ipcRenderer.removeAllListeners(IPC_KEY.ON_LEAGUE_CLIENT);
      ipcRenderer.removeAllListeners(IPC_KEY.SHUTDOWN_APP);
      ipcRenderer.removeAllListeners(IPC_KEY.TEAM_JOIN_ROOM);
      ipcRenderer.removeAllListeners(IPC_KEY.LEAGUE_JOIN_ROOM);
    };
  }, []);

  const handleClickCategoryTag = (path: string) => {
    navigate(path);
    setOnClickTag(path);
  };

  return (
    <div id="nav-bar">
      {gameStatus !== 'none' && <VoiceRoomModal />}

      <S.NavContainer>
        <S.TitleCategoryTag>홈</S.TitleCategoryTag>
        <S.SubCategoryTag
          isClick={onClickTag === PATH.HOME}
          onClick={() => handleClickCategoryTag(PATH.HOME)}
        >
          전체채팅
        </S.SubCategoryTag>
      </S.NavContainer>
    </div>
  );
}

export default NavBar;
