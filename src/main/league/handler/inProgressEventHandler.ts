import { WebContents } from 'electron';
import { GameflowData } from '../leagueHandler';
import { LCU_ENDPOINT, PHASE } from '../../const';
import { voiceRoomNameGenerator } from '../common/voiceRoomNameGenerator';
import { IPC_KEY } from '../../../const/index';
import { LeagueWebSocket } from 'league-connect';
import { SummonerData } from '../onLeagueClientUx';

let isStartedInGame = false;

export const handle = (
  gameflowData: GameflowData,
  webContents: WebContents,
  summoner: SummonerData,
  ws: LeagueWebSocket
) => {
  const { summonerId } = summoner;
  if (isInGameWindow(gameflowData)) {
    const { teamOne, teamTwo } = gameflowData.gameData;

    const foundSummoner = teamOne.find((summoner: any) => summoner.summonerId === summonerId);
    const myTeamVoiceRoomName: string = voiceRoomNameGenerator(foundSummoner ? teamOne : teamTwo);
    webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName: myTeamVoiceRoomName });
    webContents.send(IPC_KEY.START_IN_GAME);
    isStartedInGame = true;
    return;
  }

  ws.subscribe(LCU_ENDPOINT.GAMEFLOW_URL, async (data) => {
    if (isInGameWindow(data) && !isStartedInGame) {
      webContents.send(IPC_KEY.START_IN_GAME);
      isStartedInGame = true;
    }

    if (isCloseInGameWindow(data)) {
      webContents.send(IPC_KEY.EXIT_IN_GAME);
      isStartedInGame = false;
    }
  });
};

function isInGameWindow(data: GameflowData) {
  return data.phase === PHASE.IN_GAME && data.gameClient.visible;
}

function isCloseInGameWindow(data: GameflowData) {
  return data.phase === PHASE.NONE && data.gameClient.visible && isStartedInGame;
}
