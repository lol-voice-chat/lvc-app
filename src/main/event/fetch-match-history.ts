import { ipcMain } from 'electron';
import { MatchHistory, SummonerStats } from '../models/match-history';
import { IPC_KEY } from '../../const';
import { Friends } from '../models/friends';
import { redisClient } from '../lib/redis-client';
import { credentials } from '../lvc-application';
import { createHttp1Request } from 'league-connect';

export const handleFetchMatchHistoryEvent = () => {
  ipcMain.handle(IPC_KEY.FETCH_MATCH_HISTORY, async (event, { puuid, isMine }) => {
    if (!credentials) {
      return {
        summonerStats: null,
        isFriend: null,
        isError: true,
      };
    }

    try {
      //롤 프로그램이 완전히 꺼지기 전 체크
      await createHttp1Request(
        {
          method: 'GET',
          url: '/lol-chat/v1/me',
        },
        credentials!
      );
    } catch (error) {
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
    const isError = false;

    if (summonerStatsData) {
      const summonerStats = JSON.parse(summonerStatsData);
      return { summonerStats, isFriend, isError };
    }

    const matchHistory: MatchHistory = await MatchHistory.fetch(puuid);
    const summonerStats: SummonerStats = await matchHistory.getSummonerStats();

    const key = puuid + 'match';
    await redisClient.hSet(key, {
      summonerStats: JSON.stringify(summonerStats),
      length: matchHistory.matchLength.toString(),
    });

    return { summonerStats, isFriend, isError };
  });
};

export default handleFetchMatchHistoryEvent;
