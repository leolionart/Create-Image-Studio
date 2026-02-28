
export interface Template {
  id: number;
  title: string;
  author: string;
  category: string;
  inputImages: string[];
  outputImage: string;
  prompt: string;
  inputsNeeded: number;
  note?: string;
  source?: 'built-in' | 'custom';
}

// Backward compatibility alias
export type Case = Template;

export interface TemplateStats {
  copies: number;
  tries: number;
}

export type SortOption = 'newest' | 'popular' | 'most-copied' | 'most-tried';

export interface TemplateListResponse {
  templates: Template[];
  categories: string[];
  stats: Record<string, TemplateStats>;
}
