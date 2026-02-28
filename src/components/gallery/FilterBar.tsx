import React, { useState, useRef, useEffect } from 'react';
import { SortOption } from '../../types';

interface FilterBarProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  templateCounts: Record<string, number>;
  totalCount: number;
  onOpenAISearch?: () => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
  { value: 'newest', label: 'Mới nhất', icon: 'schedule' },
  { value: 'most-copied', label: 'Copy nhiều nhất', icon: 'content_copy' },
  { value: 'most-tried', label: 'Dùng thử nhiều nhất', icon: 'play_arrow' },
];

const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  templateCounts,
  totalCount,
  onOpenAISearch,
  sortBy,
  onSortChange,
}: FilterBarProps) => {
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sortMenuOpen]);
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
        {/* AI Search + Sort row */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAISearch}
            className="flex-1 min-w-0 max-w-md h-12 px-4 inline-flex items-center gap-3 rounded-full bg-surface-container-high text-outline hover:bg-surface-container-highest hover:text-on-surface-variant active:bg-surface-bright transition-colors duration-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>auto_awesome</span>
            <span className="flex-1 text-sm text-left truncate">Search prompts with AI...</span>
            <kbd className="hidden sm:inline-flex items-center h-5 px-1.5 rounded bg-surface-container text-outline text-[10px] font-mono border border-outline-variant/50">⌘K</kbd>
          </button>

          {/* Sort — text button, pushed right */}
          <div className="relative shrink-0 ml-auto" ref={sortRef}>
            <button
              onClick={() => setSortMenuOpen(v => !v)}
              className={`h-10 px-2 inline-flex items-center gap-1 text-sm whitespace-nowrap transition-colors duration-200 rounded-lg hover:bg-on-surface/[0.08] active:bg-on-surface/[0.12] ${
                sortBy !== 'newest' ? 'text-primary font-medium' : 'text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>swap_vert</span>
              <span className="hidden sm:inline">{SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
            </button>

            {sortMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 py-1 bg-surface-container-high rounded-2xl shadow-elevation-2 border border-outline-variant/30 z-30 animate-scale-in origin-top-right">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { onSortChange(opt.value); setSortMenuOpen(false); }}
                    className={`w-full h-10 px-4 flex items-center gap-3 text-sm transition-colors ${
                      sortBy === opt.value
                        ? 'bg-secondary-container/60 text-on-secondary-container font-medium'
                        : 'text-on-surface hover:bg-on-surface/[0.08]'
                    }`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{opt.icon}</span>
                    {opt.label}
                    {sortBy === opt.value && (
                      <span className="material-symbols-outlined ml-auto" style={{ fontSize: 16 }}>check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category chips */}
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
