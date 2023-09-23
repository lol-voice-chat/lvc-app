import styled from 'styled-components';
import { FONT, PALETTE } from '../../../const';

export const ProfileContainer = styled.div<{ isBackground: boolean }>`
  display: flex;
  align-items: center;

  width: ${({ isBackground }) => (isBackground ? '70%' : '80%')};
  height: 65px;

  margin-top: 25px;
  padding: 2.5px 15px;

  border-radius: 7.5px;
  background-color: ${({ isBackground }) => (isBackground ? '#36373c' : 'transparent')};

  &,
  * {
    cursor: pointer;
  }

  #profile-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
  }

  /* 스켈레톤 */
  #sk-profile-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #232428;
  }
`;

export const Information = styled.div<{ nameLength: number; statusMessageLength: number }>`
  position: relative;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;

  height: 45px;
  margin-left: 8px;

  #name-tag {
    display: flex;

    #display-name {
      margin-right: 15px;
      font-weight: ${FONT.SEMI_BOLD};
      font-size: ${({ nameLength }) => (nameLength > 6 ? '11px' : '13px')};
      color: ${PALETTE.WHITE_1};

      display: block;
      width: 85px;
      overflow: hidden;
    }
  }
  #status-message {
    width: 125px;
    font-weight: ${FONT.REGULAR};
    font-size: 12.5px;
    color: #949ba4;

    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  #more-status-message {
    position: absolute;
    top: 50px;
    left: -10px;

    padding: 5px;
    border-radius: 2.5px;

    font-weight: ${FONT.REGULAR};
    font-size: 11px;
    color: #949ba4;
    background-color: #111214;
  }

  /* 스켈레톤 */
  #sk-name-tag {
    display: flex;

    #sk-display-name {
      width: 55px;
      height: 18px;
      border-radius: 4px;
      margin-right: 15px;
      background-color: #404249;
    }
    #sk-rank-badge {
      width: 45px;
      height: 22px;
      border-radius: 22px;
      background-color: #222427;
    }
  }
  #sk-status-message {
    width: 125px;
    height: 14.5px;
    border-radius: 3.5px;
    background-color: #404249;
  }
`;
