import React from 'react';
import styled from 'styled-components';
import RankBadge from './rank-badge';
import { FONT, PALETTE } from '../../const';
import { SummonerType } from '../../@type/summoner';
import { IPC_KEY } from '../../../const';
const { ipcRenderer } = window.require('electron');

function MessageBlock(props: {
  summoner: SummonerType;
  time: string;
  messageType: 'image' | 'text';
  message?: string;
  image?: string;
}) {
  const handleClickLoadSummonerRecord = (e: any) => {
    if (e.target.id === 'summoner-icon' || e.target.id === 'name') {
      ipcRenderer.send(IPC_KEY.CLICK_SUMMONER_PROFILE, props.summoner);
    }
  };

  return (
    <BlockContainer className="message-block" onClick={(e) => handleClickLoadSummonerRecord(e)}>
      <img id="summoner-icon" src={props.summoner.profileImage} />

      <div className="drag-able" id="message-info">
        <div id="summoner-info">
          <p id="name">{props.summoner.name}</p>
          <RankBadge size="small" tierImg={'img/dummy_rank.png'} tier={props.summoner.tier} />
          <p id="time">{props.time}</p>
        </div>
        {props.messageType === 'text' ? (
          <p id="message-text">{props.message}</p>
        ) : (
          <img id="message-img" src={props.image} />
        )}
      </div>
    </BlockContainer>
  );
}

const BlockContainer = styled.div`
  display: flex;
  width: 96%;
  padding: 15px 4% 15px 15px;

  &:hover {
    background-color: #2a2c2f;
  }

  #summoner-icon {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    margin-right: 12px;
    cursor: pointer;
  }
  #message-info {
    display: flex;
    flex-direction: column;
    width: 100%;

    #summoner-info {
      display: flex;
      align-items: center;
      margin-bottom: 5px;

      #name {
        font-size: 14px;
        color: ${PALETTE.WHITE_1};
        margin-right: 7px;
        cursor: pointer;
      }
      #rank-badge {
        margin-right: 7px;
      }
      #time {
        font-size: 11px;
        color: #7f8189;
      }
    }
    #message-text {
      width: 90%;
      font-weight: ${FONT.REGULAR};
      font-size: 14px;
      color: #f2f3f5;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    #message-img {
      width: 60%;
      height: auto;
      border-radius: 5px;
    }
  }
`;

export default MessageBlock;
