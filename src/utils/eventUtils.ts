// Event triggering utilities for form filling

export function triggerEvents(element: HTMLElement): void {
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
