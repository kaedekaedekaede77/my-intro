import React, { useState } from 'react';
import { useAppState } from '../../hooks/useAppState';
import { exportToMarkdown, exportToJson, exportToCsv, downloadFile } from '../../utils/export';
import { 
  Key, Shield, Download, Trash2, 
  Moon, Sun, Eye, EyeOff 
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { 
    state, setTheme, updateAiSettings, 
    setEncryptionPassword, clearAllData,
    isEncryptedData
  } = useAppState();

  // APIキーフォーム
  const [apiKey, setApiKey] = useState(state.settings.ai.apiKey);
  const [provider, setProvider] = useState(state.settings.ai.provider);
  const [modelName, setModelName] = useState(state.settings.ai.modelName);
  const [showKey, setShowKey] = useState(false);

  // 暗号化フォーム
  const [useEncryption, setUseEncryption] = useState(state.settings.useEncryption);
  const [encryptPassword, setEncryptPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // APIキー設定保存
  const handleSaveAi = (e: React.FormEvent) => {
    e.preventDefault();
    updateAiSettings({ apiKey, provider, modelName });
    alert('AIアシスタントの連携設定を保存しました。');
  };

  // 暗号化設定保存
  const handleSaveEncryption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (useEncryption) {
      if (!encryptPassword) {
        alert('暗号化を有効にするにはパスワードを入力してください。');
        return;
      }
      const success = await setEncryptionPassword(encryptPassword);
      if (success) {
        alert('データを強力に暗号化しました。以降、ブラウザ内に安全に暗号化された状態で保存されます。');
        setEncryptPassword('');
      }
    } else {
      // 暗号化解除
      if(confirm('暗号化を解除し、通常保存（平文）に戻しますか？')) {
        await setEncryptionPassword(null);
        alert('暗号化を解除しました。');
      }
    }
  };

  // ファイルインポート処理
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.visions && parsed.roadmaps && parsed.actionPlans) {
          // 保存
          const { settings, ...coreData } = state;
          const merged = { ...coreData, ...parsed };
          localStorage.setItem('mla_data', JSON.stringify(merged));
          alert('人生計画（JSONデータ）を正常にインポートしました。反映のため画面をリロードします。');
          window.location.reload();
        } else {
          alert('インポートされたJSONのフォーマットが正しくありません。');
        }
      } catch (err) {
        alert('JSONファイルの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
  };

  // エクスポートトリガー
  const triggerMarkdownExport = () => {
    const content = exportToMarkdown(state);
    downloadFile(content, 'My_Life_Architecture_Plan.md', 'text/markdown;charset=utf-8;');
  };

  const triggerJsonExport = () => {
    const content = exportToJson(state);
    downloadFile(content, 'My_Life_Architecture_Backup.json', 'application/json;charset=utf-8;');
  };

  const triggerCsvExport = () => {
    const content = exportToCsv(state);
    downloadFile(content, 'My_Life_TimeTracker_Logs.csv', 'text/csv;charset=utf-8;');
  };

  return (
    <div className="fade-in" style={{ padding: '24px', maxWidth: '850px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield style={{ color: 'var(--accent-cyan)' }} /> コントロール＆システム設定
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
          テーマの変更、AI連携キーの設定、ローカルデータの暗号化、MarkdownやCSVのエクスポートを管理します。
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* テーマ・一般 */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🎨 ビジュアル＆システムテーマ
          </h3>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              className={`btn ${state.settings.theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTheme('dark')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}
            >
              <Moon size={16} /> ディープスペース・ダーク (Default)
            </button>
            <button 
              className={`btn ${state.settings.theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTheme('light')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}
            >
              <Sun size={16} /> クリーン・ライトモード
            </button>
          </div>
        </div>

        {/* AIアシスタント APIキー */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key style={{ color: 'var(--accent-purple)' }} size={18} /> インテリジェントAI接続設定
          </h3>
          <form onSubmit={handleSaveAi} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>AI プロバイダー</label>
                <select 
                  className="form-select"
                  value={provider}
                  onChange={(e) => {
                    const prov = e.target.value as any;
                    setProvider(prov);
                    setModelName(prov === 'gemini' ? 'gemini-1.5-flash' : prov === 'openai' ? 'gpt-4o-mini' : 'mock');
                  }}
                >
                  <option value="mock">ローカル疑似AIエンジン (キー不要・無料)</option>
                  <option value="gemini">Google Gemini API (推奨)</option>
                  <option value="openai">OpenAI API (GPT-4o)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>モデル名</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  disabled={provider === 'mock'}
                />
              </div>
            </div>

            {provider !== 'mock' && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>API キー</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showKey ? 'text' : 'password'} 
                    className="form-input"
                    placeholder="APIキーを貼り付けてください"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    required
                    style={{ paddingRight: '40px' }}
                  />
                  <div 
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }}
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                  ※ キーはブラウザ内のローカルストレージにのみ保存され、開発サーバー等へ送信されることはありません。安全に直接プロバイダーのAPIを叩きます。
                </span>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
              AI接続設定を保存
            </button>
          </form>
        </div>

        {/* データセキュリティ・ローカル暗号化 */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield style={{ color: 'var(--accent-cyan)' }} size={18} /> 個人ライフデータの強力な保護（暗号化）
          </h3>
          
          <div style={{ background: 'var(--bg-deep)', padding: '14px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            🔒 <strong>ローカル暗号化テクノロジー:</strong><br />
            パスワードを設定すると、ブラウザに保存される目標データやタイムログが Web Crypto API (AES-GCM 256-bit) により完全に暗号化されます。パスワードを知らない限り、ブラウザのキャッシュやローカルファイルをのぞき見されても解読は不可能です。
          </div>

          <form onSubmit={handleSaveEncryption} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                id="encryptToggle"
                checked={useEncryption} 
                onChange={(e) => {
                  setUseEncryption(e.target.checked);
                  if(!e.target.checked) {
                    setEncryptPassword('');
                  }
                }}
              />
              <label htmlFor="encryptToggle" style={{ fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                ブラウザデータの AES 暗号化を有効にする
              </label>
            </div>

            {useEncryption && !isEncryptedData && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>暗号化パスワード</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className="form-input"
                    placeholder="復号用の秘密のパスワードを入力"
                    value={encryptPassword}
                    onChange={(e) => setEncryptPassword(e.target.value)}
                    required
                    style={{ paddingRight: '40px' }}
                  />
                  <div 
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--accent-amber)', marginTop: '6px', display: 'block' }}>
                  ⚠️ 警告: パスワードを紛失すると、登録データを復元することは一切できなくなります。必ず忘れないパスワードを設定してください。
                </span>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
              暗号化設定を更新
            </button>
          </form>
        </div>

        {/* データのインポート・エクスポート */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} /> データのエクスポート ＆ ポータビリティ
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            
            <button className="btn btn-secondary" onClick={triggerMarkdownExport} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', alignItems: 'center' }}>
              <Download size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Markdown で出力</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>人生計画書として閲覧・Notion転記</span>
            </button>

            <button className="btn btn-secondary" onClick={triggerJsonExport} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', alignItems: 'center' }}>
              <Download size={18} style={{ color: 'var(--accent-purple)' }} />
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>JSON 完全バックアップ</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>他デバイスへのデータ移行・復元用</span>
            </button>

            <button className="btn btn-secondary" onClick={triggerCsvExport} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', alignItems: 'center' }}>
              <Download size={18} style={{ color: 'var(--accent-green)' }} />
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>CSV 時間ログ出力</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>活動実績データをExcelやスプレッドシートで分析</span>
            </button>

          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>📤 バックアップJSONのインポート</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input 
                type="file" 
                accept=".json"
                onChange={handleImportJson}
                style={{ fontSize: '13px' }}
              />
            </div>
          </div>
        </div>

        {/* データの危険ゾーン */}
        <div className="glass-panel" style={{ padding: '24px', borderColor: 'hsla(0, 84%, 60%, 0.3)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-red)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ デンジャー・ゾーン (危険領域)
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            ブラウザ内のデータを完全に削除します。この操作は取り消すことができません。必要であればエクスポートを行ってからリセットしてください。
          </p>
          <button 
            className="btn btn-danger" 
            onClick={() => {
              if (confirm('本当にすべての目標、マイルストーン、タイムトラッキングログを消去しますか？（消去後、デフォルトのデモデータが再ロードされます）')) {
                clearAllData();
                alert('データをリセットしました。');
              }
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Trash2 size={16} /> すべてのデータをクリアしてリセット
          </button>
        </div>

      </div>

    </div>
  );
};
