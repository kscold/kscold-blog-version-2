import { NextResponse } from 'next/server';

const GITHUB_GRAPHQL = 'https://api.github.com/graphql';
const USERNAME = 'kscold';

// 올해 GitHub 기여 통계 + 컨트리뷰션 캘린더 반환
export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'GITHUB_TOKEN 미설정' }, { status: 500 });
  }

  const year = new Date().getFullYear();
  const query = `{
    user(login: "${USERNAME}") {
      contributionsCollection(
        from: "${year}-01-01T00:00:00Z"
        to: "${year}-12-31T23:59:59Z"
      ) {
        totalCommitContributions
        totalPullRequestContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
      repositories(first: 1) {
        totalCount
      }
    }
  }`;

  try {
    const res = await fetch(GITHUB_GRAPHQL, {
      method: 'POST',
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 3600 }, // 1시간 캐시
    });

    const json = await res.json();
    const user = json.data?.user;
    const collection = user?.contributionsCollection;

    return NextResponse.json({
      totalContributions: collection?.contributionCalendar?.totalContributions ?? 0,
      totalCommits: collection?.totalCommitContributions ?? 0,
      totalPRs: collection?.totalPullRequestContributions ?? 0,
      repos: user?.repositories?.totalCount ?? 0,
      weeks: collection?.contributionCalendar?.weeks ?? [],
    });
  } catch {
    return NextResponse.json({ error: '조회 실패' }, { status: 500 });
  }
}
