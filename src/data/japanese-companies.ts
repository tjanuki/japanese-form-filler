// Japanese company name generator

export const companyNames = [
  '株式会社サンプル商事',
  '有限会社テスト物産',
  '株式会社山田製作所',
  '株式会社田中工業',
  '有限会社鈴木建設',
  '株式会社佐藤電気',
  '株式会社高橋運輸',
  '有限会社中村印刷',
  '株式会社小林商店',
  '株式会社加藤食品',
  '株式会社吉田産業',
  '有限会社渡辺機械',
  '株式会社伊藤システム',
  '株式会社木村設計',
  '有限会社井上商会',
  '株式会社松本技研',
  '株式会社林コーポレーション',
  '有限会社斎藤企画',
  '株式会社清水建築',
  '株式会社山本不動産'
];

export function generateJapaneseCompanyName(): string {
  return companyNames[Math.floor(Math.random() * companyNames.length)];
}
