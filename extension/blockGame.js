let activeBlockGameWords = [];

{
    // 1000 most common English words
    const wordsList = [
        "the", "of", "and", "to", "a", "in", "for", "is", "on", "that", "by", "this", "with", "i", "you", "it",
        "not", "or", "be", "are", "from", "at", "as", "your", "all", "have", "new", "more", "an", "was", "we",
        "will", "home", "can", "us", "about", "if", "page", "my", "has", "search", "free", "but", "our", "one",
        "other", "do", "no", "information", "time", "they", "site", "he", "up", "may", "what", "which",
        "their", "news", "out", "use", "any", "there", "see", "only", "so", "his", "when", "contact", "here",
        "business", "who", "web", "also", "now", "help", "get", "pm", "view", "online", "c", "e", "first",
        "am", "been", "would", "how", "were", "me", "s", "services", "some", "these", "click", "its", "like",
        "service", "x", "than", "find", "price", "date", "back", "top", "people", "had", "list", "name",
        "just", "over", "state", "year", "day", "into", "email", "two", "health", "n", "world", "re", "next",
        "used", "go", "b", "work", "last", "most", "products", "music", "buy", "data", "make", "them",
        "should", "product", "system", "post", "her", "city", "t", "add", "policy", "number", "such", "please",
        "available", "copyright", "support", "message", "after", "best", "software", "then", "jan", "good",
        "video", "well", "d", "where", "info", "rights", "public", "books", "high", "school", "through", "m",
        "each", "links", "she", "review", "years", "order", "very", "privacy", "book", "items", "company", "r",
        "read", "group", "need", "many", "user", "said", "de", "does", "set", "under", "general", "research",
        "university", "january", "mail", "full", "map", "reviews", "program", "life", "know", "games", "way",
        "days", "management", "p", "part", "could", "great", "united", "hotel", "real", "f", "item",
        "international", "center", "ebay", "must", "store", "travel", "comments", "made", "development",
        "report", "off", "member", "details", "line", "terms", "before", "hotels", "did", "send", "right",
        "type", "because", "local", "those", "using", "results", "office", "education", "national", "car",
        "design", "take", "posted", "internet", "address", "community", "within", "states", "area", "want",
        "phone", "dvd", "shipping", "reserved", "subject", "between", "forum", "family", "l", "long", "based",
        "w", "code", "show", "o", "even", "black", "check", "special", "prices", "website", "index", "being",
        "women", "much", "sign", "file", "link", "open", "today", "technology", "south", "case", "project",
        "same", "pages", "uk", "version", "section", "own", "found", "sports", "house", "related", "security",
        "both", "g", "county", "american", "photo", "game", "members", "power", "while", "care", "network",
        "down", "computer", "systems", "three", "total", "place", "end", "following", "download", "h", "him",
        "without", "per", "access", "think", "north", "resources", "current", "posts", "big", "media", "law",
        "control", "water", "history", "pictures", "size", "art", "personal", "since", "including", "guide",
        "shop", "directory", "board", "location", "change", "white", "text", "small", "rating", "rate",
        "government", "children", "during", "usa", "return", "students", "v", "shopping", "account", "times",
        "sites", "level", "digital", "profile", "previous", "form", "events", "love", "old", "john", "main",
        "call", "hours", "image", "department", "title", "description", "non", "k", "y", "insurance",
        "another", "why", "shall", "property", "class", "cd", "still", "money", "quality", "every", "listing",
        "content", "country", "private", "little", "visit", "save", "tools", "low", "reply", "customer",
        "december", "compare", "movies", "include", "college", "value", "article", "york", "man", "card",
        "jobs", "provide", "j", "food", "source", "author", "different", "press", "u", "learn", "sale",
        "around", "print", "course", "job", "canada", "process", "teen", "room", "stock", "training", "too",
        "credit", "point", "join", "science", "men", "categories", "advanced", "west", "sales", "look",
        "english", "left", "team", "estate", "box", "conditions", "select", "windows", "photos", "gay",
        "thread", "week", "category", "note", "live", "large", "gallery", "table", "register", "however",
        "june", "october", "november", "market", "library", "really", "action", "start", "series", "model",
        "features", "air", "industry", "plan", "human", "provided", "tv", "yes", "required", "second", "hot",
        "accessories", "cost", "movie", "forums", "march", "la", "september", "better", "say", "questions",
        "july", "yahoo", "going", "medical", "test", "friend", "come", "dec", "server", "pc", "study",
        "application", "cart", "staff", "articles", "san", "feedback", "again", "play", "looking", "issues",
        "april", "never", "users", "complete", "street", "topic", "comment", "financial", "things", "working",
        "against", "standard", "tax", "person", "below", "mobile", "less", "got", "blog", "party", "payment",
        "equipment", "login", "student", "let", "programs", "offers", "legal", "above", "recent", "park",
        "stores", "side", "act", "problem", "red", "give", "memory", "performance", "social", "q", "august",
        "quote", "language", "story", "sell", "options", "experience", "rates", "create", "key", "body",
        "young", "america", "important", "field", "few", "east", "paper", "single", "ii", "age", "activities",
        "club", "example", "girls", "additional", "password", "z", "latest", "something", "road", "gift",
        "question", "changes", "night", "ca", "hard", "texas", "oct", "pay", "four", "poker", "status",
        "browse", "issue", "range", "building", "seller", "court", "february", "always", "result", "audio",
        "light", "write", "war", "nov", "offer", "blue", "groups", "al", "easy", "given", "files", "event",
        "release", "analysis", "request", "fax", "china", "making", "picture", "needs", "possible", "might",
        "professional", "yet", "month", "major", "star", "areas", "future", "space", "committee", "hand",
        "sun", "cards", "problems", "london", "washington", "meeting", "rss", "become", "interest", "id",
        "child", "keep", "enter", "california", "share", "similar", "garden", "schools", "million", "added",
        "reference", "companies", "listed", "baby", "learning", "energy", "run", "delivery", "net", "popular",
        "term", "film", "stories", "put", "computers", "journal", "reports", "co", "try", "welcome", "central",
        "images", "president", "notice", "original", "head", "radio", "until", "cell", "color", "self",
        "council", "away", "includes", "track", "australia", "discussion", "archive", "once", "others",
        "entertainment", "agreement", "format", "least", "society", "months", "log", "safety", "friends",
        "sure", "faq", "trade", "edition", "cars", "messages", "marketing", "tell", "further", "updated",
        "association", "able", "having", "provides", "david", "fun", "already", "green", "studies", "close",
        "common", "drive", "specific", "several", "gold", "feb", "living", "sep", "collection", "called",
        "short", "arts", "lot", "ask", "display", "limited", "powered", "solutions", "means", "director",
        "daily", "beach", "past", "natural", "whether", "due", "et", "electronics", "five", "upon", "period",
        "planning", "database", "says", "official", "weather", "mar", "land", "average", "done", "technical",
        "window", "france", "pro", "region", "island", "record", "direct", "microsoft", "conference",
        "environment", "records", "st", "district", "calendar", "costs", "style", "url", "front", "statement",
        "update", "parts", "aug", "ever", "downloads", "early", "miles", "sound", "resource", "present",
        "applications", "either", "ago", "document", "word", "works", "material", "bill", "apr", "written",
        "talk", "federal", "hosting", "rules", "final", "adult", "tickets", "thing", "centre", "requirements",
        "via", "cheap", "kids", "finance", "true", "minutes", "else", "mark", "third", "rock", "gifts",
        "europe", "reading", "topics", "bad", "individual", "tips", "plus", "auto", "cover", "usually", "edit",
        "together", "videos", "percent", "fast", "function", "fact", "unit", "getting", "global", "tech",
        "meet", "far", "economic", "en", "player", "projects", "lyrics", "often", "subscribe", "submit",
        "germany", "amount", "watch", "included", "feel", "though", "bank", "risk", "thanks", "everything",
        "deals", "various", "words", "linux", "jul", "production", "commercial", "james", "weight", "town",
        "heart", "advertising", "received", "choose", "treatment", "newsletter", "archives", "points",
        "knowledge", "magazine", "error", "camera", "jun", "girl", "currently", "construction", "toys",
        "registered", "clear", "golf", "receive", "domain", "methods", "chapter", "makes", "protection",
        "policies", "loan", "wide", "beauty", "manager", "india", "position", "taken", "sort", "listings",
        "models", "michael", "known", "half", "cases", "step", "engineering", "florida", "simple", "quick",
        "none", "wireless", "license", "paul", "friday", "lake", "whole", "annual", "published", "later",
        "basic", "sony", "shows", "corporate", "google", "church", "method", "purchase", "customers", "active",
        "response", "practice", "hardware", "figure", "materials", "fire", "holiday", "chat", "enough",
        "designed", "along", "among", "death", "writing", "speed", "html", "countries", "loss", "face",
        "brand", "discount", "higher", "effects", "created", "remember", "standards", "oil", "bit", "yellow",
        "political", "increase", "advertise", "kingdom", "base", "near", "environmental", "thought", "stuff",
        "french", "storage", "oh", "japan", "doing", "loans", "shoes", "entry", "stay", "nature", "orders",
        "availability"
    ];

    // Organize words by length
    const wordsByLength = {};
    wordsList.forEach(word => {
        const len = word.length;
        if (!wordsByLength[len]) wordsByLength[len] = [];
        wordsByLength[len].push(word);
    });

    // Block Game-specific DOM elements
    const mainControls = document.getElementById('mainControls');
    const startGameButton = document.getElementById('startBlockGameButton');
    const container = document.getElementById('blockGameContainer');
    const characterPrompt = document.getElementById('blockGameCharacter');
    const optionsContainer = document.getElementById('blockGameOptions');
    const feedbackText = document.getElementById('blockGameFeedback');
    const scoreText = document.getElementById('blockGameScore');
    const nextCardButton = document.getElementById('blockNextCardButton');
    const exitGameButton = document.getElementById('blockExitGameButton');

    // New elements for typing mode
    const toggleModeButton = document.createElement('button');
    toggleModeButton.id = 'blockToggleModeButton';
    toggleModeButton.textContent = 'Switch to Typing Mode';

    const inputContainer = document.createElement('div');
    inputContainer.id = 'blockInputContainer';
    inputContainer.style.marginTop = '10px';

    const wordInput = document.createElement('input');
    wordInput.id = 'blockWordInput';
    wordInput.type = 'text';
    wordInput.placeholder = 'Type the word here...';
    wordInput.style.padding = '8px';
    wordInput.style.width = '100%';
    wordInput.style.boxSizing = 'border-box';
    wordInput.style.marginBottom = '10px';

    const submitButton = document.createElement('button');
    submitButton.id = 'blockSubmitButton';
    submitButton.textContent = 'Submit';
    submitButton.style.width = '100%';

    inputContainer.appendChild(wordInput);
    inputContainer.appendChild(submitButton);

    // Add elements to the controls
    document.getElementById('blockGameControls').insertBefore(
        toggleModeButton,
        document.getElementById('blockExitGameButton')
    );
    container.insertBefore(inputContainer, feedbackText);
    inputContainer.style.display = 'none';

    const streakNeeded = 10;

    // Block Game state
    let wordStreak = 0;
    let currentWord = '';
    const blockWords = wordsList;
    let isTypingMode = false;

    chrome.storage.sync.get(['activeBlockGameWords', 'wordStreak'], (data) => {
        activeBlockGameWords = data.activeBlockGameWords || wordsList.slice(0, 5); // Use consistent key
        wordStreak = data.wordStreak || 0;

        startGameButton.addEventListener('click', () => {
            nextCard();
            updateScoreDisplay();
        });
    });

    function saveProgress() {
        chrome.storage.sync.set({ activeBlockGameWords, wordStreak }, (result) => {
            if (chrome.runtime.lastError) {
                console.error('Storage save failed:', chrome.runtime.lastError);
            } else {
                console.log('Progress saved successfully');
            }
        });
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
        wordInput.value = ''; // Clear input field

        characterPrompt.innerHTML = '';
        currentWord.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = '\u25A0'; // Unicode block character
            span.style.color = colorMap[char.toLowerCase()] || '#FFF';
            span.style.fontSize = '48px';
            characterPrompt.appendChild(span);
        });
        characterPrompt.classList.remove('hidden');

        if (isTypingMode) {
            optionsContainer.style.display = 'none';
            inputContainer.style.display = 'block';
            wordInput.focus();
        } else {
            optionsContainer.style.display = 'block';
            inputContainer.style.display = 'none';
            generateWordOptions();
        }
    }

    function selectNextWord() {
        if (activeBlockGameWords.length === wordsList.length) {
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
        const isCorrect = selected === correct;

        if (isCorrect) {
            wordStreak++;
            feedbackText.textContent = 'Correct!';
            feedbackText.style.color = '#00FF00';
            checkWordProgression();
        } else {
            wordStreak = 0;
            feedbackText.textContent = `Wrong! The correct word is "${correct}".`;
            feedbackText.style.color = '#FF3333';
        }

        if (!isTypingMode) {
            Array.from(optionsContainer.children).forEach(button => button.disabled = true);
        } else {
            wordInput.disabled = true;
            submitButton.disabled = true;
        }

        saveProgress();
        updateScoreDisplay();
        nextCardButton.classList.remove('invisible');
    }

    function updateScoreDisplay() {
        scoreText.textContent = `Streak: ${wordStreak} | Learning ${activeBlockGameWords.length}/${blockWords.length} | ${streakNeeded} streak needed`;
    }

    function checkWordProgression() {
        if (activeBlockGameWords.length >= blockWords.length) return;

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

    // Toggle button event listener
    toggleModeButton.addEventListener('click', () => {
        isTypingMode = !isTypingMode;
        toggleModeButton.textContent = isTypingMode ? 'Switch to Multiple Choice' : 'Switch to Typing Mode';
        nextCard();
    });

    // Submit button event listener
    submitButton.addEventListener('click', () => {
        const userInput = wordInput.value.trim().toLowerCase();
        checkWordAnswer(userInput, currentWord);
    });

    // Enter key for submission
    wordInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const userInput = wordInput.value.trim().toLowerCase();
            checkWordAnswer(userInput, currentWord);
        }
    });
}