import React from 'react';

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  note?: string;
  placeholder?: string;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ value, onChange, note, placeholder }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-on-surface-variant">Prompt</label>
        <span className="text-xs font-mono text-outline">{value.length} chars</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Describe what you want to create or how to transform your image...'}
        rows={4}
        className="w-full px-4 py-3 text-sm font-mono bg-surface-container-high border border-outline-variant rounded-sm text-on-surface placeholder-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none transition-colors duration-200 ease-md-standard leading-relaxed"
      />
      {note && (
        <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-sm bg-tertiary-container/30 border border-tertiary-container">
          <span className="material-symbols-outlined text-tertiary shrink-0 mt-0.5" style={{ fontSize: 16 }}>info</span>
          <p className="text-xs text-on-tertiary-container leading-relaxed">{note}</p>
        </div>
      )}
    </div>
  );
};

export default PromptEditor;
