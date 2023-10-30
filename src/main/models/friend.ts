export class Friend {
  private puuid: string;

  public isSamePuuid(puuid: string) {
    return this.puuid === puuid;
  }
}
