import { request } from '../lib/common';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import relativeTime from 'dayjs/plugin/relativeTime';
import { CHAMPIONS } from '../constants';

export interface SummonerStats {
  kda: string;
  damage: string;
  cs: string;
  mostChampionList: string[];
  odds: number;
  winCount: number;
  failCount: number;
  statsList: StatsData[];
}

export interface StatsData {
  championIcon: string;
  kda: string;
  isWin: boolean;
  killInvolvement: string;
  time: string;
}

interface ChampCount {
  championId: number;
  count: number;
}

export interface ChampionStats {
  summonerId: number;
  championIcon: string | null;
  name: string;
  kda: string;
  damage: string;
  cs: string;
  playCount: string;
}

interface Match {
  gameId: number;
  gameCreationDate: string;
  gameDuration: number;
  gameType: string;
  participants: ParticipantData[];
}

export interface ParticipantData {
  championId: number;
  stats: {
    assists: number; //어시스트 횟수
    deaths: number; //죽은 횟수
    kills: number; //킬 횟수
    totalDamageDealtToChampions: number; //총 피해량
    totalMinionsKilled: number; //미니언 처치 횟수
    neutralMinionsKilled: number; //중립 몬스터 처치 횟수
    win: boolean; //승리 여부
  };
  teamId: number;
}

dayjs.locale('ko');
dayjs.extend(relativeTime);
const RECENT_PVP_MATCH_COUNT = 10;

export class MatchHistory {
  private matches: Match[];

  constructor(matches: Match[]) {
    this.matches = matches;
  }

  public static async fetch(puuid: string, isMine: boolean = true) {
    if (!isMine) {
      const url = `/lol-match-history/v1/products/lol/${puuid}/matches`;
      const matchHistory = await request(url);
      const matches = matchHistory.games.games.filter(
        (match: Match) => match.gameType !== 'CUSTOM_GAME'
      );

      return new MatchHistory(matches);
    }

    const url = `/lol-match-history/v1/products/lol/${puuid}/matches?begIndex=0&endIndex=100`;
    const matchHistory = await request(url);
    const matches = matchHistory.games.games.filter(
      (match: Match) => match.gameType !== 'CUSTOM_GAME'
    );

    return new MatchHistory(matches);
  }

  get matchLength() {
    return this.matches.length;
  }

  public async getSummonerStats() {
    if (this.matches.length === 0) {
      const summonerStats: SummonerStats = {
        kda: '전적없음',
        damage: '전적없음',
        cs: '전적없음',
        mostChampionList: [],
        odds: 0,
        winCount: 0,
        failCount: 0,
        statsList: [],
      };

      return summonerStats;
    }

    const recentUsedChampionList = new Map<number, ChampCount>();
    let killCount = 0;
    let deathCount = 0;
    let assistCount = 0;

    let totalDamage = 0;
    let totalCs = 0;

    let winCount = 0;
    let failCount = 0;
    let gameCount = 0;

    const statsList: StatsData[] = await Promise.all(
      this.matches.slice(0, RECENT_PVP_MATCH_COUNT).map(async (match: Match) => {
        const participant: ParticipantData = match.participants[0];
        //해당 챔피언으로 뛴 게임횟수 저장
        this.addChampionCount(participant.championId, recentUsedChampionList);

        const kills = participant.stats.kills;
        const deaths = participant.stats.deaths;
        const assists = participant.stats.assists;

        killCount += kills;
        deathCount += deaths;
        assistCount += assists;

        totalDamage += participant.stats.totalDamageDealtToChampions;
        totalCs += participant.stats.totalMinionsKilled + participant.stats.neutralMinionsKilled;

        //킬 관여
        const myTeamTotalKill = await this.getMyTeamTotalKill(match.gameId, participant.teamId);
        const killInvolvement = Math.floor(((kills + assists) / myTeamTotalKill) * 100);

        const hours = match.gameDuration / 3600;
        const minutes = Math.floor(match.gameDuration / 60);
        const seconds = match.gameDuration % 60;

        const date = new Date(match.gameCreationDate);
        date.setHours(date.getHours() + hours);
        date.setMinutes(date.getMinutes() + minutes);
        date.setSeconds(date.getSeconds() + seconds);

        const stats: StatsData = {
          championIcon: `https://lolcdn.darkintaqt.com/cdn/champion/${participant.championId}/tile`,
          kda: `${kills}/${deaths}/${assists}`,
          isWin: participant.stats.win,
          killInvolvement: `${killInvolvement}%`,
          time: date.toISOString(),
        };

        if (participant.stats.win) {
          winCount++;
        } else {
          failCount++;
        }

        gameCount++;

        return stats;
      })
    );

    const kda = `
      ${this.getStatsAverage(killCount, gameCount)}/
      ${this.getStatsAverage(deathCount, gameCount)}/
      ${this.getStatsAverage(assistCount, gameCount)}
      `;
    const damage = Math.floor(totalDamage / gameCount).toString();
    const cs = this.getStatsAverage(totalCs, gameCount);
    const mostChampionList = this.getMostChampionList(recentUsedChampionList);
    const odds = Math.floor((winCount / gameCount) * 100);

    const summonerStats: SummonerStats = {
      kda,
      damage,
      cs,
      mostChampionList,
      odds,
      winCount,
      failCount,
      statsList,
    };
    return summonerStats;
  }

