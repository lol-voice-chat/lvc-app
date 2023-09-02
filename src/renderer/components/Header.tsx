import React, { useEffect } from 'react';
import { SummonerType } from '../@type/summoner';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { voiceChatInfoState, summonerState, gameStatusState } from '../@store/Recoil';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../const';
import { IPC_KEY } from '../../const';

const { ipcRenderer } = window.require('electron');

function Header() {
  const setGameStatus = useSetRecoilState(gameStatusState);
  const [voiceChatInfo, setVoiceChatInfo] = useRecoilState(voiceChatInfoState);
  const setSummoner = useSetRecoilState(summonerState);

  const navigate = useNavigate();

  useEffect(() => {
    ipcRenderer.once('on-league-client', (_, summoner: SummonerType) => {
      setSummoner(summoner);
    });

    ipcRenderer.once(IPC_KEY.TEAM_JOIN_ROOM, (_, { roomName }) => {
      setGameStatus('champ-select');
      setVoiceChatInfo({ team: { roomName }, league: { roomName: null, teamName: null } });
      navigate(PATH.VOICE_CHAT_ROOM);
    });

    ipcRenderer.once(IPC_KEY.LEAGUE_JOIN_ROOM, (_, { roomName, teamName }) => {
      if (roomName === voiceChatInfo.team.roomName) return;

      setGameStatus('loading');
      setVoiceChatInfo({
        team: voiceChatInfo.team,
        league: { roomName, teamName },
      });
    });
  }, []);

  return <h1>롤보챗</h1>;
}

export default Header;
