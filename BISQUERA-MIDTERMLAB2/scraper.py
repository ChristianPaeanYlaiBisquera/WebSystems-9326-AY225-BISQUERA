"""
GeeksforGeeks PHP Scraper
Extracts: Topic Title, Difficulty Level, Key Technical Concepts,
Code Snippets, Complexity Analysis, References/Related Links
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

BASE_URL = "https://www.geeksforgeeks.org"

# PHP topic URLs to scrape — all dynamically fetched, no hardcoded article data
PHP_TOPIC_URLS = [
    "/php-tutorial/",
    "/php-variables/",
    "/php-data-types/",
    "/php-arrays/",
    "/php-functions/",
    "/php-strings/",
    "/php-loops/",
    "/php-conditional-statements/",
    "/php-form-handling/",
    "/php-sessions/",
    "/php-cookies/",
    "/php-file-handling/",
    "/php-object-oriented-programming/",
    "/php-exception-handling/",
    "/php-database-mysqli/",
]


def clean_text(text: str) -> str:
    if not text:
        return "Not Available"
    cleaned = re.sub(r"\s+", " ", text).strip()
    return cleaned if cleaned else "Not Available"


def fetch_page(url: str) -> BeautifulSoup | None:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        return BeautifulSoup(resp.text, "lxml")
    except Exception as e:
        logger.warning(f"Failed to fetch {url}: {e}")
        return None


def extract_difficulty(soup: BeautifulSoup) -> str:
    """Extract difficulty level from GFG article."""
    # Try difficulty badge/tag
    for selector in [
        ".difficulty-rating",
        ".article--difficulty",
        "[class*='difficulty']",
        ".article-difficulty",
    ]:
        el = soup.select_one(selector)
        if el:
            text = el.get_text(strip=True)
            if text:
                return text

    # Try meta tags or breadcrumbs
    meta = soup.find("meta", {"name": "difficulty"})
    if meta:
        return meta.get("content", "Not Available")

    # Infer from article tags/categories
    tags_area = soup.select(".article--tags a, .tags a, .article-tags a")
    for tag in tags_area:
        txt = tag.get_text(strip=True).lower()
        if txt in ["easy", "medium", "hard", "basic", "expert"]:
            return txt.capitalize()

    # Check article content for difficulty mention
    content = soup.get_text().lower()
    for level in ["easy", "medium", "hard", "basic", "expert"]:
        pattern = rf'\b{level}\b'
        if re.search(pattern, content[:2000]):
            return level.capitalize()

    return "Not Available"


def extract_introduction(soup: BeautifulSoup) -> str:
    """Extract intro/key concepts — first meaningful paragraph."""
    # GFG article body selectors
    article_body = (
        soup.select_one(".article-body")
        or soup.select_one(".entry-content")
        or soup.select_one("[class*='article--viewer']")
        or soup.select_one(".text")
    )

    if article_body:
        paragraphs = article_body.find_all("p")
        collected = []
        for p in paragraphs:
            text = p.get_text(strip=True)
            # Skip short, nav-like, or ad paragraphs
            if len(text) > 60 and not any(skip in text.lower() for skip in [
                "advertisement", "cookie", "click here", "subscribe", "login"
            ]):
                collected.append(text)
            if len(collected) >= 2:
                break
        if collected:
            combined = " ".join(collected)
            return combined[:800] + ("..." if len(combined) > 800 else "")

    # Fallback: meta description
    meta_desc = soup.find("meta", {"name": "description"}) or soup.find("meta", {"property": "og:description"})
    if meta_desc:
        content = meta_desc.get("content", "")
        if content:
            return content[:800]

    return "Not Available"


def extract_code_snippets(soup: BeautifulSoup) -> str:
    """Extract first PHP code snippet from article."""
    # Look for code blocks
    code_blocks = soup.select("pre code, .code-block code, .highlight code, pre.wp-block-code")
    if not code_blocks:
        code_blocks = soup.select("pre, code.language-php, .code-container")

    for block in code_blocks:
        code = block.get_text(strip=True)
        # Filter for PHP-related code
        if len(code) > 30:
            # Truncate very long snippets
            if len(code) > 600:
                code = code[:600] + "\n... (truncated)"
            return code

    return "Not Available"


def extract_complexity(soup: BeautifulSoup) -> str:
    """Extract time/space complexity if mentioned."""
    full_text = soup.get_text()
    results = []

    # Look for complexity patterns
    time_match = re.search(
        r'[Tt]ime\s+[Cc]omplexity\s*[:\-–]?\s*([O\(][^\n\.]{3,60})',
        full_text
    )
    space_match = re.search(
        r'[Ss]pace\s+[Cc]omplexity\s*[:\-–]?\s*([O\(][^\n\.]{3,60})',
        full_text
    )

    if time_match:
        results.append(f"Time: {time_match.group(1).strip()}")
    if space_match:
        results.append(f"Space: {space_match.group(1).strip()}")

    return " | ".join(results) if results else "Not Available"


def extract_related_links(soup: BeautifulSoup, base_url: str) -> str:
    """Extract related/reference links from article."""
    links = []

    # GFG "Related Articles" section
    for selector in [
        ".related-article a",
        ".article--recommended a",
        "[class*='related'] a",
        ".see-also a",
    ]:
        els = soup.select(selector)
        for el in els[:5]:
            href = el.get("href", "")
            text = el.get_text(strip=True)
            if href and text and "geeksforgeeks" in href:
                links.append(f"{text} ({href})")

    # Also grab internal links from article body
    if len(links) < 3:
        body = soup.select_one(".article-body, .entry-content, .text")
        if body:
            for a in body.find_all("a", href=True)[:8]:
                href = a["href"]
                text = a.get_text(strip=True)
                if text and len(text) > 5 and "geeksforgeeks.org" in href:
                    entry = f"{text} ({href})"
                    if entry not in links:
                        links.append(entry)

    return "; ".join(links[:5]) if links else "Not Available"


def scrape_article(url: str) -> dict:
    """Scrape a single GFG PHP article."""
    full_url = url if url.startswith("http") else BASE_URL + url
    logger.info(f"  Scraping: {full_url}")

    soup = fetch_page(full_url)
    if not soup:
        return None

    # --- Title ---
    title = (
        soup.find("h1")
        or soup.select_one(".article-title h1")
        or soup.select_one("h1.title")
    )
    title_text = clean_text(title.get_text() if title else "")
    if title_text == "Not Available":
        og_title = soup.find("meta", {"property": "og:title"})
        title_text = clean_text(og_title["content"] if og_title else "Not Available")

    return {
        "title": title_text,
        "difficulty": extract_difficulty(soup),
        "key_concepts": extract_introduction(soup),
        "code_snippet": extract_code_snippets(soup),
        "complexity": extract_complexity(soup),
        "related_links": extract_related_links(soup, full_url),
        "url": full_url,
        "scraped_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }


def scrape_gfg_php(num_articles: int = 15) -> list[dict]:
    """
    Main scraping function.
    Dynamically scrapes PHP articles from GeeksforGeeks.
    """
    logger.info(f"Starting GFG PHP scrape — target: {num_articles} articles")
    articles = []
    urls = PHP_TOPIC_URLS[:num_articles]

    for i, url in enumerate(urls):
        if len(articles) >= num_articles:
            break
        result = scrape_article(url)
        if result:
            articles.append(result)
            logger.info(f"  [{len(articles)}/{num_articles}] {result['title']}")
        time.sleep(1.2)  # Respect robots.txt rate limits

    logger.info(f"Scraping complete. {len(articles)} articles collected.")
    return articles


def save_to_json(articles: list[dict], filepath: str = "articles.json"):
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)
    logger.info(f"Saved to {filepath}")


def save_to_csv(articles: list[dict], filepath: str = "articles.csv"):
    if not articles:
        return
    fields = ["title", "difficulty", "key_concepts", "code_snippet", "complexity", "related_links", "url", "scraped_at"]
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(articles)
    logger.info(f"Saved to {filepath}")


if __name__ == "__main__":
    articles = scrape_gfg_php(num_articles=15)
    save_to_json(articles, "articles.json")
    save_to_csv(articles, "articles.csv")
    print(f"\nDone! Scraped {len(articles)} articles.")