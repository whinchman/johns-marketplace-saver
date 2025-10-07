// Facebook Marketplace Draft Saver - Popup Script

// Browser API compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

document.addEventListener('DOMContentLoaded', async () => {
  await checkCurrentPage();
  await loadCurrentDraft();
  await loadSavedDrafts();
  setupEventListeners();
});

// Check if we're on a Facebook Marketplace page
async function checkCurrentPage() {
  const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];

  const isMarketplacePage = currentTab.url.includes('facebook.com/marketplace');

  if (isMarketplacePage) {
    document.getElementById('notOnMarketplace').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
  } else {
    document.getElementById('notOnMarketplace').style.display = 'block';
    document.getElementById('mainContent').style.display = 'none';
  }

  return isMarketplacePage;
}

// Load and display current draft
async function loadCurrentDraft() {
  const result = await browserAPI.storage.local.get('currentDraft');

  if (result.currentDraft && result.currentDraft.fields) {
    const draft = result.currentDraft;
    const hasContent = Object.keys(draft.fields).length > 0;

    if (hasContent) {
      displayCurrentDraft(draft);
      document.getElementById('restoreCurrentBtn').style.display = 'inline-block';
    }
  }
}

// Display current draft info
function displayCurrentDraft(draft) {
  const info = document.getElementById('currentDraftInfo');
  const timeAgo = getTimeAgo(draft.timestamp);

  // Clear existing content
  info.textContent = '';

  // Create fields container
  const fieldsDiv = document.createElement('div');
  fieldsDiv.className = 'draft-fields';

  for (const [key, fieldData] of Object.entries(draft.fields)) {
    // Handle both old format (string) and new format (object with value property)
    const value = typeof fieldData === 'string' ? fieldData : fieldData.value;

    if (value && value.trim()) {
      const displayValue = value.length > 50 ? value.substring(0, 50) + '...' : value;

      const fieldDiv = document.createElement('div');
      fieldDiv.className = 'field-preview';

      const strong = document.createElement('strong');
      strong.textContent = capitalizeFirst(key) + ':';

      fieldDiv.appendChild(strong);
      fieldDiv.appendChild(document.createTextNode(' ' + displayValue));

      fieldsDiv.appendChild(fieldDiv);
    }
  }

  // Create timestamp
  const timestampDiv = document.createElement('div');
  timestampDiv.className = 'timestamp';
  timestampDiv.textContent = 'Last saved: ' + timeAgo;

  // Append to info container
  info.appendChild(fieldsDiv);
  info.appendChild(timestampDiv);
}

// Load and display saved drafts
async function loadSavedDrafts() {
  const result = await browserAPI.storage.local.get('savedDrafts');
  const savedDrafts = result.savedDrafts || [];

  const container = document.getElementById('savedDrafts');

  // Clear existing content
  container.textContent = '';

  if (savedDrafts.length === 0) {
    const noDraftsP = document.createElement('p');
    noDraftsP.className = 'no-drafts';
    noDraftsP.textContent = 'No saved drafts yet';
    container.appendChild(noDraftsP);
    return;
  }

  savedDrafts.forEach((draft, index) => {
    const timeAgo = getTimeAgo(draft.timestamp);

    // Get first two field values for preview (regardless of field names)
    const fieldValues = Object.values(draft.fields).map(f =>
      typeof f === 'string' ? f : f.value
    ).filter(v => v && v.trim());

    const preview1 = fieldValues[0] || 'Empty draft';
    const preview2 = fieldValues[1] || `${fieldValues.length} field(s)`;

    // Create draft item
    const draftItem = document.createElement('div');
    draftItem.className = 'draft-item';
    draftItem.dataset.index = index;

    // Create header
    const header = document.createElement('div');
    header.className = 'draft-header';

    const title = document.createElement('div');
    title.className = 'draft-title';
    title.textContent = preview1.substring(0, 30);

    const price = document.createElement('div');
    price.className = 'draft-price';
    price.textContent = preview2.substring(0, 20);

    header.appendChild(title);
    header.appendChild(price);

    // Create meta
    const meta = document.createElement('div');
    meta.className = 'draft-meta';

    const timestamp = document.createElement('span');
    timestamp.className = 'timestamp';
    timestamp.textContent = timeAgo;

    meta.appendChild(timestamp);

    // Create actions
    const actions = document.createElement('div');
    actions.className = 'draft-actions';

    const restoreBtn = document.createElement('button');
    restoreBtn.className = 'btn btn-small btn-restore';
    restoreBtn.dataset.index = index;
    restoreBtn.textContent = '⬆️ Restore';
    restoreBtn.addEventListener('click', () => restoreSavedDraft(parseInt(restoreBtn.dataset.index)));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-small btn-delete';
    deleteBtn.dataset.index = index;
    deleteBtn.textContent = '🗑️ Delete';
    deleteBtn.addEventListener('click', () => deleteSavedDraft(parseInt(deleteBtn.dataset.index)));

    actions.appendChild(restoreBtn);
    actions.appendChild(deleteBtn);

    // Assemble draft item
    draftItem.appendChild(header);
    draftItem.appendChild(meta);
    draftItem.appendChild(actions);

    container.appendChild(draftItem);
  });
}

