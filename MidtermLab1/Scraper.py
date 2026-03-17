"""
GOG.com Web Scraper
Extracts game data: Title, Release Date, Key Features,
Platform Availability, Developer, Publisher
"""

import requests
from bs4 import BeautifulSoup
import json
import csv
import time
import re
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

BASE_URL = "https://www.gog.com"
CATALOG_API = "https://catalog.gog.com/v1/catalog"
PRODUCT_API = "https://api.gog.com/products/{product_id}?expand=description,screenshots,videos,related_products,changelog"
GAME_API = "https://www.gog.com/games/ajax/filtered?mediaType=game&sort=popularity&page={page}"


def fetch_game_list(page: int = 1) -> list[dict]:
    """Fetch a page of games from GOG catalog API."""
    params = {
        "limit": 24,
        "order": "desc:score",
        "productType": "in:game",
        "page": page,
    }
    try:
        resp = requests.get(CATALOG_API, params=params, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        return data.get("products", [])
    except Exception as e:
        logger.error(f"Error fetching game list page {page}: {e}")
        return []


def fetch_game_detail_api(product_id: str) -> dict:
    """Fetch detailed game info from GOG product API."""
    url = f"https://api.gog.com/products/{product_id}?expand=description"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logger.warning(f"API detail fetch failed for {product_id}: {e}")
        return {}


def fetch_game_page(slug: str) -> dict:
    """Scrape individual game page on GOG for extra info."""
    url = f"{BASE_URL}/game/{slug}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "lxml")

        data = {}

        # Try to get features from the page script tags (GOG embeds JSON)
        scripts = soup.find_all("script")
        for script in scripts:
            content = script.string or ""
            if "gogData" in content or "productcardData" in content:
                # Extract features list
                feat_match = re.search(r'"features"\s*:\s*(\[[^\]]*\])', content)
                if feat_match:
                    try:
                        feats = json.loads(feat_match.group(1))
                        data["features_raw"] = feats
                    except Exception:
                        pass

        # Scrape details table
        detail_rows = soup.select(".table.details__table tr")
        for row in detail_rows:
            cells = row.find_all("td")
            if len(cells) == 2:
                key = cells[0].get_text(strip=True).lower()
                val = cells[1].get_text(separator=", ", strip=True)
                if "developer" in key:
                    data["developer_page"] = val
                elif "publisher" in key:
                    data["publisher_page"] = val
                elif "release" in key:
                    data["release_page"] = val

        # Try details list items
        detail_items = soup.select("div.details__content table tr")
        for row in detail_items:
            th = row.find("th") or row.find("td")
            td_all = row.find_all("td")
            if th and td_all:
                key = th.get_text(strip=True).lower()
                val = td_all[-1].get_text(separator=", ", strip=True)
                if "developer" in key:
                    data["developer_page"] = val
                elif "publisher" in key:
                    data["publisher_page"] = val

        return data
    except Exception as e:
        logger.warning(f"Page scrape failed for {slug}: {e}")
        return {}


def clean_text(text: str) -> str:
    if not text:
        return "Not Available"
    return re.sub(r"\s+", " ", text).strip() or "Not Available"


def parse_game(raw: dict) -> dict:
    """Parse a raw catalog product dict into our required fields."""

    product_id = str(raw.get("id", ""))
    slug = raw.get("slug", "")

    # --- Title ---
    title = clean_text(raw.get("title", ""))

    # --- Release Date ---
    release_raw = raw.get("releaseDate", "") or raw.get("globalReleaseDate", "")
    if release_raw:
        try:
            # Could be timestamp or ISO string
            if isinstance(release_raw, (int, float)):
                release_date = datetime.utcfromtimestamp(release_raw).strftime("%B %d, %Y")
            else:
                dt = datetime.fromisoformat(release_raw.replace("Z", "+00:00"))
                release_date = dt.strftime("%B %d, %Y")
        except Exception:
            release_date = str(release_raw)
    else:
        release_date = "Not Available"

    # --- Platforms ---
    os_list = []
    os_data = raw.get("operatingSystems", [])
    if isinstance(os_data, list):
        mapping = {"windows": "Windows", "mac": "macOS", "linux": "Linux"}
        os_list = [mapping.get(o.lower(), o.capitalize()) for o in os_data if o]
    platforms = ", ".join(os_list) if os_list else "Not Available"

    # --- Developer & Publisher from catalog ---
    developers = raw.get("developers", []) or []
    publishers = raw.get("publishers", []) or []

    dev_names = [d.get("name", "") for d in developers if isinstance(d, dict)]
    pub_names = [p.get("name", "") for p in publishers if isinstance(p, dict)]

    developer = clean_text(", ".join(filter(None, dev_names)))
    publisher = clean_text(", ".join(filter(None, pub_names)))

    # --- Features / Tags ---
    tags = raw.get("tags", []) or []
    features_list = []
    if isinstance(tags, list):
        for t in tags:
            if isinstance(t, dict):
                name = t.get("name", "") or t.get("slug", "")
                if name:
                    features_list.append(name.replace("-", " ").title())
            elif isinstance(t, str):
                features_list.append(t.replace("-", " ").title())

    # Also pull from genres/features fields if present
    genres = raw.get("genres", []) or []
    for g in genres:
        if isinstance(g, dict):
            name = g.get("name", "")
            if name and name not in features_list:
                features_list.append(name)

    features = ", ".join(features_list[:6]) if features_list else "Not Available"

    # --- Cover Image ---
    cover = raw.get("coverHorizontal", "") or raw.get("cover", "") or raw.get("coverVertical", "")
    if cover and not cover.startswith("http"):
        cover = "https:" + cover

    return {
        "id": product_id,
        "slug": slug,
        "title": title,
        "release_date": release_date,
        "platforms": platforms,
        "developer": developer,
        "publisher": publisher,
        "features": features,
        "cover": cover or "Not Available",
        "url": f"https://www.gog.com/en/game/{slug}" if slug else "Not Available",
    }


def scrape_gog(num_games: int = 24) -> list[dict]:
    """
    Main scraping function.
    Fetches games from GOG catalog API and enriches with page scraping.
    Returns a list of game dicts.
    """
    logger.info(f"Starting GOG scrape — target: {num_games} games")
    games = []
    page = 1

    while len(games) < num_games:
        logger.info(f"Fetching catalog page {page}...")
        raw_games = fetch_game_list(page)
        if not raw_games:
            logger.warning("No more games returned from API.")
            break

        for raw in raw_games:
            if len(games) >= num_games:
                break
            parsed = parse_game(raw)
            if parsed["title"] == "Not Available":
                continue

            # If developer/publisher missing, try page scrape
            if parsed["developer"] == "Not Available" or parsed["publisher"] == "Not Available":
                if parsed["slug"]:
                    logger.info(f"  Enriching via page scrape: {parsed['title']}")
                    page_data = fetch_game_page(parsed["slug"])
                    if parsed["developer"] == "Not Available":
                        parsed["developer"] = clean_text(page_data.get("developer_page", "Not Available"))
                    if parsed["publisher"] == "Not Available":
                        parsed["publisher"] = clean_text(page_data.get("publisher_page", "Not Available"))
                    if parsed["release_date"] == "Not Available":
                        parsed["release_date"] = clean_text(page_data.get("release_page", "Not Available"))
                    if parsed["features"] == "Not Available" and page_data.get("features_raw"):
                        feats = [f.get("title", f.get("name", "")) for f in page_data["features_raw"] if isinstance(f, dict)]
                        parsed["features"] = ", ".join(filter(None, feats))[:200] or "Not Available"
                    time.sleep(0.4)

            games.append(parsed)
            logger.info(f"  [{len(games)}/{num_games}] {parsed['title']}")

        page += 1
        time.sleep(0.5)

    logger.info(f"Scraping complete. {len(games)} games collected.")
    return games


def save_to_json(games: list[dict], filepath: str = "games.json"):
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(games, f, ensure_ascii=False, indent=2)
    logger.info(f"Saved {len(games)} games to {filepath}")


def save_to_csv(games: list[dict], filepath: str = "games.csv"):
    if not games:
        return
    fields = ["title", "release_date", "platforms", "developer", "publisher", "features", "url"]
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(games)
    logger.info(f"Saved {len(games)} games to {filepath}")


if __name__ == "__main__":
    games = scrape_gog(num_games=20)
    save_to_json(games, "games.json")
    save_to_csv(games, "games.csv")
    print(f"\nDone! Scraped {len(games)} games.")