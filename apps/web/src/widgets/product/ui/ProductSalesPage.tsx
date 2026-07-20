'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { aiAgentBloomPaymentApi, type AiAgentBloomPaymentConfig } from '@/features/payment';

const HIGHLIGHTS = [
  '오프라인 고정 진행 (장소 대관 포함)',
  '바이브코딩을 활용한 AI Agent 실습',
  'LangGraph 기반 그래프 구성 실습',
  '음식·음료 및 강의 자료 제공',
];

/** 판매 상품 목록 화면. 상품명·가격·판매상태·결제수단을 한 화면에서 확인할 수 있음. */
export function ProductSalesPage() {
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

  const productName = config?.productName ?? 'AI Agent Bloom 참가권';
  const amount = (config?.totalAmount ?? 30_000).toLocaleString('ko-KR');
  const servicePeriod =
    config?.servicePeriod ?? '결제 완료 즉시 참가권 확정, 상세 안내 1일 이내 이메일 제공';

  return (
    <main className="min-h-screen bg-surface-50 px-4 py-10 text-surface-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="space-y-2">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cyan-600">Product</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">판매 상품</h1>
          <p className="text-sm leading-7 text-surface-600">
            콜딩(Colding)에서 판매하는 상품입니다. 상품을 선택하면 결제 화면으로 이동합니다.
          </p>
        </header>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-black text-amber-900">테스트 결제 안내</p>
          <p className="mt-1 text-sm leading-6 text-amber-800">
            현재 결제 연동을 점검하는 테스트 결제 단계입니다. 결제대행사 테스트 모드로 동작하므로
            실제 카드 승인이나 청구는 발생하지 않습니다.
          </p>
        </div>

        <article className="overflow-hidden rounded-[28px] border border-surface-200 bg-white shadow-sm">
          <div className="border-b border-surface-100 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                    판매중
                  </span>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
                    테스트 결제
                  </span>
                  <span className="rounded-full bg-surface-100 px-3 py-1 text-xs font-black text-surface-500">
                    디지털 · 오프라인 세션
                  </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight">{productName}</h2>
                <p className="max-w-xl text-sm leading-7 text-surface-600">
                  AI Agent를 함께 만들어보는 오프라인 세션 참가권입니다. 작은 LLM 호출에서 시작해
                  LangGraph 기반 구성까지 직접 따라가며 실습합니다.
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black tracking-tight">{amount}원</p>
                <p className="mt-1 text-xs font-bold text-surface-400">부가세 포함</p>
              </div>
            </div>

            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {HIGHLIGHTS.map(item => (
                <li key={item} className="flex gap-2 text-sm leading-6 text-surface-600">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 bg-surface-50/60 p-6 sm:p-8">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-black text-surface-400">서비스 제공 기간</dt>
                <dd className="mt-1 font-bold text-surface-800">{servicePeriod}</dd>
              </div>
              <div>
                <dt className="text-xs font-black text-surface-400">취소·환불</dt>
                <dd className="mt-1 font-bold text-surface-800">
                  세션 시작 전까지 전액 환불 (이메일 문의)
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap gap-3 pt-2">
              {config?.cardConfigured && (
                <Link
                  href="/inicis/payment-path"
                  className="inline-flex rounded-2xl bg-surface-900 px-6 py-4 text-sm font-black text-white transition-colors hover:bg-surface-800"
                >
                  신용카드로 테스트 결제하기
                </Link>
              )}
              {config?.configured && (
                <Link
                  href="/kakaopay/payment-path"
                  className="inline-flex rounded-2xl border border-surface-200 bg-white px-6 py-4 text-sm font-black text-surface-900 transition-colors hover:bg-surface-50"
                >
                  카카오페이로 테스트 결제하기
                </Link>
              )}
              <Link
                href="/admin-night/ai-agent-bloom"
                className="inline-flex rounded-2xl border border-surface-200 bg-white px-6 py-4 text-sm font-black text-surface-600 transition-colors hover:bg-surface-50"
              >
                상품 상세 보기
              </Link>
            </div>

            <p className="text-xs leading-6 text-surface-500">
              결제는 신용카드(KG이니시스) 또는 카카오페이로 진행되며, 회원가입 없이 결제할 수 있습니다.
              결제 정보는 결제대행사를 통해 안전하게 처리됩니다.
            </p>
          </div>
        </article>

        <section className="rounded-[24px] border border-surface-200 bg-white p-6 text-sm leading-7 text-surface-600">
          <h2 className="text-base font-black text-surface-900">판매자 정보</h2>
          <div className="mt-3 grid gap-1 sm:grid-cols-2">
            <p>
              <span className="font-bold text-surface-500">상호</span> 콜딩(Colding)
            </p>
            <p>
              <span className="font-bold text-surface-500">대표</span> 김승찬
            </p>
            <p>
              <span className="font-bold text-surface-500">사업자등록번호</span> 457-49-00942
            </p>
            <p>
              <span className="font-bold text-surface-500">대표전화</span> 010-6545-6502
            </p>
          </div>
          <Link
            href="/privacy"
            className="mt-4 inline-flex font-bold text-surface-900 underline underline-offset-2"
          >
            개인정보 처리방침
          </Link>
        </section>
      </div>
    </main>
  );
}
