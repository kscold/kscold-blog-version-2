export type ToolbarButtonConfig = {
  label: string;
  title: string;
  active?: boolean;
  onClick: () => void;
  tone?: 'default' | 'accent';
};

export interface ToolbarActions {
  addLink: () => void;
  addVideo: () => void;
  addImage: () => void;
  addImageRow: () => void;
  setCodeBlockLanguage: () => void;
  setText: () => void;
  setBulletList: () => void;
  setOrderedList: () => void;
  setBlockquote: () => void;
}
