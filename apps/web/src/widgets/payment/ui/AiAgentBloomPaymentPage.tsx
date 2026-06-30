'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { PaymentResponse } from '@portone/browser-sdk/v2';
import { useViewer } from '@/entities/user/model/useViewer';
import {
  aiAgentBloomPaymentApi,
  type AiAgentBloomPaymentConfig,
  type PreparedAiAgentBloomPayment,
} from '@/features/payment/api/aiAgentBloomPayment';

const PRODUCT_NAME = 'AI Agent Bloom 참가권';
const ORDER_NAME = 'AI Agent, 같이 만들고 피워보는 Bloom 참가권';
const TOTAL_AMOUNT = 30_000;
const PAYMENT_PATH = '/kakaopay/payment-path';
const LOGIN_PATH = `/login?redirect=${encodeURIComponent(PAYMENT_PATH)}`;

type FormState = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
};

const productHighlights = [
  '오프라인 고정 진행',
  '바이브코딩 적극 활용',
  'LangGraph 기반 AI Agent 실습',
  '장소 대관·음식/음료·강의 준비 포함',
  '결제 완료 후 즉시 참가권 확정',
];

export function AiAgentBloomPaymentPage() {
  const { user, isAuthenticated } = useViewer();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [config, setConfig] = useState<AiAgentBloomPaymentConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const handledRedirectPaymentId = useRef<string | null>(null);

  const displayConfig = config ?? {
    configured: false,
    storeId: '',
    channelKey: '',
    productName: PRODUCT_NAME,
    orderName: ORDER_NAME,
    totalAmount: TOTAL_AMOUNT,
    currency: 'KRW' as const,
    servicePeriod: '결제 완료 즉시 참가권 확정, 상세 안내 1일 이내 이메일 제공',
  };

  const formattedAmount = useMemo(
    () => displayConfig.totalAmount.toLocaleString('ko-KR'),
    [displayConfig.totalAmount]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let mounted = true;
    aiAgentBloomPaymentApi
      .getConfig()
      .then((nextConfig) => {
        if (!mounted) {
          return;
        }
        setConfig(nextConfig);
        setConfigError(null);
      })
      .catch((error) => {
        if (!mounted) {
          return;
        }
        setConfigError(resolveErrorMessage(error, '결제 설정을 불러오지 못했습니다.'));
      });

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm((prev) => ({
      customerName: prev.customerName || user.displayName || user.username || '',
      customerEmail: prev.customerEmail || user.email || '',
      customerPhone: prev.customerPhone,
    }));
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const paymentId = searchParams.get('paymentId');
    const code = searchParams.get('code');
    const message = searchParams.get('message');

    if (code) {
      setPaymentStatus(message ? `결제가 완료되지 않았습니다. ${message}` : '결제가 완료되지 않았습니다.');
      return;
    }
    if (!paymentId || handledRedirectPaymentId.current === paymentId) {
      return;
    }

    handledRedirectPaymentId.current = paymentId;
    completePayment(paymentId);
  }, [isAuthenticated]);

  const updateField = (field: keyof FormState, value: string) => {
    const nextValue = field === 'customerPhone' ? formatPhoneNumber(value) : value;
    setForm((prev) => ({ ...prev, [field]: nextValue }));
    setErrors((prev) => {
      const nextErrors = { ...prev };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await openPaymentWindow();
  };

  const openPaymentWindow = async () => {
    if (!isAuthenticated) {
      window.location.href = LOGIN_PATH;
      return;
    }
    if (configError) {
      setPaymentStatus(configError);
      return;
    }
    if (config && !config.configured) {
      setPaymentStatus('포트원 관리자 콘솔의 V2 테스트 Store ID와 카카오페이 테스트 채널키를 서버 환경변수에 넣으면 결제창을 열 수 있습니다.');
      return;
    }

    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setPaymentStatus('주문자 정보를 먼저 확인해주세요.');
      return;
    }

    setIsPreparing(true);
    setPaymentStatus('카카오페이 결제창을 준비하고 있습니다.');

    try {
      const preparedPayment = await aiAgentBloomPaymentApi.prepare({
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        customerPhone: form.customerPhone.trim(),
      });
      const paymentResponse = await requestKakaoPay(preparedPayment);

      if (!paymentResponse) {
        setPaymentStatus('결제창이 닫혔습니다. 다시 시도해주세요.');
        return;
      }
      if (paymentResponse.code) {
        setPaymentStatus(paymentResponse.message || `결제가 완료되지 않았습니다. (${paymentResponse.code})`);
        return;
      }

      await completePayment(paymentResponse.paymentId);
    } catch (error) {
      setPaymentStatus(resolveErrorMessage(error, '결제 처리 중 오류가 발생했습니다.'));
    } finally {
      setIsPreparing(false);
    }
  };

  const completePayment = async (paymentId: string) => {
    try {
      setIsPreparing(true);
      setPaymentStatus('결제 결과를 확인하고 있습니다.');
      const completed = await aiAgentBloomPaymentApi.complete(paymentId);
      setPaymentStatus(completed.message || '결제가 확인되었습니다.');
    } catch (error) {
      setPaymentStatus(resolveErrorMessage(error, '결제 결과 확인 중 오류가 발생했습니다.'));
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface-50 px-4 py-8 text-surface-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
          <div className="inline-flex rounded-full bg-surface-100 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-surface-500">
            KakaoPay Test Payment
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
            AI Agent Bloom 테스트 결제
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-surface-600 sm:text-base">
            상품 확인부터 주문자 정보 입력, 카카오페이 테스트 결제창 진입 직전까지 한 흐름으로 정리했습니다.
            실제 결제창 호출은 로그인한 사용자에게만 열립니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {['테스트 결제', '4-1 상품 상세', '05 상품 확인', '06 주문자 정보', '07 결제창 직전'].map((item) => (
              <span
                key={item}
                className="rounded-full border border-surface-200 bg-white px-4 py-2 text-xs font-black text-surface-600"
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        <section
          id="product-detail"
          className="scroll-mt-28 overflow-hidden rounded-[2rem] border border-surface-200 bg-white shadow-sm"
        >
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-8 p-6 sm:p-8 lg:p-10">
              <div className="space-y-4">
                <div className="inline-flex rounded-full bg-surface-100 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-surface-500">
                  4-1 · Product Detail
                </div>
                <p className="text-sm font-black text-cyan-600">오프라인 세션</p>
                <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
                  AI Agent, 같이 만들고 피워보는 Bloom 참가권
                </h2>
                <p className="text-base leading-8 text-surface-600">
                  LLM 호출부터 LCEL, Memory, LangGraph MAS, RAG fallback, 평가와 관측까지 이어지는
                  AI Agent 구현 흐름을 바이브코딩을 적극 활용해 함께 따라갑니다.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {productHighlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-bold text-surface-700"
                  >
                    {highlight}
                  </div>
                ))}
              </div>
            </div>

            <aside className="bg-surface-950 p-6 text-white sm:p-8 lg:p-10">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5">
                <div className="text-xs font-black uppercase tracking-[0.35em] text-cyan-100">
                  Ticket
                </div>
                <h3 className="mt-4 text-2xl font-black">{displayConfig.productName}</h3>
                <p className="mt-3 text-sm leading-7 text-surface-300">
                  실제 일정 확정 후 동일한 상품 정보로 참가 안내와 결제 안내가 진행됩니다.
                </p>

                <div className="mt-6 space-y-3 text-sm">
                  <PaymentInfoRow label="결제 예정 금액" value={`${formattedAmount}원`} dark />
                  <PaymentInfoRow label="진행 방식" value="오프라인 고정" dark />
                  <PaymentInfoRow label="예상 범위" value="2만~3만 원" dark />
                  <PaymentInfoRow label="포함 항목" value="장소·음식·강의 준비" dark />
                  <PaymentInfoRow label="서비스 제공 기간" value="결제 즉시 확정·1일 이내 안내" dark />
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section
          id="payment-button"
          className="scroll-mt-28 rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <div className="inline-flex rounded-full bg-surface-100 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-surface-500">
                05 · Product Check
              </div>
              <h2 className="text-3xl font-black tracking-tight">상품 확인</h2>
              <p className="text-sm leading-7 text-surface-600">
                결제 전에 상품명, 결제 예정 금액, 제공 기간을 먼저 확인합니다.
                실제 카카오페이 결제창 호출 버튼은 마지막 결제 정보 확인 화면에만 둡니다.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-surface-200 bg-surface-50 p-5">
              <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
                <p className="text-sm font-black text-surface-500">{displayConfig.productName}</p>
                <p className="mt-2 text-4xl font-black tracking-tight">{formattedAmount}원</p>
                {isAuthenticated ? (
                  <a
                    href="#orderer-info"
                    className="mt-5 inline-flex w-full justify-center rounded-2xl bg-surface-950 px-5 py-4 text-sm font-black text-white transition hover:bg-surface-800"
                  >
                    주문자 정보 입력하기
                  </a>
                ) : (
                  <Link
                    href={LOGIN_PATH}
                    className="mt-5 inline-flex w-full justify-center rounded-2xl bg-surface-950 px-5 py-4 text-sm font-black text-white transition hover:bg-surface-800"
                  >
                    로그인하고 상품 확인하기
                  </Link>
                )}
                <p className="mt-3 text-xs font-bold text-surface-500">
                  테스트 결제는 주문자 정보 입력 후 카카오페이 단독 결제창으로 이어집니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section
            id="orderer-info"
            className="scroll-mt-28 rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
          >
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-4">
                <div className="inline-flex rounded-full bg-surface-100 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-surface-500">
                  06 · Orderer Info
                </div>
                <h2 className="text-3xl font-black tracking-tight">주문자 정보 입력</h2>
                <p className="text-sm leading-7 text-surface-600">
                  임의의 주문자 정보를 입력한 뒤 결제수단 선택 단계로 넘어가는 흐름입니다.
                  심사 화면에서 이름, 이메일, 연락처 입력란이 확인됩니다.
                </p>
                {!isAuthenticated && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-900">
                    결제는 로그인 후 진행됩니다. 상품 정보 확인은 비로그인 상태에서도 가능합니다.
                  </div>
                )}
              </div>

              <div className="space-y-5 rounded-[1.75rem] border border-surface-200 bg-surface-50 p-5">
                <PaymentInput
                  label="주문자명"
                  value={form.customerName}
                  placeholder="홍길동"
                  disabled={!isAuthenticated || isPreparing}
                  error={errors.customerName}
                  onChange={(value) => updateField('customerName', value)}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <PaymentInput
                    label="연락처"
                    value={form.customerPhone}
                    placeholder="010-1234-5678"
                    disabled={!isAuthenticated || isPreparing}
                    error={errors.customerPhone}
                    inputMode="numeric"
                    onChange={(value) => updateField('customerPhone', value)}
                  />
                  <PaymentInput
                    label="이메일"
                    value={form.customerEmail}
                    placeholder="buyer@example.com"
                    disabled={!isAuthenticated || isPreparing}
                    error={errors.customerEmail}
                    inputMode="email"
                    onChange={(value) => updateField('customerEmail', value)}
                  />
                </div>

                <div>
                  <div className="text-sm font-black text-surface-900">결제수단 선택</div>
                  <div className="mt-3">
                    <div className="rounded-2xl border-2 border-surface-950 bg-white p-4 text-sm font-black text-surface-900">
                      카카오페이
                      <p className="mt-1 text-xs font-bold text-surface-500">
                        테스트 결제는 카카오페이 단독 결제창으로만 진행합니다.
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-bold text-surface-500">현재 결제수단: 카카오페이 고정</p>
                </div>
              </div>
            </div>
          </section>

          <section
            id="before-payment-window"
            className="scroll-mt-28 rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
          >
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-4">
                <div className="inline-flex rounded-full bg-surface-100 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-surface-500">
                  07 · Before Payment Window
                </div>
                <h2 className="text-3xl font-black tracking-tight">결제창 직전 화면</h2>
                <p className="text-sm leading-7 text-surface-600">
                  일반 PG 결제창 대신 카카오페이 단독연동 결제창으로 이동하기 직전 화면입니다.
                  상품명, 판매자, 결제수단, 금액을 최종 확인할 수 있습니다.
                </p>
                {config && !config.configured && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-950">
                    카카오페이 테스트 계정은 카카오페이 화면이 아니라 포트원 관리자 콘솔에서 준비합니다.
                    V2 테스트 상점의 Store ID와 카카오페이 테스트 채널키를 서버 환경변수
                    PORTONE_STORE_ID, PORTONE_KAKAOPAY_CHANNEL_KEY에 넣어주세요.
                  </div>
                )}
                {paymentStatus && (
                  <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm font-bold leading-6 text-cyan-950">
                    {paymentStatus}
                  </div>
                )}
              </div>

              <div className="rounded-[1.75rem] border border-surface-200 bg-surface-950 p-5 text-white">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-cyan-100">
                      Confirm
                    </span>
                    <span className="text-sm font-black text-cyan-100">KakaoPay</span>
                  </div>
                  <h3 className="mt-5 text-2xl font-black">결제 정보 확인</h3>
                  <div className="mt-5 space-y-3 text-sm">
                    <PaymentInfoRow label="판매자" value="KSCOLD" dark />
                    <PaymentInfoRow label="상품명" value={displayConfig.orderName} dark />
                    <PaymentInfoRow
                      label="주문자"
                      value={`${form.customerName || '홍길동'} · ${form.customerEmail || 'buyer@example.com'}`}
                      dark
                    />
                    <PaymentInfoRow label="결제수단" value="카카오페이" dark />
                    <PaymentInfoRow label="결제금액" value={`${formattedAmount}원`} dark />
                    <PaymentInfoRow label="서비스 제공 기간" value={displayConfig.servicePeriod} dark />
                  </div>
                  <p className="mt-5 text-sm leading-7 text-surface-300">
                    결제 완료 즉시 참가권이 확정되며, 최종 장소와 시간 등 상세 안내는 1일 이내 이메일로 제공합니다.
                    오프라인 세션은 공지된 일정에 현장에서 제공됩니다.
                  </p>
                  <button
                    type="submit"
                    disabled={isPreparing || !isAuthenticated}
                    className="mt-6 inline-flex w-full justify-center rounded-2xl bg-white px-5 py-4 text-sm font-black text-surface-950 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:bg-surface-600 disabled:text-surface-300"
                  >
                    {isAuthenticated
                      ? isPreparing
                        ? '결제 확인 중...'
                        : '카카오페이 테스트 결제창으로 이동'
                      : '로그인 후 결제할 수 있습니다'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </form>
      </div>
    </main>
  );
}

async function requestKakaoPay(preparedPayment: PreparedAiAgentBloomPayment): Promise<PaymentResponse | undefined> {
  const { requestPayment } = await import('@portone/browser-sdk/v2');
  const currentUrl = `${window.location.origin}${window.location.pathname}`;

  return requestPayment({
    storeId: preparedPayment.storeId,
    channelKey: preparedPayment.channelKey,
    paymentId: preparedPayment.paymentId,
    orderName: preparedPayment.orderName,
    totalAmount: preparedPayment.totalAmount,
    currency: preparedPayment.currency,
    payMethod: 'EASY_PAY',
    easyPay: {
      easyPayProvider: 'KAKAOPAY',
      availablePayMethods: ['CARD'],
    },
    customer: {
      fullName: preparedPayment.customerName,
      email: preparedPayment.customerEmail,
      phoneNumber: preparedPayment.customerPhone.replace(/\D/g, ''),
    },
    products: [
      {
        id: 'ai-agent-bloom-ticket',
        name: preparedPayment.productName,
        amount: preparedPayment.totalAmount,
        quantity: 1,
        tag: 'offline-session',
        link: `${window.location.origin}/admin-night/ai-agent-bloom`,
        description: preparedPayment.servicePeriod,
      },
    ],
    productType: 'DIGITAL',
    redirectUrl: currentUrl,
    customData: {
      programKey: preparedPayment.programKey,
      servicePeriod: preparedPayment.servicePeriod,
    },
  });
}

function PaymentInfoRow({
  label,
  value,
  dark = false,
}: {
  label: string;
  value: string;
  dark?: boolean;
}) {
  return (
    <div className={`flex gap-4 border-b pb-3 last:border-b-0 last:pb-0 ${dark ? 'border-white/10' : 'border-surface-200'}`}>
      <dt className={`w-28 shrink-0 font-black ${dark ? 'text-surface-400' : 'text-surface-500'}`}>{label}</dt>
      <dd className={dark ? 'text-white' : 'text-surface-900'}>{value}</dd>
    </div>
  );
}

function PaymentInput({
  label,
  value,
  placeholder,
  disabled,
  error,
  inputMode = 'text',
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  disabled: boolean;
  error?: string;
  inputMode?: 'text' | 'email' | 'numeric';
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-surface-900">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-surface-200 bg-white px-4 py-4 text-sm font-bold text-surface-900 outline-none transition placeholder:text-surface-300 focus:border-cyan-300 disabled:bg-surface-100 disabled:text-surface-400"
      />
      {error && <span className="mt-2 block text-xs font-bold text-red-500">{error}</span>}
    </label>
  );
}

function validateForm(form: FormState): FormErrors {
  const nextErrors: FormErrors = {};
  const name = form.customerName.trim();
  const email = form.customerEmail.trim();
  const phone = form.customerPhone.trim();

  if (name.length < 2 || name.length > 40) {
    nextErrors.customerName = '주문자명은 2~40자로 입력해주세요.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    nextErrors.customerEmail = '올바른 이메일 형식으로 입력해주세요.';
  }
  if (!/^010-\d{4}-\d{4}$/.test(phone)) {
    nextErrors.customerPhone = '연락처는 010-0000-0000 형식으로 입력해주세요.';
  }

  return nextErrors;
}

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function resolveErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message?: unknown }).message ?? '').trim();
    if (message) {
      return message;
    }
  }
  return fallback;
}
