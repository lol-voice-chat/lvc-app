import React, { useEffect } from 'react';
import { SummonerType } from '../@type/summoner';
import { useSetRecoilState } from 'recoil';
import { summonerState, gameStatusState } from '../@store/atom';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../const';
import { IPC_KEY } from '../../const';

const { ipcRenderer } = window.require('electron');

function Header() {
  const setGameStatus = useSetRecoilState(gameStatusState);
  const setSummoner = useSetRecoilState(summonerState);

  const navigate = useNavigate();

  useEffect(() => {
    let teamVoiceRoomName = null;

    ipcRenderer.once('on-league-client', (_, summoner: SummonerType) => {
      setSummoner(summoner);
    });

    ipcRenderer.once(IPC_KEY.TEAM_JOIN_ROOM, (_, { roomName }) => {
      setGameStatus('champ-select');
      teamVoiceRoomName = roomName;
      navigate(PATH.VOICE_CHAT_ROOM, {
        state: { team: { roomName } },
      });
    });

    ipcRenderer.once(IPC_KEY.LEAGUE_JOIN_ROOM, (_, { roomName, teamName }) => {
      if (roomName === teamVoiceRoomName) return;

      setGameStatus('loading');
      navigate(PATH.VOICE_CHAT_ROOM, {
        state: { league: { roomName, teamName } },
      });
    });
  }, []);

  return <h1>롤보챗</h1>;
}

export default Header;
