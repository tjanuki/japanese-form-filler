// Native HTML element filler (input, textarea, select)

import { FieldDetector, FieldType } from '../../utils/fieldDetector';
import { UserData } from '../../utils/dataGenerator';
import { FormFillerSettings } from '../../utils/types';
import { shouldSkipElement } from '../../utils/elementUtils';
import { triggerEvents } from '../../utils/eventUtils';
import { getValueForFieldType, ValueMapperConfig } from '../../utils/valueMapper';

export function fillNativeField(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  userData: UserData,
  settings: FormFillerSettings,
  valueMapperConfig: ValueMapperConfig
): boolean {
  // Check skip settings for hidden and readonly fields
  if (element instanceof HTMLInputElement) {
    // Skip file inputs - browsers don't allow setting their value programmatically
    if (element.type === 'file') {
      return false;
    }
    if (settings.skipHiddenFields && element.type === 'hidden') {
      return false;
    }
    if (settings.skipReadonlyFields && (element.readOnly || element.disabled)) {
      return false;
    }
  }

  // Skip elements that shouldn't be filled (PrimeVue internals, DevTools, etc.)
  if (shouldSkipElement(element)) {
    return false;
  }

  const fieldType = FieldDetector.detectFieldType(element);

  if (fieldType === FieldType.IGNORE) {
    return false;
  }

  const value = getValueForFieldType(fieldType, userData, valueMapperConfig, element);

  if (value === null) {
    return false;
  }

  // Set value and trigger events
  setElementValue(element, value);

  return true;
}

function setElementValue(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string): void {
  if (element instanceof HTMLSelectElement) {
    fillSelectElement(element, value);
  } else if (element instanceof HTMLInputElement && element.type === 'radio') {
    element.checked = true;
  } else if (element instanceof HTMLInputElement && element.type === 'checkbox') {
    element.checked = Math.random() > 0.5;
  } else {
    element.value = value;
  }

  triggerEvents(element);
}

function fillSelectElement(select: HTMLSelectElement, preferredValue: string): void {
  const options = Array.from(select.options);

  let matchingOption = options.find(opt => opt.value === preferredValue || opt.text === preferredValue);

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
