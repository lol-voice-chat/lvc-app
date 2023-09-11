import league from '../league/common/league';
import { WebContents } from 'electron';
import { LCU_ENDPOINT } from '../const';
import * as champSelectEventHandler from '../league/handler/champSelectEventHandler';
import * as gameLoadingEventHandler from '../league/handler/gameLoadingEventHandler';
import * as inProgressEventHandler from '../league/handler/inProgressEventHandler';
import { LeagueWebSocket, createWebSocketConnection } from 'league-connect';
import { SummonerInfo } from './onLeagueClientUx';

export type GameflowData = {
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

export const leagueHandler = async (webContents: WebContents, summoner: SummonerInfo) => {
  const ws: LeagueWebSocket = await createWebSocketConnection();
  const gameflowData: GameflowData = await league(LCU_ENDPOINT.GAMEFLOW_URL);

  champSelectEventHandler.handle(gameflowData, webContents, summoner, ws);
  gameLoadingEventHandler.handle(gameflowData, webContents, summoner, ws);
  inProgressEventHandler.handle(gameflowData, webContents, summoner, ws);
};
