'use client';

import type { AlimtalkTemplate } from '@/features/notification-template';
import { useAlert } from '@/shared/model/alertStore';
import Button from '@/shared/ui/Button';
import {
  createSettlementRegistrationText,
  createSettlementSampleBody,
  createSettlementVariableText,
  SETTLEMENT_REGISTRATION_STEPS,
  SETTLEMENT_REVIEW_COMMENT,
  SETTLEMENT_VARIABLE_GUIDES,
} from './alimtalkSettlementGuide';

interface AlimtalkSettlementInspectionGuideProps {
  template: AlimtalkTemplate;
}

type CopyTarget = 'registration' | 'template' | 'variables' | 'review';

const COPY_LABELS: Record<CopyTarget, string> = {
  registration: '전체 등록 정보',
  template: '템플릿 문구',
  variables: '변수 예시',
  review: '검수 의견',
};

export function AlimtalkSettlementInspectionGuide({
  template,
}: AlimtalkSettlementInspectionGuideProps) {
  const alerts = useAlert();
  const sampleBody = createSettlementSampleBody(template);

  const handleCopy = async (target: CopyTarget) => {
    const copyText = {
      registration: createSettlementRegistrationText(template),
      template: template.body,
      variables: createSettlementVariableText(),
      review: SETTLEMENT_REVIEW_COMMENT,
    }[target];
    try {
      await navigator.clipboard.writeText(copyText);
      alerts.success(`${COPY_LABELS[target]}를 복사했습니다.`);
    } catch {
      alerts.error('클립보드에 복사하지 못했습니다. 브라우저 권한을 확인해주세요.');
    }
  };

  return (
    <section className="mt-5 rounded-2xl border border-primary-100 bg-primary-50/40 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600">
            SOLAPI inspection kit
          </p>
          <h4 className="mt-2 text-lg font-black text-surface-900">정산 알림톡 심사 등록 패키지</h4>
          <p className="mt-2 text-sm leading-6 text-surface-600">
            강조표기형·정보성·버튼 없음으로 등록합니다. 아래 값은 카카오 승인본과 일치하므로 임의로
            바꾸지 마세요.
          </p>
        </div>
        <span className="rounded-full border border-primary-200 bg-white px-3 py-1 text-xs font-bold text-primary-700">
          변수 9개
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => handleCopy('registration')}>
          전체 등록 정보 복사
        </Button>
        <Button size="sm" variant="secondary" onClick={() => handleCopy('template')}>
          본문만 복사
        </Button>
        <Button size="sm" variant="secondary" onClick={() => handleCopy('variables')}>
          변수 예시 복사
        </Button>
        <Button size="sm" variant="secondary" onClick={() => handleCopy('review')}>
          검수 의견 복사
        </Button>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {[
          ['템플릿 이름', template.name],
          ['강조표기 제목', template.emphasisTitle],
          ['강조표기 보조문구', template.emphasisSubtitle],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-surface-200 bg-white p-4">
            <p className="text-xs font-bold text-surface-400">{label}</p>
            <p className="mt-2 text-sm font-bold leading-6 text-surface-900">
              {value || 'DB에 등록되지 않음'}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-2xl border border-surface-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-surface-400">
            수신 화면 예시
          </p>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-surface-800">
            {sampleBody}
          </pre>
        </div>

        <div className="rounded-2xl border border-surface-200 bg-white p-4">
          <h5 className="text-sm font-black text-surface-900">변수 예시와 입력 형식</h5>
          <div className="mt-3 divide-y divide-surface-100">
            {SETTLEMENT_VARIABLE_GUIDES.map(guide => (
              <div key={guide.variable} className="grid gap-1 py-3 sm:grid-cols-[110px_1fr]">
                <code className="text-xs font-bold text-primary-700">{guide.variable}</code>
                <div>
                  <p className="text-sm font-semibold text-surface-800">{guide.example}</p>
                  <p className="mt-1 text-xs leading-5 text-surface-500">{guide.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-surface-200 bg-white p-4">
          <h5 className="text-sm font-black text-surface-900">심사 등록 순서</h5>
          <ol className="mt-3 space-y-3">
            {SETTLEMENT_REGISTRATION_STEPS.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-6 text-surface-600">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-900 text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border border-surface-200 bg-white p-4">
          <h5 className="text-sm font-black text-surface-900">심사 검수 의견</h5>
          <p className="mt-3 text-sm leading-6 text-surface-600">{SETTLEMENT_REVIEW_COMMENT}</p>
          <div className="mt-4 rounded-xl bg-surface-50 p-3 text-xs leading-5 text-surface-600">
            이름·정산기간·서비스명도 본문 첫 문장에 넣어야 SOLAPI가 변수 9개를 모두 인식합니다.
            금액에는 원 단위를 포함하고 참여 인원은 숫자만 전달합니다.
          </div>
        </div>
      </div>
    </section>
  );
}
