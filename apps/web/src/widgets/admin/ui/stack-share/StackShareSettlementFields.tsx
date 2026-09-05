import type { StackShareGroup } from '@/features/stack-share';
import { formatWon } from '@/features/stack-share';
import Input from '@/shared/ui/Input';

interface SettlementDetailsFieldsProps {
  toolName: string;
  billingPeriod: string;
  totalAmount: string;
  amount: number;
  dueDate: string;
  onToolNameChange: (value: string) => void;
  onBillingPeriodChange: (value: string) => void;
  onTotalAmountChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
}

function SettlementDetailsFields(props: SettlementDetailsFieldsProps) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <Input
        label="툴 또는 구독 이름"
        value={props.toolName}
        onChange={event => props.onToolNameChange(event.target.value)}
        placeholder="예: Claude Team"
      />
      <Input
        label="정산 기간"
        value={props.billingPeriod}
        onChange={event => props.onBillingPeriodChange(event.target.value)}
      />
      <Input
        label="총 결제 금액"
        inputMode="numeric"
        value={props.totalAmount}
        onChange={event => props.onTotalAmountChange(event.target.value.replace(/[^0-9]/g, ''))}
        helperText={props.amount ? formatWon(props.amount) : '원화 기준'}
      />
      <Input
        label="입금 기한"
        value={props.dueDate}
        onChange={event => props.onDueDateChange(event.target.value)}
        placeholder="예: 9월 5일"
        helperText="비우면 '협의'로 안내됩니다"
      />
    </div>
  );
}

interface OwnerSplitToggleProps {
  includeOwner: boolean;
  ownerName: string;
  recipientCount: number;
  shareCount: number;
  onChange: (value: boolean) => void;
}

function OwnerSplitToggle(props: OwnerSplitToggleProps) {
  const description = props.includeOwner
    ? `받는 사람 ${props.recipientCount}명 + 나 = ${props.shareCount}명으로 나눕니다. 나에게는 알림톡을 보내지 않습니다.`
    : `받는 사람 ${props.recipientCount}명끼리만 나눕니다. 내가 낸 몫은 계산하지 않습니다.`;

  return (
    <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-surface-200 bg-surface-50 p-4">
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 accent-surface-900"
        checked={props.includeOwner}
        onChange={event => props.onChange(event.target.checked)}
      />
      <span className="text-sm">
        <strong className="block font-bold text-surface-900">
          결제한 나({props.ownerName})도 인원에 넣고 나누기
        </strong>
        <span className="mt-1 block text-surface-500">{description}</span>
      </span>
    </label>
  );
}

interface SavedSettlementGroupsProps {
  groups: StackShareGroup[];
  onSelect: (groupId: string) => void;
}

function SavedSettlementGroups({ groups, onSelect }: SavedSettlementGroupsProps) {
  if (groups.length === 0) return null;

  return (
    <div className="mt-6">
      <p className="mb-2 text-sm font-bold text-surface-900">정산 그룹으로 채우기</p>
      <div className="flex flex-wrap gap-2">
        {groups.map(group => (
          <button
            key={group.id}
            type="button"
            onClick={() => onSelect(group.id)}
            className="rounded-full border border-surface-200 bg-white px-4 py-2 text-sm font-semibold text-surface-600 transition hover:border-surface-400"
          >
            {group.name}
            <span className="ml-1.5 text-xs text-surface-400">{group.participantIds.length}명</span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface StackShareSettlementFieldsProps extends SettlementDetailsFieldsProps {
  includeOwner: boolean;
  ownerName: string;
  recipientCount: number;
  shareCount: number;
  groups: StackShareGroup[];
  onIncludeOwnerChange: (value: boolean) => void;
  onGroupSelect: (groupId: string) => void;
}

export function StackShareSettlementFields(props: StackShareSettlementFieldsProps) {
  return (
    <>
      <SettlementDetailsFields {...props} />
      <OwnerSplitToggle
        includeOwner={props.includeOwner}
        ownerName={props.ownerName}
        recipientCount={props.recipientCount}
        shareCount={props.shareCount}
        onChange={props.onIncludeOwnerChange}
      />
      <SavedSettlementGroups groups={props.groups} onSelect={props.onGroupSelect} />
    </>
  );
}
