import Image from 'next/image';
import Link from 'next/link';
import { HANSALIM_LECTURE } from '../model/hansalimLecture';
import { LectureSectionHeading } from './LectureSectionHeading';

/** 교육이 끝난 뒤 올린 후기 글로 이어 준다. 후기가 아직 없으면 아무것도 그리지 않는다. */
export function LectureReviewSection() {
  const { review } = HANSALIM_LECTURE;
  if (!review) return null;

  return (
    <section data-testid="lecture-review" aria-labelledby="review-title">
      <LectureSectionHeading id="review-title" label="Review" title="교육 후기" />
      <Link
        href={review.postPath}
        className="group grid gap-6 overflow-hidden rounded-[28px] border border-surface-200 bg-white p-6 transition-colors hover:border-surface-400 sm:p-8 md:grid-cols-[1fr_16rem]"
      >
        <div>
          <p className="break-keep text-sm leading-7 text-surface-600">{review.summary}</p>
          <span className="mt-5 inline-block text-sm font-black text-primary-700 group-hover:underline">
            후기 읽기 →
          </span>
        </div>
        {review.coverImage && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-100">
            <Image src={review.coverImage} alt="" fill sizes="256px" className="object-cover" />
          </div>
        )}
      </Link>
    </section>
  );
}
