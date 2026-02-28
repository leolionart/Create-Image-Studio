import React from 'react';

interface FilterBarProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  templateCounts: Record<string, number>;
  totalCount: number;
}

const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  templateCounts,
  totalCount,
}) => {
  const ChipButton = ({ label, count, isActive, onClick }: { key?: React.Key; label: string; count: number; isActive: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`h-8 px-4 inline-flex items-center gap-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ease-spring shrink-0 ${
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
        {/* Search */}
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: 20 }}>search</span>
          <input
            type="text"
            placeholder="Search prompts, categories, authors..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-10 h-12 text-sm bg-surface-container-high rounded-full text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200 ease-md-standard"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-on-surface/[0.08] text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
            </button>
          )}
        </div>

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
