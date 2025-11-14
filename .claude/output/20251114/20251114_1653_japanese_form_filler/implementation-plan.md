# Japanese Form Filler Chrome Extension - Implementation Plan

## Executive Summary

This plan outlines the development of a Chrome extension similar to Fake Filler, specifically designed to fill web forms with realistic Japanese fake data. The extension will automatically populate various form fields (text inputs, textareas, dropdowns, radio buttons, checkboxes) with culturally appropriate Japanese content.

---

## Phase 1: Foundation & Setup (Days 1-3)

### 1.1 Understanding Chrome Extension Basics

**Key Concepts to Learn:**
- **Manifest File**: The `manifest.json` is the configuration file that tells Chrome about your extension (name, version, permissions, files to load)
- **Content Scripts**: JavaScript files that run in the context of web pages and can interact with the DOM
- **Background Scripts**: Run in the background and handle events, manage state, and coordinate between different parts of the extension
- **Popup UI**: The interface that appears when users click the extension icon
- **Storage API**: Chrome's way to persist data across browser sessions

**Action Items:**
1. Read official Chrome Extension documentation:
   - Manifest V3 structure (latest version)
   - Content Scripts vs Background Scripts
   - Message passing between components
   - Chrome Storage API

2. Set up development environment:
   - Install Node.js and npm (for build tools)
   - Choose IDE (VS Code recommended with ESLint extension)
   - Create project folder structure

**Expected Outcome**: Understanding of Chrome extension architecture and development workflow.

---

### 1.2 Project Structure Setup

**Recommended Folder Structure:**
```
japanese-form-filler/
├── manifest.json                 # Extension configuration
├── package.json                  # NPM dependencies
├── tsconfig.json                # TypeScript configuration
├── webpack.config.js            # Build configuration
├── src/
│   ├── background/
│   │   └── background.ts        # Background script
│   ├── content/
│   │   ├── content.ts           # Main content script
│   │   └── formFiller.ts        # Form filling logic
│   ├── popup/
│   │   ├── popup.html           # Popup interface
│   │   ├── popup.ts             # Popup logic
│   │   └── popup.css            # Popup styling
│   ├── options/
│   │   ├── options.html         # Settings page
│   │   ├── options.ts           # Settings logic
│   │   └── options.css          # Settings styling
│   ├── data/
│   │   ├── japanese-names.ts    # Japanese name data
│   │   ├── japanese-addresses.ts # Address data
│   │   ├── japanese-companies.ts # Company names
│   │   └── japanese-text.ts     # Sample Japanese text
│   └── utils/
│       ├── fieldDetector.ts     # Detect field types
│       ├── dataGenerator.ts     # Generate fake data
│       └── types.ts             # TypeScript type definitions
├── public/
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
└── dist/                        # Build output (generated)
```

**Action Items:**
1. Initialize npm project: `npm init -y`
2. Install development dependencies:
   ```bash
   npm install --save-dev typescript webpack webpack-cli ts-loader
   npm install --save-dev @types/chrome copy-webpack-plugin
   ```
3. Create all directories and placeholder files
4. Set up TypeScript configuration
5. Configure Webpack for bundling

**Expected Outcome**: Complete project skeleton ready for development.

---

## Phase 2: Core Extension Infrastructure (Days 4-7)

### 2.1 Create Manifest File

**manifest.json Structure:**
```json
{
  "manifest_version": 3,
  "name": "Japanese Form Filler",
  "version": "1.0.0",
  "description": "Automatically fill forms with realistic Japanese fake data",
  "permissions": [
    "storage",
    "activeTab",
    "contextMenus"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "options_page": "options.html",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

**Key Points:**
- **Manifest V3**: Latest version with enhanced security
- **Permissions**: `storage` for saving settings, `activeTab` for accessing current page, `contextMenus` for right-click menu
- **Content Scripts**: Runs on all URLs to detect and fill forms
- **Background Service Worker**: Handles keyboard shortcuts and coordinates actions

**Action Items:**
1. Create manifest.json with proper configuration
2. Understand each permission and why it's needed
3. Research content script injection timing (`document_idle` vs `document_end`)

---

### 2.2 Build Configuration

**Webpack Setup (webpack.config.js):**
```javascript
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development', // Change to 'production' for release
  entry: {
    background: './src/background/background.ts',
    content: './src/content/content.ts',
    popup: './src/popup/popup.ts',
    options: './src/options/options.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'src/popup/popup.html', to: 'popup.html' },
        { from: 'src/popup/popup.css', to: 'popup.css' },
        { from: 'src/options/options.html', to: 'options.html' },
        { from: 'src/options/options.css', to: 'options.css' },
        { from: 'public/icons', to: 'icons' }
      ]
    })
  ]
};
```

**Action Items:**
1. Create webpack.config.js
2. Set up build scripts in package.json:
   ```json
   "scripts": {
     "build": "webpack",
     "watch": "webpack --watch",
     "build:prod": "webpack --mode production"
   }
   ```
3. Test build process: `npm run build`

**Expected Outcome**: Automated build system that compiles TypeScript and bundles extension files into `dist/` folder.

---

## Phase 3: Japanese Data Generation System (Days 8-12)

### 3.1 Japanese Name Generator

**Understanding Japanese Names:**
- Structure: 姓 (surname) + 名 (given name)
- Reading: Each name has kanji and furigana (hiragana reading)
- Common formats needed:
  - Full kanji: 山田太郎
  - Full hiragana: やまだたろう
  - Full katakana: ヤマダタロウ
  - Romaji: Yamada Taro

**Implementation (src/data/japanese-names.ts):**
```typescript
export interface JapaneseName {
  kanjiSurname: string;
  kanjiGivenName: string;
  hiraganaSurname: string;
  hiraganaGivenName: string;
  katakanaSurname: string;
  katakanaGivenName: string;
  romajiSurname: string;
  romajiGivenName: string;
}

