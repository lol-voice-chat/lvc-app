import React, { useEffect } from 'react';
import { SummonerType } from '../@type/summoner';
import { useSetRecoilState } from 'recoil';
import { voiceChatInfoState, summonerState } from '../@store/Recoil';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../const';
import { io } from 'socket.io-client';

const { ipcRenderer } = window.require('electron');

function Header() {
  const saveSummoner = useSetRecoilState(summonerState);
  const updateVoiceChatInfo = useSetRecoilState(voiceChatInfoState);

  const navigate = useNavigate();

  useEffect(() => {
    ipcRenderer.once('on-league-client', (event, summoner: SummonerType) => {
      saveSummoner(summoner);
      console.log('롤 켜짐');
    });

    ipcRenderer.once('join-room', (event, { roomName }) => {
      updateVoiceChatInfo({ roomName });
      navigate(PATH.VOICE_CHAT_ROOM);
      console.log('롤 매칭됨', roomName);
    });
  });

  return <h1>앙기모띠</h1>;
}

export default Header;
