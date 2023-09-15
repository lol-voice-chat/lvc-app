import React, { useEffect, useState } from 'react';
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
import { connectSocket } from '../../utils/socket';
import { Socket } from 'socket.io-client';
import electronStore from '../../@store/electron';
import { IPC_KEY, STORE_KEY } from '../../../const';

const { ipcRenderer } = window.require('electron');

function VoiceRoomModal() {
  const gameStatus = useRecoilValue(gameStatusState);
  const summoner = useRecoilValue(summonerState);
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
      {summoner && <SummonerVoiceBlock isMine={true} summoner={summoner} />}

      {myTeamSummoners?.map((summoner) => (
        <SummonerVoiceBlock isMine={false} summoner={summoner} />
      ))}
    </S.Background>
  );
}

export default VoiceRoomModal;
