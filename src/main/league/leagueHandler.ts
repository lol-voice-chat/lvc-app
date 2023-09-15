import league from '../utils/league';
import { WebContents } from 'electron';
import { LCU_ENDPOINT, PHASE } from '../const';
import { champSelectEvent, gameLoadingEvent, inProgressEvent } from './event';
import { createWebSocketConnection } from 'league-connect';
import { MatchHistoryData, SummonerData } from './onLeagueClientUx';
import { voiceRoomNameGenerator } from '../utils/voiceRoomNameGenerator';
import { IPC_KEY } from '../../const';

interface GameflowData {
  gameClient: {
    running: boolean;
    visible: boolean;
  };
  phase: string;
  gameData: {
    teamOne: [];
    teamTwo: [];
  };
}

let isJoinedRoom = false;
let isStartedGameLoading = false;
let isStartedInGame = false;

export const leagueHandler = async (
  webContents: WebContents,
  summoner: SummonerData,
  pvpMatchlist: MatchHistoryData[]
) => {
  const [ws, gameflowData] = await Promise.all([
    createWebSocketConnection(),
    league(LCU_ENDPOINT.GAMEFLOW_URL),
  ]);

  await handleLeaguePhase(gameflowData, webContents, summoner.summonerId);

  champSelectEvent(webContents, summoner, ws, pvpMatchlist, isJoinedRoom);
  gameLoadingEvent(webContents, summoner, ws, isStartedGameLoading);
  inProgressEvent(webContents, ws, isStartedInGame);
};

//앱 키자마자 phase 확인
async function handleLeaguePhase(
  gameflowData: GameflowData,
  webContents: WebContents,
  summonerId: number
) {
  if (gameflowData.phase === PHASE.CHAMP_SELECT) {
    const { myTeam } = await league(LCU_ENDPOINT.CHAMP_SELECT_URL);
    const roomName = voiceRoomNameGenerator(myTeam);
    webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName });
    isJoinedRoom = true;
    return;
  }

  if (gameflowData.phase === PHASE.IN_GAME && !gameflowData.gameClient.visible) {
    const { teamOne, teamTwo } = gameflowData.gameData;

    const teamOneVoiceRoomName: string = voiceRoomNameGenerator(teamOne);
    const teamTwoVoiceRoomName: string = voiceRoomNameGenerator(teamTwo);
    const roomName = teamOneVoiceRoomName + teamTwoVoiceRoomName;

    const foundSummoner = teamOne.find((summoner: any) => summoner.summonerId === summonerId);
    const myTeamVoiceRoomName: string = voiceRoomNameGenerator(foundSummoner ? teamOne : teamTwo);
    webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName: myTeamVoiceRoomName });
    webContents.send(IPC_KEY.LEAGUE_JOIN_ROOM, { roomName, teamName: `${myTeamVoiceRoomName}` });
    isStartedGameLoading = true;
    return;
  }

  if (gameflowData.phase === PHASE.IN_GAME && gameflowData.gameClient.visible) {
    const { teamOne, teamTwo } = gameflowData.gameData;

    const foundSummoner = teamOne.find((summoner: any) => summoner.summonerId === summonerId);
    const myTeamVoiceRoomName: string = voiceRoomNameGenerator(foundSummoner ? teamOne : teamTwo);
    webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName: myTeamVoiceRoomName });
    webContents.send(IPC_KEY.START_IN_GAME);
    isStartedInGame = true;
    return;
  }
}
