import league from '../utils/league';
import { LCU_ENDPOINT } from '../constants';
import { plainToInstance } from 'class-transformer';

interface GameClient {
  running: boolean;
  visible: boolean;
}

interface GameData {
  teamOne: [];
  teamTwo: [];
}

export class Gameflow {
  gameClient: GameClient;
  phase: 'None' | 'Lobby' | 'ChampSelect' | 'InProgress';
  gameData: GameData;

  public static async fetch() {
    const gameflowData = await league(LCU_ENDPOINT.GAMEFLOW_URL);
    return plainToInstance(Gameflow, gameflowData);
  }

  public isChampselectPhase() {
    return this.phase === 'ChampSelect';
  }

  public isGameLoadingPhase() {
    return this.phase === 'InProgress' && !this.gameClient.visible;
  }

  public isInGamePhase() {
    return this.phase === 'InProgress' && this.gameClient.visible;
  }
}
