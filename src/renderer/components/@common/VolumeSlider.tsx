import React from 'react';
import styled from 'styled-components';
import { PALETTE } from '../../const';

type VolumeSliderPropsType = {
  audiotype: 'speaker' | 'mic';
  volume: number;
  handleChangeVolume: (volume: number) => void;
};

function VolumeSlider(props: VolumeSliderPropsType) {
  return (
    <Slider id="volume-slider" volume={props.volume * 100} audiotype={props.audiotype}>
      {/* <img id="volume-box" src="img/volume_box.svg" alt="볼륨 수치" /> */}
      <input
        type="range"
        min={0}
        max={1}
        step={0.02}
        value={props.volume}
        onChange={(event) => {
          console.log(event.target.valueAsNumber);
          props.handleChangeVolume(event.target.valueAsNumber);
        }}
      />
    </Slider>
  );
}

const Slider = styled.div<{ volume: number; audiotype: 'speaker' | 'mic' }>`
  position: relative;

  #volume-box {
    position: absolute;
    top: ${({ audiotype }) => (audiotype === 'speaker' ? '-20px' : '-23px')};
    left: calc(${({ volume }) => volume}% - 15 * ${({ volume }) => volume / 100}%);
    width: 30px;
    height: auto;
  }

  input[type='range'] {
    appearance: none;
    height: 100%;
    width: 100%;
    margin: 0;
    background: transparent;

    &:focus {
      outline: none;
    }

    &::-webkit-slider-thumb {
      -webkit-appearance: none;

      height: ${({ audiotype }) => (audiotype === 'speaker' ? '16px' : '20px')};
      width: ${({ audiotype }) => (audiotype === 'speaker' ? '16px' : '7px')};

      margin-top: ${({ audiotype }) => (audiotype === 'speaker' ? '-5px' : '-6.5px')};
      border-radius: ${({ audiotype }) => (audiotype === 'speaker' ? '50%' : '1.5px')};
      background: ${PALETTE.WHITE_1};
      cursor: pointer;
    }

    &::-webkit-slider-runnable-track {
      height: 6px;
      border-radius: 6px;
      background: ${({ volume }) =>
        `linear-gradient(to right, ${PALETTE.YELLOW} ${volume}%, ${PALETTE.GRAY_2}
 ${volume}% 100%)`};
      transition: all 0.5s;
      cursor: pointer;
    }
  }
`;

export default VolumeSlider;