export const surnames = [
  { kanji: '佐藤', hiragana: 'さとう', katakana: 'サトウ', romaji: 'Sato' },
  { kanji: '鈴木', hiragana: 'すずき', katakana: 'スズキ', romaji: 'Suzuki' },
  { kanji: '高橋', hiragana: 'たかはし', katakana: 'タカハシ', romaji: 'Takahashi' },
  { kanji: '田中', hiragana: 'たなか', katakana: 'タナカ', romaji: 'Tanaka' },
  // ... add 50-100 common surnames
];

export const givenNamesMale = [
  { kanji: '太郎', hiragana: 'たろう', katakana: 'タロウ', romaji: 'Taro' },
  { kanji: '健二', hiragana: 'けんじ', katakana: 'ケンジ', romaji: 'Kenji' },
  // ... add 30-50 male names
];

export const givenNamesFemale = [
  { kanji: '花子', hiragana: 'はなこ', katakana: 'ハナコ', romaji: 'Hanako' },
  { kanji: '美咲', hiragana: 'みさき', katakana: 'ミサキ', romaji: 'Misaki' },
  // ... add 30-50 female names
];

export function generateJapaneseName(gender?: 'male' | 'female'): JapaneseName {
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const givenNames = gender === 'female' ? givenNamesFemale :
                    gender === 'male' ? givenNamesMale :
                    Math.random() > 0.5 ? givenNamesMale : givenNamesFemale;
  const givenName = givenNames[Math.floor(Math.random() * givenNames.length)];

  return {
    kanjiSurname: surname.kanji,
    kanjiGivenName: givenName.kanji,
    hiraganaSurname: surname.hiragana,
    hiraganaGivenName: givenName.hiragana,
    katakanaSurname: surname.katakana,
    katakanaGivenName: givenName.katakana,
    romajiSurname: surname.romaji,
    romajiGivenName: givenName.romaji
  };
}
```

**Action Items:**
1. Research most common Japanese surnames (佐藤, 鈴木, 高橋, etc.)
2. Collect popular given names for both genders
3. Implement data structures with all writing systems
4. Create generator function with random selection
5. Add unit tests for name generation

---

### 3.2 Japanese Address Generator

**Understanding Japanese Addresses:**
- Format (top-down): 〒Postal Code → Prefecture → City → Ward/Town → Block → Building
- Example: 〒150-0001 東京都渋谷区神宮前1-2-3
- Postal codes are 7 digits: 123-4567

**Implementation (src/data/japanese-addresses.ts):**
```typescript
export interface JapaneseAddress {
  postalCode: string;        // 123-4567
  prefecture: string;         // 東京都
  city: string;              // 渋谷区
  town: string;              // 神宮前
  blockNumber: string;       // 1-2-3
  building?: string;         // Optional building name
  fullAddress: string;       // Complete address string
}

export const prefectures = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  // ... all 47 prefectures
];

export const cities = {
  '東京都': ['千代田区', '中央区', '港区', '新宿区', '渋谷区', /* ... */],
  '大阪府': ['大阪市', '堺市', '岸和田市', /* ... */],
  // ... cities for each prefecture
};

