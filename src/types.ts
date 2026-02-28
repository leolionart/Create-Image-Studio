
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

export interface TemplateListResponse {
  templates: Template[];
  categories: string[];
}
