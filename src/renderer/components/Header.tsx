import React, { useEffect } from 'react';
import { SummonerType } from '../@type/summoner';
import { useSetRecoilState } from 'recoil';
import { voiceChatInfoState, summonerState } from '../@store/Recoil';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../const';

const { ipcRenderer } = window.require('electron');

function Header() {
  const saveSummoner = useSetRecoilState(summonerState);
  const updateVoiceChatInfo = useSetRecoilState(voiceChatInfoState);

  const navigate = useNavigate();

  useEffect(() => {
    ipcRenderer.once('on-league-client', (_, summoner: SummonerType) => {
      saveSummoner(summoner);
    });

    ipcRenderer.once('join-room', (_, { roomName }) => {
      updateVoiceChatInfo({ roomName: '777' });
      navigate(PATH.VOICE_CHAT_ROOM);
    });
  });

  return <h1>롤보챗</h1>;
}

export default Header;
