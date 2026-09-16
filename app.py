from flask import Flask, render_template, request, jsonify
from game import (
    create_game,
    guess_letter,
    use_hint,
    get_game_state,
    get_categories,
    get_difficulties
)

app = Flask(__name__)

# Store the current game
current_game = None


@app.route("/")
def home():
    """Load the Hangman website."""
    return render_template("index.html")


@app.route("/api/categories")
def categories():
    """Return available categories."""
    return jsonify({
        "categories": get_categories()
    })


@app.route("/api/difficulties")
def difficulties():
    """Return available difficulty levels."""
    return jsonify({
        "difficulties": get_difficulties()
    })


@app.route("/api/start", methods=["POST"])
def start_game():
    """Start a new game."""

    global current_game

    data = request.get_json()

    category = data.get("category")
    difficulty = data.get("difficulty")

    if not category or not difficulty:
        return jsonify({
            "success": False,
            "message": "Category and difficulty are required."
        }), 400

    try:
        current_game = create_game(
            category,
            difficulty
        )

        return jsonify({
            "success": True,
            "game": get_game_state(current_game)
        })

    except ValueError as error:

        return jsonify({
            "success": False,
            "message": str(error)
        }), 400


@app.route("/api/guess", methods=["POST"])
def make_guess():
    """Process a player's letter guess."""

    global current_game

    if current_game is None:
        return jsonify({
            "success": False,
            "message": "Please start a game first."
        }), 400

    data = request.get_json()

    letter = data.get("letter", "")

    result = guess_letter(
        current_game,
        letter
    )

    return jsonify({
        **result,
        "game": get_game_state(current_game)
    })


@app.route("/api/hint", methods=["POST"])
def get_hint():
    """Use a hint."""

    global current_game

    if current_game is None:
        return jsonify({
            "success": False,
            "message": "Please start a game first."
        }), 400

    result = use_hint(current_game)

    return jsonify({
        **result,
        "game": get_game_state(current_game)
    })


@app.route("/api/game", methods=["GET"])
def game_state():
    """Return current game state."""

    if current_game is None:
        return jsonify({
            "success": False,
            "message": "No active game."
        })

    return jsonify({
        "success": True,
        "game": get_game_state(current_game)
    })


if __name__ == "__main__":
    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )