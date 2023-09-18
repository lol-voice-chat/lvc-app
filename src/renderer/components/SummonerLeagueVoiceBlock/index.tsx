import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { enemyInfoListState, enemyInfoType, userStreamState } from '../../@store/atom';
import { SummonerType } from '../../@type/summoner';
import { Socket } from 'socket.io-client';
import { getSummonerSpeaker, micVolumeHandler } from '../../utils/audio';
import VolumeSlider from '../@common/VolumeSlider';
import * as S from './style';
import RankBadge from '../@common/RankBadge';

function SummonerLeagueVoiceBlock(props: {
  isMine: boolean;
  summoner: SummonerType;
  managementSocket: Socket;
}) {
  const enemyInfoList = useRecoilValue(enemyInfoListState);
  const [enemyInfo, setEnemyInfo] = useState<enemyInfoType | null>(null);

  // 스피커, 마이크 정보
  const userStream = useRecoilValue(userStreamState);
  const [speakerVolume, setSpeakerVolume] = useState(0.8);
  const [beforeMuteSpeakerVolume, setBeforeMuteSpeakerVolume] = useState(0.8);
  const [isMuteSpeaker, setIsMuteSpeaker] = useState(false);
  const [isMuteMic, setIsMuteMic] = useState(false);
  const [visualizerVolume, setVisualizerVolume] = useState<number>(0);

  useEffect(() => {
    if (!props.isMine) {
      props.managementSocket.on('mic-visualizer', ({ summonerId, visualizerVolume }) => {
        if (props.summoner.summonerId === summonerId) {
          setVisualizerVolume(visualizerVolume);
        }
      });
    }

    enemyInfoList?.map((summonerInfo) => {
      if (props.summoner.summonerId === summonerInfo.summonerId) {
        setEnemyInfo(summonerInfo);
      }
    });
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
    <>
      {enemyInfo && (
        <S.SummonerBlock id={props.summoner.summonerId.toString()}>
          <S.ProfileImg
            visualize={!isMuteSpeaker && visualizerVolume > 20}
            src={enemyInfo.championIcon}
          />

          <S.SummonerInfo id="summoner-info">
            <S.NameTag>
              <p id="displayName">{}</p>
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
              <p>KDA</p>
              <p id="value">{enemyInfo.kda}</p>
            </S.AverageKDA>
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
          </S.SummonerInfo>
        </S.SummonerBlock>
      )}
    </>
  );
}

export default SummonerLeagueVoiceBlock;
