{
    // Stroop Game-specific DOM elements
    const mainControls = document.getElementById('mainControls');
    const container = document.getElementById('stroopGameContainer');
    const startGameButton = document.getElementById('startStroopGameButton')
    const wordPrompt = document.getElementById('stroopGameWord');
    const noButton = document.getElementById('stroopNoButton');
    const yesButton = document.getElementById('stroopYesButton');
    const feedbackText = document.getElementById('stroopGameFeedback');
    const scoreText = document.getElementById('stroopGameScore');
    const exitGameButton = document.getElementById('stroopExitGameButton');

    // Stroop Game state
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let currentWord = '';
    let isMatching = true;
    let timer = null;
    let timeLeft = 30;

    startGameButton.addEventListener('click', () => {
        startGame();
    });

    function saveProgress() {
        // No persistent state to save for this game
    }

    function startGame() {
        correctAnswers = 0;
        incorrectAnswers = 0;
        timeLeft = 30;
        updateScoreDisplay();
        startTimer();
        nextWord();

        // Add keyboard event listeners
        document.addEventListener('keydown', handleKeyPress);
        // Ensure buttons are enabled
        noButton.disabled = false;
        yesButton.disabled = false;
        // Hide New Game button if it exists
        const newGameButton = document.getElementById('stroopNewGameButton');
        if (newGameButton) newGameButton.style.display = 'none';
    }

    function startTimer() {
        timer = setInterval(() => {
            timeLeft--;
            updateScoreDisplay();
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    function endGame() {
        clearInterval(timer);
        feedbackText.textContent = `Game Over! Final Score: ${correctAnswers - incorrectAnswers}`;
        noButton.disabled = true;
        yesButton.disabled = true;
        document.removeEventListener('keydown', handleKeyPress);

        // Create and show New Game button
        let newGameButton = document.getElementById('stroopNewGameButton');
        if (!newGameButton) {
            newGameButton = document.createElement('button');
            newGameButton.id = 'stroopNewGameButton';
            newGameButton.textContent = 'New Game';
            newGameButton.addEventListener('click', startGame);
            exitGameButton.parentNode.insertBefore(newGameButton, exitGameButton);
        }
        newGameButton.style.display = 'block';
    }

    exitGameButton.addEventListener('click', () => {
        clearInterval(timer);
        saveProgress();
        container.style.display = 'none';
        mainControls.style.display = 'block';
        isGameActive = false;
        updateTitleColors();
        document.removeEventListener('keydown', handleKeyPress);
    });

    noButton.addEventListener('click', () => checkAnswer(false));
    yesButton.addEventListener('click', () => checkAnswer(true));

    function handleKeyPress(event) {
        if (event.key === 'ArrowLeft') {
            checkAnswer(false);
        } else if (event.key === 'ArrowRight') {
            checkAnswer(true);
        }
    }

    function nextWord() {
        currentWord = selectNextWord();
        isMatching = Math.random() < 0.5; // 50% chance of matching colors
        applyWordColors();
        feedbackText.textContent = '';
        noButton.disabled = false;
        yesButton.disabled = false;
    }

    function selectNextWord() {
        return activeBlockGameWords[Math.floor(Math.random() * activeBlockGameWords.length)];
    }

    function applyWordColors() {
        wordPrompt.innerHTML = '';
        const allColors = Object.values(colorMap);
        currentWord.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            if (isMatching) {
                span.style.color = colorMap[char.toLowerCase()] || '#FFF';
            } else {
                let randomColor;
                do {
                    randomColor = allColors[Math.floor(Math.random() * allColors.length)];
                } while (randomColor === colorMap[char.toLowerCase()]);
                span.style.color = randomColor;
            }
            span.style.fontSize = '48px';
            wordPrompt.appendChild(span);
        });
        wordPrompt.classList.remove('hidden');
    }

    function showCorrectColors() {
        wordPrompt.innerHTML = '';
        currentWord.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.color = colorMap[char.toLowerCase()] || '#FFF';
            span.style.fontSize = '48px';
            wordPrompt.appendChild(span);
        });
    }

    function checkAnswer(userSaysMatching) {
        const isCorrect = (userSaysMatching === isMatching);
        if (isCorrect) {
            correctAnswers++;
            feedbackText.textContent = 'Correct!';
            feedbackText.style.color = '#00FF00';
            setTimeout(nextWord, 500); // Move to next word after short delay
        } else {
            incorrectAnswers++;
            feedbackText.textContent = 'Wrong!';
            feedbackText.style.color = '#FF3333';
            showCorrectColors();
            noButton.disabled = true;
            yesButton.disabled = true;
            setTimeout(nextWord, 1000); // Longer delay to show correction
        }
        updateScoreDisplay();
    }

    function updateScoreDisplay() {
        const score = correctAnswers - incorrectAnswers;
        scoreText.textContent = `Score: ${score} | Time: ${timeLeft}s`;
    }
}