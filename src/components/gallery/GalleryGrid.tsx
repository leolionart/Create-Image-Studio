import React from 'react';
import { Template, TemplateStats } from '../../types';
import GalleryCard from './GalleryCard';

interface GalleryGridProps {
  templates: Template[];
  onSelectTemplate: (template: Template) => void;
  isLoading?: boolean;
  templateStats?: Record<string, TemplateStats>;
}

const GalleryGrid: React.FC<GalleryGridProps> = ({ templates, onSelectTemplate, isLoading, templateStats }) => {
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl overflow-hidden bg-surface-container shadow-elevation-1 animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="aspect-[4/3] bg-surface-container-highest relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-surface-container-highest via-surface-container-high to-surface-container-highest" style={{ backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
              </div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-surface-container-highest rounded-full w-3/4" />
                <div className="flex gap-2">
                  <div className="h-6 bg-surface-container-highest rounded-full w-20" />
                  <div className="h-6 bg-surface-container-highest rounded-full w-16" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 bg-surface-container-highest rounded-full w-full" />
                  <div className="h-3 bg-surface-container-highest rounded-full w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 36 }}>search_off</span>
        </div>
        <h3 className="text-lg font-medium text-on-surface mb-1">No prompts found</h3>
        <p className="text-sm text-on-surface-variant max-w-xs">Try a different search term or browse another category</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Results count */}
      <p className="text-xs text-on-surface-variant mb-4 font-medium tracking-wide">
        {templates.length} prompt{templates.length !== 1 ? 's' : ''}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map((template, i) => (
          <GalleryCard
            key={template.id}
            template={template}
            onSelect={onSelectTemplate}
            index={i}
            stats={templateStats?.[String(template.id)]}
          />
        ))}
      </div>
    </div>
  );
};

export default GalleryGrid;
