// 100 most common English words (frequency descending)
const commonWords = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "I", "it", "for", "not", "on", "with",
  "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if",
  "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just",
  "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see",
  "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back",
  "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want",
  "because", "any", "these", "give", "day", "most", "us"
];

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

// Game state
let activeCharacters = [];
let charStats = {};
let currentChar = '';
let isCharToColorMode = true;
let streak = 0;
let learnedWords = [];
let wordStats = {};
let wordStreak = 0;
let currentWord = '';

chrome.storage.sync.get(['activeCharacters', 'charStats', 'streak', 'learnedWords', 'wordStats', 'wordStreak'], (data) => {
  activeCharacters = data.activeCharacters || characters.split('').slice(0, 5);
  charStats = data.charStats || {};
  streak = data.streak || 0;
  learnedWords = data.learnedWords || [];
  wordStats = data.wordStats || {};
  wordStreak = data.wordStreak || 0;

  characters.split('').forEach(char => {
    if (!charStats[char]) charStats[char] = { correct: 0, total: 0 };
  });
  commonWords.forEach(word => {
    if (!wordStats[word]) wordStats[word] = { correct: 0, total: 0 };
  });
});

function saveProgress() {
  chrome.storage.sync.set({ 
    activeCharacters, 
    charStats, 
    streak, 
    learnedWords, 
    wordStats, 
    wordStreak 
  });
}

exitGameButton.addEventListener('click', () => {
  saveProgress();
  gameContainer.style.display = 'none';
  mainControls.style.display = 'block';
  isGameActive = false;
  updateTitleColors();
});

nextCardButton.addEventListener('click', nextCard);

function nextCard() {
  if (window.gameMode === 'blockword') {
    nextBlockWordCard();
  } else {
    nextFlashcard();
  }
}

function nextFlashcard() {
  currentChar = biasedRandomChar(currentChar);
  gameFeedback.textContent = '';
  nextCardButton.classList.add('invisible');

  if (isCharToColorMode) {
    gameCharacter.textContent = currentChar.toUpperCase();
    gameCharacter.style.color = '#FFF';
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
    if (Math.random() > 0.35) {
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
  gameOptions.innerHTML = '';
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
  gameOptions.innerHTML = '';
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
    button.addEventListener('click', () => checkAnswer(char, correctChar, false));
    gameOptions.appendChild(button);
  });
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

  Array.from(gameOptions.children).forEach(button => button.disabled = true);
  saveProgress();
  updateScoreDisplay();
  checkProgression();
  nextCardButton.classList.remove('invisible');
}

function updateScoreDisplay() {
  const streakNeeded = 13 + Math.floor(Math.sqrt(activeCharacters.length));
  gameScore.textContent = `Streak: ${streak} | Learning ${activeCharacters.length}/${characters.length} | ${streakNeeded} streak needed`;
}

function checkProgression() {
  if (activeCharacters.length >= characters.length) return;

  const streakNeeded = 15 + Math.floor(Math.sqrt(activeCharacters.length));
  if (streak >= streakNeeded) {
    const remainingChars = characters.split('').filter(c => !activeCharacters.includes(c));
    if (remainingChars.length > 0) {
      const newChar = remainingChars[0];
      activeCharacters.push(newChar);
      gameFeedback.textContent = `Great job! Added '${newChar.toUpperCase()}' to your set.`;
      streak = 0;
      saveProgress();
    }
  }
}

// Block Word Game Mode
const blockWords = commonWords;

function nextBlockWordCard() {
  currentWord = selectNextWord();
  gameFeedback.textContent = '';
  nextCardButton.classList.add('invisible');

  gameCharacter.innerHTML = '';
  currentWord.split('').forEach(char => {
    const span = document.createElement('span');
    span.textContent = '\u25A0'; // Unicode block character
    span.style.color = colorMap[char.toLowerCase()] || '#FFF';
    span.style.fontSize = '48px';
    gameCharacter.appendChild(span);
  });
  gameCharacter.classList.remove('hidden');
  gameColor.classList.add('hidden');
  generateWordOptions();
}

function selectNextWord() {
  const unlearnedWords = blockWords.filter(word => !learnedWords.includes(word));
  if (unlearnedWords.length > 0) {
    return unlearnedWords[Math.floor(Math.random() * Math.min(5, unlearnedWords.length))]; // Bias towards first 5 unlearned
  }
  return blockWords[Math.floor(Math.random() * blockWords.length)]; // Fallback if all learned
}

function generateWordOptions() {
  gameOptions.innerHTML = '';
  const correctWord = currentWord;
  let options = [correctWord];
  while (options.length < 4) {
    const randomWord = blockWords[Math.floor(Math.random() * blockWords.length)];
    if (!options.includes(randomWord) && randomWord !== correctWord) {
      options.push(randomWord);
    }
  }
  shuffle(options);
  options.forEach(word => {
    const button = document.createElement('button');
    button.textContent = word;
    button.addEventListener('click', () => checkWordAnswer(word, correctWord));
    gameOptions.appendChild(button);
  });
}

function checkWordAnswer(selected, correct) {
  wordStats[correct].total++;
  const isCorrect = selected === correct;

  if (isCorrect) {
    wordStreak++;
    wordStats[correct].correct++;
    gameFeedback.textContent = 'Correct!';
    gameFeedback.style.color = '#00FF00';
    checkWordProgression();
  } else {
    wordStreak = 0;
    gameFeedback.textContent = `Wrong! The correct word is "${correct}".`;
    gameFeedback.style.color = '#FF3333';
  }

  Array.from(gameOptions.children).forEach(button => button.disabled = true);
  saveProgress();
  updateWordScoreDisplay();
  nextCardButton.classList.remove('invisible');
}

function updateWordScoreDisplay() {
  const streakNeeded = 15 + Math.floor(Math.sqrt(learnedWords.length));
  gameScore.textContent = `Streak: ${wordStreak} | Learned ${learnedWords.length}/${blockWords.length} | ${streakNeeded} streak needed`;
}

function checkWordProgression() {
  if (learnedWords.length >= blockWords.length) return;

  const streakNeeded = 15 + Math.floor(Math.sqrt(learnedWords.length));
  if (wordStreak >= streakNeeded && !learnedWords.includes(currentWord)) {
    learnedWords.push(currentWord);
    gameFeedback.textContent = `Great job! Learned "${currentWord}"!`;
    wordStreak = 0;
    saveProgress();
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Initialize game based on mode
if (startGameButton) {
  startGameButton.addEventListener('click', () => {
    mainControls.style.display = 'none';
    gameContainer.style.display = 'block';
    isGameActive = true;
    updateTitleColors();
    updateScoreDisplay();
    nextCard();
  });
}

if (startBlockGameButton) {
  startBlockGameButton.addEventListener('click', () => {
    mainControls.style.display = 'none';
    gameContainer.style.display = 'block';
    isGameActive = true;
    updateTitleColors();
    updateWordScoreDisplay();
    nextCard();
  });
}

toggleModeButton.addEventListener('click', () => {
  if (window.gameMode === 'flashcard') {
    isCharToColorMode = !isCharToColorMode;
    toggleModeButton.textContent = isCharToColorMode ? 'Switch to Color-to-Char' : 'Switch to Char-to-Color';
    nextCard();
  }
});

exitGameButton.addEventListener('click', () => {
  saveProgress();
  gameContainer.style.display = 'none';
  mainControls.style.display = 'block';
  isGameActive = false;
  updateTitleColors();
});

nextCardButton.addEventListener('click', nextCard);