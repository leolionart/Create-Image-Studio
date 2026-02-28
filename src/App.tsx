
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Template, TemplateStats, SortOption } from './types';
import { fetchTemplates, trackTemplateUsage } from './services/templateService';
import { editImage, generateImageFromText, loadApiSettings } from './services/geminiService';
import GalleryShell from './components/layout/GalleryShell';
import FilterBar from './components/gallery/FilterBar';
import GalleryGrid from './components/gallery/GalleryGrid';
import TemplateDetailDialog from './components/gallery/TemplateDetailDialog';
import TryItDialog from './components/gallery/TryItDialog';
import SettingsModal from './components/shared/SettingsModal';
import SubmitPromptDialog from './components/gallery/SubmitPromptDialog';
import AdminDialog from './components/shared/AdminDialog';
import LLMSearchDialog from './components/shared/LLMSearchDialog';

const App: React.FC = () => {
  // Template data
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  // Gallery filter state
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [templateStats, setTemplateStats] = useState<Record<string, TemplateStats>>({});

  // Dialog state
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [tryItOpen, setTryItOpen] = useState(false);

  // Editor state (for Try It)
  const [prompt, setPrompt] = useState('');
  const [uploadedImages, setUploadedImages] = useState<({ base64: string; mimeType: string } | null)[]>([]);

  // Result state
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ text: string | null; imageBase64: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hasCustomApi, setHasCustomApi] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check if custom API is configured
  useEffect(() => {
    const settings = loadApiSettings();
    setHasCustomApi(!!settings.apiKey || !!settings.baseUrl);
  }, [settingsOpen]);

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates()
      .then(data => {
        setTemplates(data.templates);
        setCategories(data.categories);
        setTemplateStats(data.stats || {});
      })
      .catch(err => console.error('Failed to load templates:', err))
      .finally(() => setIsLoadingTemplates(false));
  }, []);

  // Template counts per category
  const templateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    templates.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [templates]);

  // Filtered & sorted templates
  const filtered = useMemo(() => {
    let result = templates;
    if (activeCategory !== 'All') {
      result = result.filter(t => t.category === activeCategory);
    }
    const sorted = [...result];
    const getStat = (id: number) => templateStats[String(id)] || { copies: 0, tries: 0 };
    switch (sortBy) {
      case 'newest':
        sorted.reverse();
        break;
      case 'popular':
        sorted.sort((a, b) => {
          const sa = getStat(a.id), sb = getStat(b.id);
          return (sb.copies + sb.tries) - (sa.copies + sa.tries);
        });
        break;
      case 'most-copied':
        sorted.sort((a, b) => getStat(b.id).copies - getStat(a.id).copies);
        break;
      case 'most-tried':
        sorted.sort((a, b) => getStat(b.id).tries - getStat(a.id).tries);
        break;
    }
    return sorted;
  }, [templates, activeCategory, sortBy, templateStats]);

  // Optimistic stat update helper
  const bumpStat = useCallback((id: number, action: 'copy' | 'try') => {
    setTemplateStats(prev => {
      const key = String(id);
      const old = prev[key] || { copies: 0, tries: 0 };
      return { ...prev, [key]: { ...old, [action === 'copy' ? 'copies' : 'tries']: (action === 'copy' ? old.copies : old.tries) + 1 } };
    });
    trackTemplateUsage(id, action);
  }, []);

  // Gallery handlers
  const handleOpenDetail = useCallback((template: Template) => {
    setSelectedTemplate(template);
    setDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
  }, []);

  const handleTryIt = useCallback(() => {
    if (!selectedTemplate) return;
    bumpStat(selectedTemplate.id, 'try');
    setPrompt(selectedTemplate.prompt);
    setUploadedImages(new Array(selectedTemplate.inputsNeeded).fill(null));
    setResult(null);
    setError(null);
    setDetailOpen(false);
    setTryItOpen(true);
  }, [selectedTemplate, bumpStat]);

  const handleCloseTryIt = useCallback(() => {
    setTryItOpen(false);
  }, []);

  // Image handlers
  const handleImageUpload = useCallback((index: number, base64: string, mimeType: string) => {
    setUploadedImages(prev => {
      const next = [...prev];
      next[index] = { base64, mimeType };
      return next;
    });
  }, []);

  const handleImageRemove = useCallback((index: number) => {
    setUploadedImages(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }, []);

  // Can generate check
  const canGenerate = useMemo(() => {
    if (isGenerating) return false;
    if (!prompt.trim()) return false;
    if (selectedTemplate && selectedTemplate.inputsNeeded > 0) {
      return uploadedImages.every(img => img !== null);
    }
    return true;
  }, [isGenerating, prompt, selectedTemplate, uploadedImages]);

  // Generate handler
  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      let response;
      if (selectedTemplate && selectedTemplate.inputsNeeded > 0) {
        const validImages = uploadedImages.filter(img => img !== null) as { base64: string; mimeType: string }[];
        response = await editImage(prompt, validImages);
      } else if (uploadedImages.some(img => img !== null)) {
        const validImages = uploadedImages.filter(img => img !== null) as { base64: string; mimeType: string }[];
        response = await editImage(prompt, validImages);
      } else {
        response = await generateImageFromText(prompt);
      }
      setResult(response);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsGenerating(false);
    }
  }, [canGenerate, selectedTemplate, uploadedImages, prompt]);

  // Admin delete handler
  const handleTemplateDeleted = useCallback((id: number) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  // Share prompt handler
  const handleSubmitSuccess = useCallback((newTemplate: Template) => {
    setTemplates(prev => [...prev, { ...newTemplate, source: 'custom' }]);
    setCategories(prev => {
      const updated = [...new Set([...prev, newTemplate.category])].sort();
      return updated;
    });
  }, []);

  return (
    <>
      <GalleryShell
        onOpenSettings={() => setSettingsOpen(true)}
        onSharePrompt={() => setShareOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
        hasCustomApi={hasCustomApi}
      >
        <FilterBar
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          templateCounts={templateCounts}
          totalCount={templates.length}
          onOpenAISearch={() => setSearchOpen(true)}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
        <GalleryGrid
          templates={filtered}
          onSelectTemplate={handleOpenDetail}
          isLoading={isLoadingTemplates}
          templateStats={templateStats}
        />
      </GalleryShell>

      <TemplateDetailDialog
        template={selectedTemplate}
        isOpen={detailOpen}
        onClose={handleCloseDetail}
        onTryIt={handleTryIt}
        stats={selectedTemplate ? templateStats[String(selectedTemplate.id)] : undefined}
        onTrackCopy={selectedTemplate ? () => bumpStat(selectedTemplate.id, 'copy') : undefined}
      />

      <TryItDialog
        template={selectedTemplate}
        isOpen={tryItOpen}
        onClose={handleCloseTryIt}
        prompt={prompt}
        onPromptChange={setPrompt}
        uploadedImages={uploadedImages}
        onImageUpload={handleImageUpload}
        onImageRemove={handleImageRemove}
        onGenerate={handleGenerate}
        canGenerate={canGenerate}
        isGenerating={isGenerating}
        result={result}
        error={error}
      />

      <SubmitPromptDialog
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        categories={categories}
        onSubmitSuccess={handleSubmitSuccess}
      />

      <AdminDialog
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        onTemplateDeleted={handleTemplateDeleted}
      />

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <LLMSearchDialog
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        templates={templates}
        onSelectTemplate={handleOpenDetail}
      />
    </>
  );
};

export default App;
