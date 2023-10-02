import React from 'react';
import styled from 'styled-components';
import RankBadge from './rank-badge';
import { FONT, PALETTE } from '../../const';

function MessageBlock(props: {
  summonerIcon: string;
  tierImg: string;
  tier: string;
  name: string;
  time: string;
  messageType: 'image' | 'text';
  message?: string;
  image?: string;
}) {
  return (
    <BlockContainer>
      <img id="summoner-icon" src={props.summonerIcon} />

      <div className="drag-able" id="message-info">
        <div id="summoner-info">
          <p id="name">{props.name}</p>
          <RankBadge size="small" tierImg={props.tierImg} tier={props.tier} />
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
