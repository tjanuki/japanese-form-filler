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

    // Find and fill PrimeVue DatePicker components
    const primeDatePickers = document.querySelectorAll('.p-datepicker');
    console.log(`[FormFiller] Found ${primeDatePickers.length} PrimeVue DatePicker components`);
    primeDatePickers.forEach((element) => {
      if (this.fillPrimeVueDatePicker(element as HTMLElement, userData)) {
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

    // For DatePickers and other complex components, also search parent container for labels
    // This handles cases where the label is in a sibling div of a parent container
    if (element.classList.contains('p-datepicker') || element.classList.contains('p-inputwrapper')) {
      const parentContainer = element.closest('.mb-4, .form-group, .field, [class*="flex"]');
      if (parentContainer) {
        const containerLabels = parentContainer.querySelectorAll('label');
        containerLabels.forEach(lbl => {
          const text = lbl.textContent?.trim();
          if (text && !identifiers.includes(text)) {
            identifiers.push(text);
          }
        });
      }
    }

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
    let depth = 0;
    const maxDepth = 5; // Search up to 5 levels up

    while (parent && depth < maxDepth) {
      if (parent.tagName === 'LABEL') return parent as HTMLLabelElement;

      // Check for label in the same container (common in form layouts)
      const siblingLabel = parent.querySelector('label');
      if (siblingLabel) return siblingLabel as HTMLLabelElement;

      // Also check for previous sibling labels
      let prevSibling = parent.previousElementSibling;
      while (prevSibling) {
        if (prevSibling.tagName === 'LABEL') {
          return prevSibling as HTMLLabelElement;
        }
        const labelInPrev = prevSibling.querySelector('label');
        if (labelInPrev) {
          return labelInPrev as HTMLLabelElement;
        }
        prevSibling = prevSibling.previousElementSibling;
      }

      parent = parent.parentElement;
      depth++;
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

  private fillPrimeVueDatePicker(element: HTMLElement, userData: UserData): boolean {
    console.log('[FormFiller] Analyzing PrimeVue DatePicker:', {
      id: element.id,
      classes: element.className,
      innerHTML: element.innerHTML.substring(0, 200)
    });

    // Check if this is a date/range selector and switch to single date mode if needed
    const switchedMode = this.ensureSingleDateMode(element);
    if (switchedMode) {
      // Wait for the UI to update after switching mode
      console.log('[FormFiller] Waiting for UI to update after mode switch...');
      setTimeout(() => {
        this.fillPrimeVueDatePickerAfterModeSwitch(element, userData);
      }, 300);
      return true; // Return true as we initiated the fill
    }

    return this.fillPrimeVueDatePickerAfterModeSwitch(element, userData);
  }

  private fillPrimeVueDatePickerAfterModeSwitch(element: HTMLElement, userData: UserData): boolean {
    // Find the input element
    const input = element.querySelector('.p-datepicker-input') as HTMLInputElement;
    if (!input) {
      console.log('[FormFiller] No input found in DatePicker');
      return false;
    }

    console.log('[FormFiller] DatePicker input:', {
      id: input.id,
      value: input.value,
      readonly: input.readOnly,
      disabled: input.disabled,
      type: input.type,
      role: input.getAttribute('role'),
      ariaExpanded: input.getAttribute('aria-expanded')
    });

    // Skip if already has a value
    if (input.value && input.value.trim() !== '') {
      console.log('[FormFiller] DatePicker already has value:', input.value);
      return false;
    }

    // Skip if disabled
    if (input.disabled) {
      console.log('[FormFiller] DatePicker is disabled');
      return false;
    }

    // Detect field type based on context
    const fieldType = this.detectDatePickerFieldType(element);
    console.log('[FormFiller] Detected DatePicker field type:', fieldType);

    // Get the date value
    const dateValue = this.getDateValueForFieldType(fieldType, userData);
    console.log('[FormFiller] Generated date value:', dateValue);

    // Find the button to open the picker
    const button = element.querySelector('.p-datepicker-dropdown') as HTMLButtonElement;
    console.log('[FormFiller] DatePicker button:', {
      found: !!button,
      ariaExpanded: button?.getAttribute('aria-expanded')
    });

    // Try different approaches to set the date
    console.log('[FormFiller] Attempting to fill DatePicker...');

    // Approach 1: Try setting the input value directly
    console.log('[FormFiller] Approach 1: Setting input value directly');
    const success1 = this.tryDirectValueSet(input, dateValue);
    if (success1) {
      console.log('[FormFiller] ✓ Direct value set successful');
      return true;
    }

    // Approach 2: Try clicking the button and selecting from calendar
    if (button) {
      console.log('[FormFiller] Approach 2: Opening calendar picker');
      const success2 = this.tryCalendarSelection(element, button, dateValue);
      if (success2) {
        console.log('[FormFiller] ✓ Calendar selection successful');
        return true;
      }
    }

    console.log('[FormFiller] ✗ Failed to fill DatePicker');
    return false;
  }

  private ensureSingleDateMode(element: HTMLElement): boolean {
    try {
      // Find the parent container that might have radio buttons
      const parentContainer = element.closest('.mb-4, .flex-1, .form-group, .field');
      if (!parentContainer) {
        console.log('[FormFiller] No parent container found for date/range selector');
        return false;
      }

      // Look for radio buttons with value="date" or label "日付"
      const radioButtons = parentContainer.querySelectorAll('input[type="radio"]');
      console.log('[FormFiller] Found', radioButtons.length, 'radio buttons in container');

      for (const radio of Array.from(radioButtons)) {
        const radioInput = radio as HTMLInputElement;
        const radioValue = radioInput.value;
        const radioId = radioInput.id;

        // Find the label for this radio button
        let radioLabel = '';
        if (radioId) {
          const label = parentContainer.querySelector(`label[for="${radioId}"]`);
          if (label) {
            radioLabel = label.textContent?.trim() || '';
          }
        }

        console.log('[FormFiller] Radio button:', {
          id: radioId,
          value: radioValue,
          label: radioLabel,
          checked: radioInput.checked
        });

        // Check if this is the "date" (日付) option
        if (radioValue === 'date' || radioLabel === '日付') {
          if (!radioInput.checked) {
            console.log('[FormFiller] Switching to single date mode by clicking "日付" radio button');

            // Click the radio button input directly
            radioInput.click();

            // Also trigger change event
            radioInput.dispatchEvent(new Event('change', { bubbles: true }));

            // Click the wrapper element if it exists (PrimeVue RadioButton)
            const radioWrapper = radioInput.closest('.p-radiobutton');
            if (radioWrapper) {
              (radioWrapper as HTMLElement).click();
            }

            console.log('[FormFiller] Clicked "日付" radio button, mode switched');
            return true; // Indicate that we switched modes
          } else {
            console.log('[FormFiller] Already in single date mode');
            return false; // Already in correct mode, no switch needed
          }
        }
      }

      console.log('[FormFiller] No date/range selector found');
      return false;
    } catch (error) {
      console.error('[FormFiller] Error ensuring single date mode:', error);
      return false;
    }
  }

  private detectDatePickerFieldType(element: HTMLElement): string {
    const identifiers = this.getElementIdentifiers(element);
    const input = element.querySelector('.p-datepicker-input');
    if (input) {
      identifiers.push(...this.getElementIdentifiers(input as HTMLElement));
    }

    const combinedString = identifiers.join(' ').toLowerCase();
    console.log('[FormFiller] DatePicker identifiers:', combinedString);

    // Check for specific date field types (order matters - check most specific first)

    // Birth date (past date)
    if (/birth|生年月日|誕生日|birthday/.test(combinedString)) {
      return 'birth-date';
    }

    // Work date - 勤務日 (+5 weeks - furthest future date)
    if (/勤務日|work.*date|working.*date/.test(combinedString)) {
      return 'work-date';
    }

    // Order deadline - 発注締切 (+4 weeks)
    if (/発注締切|発注.*締.*切|order.*deadline/.test(combinedString)) {
      return 'order-deadline';
    }

    // Application deadline - 応募締切 (+4 weeks, same as order deadline)
    if (/応募締切|応募.*締.*切|application.*deadline/.test(combinedString)) {
      return 'application-deadline';
    }

    // Recruitment deadline - 募集締切 (+3 weeks)
    if (/募集締切|募集.*締.*切|recruitment.*deadline/.test(combinedString)) {
      return 'recruitment-deadline';
    }

    // Cancellation deadline - キャンセル期限 (+2 weeks)
    if (/キャンセル期限|キャンセル.*期.*限|cancel.*deadline|cancellation/.test(combinedString)) {
      return 'cancellation-deadline';
    }

    // Generic deadline/period (use generic future date)
    if (/deadline|締切|締め切り|期限/.test(combinedString)) {
      return 'generic-deadline';
    }

    // Start date
    if (/開始|start|from/.test(combinedString)) {
      return 'start-date';
    }

    // End date
    if (/終了|end|to/.test(combinedString)) {
      return 'end-date';
    }

    return 'generic-date';
  }

  private getDateValueForFieldType(fieldType: string, userData: UserData): string {
    const today = new Date();
    let targetDate: Date;

    switch (fieldType) {
      case 'birth-date':
        // Use the userData birth date (past)
        return userData.dateOfBirth;

      case 'work-date':
        // 勤務日: +5 weeks (furthest in the future)
        targetDate = new Date(today);
        targetDate.setDate(today.getDate() + (5 * 7));
        console.log('[FormFiller] Work date (+5 weeks):', this.formatDate(targetDate));
        break;

      case 'order-deadline':
        // 発注締切: +4 weeks
        targetDate = new Date(today);
        targetDate.setDate(today.getDate() + (4 * 7));
        console.log('[FormFiller] Order deadline (+4 weeks):', this.formatDate(targetDate));
        break;

      case 'application-deadline':
        // 応募締切: +4 weeks (same as order deadline)
        targetDate = new Date(today);
        targetDate.setDate(today.getDate() + (4 * 7));
        console.log('[FormFiller] Application deadline (+4 weeks):', this.formatDate(targetDate));
        break;

      case 'recruitment-deadline':
        // 募集締切: +3 weeks
        targetDate = new Date(today);
        targetDate.setDate(today.getDate() + (3 * 7));
        console.log('[FormFiller] Recruitment deadline (+3 weeks):', this.formatDate(targetDate));
        break;

      case 'cancellation-deadline':
        // キャンセル期限: +2 weeks
        targetDate = new Date(today);
        targetDate.setDate(today.getDate() + (2 * 7));
        console.log('[FormFiller] Cancellation deadline (+2 weeks):', this.formatDate(targetDate));
        break;

      case 'generic-deadline':
        // Generic deadline: +1 week
        targetDate = new Date(today);
        targetDate.setDate(today.getDate() + 7);
        break;

      case 'start-date':
        // Start date: +1 week
        targetDate = new Date(today);
        targetDate.setDate(today.getDate() + 7);
        break;

      case 'end-date':
        // End date: +6 weeks (should be after work date)
        targetDate = new Date(today);
        targetDate.setDate(today.getDate() + (6 * 7));
        break;

      case 'generic-date':
      default:
        // Use today's date
        targetDate = today;
        console.log('[FormFiller] Generic date (today):', this.formatDate(today));
        break;
    }

    // Format as YYYY-MM-DD
    return this.formatDate(targetDate);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private tryDirectValueSet(input: HTMLInputElement, dateValue: string): boolean {
    try {
      const wasReadonly = input.readOnly;
      const inputMode = input.getAttribute('inputmode');
      console.log('[FormFiller] Input readonly state:', wasReadonly, 'inputmode:', inputMode);

      // If inputmode is "none", this input is designed to only accept calendar input
      // But we'll still try for readonly inputs since those worked
      if (inputMode === 'none' && !wasReadonly) {
        console.log('[FormFiller] Input has inputmode="none" and not readonly, skipping direct value set');
        return false;
      }

      // Try to access Vue component instance
      console.log('[FormFiller] Attempting to access Vue component...');
      const vueKey = Object.keys(input).find(key => key.startsWith('__v'));
      if (vueKey) {
        console.log('[FormFiller] Found Vue key:', vueKey);
        const vueInstance = (input as any)[vueKey];
        console.log('[FormFiller] Vue instance:', vueInstance);
      }

      // Try different date formats
      const formats = [
        dateValue, // YYYY-MM-DD
        dateValue.replace(/-/g, '/'), // YYYY/MM/DD
        this.formatDateJapanese(dateValue), // YYYY年MM月DD日
      ];

      console.log('[FormFiller] Trying date formats:', formats);

      for (let i = 0; i < formats.length; i++) {
        const format = formats[i];
        console.log(`[FormFiller] === Attempt ${i + 1}: ${format} ===`);

        // Temporarily remove readonly to set value
        if (wasReadonly) {
          input.readOnly = false;
        }

        // Clear existing value
        input.value = '';

        // Focus first
        input.focus();
        console.log('[FormFiller] Focused input');

        // Set the value using multiple approaches
        // 1. Direct value set
        input.value = format;
        console.log('[FormFiller] Set value directly:', input.value);

        // 2. Set via property descriptor if available
        const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        if (valueSetter) {
          valueSetter.call(input, format);
          console.log('[FormFiller] Set value via property descriptor:', input.value);
        }

        // 3. Trigger Vue-specific events
        // Create a custom event that Vue might be listening for
        input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        input.dispatchEvent(new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          composed: true,
          inputType: 'insertText',
          data: format
        }));

        console.log('[FormFiller] After input events, value:', input.value);

        // Trigger change event
        input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        console.log('[FormFiller] After change event, value:', input.value);

        // Trigger update event (Vue-specific)
        input.dispatchEvent(new Event('update:modelValue', { bubbles: true }));

        // DON'T blur yet - check if value is still there before blur
        console.log('[FormFiller] Before blur, value:', input.value);

        // Only blur if readonly (which worked), otherwise skip blur
        if (wasReadonly) {
          input.blur();
          input.dispatchEvent(new Event('blur', { bubbles: true }));
          console.log('[FormFiller] After blur, final value:', input.value);
        } else {
          console.log('[FormFiller] Skipping blur for non-readonly input');
        }

        // Restore readonly state
        if (wasReadonly) {
          input.readOnly = true;
        }

        console.log('[FormFiller] Final value check:', input.value, 'readonly restored:', input.readOnly);

        // If value stuck, we're successful
        if (input.value !== '') {
          console.log('[FormFiller] ✓ Format', format, 'succeeded!');
          return true;
        }
      }

      console.log('[FormFiller] ✗ All formats failed, value is still empty');
      return false;
    } catch (error) {
      console.error('[FormFiller] Error in tryDirectValueSet:', error);
      return false;
    }
  }

  private formatDateJapanese(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${year}年${parseInt(month)}月${parseInt(day)}日`;
  }

  private tryCalendarSelection(element: HTMLElement, button: HTMLButtonElement, dateValue: string): boolean {
    try {
      console.log('[FormFiller] Clicking DatePicker button to open calendar');

      // Get the panel ID for this specific datepicker
      const panelId = element.id + '_panel';
      console.log('[FormFiller] Looking for panel ID:', panelId);

      // Set up a MutationObserver to detect when the panel is added to the DOM
      const observer = new MutationObserver((mutations) => {
        console.log('[FormFiller] DOM mutations detected:', mutations.length);

        for (const mutation of mutations) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
              if (node instanceof HTMLElement) {
                // Check if this is the panel or contains the panel
                if (node.classList.contains('p-datepicker-panel') || node.querySelector('.p-datepicker-panel')) {
                  console.log('[FormFiller] Panel detected via MutationObserver!');
                  const panel = node.classList.contains('p-datepicker-panel')
                    ? node
                    : node.querySelector('.p-datepicker-panel') as HTMLElement;

                  if (panel) {
                    console.log('[FormFiller] Found panel:', panel.id, panel.className);
                    // Try to select a date immediately
                    setTimeout(() => this.selectDateFromPanel(panel, dateValue), 50);
                  }
                }
              }
            });
          }
        }
      });

      // Observe the entire document for added nodes
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Stop observing after 1 second
      setTimeout(() => {
        observer.disconnect();
        console.log('[FormFiller] MutationObserver disconnected');
      }, 1000);

      // Click the button to open the calendar
      button.click();

      // Also try the traditional timeout-based approach as a backup
      setTimeout(() => {
        console.log('[FormFiller] Timeout-based lookup starting...');

        // Try to find the specific panel for this datepicker
        let panel: HTMLElement | null = document.getElementById(panelId);

        // If not found by ID, try to find by aria-controls
        if (!panel) {
          const ariaControls = button.getAttribute('aria-controls');
          console.log('[FormFiller] Panel not found by ID, trying aria-controls:', ariaControls);
          if (ariaControls) {
            panel = document.getElementById(ariaControls);
          }
        }

        // If still not found, find ANY panel that exists
        if (!panel) {
          console.log('[FormFiller] Panel not found by aria-controls, looking for any panel');
          const allPanels = document.querySelectorAll('.p-datepicker-panel, [role="dialog"][aria-modal="true"]');
          console.log('[FormFiller] Found', allPanels.length, 'total panels');

          for (let i = 0; i < allPanels.length; i++) {
            const p = allPanels[i] as HTMLElement;
            const computedStyle = window.getComputedStyle(p);
            const isVisible = computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden';

            console.log('[FormFiller] Panel', i, ':', {
              id: p.id,
              offsetParent: p.offsetParent !== null,
              display: computedStyle.display,
              visibility: computedStyle.visibility,
              isVisible: isVisible,
              classes: p.className
            });

            if (isVisible) {
              panel = p;
              console.log('[FormFiller] Using visible panel:', p.id);
              break;
            }
          }
        }

        if (!panel) {
          console.log('[FormFiller] Calendar panel not found after all attempts');
          return;
        }

        this.selectDateFromPanel(panel, dateValue);
      }, 200);

      return true;
    } catch (error) {
      console.error('[FormFiller] Error in tryCalendarSelection:', error);
      return false;
    }
  }

  private selectDateFromPanel(panel: HTMLElement, dateValue: string): void {
    console.log('[FormFiller] selectDateFromPanel called for:', {
      id: panel.id,
      classes: panel.className,
      visible: panel.offsetParent !== null,
      targetDate: dateValue
    });

    // Parse the target date (YYYY-MM-DD)
    const [targetYear, targetMonth, targetDay] = dateValue.split('-').map(Number);
    console.log('[FormFiller] Target date:', { year: targetYear, month: targetMonth, day: targetDay });

    // Get the current month/year shown in the calendar
    const monthYearTitle = panel.querySelector('.p-datepicker-title');
    if (monthYearTitle) {
      console.log('[FormFiller] Current calendar title:', monthYearTitle.textContent);
    }

    // Navigate to the correct month/year if needed
    const navigated = this.navigateToMonthYear(panel, targetYear, targetMonth);
    if (!navigated) {
      console.log('[FormFiller] Failed to navigate to target month/year, will try selecting from current view');
    }

    // Wait a bit for navigation to complete
    setTimeout(() => {
      // Look for the specific date in the calendar
      const dates = panel.querySelectorAll('.p-datepicker-day:not(.p-datepicker-day-disabled)');
      console.log('[FormFiller] Found', dates.length, 'selectable dates in panel');

      let targetDateElement: HTMLElement | null = null;

      // Find the date element that matches our target day
      for (const dateEl of Array.from(dates)) {
        const dayText = dateEl.textContent?.trim();
        if (dayText && parseInt(dayText) === targetDay) {
          targetDateElement = dateEl as HTMLElement;
          console.log('[FormFiller] Found matching date element:', dayText);
          break;
        }
      }

      // Fallback: if we can't find the exact date, use middle date
      if (!targetDateElement && dates.length > 0) {
        targetDateElement = dates[Math.floor(dates.length / 2)] as HTMLElement;
        console.log('[FormFiller] Could not find exact date, using fallback:', targetDateElement.textContent?.trim());
      }

      if (targetDateElement) {
        console.log('[FormFiller] Clicking date:', targetDateElement.textContent?.trim(), 'HTML:', targetDateElement.outerHTML.substring(0, 200));

        // Try multiple click approaches
        // 1. MouseEvent sequence
        targetDateElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true }));
        targetDateElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        targetDateElement.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));

        // 2. Direct click
        targetDateElement.click();

        // 3. Focus and click
        if (targetDateElement instanceof HTMLElement) {
          targetDateElement.focus();
          targetDateElement.click();
        }

        console.log('[FormFiller] Date clicked with multiple approaches');

        // After a short delay, check if the calendar closed (indicating success)
        setTimeout(() => {
          const stillVisible = panel.offsetParent !== null;
          console.log('[FormFiller] Calendar still visible after click:', stillVisible);

          if (stillVisible) {
            console.log('[FormFiller] Calendar still open, trying to close it');
            // Try pressing Escape
            panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            // Or click outside
            document.body.click();
          }
        }, 100);
      }
    }, 100);
  }

  private navigateToMonthYear(panel: HTMLElement, targetYear: number, targetMonth: number): boolean {
    try {
      // Get current year and month from the calendar
      const monthSelect = panel.querySelector('.p-datepicker-month') as HTMLSelectElement;
      const yearSelect = panel.querySelector('.p-datepicker-year') as HTMLSelectElement;

      if (monthSelect && yearSelect) {
        console.log('[FormFiller] Found month/year selects, setting values directly');

        // Set year (months are 1-indexed in our target but 0-indexed in select)
        yearSelect.value = targetYear.toString();
        yearSelect.dispatchEvent(new Event('change', { bubbles: true }));

        // Set month (convert from 1-indexed to 0-indexed)
        monthSelect.value = (targetMonth - 1).toString();
        monthSelect.dispatchEvent(new Event('change', { bubbles: true }));

        console.log('[FormFiller] Set calendar to:', targetYear, targetMonth);
        return true;
      }

      // Alternative: use prev/next buttons to navigate
      console.log('[FormFiller] No month/year selects found, trying navigation buttons');

      // Get the title to parse current month/year
      const titleEl = panel.querySelector('.p-datepicker-title');
      if (!titleEl) {
        console.log('[FormFiller] No title element found');
        return false;
      }

      const titleText = titleEl.textContent || '';
      console.log('[FormFiller] Current title:', titleText);

      // Try to parse year and month from title
      // Common formats: "December 2025", "2025年12月", etc.
      const yearMatch = titleText.match(/\d{4}/);
      const currentYear = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();

      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const monthNamesJp = ['1月', '2月', '3月', '4月', '5月', '6月',
                           '7月', '8月', '9月', '10月', '11月', '12月'];

      let currentMonth = new Date().getMonth() + 1;
      for (let i = 0; i < monthNames.length; i++) {
        if (titleText.includes(monthNames[i]) || titleText.includes(monthNamesJp[i])) {
          currentMonth = i + 1;
          break;
        }
      }

      console.log('[FormFiller] Parsed current:', { year: currentYear, month: currentMonth });
      console.log('[FormFiller] Target:', { year: targetYear, month: targetMonth });

      // Calculate how many months to navigate
      const monthDiff = (targetYear - currentYear) * 12 + (targetMonth - currentMonth);
      console.log('[FormFiller] Months to navigate:', monthDiff);

      if (monthDiff === 0) {
        console.log('[FormFiller] Already on target month');
        return true;
      }

      // Find next/prev buttons
      const prevButton = panel.querySelector('.p-datepicker-prev, [data-pc-section="prevbutton"]');
      const nextButton = panel.querySelector('.p-datepicker-next, [data-pc-section="nextbutton"]');

      if (!prevButton || !nextButton) {
        console.log('[FormFiller] Navigation buttons not found');
        return false;
      }

      // Navigate the required number of months
      const button = monthDiff > 0 ? nextButton : prevButton;
      const clicks = Math.abs(monthDiff);

      console.log('[FormFiller] Clicking', clicks, 'times on', monthDiff > 0 ? 'next' : 'prev', 'button');

      for (let i = 0; i < Math.min(clicks, 12); i++) { // Limit to 12 clicks max
        (button as HTMLElement).click();
        // Small delay between clicks
        if (i < clicks - 1) {
          setTimeout(() => {}, 50);
        }
      }

      return true;
    } catch (error) {
      console.error('[FormFiller] Error navigating calendar:', error);
      return false;
    }
  }
}
