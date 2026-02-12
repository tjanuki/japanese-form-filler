// Japanese job posting data for form filling

export interface JobPostingData {
  title: string;
  description: string;
  skills: string;
  qualifications: string;
  workingHours: string;
  comment: string;
}

export function generateJobPostingData(): JobPostingData {
  const titles = [
    '【急募】Webエンジニア',
    'フロントエンドエンジニア募集',
    'バックエンドエンジニア',
    'フルスタックエンジニア募集',
    'システムエンジニア',
    'プロジェクトマネージャー募集',
    '営業職',
    'カスタマーサポート募集',
    'UIデザイナー',
    'マーケティング担当者募集'
  ];

  const descriptions = [
    '自社サービスの開発・運用をお任せします。チームでのアジャイル開発経験がある方歓迎。リモートワーク可能です。',
    '新規プロジェクトの立ち上げメンバーを募集しています。企画から開発まで幅広く携わることができます。',
    'ECサイトのシステム開発・保守を担当していただきます。大規模トラフィックの経験がある方優遇。',
    'BtoBサービスの機能追加・改善業務です。ユーザーの声を直接反映できるやりがいのある仕事です。'
  ];

  const skills = [
    'HTML/CSS/JavaScript経験3年以上、React or Vue.js経験1年以上、Git使用経験',
    'Java or Python経験3年以上、SQL経験、AWS基礎知識',
    'チームリーダー経験、コミュニケーション能力、問題解決能力',
    'Excel/PowerPoint、ビジネスメール作成、電話応対経験'
  ];

  const qualifications = [
    '学歴不問、実務経験2年以上、日本語ネイティブレベル',
    '大卒以上、基本情報技術者資格保持者優遇、英語力あれば尚可',
    '高卒以上、未経験OK、研修制度充実',
    '専門・短大卒以上、同業界経験者歓迎'
  ];

  const workingHours = [
    '9:00〜18:00（休憩1時間）',
    '10:00〜19:00（フレックスタイム制）',
    '8:30〜17:30（実働8時間）',
    'シフト制（実働7.5時間）'
  ];

  const comments = [
    '案件の詳細確認のため',
    '新規プロジェクト開始に伴う人員補充',
    '業務拡大による増員',
    '欠員補充のため急募'
  ];

  return {
    title: titles[Math.floor(Math.random() * titles.length)],
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    skills: skills[Math.floor(Math.random() * skills.length)],
    qualifications: qualifications[Math.floor(Math.random() * qualifications.length)],
    workingHours: workingHours[Math.floor(Math.random() * workingHours.length)],
    comment: comments[Math.floor(Math.random() * comments.length)]
  };
}

export function detectJobPostingFieldContext(identifiers: string[]): string | null {
  const combinedString = identifiers.join(' ').toLowerCase();

  if (/title|現場名|案件名|タイトル|募集|職種/.test(combinedString)) {
    return 'job-title';
  }

  if (/description|詳細|説明|内容|概要/.test(combinedString)) {
    return 'job-description';
  }

  if (/skill|スキル|技術|経験|能力/.test(combinedString)) {
    return 'skills';
  }

  if (/qualification|資格|応募|条件|要件/.test(combinedString)) {
    return 'qualifications';
  }

  if (/hour|time|勤務時間|時間|シフト/.test(combinedString)) {
    return 'working-hours';
  }

  if (/comment|コメント|理由|備考|メモ/.test(combinedString)) {
    return 'comment';
  }

  return null;
}

export function getJobPostingValue(data: JobPostingData, context: string | null): string | null {
  switch (context) {
    case 'job-title':
      return data.title;
    case 'job-description':
      return data.description;
    case 'skills':
      return data.skills;
    case 'qualifications':
      return data.qualifications;
    case 'working-hours':
      return data.workingHours;
    case 'comment':
      return data.comment;
    default:
      return null;
  }
}
