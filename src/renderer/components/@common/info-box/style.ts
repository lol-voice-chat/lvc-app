import styled from 'styled-components';

export const BoxContainer = styled.div<{ width: number; height: number }>`
  position: absolute;
  top: -${(p) => p.height + 10}px;
  left: ${(p) => p.width / 2}px;
  pointer-events: none;

  #info-box {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    width: ${(p) => p.width}px;
    height: ${(p) => p.height}px;
    border-radius: ${(p) => (p.height / 100) * 10}px;

    background-color: #1e1f22;

    &::after {
      content: '';
      position: absolute;
      bottom: -55%;
      border-top: ${(p) => (p.height / 100) * 40}px solid #1e1f22;
      border-right: ${(p) => (p.height / 100) * 40}px solid transparent;
      border-bottom: ${(p) => (p.height / 100) * 40}px solid transparent;
      border-left: ${(p) => (p.height / 100) * 40}px solid transparent;
    }
  }
`;
