import type { AppState } from '../types';

/**
 * 疑似AI（ローカル・インテリジェント・エンジン）用の自動テンプレート生成
 */
const generateMockRoadmap = (visionTitle: string): {
  roadmaps: { title: string; description: string; duration: string }[];
  actions: { rIndex: number; title: string; description: string; kpiMetric: string; kpiTarget: number }[];
  tasks: { aIndex: number; title: string; description: string; isRoutine: boolean; frequency?: 'daily' | 'weekly'; timeAllocated: number }[];
} => {
  const title = visionTitle.toLowerCase();
  
  // 1. IT/開発/起業系の目標の場合
  if (title.includes('起業') || title.includes('スタートアップ') || title.includes('開発') || title.includes('エンジニア') || title.includes('サービス') || title.includes('プロダクト')) {
    return {
      roadmaps: [
        { title: '実務・開発スキルの徹底習得とMVP開発', description: 'フルスタック開発の技術力を高め、プロトタイプを自力で構築する。', duration: '1〜2年目' },
        { title: '市場検証とユーザー獲得、ビジネスモデル構築', description: 'MVPをリリースし、初期の熱狂的ユーザーを獲得する。事業計画を具体化。', duration: '3〜4年目' },
        { title: 'チームビルディングと資金調達、本格ローンチ', description: '優秀な仲間を集め、エンジェル・VC等からシード資金を調達してスケールさせる。', duration: '5年目' }
      ],
      actions: [
        { rIndex: 0, title: 'Web/AIアプリ開発スキルの修得', description: '主要なモダンフレームワークとAI APIを統合した開発力', kpiMetric: '開発完了プロダクト数', kpiTarget: 3 },
        { rIndex: 1, title: 'MVPサービスのローンチとユーザーテスト', description: 'ユーザーのフィードバックから継続的な製品改修を行う', kpiMetric: 'インタビュー実施人数', kpiTarget: 20 },
        { rIndex: 2, title: '創業資金（シード）の獲得', description: '必要な初期開発・広告資金を調達', kpiMetric: '調達金額(万円)', kpiTarget: 1000 }
      ],
      tasks: [
        { aIndex: 0, title: '個人プロダクトのコーディング時間確保', description: '週末と平日夜を活用して集中してプロダクトを作る', isRoutine: true, frequency: 'weekly', timeAllocated: 10 },
        { aIndex: 0, title: '技術書やトレンド記事のインプット', description: '毎日最新の技術ドキュメントをチェック', isRoutine: true, frequency: 'daily', timeAllocated: 1 },
        { aIndex: 1, title: 'プロダクトのランディングページ(LP)公開', description: 'サービスの価値提案をまとめたLPを作り、事前登録を募る', isRoutine: false, timeAllocated: 12 },
        { aIndex: 2, title: 'ピッチデッキ（事業説明スライド）の作成', description: '投資家に魅力を伝えるスライドを15枚程度で構築', isRoutine: false, timeAllocated: 15 }
      ]
    };
  }
  
  // 2. 勉強/キャリア/英語/研究系目標の場合
  if (title.includes('英語') || title.includes('語学') || title.includes('留学') || title.includes('研究') || title.includes('学位') || title.includes('キャリア') || title.includes('転職')) {
    return {
      roadmaps: [
        { title: '基礎土台の構築と専門資格・試験の突破', description: '語学や研究分野に必要な必須スキル、資格（TOEIC, TOEFL等）を高スコアで獲得する。', duration: '1〜2年目' },
        { title: '実践・応用経験（海外派遣、プロジェクト参画）', description: '得た語学力や研究力を活かし、グローバルプロジェクトや一流機関での実務に従事する。', duration: '3〜4年目' },
        { title: '自己発信とキャリアジャンプ（第一人者としての独立/転職）', description: '蓄積した専門性で主要な地位を獲得、あるいは海外大学院進学、難関キャリアへ進む。', duration: '5年目' }
      ],
      actions: [
        { rIndex: 0, title: '語学・専門資格試験での最高到達スコア', description: '客観的なスキル証明としてのスコア獲得', kpiMetric: '目標テストスコア', kpiTarget: 900 },
        { rIndex: 1, title: '論文投稿または外部カンファレンス発表', description: '自身の専門性を外部へ証明するための成果物作成', kpiMetric: '論文・発表数', kpiTarget: 2 },
        { rIndex: 2, title: 'ターゲット難関企業・大学院への応募と内定', description: '次のキャリアステップへの挑戦', kpiMetric: '面接・選考通過社数', kpiTarget: 3 }
      ],
      tasks: [
        { aIndex: 0, title: '毎日の単語・シャドーイング訓練', description: '朝の脳が冴えている時間に進める', isRoutine: true, frequency: 'daily', timeAllocated: 1 },
        { aIndex: 0, title: '模擬試験の解答と間違えたポイントの分析', description: '週末にまとまった時間をとって解く', isRoutine: false, timeAllocated: 4 },
        { aIndex: 1, title: '専門領域の最新論文の査読・要約', description: '週に1本最新論文を読みまとめを作成', isRoutine: true, frequency: 'weekly', timeAllocated: 3 },
        { aIndex: 2, title: 'レジュメ（英文CV）のブラッシュアップ', description: 'プロの添削を活用して最高の経歴書を作る', isRoutine: false, timeAllocated: 10 }
      ]
    };
  }

  // 3. デフォルト（健康、趣味、一般的な人生設計）
  return {
    roadmaps: [
      { title: '現状把握と正しいインプット習慣の形成', description: '日々の時間の使い方、コンディションを整える基礎期。', duration: '6ヶ月〜1年' },
      { title: '実践範囲の拡大と習慣の自律化', description: '計画を実行し、安定してアウトプットを出し続けるシステムを自分の生活に組み込む。', duration: '2〜3年' },
      { title: '統合と他者・社会への価値還元', description: '成し遂げた目標を通じて、より良いコミュニティへの貢献や自身の理想的なライフスタイルの完成。', duration: '5年' }
    ],
    actions: [
      { rIndex: 0, title: '生活習慣および重要ルーティンの定着率向上', description: '無意識にこなせるレベルまで目標行動を習慣化する', kpiMetric: '週間ルーティン達成率(%)', kpiTarget: 90 },
      { rIndex: 1, title: '主要マイルストーンの達成とログ蓄積', description: 'データの定量化を進め客観的な自分の強みを掴む', kpiMetric: '蓄積ログ件数', kpiTarget: 100 },
      { rIndex: 2, title: 'ビジョンの完成とライフスタイルの調和', description: '健康・キャリア・精神的な充足が調和した状態の構築', kpiMetric: '幸福度自己評価(点/100)', kpiTarget: 95 }
    ],
    tasks: [
      { aIndex: 0, title: '朝の振り返りと1日のタイムブロッキング', description: '毎朝5分、ビジョンと今日のアクションを対比する', isRoutine: true, frequency: 'daily', timeAllocated: 0.5 },
      { aIndex: 0, title: '週次の進捗レビューとスケジュール調整', description: '日曜夜に1時間を確保して行う', isRoutine: true, frequency: 'weekly', timeAllocated: 1 },
      { aIndex: 1, title: '必要なツールや環境のセットアップ', description: '集中力を削ぐノイズのないデスク環境の整理', isRoutine: false, timeAllocated: 5 }
    ]
  };
};

