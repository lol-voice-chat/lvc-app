import styled from 'styled-components';
import { FONT, PALETTE } from '../../../../const';

export const ProfileContainer = styled.div<{ isBackground: boolean }>`
  display: flex;
  align-items: center;

  width: 70%;
  height: 68.5px;

  margin-top: 25px;
  padding: 2.5px 15px;

  border-radius: 7.5px;
  background-color: ${({ isBackground }) => (isBackground ? '#36373c' : 'transparent')};
  transition: background-color 0.15s;

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
    background-color: #404249;
  }
`;

export const Information = styled.div<{ nameLength: number }>`
  position: relative;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;

  height: 45px;
  margin-left: 10px;

  #summoner-info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;

    #name {
      font-weight: ${FONT.SEMI_BOLD};
      font-size: ${({ nameLength }) => (nameLength > 11 ? '11px' : '15px')};
      color: ${PALETTE.WHITE_1};
      white-space: nowrap;
    }
    #badge-bundle {
      display: flex;
      #rank-badge {
        margin-right: 15px;
      }
      #friend-badge {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 21.25px;
        width: 37.5px;
        border-radius: 21.25px;
        background-color: #222427;
        img {
          height: 70%;
          width: auto;
        }
      }
    }
  }

  /* 스켈레톤 */
  #sk-summoner-info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    height: 100%;

    #sk-name {
      width: 85px;
      height: 16.5px;
      border-radius: 4px;
      margin-right: 15px;
      background-color: #404249;
    }
    #sk-badge-bundle {
      display: flex;
      div {
        height: 21.25px;
        border-radius: 21.25px;
        background-color: #222427;
      }
      #sk-rank-badge {
        width: 50px;
        margin-right: 15px;
      }
      #sk-friend-badge {
        width: 37.5px;
      }
    }
  }
`;
