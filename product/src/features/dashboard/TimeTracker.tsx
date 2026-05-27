import React, { useState, useEffect } from 'react';
import { useAppState } from '../../hooks/useAppState';
import { Play, Pause, RotateCcw, Save, Trash2, Clock, Calendar } from 'lucide-react';

export const TimeTracker: React.FC = () => {
  const { state, addTimeLog, deleteTimeLog } = useAppState();

  // タイマー関連ステート
  const [selectedTaskId, setSelectedTaskId] = useState<string>(state.tasks[0]?.id || '');
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  
  // 手動入力ステート
  const [manualDuration, setManualDuration] = useState<number>(30);
  const [manualDescription, setManualDescription] = useState('');
  
  // ストップウォッチ用 useEffect
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStartStop = () => {
    if (!selectedTaskId) {
      alert('タイマーを起動するタスクを選択してください。');
      return;
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  // ストップウォッチ時間を記録保存
  const handleSaveTimer = () => {
    if (seconds < 60) {
      alert('1分未満の時間枠は記録できません。');
      return;
    }
    
    const durationMinutes = Math.round(seconds / 60);
    const targetTask = state.tasks.find(t => t.id === selectedTaskId);
    if (!targetTask) return;

    // ビジョンのカテゴリを取得（タスクから遡って取得）
    const actionPlan = state.actionPlans.find(a => a.id === targetTask.actionPlanId);
    const roadmap = actionPlan ? state.roadmaps.find(r => r.id === actionPlan.roadmapId) : null;
    const vision = roadmap ? state.visions.find(v => v.id === roadmap.visionId) : null;
    const category = vision ? vision.category : 'career';

    addTimeLog({
      taskId: selectedTaskId,
      taskTitle: targetTask.title,
      category: category,
      duration: durationMinutes,
      description: `ストップウォッチによる計測ログ`
    });

    setIsRunning(false);
    setSeconds(0);
    alert(`「${targetTask.title}」に ${durationMinutes} 分の活動時間を記録しました！`);
  };

  // 手動時間登録
  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId) {
      alert('対象のタスクを選択してください。');
      return;
    }

    const targetTask = state.tasks.find(t => t.id === selectedTaskId);
    if (!targetTask) return;

    const actionPlan = state.actionPlans.find(a => a.id === targetTask.actionPlanId);
    const roadmap = actionPlan ? state.roadmaps.find(r => r.id === actionPlan.roadmapId) : null;
    const vision = roadmap ? state.visions.find(v => v.id === roadmap.visionId) : null;
    const category = vision ? vision.category : 'career';

    addTimeLog({
      taskId: selectedTaskId,
      taskTitle: targetTask.title,
      category: category,
      duration: Number(manualDuration),
      description: manualDescription || '手動による活動時間入力'
    });

    setManualDescription('');
    alert(`「${targetTask.title}」に ${manualDuration} 分の活動時間を記録しました！`);
  };

  // 秒を hh:mm:ss にフォーマット
  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  return (
    <div className="fade-in" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock style={{ color: 'var(--accent-cyan)' }} /> タイム・トラッキング＆投資ロガー
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
          「今、何に命の時間を投資しているか」をデータ化する。ストップウォッチまたは手動で実績を記録。
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* 左カラム: ストップウォッチタイマー */}
        <div className="glass-panel glow-card" style={{ padding: '28px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>
            ⏱️ フォーカス・ストップウォッチ
          </h3>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'left' }}>計測対象のタスク</label>
            <select 
              className="form-select"
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              disabled={isRunning}
            >
              <option value="">-- タスクを選択してください --</option>
              {state.tasks.filter(t => !t.completed).map(task => (
                <option key={task.id} value={task.id}>
                  {task.title} ({task.isRoutine ? '習慣' : '単発'})
                </option>
              ))}
            </select>
          </div>

          {/* タイマー表示 */}
          <div style={{ 
            fontSize: '54px', 
            fontFamily: 'var(--font-heading)', 
            fontWeight: 800, 
            color: isRunning ? 'var(--accent-cyan)' : 'var(--text-primary)',
            background: 'hsla(240, 15%, 5%, 0.4)',
            padding: '24px 0',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            letterSpacing: '0.05em',
            boxShadow: isRunning ? 'var(--shadow-glow)' : 'none',
            transition: 'all 0.3s',
            marginBottom: '24px'
          }}>
            {formatTime(seconds)}
          </div>

          {/* タイマーコントロールボタン */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={handleReset} 
              disabled={seconds === 0}
              style={{ width: '48px', height: '48px', padding: 0, borderRadius: '50%' }}
            >
              <RotateCcw size={18} />
            </button>
            
            <button 
              className="btn btn-primary" 
              onClick={handleStartStop}
              style={{ 
                width: '64px', height: '64px', padding: 0, borderRadius: '50%',
                background: isRunning ? 'var(--accent-purple)' : 'var(--grad-primary)'
              }}
            >
              {isRunning ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: '4px' }} />}
            </button>

            <button 
              className="btn btn-secondary" 
              onClick={handleSaveTimer} 
              disabled={seconds < 60}
              style={{ width: '48px', height: '48px', padding: 0, borderRadius: '50%' }}
              title="実績を保存"
            >
              <Save size={18} />
            </button>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            ※ 実績を保存するには1分以上の経過が必要です。
          </span>
        </div>

        {/* 右カラム: 手動記録入力 */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>
            📝 クイック手動登録
          </h3>

          <form onSubmit={handleSaveManual} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>対象タスクの選択</label>
              <select 
                className="form-select"
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                required
              >
                <option value="">-- タスクを選択してください --</option>
                {state.tasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title} {task.completed ? '(完了済)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>投資時間 (分)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={manualDuration}
                  onChange={(e) => setManualDuration(Number(e.target.value))}
                  min={5}
                  max={1440}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>時間換算</label>
                <div style={{ padding: '10px', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                  {(manualDuration / 60).toFixed(2)} 時間
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>実施内容メモ</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="例: コーディング、単語シャドーイング" 
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              手動ログを記録する
            </button>
          </form>
        </div>

      </div>

      {/* 下部: ログ履歴一覧 */}
      <div className="glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
        <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Calendar style={{ color: 'var(--accent-cyan)' }} size={18} /> 過去のライフタイムログ履歴
        </h3>

        {state.timeLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
            まだトラッキング履歴がありません。タイマーか手動入力で最初の記録を刻みましょう！
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 8px' }}>日時</th>
                  <th style={{ padding: '12px 8px' }}>カテゴリ</th>
                  <th style={{ padding: '12px 8px' }}>関連タスク</th>
                  <th style={{ padding: '12px 8px' }}>投資時間</th>
                  <th style={{ padding: '12px 8px' }}>詳細</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {state.timeLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.2s' }} className="table-row-hover">
                    <td style={{ padding: '12px 8px', whiteSpace: 'nowrap' }}>{log.loggedAt}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span className="badge badge-in-progress" style={{ fontSize: '9px' }}>{log.category}</span>
                    </td>
                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>{log.taskTitle}</td>
                    <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--accent-green)' }}>{log.duration}分 ({Number((log.duration/60).toFixed(1))}h)</td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{log.description}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <Trash2 
                        size={14} 
                        style={{ color: 'var(--accent-red)', cursor: 'pointer' }} 
                        onClick={() => { if(confirm('この活動実績ログを削除しますか？対応するタスクの累積時間からも減算されます。')) deleteTimeLog(log.id); }} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .table-row-hover:hover {
          background: hsla(240, 15%, 15%, 0.3);
        }
      `}</style>

    </div>
  );
};
