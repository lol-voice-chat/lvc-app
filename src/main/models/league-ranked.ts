import { plainToInstance } from 'class-transformer';
import { request } from '../lib/request';

interface Entry {
  division: string;
  tier: string;
}

export class LeagueRanked {
  private highestRankedEntry: Entry;

  public static async fetch(puuid: string) {
    const rankedData = await request(`/lol-ranked/v1/ranked-stats/${puuid}`);
    return plainToInstance(LeagueRanked, rankedData);
  }

  public getTier() {
    const { division, tier } = this.highestRankedEntry;

    if (division === 'NA' && tier === '') {
      return 'Unrank';
    }

    const displayTier: string = tier[0];
    switch (division) {
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
}
