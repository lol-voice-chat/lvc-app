import React from 'react';
import styled from 'styled-components';
import { SummonerStatusType } from '../../@type/summoner';

function SummonerIcon(props: {
  userIcon: string;
  status: SummonerStatusType;
  borderColor: string;
}) {
  return (
    <IconWithStatus
      id="user-icon-with-status"
      statusColor={props.status === '온라인' ? '#50A361' : '#949BA4'}
      borderColor={props.borderColor}
    >
      <img id="user-profile" src={props.userIcon} alt="소환사 프로필" />
      <div id="user-status" />
    </IconWithStatus>
  );
}

const IconWithStatus = styled.div<{ statusColor: string; borderColor: string }>`
  position: relative;

  #user-profile {
    width: 35px;
    height: 35px;
    border-radius: 50%;
  }
  #user-status {
    position: absolute;
    bottom: 0;
    right: -5px;

    width: 11px;
    height: 11px;
    border-radius: 50%;
    background-color: ${(p) => p.statusColor};
    border: 2.5px solid ${(p) => p.borderColor};
  }
`;

export default SummonerIcon;
