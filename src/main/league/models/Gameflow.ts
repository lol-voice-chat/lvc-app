export class Gameflow {
  gameClient: {
    running: boolean;
    visible: boolean;
  };
  phase: string;
  gameData: {
    teamOne: [];
    teamTwo: [];
  };

  isChampSelectPhase() {
    return this.phase === 'ChampSelect';
  }

  isGameLoadingPhase() {
    return this.phase === 'InProgress' && !this.gameClient.visible;
  }

  isInGamePhase() {
    return this.phase === 'InProgress' && this.gameClient.visible;
  }
}
