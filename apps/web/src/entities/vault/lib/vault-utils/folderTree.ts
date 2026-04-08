import { VaultFolder } from '@/types/vault';

const CATEGORY_COLORS = [
  '#64C8FF',
  '#A855F7',
  '#F43F5E',
  '#10B981',
  '#F59E0B',
  '#3B82F6',
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
