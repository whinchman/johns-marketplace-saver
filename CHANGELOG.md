# Changelog

All notable changes to John's Facebook Marketplace Saver will be documented in this file.

## [0.1.3] - 2025-10-06

### Security
- **Fixed:** Replaced all `innerHTML` assignments with safe DOM manipulation methods to prevent XSS vulnerabilities
- Now uses `createElement()`, `textContent`, and `appendChild()` for all dynamic content

### Changed
- Improved code security to meet Mozilla Add-ons security requirements
- Better compliance with Firefox extension best practices

### Technical
- Removed `escapeHtml()` function (no longer needed with safe DOM methods)
- Updated all popup UI rendering to use DOM APIs instead of string concatenation

---

## [0.1.2] - 2025-10-06

### Added
- Smart auto-detection of form fields - no hardcoded selectors needed
- Works with any Facebook Marketplace page regardless of structure changes
- Periodic auto-save every 30 seconds while actively typing
- Debounced auto-save 2 seconds after typing stops
- Browser console logging for debugging
- Support for multiple field types: inputs, textareas, and contenteditable divs
- Fallback field matching when restoring drafts
- Extension now waits 2 seconds for React to render before detecting fields

### Changed
- Completely rewrote field detection system to be Facebook-agnostic
- Improved draft storage format to include field type and selector info
- Better error handling and user feedback for save/restore operations
- Updated manifest to work on all `/marketplace/*` URLs

### Fixed
- Extension now loads correctly on Facebook Marketplace pages
- Content script properly initializes after page load
- Message passing between popup and content script now works reliably
- Firefox compatibility issues resolved

---

## [0.1.1] - 2025-10-06 (Internal)

### Added
- Initial popup UI with draft management
- Basic save/restore functionality
- Support for up to 10 saved drafts
- Manual save button
- Draft preview in extension popup

### Known Issues
- Hardcoded field selectors (fixed in 0.1.2)
- Only worked on specific Facebook page structures (fixed in 0.1.2)

---

## [0.1.0] - 2025-10-06 (Initial Development)

### Added
- Basic content script structure
- Local storage for drafts
- Auto-save on form field changes
- Extension manifest and icons setup
- README and documentation

---

## Future Roadmap

### Planned Features
- Import/export drafts to JSON files
- Search/filter saved drafts
- Draft categories/tags
- Keyboard shortcuts for quick save/restore
- Draft notes/comments
- Customizable auto-save intervals

### Under Consideration
- Support for other marketplaces (Craigslist, eBay, etc.)
- Cloud sync between devices
- Draft templates
- Bulk operations on drafts
