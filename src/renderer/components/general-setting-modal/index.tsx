import React, { MutableRefObject, RefObject, useEffect, useRef, useState } from 'react';
import * as _ from './style';
import electronStore from '../../@store/electron';
import { GeneralSettingsConfigType, userDeviceIdState } from '../../@store/atom';
import { IPC_KEY } from '../../../const';
import { getConnectedAudioDevices } from '../../utils/audio';
import { useRecoilState } from 'recoil';
import VolumeSlider from '../@common/volume-slider';
import SelectBar, { OptionType } from '../@common/select-bar';
import ToggleButton from '../@common/toggle-button';
import DotsLoading from '../@common/dots-loading';
const { ipcRenderer } = window.require('electron');

function GeneralSettingModal(props: {
  handleClickModalTrigger: () => void;
  settingsConfig: GeneralSettingsConfigType;
  modalRef: MutableRefObject<HTMLDivElement | null>;
}) {
  /* 단축키 관련 설정 */
  const [isPressToTalk, setIsPressToTalk] = useState(props.settingsConfig.isPressToTalk);
  const [isGettingKey, setIsGettingKey] = useState(false);
  const [pressToTalkShortcutKey, setPressToTalkShortcutKey] = useState(
    props.settingsConfig.pressToTalkShortcutKey
  );
  const [muteMicShortcutKey, setMuteMicShortcutKey] = useState(
    props.settingsConfig.muteMicShortcutKey
  );

  /* 음성 설정 */
  const [userDeviceId, setUserDeviceId] = useRecoilState(userDeviceIdState);
  const [deviceOptionList, setDeviceOptionList] = useState<OptionType[] | null>(null);
  const [curDeviceOption, setCurDeviceOption] = useState<OptionType | null>(null);
  const [beforeDefaultDeviceName, setBeforeDefaultDeviceName] = useState<string | null>(null);
  const [micVolume, setMicVolume] = useState(props.settingsConfig.micVolume);
  const [speakerVolume, setSpeakerVolume] = useState(props.settingsConfig.speakerVolume);

  useEffect(() => {
    updateDeviceList();
  }, []);

  useEffect(() => {
    navigator.mediaDevices.ondevicechange = updateDeviceList;
  }, [userDeviceId, beforeDefaultDeviceName]);

  const updateDeviceList = () => {
    getConnectedAudioDevices('input').then((deviceList) => {
      let optionList = [] as OptionType[];
      let selectedOption: OptionType | null = null;

      deviceList?.map(({ label, deviceId }) => {
        const option = { label, value: deviceId };
        optionList.push(option);
        if (userDeviceId === deviceId) selectedOption = option;
      });

      if (
        !selectedOption ||
        (beforeDefaultDeviceName !== null && beforeDefaultDeviceName !== optionList[0].label)
      ) {
        setUserDeviceId('default');
        selectedOption = optionList[0];
      }

      setDeviceOptionList([...optionList]);
      setCurDeviceOption(selectedOption);
      setBeforeDefaultDeviceName(optionList[0].label);
    });
  };

  const handleClickDeviceOption = (option: OptionType) => {
    setCurDeviceOption(option);
    setUserDeviceId(option.value);
  };

  const handleInputShortcutKey = () => {
    setIsGettingKey(true);
    ipcRenderer.send(IPC_KEY.INPUT_SHORTCUT_KEY);
    ipcRenderer.once(IPC_KEY.INPUT_SHORTCUT_KEY, (_, keyName: string) => {
      isPressToTalk ? setPressToTalkShortcutKey(keyName) : setMuteMicShortcutKey(keyName);
      setIsGettingKey(false);
    });
  };

  const handleClickSaveCloseModal = (e: any) => {
    if (props.modalRef.current === e.target) {
      const config = {
        isPressToTalk,
        pressToTalkShortcutKey,
        muteMicShortcutKey,
        micVolume,
        speakerVolume,
      };
      electronStore.set('general-settings-config', config);
      props.handleClickModalTrigger();
    }
  };

  return (
    <_.SettingContainer ref={props.modalRef} onClick={handleClickSaveCloseModal}>
      <div id="settings-block">
        <div>
          <div id="category">입력장치 설정</div>

          <div id="function">디바이스</div>
          {deviceOptionList && curDeviceOption ? (
            <SelectBar
              options={deviceOptionList}
              handleChangeOption={handleClickDeviceOption}
              menuPosition="bottom"
              placeholder=""
              value={curDeviceOption}
            />
          ) : (
            <div id="sk-select-bar" />
          )}

          <div id="function">마이크 볼륨</div>
          <VolumeSlider
            audiotype="mic"
            volume={micVolume}
            handleChangeVolume={(volume: number) => setMicVolume(volume)}
          />

          <div id="function">다른 소환사 보이스 볼륨</div>
          <VolumeSlider
            audiotype="speaker"
            volume={speakerVolume}
            handleChangeVolume={(volume: number) => setSpeakerVolume(volume)}
          />
        </div>

        <div>
          <div id="category">단축키 설정</div>

          <div id="bundle">
            <p>눌러서 말하기</p>
            <ToggleButton
              size="S"
              value={isPressToTalk}
              handleClickToggleButton={setIsPressToTalk}
              defaultValue={props.settingsConfig.isPressToTalk}
            />
          </div>

          {isGettingKey ? (
            <>
              <div id="function">새로운 키 입력 대기중...</div>
              <div id="getting-key-box">
                <DotsLoading />
              </div>
            </>
          ) : (
            <>
              <div id="function">{isPressToTalk ? '음소거 전환키' : '음소거 키'} - 인게임</div>
              <div
                id="shortcut-key-box"
                style={{
                  fontSize:
                    (isPressToTalk ? pressToTalkShortcutKey : muteMicShortcutKey).length > 10
                      ? '14px'
                      : '20px',
                }}
                onClick={handleInputShortcutKey}
              >
                {isPressToTalk ? pressToTalkShortcutKey : muteMicShortcutKey}
              </div>
            </>
          )}
        </div>
      </div>
    </_.SettingContainer>
  );
}

export default GeneralSettingModal;
