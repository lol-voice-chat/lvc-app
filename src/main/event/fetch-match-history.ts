import { ipcMain } from 'electron';
import { MatchHistory } from '../models/match-history';
import { IPC_KEY } from '../../const';
import { Friends } from '../models/friends';

export const handleFetchMatchHistoryEvent = (matchHistory: MatchHistory) => {
  ipcMain.on(IPC_KEY.FETCH_MATCH_HISTORY, async (event, { puuid, isMine }) => {
    if (isMine) {
      const isFriend = true;
      const summonerStats = await matchHistory.getSummonerStats();
      event.reply(IPC_KEY.FETCH_MATCH_HISTORY, { summonerStats, isFriend });
      return;
    }

    const [friends, _matchHistory]: [Friends, MatchHistory] = await Promise.all([
      Friends.fetch(),
      MatchHistory.fetch(puuid),
    ]);

    const summonerStats = await _matchHistory.getSummonerStats();
    const isFriend = friends.isFriend(puuid);
    event.reply(IPC_KEY.FETCH_MATCH_HISTORY, { summonerStats, isFriend });
    return;
  });
};

export default handleFetchMatchHistoryEvent;
