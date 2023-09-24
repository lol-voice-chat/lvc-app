export interface FriendProfile {
  id: string;
  puuid: string;
  profileImage: string;
  displayName: string;
}

interface LolData {
  gameMode: string;
  rankedLeagueDivision: string;
  rankedLeagueTier: string;
}

export class Friend {
  availability: string;
  gameTag: string;
  gameName: string;
  id: string;
  icon: number;
  lol: LolData;
  statusMessage: string;
  puuid: string;
  summonerId: number;

  public existsByGameTag() {
    return !Number.isNaN(this.gameTag);
  }

  public isOffline() {
    return (
      this.availability === 'offline' ||
      this.availability === 'mobile' ||
      this.lol.gameMode === 'TFT'
    );
  }

  public getProfile() {
    const profile: FriendProfile = {
      id: this.id,
      puuid: this.puuid,
      profileImage: `https://ddragon-webp.lolmath.net/latest/img/profileicon/${this.icon}.webp`,
      displayName: this.gameName,
    };

    return profile;
  }

  public getTier() {
    //오프라인이거나 온라인이지만 롤이 아닌 TFT일 경우
    if (Object.keys(this.lol).length === 0 || this.lol.gameMode === 'TFT') {
      return '';
    }

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
        throw new Error('존재하지 않는 랭크등급입니다.');
    }
  }

  public getProfileImage() {
    return `https://ddragon-webp.lolmath.net/latest/img/profileicon/${this.icon}.webp`;
  }
}
