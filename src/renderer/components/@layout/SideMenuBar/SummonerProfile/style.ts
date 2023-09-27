import styled from 'styled-components';
import { FONT, PALETTE } from '../../../../const';

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
    background-color: #2f3035;
  }
`;

export const Information = styled.div<{ nameLength: number }>`
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
      font-size: 14px;
      color: ${PALETTE.WHITE_1};

      display: block;
      width: ${({ nameLength }) => (nameLength > 7 ? '85px' : 'auto')};
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  /* 스켈레톤 */
  #sk-name-tag {
    display: flex;

    #sk-display-name {
      width: 85px;
      height: 16px;
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
`;
