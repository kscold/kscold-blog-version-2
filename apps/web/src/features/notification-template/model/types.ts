export type AlimtalkTemplateStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'INACTIVE';

export interface AlimtalkTemplate {
  templateKey: string;
  name: string;
  purpose: string;
  body: string;
  variables: string[];
  externalTemplateId?: string;
  status: AlimtalkTemplateStatus;
  updatedAt?: string;
}

export interface AlimtalkTemplateUpdate {
  externalTemplateId: string;
  status: AlimtalkTemplateStatus;
}
