import { createWebSocketConnection, LeagueWebSocket } from 'league-connect';
import league from './league';
import { WebContents } from 'electron';

let isJoinedRoom: boolean = false;

export const leagueHandler = async (webContents: WebContents) => {
  const ws: LeagueWebSocket = await createWebSocketConnection({
    authenticationOptions: {
      awaitConnection: true,
    },
  });

  //챔피언 선택
  const gameflowData = await league('GET', '/lol-gameflow/v1/session');
  if (gameflowData.phase === 'ChampSelect') {
    const { myTeam } = await league('GET', '/lol-champ-select/v1/session');
    const roomName: string = createTeamRoomName(myTeam);
    webContents.send('join-room', { roomName });
  } else {
    ws.subscribe('/lol-champ-select/v1/session', async (data) => {
      if (!isJoinedRoom) {
        const roomName: string = createTeamRoomName(data.myTeam);
        webContents.send('join-room', { roomName });
        isJoinedRoom = true;
      }

      //챔피언선택 종료
      if (isJoinedRoom && data.timer.phase === '') {
        webContents.send('exit-champ-select');
        isJoinedRoom = false;
      }
    });
  }

  function createTeamRoomName(myTeam: []) {
    const summonerIds: string[] = myTeam.map(
      (summoner: { summonerId: string }) => summoner.summonerId
    );

    return summonerIds.join('');
  }

  //게임 로딩창
  if (gameflowData.phase === 'InProgress' && !gameflowData.gameClient.visible) {
    if (!isJoinedRoom) {
      const { myTeam } = await league('GET', '/lol-champ-select/v1/session');
      const roomName: string = createTeamRoomName(myTeam);
      webContents.send('join-room', { roomName });
    }

    const { teamOne, teamTwo } = gameflowData.gameData;
    const teamOneSummonerIds: string[] = teamOne.map(
      (summoner: { summonerId: string }) => summoner.summonerId
    );
    const teamTwoSummonerIds: string[] = teamTwo.map(
      (summoner: { summonerId: string }) => summoner.summonerId
    );

    const gameVoiceRoomName: string = teamOneSummonerIds.join('') + teamTwoSummonerIds.join('');

    webContents.send('game-loading', { roomName: gameVoiceRoomName });
  } else {
    ws.subscribe('/lol-gameflow/v1/sessioin', async (data) => {
      if (data.phase === 'InProgress' && !data.gameClient.visible) {
        const { teamOne, teamTwo } = data.gameData;
        const teamOneSummonerIds: string[] = teamOne.map(
          (summoner: { summonerId: string }) => summoner.summonerId
        );
        const teamTwoSummonerIds: string[] = teamTwo.map(
          (summoner: { summonerId: string }) => summoner.summonerId
        );

        const gameVoiceRoomName: string = teamOneSummonerIds.join('') + teamTwoSummonerIds.join('');

        webContents.send('game-loading', { roomName: gameVoiceRoomName });
      }
    });
  }
};
