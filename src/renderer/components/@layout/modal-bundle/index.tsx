import React, { useEffect, useRef } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  generalSettingsConfigState,
  generalSettingsModalState,
  summonerState,
} from '../../../@store/atom';
import GeneralSettingModal from '../../general-setting-modal';
import electronStore from '../../../@store/electron';
import useLeagueHandler from '../../../hooks/use-league-handler';
import VoiceRoomModal from '../../voice-room-modal';
import { IPC_KEY } from '../../../../const';
import { Socket } from 'socket.io-client';
import { connectSocket } from '../../../utils/socket';
const { ipcRenderer } = window.require('electron');

function ModalBundle() {
  const manageSocket = useRef<Socket | null>(null);

  const { gameStatus } = useLeagueHandler();

  const summoner = useRecoilValue(summonerState);

  const [generalSettingState, setGeneralSettingState] = useRecoilState(generalSettingsModalState);
  const [generalSettingsConfig, setGeneralSettingsConfig] = useRecoilState(
    generalSettingsConfigState
  );

  useEffect(() => {
    const socket = connectSocket('/manage');

    socket.on('connect', () => {
      manageSocket.current = socket;
    });

    /* 설정 단축키 */
    ipcRenderer.on(IPC_KEY.SETTINGS_SHORTCUT_KEY, () => setGeneralSettingState((prev) => !prev));

    return () => {
      socket.disconnect();
      ipcRenderer.removeAllListeners(IPC_KEY.SETTINGS_SHORTCUT_KEY);
    };
  }, []);

  useEffect(() => {
    /* 앱 꺼짐 */
    ipcRenderer.on(IPC_KEY.QUIT_APP, () => {
      if (summoner) {
        manageSocket.current?.emit('quit-app', summoner.puuid);
      }
    });

    return () => {
      ipcRenderer.removeAllListeners(IPC_KEY.QUIT_APP);
    };
  }, [summoner]);

  useEffect(() => {
    /* 전체 설정 갱신 */
    electronStore.get('general-settings-config').then((config) => {
      setGeneralSettingsConfig(config);
    });
  }, [generalSettingState]);

  return (
    <>
      {/* 전체설정 모달 */}
      {generalSettingState && generalSettingsConfig && (
        <GeneralSettingModal
          settingsConfig={generalSettingsConfig}
          handleClickModalTrigger={() => setGeneralSettingState((prev) => !prev)}
        />
      )}

      {/* 롤 보이스 모달 */}
      {gameStatus !== 'none' && <VoiceRoomModal />}
    </>
  );
}

export default ModalBundle;