export function generateJapaneseAddress(): JapaneseAddress {
  const prefecture = prefectures[Math.floor(Math.random() * prefectures.length)];
  const prefectureCities = cities[prefecture] || ['○○市'];
  const city = prefectureCities[Math.floor(Math.random() * prefectureCities.length)];

  const postalCode = `${randomInt(100, 999)}-${randomInt(1000, 9999)}`;
  const town = generateTownName();
  const blockNumber = `${randomInt(1, 9)}-${randomInt(1, 30)}-${randomInt(1, 20)}`;

  const fullAddress = `〒${postalCode} ${prefecture}${city}${town}${blockNumber}`;

  return { postalCode, prefecture, city, town, blockNumber, fullAddress };
}
```

**Action Items:**
1. Compile list of all 47 prefectures
2. Add major cities for each prefecture
3. Create realistic postal code generator
4. Implement block number generation
5. Add optional building name generation

---

### 3.3 Other Japanese Data Types

**Phone Numbers:**
```typescript
export function generateJapanesePhoneNumber(type: 'mobile' | 'landline' = 'mobile'): string {
  if (type === 'mobile') {
    // Mobile: 090/080/070-XXXX-XXXX
    const prefix = ['090', '080', '070'][Math.floor(Math.random() * 3)];
    return `${prefix}-${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`;
  } else {
    // Landline: 03-XXXX-XXXX (Tokyo area code example)
    return `03-${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`;
  }
}
```

**Email Addresses:**
```typescript
export function generateJapaneseEmail(name?: JapaneseName): string {
  const domains = ['example.com', 'example.co.jp', 'test.jp', 'sample.ne.jp'];
  const domain = domains[Math.floor(Math.random() * domains.length)];

  if (name) {
    // Use romaji name: taro.yamada@example.com
    return `${name.romajiGivenName.toLowerCase()}.${name.romajiSurname.toLowerCase()}@${domain}`;
  } else {
    // Random email
    return `user${randomInt(1000, 9999)}@${domain}`;
  }
}
```

**Company Names:**
```typescript
export const companyNames = [
  '株式会社サンプル商事',
  '有限会社テスト物産',
  '○○株式会社',
  // ... add realistic Japanese company names
];

export function generateJapaneseCompanyName(): string {
  return companyNames[Math.floor(Math.random() * companyNames.length)];
}
```

**Dates (Japanese Era + Western):**
```typescript
export function generateJapaneseDate(): {
  western: string;      // 2024/01/15
  japanese: string;     // 令和6年1月15日
  era: string;         // 令和
  year: number;        // 6
} {
  // Calculate from current Reiwa era (started May 1, 2019)
  const now = new Date();
  const reiwaStartYear = 2019;
  const reiwaYear = now.getFullYear() - reiwaStartYear + 1;

  return {
    western: `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`,
    japanese: `令和${reiwaYear}年${now.getMonth() + 1}月${now.getDate()}日`,
    era: '令和',
    year: reiwaYear
  };
}
```

**Action Items:**
1. Implement all data generator functions
2. Create comprehensive data sets for each type
3. Add randomization utilities
4. Consider data consistency (e.g., matching email to name)

---

## Phase 4: Form Detection & Filling Logic (Days 13-18)

### 4.1 Field Detection System

**Understanding Field Types:**
Forms contain different input types that need different handling:
- Text inputs: `<input type="text">`, `<input type="email">`, etc.
- Textareas: `<textarea>`
- Dropdowns: `<select>`
- Radio buttons: `<input type="radio">`
- Checkboxes: `<input type="checkbox">`
- Date pickers: `<input type="date">`

**Field Identification Strategy:**
Identify what data to fill based on:
1. Input `name` attribute (e.g., `name="email"`)
2. Input `id` attribute (e.g., `id="user-phone"`)
3. Associated `<label>` text
4. Placeholder text
5. Input `type` attribute

**Implementation (src/utils/fieldDetector.ts):**
```typescript
export enum FieldType {
  FULL_NAME_KANJI,
  SURNAME_KANJI,
  GIVEN_NAME_KANJI,
  FULL_NAME_HIRAGANA,
  SURNAME_HIRAGANA,
  GIVEN_NAME_HIRAGANA,
  FULL_NAME_KATAKANA,
  EMAIL,
  PHONE,
  MOBILE_PHONE,
  POSTAL_CODE,
  PREFECTURE,
  CITY,
  ADDRESS,
  FULL_ADDRESS,
  COMPANY_NAME,
  DATE,
  NUMBER,
  URL,
  GENERIC_TEXT,
  IGNORE // For password, captcha, hidden fields
}

