import { WebContents } from 'electron';
import { LeagueWebSocket } from 'league-connect';
import { Summoner } from './onLeagueClientUx';
import League from '../utils';
import { LCU_ENDPOINT } from '../constants';
import { IPC_KEY } from '../../const';
import { leagueTitleEvent } from './leagueTitleEvent';
import { Gameflow } from './Gameflow';
import { SummonerChampionData, Team } from './Team';
import { MatchHistory, ChampionStats } from './MatchHistory';

let isJoinedRoom = false;
let isStartedGameLoading = false;
let isStartedInGame = false;
let isEndGame = false;
let isMatchedLeagueTitle = false;
let selectedChampionId: number = 0;

export class LeagueHandler {
  webContents: WebContents;
  ws: LeagueWebSocket;
  summoner: Summoner;

  constructor(webContents: WebContents, ws: LeagueWebSocket, summoner: Summoner) {
    this.webContents = webContents;
    this.ws = ws;
    this.summoner = summoner;
  }

  public async handle(gameflow: Gameflow, matchHistory: MatchHistory) {
    await this.handleLeaguePhase(gameflow);

    //챔피언선택 시작
    this.ws.subscribe(LCU_ENDPOINT.CHAMP_SELECT_URL, async (data) => {
      if (data.timer.phase === 'BAN_PICK' && !isJoinedRoom) {
        isJoinedRoom = true;
        this.joinTeamVoice(data.myTeam);
      }

      if (data.timer.phase === 'BAN_PICK') {
        if (!isMatchedLeagueTitle) {
          isMatchedLeagueTitle = true;
          leagueTitleEvent.emit(IPC_KEY.LEAGUE_TITLE, data.myTeam);
        }

        const { championId } = data.myTeam.find(
          (summoner: any) => summoner.summonerId === this.summoner.summonerId
        );

        if (selectedChampionId !== championId) {
          selectedChampionId = championId;
          const championStats: ChampionStats = matchHistory.getChampionStats(
            this.summoner.summonerId,
            championId,
            this.summoner.profileImage
          );
          this.webContents.send(IPC_KEY.CHAMP_INFO, championStats);
        }
      }

      const isCloseWindow = await this.isCloseChampionSelectionWindow(data.timer.phase);
      if (isCloseWindow) {
        isJoinedRoom = false;
        this.webContents.send(IPC_KEY.EXIT_CHAMP_SELECT);
        selectedChampionId = 0;
        isMatchedLeagueTitle = false;
      }
    });

    this.ws.subscribe(LCU_ENDPOINT.GAMEFLOW_URL, async (data) => {
      //게임로딩 시작
      if (data.phase === 'InProgress' && !data.gameClient.visible && !isStartedGameLoading) {
        isStartedGameLoading = true;
        const { teamOne, teamTwo } = data.gameData;
        await this.joinLeagueVoice(teamOne, teamTwo);
      }

      //게임로딩 도중 나감
      if (data.phase === 'None' && !data.gameClient.visible && isStartedGameLoading) {
        isStartedGameLoading = false;
        this.webContents.send(IPC_KEY.EXIT_IN_GAME);
      }

      //인게임 시작
      if (data.phase === 'InProgress' && data.gameClient.visible && !isStartedInGame) {
        const timeout = setTimeout(() => {
          isStartedInGame = true;
          this.webContents.send(IPC_KEY.START_IN_GAME);
        }, 150000);
        clearTimeout(timeout);
      }

      //인게임 도중 나감
      if (data.phase === 'None' && data.gameClient.visible && isStartedInGame) {
        isStartedInGame = false;
        this.webContents.send(IPC_KEY.EXIT_IN_GAME);
      }

      if (data.phase === 'WaitingForStats' && !isEndGame) {
        isEndGame = true;
        this.webContents.send(IPC_KEY.EXIT_IN_GAME);
      }
    });
  }

  private async handleLeaguePhase(gameflow: Gameflow) {
    if (gameflow.isChampselectPhase()) {
      const { myTeam } = await League.httpRequest(LCU_ENDPOINT.CHAMP_SELECT_URL);
      this.joinTeamVoice(myTeam);
      isJoinedRoom = true;
      return;
    }

    if (gameflow.isGameLoadingPhase()) {
      const { teamOne, teamTwo } = gameflow.gameData;
      await this.joinLeagueVoice(teamOne, teamTwo);
      isStartedGameLoading = true;
      return;
    }

    if (gameflow.isInGamePhase()) {
      const { teamOne, teamTwo } = gameflow.gameData;

      const teamOneSummoners = new Team(teamOne);
      const summoner = teamOneSummoners.findBySummonerId(this.summoner.summonerId);
      const myTeam = summoner ? teamOne : teamTwo;
      this.joinTeamVoice(myTeam);

      this.webContents.send(IPC_KEY.START_IN_GAME);
      isStartedInGame = true;
      return;
    }
  }

  private async isCloseChampionSelectionWindow(phase: string) {
    const gameflowPhase = await League.httpRequest(LCU_ENDPOINT.GAMEFLOW_PHASE_URL);
    const isNotChampSelect: boolean = gameflowPhase === 'None' || gameflowPhase === 'Lobby';
    return isJoinedRoom && phase === '' && isNotChampSelect;
  }

  private joinTeamVoice(myTeam: []) {
    const team = new Team(myTeam);
    const roomName = team.createVoiceRoomName();
    this.webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName });
  }

  private async joinLeagueVoice(teamOneData: [], teamTwoData: []) {
    const teamOne = new Team(teamOneData);
    const teamTwo = new Team(teamTwoData);

    const roomName = teamOne.createVoiceRoomName() + teamTwo.createVoiceRoomName();

    const summoner = teamOne.findBySummonerId(this.summoner.summonerId);
    const myTeam = summoner ? teamOne : teamTwo;
    const teamName = myTeam.createVoiceRoomName();

    const [teamOneSummonerChampionKdaList, teamTwoSummonerChampionKdaList]: [
      SummonerChampionData[],
      SummonerChampionData[]
    ] = await Promise.all([
      teamOne.getSummonerChampionKdaList(),
      teamTwo.getSummonerChampionKdaList(),
    ]);
    const summonerDataList = teamOneSummonerChampionKdaList.concat(teamTwoSummonerChampionKdaList);

    this.webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName: teamName });
    this.webContents.send(IPC_KEY.LEAGUE_JOIN_ROOM, {
      roomName,
      teamName,
      summonerDataList,
    });
  }
}
