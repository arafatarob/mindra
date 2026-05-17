#!/usr/bin/env python3
import base64
import json
import re
import sys
from time import sleep, time
from urllib.parse import parse_qs, quote_plus, urljoin, urlparse

import requests
from bs4 import BeautifulSoup


def extract_social_links(soup, base_url):
    links = {
        "linkedin": None,
        "instagram": None,
        "facebook": None,
        "website": None,
        "email": None,
        "phone": None,
    }

    all_anchors = soup.find_all("a", href=True)
    for a in all_anchors:
        href = a["href"]
        normalized = href.strip()

        if normalized.startswith("tel:"):
            phone_value = normalized.split("tel:", 1)[1].strip()
            if phone_value:
                links["phone"] = phone_value
            continue

        if normalized.startswith("mailto:"):
            email_value = normalized.split("mailto:", 1)[1].split("?")[0].strip()
            if email_value:
                links["email"] = email_value
            continue

        url = urljoin(base_url, href)
        if "linkedin.com/in/" in url.lower():
            links["linkedin"] = url
        elif "instagram.com/" in url.lower():
            links["instagram"] = url
        elif "facebook.com/" in url.lower():
            links["facebook"] = url
        elif "http" in url.lower() and "linkedin.com" not in url and "instagram.com" not in url and "facebook.com" not in url:
            if not links["website"]:
                links["website"] = url

    text = soup.get_text(separator=" ")
    if not links["email"]:
        emails = re.findall(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", text)
        links["email"] = emails[0] if emails else None

    if not links["phone"]:
        phone_candidates = re.findall(r"(?:\+\d{1,3}[-.\s]?)?(?:\(?\d{1,4}\)?[-.\s]?){2,4}\d+", text)
        for raw_phone in phone_candidates:
            digits = re.sub(r"[^0-9]", "", raw_phone)
            if len(digits) >= 7 and not re.search(r"\b(?:rgb|rgba|url)\b", raw_phone, re.I):
                links["phone"] = raw_phone.strip()
                break

    return links


def scrape_single_business_page(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            return None

        if is_blocked_response(response.text):
            return None

        soup = BeautifulSoup(response.content, "html.parser")

        name_tag = soup.find("h1") or soup.find("h2") or soup.find("title")
        name = name_tag.get_text(strip=True) if name_tag else "N/A"

        company = "N/A"
        company_el = soup.find(class_=re.compile("company|brand|org|business|vendor", re.I))
        if company_el:
            company = company_el.get_text(strip=True)
        else:
            parts = name.strip().split()
            if len(parts) > 1:
                company = " ".join(parts[0:2])
            else:
                company = parts[0]

        links = extract_social_links(soup, url)

        return {
            "name": name,
            "company": company,
            "email": links["email"],
            "phone": links["phone"],
            "website": links["website"],
            "linkedin": links["linkedin"],
            "instagram": links["instagram"],
            "facebook": links["facebook"],
            "source_url": url,
        }
    except Exception as e:
        print(f"Error scraping {url}: {e}", file=sys.stderr)
        return None


def decode_bing_redirect(href):
    parsed = urlparse(href)
    query = parse_qs(parsed.query)
    target = query.get('u', [href])[0]
    if target.startswith('http'):
        return target

    for offset in range(3):
        candidate = target[offset:]
        try:
            candidate += '=' * (-len(candidate) % 4)
            decoded = base64.urlsafe_b64decode(candidate).decode('utf-8')
            if decoded.startswith('http'):
                return decoded
        except Exception:
            continue
    return href


def discover_business_detail_urls(listing_url, max_links=10):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    }

    try:
        response = requests.get(listing_url, headers=headers, timeout=10)
        if response.status_code != 200:
            return []
        soup = BeautifulSoup(response.content, "html.parser")
    except Exception:
        return []

    candidates = []
    blacklist_paths = [
        "/about",
        "/contact",
        "/blog",
        "/cities",
        "/countries",
        "/privacy",
        "/tos",
        "/booking",
        "/advertise",
        "/promote",
        "/submit",
        "/discovery",
    ]

    base_domain = urlparse(listing_url).netloc.lower()
    for a in soup.select("a[href]"):
        href = a["href"].strip()
        if not href or href.startswith("#") or href.lower().startswith("javascript:"):
            continue

        candidate = urljoin(listing_url, href)
        parsed = urlparse(candidate)
        if parsed.scheme not in ("http", "https"):
            continue
        if parsed.netloc.lower() != base_domain:
            continue
        if candidate == listing_url:
            continue
        path = parsed.path.lower()
        if any(blocked in path for blocked in blacklist_paths):
            continue
        if len([segment for segment in path.split("/") if segment]) < 2:
            continue

        if candidate not in candidates:
            candidates.append(candidate)
            if len(candidates) >= max_links:
                break

    return candidates


def build_search_queries(keyword):
    normalized = keyword.strip()
    queries = [
        normalized,
        f"{normalized} contact",
        f"{normalized} phone",
        f"{normalized} email",
        f"{normalized} contact phone email",
        f"{normalized} business contact",
    ]

    location_terms = [
        'dhaka', 'bangladesh', 'bd', 'rajshahi', 'chattogram', 'chittagong',
        'khulna', 'barishal', 'barisal', 'rangpur', 'sylhet', 'mymensingh',
    ]
    if any(term in normalized.lower() for term in location_terms):
        queries.extend([
            f"{normalized} site:.bd",
            f"{normalized} contact site:.bd",
            f"{normalized} phone site:.bd",
        ])

    # preserve order and remove duplicates
    return list(dict.fromkeys(queries))


def get_business_urls_from_keyword(keyword):
    """
    Use Bing keyword search to discover business pages from public results.
    """
    keyword_lower = keyword.lower()
    search_url = f"https://www.bing.com/search?q={quote_plus(keyword)}"

    if any(term in keyword_lower for term in ['dhaka', 'bangladesh', 'bd']):
        search_url += '&cc=bd&mkt=en-BD'

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    }
    try:
        response = requests.get(search_url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.content, "html.parser")
    except Exception as e:
        print(f"Search fetch failed: {e}", file=sys.stderr)
        return []

    business_urls = []
    blacklist = [
        "wikipedia.org",
        "youtube.com",
        "facebook.com",
        "twitter.com",
        "linkedin.com",
        "instagram.com",
        "britannica.com",
        "yelp.com",
        "amazon.com",
        "cloudflare.com",
    ]

    for a in soup.select('li.b_algo h2 a'):
        href = a.get('href')
        if not href:
            continue

        target = decode_bing_redirect(href)
        parsed = urlparse(target)
        domain = parsed.netloc.lower()
        if any(blocked in domain for blocked in blacklist):
            continue

        if target not in business_urls:
            business_urls.append(target)

    return business_urls[:10]


