import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Case } from '../types';
import { editImage, generateImageFromText } from '../services/geminiService';
import ImageUploader from './ImageUploader';
import Spinner from './Spinner';
import { CloseIcon, SparklesIcon } from './icons';

interface CaseViewModalProps {
  caseData: Case;
  onClose: () => void;
}

const CaseViewModal: React.FC<CaseViewModalProps> = ({ caseData, onClose }) => {
  const [prompt, setPrompt] = useState(caseData.prompt);
  const [uploadedImages, setUploadedImages] = useState<( { base64: string, mimeType: string } | null)[]>(
    new Array(caseData.inputsNeeded).fill(null)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ text: string | null; imageBase64: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (index: number, base64: string, mimeType: string) => {
    setUploadedImages(prev => {
      const newImages = [...prev];
      newImages[index] = { base64, mimeType };
      return newImages;
    });
  };

  const handleImageRemove = (index: number) => {
    setUploadedImages(prev => {
      const newImages = [...prev];
      newImages[index] = null;
      return newImages;
    });
  };

  const canGenerate = useMemo(() => {
    if (isLoading) return false;
    if (caseData.inputsNeeded > 0) {
      return uploadedImages.every(img => img !== null);
    }
    return prompt.trim() !== '';
  }, [isLoading, uploadedImages, caseData.inputsNeeded, prompt]);


  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let response;
      if (caseData.inputsNeeded > 0) {
        const validImages = uploadedImages.filter(img => img !== null) as { base64: string, mimeType: string }[];
        if (validImages.length !== caseData.inputsNeeded) {
          throw new Error("Please upload all required images.");
        }
        response = await editImage(prompt, validImages);
      } else {
        response = await generateImageFromText(prompt);
      }
      setResult(response);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [handleEscapeKey]);

  let uploaderGridClass = 'grid gap-4 ';
  switch (caseData.inputsNeeded) {
      case 1:
        uploaderGridClass += 'grid-cols-1 max-w-sm mx-auto';
        break;
      case 2:
        uploaderGridClass += 'grid-cols-2';
        break;
      case 3:
        uploaderGridClass += 'grid-cols-3';
        break;
      default:
        uploaderGridClass = '';
        break;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="absolute inset-0"
        onClick={onClose}
      ></div>
      <div className="relative bg-[#fcfaf8] rounded-2xl w-full max-w-6xl h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/50">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-gray-800">{caseData.title}</h2>
            <p className="text-sm text-gray-500">by {caseData.author}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-800 transition-colors"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto p-6">
          {/* Left Panel: Inputs */}
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-semibold text-gray-700">Try this case</h3>
            {caseData.inputsNeeded > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Input Image{caseData.inputsNeeded > 1 ? 's' : ''}
                    </label>
                    <div className={uploaderGridClass}>
                        {Array.from({ length: caseData.inputsNeeded }).map((_, i) => (
                        <ImageUploader
                            key={i}
                            index={i}
                            onImageUpload={(base64, mimeType) => handleImageUpload(i, base64, mimeType)}
                            onImageRemove={() => handleImageRemove(i)}
                        />
                        ))}
                    </div>
                </div>
            )}
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                Prompt
              </label>
              <textarea
                id="prompt"
                rows={5}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f4c28e] focus:border-[#f4c28e] transition-colors"
                placeholder="Enter your prompt here..."
              />
              {caseData.note && <p className="text-xs text-gray-500 mt-2">{caseData.note}</p>}
            </div>
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full flex items-center justify-center gap-2 bg-[#f4c28e] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#f2b26a] transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
            >
              <SparklesIcon className="w-5 h-5" />
              <span>{isLoading ? 'Generating...' : 'Generate'}</span>
            </button>
          </div>

          {/* Right Panel: Output */}
          <div className="flex flex-col gap-4">
             <h3 className="text-lg font-semibold text-gray-700">Result</h3>
             <div className="relative w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 overflow-hidden">
                {isLoading && <Spinner />}
                {error && <div className="text-center text-red-500 p-4">
                    <p className="font-semibold">An error occurred</p>
                    <p className="text-sm">{error}</p>
                </div>}
                {result?.imageBase64 && (
                     <img src={`data:image/jpeg;base64,${result.imageBase64}`} alt="Generated result" className="w-full h-full object-contain" />
                )}
                {!isLoading && !error && !result && (
                    <div className="text-center text-gray-500">
                        <p>Your generated image will appear here.</p>
                    </div>
                )}
             </div>
             {result?.text && (
                 <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-2">Text Response:</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{result.text}</p>
                 </div>
             )}
          </div>
        </div>
        
        {/* Footer: Original Case */}
        <footer className="p-4 border-t border-gray-200 bg-white/50 hidden lg:block">
            <h3 className="text-md font-semibold text-gray-700 mb-2">Original Case Example</h3>
            <div className="flex gap-4 items-center">
                {caseData.inputImages.length > 0 && (
                    <div className="flex gap-2">
                        {caseData.inputImages.map((src, i) => (
                            <div key={i} className="w-24 h-24">
                                <img src={src} alt={`Original input ${i + 1}`} className="w-full h-full object-cover rounded-md border border-gray-200" />
                                <p className="text-xs text-center text-gray-500 mt-1">Input {i+1}</p>
                            </div>
                        ))}
                    </div>
                )}
                {caseData.inputImages.length > 0 && <div className="text-2xl text-gray-300">&rarr;</div>}
                <div className="w-24 h-24">
                    <img src={caseData.outputImage} alt="Original output" className="w-full h-full object-cover rounded-md border border-gray-200" />
                    <p className="text-xs text-center text-gray-500 mt-1">Output</p>
                </div>
                <div className="flex-1 text-xs text-gray-600 bg-gray-50 p-2 rounded-md">
                   <strong>Prompt:</strong> {caseData.prompt}
                </div>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default CaseViewModal;
