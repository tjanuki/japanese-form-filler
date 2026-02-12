// PrimeVue DatePicker filler

import { FieldDetector } from '../../utils/fieldDetector';
import { UserData } from '../../utils/dataGenerator';
import { isElementVisible } from '../../utils/elementUtils';

export function fillPrimeVueDatePicker(element: HTMLElement, userData: UserData): boolean {
  if (!isElementVisible(element)) {
    return false;
  }

  const switchedMode = ensureSingleDateMode(element);
  if (switchedMode) {
    setTimeout(() => {
      fillPrimeVueDatePickerAfterModeSwitch(element, userData);
    }, 300);
    return true;
  }

  return fillPrimeVueDatePickerAfterModeSwitch(element, userData);
}

function fillPrimeVueDatePickerAfterModeSwitch(element: HTMLElement, userData: UserData): boolean {
  const input = element.querySelector('.p-datepicker-input') as HTMLInputElement;
  if (!input) {
    return false;
  }

  if (input.value && input.value.trim() !== '') {
    return false;
  }

  if (input.disabled) {
    return false;
  }

  const fieldType = detectDatePickerFieldType(element);
  const dateValue = getDateValueForFieldType(fieldType, userData);

  const button = element.querySelector('.p-datepicker-dropdown') as HTMLButtonElement;

  const success1 = tryDirectValueSet(input, dateValue);
  if (success1) {
    return true;
  }

  if (button) {
    const success2 = tryCalendarSelection(element, button, dateValue);
    if (success2) {
      return true;
    }
  }

  return false;
}

