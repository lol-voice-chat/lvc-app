import { createWebSocketConnection, LeagueWebSocket } from 'league-connect';
import league from './league';
import { WebContents } from 'electron';

let isJoinedRoom: boolean = false;
let isMovedGameLoadingWindow: boolean = false;

export const leagueHandler = async (webContents: WebContents) => {
  const gameflowData = await league('GET', '/lol-gameflow/v1/session');
  const ws: LeagueWebSocket = await createWebSocketConnection();

  if (isChampionSelectionWindow(gameflowData.phase)) {
    const { myTeam } = await league('GET', '/lol-champ-select/v1/session');
    const roomName: string = createVoiceRoomName(myTeam);
    webContents.send('join-room', { roomName });
  } else {
    ws.subscribe('/lol-champ-select/v1/session', async (data) => {
      if (!isJoinedRoom) {
        const roomName: string = createVoiceRoomName(data.myTeam);
        webContents.send('join-room', { roomName });
        isJoinedRoom = true;
      }

      if (isCloseChampionSelectionWindow(data.timer.phase)) {
        webContents.send('exit-champ-select');
        isJoinedRoom = false;
      }
    });
  }

  function isChampionSelectionWindow(phase: string): boolean {
    return phase === 'ChampSelect';
  }

  function isCloseChampionSelectionWindow(phase: string): boolean {
    return isJoinedRoom && phase === '';
  }

  if (isGameLoadingWindow(gameflowData)) {
    if (!isJoinedRoom) {
      const { myTeam } = await league('GET', '/lol-champ-select/v1/session');
      const roomName: string = createVoiceRoomName(myTeam);
      webContents.send('join-room', { roomName });
      isJoinedRoom = true;
    }

    const { teamOne, teamTwo } = gameflowData.gameData;
    const teamOneVoiceRoomName: string = createVoiceRoomName(teamOne);
    const teamTwoVoiceRoomName: string = createVoiceRoomName(teamTwo);

    webContents.send('game-loading', { teamOneVoiceRoomName, teamTwoVoiceRoomName });
  } else {
    ws.subscribe('/lol-gameflow/v1/sessioin', async (data) => {
      if (isGameLoadingWindow(data) && !isMovedGameLoadingWindow) {
        const { teamOne, teamTwo } = data.gameData;
        const teamOneVoiceRoomName: string = createVoiceRoomName(teamOne);
        const teamTwoVoiceRoomName: string = createVoiceRoomName(teamTwo);

        webContents.send('game-loading', { teamOneVoiceRoomName, teamTwoVoiceRoomName });
        isMovedGameLoadingWindow = true;
      }
    });
  }

  function isGameLoadingWindow(gameflowData: any) {
    return gameflowData.phase === 'InProgress' && !gameflowData.gameClient.visible;
  }
};

function createVoiceRoomName(team: []) {
  const summonerIds: string[] = team.map((summoner: { summonerId: string }) => summoner.summonerId);
  return summonerIds.join('');
}
