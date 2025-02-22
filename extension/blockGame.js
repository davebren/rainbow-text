
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
    let learnedWords = [];
    let wordStats = {};
    let wordStreak = 0;
    let currentWord = '';
    const blockWords = commonWords;

    chrome.storage.sync.get(['learnedWords', 'wordStats', 'wordStreak'], (data) => {
        learnedWords = data.learnedWords || [];
        wordStats = data.wordStats || {};
        wordStreak = data.wordStreak || 0;

        commonWords.forEach(word => {
            if (!wordStats[word]) wordStats[word] = { correct: 0, total: 0 };
        });
    });

    function saveProgress() {
        chrome.storage.sync.set({ learnedWords, wordStats, wordStreak });
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
        currentWord = selectNextWord();
        feedbackText.textContent = '';
        nextCardButton.classList.add('invisible');

        characterPrompt.innerHTML = '';
        currentWord.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = '\u25A0';
            span.style.color = colorMap[char.toLowerCase()] || '#FFF';
            span.style.fontSize = '48px';
            characterPrompt.appendChild(span);
        });
        characterPrompt.classList.remove('hidden');
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
        optionsContainer.innerHTML = '';
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
        updateWordScoreDisplay();
        nextCardButton.classList.remove('invisible');
    }

    function updateWordScoreDisplay() {
        const streakNeeded = 15 + Math.floor(Math.sqrt(learnedWords.length));
        scoreText.textContent = `Streak: ${wordStreak} | Learned ${learnedWords.length}/${blockWords.length} | ${streakNeeded} streak needed`;
    }

    function checkWordProgression() {
        if (learnedWords.length >= blockWords.length) return;

        const streakNeeded = 15 + Math.floor(Math.sqrt(learnedWords.length));
        if (wordStreak >= streakNeeded && !learnedWords.includes(currentWord)) {
            learnedWords.push(currentWord);
            feedbackText.textContent = `Great job! Learned "${currentWord}"!`;
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
}