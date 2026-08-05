'use client';

import { useState } from 'react';
import {
  type AlimtalkTemplate,
  type AlimtalkTemplateStatus,
  useNotificationTemplates,
  useUpdateNotificationTemplate,
} from '@/features/notification-template';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import { useAlert } from '@/shared/model/alertStore';

const STATUS_OPTIONS: Array<{ value: AlimtalkTemplateStatus; label: string }> = [
  { value: 'DRAFT', label: '초안' },
  { value: 'SUBMITTED', label: '심사 중' },
  { value: 'APPROVED', label: '승인 완료' },
  { value: 'REJECTED', label: '반려' },
  { value: 'INACTIVE', label: '사용 중지' },
];

function TemplateCard({ template }: { template: AlimtalkTemplate }) {
  const alerts = useAlert();
  const updateTemplate = useUpdateNotificationTemplate();
  const [externalTemplateId, setExternalTemplateId] = useState(template.externalTemplateId ?? '');
  const [status, setStatus] = useState<AlimtalkTemplateStatus>(template.status);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(template.body);
    alerts.success(`${template.name} 문구를 복사했습니다.`);
  };

  const handleSave = async () => {
    await updateTemplate.mutateAsync({
      templateKey: template.templateKey,
      input: { externalTemplateId, status },
    });
    alerts.success('SOLAPI 템플릿 상태를 저장했습니다.');
  };

  return (
    <article className="rounded-2xl border border-surface-200 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-surface-900">{template.name}</h3>
          <p className="mt-1 text-sm text-surface-500">{template.purpose}</p>
        </div>
        <Button size="sm" variant="ghost" onClick={handleCopy}>문구 복사</Button>
      </div>
      <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl bg-surface-900 p-4 text-xs leading-6 text-surface-100">
        {template.body}
      </pre>
      <div className="mt-3 flex flex-wrap gap-2">
        {template.variables.map(variable => (
          <span key={variable} className="rounded-full bg-surface-100 px-3 py-1 text-xs text-surface-500">
            {variable}
          </span>
        ))}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_160px_auto] sm:items-end">
        <Input
          label="SOLAPI 승인 템플릿 ID"
          value={externalTemplateId}
          onChange={event => setExternalTemplateId(event.target.value)}
          placeholder="심사 승인 후 입력"
        />
        <label className="block text-sm font-medium text-surface-900">
          상태
          <select value={status} onChange={event => setStatus(event.target.value as AlimtalkTemplateStatus)} className="mt-2 h-12 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm outline-none focus:border-surface-900">
            {STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <Button isLoading={updateTemplate.isPending} onClick={handleSave}>저장</Button>
      </div>
    </article>
  );
}

export function AlimtalkTemplateManager() {
  const templates = useNotificationTemplates();
  return (
    <section className="rounded-3xl border border-surface-200 bg-white p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-surface-400">KSCOLD messages</p>
      <h2 className="mt-3 text-2xl font-black text-surface-900">알림톡 템플릿 관리</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-surface-500">
        문구를 SOLAPI에 등록하고 심사가 끝나면 승인 템플릿 ID와 상태를 저장하세요. 승인된 정산 템플릿만 실제 발송에 사용됩니다.
      </p>
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {templates.data?.map(template => <TemplateCard key={template.templateKey} template={template} />)}
      </div>
    </section>
  );
}
