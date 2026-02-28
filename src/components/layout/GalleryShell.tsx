import React from 'react';
import TopBar from './TopBar';

interface GalleryShellProps {
  children: React.ReactNode;
  onOpenSettings?: () => void;
  onSharePrompt?: () => void;
  onOpenAdmin?: () => void;
  hasCustomApi?: boolean;
}

const GalleryShell: React.FC<GalleryShellProps> = ({ children, onOpenSettings, onSharePrompt, onOpenAdmin, hasCustomApi }) => {
  return (
    <div className="h-[100dvh] flex flex-col bg-surface overflow-hidden">
      <TopBar onOpenSettings={onOpenSettings} onSharePrompt={onSharePrompt} onOpenAdmin={onOpenAdmin} hasCustomApi={hasCustomApi} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default GalleryShell;
