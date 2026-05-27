import React, { useState, useEffect } from 'react';
import { useAppState } from '../../hooks/useAppState';
import { detectBottlenecks, generateWeeklyReview } from '../../utils/ai';
import type { Bottleneck } from '../../utils/ai';
import { 
  AlertTriangle, Lightbulb, Clock, CheckCircle2, 
  Sparkles, Calendar, RefreshCw, BarChart2, ShieldAlert
} from 'lucide-react';

export const Dashboard: React.FC<{ onViewChange: (view: string) => void }> = ({ onViewChange }) => {
  const { state, addTimeLog, updateActionPlan, updateTask } = useAppState();
  const [bottlenecks, setBottlenecks] = useState<Bottleneck[]>([]);
  const [weeklyReport, setWeeklyReport] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'review'>('overview');

  // ボトルネックのリアルタイム検知
  useEffect(() => {
    setBottlenecks(detectBottlenecks(state));
  }, [state]);

  // 全ビジョンの平均進捗スコア
  const averageProgress = state.visions.length > 0 
    ? Math.round(state.visions.reduce((acc, v) => acc + v.progress, 0) / state.visions.length)
    : 0;

  // 今週の時間投資実績の算出 (直近7日)
  const now = new Date();
  const recentLogs = state.timeLogs.filter(log => {
    const logDate = new Date(log.loggedAt);
    return (now.getTime() - logDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
  });

  const totalWeeklyHours = recentLogs.reduce((acc, log) => acc + log.duration / 60, 0);
  
  // 今週の目標投資時間の合計
  const targetWeeklyHours = state.tasks
    .filter(t => t.isRoutine && !t.completed)
    .reduce((acc, t) => acc + t.timeAllocated, 0);

  const trackerRatio = targetWeeklyHours > 0 
    ? Math.min(Math.round((totalWeeklyHours / targetWeeklyHours) * 100), 100)
    : 0;

  // カテゴリ別時間配分の集計
  const categories: { [key: string]: number } = {
    career: 0, business: 0, study: 0, health: 0, asset: 0, relationship: 0, other: 0
  };
  recentLogs.forEach(log => {
    if (categories[log.category] !== undefined) {
      categories[log.category] += log.duration / 60;
    }
  });

  // AI週次レビューの実行
  const handleGenerateReview = async () => {
    setIsGeneratingReport(true);
    try {
      const report = await generateWeeklyReview(state, state.settings.ai.apiKey, state.settings.ai.provider);
      setWeeklyReport(report);
      setActiveTab('review');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // ボトルネック解消クイックアクションの実行
  const handleQuickResolve = (bn: Bottleneck) => {
    if (bn.targetType === 'action') {
      // 延期や目標値の微調整、または進捗トグル
      const current = state.actionPlans.find(a => a.id === bn.targetId);
      if (current) {
        // 例: 進捗率に 10% プラス、またはステータスを進行中に
        updateActionPlan(bn.targetId, {
          status: 'in_progress',
          targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 2週間延長
        });
        alert(`「${current.title}」の目標期限を2週間延長し、スケジュール調整を行いました。`);
      }
    } else if (bn.targetType === 'task') {
      const current = state.tasks.find(t => t.id === bn.targetId);
      if (current) {
        // タイムトラッキングへのクイック登録
        addTimeLog({
          taskId: current.id,
          taskTitle: current.title,
          category: 'other',
          duration: 60, // クイックで1時間記録
          description: 'AIクイックサジェスト: ボトルネック解消に向けた集中投資'
        });
        alert(`タスク「${current.title}」に対して 1時間の活動実績をクイック追加しました！`);
      }
    }
    setBottlenecks(prev => prev.filter(b => b.id !== bn.id));
  };

  // SVGグラフ：ドーナツチャート用の円周計算
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (averageProgress / 100) * circumference;
  const trackerStrokeOffset = circumference - (trackerRatio / 100) * circumference;

  return (
    <div className="fade-in" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* ヒーローヘッダー */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sparkles style={{ color: 'var(--accent-cyan)' }} /> My Life Architecture
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            データ駆動型の人生設計システム。ビジョンを日々の軌跡へマッピングする。
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => onViewChange('canvas')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <BarChart2 size={16} /> 階層マップを開く
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleGenerateReview}
            disabled={isGeneratingReport}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Sparkles size={16} /> {isGeneratingReport ? 'AI分析中...' : 'AI週次レビューを生成'}
          </button>
        </div>
      </div>

      {/* タブ切り替え */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '24px', gap: '8px' }}>
        <button 
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            color: activeTab === 'overview' ? 'var(--accent-cyan)' : 'var(--text-muted)',
            borderBottom: activeTab === 'overview' ? '2px solid var(--accent-cyan)' : 'none',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          総合コックピット
        </button>
        <button 
          onClick={() => setActiveTab('review')}
          disabled={!weeklyReport}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            color: activeTab === 'review' ? 'var(--accent-cyan)' : 'var(--text-muted)',
            borderBottom: activeTab === 'review' ? '2px solid var(--accent-cyan)' : 'none',
            cursor: weeklyReport ? 'pointer' : 'not-allowed',
            fontWeight: 600,
            opacity: weeklyReport ? 1 : 0.5,
            transition: 'all 0.2s'
          }}
        >
          AI週次レポート
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* 進捗・ステータスサマリーカード */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            
            {/* 総合ライフビジョン進捗 */}
            <div className="glass-panel glow-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ position: 'relative', width: '140px', height: '140px', flexShrink: 0 }}>
                <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--border-subtle)" strokeWidth="8" />
                  <circle 
                    cx="70" 
                    cy="70" 
                    r={radius} 
                    fill="none" 
                    stroke="url(#cyan-purple-grad)" 
                    strokeWidth="8" 
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                  />
                  <defs>
                    <linearGradient id="cyan-purple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--accent-cyan)" />
                      <stop offset="100%" stopColor="var(--accent-purple)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
                }}>
                  <span style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{averageProgress}%</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vision Score</span>
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>人生ビジョン総合進捗</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  設定されたすべての長期ビジョンから逆算された平均到達度です。マイルストーンを完了するたびに自動でロールアップされます。
                </p>
              </div>
            </div>

            {/* 週次時間投資メーター */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ position: 'relative', width: '140px', height: '140px', flexShrink: 0 }}>
                <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--border-subtle)" strokeWidth="8" />
                  <circle 
                    cx="70" 
                    cy="70" 
                    r={radius} 
                    fill="none" 
                    stroke="var(--accent-green)" 
                    strokeWidth="8" 
                    strokeDasharray={circumference}
                    strokeDashoffset={trackerStrokeOffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
                }}>
                  <span style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{totalWeeklyHours.toFixed(1)}h</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Target: {targetWeeklyHours}h</span>
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>今週の時間投資実績</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  今週設定されたルーティン時間目標に対する到達メーターです。{trackerRatio}% の割り当て時間を消化しています。
                </p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button 
                    onClick={() => onViewChange('tracker')} 
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Clock size={12} /> 時間計測を開く
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* グラフとボトルネックのメイン2カラムグリッド */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
            
            {/* 左カラム: 自作インタラクティブSVGグラフ */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock style={{ color: 'var(--accent-cyan)' }} size={18} /> カテゴリ別時間投資バランス (直近7日)
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>単位: 時間</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.entries(categories).map(([cat, hours]) => {
                  const maxHours = Math.max(...Object.values(categories), 5); // 最小分母として5時間
                  const percent = (hours / maxHours) * 100;
                  
                  // カテゴリに応じたアクセントカラー
                  let catColor = 'var(--text-muted)';
                  if (cat === 'career') catColor = 'var(--accent-cyan)';
                  if (cat === 'business') catColor = 'var(--accent-purple)';
                  if (cat === 'study') catColor = 'var(--accent-cyan)';
                  if (cat === 'health') catColor = 'var(--accent-green)';
                  if (cat === 'asset') catColor = 'var(--accent-amber)';
                  if (cat === 'relationship') catColor = 'var(--accent-purple)';

                  return (
                    <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '100px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                        {cat}
                      </div>
                      <div style={{ flexGrow: 1, height: '12px', background: 'var(--border-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${percent}%`,
                          height: '100%',
                          background: catColor,
                          borderRadius: '6px',
                          transition: 'width 0.6s ease-out'
                        }} />
                      </div>
                      <div style={{ width: '50px', fontSize: '13px', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                        {hours.toFixed(1)}h
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)' }}></span>
                    Career / Study
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-purple)' }}></span>
                    Business / Network
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)' }}></span>
                    Health
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-amber)' }}></span>
                    Asset
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => onViewChange('tracker')}>
                  ログ履歴を見る →
                </span>
              </div>
            </div>

            {/* 右カラム: ボトルネック検出警告 */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <ShieldAlert style={{ color: bottlenecks.length > 0 ? 'var(--accent-amber)' : 'var(--accent-green)' }} size={18} />
                リアルタイム・ボトルネック検知
              </h3>

              {bottlenecks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={36} style={{ color: 'var(--accent-green)', marginBottom: '12px' }} />
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>ボトルネックは検出されていません</p>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>非常に順調なペースで計画が進行しています！</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {bottlenecks.map(bn => (
                    <div 
                      key={bn.id} 
                      className="glass-panel"
                      style={{ 
                        padding: '16px', 
                        borderColor: bn.type === 'delay' ? 'hsla(0, 84%, 60%, 0.3)' : 'hsla(38, 92%, 50%, 0.3)',
                        background: 'hsla(240, 15%, 8%, 0.3)'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <AlertTriangle size={16} style={{ color: bn.type === 'delay' ? 'var(--accent-red)' : 'var(--accent-amber)', flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 700 }}>{bn.title}</h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{bn.description}</p>
                          <div style={{ 
                            background: 'hsla(240, 15%, 5%, 0.4)', 
                            borderLeft: '2px solid var(--accent-cyan)', 
                            padding: '8px', 
                            borderRadius: '4px',
                            marginTop: '8px',
                            fontSize: '11px',
                            color: 'var(--text-muted)'
                          }}>
                            {bn.suggestion}
                          </div>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleQuickResolve(bn)}
                            style={{ marginTop: '10px', width: '100%', fontSize: '11px', justifyContent: 'center' }}
                          >
                            AI推奨アクションを自動実行
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* 直近のタスク & クイック追加 */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar style={{ color: 'var(--accent-cyan)' }} size={18} /> 今日・今週の実行タスク (Focus Area)
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--accent-cyan)', cursor: 'pointer' }} onClick={() => onViewChange('canvas')}>
                目標ツリーで編集する →
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {state.tasks.slice(0, 4).map(task => (
                <div 
                  key={task.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '16px', 
                    opacity: task.completed ? 0.6 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className={`badge ${task.completed ? 'badge-done' : 'badge-in-progress'}`}>
                        {task.isRoutine ? `習慣 (${task.frequency})` : '単発タスク'}
                      </span>
                      {task.dueDate && (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>期日: {task.dueDate}</span>
                      )}
                    </div>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, marginTop: '8px', textDecoration: task.completed ? 'line-through' : 'none' }}>
                      {task.title}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {task.description || '詳細なし'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      投資時間: <strong>{task.timeSpent}h</strong> / 目標: {task.timeAllocated}h/週
                    </span>
                    <button 
                      className={`btn btn-sm ${task.completed ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => updateTask(task.id, { completed: !task.completed })}
                    >
                      {task.completed ? '未完了に戻す' : '完了にする'}
                    </button>
                  </div>
                </div>
              ))}
              {state.tasks.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  タスクが登録されていません。目標マップから作成してください。
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* AI レポートタブの表示 */
        <div className="glass-panel fade-in" style={{ padding: '32px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles style={{ color: 'var(--accent-purple)' }} /> AI 週次パフォーマンス診断
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={handleGenerateReview} disabled={isGeneratingReport}>
              <RefreshCw size={12} className={isGeneratingReport ? 'spin-animation' : ''} /> 再診断を実行
            </button>
          </div>

          <div style={{ color: 'var(--text-primary)', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontSize: '15px' }}>
            {weeklyReport.split('\n').map((line, idx) => {
              if (line.startsWith('## ')) {
                return <h2 key={idx} style={{ fontSize: '20px', color: 'var(--accent-cyan)', marginTop: '24px', marginBottom: '12px' }}>{line.replace('## ', '')}</h2>;
              }
              if (line.startsWith('### ')) {
                return <h3 key={idx} style={{ fontSize: '16px', color: 'var(--accent-purple)', marginTop: '20px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Lightbulb size={16} /> {line.replace('### ', '')}</h3>;
              }
              if (line.startsWith('- ')) {
                return <li key={idx} style={{ marginLeft: '20px', marginBottom: '4px' }}>{line.replace('- ', '')}</li>;
              }
              if (line.startsWith('⚠️') || line.startsWith('✅') || line.startsWith('✨')) {
                return <p key={idx} style={{ background: 'var(--bg-surface)', padding: '12px', borderLeft: '3px solid var(--accent-cyan)', borderRadius: '4px', margin: '12px 0' }}>{line}</p>;
              }
              return <p key={idx} style={{ marginBottom: '8px' }}>{line}</p>;
            })}
          </div>
        </div>
      )}

      {/* スタイル定義 */}
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
