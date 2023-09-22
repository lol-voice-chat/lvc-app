import { ipcMain } from 'electron';
import { MatchHistory, SummonerStats } from './MatchHistory';
import { LeagueClient } from './LeagueClient';
import { IPC_KEY } from '../../const';
import EventEmitter from 'events';

interface Summoner {
  displayName: string;
  profileImage: string;
  tier: string;
  statusMessage: string;
  summonerStats: SummonerStats;
}

export const friendStatsEvent = new EventEmitter();

friendStatsEvent.on(IPC_KEY.FRIEND_STATS, () => {
  ipcMain.on(IPC_KEY.FRIEND_STATS, async (event, { id, puuid }) => {
    const [leagueClient, matchHistory]: [LeagueClient, MatchHistory] = await Promise.all([
      LeagueClient.fetchFriend(id),
      MatchHistory.fetch(puuid),
    ]);

    const summonerStats: SummonerStats = await matchHistory.getSummonerStats();

    const summoner: Summoner = {
      displayName: leagueClient.gameName,
      profileImage: leagueClient.getProfileImage(),
      tier: leagueClient.getTier(),
      statusMessage: leagueClient.statusMessage,
      summonerStats,
    };

    event.reply(IPC_KEY.FRIEND_STATS, summoner);
  });
});
