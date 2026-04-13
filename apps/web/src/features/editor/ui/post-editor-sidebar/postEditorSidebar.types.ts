import type { PostFormData } from '@/features/editor/model/types';

export interface PostEditorCategoryOption {
  id: string;
  name: string;
  depth: number;
  icon?: string;
  restricted?: boolean;
}

export interface PostEditorSidebarProps {
  mode: 'create' | 'edit';
  form: PostFormData;
  categories: PostEditorCategoryOption[] | undefined;
  isSubmitting: boolean;
  lastSavedText: string | null;
  onUpdateForm: <K extends keyof PostFormData>(key: K, value: PostFormData[K]) => void;
}
