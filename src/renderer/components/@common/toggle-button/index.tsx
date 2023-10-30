import React, { Dispatch, SetStateAction, useRef } from 'react';
import { ButtonContainer } from './style';

type ToggleButtonPropsType = {
  size: 'S' | 'M' | 'L';
  defaultValue: boolean;
  value: boolean;
  handleClickToggleButton: Dispatch<SetStateAction<boolean>>;
};

export const SIZE = {
  S: 50,
  M: 65,
  L: 80,
};

function ToggleButton(props: ToggleButtonPropsType) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClickButton = (e: any) => {
    e.preventDefault();
    props.handleClickToggleButton((prev) => !prev);
  };

  return (
    <ButtonContainer size={SIZE[props.size]} onClick={handleClickButton}>
      <input
        ref={inputRef}
        defaultChecked={props.defaultValue}
        checked={props.value}
        type="checkbox"
        id="toggle"
        hidden
      />

      <label htmlFor="toggle" id="toggle-switch">
        <span id="toggle-button"></span>
      </label>
    </ButtonContainer>
  );
}

export default ToggleButton;
