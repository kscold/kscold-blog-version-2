export function PaymentInput({
  label,
  value,
  placeholder,
  disabled,
  error,
  inputMode = 'text',
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  disabled: boolean;
  error?: string;
  inputMode?: 'text' | 'email' | 'numeric';
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-surface-900">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-surface-200 bg-white px-4 py-4 text-sm font-bold text-surface-900 outline-none transition placeholder:text-surface-300 focus:border-cyan-300 disabled:bg-surface-100 disabled:text-surface-400"
      />
      {error && <span className="mt-2 block text-xs font-bold text-red-500">{error}</span>}
    </label>
  );
}
