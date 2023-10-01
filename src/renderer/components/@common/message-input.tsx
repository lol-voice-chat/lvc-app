import React from 'react';
import styled from 'styled-components';
import { FONT, PALETTE } from '../../const';
import { useRecoilValue } from 'recoil';
import { summonerState } from '../../@store/atom';

function MessageInput(props: { socket: WebSocket | null }) {
  const summoner = useRecoilValue(summonerState);

  const handleResizeHeight = () => {
    const textarea = document.getElementById('text-area') as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  const handleEnterText = (event: any) => {
    if (event.keyCode == 13 && summoner) {
      if (!event.shiftKey) {
        if (event.target.value === '') return;

        event.preventDefault();
        props.socket?.send(
          JSON.stringify({
            summoner: {
              name: summoner.name,
              profileImage: summoner.profileImage,
              tier: summoner.tier,
              tierImage: 'img/dummy_rank.png',
            },
            message: event.target.value,
          })
        );
        event.target.value = '';
      }
    }
  };

  const handleClickImgUpload = () => {
    const imgUploadBtn = document.getElementById('img-upload-input') as HTMLInputElement;
    imgUploadBtn.click();
  };

  return (
    <Input id="message-input">
      <div id="input-box">
        <div id="img-upload-btn" onClick={handleClickImgUpload}>
          <img src="img/img_add_btn.svg" alt="이미지 추가 버튼" />
          <input id="img-upload-input" type="file" accept="image/*" />
        </div>
        <textarea
          id="text-area"
          placeholder="말 예쁘게 하자 쓰발라마!..."
          rows={1}
          onChange={handleResizeHeight}
          onKeyDown={handleEnterText}
        />
      </div>
    </Input>
  );
}

const Input = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;

  #input-box {
    display: flex;
    align-items: center;
    width: 95%;
    min-height: 35px;
    padding: 5px 7.5px 5px 0;

    border-radius: 7.5px;
    background-color: #36383d;

    #img-upload-btn {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      width: 50px;
      height: 100%;
      border-radius: 7.5px 0 0 7.5px;
      background-color: #36383d;
      cursor: pointer;

      &:hover {
        img {
          transform: rotate(180deg);
        }
      }

      img {
        transition: transform 0.5s;
        width: 25px;
        height: 25px;
      }
      input {
        display: none;
      }
    }
    #text-area {
      width: calc(100% - 50px);
      height: 35px;
      max-height: 400px;
      line-height: 35px;

      word-break: break-all;
      font-weight: ${FONT.REGULAR};
      font-size: 16px;
      color: ${PALETTE.WHITE_1};
      background-color: #36383d;
      border-radius: 0 7.5px 7.5px 0;

      &::placeholder {
        font-weight: ${FONT.MEDIUM};
        font-size: 16px;
        color: #545760;
      }

      &::-webkit-scrollbar {
        width: 5px;
      }
      &::-webkit-scrollbar-thumb {
        border-radius: 5px;
        background-color: #222326;
      }
      &::-webkit-scrollbar-track {
        background-color: transparent;
      }

      &:focus {
        outline: none !important;
      }
      appearance: none;
      border: none;
      resize: none;
      padding: 0;
    }
  }
`;

export default MessageInput;
