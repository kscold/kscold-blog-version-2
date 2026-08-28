'use client';

import { useEffect, useState } from 'react';
import { useSaveStackShareAccount, useStackShareAccount } from '@/features/stack-share';
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

  // 서버 값이 도착하면 입력창을 채운다. 사용자가 편집 중인 값을 덮지 않도록 최초 로드에만 반응한다.
  useEffect(() => {
    if (!account.data) return;
    setBankName(account.data.bankName ?? '');
    setAccountNumber(account.data.accountNumber ?? '');
    setAccountHolder(account.data.accountHolder ?? '');
  }, [account.data]);

  const canSave =
    bankName.trim().length > 0 &&
    accountNumber.trim().length > 0 &&
    accountHolder.trim().length > 0;

  const preview = canSave
    ? `${bankName.trim()} ${accountNumber.trim()} (${accountHolder.trim()})`
    : '';

  const handleSave = async () => {
    if (!canSave) return;
    try {
      await saveAccount.mutateAsync({
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim(),
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

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Input
          label="은행명"
          value={bankName}
          onChange={event => setBankName(event.target.value)}
          placeholder="예: 카카오뱅크"
        />
        <Input
          label="계좌번호"
          value={accountNumber}
          onChange={event => setAccountNumber(event.target.value)}
          placeholder="예: 3333-01-1234567"
        />
        <Input
          label="예금주"
          value={accountHolder}
          onChange={event => setAccountHolder(event.target.value)}
          placeholder="예: 김승찬"
        />
      </div>

      {preview && (
        <p className="mt-4 rounded-2xl bg-surface-50 px-4 py-3 text-sm text-surface-600">
          알림톡 표기 미리보기: <strong className="text-surface-900">{preview}</strong>
        </p>
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
