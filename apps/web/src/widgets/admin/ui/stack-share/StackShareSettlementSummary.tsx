import type { SplitResult } from '@/features/stack-share';
import { formatWon } from '@/features/stack-share';
import Button from '@/shared/ui/Button';
import type { SettlementRecipientRow } from './stackShareSettlementRows';

interface SettlementShareRowsProps {
  split: SplitResult;
  recipients: SettlementRecipientRow[];
  includeOwner: boolean;
  ownerName: string;
}

function SettlementShareRows(props: SettlementShareRowsProps) {
  return (
    <div className="min-h-56 space-y-2 py-5">
      {props.includeOwner && props.split.ownerAmount > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm">
          <span>
            {props.ownerName} <span className="text-surface-400">(나 · 발송 안 함)</span>
          </span>
          <strong>{formatWon(props.split.ownerAmount)}</strong>
        </div>
      )}
      {props.recipients.map((row, index) => (
        <div
          key={row.key}
          className="flex justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm"
        >
          <span>{row.name.trim()}</span>
          <strong>{formatWon(props.split.receiverAmounts[index] ?? 0)}</strong>
        </div>
      ))}
      {props.recipients.length === 0 && (
        <p className="py-16 text-center text-sm text-surface-400">
          받는 사람의 이름과 휴대전화를 입력해주세요.
        </p>
      )}
    </div>
  );
}

interface SettlementAccountInfoProps {
  accountReady: boolean;
  displayText?: string;
  contactText?: string;
  dueDate: string;
}

function SettlementAccountInfo(props: SettlementAccountInfoProps) {
  return (
    <div className="mb-4 rounded-2xl bg-white/5 px-4 py-3 text-xs">
      <p className="text-surface-400">받는 사람에게 안내될 입금 계좌</p>
      {props.accountReady ? (
        <p className="mt-1 font-bold text-white">{props.displayText}</p>
      ) : (
        <p className="mt-1 font-bold text-amber-300">
          입금 계좌를 먼저 등록해주세요. 등록 전에는 발송할 수 없습니다.
        </p>
      )}
      {props.accountReady && props.contactText && (
        <p className="mt-1 text-surface-300">문의: {props.contactText}</p>
      )}
      <p className="mt-2 text-surface-400">입금 기한: {props.dueDate.trim() || '협의'}</p>
    </div>
  );
}

interface StackShareSettlementSummaryProps extends SettlementAccountInfoProps {
  split: SplitResult;
  recipients: SettlementRecipientRow[];
  includeOwner: boolean;
  ownerName: string;
  canSend: boolean;
  isSending: boolean;
  onSend: () => void;
}

export function StackShareSettlementSummary(props: StackShareSettlementSummaryProps) {
  const buttonLabel =
    props.recipients.length > 0
      ? `${props.recipients.length}명에게 정산 요청 보내기`
      : '정산 저장하고 알림톡 보내기';

  return (
    <div className="bg-surface-900 p-6 text-white sm:p-8">
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <h3 className="text-xl font-black">분담 결과</h3>
        <span className="text-xs text-surface-400">
          {props.split.shareCount > 0 ? `${props.split.shareCount}명으로 나눔` : '인원 미정'}
        </span>
      </div>
      <SettlementShareRows
        split={props.split}
        recipients={props.recipients}
        includeOwner={props.includeOwner}
        ownerName={props.ownerName}
      />
      <SettlementAccountInfo
        accountReady={props.accountReady}
        displayText={props.displayText}
        contactText={props.contactText}
        dueDate={props.dueDate}
      />
      <Button
        variant="secondary"
        className="w-full"
        disabled={!props.canSend}
        isLoading={props.isSending}
        onClick={props.onSend}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
