import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import * as S from './style';
import RankBadge from '../@common/rank-badge';
import { ChampionInfoType, SummonerStatsType, SummonerType } from '../../@type/summoner';
import VolumeSlider from '../@common/volume-slider';
import { getSummonerSpeaker, micVisualizer } from '../../utils/audio';
import { useRecoilValue } from 'recoil';
import { generalSettingsConfigState, userStreamState } from '../../@store/atom';
import { Socket } from 'socket.io-client';
import { IPC_KEY } from '../../../const';
import { VoiceRoomAudioOptionType } from '../../@type/voice';
import mic_icon from '../../asset/icon/mic_icon.svg';
import mic_mute_icon from '../../asset/icon/mic_mute_icon.svg';
import headset_icon from '../../asset/icon/headset_icon.svg';
import headset_mute_icon from '../../asset/icon/headset_mute_icon.svg';
import warning_icon from '../../asset/icon/warning_icon.svg';
const { ipcRenderer } = window.require('electron');

type SummonerVoiceBlockPropsType = {
  isMine: boolean;
  summoner: SummonerType;
  summonerStats: SummonerStatsType | null;
  selectedChampInfo: ChampionInfoType | null;
  voiceOption: VoiceRoomAudioOptionType | null;
  setVoiceOptionList: Dispatch<SetStateAction<Map<number, VoiceRoomAudioOptionType>>>;
  managementSocket: Socket | null;
  gameStatus: 'champ-select' | 'in-game';
};

function SummonerVoiceBlock(props: SummonerVoiceBlockPropsType) {
  const userStream = useRecoilValue(userStreamState);
  const generalSettingsConfig = useRecoilValue(generalSettingsConfigState);

  const [speakerVolume, setSpeakerVolume] = useState(generalSettingsConfig?.speakerVolume ?? 1);
  const [beforeMuteSpeakerVolume, setBeforeMuteSpeakerVolume] = useState(
    generalSettingsConfig?.speakerVolume ?? 1
  );
  const [isMuteSpeaker, setIsMuteSpeaker] = useState(false);
  const [isMuteMic, setIsMuteMic] = useState(false);
  const [visualizerVolume, setVisualizerVolume] = useState<number>(0);

  useEffect(() => {
    /* 팀원 스피커 설정 유지 */
    if (!props.isMine && props.voiceOption) {
      setBeforeMuteSpeakerVolume(props.voiceOption.beforeMuteSpeakerVolume);
      handleChangeSpeakerVolume(props.voiceOption.speakerVolume);
    }

    /* 소환사 마이크 설정 유지 + 음소거 단축키 이벤트 */
    if (props.isMine) {
      if (
        (props.gameStatus === 'champ-select' && generalSettingsConfig?.isPressToTalk) ||
        (props.gameStatus === 'in-game' && props.voiceOption?.isMuteMic)
      ) {
        userStream?.getAudioTracks().forEach((track) => (track.enabled = false));
        setIsMuteMic(true);
      }

      ipcRenderer.on(IPC_KEY.SUMMONER_MUTE, handleClickMuteMic);
    }

    return () => {
      ipcRenderer.removeAllListeners(IPC_KEY.SUMMONER_MUTE);
    };
  }, []);

  useEffect(() => {
    if (props.gameStatus === 'champ-select') {
      const summonerId = props.summoner.summonerId;
      const option = { speakerVolume, beforeMuteSpeakerVolume, isMuteMic };

      props.setVoiceOptionList((prev) => new Map(prev).set(summonerId, option));
    }
  }, [speakerVolume, beforeMuteSpeakerVolume, isMuteMic]);

  useEffect(() => {
    const onVisualizer = (someone: { summonerId: number; visualizerVolume: number }) => {
      if (!isMuteSpeaker && props.summoner.summonerId === someone.summonerId) {
        setVisualizerVolume(someone.visualizerVolume);
      }
    };

    /* 팀원 */
    if (!props.isMine) {
      props.managementSocket?.on('mic-visualizer', onVisualizer);
    }

    return () => {
      props.managementSocket?.off('mic-visualizer', onVisualizer);
    };
  }, [props.managementSocket, isMuteSpeaker]);

  useEffect(() => {
    if (props.isMine && userStream) {
      micVisualizer(userStream, isMuteMic, setVisualizerVolume);
    }
  }, [userStream, isMuteMic]);

  useEffect(() => {
    if (props.isMine) {
      props.managementSocket?.emit('mic-visualizer', {
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
    setIsMuteMic((prev) => !prev);
  };

  return (
    <S.SummonerBlock id={props.summoner.summonerId.toString()}>
      <S.ProfileImg
        visualize={!isMuteSpeaker && visualizerVolume > 20}
        src={props.selectedChampInfo?.championIcon ?? props.summoner.profileImage}
      />
      <S.NameTag length={props.summoner.name.length}>
        <p id="name">{props.summoner.name}</p>
        <RankBadge size={'medium'} tierImg="" tier={props.summoner.tier} />
      </S.NameTag>
      <S.SoundBox>
        {props.isMine ? (
          <img
            id="mic-button"
            src={!isMuteMic ? mic_icon : mic_mute_icon}
            onClick={handleClickMuteMic}
          />
        ) : (
          <div id="speaker-ctrl">
            <img
              id="speaker-button"
              src={!isMuteSpeaker ? headset_icon : headset_mute_icon}
              onClick={handleClickMuteSpeaker}
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
        <p id="name">{props.selectedChampInfo?.name ?? '선택한 챔피언'}</p>
        <div>
          <p>평균 KDA</p>
          <p id="value">{props.selectedChampInfo?.kda ?? '-'}</p>
        </div>
        <div>
          <p>평균 피해량</p>
          <p id="value">{props.selectedChampInfo?.damage ?? '-'}</p>
        </div>
        <div>
          <p>평균 CS</p>
          <p id="value">{props.selectedChampInfo?.cs ?? '-'}</p>
        </div>
        <div>
          <p>플레이 횟수</p>
          <p id="value">{props.selectedChampInfo?.playCount ?? '-'}</p>
        </div>
      </S.AverageGameData>
      <S.GameRecord>
        {/* 이번 시즌 전적이 없을 경우 알림창 */}
        {props.summonerStats && props.summonerStats.statsList.length > 0 ? (
          <S.WinningPercentage>
            <S.Text>
              <p>승률</p>
              <p id="value">{props.summonerStats.odds}%</p>
            </S.Text>
            <S.ProgressBar>
              <progress
                value={props.summonerStats.winCount}
                max={props.summonerStats.winCount + props.summonerStats.failCount}
              />
              <p id="win">{props.summonerStats.winCount}W</p>
              <p id="fail">{props.summonerStats.failCount}L</p>
            </S.ProgressBar>
            <S.KDAList>
              {props.summonerStats.statsList.map(({ isWin, championIcon, kda }, idx) => (
                <div style={{ backgroundColor: isWin ? '#0F3054' : '#50383B' }} key={idx}>
                  <img src={championIcon} />
                  <p>{kda}</p>
                </div>
              ))}
            </S.KDAList>
          </S.WinningPercentage>
        ) : (
          <div id="warning-box">
            <img src={warning_icon} />
            <p>전적이 없습니다.</p>
          </div>
        )}
      </S.GameRecord>
    </S.SummonerBlock>
  );
}

export default SummonerVoiceBlock;
