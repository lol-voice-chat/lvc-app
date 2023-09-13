import React, { useContext, useEffect } from 'react';
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
import { ChampionInfoType, SummonerStatsType, SummonerType } from '../../@type/summoner';
import { IPC_KEY } from '../../../const';
import { TeamSocketContext } from '../../utils/socket';

const { ipcRenderer } = window.require('electron');

// const summoner: SummonerType & SummonerStatsType = {
//   summonerId: 13122,
//   displayName: '붕붕띠띠시발',
//   profileImage: '',
//   odds: 22,
//   winCount: 12,
//   failCount: 1,
//   tier: 'P2',
//   statusMessage: 'sdd',
//   statsList: [{ championIcon: '', kda: '', isWin: true }],
// };

function VoiceRoomModal() {
  const selectedChampionMap: Map<number, ChampionInfoType> = new Map();

  const teamSocket = useContext(TeamSocketContext);

  const gameStatus = useRecoilValue(gameStatusState);
  const summoner = useRecoilValue(summonerState);
  const myTeamSummoners = useRecoilValue(myTeamSummonersState);
  const enemySummoners = useRecoilValue(enemySummonersState);

  const { onTeamVoiceRoom, onLeagueVoiceRoom } = useVoiceChat();

  useEffect(() => {
    onTeamVoiceRoom();
  }, []);

  useEffect(() => {
    ipcRenderer.on(IPC_KEY.CHAMP_INFO, (_, championInfo: ChampionInfoType) => {
      selectedChampionMap.set(championInfo.summonerId, championInfo);
      teamSocket?.emit('champion-info', championInfo);
      console.log(teamSocket);
    });

    teamSocket?.on('champion-info', (championInfo) => {
      selectedChampionMap.set(championInfo.summonerId, championInfo);
    });

    return () => {
      ipcRenderer.removeAllListeners(IPC_KEY.CHAMP_INFO);
    };
  }, [teamSocket]);

  useEffect(() => {
    gameStatus === 'loading' && onLeagueVoiceRoom();
  }, [gameStatus]);

  return (
    <S.Background>
      {summoner && (
        <SummonerVoiceBlock
          isMine={true}
          summoner={summoner}
          selectedChampInfo={selectedChampionMap.get(summoner.summonerId) ?? null}
        />
      )}

      {myTeamSummoners?.map((summoner) => (
        <SummonerVoiceBlock
          key={summoner.summonerId}
          isMine={false}
          summoner={summoner}
          selectedChampInfo={selectedChampionMap.get(summoner.summonerId) ?? null}
        />
      ))}
    </S.Background>
  );
}

export default VoiceRoomModal;
