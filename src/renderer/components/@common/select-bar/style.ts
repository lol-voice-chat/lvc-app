import Select from 'react-select';
import { StylesConfig } from 'react-select';
import styled from 'styled-components';
import { FONT, PALETTE } from '../../../const';

export const CustomSelectBar = styled(Select)`
  width: 100%;

  * {
    font-size: 12px;
    font-weight: ${FONT.REGULAR};
  }

  svg {
    padding-right: 10px;
    path {
      color: #949ba4;
    }
  }
  span {
    background-color: #1c1d20;
  }

  .css-1nmdiq5-menu {
    background-color: #1c1d20;
  }

  .css-1fdsijx-ValueContainer {
    margin: 0;
    padding-left: 10px;
    * {
      color: #949ba4;
    }
  }

  .css-1xc3v61-indicatorContainer,
  .css-15lsz6c-indicatorContainer {
    margin: 0;
    padding: 0;
  }
`;

export const colorStyles: StylesConfig<any> = {
  control: (styles) => ({
    ...styles,
    backgroundColor: '#1C1D20',
    color: 'white',
    boxShadow: 'none',
    borderColor: '#1C1D20',

    ':hover': {
      borderColor: '#1C1D20',
      cursor: 'pointer',
    },
  }),
  option: (styles, { isDisabled, isSelected }) => {
    const defaultColor = '#1C1D20';
    return {
      ...styles,
      backgroundColor: `${defaultColor}`,
      color: '#949BA4',
      cursor: isDisabled ? 'not-allowed' : 'default',

      ':hover': {
        backgroundColor: '#2a2c30',
        color: `${PALETTE.WHITE_1}`,
        cursor: 'pointer',
      },

      ':active': {
        ...styles[':active'],
        backgroundColor: !isDisabled ? (isSelected ? defaultColor : '#1C1D20') : '#1C1D20',
      },
    };
  },
  input: (styles) => ({ ...styles }),
  placeholder: (styles) => ({ ...styles }),
  singleValue: (styles) => ({ ...styles }),
};
