// Facebook Marketplace Draft Saver - Content Script (Smart Auto-Detection)
console.log('[FB Draft Saver] Extension script file loaded!');

// Browser API compatibility (Firefox uses 'browser', Chrome uses 'chrome')
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

let autoSaveTimeout;
let periodicSaveInterval;
let lastActivityTime = 0;
const AUTOSAVE_DELAY = 2000; // 2 seconds after typing stops
const PERIODIC_SAVE_INTERVAL = 30000; // 30 seconds while typing

// Auto-detect all form fields on the page
function detectFormFields() {
  const fields = [];

  // Find all standard inputs
  document.querySelectorAll('input[type="text"], input[type="number"], input[type="email"], input[type="tel"], input:not([type])').forEach(input => {
    if (isVisible(input)) {
      fields.push({
        type: 'input',
        element: input,
        identifier: getFieldIdentifier(input),
        selector: generateSelector(input)
      });
    }
  });

  // Find all textareas
  document.querySelectorAll('textarea').forEach(textarea => {
    if (isVisible(textarea)) {
      fields.push({
        type: 'textarea',
        element: textarea,
        identifier: getFieldIdentifier(textarea),
        selector: generateSelector(textarea)
      });
    }
  });

  // Find all contenteditable divs (Facebook loves these)
  document.querySelectorAll('[contenteditable="true"]').forEach(div => {
    if (isVisible(div)) {
      fields.push({
        type: 'contenteditable',
        element: div,
        identifier: getFieldIdentifier(div),
        selector: generateSelector(div)
      });
    }
  });

  return fields;
}

// Check if element is visible
function isVisible(element) {
  return element.offsetParent !== null &&
         element.offsetWidth > 0 &&
         element.offsetHeight > 0;
}

// Get a stable identifier for a field
function getFieldIdentifier(element) {
  // Priority order for identifiers
  return element.getAttribute('aria-label') ||
         element.getAttribute('name') ||
         element.getAttribute('id') ||
         element.getAttribute('placeholder') ||
         element.getAttribute('data-testid') ||
         `field_${Array.from(element.parentNode.children).indexOf(element)}`;
}

// Generate a CSS selector for an element
function generateSelector(element) {
  const ariaLabel = element.getAttribute('aria-label');
  const name = element.getAttribute('name');
  const id = element.getAttribute('id');
  const placeholder = element.getAttribute('placeholder');
  const tagName = element.tagName.toLowerCase();

  if (ariaLabel) return `${tagName}[aria-label="${ariaLabel}"]`;
  if (name) return `${tagName}[name="${name}"]`;
  if (id) return `#${id}`;
  if (placeholder) return `${tagName}[placeholder="${placeholder}"]`;
  if (element.contentEditable === 'true') return `[contenteditable="true"]`;

  return tagName;
}

// Extract current form data from all detected fields
function extractFormData() {
  const fields = detectFormFields();

  if (fields.length === 0) {
    console.log('[FB Draft Saver] No form fields detected on page');
    return null;
  }

  const data = {
    timestamp: Date.now(),
    url: window.location.href,
    fields: {}
  };

  fields.forEach(field => {
    const value = getFieldValue(field.element);
    if (value && value.trim().length > 0) {
      data.fields[field.identifier] = {
        value: value,
        type: field.type,
        selector: field.selector
      };
    }
  });

  // Only save if at least one field has content
  const hasContent = Object.keys(data.fields).length > 0;

  return hasContent ? data : null;
}

// Get value from any field type
function getFieldValue(element) {
  if (element.contentEditable === 'true') {
    return element.textContent || element.innerText || '';
  } else if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
    return element.value || '';
  }
  return '';
}

// Set value to any field type
function setFieldValue(element, value) {
  if (element.contentEditable === 'true') {
    element.textContent = value;
  } else if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
    element.value = value;
  }

  // Trigger events so React/framework notices the change
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

// Save draft to storage
function saveDraft(isManual = false) {
  const formData = extractFormData();

  if (!formData) {
    if (isManual) {
      showNotification('No form data to save');
    }
    return;
  }

  // Save as current draft
  browserAPI.storage.local.set({
    currentDraft: formData,
    lastAutoSave: Date.now()
  }).then(() => {
    const fieldCount = Object.keys(formData.fields).length;
    console.log('[FB Draft Saver] Draft saved', isManual ? '(manual)' : '(auto)', `- ${fieldCount} fields`);

    // Show brief confirmation if manual save
    if (isManual) {
      showNotification(`Draft saved! (${fieldCount} fields)`);
    }
  }).catch(err => {
    console.error('[FB Draft Saver] Save error:', err);
  });
}

