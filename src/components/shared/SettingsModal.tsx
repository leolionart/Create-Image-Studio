import React, { useState, useEffect } from 'react';
import { ApiSettings, loadApiSettings, saveApiSettings } from '../../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<ApiSettings>({ apiKey: '', baseUrl: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(loadApiSettings());
      setSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    saveApiSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-scrim/40 z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={handleKeyDown}
    >
      <div className="bg-surface-container-high rounded-xl w-full max-w-lg shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-[22px] font-normal text-on-surface">API Settings</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-on-surface/[0.08] transition-colors duration-200 ease-md-standard text-on-surface-variant"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-4 space-y-4">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Cấu hình API endpoint và key để kết nối với nhà cung cấp model gen hình.
            Để trống sẽ sử dụng giá trị mặc định từ server.
          </p>

          {/* Base URL */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-on-surface-variant">Base URL</label>
            <input
              type="url"
              value={settings.baseUrl}
              onChange={(e) => setSettings(s => ({ ...s, baseUrl: e.target.value }))}
              placeholder="https://generativelanguage.googleapis.com"
              className="w-full bg-surface-container border border-outline-variant rounded-xs px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 ease-md-standard font-mono"
            />
            <p className="text-xs text-outline">
              VD: https://generativelanguage.googleapis.com, https://proxy.naai.studio
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
              className="w-full bg-surface-container border border-outline-variant rounded-xs px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 ease-md-standard font-mono"
            />
            <p className="text-xs text-outline">
              API key được lưu trong trình duyệt (localStorage) và gửi qua header cho server proxy.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant">
          <div className="text-sm text-on-surface-variant">
            {saved && (
              <span className="text-primary animate-fade-in">Đã lưu!</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSettings({ apiKey: '', baseUrl: '' });
                saveApiSettings({ apiKey: '', baseUrl: '' });
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
              }}
              className="h-10 px-6 text-sm font-medium text-primary rounded-full hover:bg-primary/[0.08] transition-colors duration-200 ease-md-standard"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              className="h-10 px-6 text-sm font-medium text-on-primary bg-primary rounded-full hover:shadow-md hover:shadow-primary/20 transition-all duration-200 ease-md-standard"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
