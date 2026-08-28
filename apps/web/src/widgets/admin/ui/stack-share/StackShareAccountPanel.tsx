'use client';

import { useEffect, useState } from 'react';
import {
  BANK_OPTIONS,
  formatPhoneNumber,
  useSaveStackShareAccount,
  useStackShareAccount,
} from '@/features/stack-share';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import { useAlert } from '@/shared/model/alertStore';

/**
 * 정산 알림톡에 실려 나갈 입금 계좌를 관리한다. 이 계좌가 없으면 서버가 발송을 거부하므로,
 * 미등록 상태를 눈에 띄게 알려준다.
 */
export function StackShareAccountPanel() {
  const alerts = useAlert();
  const account = useStackShareAccount();
  const saveAccount = useSaveStackShareAccount();

  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // 서버 값이 도착하면 입력창을 채운다. 사용자가 편집 중인 값을 덮지 않도록 최초 로드에만 반응한다.
  useEffect(() => {
    if (!account.data) return;
    setBankName(account.data.bankName ?? '');
    setAccountNumber(account.data.accountNumber ?? '');
    setAccountHolder(account.data.accountHolder ?? '');
    setContactPhone(formatPhoneNumber(account.data.contactPhone ?? ''));
  }, [account.data]);

  // 서버가 휴대전화 형식을 요구하므로 저장 전에 자릿수를 확인한다.
  const phoneDigits = contactPhone.replace(/[^0-9]/g, '');
  const phoneValid = /^01[016789]\d{7,8}$/.test(phoneDigits);

  const canSave =
    bankName.trim().length > 0 &&
    accountNumber.trim().length > 0 &&
    accountHolder.trim().length > 0 &&
    phoneValid;

  const preview =
    bankName.trim() && accountNumber.trim() && accountHolder.trim()
      ? `${bankName.trim()} ${accountNumber.trim()} (${accountHolder.trim()})`
      : '';

  const handleSave = async () => {
    if (!canSave) return;
    try {
      await saveAccount.mutateAsync({
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim(),
        contactPhone: phoneDigits,
      });
      alerts.success('입금 계좌를 저장했습니다.');
    } catch (error) {
      alerts.error(error instanceof Error ? error.message : '입금 계좌를 저장하지 못했습니다.');
    }
  };

  return (
    <section className="rounded-3xl border border-surface-200 bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-surface-400">
            Deposit account
          </p>
          <h2 className="mt-3 text-2xl font-black text-surface-900">입금 계좌</h2>
          <p className="mt-2 text-sm text-surface-500">
            정산 알림톡에 이 계좌가 그대로 나갑니다. 등록 전에는 알림톡을 보낼 수 없습니다.
          </p>
        </div>
        <span
          className={`inline-flex rounded-full px-4 py-2 text-xs font-black ${
            account.data?.configured
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {account.data?.configured ? '등록됨' : '미등록'}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="은행명"
          list="stack-share-bank-options"
          value={bankName}
          onChange={event => setBankName(event.target.value)}
          placeholder="예: 토스뱅크"
          helperText="목록에 없으면 직접 입력"
        />
        <datalist id="stack-share-bank-options">
          {BANK_OPTIONS.map(bank => (
            <option key={bank} value={bank} />
          ))}
        </datalist>
        <Input
          label="계좌번호"
          value={accountNumber}
          onChange={event => setAccountNumber(event.target.value)}
          placeholder="예: 1000-1234-5678"
        />
        <Input
          label="예금주"
          value={accountHolder}
          onChange={event => setAccountHolder(event.target.value)}
          placeholder="예: 김승찬"
        />
        <Input
          label="문의 연락처"
          inputMode="numeric"
          value={contactPhone}
          onChange={event => setContactPhone(formatPhoneNumber(event.target.value))}
          placeholder="010-1234-5678"
          helperText={
            contactPhone.length > 0 && !phoneValid
              ? '휴대전화 번호 형식으로 입력해주세요'
              : '알림톡에 문의처로 함께 안내됩니다'
          }
        />
      </div>

      {preview && (
        <div className="mt-4 space-y-1 rounded-2xl bg-surface-50 px-4 py-3 text-sm text-surface-600">
          <p>
            입금 계좌 표기: <strong className="text-surface-900">{preview}</strong>
          </p>
          {phoneValid && (
            <p>
              문의 연락처 표기: <strong className="text-surface-900">{contactPhone}</strong>
            </p>
          )}
        </div>
      )}

      <Button
        className="mt-6"
        disabled={!canSave}
        isLoading={saveAccount.isPending}
        onClick={handleSave}
      >
        입금 계좌 저장
      </Button>
    </section>
  );
}
