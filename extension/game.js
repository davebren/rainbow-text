// Game-specific DOM elements
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
const startGameButton = document.getElementById('startGameButton');

// Game state (initialized from popup.js globals)
let activeCharacters = [];
let charStats = {};
let currentChar = '';
let isCharToColorMode = true;
let streak = 0;

// Load game state from storage
chrome.storage.sync.get(['activeCharacters', 'charStats'], (data) => {
  activeCharacters = data.activeCharacters || characters.split('').slice(0, 5);
  charStats = data.charStats || {};

  // Initialize charStats for any missing characters
  characters.split('').forEach(char => {
    if (!charStats[char]) charStats[char] = { correct: 0, total: 0 };
  });
});

// Save game progress
function saveProgress() {
  chrome.storage.sync.set({ activeCharacters, charStats });
}

// Game event listeners
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
  currentChar = biasedRandomChar(currentChar);
  gameOptions.innerHTML = '';
  gameFeedback.textContent = '';
  nextCardButton.classList.add('hidden');

  if (isCharToColorMode) {
    gameCharacter.textContent = currentChar.toUpperCase();
    gameCharacter.style.color = '#FFF'; // Reset to white initially
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

function biasedRandomChar(previousChar) {
  if (activeCharacters.length === characters.length) {
    return activeCharacters[Math.floor(Math.random() * activeCharacters.length)];
  }

  let char = previousChar;
  while (char === previousChar) {
    if (Math.random() > .35) {
      const lastUnlockedChars = activeCharacters.slice(-3);
      char = lastUnlockedChars[Math.floor(Math.random() * lastUnlockedChars.length)];
    } else {
      const restOfChars = activeCharacters.slice(0, activeCharacters.length - 3);
      char = restOfChars[Math.floor(Math.random() * restOfChars.length)];
    }
  }
  return char;
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
    const randomChar = activeCharacters[Math.floor(Math.random() * activeCharacters.length)];
    if (!options.includes(randomChar) && randomChar !== correctChar) {
      options.push(randomChar);
    }
  }
  shuffle(options);
  options.forEach(char => {
    const button = document.createElement('button');
    button.textContent = char.toUpperCase();
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
  charStats[currentChar].total++;
  const isCorrect = selected === correct;

  if (isCorrect) {
    streak++;
    charStats[currentChar].correct++;
    gameFeedback.textContent = 'Correct!';
    gameFeedback.style.color = '#00FF00';
  } else {
    streak = 0;
    gameFeedback.textContent = isColorMode
      ? `Wrong! The correct color is ${correct}.`
      : `Wrong! The correct character is ${correct.toUpperCase()}.`;
    gameFeedback.style.color = '#FF3333';
  }

  if (isCharToColorMode) {
    gameCharacter.style.color = colorMap[currentChar];
  } else {
    gameColor.classList.add('hidden');
    gameCharacter.textContent = currentChar.toUpperCase();
    gameCharacter.style.color = colorMap[currentChar];
    gameCharacter.classList.remove('hidden');
  }

  saveProgress();
  updateScoreDisplay();
  checkProgression();
  nextCardButton.classList.remove('hidden');
  gameOptions.innerHTML = '';
}

function updateScoreDisplay() {
  const streakNeeded = 15 + Math.floor(Math.sqrt(activeCharacters.length))
  gameScore.textContent = `Streak: ${streak} | Learning ${activeCharacters.length}/${characters.length} | ${streakNeeded} streak needed`;
}

function checkProgression() {
  if (activeCharacters.length >= characters.length) return;

  const streakNeeded = 15 + Math.floor(Math.sqrt(activeCharacters.length))
  if (streak >= streakNeeded) {
      const newChar = remainingChars[0];
      activeCharacters.push(newChar);
      gameFeedback.textContent = `Great job! Added '${newChar.toUpperCase()}' to your set.`;
      score.correct = 0;
      score.total = 0;
      saveProgress();
  }
}