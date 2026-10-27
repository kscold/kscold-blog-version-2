import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireVerifiedAdmin } from '@/shared/lib/server/adminGuard';
import { HANSALIM_LECTURE, LecturePresenter } from '@/widgets/lecture';
import { readPresenterData } from '@/widgets/lecture/server/hansalimPresenter';

const PRESENTER_PATH = '/hansalim/presenter';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `강사 발표 화면 · ${HANSALIM_LECTURE.organization}`,
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

// 강사가 아이패드에서 지금 장·다음 장·대본을 함께 보는 화면이다. 자료 페이지 어디에도 링크하지 않는다.
// 대본은 공개 저장소에 없고 배포 파일(private/)에만 있으므로, 백엔드에서 관리자임을 확인한 뒤에만 읽는다.
export default async function HansalimPresenterPage() {
  await requireVerifiedAdmin(PRESENTER_PATH);
  const data = await readPresenterData();
  if (!data) notFound();
  return (
    <LecturePresenter
      slides={data.slides}
      deckHref={`${PRESENTER_PATH}/deck?v=${data.deckSha256.slice(0, 12)}`}
      title={`${HANSALIM_LECTURE.organization} ${HANSALIM_LECTURE.title}`}
    />
  );
}
