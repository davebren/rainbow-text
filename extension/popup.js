const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

const defaultColorMap = {
  // Vowels (Pastels)
  a: '#F2CCE6', // Soft Mauve (HSL: 320, 60%, 90%) – Reddish-purple
  e: '#CCE6CC', // Pale Mint (HSL: 120, 40%, 85%) – Greenish
  i: '#D9CCFF', // Light Lavender (HSL: 260, 100%, 90%) – Purplish
  o: '#FFE6CC', // Peach Glow (HSL: 30, 100%, 90%) – Orangish
  u: '#CCE6F2', // Baby Blue (HSL: 200, 60%, 90%) – Bluish

  // Consonants (Neon-ish: adjusted y, k)
  b: '#6699FF', // Lighter Neon Blue (HSL: 225, 100%, 70%)
  c: '#00FFFF', // Neon Cyan (HSL: 180, 100%, 50%)
  d: '#FF6600', // Neon Orange (HSL: 20, 100%, 50%)
  f: '#FF00CC', // Neon Fuchsia (HSL: 312, 100%, 50%)
  g: '#33FF33', // Neon Green (HSL: 120, 100%, 60%)
  h: '#FF3399', // Neon Hot Pink (HSL: 330, 100%, 60%)
  j: '#00CC66', // Neon Jade (HSL: 150, 100%, 40%)
  k: '#CCB300', // Darker Neon Yellow (HSL: 50, 100%, 45%) – Was 60%
  l: '#00FF66', // Neon Lime (HSL: 140, 100%, 50%)
  m: '#CC00FF', // Neon Magenta (HSL: 288, 100%, 50%)
  n: '#3399FF', // Lighter Neon Navy (HSL: 210, 100%, 60%)
  p: '#9900FF', // Neon Purple (HSL: 270, 100%, 50%)
  q: '#FF3399', // Lighter Neon Red-Pink (HSL: 340, 100%, 60%)
  r: '#FF3333', // Neon Red (HSL: 0, 100%, 60%)
  s: '#FF9966', // Neon Salmon (HSL: 20, 100%, 70%)
  t: '#00FFCC', // Neon Turquoise (HSL: 168, 100%, 50%)
  v: '#CC33FF', // Neon Violet (HSL: 282, 100%, 60%)
  w: '#FFCC33', // Neon Amber (HSL: 45, 100%, 60%)
  x: '#CCFF33', // Neon Chartreuse (HSL: 75, 100%, 60%)
  y: '#FFFF00', // Darker Neon Yellow (HSL: 60, 100%, 50%) – Was 70%
  z: '#6699FF', // Much Lighter Neon Blue (HSL: 225, 100%, 75%)

  // Numbers (Neon-ish: adjusted 5)
  0: '#808080', // Slightly Lighter Gray (HSL: 0, 0%, 50%)
  1: '#B3B3B3', // Slightly Darker Light Gray (HSL: 0, 0%, 70%)
  2: '#FF3333', // Neon Red (HSL: 0, 100%, 60%)
  3: '#33CC33', // Neon Forest Green (HSL: 120, 60%, 50%)
  4: '#6699FF', // Lighter Neon Royal Blue (HSL: 225, 100%, 70%)
  5: '#CC9900', // Darker Neon Gold (HSL: 45, 100%, 40%) – Was 50%
  6: '#FF00FF', // Neon Pure Magenta (HSL: 300, 100%, 50%)
  7: '#00CCCC', // Neon Teal (HSL: 180, 100%, 40%)
  8: '#FF9900', // Neon Tangerine (HSL: 36, 100%, 50%)
  9: '#7F33FF', // Slightly Lighter Neon Indigo (HSL: 260, 100%, 60%)
};

// DOM Elements
const colorPickerContainer = document.getElementById('colorPicker');
const enableButton = document.getElementById('enableButton');
const disableButton = document.getElementById('disableButton');
const applyButton = document.getElementById('applyButton');
const enableDynamicButton = document.getElementById('enableDynamicButton');
const disableDynamicButton = document.getElementById('disableDynamicButton');
const hardcoreModeButton = document.getElementById('hardcoreModeButton');
const startGameButton = document.getElementById('startGameButton');
const statusDiv = document.getElementById('status');
const dynamicStatusDiv = document.getElementById('dynamicStatus')

const gameContainer = document.getElementById('gameContainer');
const gameCharacter = document.getElementById('gameCharacter');
const gameColor = document.getElementById('gameColor');
const gameOptions = document.getElementById('gameOptions');
const gameFeedback = document.getElementById('gameFeedback');
const gameScore = document.getElementById('gameScore');
const nextCardButton = document.getElementById('nextCardButton');
const toggleModeButton = document.getElementById('toggleModeButton');
const exitGameButton = document.getElementById('exitGameButton');
const mainControls = document.getElementById('mainControls');

let colorMap = {};
let enabledSites = [];
let dynamicEnabledSites = [];
let activeCharacters = [];
let charStats = {}; // { char: { correct: X, total: Y } }
let currentChar = '';
let isCharToColorMode = true;
let score = { correct: 0, total: 0 };

