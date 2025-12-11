// Field detection system
// Identifies what type of data should be filled into each form field

export enum FieldType {
  FULL_NAME_KANJI,
  SURNAME_KANJI,
  GIVEN_NAME_KANJI,
  FULL_NAME_HIRAGANA,
  SURNAME_HIRAGANA,
  GIVEN_NAME_HIRAGANA,
  FULL_NAME_KATAKANA,
  EMAIL,
  PHONE,
  MOBILE_PHONE,
  POSTAL_CODE,
  PREFECTURE,
  CITY,
  ADDRESS,
  FULL_ADDRESS,
  COMPANY_NAME,
  DATE,
  NUMBER,
  URL,
  GENERIC_TEXT,
  IGNORE // For password, captcha, hidden fields
}

export class FieldDetector {
  private static patterns: { [key in FieldType]?: RegExp } = {
    [FieldType.EMAIL]: /email|メール|e-mail|eメール/i,
    [FieldType.PHONE]: /phone|tel|電話|でんわ|denwa/i,
    [FieldType.MOBILE_PHONE]: /mobile|携帯|けいたい|keitai/i,
    [FieldType.POSTAL_CODE]: /postal|zip|郵便|〒|ゆうびん|yuubin/i,
    [FieldType.FULL_NAME_KANJI]: /fullname|full_name|氏名|shimei|name.*kanji|担当者名/i,
    [FieldType.SURNAME_KANJI]: /surname|last.*name|姓|苗字|みょうじ|myouji|sei(?!.*kana)/i,
    [FieldType.GIVEN_NAME_KANJI]: /givenname|given.*name|first.*name|(?<!会社|案件|担当者)名(?!前)|なまえ|mei(?!.*kana)/i,
    [FieldType.FULL_NAME_HIRAGANA]: /name.*hiragana|ふりがな.*氏名|furigana.*name/i,
    [FieldType.SURNAME_HIRAGANA]: /surname.*hiragana|せい.*ふりがな|姓.*ひらがな|sei.*kana/i,
    [FieldType.GIVEN_NAME_HIRAGANA]: /givenname.*hiragana|めい.*ふりがな|名.*ひらがな|mei.*kana/i,
    [FieldType.FULL_NAME_KATAKANA]: /name.*katakana|カタカナ.*氏名|katakana.*name/i,
    [FieldType.PREFECTURE]: /prefecture|都道府県|とどうふけん|todofuken|勤務地/i,
    [FieldType.CITY]: /city|市区町村|しくちょうそん|shikuchouson/i,
    [FieldType.ADDRESS]: /address|住所|じゅうしょ|jusho|所在地/i,
    [FieldType.COMPANY_NAME]: /company.*name|会社名|勤務先|きんむさき|会社(?!所在地|住所)/i,
    [FieldType.IGNORE]: /password|passwd|pwd|captcha|hidden|secret|otp|verification/i
  };

  // Priority order for pattern matching - higher priority patterns should match first
  private static patternOrder: FieldType[] = [
    FieldType.IGNORE,
    FieldType.EMAIL,
    FieldType.PHONE,
    FieldType.MOBILE_PHONE,
    FieldType.POSTAL_CODE,
    FieldType.COMPANY_NAME,  // Check company before generic name patterns
    FieldType.FULL_NAME_KANJI,
    FieldType.SURNAME_KANJI,
    FieldType.GIVEN_NAME_KANJI,
    FieldType.FULL_NAME_HIRAGANA,
    FieldType.SURNAME_HIRAGANA,
    FieldType.GIVEN_NAME_HIRAGANA,
    FieldType.FULL_NAME_KATAKANA,
    FieldType.PREFECTURE,
    FieldType.CITY,
    FieldType.ADDRESS
  ];

  static detectFieldType(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): FieldType {
    // Get all identifiable strings from element
    const identifiers = this.getElementIdentifiers(element);
    const combinedString = identifiers.join(' ');

    // Match against patterns in priority order
    for (const fieldType of this.patternOrder) {
      const pattern = this.patterns[fieldType];
      if (pattern && pattern.test(combinedString)) {
        return fieldType;
      }
    }

    // Default based on input type
    if (element instanceof HTMLInputElement) {
      switch (element.type) {
        case 'email': return FieldType.EMAIL;
        case 'tel': return FieldType.PHONE;
        case 'date': return FieldType.DATE;
        case 'number': return FieldType.NUMBER;
        case 'url': return FieldType.URL;
        default: return FieldType.GENERIC_TEXT;
      }
    }

    return FieldType.GENERIC_TEXT;
  }

  private static getElementIdentifiers(element: HTMLElement): string[] {
    const identifiers: string[] = [];

    // Add element attributes
    if (element.id) identifiers.push(element.id);
    if (element.getAttribute('name')) identifiers.push(element.getAttribute('name')!);
    if (element.getAttribute('placeholder')) identifiers.push(element.getAttribute('placeholder')!);
    if (element.className) identifiers.push(element.className);

    // Add label text
    const label = this.findLabel(element);
    if (label) identifiers.push(label.textContent || '');

    // Add aria-label
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) identifiers.push(ariaLabel);

    return identifiers;
  }

  private static findLabel(element: HTMLElement): HTMLLabelElement | null {
    // Find label with 'for' attribute matching element id
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label as HTMLLabelElement;
    }

    // Find parent label
    let parent = element.parentElement;
    while (parent) {
      if (parent.tagName === 'LABEL') return parent as HTMLLabelElement;
      parent = parent.parentElement;
    }

    return null;
  }
}
