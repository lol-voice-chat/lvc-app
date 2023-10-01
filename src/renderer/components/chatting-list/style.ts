import styled from 'styled-components';

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
  height: 90vh;

  overflow-x: hidden;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    display: none;
  }
`;

/* 스켈레톤 */
export const SkellMessageBlock = styled.div`
  display: flex;
  width: 96%;
  padding: 15px 4% 15px 15px;

  #sk-summoner-profile {
    position: relative;
    height: 45px;
    margin-right: 12px;

    #sk-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #404249;
    }
    #sk-rank-badge {
      position: absolute;
      bottom: -5px;
      left: -5px;
      width: 50px;
      height: 21.25px;
      border-radius: 21.25px;
      background-color: #2a2d30;
    }
  }
  #sk-content {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    #sk-name-tag {
      width: 120px;
      height: 18px;
      border-radius: 18px;
      background-color: #404249;
    }
    #sk-text-bundle {
      display: flex;
      #sk-text {
        margin: 7px 7px 0 0;
        height: 20px;
        border-radius: 20px;
        background-color: #404249;
      }
    }
  }
`;
