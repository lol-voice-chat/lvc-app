import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import {
  enemySummonersState,
  gameStatusState,
  mySummonerStatsState,
  myTeamSummonersState,
  summonerState,
  userStreamState,
} from '../../@store/atom';
import * as S from './style';
import SummonerVoiceBlock from '../summoner-voice-block';
import { connectSocket } from '../../utils/socket';
import { IPC_KEY } from '../../../const';
import electronStore from '../../@store/electron';
import { Socket } from 'socket.io-client';
import SummonerLeagueVoiceBlock from '../summoner-league-voice-block';
import { ChampionInfoType } from '../../@type/summoner';
import useVoiceRoom from '../../hooks/use-voice-room';
import { VoiceRoomAudioOptionType } from '../../@type/voice';
const { ipcRenderer } = window.require('electron');

function VoiceRoomModal() {
  const userStream = useRecoilValue(userStreamState);
  const gameStatus = useRecoilValue(gameStatusState);

  const summoner = useRecoilValue(summonerState);
  const myTeamSummoners = useRecoilValue(myTeamSummonersState);
  const enemySummoners = useRecoilValue(enemySummonersState);

  const mySummonerStats = useRecoilValue(mySummonerStatsState);
  const [selectedChampList, setSelectedChampList] = useState<Map<number, ChampionInfoType>>(
    new Map()
  );
  const [voiceOptionList, setVoiceOptionList] = useState<Map<number, VoiceRoomAudioOptionType>>(
    new Map()
  );

  const [teamManagementSocket, setTeamManagementSocket] = useState<Socket | null>(null);
  const [leagueManagementSocket, setLeagueManagementSocket] = useState<Socket | null>(null);

  const { onTeamVoiceRoom, onLeagueVoiceRoom } = useVoiceRoom();

  useEffect(() => {
    userStream && onTeamVoiceRoom(userStream);
  }, [userStream]);

  useEffect(() => {
    electronStore.get('team-voice-room-name').then((roomName) => {
      const socket = connectSocket('/team-voice-chat/manage');
      socket.emit('team-manage-join-room', { roomName, name: summoner?.name });
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
      electronStore.get('league-voice-room-name').then(({ roomName }) => {
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

  return (
    <S.VoiceRoom>
      {(gameStatus === 'champ-select' || gameStatus === 'in-game') && (
        <>
          {summoner && mySummonerStats && (
            <SummonerVoiceBlock
              isMine={true}
              summoner={{ ...summoner, summonerStats: mySummonerStats }}
              selectedChampInfo={selectedChampList.get(summoner.summonerId) ?? null}
              voiceOption={voiceOptionList.get(summoner.summonerId) ?? null}
              setVoiceOptionList={setVoiceOptionList}
              managementSocket={teamManagementSocket}
            />
          )}
          {myTeamSummoners?.map((myTeamSummoner) => (
            <SummonerVoiceBlock
              isMine={false}
              summoner={myTeamSummoner}
              selectedChampInfo={selectedChampList.get(myTeamSummoner.summonerId) ?? null}
              voiceOption={voiceOptionList.get(myTeamSummoner.summonerId) ?? null}
              setVoiceOptionList={setVoiceOptionList}
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
                voiceOption={voiceOptionList.get(enemy.summonerId) ?? null}
                setVoiceOptionList={setVoiceOptionList}
                managementSocket={leagueManagementSocket}
              />
            ))}
          </S.TeamBlocks>

          <S.TeamBlocks isMyTeam={true}>
            {summoner && mySummonerStats && (
              <SummonerLeagueVoiceBlock
                isMine={true}
                summoner={{ ...summoner, summonerStats: mySummonerStats }}
                voiceOption={voiceOptionList.get(summoner.summonerId) ?? null}
                setVoiceOptionList={setVoiceOptionList}
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
