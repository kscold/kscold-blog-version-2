'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useViewer } from '@/entities/user';
import { kakaoPayLiveTestApi, type AiAgentBloomPaymentConfig } from '@/features/payment';
import {
  initialForm,
  type FormErrors,
  type FormState,
} from '@/widgets/payment/lib/aiAgentBloomPaymentContent';
import {
  formatPhoneNumber,
  resolveErrorMessage,
  validateForm,
} from '@/widgets/payment/lib/aiAgentBloomPaymentForm';
import { requestPortOnePayment } from '@/widgets/payment/lib/requestPortOnePayment';

export function useKakaoPayLiveTest() {
  const { user, role } = useViewer();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [config, setConfig] = useState<AiAgentBloomPaymentConfig | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const handledPaymentId = useRef<string | null>(null);
  const isAdmin = role === 'ADMIN';
  const formattedAmount = useMemo(
    () => (config?.totalAmount ?? 1_000).toLocaleString('ko-KR'),
    [config?.totalAmount]
  );

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    kakaoPayLiveTestApi
      .getConfig()
      .then(setConfig)
      .catch(error => setStatus(resolveErrorMessage(error, '실결제 설정을 불러오지 못했습니다.')));
  }, [isAdmin]);

  useEffect(() => {
    if (!user) {
      return;
    }
    setForm(previous => ({
      customerName: previous.customerName || user.displayName || user.username || '',
      customerEmail: previous.customerEmail || user.email || '',
      customerPhone: previous.customerPhone,
    }));
  }, [user]);

  const completePayment = useCallback(async (paymentId: string) => {
    setIsProcessing(true);
    setStatus('포트원에서 실결제 승인 결과를 확인하고 있습니다.');
    try {
      const completed = await kakaoPayLiveTestApi.complete(paymentId);
      setStatus(`${completed.message} 포트원 관리자에서 결제 취소까지 확인해주세요.`);
    } catch (error) {
      setStatus(resolveErrorMessage(error, '실결제 결과를 확인하지 못했습니다.'));
    } finally {
      setIsProcessing(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    const searchParams = new URLSearchParams(window.location.search);
    const paymentId = searchParams.get('paymentId');
    const code = searchParams.get('code');
    if (code) {
      setStatus(searchParams.get('message') || '결제가 완료되지 않았습니다.');
      return;
    }
    if (!paymentId || handledPaymentId.current === paymentId) {
      return;
    }
    handledPaymentId.current = paymentId;
    completePayment(paymentId);
  }, [completePayment, isAdmin]);

  const updateField = (field: keyof FormState, value: string) => {
    const nextValue = field === 'customerPhone' ? formatPhoneNumber(value) : value;
    setForm(previous => ({ ...previous, [field]: nextValue }));
    setErrors(previous => ({ ...previous, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus('주문자 정보를 확인해주세요.');
      return;
    }
    if (!isAdmin || !config?.configured || !config.livePayment) {
      setStatus('관리자 실결제 채널이 활성화되지 않았습니다.');
      return;
    }

    setIsProcessing(true);
    setStatus('실제 1,000원 카카오페이 결제창을 준비하고 있습니다.');
    try {
      const prepared = await kakaoPayLiveTestApi.prepare({
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        customerPhone: form.customerPhone.trim(),
      });
      const response = await requestPortOnePayment(prepared);
      if (!response) {
        setStatus('결제창이 닫혔습니다. 실제 승인은 발생하지 않았습니다.');
      } else if (response.code) {
        setStatus(response.message || `결제가 완료되지 않았습니다. (${response.code})`);
      } else {
        await completePayment(response.paymentId);
      }
    } catch (error) {
      setStatus(resolveErrorMessage(error, '실결제 처리 중 오류가 발생했습니다.'));
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    form,
    errors,
    config,
    status,
    isProcessing,
    isAdmin,
    formattedAmount,
    updateField,
    handleSubmit,
  };
}
