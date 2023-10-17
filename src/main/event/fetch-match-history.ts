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
    } else {
      const [friends, _matchHistory]: [Friends, MatchHistory] = await Promise.all([
        Friends.fetch(),
        MatchHistory.fetch(puuid),
      ]);
      console.log('1');

      const summonerStats = await _matchHistory.getSummonerStats();
      console.log('2');
      const isFriend = friends.isFriend(puuid);
      console.log('3');
      event.reply(IPC_KEY.FETCH_MATCH_HISTORY, { summonerStats, isFriend });
    }
  });
};

export default handleFetchMatchHistoryEvent;
