export type AdminDocumentCategory = 'RESUME' | 'CAREER' | 'STORY' | 'PERSONAL' | 'OTHER';

export type AdminDocumentSpace = 'all' | 'resumes' | 'sources' | 'stories';

export interface AdminDocumentSpaceDetails {
  id: AdminDocumentSpace;
  href: string;
  title: string;
  navigationLabel: string;
  description: string;
  listHeading: string;
  uploadHeading: string;
  uploadGuide: string;
  descriptionPlaceholder: string;
  fixedCategory?: AdminDocumentCategory;
}

export interface AdminDocument {
  id: string;
  title: string;
  fileName: string;
  category: AdminDocumentCategory;
  description: string;
  size: number;
  contentType: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDocumentPage {
  content: AdminDocument[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AdminDocumentDetails {
  title: string;
  description: string;
  category: AdminDocumentCategory;
}

export interface AdminDocumentFilter {
  category: AdminDocumentCategory | '';
  query: string;
  page: number;
}

export interface DocumentUploadItem {
  id: string;
  file: File;
  status: 'queued' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}