export class FieldDetector {
  private static patterns = {
    [FieldType.EMAIL]: /email|メール|e-mail/i,
    [FieldType.PHONE]: /phone|tel|電話|でんわ/i,
    [FieldType.MOBILE_PHONE]: /mobile|携帯|けいたい/i,
    [FieldType.POSTAL_CODE]: /postal|zip|郵便|〒|ゆうびん/i,
    [FieldType.FULL_NAME_KANJI]: /fullname|full_name|氏名|name.*kanji/i,
    [FieldType.SURNAME_KANJI]: /surname|last.*name|姓|苗字|みょうじ/i,
    [FieldType.GIVEN_NAME_KANJI]: /givenname|given.*name|first.*name|名|なまえ/i,
    [FieldType.FULL_NAME_HIRAGANA]: /name.*hiragana|ふりがな.*氏名/i,
    [FieldType.SURNAME_HIRAGANA]: /surname.*hiragana|せい.*ふりがな|姓.*ひらがな/i,
    [FieldType.GIVEN_NAME_HIRAGANA]: /givenname.*hiragana|めい.*ふりがな|名.*ひらがな/i,
    [FieldType.FULL_NAME_KATAKANA]: /name.*katakana|カタカナ.*氏名/i,
    [FieldType.PREFECTURE]: /prefecture|都道府県|とどうふけん/i,
    [FieldType.CITY]: /city|市区町村|しくちょうそん/i,
    [FieldType.ADDRESS]: /address|住所|じゅうしょ/i,
    [FieldType.COMPANY_NAME]: /company|会社|勤務先|きんむさき/i,
    [FieldType.IGNORE]: /password|passwd|pwd|captcha|hidden|secret/i
  };

  static detectFieldType(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): FieldType {
    // Check if should ignore
    if (element.type === 'hidden' ||
        element.disabled ||
        element.readOnly ||
        this.matchesPattern(element, this.patterns[FieldType.IGNORE])) {
      return FieldType.IGNORE;
    }

    // Get all identifiable strings from element
    const identifiers = this.getElementIdentifiers(element);
    const combinedString = identifiers.join(' ').toLowerCase();

    // Match against patterns
    for (const [fieldType, pattern] of Object.entries(this.patterns)) {
      if (fieldType === String(FieldType.IGNORE)) continue;
      if (pattern.test(combinedString)) {
        return Number(fieldType) as FieldType;
      }
    }

    // Default based on input type
    if (element instanceof HTMLInputElement) {
      switch (element.type) {
        case 'email': return FieldType.EMAIL;
        case 'tel': return FieldType.PHONE;
        case 'date': return FieldType.DATE;
        case 'number': return FieldType.NUMBER;
        case 'url': return FieldType.URL;
        default: return FieldType.GENERIC_TEXT;
      }
    }

    return FieldType.GENERIC_TEXT;
  }

  private static getElementIdentifiers(element: HTMLElement): string[] {
    const identifiers: string[] = [];

    // Add element attributes
    if (element.id) identifiers.push(element.id);
    if (element.getAttribute('name')) identifiers.push(element.getAttribute('name')!);
    if (element.getAttribute('placeholder')) identifiers.push(element.getAttribute('placeholder')!);
    if (element.className) identifiers.push(element.className);

    // Add label text
    const label = this.findLabel(element);
    if (label) identifiers.push(label.textContent || '');

    // Add aria-label
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) identifiers.push(ariaLabel);

    return identifiers;
  }

  private static findLabel(element: HTMLElement): HTMLLabelElement | null {
    // Find label with 'for' attribute matching element id
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label as HTMLLabelElement;
    }

    // Find parent label
    let parent = element.parentElement;
    while (parent) {
      if (parent.tagName === 'LABEL') return parent as HTMLLabelElement;
      parent = parent.parentElement;
    }

    return null;
  }

  private static matchesPattern(element: HTMLElement, pattern: RegExp): boolean {
    return this.getElementIdentifiers(element).some(id => pattern.test(id));
  }
}
```

**Action Items:**
1. Create comprehensive pattern matching for Japanese field labels
2. Implement label detection (both Japanese and English)
3. Handle edge cases (hidden fields, disabled fields, readonly fields)
4. Test against various Japanese form structures
5. Add fallback detection strategies

---

### 4.2 Form Filling Engine

**Implementation (src/content/formFiller.ts):**
```typescript
import { FieldDetector, FieldType } from '../utils/fieldDetector';
import { DataGenerator } from '../utils/dataGenerator';

export class FormFiller {
  private dataGenerator: DataGenerator;

  constructor() {
    this.dataGenerator = new DataGenerator();
  }

  public fillAllForms(): number {
    // Generate a consistent set of data for the entire page
    const userData = this.dataGenerator.generateUserData();

    let fieldsFilledCount = 0;

    // Find all form elements
    const inputs = document.querySelectorAll('input, textarea, select');

    inputs.forEach((element) => {
      if (this.fillField(element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, userData)) {
        fieldsFilledCount++;
      }
    });

    return fieldsFilledCount;
  }

  private fillField(
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    userData: UserData
  ): boolean {
    const fieldType = FieldDetector.detectFieldType(element);

    if (fieldType === FieldType.IGNORE) {
      return false;
    }

    const value = this.getValueForFieldType(fieldType, userData);

    if (value === null) {
      return false;
    }

    // Set value and trigger events
    this.setElementValue(element, value);

    return true;
  }

