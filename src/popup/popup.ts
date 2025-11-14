// Popup logic
// This file handles the popup interface interactions

document.addEventListener('DOMContentLoaded', () => {
  const fillFormsBtn = document.getElementById('fillFormsBtn')!;
  const clearFormsBtn = document.getElementById('clearFormsBtn')!;
  const openSettings = document.getElementById('openSettings')!;
  const statusDiv = document.getElementById('status')!;

  // Fill forms button
  fillFormsBtn.addEventListener('click', async () => {
    statusDiv.textContent = '入力中...';

    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Send message to content script to fill forms
    chrome.tabs.sendMessage(tab.id!, { action: 'fillForms' }, (response) => {
      if (response && response.success) {
        statusDiv.textContent = `${response.fieldsCount} 件のフィールドを入力しました`;
      } else {
        statusDiv.textContent = 'エラーが発生しました';
      }
    });
  });

  // Clear forms button
  clearFormsBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id!, { action: 'clearForms' }, (response) => {
      if (response && response.success) {
        statusDiv.textContent = 'フォームをクリアしました';
      }
    });
  });

  // Open settings
  openSettings.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  // Load saved options
  chrome.storage.sync.get(['skipHiddenFields', 'skipReadonlyFields'], (items) => {
    (document.getElementById('skipHiddenFields') as HTMLInputElement).checked =
      items.skipHiddenFields !== false;
    (document.getElementById('skipReadonlyFields') as HTMLInputElement).checked =
      items.skipReadonlyFields !== false;
  });

  // Save options when changed
  document.getElementById('skipHiddenFields')!.addEventListener('change', (e) => {
    chrome.storage.sync.set({ skipHiddenFields: (e.target as HTMLInputElement).checked });
  });

  document.getElementById('skipReadonlyFields')!.addEventListener('change', (e) => {
    chrome.storage.sync.set({ skipReadonlyFields: (e.target as HTMLInputElement).checked });
  });
});
