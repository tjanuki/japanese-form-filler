// Japanese address generator
// Generates realistic Japanese addresses

import { JapaneseAddress } from '../utils/types';

export const prefectures = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

export const cities: { [key: string]: string[] } = {
  '東京都': ['千代田区', '中央区', '港区', '新宿区', '文京区', '台東区', '墨田区', '江東区', '品川区', '目黒区', '大田区', '世田谷区', '渋谷区', '中野区', '杉並区', '豊島区', '北区', '荒川区', '板橋区', '練馬区', '足立区', '葛飾区', '江戸川区'],
  '大阪府': ['大阪市', '堺市', '岸和田市', '豊中市', '池田市', '吹田市', '泉大津市', '高槻市', '貝塚市', '守口市', '枚方市', '茨木市', '八尾市', '泉佐野市', '富田林市', '寝屋川市', '河内長野市', '松原市', '大東市', '和泉市'],
  '神奈川県': ['横浜市', '川崎市', '相模原市', '横須賀市', '平塚市', '鎌倉市', '藤沢市', '小田原市', '茅ヶ崎市', '逗子市', '三浦市', '秦野市', '厚木市', '大和市', '伊勢原市', '海老名市', '座間市', '南足柄市', '綾瀬市'],
  '千葉県': ['千葉市', '銚子市', '市川市', '船橋市', '館山市', '木更津市', '松戸市', '野田市', '茂原市', '成田市', '佐倉市', '東金市', '旭市', '習志野市', '柏市', '勝浦市', '市原市', '流山市', '八千代市', '我孫子市'],
  '埼玉県': ['さいたま市', '川越市', '熊谷市', '川口市', '行田市', '秩父市', '所沢市', '飯能市', '加須市', '本庄市', '東松山市', '春日部市', '狭山市', '羽生市', '鴻巣市', '深谷市', '上尾市', '草加市', '越谷市', '蕨市']
};

const townNames = [
  '青葉', '旭町', '中央', '本町', '東', '西', '南', '北', '緑', '桜',
  '神宮前', '表参道', '六本木', '赤坂', '麻布', '白金', '銀座', '日本橋',
  '浅草', '上野', '池袋', '新宿', '渋谷', '恵比寿', '目黒', '品川'
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTownName(): string {
  return townNames[Math.floor(Math.random() * townNames.length)];
}

export function generateJapaneseAddress(): JapaneseAddress {
  const prefecture = prefectures[Math.floor(Math.random() * prefectures.length)];
  const prefectureCities = cities[prefecture] || ['○○市'];
  const city = prefectureCities[Math.floor(Math.random() * prefectureCities.length)];

  const postalCode = `${randomInt(100, 999)}-${randomInt(1000, 9999)}`;
  const town = generateTownName();
  const blockNumber = `${randomInt(1, 9)}-${randomInt(1, 30)}-${randomInt(1, 20)}`;

  const fullAddress = `〒${postalCode} ${prefecture}${city}${town}${blockNumber}`;

  return {
    postalCode,
    prefecture,
    city,
    town,
    blockNumber,
    fullAddress
  };
}
