import { ipcMain } from 'electron';
import { MatchHistory, SummonerStats } from './MatchHistory';
import { IPC_KEY } from '../../const';
import { LeagueClient } from './LeagueClient';

interface Summoner {
  displayName: string;
  profileImage: string;
  tier: string;
  statusMessage: string;
  summonerStats: SummonerStats;
}

export const handleFriendStatsEvent = () => {
  ipcMain.on(IPC_KEY.FRIEND_STATS, async (event, puuid) => {
    const [leagueClient, matchHistory]: [LeagueClient, MatchHistory] = await Promise.all([
      LeagueClient.fetchByPuuid(puuid),
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
};

export default handleFriendStatsEvent;
