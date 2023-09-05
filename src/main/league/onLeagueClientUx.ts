import league from './league';
import { LCU_ENDPOINT } from '../const';

export type SummonerInfo = {
  summonerId: number;
  displayName: string;
  profileImage: string;
};

export const onLeagueClientUx = async () => {
  const { summonerId, displayName, profileIconId } = await league(LCU_ENDPOINT.SUMMONER_URL);
  const profileImage: string = `https://ddragon-webp.lolmath.net/latest/img/profileicon/${profileIconId}.webp`;

  const summoner: SummonerInfo = { summonerId, displayName, profileImage };
  return summoner;
};