  private getValueForFieldType(fieldType: FieldType, userData: UserData): string | null {
    switch (fieldType) {
      case FieldType.FULL_NAME_KANJI:
        return `${userData.name.kanjiSurname} ${userData.name.kanjiGivenName}`;
      case FieldType.SURNAME_KANJI:
        return userData.name.kanjiSurname;
      case FieldType.GIVEN_NAME_KANJI:
        return userData.name.kanjiGivenName;
      case FieldType.FULL_NAME_HIRAGANA:
        return `${userData.name.hiraganaSurname} ${userData.name.hiraganaGivenName}`;
      case FieldType.SURNAME_HIRAGANA:
        return userData.name.hiraganaSurname;
      case FieldType.GIVEN_NAME_HIRAGANA:
        return userData.name.hiraganaGivenName;
      case FieldType.EMAIL:
        return userData.email;
      case FieldType.PHONE:
      case FieldType.MOBILE_PHONE:
        return userData.phone;
      case FieldType.POSTAL_CODE:
        return userData.address.postalCode;
      case FieldType.PREFECTURE:
        return userData.address.prefecture;
      case FieldType.CITY:
        return userData.address.city;
      case FieldType.ADDRESS:
        return userData.address.town + userData.address.blockNumber;
      case FieldType.FULL_ADDRESS:
        return userData.address.fullAddress;
      case FieldType.COMPANY_NAME:
        return userData.companyName;
      case FieldType.DATE:
        return userData.dateOfBirth;
      case FieldType.GENERIC_TEXT:
        return 'サンプルテキスト';
      default:
        return null;
    }
  }

  private setElementValue(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string): void {
    if (element instanceof HTMLSelectElement) {
      // For select elements, try to find matching option
      this.fillSelectElement(element, value);
    } else if (element instanceof HTMLInputElement && element.type === 'radio') {
      // For radio buttons, check it
      element.checked = true;
    } else if (element instanceof HTMLInputElement && element.type === 'checkbox') {
      // For checkboxes, check randomly
      element.checked = Math.random() > 0.5;
    } else {
      // For text inputs and textareas
      element.value = value;
    }

    // Trigger events so the page knows the value changed
    this.triggerEvents(element);
  }

  private fillSelectElement(select: HTMLSelectElement, preferredValue: string): void {
    const options = Array.from(select.options);

    // Try to find exact match
    let matchingOption = options.find(opt => opt.value === preferredValue || opt.text === preferredValue);

    // If no match, select random non-empty option
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

  private triggerEvents(element: HTMLElement): void {
    // Trigger input event (for React, Vue, Angular)
    element.dispatchEvent(new Event('input', { bubbles: true }));

    // Trigger change event
    element.dispatchEvent(new Event('change', { bubbles: true }));

    // Trigger blur event
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }
}
```

**Key Concepts:**
- **Consistent Data**: Generate one set of user data and use it across the entire form (so name matches email, etc.)
- **Event Triggering**: Modern frameworks (React, Vue, Angular) need events to detect changes
- **Special Element Handling**: Dropdowns, radio buttons, checkboxes need special logic

**Action Items:**
1. Implement DataGenerator class to create consistent user data
2. Create comprehensive field filling logic
3. Handle special input types (date, number, url)
4. Test event triggering with modern frameworks
5. Add error handling for edge cases

---

## Phase 5: User Interface Development (Days 19-23)

### 5.1 Popup Interface

**Design (src/popup/popup.html):**
```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Japanese Form Filler</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="popup-container">
    <h1>日本語フォーム入力</h1>

    <div class="main-actions">
      <button id="fillFormsBtn" class="primary-btn">
        フォームを入力
      </button>

      <button id="clearFormsBtn" class="secondary-btn">
        クリア
      </button>
    </div>

    <div class="status" id="status">
      クリックしてフォームを入力
    </div>

    <div class="quick-options">
      <label>
        <input type="checkbox" id="skipHiddenFields" checked>
        非表示フィールドをスキップ
      </label>

      <label>
        <input type="checkbox" id="skipReadonlyFields" checked>
        読み取り専用フィールドをスキップ
      </label>
    </div>

    <div class="footer">
      <a href="#" id="openSettings">設定</a>
      <span class="version">v1.0.0</span>
    </div>
  </div>

  <script src="popup.js"></script>
</body>
</html>
```

**Logic (src/popup/popup.ts):**
```typescript
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
```

**Action Items:**
1. Create clean, user-friendly popup design
2. Implement message passing between popup and content script
3. Add loading states and error handling
4. Save user preferences to Chrome storage
5. Test on various screen sizes

---

### 5.2 Options/Settings Page

**Features to Include:**
- Custom field mapping rules (e.g., always fill field with id="user_name" with specific format)
- Enable/disable specific data types
- Keyboard shortcut configuration
- Data customization (add custom company names, addresses, etc.)
- Export/import settings

**Implementation (src/options/options.html):**
```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Japanese Form Filler - 設定</title>
  <link rel="stylesheet" href="options.css">
</head>
<body>
  <div class="options-container">
    <h1>Japanese Form Filler 設定</h1>

