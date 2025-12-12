// Japanese company name generator

export const companyNames = [
  // 前株 (prefix format - 株式会社)
  '株式会社サンプル商事',
  '株式会社山田製作所',
  '株式会社田中工業',
  '株式会社佐藤電気',
  '株式会社高橋運輸',
  '株式会社小林商店',
  '株式会社加藤食品',
  '株式会社吉田産業',
  '株式会社伊藤システム',
  '株式会社木村設計',
  '株式会社松本技研',
  '株式会社林コーポレーション',
  '株式会社清水建築',
  '株式会社山本不動産',

  // 後株 (suffix format - 株式会社)
  '日本通信株式会社',
  '東京エレクトロン株式会社',
  'グローバル開発株式会社',
  '太陽興業株式会社',
  '富士製薬株式会社',
  '関西物流株式会社',
  'アジアトレード株式会社',

  // 有限会社 (limited company)
  '有限会社テスト物産',
  '有限会社鈴木建設',
  '有限会社中村印刷',
  '有限会社渡辺機械',
  '有限会社井上商会',
  '有限会社斎藤企画',

  // 合同会社 (LLC)
  '合同会社ネクストベンチャー',
  '合同会社スタートアップラボ',
  '合同会社デジタルソリューション',
  '合同会社クリエイティブワークス',

  // 合名会社 (unlimited partnership)
  '合名会社古橋商店',
  '合名会社三田貿易',

  // 合資会社 (limited partnership)
  '合資会社中央企画',
  '合資会社西日本開発',

  // 一般社団法人 (general incorporated association)
  '一般社団法人日本技術協会',
  '一般社団法人地域活性化支援機構',

  // 屋号・個人事業 (trade names without legal entity designation)
  '山田商店',
  '鈴木工務店',
  '田中デザイン事務所',
  '佐藤コンサルティング',
  '高橋ファーム'
];

export function generateJapaneseCompanyName(): string {
  return companyNames[Math.floor(Math.random() * companyNames.length)];
}
