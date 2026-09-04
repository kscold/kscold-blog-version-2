'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { aiAgentBloomPaymentApi, type AiAgentBloomPaymentConfig } from '@/features/payment';
import { SERVICE_PERIOD } from '@/shared/model/aiAgentBloomContent';

/** 상품 상세의 카카오페이 구매 영역. */
export function BloomPurchaseCta() {
  const [config, setConfig] = useState<AiAgentBloomPaymentConfig | null>(null);

  useEffect(() => {
    let mounted = true;
    aiAgentBloomPaymentApi
      .getConfig()
      .then(next => {
        if (mounted) setConfig(next);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  const amount = (config?.totalAmount ?? 30_000).toLocaleString('ko-KR');

  return (
    <section
      id="ai-agent-bloom-purchase"
      className="scroll-mt-28 rounded-[28px] border-2 border-surface-900 bg-white p-5 shadow-soft sm:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-600">
            AI Agent Bloom 참가권
          </p>
          <p className="mt-2 text-3xl font-black tracking-tight text-surface-950">{amount}원</p>
          <p className="mt-1 text-xs font-bold text-surface-500">
            서비스 제공 기간: {config?.servicePeriod ?? SERVICE_PERIOD}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {config?.configured && (
            <Link
              href="/kakaopay/payment-path"
              className="inline-flex rounded-2xl bg-surface-900 px-6 py-4 text-sm font-black text-white transition-colors hover:bg-surface-800"
            >
              카카오페이로 결제하기
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
