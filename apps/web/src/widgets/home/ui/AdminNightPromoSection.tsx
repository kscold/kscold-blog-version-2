'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';

export function AdminNightPromoSection() {
  const { allowRichEffects } = usePerformanceMode();

  return (
    <section className="border-t border-surface-200 bg-surface-50/80 px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        className="mx-auto grid max-w-5xl gap-6 rounded-[32px] border border-surface-200 bg-white p-6 shadow-sm lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:p-8"
        initial={allowRichEffects ? { opacity: 0, y: 16 } : false}
        whileInView={allowRichEffects ? { opacity: 1, y: 0 } : undefined}
        viewport={allowRichEffects ? { once: true } : undefined}
        transition={allowRichEffects ? { duration: 0.6 } : undefined}
      >
        <div className="space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-surface-400">
            Admin Night
          </p>
          <h2 className="text-3xl font-black tracking-tight text-surface-900">
            술 대신 각자 할 일을 들고 모이는
            <br />
            조용한 작업의 밤
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-surface-500 sm:text-base">
            퇴근 후나 주말에 카페나 집에서 각자 밀린 일을 끝내고, 가능하면 기록이나 PR까지 남기는 느슨한 작업 문화입니다.
            블로그 안에서는 이 흐름을 소개하고, 바로 이어갈 수 있는 링크도 함께 열어둡니다.
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-[28px] bg-surface-900 p-5 text-white">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-surface-400">
              Tonight Flow
            </p>
            <p className="text-lg font-black leading-7">
              메일 한 통, 초안 한 개, 작은 버그 하나.
              <br />
              오늘 밤 끝낼 일만 들고 오면 충분합니다.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href="/admin-night"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-bold text-surface-900 transition-colors hover:bg-surface-100"
            >
              Admin Night 보러 가기
            </Link>
            <Link
              href="/guestbook"
              className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              같이 붙고 싶다면 한 줄 남기기
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
