import styled from 'styled-components';

export const SettingContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 99999;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 100vw;
  height: 100vh;
  background-color: #303236;

  -webkit-app-region: no-drag;

  #save-close-button {
  }

  div {
    height: 50px;
    cursor: pointer;
    font-size: 20px;
    color: white;
  }
`;
