import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import {
  LeagueTitleType,
  SummonerInfoType,
  leagueTitleListState,
  summonerInfoListState,
  userStreamState,
} from '../../@store/atom';
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
  // 소환사 정보
  const summonerInfoList = useRecoilValue(summonerInfoListState);
  const [summonerInfo, setSummonerInfo] = useState<SummonerInfoType | null>(null);
  const leagueTitleList = useRecoilValue(leagueTitleListState);
  const [myLeagueTitle, setMyLeagueTitle] = useState<LeagueTitleType | null>(null);

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

    summonerInfoList?.map((summonerInfo) => {
      if (props.summoner.summonerId === summonerInfo.summonerId) {
        return setSummonerInfo(summonerInfo);
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

  useEffect(() => {
    leagueTitleList?.map((leagueTitle) => {
      if (props.summoner.summonerId === leagueTitle.summonerId) {
        return setMyLeagueTitle(leagueTitle);
      }
    });
  }, [leagueTitleList]);

  return (
    <S.SummonerBlock id={props.summoner.summonerId.toString()}>
      <S.ProfileImg
        visualize={!isMuteSpeaker && visualizerVolume > 20}
        src={summonerInfo?.championIcon}
      />

      <S.SummonerInfo id="summoner-info">
        <S.NameTag length={props.summoner.displayName.length}>
          <p id="display-name">{props.summoner.displayName}</p>
          <RankBadge size={'medium'} tierImg="img/dummy_rank.png" tier={props.summoner.tier} />
        </S.NameTag>

        <S.TitleTag>
          {myLeagueTitle ? (
            <>
              <p id="title-name">{myLeagueTitle.title}</p>
              <div id="question-circle">
                ?
                <S.TitleDescription id="title-description">
                  <p id="name">{myLeagueTitle.title}</p>
                  <p id="description">{myLeagueTitle.description}</p>
                </S.TitleDescription>
              </div>
            </>
          ) : (
            <p id="title-name">소환사님의 칭호는...</p>
          )}
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
              <p>KDA</p>
              <p id="value">{summonerInfo?.kda}</p>
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
          </>
        ) : (
          <div id="warning-box">
            <p>전적이 없습니다.</p>
            <img src="img/warning_icon.svg" alt="위험 아이콘" />
            <p id="warning-text">( 현재시즌 솔로랭크 전적이 없습니다 )</p>
          </div>
        )}
      </S.SummonerInfo>
    </S.SummonerBlock>
  );
}

export default SummonerLeagueVoiceBlock;
