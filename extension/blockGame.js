

let activeBlockGameWords = [];

{
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

    // Organize words by length
    const wordsByLength = {};
    commonWords.forEach(word => {
        const len = word.length;
        if (!wordsByLength[len]) wordsByLength[len] = [];
        wordsByLength[len].push(word);
    });

    // Block Game-specific DOM elements
    const mainControls = document.getElementById('mainControls');
    const startGameButton = document.getElementById('startBlockGameButton')
    const container = document.getElementById('blockGameContainer');
    const characterPrompt = document.getElementById('blockGameCharacter');
    const optionsContainer = document.getElementById('blockGameOptions');
    const feedbackText = document.getElementById('blockGameFeedback');
    const scoreText = document.getElementById('blockGameScore');
    const nextCardButton = document.getElementById('blockNextCardButton');
    const exitGameButton = document.getElementById('blockExitGameButton');

    // Block Game state
    let wordStats = {};
    let wordStreak = 0;
    let currentWord = '';
    const blockWords = commonWords;

    chrome.storage.sync.get(['activeWords', 'wordStats', 'wordStreak'], (data) => {
        activeBlockGameWords = data.activeWords || commonWords.slice(0, 5); // Start with first 5 words
        wordStats = data.wordStats || {};
        wordStreak = data.wordStreak || 0;

        commonWords.forEach(word => {
            if (!wordStats[word]) wordStats[word] = { correct: 0, total: 0 };
        });
    });

    startGameButton.addEventListener('click', () => {
        nextCard();
        updateScoreDisplay();
    });

    function saveProgress() {
        chrome.storage.sync.set({ activeBlockGameWords, wordStats, wordStreak });
    }

    exitGameButton.addEventListener('click', () => {
        saveProgress();
        container.style.display = 'none';
        mainControls.style.display = 'block';
        isGameActive = false;
        updateTitleColors();
    });

    nextCardButton.addEventListener('click', nextCard);

    function nextCard() {
        currentWord = selectNextWord();
        feedbackText.textContent = '';
        nextCardButton.classList.add('invisible');

        characterPrompt.innerHTML = '';
        currentWord.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = '\u25A0'; // Unicode block character
            span.style.color = colorMap[char.toLowerCase()] || '#FFF';
            span.style.fontSize = '48px';
            characterPrompt.appendChild(span);
        });
        characterPrompt.classList.remove('hidden');
        generateWordOptions();
    }

    function selectNextWord() {
        if (activeBlockGameWords.length === commonWords.length) {
            return activeBlockGameWords[Math.floor(Math.random() * activeBlockGameWords.length)];
        }

        // Bias towards recently unlocked words
        let word = currentWord;
        while (word === currentWord) {
            if (Math.random() < 0.35 && activeBlockGameWords.length > 3) {
                const lastUnlockedWords = activeBlockGameWords.slice(-3);
                word = lastUnlockedWords[Math.floor(Math.random() * lastUnlockedWords.length)];
            } else {
                const restOfWords = activeBlockGameWords.slice(0, Math.max(activeBlockGameWords.length - 3, 0));
                word = restOfWords[Math.floor(Math.random() * restOfWords.length)] || activeBlockGameWords[0];
            }
        }
        return word;
    }

    function generateWordOptions() {
        optionsContainer.innerHTML = '';
        const correctWord = currentWord;
        const wordLength = correctWord.length;

        // Get active words of the same length
        const sameLengthActive = (wordsByLength[wordLength] || []).filter(word => activeBlockGameWords.includes(word));
        let options = [correctWord];

        // Try to fill options with same-length active words
        while (options.length < 4 && sameLengthActive.length > options.length) {
            const randomWord = sameLengthActive[Math.floor(Math.random() * sameLengthActive.length)];
            if (!options.includes(randomWord)) {
                options.push(randomWord);
            }
        }

        // If not enough same-length options, fill with other active words
        if (options.length < 4) {
            const otherLengthActive = activeBlockGameWords.filter(word => word !== correctWord && word.length !== wordLength);
            while (options.length < 4 && otherLengthActive.length > 0) {
                const randomWord = otherLengthActive[Math.floor(Math.random() * otherLengthActive.length)];
                if (!options.includes(randomWord)) {
                    options.push(randomWord);
                } else {
                    otherLengthActive.splice(otherLengthActive.indexOf(randomWord), 1); // Remove to avoid infinite loop
                }
            }
        }

        // Fallback to blockWords if still not enough options (rare case)
        while (options.length < 4) {
            const randomWord = blockWords[Math.floor(Math.random() * blockWords.length)];
            if (!options.includes(randomWord)) {
                options.push(randomWord);
            }
        }

        shuffle(options);
        options.forEach(word => {
            const button = document.createElement('button');
            button.textContent = word;
            button.addEventListener('click', () => checkWordAnswer(word, correctWord));
            optionsContainer.appendChild(button);
        });
    }

    function checkWordAnswer(selected, correct) {
        wordStats[correct].total++;
        const isCorrect = selected === correct;

        if (isCorrect) {
            wordStreak++;
            wordStats[correct].correct++;
            feedbackText.textContent = 'Correct!';
            feedbackText.style.color = '#00FF00';
            checkWordProgression();
        } else {
            wordStreak = 0;
            feedbackText.textContent = `Wrong! The correct word is "${correct}".`;
            feedbackText.style.color = '#FF3333';
        }

        Array.from(optionsContainer.children).forEach(button => button.disabled = true);
        saveProgress();
        updateScoreDisplay();
        nextCardButton.classList.remove('invisible');
    }

    function updateScoreDisplay() {
        const streakNeeded = 13 + Math.floor(Math.sqrt(activeBlockGameWords.length));
        scoreText.textContent = `Streak: ${wordStreak} | Learning ${activeBlockGameWords.length}/${blockWords.length} | ${streakNeeded} streak needed`;
    }

    function checkWordProgression() {
        if (activeBlockGameWords.length >= blockWords.length) return;

        const streakNeeded = 10
        if (wordStreak >= streakNeeded) {
            const remainingWords = blockWords.filter(word => !activeBlockGameWords.includes(word));
            if (remainingWords.length > 0) {
                const newWord = remainingWords[0];
                activeBlockGameWords.push(newWord);
                feedbackText.textContent = `Great job! Added "${newWord}" to your set!`;
                wordStreak = 0;
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
}