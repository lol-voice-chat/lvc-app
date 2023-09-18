import React, { useEffect } from 'react';
import { SummonerType } from '../../@type/summoner';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { summonerState, gameStatusState } from '../../@store/atom';
import { IPC_KEY, STORE_KEY } from '../../../const';
import electronStore from '../../@store/electron';
import VoiceRoomModal from '../VoiceRoomModal';

const { ipcRenderer } = window.require('electron');

function Navigator() {
  const [gameStatus, setGameStatus] = useRecoilState(gameStatusState);
  const setSummoner = useSetRecoilState(summonerState);

  useEffect(() => {
    ipcRenderer.once('on-league-client', (_, summoner: SummonerType) => {
      setSummoner(summoner);
    });

    ipcRenderer.once(IPC_KEY.TEAM_JOIN_ROOM, (_, { roomName }) => {
      setGameStatus('champ-select');
      electronStore.set(STORE_KEY.TEAM_VOICE_ROOM_NAME, roomName);
    });

    ipcRenderer.once(IPC_KEY.LEAGUE_JOIN_ROOM, (_, { roomName, teamName }) => {
      electronStore.get(STORE_KEY.TEAM_VOICE_ROOM_NAME).then((teamVoiceRoomName) => {
        if (teamVoiceRoomName === roomName) return;

        setGameStatus('loading');
        electronStore.set(STORE_KEY.LEAGUE_VOICE_ROOM_NAME, { roomName, teamName });
      });
    });
  }, []);

  return <>{gameStatus !== 'none' && <VoiceRoomModal />}</>;
}

export default Navigator;