// Restore draft into form
function restoreDraft(draftData) {
  if (!draftData || !draftData.fields) {
    console.log('[FB Draft Saver] No draft data to restore');
    return;
  }

  let fieldsRestored = 0;
  let fieldsFailed = 0;

  for (const [identifier, fieldData] of Object.entries(draftData.fields)) {
    const value = fieldData.value;
    const selector = fieldData.selector;

    if (!value) continue;

    // Try to find element by selector
    let element = document.querySelector(selector);

    // Fallback: try to find by identifier in aria-label
    if (!element && identifier) {
      element = document.querySelector(`[aria-label="${identifier}"]`) ||
                document.querySelector(`[name="${identifier}"]`) ||
                document.querySelector(`[placeholder="${identifier}"]`);
    }

    if (element) {
      setFieldValue(element, value);
      fieldsRestored++;
    } else {
      console.warn('[FB Draft Saver] Could not find field:', identifier, selector);
      fieldsFailed++;
    }
  }

  if (fieldsRestored > 0) {
    showNotification(`Restored ${fieldsRestored} field(s)!` + (fieldsFailed > 0 ? ` (${fieldsFailed} failed)` : ''));
    console.log('[FB Draft Saver] Restored', fieldsRestored, 'fields', fieldsFailed > 0 ? `(${fieldsFailed} failed)` : '');
  } else {
    showNotification('Could not restore draft - page structure may have changed');
  }
}

// Show temporary notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #1877f2;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease-out;
  `;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transition = 'opacity 0.3s, transform 0.3s';
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => notification.remove(), 300);
  }, 2500);
}

// Setup auto-save on form changes
function setupAutoSave() {
  // Monitor ALL input events on the entire document
  document.addEventListener('input', (e) => {
    const target = e.target;

    // Check if it's a form field we care about
    if (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true') {

      // Track activity
      lastActivityTime = Date.now();

      // Debounce auto-save (saves 2 seconds after typing stops)
      clearTimeout(autoSaveTimeout);
      autoSaveTimeout = setTimeout(() => saveDraft(false), AUTOSAVE_DELAY);
    }
  }, true); // Use capture phase to catch all events

  // Setup periodic save (every 30 seconds while actively typing)
  periodicSaveInterval = setInterval(() => {
    const timeSinceActivity = Date.now() - lastActivityTime;

    // Only save if there's been activity in the last 35 seconds
    // (5 second buffer to catch ongoing typing sessions)
    if (timeSinceActivity < 35000) {
      saveDraft(false);
      console.log('[FB Draft Saver] Periodic save triggered');
    }
  }, PERIODIC_SAVE_INTERVAL);

  console.log('[FB Draft Saver] Auto-save enabled (smart field detection + periodic saves)');
}

// Listen for messages from popup
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle messages asynchronously
  (async () => {
    try {
      if (message.action === 'saveDraft') {
        await new Promise((resolve) => {
          saveDraft(true);
          // Give it a moment to complete
          setTimeout(resolve, 100);
        });
        sendResponse({ success: true });
      } else if (message.action === 'restoreDraft') {
        restoreDraft(message.data);
        sendResponse({ success: true });
      } else if (message.action === 'getCurrentDraft') {
        const data = extractFormData();
        sendResponse({ success: true, data });
      } else if (message.action === 'detectFields') {
        const fields = detectFormFields();
        sendResponse({
          success: true,
          fieldCount: fields.length,
          fields: fields.map(f => ({ identifier: f.identifier, type: f.type, selector: f.selector }))
        });
      } else {
        sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('[FB Draft Saver] Message handler error:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();

  return true; // Keep channel open for async response
});

// Initialize
function init() {
  console.log('[FB Draft Saver] Content script loaded (smart auto-detection mode)');

  // Wait a bit for React to render the page
  setTimeout(() => {
    const fields = detectFormFields();
    console.log(`[FB Draft Saver] Detected ${fields.length} form fields on page`);

    if (fields.length > 0) {
      setupAutoSave();

      // Check if there's a current draft to offer restoration
      browserAPI.storage.local.get('currentDraft').then(result => {
        if (result.currentDraft && result.currentDraft.fields) {
          console.log('[FB Draft Saver] Found existing draft from', new Date(result.currentDraft.timestamp));
        }
      });
    } else {
      console.log('[FB Draft Saver] No form fields detected yet, will monitor page');
      // Still setup listeners in case fields load later
      setupAutoSave();
    }
  }, 2000); // Wait 2 seconds for page to load
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (periodicSaveInterval) {
    clearInterval(periodicSaveInterval);
  }
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }
});

// Wait for page to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
