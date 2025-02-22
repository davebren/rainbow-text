{

  // Game-specific DOM elements
  const mainControls = document.getElementById('mainControls');
  const startGameButton = document.getElementById('startGameButton')
  const container = document.getElementById('gameContainer');
  const characterPrompt = document.getElementById('gameCharacter');
  const colorPrompt = document.getElementById('gameColor');
  const optionsContainer = document.getElementById('gameOptions');
  const feedbackText = document.getElementById('gameFeedback');
  const scoreText = document.getElementById('gameScore');
  const nextCardButton = document.getElementById('nextCardButton');
  const toggleModeButton = document.getElementById('toggleModeButton');
  const exitGameButton = document.getElementById('exitGameButton');

  // Game state
  let activeCharacters = [];
  let charStats = {};
  let currentChar = '';
  let isCharToColorMode = true;
  let streak = 0;

  chrome.storage.sync.get(['activeCharacters', 'charStats', 'streak'], (data) => {
    activeCharacters = data.activeCharacters || characters.split('').slice(0, 5);
    charStats = data.charStats || {};
    streak = data.streak || 0;

    characters.split('').forEach(char => {
      if (!charStats[char]) charStats[char] = { correct: 0, total: 0 };
    });
  });

  function saveProgress() {
    chrome.storage.sync.set({ activeCharacters, charStats, streak });
  }

  startGameButton.addEventListener('click', () => {
    nextCard();
    updateScoreDisplay();
  });

  exitGameButton.addEventListener('click', () => {
    saveProgress();
    container.style.display = 'none';
    mainControls.style.display = 'block';
    isGameActive = false;
    updateTitleColors();
  });

  nextCardButton.addEventListener('click', nextCard);

  function nextCard() {
    currentChar = biasedRandomChar(currentChar);
    feedbackText.textContent = '';
    nextCardButton.classList.add('invisible');

    if (isCharToColorMode) {
      characterPrompt.textContent = currentChar.toUpperCase();
      characterPrompt.style.color = '#FFF';
      characterPrompt.classList.remove('hidden');
      colorPrompt.classList.add('hidden');
      generateColorOptions();
    } else {
      colorPrompt.style.backgroundColor = colorMap[currentChar];
      colorPrompt.classList.remove('hidden');
      characterPrompt.classList.add('hidden');
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
    optionsContainer.innerHTML = '';
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
      optionsContainer.appendChild(button);
    });
  }

  function generateCharOptions() {
    optionsContainer.innerHTML = '';
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
      optionsContainer.appendChild(button);
    });
  }

  function checkAnswer(selected, correct, isColorMode) {
    charStats[currentChar].total++;
    const isCorrect = selected === correct;

    if (isCorrect) {
      streak++;
      charStats[currentChar].correct++;
      feedbackText.textContent = 'Correct!';
      feedbackText.style.color = '#00FF00';
    } else {
      streak = 0;
      feedbackText.textContent = isColorMode
      ? `Wrong! The correct color is ${correct}.`
      : `Wrong! The correct character is ${correct.toUpperCase()}.`;
      feedbackText.style.color = '#FF3333';
    }

    if (isCharToColorMode) {
      characterPrompt.style.color = colorMap[currentChar];
    } else {
      colorPrompt.classList.add('hidden');
      characterPrompt.textContent = currentChar.toUpperCase();
      characterPrompt.style.color = colorMap[currentChar];
      characterPrompt.classList.remove('hidden');
    }

    Array.from(optionsContainer.children).forEach(button => button.disabled = true);
    saveProgress();
    updateScoreDisplay();
    checkProgression();
    nextCardButton.classList.remove('invisible');
  }

  function updateScoreDisplay() {
    const streakNeeded = 13 + Math.floor(Math.sqrt(activeCharacters.length));
    scoreText.textContent = `Streak: ${streak} | Learning ${activeCharacters.length}/${characters.length} | ${streakNeeded} streak needed`;
  }

  function checkProgression() {
    if (activeCharacters.length >= characters.length) return;

    const streakNeeded = 15 + Math.floor(Math.sqrt(activeCharacters.length));
    if (streak >= streakNeeded) {
      const remainingChars = characters.split('').filter(c => !activeCharacters.includes(c));
      if (remainingChars.length > 0) {
        const newChar = remainingChars[0];
        activeCharacters.push(newChar);
        feedbackText.textContent = `Great job! Added '${newChar.toUpperCase()}' to your set.`;
        streak = 0;
        saveProgress();
      }
    }
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  toggleModeButton.addEventListener('click', () => {
    isCharToColorMode = !isCharToColorMode;
    toggleModeButton.textContent = isCharToColorMode ? 'Switch to Color-to-Char' : 'Switch to Char-to-Color';
    nextCard();
  });
}