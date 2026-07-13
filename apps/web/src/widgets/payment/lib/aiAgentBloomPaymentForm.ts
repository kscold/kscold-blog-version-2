import type { FormErrors, FormState } from './aiAgentBloomPaymentContent';

export function validateForm(form: FormState): FormErrors {
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

export function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function resolveErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message?: unknown }).message ?? '').trim();
    if (message) {
      return message;
    }
  }
  return fallback;
}
