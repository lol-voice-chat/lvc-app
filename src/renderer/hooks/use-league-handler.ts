import { SummonerType } from '../@type/summoner';
import { IPC_KEY } from '../../const';
import electronStore from '../@store/electron';
import { useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { gameStatusState, leagueChampInfoListState, summonerState } from '../@store/atom';

const { ipcRenderer } = window.require('electron');

function useLeagueHandler() {
  const [gameStatus, setGameStatus] = useRecoilState(gameStatusState);
  const setSummoner = useSetRecoilState(summonerState);
  const setLeagueChampInfoList = useSetRecoilState(leagueChampInfoListState);

  useEffect(() => {
    /* 롤 클라이언트 on */
    ipcRenderer.on(IPC_KEY.ON_LEAGUE_CLIENT, (_, summoner: SummonerType) => {
      setSummoner(summoner);
    });

    /* 롤 클라이언트 off */
    ipcRenderer.on(IPC_KEY.SHUTDOWN_APP, () => {
      setGameStatus('none');
    });

    /* 챔피언 선택창 on */
    ipcRenderer.on(IPC_KEY.TEAM_JOIN_ROOM, (_, { roomName }) => {
      setGameStatus('champ-select');
      electronStore.set('team-voice-room-name', roomName);
    });

    /* 인게임 전 로딩창 on */
    ipcRenderer.on(IPC_KEY.LEAGUE_JOIN_ROOM, (_, { roomName, teamName, summonerDataList }) => {
      if (teamName !== roomName) {
        setGameStatus('loading');
        setLeagueChampInfoList(summonerDataList);
        electronStore.set('league-voice-room-name', { roomName, teamName });
      }
    });

    return () => {
      ipcRenderer.removeAllListeners(IPC_KEY.ON_LEAGUE_CLIENT);
      ipcRenderer.removeAllListeners(IPC_KEY.SHUTDOWN_APP);
      ipcRenderer.removeAllListeners(IPC_KEY.TEAM_JOIN_ROOM);
      ipcRenderer.removeAllListeners(IPC_KEY.LEAGUE_JOIN_ROOM);
    };
  }, []);

  useEffect(() => {
    if (gameStatus === 'none') {
      ipcRenderer.send(IPC_KEY.UPDATE_MATCH_HISTORY);
    }
  }, [gameStatus]);

  return { gameStatus };
}

export default useLeagueHandler;
