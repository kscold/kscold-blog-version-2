const NAVER_ENDPOINT = 'https://openapi.naver.com/v1/search/webkr.json';
const GOOGLE_ENDPOINT = 'https://www.googleapis.com/customsearch/v1';
const GOOGLE_PAGES = 3;

/** 검색 결과 목록에서 내 사이트가 처음 나오는 순위(1부터)를 찾는다. 없으면 null. */
export function findPosition(links, host) {
  const index = links.findIndex(link => {
    try {
      const { hostname } = new URL(link);
      return hostname === host || hostname.endsWith(`.${host}`);
    } catch {
      return false;
    }
  });
  return index === -1 ? null : index + 1;
}

async function readJson(fetcher, url, headers) {
  const response = await fetcher(url, { headers });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function naverLinks(fetcher, query, env) {
  const url = `${NAVER_ENDPOINT}?display=100&query=${encodeURIComponent(query)}`;
  const data = await readJson(fetcher, url, {
    'X-Naver-Client-Id': env.NAVER_SEARCH_CLIENT_ID,
    'X-Naver-Client-Secret': env.NAVER_SEARCH_CLIENT_SECRET,
  });
  return (data.items ?? []).map(item => item.link);
}

async function googleLinks(fetcher, query, env) {
  const links = [];
  for (let page = 0; page < GOOGLE_PAGES; page += 1) {
    const params = new URLSearchParams({
      key: env.GOOGLE_CSE_KEY,
      cx: env.GOOGLE_CSE_CX,
      q: query,
      gl: 'kr',
      hl: 'ko',
      num: '10',
      start: String(page * 10 + 1),
    });
    const data = await readJson(fetcher, `${GOOGLE_ENDPOINT}?${params}`, {});
    const items = data.items ?? [];
    links.push(...items.map(item => item.link));
    if (items.length < 10) break;
  }
  return links;
}

/** 키가 등록된 검색엔진만 조회 대상으로 삼는다. 화면을 긁지 않고 공식 검색 API만 쓴다. */
export function availableEngines(env) {
  const engines = [];
  if (env.NAVER_SEARCH_CLIENT_ID && env.NAVER_SEARCH_CLIENT_SECRET) {
    engines.push({ name: 'naver', depth: 100, load: naverLinks });
  }
  if (env.GOOGLE_CSE_KEY && env.GOOGLE_CSE_CX) {
    engines.push({ name: 'google', depth: GOOGLE_PAGES * 10, load: googleLinks });
  }
  return engines;
}

/** 검색어별로 내 사이트의 순위를 기록한다. 조회에 실패한 항목은 사유만 남기고 계속한다. */
export async function checkRanks({ queries, host, env, fetcher }) {
  const results = [];
  for (const engine of availableEngines(env)) {
    for (const query of queries) {
      try {
        const links = await engine.load(fetcher, query, env);
        const position = findPosition(links, host);
        results.push({ engine: engine.name, query, position, depth: engine.depth });
      } catch (error) {
        results.push({ engine: engine.name, query, error: error.message });
      }
    }
  }
  return results;
}
