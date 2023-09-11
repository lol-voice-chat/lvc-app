import React from 'react';
import styled from 'styled-components';
import { PALETTE } from '../../const';

function RankBadge(props: { size: number; tierImg: string; tier: string }) {
  return (
    <Badge size={props.size}>
      <img src={props.tierImg} alt="티어 배지 이미지" />
      <p>{props.tier}</p>
    </Badge>
  );
}

const Badge = styled.div<{ size }>`
  display: flex;
  justify-content: center;
  align-items: center;

  padding: 0 ${(p) => p.size / 1.5}px;

  border-radius: ${(p) => p.size * 2}px;

  background-color: #222427;

  img {
    width: ${(p) => p.size * 2}px;
    height: ${(p) => p.size * 2}px;
  }

  p {
    font-size: ${(p) => p.size}px;
    padding-left: ${(p) => p.size / 3}px;

    color: ${PALETTE.WHITE_1};
  }
`;

export default RankBadge;
