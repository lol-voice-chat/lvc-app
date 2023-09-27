import { ipcMain } from 'electron';
import { MatchHistory, SummonerStats } from './MatchHistory';
import { IPC_KEY } from '../../const';
import { Summoner } from './Summoner';
import { LeagueRanked } from './LeagueRanked';

interface SummonerInfo {
  displayName: string;
  profileImage: string;
  tier: string;
  summonerStats: SummonerStats;
}

export const handleFriendStatsEvent = () => {
  ipcMain.on(IPC_KEY.FRIEND_STATS, async (event, puuid) => {
    const [summoner, leagueRanked, matchHistory]: [Summoner, LeagueRanked, MatchHistory] =
      await Promise.all([
        Summoner.fetchByPuuid(puuid),
        LeagueRanked.fetch(puuid),
        MatchHistory.fetch(puuid),
      ]);

    const summonerStats: SummonerStats = await matchHistory.getSummonerStats();

    const summonerInfo: SummonerInfo = {
      displayName: summoner.displayName,
      profileImage: summoner.getProfileImage(),
      tier: leagueRanked.getTier(),
      summonerStats,
    };

    event.reply(IPC_KEY.FRIEND_STATS, summonerInfo);
  });
};

export default handleFriendStatsEvent;
