// Form filling engine
// This file contains the logic to detect and fill form fields with Japanese data

import { FieldDetector, FieldType } from '../utils/fieldDetector';
import { DataGenerator, UserData } from '../utils/dataGenerator';

export interface FormFillerSettings {
  skipHiddenFields: boolean;
  skipReadonlyFields: boolean;
  defaultGender: 'random' | 'male' | 'female';
  nameFormat: 'surname-first' | 'given-first';
}

export class FormFiller {
  private dataGenerator: DataGenerator;
  private settings: FormFillerSettings;

  constructor(settings?: FormFillerSettings) {
    this.settings = settings || {
      skipHiddenFields: true,
      skipReadonlyFields: true,
      defaultGender: 'random',
      nameFormat: 'surname-first'
    };
    this.dataGenerator = new DataGenerator();
  }

  public fillAllForms(): number {
    // Determine gender based on settings
    const gender = this.settings.defaultGender === 'random'
      ? undefined
      : this.settings.defaultGender;

    // Generate a consistent set of data for the entire page
    const userData = this.dataGenerator.generateUserData(gender);

    let fieldsFilledCount = 0;

    // Find all form elements
    const inputs = document.querySelectorAll('input, textarea, select');

    inputs.forEach((element) => {
      if (this.fillField(element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, userData)) {
        fieldsFilledCount++;
      }
    });

    return fieldsFilledCount;
  }

  private fillField(
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    userData: UserData
  ): boolean {
    // Check skip settings for hidden and readonly fields
    if (element instanceof HTMLInputElement) {
      // Skip file inputs - browsers don't allow setting their value programmatically
      if (element.type === 'file') {
        return false;
      }
      if (this.settings.skipHiddenFields && element.type === 'hidden') {
        return false;
      }
      if (this.settings.skipReadonlyFields && (element.readOnly || element.disabled)) {
        return false;
      }
    }

    const fieldType = FieldDetector.detectFieldType(element);

    if (fieldType === FieldType.IGNORE) {
      return false;
    }

    const value = this.getValueForFieldType(fieldType, userData);

    if (value === null) {
      return false;
    }

    // Set value and trigger events
    this.setElementValue(element, value);

    return true;
  }

  private getValueForFieldType(fieldType: FieldType, userData: UserData): string | null {
    const surnameFirst = this.settings.nameFormat === 'surname-first';

    switch (fieldType) {
      case FieldType.FULL_NAME_KANJI:
        return surnameFirst
          ? `${userData.name.kanjiSurname} ${userData.name.kanjiGivenName}`
          : `${userData.name.kanjiGivenName} ${userData.name.kanjiSurname}`;
      case FieldType.SURNAME_KANJI:
        return userData.name.kanjiSurname;
      case FieldType.GIVEN_NAME_KANJI:
        return userData.name.kanjiGivenName;
      case FieldType.FULL_NAME_HIRAGANA:
        return surnameFirst
          ? `${userData.name.hiraganaSurname} ${userData.name.hiraganaGivenName}`
          : `${userData.name.hiraganaGivenName} ${userData.name.hiraganaSurname}`;
      case FieldType.SURNAME_HIRAGANA:
        return userData.name.hiraganaSurname;
      case FieldType.GIVEN_NAME_HIRAGANA:
        return userData.name.hiraganaGivenName;
      case FieldType.FULL_NAME_KATAKANA:
        return surnameFirst
          ? `${userData.name.katakanaSurname} ${userData.name.katakanaGivenName}`
          : `${userData.name.katakanaGivenName} ${userData.name.katakanaSurname}`;
      case FieldType.EMAIL:
        return userData.email;
      case FieldType.PHONE:
      case FieldType.MOBILE_PHONE:
        return userData.phone;
      case FieldType.POSTAL_CODE:
        return userData.address.postalCode;
      case FieldType.PREFECTURE:
        return userData.address.prefecture;
      case FieldType.CITY:
        return userData.address.city;
      case FieldType.ADDRESS:
        return userData.address.town + userData.address.blockNumber;
      case FieldType.FULL_ADDRESS:
        return userData.address.fullAddress;
      case FieldType.COMPANY_NAME:
        return userData.companyName;
      case FieldType.DATE:
        return userData.dateOfBirth;
      case FieldType.GENERIC_TEXT:
        return 'サンプルテキスト';
      default:
        return null;
    }
  }

  private setElementValue(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string): void {
    if (element instanceof HTMLSelectElement) {
      // For select elements, try to find matching option
      this.fillSelectElement(element, value);
    } else if (element instanceof HTMLInputElement && element.type === 'radio') {
      // For radio buttons, check it
      element.checked = true;
    } else if (element instanceof HTMLInputElement && element.type === 'checkbox') {
      // For checkboxes, check randomly
      element.checked = Math.random() > 0.5;
    } else {
      // For text inputs and textareas
      element.value = value;
    }

    // Trigger events so the page knows the value changed
    this.triggerEvents(element);
  }

  private fillSelectElement(select: HTMLSelectElement, preferredValue: string): void {
    const options = Array.from(select.options);

    // Try to find exact match
    let matchingOption = options.find(opt => opt.value === preferredValue || opt.text === preferredValue);

    // If no match, select random non-empty option
    if (!matchingOption) {
      const validOptions = options.filter(opt => opt.value && opt.value !== '');
      if (validOptions.length > 0) {
        matchingOption = validOptions[Math.floor(Math.random() * validOptions.length)];
      }
    }

    if (matchingOption) {
      select.value = matchingOption.value;
    }
  }

  private triggerEvents(element: HTMLElement): void {
    // Trigger input event (for React, Vue, Angular)
    element.dispatchEvent(new Event('input', { bubbles: true }));

    // Trigger change event
    element.dispatchEvent(new Event('change', { bubbles: true }));

    // Trigger blur event
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }
}
