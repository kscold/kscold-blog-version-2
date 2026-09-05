export interface SettlementRecipientRow {
  key: string;
  name: string;
  phoneNumber: string;
}

export const PHONE_PATTERN = /^01[016789]-\d{3,4}-\d{4}$/;

export const createSettlementRecipientRow = (
  name = '',
  phoneNumber = ''
): SettlementRecipientRow => ({
  key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name,
  phoneNumber,
});

export const findValidSettlementRecipients = (rows: SettlementRecipientRow[]) =>
  rows.filter(row => row.name.trim().length > 0 && PHONE_PATTERN.test(row.phoneNumber));

export const findDuplicatedRecipientPhones = (rows: SettlementRecipientRow[]) => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  rows.forEach(row => {
    if (seen.has(row.phoneNumber)) duplicates.add(row.phoneNumber);
    seen.add(row.phoneNumber);
  });

  return duplicates;
};
