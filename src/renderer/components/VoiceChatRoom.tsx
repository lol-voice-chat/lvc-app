import React, { useEffect } from 'react';
import useVoiceChat from '../hooks/useVoiceChat';

function VoiceChatRoom() {
  const { onVoiceChatRoom } = useVoiceChat();

  useEffect(() => {
    onVoiceChatRoom();
  }, []);

  return <div>앙 보이스챗방띠</div>;
}

export default VoiceChatRoom;
