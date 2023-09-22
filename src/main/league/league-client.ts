import league from '../utils/league';
import { LCU_ENDPOINT } from '../constants';
import { CurrentSummoner, getTier, isEmptySummonerData, getProfileImage } from './current-summoner';
import { MatchHistory, SummonerStats } from './MatchHistory';

export interface Summoner {
  summonerId: number;
  displayName: string;
  profileImage: string;
  tier: string;
  statusMessage: string;
  summonerStats: SummonerStats;
}

export const onLeagueClientUx = async () => {
  const currentSummoner: CurrentSummoner = await getCurrentSummoner();
  const matchHistory = await MatchHistory.fetch(currentSummoner.puuid);
  const summonerStats = matchHistory.getSummonerStats();
  // const pvpMatchList: MatchData[] = await fetchPvpMatchHistory(currentSummoner.puuid);
  // const summonerStats: SummonerStats = getSummonerStats(pvpMatchList);

  const summoner: Summoner = {
    summonerId: currentSummoner.summonerId,
    displayName: currentSummoner.gameName,
    profileImage: getProfileImage(currentSummoner.icon),
    tier: getTier(currentSummoner.lol),
    statusMessage: currentSummoner.statusMessage,
    summonerStats,
  };

  return { summoner, matchHistory };
};

async function getCurrentSummoner(): Promise<CurrentSummoner> {
  return new Promise((resolve) => {
    let interval = setInterval(async function () {
      const summoner: CurrentSummoner = await league(LCU_ENDPOINT.CHAT_ME_URL);

      if (!isEmptySummonerData(summoner)) {
        clearInterval(interval);
        resolve(summoner);
      }
    }, 1000);
  });
}
