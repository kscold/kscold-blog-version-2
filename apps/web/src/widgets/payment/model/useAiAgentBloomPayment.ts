'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useViewer } from '@/entities/user/model/useViewer';
import {
  aiAgentBloomPaymentApi,
  type AiAgentBloomPaymentConfig,
} from '@/features/payment/api/aiAgentBloomPayment';
import {
  ORDER_NAME,
  PAYMENT_PATH,
  PRODUCT_NAME,
  TOTAL_AMOUNT,
  initialForm,
  type FormErrors,
  type FormState,
} from '@/widgets/payment/lib/aiAgentBloomPaymentContent';
import {
  formatPhoneNumber,
  resolveErrorMessage,
  validateForm,
} from '@/widgets/payment/lib/aiAgentBloomPaymentForm';
import { requestKakaoPay } from '@/widgets/payment/lib/requestKakaoPay';

export function useAiAgentBloomPayment() {
  const { user, isAuthenticated } = useViewer();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [config, setConfig] = useState<AiAgentBloomPaymentConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentAccessToken, setPaymentAccessToken] = useState<string | undefined>();
  const [isPreparing, setIsPreparing] = useState(false);
  const handledRedirectPaymentId = useRef<string | null>(null);
  const canPay = isAuthenticated || !!paymentAccessToken;
  const paymentPathWithToken = paymentAccessToken
    ? `${PAYMENT_PATH}?token=${encodeURIComponent(paymentAccessToken)}`
    : PAYMENT_PATH;
  const loginPath = `/login?redirect=${encodeURIComponent(paymentPathWithToken)}`;

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
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token')?.trim();
    if (token) {
      setPaymentAccessToken(token);
    }
  }, []);

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

  const completePayment = useCallback(async (paymentId: string) => {
    try {
      setIsPreparing(true);
      setPaymentStatus('결제 결과를 확인하고 있습니다.');
      const completed = await aiAgentBloomPaymentApi.complete(paymentId, paymentAccessToken);
      setPaymentStatus(completed.message || '결제가 확인되었습니다.');
    } catch (error) {
      setPaymentStatus(resolveErrorMessage(error, '결제 결과 확인 중 오류가 발생했습니다.'));
    } finally {
      setIsPreparing(false);
    }
  }, [paymentAccessToken]);

  useEffect(() => {
    if (!canPay) {
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
  }, [canPay, completePayment]);

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
    if (!canPay) {
      window.location.href = loginPath;
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
        paymentAccessToken,
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

  return {
    form,
    errors,
    config,
    paymentStatus,
    paymentAccessToken,
    isPreparing,
    canPay,
    loginPath,
    displayConfig,
    formattedAmount,
    updateField,
    handleSubmit,
  };
}
