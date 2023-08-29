import league from './league';

export interface SummonerInfo {
  summonerId: string;
  displayName: string;
  profileImage: string;
}

export const onLeagueClientUx = async () => {
  const { summonerId, displayName, profileIconId } = await league(
    'GET',
    '/lol-summoner/v1/current-summoner'
  );
  const profileImage: string = `https://ddragon-webp.lolmath.net/latest/img/profileicon/${profileIconId}.webp`;

  const summoner: SummonerInfo = { summonerId, displayName, profileImage };
  return summoner;
};
