// Background script (Service Worker)
// This runs in the background and handles events, manages state, and coordinates between different parts of the extension

// Install event - runs when extension is first installed
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      skipHiddenFields: true,
      skipReadonlyFields: true,
      defaultGender: 'random',
      nameFormat: 'surname-first'
    });

    // Open welcome page
    chrome.tabs.create({ url: 'options.html' });
  }
});

// Add context menu (right-click menu)
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'fillForms',
    title: 'フォームを日本語データで入力',
    contexts: ['page', 'frame']
  });

  chrome.contextMenus.create({
    id: 'clearForms',
    title: 'フォームをクリア',
    contexts: ['page', 'frame']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.id) return;

  if (info.menuItemId === 'fillForms') {
    chrome.tabs.sendMessage(tab.id, { action: 'fillForms' });
  } else if (info.menuItemId === 'clearForms') {
    chrome.tabs.sendMessage(tab.id, { action: 'clearForms' });
  }
});

// Keyboard shortcut handling (configured in manifest.json)
chrome.commands.onCommand.addListener((command) => {
  if (command === 'fill-forms') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'fillForms' });
      }
    });
  }
});
