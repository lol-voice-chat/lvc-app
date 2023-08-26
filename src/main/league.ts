import { authenticate, createHttp1Request } from 'league-connect';

type methodType = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const league = async (method: methodType, url: string) => {
  const credentials = await authenticate({
    awaitConnection: true,
  });

  try {
    const response = await createHttp1Request(
      {
        method,
        url,
      },
      credentials
    );

    return JSON.parse(response.text());
  } catch (error) {
    throw new Error(`lcu api http 요청중 오류가 발생했습니다: ${error}`);
  }
};

export default league;
