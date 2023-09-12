import React, { useEffect } from 'react';
import useVoiceChat from '../../hooks/useVoiceChat';
import { useRecoilValue } from 'recoil';
import {
  enemySummonersState,
  gameStatusState,
  myTeamSummonersState,
  summonerState,
} from '../../@store/atom';
import * as S from './style';
import SummonerVoiceBlock from '../SummonerVoiceBlock';

const summoner = {
  summonerId: 12212,
  displayName: '붕붕띠 1호',
  profileImage: '',
  rankTier: 'D3',
  statusMessage: '이잉ㅇ',
  odds: 50,
  winCount: 10,
  failCount: 10,
  summonerStatsList: [
    { championIcon: '', kda: '1/2/3', isVictory: true },
    { championIcon: '', kda: '1/2/3', isVictory: true },
    { championIcon: '', kda: '1/2/3', isVictory: true },
    { championIcon: '', kda: '1/2/3', isVictory: true },
    { championIcon: '', kda: '1/2/3', isVictory: true },
    { championIcon: '', kda: '1/2/3', isVictory: true },
    { championIcon: '', kda: '1/2/3', isVictory: true },
    { championIcon: '', kda: '1/2/3', isVictory: true },
    { championIcon: '', kda: '1/2/3', isVictory: true },
    { championIcon: '', kda: '1/2/3', isVictory: true },
  ],
};

function VoiceRoomModal() {
  const gameStatus = useRecoilValue(gameStatusState);
  // const summoner = useRecoilValue(summonerState);
  const myTeamSummoners = useRecoilValue(myTeamSummonersState);
  const enemySummoners = useRecoilValue(enemySummonersState);

  const { onTeamVoiceRoom, onLeagueVoiceRoom } = useVoiceChat();

  useEffect(() => {
    onTeamVoiceRoom();
  }, []);

  useEffect(() => {
    gameStatus === 'loading' && onLeagueVoiceRoom();
  }, [gameStatus]);

  return (
    <S.Background>
      {summoner && <SummonerVoiceBlock summoner={summoner} />}

      {myTeamSummoners?.map((summoner) => (
        <SummonerVoiceBlock summoner={summoner} />
      ))}
    </S.Background>
  );
}

export default VoiceRoomModal;
