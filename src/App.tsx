
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Template } from './types';
import { fetchTemplates } from './services/templateService';
import { editImage, generateImageFromText, loadApiSettings } from './services/geminiService';
import GalleryShell from './components/layout/GalleryShell';
import FilterBar from './components/gallery/FilterBar';
import GalleryGrid from './components/gallery/GalleryGrid';
import TemplateDetailDialog from './components/gallery/TemplateDetailDialog';
import TryItDialog from './components/gallery/TryItDialog';
import SettingsModal from './components/shared/SettingsModal';
import SubmitPromptDialog from './components/gallery/SubmitPromptDialog';
import AdminDialog from './components/shared/AdminDialog';

const App: React.FC = () => {
  // Template data
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  // Gallery filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

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
  const [hasCustomApi, setHasCustomApi] = useState(false);

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

  // Filtered templates
  const filtered = useMemo(() => {
    let result = templates;
    if (activeCategory !== 'All') {
      result = result.filter(t => t.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.author.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.prompt.toLowerCase().includes(q)
      );
    }
    return result;
  }, [templates, activeCategory, searchQuery]);

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
    setPrompt(selectedTemplate.prompt);
    setUploadedImages(new Array(selectedTemplate.inputsNeeded).fill(null));
    setResult(null);
    setError(null);
    setDetailOpen(false);
    setTryItOpen(true);
  }, [selectedTemplate]);

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
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          templateCounts={templateCounts}
          totalCount={templates.length}
        />
        <GalleryGrid
          templates={filtered}
          onSelectTemplate={handleOpenDetail}
          isLoading={isLoadingTemplates}
        />
      </GalleryShell>

      <TemplateDetailDialog
        template={selectedTemplate}
        isOpen={detailOpen}
        onClose={handleCloseDetail}
        onTryIt={handleTryIt}
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
    </>
  );
};

export default App;
