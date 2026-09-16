// =========================================
// HANGMAN GAME - FRONTEND JAVASCRIPT
// =========================================


// =========================================
// GAME STATE
// =========================================

let selectedCategory = "Programming";
let selectedDifficulty = "easy";

let gameState = null;

let timerInterval = null;


// =========================================
// DOM ELEMENTS
// =========================================

const setupScreen =
    document.getElementById("setup-screen");

const gameScreen =
    document.getElementById("game-screen");

const categoryOptions =
    document.querySelectorAll(".option-card");

const difficultyOptions =
    document.querySelectorAll(".difficulty-card");

const startGameBtn =
    document.getElementById("start-game-btn");

const backBtn =
    document.getElementById("back-btn");

const newGameBtn =
    document.getElementById("new-game-btn");

const playAgainBtn =
    document.getElementById("play-again-btn");

const closeModalBtn =
    document.getElementById("close-modal-btn");

const hintBtn =
    document.getElementById("hint-btn");

const keyboard =
    document.getElementById("keyboard");

const wordDisplay =
    document.getElementById("word-display");

const wrongLetters =
    document.getElementById("wrong-letters");

const scoreValue =
    document.getElementById("score-value");

const streakValue =
    document.getElementById("streak-value");

const timerValue =
    document.getElementById("timer-value");

const hintValue =
    document.getElementById("hint-value");

const gameCategory =
    document.getElementById("game-category");

const gameDifficulty =
    document.getElementById("game-difficulty");

const attemptsBadge =
    document.getElementById("attempts-badge");

const message =
    document.getElementById("message");

const hintMessage =
    document.getElementById("hint-message");

const resultModal =
    document.getElementById("result-modal");

const resultIcon =
    document.getElementById("result-icon");

const resultLabel =
    document.getElementById("result-label");

const resultTitle =
    document.getElementById("result-title");

const resultMessage =
    document.getElementById("result-message");

const finalScore =
    document.getElementById("final-score");

const finalTime =
    document.getElementById("final-time");

const finalAttempts =
    document.getElementById("final-attempts");


// =========================================
// STREAK
// =========================================

let currentStreak =
    Number(localStorage.getItem("hangmanStreak")) || 0;

streakValue.textContent = currentStreak;


// =========================================
// CATEGORY SELECTION
// =========================================

categoryOptions.forEach(card => {

    card.addEventListener("click", () => {

        categoryOptions.forEach(item => {
            item.classList.remove("active");
        });

        card.classList.add("active");

        selectedCategory =
            card.dataset.category;
    });

});


// =========================================
// DIFFICULTY SELECTION
// =========================================

difficultyOptions.forEach(card => {

    card.addEventListener("click", () => {

        difficultyOptions.forEach(item => {
            item.classList.remove("active");
        });

        card.classList.add("active");

        selectedDifficulty =
            card.dataset.difficulty;
    });

});


// =========================================
// START GAME
// =========================================

startGameBtn.addEventListener(
    "click",
    startGame
);


async function startGame() {

    try {

        startGameBtn.disabled = true;

        startGameBtn.querySelector("span").textContent =
            "Starting...";


        const response = await fetch(
            "/api/start",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    category:
                        selectedCategory,

                    difficulty:
                        selectedDifficulty
                })
            }
        );


        const data =
            await response.json();


        if (!data.success) {

            showMessage(
                data.message,
                "error"
            );

            return;
        }


        gameState = data.game;


        setupScreen.classList.add("hidden");

        gameScreen.classList.remove("hidden");


        resetTimer();

        updateGameUI();

        enableKeyboard();


        showMessage(
            "Game started! Good luck! 🎯",
            "success"
        );

    }

    catch (error) {

        console.error(error);

        showMessage(
            "Unable to start the game. Please try again.",
            "error"
        );

    }

    finally {

        startGameBtn.disabled = false;

        startGameBtn.querySelector("span").textContent =
            "Start Game";
    }
}


// =========================================
// GUESS LETTER
// =========================================

async function guessLetter(letter) {

    if (!gameState) {
        return;
    }


    if (gameState.status !== "playing") {
        return;
    }


    try {

        const response = await fetch(
            "/api/guess",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    letter: letter
                })
            }
        );


        const data =
            await response.json();


        if (data.game) {

            gameState = data.game;

            updateGameUI();
        }


        if (data.success) {

            if (data.correct) {

                showMessage(
                    data.message,
                    "success"
                );

            } else {

                showMessage(
                    data.message,
                    "error"
                );
            }

        } else {

            showMessage(
                data.message,
                "error"
            );
        }


        if (
            gameState.status === "won" ||
            gameState.status === "lost"
        ) {

            finishGame();
        }

    }

    catch (error) {

        console.error(error);

        showMessage(
            "Something went wrong. Please try again.",
            "error"
        );
    }
}


// =========================================
// KEYBOARD CLICK
// =========================================

keyboard.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest("button");

        if (!button) {
            return;
        }

        if (button.disabled) {
            return;
        }


        const letter =
            button.dataset.letter;


        if (letter) {

            guessLetter(letter);
        }
    }
);


