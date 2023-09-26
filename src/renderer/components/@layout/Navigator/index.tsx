import React, { useEffect } from 'react';
import { SummonerType } from '../../../@type/summoner';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { summonerState, gameStatusState, summonerInfoListState } from '../../../@store/atom';
import { IPC_KEY, STORE_KEY } from '../../../../const';
import electronStore from '../../../@store/electron';
import VoiceRoomModal from '../../VoiceRoomModal';
import * as S from './style';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../../../const';

const { ipcRenderer } = window.require('electron');

function Navigator() {
  const [gameStatus, setGameStatus] = useRecoilState(gameStatusState);
  const setSummoner = useSetRecoilState(summonerState);
  const setSummonerInfoList = useSetRecoilState(summonerInfoListState);

  const navigate = useNavigate();

  useEffect(() => {
    ipcRenderer.once('on-league-client', (_, summoner: SummonerType) => {
      setSummoner(summoner);
    });

    ipcRenderer.once(IPC_KEY.TEAM_JOIN_ROOM, (_, { roomName }) => {
      setGameStatus('champ-select');
      electronStore.set(STORE_KEY.TEAM_VOICE_ROOM_NAME, roomName);
    });

    ipcRenderer.once(IPC_KEY.LEAGUE_JOIN_ROOM, (_, { roomName, teamName, summonerDataList }) => {
      electronStore.get(STORE_KEY.TEAM_VOICE_ROOM_NAME).then((teamVoiceRoomName) => {
        if (teamVoiceRoomName === roomName) return;

        setGameStatus('loading');
        setSummonerInfoList(summonerDataList);
        electronStore.set(STORE_KEY.LEAGUE_VOICE_ROOM_NAME, { roomName, teamName });
      });
    });
  }, []);

  return (
    <>
      {gameStatus !== 'none' && <VoiceRoomModal />}

      <S.NavContainer>
        <S.TitleCategoryTag>홈</S.TitleCategoryTag>
        <S.SubCategoryTag onClick={() => navigate(PATH.HOME)}>전체채팅</S.SubCategoryTag>
      </S.NavContainer>
    </>
  );
}

export default Navigator;
