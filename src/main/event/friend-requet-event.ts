import { ipcMain } from 'electron';
import { createHttp1Request } from 'league-connect';
import { credentials } from '../lvc-application';

interface Recipient {
  gameName: string;
  gameTag: string;
  id: string;
  name: string;
  pid: string;
  puuid: string;
  summonerId: number;
  profileImage: string;
  tier: string;
}

export const handleFriendRequestEvent = () => {
  ipcMain.on('friend-request', async (_, recipient: Recipient) => {
    const icon: number = getIconByProfileImage(recipient.profileImage);

    try {
      await createHttp1Request(
        {
          method: 'POST',
          url: '/lol-chat/v1/friend-requests',
          body: {
            direction: 'out',
            gameName: recipient.gameName,
            gameTag: recipient.gameTag,
            icon,
            id: recipient.id,
            name: recipient.name,
            note: '',
            pid: recipient.pid,
            puuid: recipient.puuid,
            summonerId: recipient.summonerId,
          },
        },
        credentials!
      );
    } catch (error) {
      throw new Error('친구요청중 오류가 발생했습니다: ' + error);
    }
  });
};

function getIconByProfileImage(profileImage: string) {
  const parts: string[] = profileImage.split('/');
  const icon = parts[parts.length - 1].replace('.webp', '');
  return parseInt(icon);
}

export default handleFriendRequestEvent;
