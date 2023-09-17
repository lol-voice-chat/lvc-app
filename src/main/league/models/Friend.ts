export class Friend {
  icon: number;
  gameName: string;

  getData() {
    return {
      profileImage: `https://ddragon-webp.lolmath.net/latest/img/profileicon/${this.icon}.webp`,
      displayName: this.gameName,
    };
  }
}
