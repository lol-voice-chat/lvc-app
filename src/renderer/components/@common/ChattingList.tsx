import React from 'react';
import styled from 'styled-components';

function ChattingList() {
  return <ChatContainer></ChatContainer>;
}

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
  min-height: 95vh;

  overflow-x: hidden;
  overflow-y: scroll;
`;

export default ChattingList;
