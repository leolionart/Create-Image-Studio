
import React, { useState, useRef } from 'react';
import { UploadIcon, CloseIcon } from './icons';

interface ImageUploaderProps {
  onImageUpload: (base64: string, mimeType: string) => void;
  onImageRemove: () => void;
  index: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, onImageRemove, index }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        const base64Data = result.split(',')[1];
        onImageUpload(base64Data, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageRemove();
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative w-full aspect-square border-2 border-dashed border-[#f4d1dc] rounded-xl flex items-center justify-center bg-[#fcfaf8]/50 transition-all duration-300 hover:border-[#f4c28e] hover:bg-white">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      {!preview ? (
        <button onClick={triggerFileInput} className="text-center text-[#d1c4e9] hover:text-[#f4c28e]">
          <UploadIcon className="w-10 h-10 mx-auto" />
          <span className="mt-2 block text-sm font-semibold">Upload Input #{index + 1}</span>
        </button>
      ) : (
        <>
          <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-xl" />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-white/70 rounded-full p-1.5 text-gray-700 hover:bg-white hover:scale-110 transition-transform duration-200"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
};

export default ImageUploader;
