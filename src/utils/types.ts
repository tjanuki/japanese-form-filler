// TypeScript type definitions

export interface JapaneseName {
  kanjiSurname: string;
  kanjiGivenName: string;
  hiraganaSurname: string;
  hiraganaGivenName: string;
  katakanaSurname: string;
  katakanaGivenName: string;
  romajiSurname: string;
  romajiGivenName: string;
}

export interface JapaneseAddress {
  postalCode: string;        // 123-4567
  prefecture: string;         // 東京都
  city: string;              // 渋谷区
  town: string;              // 神宮前
  blockNumber: string;       // 1-2-3
  building?: string;         // Optional building name
  fullAddress: string;       // Complete address string
}

export interface NameData {
  kanji: string;
  hiragana: string;
  katakana: string;
  romaji: string;
}
