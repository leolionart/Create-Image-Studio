import { Template, TemplateListResponse, TemplateStats } from '../types';

export async function fetchTemplates(): Promise<TemplateListResponse> {
  const response = await fetch('/api/templates');
  if (!response.ok) {
    throw new Error('Failed to fetch templates');
  }
  return response.json();
}

export function trackTemplateUsage(id: number, action: 'copy' | 'try'): void {
  fetch(`/api/templates/${id}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  }).catch(() => {});
}

export interface SubmitTemplatePayload {
  title: string;
  author: string;
  category: string;
  prompt: string;
  inputsNeeded: number;
  inputImages: string[];
  outputImage: string;
  note?: string;
}

export async function submitTemplate(payload: SubmitTemplatePayload): Promise<{ success: boolean; template: Template }> {
  const response = await fetch('/api/templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to submit template');
  }
  return response.json();
}
