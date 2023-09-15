import league from '../common/league';
import { WebContents } from 'electron';
import { LCU_ENDPOINT } from '../const';
import * as champSelectEventHandler from '../league/handler/champSelectEventHandler';
import * as gameLoadingEventHandler from '../league/handler/gameLoadingEventHandler';
import * as inProgressEventHandler from '../league/handler/inProgressEventHandler';
import { createWebSocketConnection } from 'league-connect';
import { SummonerData } from './onLeagueClientUx';

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

export const leagueHandler = async (
  webContents: WebContents,
  summoner: SummonerData,
  pvpMatchlist: any[]
) => {
  const [ws, gameflowData] = await Promise.all([
    createWebSocketConnection(),
    league(LCU_ENDPOINT.GAMEFLOW_URL),
  ]);

  champSelectEventHandler.handle(gameflowData, webContents, summoner, ws, pvpMatchlist);
  gameLoadingEventHandler.handle(gameflowData, webContents, summoner, ws);
  inProgressEventHandler.handle(gameflowData, webContents, summoner, ws);
};
