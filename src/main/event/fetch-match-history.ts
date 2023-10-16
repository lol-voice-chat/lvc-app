import { ipcMain } from 'electron';
import { MatchHistory } from '../models/match-history';
import { IPC_KEY } from '../../const';

export const handleFetchMatchHistoryEvent = (matchHistory: MatchHistory) => {
  ipcMain.on(IPC_KEY.FETCH_MATCH_HISTORY, async (event, { puuid, isMine }) => {
    if (isMine) {
      const summonerStats = await matchHistory.getSummonerStats();
      event.reply(IPC_KEY.FETCH_MATCH_HISTORY, summonerStats);
      return;
    }

    const _matchHistory = await MatchHistory.fetch(puuid);
    const summonerStats = await _matchHistory.getSummonerStats();
    event.reply(IPC_KEY.FETCH_MATCH_HISTORY, summonerStats);
    return;
  });
};

export default handleFetchMatchHistoryEvent;
