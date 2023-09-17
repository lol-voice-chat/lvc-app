interface LeagueRanked {
  rankedLeagueDivision: string;
  rankedLeagueTier: string;
}

export class LeagueClient {
  gameName: string;
  icon: number;
  lol: LeagueRanked;
  statusMessage: string;
  puuid: string;
  summonerId: number;

  getTier() {
    const { rankedLeagueDivision, rankedLeagueTier } = this.lol;
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
        return 'error';
    }
  }

  isEmptyName() {
    return this.gameName === '';
  }

  getProfileImage() {
    return `https://ddragon-webp.lolmath.net/latest/img/profileicon/${this.icon}.webp`;
  }
}
