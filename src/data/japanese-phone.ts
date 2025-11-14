// Japanese phone number generator

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateJapanesePhoneNumber(type: 'mobile' | 'landline' = 'mobile'): string {
  if (type === 'mobile') {
    // Mobile: 090/080/070-XXXX-XXXX
    const prefix = ['090', '080', '070'][Math.floor(Math.random() * 3)];
    return `${prefix}-${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`;
  } else {
    // Landline: 03-XXXX-XXXX (Tokyo area code example)
    const areaCodes = ['03', '06', '052', '092']; // Tokyo, Osaka, Nagoya, Fukuoka
    const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
    return `${areaCode}-${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`;
  }
}
