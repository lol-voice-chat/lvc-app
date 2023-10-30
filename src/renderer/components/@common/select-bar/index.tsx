import React from 'react';
import { CustomSelectBar, colorStyles } from './style';

export type OptionType = { label: string; value: any };

interface SelectorPorpsType {
  options: OptionType[];
  handleChangeOption: (option: OptionType) => void;
  placeholder: string;
  menuPosition: 'top' | 'bottom' | 'auto';
  value: OptionType;
}

function SelectBar(props: SelectorPorpsType) {
  return (
    <CustomSelectBar
      options={props.options}
      onChange={(option: any) => props.handleChangeOption(option)}
      styles={colorStyles}
      placeholder={props.placeholder}
      menuPlacement={props.menuPosition}
      isSearchable={false}
      value={props.value}
    />
  );
}

export default SelectBar;
