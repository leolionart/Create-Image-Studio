import React from 'react';
import ResultActions from './ResultActions';
import Spinner from '../Spinner';
import EmptyState from '../shared/EmptyState';

interface ResultPanelProps {
  isLoading: boolean;
  error: string | null;
  result: { text: string | null; imageBase64: string | null } | null;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ isLoading, error, result }) => {
  return (
    <div className="flex flex-col p-4">
      <h3 className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-3">Result</h3>

      {/* Result image area */}
      <div className="flex-1 flex flex-col gap-3 min-h-0">
        <div className="relative w-full aspect-square bg-surface-container-high rounded-md border border-outline-variant overflow-hidden flex items-center justify-center">
          {isLoading && <Spinner />}

          {error && (
            <div className="text-center p-4">
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center mx-auto mb-2">
                <span className="material-symbols-outlined text-on-error-container" style={{ fontSize: 20 }}>warning</span>
              </div>
              <p className="text-sm font-medium text-error">Generation failed</p>
              <p className="text-xs text-on-surface-variant mt-1">{error}</p>
            </div>
          )}

          {result?.imageBase64 && (
            <img
              src={`data:image/jpeg;base64,${result.imageBase64}`}
              alt="Generated result"
              className="w-full h-full object-contain animate-fade-in"
            />
          )}

          {!isLoading && !error && !result && (
            <EmptyState
              icon={<span className="material-symbols-outlined" style={{ fontSize: 32 }}>image</span>}
              title="No result yet"
              description="Generate an image to see the result here"
            />
          )}
        </div>

        {/* Actions */}
        {result?.imageBase64 && (
          <ResultActions imageBase64={result.imageBase64} />
        )}

        {/* Text response */}
        {result?.text && (
          <div className="bg-surface-container-high border border-outline-variant rounded-md p-3">
            <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1.5">AI Response</p>
            <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">{result.text}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPanel;
