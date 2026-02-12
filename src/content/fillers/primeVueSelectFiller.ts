// PrimeVue Select and MultiSelect fillers

import { FieldDetector, FieldType } from '../../utils/fieldDetector';
import { UserData } from '../../utils/dataGenerator';
import { isElementVisible } from '../../utils/elementUtils';
import { getValueForFieldType, ValueMapperConfig } from '../../utils/valueMapper';

export function fillPrimeVueSelect(element: HTMLElement, userData: UserData, valueMapperConfig: ValueMapperConfig): boolean {
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

  // Skip non-visible elements
  if (!isElementVisible(element)) {
    return false;
  }

  // Detect field type from the element's context
  const fieldType = detectPrimeVueFieldType(element);
  if (fieldType === null) {
    return false;
  }

  // Get the preferred value for this field type
  const preferredValue = getValueForFieldType(fieldType, userData, valueMapperConfig, element);

  // Click to open the dropdown
  const trigger = element.querySelector('.p-select-label') as HTMLElement;
  if (!trigger) return false;

  trigger.click();

  // Wait a bit for the dropdown to open, then select an option
  setTimeout(() => {
    selectPrimeVueOption(element, preferredValue, fieldType);
  }, 100);

  return true;
}

export function fillPrimeVueMultiSelect(element: HTMLElement, _userData: UserData): boolean {
  // Skip if already has selections
  const label = element.querySelector('.p-multiselect-label');
  if (!label || !label.classList.contains('p-placeholder')) {
    return false;
  }

  // Skip non-visible elements
  if (!isElementVisible(element)) {
    return false;
  }

  // Click to open the dropdown
  const trigger = element.querySelector('.p-multiselect-label-container') as HTMLElement;
  if (!trigger) return false;

  trigger.click();

  // Wait a bit for the dropdown to open, then select random options
  setTimeout(() => {
    selectPrimeVueMultiOptions(element);
  }, 100);

  return true;
}

function detectPrimeVueFieldType(element: HTMLElement): FieldType | null {
  const identifiers = FieldDetector.getElementIdentifiers(element);
  const combinedString = identifiers.join(' ').toLowerCase();

  if (/prefecture|都道府県|とどうふけん|todofuken|勤務地/.test(combinedString)) {
    return FieldType.PREFECTURE;
  }

  if (/city|市区町村|しくちょうそん|shikuchouson/.test(combinedString)) {
    return FieldType.CITY;
  }

  return FieldType.GENERIC_TEXT;
}

function selectPrimeVueOption(element: HTMLElement, preferredValue: string | null, fieldType: FieldType): void {
  const panelId = element.id + '_list';
  let panel = document.getElementById(panelId);

  if (!panel) {
    panel = document.querySelector('.p-select-overlay .p-select-list') as HTMLElement;
  }

  if (!panel) {
    const trigger = element.querySelector('.p-select-label') as HTMLElement;
    if (trigger) trigger.click();
    return;
  }

  const options = panel.querySelectorAll('.p-select-option');
  if (options.length === 0) {
    return;
  }

  let selectedOption: HTMLElement | null = null;

  if (fieldType === FieldType.PREFECTURE && preferredValue) {
    options.forEach((opt) => {
      const text = opt.textContent?.trim() || '';
      if (text === preferredValue || text.includes(preferredValue)) {
        selectedOption = opt as HTMLElement;
      }
    });
  }

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
    selectedOption.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true }));
    selectedOption.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    selectedOption.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
    selectedOption.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }
}

function selectPrimeVueMultiOptions(element: HTMLElement): void {
  const panelId = element.id + '_list';
  let panel = document.getElementById(panelId);

  if (!panel) {
    panel = document.querySelector('.p-multiselect-overlay .p-multiselect-list') as HTMLElement;
  }

  if (!panel) {
    const trigger = element.querySelector('.p-multiselect-label-container') as HTMLElement;
    if (trigger) trigger.click();
    return;
  }

  const options = panel.querySelectorAll('.p-multiselect-option');
  if (options.length === 0) {
    return;
  }

  const validOptions = Array.from(options).filter(opt => {
    const text = opt.textContent?.trim() || '';
    return text && text !== '';
  });

  const numToSelect = Math.min(Math.floor(Math.random() * 3) + 1, validOptions.length);
  const shuffled = validOptions.sort(() => Math.random() - 0.5);

  for (let i = 0; i < numToSelect; i++) {
    (shuffled[i] as HTMLElement).click();
  }

  setTimeout(() => {
    document.body.click();
  }, 100);
}
