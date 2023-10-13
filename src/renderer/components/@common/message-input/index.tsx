import React from 'react';
import * as _ from './style';
import { SummonerType } from '../../../@type/summoner';

const ENTER = 13;
const TAB = 9;

function MessageInput(props: { socket: WebSocket | null; summoner: SummonerType | null }) {
  const handleResizeHeight = () => {
    const textarea = document.getElementById('text-area') as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  const handleInputKey = (event: any) => {
    if (props.summoner) {
      if (event.keyCode === ENTER && !event.shiftKey) {
        event.preventDefault();
        handleEnter(event, props.summoner);
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
    props.socket?.send(JSON.stringify({ key: 'new-message', summoner, message }));
  };

  const handleClickImgUpload = () => {
    const imgUploadBtn = document.getElementById('img-upload-input') as HTMLInputElement;
    imgUploadBtn.click();
  };

  return (
    <_.MessageInputContainer id="message-input" isOnClient={!!props.summoner}>
      <div id="input-box">
        <div id="img-upload-btn" onClick={handleClickImgUpload}>
          <img src="img/img_add_btn.svg" />
          <input id="img-upload-input" type="file" accept="image/*" />
        </div>

        <textarea
          id="text-area"
          placeholder={props.summoner ? '즐챗 하거라~' : '야 임마 롤을 켜야지!'}
          rows={1}
          maxLength={1000}
          onChange={handleResizeHeight}
          onKeyDown={handleInputKey}
          disabled={!props.summoner}
        />
      </div>
    </_.MessageInputContainer>
  );
}

export default MessageInput;
