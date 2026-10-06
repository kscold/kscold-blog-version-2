import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** 한 곳에 알리면 참여 검색엔진끼리 공유하지만, 네이버는 자체 수신 주소도 열어두어 함께 알린다. */
const ENDPOINTS = ['https://api.indexnow.org/indexnow', 'https://searchadvisor.naver.com/indexnow'];
const KEY_FILE = /^([a-f0-9]{32})\.txt$/;
const BATCH_SIZE = 5000;

/**
 * 사이트가 공개하는 소유 확인 키를 찾는다. 키는 `<키>.txt` 파일로 배포되고 내용도 키와 같아야 한다.
 * 스크립트에 키를 따로 적지 않고 배포 대상 파일에서 읽어, 둘이 어긋나는 일을 막는다.
 */
export function findIndexNowKey(publicDirectory) {
  for (const name of readdirSync(publicDirectory)) {
    const key = KEY_FILE.exec(name)?.[1];
    if (key && readFileSync(join(publicDirectory, name), 'utf8').trim() === key) return key;
  }
  return null;
}

async function post(fetcher, endpoint, payload) {
  try {
    const response = await fetcher(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });
    return { endpoint: new URL(endpoint).hostname, status: response.status };
  } catch (error) {
    return { endpoint: new URL(endpoint).hostname, status: 0, error: error.name };
  }
}

const accepted = status => status === 200 || status === 202;

/**
 * 바뀐 URL을 검색엔진에 알린다. 한 곳이라도 받아들이면 성공으로 본다.
 * 받아들인 곳이 없으면 다음 실행에서 같은 URL을 다시 보내도록 실패로 돌려준다.
 */
export async function submitIndexNow({ urls, site, key, fetcher }) {
  const { host, origin } = new URL(site);
  const responses = [];
  for (let offset = 0; offset < urls.length; offset += BATCH_SIZE) {
    const payload = {
      host,
      key,
      keyLocation: `${origin}/${key}.txt`,
      urlList: urls.slice(offset, offset + BATCH_SIZE),
    };
    for (const endpoint of ENDPOINTS) responses.push(await post(fetcher, endpoint, payload));
  }
  return {
    accepted: responses.some(response => accepted(response.status)),
    responses: responses.map(response => ({
      endpoint: response.endpoint,
      outcome: response.error ? `연결 실패 (${response.error})` : `HTTP ${response.status}`,
    })),
  };
}