function ensureSingleDateMode(element: HTMLElement): boolean {
  try {
    const parentContainer = element.closest('.mb-4, .flex-1, .form-group, .field');
    if (!parentContainer) {
      return false;
    }

    const radioButtons = parentContainer.querySelectorAll('input[type="radio"]');

    for (const radio of Array.from(radioButtons)) {
      const radioInput = radio as HTMLInputElement;
      const radioValue = radioInput.value;
      const radioId = radioInput.id;

      let radioLabel = '';
      if (radioId) {
        const label = parentContainer.querySelector(`label[for="${radioId}"]`);
        if (label) {
          radioLabel = label.textContent?.trim() || '';
        }
      }

      if (radioValue === 'date' || radioLabel === '日付') {
        if (!radioInput.checked) {
          radioInput.click();
          radioInput.dispatchEvent(new Event('change', { bubbles: true }));

          const radioWrapper = radioInput.closest('.p-radiobutton');
          if (radioWrapper) {
            (radioWrapper as HTMLElement).click();
          }

          return true;
        } else {
          return false;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('[FormFiller] Error ensuring single date mode:', error);
    return false;
  }
}

function detectDatePickerFieldType(element: HTMLElement): string {
  const identifiers = FieldDetector.getElementIdentifiers(element);
  const input = element.querySelector('.p-datepicker-input');
  if (input) {
    identifiers.push(...FieldDetector.getElementIdentifiers(input as HTMLElement));
  }

  const combinedString = identifiers.join(' ').toLowerCase();

  if (/birth|生年月日|誕生日|birthday/.test(combinedString)) {
    return 'birth-date';
  }

  if (/勤務日|work.*date|working.*date/.test(combinedString)) {
    return 'work-date';
  }

  if (/発注締切|発注.*締.*切|order.*deadline/.test(combinedString)) {
    return 'order-deadline';
  }

  if (/応募締切|応募.*締.*切|application.*deadline/.test(combinedString)) {
    return 'application-deadline';
  }

  if (/募集締切|募集.*締.*切|recruitment.*deadline/.test(combinedString)) {
    return 'recruitment-deadline';
  }

  if (/キャンセル期限|キャンセル.*期.*限|cancel.*deadline|cancellation/.test(combinedString)) {
    return 'cancellation-deadline';
  }

  if (/deadline|締切|締め切り|期限/.test(combinedString)) {
    return 'generic-deadline';
  }

  if (/開始|start|from/.test(combinedString)) {
    return 'start-date';
  }

  if (/終了|end|to/.test(combinedString)) {
    return 'end-date';
  }

  return 'generic-date';
}

function getDateValueForFieldType(fieldType: string, userData: UserData): string {
  const today = new Date();
  let targetDate: Date;

  switch (fieldType) {
    case 'birth-date':
      return userData.dateOfBirth;

    case 'work-date':
      targetDate = new Date(today);
      targetDate.setDate(today.getDate() + (5 * 7));
      break;

    case 'order-deadline':
      targetDate = new Date(today);
      targetDate.setDate(today.getDate() + (4 * 7));
      break;

    case 'application-deadline':
      targetDate = new Date(today);
      targetDate.setDate(today.getDate() + (4 * 7));
      break;

    case 'recruitment-deadline':
      targetDate = new Date(today);
      targetDate.setDate(today.getDate() + (3 * 7));
      break;

    case 'cancellation-deadline':
      targetDate = new Date(today);
      targetDate.setDate(today.getDate() + (2 * 7));
      break;

    case 'generic-deadline':
      targetDate = new Date(today);
      targetDate.setDate(today.getDate() + 7);
      break;

    case 'start-date':
      targetDate = new Date(today);
      targetDate.setDate(today.getDate() + 7);
      break;

    case 'end-date':
      targetDate = new Date(today);
      targetDate.setDate(today.getDate() + (6 * 7));
      break;

    case 'generic-date':
    default:
      targetDate = today;
      break;
  }

  return formatDate(targetDate);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateJapanese(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${year}年${parseInt(month)}月${parseInt(day)}日`;
}

function tryDirectValueSet(input: HTMLInputElement, dateValue: string): boolean {
  try {
    const wasReadonly = input.readOnly;
    const inputMode = input.getAttribute('inputmode');

    if (inputMode === 'none' && !wasReadonly) {
      return false;
    }

    const formats = [
      dateValue,
      dateValue.replace(/-/g, '/'),
      formatDateJapanese(dateValue),
    ];

    for (let i = 0; i < formats.length; i++) {
      const format = formats[i];

      if (wasReadonly) {
        input.readOnly = false;
      }

      input.value = '';
      input.focus();

      input.value = format;

      const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      if (valueSetter) {
        valueSetter.call(input, format);
      }

      input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      input.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        composed: true,
        inputType: 'insertText',
        data: format
      }));

      input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      input.dispatchEvent(new Event('update:modelValue', { bubbles: true }));

      if (wasReadonly) {
        input.blur();
        input.dispatchEvent(new Event('blur', { bubbles: true }));
      }

      if (wasReadonly) {
        input.readOnly = true;
      }

      if (input.value !== '') {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('[FormFiller] Error in tryDirectValueSet:', error);
    return false;
  }
}

function tryCalendarSelection(element: HTMLElement, button: HTMLButtonElement, dateValue: string): boolean {
  try {
    const panelId = element.id + '_panel';

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node instanceof HTMLElement) {
              if (node.classList.contains('p-datepicker-panel') || node.querySelector('.p-datepicker-panel')) {
                const panel = node.classList.contains('p-datepicker-panel')
                  ? node
                  : node.querySelector('.p-datepicker-panel') as HTMLElement;

                if (panel) {
                  setTimeout(() => selectDateFromPanel(panel, dateValue), 50);
                }
              }
            }
          });
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
    }, 1000);

    button.click();

    setTimeout(() => {
      let panel: HTMLElement | null = document.getElementById(panelId);

      if (!panel) {
        const ariaControls = button.getAttribute('aria-controls');
        if (ariaControls) {
          panel = document.getElementById(ariaControls);
        }
      }

      if (!panel) {
        const allPanels = document.querySelectorAll('.p-datepicker-panel, [role="dialog"][aria-modal="true"]');

        for (let i = 0; i < allPanels.length; i++) {
          const p = allPanels[i] as HTMLElement;
          const computedStyle = window.getComputedStyle(p);
          const isVisible = computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden';

          if (isVisible) {
            panel = p;
            break;
          }
        }
      }

      if (!panel) {
        return;
      }

      selectDateFromPanel(panel, dateValue);
    }, 200);

    return true;
  } catch (error) {
    console.error('[FormFiller] Error in tryCalendarSelection:', error);
    return false;
  }
}

function selectDateFromPanel(panel: HTMLElement, dateValue: string): void {
  const [targetYear, targetMonth, targetDay] = dateValue.split('-').map(Number);

  navigateToMonthYear(panel, targetYear, targetMonth);

  setTimeout(() => {
    const dates = panel.querySelectorAll('.p-datepicker-day:not(.p-datepicker-day-disabled)');

    let targetDateElement: HTMLElement | null = null;

    for (const dateEl of Array.from(dates)) {
      const dayText = dateEl.textContent?.trim();
      if (dayText && parseInt(dayText) === targetDay) {
        targetDateElement = dateEl as HTMLElement;
        break;
      }
    }

    if (!targetDateElement && dates.length > 0) {
      targetDateElement = dates[Math.floor(dates.length / 2)] as HTMLElement;
    }

    if (targetDateElement) {
      targetDateElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true }));
      targetDateElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      targetDateElement.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));

      targetDateElement.click();

      if (targetDateElement instanceof HTMLElement) {
        targetDateElement.focus();
        targetDateElement.click();
      }

      setTimeout(() => {
        const stillVisible = panel.offsetParent !== null;

        if (stillVisible) {
          panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
          document.body.click();
        }
      }, 100);
    }
  }, 100);
}

function navigateToMonthYear(panel: HTMLElement, targetYear: number, targetMonth: number): boolean {
  try {
    const monthSelect = panel.querySelector('.p-datepicker-month') as HTMLSelectElement;
    const yearSelect = panel.querySelector('.p-datepicker-year') as HTMLSelectElement;

    if (monthSelect && yearSelect) {
      yearSelect.value = targetYear.toString();
      yearSelect.dispatchEvent(new Event('change', { bubbles: true }));

      monthSelect.value = (targetMonth - 1).toString();
      monthSelect.dispatchEvent(new Event('change', { bubbles: true }));

      return true;
    }

    const titleEl = panel.querySelector('.p-datepicker-title');
    if (!titleEl) {
      return false;
    }

    const titleText = titleEl.textContent || '';

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

    const monthDiff = (targetYear - currentYear) * 12 + (targetMonth - currentMonth);

    if (monthDiff === 0) {
      return true;
    }

    const prevButton = panel.querySelector('.p-datepicker-prev, [data-pc-section="prevbutton"]');
    const nextButton = panel.querySelector('.p-datepicker-next, [data-pc-section="nextbutton"]');

    if (!prevButton || !nextButton) {
      return false;
    }

    const button = monthDiff > 0 ? nextButton : prevButton;
    const clicks = Math.abs(monthDiff);

    for (let i = 0; i < Math.min(clicks, 12); i++) {
      (button as HTMLElement).click();
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
