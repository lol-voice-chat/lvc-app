import React, { useEffect, useState } from 'react';
import * as S from './style';
import RankBadge from '../@common/RankBadge';
import { ChampionInfoType, SummonerType } from '../../@type/summoner';
import VolumeSlider from '../@common/VolumeSlider';
import { getSummonerSpeaker, micVolumeHandler } from '../../utils/audio';
import { IPC_KEY } from '../../../const';
import { useRecoilValue } from 'recoil';
import { userStreamState } from '../../@store/atom';
import { Socket } from 'socket.io-client';

const { ipcRenderer } = window.require('electron');

function SummonerVoiceBlock(props: {
  isMine: boolean;
  summoner: SummonerType;
  managementSocket: Socket;
}) {
  // 선택한 챔피언 정보
  const [selectedChampion, setSelectedChampion] = useState<ChampionInfoType | null>(null);

  // 스피커, 마이크 정보
  const userStream = useRecoilValue(userStreamState);
  const [speakerVolume, setSpeakerVolume] = useState(0.8);
  const [beforeMuteSpeakerVolume, setBeforeMuteSpeakerVolume] = useState(0.8);
  const [isMuteSpeaker, setIsMuteSpeaker] = useState(false);
  const [isMuteMic, setIsMuteMic] = useState(false);
  const [visualizerVolume, setVisualizerVolume] = useState<number>(0);

  useEffect(() => {
    if (props.isMine) {
      ipcRenderer.on(IPC_KEY.CHAMP_INFO, (_, championInfo: ChampionInfoType) => {
        setSelectedChampion(championInfo);
        props.managementSocket.emit('champion-info', championInfo);
      });
    } else {
      props.managementSocket.on('champion-info', (championInfo: ChampionInfoType) => {
        if (props.summoner.summonerId === championInfo.summonerId) {
          setSelectedChampion(championInfo);
        }
      });
      props.managementSocket.on('mic-visualizer', ({ summonerId, visualizerVolume }) => {
        if (props.summoner.summonerId === summonerId) {
          setVisualizerVolume(visualizerVolume);
        }
      });
    }

    return () => {
      ipcRenderer.removeAllListeners(IPC_KEY.CHAMP_INFO);
    };
  }, []);

  useEffect(() => {
    let visualizerInterval;
    if (userStream && props.isMine) {
      visualizerInterval = setInterval(() => {
        micVolumeHandler(userStream, setVisualizerVolume);
      }, 1000);
    }
    return () => clearInterval(visualizerInterval);
  }, [userStream]);

  useEffect(() => {
    if (props.isMine) {
      props.managementSocket.emit('mic-visualizer', {
        summonerId: props.summoner.summonerId,
        visualizerVolume,
      });
    }
  }, [visualizerVolume]);

  const handleChangeSpeakerVolume = (speakerVolume: number) => {
    const speaker = getSummonerSpeaker(props.summoner.summonerId);
    speaker.volume = speakerVolume;
    setSpeakerVolume(speakerVolume);
    setIsMuteSpeaker(speakerVolume === 0);
  };

  const handleClickMuteSpeaker = () => {
    if (isMuteSpeaker) {
      handleChangeSpeakerVolume(beforeMuteSpeakerVolume);
    } else {
      setBeforeMuteSpeakerVolume(speakerVolume);
      handleChangeSpeakerVolume(0);
    }
  };

  const handleClickMuteMic = () => {
    userStream?.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    setIsMuteMic((curMute) => !curMute);
  };

  return (
    <S.SummonerBlock id={props.summoner.summonerId.toString()}>
      <S.ProfileImg
        visualize={!isMuteSpeaker && visualizerVolume > 20}
        src={selectedChampion?.championIcon ?? props.summoner.profileImage}
      />

      <S.NameTag>
        <p id="displayName">{props.summoner.displayName}</p>
        <RankBadge size={14} tierImg="img/dummy_rank.png" tier={props.summoner.tier} />
      </S.NameTag>
      <S.TitleTag>
        <p id="titleName">드레곤 슬레이어</p>
        <div id="questionCircle">?</div>
      </S.TitleTag>

      <S.SoundBox>
        {props.isMine ? (
          <img
            id="mic-button"
            src={!isMuteMic ? 'img/mic_icon.svg' : 'img/mic_mute_icon.svg'}
            onClick={handleClickMuteMic}
            alt="마이크 아이콘"
          />
        ) : (
          <div id="speaker-ctrl">
            <img
              id="speaker-button"
              src={!isMuteSpeaker ? 'img/headset_icon.svg' : 'img/headset_mute_icon.svg'}
              onClick={handleClickMuteSpeaker}
              alt="헤드셋 아이콘"
            />
            <VolumeSlider
              audiotype="speaker"
              volume={speakerVolume}
              handleChangeVolume={handleChangeSpeakerVolume}
            />
            <audio id={props.summoner.summonerId.toString() + 'speaker'} autoPlay />
          </div>
        )}
      </S.SoundBox>

      <S.AverageGameData>
        <p id="name">{selectedChampion?.name ?? '-'}</p>
        <div>
          <p>KDA</p>
          <p id="value">{selectedChampion?.kda ?? '-'}</p>
        </div>
        <div>
          <p>평균피해량</p>
          <p id="value">{selectedChampion?.totalDamage ?? '-'}</p>
        </div>
        <div>
          <p>평균 CS</p>
          <p id="value">{selectedChampion?.totalMinionsKilled ?? '-'}</p>
        </div>
      </S.AverageGameData>

      <S.GameRecord>
        {/* 이번 시즌 전적이 없을 경우 알림창 */}
        {props.summoner.summonerStats.statsList.length !== 0 ? (
          <S.WinningPercentage>
            <S.Text>
              <p>승률</p>
              <p id="value">{props.summoner.summonerStats.odds}%</p>
            </S.Text>

            <S.ProgressBar>
              <progress
                value={props.summoner.summonerStats.winCount}
                max={props.summoner.summonerStats.winCount + props.summoner.summonerStats.failCount}
              />
              <p id="win">{props.summoner.summonerStats.winCount}W</p>
              <p id="fail">{props.summoner.summonerStats.failCount}L</p>
            </S.ProgressBar>

            <S.KDAList>
              {props.summoner.summonerStats.statsList.map((summonerStats, idx) => (
                <div
                  key={idx}
                  style={{ backgroundColor: summonerStats.isWin ? '#2C334A' : '#50383B' }}
                >
                  <img src={summonerStats.championIcon} alt="챔피언 아이콘" />
                  <p>{summonerStats.kda}</p>
                </div>
              ))}
            </S.KDAList>
          </S.WinningPercentage>
        ) : (
          <div id="warning-box">
            <img src="img/warning_icon.svg" alt="위험 아이콘" />
            <p>전적이 없습니다.</p>
          </div>
        )}
      </S.GameRecord>
    </S.SummonerBlock>
  );
}

export default SummonerVoiceBlock;
