import React from 'react';

interface FilterBarProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  templateCounts: Record<string, number>;
  totalCount: number;
  onOpenAISearch?: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  templateCounts,
  totalCount,
  onOpenAISearch,
}: FilterBarProps) => {
  const ChipButton = ({ label, count, isActive, onClick }: { key?: React.Key; label: string; count: number; isActive: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`h-8 px-4 inline-flex items-center gap-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 shrink-0 ${
        isActive
          ? 'bg-secondary-container text-on-secondary-container shadow-sm'
          : 'bg-transparent border border-outline-variant text-on-surface-variant hover:bg-on-surface/[0.08] active:bg-on-surface/[0.12]'
      }`}
    >
      {isActive && (
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
      )}
      {label}
      <span className={`text-xs ${isActive ? 'text-on-secondary-container/70' : 'text-outline'}`}>
        {count}
      </span>
    </button>
  );

  return (
    <div className="sticky top-0 z-20 bg-surface/90 backdrop-blur-lg border-b border-outline-variant/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-3">
        {/* AI Search trigger */}
        <button
          onClick={onOpenAISearch}
          className="w-full max-w-md h-12 px-4 inline-flex items-center gap-3 rounded-full bg-surface-container-high text-outline hover:bg-surface-container-highest hover:text-on-surface-variant active:bg-surface-bright transition-colors duration-200 cursor-pointer"
        >
          <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>auto_awesome</span>
          <span className="flex-1 text-sm text-left">Search prompts with AI...</span>
          <kbd className="hidden sm:inline-flex items-center h-5 px-1.5 rounded bg-surface-container text-outline text-[10px] font-mono border border-outline-variant/50">⌘K</kbd>
        </button>

        {/* Category chips — M3E filter chip row */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-0.5">
          <ChipButton label="All" count={totalCount} isActive={activeCategory === 'All'} onClick={() => onCategoryChange('All')} />
          {categories.map(cat => (
            <ChipButton key={cat} label={cat} count={templateCounts[cat] || 0} isActive={activeCategory === cat} onClick={() => onCategoryChange(cat)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
