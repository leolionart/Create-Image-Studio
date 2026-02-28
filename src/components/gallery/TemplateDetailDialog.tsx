import React, { useState, useEffect } from 'react';
import { Template } from '../../types';

interface TemplateDetailDialogProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onTryIt: () => void;
}

const TemplateDetailDialog: React.FC<TemplateDetailDialogProps> = ({ template, isOpen, onClose, onTryIt }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) setCopied(false);
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen || !template) return null;

  const hasInputImages = template.inputImages.length > 0;
  const hasOutputImage = !!template.outputImage;

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(template.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadExample = () => {
    if (!template.outputImage) return;
    const link = document.createElement('a');
    link.href = template.outputImage;
    link.download = `${template.title.replace(/\s+/g, '-').toLowerCase()}-example.jpg`;
    link.click();
  };

  return (
    <div
      className="fixed inset-0 bg-scrim/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface-container-high rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-elevation-3 animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface-container-high/95 backdrop-blur-lg flex items-start justify-between px-6 pt-6 pb-4">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-[22px] font-normal text-on-surface leading-7 mb-2">{template.title}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-on-surface-variant">@{template.author}</span>
              <span className="h-6 inline-flex items-center px-2.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-medium tracking-wide">
                {template.category}
              </span>
              {template.source === 'custom' && (
                <span className="h-6 inline-flex items-center gap-1 px-2.5 rounded-full bg-tertiary-container text-on-tertiary-container text-[11px] font-medium tracking-wide">
                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>group</span>
                  Community
                </span>
              )}
              {template.inputsNeeded > 0 && (
                <span className="h-6 inline-flex items-center gap-1 px-2.5 rounded-full bg-surface-container-highest text-on-surface-variant text-[11px] font-medium">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>photo_library</span>
                  {template.inputsNeeded} input{template.inputsNeeded > 1 ? 's' : ''} needed
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-on-surface/[0.08] active:bg-on-surface/[0.12] transition-colors text-on-surface-variant shrink-0"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>close</span>
          </button>
        </div>

        {/* Before → After images */}
        {(hasInputImages || hasOutputImage) && (
          <div className="px-6">
            {hasInputImages && hasOutputImage ? (
              <div className="rounded-2xl overflow-hidden bg-surface-container border border-outline-variant/50">
                <div className="flex items-stretch">
                  {/* Input side */}
                  <div className="flex-1 min-w-0 p-4">
                    <p className="text-[11px] text-on-surface-variant font-medium mb-3 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-outline inline-block" />
                      Before
                    </p>
                    <div className={`grid gap-2 ${template.inputImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {template.inputImages.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt={`Input ${i + 1}`}
                          className="w-full aspect-square object-cover rounded-xl"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Arrow divider */}
                  <div className="flex items-center shrink-0 px-2">
                    <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>arrow_forward</span>
                    </div>
                  </div>

                  {/* Output side */}
                  <div className="flex-1 min-w-0 p-4">
                    <p className="text-[11px] text-primary font-medium mb-3 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                      After
                    </p>
                    <img
                      src={template.outputImage}
                      alt="Output"
                      className="w-full aspect-square object-cover rounded-xl ring-2 ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            ) : hasOutputImage ? (
              <div className="rounded-2xl overflow-hidden bg-surface-container border border-outline-variant/50 p-4">
                <p className="text-[11px] text-primary font-medium mb-3 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>auto_awesome</span>
                  Generated Output
                </p>
                <img
                  src={template.outputImage}
                  alt="Output"
                  className="w-full max-w-md aspect-square object-cover rounded-xl ring-2 ring-primary/20"
                />
              </div>
            ) : null}
          </div>
        )}

        {/* Prompt */}
        <div className="px-6 pt-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] text-on-surface-variant font-medium uppercase tracking-widest">Prompt</p>
            <button
              onClick={handleCopyPrompt}
              className="h-7 px-3 inline-flex items-center gap-1.5 rounded-full text-xs font-medium text-primary hover:bg-primary/[0.08] active:bg-primary/[0.12] transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                {copied ? 'check' : 'content_copy'}
              </span>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="bg-surface-container rounded-2xl border border-outline-variant/50 p-5 relative group">
            <p className="text-sm font-mono text-on-surface leading-relaxed whitespace-pre-wrap">{template.prompt}</p>
          </div>
        </div>

        {/* Note */}
        {template.note && (
          <div className="px-6 pt-3">
            <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-tertiary-container/20 border border-tertiary-container/40">
              <span className="material-symbols-outlined text-tertiary shrink-0 mt-0.5" style={{ fontSize: 18 }}>lightbulb</span>
              <p className="text-sm text-on-tertiary-container leading-relaxed">{template.note}</p>
            </div>
          </div>
        )}

        {/* Actions — sticky bottom */}
        <div className="sticky bottom-0 bg-surface-container-high/95 backdrop-blur-lg px-6 py-5 mt-5 border-t border-outline-variant/50 flex flex-wrap gap-3">
          {/* Copy Prompt - Primary filled */}
          <button
            onClick={handleCopyPrompt}
            className="h-12 px-8 flex items-center gap-2.5 rounded-full bg-primary text-on-primary font-medium text-sm shadow-elevation-1 hover:shadow-elevation-2 hover:-translate-y-0.5 active:scale-[0.97] active:shadow-none transition-card"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Copied!' : 'Copy Prompt'}
          </button>

          {/* Try It - Secondary tonal */}
          <button
            onClick={onTryIt}
            className="h-12 px-8 flex items-center gap-2.5 rounded-full bg-secondary-container text-on-secondary-container font-medium text-sm hover:shadow-elevation-1 hover:-translate-y-0.5 active:scale-[0.97] transition-card"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>play_arrow</span>
            Try It
          </button>

          {/* Download Example - Text button */}
          {hasOutputImage && (
            <button
              onClick={handleDownloadExample}
              className="h-12 px-6 flex items-center gap-2 rounded-full text-primary font-medium text-sm hover:bg-primary/[0.08] active:bg-primary/[0.12] transition-colors duration-200 ease-md-standard ml-auto"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
              Download
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateDetailDialog;
