import { VaultFolder } from '@/types/vault';

/**
 * 뮤트 톤으로 큐레이션한 폴더 팔레트.
 * 명도를 비슷하게 맞춘 dusty 계열이라 흰 배경 위에서 서로 조화롭고,
 * 글로우·그라디언트(알파 suffix 결합)에서도 차분하게 빛난다.
 */
const CATEGORY_COLORS = [
  '#6E93C4', // dusty blue
  '#A38FC2', // soft mauve
  '#C48A96', // dusty rose
  '#8FAE8B', // sage
  '#C9A368', // warm amber
  '#6FA8A4', // slate teal
];

export function buildFolderColorMap(folders: VaultFolder[]): Record<string, string> {
  const map: Record<string, string> = {};
  const roots = folders.filter(folder => !folder.parent);

  roots.forEach((root, index) => {
    const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];

    const assignColor = (folder: VaultFolder) => {
      map[folder.id] = color;
      folder.children?.forEach(assignColor);
    };

    assignColor(root);
  });

  return map;
}

export function findFolderById(folders: VaultFolder[], id: string): VaultFolder | null {
  for (const folder of folders) {
    if (folder.id === id) {
      return folder;
    }

    if (!folder.children) {
      continue;
    }

    const found = findFolderById(folder.children, id);
    if (found) {
      return found;
    }
  }

  return null;
}

export function getSubfolderIds(folders: VaultFolder[], targetId: string): string[] {
  const ids: string[] = [];

  const collectIds = (folderList: VaultFolder[], inTarget: boolean) => {
    for (const folder of folderList) {
      const isTarget = folder.id === targetId || inTarget;
      if (isTarget) {
        ids.push(folder.id);
      }

      if (folder.children) {
        collectIds(folder.children, isTarget);
      }
    }
  };

  collectIds(folders, false);
  return ids;
}
