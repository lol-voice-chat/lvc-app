import { WebContents } from 'electron';
import { LeagueWebSocket } from 'league-connect';
import { Summoner } from './league-client';
import league from '../utils/league';
import { LCU_ENDPOINT } from '../constants';
import { voiceRoomNameGenerator } from '../utils/voiceRoomNameGenerator';
import { IPC_KEY } from '../../const';
import { pickLeagueTitle } from './league-title';
import {
  MatchData,
  getChampionStats,
  fetchPvpMatchHistory,
  getChampionKda,
  ChampionStats,
} from './match-history';
import {
  Gameflow,
  isChampselectPhase,
  isCloseGameLoadingWindow,
  isGameLoadingPhase,
  isInGamePhase,
} from './game-flow';

let isJoinedRoom = false;
let isStartedGameLoading = false;
let isStartedInGame = false;
let isLeagueTitlePicked = false;
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

  public async handle(gameflow: Gameflow, pvpMatchList: MatchData[]) {
    await this.handleLeaguePhase(gameflow);

    this.ws.subscribe(LCU_ENDPOINT.CHAMP_SELECT_URL, async (data) => {
      if (data.timer.phase === 'BAN_PICK' && !isJoinedRoom) {
        this.joinTeamVoice(data.myTeam);
        isJoinedRoom = true;
      }

      if (data.timer.phase === 'BAN_PICK') {
        if (!isLeagueTitlePicked) {
          pickLeagueTitle(data.myTeam);
          isLeagueTitlePicked = true;
        }

        const { championId } = data.myTeam.find(
          (summoner: any) => summoner.summonerId === this.summoner.summonerId
        );

        if (selectedChampionId !== championId) {
          selectedChampionId = championId;
          const championStats: ChampionStats = getChampionStats(
            pvpMatchList,
            championId,
            this.summoner
          );
          this.webContents.send(IPC_KEY.CHAMP_INFO, championStats);
        }
      }

      const isCloseWindow = await this.isCloseChampionSelectionWindow(data.timer.phase);
      if (isCloseWindow) {
        this.webContents.send(IPC_KEY.EXIT_CHAMP_SELECT);
        isJoinedRoom = false;
        selectedChampionId = 0;
      }
    });

    this.ws.subscribe(LCU_ENDPOINT.GAMEFLOW_URL, async (data) => {
      if (isGameLoadingPhase(data) && !isStartedGameLoading) {
        const { teamOne, teamTwo } = data.gameData;
        await this.joinLeagueVoice(teamOne, teamTwo);
        isStartedGameLoading = true;
      }

      if (isCloseGameLoadingWindow(data) && isStartedGameLoading) {
        this.webContents.send(IPC_KEY.EXIT_IN_GAME);
        isStartedGameLoading = false;
      }

      // if (this.isInGamePhase(data) && !isStartedInGame) {
      //   this.webContents.send(IPC_KEY.START_IN_GAME);
      //   isStartedInGame = true;
      // }

      // if (this.isCloseInGameWindow(data) && isStartedInGame) {
      //   this.webContents.send(IPC_KEY.EXIT_IN_GAME);
      //   isStartedInGame = false;
      // }
    });
  }

  private async handleLeaguePhase(gameflow: Gameflow) {
    if (isChampselectPhase(gameflow)) {
      const { myTeam } = await league(LCU_ENDPOINT.CHAMP_SELECT_URL);
      this.joinTeamVoice(myTeam);
      isJoinedRoom = true;
      return;
    }

    if (isGameLoadingPhase(gameflow)) {
      const { teamOne, teamTwo } = gameflow.gameData;
      await this.joinLeagueVoice(teamOne, teamTwo);
      isStartedGameLoading = true;
      return;
    }

    if (isInGamePhase(gameflow)) {
      const { teamOne, teamTwo } = gameflow.gameData;

      const foundSummoner = teamOne.find(
        (summoner: any) => summoner.summonerId === this.summoner.summonerId
      );
      const myTeam = foundSummoner ? teamOne : teamTwo;
      this.joinTeamVoice(myTeam);

      this.webContents.send(IPC_KEY.START_IN_GAME);
      isStartedInGame = true;
      return;
    }
  }

  private async isCloseChampionSelectionWindow(phase: string) {
    const gameflowPhase = await league(LCU_ENDPOINT.GAMEFLOW_PHASE_URL);
    const isNotChampSelect: boolean = gameflowPhase === 'None' || gameflowPhase === 'Lobby';
    return isJoinedRoom && phase === '' && isNotChampSelect;
  }

  private joinTeamVoice(team: any[]) {
    const roomName: string = voiceRoomNameGenerator(team);
    this.webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName });
  }

  private async joinLeagueVoice(teamOne: any[], teamTwo: any[]) {
    const teamOneVoiceRoomName: string = voiceRoomNameGenerator(teamOne);
    const teamTwoVoiceRoomName: string = voiceRoomNameGenerator(teamTwo);
    const roomName = teamOneVoiceRoomName + teamTwoVoiceRoomName;

    const foundSummoner = teamOne.find(
      (summoner: any) => summoner.summonerId === this.summoner.summonerId
    );
    const myTeam = foundSummoner ? teamOne : teamTwo;

    let summonerDataList: any[] = [];

    for (const summoner of teamOne) {
      const pvpMatchList = await fetchPvpMatchHistory(summoner.puuid);
      const championKda: string = getChampionKda(pvpMatchList, summoner.championId);
      const summonerData = {
        summonerId: summoner.summonerId,
        championIcon: `https://lolcdn.darkintaqt.com/cdn/champion/${summoner.championId}/tile`,
        kda: championKda,
      };

      summonerDataList.push(summonerData);
    }

    for (const summoner of teamTwo) {
      const pvpMatchList = await fetchPvpMatchHistory(summoner.puuid);
      const championKda: string = getChampionKda(pvpMatchList, summoner.championId);
      const summonerData = {
        summonerId: summoner.summonerId,
        championIcon: `https://lolcdn.darkintaqt.com/cdn/champion/${summoner.championId}/tile`,
        kda: championKda,
      };

      summonerDataList.push(summonerData);
    }

    const teamName: string = voiceRoomNameGenerator(myTeam);
    this.webContents.send(IPC_KEY.LEAGUE_JOIN_ROOM, {
      roomName,
      teamName,
      summonerDataList,
    });
  }
}