// Load saved data and initialize UI
chrome.storage.sync.get(['colorMap', 'enabledSites', 'dynamicEnabledSites', 'activeCharacters', 'charStats', 'score'], (data) => {
  colorMap = { ...defaultColorMap, ...data.colorMap };
  enabledSites = data.enabledSites || [];
  dynamicEnabledSites = data.dynamicEnabledSites || [];
  activeCharacters = data.activeCharacters || characters.split('').slice(0, 5);
  charStats = data.charStats || {};
  score = data.score || { correct: 0, total: 0 };

  // Initialize charStats for any missing characters
  characters.split('').forEach(char => {
    if (!charStats[char]) charStats[char] = { correct: 0, total: 0 };
  });

  characters.split('').forEach(char => {
    const label = document.createElement('label');
    label.textContent = char.toUpperCase();
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = colorMap[char] || '#000000';
    colorInput.addEventListener('input', () => {
      colorMap[char] = colorInput.value;
      chrome.storage.sync.set({ colorMap });
    });
    label.appendChild(colorInput);
    colorPickerContainer.appendChild(label);
  });

  updateUI();
});

function saveProgress() {
  chrome.storage.sync.set({ activeCharacters, charStats, score });
}

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

// Existing event listeners (unchanged)
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

// Game Logic
startGameButton.addEventListener('click', () => {
  mainControls.style.display = 'none';
  gameContainer.style.display = 'block';
  updateScoreDisplay();
  nextCard();
});

toggleModeButton.addEventListener('click', () => {
  isCharToColorMode = !isCharToColorMode;
  toggleModeButton.textContent = isCharToColorMode ? 'Switch to Color-to-Char' : 'Switch to Char-to-Color';
  nextCard();
});

exitGameButton.addEventListener('click', () => {
  saveProgress();
  gameContainer.style.display = 'none';
  mainControls.style.display = 'block';
});

nextCardButton.addEventListener('click', nextCard);

function nextCard() {
  currentChar = biasedRandomChar();
  gameOptions.innerHTML = '';
  gameFeedback.textContent = '';
  nextCardButton.classList.add('hidden');

  if (isCharToColorMode) {
    gameCharacter.textContent = currentChar.toUpperCase();
    gameCharacter.classList.remove('hidden');
    gameColor.classList.add('hidden');
    generateColorOptions();
  } else {
    gameColor.style.backgroundColor = colorMap[currentChar];
    gameColor.classList.remove('hidden');
    gameCharacter.classList.add('hidden');
    generateCharOptions();
  }
}

function biasedRandomChar() {
  if (activeCharacters.length === characters.length) {
    return activeCharacters[Math.floor(Math.random() * activeCharacters.length)];
  }
  // Bias towards newer characters (last 25% of activeCharacters)
  const biasThreshold = Math.max(1, Math.floor(activeCharacters.length * 0.25));
  const recentChars = activeCharacters.slice(-biasThreshold);
  return Math.random() < 0.7 ? recentChars[Math.floor(Math.random() * recentChars.length)] : activeCharacters[Math.floor(Math.random() * activeCharacters.length)];
}

function generateColorOptions() {
  const correctColor = colorMap[currentChar];
  const allColors = Object.values(colorMap);
  let options = [correctColor];
  while (options.length < 4) {
    const randomColor = allColors[Math.floor(Math.random() * allColors.length)];
    if (!options.includes(randomColor) && randomColor !== correctColor) {
      options.push(randomColor);
    }
  }
  shuffle(options);
  options.forEach(color => {
    const button = document.createElement('button');
    button.style.backgroundColor = color;
    button.addEventListener('click', () => checkAnswer(color, correctColor, true));
    gameOptions.appendChild(button);
  });
}

function generateCharOptions() {
  const correctChar = currentChar;
  let options = [correctChar];
  while (options.length < 4) {
    const randomChar = characters[Math.floor(Math.random() * characters.length)];
    if (!options.includes(randomChar) && randomChar !== correctChar) {
      options.push(randomChar);
    }
  }
  shuffle(options);
  options.forEach(char => {
    const button = document.createElement('button');
    button.textContent = char.toUpperCase();
    button.style.color = '#000000'; // Black text for all options
    button.addEventListener('click', () => checkAnswer(char, correctChar, false));
    gameOptions.appendChild(button);
  });
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function checkAnswer(selected, correct, isColorMode) {
  score.total++;
  charStats[currentChar].total++;
  const isCorrect = selected === correct;
  if (isCorrect) {
    score.correct++;
    charStats[currentChar].correct++;
    gameFeedback.textContent = 'Correct!';
    gameFeedback.style.color = 'green';
  } else {
    gameFeedback.textContent = isColorMode
      ? `Wrong! The correct color is ${correct}.`
      : `Wrong! The correct character is ${correct.toUpperCase()}.`;
    gameFeedback.style.color = 'red';
  }
  saveProgress();
  updateScoreDisplay();
  checkProgression();
  nextCardButton.classList.remove('hidden');
  gameOptions.innerHTML = '';
}

function updateScoreDisplay() {
  const percentage = score.total > 0 ? ((score.correct / score.total) * 100).toFixed(1) : 0;
  const attemptsNeeded = 10 + (activeCharacters.length - 5) * 5;
  gameScore.textContent = `Score: ${score.correct}/${score.total} (${percentage}%) | Learning ${activeCharacters.length}/${characters.length} (Next: ${attemptsNeeded} attempts)`;
}

function checkProgression() {
  const attemptsNeeded = 10 + (activeCharacters.length - 5) * 5;
  if (score.total >= attemptsNeeded && activeCharacters.length < characters.length) {
    const percentage = (score.correct / score.total) * 100;
    if (percentage >= 80) {
      const remainingChars = characters.split('').filter(c => !activeCharacters.includes(c));
      if (remainingChars.length > 0) {
        const newChar = remainingChars[0];
        activeCharacters.push(newChar);
        gameFeedback.textContent = `Great job! Added '${newChar.toUpperCase()}' to your set.`;
        score.correct = 0;
        score.total = 0;
        saveProgress();
      }
    }
  }
}