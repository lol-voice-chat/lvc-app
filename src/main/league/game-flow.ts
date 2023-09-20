export interface Gameflow {
  gameClient: {
    visible: boolean;
  };
  gameData: {
    teamOne: [];
    teamTwo: [];
  };
  phase: 'None' | 'Lobby' | 'ChampSelect' | 'InProgress';
}

export const isChampselectPhase = (gameflow: Gameflow) => {
  return gameflow.phase === 'ChampSelect';
};

export const isGameLoadingPhase = (gameflow: Gameflow) => {
  return gameflow.phase === 'InProgress' && !gameflow.gameClient.visible;
};

export const isCloseGameLoadingWindow = (gameflow: Gameflow) => {
  return gameflow.phase === 'None' && !gameflow.gameClient.visible;
};

export const isInGamePhase = (gameflow: Gameflow) => {
  return gameflow.phase === 'InProgress' && gameflow.gameClient.visible;
};

export const isCloseInGameWIndow = (gameflow: Gameflow) => {
  return gameflow.phase === 'None' && gameflow.gameClient.visible;
};
