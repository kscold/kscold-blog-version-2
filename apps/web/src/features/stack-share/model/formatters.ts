export const formatWon = (amount: number): string =>
  `${amount.toLocaleString('ko-KR')}원`;

export const parseAmount = (value: string): number =>
  Number(value.replace(/[^0-9]/g, '')) || 0;

export const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/[^0-9]/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};
