import { LCU_ENDPOINT, PHASE, CHAMPIONS } from '../../const';
import league from '../common/league';
import { WebContents } from 'electron';
import { IPC_KEY } from '../../../const/index';
import { voiceRoomNameGenerator } from '../common/voiceRoomNameGenerator';
import { LeagueWebSocket } from 'league-connect';
import { SummonerData } from '../onLeagueClientUx';
import { GameflowData } from '../leagueHandler';

type ChampionData = {
  summonerId: number;
  championIcon: string;
  name: string;
  kda: string;
  totalDamage: string;
  totalMinionsKilled: string;
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
    const participant = game.participants[0];
    if (participant.championId === championId) {
      champKill += participant.stats.kills;
      champDeath += participant.stats.deaths;
      champAssists += participant.stats.assists;
      totalDamage += participant.stats.totalDamageDealtToChampions;
      totalMinionsKilled += participant.stats.totalMinionsKilled;
      champCount++;
    }
  });

  const championIcon = championId
    ? `https://lolcdn.darkintaqt.com/cdn/champion/${championId}/tile`
    : profileImage;

  const championName: string = CHAMPIONS[championId.toString()];

  if (champCount === 0) {
    const championData: ChampionData = {
      summonerId,
      championIcon: championIcon,
      name: championName,
      kda: '전적 없음',
      totalDamage: '전적 없음',
      totalMinionsKilled: '전적 없음',
    };

    return championData;
  }

  const championData: ChampionData = {
    summonerId,
    championIcon: championIcon,
    name: championName,
    kda: `${(champKill / champCount).toFixed(1)}/${(champDeath / champCount).toFixed(1)}/${(
      champAssists / champCount
    ).toFixed(1)}`,
    totalDamage: Math.floor(totalDamage / champCount).toString(),
    totalMinionsKilled: (totalMinionsKilled / champCount).toFixed(1),
  };

  return championData;
}

async function isCloseChampionSelectionWindow(phase: string) {
  const gameflowPhase = await league(LCU_ENDPOINT.GAMEFLOW_PHASE_URL);
  const isNotChampSelect: boolean = gameflowPhase === PHASE.NONE || gameflowPhase === PHASE.LOBBY;
  return isJoinedRoom && phase === '' && isNotChampSelect;
}
