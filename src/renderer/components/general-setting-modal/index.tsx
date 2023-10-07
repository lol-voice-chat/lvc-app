import React, { useState } from 'react';
import * as _ from './style';
import electronStore from '../../@store/electron';
import { GeneralSettingsConfigType } from '../../@store/atom';

function GeneralSettingModal(props: {
  handleClickModalTrigger: () => void;
  settingsConfig: GeneralSettingsConfigType;
}) {
  const [isPressToTalk, setIsPressToTalk] = useState(props.settingsConfig.isPressToTalk);
  const [pressToTalkShortcutKey, setPressToTalkShortcutKey] = useState(
    props.settingsConfig.pressToTalkShortcutKey
  );
  const [muteMicShortcutKey, setMuteMicShortcutKey] = useState(
    props.settingsConfig.muteMicShortcutKey
  );

  const handleClickSaveButton = () => {
    const config = {
      isPressToTalk,
      pressToTalkShortcutKey,
      muteMicShortcutKey,
    };
    electronStore.set('general-settings-config', config);
    props.handleClickModalTrigger();
  };

  return (
    <_.SettingContainer>
      <div id="save-close-button" onClick={handleClickSaveButton}>
        저장 후 끄기
      </div>

      <div onClick={() => setIsPressToTalk((prev) => !prev)}>
        눌러서 말하기 - {isPressToTalk ? 'on' : 'off'}
      </div>

      {isPressToTalk ? (
        <div>눌러서 말하기 단축키 설정 - {pressToTalkShortcutKey}</div>
      ) : (
        <div>마이크 음소거 단축키 설정 - {muteMicShortcutKey}</div>
      )}
    </_.SettingContainer>
  );
}

export default GeneralSettingModal;
