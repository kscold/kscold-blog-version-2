import { createServer, request as forwardRequest } from 'node:http';

// 운영 Nginx처럼 브라우저의 동일 출처 API 요청만 로컬 테스트 서버로 전달한다.
// 목적지는 고정해 테스트 입력으로 운영 서버나 외부 주소에 접근할 수 없게 한다.
const server = createServer((request, response) => {
  const pathname = new URL(request.url || '/', 'http://127.0.0.1').pathname;
  const upstream = forwardRequest({
    hostname: '127.0.0.1',
    port: pathname === '/api' || pathname.startsWith('/api/') ? 4100 : 3102,
    path: request.url,
    method: request.method,
    headers: request.headers,
  }, upstreamResponse => {
    const headers = { ...upstreamResponse.headers };
    // Nginx의 proxy_redirect처럼 Next 내부 주소가 브라우저에 노출되지 않게 한다.
    // 포트가 바뀌면 쿠키·localStorage 출처도 달라져 권한 검사가 우연히 통과할 수 있다.
    if (headers.location) {
      const target = new URL(headers.location, 'http://127.0.0.1:3102');
      if (['127.0.0.1', 'localhost'].includes(target.hostname) && target.port === '3102') {
        headers.location = `${target.pathname}${target.search}${target.hash}`;
      }
    }
    response.writeHead(upstreamResponse.statusCode || 502, headers);
    upstreamResponse.pipe(response);
    upstreamResponse.on('error', () => response.destroy());
  });
  upstream.on('error', () => {
    if (!response.headersSent) response.writeHead(502);
    response.end('CI upstream unavailable');
  });
  request.on('aborted', () => upstream.destroy());
  response.on('close', () => upstream.destroy());
  request.pipe(upstream);
});

server.listen(3101, '127.0.0.1', () => {
  console.log('CI web proxy listening on http://127.0.0.1:3101');
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close();
    server.closeAllConnections();
  });
}
