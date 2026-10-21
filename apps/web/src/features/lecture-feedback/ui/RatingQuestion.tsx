interface RatingQuestionProps {
  question: { key: string; title: string };
  value?: number;
  onChange: (value: number) => void;
}

const LABELS = ['전혀 그렇지 않다', '그렇지 않다', '보통이다', '그렇다', '매우 그렇다'];

export function RatingQuestion({ question, value, onChange }: RatingQuestionProps) {
  return (
    <fieldset className="rounded-2xl border border-surface-200 bg-white p-5 sm:p-7">
      <legend className="sr-only">{question.title}</legend>
      <p className="mb-5 break-keep font-bold leading-7 text-surface-900" aria-hidden>
        {question.title} <span className="text-primary-700">*</span>
      </p>
      <div className="grid grid-cols-5 gap-2">
        {LABELS.map((label, index) => (
          <label key={label} className="cursor-pointer">
            <input type="radio" name={question.key} value={index + 1}
              checked={value === index + 1} onChange={() => onChange(index + 1)}
              aria-label={`${index + 1}점 · ${label}`} required className="peer sr-only" />
            <span className="flex min-h-14 items-center justify-center rounded-xl border border-surface-200 bg-surface-50 text-xl font-bold text-surface-600 transition-colors hover:border-primary-400 peer-checked:border-primary-700 peer-checked:bg-primary-700 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2">
              {index + 1}
            </span>
          </label>
        ))}
      </div>
      <div className="mt-3 flex justify-between text-xs text-surface-500">
        <span>전혀 그렇지 않다</span><span>매우 그렇다</span>
      </div>
    </fieldset>
  );
}
