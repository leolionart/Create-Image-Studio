import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-6">
      {icon && (
        <div className="w-16 h-16 rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-center mb-4 text-on-surface-variant">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium text-on-surface-variant mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-outline max-w-[240px]">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 h-10 px-6 text-sm font-medium rounded-full bg-primary text-on-primary hover:shadow-md hover:shadow-primary/20 transition-all duration-200 ease-md-standard"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
