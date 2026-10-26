interface Props { message: string; onRetry?: () => void }

export function ChatNotice({ message, onRetry }: Props) {
  return (
    <div className="shrink-0 border-t border-surface-200 bg-primary-50 px-4 py-2 text-xs leading-5 text-surface-700">
      <p role="status">{message}</p>
      {onRetry && <button type="button" onClick={onRetry} className="mt-1 min-h-9 font-bold text-primary-700 underline underline-offset-4">대화 기록 다시 불러오기</button>}
    </div>
  );
}