    <section class="settings-section">
      <h2>基本設定</h2>

      <div class="setting-item">
        <label for="defaultGender">デフォルトの性別:</label>
        <select id="defaultGender">
          <option value="random">ランダム</option>
          <option value="male">男性</option>
          <option value="female">女性</option>
        </select>
      </div>

      <div class="setting-item">
        <label for="nameFormat">名前の形式:</label>
        <select id="nameFormat">
          <option value="surname-first">姓 名</option>
          <option value="given-first">名 姓</option>
        </select>
      </div>
    </section>

    <section class="settings-section">
      <h2>カスタムデータ</h2>

      <div class="setting-item">
        <label for="customCompanies">カスタム会社名 (1行に1つ):</label>
        <textarea id="customCompanies" rows="5"></textarea>
      </div>
    </section>

    <section class="settings-section">
      <h2>フィールドマッピングルール</h2>
      <p>特定のフィールドに特定のデータを入力するルールを設定</p>
      <div id="customRules"></div>
      <button id="addRuleBtn">ルールを追加</button>
    </section>

    <div class="save-section">
      <button id="saveBtn" class="primary-btn">設定を保存</button>
      <button id="resetBtn" class="secondary-btn">デフォルトに戻す</button>
      <div id="saveStatus"></div>
    </div>
  </div>

  <script src="options.js"></script>
</body>
</html>
```

**Action Items:**
1. Create comprehensive settings page
2. Implement settings persistence with Chrome Storage API
3. Add import/export functionality for settings
4. Provide default configurations
5. Add validation for custom data

---

## Phase 6: Extension Integration (Days 24-27)

### 6.1 Content Script Integration

**Implementation (src/content/content.ts):**
```typescript
import { FormFiller } from './formFiller';

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillForms') {
    const filler = new FormFiller();
    const fieldsCount = filler.fillAllForms();

