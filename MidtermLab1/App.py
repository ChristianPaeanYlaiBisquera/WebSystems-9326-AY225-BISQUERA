"""
Flask Web Application — GOG Game Scraper Interface
"""

from flask import Flask, render_template, jsonify, request
import json
import os
import threading
from Scraper import scrape_gog, save_to_json, save_to_csv

app = Flask(__name__)

DATA_FILE = os.path.join(os.path.dirname(__file__), "games.json")

# Scrape state
scrape_state = {
    "running": False,
    "progress": 0,
    "total": 0,
    "message": "Idle",
    "error": None,
}


def load_games() -> list[dict]:
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def run_scrape(num_games: int):
    global scrape_state
    scrape_state["running"] = True
    scrape_state["progress"] = 0
    scrape_state["total"] = num_games
    scrape_state["message"] = "Scraping in progress..."
    scrape_state["error"] = None
    try:
        games = scrape_gog(num_games=num_games)
        save_to_json(games, DATA_FILE)
        save_to_csv(games, DATA_FILE.replace(".json", ".csv"))
        scrape_state["progress"] = len(games)
        scrape_state["message"] = f"Done! {len(games)} games scraped."
    except Exception as e:
        scrape_state["error"] = str(e)
        scrape_state["message"] = f"Error: {e}"
    finally:
        scrape_state["running"] = False


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/games")
def api_games():
    games = load_games()
    query = request.args.get("q", "").lower().strip()
    platform = request.args.get("platform", "").lower().strip()
    sort = request.args.get("sort", "title")

    if query:
        games = [
            g for g in games
            if query in g.get("title", "").lower()
            or query in g.get("developer", "").lower()
            or query in g.get("publisher", "").lower()
            or query in g.get("features", "").lower()
        ]

    if platform and platform != "all":
        games = [g for g in games if platform in g.get("platforms", "").lower()]

    if sort == "title":
        games.sort(key=lambda g: g.get("title", "").lower())
    elif sort == "release":
        games.sort(key=lambda g: g.get("release_date", ""), reverse=True)
    elif sort == "developer":
        games.sort(key=lambda g: g.get("developer", "").lower())

    return jsonify({"games": games, "total": len(games)})


@app.route("/api/scrape", methods=["POST"])
def api_scrape():
    if scrape_state["running"]:
        return jsonify({"error": "Scrape already running"}), 400
    data = request.get_json() or {}
    num_games = int(data.get("num_games", 20))
    num_games = max(10, min(num_games, 50))
    thread = threading.Thread(target=run_scrape, args=(num_games,), daemon=True)
    thread.start()
    return jsonify({"message": f"Scraping {num_games} games started."})


@app.route("/api/scrape/status")
def api_scrape_status():
    return jsonify(scrape_state)


@app.route("/api/platforms")
def api_platforms():
    games = load_games()
    platforms = set()
    for g in games:
        for p in g.get("platforms", "").split(", "):
            p = p.strip()
            if p and p != "Not Available":
                platforms.add(p)
    return jsonify(sorted(platforms))


if __name__ == "__main__":
    app.run(debug=True, port=5000)