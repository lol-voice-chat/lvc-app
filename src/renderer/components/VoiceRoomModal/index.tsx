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
import { STORE_KEY } from '../../../const';
import electronStore from '../../@store/electron';
import { Socket } from 'socket.io-client';
import SummonerLeagueVoiceBlock from '../SummonerLeagueVoiceBlock';

function VoiceRoomModal() {
  const gameStatus = useRecoilValue(gameStatusState);

  const summoner = useRecoilValue(summonerState);
  const myTeamSummoners = useRecoilValue(myTeamSummonersState);
  const enemySummoners = useRecoilValue(enemySummonersState);

  const [teamManagementSocket, setTeamManagementSocket] = useState<Socket | null>(null);
  const [leagueManagementSocket, setLeagueManagementSocket] = useState<Socket | null>(null);

  const { onTeamVoiceRoom, onLeagueVoiceRoom } = useVoiceChat();

  useEffect(() => {
    onTeamVoiceRoom();

    electronStore.get(STORE_KEY.TEAM_VOICE_ROOM_NAME).then((roomName) => {
      const socket = connectSocket('/team-voice-chat/manage');
      socket.emit('team-manage-join-room', roomName);
      setTeamManagementSocket(socket);
    });

    return () => {
      teamManagementSocket?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (gameStatus === 'loading') {
      onLeagueVoiceRoom();

      electronStore.get(STORE_KEY.LEAGUE_VOICE_ROOM_NAME).then(({ roomName }) => {
        const socket = connectSocket('/league-voice-chat/manage');
        socket.emit('league-manage-join-room', roomName);
        setLeagueManagementSocket(socket);
      });
    } else if (gameStatus === 'in-game') {
      leagueManagementSocket?.disconnect();
    }

    return () => {
      leagueManagementSocket?.disconnect();
    };
  }, [gameStatus]);

  return (
    <S.VoiceRoom>
      {gameStatus !== 'loading' ? (
        <>
          {teamManagementSocket && (
            <>
              {summoner && (
                <SummonerVoiceBlock
                  isMine={true}
                  summoner={summoner}
                  managementSocket={teamManagementSocket}
                />
              )}
              {myTeamSummoners?.map((summoner) => (
                <SummonerVoiceBlock
                  isMine={false}
                  summoner={summoner}
                  managementSocket={teamManagementSocket}
                />
              ))}
            </>
          )}
        </>
      ) : (
        <>
          {leagueManagementSocket && (
            <S.LeagueBlockBundle>
              <S.TeamBlocks isMyTeam={false}>
                {enemySummoners?.map((enemy) => (
                  <SummonerLeagueVoiceBlock
                    isMine={false}
                    summoner={enemy}
                    managementSocket={leagueManagementSocket}
                  />
                ))}
              </S.TeamBlocks>

              <S.TeamBlocks isMyTeam={true}>
                {summoner && (
                  <SummonerLeagueVoiceBlock
                    isMine={true}
                    summoner={summoner}
                    managementSocket={leagueManagementSocket}
                  />
                )}
              </S.TeamBlocks>
            </S.LeagueBlockBundle>
          )}
        </>
      )}
    </S.VoiceRoom>
  );
}

export default VoiceRoomModal;
