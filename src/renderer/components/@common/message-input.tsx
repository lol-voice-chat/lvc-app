import React, { ChangeEvent, useEffect } from 'react';
import styled from 'styled-components';
import { FONT, PALETTE } from '../../const';
import { useRecoilValue } from 'recoil';
import { summonerState } from '../../@store/atom';
import { SummonerType } from '../../@type/summoner';

const ENTER = 13;
const TAB = 9;

function MessageInput(props: { socket: WebSocket | null }) {
  const summoner = useRecoilValue(summonerState);

  const handleResizeHeight = () => {
    const textarea = document.getElementById('text-area') as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  const handleInputKey = (event: any) => {
    if (summoner) {
      if (event.keyCode === ENTER && !event.shiftKey) {
        event.preventDefault();
        handleEnter(event, summoner);
      }
      if (event.keyCode === TAB) {
        event.preventDefault();
        handleTab(event);
      }
    }
  };

  const handleEnter = (event: any, sender: SummonerType) => {
    if (event.target.value.replace(/\s| /gi, '').length === 0) return false;

    sendMessage(sender, event.target.value.trim());
    event.target.value = '';
    const textarea = document.getElementById('text-area') as HTMLTextAreaElement;
    textarea.style.height = '35px';
  };

  const handleTab = (event: any) => {
    const value = event.target.value;
    let start = event.target.selectionStart;
    let end = event.target.selectionEnd;
    event.target.value = value.substring(0, start) + '\t' + value.substring(end);
    event.target.selectionStart = event.target.selectionEnd = start + 1;
    return false;
  };

  const sendMessage = (sender: SummonerType, message: string) => {
    const summoner = {
      name: sender.name,
      profileImage: sender.profileImage,
      tier: sender.tier,
      tierImage: 'img/dummy_rank.png',
    };
    props.socket?.send(JSON.stringify({ summoner, message }));
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
          placeholder="즐챗...하시오"
          rows={1}
          maxLength={1000}
          onChange={handleResizeHeight}
          onKeyDown={handleInputKey}
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
