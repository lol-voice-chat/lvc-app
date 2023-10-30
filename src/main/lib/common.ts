import { createHttp1Request } from 'league-connect';
import { credentials } from '../lvc-application';
import isDev from 'electron-is-dev';
import path from 'path';

export const resolvePath = () => {
  if (isDev) {
    return 'http://localhost:3000';
  }

  return `file://${path.resolve(__dirname, '../renderer/', 'index.html')}`;
};

export const request = async (url: string) => {
  try {
    const response = await createHttp1Request(
      {
        method: 'GET',
        url,
      },
      credentials!
    );

    return JSON.parse(response.text());
  } catch (error) {
    throw new Error(`lcu api 요청중 오류가 발생했습니다: ${error}`);
  }
};
