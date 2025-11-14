// Japanese email generator

import { JapaneseName } from '../utils/types';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateJapaneseEmail(name?: JapaneseName): string {
  const domains = ['example.com', 'example.co.jp', 'test.jp', 'sample.ne.jp', 'mail.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];

  if (name) {
    // Use romaji name: taro.yamada@example.com
    return `${name.romajiGivenName.toLowerCase()}.${name.romajiSurname.toLowerCase()}@${domain}`;
  } else {
    // Random email
    return `user${randomInt(1000, 9999)}@${domain}`;
  }
}
