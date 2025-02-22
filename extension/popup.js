const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

const defaultColorMap = {
  a: '#F2CCE6', e: '#CCE6CC', i: '#D9CCFF', o: '#FFE6CC', u: '#CCE6F2',
  b: '#6699FF', c: '#00FFFF', d: '#FF6600', f: '#FF00CC', g: '#33FF33',
  h: '#FF3399', j: '#00CC66', k: '#CCB300', l: '#00FF66', m: '#CC00FF',
  n: '#3399FF', p: '#9900FF', q: '#FF3399', r: '#FF3333', s: '#FF9966',
  t: '#00FFCC', v: '#CC33FF', w: '#FFCC33', x: '#CCFF33', y: '#FFFF00',
  z: '#6699FF', 0: '#808080', 1: '#B3B3B3', 2: '#FF3333', 3: '#33CC33',
  4: '#6699FF', 5: '#CC9900', 6: '#FF00FF', 7: '#00CCCC', 8: '#FF9900',
  9: '#7F33FF'
};

// DOM Elements
const titleContainer = document.getElementById('title');
const colorPickerContainer = document.getElementById('colorPicker');
const enableButton = document.getElementById('enableButton');
const disableButton = document.getElementById('disableButton');
const applyButton = document.getElementById('applyButton');
const enableDynamicButton = document.getElementById('enableDynamicButton');
const disableDynamicButton = document.getElementById('disableDynamicButton');
const hardcoreModeButton = document.getElementById('hardcoreModeButton');
const resetButton = document.getElementById('resetButton');
const exportButton = document.getElementById('exportButton');
const importButton = document.getElementById('importButton');
const importFileInput = document.getElementById('importFileInput');
const statusDiv = document.getElementById('status');
const dynamicStatusDiv = document.getElementById('dynamicStatus');

let colorMap = {};
let enabledSites = [];
let dynamicEnabledSites = [];
let isGameActive = false;

function createColorPickerSection(title, chars) {
  const header = document.createElement('h4');
  header.textContent = title;
  colorPickerContainer.appendChild(header);

  const group = document.createElement('div');
  group.className = 'color-group';
  chars.forEach(char => {
    const label = document.createElement('label');
    label.textContent = char.toUpperCase();
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = colorMap[char] || '#000000';
    colorInput.addEventListener('input', () => {
      colorMap[char] = colorInput.value;
      chrome.storage.sync.set({ colorMap });
      updateTitleColors();
    });
    label.appendChild(colorInput);
    group.appendChild(label);
  });
  colorPickerContainer.appendChild(group);
}

function updateTitleColors() {
  titleContainer.innerHTML = '';
  const titleText = 'rainbow-text';
  titleText.split('').forEach(char => {
    const span = document.createElement('span');
    span.textContent = char;
    span.style.color = isGameActive ? '#FFF' : (colorMap[char.toLowerCase()] || '#FFF');
    titleContainer.appendChild(span);
  });
}

function exportSettings() {
  chrome.storage.sync.get(['colorMap', 'enabledSites', 'dynamicEnabledSites'], (data) => {
    const settings = {
      colorMap: data.colorMap || colorMap,
      enabledSites: data.enabledSites || enabledSites,
      dynamicEnabledSites: data.dynamicEnabledSites || dynamicEnabledSites
    };
    const json = JSON.stringify(settings, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rainbow-text-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    statusDiv.textContent = 'Settings exported!';
    setTimeout(() => statusDiv.textContent = '', 2000); // Clear after 2 seconds
  });
}

function importSettings(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const settings = JSON.parse(e.target.result);
      const { colorMap: importedColorMap, enabledSites: importedSites, dynamicEnabledSites: importedDynamicSites } = settings;

      // Validate and apply settings
      if (importedColorMap) colorMap = { ...defaultColorMap, ...importedColorMap };
      if (Array.isArray(importedSites)) enabledSites = importedSites;
      if (Array.isArray(importedDynamicSites)) dynamicEnabledSites = importedDynamicSites;

      chrome.storage.sync.set({
        colorMap,
        enabledSites,
        dynamicEnabledSites,
      }, () => {
        // Rebuild UI with imported settings
        colorPickerContainer.innerHTML = '';
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        const consonants = 'bcdfghjklmnpqrstvwxyz'.split('');
        const numerals = '0123456789'.split('');
        createColorPickerSection('Vowels', vowels);
        createColorPickerSection('Consonants', consonants);
        createColorPickerSection('Numerals', numerals);

        updateTitleColors();
        updateUI();
        statusDiv.textContent = 'Settings imported!';
        setTimeout(() => statusDiv.textContent = '', 2000); // Clear after 2 seconds
      });
    } catch (err) {
      statusDiv.textContent = 'Error importing settings!';
      console.error('Import failed:', err);
      setTimeout(() => statusDiv.textContent = '', 2000);
    }
  };
  reader.readAsText(file);
  importFileInput.value = ''; // Reset input for reuse
}

// Load saved data and initialize UI
chrome.storage.sync.get(['colorMap', 'enabledSites', 'dynamicEnabledSites'], (data) => {
  colorMap = { ...defaultColorMap, ...data.colorMap };
  enabledSites = data.enabledSites || [];
  dynamicEnabledSites = data.dynamicEnabledSites || [];

  colorPickerContainer.innerHTML = '';
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const consonants = 'bcdfghjklmnpqrstvwxyz'.split('');
  const numerals = '0123456789'.split('');

  createColorPickerSection('Vowels', vowels);
  createColorPickerSection('Consonants', consonants);
  createColorPickerSection('Numerals', numerals);

  updateTitleColors();
  updateUI();
});

