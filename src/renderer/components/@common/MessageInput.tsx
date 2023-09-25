import React from 'react';
import styled from 'styled-components';

function MessageInput() {
  return (
    <Input>
      <div id="img-upload-btn"></div>
      <textarea id="text-input" placeholder="메시지를 입력해주세요..." />
    </Input>
  );
}

const Input = styled.div`
  display: flex;
  align-items: center;
  width: 95%;
  height: 40px;
  border-radius: 10px;
  background-color: #36383d;

  #img-upload-btn {
    width: 50px;
    height: 100%;
    border-radius: 0 0 10px 10px;
    background-color: #949ba4;
  }
  #text-input {
    width: 80%;
    height: 90%;

    font-size: 13px;
    color: #fff;
  }
`;

export default MessageInput;
