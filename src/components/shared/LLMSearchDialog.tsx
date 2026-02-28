import React, { useState, useEffect, useRef } from 'react';
import { Template } from '../../types';
import { searchTemplates } from '../../services/geminiService';
import GalleryCard from '../gallery/GalleryCard';

interface LLMSearchDialogProps {
    isOpen: boolean;
    onClose: () => void;
    templates: Template[];
    onSelectTemplate: (template: Template) => void;
}

const LLMSearchDialog: React.FC<LLMSearchDialogProps> = ({ isOpen, onClose, templates, onSelectTemplate }) => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<Template[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchPhase, setSearchPhase] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
            setResults([]);
            setError(null);
        }
    }, [isOpen]);

    // Cycle through search phases while searching
    useEffect(() => {
        if (!isSearching) { setSearchPhase(0); return; }
        const interval = setInterval(() => {
            setSearchPhase(p => (p + 1) % 4);
        }, 1800);
        return () => clearInterval(interval);
    }, [isSearching]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        setError(null);

        try {
            const compactTemplates = templates.map(t => ({
                id: t.id,
                title: t.title,
                prompt: t.prompt,
                category: t.category
            }));

            const matchedIds = await searchTemplates(query, compactTemplates);

            if (Array.isArray(matchedIds) && matchedIds.length > 0) {
                const matchedTemplates = matchedIds
                    .map(id => templates.find(t => t.id === id))
                    .filter((t): t is Template => t !== undefined);
                setResults(matchedTemplates);
            } else {
                setResults([]);
            }
        } catch (err: any) {
            console.error('Search error:', err);
            setError(err.message || 'Failed to search templates');
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectResult = (template: Template) => {
        onClose();
        onSelectTemplate(template);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 bg-scrim/50 backdrop-blur-sm p-4 animate-fade-in"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="relative w-full max-w-3xl bg-surface-container-high rounded-2xl shadow-elevation-3 overflow-hidden animate-scale-in">
                {/* Search input */}
                <form onSubmit={handleSearch} className="flex items-center border-b border-outline-variant/50 p-2">
                    <div className="pl-4 pr-2 text-primary">
                        <span className="material-symbols-outlined" style={{ fontSize: 24 }}>auto_awesome</span>
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        className="flex-1 bg-transparent border-none text-on-surface text-lg sm:text-xl py-4 px-2 focus:outline-none placeholder:text-outline"
                        placeholder="Mô tả hình ảnh bạn muốn tạo..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="pr-4 flex items-center gap-2">
                        {isSearching ? (
                            <svg className="animate-spin w-5 h-5 text-outline" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <button
                                type="submit"
                                disabled={!query.trim()}
                                className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-on-surface/[0.08] disabled:opacity-40 transition-colors"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>search</span>
                            </button>
                        )}
                        <div className="h-6 w-px bg-outline-variant/50 mx-1" />
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-on-surface/[0.08] transition-colors"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                        </button>
                    </div>
                </form>

                {/* Results area */}
                <div className="max-h-[60vh] overflow-y-auto p-6 bg-surface-container/50">
                    {isSearching && (
                        <div className="flex flex-col items-center py-12 gap-5 animate-fade-in">
                            {/* Animated icon */}
                            <span
                                className="material-symbols-outlined text-primary"
                                style={{ fontSize: 36, animation: 'spin 2.5s linear infinite' }}
                            >
                                auto_awesome
                            </span>
                            {/* Phase text with fade transition */}
                            <div className="text-center space-y-1.5">
                                <p key={searchPhase} className="text-sm font-medium text-on-surface animate-fade-in">
                                    {[
                                        'Đang phân tích yêu cầu của bạn...',
                                        'Đang tìm kiếm prompt phù hợp...',
                                        'Đang so sánh với thư viện template...',
                                        'Đang sắp xếp kết quả tốt nhất...',
                                    ][searchPhase]}
                                </p>
                                <p className="text-xs text-outline">Powered by Gemini AI</p>
                            </div>
                            {/* Progress steps */}
                            <div className="flex gap-1.5 mt-1">
                                {[0, 1, 2, 3].map(i => (
                                    <div
                                        key={i}
                                        className={`h-1 rounded-full transition-all duration-500 ${
                                            i <= searchPhase ? 'w-6 bg-primary' : 'w-3 bg-outline-variant/40'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {error && !isSearching && (
                        <div className="p-4 bg-error-container/30 text-error rounded-xl text-center text-sm">
                            {error}
                        </div>
                    )}

                    {!error && !isSearching && results.length === 0 && query.trim() && (
                        <div className="text-center text-on-surface-variant py-8 text-sm">
                            Không tìm thấy kết quả phù hợp với "{query}". Thử cách diễn đạt khác.
                        </div>
                    )}

                    {!error && !isSearching && results.length === 0 && !query.trim() && (
                        <div className="text-center text-on-surface-variant/60 py-12 flex flex-col items-center">
                            <span className="material-symbols-outlined text-primary/40 mb-4" style={{ fontSize: 48 }}>auto_awesome</span>
                            <p className="text-lg text-on-surface-variant">Tìm kiếm thông minh với AI</p>
                            <p className="text-sm mt-1 text-outline">Tìm prompt chỉ bằng cách mô tả những gì bạn muốn</p>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {results.map((template, i) => (
                                <GalleryCard
                                    key={template.id}
                                    template={template}
                                    onSelect={handleSelectResult}
                                    index={i}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-outline-variant/50 bg-surface-container-high flex justify-between items-center text-xs text-on-surface-variant">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className="bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/50 text-[10px] font-mono">Enter</kbd> để tìm
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/50 text-[10px] font-mono">ESC</kbd> để đóng
                        </span>
                    </div>
                    <div className="text-outline">Gemini AI Search</div>
                </div>
            </div>
        </div>
    );
};

export default LLMSearchDialog;
