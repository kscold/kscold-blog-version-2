export interface AdminStorageFolder {
  name: string;
  key: string;
}

export interface AdminStorageObject {
  name: string;
  key: string;
  size: number;
  lastModified: string | null;
  isImage: boolean;
  publicUrl: string | null;
}

export interface AdminStorageListing {
  bucket: string;
  currentPrefix: string;
  parentPrefix: string | null;
  folders: AdminStorageFolder[];
  objects: AdminStorageObject[];
  deletedKeys?: number;
  message?: string;
}

export function formatStorageBytes(value: number) {
  if (value < 1024) return `${value} B`;

  const units = ['KB', 'MB', 'GB', 'TB'];
  let amount = value / 1024;
  let unitIndex = 0;

  while (amount >= 1024 && unitIndex < units.length - 1) {
    amount /= 1024;
    unitIndex += 1;
  }

  return `${amount.toFixed(amount >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formatStorageTime(value: string | null) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function storageBreadcrumbs(prefix: string) {
  const segments = prefix.replace(/\/$/, '').split('/').filter(Boolean);
  const items = [{ label: 'blog', prefix: '' }];

  let current = '';
  for (const segment of segments) {
    current = `${current}${segment}/`;
    items.push({
      label: segment,
      prefix: current,
    });
  }

  return items;
}
