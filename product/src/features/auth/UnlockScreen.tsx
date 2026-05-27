import React, { useState } from 'react';
import { Shield, Key, RefreshCw } from 'lucide-react';

interface UnlockScreenProps {
  onUnlock: (password: string) => Promise<boolean>;
  onClearAll: () => void;
}

export const UnlockScreen: React.FC<UnlockScreenProps> = ({ onUnlock, onClearAll }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || isUnlocking) return;

    setIsUnlocking(true);
    setError('');

    // 少しウェイトを置いて滑らかな遷移を演出
    setTimeout(async () => {
      const success = await onUnlock(password);
      if (!success) {
        setError('復号に失敗しました。パスワードが正しくないか、データが破損しています。');
        setIsUnlocking(false);
      }
    }, 800);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'var(--bg-deep)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      backgroundImage: 'radial-gradient(rgba(6, 182, 212, 0.08) 1.5px, transparent 0)',
      backgroundSize: '32px 32px'
    }}>
      <div 
        className="glass-panel glow-card fade-in" 
        style={{ 
          width: '400px', 
          padding: '36px', 
          background: 'var(--bg-surface)', 
          textAlign: 'center' 
        }}
      >
        {/* アイコン */}
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          background: 'var(--accent-cyan-bg)',
          border: '1px solid var(--accent-cyan)',
          margin: '0 auto 20px',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Shield size={28} style={{ color: 'var(--accent-cyan)' }} />
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
          MLA 安全な保管庫
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '6px', marginBottom: '24px' }}>
          あなたの人生ビジョンデータは強力に暗号化されています。<br />
          保管庫の鍵（パスワード）を入力してアンロックしてください。
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="password" 
              className="form-input" 
              placeholder="復号パスワードを入力..." 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isUnlocking}
              style={{ 
                height: '44px', 
                borderRadius: '8px', 
                textAlign: 'center', 
                fontSize: '16px',
                letterSpacing: '0.1em'
              }}
            />
          </div>

          {error && (
            <div style={{ color: 'var(--accent-red)', fontSize: '11px', fontWeight: 'bold' }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isUnlocking || !password.trim()}
            style={{ 
              height: '44px', 
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isUnlocking ? (
              <>
                <RefreshCw size={16} className="spin-animation" />
                データを復号中...
              </>
            ) : (
              <>
                <Key size={16} />
                保管庫をアンロック
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <span 
            style={{ fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer' }}
            onClick={() => {
              if (confirm('警告: データを完全に消去して初期状態に戻しますか？この操作により現在保存されている暗号化データは完全に破棄されます。')) {
                onClearAll();
                window.location.reload();
              }
            }}
          >
            パスワードを紛失した場合はこちら（データリセット）
          </span>
        </div>
      </div>

      <style>{`
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
