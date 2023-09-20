import { ipcMain } from 'electron';
import league from '../utils/league';
import { MatchData, fetchPvpMatchHistory } from './match-history';

interface LeagueTitle {
  value: string;
  title: string;
  description: string;
  standard: 'min' | 'max';
}

interface SummonerMatchHistory {
  summonerId: number;
  pvpMatchList: MatchData[];
}

export const pickLeagueTitle = (team: any[]) => {
  ipcMain.on('league-title', async (event, leagueTitleList: LeagueTitle[]) => {
    console.log('테스트');

    const summonerMatchHistoryList: SummonerMatchHistory[] = [];

    for (const summoner of team) {
      const summonerUrl = `/lol-summoner/v1/summoners/${summoner.summonerId}`;
      const { puuid } = await league(summonerUrl);

      const pvpMatchList: MatchData[] = await fetchPvpMatchHistory(puuid);

      const summonerMatchHistory: SummonerMatchHistory = {
        summonerId: summoner.summonerId,
        pvpMatchList,
      };

      summonerMatchHistoryList.push(summonerMatchHistory);
    }

    const result: any[] = [];
    //칭호 돌면서
    leagueTitleList.forEach((leagueTitle: LeagueTitle) => {
      const array: any[] = [];

      //소환사 전적 돌면서
      summonerMatchHistoryList.forEach((summonerMatchHistory: SummonerMatchHistory) => {
        let count = 0;

        //각 소환사 100판 전적 돌면서
        summonerMatchHistory.pvpMatchList.forEach((game: any) => {
          const participant: any = game.participants[0];
          //칭호 데이터를 더한다
          count += participant.stats[leagueTitle.value];
        });

        //summonerId
        const test = {
          summonerId: summonerMatchHistory.summonerId,
          count,
        };

        array.push(test);
      });

      if (leagueTitle.standard === 'max') {
        array.sort((a, b) => a.count - b.count);
        const goodSummoner = array[-1];
        result.push({
          summonerId: goodSummoner.summonerId,
          title: leagueTitle.title,
          description: leagueTitle.description,
        });
      } else {
        array.sort((a, b) => b.count - a.count);
        const goodSummoner = array[-1];
        result.push({
          summonerId: goodSummoner.summonerId,
          title: leagueTitle.title,
          description: leagueTitle.description,
        });
      }
    });

    event.reply('league-title', result);
  });
};
