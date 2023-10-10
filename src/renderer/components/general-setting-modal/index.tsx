import React, { useEffect, useState } from 'react';
import * as _ from './style';
import electronStore from '../../@store/electron';
import { GeneralSettingsConfigType } from '../../@store/atom';
import { IPC_KEY } from '../../../const';
import { getConnectedAudioDevices } from '../../utils/audio';
const { ipcRenderer } = window.require('electron');

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

  useEffect(() => {
    getConnectedAudioDevices('input').then((data) => {
      console.log(data);
    });
    getConnectedAudioDevices('output').then((data) => {
      console.log(data);
    });
  }, []);

  const handleClickSaveButton = () => {
    const config = {
      isPressToTalk,
      pressToTalkShortcutKey,
      muteMicShortcutKey,
    };
    electronStore.set('general-settings-config', config);
    props.handleClickModalTrigger();
  };

  const handleInputShortcutKey = () => {
    ipcRenderer.send(IPC_KEY.INPUT_SHORTCUT_KEY);
    ipcRenderer.once(IPC_KEY.INPUT_SHORTCUT_KEY, (_, keyName: string) => {
      isPressToTalk ? setPressToTalkShortcutKey(keyName) : setMuteMicShortcutKey(keyName);
    });
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
        <>
          <div>눌러서 말하기 단축키 설정</div>
          <div onClick={handleInputShortcutKey}>{pressToTalkShortcutKey}</div>
        </>
      ) : (
        <>
          <div>마이크 음소거 단축키 설정</div>
          <div onClick={handleInputShortcutKey}>{muteMicShortcutKey}</div>
        </>
      )}
    </_.SettingContainer>
  );
}

export default GeneralSettingModal;
