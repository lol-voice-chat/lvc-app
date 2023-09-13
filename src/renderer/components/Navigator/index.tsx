import React, { useContext, useEffect } from 'react';
import { SummonerStatsType, SummonerType } from '../../@type/summoner';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { summonerState, gameStatusState, userStreamState } from '../../@store/atom';
import { IPC_KEY, STORE_KEY } from '../../../const';
import electronStore from '../../@store/electron';
import VoiceRoomModal from '../VoiceRoomModal';
import { getUserAudioStream } from '../../utils/audio';
import { TeamSocketContext } from '../../utils/socket';

const { ipcRenderer } = window.require('electron');

function Navigator() {
  const teamSocket = useContext(TeamSocketContext);

  const [gameStatus, setGameStatus] = useRecoilState(gameStatusState);
  const setSummoner = useSetRecoilState(summonerState);
  const setUserStream = useSetRecoilState(userStreamState);

  useEffect(() => {
    getUserAudioStream().then((stream) => setUserStream(stream));

    window.addEventListener('beforeunload', () => {
      teamSocket?.disconnect();
    });

    ipcRenderer.once('on-league-client', (_, summoner: SummonerType & SummonerStatsType) => {
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

    return () => {
      teamSocket?.disconnect();
    };
  }, []);

  return <>{gameStatus !== 'none' && <VoiceRoomModal />}</>;
}

export default Navigator;
