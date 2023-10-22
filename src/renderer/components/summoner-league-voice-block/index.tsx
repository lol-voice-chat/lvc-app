import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import {
  LeagueChampInfoType,
  generalSettingsConfigState,
  leagueChampInfoListState,
  userStreamState,
} from '../../@store/atom';
import { SummonerStatsType, SummonerType } from '../../@type/summoner';
import { Socket } from 'socket.io-client';
import { getSummonerSpeaker, micVisualizer } from '../../utils/audio';
import VolumeSlider from '../@common/volume-slider';
import * as S from './style';
import RankBadge from '../@common/rank-badge';
import { IPC_KEY } from '../../../const';
import { VoiceRoomAudioOptionType } from '../../@type/voice';
const { ipcRenderer } = window.require('electron');

type SummonerLeagueVoiceBlock = {
  isMine: boolean;
  summoner: SummonerType;
  summonerStats: SummonerStatsType | null;
  voiceOption: VoiceRoomAudioOptionType | null;
  setVoiceOptionList: Dispatch<SetStateAction<Map<number, VoiceRoomAudioOptionType>>>;
  managementSocket: Socket | null;
};

function SummonerLeagueVoiceBlock(props: SummonerLeagueVoiceBlock) {
  const generalSettingsConfig = useRecoilValue(generalSettingsConfigState);
  const userStream = useRecoilValue(userStreamState);

  const leagueChampInfoList = useRecoilValue(leagueChampInfoListState);
  const [myChampInfo, setMyChampInfo] = useState<LeagueChampInfoType | null>(null);

  const [speakerVolume, setSpeakerVolume] = useState(generalSettingsConfig?.speakerVolume ?? 0.8);
  const [beforeMuteSpeakerVolume, setBeforeMuteSpeakerVolume] = useState(
    generalSettingsConfig?.speakerVolume ?? 0.8
  );
  const [isMuteSpeaker, setIsMuteSpeaker] = useState(false);
  const [isMuteMic, setIsMuteMic] = useState(false);
  const [visualizerVolume, setVisualizerVolume] = useState<number>(0);

  useEffect(() => {
    /* 팀 보이스에서 저장했던 옵션 받아오기 */
    if (!props.isMine && props.voiceOption) {
      setBeforeMuteSpeakerVolume(props.voiceOption.beforeMuteSpeakerVolume);
      handleChangeSpeakerVolume(props.voiceOption.speakerVolume);
    }

    /* 소환사 마이크 설정 유지 + 음소거 단축키 이벤트 */
    if (props.isMine) {
      if (props.voiceOption?.isMuteMic) {
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
    const summonerId = props.summoner.summonerId;
    const option = { speakerVolume, beforeMuteSpeakerVolume, isMuteMic };

    props.setVoiceOptionList((prev) => new Map(prev).set(summonerId, option));
  }, [speakerVolume, beforeMuteSpeakerVolume, isMuteMic]);

  useEffect(() => {
    const onVisualizer = (someone: { summonerId: number; visualizerVolume: number }) => {
      if (!isMuteSpeaker && props.summoner.summonerId === someone.summonerId) {
        setVisualizerVolume(someone.visualizerVolume);
      }
    };

    /* 적팀 or 팀원 */
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

  useEffect(() => {
    if (leagueChampInfoList) {
      leagueChampInfoList.map((champInfo) => {
        if (props.summoner.summonerId === champInfo.summonerId) {
          setMyChampInfo(champInfo);
        }
      });
    }
  }, [leagueChampInfoList]);

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
        src={myChampInfo?.championIcon ?? props.summoner.profileImage}
      />

      <S.SummonerInfo id="summoner-info">
        <S.NameTag length={props.summoner.name.length}>
          <p id="name">{props.summoner.name}</p>
          <RankBadge size={'medium'} tierImg="img/dummy_rank.png" tier={props.summoner.tier} />
        </S.NameTag>

        <S.SoundBox>
          {props.isMine ? (
            <img
              id="mic-button"
              src={!isMuteMic ? 'img/mic_icon.svg' : 'img/mic_mute_icon.svg'}
              onClick={handleClickMuteMic}
            />
          ) : (
            <div id="speaker-ctrl">
              <img
                id="speaker-button"
                src={!isMuteSpeaker ? 'img/headset_icon.svg' : 'img/headset_mute_icon.svg'}
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

        {props.summonerStats && props.summonerStats.statsList.length > 0 ? (
          <>
            <S.WinningPercentage odds={props.summonerStats.odds}>
              <S.ProgressBar>
                <progress
                  value={props.summonerStats.winCount}
                  max={props.summonerStats.winCount + props.summonerStats.failCount}
                />
                <p id="win">{props.summonerStats.winCount}W</p>
                <p id="fail">{props.summonerStats.failCount}L</p>
              </S.ProgressBar>
              <p id="odds">{props.summonerStats.odds}%</p>
            </S.WinningPercentage>
            <S.AverageKDA>
              <p>평균 KDA</p>
              <p id="value">{myChampInfo?.kda ?? props.summonerStats.kda}</p>
            </S.AverageKDA>
            <S.KDAList>
              {props.summonerStats.statsList.map(({ isWin, kda, championIcon }, idx) => (
                <div style={{ backgroundColor: isWin ? '#0F3054' : '#50383B' }} key={idx}>
                  <img src={championIcon} />
                  <p>{kda}</p>
                </div>
              ))}
            </S.KDAList>
          </>
        ) : (
          <div id="warning-box">
            <p>전적이 없습니다.</p>
            <img src="img/warning_icon.svg" />
            <p id="warning-text">( 현재시즌 솔로랭크 전적이 없습니다 )</p>
          </div>
        )}
      </S.SummonerInfo>
    </S.SummonerBlock>
  );
}

export default SummonerLeagueVoiceBlock;
