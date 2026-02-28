import React from 'react';

interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({ onClick, disabled, isLoading }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-12 flex items-center justify-center gap-2.5 rounded-full font-medium text-sm transition-all duration-300 ease-md-standard ${
        disabled
          ? 'bg-on-surface/[0.12] text-on-surface/[0.38] cursor-not-allowed'
          : isLoading
            ? 'bg-primary text-on-primary cursor-wait animate-pulse'
            : 'bg-primary text-on-primary hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]'
      }`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
        {isLoading ? 'progress_activity' : 'auto_awesome'}
      </span>
      <span>{isLoading ? 'Generating...' : 'Generate'}</span>
    </button>
  );
};

export default GenerateButton;
