import React, { useEffect, useState } from 'react';
import useVoiceChat from '../../hooks/use-voice-chat';
import { useRecoilValue } from 'recoil';
import {
  enemySummonersState,
  gameStatusState,
  myTeamSummonersState,
  summonerState,
  userStreamState,
} from '../../@store/atom';
import * as S from './style';
import SummonerVoiceBlock from '../summoner-voice-block';
import { connectSocket } from '../../utils/socket';
import { IPC_KEY, STORE_KEY } from '../../../const';
import electronStore from '../../@store/electron';
import { Socket } from 'socket.io-client';
import SummonerLeagueVoiceBlock from '../summoner-league-voice-block';
import { ChampionInfoType } from '../../@type/summoner';

const { ipcRenderer } = window.require('electron');

function VoiceRoomModal() {
  const userStream = useRecoilValue(userStreamState);

  const gameStatus = useRecoilValue(gameStatusState);

  const summoner = useRecoilValue(summonerState);
  const myTeamSummoners = useRecoilValue(myTeamSummonersState);
  const enemySummoners = useRecoilValue(enemySummonersState);

  const [selectedChampList, setSelectedChampList] = useState<Map<number, ChampionInfoType>>(
    new Map()
  );

  const [teamManagementSocket, setTeamManagementSocket] = useState<Socket | null>(null);
  const [leagueManagementSocket, setLeagueManagementSocket] = useState<Socket | null>(null);

  const { onTeamVoiceRoom, onLeagueVoiceRoom } = useVoiceChat();

  useEffect(() => {
    userStream && onTeamVoiceRoom(userStream);
  }, [userStream]);

  useEffect(() => {
    electronStore.get(STORE_KEY.TEAM_VOICE_ROOM_NAME).then((roomName) => {
      const socket = connectSocket('/team-voice-chat/manage');
      socket.emit('team-manage-join-room', roomName);
      setTeamManagementSocket(socket);
    });

    /* 입장시 팀원의 (자신포함) 챔피언 리스트 받음 */
    ipcRenderer.once('selected-champ-info-list', (_, championInfoList: ChampionInfoType[]) => {
      championInfoList.map((champInfo: ChampionInfoType) => {
        setSelectedChampList((prev) => new Map([...prev, [champInfo.summonerId, champInfo]]));
      });
    });

    /* 실시간 챔피언 선택 */
    ipcRenderer.on(IPC_KEY.CHAMP_INFO, (_, championInfo: ChampionInfoType) => {
      setSelectedChampList((prev) => new Map(prev).set(championInfo.summonerId, championInfo));
    });

    return () => {
      teamManagementSocket?.disconnect();
      ipcRenderer.removeAllListeners(IPC_KEY.CHAMP_INFO);
    };
  }, []);

  useEffect(() => {
    if (gameStatus === 'loading' && userStream) {
      onLeagueVoiceRoom(userStream);
    }
  }, [gameStatus, userStream]);

  useEffect(() => {
    if (gameStatus === 'loading') {
      electronStore.get(STORE_KEY.LEAGUE_VOICE_ROOM_NAME).then(({ roomName }) => {
        const socket = connectSocket('/league-voice-chat/manage');
        socket.emit('league-manage-join-room', roomName);
        setLeagueManagementSocket(socket);
      });
    }
    if (gameStatus === 'in-game') {
      leagueManagementSocket?.disconnect();
    }

    return () => {
      leagueManagementSocket?.disconnect();
    };
  }, [gameStatus]);

  useEffect(() => {
    if (summoner) {
      ipcRenderer.send(IPC_KEY.OVERLAY_SUMMONER, summoner);
    }
    if (myTeamSummoners) {
      ipcRenderer.send(IPC_KEY.OVERLAY_MY_TEAM_SUMMONERS, myTeamSummoners);
    }
  }, [summoner, myTeamSummoners]);

  return (
    <S.VoiceRoom>
      {(gameStatus === 'champ-select' || gameStatus === 'in-game') && (
        <>
          {summoner && (
            <SummonerVoiceBlock
              isMine={true}
              summoner={summoner}
              selectedChampInfo={selectedChampList.get(summoner.summonerId) ?? null}
              managementSocket={teamManagementSocket}
            />
          )}
          {myTeamSummoners?.map((summoner) => (
            <SummonerVoiceBlock
              isMine={false}
              summoner={summoner}
              selectedChampInfo={selectedChampList.get(summoner.summonerId) ?? null}
              managementSocket={teamManagementSocket}
            />
          ))}
        </>
      )}

      {gameStatus === 'loading' && (
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
    </S.VoiceRoom>
  );
}

export default VoiceRoomModal;
