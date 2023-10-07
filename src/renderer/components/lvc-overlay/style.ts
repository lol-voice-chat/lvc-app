import styled from 'styled-components';

export const OverlayContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100vw;
  height: 100vh;

  background-color: #2b2d31;

  #champ-container {
    width: 100%;
    height: 92.5%;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  }
`;

export const ChampIcon = styled.img<{ visualize: boolean; isMute: boolean }>`
  width: 70%;
  height: auto;
  border-radius: 50%;
  border: 3.5px solid ${({ visualize }) => (visualize ? '#50a361' : 'transparent')};
  transition: border-color 0.1s;

  filter: brightness(${({ isMute }) => (isMute ? '50%' : '100%')});
`;
