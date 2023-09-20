export interface CurrentSummoner {
  gameName: string;
  icon: number;
  lol: LeagueRanked;
  statusMessage: string;
  puuid: string;
  summonerId: number;
}

interface LeagueRanked {
  rankedLeagueDivision: string;
  rankedLeagueTier: string;
}

export const isEmptySummonerData = (summoner: CurrentSummoner) => {
  return summoner.gameName === '';
};

export const getTier = (leagueRanked: LeagueRanked) => {
  const { rankedLeagueDivision, rankedLeagueTier } = leagueRanked;
  const displayTier: string = rankedLeagueTier[0];

  if (rankedLeagueDivision === 'NA' && rankedLeagueTier === '') {
    return 'Unrank';
  }

  switch (rankedLeagueDivision) {
    case 'I':
      return displayTier + 1;
    case 'II':
      return displayTier + 2;
    case 'III':
      return displayTier + 3;
    case 'IV':
      return displayTier + 4;
    case 'V':
      return displayTier + 5;
    default:
      throw new Error('랭크등급이 존재하지 않습니다.');
  }
};

export const getProfileImage = (profileIcon: number) => {
  return `https://ddragon-webp.lolmath.net/latest/img/profileicon/${profileIcon}.webp`;
};
