// Element visibility and skip-checking utilities

export function isElementVisible(element: HTMLElement): boolean {
  if (element instanceof HTMLInputElement && element.type === 'hidden') {
    return false;
  }
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    return false;
  }
  return true;
}

export function shouldSkipElement(element: HTMLElement): boolean {
  // Skip elements inside PrimeVue component wrappers - they are handled by dedicated PrimeVue fillers
  if (element.closest('.p-inputnumber, .p-datepicker, .p-select, .p-multiselect')) {
    return true;
  }

  // Skip zero-size elements (likely DevTools or other non-form UI)
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    return true;
  }

  return false;
}
