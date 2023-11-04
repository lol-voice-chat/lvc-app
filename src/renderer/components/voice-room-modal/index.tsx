import React, { useEffect, useState } from 'react';
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
import { IPC_KEY } from '../../../const';
import electronStore from '../../@store/electron';
import { Socket } from 'socket.io-client';
import SummonerLeagueVoiceBlock from '../summoner-league-voice-block';
import { ChampionInfoType, SummonerStatsType } from '../../@type/summoner';
import useVoiceRoom from '../../hooks/use-voice-room';
import { VoiceRoomAudioOptionType } from '../../@type/voice';
const { ipcRenderer } = window.require('electron');

function VoiceRoomModal() {
  const userStream = useRecoilValue(userStreamState);
  const gameStatus = useRecoilValue(gameStatusState);

  const summoner = useRecoilValue(summonerState);
  const myTeamSummoners = useRecoilValue(myTeamSummonersState);
  const enemySummoners = useRecoilValue(enemySummonersState);

  const [mySummonerStats, setMySummonerStats] = useState<SummonerStatsType | null>(null);
  const [selectedChampList, setSelectedChampList] = useState<Map<number, ChampionInfoType>>(
    new Map()
  );
  const [voiceOptionList, setVoiceOptionList] = useState<Map<number, VoiceRoomAudioOptionType>>(
    new Map()
  );

  const [teamManagementSocket, setTeamManagementSocket] = useState<Socket | null>(null);
  const [leagueManagementSocket, setLeagueManagementSocket] = useState<Socket | null>(null);

  const [isJoined, setIsJoined] = useState(false);

  const { joinTeamVoiceRoom, joinLeagueVoiceRoom } = useVoiceRoom();

  useEffect(() => {
    const teamSocket = connectSocket('/team-voice-chat/manage');
    const leagueSocket = connectSocket('/league-voice-chat/manage');

    electronStore.get('team-voice-room-name').then((roomName) => {
      // socket.emit('team-manage-join-room', { roomName, name: summoner?.name });
      setTeamManagementSocket(teamSocket);
    });
    electronStore.get('league-voice-room-name').then(({ roomName }) => {
      // socket.emit('league-manage-join-room', roomName);
      setLeagueManagementSocket(leagueSocket);
    });

    /* 소환사 최신 전적 불러오기 */
    ipcRenderer
      .invoke(IPC_KEY.FETCH_MATCH_HISTORY, { isMine: true, isVoice: true, puuid: summoner?.puuid })
      .then((summonerStats: SummonerStatsType) => {
        setMySummonerStats(summonerStats);
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
      teamSocket.disconnect();
      leagueSocket.disconnect();
      ipcRenderer.removeAllListeners(IPC_KEY.CHAMP_INFO);
    };
  }, []);

  useEffect(() => {
    if (userStream && mySummonerStats && !isJoined) {
      joinTeamVoiceRoom(userStream, mySummonerStats);
      setIsJoined(true);
    }
  }, [userStream, mySummonerStats, isJoined]);

  useEffect(() => {
    if (userStream && mySummonerStats) {
      if (gameStatus === 'loading') {
        joinLeagueVoiceRoom(userStream, mySummonerStats);
      }

      if (gameStatus === 'in-game') {
        leagueManagementSocket?.disconnect();
      }
    }
  }, [gameStatus, userStream, mySummonerStats]);

  return (
    <S.VoiceRoom>
      {(gameStatus === 'champ-select' || gameStatus === 'in-game') && (
        <>
          {summoner && (
            <SummonerVoiceBlock
              isMine={true}
              summoner={summoner}
              summonerStats={mySummonerStats}
              selectedChampInfo={selectedChampList.get(summoner.summonerId) ?? null}
              voiceOption={voiceOptionList.get(summoner.summonerId) ?? null}
              setVoiceOptionList={setVoiceOptionList}
              managementSocket={teamManagementSocket}
              gameStatus={gameStatus}
            />
          )}
          {myTeamSummoners?.map((myTeam) => {
            const { summonerStats, ...teamSummoner } = myTeam;

            return (
              <SummonerVoiceBlock
                isMine={false}
                summoner={teamSummoner}
                summonerStats={summonerStats}
                selectedChampInfo={selectedChampList.get(myTeam.summonerId) ?? null}
                voiceOption={voiceOptionList.get(myTeam.summonerId) ?? null}
                setVoiceOptionList={setVoiceOptionList}
                managementSocket={teamManagementSocket}
                gameStatus={gameStatus}
              />
            );
          })}
        </>
      )}

      {gameStatus === 'loading' && (
        <S.LeagueBlockBundle>
          <S.TeamBlocks isMyTeam={false}>
            {enemySummoners?.map((enemy) => {
              const { summonerStats, ...enemySummoner } = enemy;

              return (
                <SummonerLeagueVoiceBlock
                  isMine={false}
                  summoner={enemySummoner}
                  summonerStats={summonerStats}
                  voiceOption={voiceOptionList.get(enemy.summonerId) ?? null}
                  setVoiceOptionList={setVoiceOptionList}
                  managementSocket={leagueManagementSocket}
                />
              );
            })}
          </S.TeamBlocks>

          <S.TeamBlocks isMyTeam={true}>
            {summoner && (
              <SummonerLeagueVoiceBlock
                isMine={true}
                summoner={summoner}
                summonerStats={mySummonerStats}
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
