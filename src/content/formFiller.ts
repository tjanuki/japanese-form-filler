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

export type PageContext = 'default' | 'job-posting';

export class FormFiller {
  private dataGenerator: DataGenerator;
  private settings: FormFillerSettings;
  private pageContext: PageContext;

  constructor(settings?: FormFillerSettings) {
    this.settings = settings || {
      skipHiddenFields: true,
      skipReadonlyFields: true,
      defaultGender: 'random',
      nameFormat: 'surname-first'
    };
    this.dataGenerator = new DataGenerator();
    this.pageContext = this.detectPageContext();
  }

  private detectPageContext(): PageContext {
    const currentPath = window.location.pathname;

    if (currentPath.includes('/job-postings/create') || currentPath.includes('/job-posting/create')) {
      return 'job-posting';
    }

    return 'default';
  }

  public fillAllForms(): number {
    // Determine gender based on settings
    const gender = this.settings.defaultGender === 'random'
      ? undefined
      : this.settings.defaultGender;

    // Generate a consistent set of data for the entire page
    const userData = this.dataGenerator.generateUserData(gender);

    let fieldsFilledCount = 0;

    // Find all native form elements
    const inputs = document.querySelectorAll('input, textarea, select');

    inputs.forEach((element) => {
      if (this.fillField(element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, userData)) {
        fieldsFilledCount++;
      }
    });

    // Find and fill PrimeVue select components
    const primeSelects = document.querySelectorAll('.p-select');
    primeSelects.forEach((element) => {
      if (this.fillPrimeVueSelect(element as HTMLElement, userData)) {
        fieldsFilledCount++;
      }
    });

    // Find and fill PrimeVue multiselect components
    const primeMultiSelects = document.querySelectorAll('.p-multiselect');
    primeMultiSelects.forEach((element) => {
      if (this.fillPrimeVueMultiSelect(element as HTMLElement, userData)) {
        fieldsFilledCount++;
      }
    });

    // Find and fill PrimeVue InputNumber components
    const primeInputNumbers = document.querySelectorAll('.p-inputnumber');
    primeInputNumbers.forEach((element) => {
      if (this.fillPrimeVueInputNumber(element as HTMLElement, userData)) {
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

    const value = this.getValueForFieldType(fieldType, userData, element);

    if (value === null) {
      return false;
    }

    // Set value and trigger events
    this.setElementValue(element, value);

    return true;
  }

  private getValueForFieldType(fieldType: FieldType, userData: UserData, element?: HTMLElement): string | null {
    // For job posting pages, use job-specific values for relevant fields
    if (this.pageContext === 'job-posting' && element) {
      const jobPostingValue = this.getJobPostingValue(fieldType, element);
      if (jobPostingValue !== null) {
        return jobPostingValue;
      }
    }

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

  private getJobPostingValue(_fieldType: FieldType, element?: HTMLElement): string | null {
    // For job posting pages, we need to check the specific field context
    // to determine what kind of data to fill

    if (!element) {
      return null;
    }

    const fieldContext = this.detectJobPostingFieldContext(element);

    switch (fieldContext) {
      case 'job-title':
        return this.jobPostingData.title;
      case 'job-description':
        return this.jobPostingData.description;
      case 'skills':
        return this.jobPostingData.skills;
      case 'qualifications':
        return this.jobPostingData.qualifications;
      case 'working-hours':
        return this.jobPostingData.workingHours;
      case 'comment':
        return this.jobPostingData.comment;
      default:
        // For fields that don't match job-specific patterns, return null
        // to fall through to normal data generation
        return null;
    }
  }

  private jobPostingData = this.generateJobPostingData();

  private generateJobPostingData() {
    const titles = [
      '【急募】Webエンジニア',
      'フロントエンドエンジニア募集',
      'バックエンドエンジニア',
      'フルスタックエンジニア募集',
      'システムエンジニア',
      'プロジェクトマネージャー募集',
      '営業職',
      'カスタマーサポート募集',
      'UIデザイナー',
      'マーケティング担当者募集'
    ];

    const descriptions = [
      '自社サービスの開発・運用をお任せします。チームでのアジャイル開発経験がある方歓迎。リモートワーク可能です。',
      '新規プロジェクトの立ち上げメンバーを募集しています。企画から開発まで幅広く携わることができます。',
      'ECサイトのシステム開発・保守を担当していただきます。大規模トラフィックの経験がある方優遇。',
      'BtoBサービスの機能追加・改善業務です。ユーザーの声を直接反映できるやりがいのある仕事です。'
    ];

    const skills = [
      'HTML/CSS/JavaScript経験3年以上、React or Vue.js経験1年以上、Git使用経験',
      'Java or Python経験3年以上、SQL経験、AWS基礎知識',
      'チームリーダー経験、コミュニケーション能力、問題解決能力',
      'Excel/PowerPoint、ビジネスメール作成、電話応対経験'
    ];

    const qualifications = [
      '学歴不問、実務経験2年以上、日本語ネイティブレベル',
      '大卒以上、基本情報技術者資格保持者優遇、英語力あれば尚可',
      '高卒以上、未経験OK、研修制度充実',
      '専門・短大卒以上、同業界経験者歓迎'
    ];

    const workingHours = [
      '9:00〜18:00（休憩1時間）',
      '10:00〜19:00（フレックスタイム制）',
      '8:30〜17:30（実働8時間）',
      'シフト制（実働7.5時間）'
    ];

    const comments = [
      '案件の詳細確認のため',
      '新規プロジェクト開始に伴う人員補充',
      '業務拡大による増員',
      '欠員補充のため急募'
    ];

    return {
      title: titles[Math.floor(Math.random() * titles.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      skills: skills[Math.floor(Math.random() * skills.length)],
      qualifications: qualifications[Math.floor(Math.random() * qualifications.length)],
      workingHours: workingHours[Math.floor(Math.random() * workingHours.length)],
      comment: comments[Math.floor(Math.random() * comments.length)]
    };
  }

  private detectJobPostingFieldContext(element: HTMLElement): string | null {
    const identifiers = this.getElementIdentifiers(element);
    const combinedString = identifiers.join(' ').toLowerCase();

    // Job title fields (現場名, 案件名, タイトル)
    if (/title|現場名|案件名|タイトル|募集|職種/.test(combinedString)) {
      return 'job-title';
    }

    // Job description fields (詳細説明, 説明, 内容)
    if (/description|詳細|説明|内容|概要/.test(combinedString)) {
      return 'job-description';
    }

    // Skills fields (必要スキル, スキル, 技術)
    if (/skill|スキル|技術|経験|能力/.test(combinedString)) {
      return 'skills';
    }

    // Qualifications fields (応募資格, 資格, 条件)
    if (/qualification|資格|応募|条件|要件/.test(combinedString)) {
      return 'qualifications';
    }

    // Working hours fields (勤務時間, 時間)
    if (/hour|time|勤務時間|時間|シフト/.test(combinedString)) {
      return 'working-hours';
    }

    // Comment fields (コメント, 理由, 備考)
    if (/comment|コメント|理由|備考|メモ/.test(combinedString)) {
      return 'comment';
    }

    return null;
  }

  private getElementIdentifiers(element: HTMLElement): string[] {
    const identifiers: string[] = [];

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

  private findLabel(element: HTMLElement): HTMLLabelElement | null {
    // Find label with 'for' attribute matching element id
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label as HTMLLabelElement;
    }

    // Find parent label or nearby label in parent container
    let parent = element.parentElement;
    while (parent) {
      if (parent.tagName === 'LABEL') return parent as HTMLLabelElement;

      // Check for label in the same container (common in form layouts)
      const siblingLabel = parent.querySelector('label');
      if (siblingLabel) return siblingLabel as HTMLLabelElement;

      parent = parent.parentElement;
    }

    return null;
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
    const isPrimeInputNumber = element.classList.contains('p-inputnumber-input') ||
                               element.closest('.p-inputnumber') !== null;

    // Trigger input event (for React, Vue, Angular)
    element.dispatchEvent(new Event('input', { bubbles: true }));

    // Trigger change event
    element.dispatchEvent(new Event('change', { bubbles: true }));

    // Trigger blur event
    element.dispatchEvent(new Event('blur', { bubbles: true }));

    // For Vue components, also try InputEvent and custom events
    if (isPrimeInputNumber) {
      // Try InputEvent (more specific for Vue)
      const inputEvent = new InputEvent('input', { bubbles: true, cancelable: true });
      element.dispatchEvent(inputEvent);

      // Also try focus event before blur
      element.dispatchEvent(new Event('focus', { bubbles: true }));
    }
  }

  private fillPrimeVueSelect(element: HTMLElement, userData: UserData): boolean {
    // Skip if already has a value (not showing placeholder)
    const label = element.querySelector('.p-select-label');
    if (!label || !label.classList.contains('p-placeholder')) {
      return false;
    }

    // Skip if dropdown is already open (prevents infinite loop)
    const isOpen = element.classList.contains('p-select-open');
    if (isOpen) {
      return false;
    }

    // Detect field type from the element's context
    const fieldType = this.detectPrimeVueFieldType(element);
    if (fieldType === null) {
      return false;
    }

    // Get the preferred value for this field type
    const preferredValue = this.getValueForFieldType(fieldType, userData, element);

    // Click to open the dropdown
    const trigger = element.querySelector('.p-select-label') as HTMLElement;
    if (!trigger) return false;

    trigger.click();

    // Wait a bit for the dropdown to open, then select an option
    setTimeout(() => {
      this.selectPrimeVueOption(element, preferredValue, fieldType);
    }, 100);

    return true;
  }

  private fillPrimeVueMultiSelect(element: HTMLElement, _userData: UserData): boolean {
    // Skip if already has selections
    const label = element.querySelector('.p-multiselect-label');
    if (!label || !label.classList.contains('p-placeholder')) {
      return false;
    }

    // Click to open the dropdown
    const trigger = element.querySelector('.p-multiselect-label-container') as HTMLElement;
    if (!trigger) return false;

    trigger.click();

    // Wait a bit for the dropdown to open, then select random options
    setTimeout(() => {
      this.selectPrimeVueMultiOptions(element);
    }, 100);

    return true;
  }

  private detectPrimeVueFieldType(element: HTMLElement): FieldType | null {
    const identifiers = this.getElementIdentifiers(element);
    const combinedString = identifiers.join(' ').toLowerCase();

    // Check for prefecture/location
    if (/prefecture|都道府県|とどうふけん|todofuken|勤務地/.test(combinedString)) {
      return FieldType.PREFECTURE;
    }

    // Check for city
    if (/city|市区町村|しくちょうそん|shikuchouson/.test(combinedString)) {
      return FieldType.CITY;
    }

    // Default to generic for other selects
    return FieldType.GENERIC_TEXT;
  }

  private selectPrimeVueOption(element: HTMLElement, preferredValue: string | null, fieldType: FieldType): void {
    // Find the dropdown panel (it's rendered in a portal/teleport, so search the whole document)
    const panelId = element.id + '_list';
    let panel = document.getElementById(panelId);

    // If not found by ID, try to find any open dropdown panel
    if (!panel) {
      panel = document.querySelector('.p-select-overlay .p-select-list') as HTMLElement;
    }

    if (!panel) {
      // Close the dropdown if we can't find options
      const trigger = element.querySelector('.p-select-label') as HTMLElement;
      if (trigger) trigger.click();
      return;
    }

    const options = panel.querySelectorAll('.p-select-option');
    if (options.length === 0) {
      return;
    }

    let selectedOption: HTMLElement | null = null;

    // For prefecture fields, try to match the preferred value
    if (fieldType === FieldType.PREFECTURE && preferredValue) {
      options.forEach((opt) => {
        const text = opt.textContent?.trim() || '';
        if (text === preferredValue || text.includes(preferredValue)) {
          selectedOption = opt as HTMLElement;
        }
      });
    }

    // If no match found, select a random non-empty option
    if (!selectedOption) {
      const validOptions = Array.from(options).filter(opt => {
        const text = opt.textContent?.trim() || '';
        return text && text !== '選択してください' && text !== '';
      });

      if (validOptions.length > 0) {
        selectedOption = validOptions[Math.floor(Math.random() * validOptions.length)] as HTMLElement;
      }
    }

    if (selectedOption) {
      // Dispatch proper MouseEvent sequence for Vue compatibility
      selectedOption.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true }));
      selectedOption.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      selectedOption.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      selectedOption.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }
  }

  private selectPrimeVueMultiOptions(element: HTMLElement): void {
    // Find the dropdown panel
    const panelId = element.id + '_list';
    let panel = document.getElementById(panelId);

    if (!panel) {
      panel = document.querySelector('.p-multiselect-overlay .p-multiselect-list') as HTMLElement;
    }

    if (!panel) {
      // Close the dropdown
      const trigger = element.querySelector('.p-multiselect-label-container') as HTMLElement;
      if (trigger) trigger.click();
      return;
    }

    const options = panel.querySelectorAll('.p-multiselect-option');
    if (options.length === 0) {
      return;
    }

    // Select 1-3 random options
    const validOptions = Array.from(options).filter(opt => {
      const text = opt.textContent?.trim() || '';
      return text && text !== '';
    });

    const numToSelect = Math.min(Math.floor(Math.random() * 3) + 1, validOptions.length);
    const shuffled = validOptions.sort(() => Math.random() - 0.5);

    for (let i = 0; i < numToSelect; i++) {
      (shuffled[i] as HTMLElement).click();
    }

    // Close the dropdown after selection
    setTimeout(() => {
      // Click outside or press escape to close
      document.body.click();
    }, 100);
  }

  private fillPrimeVueInputNumber(element: HTMLElement, _userData: UserData): boolean {
    // Find the actual input element inside the InputNumber wrapper
    const input = element.querySelector('.p-inputnumber-input') as HTMLInputElement;

    if (!input) {
      return false;
    }

    // Skip if already has a value
    if (input.value && input.value.trim() !== '') {
      return false;
    }

    // Skip if disabled or readonly
    if (input.disabled || input.readOnly) {
      return false;
    }

    // Detect the field type based on context
    const fieldType = this.detectPrimeVueInputNumberFieldType(element);

    // Generate appropriate numeric value based on field type
    const value = this.generateNumericValueForFieldType(fieldType);

    // Set the value
    return this.setPrimeVueInputNumberValue(input, value);
  }

  private generateNumericValueForFieldType(fieldType: string): string {
    switch (fieldType) {
      case 'recruitment-count':
        // Number of recruits: typically 1-20
        return (Math.floor(Math.random() * 20) + 1).toString();

      case 'age':
        // Age: typically 20-65
        return (Math.floor(Math.random() * 46) + 20).toString();

      case 'daily-wage':
        // Daily wage in yen: typically 10,000-30,000
        return (Math.floor(Math.random() * 21) * 1000 + 10000).toString();

      case 'salary':
        // Monthly/yearly salary in yen: typically 200,000-500,000 for monthly
        return (Math.floor(Math.random() * 31) * 10000 + 200000).toString();

      case 'duration':
        // Duration in days/months: typically 1-12
        return (Math.floor(Math.random() * 12) + 1).toString();

      case 'generic-number':
      default:
        // Default numeric value: 1-100
        return (Math.floor(Math.random() * 100) + 1).toString();
    }
  }

  private detectPrimeVueInputNumberFieldType(element: HTMLElement): string {
    const identifiers = this.getElementIdentifiers(element);

    // Also get identifiers from the input element itself
    const input = element.querySelector('.p-inputnumber-input');
    if (input) {
      identifiers.push(...this.getElementIdentifiers(input as HTMLElement));
    }

    const combinedString = identifiers.join(' ').toLowerCase();

    // Check for common numeric fields in Japanese forms
    // Order matters! Check more specific patterns first

    // Check for wage/salary fields first (more specific)
    if (/日当|日給|時給|hourly|daily/.test(combinedString)) {
      return 'daily-wage';
    }

    if (/金額|price|料金|給料|月給|年収|salary|amount/.test(combinedString)) {
      return 'salary';
    }

    // Then check for recruitment count (must come after wage checks)
    if (/募集人数/.test(combinedString)) {
      return 'recruitment-count';
    }

    if (/人数|number|count/.test(combinedString)) {
      return 'recruitment-count';
    }

    if (/年齢|age/.test(combinedString)) {
      return 'age';
    }

    if (/期間|日数|days|months|years/.test(combinedString)) {
      return 'duration';
    }

    // Default for other number fields
    return 'generic-number';
  }

  private setPrimeVueInputNumberValue(input: HTMLInputElement, value: string): boolean {
    // Set the value
    input.value = value;

    // Trigger events for Vue to pick up the change
    // Focus the input first
    input.focus();

    // Create and dispatch input event
    const inputEvent = new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      composed: true
    });
    input.dispatchEvent(inputEvent);

    // Dispatch change event
    const changeEvent = new Event('change', {
      bubbles: true,
      cancelable: true
    });
    input.dispatchEvent(changeEvent);

    // Dispatch blur event
    input.blur();

    return true;
  }
}
