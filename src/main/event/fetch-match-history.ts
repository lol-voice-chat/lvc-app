import { ipcMain } from 'electron';
import { MatchHistory, SummonerStats } from '../models/match-history';
import { IPC_KEY } from '../../const';
import { Friends } from '../models/friends';
import { redisClient } from '../lib/redis-client';
import { credentials } from '../lvc-application';

export const handleFetchMatchHistoryEvent = () => {
  ipcMain.handle(IPC_KEY.FETCH_MATCH_HISTORY, async (event, { puuid, isMine }) => {
    if (!credentials) {
      return {
        summonerStats: null,
        isFriend: null,
        isError: true,
      };
    }

    const [friends, summonerStatsData]: [Friends, string | undefined] = await Promise.all([
      Friends.fetch(),
      redisClient.hGet(puuid + 'match', 'summonerStats'),
    ]);

    const isFriend = isMine ? true : friends.isFriend(puuid);
    if (summonerStatsData) {
      const summonerStats = JSON.parse(summonerStatsData);
      const isError = false;

      return { summonerStats, isFriend, isError };
    }

    const matchHistory: MatchHistory = await MatchHistory.fetch(puuid);
    const summonerStats: SummonerStats = await matchHistory.getSummonerStats();
    const isError = summonerStats === null ? true : false;
    return { summonerStats, isFriend, isError };
  });
};

export default handleFetchMatchHistoryEvent;
