import type { AppState } from '../types';

/**
 * ファイルのダウンロード処理を実行する
 */
export const downloadFile = (content: string, fileName: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * 人生計画全体を美しい Markdown ドキュメントにフォーマットする
 */
export const exportToMarkdown = (state: AppState): string => {
  let md = `# My Life Architecture - 人生計画書\n`;
  md += `生成日時: ${new Date().toLocaleString()}\n\n`;
  md += `---\n\n`;

  state.visions.forEach(vision => {
    md += `## 👁️ ビジョン: ${vision.title}\n`;
    md += `**カテゴリ**: ${vision.category.toUpperCase()} | **目標年齢**: ${vision.targetAge}歳 | **期日**: ${vision.targetDate} | **進捗率**: ${vision.progress}%\n`;
    md += `**説明**: ${vision.description}\n\n`;

    const relatedRoadmaps = state.roadmaps.filter(r => r.visionId === vision.id);
    relatedRoadmaps.forEach(roadmap => {
      md += `### 🗺️ ロードマップ: ${roadmap.title}\n`;
      md += `**期日**: ${roadmap.targetDate} | **進捗率**: ${roadmap.progress}% | **ステータス**: ${roadmap.status}\n`;
      md += `*説明*: ${roadmap.description}\n\n`;

      const relatedActions = state.actionPlans.filter(a => a.roadmapId === roadmap.id);
      relatedActions.forEach(action => {
        md += `#### ⚡ アクションプラン (KPI): ${action.title}\n`;
        md += `- **期日**: ${action.targetDate}\n`;
        md += `- **KPI**: ${action.kpiMetric} (目標: ${action.kpiTarget} / 現在: ${action.kpiCurrent} - ${action.progress}%)\n`;
        md += `- **詳細**: ${action.description}\n\n`;

        const relatedTasks = state.tasks.filter(t => t.actionPlanId === action.id);
        if (relatedTasks.length > 0) {
          md += `##### 📋 関連タスク・ルーティン\n`;
          relatedTasks.forEach(task => {
            const statusBox = task.completed ? '[x]' : '[ ]';
            const routineStr = task.isRoutine ? `[習慣: ${task.frequency}]` : `[期限: ${task.dueDate || 'なし'}]`;
            md += `- ${statusBox} ${task.title} ${routineStr} (目標時間: ${task.timeAllocated}h/週 | 実績: ${task.timeSpent}h)\n`;
          });
          md += `\n`;
        }
      });
    });
    md += `---\n\n`;
  });

  return md;
};

/**
 * タイムトラッキングログを CSV フォーマットにする
 */
export const exportToCsv = (state: AppState): string => {
  const headers = ['日付', 'カテゴリ', '関連タスク', '投資時間(分)', '活動メモ'];
  const rows = state.timeLogs.map(log => [
    log.loggedAt,
    log.category,
    `"${log.taskTitle.replace(/"/g, '""')}"`,
    log.duration.toString(),
    `"${log.description.replace(/"/g, '""')}"`
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.join(','))
  ].join('\n');

  // Excel等での文字化け防止のため BOM を付与
  return '\uFEFF' + csvContent;
};

/**
 * 完全な復元用 JSON を生成する
 */
export const exportToJson = (state: AppState): string => {
  const { settings, ...dataToSave } = state;
  return JSON.stringify(dataToSave, null, 2);
};
