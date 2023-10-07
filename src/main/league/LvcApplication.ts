import { WebContents } from 'electron';
import {
  Credentials,
  LeagueClient,
  LeagueWebSocket,
  createWebSocketConnection,
} from 'league-connect';
import { IPC_KEY } from '../../const';
import { Summoner } from './Summoner';
import { LeagueRanked } from './LeagueRanked';
import { ChampionStats, MatchHistory, SummonerStats } from './MatchHistory';
import request from '../utils';
import { MemberChampionData, Team } from './Team';
import axios from 'axios';
import https from 'https';
import { handleFriendRequestEvent } from './handleFriendRequestEvent';

export let credentials: Credentials;
let isJoinedRoom = false;
let isStartedGameLoading = false;
let isStartedInGame = false;
let isEndGame = false;

export class LvcApplication {
  private webContents: WebContents;
  private ws: LeagueWebSocket;
  private summonerId: number;
  private matchHistory: MatchHistory;

  constructor(webContents: WebContents, credential: Credentials, ws: LeagueWebSocket) {
    credentials = credential;
    this.webContents = webContents;
    this.ws = ws;
  }

  public async initialize() {
    const client = new LeagueClient(credentials);
    client.start();

    client.on('connect', async (newCredentials) => {
      credentials = newCredentials;
      await this.fetchLeagueClient();
      this.ws = await createWebSocketConnection();
    });

    client.on('disconnect', () => {
      this.webContents.send(IPC_KEY.SHUTDOWN_APP);
    });

    await this.fetchLeagueClient();
    handleFriendRequestEvent();
  }

  public async fetchLeagueClient() {
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

    this.summonerId = summoner.summonerId;
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
              if (summoner.id === 5) {
                if (data.myTeam.filter((member: any) => member.team === 1).length > 0) {
                  summonerId = data.myTeam[summoner.id - 1].summonerId;
                }
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
      if (data.phase === 'InProgress' && data.gameClient.running && !isStartedGameLoading) {
        isStartedGameLoading = true;

        const { teamOne, teamTwo } = data.gameData;
        await this.joinLeagueVoice(teamOne, teamTwo);

        this.fetchTime().then((currentTime: number) => {
          const ms = currentTime * 1000;
          setTimeout(() => {
            isStartedInGame = true;

            const { teamOne, teamTwo } = data.gameData;
            const teamOneSummoners = new Team(teamOne);
            const teamTwoSummoners = new Team(teamTwo);

            const summoner = teamOneSummoners.findBySummonerId(this.summonerId);
            const myTeam = summoner ? teamOneSummoners : teamTwoSummoners;
            const summonerIdList: number[] = myTeam.getSummonerIdList(this.summonerId);

            this.webContents.send(IPC_KEY.START_IN_GAME, summonerIdList);
          }, 1000 * 60 + 5000 - ms);
        });
      }

      //게임로딩 도중 나감
      if (data.phase === 'None' && data.gameClient.running && isStartedGameLoading) {
        isStartedGameLoading = false;
        this.webContents.send(IPC_KEY.EXIT_IN_GAME);
      }

      //인게임 도중 나감
      if (data.phase === 'None' && data.gameClient.visible && isStartedInGame) {
        isStartedInGame = false;
        this.webContents.send(IPC_KEY.EXIT_IN_GAME);
      }

      //게임 종료
      if (data.phase === 'WaitingForStats' && !isEndGame) {
        isEndGame = true;
        this.webContents.send(IPC_KEY.EXIT_IN_GAME);
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
        } catch (error) {
          //에러나도 게임 경과 시간 받아올 때까지 반복
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

      const myTeamSummonerChampionStatsList = await Promise.all(
        myTeam
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
          })
      );

      this.webContents.send('selected-champ-info-list', myTeamSummonerChampionStatsList);
      return;
    }

    if (flow.phase === 'InProgress' && flow.gameClient.running) {
      isStartedInGame = true;

      const { teamOne, teamTwo } = flow.gameData;
      await this.joinLeagueVoice(teamOne, teamTwo);

      const teamOneSummoners = new Team(teamOne);
      const summoner = teamOneSummoners.findBySummonerId(this.summonerId);
      const myTeam = summoner ? teamOne : teamTwo;

      const myTeamSummonerChampionStatsList = await Promise.all(
        myTeam
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
          })
      );

      this.webContents.send('selected-champ-info-list', myTeamSummonerChampionStatsList);
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
          isStartedInGame = true;

          const { teamOne, teamTwo } = flow.gameData;
          await this.joinLeagueVoice(teamOne, teamTwo);

          const teamOneSummoners = new Team(teamOne);
          const summoner = teamOneSummoners.findBySummonerId(this.summonerId);
          const myTeam = summoner ? teamOne : teamTwo;

          const myTeamSummonerChampionStatsList = await Promise.all(
            myTeam
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
              })
          );

          this.webContents.send('selected-champ-info-list', myTeamSummonerChampionStatsList);
          return;
        } else {
          isStartedInGame = true;

          const { teamOne, teamTwo } = flow.gameData;

          const teamOneSummoners = new Team(teamOne);
          const summoner = teamOneSummoners.findBySummonerId(this.summonerId);
          const myTeam = summoner ? teamOne : teamTwo;
          this.joinTeamVoice(myTeam);

          this.webContents.send(IPC_KEY.START_IN_GAME);

          const myTeamSummonerChampionStatsList = await Promise.all(
            myTeam
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
              })
          );

          this.webContents.send('selected-champ-info-list', myTeamSummonerChampionStatsList);
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

  private joinTeamVoice(myTeam: []) {
    const team = new Team(myTeam);
    const roomName = team.createVoiceRoomName();
    this.webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName });
  }

  private async joinLeagueVoice(teamOneData: [], teamTwoData: []) {
    const teamOne = new Team(teamOneData);
    const teamTwo = new Team(teamTwoData);

    const roomName = teamOne.createVoiceRoomName() + teamTwo.createVoiceRoomName();

    const summoner = teamOne.findBySummonerId(this.summonerId);
    const myTeam = summoner ? teamOne : teamTwo;
    const teamName = myTeam.createVoiceRoomName();

    const [teamOneSummonerChampionKdaList, teamTwoSummonerChampionKdaList]: [
      MemberChampionData[],
      MemberChampionData[]
    ] = await Promise.all([teamOne.getMemberChampionKdaList(), teamTwo.getMemberChampionKdaList()]);
    const summonerDataList = teamOneSummonerChampionKdaList.concat(teamTwoSummonerChampionKdaList);

    this.webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName: teamName });
    this.webContents.send(IPC_KEY.LEAGUE_JOIN_ROOM, {
      roomName,
      teamName,
      summonerDataList,
    });
  }
}
