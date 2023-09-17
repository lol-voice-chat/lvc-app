import { WebContents } from 'electron';
import { LCU_ENDPOINT, PHASE } from '../../constants';
import { IPC_KEY } from '../../../const/index';
import { LeagueWebSocket } from 'league-connect';

export const inProgressEvent = (
  webContents: WebContents,
  ws: LeagueWebSocket,
  isStartedInGame: boolean
) => {
  ws.subscribe(LCU_ENDPOINT.GAMEFLOW_URL, async (data) => {
    if (data.phase === PHASE.IN_GAME && data.gameClient.visible && !isStartedInGame) {
      webContents.send(IPC_KEY.START_IN_GAME);
      isStartedInGame = true;
    }

    if (data.phase === PHASE.NONE && data.gameClient.visible && isStartedInGame) {
      webContents.send(IPC_KEY.EXIT_IN_GAME);
      isStartedInGame = false;
    }
  });
};
