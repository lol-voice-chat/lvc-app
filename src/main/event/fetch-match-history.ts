import { ipcMain } from 'electron';
import { MatchHistory } from '../models/match-history';
import { IPC_KEY } from '../../const';
import { Friends } from '../models/friends';

export const handleFetchMatchHistoryEvent = () => {
  ipcMain.handle(IPC_KEY.FETCH_MATCH_HISTORY, async (event, { puuid, isMine }) => {
    const [friends, _matchHistory]: [Friends, MatchHistory] = await Promise.all([
      Friends.fetch(),
      MatchHistory.fetch(puuid),
    ]);

    const summonerStats = await _matchHistory.getSummonerStats();
    const isFriend = isMine ? true : friends.isFriend(puuid);
    return { summonerStats, isFriend };
  });
};

export default handleFetchMatchHistoryEvent;
