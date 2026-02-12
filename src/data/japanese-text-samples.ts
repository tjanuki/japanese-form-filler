// Japanese generic text samples for form filling

const samples = [
  // Short samples
  'サンプルテキスト',
  'テスト入力',
  '記入例',
  'ダミーデータ',
  '入力サンプル',

  // Medium samples - common phrases
  'よろしくお願いいたします',
  'ご確認のほどお願いします',
  '問題ありません',
  '承知いたしました',
  '了解しました',
  '確認済みです',
  'お世話になっております',

  // Longer samples - sentences
  'この度はお問い合わせいただきありがとうございます。',
  '内容を確認させていただきました。',
  '詳細につきましては後日ご連絡いたします。',
  'ご不明な点がございましたらお気軽にお問い合わせください。',
  '引き続きどうぞよろしくお願いいたします。',

  // Description/comment samples
  '特に問題ございません。',
  '上記の内容で間違いありません。',
  '記載内容に同意します。',
  'その他特記事項はありません。',
  '現在のところ特にございません。',

  // Casual samples
  '了解です',
  '大丈夫です',
  'OKです',
  '問題ないです',
  '確認しました',

  // Request/inquiry samples
  '資料の送付をお願いします。',
  '詳細情報を教えてください。',
  '見積書の発行をお願いします。',
  'サンプルを送っていただけますでしょうか。',

  // Opinion/feedback samples
  '非常に満足しています。',
  'とても良いと思います。',
  '改善の余地があると感じます。',
  '今後も利用させていただきたいです。',

  // Reason/purpose samples
  '業務上必要なため',
  '今後の参考にさせていただきたく',
  '検討材料として',
  '社内での共有のため',

  // Multi-line samples
  'いつもお世話になっております。\n標記の件につきまして、ご連絡いたします。',
  '下記の通り、ご報告申し上げます。\nご確認のほどよろしくお願いいたします。',
  'この度は誠にありがとうございます。\n今後ともどうぞよろしくお願いいたします。'
];

export function getGenericTextSample(): string {
  return samples[Math.floor(Math.random() * samples.length)];
}
