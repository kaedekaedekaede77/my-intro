import React, { useState } from 'react';
import { useAppState } from '../../hooks/useAppState';
import type { TargetCategory } from '../../types';
import { generateAIRoadmap } from '../../utils/ai';
import { 
  Plus, Edit2, Trash2, CheckSquare, Clock, 
  Sparkles, Target, Compass, ZoomIn, ZoomOut, Zap, X
} from 'lucide-react';

export const LifeArchitecture: React.FC = () => {
  const { 
    state, 
    addVision, updateVision, deleteVision,
    addRoadmap, updateRoadmap, deleteRoadmap,
    addActionPlan, updateActionPlan, deleteActionPlan,
    addTask, updateTask, deleteTask,
    addTimeLog
  } = useAppState();

  // 選択・フォーカス状態
  const [selectedVisionId, setSelectedVisionId] = useState<string | null>(state.visions[0]?.id || null);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

  // ズーム倍率ステート
  const [zoomScale, setZoomScale] = useState<number>(1.0);

  // モーダル制御
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'vision' | 'roadmap' | 'action' | 'task' | 'timelog' | 'ai_generate'>('vision');
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);

  // AI自動生成ローディング
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  // フォームステート
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'career' as TargetCategory,
    targetAge: 30,
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    kpiMetric: '',
    kpiTarget: 0,
    kpiCurrent: 0,
    isRoutine: false,
    frequency: 'daily' as 'daily' | 'weekly',
    timeAllocated: 2.0,
    duration: 30, // タイムログ用
    logDesc: '' // タイムログ用
  });

  // モーダルを開く (新規追加 / 編集)
  const openModal = (
    type: typeof modalType, 
    mode: typeof modalMode, 
    id: string | null = null
  ) => {
    setModalType(type);
    setModalMode(mode);
    setEditingId(id);
    setIsModalOpen(true);

    if (mode === 'edit' && id) {
      if (type === 'vision') {
        const item = state.visions.find(v => v.id === id);
        if (item) setFormData({ ...formData, title: item.title, description: item.description, category: item.category, targetAge: item.targetAge, targetDate: item.targetDate });
      } else if (type === 'roadmap') {
        const item = state.roadmaps.find(r => r.id === id);
        if (item) setFormData({ ...formData, title: item.title, description: item.description, targetDate: item.targetDate });
      } else if (type === 'action') {
        const item = state.actionPlans.find(a => a.id === id);
        if (item) setFormData({ ...formData, title: item.title, description: item.description, targetDate: item.targetDate, kpiMetric: item.kpiMetric, kpiTarget: item.kpiTarget, kpiCurrent: item.kpiCurrent });
      } else if (type === 'task') {
        const item = state.tasks.find(t => t.id === id);
        if (item) setFormData({ ...formData, title: item.title, description: item.description, isRoutine: item.isRoutine, frequency: (item.frequency || 'daily') as any, timeAllocated: item.timeAllocated });
      }
    } else {
      // 初期値リセット
      setFormData({
        title: '',
        description: '',
        category: 'career',
        targetAge: 30,
        targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        kpiMetric: '',
        kpiTarget: 0,
        kpiCurrent: 0,
        isRoutine: false,
        frequency: 'daily',
        timeAllocated: 2.0,
        duration: 30,
        logDesc: ''
      });
    }
  };

  // フォーム送信
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);

    if (modalType === 'vision') {
      if (modalMode === 'add') {
        addVision({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          targetAge: formData.targetAge,
          targetDate: formData.targetDate,
          status: 'todo'
        });
      } else if (editingId) {
        updateVision(editingId, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          targetAge: formData.targetAge,
          targetDate: formData.targetDate
        });
      }
    } 
    
    else if (modalType === 'roadmap') {
      if (modalMode === 'add' && selectedVisionId) {
        addRoadmap({
          visionId: selectedVisionId,
          title: formData.title,
          description: formData.description,
          targetDate: formData.targetDate,
          status: 'todo'
        });
      } else if (editingId) {
        updateRoadmap(editingId, {
          title: formData.title,
          description: formData.description,
          targetDate: formData.targetDate
        });
      }
    } 
    
    else if (modalType === 'action') {
      if (modalMode === 'add' && selectedRoadmapId) {
        addActionPlan({
          roadmapId: selectedRoadmapId,
          title: formData.title,
          description: formData.description,
          targetDate: formData.targetDate,
          kpiMetric: formData.kpiMetric,
          kpiTarget: Number(formData.kpiTarget),
          kpiCurrent: Number(formData.kpiCurrent),
          status: 'todo'
        });
      } else if (editingId) {
        updateActionPlan(editingId, {
          title: formData.title,
          description: formData.description,
          targetDate: formData.targetDate,
          kpiMetric: formData.kpiMetric,
          kpiTarget: Number(formData.kpiTarget),
          kpiCurrent: Number(formData.kpiCurrent)
        });
      }
    } 
    
    else if (modalType === 'task') {
      if (modalMode === 'add' && selectedActionId) {
        addTask({
          actionPlanId: selectedActionId,
          title: formData.title,
          description: formData.description,
          isRoutine: formData.isRoutine,
          frequency: formData.isRoutine ? formData.frequency : undefined,
          dueDate: formData.isRoutine ? undefined : formData.targetDate,
          completed: false,
          timeAllocated: Number(formData.timeAllocated)
        });
      } else if (editingId) {
        updateTask(editingId, {
          title: formData.title,
          description: formData.description,
          isRoutine: formData.isRoutine,
          frequency: formData.isRoutine ? formData.frequency : undefined,
          dueDate: formData.isRoutine ? undefined : formData.targetDate,
          timeAllocated: Number(formData.timeAllocated)
        });
      }
    } 
    
    else if (modalType === 'timelog' && editingId) {
      // タイムログの追加 (editingId が taskId になる)
      addTimeLog({
        taskId: editingId,
        taskTitle: state.tasks.find(t => t.id === editingId)?.title || '',
        category: state.visions.find(v => v.id === selectedVisionId)?.category || 'career',
        duration: Number(formData.duration),
        description: formData.logDesc || 'タスク実行ログ'
      });
      alert('活動実績ログを登録しました！');
    }
  };

  // AIプランニング自動生成の実行
  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt) return;
    
    setIsAiGenerating(true);
    try {
      const generated = await generateAIRoadmap(
        aiPrompt, 
        state.settings.ai.apiKey, 
        state.settings.ai.provider
      );
      
      // ビジョンの新規登録
      const newVId = `v-${Date.now()}`;
      addVision({
        title: aiPrompt,
        description: `AIによって自動生成されたロードマップビジョン。`,
        category: 'career',
        targetAge: 30,
        targetDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5年計画
        status: 'todo'
      });
      
      // 状態保存のタイムラグを考慮し、ローカルでロードマップとアクション、タスクを紐づけて追加
      setTimeout(() => {
        // ロードマップ追加
        generated.roadmaps.forEach((r: any, rIdx: number) => {
          const newRId = `r-${Date.now()}-${rIdx}`;
          addRoadmap({
            visionId: newVId,
            title: r.title,
            description: r.description,
            targetDate: new Date(Date.now() + (rIdx + 1) * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'todo'
          });

          // アクション追加
          const relatedActions = generated.actions.filter((a: any) => a.rIndex === rIdx);
          relatedActions.forEach((action: any, aIdx: number) => {
            const newAId = `a-${Date.now()}-${rIdx}-${aIdx}`;
            addActionPlan({
              roadmapId: newRId,
              title: action.title,
              description: action.description,
              targetDate: new Date(Date.now() + (rIdx + 1) * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              kpiMetric: action.kpiMetric || '完了度',
              kpiTarget: action.kpiTarget || 100,
              kpiCurrent: 0,
              status: 'todo'
            });

            // タスク追加
            const relatedTasks = generated.tasks.filter((t: any) => t.aIndex === aIdx);
            relatedTasks.forEach((task: any) => {
              addTask({
                actionPlanId: newAId,
                title: task.title,
                description: task.description || '',
                isRoutine: task.isRoutine || false,
                frequency: task.isRoutine ? task.frequency || 'weekly' : undefined,
                dueDate: task.isRoutine ? undefined : new Date(Date.now() + (rIdx + 1) * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                completed: false,
                timeAllocated: task.timeAllocated || 2.0
              });
            });
          });
        });
        
        setSelectedVisionId(newVId);
        setIsModalOpen(false);
        alert('AIによって3段階マイルストーン、KPI、および推奨デイリールーティンを含んだ全階層ロードマップの構築に成功しました！');
      }, 500);

    } catch (e) {
      console.error(e);
      alert('AI生成中にエラーが発生しました。設定でAPIキーを確認してください。');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // 選択ビジョンに紐づくロードマップ
  const activeRoadmaps = state.roadmaps.filter(r => r.visionId === selectedVisionId);
  // 選択ロードマップに紐づくアクション
  const activeActions = state.actionPlans.filter(a => a.roadmapId === selectedRoadmapId);
  // 選択アクションに紐づくタスク
  const activeTasks = state.tasks.filter(t => t.actionPlanId === selectedActionId);

  return (
    <div className="fade-in" style={{ padding: '24px' }}>
      
      {/* ズーム & コントロールバー */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass style={{ color: 'var(--accent-cyan)' }} /> ライフ・アーキテクチャ・キャンバス
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
            超長期ビジョンから日々の日常ルーティンまで、完全に整合した4つのライフレイヤーを俯瞰する。
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          
          <button className="btn btn-secondary btn-sm" onClick={() => setZoomScale(s => Math.max(0.6, s - 0.1))} title="ズームアウト">
            <ZoomOut size={14} />
          </button>
          <span style={{ fontSize: '12px', width: '36px', textAlign: 'center', fontWeight: 'bold' }}>{Math.round(zoomScale * 100)}%</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setZoomScale(s => Math.min(1.2, s + 0.1))} title="ズームイン">
            <ZoomIn size={14} />
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={() => { setModalType('ai_generate'); setAiPrompt(''); setIsModalOpen(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={16} /> AIプラン自動構築
          </button>
        </div>
      </div>

      {/* 4カラム構成 ズーム対応キャンバス */}
      <div className="zoom-canvas-container" style={{ padding: '20px', minHeight: '680px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
          transform: `scale(${zoomScale})`,
          transformOrigin: 'top left',
          width: `${100 / zoomScale}%`,
          transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
          alignItems: 'start'
        }}>
          
          {/* LEVEL 1: VISION (超長期 10-30年) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Target size={16} /> L1: 超長期ビジョン (10〜30年)
              </h3>
              <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} onClick={() => openModal('vision', 'add')}>
                <Plus size={12} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {state.visions.map(vision => {
                const isSelected = selectedVisionId === vision.id;
                return (
                  <div 
                    key={vision.id}
                    className="glass-panel"
                    onClick={() => { setSelectedVisionId(vision.id); setSelectedRoadmapId(null); setSelectedActionId(null); }}
                    style={{
                      padding: '16px',
                      cursor: 'pointer',
                      borderLeft: isSelected ? '4px solid var(--accent-cyan)' : '1px solid var(--glass-border)',
                      boxShadow: isSelected ? 'var(--shadow-glow)' : 'none',
                      background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="badge badge-in-progress" style={{ fontSize: '9px' }}>{vision.category}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <Edit2 size={12} className="btn-icon" onClick={(e) => { e.stopPropagation(); openModal('vision', 'edit', vision.id); }} />
                        <Trash2 size={12} className="btn-icon" style={{ color: 'var(--accent-red)' }} onClick={(e) => { e.stopPropagation(); if(confirm('ビジョンと紐づく全てのロードマップが削除されます。よろしいですか？')) deleteVision(vision.id); }} />
                      </div>
                    </div>
                    <h4 style={{ fontSize: '14px', marginTop: '8px', fontWeight: 700, lineHeight: 1.4 }}>{vision.title}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px' }}>
                      <span>目標年齢: {vision.targetAge}歳</span>
                      <span>進捗: <strong>{vision.progress}%</strong></span>
                    </div>
                    {/* 進捗バー */}
                    <div style={{ height: '4px', background: 'var(--border-subtle)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${vision.progress}%`, height: '100%', background: 'var(--grad-primary)' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LEVEL 2: ROADMAP (中期 3-5年) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Compass size={16} /> L2: 中期マイルストーン (3〜5年)
              </h3>
              {selectedVisionId && (
                <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} onClick={() => openModal('roadmap', 'add')}>
                  <Plus size={12} />
                </button>
              )}
            </div>
            
            {!selectedVisionId ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '24px 0' }}>
                ビジョンを選択してください
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {activeRoadmaps.map(roadmap => {
                  const isSelected = selectedRoadmapId === roadmap.id;
                  return (
                    <div 
                      key={roadmap.id}
                      className="glass-panel"
                      onClick={() => { setSelectedRoadmapId(roadmap.id); setSelectedActionId(null); }}
                      style={{
                        padding: '16px',
                        cursor: 'pointer',
                        borderLeft: isSelected ? '4px solid var(--accent-purple)' : '1px solid var(--glass-border)',
                        background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>期日: {roadmap.targetDate}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <Edit2 size={12} className="btn-icon" onClick={(e) => { e.stopPropagation(); openModal('roadmap', 'edit', roadmap.id); }} />
                          <Trash2 size={12} className="btn-icon" style={{ color: 'var(--accent-red)' }} onClick={(e) => { e.stopPropagation(); if(confirm('ロードマップと配下のアクションプランが削除されます。よろしいですか？')) deleteRoadmap(roadmap.id); }} />
                        </div>
                      </div>
                      <h4 style={{ fontSize: '13px', marginTop: '8px', fontWeight: 600 }}>{roadmap.title}</h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{roadmap.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px' }}>
                        <span>進捗率: <strong>{roadmap.progress}%</strong></span>
                        <span className={`badge badge-${roadmap.status}`}>{roadmap.status}</span>
                      </div>
                    </div>
                  );
                })}
                {activeRoadmaps.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '24px 0' }}>
                    マイルストーンがありません。上の「＋」から作成してください。
                  </div>
                )}
              </div>
            )}
          </div>

          {/* LEVEL 3: ACTION PLAN (短期 KPI) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} /> L3: アクションプラン (短期 KPI)
              </h3>
              {selectedRoadmapId && (
                <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} onClick={() => openModal('action', 'add')}>
                  <Plus size={12} />
                </button>
              )}
            </div>

            {!selectedRoadmapId ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '24px 0' }}>
                マイルストーンを選択してください
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {activeActions.map(action => {
                  const isSelected = selectedActionId === action.id;
                  return (
                    <div 
                      key={action.id}
                      className="glass-panel"
                      onClick={() => setSelectedActionId(action.id)}
                      style={{
                        padding: '16px',
                        cursor: 'pointer',
                        borderLeft: isSelected ? '4px solid var(--accent-cyan)' : '1px solid var(--glass-border)',
                        background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>期日: {action.targetDate}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <Edit2 size={12} className="btn-icon" onClick={(e) => { e.stopPropagation(); openModal('action', 'edit', action.id); }} />
                          <Trash2 size={12} className="btn-icon" style={{ color: 'var(--accent-red)' }} onClick={(e) => { e.stopPropagation(); if(confirm('アクションプランと関連タスクが削除されます。よろしいですか？')) deleteActionPlan(action.id); }} />
                        </div>
                      </div>
                      <h4 style={{ fontSize: '13px', marginTop: '8px', fontWeight: 600 }}>{action.title}</h4>
                      
                      <div style={{ 
                        background: 'hsla(240, 15%, 5%, 0.3)', 
                        padding: '8px', 
                        borderRadius: '6px', 
                        marginTop: '8px',
                        fontSize: '11px'
                      }}>
                        <div style={{ color: 'var(--text-secondary)' }}>KPI: <strong>{action.kpiMetric}</strong></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                          <span>目標: {action.kpiTarget}</span>
                          <span>現在: <strong>{action.kpiCurrent}</strong></span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px' }}>
                        <span>進捗: <strong>{action.progress}%</strong></span>
                        <span className={`badge badge-${action.status}`}>{action.status}</span>
                      </div>
                    </div>
                  );
                })}
                {activeActions.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '24px 0' }}>
                    アクションプランがありません。
                  </div>
                )}
              </div>
            )}
          </div>

          {/* LEVEL 4: TASK & ROUTINE (日常) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckSquare size={16} /> L4: 日常タスク＆習慣 (実行)
              </h3>
              {selectedActionId && (
                <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} onClick={() => openModal('task', 'add')}>
                  <Plus size={12} />
                </button>
              )}
            </div>

            {!selectedActionId ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '24px 0' }}>
                アクションプランを選択してください
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {activeTasks.map(task => (
                  <div 
                    key={task.id}
                    className="glass-panel"
                    style={{
                      padding: '16px',
                      background: 'var(--bg-card)',
                      opacity: task.completed ? 0.6 : 1,
                      borderLeft: task.completed ? '4px solid var(--accent-green)' : '1px solid var(--glass-border)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className={`badge ${task.completed ? 'badge-done' : 'badge-in-progress'}`}>
                        {task.isRoutine ? `習慣 (${task.frequency})` : '単発タスク'}
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <span title="実績時間を追加" style={{ display: 'inline-flex' }}>
                          <Clock size={12} className="btn-icon" onClick={() => openModal('timelog', 'add', task.id)} />
                        </span>
                        <Edit2 size={12} className="btn-icon" onClick={() => openModal('task', 'edit', task.id)} />
                        <Trash2 size={12} className="btn-icon" style={{ color: 'var(--accent-red)' }} onClick={() => { if(confirm('タスクを削除しますか？')) deleteTask(task.id); }} />
                      </div>
                    </div>
                    <h4 style={{ fontSize: '13px', marginTop: '8px', fontWeight: 600, textDecoration: task.completed ? 'line-through' : 'none' }}>
                      {task.title}
                    </h4>
                    {task.dueDate && (
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>期限: {task.dueDate}</div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      <span>実績: <strong>{task.timeSpent}h</strong> / 週目標: {task.timeAllocated}h</span>
                      <input 
                        type="checkbox" 
                        checked={task.completed} 
                        onChange={() => updateTask(task.id, { completed: !task.completed })}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                    </div>
                  </div>
                ))}
                {activeTasks.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '24px 0' }}>
                    日常タスクがありません。
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* --- ADD / EDIT POPUP MODAL --- */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          
          <div className="glass-panel glow-card" style={{ width: '480px', padding: '28px', background: 'var(--bg-surface)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {modalType === 'ai_generate' ? <Sparkles size={20} /> : <Target size={20} />}
                {modalType === 'ai_generate' ? 'AIプラン自動構築' : 
                 modalType === 'timelog' ? '活動時間実績の記録' :
                 `${modalMode === 'add' ? '新規追加' : '編集'} - ${
                   modalType === 'vision' ? '超長期ビジョン' :
                   modalType === 'roadmap' ? '中期マイルストーン' :
                   modalType === 'action' ? 'アクションプラン(KPI)' : '日常タスク'
                 }`}
              </h3>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>

            {modalType === 'ai_generate' ? (
              /* AI生成フォーム */
              <form onSubmit={handleAIGenerate}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>人生を通じて成し遂げたい大目標 (Vision) を入力</label>
                  <textarea 
                    className="form-input" 
                    rows={4}
                    placeholder="例: 35歳までに起業し、最先端のAI技術を活かした自社サービスを立ち上げて上場する"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div style={{ background: 'var(--bg-deep)', padding: '12px', borderRadius: '6px', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  💡 入力されたビジョンをもとに、AIが「3〜5年の主要マイルストーン」「各マイルストーンに必要なKPI」「今日から始められる日常ルーティンと推奨アロケーション時間」をシームレスに逆算し、階層ツリーを自動構築します。
                </div>
                <div style={{ display: 'flex', justifySelf: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>キャンセル</button>
                  <button type="submit" className="btn btn-primary" disabled={isAiGenerating}>
                    {isAiGenerating ? 'AIによるプラン構築中...' : 'AIに逆算させる'}
                  </button>
                </div>
              </form>
            ) : modalType === 'timelog' ? (
              /* タイムログ記録フォーム */
              <form onSubmit={handleFormSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>タスク実施時間（分）</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    min={5}
                    required
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>実施内容メモ</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="何を行いましたか？"
                    value={formData.logDesc}
                    onChange={(e) => setFormData({ ...formData, logDesc: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', justifySelf: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>キャンセル</button>
                  <button type="submit" className="btn btn-primary">活動ログを保存</button>
                </div>
              </form>
            ) : (
              /* 通常の CRUD フォーム */
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>タイトル</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.title} 
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required 
                  />
                </div>

                {modalType === 'vision' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>カテゴリ</label>
                    <select 
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    >
                      <option value="career">キャリア (Career)</option>
                      <option value="business">ビジネス・起業 (Business)</option>
                      <option value="study">学習・研究 (Study)</option>
                      <option value="health">健康・フィットネス (Health)</option>
                      <option value="asset">資産形成 (Asset)</option>
                      <option value="relationship">人間関係・コミュニティ (Relationship)</option>
                      <option value="other">その他 (Other)</option>
                    </select>
                  </div>
                )}

                {modalType === 'vision' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>目標年齢</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={formData.targetAge} 
                      onChange={(e) => setFormData({ ...formData, targetAge: Number(e.target.value) })}
                      min={1}
                      max={120}
                      required 
                    />
                  </div>
                )}

                {modalType !== 'task' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>目標達成期日</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={formData.targetDate} 
                      onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                      required 
                    />
                  </div>
                )}

                {modalType === 'action' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>KPI測定単位</label>
                      <input 
                        type="text" 
                        placeholder="例: TOEIC点数, 読破数" 
                        className="form-input"
                        value={formData.kpiMetric}
                        onChange={(e) => setFormData({ ...formData, kpiMetric: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>目標値</label>
                      <input 
                        type="number" 
                        className="form-input"
                        value={formData.kpiTarget}
                        onChange={(e) => setFormData({ ...formData, kpiTarget: Number(e.target.value) })}
                        min={0}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>現在値</label>
                      <input 
                        type="number" 
                        className="form-input"
                        value={formData.kpiCurrent}
                        onChange={(e) => setFormData({ ...formData, kpiCurrent: Number(e.target.value) })}
                        min={0}
                        required
                      />
                    </div>
                  </div>
                )}

                {modalType === 'task' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input 
                        type="checkbox" 
                        id="isRoutine"
                        checked={formData.isRoutine} 
                        onChange={(e) => setFormData({ ...formData, isRoutine: e.target.checked })}
                      />
                      <label htmlFor="isRoutine" style={{ fontSize: '13px', cursor: 'pointer' }}>ルーティン（習慣）にする</label>
                    </div>

                    {formData.isRoutine ? (
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>頻度</label>
                        <select 
                          className="form-select"
                          value={formData.frequency}
                          onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                        >
                          <option value="daily">毎日 (Daily)</option>
                          <option value="weekly">毎週 (Weekly)</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>タスク期日</label>
                        <input 
                          type="date" 
                          className="form-input" 
                          value={formData.targetDate} 
                          onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                          required 
                        />
                      </div>
                    )}

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>目標アロケーション（時間/週）</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={formData.timeAllocated} 
                        onChange={(e) => setFormData({ ...formData, timeAllocated: Number(e.target.value) })}
                        min={0.5}
                        step={0.5}
                        required 
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>説明・メモ</label>
                  <textarea 
                    className="form-textarea" 
                    rows={3} 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', justifySelf: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>キャンセル</button>
                  <button type="submit" className="btn btn-primary">{modalMode === 'add' ? '追加する' : '変更を保存'}</button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* CSS style */}
      <style>{`
        .btn-icon {
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.15s;
        }
        .btn-icon:hover {
          color: var(--text-primary);
        }
      `}</style>

    </div>
  );
};
