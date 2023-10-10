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
  const [isGettingShortcutKey, setIsGettingShortcutKey] = useState(false);

  const handleClickSaveButton = () => {
    const config = {
      isPressToTalk,
      pressToTalkShortcutKey,
      muteMicShortcutKey,
    };
    electronStore.set('general-settings-config', config);
    props.handleClickModalTrigger();
  };

  const handleKeyDown = (e: any) => {
    // if (!isGettingShortcutKey) return;
    // e.preventDefault();
    // let { is한글, ko2en } = new Inko();
    // let value = e.key;
    // if (is한글(value)) {
    //   value = ko2en(value);
    // }
    // isPressToTalk ? setPressToTalkShortcutKey(value) : setMuteMicShortcutKey(value);
    // setIsGettingShortcutKey(false);
  };

  const handleClickGettingShortcutKey = () => {
    // setIsGettingShortcutKey((prev) => !prev);
    // document.getElementById('input-shortcut-key')?.focus();
    window.addEventListener(
      'keydown',
      (e) => {
        console.log(e);
      },
      true
    );
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
          <div onClick={handleClickGettingShortcutKey}>{pressToTalkShortcutKey}</div>
          {/* <input id="input-shortcut-key" onKeyDown={handleKeyDown} /> */}
        </>
      ) : (
        <div>마이크 음소거 단축키 설정 - {muteMicShortcutKey}</div>
      )}
    </_.SettingContainer>
  );
}

export default GeneralSettingModal;
