import random
import time
from words import WORDS


MAX_ATTEMPTS = 6
MAX_HINTS = 2


HANGMAN_STAGES = [
    """
     +---+
     |   |
         |
         |
         |
         |
    =========
    """,
    """
     +---+
     |   |
     O   |
         |
         |
         |
    =========
    """,
    """
     +---+
     |   |
     O   |
     |   |
         |
         |
    =========
    """,
    """
     +---+
     |   |
     O   |
    /|   |
         |
         |
    =========
    """,
    """
     +---+
     |   |
     O   |
    /|\\  |
         |
         |
    =========
    """,
    """
     +---+
     |   |
     O   |
    /|\\  |
    /    |
         |
    =========
    """,
    """
     +---+
     |   |
     O   |
    /|\\  |
    / \\  |
         |
    =========
    """
]


DIFFICULTY_POINTS = {
    "easy": 10,
    "medium": 20,
    "hard": 30
}


def get_categories():
    """Return all available categories."""
    return list(WORDS.keys())


def get_difficulties():
    """Return all available difficulty levels."""
    return list(DIFFICULTY_POINTS.keys())


def select_random_word(category, difficulty):
    """Select a random word from the selected category and difficulty."""

    if category not in WORDS:
        raise ValueError("Invalid category.")

    if difficulty not in WORDS[category]:
        raise ValueError("Invalid difficulty.")

    word_data = WORDS[category][difficulty]

    word = random.choice(list(word_data.keys()))
    hint = word_data[word]

    return word.lower(), hint


def create_game(category, difficulty):
    """Create a new Hangman game."""

    word, hint = select_random_word(category, difficulty)

    return {
        "word": word,
        "hint": hint,
        "category": category,
        "difficulty": difficulty,
        "guessed_letters": [],
        "wrong_letters": [],
        "wrong_attempts": 0,
        "hints_used": 0,
        "score": 0,
        "started_at": time.time(),
        "status": "playing"
    }


def display_word(game):
    """Return the current hidden/visible word."""

    word = game["word"]
    guessed_letters = game["guessed_letters"]

    result = []

    for letter in word:

        if letter in guessed_letters:
            result.append(letter.upper())
        else:
            result.append("_")

    return " ".join(result)


def guess_letter(game, letter):
    """Process a player's letter guess."""

    letter = letter.lower().strip()

    if len(letter) != 1 or not letter.isalpha():
        return {
            "success": False,
            "message": "Please enter a single alphabet letter."
        }

    if game["status"] != "playing":
        return {
            "success": False,
            "message": "This game is already finished."
        }

    if letter in game["guessed_letters"]:
        return {
            "success": False,
            "message": "You already guessed this letter."
        }

    if letter in game["wrong_letters"]:
        return {
            "success": False,
            "message": "You already guessed this letter."
        }

    game["guessed_letters"].append(letter)

    if letter in game["word"]:

        check_win(game)

        return {
            "success": True,
            "correct": True,
            "message": f"Great! '{letter.upper()}' is in the word."
        }

    game["wrong_letters"].append(letter)
    game["wrong_attempts"] += 1

    if game["wrong_attempts"] >= MAX_ATTEMPTS:
        game["status"] = "lost"

    return {
        "success": True,
        "correct": False,
        "message": f"'{letter.upper()}' is not in the word."
    }


def check_win(game):
    """Check whether the player has guessed the complete word."""

    word_letters = set(game["word"])
    guessed_letters = set(game["guessed_letters"])

    if word_letters.issubset(guessed_letters):

        game["status"] = "won"

        calculate_score(game)


def use_hint(game):
    """Provide a hint and reveal one hidden letter."""

    if game["status"] != "playing":
        return {
            "success": False,
            "message": "The game is already finished."
        }

    if game["hints_used"] >= MAX_HINTS:
        return {
            "success": False,
            "message": "You have used all available hints."
        }

    hidden_letters = [
        letter
        for letter in set(game["word"])
        if letter not in game["guessed_letters"]
    ]

    if not hidden_letters:
        return {
            "success": False,
            "message": "No hidden letters remaining."
        }

    letter = random.choice(hidden_letters)

    game["guessed_letters"].append(letter)
    game["hints_used"] += 1

    check_win(game)

    return {
        "success": True,
        "letter": letter.upper(),
        "hint": game["hint"],
        "message": f"Hint revealed the letter '{letter.upper()}'."
    }


def calculate_score(game):
    """Calculate final score."""

    if game["status"] != "won":
        game["score"] = 0
        return 0

    difficulty_score = (
        DIFFICULTY_POINTS[game["difficulty"]]
        * len(game["word"])
    )

    wrong_penalty = game["wrong_attempts"] * 5

    hint_penalty = game["hints_used"] * 10

    elapsed_time = time.time() - game["started_at"]

    time_bonus = max(
        0,
        50 - int(elapsed_time)
    )

    game["score"] = max(
        0,
        difficulty_score
        - wrong_penalty
        - hint_penalty
        + time_bonus
    )

    return game["score"]


def get_game_state(game):
    """Return game information for the frontend."""

    elapsed_time = time.time() - game["started_at"]

    return {
        "word": display_word(game),
        "category": game["category"],
        "difficulty": game["difficulty"],
        "guessed_letters": sorted(game["guessed_letters"]),
        "wrong_letters": sorted(game["wrong_letters"]),
        "wrong_attempts": game["wrong_attempts"],
        "remaining_attempts": (
            MAX_ATTEMPTS - game["wrong_attempts"]
        ),
        "hints_remaining": (
            MAX_HINTS - game["hints_used"]
        ),
        "score": game["score"],
        "time": round(elapsed_time, 1),
        "status": game["status"],
        "hangman_stage": game["wrong_attempts"]
    }