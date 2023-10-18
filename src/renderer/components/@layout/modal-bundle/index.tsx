import React, { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { generalSettingsConfigState, generalSettingsModalState } from '../../../@store/atom';
import GeneralSettingModal from '../../general-setting-modal';
import electronStore from '../../../@store/electron';
import useLeagueHandler from '../../../hooks/use-league-handler';
import VoiceRoomModal from '../../voice-room-modal';

function ModalBundle() {
  const [generalSettingState, setGeneralSettingState] = useRecoilState(generalSettingsModalState);
  const [generalSettingsConfig, setGeneralSettingsConfig] = useRecoilState(
    generalSettingsConfigState
  );

  const { gameStatus } = useLeagueHandler();

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