def is_blocked_response(response_text):
    lower = response_text.lower()
    return (
        'cloudflare' in lower and ('error' in lower or 'checking your browser' in lower)
    )


def scrape_urls_for_leads(business_urls, visited_urls, start_time, max_duration):
    leads = []
    for url in business_urls:
        if time() - start_time > max_duration:
            print("12 second limit reached, stopping early.", file=sys.stderr)
            break

        if url in visited_urls:
            continue
        visited_urls.add(url)

        data = scrape_single_business_page(url)
        if data:
            leads.append(data)

        if not data or not (data.get("email") or data.get("phone")):
            detail_pages = discover_business_detail_urls(url, max_links=7)
            print(f"Discovered {len(detail_pages)} detail pages for {url}", file=sys.stderr)
            for detail_url in detail_pages:
                if time() - start_time > max_duration:
                    print("10 second limit reached during detail discovery.", file=sys.stderr)
                    break
                if detail_url in visited_urls:
                    continue
                visited_urls.add(detail_url)
                detail_data = scrape_single_business_page(detail_url)
                if detail_data:
                    leads.append(detail_data)
                sleep(0.5)
        sleep(0.5)
    return leads


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Keyword is required"}))
        return

    keyword = sys.argv[1]
    leads = []

    start_time = time()
    max_duration = 10  # ইউজারের কথা অনুযায়ী মোট ১০ সেকেন্দ ম্যাক্সিমাম

    search_queries = build_search_queries(keyword)
    visited_urls = set()

    for query in search_queries:
        if time() - start_time > max_duration:
            print("10 second limit reached before searching.", file=sys.stderr)
            break

        business_urls = get_business_urls_from_keyword(query)
        print(f"Found {len(business_urls)} URLs for search '{query}'", file=sys.stderr)
        if not business_urls:
            continue

        leads = scrape_urls_for_leads(business_urls, visited_urls, start_time, max_duration)
        if leads:
            break

    verified = []
    for lead in leads:
        has_email = lead.get("email") and "@" in lead["email"]
        has_phone = lead.get("phone") and re.search(r"\d{7,}", lead["phone"])
        has_name = lead.get("name") and len(lead["name"].strip()) > 1

        if has_name and (has_email or has_phone):
            lead["score"] = "high" if has_email and has_phone else "medium"
            lead["verified"] = True
            verified.append(lead)

    print(json.dumps(verified, ensure_ascii=False))


if __name__ == "__main__":
    main()
