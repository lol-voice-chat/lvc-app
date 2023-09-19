export const voiceRoomNameGenerator = (team: any[]) => {
  const summonerIds: number[] = team.map((summoner: any) => summoner.summonerId).sort();
  return summonerIds.join('').toString();
};
