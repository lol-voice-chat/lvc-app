import React, { useEffect, useRef, useState } from 'react';
import * as S from './style';
import RankBadge from '../@common/RankBadge';
import { ChampionInfoType, SummonerStatsType, SummonerType } from '../../@type/summoner';
import VolumeSlider from '../@common/VolumeSlider';
import { micVolumeHandler } from '../../utils/audio';
import { useRecoilValue } from 'recoil';
import { userStreamState } from '../../@store/atom';
import { IPC_KEY, STORE_KEY } from '../../../const';
import { connectSocket } from '../../utils/socket';
import { Socket } from 'socket.io-client';
import electronStore from '../../@store/electron';

const { ipcRenderer } = window.require('electron');

function SummonerVoiceBlock(props: {
  isMine: boolean;
  summoner: SummonerType & SummonerStatsType;
}) {
  let selectedChampionMap: Map<number, ChampionInfoType> = new Map();

  let managementSocket = useRef<Socket | null>(null);

  const userStream = useRecoilValue(userStreamState);

  const [micVolume, setMicVolume] = useState(0);
  const [speakerVolume, setSpeakerVolume] = useState(0);
  const [isSpeakerMute, setIsSpeakerMute] = useState(false);
  const [visualizerVolume, setVisualizerVolume] = useState<number>(0);
  const [selectedChampion, setSelectedChampion] = useState<ChampionInfoType | null>(null);

  useEffect(() => {
    const newManagementSocket = connectSocket('/team-voice-chat/manage');
    managementSocket.current = newManagementSocket;

    electronStore.get(STORE_KEY.TEAM_VOICE_ROOM_NAME).then((roomName) => {
      newManagementSocket.emit('team-manage-join-room', roomName);
    });

    let visualizerInterval;

    if (props.isMine) {
      ipcRenderer.on(IPC_KEY.CHAMP_INFO, (_, championInfo: ChampionInfoType) => {
        selectedChampionMap.set(championInfo.summonerId, championInfo);
        setSelectedChampion(championInfo);
        newManagementSocket.emit('champion-info', championInfo);
      });

      if (userStream) {
        visualizerInterval = setInterval(() => {
          micVolumeHandler(userStream, setVisualizerVolume);
        }, 1000);
      }
    } else {
      newManagementSocket.on('champion-info', (championInfo) => {
        selectedChampionMap.set(championInfo.summonerId, championInfo);
        setSelectedChampion(championInfo);
      });

      newManagementSocket.on('mic-visualizer', ({ summonerId, visualizerVolume }) => {
        if (summonerId === props.summoner.summonerId) {
          setVisualizerVolume(visualizerVolume);
        }
      });
    }

    return () => {
      clearInterval(visualizerInterval);
      ipcRenderer.removeAllListeners(IPC_KEY.CHAMP_INFO);
      newManagementSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (props.isMine) {
      managementSocket.current?.emit('mic-visualizer', {
        summonerId: props.summoner.summonerId,
        visualizerVolume,
      });
    }
  }, [visualizerVolume]);

  useEffect(() => {
    const speaker = document.getElementById(
      props.summoner.summonerId.toString() + 'speaker'
    ) as HTMLAudioElement;

    speaker.volume = speakerVolume;
  }, [speakerVolume]);

  const handleClickMuteSpeaker = () => {
    userStream?.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    setIsSpeakerMute((curMute) => !curMute);
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

      {/* todo: 마이크 컨트롤러 기능 추가 */}
      <S.SoundBox>
        {props.isMine && (
          <div id="audio-ctrl">
            <img src="img/mic_icon.svg" alt="마이크 아이콘" />
            <VolumeSlider audiotype="mic" volume={micVolume} setVolume={setMicVolume} />
          </div>
        )}
        <div id="audio-ctrl">
          <div onClick={handleClickMuteSpeaker}>
            {!isSpeakerMute ? (
              <img src="img/headset_icon.svg" alt="헤드셋 아이콘" />
            ) : (
              <img src="img/headset_mute_icon.svg" alt="헤드셋 무음 아이콘" />
            )}
          </div>
          <VolumeSlider audiotype="speaker" volume={speakerVolume} setVolume={setSpeakerVolume} />
          <audio id={props.summoner.summonerId.toString() + 'speaker'} autoPlay />
        </div>
      </S.SoundBox>

      <S.AverageGameData>
        {!props.isMine && <p id="name">{selectedChampion?.name ?? '-'}</p>}
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
            <img src="img/warning_icon.svg" alt="! 아이콘" />
            <p>전적이 없습니다.</p>
          </div>
        )}
      </S.GameRecord>
    </S.SummonerBlock>
  );
}

export default SummonerVoiceBlock;
