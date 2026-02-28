import React, { useState, useEffect, useRef } from 'react';
import { Template } from '../../types';
import { submitTemplate } from '../../services/templateService';

interface SubmitPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onSubmitSuccess: (template: Template) => void;
}

const SubmitPromptDialog: React.FC<SubmitPromptDialogProps> = ({ isOpen, onClose, categories, onSubmitSuccess }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [prompt, setPrompt] = useState('');
  const [inputsNeeded, setInputsNeeded] = useState(0);
  const [outputImage, setOutputImage] = useState('');
  const [inputImages, setInputImages] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const outputFileRef = useRef<HTMLInputElement>(null);
  const inputFileRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setTitle(''); setAuthor(''); setCategory('');
      setPrompt(''); setInputsNeeded(0); setOutputImage('');
      setInputImages([]); setNote(''); setError(null); setSuccess(false);
    }
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileRead = (file: File, callback: (dataUrl: string) => void) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleInputsNeededChange = (n: number) => {
    setInputsNeeded(n);
    setInputImages(new Array(n).fill(''));
    inputFileRefs.current = new Array(n).fill(null);
  };

  const handleInputImageChange = (index: number, dataUrl: string) => {
    setInputImages(prev => {
      const next = [...prev];
      next[index] = dataUrl;
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!title.trim() || !author.trim() || !category || !prompt.trim()) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await submitTemplate({
        title: title.trim(),
        author: author.trim(),
        category,
        prompt: prompt.trim(),
        inputsNeeded,
        inputImages: inputImages.filter(Boolean),
        outputImage: outputImage || '',
        note: note.trim() || undefined,
      });
      setSuccess(true);
      onSubmitSuccess(result.template);
      setTimeout(() => onClose(), 1500);
    } catch (e: any) {
      setError(e.message || 'Gửi thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = title.trim() && author.trim() && category && prompt.trim();

  return (
    <div
      className="fixed inset-0 bg-scrim/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface-container-high rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-elevation-3 animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface-container-high/95 backdrop-blur-lg flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>add_circle</span>
            </div>
            <h2 className="text-[22px] font-normal text-on-surface leading-7">Share Prompt</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-on-surface/[0.08] active:bg-on-surface/[0.12] transition-colors text-on-surface-variant shrink-0"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>close</span>
          </button>
        </div>

        {/* Success state */}
        {success ? (
          <div className="px-6 py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 32 }}>check_circle</span>
            </div>
            <p className="text-lg text-on-surface font-medium">Prompt submitted!</p>
            <p className="text-sm text-on-surface-variant mt-1">Cảm ơn bạn đã chia sẻ prompt.</p>
          </div>
        ) : (
          <>
            {/* Form body */}
            <div className="px-6 pb-2 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-[11px] text-on-surface-variant font-medium uppercase tracking-widest mb-2">
                  Tiêu đề <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="VD: Tạo avatar 3D từ ảnh chân dung"
                  className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 ease-md-standard"
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-[11px] text-on-surface-variant font-medium uppercase tracking-widest mb-2">
                  Tên tác giả <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  placeholder="VD: designer_vn"
                  className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 ease-md-standard"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] text-on-surface-variant font-medium uppercase tracking-widest mb-2">
                  Danh mục <span className="text-error">*</span>
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 ease-md-standard appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%239e9e9e'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                >
                  <option value="">Chọn danh mục...</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Prompt */}
              <div>
                <label className="block text-[11px] text-on-surface-variant font-medium uppercase tracking-widest mb-2">
                  Prompt <span className="text-error">*</span>
                </label>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Nhập prompt yêu thích của bạn..."
                  rows={5}
                  className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface font-mono placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 ease-md-standard resize-none leading-relaxed"
                />
                <p className="text-[11px] text-on-surface-variant/60 mt-1 text-right">{prompt.length} characters</p>
              </div>

              {/* Inputs Needed */}
              <div>
                <label className="block text-[11px] text-on-surface-variant font-medium uppercase tracking-widest mb-2">
                  Số ảnh input cần thiết
                </label>
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2, 3].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handleInputsNeededChange(n)}
                      className={`h-9 px-4 rounded-full text-sm font-medium transition-all duration-200 ease-md-standard ${
                        inputsNeeded === n
                          ? 'bg-secondary-container text-on-secondary-container shadow-sm'
                          : 'border border-outline-variant text-on-surface-variant hover:bg-on-surface/[0.08]'
                      }`}
                    >
                      {n === 0 ? 'Không (Text to Image)' : `${n} ảnh`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input images upload */}
              {inputsNeeded > 0 && (
                <div>
                  <label className="block text-[11px] text-on-surface-variant font-medium uppercase tracking-widest mb-2">
                    Ảnh input mẫu (tuỳ chọn)
                  </label>
                  <div className={`grid gap-3 ${inputsNeeded >= 3 ? 'grid-cols-3' : inputsNeeded === 2 ? 'grid-cols-2' : 'grid-cols-1 max-w-[200px]'}`}>
                    {Array.from({ length: inputsNeeded }).map((_, i) => (
                      <ImagePicker
                        key={i}
                        label={`Input #${i + 1}`}
                        value={inputImages[i] || ''}
                        onChange={(url) => handleInputImageChange(i, url)}
                        fileRef={(el) => { inputFileRefs.current[i] = el; }}
                        onFileRead={handleFileRead}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Output image upload */}
              <div>
                <label className="block text-[11px] text-on-surface-variant font-medium uppercase tracking-widest mb-2">
                  Ảnh output mẫu (tuỳ chọn)
                </label>
                <div className="max-w-[200px]">
                  <ImagePicker
                    label="Output"
                    value={outputImage}
                    onChange={setOutputImage}
                    fileRef={outputFileRef}
                    onFileRead={handleFileRead}
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-[11px] text-on-surface-variant font-medium uppercase tracking-widest mb-2">
                  Ghi chú (tuỳ chọn)
                </label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Mẹo sử dụng, lưu ý đặc biệt..."
                  rows={2}
                  className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 ease-md-standard resize-none"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-error-container/30 border border-error-container/50">
                  <span className="material-symbols-outlined text-error shrink-0 mt-0.5" style={{ fontSize: 18 }}>error</span>
                  <p className="text-sm text-on-error-container">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-surface-container-high/95 backdrop-blur-lg px-6 py-5 border-t border-outline-variant/50 flex items-center gap-3">
              <button
                onClick={onClose}
                className="h-12 px-6 flex items-center rounded-full text-on-surface-variant font-medium text-sm hover:bg-on-surface/[0.08] active:bg-on-surface/[0.12] transition-colors duration-200 ease-md-standard"
              >
                Huỷ
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isValid || isSubmitting}
                className="h-12 px-8 flex items-center gap-2.5 rounded-full bg-primary text-on-primary font-medium text-sm shadow-elevation-1 hover:shadow-elevation-2 hover:-translate-y-0.5 active:scale-[0.97] active:shadow-none transition-card disabled:opacity-40 disabled:pointer-events-none ml-auto"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
                    Gửi Prompt
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* Inline image picker sub-component */
const ImagePicker: React.FC<{
  label: string;
  value: string;
  onChange: (dataUrl: string) => void;
  fileRef: React.Ref<HTMLInputElement>;
  onFileRead: (file: File, cb: (url: string) => void) => void;
}> = ({ label, value, onChange, fileRef, onFileRead }) => {
  const localRef = useRef<HTMLInputElement>(null);
  const ref = (fileRef as React.RefObject<HTMLInputElement>) || localRef;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onFileRead(file, onChange);
  };

  return (
    <div
      className={`relative aspect-square rounded-xl border-2 border-dashed flex items-center justify-center transition-all duration-200 ease-md-standard ${
        value ? 'border-transparent' : 'border-outline-variant bg-surface-container-high hover:border-primary/40 hover:bg-on-surface/[0.04]'
      }`}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
    >
      <input
        type="file"
        ref={ref}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) onFileRead(file, onChange);
        }}
        className="hidden"
        accept="image/png,image/jpeg,image/webp"
      />
      {!value ? (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="text-center text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined block mx-auto mb-1" style={{ fontSize: 28 }}>upload</span>
          <span className="block text-[11px] font-medium">{label}</span>
        </button>
      ) : (
        <>
          <img src={value} alt={label} className="w-full h-full object-cover rounded-xl" />
          <button
            type="button"
            onClick={() => {
              onChange('');
              if (ref.current) ref.current.value = '';
            }}
            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-scrim/60 backdrop-blur-sm rounded-full text-white hover:bg-scrim/80 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
          </button>
        </>
      )}
    </div>
  );
};

export default SubmitPromptDialog;
