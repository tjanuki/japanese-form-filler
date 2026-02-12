// PrimeVue InputNumber filler

import { FieldDetector } from '../../utils/fieldDetector';
import { isElementVisible } from '../../utils/elementUtils';

export function fillPrimeVueInputNumber(element: HTMLElement): boolean {
  const input = element.querySelector('.p-inputnumber-input') as HTMLInputElement;

  if (!input) {
    return false;
  }

  if (input.value && input.value.trim() !== '') {
    return false;
  }

  if (input.disabled || input.readOnly) {
    return false;
  }

  if (!isElementVisible(element)) {
    return false;
  }

  const fieldType = detectPrimeVueInputNumberFieldType(element);
  const value = generateNumericValueForFieldType(fieldType);

  return setPrimeVueInputNumberValue(input, value);
}

function detectPrimeVueInputNumberFieldType(element: HTMLElement): string {
  const identifiers = FieldDetector.getElementIdentifiers(element);

  const input = element.querySelector('.p-inputnumber-input');
  if (input) {
    identifiers.push(...FieldDetector.getElementIdentifiers(input as HTMLElement));
  }

  const combinedString = identifiers.join(' ').toLowerCase();

  if (/日当|日給|時給|hourly|daily/.test(combinedString)) {
    return 'daily-wage';
  }

  if (/金額|price|料金|給料|月給|年収|salary|amount/.test(combinedString)) {
    return 'salary';
  }

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

  return 'generic-number';
}

function generateNumericValueForFieldType(fieldType: string): string {
  switch (fieldType) {
    case 'recruitment-count':
      return (Math.floor(Math.random() * 20) + 1).toString();
    case 'age':
      return (Math.floor(Math.random() * 46) + 20).toString();
    case 'daily-wage':
      return (Math.floor(Math.random() * 21) * 1000 + 10000).toString();
    case 'salary':
      return (Math.floor(Math.random() * 31) * 10000 + 200000).toString();
    case 'duration':
      return (Math.floor(Math.random() * 12) + 1).toString();
    case 'generic-number':
    default:
      return (Math.floor(Math.random() * 100) + 1).toString();
  }
}

function setPrimeVueInputNumberValue(input: HTMLInputElement, value: string): boolean {
  input.value = value;

  input.focus();

  const inputEvent = new InputEvent('input', {
    bubbles: true,
    cancelable: true,
    composed: true
  });
  input.dispatchEvent(inputEvent);

  const changeEvent = new Event('change', {
    bubbles: true,
    cancelable: true
  });
  input.dispatchEvent(changeEvent);

  input.blur();

  return true;
}
