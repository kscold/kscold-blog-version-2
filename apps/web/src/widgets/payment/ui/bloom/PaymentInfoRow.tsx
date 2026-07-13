export function PaymentInfoRow({
  label,
  value,
  dark = false,
}: {
  label: string;
  value: string;
  dark?: boolean;
}) {
  return (
    <div className={`flex gap-4 border-b pb-3 last:border-b-0 last:pb-0 ${dark ? 'border-white/10' : 'border-surface-200'}`}>
      <dt className={`w-28 shrink-0 font-black ${dark ? 'text-surface-400' : 'text-surface-500'}`}>{label}</dt>
      <dd className={dark ? 'text-white' : 'text-surface-900'}>{value}</dd>
    </div>
  );
}
