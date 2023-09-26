import styled from 'styled-components';

export const GeneralChatRoomContainer = styled.div`
  position: relative;
  top: 0;
  left: 170px;
  display: flex;
  flex-direction: column;

  width: calc(100% - (170px + 300px));
  min-height: 100vh;
  background-color: #303236;

  #message-input {
    position: absolute;
    bottom: 20px;
  }
`;
