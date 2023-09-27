import { ipcMain } from 'electron';
import { MemberMatchHistoryData, Team } from './Team';
import { IPC_KEY } from '../../const';
import EventEmitter from 'events';

interface LeagueTitle {
  value: string;
  title: string;
  description: string;
  standard: 'min' | 'max';
}

interface LeagueTitleScore {
  summonerId: number;
  count: number;
}

interface MatchLeagueTitle {
  summonerId: number;
  title: string;
  description: string;
}

export const leagueTitleEvent = new EventEmitter();

leagueTitleEvent.on(IPC_KEY.LEAGUE_TITLE, (teamData: []) => {
  const team = new Team(teamData);

  ipcMain.on(IPC_KEY.LEAGUE_TITLE, async (event, leagueTitleList: LeagueTitle[]) => {
    if (team.isAlone()) {
      event.reply(IPC_KEY.LEAGUE_TITLE, null);
      return;
    }

    let memberMatchHistoryList: MemberMatchHistoryData[] = await team.getMemberMatchHistoryList();

    const result: MatchLeagueTitle[] = [];

    for (let i = 0; i < memberMatchHistoryList.length; i++) {
      const leagueTitle = leagueTitleList[i];

      const summonerLeagueTitleScoreList: LeagueTitleScore[] = //
        memberMatchHistoryList.map((memberMatchHistory) => {
          const count = memberMatchHistory.matchHistory.getLeagueTitleScore(leagueTitle);
          const leagueTitleScore: LeagueTitleScore = {
            summonerId: memberMatchHistory.summonerId,
            count,
          };

          return leagueTitleScore;
        });

      const memberData = matching(leagueTitle, summonerLeagueTitleScoreList);
      result.push(memberData);

      //칭호가 매칭된 소환사는 제거
      memberMatchHistoryList = memberMatchHistoryList.filter(
        (memberMatchHistory) => memberMatchHistory.summonerId !== memberData.summonerId
      );
    }

    event.reply(IPC_KEY.LEAGUE_TITLE, result);
    return;
  });
});

function matching(leagueTitle: LeagueTitle, memberLeagueTitleScoreList: LeagueTitleScore[]) {
  const sorted = sortByLeagueTitleStandard(leagueTitle, memberLeagueTitleScoreList);
  const member = sorted[sorted.length - 1];

  const matchLeagueTitle: MatchLeagueTitle = {
    summonerId: member.summonerId,
    title: leagueTitle.title,
    description: leagueTitle.description,
  };

  return matchLeagueTitle;
}

function sortByLeagueTitleStandard(
  leagueTitle: LeagueTitle,
  memberLeagueTitleScoreList: LeagueTitleScore[]
) {
  if (leagueTitle.standard === 'max') {
    return memberLeagueTitleScoreList.sort((a, b) => a.count - b.count);
  }

  return memberLeagueTitleScoreList.sort((a, b) => b.count - a.count);
}
