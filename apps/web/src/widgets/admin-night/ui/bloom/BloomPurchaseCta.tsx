'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { aiAgentBloomPaymentApi, type AiAgentBloomPaymentConfig } from '@/features/payment';
import { SERVICE_PERIOD } from '@/widgets/payment/lib/aiAgentBloomPaymentContent';

/**
 * 상품 상세의 구매 영역. 결제수단은 서버 설정에 따라 노출되며, 신용카드(KG이니시스) 채널키가 없으면
 * 카드 버튼이 자동으로 숨겨짐.
 */
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
          {config?.cardConfigured && (
            <Link
              href="/inicis/payment-path"
              className="inline-flex rounded-2xl bg-surface-900 px-6 py-4 text-sm font-black text-white transition-colors hover:bg-surface-800"
            >
              신용카드 결제하기
            </Link>
          )}
          {config?.configured && (
            <Link
              href="/kakaopay/payment-path"
              className="inline-flex rounded-2xl border border-surface-200 bg-white px-6 py-4 text-sm font-black text-surface-900 transition-colors hover:bg-surface-50"
            >
              카카오페이로 결제하기
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
