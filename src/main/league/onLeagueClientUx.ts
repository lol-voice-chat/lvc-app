import league from '../utils/league';
import { LCU_ENDPOINT, RANK_DIVISION } from '../const';

export interface SummonerData {
  summonerId: number;
  displayName: string;
  profileImage: string;
  tier: string;
  statusMessage: string;
  odds: number;
  winCount: number;
  failCount: number;
  statsList: StatsData[];
  friendNames: string[];
}

interface LeagueClientData {
  gameName: string;
  icon: number;
  lol: {
    rankedLeagueDivision: string;
    rankedLeagueTier: string;
  };
  statusMessage: string;
  puuid: string;
  summonerId: number;
}

interface SummonerStats {
  odds: number;
  winCount: number;
  failCount: number;
  statsList: StatsData[];
}

interface StatsData {
  championIcon: string;
  kda: string;
  isWin: boolean;
}

export interface MatchHistoryData {
  gameType: string;
  participants: ParticipantData[];
}

export interface ParticipantData {
  championId: number;
  stats: {
    assists: number;
    deaths: number;
    kills: number;
    totalDamageDealtToChampions: number;
    totalMinionsKilled: number;
    neutralMinionsKilled: number;
    win: boolean;
  };
}

export const onLeagueClientUx = async () => {
  const leagueClientData: LeagueClientData = await getLeagueClientData();

  const tier: string = getTier(leagueClientData);
  const [pvpMatchList, friendData] = await Promise.all([
    getPvpMatchList(leagueClientData.puuid),
    league(LCU_ENDPOINT.FRIENDS_URL),
  ]);

  const summonerStats: SummonerStats = getSummonerStats(pvpMatchList);

  const summoner: SummonerData = {
    summonerId: leagueClientData.summonerId,
    displayName: leagueClientData.gameName,
    profileImage: `https://ddragon-webp.lolmath.net/latest/img/profileicon/${leagueClientData.icon}.webp`,
    tier,
    statusMessage: leagueClientData.statusMessage,
    odds: summonerStats.odds,
    winCount: summonerStats.winCount,
    failCount: summonerStats.failCount,
    statsList: summonerStats.statsList,
    friendNames: friendData,
  };

  return { summoner, pvpMatchList };
};

async function getLeagueClientData(): Promise<LeagueClientData> {
  return new Promise((resolve) => {
    let interval = setInterval(async function () {
      const leagueClientData: LeagueClientData = await league(LCU_ENDPOINT.CHAT_ME_URL);

      if (leagueClientData.gameName !== '') {
        clearInterval(interval);
        resolve(leagueClientData);
      }
    }, 1000);
  });
}

function getTier(leagueClientData: LeagueClientData) {
  const { rankedLeagueDivision, rankedLeagueTier } = leagueClientData.lol;
  const displayTier: string = rankedLeagueTier[0];

  if (rankedLeagueDivision === 'NA' && rankedLeagueTier === '') {
    return 'Unrank';
  }

  return displayTier + RANK_DIVISION[rankedLeagueDivision];
}

async function getPvpMatchList(puuid: string) {
  const matchListUrl = `/lol-match-history/v1/products/lol/${puuid}/matches?begIndex=0&endIndex=100`;
  const matchList = await league(matchListUrl);
  return matchList.games.games.filter((game: MatchHistoryData) => game.gameType !== 'CUSTOM_GAME');
}

function getSummonerStats(pvpMatchlist: MatchHistoryData[]) {
  let winCount = 0;
  let failCount = 0;

  const recentPvpMatchlist = pvpMatchlist.slice(0, 10);

  const statsList: StatsData[] = recentPvpMatchlist.map((game: MatchHistoryData) => {
    const participant: ParticipantData = game.participants[0];
    const stats: StatsData = {
      championIcon: `https://lolcdn.darkintaqt.com/cdn/champion/${participant.championId}/tile`,
      kda: `${participant.stats.kills}/${participant.stats.deaths}/${participant.stats.assists}`,
      isWin: participant.stats.win,
    };

    if (participant.stats.win) {
      winCount++;
    } else {
      failCount++;
    }

    return stats;
  });

  const odds = (winCount / recentPvpMatchlist.length) * 100;
  const summonerStats: SummonerStats = { odds, winCount, failCount, statsList };
  return summonerStats;
}
