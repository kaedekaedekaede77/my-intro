import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Vision, Roadmap, ActionPlan, Task, TimeLog, AppState } from '../types';

interface AppContextProps {
  state: AppState;
  addVision: (vision: Omit<Vision, 'id' | 'createdAt' | 'progress'>) => void;
  updateVision: (id: string, updates: Partial<Vision>) => void;
  deleteVision: (id: string) => void;
  
  addRoadmap: (roadmap: Omit<Roadmap, 'id' | 'createdAt' | 'progress'>) => void;
  updateRoadmap: (id: string, updates: Partial<Roadmap>) => void;
  deleteRoadmap: (id: string) => void;
  
  addActionPlan: (actionPlan: Omit<ActionPlan, 'id' | 'createdAt' | 'progress'>) => void;
  updateActionPlan: (id: string, updates: Partial<ActionPlan>) => void;
  deleteActionPlan: (id: string) => void;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'timeSpent' | 'status'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  addTimeLog: (log: Omit<TimeLog, 'id' | 'loggedAt'>) => void;
  deleteTimeLog: (id: string) => void;
  
  setTheme: (theme: 'light' | 'dark') => void;
  updateAiSettings: (updates: Partial<AppState['settings']['ai']>) => void;
  setEncryptionPassword: (password: string | null) => Promise<boolean>;
  clearAllData: () => void;
  