    sendResponse({ success: true, fieldsCount });
  } else if (request.action === 'clearForms') {
    clearAllForms();
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
      } else {
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
```

---

### 6.2 Background Script (Service Worker)

**Implementation (src/background/background.ts):**
```typescript
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
```

**Add Commands to Manifest:**
```json
{
  "commands": {
    "fill-forms": {
      "suggested_key": {
        "default": "Ctrl+Shift+F",
        "mac": "Command+Shift+F"
      },
      "description": "Fill forms with Japanese data"
    }
  }
}
```

**Action Items:**
1. Implement background script for global actions
2. Add context menu integration
3. Set up keyboard shortcuts
4. Handle extension installation and updates
5. Test message passing between all components

---

## Phase 7: Testing & Refinement (Days 28-32)

### 7.1 Testing Strategy

**Unit Testing:**
```typescript
// Example test for name generator (using Jest)
import { generateJapaneseName } from '../src/data/japanese-names';

describe('Name Generator', () => {
  test('should generate valid Japanese name', () => {
    const name = generateJapaneseName();

    expect(name.kanjiSurname).toBeTruthy();
    expect(name.kanjiGivenName).toBeTruthy();
    expect(name.hiraganaSurname).toBeTruthy();
    expect(name.hiraganaGivenName).toBeTruthy();
  });

  test('should generate male name when specified', () => {
    const name = generateJapaneseName('male');
    // Check against male name list
    expect(maleGivenNames.some(n => n.kanji === name.kanjiGivenName)).toBe(true);
  });
});
```

**Integration Testing:**
Create test HTML pages with various form structures:
- Simple contact form
- Complex multi-step form
- Forms with Japanese labels
- React-based forms
- Vue-based forms
- Forms with validation

**Browser Testing:**
- Chrome (latest)
- Edge (latest)
- Test on different operating systems

**Action Items:**
1. Set up Jest for unit testing
2. Create comprehensive test suite for data generators
3. Build test HTML pages for manual testing
4. Test on popular Japanese websites (with permission)
5. Test with different frameworks (React, Vue, Angular)
6. Create automated E2E tests (using Playwright or Puppeteer)

---

### 7.2 Performance Optimization

**Key Metrics to Monitor:**
- Time to fill forms (should be < 100ms for typical forms)
- Memory usage
- Extension bundle size

**Optimization Strategies:**
```typescript
// Use lazy loading for large data sets
const largeDataSets = {
  get addresses() {
    return import('../data/japanese-addresses-large');
  },
  get companyNames() {
    return import('../data/japanese-companies-large');
  }
};

// Debounce form filling to avoid performance issues
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Cache field detection results
const fieldTypeCache = new WeakMap<HTMLElement, FieldType>();

function getCachedFieldType(element: HTMLElement): FieldType {
  if (fieldTypeCache.has(element)) {
    return fieldTypeCache.get(element)!;
  }

  const fieldType = FieldDetector.detectFieldType(element);
  fieldTypeCache.set(element, fieldType);
  return fieldType;
}
```

**Action Items:**
1. Profile extension performance
2. Optimize data structures
3. Implement caching where appropriate
4. Minimize bundle size (tree-shaking, code splitting)
5. Test on low-end devices

---

## Phase 8: Documentation & Deployment (Days 33-35)

### 8.1 User Documentation

**Create README.md:**
```markdown
# Japanese Form Filler

Automatically fill web forms with realistic Japanese fake data.

## Features
- Fill forms with realistic Japanese names, addresses, phone numbers
- Support for kanji, hiragana, and katakana
- Smart field detection
- Customizable data and rules
- Keyboard shortcuts

## Installation
1. Download from Chrome Web Store
2. Click the extension icon
3. Click "フォームを入力" to fill forms

## Keyboard Shortcuts
- `Ctrl+Shift+F` (Windows/Linux) or `Cmd+Shift+F` (Mac): Fill forms

## Settings
Access settings by clicking "設定" in the popup.

## Privacy
All data is generated locally. No data is sent to external servers.

## Support
Report issues at: [GitHub Issues URL]
```

**Create User Guide (in Japanese):**
- Installation instructions
- How to use basic features
- How to customize settings
- Troubleshooting common issues

**Action Items:**
1. Write comprehensive README
2. Create user guide in both English and Japanese
3. Add screenshots and GIFs demonstrating usage
4. Create FAQ section
5. Write developer documentation for contributors

---

### 8.2 Chrome Web Store Submission

**Preparation Checklist:**
- [ ] Extension icons (16x16, 48x48, 128x128)
- [ ] Screenshot (1280x800 or 640x400)
- [ ] Promotional images (440x280)
- [ ] Privacy policy (required for extensions that handle user data)
- [ ] Detailed description in English and Japanese
- [ ] Categories and tags
- [ ] Set pricing (free)

**Privacy Policy Template:**
```
Privacy Policy for Japanese Form Filler

Data Collection:
This extension does not collect, store, or transmit any personal data.
All form filling is performed locally in your browser.

Permissions:
- activeTab: Required to access and fill forms on the current page
- storage: Used to save your extension settings locally
- contextMenus: Provides right-click menu options

Third-party Services:
This extension does not use any third-party services or analytics.

Contact:
For questions, contact: [your email]
```

**Store Listing Description:**
```
Japanese Form Filler は、Webフォームを現実的な日本語のダミーデータで自動入力する拡張機能です。

主な機能:
✓ 日本語の名前、住所、電話番号などを自動入力
✓ 漢字、ひらがな、カタカナに対応
✓ スマートなフィールド検出
✓ カスタマイズ可能なデータとルール
✓ キーボードショートカット対応

開発者やテスターの方に最適なツールです。フォーム入力を手動で行う手間が省けます。

---

Japanese Form Filler automatically fills web forms with realistic Japanese fake data.

Key Features:
✓ Fill forms with Japanese names, addresses, phone numbers
✓ Support for kanji, hiragana, and katakana
✓ Smart field detection
✓ Customizable data and rules
✓ Keyboard shortcuts

Perfect for developers and testers. Save time by avoiding manual form entry.
```

**Submission Steps:**
1. Create Chrome Web Store Developer account ($5 one-time fee)
2. Prepare all assets (icons, screenshots, descriptions)
3. Create ZIP file of `dist/` folder
4. Upload to Chrome Web Store Developer Dashboard
5. Fill in all required information
6. Submit for review (typically takes 1-3 business days)

**Action Items:**
1. Create all required graphics assets
2. Write privacy policy
3. Prepare store listing content in English and Japanese
4. Create developer account
5. Submit extension for review
6. Respond to any review feedback

---

## Phase 9: Maintenance & Future Enhancements (Ongoing)

### 9.1 Monitoring & Bug Fixes

**Set up Issue Tracking:**
- Create GitHub repository for issue reporting
- Monitor Chrome Web Store reviews
- Set up analytics (if desired, respecting privacy)

**Regular Maintenance:**
- Update data sets (new common names, addresses)
- Fix bugs reported by users
- Update for Chrome API changes
- Test with new browser versions

---

### 9.2 Future Enhancement Ideas

**Version 2.0 Features:**
1. **Multiple Profiles**: Allow users to create different data profiles (e.g., "Test User A", "Test User B")
2. **Form Templates**: Save and reuse specific form filling patterns
3. **Export Data**: Export generated data as JSON/CSV for testing databases
4. **Business Data**: Add B2B data (company tax IDs, corporate addresses)
5. **Date Ranges**: Generate birth dates within specific age ranges
6. **Field Highlighting**: Highlight which fields will be filled before filling
7. **Undo Feature**: Ability to undo form filling
8. **Conditional Fields**: Handle fields that appear based on previous selections
9. **Multi-language**: Support for filling forms in other languages (Korean, Chinese)
10. **API Integration**: Provide API for test automation tools

**Advanced Features:**
- Machine learning to improve field detection
- Integration with testing frameworks (Selenium, Cypress)
- Form structure analysis and reporting
- Accessibility testing features

---

## Technical Architecture Summary

### Component Interaction Flow

```
User Action (Click Icon/Keyboard Shortcut)
    ↓
Popup UI / Context Menu / Keyboard Command
    ↓
Background Script (Service Worker)
    ↓
Content Script (Injected in Web Page)
    ↓
Field Detector → Identifies field types
    ↓
Data Generator → Creates fake Japanese data
    ↓
Form Filler → Populates fields with data
    ↓
Event Triggers → Notifies page of changes
    ↓
Visual Feedback → Shows success message
```

### Data Flow

```
User Settings (Chrome Storage)
    ↓
Extension Configuration
    ↓
Data Generator
    ├── Name Generator
    ├── Address Generator
    ├── Phone Generator
    ├── Email Generator
    └── Company Generator
    ↓
Consistent User Data Object
    ↓
Form Filler uses data for all fields
```

---

## Learning Resources

### Chrome Extension Development
- **Official Documentation**: https://developer.chrome.com/docs/extensions/
- **Manifest V3 Migration**: https://developer.chrome.com/docs/extensions/mv3/intro/
- **Content Scripts Guide**: https://developer.chrome.com/docs/extensions/mv3/content_scripts/
- **Message Passing**: https://developer.chrome.com/docs/extensions/mv3/messaging/

### TypeScript
- **Handbook**: https://www.typescriptlang.org/docs/handbook/
- **Type Declarations for Chrome**: `@types/chrome` package

### Japanese Data
- **Common Names**: Research from Japanese government statistics
- **Postal Codes**: Japan Post database
- **Prefecture Data**: Ministry of Internal Affairs data

### Testing
- **Jest Documentation**: https://jestjs.io/
- **Playwright**: https://playwright.dev/ (for E2E testing)

---

## Estimated Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| 1 | 3 days | Foundation & Setup |
| 2 | 4 days | Core Extension Infrastructure |
| 3 | 5 days | Japanese Data Generation System |
| 4 | 6 days | Form Detection & Filling Logic |
| 5 | 5 days | User Interface Development |
| 6 | 4 days | Extension Integration |
| 7 | 5 days | Testing & Refinement |
| 8 | 3 days | Documentation & Deployment |
| **Total** | **35 days** | **Complete Implementation** |

*Note: This timeline assumes full-time work. Adjust proportionally for part-time development.*

---

## Success Criteria

### Minimum Viable Product (MVP)
- ✓ Fills text inputs with appropriate Japanese data
- ✓ Handles names in kanji, hiragana, katakana
- ✓ Generates realistic addresses and phone numbers
- ✓ Works on 90%+ of common web forms
- ✓ Simple popup interface
- ✓ Basic settings page

### Version 1.0 Release
- ✓ All MVP features
- ✓ Keyboard shortcuts
- ✓ Context menu integration
- ✓ Custom field mapping rules
- ✓ Works with modern frameworks (React, Vue, Angular)
- ✓ Comprehensive documentation
- ✓ Published on Chrome Web Store
- ✓ < 2MB extension size
- ✓ < 100ms fill time for typical forms

---

## Troubleshooting Guide

### Common Issues During Development

**Issue**: Extension doesn't load in Chrome
- **Solution**: Check manifest.json syntax, ensure all files are in correct locations

**Issue**: Content script can't access page elements
- **Solution**: Verify `run_at` timing in manifest, check if page uses shadow DOM

**Issue**: Events don't trigger in React/Vue forms
- **Solution**: Dispatch both `input` and `change` events, try `bubbles: true`

**Issue**: TypeScript compilation errors
- **Solution**: Ensure @types/chrome is installed, check tsconfig.json settings

**Issue**: Extension rejected from Chrome Web Store
- **Solution**: Review privacy policy, ensure clear permission justifications, check image sizes

---

## Conclusion

This implementation plan provides a comprehensive roadmap for building a Japanese form filler Chrome extension. The key to success is:

1. **Start Simple**: Build MVP first, add features incrementally
2. **Test Early**: Test on real websites throughout development
3. **Iterate Based on Feedback**: Listen to user feedback and adjust
4. **Follow Best Practices**: Use TypeScript, proper error handling, clean code
5. **Respect Privacy**: Generate all data locally, be transparent about permissions

Good luck with your first Chrome extension! This will be a valuable learning experience in browser extension development, TypeScript, DOM manipulation, and Japanese data handling.
