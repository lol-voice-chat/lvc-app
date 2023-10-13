import styled from 'styled-components';
import { FONT, PALETTE } from '../../../const';

export const MessageInputContainer = styled.div<{ isOnClient: boolean }>`
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
      cursor: ${({ isOnClient }) => (isOnClient ? 'pointer' : 'not-allowed')};

      &:hover {
        img {
          transform: ${({ isOnClient }) => (isOnClient ? 'rotate(180deg)' : 'rotate(0deg)')};
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
      border-radius: 0 7.5px 7.5px 0;

      word-break: break-all;
      font-weight: ${FONT.REGULAR};
      font-size: 16px;

      color: ${PALETTE.WHITE_1};
      background-color: #36383d;

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

      cursor: ${({ isOnClient }) => (isOnClient ? 'auto' : 'not-allowed')};
    }
  }
`;