  private addChampionCount(championId: number, championCountList: Map<number, ChampCount>) {
    let championCount = championCountList.get(championId);
    if (!championCount) {
      const champCount: ChampCount = {
        championId,
        count: 1,
      };

      championCountList.set(championId, champCount);
      return;
    }

    championCount.count++;
    championCountList.set(championId, championCount);
    return;
  }

  private async getMyTeamTotalKill(gameId: number, teamId: number) {
    const url = `/lol-match-history/v1/games/${gameId}`;
    const game: Match = await request(url);

    let totalKill = 0;
    game.participants
      .filter((participant: ParticipantData) => {
        return participant.teamId === teamId;
      })
      .forEach((participant: ParticipantData) => {
        totalKill += participant.stats.kills;
      });

    if (totalKill === 0) {
      return 1;
    }

    return totalKill;
  }

  private getMostChampionList(recentUsedChampionList: Map<number, ChampCount>) {
    return Array.from(recentUsedChampionList.values())
      .reverse()
      .sort((a, b) => a.count - b.count)
      .slice(-3)
      .map((champ) => `https://lolcdn.darkintaqt.com/cdn/champion/${champ.championId}/tile`)
      .reverse();
  }

  public getChampionStats(summonerId: number, championId: number) {
    let champKill = 0;
    let champDeath = 0;
    let champAssists = 0;
    let totalDamage = 0;
    let totalCs = 0;
    let champCount = 0;

    this.matches.forEach((match: Match) => {
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

    const championIcon = `https://lolcdn.darkintaqt.com/cdn/champion/${championId}/tile`;
    const championName: string = CHAMPIONS[championId.toString()];

    if (champCount === 0) {
      const championStats: ChampionStats = {
        summonerId,
        championIcon: championIcon,
        name: championName,
        kda: '전적 없음',
        damage: '전적 없음',
        cs: '전적 없음',
        playCount: '전적 없음',
      };

      return championStats;
    }

    const championStats: ChampionStats = {
      summonerId,
      championIcon: championIcon,
      name: championName,
      kda: `
      ${this.getStatsAverage(champKill, champCount)}/
      ${this.getStatsAverage(champDeath, champCount)}/
      ${this.getStatsAverage(champAssists, champCount)}
      `,
      damage: Math.floor(totalDamage / champCount).toString(),
      cs: this.getStatsAverage(totalCs, champCount),
      playCount: champCount.toString(),
    };

    return championStats;
  }

  public getChampionKda(matchLength: number, championId: number) {
    let champKill = 0;
    let champDeath = 0;
    let champAssists = 0;
    let champCount = 0;

    this.matches.slice(0, matchLength).forEach((match: Match) => {
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
        ${this.getStatsAverage(champKill, champCount)}/
        ${this.getStatsAverage(champDeath, champCount)}/
        ${this.getStatsAverage(champAssists, champCount)}
        `;

    return kda;
  }

  private getStatsAverage(stats: number, count: number) {
    const statsAverage: string = (stats / count).toFixed(1).toString();
    if (statsAverage.split('.')[1] === '0') {
      return statsAverage.split('.')[0];
    }

    return statsAverage;
  }
}
