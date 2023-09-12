import { LCU_ENDPOINT, PHASE } from '../../const';
import league from '../common/league';
import { WebContents } from 'electron';
import { IPC_KEY } from '../../../const/index';
import { voiceRoomNameGenerator } from '../common/voiceRoomNameGenerator';
import { LeagueWebSocket } from 'league-connect';
import { SummonerData } from '../onLeagueClientUx';
import { GameflowData } from '../leagueHandler';

type ChampionData = {
  championIcon: string;
  name: string;
  kda: string;
  totalDamage: number;
  totalMinionsKilled: number;
};

let isJoinedRoom = false;

export const handle = async (
  gameflowData: GameflowData,
  webContents: WebContents,
  summoner: SummonerData,
  ws: LeagueWebSocket,
  pvpMatchlist: any[]
) => {
  if (gameflowData.phase === PHASE.CHAMP_SELECT) {
    const { myTeam } = await league(LCU_ENDPOINT.CHAMP_SELECT_URL);
    const roomName = voiceRoomNameGenerator(myTeam);
    webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName });
    isJoinedRoom = true;
  }

  ws.subscribe(LCU_ENDPOINT.CHAMP_SELECT_URL, async (data) => {
    if (data.timer.phase === 'BAN_PICK' && !isJoinedRoom) {
      const roomName: string = voiceRoomNameGenerator(data.myTeam);
      webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName });
      isJoinedRoom = true;
    }

    if (data.timer.phase === 'BAN_PICK') {
      const championData: ChampionData = getChampData(summoner, data.myTeam, pvpMatchlist);
      webContents.send(IPC_KEY.CHAMP_INFO, championData);
    }

    const isCloseWindow = await isCloseChampionSelectionWindow(data.timer.phase);
    if (isCloseWindow) {
      webContents.send(IPC_KEY.EXIT_CHAMP_SELECT);
      isJoinedRoom = false;
    }
  });
};

function getChampData(summoner: SummonerData, myTeam: any[], pvpMatchlist: any[]) {
  const { summonerId, profileImage } = summoner;

  let champKill = 0;
  let champDeath = 0;
  let champAssists = 0;
  let totalDamage = 0;
  let totalMinionsKilled = 0;
  let champCount = 0;

  const { championId } = myTeam.find((summoner: any) => summoner.summonerId === summonerId);

  pvpMatchlist.forEach((game: any) => {
    game.participants
      .filter((summoner: any) => summoner.championId === championId)
      .forEach((summoner: any) => {
        champKill += summoner.stats.kills;
        champDeath += summoner.stats.deaths;
        champAssists += summoner.stats.assists;
        totalDamage += summoner.stats.totalDamageDealtToChampions;
        totalMinionsKilled += summoner.stats.totalMinionsKilled;
        champCount++;
      });
  });

  const championIcon = championId
    ? `https://lolcdn.darkintaqt.com/cdn/champion/${championId}/tile`
    : profileImage;

  const championData: ChampionData = {
    championIcon: championIcon,
    name: 'test',
    kda: `${champKill / champCount}/${champDeath / champCount}/${champAssists / champCount}`,
    totalDamage: totalDamage / champCount,
    totalMinionsKilled: totalMinionsKilled / champCount,
  };

  return championData;
}

async function isCloseChampionSelectionWindow(phase: string) {
  const gameflowPhase = await league(LCU_ENDPOINT.GAMEFLOW_PHASE_URL);
  const isNotChampSelect: boolean = gameflowPhase === PHASE.NONE || gameflowPhase === PHASE.LOBBY;
  return isJoinedRoom && phase === '' && isNotChampSelect;
}
