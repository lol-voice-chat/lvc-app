import { WebContents } from 'electron';
import { ChampionStats, MatchHistory, SummonerStats } from './models/match-history';
import {
  Credentials,
  LeagueClient,
  LeagueWebSocket,
  authenticate,
  createWebSocketConnection,
} from 'league-connect';
import { IPC_KEY } from '../const';
import { Summoner } from './models/summoner';
import { LeagueRanked } from './models/league-ranked';
import { MemberChampionData, Team } from './models/team';
import { friendRequestEvent } from './event/friend-requet-event';
import { request } from './lib/common';
import { RedisClient } from './lib/redis-client';
import axios from 'axios';
import https from 'https';

export let credentials: Credentials;

let isJoinedRoom = false;
let isInProgress = false;
let isEndGame = false;

export class LvcApplication {
  private webContents: WebContents;
  private ws: LeagueWebSocket;
  private summoner: Summoner;
  private matchHistory: MatchHistory;
  private redisClient: RedisClient;

  constructor(webContents: WebContents, redisClient: RedisClient) {
    this.webContents = webContents;
    this.redisClient = redisClient;
  }

  public async initialize() {
    await this.onLeagueClientUx();
    const client = new LeagueClient(credentials);
    client.start();

    client.on('connect', async (newCredentials) => {
      credentials = newCredentials;
      this.ws = await createWebSocketConnection();
      await this.fetchLeagueClient();
      this.handle();
    });

    client.on('disconnect', () => {
      this.webContents.send(IPC_KEY.SHUTDOWN_APP);
    });

    await this.fetchLeagueClient();
    friendRequestEvent.emit('friend-request');
  }

  private async onLeagueClientUx() {
    const [_credentials, ws] = await Promise.all([
      authenticate({
        awaitConnection: true,
      }),
      createWebSocketConnection({
        authenticationOptions: {
          awaitConnection: true,
        },
      }),
    ]);

    credentials = _credentials;
    this.ws = ws;
  }

  private async fetchLeagueClient() {
    const summoner: Summoner = await Summoner.fetch();

    const [leagueRanked, matchHistory] = await Promise.all([
      LeagueRanked.fetch(summoner.puuid),
      MatchHistory.fetch(summoner.puuid),
    ]);

    const summonerStats: SummonerStats = await matchHistory.getSummonerStats();
    const friendList = await request('/lol-chat/v1/friends');
    const friendSummonerIdList = friendList.map((friend: any) => friend.summonerId);

    const leagueClient = {
      gameName: summoner.gameName,
      gameTag: summoner.gameTag,
      id: summoner.id,
      name: summoner.name,
      pid: summoner.pid,
      puuid: summoner.puuid,
      summonerId: summoner.summonerId,
      profileImage: summoner.getMyProfileImage(),
      tier: leagueRanked.getTier(),
      summonerStats,
    };

    this.webContents.send('on-league-client', leagueClient);
    this.webContents.send('online-summoner', friendSummonerIdList);

    const key = `match-length-${summoner.summonerId}`;
    await this.redisClient.set(key, matchHistory.matchLength.toString());

    this.summoner = summoner;
    this.matchHistory = matchHistory;
  }

  public async handle() {
    await this.handleCurrentPhase();

    //챔피언 선택
    let myTeamMembers: Map<number, number> = new Map();
    this.ws.subscribe('/lol-champ-select/v1/session', async (data) => {
      if (!isJoinedRoom) {
        isJoinedRoom = true;
        this.joinTeamVoice(data.myTeam);
      }

      if (data.actions[0]) {
        for (const summoner of data.actions[0]) {
          if (summoner.championId === 0) {
            myTeamMembers.set(summoner.id, summoner.championId);
            continue;
          }
          const championId = myTeamMembers.get(summoner.id);

          if (championId !== summoner.championId) {
            myTeamMembers.set(summoner.id, summoner.championId);

            let summonerId;
            if (summoner.id >= 5) {
              if (summoner.id === 5 && data.myTeam.some((member: any) => member.team === 1)) {
                summonerId = data.myTeam[summoner.id - 1].summonerId;
              } else {
                summonerId = data.myTeam[summoner.id - 5].summonerId;
              }
            } else {
              summonerId = data.myTeam[summoner.id - 1].summonerId;
            }

            const championStats: ChampionStats = this.matchHistory.getChampionStats(
              summonerId,
              summoner.championId
            );

            this.webContents.send(IPC_KEY.CHAMP_INFO, championStats);
          }
        }
      }

      const isCloseWindow = await this.isCloseChampionSelectionWindow(data.timer.phase);
      if (isCloseWindow) {
        isJoinedRoom = false;
        this.webContents.send(IPC_KEY.EXIT_CHAMP_SELECT);
        myTeamMembers = new Map();
      }
    });

    this.ws.subscribe('/lol-gameflow/v1/session', async (data) => {
      if (data.phase === 'InProgress' && data.gameClient.running && !isInProgress) {
        isInProgress = true;
        const { teamOne, teamTwo } = data.gameData;
        await this.joinLeagueVoice(teamOne, teamTwo);

        this.fetchTime().then((currentTime: number) => {
          const ms = currentTime * 1000;
          setTimeout(() => {
            const { teamOne, teamTwo } = data.gameData;
            const teamOneSummoners = new Team(teamOne);
            const teamTwoSummoners = new Team(teamTwo);

            const summoner = teamOneSummoners.findBySummonerId(this.summoner.summonerId);
            const myTeam = summoner ? teamOneSummoners : teamTwoSummoners;
            const summonerIdList: number[] = myTeam.getSummonerIdList(this.summoner.summonerId);

            this.webContents.send(IPC_KEY.START_IN_GAME, summonerIdList);
          }, 1000 * 60 + 5000 - ms);
        });
      }

      //게임진행 도중 나감
      if (data.phase === 'None' && isInProgress) {
        isInProgress = false;
        this.webContents.send(IPC_KEY.EXIT_IN_GAME);
      }

      //게임 종료
      if (data.phase === 'WaitingForStats' && !isEndGame) {
        isEndGame = true;
        this.webContents.send(IPC_KEY.END_OF_THE_GAME);

        const matchHistory = await MatchHistory.fetch(this.summoner.puuid);
        const key = `match-length-${this.summoner.summonerId}`;
        await this.redisClient.set(key, matchHistory.matchLength.toString());
        this.matchHistory = matchHistory;
      }
    });
  }

