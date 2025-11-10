export interface Content {
  id: number;
  title: string;
  body: string;
  summary?: string;
  type: ContentType;
  status: ContentStatus;
  authorId: number;
  authorUsername: string;
  kierunekId?: number;
  kierunekName?: string;
  categoryId?: number;
  categoryName?: string;
  tags?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export enum ContentType {
  GUIDE = 'GUIDE',
  TUTORIAL = 'TUTORIAL',
  FAQ = 'FAQ',
  NEWS = 'NEWS',
  ANNOUNCEMENT = 'ANNOUNCEMENT'
}

export enum ContentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export interface ContentRequest {
  title: string;
  body: string;
  summary?: string;
  type: ContentType;
  tags?: string;
  kierunekId?: number;
  categoryId?: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}