// =========================================
// PHYSICAL KEYBOARD
// =========================================

document.addEventListener(
    "keydown",
    event => {

        if (!gameState) {
            return;
        }


        if (gameState.status !== "playing") {
            return;
        }


        const letter =
            event.key.toLowerCase();


        if (
            letter.length === 1 &&
            /^[a-z]$/.test(letter)
        ) {

            const button =
                document.querySelector(
                    `[data-letter="${letter}"]`
                );


            if (
                button &&
                !button.disabled
            ) {

                guessLetter(letter);
            }
        }
    }
);


// =========================================
// HINT
// =========================================

hintBtn.addEventListener(
    "click",
    useHint
);


async function useHint() {

    if (!gameState) {
        return;
    }


    if (gameState.status !== "playing") {
        return;
    }


    try {

        hintBtn.disabled = true;


        const response = await fetch(
            "/api/hint",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );


        const data =
            await response.json();


        if (data.game) {

            gameState = data.game;

            updateGameUI();
        }


        if (data.success) {

            hintMessage.textContent =
                `${data.message} ${data.hint}`;

            showMessage(
                data.message,
                "success"
            );

        } else {

            hintMessage.textContent =
                data.message;

            showMessage(
                data.message,
                "error"
            );
        }


        if (
            gameState.status === "won"
        ) {

            finishGame();
        }

    }

    catch (error) {

        console.error(error);

        showMessage(
            "Unable to use hint.",
            "error"
        );

    }

    finally {

        if (
            gameState &&
            gameState.status === "playing" &&
            gameState.hints_remaining > 0
        ) {

            hintBtn.disabled = false;
        }
    }
}


// =========================================
// UPDATE GAME UI
// =========================================

function updateGameUI() {

    if (!gameState) {
        return;
    }


    // Word

    wordDisplay.textContent =
        gameState.word;


    // Category

    gameCategory.textContent =
        gameState.category;


    // Difficulty

    gameDifficulty.textContent =
        capitalize(
            gameState.difficulty
        );


    // Score

    scoreValue.textContent =
        gameState.score;


    // Timer

    timerValue.textContent =
        `${gameState.time}s`;


    // Hints

    hintValue.textContent =
        gameState.hints_remaining;


    // Attempts

    attemptsBadge.textContent =
        `${gameState.remaining_attempts} Attempts`;


    // Wrong letters

    updateWrongLetters();


    // Keyboard

    updateKeyboard();


    // Hangman

    updateHangman();


    // Attempts bar

    updateAttemptsBar();


    // Hint button

    hintBtn.disabled =
        gameState.hints_remaining <= 0 ||
        gameState.status !== "playing";
}


// =========================================
// WRONG LETTERS
// =========================================

function updateWrongLetters() {

    wrongLetters.innerHTML = "";


    if (
        gameState.wrong_letters.length === 0
    ) {

        wrongLetters.innerHTML =
            `<span class="empty-state">
                None yet
            </span>`;

        return;
    }


    gameState.wrong_letters.forEach(
        letter => {

            const element =
                document.createElement("span");

            element.className =
                "wrong-letter";

            element.textContent =
                letter.toUpperCase();

            wrongLetters.appendChild(
                element
            );
        }
    );
}


// =========================================
// KEYBOARD STATE
// =========================================

function updateKeyboard() {

    const guessed =
        gameState.guessed_letters;


    document
        .querySelectorAll("#keyboard button")
        .forEach(button => {

            const letter =
                button.dataset.letter;


            if (guessed.includes(letter)) {

                button.disabled = true;


                if (
                    gameState.word
                        .toLowerCase()
                        .includes(letter)
                ) {

                    button.classList.add(
                        "correct"
                    );

                } else {

                    button.classList.add(
                        "wrong"
                    );
                }
            }
        });
}


// =========================================
// ENABLE KEYBOARD
// =========================================

function enableKeyboard() {

    document
        .querySelectorAll("#keyboard button")
        .forEach(button => {

            button.disabled = false;

            button.classList.remove(
                "correct",
                "wrong"
            );
        });
}


// =========================================
// HANGMAN DRAWING
// =========================================

function updateHangman() {

    const parts = [
        "head",
        "body",
        "left-arm",
        "right-arm",
        "left-leg",
        "right-leg"
    ];


    parts.forEach(
        (part, index) => {

            const element =
                document.getElementById(part);


            if (!element) {
                return;
            }


            if (
                gameState.hangman_stage >
                index
            ) {

                element.classList.add(
                    "visible"
                );

            } else {

                element.classList.remove(
                    "visible"
                );
            }
        }
    );
}


// =========================================
// ATTEMPTS BAR
// =========================================

function updateAttemptsBar() {

    const attempts =
        document.querySelectorAll(
            ".attempt"
        );


    attempts.forEach(
        (attempt, index) => {

            if (
                index <
                gameState.wrong_attempts
            ) {

                attempt.classList.add(
                    "used"
                );

            } else {

                attempt.classList.remove(
                    "used"
                );
            }
        }
    );
}


