import league from '../utils/league';
import { WebContents } from 'electron';
import { LCU_ENDPOINT } from '../constants';
import { champSelectEvent, gameLoadingEvent, inProgressEvent } from './event';
import { createWebSocketConnection } from 'league-connect';
import { SummonerData } from './onLeagueClientUx';
import { MatchHistoryData } from './models/MatchHistory';
import { voiceRoomNameGenerator } from '../utils/voiceRoomNameGenerator';
import { IPC_KEY } from '../../const';
import { Gameflow } from './models';
import { plainToInstance } from 'class-transformer';

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

  const gameflow: Gameflow = plainToInstance(Gameflow, gameflowData);
  await handleLeaguePhase(gameflow, webContents, summoner.summonerId);

  champSelectEvent(webContents, summoner, ws, pvpMatchlist, isJoinedRoom);
  gameLoadingEvent(webContents, summoner, ws, isStartedGameLoading);
  inProgressEvent(webContents, ws, isStartedInGame);
};

async function handleLeaguePhase(gameflow: Gameflow, webContents: WebContents, summonerId: number) {
  if (gameflow.isChampSelectPhase()) {
    const { myTeam } = await league(LCU_ENDPOINT.CHAMP_SELECT_URL);
    const roomName = voiceRoomNameGenerator(myTeam);
    webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName });
    isJoinedRoom = true;
    return;
  }

  if (gameflow.isGameLoadingPhase()) {
    const { teamOne, teamTwo } = gameflow.gameData;

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

  if (gameflow.isInGamePhase()) {
    const { teamOne, teamTwo } = gameflow.gameData;

    const foundSummoner = teamOne.find((summoner: any) => summoner.summonerId === summonerId);
    const myTeamVoiceRoomName: string = voiceRoomNameGenerator(foundSummoner ? teamOne : teamTwo);

    webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName: myTeamVoiceRoomName });
    webContents.send(IPC_KEY.START_IN_GAME);
    isStartedInGame = true;
    return;
  }
}
