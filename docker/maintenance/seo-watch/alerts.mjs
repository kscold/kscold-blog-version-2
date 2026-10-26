const DISCORD_API = 'https://discord.com/api/v10';
const DAY_MS = 86_400_000;
// 다시 제출했는데도 이만큼 안 읽어 가면 알린다.
const SITEMAP_ALERT_MS = 14 * DAY_MS;
const DISCORD_LIMIT = 1900;

/**
 * 오늘 점검에서 사람이 봐야 할 이상만 고른다. 지난 기록(previous)과 비교해 색인이 줄었는지도 본다.
 * 아무 일 없으면 빈 배열이라 알림을 보내지 않는다.
 */
export function findAlerts(result, previous, now = Date.now()) {
  const alerts = [];
  for (const item of result.health) {
    if (item.problems.length > 0)
      alerts.push(`상태 점검 ${item.target}: ${item.problems.join(', ')}`);
  }
  const { indexNow, searchConsole } = result;
  if (!indexNow.dryRun && indexNow.urls.length > 0 && !indexNow.accepted) {
    const outcomes = indexNow.responses.map(response => `${response.endpoint} ${response.outcome}`);
    alerts.push(`IndexNow 색인 요청이 모두 거절됨 (${outcomes.join(', ')})`);
  }
  if (searchConsole?.error) {
    alerts.push(`서치 콘솔 조회 실패: ${searchConsole.error}`);
  } else if (searchConsole) {
    const { coverage, sitemap } = searchConsole;
    if (typeof previous?.indexed === 'number' && coverage.indexed < previous.indexed) {
      alerts.push(`색인된 페이지가 줄었음: ${previous.indexed} → ${coverage.indexed}개`);
    }
    const downloadedAt = Date.parse(sitemap.lastDownloaded ?? '') || 0;
    if (now - downloadedAt > SITEMAP_ALERT_MS) {
      alerts.push(
        `구글이 사이트맵을 14일 넘게 안 읽어 감 (마지막 ${sitemap.lastDownloaded ?? '없음'})`
      );
    }
  }
  return alerts;
}

/** 디스코드 채널에 알림을 보낸다. 실패해도 점검 자체는 끝내도록 결과만 돌려준다. */
export async function sendDiscordAlert({ token, channelId, date, alerts, fetcher }) {
  const lines = [`**kscold.com 검색 노출 점검 ${date}** — 확인할 것 ${alerts.length}개`];
  lines.push(...alerts.map(alert => `• ${alert}`));
  lines.push('리포트: `~/.local/state/kscold-seo-watch/reports/` · 관리자 /admin/search');
  let content = lines.join('\n');
  if (content.length > DISCORD_LIMIT) content = `${content.slice(0, DISCORD_LIMIT)}\n…`;
  try {
    const response = await fetcher(`${DISCORD_API}/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'DiscordBot (https://kscold.com, 1.0)',
      },
      // 점검 결과 문구가 사람이나 역할을 부르지 않도록 멘션을 막는다.
      body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
    });
    return { sent: response.ok, status: response.status };
  } catch {
    return { sent: false, status: 0 };
  }
}
