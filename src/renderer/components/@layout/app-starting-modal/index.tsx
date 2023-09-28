import React, { Dispatch, SetStateAction, useEffect } from 'react';
import * as _ from './style';

function AppStartingModal(props: { setIsOnAppStartingModal: Dispatch<SetStateAction<boolean>> }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      props.setIsOnAppStartingModal(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return <_.ModalContainer></_.ModalContainer>;
}

export default AppStartingModal;
