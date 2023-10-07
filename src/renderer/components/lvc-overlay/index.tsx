import React, { useEffect, useState } from 'react';
import * as _ from './style';
import { IPC_KEY } from '../../../const';
import { SummonerType } from '../../@type/summoner';
import electronStore from '../../@store/electron';
const { ipcRenderer } = window.require('electron');

type visualizerType = { visualizerVolume: number; isMuteSpeaker: boolean };

function LvcOverlay() {
  const [summoner, setSummoner] = useState<SummonerType | null>(null);
  const [myTeamSummoners, setMyTeamSummoners] = useState<SummonerType[] | null>(null);
  const [visualizerVolumes, setVisualizerVolumes] = useState<Map<number, visualizerType>>(
    new Map()
  );

  const [isMuteMic, setIsMuteMic] = useState(false);

  useEffect(() => {
    /* 초기화 - 레이아웃 요소 제거 */
    const navBar = document.getElementById('nav-bar');
    const sideMenuBar = document.getElementById('side-menu-bar');

    if (navBar && sideMenuBar) {
      document.body.style.backgroundColor = '';
      document.body.style.background = 'rgba(48, 50, 54, 0.3)';
      navBar.style.display = 'none';
      sideMenuBar.style.display = 'none';
    }

    /* 초기화 - 눌러서 말하기 on, off 확인 */
    electronStore.get('general-settings-config').then(({ isPressToTalk }) => {
      setIsMuteMic(isPressToTalk);
    });

    /* 소환사 비주얼라이저 값 실시간 업데이트  */
    ipcRenderer.on(IPC_KEY.SUMMONER_VISUALIZER, (_, { summonerId, value }) => {
      setVisualizerVolumes(
        (prev) =>
          new Map(
            prev.has(summonerId) ? prev.set(summonerId, value) : [...prev, [summonerId, value]]
          )
      );
    });

    ipcRenderer.on(IPC_KEY.SUMMONER_MUTE, () => {
      setIsMuteMic((prev) => !prev);
    });
    ipcRenderer.on(IPC_KEY.OVERLAY_SUMMONER, (_, summoner) => {
      setSummoner(summoner);
    });
    ipcRenderer.on(IPC_KEY.OVERLAY_MY_TEAM_SUMMONERS, (_, summonerList) => {
      setMyTeamSummoners([...summonerList]);
    });

    return () => {
      ipcRenderer.removeAllListeners(IPC_KEY.SUMMONER_MUTE);
      ipcRenderer.removeAllListeners(IPC_KEY.SUMMONER_VISUALIZER);
      ipcRenderer.removeAllListeners(IPC_KEY.OVERLAY_SUMMONER);
      ipcRenderer.removeAllListeners(IPC_KEY.OVERLAY_MY_TEAM_SUMMONERS);
    };
  }, []);

  const getVisualizer = (summonerId: number) => {
    const summonerVisualizer = visualizerVolumes.get(summonerId);
    let result = { isVisible: false, isMute: false };

    if (summonerVisualizer) {
      const { isMuteSpeaker, visualizerVolume } = summonerVisualizer;

      if (summoner?.summonerId === summonerId) {
        result.isVisible = !isMuteMic && visualizerVolume > 20;
      } else {
        result.isVisible = !isMuteSpeaker && visualizerVolume > 20;
        result.isMute = isMuteSpeaker;
      }
    }
    return result;
  };

  return (
    <_.OverlayContainer>
      {summoner && (
        <_.ChampIcon
          src={summoner.profileImage}
          visualize={getVisualizer(summoner.summonerId).isVisible}
          isMute={isMuteMic}
        />
      )}

      {myTeamSummoners?.map(({ summonerId, profileImage }) => (
        <_.ChampIcon
          src={profileImage}
          visualize={getVisualizer(summonerId).isVisible}
          isMute={getVisualizer(summonerId).isMute}
        />
      ))}
    </_.OverlayContainer>
  );
}

export default LvcOverlay;
