import type { ReactNode } from 'react';

interface LectureSectionHeadingProps {
  id: string;
  label: string;
  title: string;
  children?: ReactNode;
}

/** 블로그의 다른 화면처럼 카드 바깥에 영문 꼬리표와 제목을 두어 구역을 나눈다. */
export function LectureSectionHeading({ id, label, title, children }: LectureSectionHeadingProps) {
  return (
    <div className="mb-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-surface-400">{label}</p>
      <h2
        id={id}
        className="mt-3 break-keep text-2xl font-black tracking-tight text-surface-900 sm:text-3xl"
      >
        {title}
      </h2>
      {children && (
        <p className="mt-3 max-w-2xl break-keep text-sm leading-6 text-surface-500">{children}</p>
      )}
    </div>
  );
}
