import React from 'react';
import styled from 'styled-components';
import { PALETTE } from '../../const';

function DotsLoading() {
  return (
    <LoadingContainer>
      <div className="scaling-dots">
        <div />
        <div />
        <div />
      </div>
    </LoadingContainer>
  );
}

const LoadingContainer = styled.div`
  @keyframes scaling-dots-ani {
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
    width: 10px;
    grid-gap: 5px;
    grid-template-columns: repeat(3, 10px);
  }
  .scaling-dots div {
    -webkit-animation: scaling-dots-ani 1s infinite ease backwards;
    animation: scaling-dots-ani 1s infinite ease backwards;
    height: 10px;
    width: 10px;
    border-radius: 100%;
    background-color: ${PALETTE.GREEN};
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
`;

export default DotsLoading;
