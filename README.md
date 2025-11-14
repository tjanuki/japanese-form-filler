# Japanese Form Filler

A Chrome extension that automatically fills web forms with realistic Japanese fake data.

## Overview

Japanese Form Filler is a browser extension designed to help developers and testers by automatically populating form fields with culturally appropriate Japanese data, including names (in kanji, hiragana, and katakana), addresses, phone numbers, email addresses, and more.

## Features

- **Automatic Form Filling**: Fill forms with realistic Japanese data with a single click
- **Multiple Name Formats**: Support for kanji (漢字), hiragana (ひらがな), and katakana (カタカナ)
- **Smart Field Detection**: Intelligent detection of field types based on labels, placeholders, and attributes
- **Comprehensive Data Types**:
  - Names (surname and given name in various formats)
  - Email addresses
  - Phone numbers (mobile and landline)
  - Postal codes (郵便番号)
  - Addresses (都道府県, 市区町村)
  - Company names
  - Dates
- **Keyboard Shortcuts**: Quick access via `Ctrl+Shift+F` (or `Cmd+Shift+F` on Mac)
- **Context Menu**: Right-click option to fill or clear forms
- **Customizable Settings**: Configure default options and custom data

## Project Status

**Phase 1: Foundation & Setup** ✅ COMPLETED

- [x] NPM project initialization
- [x] Development dependencies installed
- [x] Project directory structure created
- [x] TypeScript configuration set up
- [x] Webpack build system configured
- [x] Manifest.json created
- [x] Placeholder icons generated
- [x] Build system verified and working

## Project Structure

```
japanese-form-filler/
├── manifest.json                 # Extension configuration
├── package.json                  # NPM dependencies
├── tsconfig.json                # TypeScript configuration
├── webpack.config.js            # Build configuration
├── src/
│   ├── background/
│   │   └── background.ts        # Background service worker
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
│   │   ├── japanese-phone.ts    # Phone number generator
│   │   └── japanese-email.ts    # Email generator
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

## Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd japanese-form-filler
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

### Available Scripts

- `npm run build` - Build the extension for development
- `npm run watch` - Build and watch for changes
- `npm run build:prod` - Build for production (optimized)

## Loading the Extension in Chrome

1. Build the extension using `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked"
5. Select the `dist/` folder from this project
6. The extension should now appear in your extensions list

## Usage

### Basic Usage

1. Navigate to any web page with a form
2. Click the extension icon in the toolbar
3. Click "フォームを入力" (Fill Forms) button
4. The form fields will be automatically filled with Japanese data

### Keyboard Shortcut

- Press `Ctrl+Shift+F` (Windows/Linux) or `Cmd+Shift+F` (Mac) to fill forms on the current page

### Context Menu

- Right-click anywhere on a page
- Select "フォームを日本語データで入力" to fill forms
- Select "フォームをクリア" to clear forms

## Configuration

Access the settings page by clicking "設定" in the popup or by right-clicking the extension icon and selecting "Options".

### Available Settings

- **Default Gender**: Choose whether to generate male, female, or random names
- **Name Format**: Configure name order (surname-first or given-first)
- **Custom Company Names**: Add your own company names for testing

## Technology Stack

- **TypeScript**: Type-safe JavaScript
- **Webpack**: Module bundler
- **Chrome Extension Manifest V3**: Latest Chrome extension standard
- **Chrome APIs**: storage, tabs, contextMenus, commands

## Data Sources

The extension includes realistic Japanese data:
- 20+ common Japanese surnames (佐藤, 鈴木, 高橋, etc.)
- 30+ given names for both genders
- All 47 Japanese prefectures
- Major cities for each prefecture
- Realistic postal codes, phone numbers, and addresses

## Browser Compatibility

- ✅ Chrome (latest)
- ✅ Edge (latest)
- ⚠️ Other Chromium-based browsers (should work but not tested)

## Roadmap

### Phase 2: Core Extension Infrastructure (Next)
- Enhanced manifest configuration
- Background script improvements
- Advanced message passing

### Phase 3: Enhanced Japanese Data
- Expanded name database
- More address variations
- Additional company names
- Date generation with Japanese eras (令和, 平成)

### Phase 4: Advanced Form Detection
- Improved field type detection
- Support for complex forms
- Framework-specific handling (React, Vue, Angular)

### Phase 5: User Interface Enhancements
- Improved popup design
- Advanced settings page
- Custom field mapping rules

### Future Features
- Multiple user profiles
- Form templates
- Data export (JSON/CSV)
- Undo functionality
- Browser action badge with fill count

## Development Notes

- All TypeScript files are compiled with strict mode enabled
- Source maps are generated for easier debugging
- The extension uses Chrome Manifest V3 (service workers instead of background pages)
- Event-driven architecture for better performance

## Privacy

- All data is generated locally in your browser
- No data is sent to external servers
- No tracking or analytics
- No personal information is collected

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

ISC

## Support

For bugs, feature requests, or questions, please open an issue on the GitHub repository.

---

**Status**: Phase 1 Complete ✅
**Last Updated**: November 14, 2025
**Version**: 1.0.0 (Development)
