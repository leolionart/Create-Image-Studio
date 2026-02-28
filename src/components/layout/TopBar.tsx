import React from 'react';

interface TopBarProps {
  onOpenSettings?: () => void;
  hasCustomApi?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ onOpenSettings, hasCustomApi }) => {
  return (
    <header className="h-16 bg-surface-container flex items-center justify-between px-4 shrink-0 z-30">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary" style={{ fontSize: 24 }}>auto_awesome</span>
        <h1 className="text-[22px] font-normal text-on-surface tracking-normal">
          Creative Image Studio
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {hasCustomApi && (
          <span className="h-8 inline-flex items-center px-3 text-xs font-medium rounded-sm bg-tertiary-container text-on-tertiary-container">
            Custom API
          </span>
        )}
        <span className="h-8 inline-flex items-center px-3 text-xs font-medium rounded-sm bg-surface-container-high text-on-surface-variant font-mono">
          Gemini AI
        </span>
        <button
          onClick={onOpenSettings}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-on-surface/[0.08] transition-colors duration-200 ease-md-standard text-on-surface-variant"
          aria-label="API Settings"
          title="API Settings"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>settings</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
