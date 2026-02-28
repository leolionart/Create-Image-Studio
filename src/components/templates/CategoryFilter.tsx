import React from 'react';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
  templateCounts: Record<string, number>;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, activeCategory, onSelect, templateCounts }) => {
  return (
    <div className="flex flex-wrap gap-2 px-3 py-2.5">
      <button
        onClick={() => onSelect('All')}
        className={`h-8 px-3 text-xs font-medium rounded-sm transition-colors duration-200 ease-md-standard ${
          activeCategory === 'All'
            ? 'bg-secondary-container text-on-secondary-container'
            : 'bg-surface-container-high text-on-surface-variant hover:bg-on-surface/[0.08]'
        }`}
      >
        All ({(Object.values(templateCounts) as number[]).reduce((a: number, b: number) => a + b, 0)})
      </button>
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`h-8 px-3 text-xs font-medium rounded-sm transition-colors duration-200 ease-md-standard ${
            activeCategory === cat
              ? 'bg-secondary-container text-on-secondary-container'
              : 'bg-surface-container-high text-on-surface-variant hover:bg-on-surface/[0.08]'
          }`}
        >
          {cat} ({templateCounts[cat] || 0})
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
