import league from '../utils/league';
import { plainToInstance } from 'class-transformer';
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

interface StatsData {
  championIcon: string;
  kda: string;
  isWin: boolean;
  killInvolvement: string;
}

interface ChampCount {
  championId: number;
  count: number;
}

export interface ChampionStats {
  summonerId: number;
  championIcon: string;
  name: string;
  kda: string;
  totalDamage: string;
  cs: string;
}

interface MatchHistoryData {
  games: MatchData[];
}

interface MatchData {
  gameId: number;
  gameType: string;
  participants: ParticipantData[];
}

export interface ParticipantData {
  championId: number;
  stats: {
    causedEarlySurrender: boolean; //조기항복 유도 여부
    doubleKills: number;
    assists: number;
    deaths: number;
    kills: number;
    totalHeal: number;
    visionScore: number; //시야점수
    turretKills: number; //타워킬 횟수
    totalDamageDealtToChampions: number; //총 피해량
    totalMinionsKilled: number; //미니언 처치 횟수
    neutralMinionsKilled: number; //중립 몬스터 처치 횟수
    win: boolean;
  };
  teamId: number;
}

const RECENT_PVP_MATCH_COUNT = 10;

export class MatchHistory {
  games: MatchHistoryData;

  public static async fetch(puuid: string) {
    const url = `/lol-match-history/v1/products/lol/${puuid}/matches?begIndex=0&endIndex=99`;
    const matchHistoryData = await league(url);
    return plainToInstance(MatchHistory, matchHistoryData);
  }

  public async getSummonerStats() {
    const championCountList = new Map<number, ChampCount>();
    let killCount = 0;
    let deathCount = 0;
    let assistCount = 0;

    let totalDamage = 0;
    let totalCs = 0;

    let winCount = 0;
    let failCount = 0;
    let gameCount = 0;

    const statsList: StatsData[] = await Promise.all(
      this.getPvpMatchList()
        .slice(0, RECENT_PVP_MATCH_COUNT)
        .map(async (match: MatchData) => {
          const participant: ParticipantData = match.participants[0];
          //모스트 챔피언을 알아내기 위해 해당 챔피언으로 뛴 게임 수 저장
          this.addChampionCount(participant.championId, championCountList);

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

          const stats: StatsData = {
            championIcon: `https://lolcdn.darkintaqt.com/cdn/champion/${participant.championId}/tile`,
            kda: `${kills}/${deaths}/${assists}`,
            isWin: participant.stats.win,
            killInvolvement: `${killInvolvement}%`,
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
    const mostChampionList = Array.from(championCountList.values())
      .sort((a, b) => a.count - b.count)
      .slice(-3)
      .map((champ) => `https://lolcdn.darkintaqt.com/cdn/champion/${champ.championId}/tile`);
    const odds = (winCount / RECENT_PVP_MATCH_COUNT) * 100;

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
    const game: MatchData = await league(url);

    let totalKill = 0;
    game.participants
      .filter((participant: ParticipantData) => {
        return participant.teamId === teamId;
      })
      .forEach((participant: ParticipantData) => {
        totalKill += participant.stats.kills;
      });

    return totalKill;
  }

  public getChampionStats(summonerId: number, championId: number, profileImage: string) {
    let champKill = 0;
    let champDeath = 0;
    let champAssists = 0;
    let totalDamage = 0;
    let totalCs = 0;
    let champCount = 0;

    this.getPvpMatchList().forEach((match: MatchData) => {
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
        cs: '전적 없음',
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
      totalDamage: Math.floor(totalDamage / champCount).toString(),
      cs: this.getStatsAverage(totalCs, champCount),
    };

    return championStats;
  }

  public getChampionKda(championId: number) {
    let champKill = 0;
    let champDeath = 0;
    let champAssists = 0;
    let champCount = 0;

    this.getPvpMatchList().forEach((match: MatchData) => {
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

  public getLeagueTitleScore(leagueTitle: any) {
    let count = 0;

    this.getPvpMatchList().forEach((match: MatchData) => {
      const participant: ParticipantData = match.participants[0];

      let statsValue = participant.stats[leagueTitle.value as keyof ParticipantData['stats']];
      if (statsValue) {
        statsValue = 1;
      } else {
        statsValue = 0;
      }

      count += statsValue;
    });

    return count;
  }

  private getPvpMatchList() {
    return this.games.games
      .slice(0, 100)
      .filter((match: MatchData) => match.gameType !== 'CUSTOM_GAME');
  }
}
