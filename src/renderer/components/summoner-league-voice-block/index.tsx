import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import {
  LeagueChampInfoType,
  generalSettingsConfigState,
  leagueChampInfoListState,
  userStreamState,
} from '../../@store/atom';
import { SummonerType } from '../../@type/summoner';
import { Socket } from 'socket.io-client';
import { getSummonerSpeaker, micVolumeHandler } from '../../utils/audio';
import VolumeSlider from '../@common/volume-slider';
import * as S from './style';
import RankBadge from '../@common/rank-badge';

function SummonerLeagueVoiceBlock(props: {
  isMine: boolean;
  summoner: SummonerType;
  managementSocket: Socket | null;
}) {
  const leagueChampInfoList = useRecoilValue(leagueChampInfoListState);
  const [myChampInfo, setMyChampInfo] = useState<LeagueChampInfoType | null>(null);
  const generalSettingsConfig = useRecoilValue(generalSettingsConfigState);

  const userStream = useRecoilValue(userStreamState);
  const [speakerVolume, setSpeakerVolume] = useState(generalSettingsConfig?.speakerVolume ?? 0.8);
  const [beforeMuteSpeakerVolume, setBeforeMuteSpeakerVolume] = useState(
    generalSettingsConfig?.speakerVolume ?? 0.8
  );
  const [isMuteSpeaker, setIsMuteSpeaker] = useState(false);
  const [isMuteMic, setIsMuteMic] = useState(false);
  const [visualizerVolume, setVisualizerVolume] = useState<number>(0);

  useEffect(() => {
    if (!props.isMine) {
      props.managementSocket?.on('mic-visualizer', ({ summonerId, visualizerVolume }) => {
        if (props.summoner.summonerId === summonerId) {
          setVisualizerVolume(visualizerVolume);
        }
      });
    }
  }, [props.managementSocket]);

  useEffect(() => {
    let visualizerInterval: NodeJS.Timer | null = null;
    if (userStream && props.isMine) {
      visualizerInterval = setInterval(() => {
        micVolumeHandler(userStream, setVisualizerVolume);
      }, 1000);
    }
    return () => {
      visualizerInterval && clearInterval(visualizerInterval);
    };
  }, [userStream]);

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

        {props.summoner.summonerStats.statsList.length !== 0 ? (
          <>
            <S.WinningPercentage odds={props.summoner.summonerStats.odds}>
              <S.ProgressBar>
                <progress
                  value={props.summoner.summonerStats.winCount}
                  max={
                    props.summoner.summonerStats.winCount + props.summoner.summonerStats.failCount
                  }
                />
                <p id="win">{props.summoner.summonerStats.winCount}W</p>
                <p id="fail">{props.summoner.summonerStats.failCount}L</p>
              </S.ProgressBar>
              <p id="odds">{props.summoner.summonerStats.odds}%</p>
            </S.WinningPercentage>

            <S.AverageKDA>
              <p>평균 KDA</p>
              <p id="value">{myChampInfo?.kda ?? props.summoner.summonerStats.kda}</p>
            </S.AverageKDA>

            <S.KDAList>
              {props.summoner.summonerStats.statsList.map(({ isWin, kda, championIcon }, idx) => (
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
