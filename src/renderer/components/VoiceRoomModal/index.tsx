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
import { Socket } from 'socket.io-client';
import electronStore from '../../@store/electron';
import { STORE_KEY } from '../../../const';

function VoiceRoomModal() {
  const gameStatus = useRecoilValue(gameStatusState);
  const summoner = useRecoilValue(summonerState);
  const myTeamSummoners = useRecoilValue(myTeamSummonersState);
  const enemySummoners = useRecoilValue(enemySummonersState);

  const [managementSocket, setManagementSocket] = useState<Socket | null>(null);

  const { onTeamVoiceRoom, onLeagueVoiceRoom } = useVoiceChat();

  const onManageTeamVoiceSocket = () => {
    const socket = connectSocket('/team-voice-chat/manage');
    setManagementSocket(socket);

    electronStore.get(STORE_KEY.TEAM_VOICE_ROOM_NAME).then((roomName) => {
      socket.emit('team-manage-join-room', roomName);
    });
  };

  useEffect(() => {
    onTeamVoiceRoom();

    onManageTeamVoiceSocket();
  }, []);

  useEffect(() => {
    gameStatus === 'loading' && onLeagueVoiceRoom();
  }, [gameStatus]);

  return (
    <S.Background>
      {summoner && managementSocket && (
        <SummonerVoiceBlock isMine={true} summoner={summoner} managementSocket={managementSocket} />
      )}

      {myTeamSummoners?.map(
        (summoner) =>
          managementSocket && (
            <SummonerVoiceBlock
              isMine={false}
              summoner={summoner}
              managementSocket={managementSocket}
            />
          )
      )}
    </S.Background>
  );
}

export default VoiceRoomModal;