// =========================================
// TIMER
// =========================================

function resetTimer() {

    clearInterval(timerInterval);


    timerInterval =
        setInterval(() => {

            if (
                !gameState ||
                gameState.status !== "playing"
            ) {

                return;
            }


            gameState.time += 0.1;


            gameState.time =
                Math.round(
                    gameState.time * 10
                ) / 10;


            timerValue.textContent =
                `${gameState.time.toFixed(1)}s`;

        }, 100);
}


// =========================================
// STOP TIMER
// =========================================

function stopTimer() {

    clearInterval(timerInterval);

    timerInterval = null;
}


// =========================================
// FINISH GAME
// =========================================

function finishGame() {

    stopTimer();


    disableKeyboard();


    if (gameState.status === "won") {

        currentStreak++;

        localStorage.setItem(
            "hangmanStreak",
            currentStreak
        );

        streakValue.textContent =
            currentStreak;

        showWinModal();

    } else {

        currentStreak = 0;

        localStorage.setItem(
            "hangmanStreak",
            currentStreak
        );

        streakValue.textContent =
            currentStreak;

        showLossModal();
    }
}


// =========================================
// DISABLE KEYBOARD
// =========================================

function disableKeyboard() {

    document
        .querySelectorAll("#keyboard button")
        .forEach(button => {

            button.disabled = true;
        });
}


// =========================================
// WIN MODAL
// =========================================

function showWinModal() {

    resultIcon.textContent = "🎉";

    resultLabel.textContent =
        "CHALLENGE COMPLETE";

    resultTitle.textContent =
        "You Won!";

    resultMessage.textContent =
        `Excellent! You guessed the word correctly.`;

    finalScore.textContent =
        gameState.score;

    finalTime.textContent =
        `${gameState.time}s`;

    finalAttempts.textContent =
        gameState.wrong_attempts;


    resultModal.classList.remove(
        "hidden"
    );
}


// =========================================
// LOSS MODAL
// =========================================

function showLossModal() {

    resultIcon.textContent = "💀";

    resultLabel.textContent =
        "GAME OVER";

    resultTitle.textContent =
        "Better Luck Next Time!";

    resultMessage.textContent =
        `The word was "${gameState.word.replaceAll("_", "")}".`;

    finalScore.textContent =
        gameState.score;

    finalTime.textContent =
        `${gameState.time}s`;

    finalAttempts.textContent =
        gameState.wrong_attempts;


    resultModal.classList.remove(
        "hidden"
    );
}


// =========================================
// PLAY AGAIN
// =========================================

playAgainBtn.addEventListener(
    "click",
    () => {

        closeModal();

        startGame();
    }
);


// =========================================
// NEW GAME
// =========================================

newGameBtn.addEventListener(
    "click",
    () => {

        stopTimer();

        gameState = null;

        gameScreen.classList.add(
            "hidden"
        );

        setupScreen.classList.remove(
            "hidden"
        );

        resetUI();

    }
);


// =========================================
// BACK BUTTON
// =========================================

backBtn.addEventListener(
    "click",
    () => {

        stopTimer();

        gameState = null;

        gameScreen.classList.add(
            "hidden"
        );

        setupScreen.classList.remove(
            "hidden"
        );

        resetUI();
    }
);


// =========================================
// CLOSE MODAL
// =========================================

closeModalBtn.addEventListener(
    "click",
    () => {

        closeModal();

        stopTimer();

        gameState = null;

        gameScreen.classList.add(
            "hidden"
        );

        setupScreen.classList.remove(
            "hidden"
        );

        resetUI();
    }
);


function closeModal() {

    resultModal.classList.add(
        "hidden"
    );
}


// =========================================
// RESET UI
// =========================================

function resetUI() {

    wordDisplay.textContent =
        "_ _ _ _ _";

    scoreValue.textContent =
        "0";

    timerValue.textContent =
        "0.0s";

    hintValue.textContent =
        "2";

    attemptsBadge.textContent =
        "6 Attempts";

    wrongLetters.innerHTML =
        `<span class="empty-state">
            None yet
        </span>`;

    hintMessage.textContent =
        "Hint will reveal one letter.";

    message.textContent = "";

    document
        .querySelectorAll(".attempt")
        .forEach(attempt => {

            attempt.classList.remove(
                "used"
            );
        });


    document
        .querySelectorAll(".hangman-part")
        .forEach(part => {

            part.classList.remove(
                "visible"
            );
        });


    enableKeyboard();
}


// =========================================
// MESSAGE
// =========================================

function showMessage(
    text,
    type = ""
) {

    message.textContent = text;

    message.className =
        "game-message";

    if (type) {

        message.classList.add(type);
    }
}


// =========================================
// CAPITALIZE
// =========================================

function capitalize(text) {

    if (!text) {
        return "";
    }

    return text.charAt(0).toUpperCase()
        + text.slice(1);
}