function updateUI() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const hostname = url.hostname;
    if (enabledSites.includes(hostname)) {
      enableButton.style.display = 'none';
      disableButton.style.display = 'block';
      hardcoreModeButton.style.display = 'block';
      statusDiv.textContent = 'Enabled for this site';
      setHardcoreModeText();
      if (dynamicEnabledSites.includes(hostname)) {
        enableDynamicButton.style.display = 'none';
        disableDynamicButton.style.display = 'block';
        dynamicStatusDiv.textContent = "Dynamic content is enabled for this site";
      } else {
        enableDynamicButton.style.display = 'block';
        disableDynamicButton.style.display = 'none';
        dynamicStatusDiv.textContent = 'Dynamic content is disabled for this site';
      }
    } else {
      enableButton.style.display = 'block';
      disableButton.style.display = 'none';
      statusDiv.textContent = 'Disabled for this site';
      enableDynamicButton.style.display = 'none';
      disableDynamicButton.style.display = 'none';
      dynamicStatusDiv.textContent = '';
      hardcoreModeButton.style.display = 'none';
    }
  });
}

function setHardcoreModeText() {
  hardcoreModeButton.textContent = '';
  hardcoreModeButton.innerHTML = '';
  const baseText = 'HARDCORE MODE!!!';
  baseText.split('').forEach(char => {
    const span = document.createElement('span');
    span.textContent = char;
    span.style.color = colorMap[char.toLowerCase()] || '#000000';
    hardcoreModeButton.appendChild(span);
  });
  const linebreak = document.createElement('span');
  linebreak.textContent = '\n';
  hardcoreModeButton.appendChild(linebreak);
  baseText.split('').forEach(char => {
    const span = document.createElement('span');
    if (/[A-Za-z0-9]/.test(char)) {
      span.style.color = colorMap[char.toLowerCase()] || '#000000';
      span.textContent = "\u25A0";
    } else {
      span.textContent = char;
    }
    hardcoreModeButton.appendChild(span);
  });
}

function resetAll() {
  chrome.storage.sync.remove(['colorMap', 'enabledSites', 'dynamicEnabledSites'], () => {
    colorMap = { ...defaultColorMap };
    enabledSites = [];
    dynamicEnabledSites = [];

    colorPickerContainer.innerHTML = '';
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const consonants = 'bcdfghjklmnpqrstvwxyz'.split('');
    const numerals = '0123456789'.split('');

    createColorPickerSection('Vowels', vowels);
    createColorPickerSection('Consonants', consonants);
    createColorPickerSection('Numerals', numerals);

    updateTitleColors();
    updateUI();
    statusDiv.textContent = 'All settings reset!';
  });
}

enableButton.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const hostname = url.hostname;
    if (!enabledSites.includes(hostname)) {
      enabledSites.push(hostname);
      chrome.storage.sync.set({ enabledSites }, () => updateUI());
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'applyCharacterColors',
        colorMap: colorMap,
        dynamicEnabled: dynamicEnabledSites.includes(hostname),
        blockModeEnabled: false
      });
    }
  });
});

disableButton.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const hostname = url.hostname;
    enabledSites = enabledSites.filter(site => site !== hostname);
    chrome.storage.sync.set({ enabledSites }, () => updateUI());
  });
});

applyButton.addEventListener('click', () => {
  chrome.storage.sync.set({ colorMap });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const hostname = url.hostname;
    if (enabledSites.includes(hostname)) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'applyCharacterColors',
        colorMap: colorMap,
        dynamicEnabled: dynamicEnabledSites.includes(hostname),
        blockModeEnabled: false
      });
    }
  });
  updateTitleColors();
});

enableDynamicButton.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const hostname = url.hostname;
    if (!dynamicEnabledSites.includes(hostname)) {
      dynamicEnabledSites.push(hostname);
      chrome.storage.sync.set({ dynamicEnabledSites }, () => updateUI());
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'applyCharacterColors',
        colorMap: colorMap,
        dynamicEnabled: true,
        blockModeEnabled: false
      });
    }
  });
});

disableDynamicButton.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const hostname = url.hostname;
    dynamicEnabledSites = dynamicEnabledSites.filter(site => site !== hostname);
    chrome.storage.sync.set({ dynamicEnabledSites }, () => updateUI());
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'applyCharacterColors',
      colorMap: colorMap,
      dynamicEnabled: false,
      blockModeEnabled: false
    });
  });
});

hardcoreModeButton.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const hostname = url.hostname;
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'applyCharacterColors',
      colorMap: colorMap,
      dynamicEnabled: dynamicEnabledSites.includes(hostname),
      blockModeEnabled: true
    });
  });
});

resetButton.addEventListener('click', () => {
  if (confirm('Are you sure you want to reset all settings? This will clear color overrides and site settings.')) {
    resetAll();
  }
});

exportButton.addEventListener('click', exportSettings);

importButton.addEventListener('click', () => {
  importFileInput.click(); // Trigger file input click
});

importFileInput.addEventListener('change', importSettings);