import type { ReactNode } from 'react';

interface LectureSectionHeadingProps {
  id: string;
  title: string;
  children?: ReactNode;
}

/** 구역 제목과 한 줄 설명. 참가자용 화면이라 장식용 영문 꼬리표 없이 한글 제목만 둔다. */
export function LectureSectionHeading({ id, title, children }: LectureSectionHeadingProps) {
  return (
    <div className="mb-6">
      <h2
        id={id}
        className="break-keep text-2xl font-black tracking-tight text-surface-900 sm:text-[1.75rem]"
      >
        {title}
      </h2>
      {children && (
        <p className="mt-2 max-w-2xl break-keep text-base leading-7 text-surface-600">{children}</p>
      )}
    </div>
  );
}
