import React, { useEffect } from 'react';
import { Template } from '../../types';
import ImageUploader from '../ImageUploader';
import PromptEditor from '../editor/PromptEditor';
import GenerateButton from '../editor/GenerateButton';
import ResultPanel from '../result/ResultPanel';

interface TryItDialogProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  onPromptChange: (value: string) => void;
  uploadedImages: ({ base64: string; mimeType: string } | null)[];
  onImageUpload: (index: number, base64: string, mimeType: string) => void;
  onImageRemove: (index: number) => void;
  onGenerate: () => void;
  canGenerate: boolean;
  isGenerating: boolean;
  result: { text: string | null; imageBase64: string | null } | null;
  error: string | null;
}

const TryItDialog: React.FC<TryItDialogProps> = ({
  template,
  isOpen,
  onClose,
  prompt,
  onPromptChange,
  uploadedImages,
  onImageUpload,
  onImageRemove,
  onGenerate,
  canGenerate,
  isGenerating,
  result,
  error,
}) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && isOpen) {
        e.preventDefault();
        onGenerate();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose, onGenerate]);

  if (!isOpen || !template) return null;

  const inputsNeeded = template.inputsNeeded;

  return (
    <div
      className="fixed inset-0 bg-scrim/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface-container-high rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-elevation-3 animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface-container-high/95 backdrop-blur-lg flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-6 inline-flex items-center gap-1 px-2.5 rounded-full bg-primary/15 text-primary text-[11px] font-medium">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>play_arrow</span>
                Try It
              </span>
            </div>
            <h2 className="text-lg font-medium text-on-surface truncate">{template.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-on-surface/[0.08] active:bg-on-surface/[0.12] transition-colors text-on-surface-variant shrink-0"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>close</span>
          </button>
        </div>

        {/* Editor content */}
        <div className="px-6 pb-6 space-y-5">
          {/* Image uploaders */}
          {inputsNeeded > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>add_photo_alternate</span>
                Upload your image{inputsNeeded > 1 ? 's' : ''} ({inputsNeeded} required)
              </label>
              <div className={`grid gap-3 ${
                inputsNeeded === 1 ? 'grid-cols-1 max-w-xs' :
                inputsNeeded === 2 ? 'grid-cols-2' :
                'grid-cols-3'
              }`}>
                {Array.from({ length: inputsNeeded }).map((_, i) => (
                  <ImageUploader
                    key={i}
                    index={i}
                    onImageUpload={(base64, mimeType) => onImageUpload(i, base64, mimeType)}
                    onImageRemove={() => onImageRemove(i)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Prompt editor */}
          <PromptEditor
            value={prompt}
            onChange={onPromptChange}
            note={template.note}
          />

          {/* Generate button */}
          <GenerateButton
            onClick={onGenerate}
            disabled={!canGenerate}
            isLoading={isGenerating}
          />

          {/* Result inline */}
          {(isGenerating || error || result) && (
            <div className="border-t border-outline-variant/50 pt-5 mt-2">
              <ResultPanel
                isLoading={isGenerating}
                error={error}
                result={result}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TryItDialog;
