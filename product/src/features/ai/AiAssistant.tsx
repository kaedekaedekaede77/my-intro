import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../../hooks/useAppState';
import { detectBottlenecks } from '../../utils/ai';
import { Sparkles, Send, Bot, User, Trash2, RefreshCw } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AiAssistant: React.FC = () => {
  const { state } = useAppState();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-init',
        sender: 'ai',
        text: `こんにちは！私はあなたの人生設計専属コーチAI『Life Architecture Coach』です。\n\n「〇〇歳までに〇〇を達成したいがどうブレイクダウンすべきか」「最近タスクが遅れ気味なボトルネックをどう解消すべきか」など、あなたの人生設計の壁打ちをお手伝いします。何でもご相談ください！`,
        timestamp: new Date().toLocaleTimeString().substring(0, 5)
      }
    ];
  });

  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // スクロール底上げ
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // クイック質問の実行
  const handleQuickQuestion = (question: string) => {
    setInputMsg(question);
  };

  // メッセージの送信
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || isLoading) return;

    const userText = inputMsg.trim();
    setInputMsg('');
    
    // ユーザーメッセージを追加
    const userMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString().substring(0, 5)
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let aiResponseText = '';

      if (state.settings.ai.provider === 'mock' || !state.settings.ai.apiKey) {
        // --- モックAIの高度な分岐ロジック ---
        await new Promise(resolve => setTimeout(resolve, 1500)); // プレミアムローディング演出
        const text = userText.toLowerCase();

        if (text.includes('起業') || text.includes('ビジネス') || text.includes('プロダクト')) {
          aiResponseText = `素晴らしい起業ビジョンですね！起業において最もありがちなボトルネックは「プロダクトを完璧に作りすぎてリリースが遅れ、誰も欲しがらないものが完成する」ことです。\n\nまず最初の3ヶ月のロードマップとして、【顧客インタビュー20人】と【ペーパープロトタイプによる提供価値検証】をアクションプラン（L3）に組み込むことを強く推奨します。日常タスク（L4）には「競合リサーチ週に2時間」を追加してみてください。`;
        } else if (text.includes('英語') || text.includes('語学') || text.includes('toeic') || text.includes('留学')) {
          aiResponseText = `語学学習ですね。語学は「累積投資時間」が結果に比例する極めてデータ駆動型の分野です。\n\n計画を絵に描いた餅にしないためには、単に「英語をやる」ではなく、「毎朝7:30〜8:00のシャドーイング（L4）」のように、日常の【既存の習慣（歯磨きや通勤）の直後】に完全にドッキングさせて自動化することです。まずは今週の目標アロケーションを「週3.5時間」として、朝の枠を固定しましょう！`;
        } else if (text.includes('ボトルネック') || text.includes('遅れ') || text.includes('計画')) {
          const activeBns = detectBottlenecks(state);
          if (activeBns.length > 0) {
            aiResponseText = `現在、あなたのライフ・アーキテクチャから **${activeBns.length} 件のボトルネック** がスキャンされています。特に「${activeBns[0].title}」について、計画された時間投資（アロケーション）に対して実際のトラッキング実績が大幅に不足しています。\n\n解決策として、来週分の目標投資時間を一旦半分に減らし、確実にクリアできるハードル（例: 毎日15分）に引き下げることで「習慣の慣性」を再起動させることをおすすめします。いかがでしょうか？`;
          } else {
            aiResponseText = `素晴らしいことに、現在のデータ分析からは重大な計画の遅延や投資不足（ボトルネック）は検知されていません！非常に均整の取れた進捗です。この良好な軌道を維持するため、日曜夜に15分間の「振り返り時間」をルーティンタスクとして維持してください。`;
          }
        } else {
          aiResponseText = `ご質問ありがとうございます！人生ビジョン「${state.visions[0]?.title || '目標'}」の実現に向けて、計画を具体的な「日常ルーティン（L4）」にまで細分化できているでしょうか？\n\n大きな目標も、突き詰めれば「今日の1時間」の積み重ねでしかありません。もしよろしければ、現在最も障壁になっていること（時間が取れない、何から手をつけていいか分からない、など）を教えていただけますか？さらに具体的な分解アプローチを提案します。`;
        }
      } else {
        // --- リアル Gemini API 連携 ---
        const activeBns = detectBottlenecks(state);
        const prompt = `
あなたは優秀な人生設計・キャリアコーチAI『Life Architecture Coach』です。
ユーザーは「My Life Architecture」という、ビジョン(超長期)→ロードマップ(中期)→アクションプラン(短期KPI)→タスク(日常)の4階層ツリーで人生を管理するシステムを使っています。

【現在のユーザーの目標状況】
- ビジョン: ${JSON.stringify(state.visions.map(v => v.title))}
- 直近のボトルネック: ${JSON.stringify(activeBns.map(b => b.description))}

ユーザーからの質問: "${userText}"

上記を踏まえ、コーチとして共感的かつ論理的、そしてデータ駆動なアドバイス（具体的な階層目標への落とし込みや習慣化のテクニックなど）を200文字〜400文字程度で、分かりやすく回答してください。
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${state.settings.ai.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        if (!response.ok) {
          throw new Error('AI Chat call failed');
        }

        const resJson = await response.json();
        aiResponseText = resJson.candidates[0].content.parts[0].text;
      }

      // AI応答メッセージの追加
      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString().substring(0, 5)
      };

      setMessages(prev => [...prev, aiMsg]);

    } catch (e) {
      console.error(e);
      // エラー時のモックフォールバック
      const errMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'ai',
        text: '申し訳ありません、API連携でエラーが発生しました。ローカル疑似エンジンにて回答します。\n\n目標を絵に描いた餅にしないためには、日常レベルで「何時何分にその場に行くか」まで具体化することです。まずは小さなタスクを1つ完了させましょう。',
        timestamp: new Date().toLocaleTimeString().substring(0, 5)
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('チャット履歴をクリアしますか？')) {
      setMessages([
        {
          id: 'msg-init',
          sender: 'ai',
          text: 'チャット履歴をクリアしました。新しい相談やプラン構築について何でもお尋ねください！',
          timestamp: new Date().toLocaleTimeString().substring(0, 5)
        }
      ]);
    }
  };

  return (
    <div className="fade-in" style={{ padding: '24px', maxWidth: '850px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* 上部ヘッダー */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles style={{ color: 'var(--accent-purple)' }} /> AI ライフアーキテクト・コンシェルジュ
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
            AIとのダイアログを通じて人生ビジョンを構造化し、実行可能な形にブレイクダウンします。
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleClearChat} title="チャット履歴の消去">
          <Trash2 size={13} />
        </button>
      </div>

      {/* メッセージエリア */}
      <div className="glass-panel" style={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        padding: '20px', 
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        background: 'var(--bg-surface)'
      }}>
        {messages.map(msg => {
          const isAi = msg.sender === 'ai';
          return (
            <div 
              key={msg.id}
              style={{
                display: 'flex',
                gap: '12px',
                alignSelf: isAi ? 'flex-start' : 'flex-end',
                maxWidth: '85%',
                flexDirection: isAi ? 'row' : 'row-reverse'
              }}
            >
              {/* アイコン */}
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                background: isAi ? 'var(--accent-purple-bg)' : 'var(--accent-cyan-bg)',
                border: `1px solid ${isAi ? 'var(--accent-purple)' : 'var(--accent-cyan)'}`,
                flexShrink: 0
              }}>
                {isAi ? <Bot size={18} style={{ color: 'var(--accent-purple)' }} /> : <User size={18} style={{ color: 'var(--accent-cyan)' }} />}
              </div>

              {/* メッセージ本体 */}
              <div>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: isAi ? '0 14px 14px 14px' : '14px 0 14px 14px',
                  background: isAi ? 'var(--bg-card)' : 'var(--grad-primary)',
                  color: isAi ? 'var(--text-primary)' : 'var(--text-inverse)',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {msg.text}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  marginTop: '4px',
                  textAlign: isAi ? 'left' : 'right'
                }}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              background: 'var(--accent-purple-bg)',
              border: '1px solid var(--accent-purple)',
              animation: 'spin 1.5s linear infinite'
            }}>
              <RefreshCw size={14} style={{ color: 'var(--accent-purple)' }} />
            </div>
            <div className="glass-panel" style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
              AI思考中...（データをスキャンして最適解を生成しています）
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* クイック質問集 */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px', flexShrink: 0 }}>
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={() => handleQuickQuestion('起業してプロダクトを出すための5年ロードマップを考えて')}
          style={{ fontSize: '11px', borderRadius: '20px' }}
        >
          💡 起業ロードマップの相談
        </button>
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={() => handleQuickQuestion('英語力をビジネスレベルに高める習慣化のヒントが欲しい')}
          style={{ fontSize: '11px', borderRadius: '20px' }}
        >
          💡 英語学習の習慣設計
        </button>
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={() => handleQuickQuestion('現在の私のボトルネックをデータ分析して改善策を提示して')}
          style={{ fontSize: '11px', borderRadius: '20px' }}
        >
          🚦 ボトルネック自己分析
        </button>
      </div>

      {/* 入力欄 */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
        <input 
          type="text" 
          className="form-input" 
          placeholder="AIコーチに質問・相談する（例: 〇〇歳までに〇〇したい）..." 
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          disabled={isLoading}
          style={{ height: '48px', borderRadius: '24px', paddingLeft: '20px' }}
        />
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isLoading || !inputMsg.trim()}
          style={{ width: '48px', height: '48px', padding: 0, borderRadius: '50%', flexShrink: 0 }}
        >
          <Send size={18} />
        </button>
      </form>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
};
