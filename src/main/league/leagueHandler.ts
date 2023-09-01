import { createWebSocketConnection, LeagueWebSocket } from 'league-connect';
import league from './league';
import { WebContents } from 'electron';
import { IPC_KEY } from '../../const/index';
import { LCU_ENDPOINT, PHASE } from '../const';

type Team = {
  summonerId: string;
};

type GameflowData = {
  gameClient: {
    running: boolean;
    visible: boolean;
  };
  phase: string;
  gameData: {
    teamOne: Team[];
    teamTwo: Team[];
  };
};

export const leagueHandler = async (webContents: WebContents) => {
  const ws: LeagueWebSocket = await createWebSocketConnection();
  let isJoinedRoom = false;
  let isMovedGameLoadingWindow = false;

  const gameflowData: GameflowData = await league(LCU_ENDPOINT.GAMEFLOW_URL);

  if (isChampionSelectionWindow(gameflowData)) {
    const { myTeam } = await league(LCU_ENDPOINT.CHAMP_SELECT_URL);
    const roomName: string = createVoiceRoomName(myTeam);
    webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName });
  } else {
    ws.subscribe(LCU_ENDPOINT.CHAMP_SELECT_URL, async (data) => {
      if (!isJoinedRoom) {
        const roomName: string = createVoiceRoomName(data.myTeam);
        webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName });
        isJoinedRoom = true;
      }

      if (await isCloseChampionSelectionWindow(data.timer.phase)) {
        webContents.send(IPC_KEY.EXIT_CHAMP_SELECT);
        isJoinedRoom = false;
      }
    });
  }

  function isChampionSelectionWindow(data: GameflowData) {
    return data.phase === PHASE.CHAMP_SELECT;
  }

  async function isCloseChampionSelectionWindow(phase: string) {
    const gameflowPhase = await league(LCU_ENDPOINT.GAMEFLOW_PHASE_URL);
    return isJoinedRoom && phase === '' && gameflowPhase === PHASE.NONE;
  }

  if (isGameLoadingWindow(gameflowData)) {
    if (!isJoinedRoom) {
      const { myTeam } = await league(LCU_ENDPOINT.CHAMP_SELECT_URL);
      const roomName: string = createVoiceRoomName(myTeam);
      webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName });
      isJoinedRoom = true;
    }

    const { teamOne, teamTwo } = gameflowData.gameData;
    const roomName: string = await createLeagueVoiceRoomName(teamOne, teamTwo);
    const teamName: string = await getTeamName(teamOne);

    webContents.send(IPC_KEY.LEAGUE_JOIN_ROOM, { roomName, teamName });
  } else {
    ws.subscribe(LCU_ENDPOINT.GAMEFLOW_URL, async (data) => {
      if (isGameLoadingWindow(data) && !isMovedGameLoadingWindow) {
        const { teamOne, teamTwo } = data.gameData;
        const roomName: string = await createLeagueVoiceRoomName(teamOne, teamTwo);
        const teamName: string = await getTeamName(teamOne);

        webContents.send(IPC_KEY.LEAGUE_JOIN_ROOM, { roomName, teamName });
        isMovedGameLoadingWindow = true;
      }
    });
  }

  function isGameLoadingWindow(data: GameflowData) {
    return data.phase === PHASE.IN_GAME && !data.gameClient.visible;
  }

  async function createLeagueVoiceRoomName(teamOne: Team[], teamTwo: Team[]) {
    const teamOneVoiceRoomName: string = createVoiceRoomName(teamOne);
    const teamTwoVoiceRoomName: string = createVoiceRoomName(teamTwo);
    return teamOneVoiceRoomName + teamTwoVoiceRoomName;
  }

  async function getTeamName(teamOne: Team[]) {
    const { summonerId } = await league(LCU_ENDPOINT.SUMMONER_URL);
    const foundSummoner = teamOne.find((summoner) => summoner.summonerId === summonerId);
    return foundSummoner ? 'teamOne' : 'teamTwo';
  }
};

function createVoiceRoomName(team: Team[]) {
  const summonerIds: string[] = team.map((summoner: Team) => summoner.summonerId);
  return summonerIds.join('');
}
