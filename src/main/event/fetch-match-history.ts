import { ipcMain } from 'electron';
import { MatchHistory } from '../models/match-history';
import { IPC_KEY } from '../../const';
import { request } from '../lib/common';

export const handleFetchMatchHistoryEvent = (matchHistory: MatchHistory) => {
  ipcMain.on(IPC_KEY.FETCH_MATCH_HISTORY, async (event, { puuid, isMine }) => {
    if (isMine) {
      const isFriend = true;
      const summonerStats = await matchHistory.getSummonerStats();
      event.reply(IPC_KEY.FETCH_MATCH_HISTORY, { summonerStats, isFriend });
      return;
    }

    const [friendList, _matchHistory] = await Promise.all([
      request('/lol-chat/v1/friends'),
      MatchHistory.fetch(puuid),
    ]);

    const summonerStats = await _matchHistory.getSummonerStats();
    const isFriend = friendList.some((friend: any) => friend.puuid === puuid);
    event.reply(IPC_KEY.FETCH_MATCH_HISTORY, { summonerStats, isFriend });
    return;
  });
};

export default handleFetchMatchHistoryEvent;
