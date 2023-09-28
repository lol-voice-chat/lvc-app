import React, { useEffect, useState } from 'react';
import { SummonerType } from '../../../@type/summoner';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { summonerState, gameStatusState, summonerInfoListState } from '../../../@store/atom';
import { IPC_KEY, STORE_KEY } from '../../../../const';
import electronStore from '../../../@store/electron';
import VoiceRoomModal from '../../voice-room-modal';
import * as S from './style';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../../../const';

const { ipcRenderer } = window.require('electron');

function NavBar() {
  const [gameStatus, setGameStatus] = useRecoilState(gameStatusState);
  const setSummoner = useSetRecoilState(summonerState);
  const setSummonerInfoList = useSetRecoilState(summonerInfoListState);

  const [onClickTag, setOnClickTag] = useState(PATH.HOME);

  const navigate = useNavigate();

  useEffect(() => {
    /* 롤 클라이언트 on */
    ipcRenderer.once('on-league-client', (_, summoner: SummonerType) => {
      setSummoner(summoner);
    });

    /* 챔피언 선택창 on */
    ipcRenderer.once(IPC_KEY.TEAM_JOIN_ROOM, (_, { roomName }) => {
      setGameStatus('champ-select');
      electronStore.set(STORE_KEY.TEAM_VOICE_ROOM_NAME, roomName);
    });

    /* 인게임 전 로딩창 on */
    ipcRenderer.once(IPC_KEY.LEAGUE_JOIN_ROOM, (_, { roomName, teamName, summonerDataList }) => {
      electronStore.get(STORE_KEY.TEAM_VOICE_ROOM_NAME).then((teamVoiceRoomName) => {
        if (teamVoiceRoomName === roomName) return;

        setGameStatus('loading');
        setSummonerInfoList(summonerDataList);
        electronStore.set(STORE_KEY.LEAGUE_VOICE_ROOM_NAME, { roomName, teamName });
      });
    });
  }, []);

  const handleClickCategoryTag = (path: string) => {
    navigate(path);
    setOnClickTag(path);
  };

  return (
    <>
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
    </>
  );
}

export default NavBar;
