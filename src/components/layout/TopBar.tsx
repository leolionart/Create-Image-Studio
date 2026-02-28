import React from 'react';

interface TopBarProps {
  onOpenSettings?: () => void;
  onSharePrompt?: () => void;
  onOpenAdmin?: () => void;
  hasCustomApi?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ onOpenSettings, onSharePrompt, onOpenAdmin, hasCustomApi }) => {
  return (
    <header className="h-16 bg-surface-container flex items-center justify-between px-4 shrink-0 z-30">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary" style={{ fontSize: 24 }}>auto_awesome</span>
        <h1 className="text-[22px] font-normal text-on-surface tracking-normal">
          Creative Image Studio
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onSharePrompt}
          className="h-10 px-4 inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/[0.15] active:bg-primary/[0.20] transition-colors duration-200 ease-md-standard"
          title="Share a Prompt"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_circle</span>
          <span className="hidden sm:inline">Share Prompt</span>
        </button>
        {hasCustomApi && (
          <span className="h-8 inline-flex items-center px-3 text-xs font-medium rounded-sm bg-tertiary-container text-on-tertiary-container">
            Custom API
          </span>
        )}
        <button
          onClick={onOpenAdmin}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-on-surface/[0.08] transition-colors duration-200 ease-md-standard text-on-surface-variant"
          aria-label="Admin Panel"
          title="Admin Panel"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>admin_panel_settings</span>
        </button>
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
