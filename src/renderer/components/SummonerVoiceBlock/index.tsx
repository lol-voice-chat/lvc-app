import React, { useState } from 'react';
import * as S from './style';
import RankBadge from '../@common/RankBadge';
import { ChampionInfoType, SummonerStatsType, SummonerType } from '../../@type/summoner';
import { IPC_KEY } from '../../../const';
import VolumeSlider from '../@common/VolumeSlider';

const { ipcRenderer } = window.require('electron');

function SummonerVoiceBlock(props: { summoner: SummonerType & SummonerStatsType }) {
  const [selectedChampInfo, setSelectedChampInfo] = useState<ChampionInfoType | null>(null);
  const [volume, setVolume] = useState<number>(0);

  ipcRenderer.on(IPC_KEY.CHAMP_INFO, (_, championInfo: ChampionInfoType) => {
    setSelectedChampInfo(championInfo);
  });

  return (
    <S.SummonerBlock id={props.summoner.summonerId.toString()}>
      {/* todo: 마이크 소리 감지 센서 */}
      <S.ProfileImg src={props.summoner.profileImage} />

      <S.NameTag>
        <p id="displayName">{props.summoner.displayName}</p>
        <RankBadge size={15} tierImg="img/dummy_rank.png" tier={props.summoner.rankTier} />
      </S.NameTag>
      <S.TitleTag>
        <p id="titleName">드레곤 슬레이어</p>
        <div id="questionCircle">?</div>
      </S.TitleTag>

      {/* todo: 오디오 컨트롤러 기능 추가 */}
      <S.SoundBox>
        <div id="audio-ctrl">
          <img src="img/mic_icon.svg" alt="마이크 아이콘" />
          <VolumeSlider buttonType="square" volume={volume} setVolume={setVolume} />
        </div>
        <div id="audio-ctrl">
          <img src="img/headset_icon.svg" alt="헤드셋 아이콘" />
          <VolumeSlider buttonType="circle" volume={volume} setVolume={setVolume} />
        </div>
      </S.SoundBox>

      <S.AverageGameData>
        <div>
          <p>KDA</p>
          <p id="value">{selectedChampInfo?.kda ?? '-'}</p>
        </div>
        <div>
          <p>평균피해량</p>
          <p id="value">{selectedChampInfo?.totalDamage ?? '-'}</p>
        </div>
        <div>
          <p>평균 CS</p>
          <p id="value">{selectedChampInfo?.totalMinionsKilled ?? '-'}</p>
        </div>
      </S.AverageGameData>

      <S.GameRecord>
        <S.WinningPercentage>
          <S.Text>
            <p>승률</p>
            <p id="value">{props.summoner.odds}%</p>
          </S.Text>

          <S.ProgressBar>
            <progress value={props.summoner.winCount} max={20} />
            <p id="win">{props.summoner.winCount}W</p>
            <p id="lose">{props.summoner.failCount}L</p>
          </S.ProgressBar>

          <S.KDAList>
            {props.summoner.summonerStatsList?.map((summonerStats) => (
              <div style={{ backgroundColor: summonerStats.isVictory ? '#2C334A' : '#50383B' }}>
                <img src={summonerStats.championIcon} alt="챔피언 아이콘" />
                <p>{summonerStats.kda}</p>
              </div>
            ))}
          </S.KDAList>
        </S.WinningPercentage>
      </S.GameRecord>
    </S.SummonerBlock>
  );
}

export default SummonerVoiceBlock;
