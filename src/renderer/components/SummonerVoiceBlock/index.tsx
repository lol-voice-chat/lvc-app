import React, { useEffect, useRef, useState } from 'react';
import * as S from './style';
import RankBadge from '../@common/RankBadge';
import { ChampionInfoType, SummonerStatsType, SummonerType } from '../../@type/summoner';
import VolumeSlider from '../@common/VolumeSlider';
import { micVolumeHandler } from '../../utils/audio';
import { IPC_KEY, STORE_KEY } from '../../../const';
import { useRecoilValue } from 'recoil';
import { userStreamState } from '../../@store/atom';
import { connectSocket } from '../../utils/socket';
import electronStore from '../../@store/electron';
import { Socket } from 'socket.io-client';

const { ipcRenderer } = window.require('electron');

function SummonerVoiceBlock(props: {
  isMine: boolean;
  summoner: SummonerType & SummonerStatsType;
}) {
  const userStream = useRecoilValue(userStreamState);

  let managementSocket = useRef<Socket | null>(null);

  const [speakerVolume, setSpeakerVolume] = useState(0.8);
  const [beforeMuteSpeakerVolume, setBeforeMuteSpeakerVolume] = useState(0.8);
  const [isMuteSpeaker, setIsMuteSpeaker] = useState(false);
  const [isMuteMic, setIsMuteMic] = useState(false);
  const [visualizerVolume, setVisualizerVolume] = useState<number>(0);
  const [selectedChampion, setSelectedChampion] = useState<ChampionInfoType | null>(null);

  useEffect(() => {
    const socket = connectSocket('/team-voice-chat/manage');

    electronStore.get(STORE_KEY.TEAM_VOICE_ROOM_NAME).then((roomName) => {
      socket.emit('team-manage-join-room', { roomName, displayName: props.summoner.summonerId });
      // managementSocket.current = socket;
    });

    if (props.isMine) {
      ipcRenderer.on(IPC_KEY.CHAMP_INFO, (_, championInfo: ChampionInfoType) => {
        setSelectedChampion(championInfo);
        socket.emit('champion-info', championInfo);
      });
      // ipcRenderer.on(IPC_KEY.MUTE_OFF_SUMMONER_SPEAKER, () => {
      //   if (isMuteSpeaker) {
      //     userStream?.getAudioTracks().forEach((track) => (track.enabled = true));
      //     setIsMuteSpeaker(false);
      //     setIsMuteMic(false);
      //   }
      // });
    } else {
      socket.on('champion-info', (championInfo: ChampionInfoType) => {
        if (props.summoner.summonerId === championInfo.summonerId) {
          setSelectedChampion(championInfo);
        }
      });
      // socket.on('mic-visualizer', ({ summonerId, visualizerVolume }) => {
      //   if (props.summoner.summonerId === summonerId) {
      //     setVisualizerVolume(visualizerVolume);
      //   }
      // });
      //   ipcRenderer.on(IPC_KEY.MUTE_ALL_SPEAKER, ({ isMuteSummonerSpeaker }) => {
      //     if (!isMuteSummonerSpeaker && !isMuteSpeaker) {
      //       setBeforeMuteSpeakerVolume(speakerVolume);
      //       setSpeakerVolume(0);
      //     }
      //     if (isMuteSummonerSpeaker) {
      //       setSpeakerVolume(beforeMuteSpeakerVolume);
      //     }
      //     setIsMuteSpeaker(!isMuteSummonerSpeaker);
      //   });
    }

    return () => {
      ipcRenderer.removeAllListeners(IPC_KEY.CHAMP_INFO);
      // ipcRenderer.removeAllListeners(IPC_KEY.MUTE_ALL_SPEAKER);
      // ipcRenderer.removeAllListeners(IPC_KEY.MUTE_OFF_SUMMONER_SPEAKER);
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

  // useEffect(() => {
  //   if (props.isMine) {
  //     managementSocket.current?.emit('mic-visualizer', {
  //       summonerId: props.summoner.summonerId,
  //       visualizerVolume,
  //     });
  //   }
  // }, [visualizerVolume]);

  const handleChangeSpeakerVolume = (speakerVolume: number) => {
    const speaker = document.getElementById(
      props.summoner.summonerId.toString() + 'speaker'
    ) as HTMLAudioElement;

    speaker.volume = speakerVolume;
    setSpeakerVolume(speakerVolume);
    setIsMuteSpeaker(speakerVolume === 0);
  };

  const handleClickMuteSpeaker = () => {
    if (props.isMine) {
      ipcRenderer.send(IPC_KEY.MUTE_ALL_SPEAKER, { isMuteSummonerSpeaker: isMuteSpeaker });
      userStream?.getAudioTracks().forEach((track) => (track.enabled = isMuteMic && isMuteSpeaker));
      setIsMuteMic(!(isMuteMic && isMuteSpeaker));
    }
    if (!isMuteSpeaker) {
      setBeforeMuteSpeakerVolume(speakerVolume);
      setSpeakerVolume(0);
    } else {
      setSpeakerVolume(beforeMuteSpeakerVolume);
      !props.isMine && ipcRenderer.send(IPC_KEY.MUTE_OFF_SUMMONER_SPEAKER);
    }
    setIsMuteSpeaker((curMute) => !curMute);
  };

  const handleClickMuteMic = () => {
    if (isMuteSpeaker) return handleClickMuteSpeaker();

    userStream?.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    setIsMuteMic((curMute) => !curMute);
  };

  return (
    <S.SummonerBlock id={props.summoner.summonerId.toString()}>
      <S.ProfileImg
        visualize={visualizerVolume > 20}
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

      <S.SoundBox isMine={props.isMine}>
        {props.isMine && (
          <div id="audio-ctrl" onClick={handleClickMuteMic}>
            <img
              src={!isMuteMic ? 'img/mic_icon.svg' : 'img/mic_mute_icon.svg'}
              alt="마이크 아이콘"
            />
          </div>
        )}
        <div id="audio-ctrl">
          <img
            onClick={handleClickMuteSpeaker}
            src={!isMuteSpeaker ? 'img/headset_icon.svg' : 'img/headset_mute_icon.svg'}
            alt="헤드셋 아이콘"
          />
          {!props.isMine && (
            <VolumeSlider
              audiotype="speaker"
              volume={speakerVolume}
              handleChangeVolume={handleChangeSpeakerVolume}
            />
          )}
          <audio id={props.summoner.summonerId.toString() + 'speaker'} autoPlay />
        </div>
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
              {props.summoner.statsList.map((summonerStats, idx) => (
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
