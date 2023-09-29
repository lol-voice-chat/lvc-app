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
      <div id="summoner-profile">
        <img id="summoner-icon" src={props.summonerIcon} alt="소환사 아이콘" />
        <RankBadge size="small" tierImg={props.tierImg} tier={props.tier} />
      </div>
      <div className="drag-able" id="message-info">
        <div id="summoner-info">
          <p id="name">{props.name}</p>
          <p id="time">{props.time}</p>
        </div>
        {props.messageType === 'text' ? (
          <p id="message-text">{props.message}</p>
        ) : (
          <img id="message-img" src={props.image} alt="이미지" />
        )}
      </div>
    </BlockContainer>
  );
}

const BlockContainer = styled.div`
  display: flex;
  width: 100%;
  padding: 15px 0 15px 15px;

  &:hover {
    background-color: #2a2c2f;
  }

  #summoner-profile {
    position: relative;
    height: 45px;
    margin-right: 12px;

    #summoner-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
    #rank-badge {
      position: absolute;
      bottom: -5px;
      left: -5px;
    }
  }
  #message-info {
    display: flex;
    flex-direction: column;

    #summoner-info {
      display: flex;
      align-items: flex-end;
      margin-bottom: 5px;

      #name {
        font-size: 14px;
        color: ${PALETTE.WHITE_1};
        margin-right: 7px;
      }
      #time {
        font-size: 11px;
        color: #7f8189;
      }
    }
    #message-text {
      font-weight: ${FONT.REGULAR};
      font-size: 14px;
      color: #f2f3f5;
    }
    #message-img {
      width: 60%;
      height: auto;
      border-radius: 5px;
    }
  }
`;

export default MessageBlock;
