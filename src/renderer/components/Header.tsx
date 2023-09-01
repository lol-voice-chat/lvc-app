import React, { useEffect } from 'react';
import { SummonerType } from '../@type/summoner';
import { useSetRecoilState } from 'recoil';
import { voiceChatInfoState, summonerState } from '../@store/Recoil';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../const';
import { IPC_KEY } from '../../const';

const { ipcRenderer } = window.require('electron');

function Header() {
  const saveSummoner = useSetRecoilState(summonerState);
  const updateVoiceChatInfo = useSetRecoilState(voiceChatInfoState);

  const navigate = useNavigate();

  useEffect(() => {
    ipcRenderer.once('on-league-client', (_, summoner: SummonerType) => {
      saveSummoner(summoner);
    });

    ipcRenderer.once(IPC_KEY.TEAM_JOIN_ROOM, (_, { roomName }) => {
      updateVoiceChatInfo({ teamRoomName: roomName });
      navigate(PATH.VOICE_CHAT_ROOM);
    });
  });

  return <h1>롤보챗</h1>;
}

export default Header;
