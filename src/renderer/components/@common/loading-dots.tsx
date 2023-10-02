import React from 'react';
import styled from 'styled-components';
import { PALETTE } from '../../const';

function LoadingDots() {
  return (
    <LoadingContainer>
      <div className="scaling-dots">
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
    </LoadingContainer>
  );
}

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

  @-webkit-keyframes scaling-dots {
    0%,
    100% {
      -webkit-transform: scale(0);
      transform: scale(0);
    }
    40%,
    60% {
      -webkit-transform: scale(1);
      transform: scale(1);
    }
  }
  @keyframes scaling-dots {
    0%,
    100% {
      -webkit-transform: scale(0);
      transform: scale(0);
    }
    40%,
    60% {
      -webkit-transform: scale(1);
      transform: scale(1);
    }
  }

  .scaling-dots {
    display: grid;
    height: 10px;
    grid-gap: 5px;
    grid-template-columns: repeat(5, 10px);
  }
  .scaling-dots div {
    -webkit-animation: scaling-dots 1s infinite ease backwards;
    animation: scaling-dots 1s infinite ease backwards;
    background: var(--primary);
    border-radius: 100%;
    height: 10px;
    width: 10px;
    background-color: ${PALETTE.YELLOW};
  }
  .scaling-dots div:nth-child(1) {
    -webkit-animation-delay: 0.1s;
    animation-delay: 0.1s;
  }
  .scaling-dots div:nth-child(2) {
    -webkit-animation-delay: 0.2s;
    animation-delay: 0.2s;
  }
  .scaling-dots div:nth-child(3) {
    -webkit-animation-delay: 0.3s;
    animation-delay: 0.3s;
  }
  .scaling-dots div:nth-child(4) {
    -webkit-animation-delay: 0.4s;
    animation-delay: 0.4s;
  }
  .scaling-dots div:nth-child(5) {
    -webkit-animation-delay: 0.5s;
    animation-delay: 0.5s;
  }
`;

export default LoadingDots;
