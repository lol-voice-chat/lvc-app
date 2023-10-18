import { ipcMain } from 'electron';
import { MatchHistory, SummonerStats } from '../models/match-history';
import { IPC_KEY } from '../../const';
import { Friends } from '../models/friends';
import { redisClient } from '../lib/redis-client';

export const handleFetchMatchHistoryEvent = () => {
  ipcMain.handle(IPC_KEY.FETCH_MATCH_HISTORY, async (event, { puuid, isMine }) => {
    const [friends, summonerStatsData]: [Friends, string | undefined] = await Promise.all([
      Friends.fetch(),
      redisClient.hGet(puuid + 'match', 'summonerStats'),
    ]);

    const isFriend = isMine ? true : friends.isFriend(puuid);
    if (summonerStatsData) {
      const summonerStats = JSON.parse(summonerStatsData);
      return { summonerStats, isFriend };
    }

    const matchHistory: MatchHistory = await MatchHistory.fetch(puuid);
    const summonerStats: SummonerStats = await matchHistory.getSummonerStats();
    return { summonerStats, isFriend };
  });
};

export default handleFetchMatchHistoryEvent;
