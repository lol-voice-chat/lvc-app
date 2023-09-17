import React, { useEffect, useRef, useState } from 'react';
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
import { STORE_KEY } from '../../../const';
import electronStore from '../../@store/electron';
import { Socket } from 'socket.io-client';

function VoiceRoomModal() {
  const gameStatus = useRecoilValue(gameStatusState);

  const summoner = useRecoilValue(summonerState);
  const myTeamSummoners = useRecoilValue(myTeamSummonersState);
  const enemySummoners = useRecoilValue(enemySummonersState);

  const [managementSocket, setManagementSocket] = useState<Socket | null>(null);

  const { onTeamVoiceRoom, onLeagueVoiceRoom } = useVoiceChat();

  useEffect(() => {
    onTeamVoiceRoom();

    electronStore.get(STORE_KEY.TEAM_VOICE_ROOM_NAME).then((roomName) => {
      const socket = connectSocket('/team-voice-chat/manage');
      socket.emit('team-manage-join-room', roomName);
      setManagementSocket(socket);
    });
  }, []);

  useEffect(() => {
    gameStatus === 'loading' && onLeagueVoiceRoom();
  }, [gameStatus]);

  return (
    <S.Background>
      {managementSocket && (
        <>
          {summoner && (
            <SummonerVoiceBlock
              isMine={true}
              summoner={summoner}
              managementSocket={managementSocket}
            />
          )}

          {myTeamSummoners?.map((summoner) => (
            <SummonerVoiceBlock
              isMine={false}
              summoner={summoner}
              managementSocket={managementSocket}
            />
          ))}
        </>
      )}
    </S.Background>
  );
}

export default VoiceRoomModal;
