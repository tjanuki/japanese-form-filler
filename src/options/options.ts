// Options page logic
// This file handles the settings page interactions

document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('saveBtn')!;
  const resetBtn = document.getElementById('resetBtn')!;
  const saveStatus = document.getElementById('saveStatus')!;

  // Load saved settings
  loadSettings();

  // Save button
  saveBtn.addEventListener('click', () => {
    const settings = {
      defaultGender: (document.getElementById('defaultGender') as HTMLSelectElement).value,
      nameFormat: (document.getElementById('nameFormat') as HTMLSelectElement).value,
      customCompanies: (document.getElementById('customCompanies') as HTMLTextAreaElement).value
    };

    chrome.storage.sync.set(settings, () => {
      saveStatus.textContent = '設定を保存しました';
      saveStatus.className = 'success';
      setTimeout(() => {
        saveStatus.textContent = '';
      }, 3000);
    });
  });

  // Reset button
  resetBtn.addEventListener('click', () => {
    if (confirm('設定をデフォルトに戻しますか？')) {
      const defaultSettings = {
        defaultGender: 'random',
        nameFormat: 'surname-first',
        customCompanies: ''
      };

      chrome.storage.sync.set(defaultSettings, () => {
        loadSettings();
        saveStatus.textContent = '設定をリセットしました';
        saveStatus.className = 'success';
        setTimeout(() => {
          saveStatus.textContent = '';
        }, 3000);
      });
    }
  });
});

function loadSettings(): void {
  chrome.storage.sync.get(['defaultGender', 'nameFormat', 'customCompanies'], (items: { [key: string]: any }) => {
    (document.getElementById('defaultGender') as HTMLSelectElement).value = (items.defaultGender as string) || 'random';
    (document.getElementById('nameFormat') as HTMLSelectElement).value = (items.nameFormat as string) || 'surname-first';
    (document.getElementById('customCompanies') as HTMLTextAreaElement).value = (items.customCompanies as string) || '';
  });
}
