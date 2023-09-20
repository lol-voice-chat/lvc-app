import league from '../utils/league';
import { Summoner } from './league-client';
import { CHAMPIONS } from '../constants';

interface MatchHistory {
  games: {
    games: MatchData[];
  };
}

export interface MatchData {
  gameType: string;
  participants: ParticipantData[];
}

export interface ParticipantData {
  championId: number;
  stats: {
    /**
     * 조기 항복 유도 여부
     */
    causedEarlySurrender: boolean;

    doubleKills: number;
    assists: number;
    deaths: number;
    kills: number;
    totalHeal: number;

    /**
     * 시야 점수
     */
    visionScore: number;

    /**
     * 타워 킬 횟수
     */
    turretKills: number;

    /**
     * 총 피해량
     */
    totalDamageDealtToChampions: number;

    /**
     * 미니언 처치 횟수
     */
    totalMinionsKilled: number;

    /**
     * 중립 몬스터 처치 횟수
     */
    neutralMinionsKilled: number;
    win: boolean;
  };
}

export interface SummonerStats {
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

export interface ChampionStats {
  summonerId: number;
  championIcon: string;
  name: string;
  kda: string;
  totalDamage: string;
  totalMinionsKilled: string;
}

const RECENT_PVP_MATCH_COUNT = 10;

export const fetchPvpMatchHistory = async (puuid: string) => {
  const url = `/lol-match-history/v1/products/lol/${puuid}/matches?begIndex=0&endIndex=99`;
  const matchHistory: MatchHistory = await league(url);
  return getPvpMatchList(matchHistory);
};

function getPvpMatchList(matchHistory: MatchHistory): MatchData[] {
  return matchHistory.games.games.filter((match: MatchData) => match.gameType !== 'CUSTOM_GAME');
}

export const getSummonerStats = (pvpMatchList: MatchData[]) => {
  let winCount = 0;
  let failCount = 0;

  const statsList: StatsData[] = pvpMatchList
    .slice(0, RECENT_PVP_MATCH_COUNT)
    .map((match: MatchData) => {
      const participant: ParticipantData = match.participants[0];
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

  const odds = (winCount / RECENT_PVP_MATCH_COUNT) * 100;
  const summonerStats: SummonerStats = { odds, winCount, failCount, statsList };
  return summonerStats;
};

export const getChampionStats = (
  pvpMatchList: MatchData[],
  championId: number,
  summoner: Summoner
) => {
  const { summonerId, profileImage } = summoner;
  let champKill = 0;
  let champDeath = 0;
  let champAssists = 0;
  let totalDamage = 0;
  let totalCs = 0;
  let champCount = 0;

  pvpMatchList.forEach((match: MatchData) => {
    const participant: ParticipantData = match.participants[0];

    if (participant.championId === championId) {
      champKill += participant.stats.kills;
      champDeath += participant.stats.deaths;
      champAssists += participant.stats.assists;
      totalDamage += participant.stats.totalDamageDealtToChampions;
      totalCs += participant.stats.totalMinionsKilled + participant.stats.neutralMinionsKilled;
      champCount++;
    }
  });

  const championIcon = championId
    ? `https://lolcdn.darkintaqt.com/cdn/champion/${championId}/tile`
    : profileImage;

  const championName: string = CHAMPIONS[championId.toString()];

  if (champCount === 0) {
    const championStats: ChampionStats = {
      summonerId,
      championIcon: championIcon,
      name: championName,
      kda: '전적 없음',
      totalDamage: '전적 없음',
      totalMinionsKilled: '전적 없음',
    };

    return championStats;
  }

  const championStats: ChampionStats = {
    summonerId,
    championIcon: championIcon,
    name: championName,
    kda: `
    ${getStatsDataAverage(champKill, champCount)}/
    ${getStatsDataAverage(champDeath, champCount)}/
    ${getStatsDataAverage(champAssists, champCount)}
    `,
    totalDamage: Math.floor(totalDamage / champCount).toString(),
    totalMinionsKilled: getStatsDataAverage(totalCs, champCount),
  };

  return championStats;
};

export const getChampionKda = (pvpMatchList: MatchData[], championId: number) => {
  let champKill = 0;
  let champDeath = 0;
  let champAssists = 0;
  let champCount = 0;

  pvpMatchList.forEach((match: MatchData) => {
    const participant: ParticipantData = match.participants[0];

    if (participant.championId === championId) {
      champKill += participant.stats.kills;
      champDeath += participant.stats.deaths;
      champAssists += participant.stats.assists;
      champCount++;
    }
  });

  if (champCount === 0) {
    return '전적없음';
  }

  const kda: string = `
      ${getStatsDataAverage(champKill, champCount)}/
      ${getStatsDataAverage(champDeath, champCount)}/
      ${getStatsDataAverage(champAssists, champCount)}
      `;

  return kda;
};

function getStatsDataAverage(statsData: number, champCount: number) {
  const statsAverage: string = (statsData / champCount).toFixed(1).toString();
  if (statsAverage.split('.')[1] === '0') {
    return statsAverage.split('.')[0];
  }

  return statsAverage;
}