/**
 * 1. AIロードマップ生成 (Gemini API 接続 または 疑似AI)
 */
export const generateAIRoadmap = async (
  visionTitle: string,
  apiKey: string,
  provider: 'gemini' | 'openai' | 'mock'
): Promise<any> => {
  if (provider === 'mock' || !apiKey) {
    // 疑似AIによる高品質モックデータ生成 (1.5秒のラグを演出してプレミアムなローディング感を出す)
    await new Promise(resolve => setTimeout(resolve, 1500));
    return generateMockRoadmap(visionTitle);
  }

  // Gemini API を直接呼ぶ場合
  if (provider === 'gemini') {
    try {
      const prompt = `
あなたは優秀な人生設計コーチ、エンタープライズ・アーキテクチャの専門家です。
ユーザーが掲げた長期ビジョンに対し、そこから逆算して以下の階層構造を持つ具体的な人生計画ロードマップを生成してください。
ビジョン: 「${visionTitle}」

出力は必ず以下のJSONフォーマットのみ（マークダウンのコードブロックにせず、生テキストのJSON）で返してください。余計な説明文は一切含めないでください。

JSON構造：
{
  "roadmaps": [
    { "title": "ロードマップ名(3〜5年スパンのマイルストーン)", "description": "詳細なロードマップ概要", "duration": "時期" } // 必ず3個生成
  ],
  "actions": [
    { "rIndex": 0, "title": "アクションプラン名(短期1年〜1ヶ月スパン)", "description": "アクション概要", "kpiMetric": "測定可能なKPI名", "kpiTarget": 100 } // 各ロードマップに関連するものを合計3〜4個生成。rIndexは0-indexedで対応するロードマップのインデックス
  ],
  "tasks": [
    { "aIndex": 0, "title": "日々のタスク/ルーティン名", "description": "説明", "isRoutine": true, "frequency": "daily", "timeAllocated": 5.0 } // 各アクションに関連する日常タスクを合計4〜5個生成。aIndexは対応するアクションプランのインデックス。isRoutineがtrueならfrequencyは"daily"か"weekly"を設定。timeAllocatedは割り当てる推奨時間(時間/週)。
  ]
}
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (!response.ok) {
        throw new Error('API呼び出しでエラーが発生しました。');
      }

      const resJson = await response.json();
      const textResponse = resJson.candidates[0].content.parts[0].text;
      return JSON.parse(textResponse.trim());
    } catch (e) {
      console.error('Gemini API call failed, falling back to mock engine', e);
      return generateMockRoadmap(visionTitle);
    }
  }

  return generateMockRoadmap(visionTitle);
};

/**
 * 2. ボトルネック自動検知ロジック
 */
export interface Bottleneck {
  id: string;
  type: 'delay' | 'time_shortage' | 'routine_broken';
  title: string;
  description: string;
  suggestion: string;
  targetId: string; // 関連するActionPlan等のID
  targetType: 'action' | 'task';
}

export const detectBottlenecks = (state: AppState): Bottleneck[] => {
  const bottlenecks: Bottleneck[] = [];
  const now = new Date();

  // ① 期限超過または迫っているアクションプランの検出
  state.actionPlans.forEach(action => {
    if (action.status !== 'done') {
      const targetDate = new Date(action.targetDate);
      const diffTime = targetDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        bottlenecks.push({
          id: `bn-delay-${action.id}`,
          type: 'delay',
          title: `期限超過: ${action.title}`,
          description: `アクションプランの期限が ${Math.abs(diffDays)} 日超過していますが、進捗率は ${action.progress}% です。`,
          suggestion: 'AI推奨: 期日の再設計を行うか、このアクション配下の日常タスク完了率を高めるために、タスク追加やルーティン時間倍増を検討してください。',
          targetId: action.id,
          targetType: 'action'
        });
      } else if (diffDays <= 7 && action.progress < 70) {
        bottlenecks.push({
          id: `bn-warning-${action.id}`,
          type: 'delay',
          title: `期限切迫: ${action.title}`,
          description: `あと ${diffDays} 日で期限を迎えますが、現在の進捗率は ${action.progress}% に留まっています。`,
          suggestion: 'AI推奨: 本アクションに関わるタスクを今週の最優先にリブロックしてください。日常ルーティン以外の余剰作業時間を3時間配分しましょう。',
          targetId: action.id,
          targetType: 'action'
        });
      }
    }
  });

  // ② タイムトラッキング実績がアロケーション（目標時間）に対して著しく少ない進行中ルーティンの検出
  state.tasks.forEach(task => {
    if (task.isRoutine && !task.completed && task.timeAllocated > 0) {
      // 1週間分の割り当てに対して、最近(直近7日)のログを集計
      const relatedLogs = state.timeLogs.filter(log => {
        if (log.taskId !== task.id) return false;
        const logDate = new Date(log.loggedAt);
        const diffTime = now.getTime() - logDate.getTime();
        return diffTime <= 7 * 24 * 60 * 60 * 1000;
      });

      const recentHours = relatedLogs.reduce((acc, log) => acc + log.duration / 60, 0);
      const achievementRate = (recentHours / task.timeAllocated) * 100;

      if (achievementRate < 40) {
        bottlenecks.push({
          id: `bn-time-${task.id}`,
          type: 'time_shortage',
          title: `時間投資不足: ${task.title}`,
          description: `週目標 ${task.timeAllocated} 時間に対して、今週は ${recentHours.toFixed(1)} 時間しか投資できていません（達成率 ${Math.round(achievementRate)}%）。`,
          suggestion: 'AI推奨: 実行可能な時間帯が確保できていません。カレンダーの朝一に30分の枠を予約するか、他のプライベート時間を制限して投資時間をねん出しましょう。',
          targetId: task.id,
          targetType: 'task'
        });
      }
    }
  });

  return bottlenecks;
};

/**
 * 3. ウィークリー・AIレビューのレポート生成 (Gemini API または 疑似AI)
 */
export const generateWeeklyReview = async (
  state: AppState,
  apiKey: string,
  provider: 'gemini' | 'openai' | 'mock'
): Promise<string> => {
  // 過去7日間のログ集計
  const now = new Date();
  const recentLogs = state.timeLogs.filter(log => {
    const logDate = new Date(log.loggedAt);
    const diff = now.getTime() - logDate.getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000;
  });

  const totalMinutes = recentLogs.reduce((acc, log) => acc + log.duration, 0);
  const totalHours = Number((totalMinutes / 60).toFixed(1));
  
  // カテゴリ別集計
  const categoryHours: { [key: string]: number } = {};
  recentLogs.forEach(log => {
    categoryHours[log.category] = (categoryHours[log.category] || 0) + (log.duration / 60);
  });

  // タスク完了率
  const activeTasks = state.tasks.filter(t => !t.isRoutine);
  const completedRecentCount = activeTasks.filter(t => t.completed).length;

  if (provider === 'mock' || !apiKey) {
    // 疑似AIによる高品質ルールベース分析
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let report = `## 📊 週次 AI 人生アーキテクチャ診断レポート\n`;
    report += `期間: 直近の7日間 | **総投資時間: ${totalHours} 時間**\n\n`;
    report += `### 🔍 アクティビティ評価\n`;
    
    if (totalHours === 0) {
      report += `⚠️ **注意**: 今週はタイムトラッキングの記録がありませんでした。人生ビジョンを実現するためには、極小のステップであっても「時間の投資」とその「データトラッキング」が不可欠です。まずは1日5分の習慣トラッキングから再開しましょう。\n\n`;
    } else {
      report += `✨ 今週は合計 **${totalHours} 時間** を自分のコアビジョンに投資できました。素晴らしい一歩です！\n`;
      report += `特に注力されたのは以下の領域です：\n`;
      Object.entries(categoryHours).forEach(([cat, hours]) => {
        report += `- **${cat.toUpperCase()}**: ${hours.toFixed(1)} 時間\n`;
      });
      report += `\n`;
    }

    report += `### 🚦 進捗とボトルネック分析\n`;
    const bns = detectBottlenecks(state);
    if (bns.length === 0) {
      report += `✅ 現在、進行中の全プランがロードマップ上の目標線に乗っています。素晴らしい自律性です。この調子で推進しましょう！\n\n`;
    } else {
      report += `⚠️ 現在、**${bns.length} 件のボトルネック**が検出されています。以下の調整を強く推奨します：\n`;
      bns.slice(0, 2).forEach(bn => {
        report += `1. **${bn.title}**\n   - *問題点*: ${bn.description}\n   - *AIからの改善策*: ${bn.suggestion}\n`;
      });
      report += `\n`;
    }

    report += `### 💡 来週への行動指針 (AI Recommendation)\n`;
    if (totalHours > 0 && Object.keys(categoryHours).length > 0) {
      const topCat = Object.entries(categoryHours).sort((a, b) => b[1] - a[1])[0][0];
      report += `来週は、最も投資が進んだ「**${topCat.toUpperCase()}**」の勢いを活かしつつ、他のやや遅れ気味な目標領域へ時間を15%分散させることで、人生のポートフォリオがさらに調和します。日々のルーティンに「朝の15分コミット」を組み込んでみてください。`;
    } else {
      report += `小さなタスクを1つ完了させることから始めましょう。1年後のマイルストーンを動かすのは、今日のたった1時間の実践です。まずはカレンダーに予約を入れてください！`;
    }

    return report;
  }

  // リアル Gemini API による生成
  try {
    const summaryData = {
      totalHours,
      categoryHours,
      completedTasksCount: completedRecentCount,
      bottlenecks: detectBottlenecks(state).map(b => ({ title: b.title, desc: b.description }))
    };

    const prompt = `
あなたは超一流のキャリア・ライフコーチAIです。
以下のユーザーの今週の活動ログ集計とボトルネックデータをもとに、心に刺さりモチベーションを爆発させ、かつデータ分析に基づく客観的で極めて具体的な「ウィークリー・人生設計レビュー」を作成してください。

【活動サマリー】
- 今週の総自己投資時間: ${summaryData.totalHours}時間
- カテゴリ別投資内訳: ${JSON.stringify(summaryData.categoryHours)} (時間単位)
- 完了した単発タスク数: ${summaryData.completedTasksCount}件
- 検出されたボトルネック: ${JSON.stringify(summaryData.bottlenecks)}

出力の構成：
## 📊 週次 AI 人生アーキテクチャ診断レポート
### 🔍 アクティビティ評価
（投資時間、行動量についての本質的なフィードバック。温かみがありつつも鋭い視点で）
### 🚦 進捗とボトルネック分析
（ボトルネックデータに対する、プロフェッショナルな原因分析とアドバイス）
### 💡 来週への行動指針 (AI Recommendation)
（来週具体的にカレンダーやアクションプランをどう書き換えるべきかのアクションプラン提案）

日本語で、マークダウン形式の綺麗なフォーマットで出力してください。
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      throw new Error('Review API call failed');
    }

    const resJson = await response.json();
    return resJson.candidates[0].content.parts[0].text;
  } catch (e) {
    console.error('Review generation failed, falling back to mock', e);
    // フォールバック
    return generateWeeklyReview(state, '', 'mock');
  }
};
