// Japanese name generator
// Generates realistic Japanese names in various formats

import { JapaneseName, NameData } from '../utils/types';

export const surnames: NameData[] = [
  { kanji: '佐藤', hiragana: 'さとう', katakana: 'サトウ', romaji: 'Sato' },
  { kanji: '鈴木', hiragana: 'すずき', katakana: 'スズキ', romaji: 'Suzuki' },
  { kanji: '高橋', hiragana: 'たかはし', katakana: 'タカハシ', romaji: 'Takahashi' },
  { kanji: '田中', hiragana: 'たなか', katakana: 'タナカ', romaji: 'Tanaka' },
  { kanji: '渡辺', hiragana: 'わたなべ', katakana: 'ワタナベ', romaji: 'Watanabe' },
  { kanji: '伊藤', hiragana: 'いとう', katakana: 'イトウ', romaji: 'Ito' },
  { kanji: '山本', hiragana: 'やまもと', katakana: 'ヤマモト', romaji: 'Yamamoto' },
  { kanji: '中村', hiragana: 'なかむら', katakana: 'ナカムラ', romaji: 'Nakamura' },
  { kanji: '小林', hiragana: 'こばやし', katakana: 'コバヤシ', romaji: 'Kobayashi' },
  { kanji: '加藤', hiragana: 'かとう', katakana: 'カトウ', romaji: 'Kato' },
  { kanji: '吉田', hiragana: 'よしだ', katakana: 'ヨシダ', romaji: 'Yoshida' },
  { kanji: '山田', hiragana: 'やまだ', katakana: 'ヤマダ', romaji: 'Yamada' },
  { kanji: '佐々木', hiragana: 'ささき', katakana: 'ササキ', romaji: 'Sasaki' },
  { kanji: '山口', hiragana: 'やまぐち', katakana: 'ヤマグチ', romaji: 'Yamaguchi' },
  { kanji: '松本', hiragana: 'まつもと', katakana: 'マツモト', romaji: 'Matsumoto' },
  { kanji: '井上', hiragana: 'いのうえ', katakana: 'イノウエ', romaji: 'Inoue' },
  { kanji: '木村', hiragana: 'きむら', katakana: 'キムラ', romaji: 'Kimura' },
  { kanji: '林', hiragana: 'はやし', katakana: 'ハヤシ', romaji: 'Hayashi' },
  { kanji: '斎藤', hiragana: 'さいとう', katakana: 'サイトウ', romaji: 'Saito' },
  { kanji: '清水', hiragana: 'しみず', katakana: 'シミズ', romaji: 'Shimizu' }
];

export const givenNamesMale: NameData[] = [
  { kanji: '太郎', hiragana: 'たろう', katakana: 'タロウ', romaji: 'Taro' },
  { kanji: '健二', hiragana: 'けんじ', katakana: 'ケンジ', romaji: 'Kenji' },
  { kanji: '隆', hiragana: 'たかし', katakana: 'タカシ', romaji: 'Takashi' },
  { kanji: '誠', hiragana: 'まこと', katakana: 'マコト', romaji: 'Makoto' },
  { kanji: '浩', hiragana: 'ひろし', katakana: 'ヒロシ', romaji: 'Hiroshi' },
  { kanji: '一郎', hiragana: 'いちろう', katakana: 'イチロウ', romaji: 'Ichiro' },
  { kanji: '大輔', hiragana: 'だいすけ', katakana: 'ダイスケ', romaji: 'Daisuke' },
  { kanji: '翔太', hiragana: 'しょうた', katakana: 'ショウタ', romaji: 'Shota' },
  { kanji: '拓也', hiragana: 'たくや', katakana: 'タクヤ', romaji: 'Takuya' },
  { kanji: '雄太', hiragana: 'ゆうた', katakana: 'ユウタ', romaji: 'Yuta' },
  { kanji: '健太', hiragana: 'けんた', katakana: 'ケンタ', romaji: 'Kenta' },
  { kanji: '颯', hiragana: 'はやて', katakana: 'ハヤテ', romaji: 'Hayate' },
  { kanji: '蓮', hiragana: 'れん', katakana: 'レン', romaji: 'Ren' },
  { kanji: '陽斗', hiragana: 'はると', katakana: 'ハルト', romaji: 'Haruto' },
  { kanji: '悠真', hiragana: 'ゆうま', katakana: 'ユウマ', romaji: 'Yuma' }
];

export const givenNamesFemale: NameData[] = [
  { kanji: '花子', hiragana: 'はなこ', katakana: 'ハナコ', romaji: 'Hanako' },
  { kanji: '美咲', hiragana: 'みさき', katakana: 'ミサキ', romaji: 'Misaki' },
  { kanji: '由美', hiragana: 'ゆみ', katakana: 'ユミ', romaji: 'Yumi' },
  { kanji: '恵子', hiragana: 'けいこ', katakana: 'ケイコ', romaji: 'Keiko' },
  { kanji: '陽菜', hiragana: 'ひな', katakana: 'ヒナ', romaji: 'Hina' },
  { kanji: '結衣', hiragana: 'ゆい', katakana: 'ユイ', romaji: 'Yui' },
  { kanji: 'さくら', hiragana: 'さくら', katakana: 'サクラ', romaji: 'Sakura' },
  { kanji: '愛', hiragana: 'あい', katakana: 'アイ', romaji: 'Ai' },
  { kanji: '葵', hiragana: 'あおい', katakana: 'アオイ', romaji: 'Aoi' },
  { kanji: '結菜', hiragana: 'ゆいな', katakana: 'ユイナ', romaji: 'Yuina' },
  { kanji: '莉子', hiragana: 'りこ', katakana: 'リコ', romaji: 'Riko' },
  { kanji: '凛', hiragana: 'りん', katakana: 'リン', romaji: 'Rin' },
  { kanji: '杏', hiragana: 'あん', katakana: 'アン', romaji: 'An' },
  { kanji: '美優', hiragana: 'みゆ', katakana: 'ミユ', romaji: 'Miyu' },
  { kanji: '彩花', hiragana: 'あやか', katakana: 'アヤカ', romaji: 'Ayaka' }
];

export function generateJapaneseName(gender?: 'male' | 'female'): JapaneseName {
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const givenNames = gender === 'female' ? givenNamesFemale :
                    gender === 'male' ? givenNamesMale :
                    Math.random() > 0.5 ? givenNamesMale : givenNamesFemale;
  const givenName = givenNames[Math.floor(Math.random() * givenNames.length)];

  return {
    kanjiSurname: surname.kanji,
    kanjiGivenName: givenName.kanji,
    hiraganaSurname: surname.hiragana,
    hiraganaGivenName: givenName.hiragana,
    katakanaSurname: surname.katakana,
    katakanaGivenName: givenName.katakana,
    romajiSurname: surname.romaji,
    romajiGivenName: givenName.romaji
  };
}
