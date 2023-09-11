export const voiceRoomNameGenerator = (team: []) => {
  const summonerIds: number[] = team.map((summoner: any) => summoner.summonerId).sort();
  return summonerIds.join('').toString();
};
