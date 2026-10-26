import type { Category } from '@/shared/model/types/blog';
import type { PublicationChoice, PublicationState } from '@/entities/post';
import type { PostFormData } from '../../model/types';

export interface PostEditorSidebarProps {
  mode: 'create' | 'edit';
  form: PostFormData;
  categories: Category[] | undefined;
  category?: Category;
  state: PublicationState;
  needsReview: boolean;
  publicationError: string | null;
  isSubmitting: boolean;
  lastSavedText: string | null;
  submitLabel: string;
  onSelect: (choice: PublicationChoice) => void;
  onCategoryChange: (id: string) => void;
  onUpdateForm: <K extends keyof PostFormData>(key: K, value: PostFormData[K]) => void;
}
