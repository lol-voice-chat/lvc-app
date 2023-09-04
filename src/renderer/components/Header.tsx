import React, { useEffect } from 'react';
import { SummonerType } from '../@type/summoner';
import { useSetRecoilState } from 'recoil';
import { summonerState, gameStatusState } from '../@store/atom';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../const';
import { IPC_KEY, STORE_KEY } from '../../const';
import electronStore from '../@store/electron';

const { ipcRenderer } = window.require('electron');

function Header() {
  const setGameStatus = useSetRecoilState(gameStatusState);
  const setSummoner = useSetRecoilState(summonerState);

  const navigate = useNavigate();

  useEffect(() => {
    ipcRenderer.once('on-league-client', (_, summoner: SummonerType) => {
      setSummoner(summoner);
    });

    ipcRenderer.once(IPC_KEY.TEAM_JOIN_ROOM, (_, { roomName }) => {
      console.log(roomName);
      setGameStatus('champ-select');
      electronStore.set(STORE_KEY.TEAM_VOICE_ROOM_NAME, roomName);
      navigate(PATH.VOICE_CHAT_ROOM);
    });

    ipcRenderer.once(IPC_KEY.LEAGUE_JOIN_ROOM, (_, { roomName, teamName }) => {
      electronStore.get(STORE_KEY.TEAM_VOICE_ROOM_NAME).then((teamVoiceRoomName) => {
        console.log(teamVoiceRoomName, roomName);
        if (teamVoiceRoomName === roomName) return;

        setGameStatus('loading');
        electronStore.set(STORE_KEY.LEAGUE_VOICE_ROOM_NAME, { roomName, teamName });
      });
    });
  }, []);

  return <h1>롤보챗</h1>;
}

export default Header;
