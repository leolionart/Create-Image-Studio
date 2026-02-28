
import React, { useState, useRef } from 'react';

interface ImageUploaderProps {
  onImageUpload: (base64: string, mimeType: string) => void;
  onImageRemove: () => void;
  index: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, onImageRemove, index }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      const base64Data = result.split(',')[1];
      onImageUpload(base64Data, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleRemove = () => {
    setPreview(null);
    onImageRemove();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      className={`relative w-full aspect-square rounded-md border-2 border-dashed flex items-center justify-center transition-all duration-200 ease-md-standard ${
        isDragOver
          ? 'border-primary bg-primary/[0.08]'
          : preview
            ? 'border-transparent'
            : 'border-outline-variant bg-surface-container-high hover:border-primary/40 hover:bg-on-surface/[0.04]'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      {!preview ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-center text-on-surface-variant hover:text-on-surface transition-colors duration-200 ease-md-standard"
        >
          <span className="material-symbols-outlined block mx-auto mb-1" style={{ fontSize: 32 }}>upload</span>
          <span className="block text-xs font-medium">Upload #{index + 1}</span>
        </button>
      ) : (
        <>
          <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-md" />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-scrim/60 backdrop-blur-sm rounded-full text-white hover:bg-scrim/80 transition-colors duration-200 ease-md-standard"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
          </button>
        </>
      )}
    </div>
  );
};

export default ImageUploader;
