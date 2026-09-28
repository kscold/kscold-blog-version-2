'use client';

import { useState, type FormEvent } from 'react';
import Button from '@/shared/ui/Button';

export interface PdfPasswordRequest {
  onPassword: (password: string) => void;
  isIncorrect: boolean;
}

function PdfPasswordIntroduction({ isIncorrect }: { isIncorrect: boolean }) {
  return (
    <>
      <h2 className="text-base font-bold text-surface-900">암호가 설정된 PDF입니다</h2>
      <p className="text-sm leading-6 text-surface-500">
        문서 암호는 현재 화면에서만 사용하고 저장하지 않습니다.
      </p>
      {isIncorrect && (
        <p role="alert" className="text-sm text-red-600">
          암호가 맞지 않습니다. 다시 입력해 주세요.
        </p>
      )}
    </>
  );
}

export function PdfPasswordForm({ request }: { request: PdfPasswordRequest }) {
  const [password, setPassword] = useState('');
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!password) return;
    request.onPassword(password);
    setPassword('');
  }
  return (
    <form
      onSubmit={submit}
      className="mx-auto w-full max-w-sm space-y-4 rounded-2xl border border-surface-200 bg-white p-6"
    >
      <PdfPasswordIntroduction isIncorrect={request.isIncorrect} />
      <label className="block text-sm text-surface-700">
        PDF 암호
        <input
          autoFocus
          type="password"
          autoComplete="off"
          value={password}
          onChange={event => setPassword(event.target.value)}
          aria-label="PDF 암호"
          data-cy="pdf-viewer-password"
          className="mt-2 h-11 w-full rounded-lg border border-surface-200 px-3 focus:outline-none focus:ring-2 focus:ring-surface-900"
        />
      </label>
      <Button
        type="submit"
        className="w-full"
        disabled={!password}
        data-cy="pdf-viewer-password-submit"
      >
        PDF 열기
      </Button>
    </form>
  );
}
