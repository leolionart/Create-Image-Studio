import React, { useState } from 'react';

interface ResultActionsProps {
  imageBase64: string;
}

const ResultActions: React.FC<ResultActionsProps> = ({ imageBase64 }) => {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${imageBase64}`;
    link.download = `generated-${Date.now()}.jpg`;
    link.click();
  };

  const handleCopy = async () => {
    try {
      const response = await fetch(`data:image/jpeg;base64,${imageBase64}`);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      await navigator.clipboard.writeText(`data:image/jpeg;base64,${imageBase64}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleDownload}
        className="flex-1 h-10 flex items-center justify-center gap-2 rounded-full text-sm font-medium bg-surface-container-high text-on-surface-variant hover:bg-on-surface/[0.08] border border-outline-variant transition-colors duration-200 ease-md-standard"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
        Download
      </button>
      <button
        onClick={handleCopy}
        className="flex-1 h-10 flex items-center justify-center gap-2 rounded-full text-sm font-medium bg-surface-container-high text-on-surface-variant hover:bg-on-surface/[0.08] border border-outline-variant transition-colors duration-200 ease-md-standard"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          {copied ? 'check' : 'content_copy'}
        </span>
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
};

export default ResultActions;
