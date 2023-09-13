import React, { useEffect, useState } from 'react';
import * as S from './style';
import RankBadge from '../@common/RankBadge';
import { ChampionInfoType, SummonerStatsType, SummonerType } from '../../@type/summoner';
import VolumeSlider from '../@common/VolumeSlider';
import { micVolumeHandler } from '../../utils/audio';
import { useRecoilValue } from 'recoil';
import { teamSocketState, userStreamState } from '../../@store/atom';

function SummonerVoiceBlock(props: {
  summoner: SummonerType & SummonerStatsType;
  selectedChampInfo: ChampionInfoType | null;
  isMine: boolean;
}) {
  const userStream = useRecoilValue(userStreamState);
  const teamSocket = useRecoilValue(teamSocketState);

  const [visualizerVolume, setVisualizerVolume] = useState<number>(0);

  useEffect(() => {
    teamSocket?.on('mic-visualizer', ({ summonerId, visualizerVolume }) => {
      if (summonerId === props.summoner.summonerId) {
        setVisualizerVolume(visualizerVolume);
      }
    });

    let volumeCheckingInterval;
    if (props.isMine && userStream) {
      volumeCheckingInterval = setInterval(() => {
        micVolumeHandler(userStream, setVisualizerVolume);
      }, 1000);
    }

    return () => {
      clearInterval(volumeCheckingInterval);
      teamSocket?.removeAllListeners('mic-visualizer');
    };
  }, [userStream]);

  useEffect(() => {
    if (!props.isMine) return;

    teamSocket?.emit('mic-visualizer', { summonerId: props.summoner.summonerId, visualizerVolume });
  }, [visualizerVolume]);

  return (
    <S.SummonerBlock id={props.summoner.summonerId.toString()}>
      <S.ProfileImg
        visualize={visualizerVolume > 20}
        src={props.selectedChampInfo?.championIcon ?? props.summoner.profileImage}
      />

      <S.NameTag>
        <p id="displayName">{props.summoner.displayName}</p>
        <RankBadge size={15} tierImg="img/dummy_rank.png" tier={props.summoner.tier} />
      </S.NameTag>
      <S.TitleTag>
        <p id="titleName">드레곤 슬레이어</p>
        <div id="questionCircle">?</div>
      </S.TitleTag>

      {/* todo: 오디오 컨트롤러 기능 추가 */}
      <S.SoundBox>
        {/* <div id="audio-ctrl">
          <img src="img/mic_icon.svg" alt="마이크 아이콘" />
          <VolumeSlider buttonType="square" volume={volume} setVolume={setVolume} />
        </div>
        <div id="audio-ctrl">
          <img src="img/headset_icon.svg" alt="헤드셋 아이콘" />
          <VolumeSlider buttonType="circle" volume={volume} setVolume={setVolume} />
        </div> */}
      </S.SoundBox>

      <S.AverageGameData>
        <div>
          <p>KDA</p>
          <p id="value">{props.selectedChampInfo?.kda ?? '-'}</p>
        </div>
        <div>
          <p>평균피해량</p>
          <p id="value">{props.selectedChampInfo?.totalDamage ?? '-'}</p>
        </div>
        <div>
          <p>평균 CS</p>
          <p id="value">{props.selectedChampInfo?.totalMinionsKilled ?? '-'}</p>
        </div>
      </S.AverageGameData>

      <S.GameRecord>
        {/* 이번 시즌 전적이 없을 경우 예외 처리 */}
        {props.summoner.statsList.length !== 0 ? (
          <S.WinningPercentage>
            <S.Text>
              <p>승률</p>
              <p id="value">{props.summoner.odds}%</p>
            </S.Text>

            <S.ProgressBar>
              <progress
                value={props.summoner.winCount}
                max={props.summoner.winCount + props.summoner.failCount}
              />
              <p id="win">{props.summoner.winCount}W</p>
              <p id="fail">{props.summoner.failCount}L</p>
            </S.ProgressBar>

            <S.KDAList>
              {props.summoner.statsList.map((summonerStats) => (
                <div style={{ backgroundColor: summonerStats.isWin ? '#2C334A' : '#50383B' }}>
                  <img src={summonerStats.championIcon} alt="챔피언 아이콘" />
                  <p>{summonerStats.kda}</p>
                </div>
              ))}
            </S.KDAList>
          </S.WinningPercentage>
        ) : (
          <div id="warning-box">
            <img src="img/warning_icon.svg" alt="! 아이콘" />
            <p>전적이 없습니다.</p>
          </div>
        )}
      </S.GameRecord>
    </S.SummonerBlock>
  );
}

export default SummonerVoiceBlock;
