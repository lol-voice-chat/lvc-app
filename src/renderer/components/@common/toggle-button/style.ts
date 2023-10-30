import styled from 'styled-components';
import { PALETTE } from '../../../const';

export const ButtonContainer = styled.div<{ size: number }>`
  #toggle-switch {
    display: block;
    position: relative;

    width: ${(p) => p.size}px;
    height: ${(p) => p.size / 2}px;
    border-radius: ${(p) => p.size / 2}px;
    background-color: #1c1d20;
    cursor: pointer;
  }

  #toggle-switch #toggle-button {
    width: ${(p) => p.size / 2 - 10}px;
    height: ${(p) => p.size / 2 - 10}px;
    position: absolute;
    top: 50%;
    left: 4px;
    transform: translateY(-50%);
    border-radius: 50%;
    background: #949ba4;
  }

  #toggle:checked ~ #toggle-switch {
    background: ${PALETTE.GREEN};
  }

  #toggle:checked ~ #toggle-switch #toggle-button {
    left: calc(100% - ${(p) => p.size / 2 - 10 + 4}px);
    background: ${PALETTE.WHITE_1};
  }

  #toggle-switch,
  #toggle-button {
    transition: all 0.2s ease-in;
  }
`;
