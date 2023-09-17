import league from '../utils/league';
import { LCU_ENDPOINT } from '../constants';
import { plainToInstance } from 'class-transformer';
import { LeagueClient, MatchHistory, SummonerStats, Friend } from './models';

export interface SummonerData {
  summonerId: number;
  displayName: string;
  profileImage: string;
  tier: string;
  statusMessage: string;
  summonerStats: SummonerStats;
  // friendDataList: FriendData[];
  // phase: string;
}

interface FriendData {
  profileImage: string;
  displayName: string;
}

export const onLeagueClientUx = async () => {
  const leagueClient: LeagueClient = await getLeagueClient();

  const matchHistoryUrl = `/lol-match-history/v1/products/lol/${leagueClient.puuid}/matches?begIndex=0&endIndex=100`;
  const [matchHistoryJson, friendListJson, phase]: [string, any[], string] = await Promise.all([
    league(matchHistoryUrl),
    league(LCU_ENDPOINT.FRIENDS_URL),
    league(LCU_ENDPOINT.GAMEFLOW_URL),
  ]);

  const matchHistory: MatchHistory = plainToInstance(MatchHistory, matchHistoryJson);
  const summonerStats: SummonerStats = matchHistory.getSummonerStats();

  // const friendList: Friend[] = plainToInstance(Friend, friendListJson);
  // const friendDataList: FriendData[] = friendList.map((friend: Friend) => friend.getData());

  const summoner: SummonerData = {
    summonerId: leagueClient.summonerId,
    displayName: leagueClient.gameName,
    profileImage: leagueClient.getProfileImage(),
    tier: leagueClient.getTier(),
    statusMessage: leagueClient.statusMessage,
    summonerStats,
    // friendDataList,
    // phase: phase === PHASE.CHAMP_SELECT || phase === PHASE.IN_GAME ? '게임중' : '온라인',
  };

  return { summoner, matchHistory, phase };
};

async function getLeagueClient(): Promise<LeagueClient> {
  return new Promise((resolve) => {
    let interval = setInterval(async function () {
      const leagueClientJson = await league(LCU_ENDPOINT.CHAT_ME_URL);
      const leagueClient: LeagueClient = plainToInstance(LeagueClient, leagueClientJson);

      if (!leagueClient.isEmptyName()) {
        clearInterval(interval);
        resolve(leagueClient);
      }
    }, 1000);
  });
}