// Setup event listeners
function setupEventListeners() {
  // Save now button
  document.getElementById('saveNowBtn').addEventListener('click', async () => {
    try {
      const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
      await browserAPI.tabs.sendMessage(tabs[0].id, { action: 'saveDraft' });

      // Save to saved drafts list
      await saveCurrentDraftToList();

      showStatus('Draft saved!', 'success');
      setTimeout(() => {
        loadCurrentDraft();
        loadSavedDrafts();
      }, 500);
    } catch (err) {
      showStatus('Error saving draft', 'error');
      console.error('Save error:', err);
    }
  });

  // Restore current draft button
  document.getElementById('restoreCurrentBtn').addEventListener('click', async () => {
    const result = await browserAPI.storage.local.get('currentDraft');
    if (result.currentDraft) {
      await restoreDraft(result.currentDraft);
    }
  });
}

// Save current draft to saved drafts list
async function saveCurrentDraftToList() {
  const result = await browserAPI.storage.local.get(['currentDraft', 'savedDrafts']);
  const currentDraft = result.currentDraft;
  const savedDrafts = result.savedDrafts || [];

  if (!currentDraft) return;

  // Add to beginning of array
  savedDrafts.unshift({ ...currentDraft, id: Date.now() });

  // Keep only last 10 drafts
  const trimmedDrafts = savedDrafts.slice(0, 10);

  await browserAPI.storage.local.set({ savedDrafts: trimmedDrafts });
}

// Restore a saved draft
async function restoreSavedDraft(index) {
  const result = await browserAPI.storage.local.get('savedDrafts');
  const savedDrafts = result.savedDrafts || [];

  if (savedDrafts[index]) {
    await restoreDraft(savedDrafts[index]);
  }
}

// Restore draft to page
async function restoreDraft(draft) {
  const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });

  try {
    await browserAPI.tabs.sendMessage(tabs[0].id, {
      action: 'restoreDraft',
      data: draft
    });
    showStatus('Draft restored!', 'success');
  } catch (err) {
    showStatus('Error restoring draft', 'error');
    console.error(err);
  }
}

// Delete a saved draft
async function deleteSavedDraft(index) {
  const result = await browserAPI.storage.local.get('savedDrafts');
  const savedDrafts = result.savedDrafts || [];

  savedDrafts.splice(index, 1);

  await browserAPI.storage.local.set({ savedDrafts });
  showStatus('Draft deleted', 'success');
  await loadSavedDrafts();
}

// Show status message
function showStatus(message, type = 'success') {
  const statusEl = document.getElementById('autoSaveStatus');
  const originalText = statusEl.textContent;

  statusEl.textContent = message;
  statusEl.style.color = type === 'success' ? '#4caf50' : '#f44336';

  setTimeout(() => {
    statusEl.textContent = originalText;
    statusEl.style.color = '';
  }, 2000);
}

// Utility functions
function getTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + ' min ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + ' hrs ago';
  return Math.floor(seconds / 86400) + ' days ago';
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
