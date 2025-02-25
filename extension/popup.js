const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
let colorMap = {};
let isGameActive = false;
{

  const defaultColorMap = {
    a: '#FFA3E2', e: '#A9E5A9', i: '#BAA3FF', o: '#FFCB94', u: '#90D8F9',
    b: '#6699FF', c: '#00EBEB', d: '#FF6600', f: '#FF00CC', g: '#33FF33',
    h: '#DD2782', j: '#00CC66', k: '#CCB300', l: '#FF6B6B', m: '#CC00FF',
    n: '#37B1B3', p: '#9900FF', q: '#2BAB8B', r: '#FF0000', s: '#FDA77C',
    t: '#00FFCC', v: '#D557FF', w: '#FFCC33', x: '#B2DF2A', y: '#FFFF00',
    z: '#7898D9', 0: '#808080', 1: '#B3B3B3', 2: '#FF3333', 3: '#33CC33',
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
  const startGameButton = document.getElementById('startGameButton');
  const startBlockGameButton = document.getElementById('startBlockGameButton');
  const startStroopGameButton = document.getElementById('startStroopGameButton');
  const statusDiv = document.getElementById('status');
  const dynamicStatusDiv = document.getElementById('dynamicStatus');
  const gameContainer = document.getElementById('gameContainer');
  const blockGameContainer = document.getElementById('blockGameContainer');
  const stroopGameContainer = document.getElementById('stroopGameContainer');
  const mainControls = document.getElementById('mainControls');

  let enabledSites = [];
  let dynamicEnabledSites = [];

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
    chrome.storage.sync.get(['colorMap', 'enabledSites', 'dynamicEnabledSites', 'activeCharacters', 'charStats', 'streak', 'activeWords', 'wordStats', 'wordStreak'], (data) => {
      const settings = {
        colorMap: data.colorMap || colorMap,
        enabledSites: data.enabledSites || enabledSites,
        dynamicEnabledSites: data.dynamicEnabledSites || dynamicEnabledSites,
        activeCharacters: data.activeCharacters || [],
        charStats: data.charStats || {},
        streak: data.streak || 0,
        activeWords: data.activeWords || [],
        wordStats: data.wordStats || {},
        wordStreak: data.wordStreak || 0
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
      setTimeout(() => statusDiv.textContent = '', 2000);
    });
  }

  function importSettings(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target.result);
        const {
          colorMap: importedColorMap,
          enabledSites: importedSites,
          dynamicEnabledSites: importedDynamicSites,
          activeCharacters,
          charStats,
          streak,
          activeWords,
          wordStats,
          wordStreak
        } = settings;

        if (importedColorMap) colorMap = { ...defaultColorMap, ...importedColorMap };
        if (Array.isArray(importedSites)) enabledSites = importedSites;
        if (Array.isArray(importedDynamicSites)) dynamicEnabledSites = importedDynamicSites;

        chrome.storage.sync.set({
          colorMap,
          enabledSites,
          dynamicEnabledSites,
          activeCharacters: Array.isArray(activeCharacters) ? activeCharacters : [],
          charStats: typeof charStats === 'object' ? charStats : {},
          streak: typeof streak === 'number' ? streak : 0,
          activeWords: Array.isArray(activeWords) ? activeWords : [],
          wordStats: typeof wordStats === 'object' ? wordStats : {},
          wordStreak: typeof wordStreak === 'number' ? wordStreak : 0
        }, () => {
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
          setTimeout(() => statusDiv.textContent = '', 2000);
        });
      } catch (err) {
        statusDiv.textContent = 'Error importing settings!';
        console.error('Import failed:', err);
        setTimeout(() => statusDiv.textContent = '', 2000);
      }
    };
    reader.readAsText(file);
    importFileInput.value = '';
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
    chrome.storage.sync.remove(['colorMap', 'enabledSites', 'dynamicEnabledSites', 'activeCharacters', 'charStats', 'streak', 'activeWords', 'wordStats', 'wordStreak'], () => {
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
    importFileInput.click();
  });

  importFileInput.addEventListener('change', importSettings);

  startGameButton.addEventListener('click', () => {
    mainControls.style.display = 'none';
    gameContainer.style.display = 'block';
    blockGameContainer.style.display = 'none';
    stroopGameContainer.style.display = 'none';
    isGameActive = true;
    updateTitleColors();
  });

  startBlockGameButton.addEventListener('click', () => {
    mainControls.style.display = 'none';
    gameContainer.style.display = 'none';
    blockGameContainer.style.display = 'block';
    stroopGameContainer.style.display = 'none';
    isGameActive = true;
    updateTitleColors();
  });

  startStroopGameButton.addEventListener('click', () => {
    mainControls.style.display = 'none';
    gameContainer.style.display = 'none';
    blockGameContainer.style.display = 'none';
    stroopGameContainer.style.display = 'block';
    isGameActive = true;
    updateTitleColors();
  });
}