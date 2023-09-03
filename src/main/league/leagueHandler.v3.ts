import league from './league';
import { WebContents } from 'electron';
import { IPC_KEY } from '../../const/index';
import { LCU_ENDPOINT, PHASE } from '../const';
import { LeagueWebSocket, createWebSocketConnection } from 'league-connect';

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

  await checkCurrentLeagueEntryPoint(webContents);

  ws.subscribe(LCU_ENDPOINT.CHAMP_SELECT_URL, async (data) => {
    if (data.timer.phase === 'BAN_PICK' && !isJoinedRoom) {
      const roomName: string = createVoiceRoomName(data.myTeam);
      webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName });
      isJoinedRoom = true;
    }

    if (await isCloseChampionSelectionWindow(data.timer.phase)) {
      webContents.send(IPC_KEY.EXIT_CHAMP_SELECT);
      isJoinedRoom = false;
    }
  });

  async function isCloseChampionSelectionWindow(phase: string) {
    const gameflowPhase = await league(LCU_ENDPOINT.GAMEFLOW_PHASE_URL);
    const isNotChampSelect: boolean = gameflowPhase === PHASE.NONE || gameflowPhase === PHASE.LOBBY;
    return isJoinedRoom && phase === '' && isNotChampSelect;
  }

  ws.subscribe(LCU_ENDPOINT.GAMEFLOW_URL, async (data) => {
    if (isGameLoadingWindow(data) && !isStartedGameLoading) {
      const { teamOne, teamTwo } = data.gameData;

      const teamOneVoiceRoomName: string = createVoiceRoomName(teamOne);
      const teamTwoVoiceRoomName: string = createVoiceRoomName(teamTwo);
      const roomName = teamOneVoiceRoomName + teamTwoVoiceRoomName;
      const myTeamVoiceRoomName: string = await getMyTeamRoomName(teamOne, teamTwo);

      webContents.send(IPC_KEY.LEAGUE_JOIN_ROOM, { roomName, teamName: `${myTeamVoiceRoomName}` });
      isStartedGameLoading = true;
    }

    if (isCloseGameLoadingWindow(data)) {
      webContents.send(IPC_KEY.EXIT_IN_GAME);
      isStartedGameLoading = false;
    }

    if (isInGameWindow(data) && !isStartedInGame) {
      webContents.send(IPC_KEY.START_IN_GAME);
      isStartedInGame = true;
    }

    if (isCloseInGameWindow(data)) {
      webContents.send(IPC_KEY.EXIT_IN_GAME);
      isStartedInGame = false;
    }
  });

  function isCloseGameLoadingWindow(data: GameflowData) {
    return data.phase === PHASE.NONE && !data.gameClient.visible && isStartedGameLoading;
  }

  function isCloseInGameWindow(data: GameflowData) {
    return data.phase === PHASE.NONE && data.gameClient.visible && isStartedInGame;
  }
};

async function checkCurrentLeagueEntryPoint(webContents: WebContents) {
  const gameflowData: GameflowData = await league(LCU_ENDPOINT.GAMEFLOW_URL);

  if (gameflowData.phase === PHASE.CHAMP_SELECT) {
    const { myTeam } = await league(LCU_ENDPOINT.CHAMP_SELECT_URL);
    const roomName: string = createVoiceRoomName(myTeam);
    webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName });
    return;
  }

  if (isGameLoadingWindow(gameflowData)) {
    const { teamOne, teamTwo } = gameflowData.gameData;

    const teamOneVoiceRoomName: string = createVoiceRoomName(teamOne);
    const teamTwoVoiceRoomName: string = createVoiceRoomName(teamTwo);
    const roomName = teamOneVoiceRoomName + teamTwoVoiceRoomName;

    const myTeamVoiceRoomName: string = await getMyTeamRoomName(teamOne, teamTwo);
    webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName: myTeamVoiceRoomName });
    webContents.send(IPC_KEY.LEAGUE_JOIN_ROOM, { roomName, teamName: `${myTeamVoiceRoomName}` });
    return;
  }

  if (isInGameWindow(gameflowData)) {
    const { teamOne, teamTwo } = gameflowData.gameData;

    const myTeamVoiceRoomName = await getMyTeamRoomName(teamOne, teamTwo);
    webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName: myTeamVoiceRoomName });
    webContents.send(IPC_KEY.START_IN_GAME);
    return;
  }
}

function isGameLoadingWindow(data: GameflowData) {
  return data.phase === PHASE.IN_GAME && !data.gameClient.visible;
}

function isInGameWindow(data: GameflowData) {
  return data.phase === PHASE.IN_GAME && data.gameClient.visible;
}

async function getMyTeamRoomName(teamOne: [], teamTwo: []) {
  const { summonerId } = await league(LCU_ENDPOINT.SUMMONER_URL);
  const foundSummoner = teamOne.find((summoner: any) => summoner.summonerId === summonerId);
  return createVoiceRoomName(foundSummoner ? teamOne : teamTwo);
}

function createVoiceRoomName(team: []) {
  const summonerIds: string[] = team.map((summoner: any) => summoner.summonerId);
  return summonerIds.join('');
}
