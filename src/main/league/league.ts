import { authenticate, createHttp1Request } from 'league-connect';

/**
 * GET http method 엔드포인트만 사용가능
 */
const league = async (url: string) => {
  const credentials = await authenticate({
    awaitConnection: true,
  });

  try {
    const response = await createHttp1Request(
      {
        method: 'GET',
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
