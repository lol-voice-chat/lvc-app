import React from 'react';
import styled from 'styled-components';

function UserIconWithStatus(props: { userIcon: string; status: string; borderColor: string }) {
  return (
    <IconWithStatus id="user-icon-with-status" borderColor={props.borderColor}>
      <img id="user-profile" src={props.userIcon} alt="소환사 프로필" />
      <img
        id="user-status"
        src={props.status === '온라인' ? 'img/user-status/online_icon.svg' : ''}
        alt="소환사 상태"
      />
    </IconWithStatus>
  );
}

const IconWithStatus = styled.div<{ borderColor: string }>`
  position: relative;

  #user-profile {
    width: 35px;
    height: 35px;
    border-radius: 50%;
  }
  #user-status {
    position: absolute;
    bottom: 0;
    right: 0;

    width: 11px;
    height: 11px;
    border-radius: 50%;
    border: 2.5px solid ${(p) => p.borderColor};
  }
`;

export default UserIconWithStatus;
