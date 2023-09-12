import React from 'react';
import styled from 'styled-components';
import { PALETTE } from '../../const';

function RankBadge(props: { size: number; tierImg: string; tier: string }) {
  return (
    <Badge size={props.size} tier={props.tier}>
      {props.tier !== 'Unrank' && <img src={props.tierImg} alt="티어 배지 이미지" />}
      <p>{props.tier}</p>
    </Badge>
  );
}

const Badge = styled.div<{ size: number; tier: string }>`
  display: flex;
  justify-content: center;
  align-items: center;

  padding: ${({ size, tier }) =>
    tier === 'Unrank' ? `${size / 2.5}px ${size / 1.5}px` : `0 ${size / 1.5}px`};

  border-radius: ${(p) => p.size * 2}px;

  background-color: #222427;

  img {
    width: ${(p) => p.size * 2}px;
    height: ${(p) => p.size * 2}px;
  }

  p {
    font-size: ${(p) => p.size}px;
    padding-left: ${({ size, tier }) => (tier === 'Unrank' ? '0' : `${size / 3}px`)};

    color: ${PALETTE.WHITE_1};
  }
`;

export default RankBadge;
