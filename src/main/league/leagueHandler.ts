import { createWebSocketConnection, LeagueWebSocket } from 'league-connect';
import league from './league';
import { WebContents } from 'electron';
import { IPC_KEY } from '../../const/index';
import { LCU_ENDPOINT, PHASE } from '../const';

type GameflowData = {
  gameClient: {
    running: boolean;
    visible: boolean;
  };
  phase: string;
  gameData: {
    teamOne: [];
    teamTwo: [];
  };
};

export const leagueHandler = async (webContents: WebContents) => {
  const ws: LeagueWebSocket = await createWebSocketConnection();
  let isJoinedRoom = false;
  let isStartedGameLoading = false;
  let isStartedInGame = false;

  const gameflowData: GameflowData = await league(LCU_ENDPOINT.GAMEFLOW_URL);

  //챔피언 선택
  if (isChampionSelectionWindow(gameflowData)) {
    const { myTeam } = await league(LCU_ENDPOINT.CHAMP_SELECT_URL);
    joinTeamVoiceRoom(myTeam);
  } else {
    ws.subscribe(LCU_ENDPOINT.CHAMP_SELECT_URL, (data) => {
      if (!isJoinedRoom) {
        joinTeamVoiceRoom(data.myTeam);
      }
    });
  }

  function isChampionSelectionWindow(data: GameflowData) {
    return data.phase === PHASE.CHAMP_SELECT;
  }

  function joinTeamVoiceRoom(myTeam: []) {
    const roomName: string = createVoiceRoomName(myTeam);
    webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName });
    isJoinedRoom = true;
  }

  //챔피언선택 종료
  ws.subscribe(LCU_ENDPOINT.CHAMP_SELECT_URL, async (data) => {
    if (await isCloseChampionSelectionWindow(data.timer.phase)) {
      webContents.send(IPC_KEY.EXIT_CHAMP_SELECT);
      isJoinedRoom = false;
    }
  });

  async function isCloseChampionSelectionWindow(phase: string) {
    const gameflowPhase = await league(LCU_ENDPOINT.GAMEFLOW_PHASE_URL);
    return isJoinedRoom && phase === '' && gameflowPhase === PHASE.NONE;
  }

  //게임로딩
  if (isGameLoadingWindow(gameflowData)) {
    if (!isJoinedRoom) {
      const { myTeam } = await league(LCU_ENDPOINT.CHAMP_SELECT_URL);
      joinTeamVoiceRoom(myTeam);
    }

    await joinLeagueVoiceRoom(gameflowData);
  } else {
    ws.subscribe(LCU_ENDPOINT.GAMEFLOW_URL, async (data) => {
      if (isGameLoadingWindow(data)) {
        await joinLeagueVoiceRoom(data);
      }
    });
  }

  function isGameLoadingWindow(data: GameflowData) {
    return data.phase === PHASE.IN_GAME && !data.gameClient.visible && !isStartedGameLoading;
  }

  async function joinLeagueVoiceRoom(data: GameflowData) {
    const { teamOne, teamTwo } = data.gameData;

    const teamOneVoiceRoomName: string = createVoiceRoomName(teamOne);
    const teamTwoVoiceRoomName: string = createVoiceRoomName(teamTwo);
    const roomName = teamOneVoiceRoomName + teamTwoVoiceRoomName;

    const teamName: string = await getTeamName(teamOne);
    webContents.send(IPC_KEY.LEAGUE_JOIN_ROOM, { roomName, teamName });
    isStartedGameLoading = true;
  }

  async function getTeamName(teamOne: []) {
    const { summonerId } = await league(LCU_ENDPOINT.SUMMONER_URL);
    const foundSummoner = teamOne.find((summoner: any) => summoner.summonerId === summonerId);
    return foundSummoner ? 'teamOne' : 'teamTwo';
  }

  //게임로딩 종료
  ws.subscribe(LCU_ENDPOINT.GAMEFLOW_URL, (data) => {
    if (isCloseGameLoadingWindow(data)) {
      webContents.send(IPC_KEY.EXIT_IN_GAME);
      isStartedGameLoading = false;
    }
  });

  function isCloseGameLoadingWindow(data: GameflowData) {
    return data.phase === PHASE.NONE && !data.gameClient.visible && isStartedGameLoading;
  }

  //인게임
  if (isStartInGame(gameflowData)) {
    if (!isJoinedRoom) {
      const { myTeam } = await league(LCU_ENDPOINT.CHAMP_SELECT_URL);
      joinTeamVoiceRoom(myTeam);
    }

    webContents.send(IPC_KEY.START_IN_GAME);
    isStartedInGame = true;
  } else {
    ws.subscribe(LCU_ENDPOINT.GAMEFLOW_URL, async (data) => {
      if (isStartInGame(data)) {
        webContents.send(IPC_KEY.START_IN_GAME);
        isStartedInGame = true;
      }
    });
  }

  function isStartInGame(data: GameflowData) {
    return data.phase === PHASE.IN_GAME && data.gameClient.visible && !isStartedInGame;
  }

  //인게임 종료
  ws.subscribe(LCU_ENDPOINT.GAMEFLOW_URL, async (data) => {
    if (isCloseInGame(data)) {
      webContents.send(IPC_KEY.EXIT_IN_GAME);
      isStartedInGame = false;
    }
  });

  function isCloseInGame(data: GameflowData) {
    return data.phase === PHASE.NONE && data.gameClient.visible && isStartedInGame;
  }
};

function createVoiceRoomName(team: []) {
  const summonerIds: string[] = team.map((summoner: any) => summoner.summonerId);
  return summonerIds.join('');
}
