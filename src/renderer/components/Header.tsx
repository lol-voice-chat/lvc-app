import React, { useEffect } from 'react';
import { SummonerType } from '../@type/summoner';
import { useSetRecoilState } from 'recoil';
import { voiceChatInfoState, summonerState } from '../@store/Recoil';
import socket from '../utills/socket';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../const';

const { ipcRenderer } = window.require('electron');

function Header() {
  const saveSummoner = useSetRecoilState(summonerState);
  const updateVoiceChatInfo = useSetRecoilState(voiceChatInfoState);

  const navigate = useNavigate();

  useEffect(() => {
    ipcRenderer.once('on-league-client', (event, summoner: SummonerType) => {
      saveSummoner(summoner);
    });

    ipcRenderer.once('join-room', (event, { roomName }) => {
      updateVoiceChatInfo({ roomName, socket });
      navigate(PATH.VOICE_CHAT_ROOM);
    });
  });

  return <div></div>;
}

export default Header;
