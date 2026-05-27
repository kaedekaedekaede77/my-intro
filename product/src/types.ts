export type TargetStatus = 'todo' | 'in_progress' | 'done' | 'pending' | 'delayed';

export type TargetCategory = 'career' | 'business' | 'study' | 'health' | 'asset' | 'relationship' | 'other';

export interface Vision {
  id: string;
  title: string;
  description: string;
  category: TargetCategory;
  targetAge: number;
  targetDate: string;
  status: TargetStatus;
  progress: number; // 自動算出 (0 - 100)
  createdAt: string;
}

export interface Roadmap {
  id: string;
  visionId: string; // 親ID
  title: string;
  description: string;
  targetDate: string;
  status: TargetStatus;
  progress: number; // 自動算出 (0 - 100)
  createdAt: string;
}

export interface ActionPlan {
  id: string;
  roadmapId: string; // 親ID
  title: string;
  description: string;
  targetDate: string;
  kpiMetric: string; // 例: "TOEIC点数", "学習時間(時間)" など
  kpiTarget: number; // 目標値
  kpiCurrent: number; // 現在値
  status: TargetStatus;
  progress: number; // KPIに基づく自動算出、またはタスク完了率 (0 - 100)
  createdAt: string;
}

export interface Task {
  id: string;
  actionPlanId: string; // 親ID
  title: string;
  description: string;
  isRoutine: boolean; // ルーティン（習慣）かどうか
  frequency?: 'daily' | 'weekly' | 'monthly'; // ルーティンの場合の頻度
  dueDate?: string; // 単発タスクの場合の期日
  completed: boolean;
  timeAllocated: number; // 目標投資時間 (時間/週)
  timeSpent: number; // 実際の累積投資時間 (時間)
  status: TargetStatus;
  createdAt: string;
}

export interface TimeLog {
  id: string;
  taskId: string;
  taskTitle: string; // 表示用デナライズ
  category: TargetCategory; // 表示用デナライズ
  duration: number; // 分単位
  description: string;
  loggedAt: string; // YYYY-MM-DD HH:mm:ss
}

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash?: string; // 暗号化用
  createdAt: string;
}

export interface AISettings {
  apiKey: string;
  provider: 'gemini' | 'openai' | 'mock';
  modelName: string;
}

export interface AppState {
  visions: Vision[];
  roadmaps: Roadmap[];
  actionPlans: ActionPlan[];
  tasks: Task[];
  timeLogs: TimeLog[];
  settings: {
    theme: 'light' | 'dark';
    ai: AISettings;
    useEncryption: boolean;
  };
}