  private async isCloseChampionSelectionWindow(phase: string) {
    const gameflowPhase = await request('/lol-gameflow/v1/gameflow-phase');
    const isNotChampSelect: boolean = gameflowPhase === 'None' || gameflowPhase === 'Lobby';
    return isJoinedRoom && phase === '' && isNotChampSelect;
  }

  private fetchTime(): Promise<number> {
    return new Promise((resolve) => {
      let interval = setInterval(async () => {
        try {
          const response = await axios({
            url: 'https://127.0.0.1:2999/liveclientdata/allgamedata',
            method: 'GET',
            httpsAgent: new https.Agent({
              rejectUnauthorized: false,
            }),
          });

          if (response.data.gameData.gameTime) {
            clearInterval(interval);
            resolve(Math.floor(response.data.gameData.gameTime));
          }
        } catch (error: any) {
          if (
            !error.toString().includes('ECONNREFUSED') &&
            !error.toString().includes('Timeout') &&
            !error.toString().includes('404')
          ) {
            throw new Error(error);
          }
        }
      }, 5000);
    });
  }

  private async handleCurrentPhase() {
    const flow = await request('/lol-gameflow/v1/session');

    if (flow.phase === 'ChampSelect') {
      isJoinedRoom = true;

      const { myTeam } = await request('/lol-champ-select/v1/session');
      this.joinTeamVoice(myTeam);

      this.sendMyTeamChampionStatsList(myTeam);
      return;
    }

    if (flow.phase === 'InProgress' && flow.gameClient.running) {
      isInProgress = true;

      const { teamOne, teamTwo } = flow.gameData;
      await this.joinLeagueVoice(teamOne, teamTwo);

      const teamOneSummoners = new Team(teamOne);
      const summoner = teamOneSummoners.findBySummonerId(this.summoner.summonerId);
      const myTeam = summoner ? teamOne : teamTwo;

      this.sendMyTeamChampionStatsList(myTeam);
      return;
    }

    try {
      const response = await axios({
        url: 'https://127.0.0.1:2999/liveclientdata/allgamedata',
        method: 'GET',
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      });

      if (response.data.gameData.gameTime) {
        const time = Math.floor(response.data.gameData.gameTime);

        if (time < 50) {
          isInProgress = true;

          const { teamOne, teamTwo } = flow.gameData;
          await this.joinLeagueVoice(teamOne, teamTwo);

          const teamOneSummoners = new Team(teamOne);
          const summoner = teamOneSummoners.findBySummonerId(this.summoner.summonerId);
          const myTeam = summoner ? teamOne : teamTwo;

          this.sendMyTeamChampionStatsList(myTeam);
          return;
        } else {
          isInProgress = true;

          const { teamOne, teamTwo } = flow.gameData;

          const teamOneSummoners = new Team(teamOne);
          const summoner = teamOneSummoners.findBySummonerId(this.summoner.summonerId);
          const myTeam = summoner ? teamOne : teamTwo;
          this.joinTeamVoice(myTeam);

          this.webContents.send(IPC_KEY.START_IN_GAME);

          this.sendMyTeamChampionStatsList(myTeam);
          return;
        }
      }
    } catch (error: any) {
      if (error.toString().includes('ECONNREFUSED')) {
        return;
      }

      throw new Error(error);
    }
  }

  private sendMyTeamChampionStatsList(myTeam: []) {
    const myTeamChampionStatsList = myTeam
      .filter((summoner: any) => summoner.championId !== 0)
      .map((summoner: any) => {
        if (summoner.championId !== 0) {
          const championStats: ChampionStats = this.matchHistory.getChampionStats(
            summoner.summonerId,
            summoner.championId
          );

          return championStats;
        }

        const championStats = {
          summonerId: summoner.summonerId,
          championIcon: null,
          name: null,
          kda: null,
          damage: null,
          cs: null,
          playCount: null,
        };

        return championStats;
      });

    this.webContents.send('selected-champ-info-list', myTeamChampionStatsList);
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
      MemberChampionData[],
      MemberChampionData[]
    ] = await Promise.all([
      teamOne.getMemberChampionKdaList(this.redisClient),
      teamTwo.getMemberChampionKdaList(this.redisClient),
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
