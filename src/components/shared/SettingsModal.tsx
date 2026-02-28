import React, { useState, useEffect } from 'react';
import { ApiSettings, loadApiSettings, saveApiSettings } from '../../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_MODELS = {
  editModel: 'gemini-2.5-flash-image',
  generateModel: 'imagen-4.0-generate-001',
  searchModel: 'gemini-2.5-flash',
};

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<ApiSettings>({
    apiKey: '', baseUrl: '', editModel: '', generateModel: '', searchModel: ''
  });
  const [saved, setSaved] = useState(false);
  const [showModels, setShowModels] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loaded = loadApiSettings();
      setSettings(loaded);
      setSaved(false);
      // Auto-expand model section if any custom model is configured
      setShowModels(!!(loaded.editModel || loaded.generateModel || loaded.searchModel));
    }
  }, [isOpen]);

  const handleSave = () => {
    saveApiSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    const empty: ApiSettings = { apiKey: '', baseUrl: '', editModel: '', generateModel: '', searchModel: '' };
    setSettings(empty);
    saveApiSettings(empty);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!isOpen) return null;

  const inputClass = "w-full bg-surface-container border border-outline-variant rounded-sm px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors duration-200 font-mono";

  return (
    <div
      className="fixed inset-0 bg-scrim/40 z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface-container-high rounded-xl w-full max-w-lg shadow-elevation-3 animate-scale-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 shrink-0">
          <h2 className="text-[22px] font-normal text-on-surface">API Settings</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-on-surface/[0.08] transition-colors duration-200 text-on-surface-variant"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>close</span>
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="px-6 pb-4 space-y-4 overflow-y-auto flex-1">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Cấu hình API endpoint và key để kết nối với nhà cung cấp model gen hình.
            Để trống sẽ sử dụng giá trị mặc định từ server.
          </p>

          {/* Base URL */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-on-surface-variant">Base URL</label>
            <input
              type="text"
              value={settings.baseUrl}
              onChange={(e) => setSettings(s => ({ ...s, baseUrl: e.target.value }))}
              placeholder="https://generativelanguage.googleapis.com"
              className={inputClass}
            />
            <p className="text-xs text-outline">
              Endpoint API. VD: https://generativelanguage.googleapis.com
            </p>
          </div>

          {/* API Key */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-on-surface-variant">API Key</label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => setSettings(s => ({ ...s, apiKey: e.target.value }))}
              placeholder="Nhập API key..."
              className={inputClass}
            />
            <p className="text-xs text-outline">
              Lưu trong trình duyệt (localStorage), gửi qua header cho server proxy.
            </p>
          </div>

          {/* Model Configuration — collapsible */}
          <div className="border border-outline-variant/50 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowModels(!showModels)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-on-surface-variant hover:bg-on-surface/[0.04] transition-colors duration-200"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>tune</span>
                Model Configuration
              </span>
              <span className="material-symbols-outlined transition-transform duration-200" style={{ fontSize: 18, transform: showModels ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                expand_more
              </span>
            </button>

            {showModels && (
              <div className="px-4 pb-4 space-y-3 border-t border-outline-variant/30">
                <p className="text-xs text-outline pt-3">
                  Tên model cho từng tính năng. Để trống sẽ dùng model mặc định.
                </p>

                {/* Edit Model */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-on-surface-variant">Image Edit Model</label>
                  <input
                    type="text"
                    value={settings.editModel}
                    onChange={(e) => setSettings(s => ({ ...s, editModel: e.target.value }))}
                    placeholder={DEFAULT_MODELS.editModel}
                    className={inputClass}
                  />
                </div>

                {/* Generate Model */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-on-surface-variant">Image Generate Model</label>
                  <input
                    type="text"
                    value={settings.generateModel}
                    onChange={(e) => setSettings(s => ({ ...s, generateModel: e.target.value }))}
                    placeholder={DEFAULT_MODELS.generateModel}
                    className={inputClass}
                  />
                </div>

                {/* Search Model */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-on-surface-variant">AI Search Model</label>
                  <input
                    type="text"
                    value={settings.searchModel}
                    onChange={(e) => setSettings(s => ({ ...s, searchModel: e.target.value }))}
                    placeholder={DEFAULT_MODELS.searchModel}
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant shrink-0">
          <div className="text-sm">
            {saved && (
              <span className="text-primary animate-fade-in inline-flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
                Đã lưu!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="h-10 px-6 text-sm font-medium text-primary rounded-full hover:bg-primary/[0.08] transition-colors duration-200"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              className="h-10 px-6 text-sm font-medium text-on-primary bg-primary rounded-full hover:shadow-md hover:shadow-primary/20 transition-card"
            >
              {saved ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
                  Đã lưu
                </span>
              ) : 'Lưu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
