import { ipcMain } from 'electron';
import { MatchHistory, SummonerStats } from './MatchHistory';
import { IPC_KEY } from '../../const';
import { Friends } from './Friends';
import { Friend } from './Friend';

interface Summoner {
  displayName: string;
  profileImage: string;
  tier: string;
  statusMessage: string;
  summonerStats: SummonerStats;
}

export const handleFriendStatsEvent = () => {
  ipcMain.on(IPC_KEY.FRIEND_STATS, async (event, { id, puuid }) => {
    const [friend, matchHistory]: [Friend, MatchHistory] = await Promise.all([
      Friends.fetchOne(id),
      MatchHistory.fetch(puuid),
    ]);

    const summonerStats: SummonerStats = await matchHistory.getSummonerStats();

    const summoner: Summoner = {
      displayName: friend.gameName,
      profileImage: friend.getProfileImage(),
      tier: friend.getTier(),
      statusMessage: friend.statusMessage,
      summonerStats,
    };

    event.reply(IPC_KEY.FRIEND_STATS, summoner);
  });
};

export default handleFriendStatsEvent;
