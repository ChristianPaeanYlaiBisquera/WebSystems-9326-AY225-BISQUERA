"""
Flask Web Application — GFG PHP Academic Scraper
"""

from flask import Flask, render_template, jsonify, request, send_file
import json, os, threading
from datetime import datetime
from scraper import scrape_gfg_php, save_to_json, save_to_csv
from pdf_generator import generate_pdf

app = Flask(__name__)

BASE_DIR     = os.path.dirname(__file__)
DATA_FILE    = os.path.join(BASE_DIR, "articles.json")
CSV_FILE     = os.path.join(BASE_DIR, "articles.csv")
PDF_DIR      = os.path.join(BASE_DIR, "static", "downloads")
os.makedirs(PDF_DIR, exist_ok=True)

scrape_state = {
    "running": False, "progress": 0, "total": 0,
    "message": "Idle", "error": None,
}


def load_articles() -> list[dict]:
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def run_scrape(num: int):
    scrape_state.update(running=True, progress=0, total=num,
                        message="Scraping in progress...", error=None)
    try:
        articles = scrape_gfg_php(num_articles=num)
        save_to_json(articles, DATA_FILE)
        save_to_csv(articles, CSV_FILE)
        scrape_state["progress"] = len(articles)
        scrape_state["message"] = f"Done! {len(articles)} articles scraped."
    except Exception as e:
        scrape_state["error"] = str(e)
        scrape_state["message"] = f"Error: {e}"
    finally:
        scrape_state["running"] = False


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/articles")
def api_articles():
    articles = load_articles()
    q        = request.args.get("q", "").lower().strip()
    diff     = request.args.get("difficulty", "all").lower()
    sort     = request.args.get("sort", "title")

    if q:
        articles = [a for a in articles if
                    q in a.get("title","").lower() or
                    q in a.get("key_concepts","").lower()]
    if diff != "all":
        articles = [a for a in articles if diff in a.get("difficulty","").lower()]
    if sort == "title":
        articles.sort(key=lambda a: a.get("title","").lower())
    elif sort == "difficulty":
        order = {"easy":0,"basic":0,"medium":1,"hard":2,"expert":2}
        articles.sort(key=lambda a: order.get(a.get("difficulty","").lower(), 3))

    return jsonify({"articles": articles, "total": len(articles)})


@app.route("/api/scrape", methods=["POST"])
def api_scrape():
    if scrape_state["running"]:
        return jsonify({"error": "Already running"}), 400
    data = request.get_json() or {}
    num  = max(10, min(int(data.get("num_articles", 15)), 15))
    threading.Thread(target=run_scrape, args=(num,), daemon=True).start()
    return jsonify({"message": f"Scraping {num} articles started."})


@app.route("/api/scrape/status")
def api_scrape_status():
    return jsonify(scrape_state)


@app.route("/api/generate-pdf", methods=["POST"])
def api_generate_pdf():
    articles = load_articles()
    if not articles:
        return jsonify({"error": "No data. Run scraper first."}), 400
    data         = request.get_json() or {}
    student_name = data.get("student_name", "Student").strip() or "Student"
    timestamp    = datetime.now().strftime("%Y%m%d_%H%M%S")
    pdf_path     = os.path.join(PDF_DIR, f"php_module_{timestamp}.pdf")
    try:
        generate_pdf(articles, pdf_path, student_name)
        filename = os.path.basename(pdf_path)
        return jsonify({"message": "PDF generated!", "filename": filename,
                        "url": f"/download/{filename}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/download/<filename>")
def download_pdf(filename):
    path = os.path.join(PDF_DIR, filename)
    if not os.path.exists(path):
        return "File not found", 404
    return send_file(path, as_attachment=True, download_name=filename)


@app.route("/api/download-csv")
def download_csv():
    if not os.path.exists(CSV_FILE):
        return "No CSV file yet", 404
    return send_file(CSV_FILE, as_attachment=True, download_name="gfg_php_articles.csv")


@app.route("/api/download-json")
def download_json():
    if not os.path.exists(DATA_FILE):
        return "No JSON file yet", 404
    return send_file(DATA_FILE, as_attachment=True, download_name="gfg_php_articles.json")


if __name__ == "__main__":
    app.run(debug=True, port=5000)