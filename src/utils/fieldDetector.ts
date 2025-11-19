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
    [FieldType.FULL_NAME_KANJI]: /fullname|full_name|氏名|shimei|name.*kanji/i,
    [FieldType.SURNAME_KANJI]: /surname|last.*name|姓|苗字|みょうじ|myouji|sei(?!.*kana)/i,
    [FieldType.GIVEN_NAME_KANJI]: /givenname|given.*name|first.*name|名(?!前)|なまえ|mei(?!.*kana)/i,
    [FieldType.FULL_NAME_HIRAGANA]: /name.*hiragana|ふりがな.*氏名|furigana.*name/i,
    [FieldType.SURNAME_HIRAGANA]: /surname.*hiragana|せい.*ふりがな|姓.*ひらがな|sei.*kana/i,
    [FieldType.GIVEN_NAME_HIRAGANA]: /givenname.*hiragana|めい.*ふりがな|名.*ひらがな|mei.*kana/i,
    [FieldType.FULL_NAME_KATAKANA]: /name.*katakana|カタカナ.*氏名|katakana.*name/i,
    [FieldType.PREFECTURE]: /prefecture|都道府県|とどうふけん|todofuken/i,
    [FieldType.CITY]: /city|市区町村|しくちょうそん|shikuchouson/i,
    [FieldType.ADDRESS]: /address|住所|じゅうしょ|jusho/i,
    [FieldType.COMPANY_NAME]: /company|会社|勤務先|きんむさき|kaisha/i,
    [FieldType.IGNORE]: /password|passwd|pwd|captcha|hidden|secret|otp|verification/i
  };

  static detectFieldType(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): FieldType {
    // Check if should ignore based on field purpose (password, captcha, etc.)
    // Note: hidden/disabled/readonly checks are handled by FormFiller settings
    if (this.matchesPattern(element, this.patterns[FieldType.IGNORE]!)) {
      return FieldType.IGNORE;
    }

    // Get all identifiable strings from element
    const identifiers = this.getElementIdentifiers(element);
    const combinedString = identifiers.join(' ');

    // Match against patterns in priority order
    for (const [fieldTypeStr, pattern] of Object.entries(this.patterns)) {
      const fieldType = Number(fieldTypeStr) as FieldType;
      if (fieldType === FieldType.IGNORE) continue;
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

  private static matchesPattern(element: HTMLElement, pattern: RegExp): boolean {
    return this.getElementIdentifiers(element).some(id => pattern.test(id));
  }
}
