import type { StackShareParticipant } from '@/features/stack-share';
import { formatPhoneNumber } from '@/features/stack-share';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import { PHONE_PATTERN, type SettlementRecipientRow } from './stackShareSettlementRows';

interface RecipientInputRowProps {
  index: number;
  row: SettlementRecipientRow;
  duplicatedPhones: Set<string>;
  onUpdate: (key: string, patch: Partial<SettlementRecipientRow>) => void;
  onRemove: (key: string) => void;
}

function RecipientInputRow(props: RecipientInputRowProps) {
  const phoneFilled = props.row.phoneNumber.length > 0;
  const phoneValid = PHONE_PATTERN.test(props.row.phoneNumber);
  const duplicated = phoneValid && props.duplicatedPhones.has(props.row.phoneNumber);
  const phoneError = duplicated
    ? '이미 추가한 번호입니다'
    : phoneFilled && !phoneValid
      ? '휴대전화 번호 형식으로 입력해주세요'
      : undefined;

  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_1.3fr_auto] sm:items-start">
      <Input
        aria-label={`${props.index + 1}번째 받는 사람 이름`}
        value={props.row.name}
        onChange={event => props.onUpdate(props.row.key, { name: event.target.value })}
        placeholder="이름"
      />
      <Input
        aria-label={`${props.index + 1}번째 받는 사람 휴대전화`}
        inputMode="tel"
        value={props.row.phoneNumber}
        onChange={event =>
          props.onUpdate(props.row.key, { phoneNumber: formatPhoneNumber(event.target.value) })
        }
        placeholder="010-1234-5678"
        error={phoneError}
      />
      <Button
        size="sm"
        variant="minimal"
        aria-label={`${props.index + 1}번째 받는 사람 삭제`}
        onClick={() => props.onRemove(props.row.key)}
      >
        삭제
      </Button>
    </div>
  );
}

interface SavedParticipantButtonsProps {
  participants: StackShareParticipant[];
  rows: SettlementRecipientRow[];
  onAdd: (name: string, phoneNumber: string) => void;
}

function SavedParticipantButtons(props: SavedParticipantButtonsProps) {
  if (props.participants.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-bold text-surface-400">저장된 참여자에서 빠르게 추가</p>
      <div className="flex flex-wrap gap-2">
        {props.participants.map(participant => {
          const added = props.rows.some(
            row => row.phoneNumber === formatPhoneNumber(participant.phoneNumber)
          );
          return (
            <button
              key={participant.id}
              type="button"
              disabled={added}
              onClick={() => props.onAdd(participant.name, participant.phoneNumber)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                added
                  ? 'cursor-default border-surface-200 bg-surface-100 text-surface-400'
                  : 'border-surface-200 bg-white text-surface-600 hover:border-surface-400'
              }`}
            >
              {added ? `${participant.name} 추가됨` : `+ ${participant.name}`}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface StackShareRecipientEditorProps {
  rows: SettlementRecipientRow[];
  validCount: number;
  duplicatedPhones: Set<string>;
  participants: StackShareParticipant[];
  onAddRow: () => void;
  onUpdateRow: (key: string, patch: Partial<SettlementRecipientRow>) => void;
  onRemoveRow: (key: string) => void;
  onAddParticipant: (name: string, phoneNumber: string) => void;
}

export function StackShareRecipientEditor(props: StackShareRecipientEditorProps) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-surface-900">
          받는 사람 <span className="text-surface-400">({props.validCount}명)</span>
        </p>
        <Button size="sm" variant="minimal" onClick={props.onAddRow}>
          + 사람 추가
        </Button>
      </div>
      <div className="mt-3 space-y-2">
        {props.rows.map((row, index) => (
          <RecipientInputRow
            key={row.key}
            index={index}
            row={row}
            duplicatedPhones={props.duplicatedPhones}
            onUpdate={props.onUpdateRow}
            onRemove={props.onRemoveRow}
          />
        ))}
      </div>
      <SavedParticipantButtons
        participants={props.participants}
        rows={props.rows}
        onAdd={props.onAddParticipant}
      />
    </div>
  );
}
