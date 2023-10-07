import styled from 'styled-components';

export const OverlayContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  width: 100vw;
  height: 100vh;
`;

export const ChampIcon = styled.img<{ visualize: boolean; isMute: boolean }>`
  width: 75%;
  height: auto;

  border-radius: 50%;
  border: 5vw solid ${({ visualize }) => (visualize ? '#50a361' : 'transparent')};

  margin: 9% 0;
  transition: border-color 0.1s;

  filter: brightness(${({ isMute }) => (isMute ? '30%' : '50%')});
`;
