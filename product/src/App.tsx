import React, { useState } from 'react';
import { AppProvider, useAppState } from './hooks/useAppState';
import { Dashboard } from './features/dashboard/Dashboard';
import { LifeArchitecture } from './features/vision/LifeArchitecture';
import { TimeTracker } from './features/dashboard/TimeTracker';
import { AiAssistant } from './features/ai/AiAssistant';
import { Settings } from './features/settings/Settings';
import { UnlockScreen } from './features/auth/UnlockScreen';

import { 
  LayoutDashboard, Compass, Clock, Sparkles, 
  Settings as SettingsIcon, Shield, ShieldAlert, 
  Menu, X, Sparkle
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { state, isEncryptedData, isUnlocked, unlockData, clearAllData } = useAppState();
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1. 暗号化されており、まだアンロック（復号）されていない場合はアンロック画面を表示
  if (isEncryptedData && !isUnlocked) {
    return <UnlockScreen onUnlock={unlockData} onClearAll={clearAllData} />;
  }

  // アクティブなビューの描画
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onViewChange={(view) => setActiveView(view)} />;
      case 'canvas':
        return <LifeArchitecture />;
      case 'tracker':
        return <TimeTracker />;
      case 'ai':
        return <AiAssistant />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onViewChange={(view) => setActiveView(view)} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
    { id: 'canvas', label: '目標マップ', icon: Compass },
    { id: 'tracker', label: 'タイムロガー', icon: Clock },
    { id: 'ai', label: 'AIコンシェルジュ', icon: Sparkles },
    { id: 'settings', label: '環境設定', icon: SettingsIcon },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-deep)' }}>
      
      {/* 1. PC用サイドバー */}
      <aside className="glass-panel" style={{
        width: '260px',
        borderRadius: 0,
        borderRight: '1px solid var(--glass-border)',
        borderTop: 'none',
        borderBottom: 'none',
        borderLeft: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        position: 'fixed',
        height: '100vh',
        zIndex: 100,
        flexShrink: 0,
        backgroundColor: 'var(--bg-surface)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* ロゴ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'var(--grad-primary)',
              display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}>
              <Sparkle style={{ color: 'var(--text-inverse)' }} size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>My Life</h2>
              <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 'bold', textTransform: 'uppercase' }}>Architecture</span>
            </div>
          </div>

          {/* ナビゲーションリスト */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveView(item.id); setMobileMenuOpen(false); }}
                  className="btn"
                  style={{
                    justifyContent: 'flex-start',
                    background: isActive ? 'var(--accent-cyan-bg)' : 'transparent',
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    border: isActive ? '1px solid hsla(180, 100%, 50%, 0.15)' : '1px solid transparent',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    width: '100%',
                    transition: 'all 0.15s'
                  }}
                >
                  <Icon size={18} style={{ color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* 下部ステータス（暗号化インジケーター等） */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 8px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'hsla(240, 15%, 5%, 0.3)', padding: '10px 12px', borderRadius: '8px',
            fontSize: '11px', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)'
          }}>
            {state.settings.useEncryption ? (
              <>
                <Shield size={14} style={{ color: 'var(--accent-green)' }} />
                <span>データ暗号化: <strong>有効</strong></span>
              </>
            ) : (
              <>
                <ShieldAlert size={14} style={{ color: 'var(--accent-amber)' }} />
                <span>データ暗号化: <strong>未有効</strong></span>
              </>
            )}
          </div>
          
          <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>
            v1.0.0 © MLA Team
          </div>
        </div>
      </aside>

      {/* モバイル用ヘッダー */}
      <header style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '60px',
        background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)',
        display: 'none', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 20px', zIndex: 90
      }} className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkle style={{ color: 'var(--accent-cyan)' }} size={20} />
          <h2 style={{ fontSize: '15px' }}>My Life Architecture</h2>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* モバイル用スライドインメニュー */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed', top: '60px', left: 0, width: '100%', height: 'calc(100vh - 60px)',
          background: 'var(--bg-deep)', zIndex: 89, padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px'
        }} className="mobile-menu">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveView(item.id); setMobileMenuOpen(false); }}
                className="btn"
                style={{
                  justifyContent: 'flex-start',
                  background: isActive ? 'var(--accent-cyan-bg)' : 'transparent',
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  padding: '16px',
                  width: '100%'
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 2. メインコンテンツエリア */}
      <main style={{
        flexGrow: 1,
        marginLeft: '260px', // サイドバー分マージン
        paddingTop: '0px',
        minHeight: '100vh',
        transition: 'all 0.25s'
      }} className="main-content-area">
        {renderView()}
      </main>

      {/* モバイル・レスポンシブ用のメディアクエリスタイル */}
      <style>{`
        @media (max-width: 1024px) {
          aside {
            display: none !important;
          }
          .mobile-header {
            display: flex !important;
          }
          .main-content-area {
            margin-left: 0 !important;
            padding-top: 60px !important;
          }
        }
      `}</style>

    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
