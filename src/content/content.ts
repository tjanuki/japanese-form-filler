// Content script
// This file runs in the context of web pages and can interact with the DOM

import { FormFiller } from './formFiller';

// Settings interface
interface FormFillerSettings {
  skipHiddenFields: boolean;
  skipReadonlyFields: boolean;
  defaultGender: 'random' | 'male' | 'female';
  nameFormat: 'surname-first' | 'given-first';
}

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'fillForms') {
    // Load settings before filling forms
    chrome.storage.sync.get(
      ['skipHiddenFields', 'skipReadonlyFields', 'defaultGender', 'nameFormat'],
      (items) => {
        const settings: FormFillerSettings = {
          skipHiddenFields: items.skipHiddenFields !== false,
          skipReadonlyFields: items.skipReadonlyFields !== false,
          defaultGender: (items.defaultGender as 'random' | 'male' | 'female') || 'random',
          nameFormat: (items.nameFormat as 'surname-first' | 'given-first') || 'surname-first'
        };

        const filler = new FormFiller(settings);
        const fieldsCount = filler.fillAllForms();

        showNotification(`${fieldsCount} 件のフィールドを入力しました`);
        sendResponse({ success: true, fieldsCount });
      }
    );
  } else if (request.action === 'clearForms') {
    clearAllForms();
    showNotification('フォームをクリアしました');
    sendResponse({ success: true });
  }

  return true; // Keep message channel open for async response
});

function clearAllForms(): void {
  const inputs = document.querySelectorAll('input, textarea, select');

  inputs.forEach((element) => {
    if (element instanceof HTMLInputElement) {
      if (element.type === 'checkbox' || element.type === 'radio') {
        element.checked = false;
      } else if (element.type !== 'password' && element.type !== 'hidden') {
        element.value = '';
      }
    } else if (element instanceof HTMLTextAreaElement) {
      element.value = '';
    } else if (element instanceof HTMLSelectElement) {
      element.selectedIndex = 0;
    }

    // Trigger events
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

// Add visual feedback when forms are filled
function showNotification(message: string): void {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    z-index: 10000;
    font-family: sans-serif;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}
