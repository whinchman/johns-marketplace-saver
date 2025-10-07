# Facebook Marketplace Draft Saver

A Firefox browser extension that automatically saves your Facebook Marketplace listing drafts to prevent lost work. Uses smart field detection to work with any form, no matter how Facebook changes their page structure.

## Features

- 🎯 **Smart field detection** - Automatically finds ALL form fields (inputs, textareas, contenteditable) - no hardcoded selectors
- ✨ **Auto-save** - Automatically saves your listing as you type (2-second delay after you stop)
- ⏱️ **Periodic save** - Also saves every 30 seconds while you're actively typing (for extra safety)
- 💾 **Manual save** - Save drafts on demand
- 📋 **Multiple drafts** - Keep up to 10 saved drafts
- ⬆️ **Easy restore** - Restore any saved draft with one click
- 🔔 **Visual notifications** - See when drafts are saved/restored
- 🚀 **Lightweight** - No external dependencies, runs entirely in your browser

## Installation

### Option 1: Temporary Installation (for testing)

1. Download or clone this repository
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on"
5. Navigate to the extension folder and select `manifest.json`
6. The extension is now loaded! (Note: temporary extensions are removed when Firefox closes)

### Option 2: Permanent Installation
The Latest signed release XPI can be download https://www.217industries.com/extensions/johns-fb-marketplace-saver/jp-market-saver.xpi

## Usage

### First Time Setup

1. Navigate to Facebook Marketplace create listing page: https://www.facebook.com/marketplace/create/
2. Click the extension icon in your browser toolbar
3. You should see the Draft Saver popup

### Saving Drafts

**Auto-save (default):**
- Just start typing in any field (title, price, description, etc.)
- The extension automatically saves your work:
  - 2 seconds after you stop typing
  - Every 30 seconds while you're actively typing
- No action needed - double protection against lost work!

**Manual save:**
- Click the extension icon
- Click "💾 Save Now"
- Your draft is saved to the list

### Restoring Drafts

1. Click the extension icon
2. In the "Saved Drafts" section, find the draft you want to restore
3. Click "⬆️ Restore" next to the draft
4. All your fields will be filled in automatically!

### Managing Drafts

- **View drafts**: Click the extension icon to see all saved drafts
- **Delete draft**: Click "🗑️ Delete" next to any saved draft
- **Draft limit**: The extension keeps your 10 most recent drafts

## How It Works

- **Smart Detection**: Automatically finds all form fields on page load (waits 2 seconds for React to render)
- **Universal Compatibility**: Detects `<input>`, `<textarea>`, and `contenteditable` divs - works with any form structure
- **Stable Identifiers**: Uses aria-label, name, id, or placeholder to track fields reliably
- **Debounced auto-save**: Triggers 2 seconds after you stop typing
- **Periodic auto-save**: Triggers every 30 seconds while actively typing
- **Fallback Matching**: When restoring, tries multiple methods to find fields even if page structure changed
- **Storage**: Uses Firefox's local storage API (saved on your computer only)
- **Privacy**: All data stays on your device - nothing is sent to external servers

## Supported Fields

**The extension automatically detects and saves ALL visible form fields on the page**, including:
- Standard text inputs (title, price, location, etc.)
- Number inputs
- Text areas
- Contenteditable divs (what Facebook often uses)
- Email and phone inputs
- Any other visible input field

No manual configuration needed - it just works!

## Troubleshooting

**Extension not working?**
- Make sure you're on a Facebook Marketplace listing page
- Check that the URL contains `facebook.com/marketplace`
- Open browser console (F12) and look for `[FB Draft Saver]` messages to see what's happening
- The extension waits 2 seconds for the page to load - be patient!

**No fields detected?**
- Check console: it will log how many fields were detected
- Facebook might have changed their page structure significantly
- Try refreshing the page

**Fields not restoring?**
- The extension will tell you how many fields succeeded/failed to restore
- If some fields fail, Facebook might have changed their identifiers
- Partial restores are normal - just manually fill in what's missing

**Extension icon not showing?**
- Make sure icon files exist in the `icons/` folder
- Check Firefox toolbar settings

**Debug mode:**
Open browser console (F12) to see detailed logs:
- Field detection info
- Save/restore operations
- Error messages if something goes wrong

## Development

### File Structure

```
.
├── manifest.json       # Extension configuration
├── content.js         # Monitors and saves form data
├── popup.html         # Extension popup interface
├── popup.js           # Popup functionality
├── styles.css         # Popup styling
└── icons/            # Extension icons (you need to add these)
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### Making Changes

1. Edit the source files
2. Go to `about:debugging` in Firefox
3. Click "Reload" next to the extension
4. Test your changes

## Privacy & Security

- **No data collection** - This extension does NOT collect any data
- **Local storage only** - All drafts are stored locally on your computer
- **No network requests** - The extension doesn't communicate with any servers
- **Open source** - All code is visible and auditable

## License

Free to use and modify. Built for personal use.

## Credits

Built to help friends who keep losing their marketplace listings! 😅
