import { ipcMain } from 'electron';
import { MatchHistory, SummonerStats } from './MatchHistory';
import { IPC_KEY } from '../../const';
import { LeagueClient } from './LeagueClient';

interface Summoner {
  displayName: string;
  profileImage: string;
  tier: string;
  summonerStats: SummonerStats;
}

export const handleFriendStatsEvent = () => {
  ipcMain.on(IPC_KEY.FRIEND_STATS, async (event, puuid) => {
    const [leagueClient, matchHistory]: [LeagueClient, MatchHistory] = await Promise.all([
      LeagueClient.fetchByPuuid(puuid),
      MatchHistory.fetch(puuid),
    ]);

    const [summonerStats, tier]: [SummonerStats, string] = await Promise.all([
      matchHistory.getSummonerStats(),
      leagueClient.getOtherTier(),
    ]);
    console.log(tier);

    const summoner: Summoner = {
      displayName: leagueClient.gameName,
      profileImage: leagueClient.getProfileImage(),
      tier,
      summonerStats,
    };

    event.reply(IPC_KEY.FRIEND_STATS, summoner);
  });
};

export default handleFriendStatsEvent;