  // 暗号化状態
  isEncryptedData: boolean;
  isUnlocked: boolean;
  unlockData: (password: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// --- 初期デモデータ ---
const getInitialDemoData = (): Omit<AppState, 'settings'> => {
  const vId = 'demo-vision-1';
  const rId1 = 'demo-roadmap-1';
  const rId2 = 'demo-roadmap-2';
  const aId1 = 'demo-action-1';
  const aId2 = 'demo-action-2';
  const aId3 = 'demo-action-3';
  const tId1 = 'demo-task-1';
  const tId2 = 'demo-task-2';
  const tId3 = 'demo-task-3';
  const tId4 = 'demo-task-4';

  const visions: Vision[] = [
    {
      id: vId,
      title: '35歳までに革新的なグローバルテックスタートアップを創業し、社会に大きなインパクトを与える',
      description: '人々の認知負荷を下げる次世代AIアシスタントのプラットフォームを構築。日本から世界へ発信するベンチャーを創出する。',
      category: 'business',
      targetAge: 35,
      targetDate: '2033-12-31',
      status: 'in_progress',
      progress: 35,
      createdAt: new Date().toISOString()
    }
  ];

  const roadmaps: Roadmap[] = [
    {
      id: rId1,
      visionId: vId,
      title: 'AIエンジニアリングおよびフルスタック開発の圧倒的スキル修得',
      description: 'モックアップ作成から大規模Webアプリの設計、AIモデルのAPI統合スキルを高め、技術統括ができる水準に達する。',
      targetDate: '2028-06-30',
      status: 'in_progress',
      progress: 45,
      createdAt: new Date().toISOString()
    },
    {
      id: rId2,
      visionId: vId,
      title: 'スタートアップファイナンス、事業計画策定能力の獲得と人脈構築',
      description: 'エンジェル投資家やVCとのリレーションを作り、シード資金調達がスムーズに実施できる土台を作る。',
      targetDate: '2030-12-31',
      status: 'todo',
      progress: 10,
      createdAt: new Date().toISOString()
    }
  ];

  const actionPlans: ActionPlan[] = [
    {
      id: aId1,
      roadmapId: rId1,
      title: 'グローバルチームで渡り合えるビジネス英語力の獲得',
      description: '海外のドキュメント、エンジニアと直接技術的なディスカッションが英語で行えるレベルを目指す。',
      targetDate: '2027-05-31',
      kpiMetric: 'TOEIC スコア',
      kpiTarget: 860,
      kpiCurrent: 780,
      status: 'in_progress',
      progress: 90,
      createdAt: new Date().toISOString()
    },
    {
      id: aId2,
      roadmapId: rId1,
      title: 'Next.js + AI APIを活用した自社MVPサービスの開発と3本デプロイ',
      description: 'プロダクトアウトとマーケットインの双方の視点でWebサービスを作り切り、ユーザー獲得までを検証。',
      targetDate: '2027-12-31',
      kpiMetric: 'デプロイ完了プロダクト数',
      kpiTarget: 3,
      kpiCurrent: 1,
      status: 'in_progress',
      progress: 33,
      createdAt: new Date().toISOString()
    },
    {
      id: aId3,
      roadmapId: rId2,
      title: '起業・スタートアップ法務および財務に関する基礎知識の体系的インプット',
      description: '専門書を10冊読破し、資本政策（Cap Table）の作成シミュレーションを完璧に行えるようにする。',
      targetDate: '2028-03-31',
      kpiMetric: '専門書読了数',
      kpiTarget: 10,
      kpiCurrent: 2,
      status: 'in_progress',
      progress: 20,
      createdAt: new Date().toISOString()
    }
  ];

  const tasks: Task[] = [
    {
      id: tId1,
      actionPlanId: aId1,
      title: '英語技術記事・ニュースのシャドーイング',
      description: '毎朝15分、CNNやTechCrunchの最新技術トレンドを聴きシャドーイングを行う。',
      isRoutine: true,
      frequency: 'daily',
      completed: false,
      timeAllocated: 3.5, // 30分 x 7日 = 3.5時間/週
      timeSpent: 24.5,
      status: 'in_progress',
      createdAt: new Date().toISOString()
    },
    {
      id: tId2,
      actionPlanId: aId2,
      title: 'My Life Architecture (本アプリ) の基本開発とデプロイ',
      description: '目標階層ツリーと美しいグラフによる進捗ダッシュボード、AIフィードバックまでを実装する。',
      isRoutine: false,
      dueDate: '2027-06-15',
      completed: true,
      timeAllocated: 20,
      timeSpent: 18.5,
      status: 'done',
      createdAt: new Date().toISOString()
    },
    {
      id: tId3,
      actionPlanId: aId2,
      title: '毎週10時間の個人プロダクト開発時間の確保',
      description: '金曜夜、土日で集中してプロダクトコードを書く習慣を維持。',
      isRoutine: true,
      frequency: 'weekly',
      completed: false,
      timeAllocated: 10,
      timeSpent: 85,
      status: 'in_progress',
      createdAt: new Date().toISOString()
    },
    {
      id: tId4,
      actionPlanId: aId3,
      title: '『コーポレートファイナンスの基礎』の読了とマインドマップ整理',
      description: 'スタートアップのバリュエーション、DCF法の考え方を学ぶ。',
      isRoutine: false,
      dueDate: '2027-07-31',
      completed: false,
      timeAllocated: 8,
      timeSpent: 2,
      status: 'in_progress',
      createdAt: new Date().toISOString()
    }
  ];

  const timeLogs: TimeLog[] = [
    {
      id: 'log-1',
      taskId: tId1,
      taskTitle: '英語技術記事・ニュースのシャドーイング',
      category: 'study',
      duration: 30,
      description: 'TechCrunch AIニュースのシャドーイングと単語整理',
      loggedAt: '2026-05-25 08:30:00'
    },
    {
      id: 'log-2',
      taskId: tId2,
      taskTitle: 'My Life Architecture の基本開発とデプロイ',
      category: 'business',
      duration: 120,
      description: '状態管理フック (useAppState) の実装とデモデータの定義',
      loggedAt: '2026-05-26 14:00:00'
    },
    {
      id: 'log-3',
      taskId: tId3,
      taskTitle: '毎週10時間の個人プロダクト開発時間の確保',
      category: 'business',
      duration: 180,
      description: 'Vite & Vanilla CSS のグローバルテーマの調整およびUI実装',
      loggedAt: '2026-05-26 21:00:00'
    },
    {
      id: 'log-4',
      taskId: tId4,
      taskTitle: '『コーポレートファイナンスの基礎』の読了とマインドマップ整理',
      category: 'study',
      duration: 60,
      description: '第1章〜第2章の通読、資本コストの概念学習',
      loggedAt: '2026-05-27 10:00:00'
    }
  ];

  return { visions, roadmaps, actionPlans, tasks, timeLogs };
};

// --- 自動ロールアップ計算アルゴリズム ---
const recalculateProgress = (
  visions: Vision[],
  roadmaps: Roadmap[],
  actionPlans: ActionPlan[],
  tasks: Task[]
) => {
  const updatedActionPlans = actionPlans.map(action => {
    // 関連するタスクを取得
    const relatedTasks = tasks.filter(t => t.actionPlanId === action.id);
    
    let progress = action.progress;
    // KPI目標設定がある場合、KPI現在値の達成率を優先計算
    if (action.kpiTarget > 0) {
      const kpiRatio = action.kpiCurrent / action.kpiTarget;
      progress = Math.min(Math.round(kpiRatio * 100), 100);
    } 
    // KPIがなく、タスクがある場合、タスク完了率を反映
    else if (relatedTasks.length > 0) {
      const completedTasks = relatedTasks.filter(t => t.completed).length;
      progress = Math.round((completedTasks / relatedTasks.length) * 100);
    }
    
    // アクションプランの進捗度に基づくステータスの自動更新
    let status = action.status;
    if (progress === 100) {
      status = 'done';
    } else if (progress > 0 && status === 'todo') {
      status = 'in_progress';
    }
    
    return { ...action, progress, status };
  });

  const updatedRoadmaps = roadmaps.map(roadmap => {
    const relatedActions = updatedActionPlans.filter(a => a.roadmapId === roadmap.id);
    let progress = 0;
    
    if (relatedActions.length > 0) {
      const sum = relatedActions.reduce((acc, a) => acc + a.progress, 0);
      progress = Math.round(sum / relatedActions.length);
    }
    
    let status = roadmap.status;
    if (progress === 100) {
      status = 'done';
    } else if (progress > 0 && status === 'todo') {
      status = 'in_progress';
    }
    
    return { ...roadmap, progress, status };
  });

  const updatedVisions = visions.map(vision => {
    const relatedRoadmaps = updatedRoadmaps.filter(r => r.visionId === vision.id);
    let progress = 0;
    
    if (relatedRoadmaps.length > 0) {
      const sum = relatedRoadmaps.reduce((acc, r) => acc + r.progress, 0);
      progress = Math.round(sum / relatedRoadmaps.length);
    }
    
    let status = vision.status;
    if (progress === 100) {
      status = 'done';
    } else if (progress > 0 && status === 'todo') {
      status = 'in_progress';
    }
    
    return { ...vision, progress, status };
  });

  return {
    visions: updatedVisions,
    roadmaps: updatedRoadmaps,
    actionPlans: updatedActionPlans
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 暗号化関連の仮ステート（Web Crypto 統合前のフォールバック用。必要に応じて crypto.ts で完全連携）
  const [isEncryptedData, setIsEncryptedData] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [cryptoKeyStr, setCryptoKeyStr] = useState<string | null>(null);

  const [state, setState] = useState<AppState>(() => {
    // 1. テーマ設定のロード
    const savedTheme = localStorage.getItem('mla_theme') as 'light' | 'dark' || 'dark';
    
    // 2. 暗号化状態のチェック
    const encryptedRaw = localStorage.getItem('mla_data_encrypted');
    if (encryptedRaw) {
      // 暗号化フラグを設定し、アンロック待ち状態に
      setIsEncryptedData(true);
      setIsUnlocked(false);
    }
    
    // 3. 通常データのロード
    const savedData = localStorage.getItem('mla_data');
    const demo = getInitialDemoData();
    
    const initialAiSettings = {
      apiKey: localStorage.getItem('mla_ai_apikey') || '',
      provider: (localStorage.getItem('mla_ai_provider') || 'mock') as 'gemini' | 'openai' | 'mock',
      modelName: localStorage.getItem('mla_ai_model') || 'gemini-1.5-flash'
    };

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        return {
          ...parsed,
          settings: {
            theme: savedTheme,
            ai: initialAiSettings,
            useEncryption: encryptedRaw !== null
          }
        };
      } catch (e) {
        console.error('Failed to load saved state, using demo data', e);
      }
    }

    return {
      ...demo,
      settings: {
        theme: savedTheme,
        ai: initialAiSettings,
        useEncryption: false
      }
    };
  });

  // テーマのHTML要素への反映
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.settings.theme);
    localStorage.setItem('mla_theme', state.settings.theme);
  }, [state.settings.theme]);

  // データの自動保存（アンロックされている場合のみ）
  useEffect(() => {
    if (!isUnlocked) return;
    
    const { settings, ...dataToSave } = state;
    
    if (state.settings.useEncryption && cryptoKeyStr) {
      // 本来は非同期で暗号化して保存
      import('../utils/crypto').then(async ({ encryptData }) => {
        try {
          const encText = await encryptData(JSON.stringify(dataToSave), cryptoKeyStr);
          localStorage.setItem('mla_data_encrypted', encText);
          localStorage.removeItem('mla_data'); // 平文は削除
        } catch (e) {
          console.error(e);
        }
      });
    } else {
      localStorage.setItem('mla_data', JSON.stringify(dataToSave));
      localStorage.removeItem('mla_data_encrypted');
    }
  }, [state.visions, state.roadmaps, state.actionPlans, state.tasks, state.timeLogs, state.settings.useEncryption, cryptoKeyStr, isUnlocked]);

  // 暗号化データのアンロック
  const unlockData = async (password: string): Promise<boolean> => {
    const encryptedRaw = localStorage.getItem('mla_data_encrypted');
    if (!encryptedRaw) return true;

    try {
      const { decryptData } = await import('../utils/crypto');
      const decryptedText = await decryptData(encryptedRaw, password);
      const parsedData = JSON.parse(decryptedText);
      
      setState(prev => ({
        ...prev,
        ...parsedData,
        settings: {
          ...prev.settings,
          useEncryption: true
        }
      }));
      setCryptoKeyStr(password);
      setIsUnlocked(true);
      return true;
    } catch (e) {
      console.error('Unlock failed:', e);
      return false;
    }
  };

  // 暗号化用パスワードの設定
  const setEncryptionPassword = async (password: string | null): Promise<boolean> => {
    if (password === null) {
      // 暗号化を解除
      setCryptoKeyStr(null);
      setState(prev => ({
        ...prev,
        settings: { ...prev.settings, useEncryption: false }
      }));
      setIsEncryptedData(false);
      setIsUnlocked(true);
      return true;
    } else {
      // 新たに暗号化を適用
      setCryptoKeyStr(password);
      setIsEncryptedData(true);
      setIsUnlocked(true);
      setState(prev => ({
        ...prev,
        settings: { ...prev.settings, useEncryption: true }
      }));
      return true;
    }
  };

  // テーマ変更
  const setTheme = (theme: 'light' | 'dark') => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, theme }
    }));
  };

  // AI設定の更新
  const updateAiSettings = (updates: Partial<AppState['settings']['ai']>) => {
    setState(prev => {
      const newAi = { ...prev.settings.ai, ...updates };
      localStorage.setItem('mla_ai_apikey', newAi.apiKey);
      localStorage.setItem('mla_ai_provider', newAi.provider);
      localStorage.setItem('mla_ai_model', newAi.modelName);
      return {
        ...prev,
        settings: { ...prev.settings, ai: newAi }
      };
    });
  };

  // 全データクリア
  const clearAllData = () => {
    localStorage.removeItem('mla_data');
    localStorage.removeItem('mla_data_encrypted');
    const demo = getInitialDemoData();
    setState(prev => ({
      ...prev,
      ...demo,
      settings: {
        ...prev.settings,
        useEncryption: false
      }
    }));
    setCryptoKeyStr(null);
    setIsEncryptedData(false);
    setIsUnlocked(true);
  };

  // --- CRUD ACTIONS & PROGRESS ROLLUP ---

  const addVision = (newVision: Omit<Vision, 'id' | 'createdAt' | 'progress'>) => {
    const vision: Vision = {
      ...newVision,
      id: `v-${Date.now()}`,
      progress: 0,
      createdAt: new Date().toISOString()
    };
    
    setState(prev => {
      const visions = [...prev.visions, vision];
      return { ...prev, visions };
    });
  };

  const updateVision = (id: string, updates: Partial<Vision>) => {
    setState(prev => {
      const visions = prev.visions.map(v => v.id === id ? { ...v, ...updates } : v);
      return { ...prev, visions };
    });
  };

  const deleteVision = (id: string) => {
    setState(prev => {
      const visions = prev.visions.filter(v => v.id !== id);
      const roadmaps = prev.roadmaps.filter(r => r.visionId !== id);
      const rIds = prev.roadmaps.filter(r => r.visionId === id).map(r => r.id);
      const actionPlans = prev.actionPlans.filter(a => !rIds.includes(a.roadmapId));
      const aIds = prev.actionPlans.filter(a => rIds.includes(a.roadmapId)).map(a => a.id);
      const tasks = prev.tasks.filter(t => !aIds.includes(t.actionPlanId));
      const tIds = prev.tasks.filter(t => aIds.includes(t.actionPlanId)).map(t => t.id);
      const timeLogs = prev.timeLogs.filter(log => !tIds.includes(log.taskId));
      
      return { ...prev, visions, roadmaps, actionPlans, tasks, timeLogs };
    });
  };

  const addRoadmap = (newRoadmap: Omit<Roadmap, 'id' | 'createdAt' | 'progress'>) => {
    const roadmap: Roadmap = {
      ...newRoadmap,
      id: `r-${Date.now()}`,
      progress: 0,
      createdAt: new Date().toISOString()
    };
    
    setState(prev => {
      const roadmaps = [...prev.roadmaps, roadmap];
      return { ...prev, roadmaps };
    });
  };

  const updateRoadmap = (id: string, updates: Partial<Roadmap>) => {
    setState(prev => {
      const roadmaps = prev.roadmaps.map(r => r.id === id ? { ...r, ...updates } : r);
      return { ...prev, roadmaps };
    });
  };

  const deleteRoadmap = (id: string) => {
    setState(prev => {
      const roadmaps = prev.roadmaps.filter(r => r.id !== id);
      const actionPlans = prev.actionPlans.filter(a => a.roadmapId !== id);
      const aIds = prev.actionPlans.filter(a => a.roadmapId === id).map(a => a.id);
      const tasks = prev.tasks.filter(t => !aIds.includes(t.actionPlanId));
      const tIds = prev.tasks.filter(t => aIds.includes(t.actionPlanId)).map(t => t.id);
      const timeLogs = prev.timeLogs.filter(log => !tIds.includes(log.taskId));
      
      const rolled = recalculateProgress(prev.visions, roadmaps, actionPlans, tasks);
      return {
        ...prev,
        visions: rolled.visions,
        roadmaps: rolled.roadmaps,
        actionPlans: rolled.actionPlans,
        tasks,
        timeLogs
      };
    });
  };

  const addActionPlan = (newAction: Omit<ActionPlan, 'id' | 'createdAt' | 'progress'>) => {
    const actionPlan: ActionPlan = {
      ...newAction,
      id: `a-${Date.now()}`,
      progress: 0,
      createdAt: new Date().toISOString()
    };
    
    setState(prev => {
      const actionPlans = [...prev.actionPlans, actionPlan];
      const rolled = recalculateProgress(prev.visions, prev.roadmaps, actionPlans, prev.tasks);
      return {
        ...prev,
        visions: rolled.visions,
        roadmaps: rolled.roadmaps,
        actionPlans: rolled.actionPlans
      };
    });
  };

  const updateActionPlan = (id: string, updates: Partial<ActionPlan>) => {
    setState(prev => {
      const actionPlans = prev.actionPlans.map(a => a.id === id ? { ...a, ...updates } : a);
      const rolled = recalculateProgress(prev.visions, prev.roadmaps, actionPlans, prev.tasks);
      return {
        ...prev,
        visions: rolled.visions,
        roadmaps: rolled.roadmaps,
        actionPlans: rolled.actionPlans
      };
    });
  };

  const deleteActionPlan = (id: string) => {
    setState(prev => {
      const actionPlans = prev.actionPlans.filter(a => a.id !== id);
      const tasks = prev.tasks.filter(t => t.actionPlanId !== id);
      const tIds = prev.tasks.filter(t => t.actionPlanId === id).map(t => t.id);
      const timeLogs = prev.timeLogs.filter(log => !tIds.includes(log.taskId));
      
      const rolled = recalculateProgress(prev.visions, prev.roadmaps, actionPlans, tasks);
      return {
        ...prev,
        visions: rolled.visions,
        roadmaps: rolled.roadmaps,
        actionPlans: rolled.actionPlans,
        tasks,
        timeLogs
      };
    });
  };

  const addTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'timeSpent' | 'status'>) => {
    const task: Task = {
      ...newTask,
      id: `t-${Date.now()}`,
      timeSpent: 0,
      status: 'todo',
      createdAt: new Date().toISOString()
    };
    
    setState(prev => {
      const tasks = [...prev.tasks, task];
      const rolled = recalculateProgress(prev.visions, prev.roadmaps, prev.actionPlans, tasks);
      return {
        ...prev,
        visions: rolled.visions,
        roadmaps: rolled.roadmaps,
        actionPlans: rolled.actionPlans,
        tasks
      };
    });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setState(prev => {
      const tasks = prev.tasks.map(t => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          // 完了ステータスの同期
          if (updates.completed !== undefined) {
            updated.status = updates.completed ? 'done' : 'in_progress';
          }
          return updated;
        }
        return t;
      });
      
      const rolled = recalculateProgress(prev.visions, prev.roadmaps, prev.actionPlans, tasks);
      return {
        ...prev,
        visions: rolled.visions,
        roadmaps: rolled.roadmaps,
        actionPlans: rolled.actionPlans,
        tasks
      };
    });
  };

  const deleteTask = (id: string) => {
    setState(prev => {
      const tasks = prev.tasks.filter(t => t.id !== id);
      const timeLogs = prev.timeLogs.filter(log => log.taskId !== id);
      const rolled = recalculateProgress(prev.visions, prev.roadmaps, prev.actionPlans, tasks);
      return {
        ...prev,
        visions: rolled.visions,
        roadmaps: rolled.roadmaps,
        actionPlans: rolled.actionPlans,
        tasks,
        timeLogs
      };
    });
  };

  const addTimeLog = (newLog: Omit<TimeLog, 'id' | 'loggedAt'>) => {
    const log: TimeLog = {
      ...newLog,
      id: `log-${Date.now()}`,
      loggedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    
    setState(prev => {
      const timeLogs = [log, ...prev.timeLogs]; // 最新を先頭に
      
      // 対応するタスクの累積投資時間を追加
      const tasks = prev.tasks.map(t => {
        if (t.id === log.taskId) {
          const addedHours = log.duration / 60;
          return {
            ...t,
            timeSpent: Number((t.timeSpent + addedHours).toFixed(2))
          };
        }
        return t;
      });
      
      return { ...prev, timeLogs, tasks };
    });
  };

  const deleteTimeLog = (id: string) => {
    setState(prev => {
      const targetLog = prev.timeLogs.find(log => log.id === id);
      if (!targetLog) return prev;
      
      const timeLogs = prev.timeLogs.filter(log => log.id !== id);
      
      // タスクの累積投資時間から減算
      const tasks = prev.tasks.map(t => {
        if (t.id === targetLog.taskId) {
          const subtractedHours = targetLog.duration / 60;
          return {
            ...t,
            timeSpent: Math.max(0, Number((t.timeSpent - subtractedHours).toFixed(2)))
          };
        }
        return t;
      });
      
      return { ...prev, timeLogs, tasks };
    });
  };

  return (
    <AppContext.Provider value={{
      state,
      addVision,
      updateVision,
      deleteVision,
      addRoadmap,
      updateRoadmap,
      deleteRoadmap,
      addActionPlan,
      updateActionPlan,
      deleteActionPlan,
      addTask,
      updateTask,
      deleteTask,
      addTimeLog,
      deleteTimeLog,
      setTheme,
      updateAiSettings,
      setEncryptionPassword,
      clearAllData,
      isEncryptedData,
      isUnlocked,
      unlockData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};
