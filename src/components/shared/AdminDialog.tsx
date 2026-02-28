import React, { useState, useEffect, useCallback } from 'react';
import { Template } from '../../types';

interface AdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateDeleted: (id: number) => void;
}

const ADMIN_KEY = 'cis-admin-session';

const AdminDialog: React.FC<AdminDialogProps> = ({ isOpen, onClose, onTemplateDeleted }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Restore session from sessionStorage
  useEffect(() => {
    if (isOpen) {
      const saved = sessionStorage.getItem(ADMIN_KEY);
      if (saved) {
        setIsAuthenticated(true);
      }
    }
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setLoginError('');
      setDeleteConfirmId(null);
    }
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (deleteConfirmId !== null) {
          setDeleteConfirmId(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose, deleteConfirmId]);

  const getAdminPassword = () => sessionStorage.getItem(ADMIN_KEY) || '';

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/templates', {
        headers: { 'x-admin-password': getAdminPassword() },
      });
      if (!res.ok) {
        if (res.status === 401) {
          setIsAuthenticated(false);
          sessionStorage.removeItem(ADMIN_KEY);
          return;
        }
        throw new Error('Failed to fetch');
      }
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch {
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load templates when authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      fetchTemplates();
    }
  }, [isAuthenticated, isOpen, fetchTemplates]);

  const handleLogin = async () => {
    if (!password.trim()) return;
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });
      if (res.ok) {
        sessionStorage.setItem(ADMIN_KEY, password.trim());
        setIsAuthenticated(true);
      } else {
        setLoginError('Mật khẩu không đúng.');
      }
    } catch {
      setLoginError('Lỗi kết nối server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/templates/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': getAdminPassword() },
      });
      if (res.ok) {
        setTemplates(prev => prev.filter(t => t.id !== id));
        onTemplateDeleted(id);
        setDeleteConfirmId(null);
      }
    } catch {
      // silently fail
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_KEY);
    setIsAuthenticated(false);
    setTemplates([]);
    setPassword('');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-scrim/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface-container-high rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-elevation-3 animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface-container-high/95 backdrop-blur-lg flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-error/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-error" style={{ fontSize: 20 }}>admin_panel_settings</span>
            </div>
            <h2 className="text-[22px] font-normal text-on-surface leading-7">Admin Panel</h2>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="h-9 px-3 inline-flex items-center gap-1.5 rounded-full text-xs font-medium text-on-surface-variant hover:bg-on-surface/[0.08] transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
                Đăng xuất
              </button>
            )}
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-on-surface/[0.08] active:bg-on-surface/[0.12] transition-colors text-on-surface-variant shrink-0"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>close</span>
            </button>
          </div>
        </div>

        {!isAuthenticated ? (
          /* Login form */
          <div className="px-6 pb-8 pt-4">
            <div className="max-w-sm mx-auto text-center">
              <span className="material-symbols-outlined text-on-surface-variant mb-4 block" style={{ fontSize: 48 }}>lock</span>
              <p className="text-sm text-on-surface-variant mb-6">Nhập mật khẩu admin để quản lý prompt community.</p>
              <div className="space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setLoginError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="Mật khẩu admin"
                  autoFocus
                  className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface text-center placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 ease-md-standard"
                />
                {loginError && (
                  <p className="text-sm text-error">{loginError}</p>
                )}
                <button
                  onClick={handleLogin}
                  disabled={!password.trim() || isLoggingIn}
                  className="h-12 px-8 w-full flex items-center justify-center gap-2 rounded-full bg-primary text-on-primary font-medium text-sm shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-300 ease-spring disabled:opacity-40 disabled:pointer-events-none"
                >
                  {isLoggingIn ? 'Đang xác thực...' : 'Đăng nhập'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Template list */
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] text-on-surface-variant font-medium uppercase tracking-widest">
                Community Prompts ({templates.length})
              </p>
              <button
                onClick={fetchTemplates}
                className="h-8 px-3 inline-flex items-center gap-1.5 rounded-full text-xs font-medium text-primary hover:bg-primary/[0.08] transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>refresh</span>
                Refresh
              </button>
            </div>

            {isLoading ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              </div>
            ) : templates.length === 0 ? (
              <div className="py-16 text-center">
                <span className="material-symbols-outlined text-on-surface-variant/40 block mb-2" style={{ fontSize: 48 }}>inbox</span>
                <p className="text-sm text-on-surface-variant">Chưa có prompt community nào.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map(t => (
                  <div
                    key={t.id}
                    className="bg-surface-container rounded-2xl border border-outline-variant/50 p-4 transition-colors hover:border-outline-variant"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-on-surface truncate">{t.title}</h3>
                          <span className="text-[11px] text-on-surface-variant shrink-0">#{t.id}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="h-5 inline-flex items-center px-2 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-medium">
                            {t.category}
                          </span>
                          <span className="text-xs text-on-surface-variant">@{t.author}</span>
                          {t.inputsNeeded > 0 && (
                            <span className="text-[10px] text-outline flex items-center gap-0.5">
                              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>photo_library</span>
                              {t.inputsNeeded} input
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant/70 font-mono line-clamp-2 leading-relaxed">{t.prompt}</p>

                        {/* Image previews */}
                        {(t.outputImage || t.inputImages.length > 0) && (
                          <div className="flex gap-2 mt-3">
                            {t.inputImages.map((src, i) => (
                              <img key={`in-${i}`} src={src} alt={`Input ${i + 1}`} className="w-12 h-12 rounded-lg object-cover border border-outline-variant/50" />
                            ))}
                            {t.outputImage && (
                              <img src={t.outputImage} alt="Output" className="w-12 h-12 rounded-lg object-cover ring-1 ring-primary/30" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => setDeleteConfirmId(t.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors shrink-0"
                        title="Xoá prompt"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                      </button>
                    </div>

                    {/* Delete confirmation */}
                    {deleteConfirmId === t.id && (
                      <div className="mt-3 pt-3 border-t border-outline-variant/50 flex items-center justify-between">
                        <p className="text-xs text-error">Xác nhận xoá prompt này?</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="h-8 px-4 rounded-full text-xs font-medium text-on-surface-variant hover:bg-on-surface/[0.08] transition-colors"
                          >
                            Huỷ
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            disabled={isDeleting}
                            className="h-8 px-4 rounded-full text-xs font-medium bg-error text-on-error hover:shadow-elevation-1 transition-all disabled:opacity-50"
                          >
                            {isDeleting ? 'Đang xoá...' : 'Xoá'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDialog;
