import React, { useEffect, useState } from 'react';
import * as S from './style';
import RankBadge from '../@common/rank-badge';
import { ChampionInfoType, SummonerType } from '../../@type/summoner';
import VolumeSlider from '../@common/volume-slider';
import { getSummonerSpeaker, micVolumeHandler } from '../../utils/audio';
import { useRecoilValue } from 'recoil';
import { LeagueTitleType, leagueTitleListState, userStreamState } from '../../@store/atom';
import { Socket } from 'socket.io-client';

function SummonerVoiceBlock(props: {
  isMine: boolean;
  summoner: SummonerType;
  selectedChampInfo: ChampionInfoType | null;
  managementSocket: Socket | null;
}) {
  // 선택한 챔피언 정보
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
    /* 팀원 소환사 */
    if (!props.isMine) {
      props.managementSocket?.on('mic-visualizer', ({ summonerId, visualizerVolume }) => {
        if (props.summoner.summonerId === summonerId) {
          setVisualizerVolume(visualizerVolume);
        }
      });
    }
  }, [props.managementSocket]);

  useEffect(() => {
    if (props.isMine) {
      props.managementSocket?.emit('mic-visualizer', {
        summonerId: props.summoner.summonerId,
        visualizerVolume,
      });
    }
  }, [visualizerVolume]);

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
    leagueTitleList?.map((leagueTitle) => {
      if (props.summoner.summonerId === leagueTitle.summonerId) {
        return setMyLeagueTitle(leagueTitle);
      }
    });
  }, [leagueTitleList]);

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
        src={props.selectedChampInfo?.championIcon ?? props.summoner.profileImage}
      />

      <S.NameTag length={props.summoner.name.length}>
        <p id="name">{props.summoner.name}</p>
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
              {props.summoner.summonerStats.statsList.map(({ isWin, championIcon, kda }, idx) => (
                <div style={{ backgroundColor: isWin ? '#2C334A' : '#50383B' }} key={idx}>
                  <img src={championIcon} />
                  <p>{kda}</p>
                </div>
              ))}
            </S.KDAList>
          </S.WinningPercentage>
        ) : (
          <div id="warning-box">
            <img src="img/warning_icon.svg" />
            <p>전적이 없습니다.</p>
          </div>
        )}
      </S.GameRecord>
    </S.SummonerBlock>
  );
}

export default SummonerVoiceBlock;
