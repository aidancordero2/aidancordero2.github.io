#!/usr/bin/env python3
"""
Google Scholar Profile Scraper
Scrapes publication data from a Google Scholar profile page and exports to CSV
"""

import requests
from bs4 import BeautifulSoup
import csv
import time
import re
from urllib.parse import urlparse, parse_qs, urlencode

# Configuration
MIN_YEAR = 2007  # Only include publications from this year onwards
PAGE_SIZE = 100  # Number of publications per request (max 100)
REQUEST_DELAY = 2  # Seconds to wait between requests to avoid rate limiting

def scrape_scholar_profile(base_url):
    """
    Scrape all publications from a Google Scholar profile page
    
    Args:
        base_url: Google Scholar profile URL
        
    Returns:
        List of dictionaries containing publication data, sorted by year (newest first)
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    all_publications = []
    start_index = 0
    
    # Parse the base URL to extract user ID and other params
    parsed = urlparse(base_url)
    base_params = parse_qs(parsed.query)
    user_id = base_params.get('user', [''])[0]
    
    if not user_id:
        print("Error: Could not extract user ID from URL")
        return []
    
    print(f"Fetching all publications for user: {user_id}")
    print(f"Filtering for publications from {MIN_YEAR} onwards...\n")
    
    while True:
        # Build URL with pagination parameters
        params = {
            'user': user_id,
            'hl': 'en',
            'cstart': start_index,
            'pagesize': PAGE_SIZE
        }
        url = f"https://scholar.google.com/citations?{urlencode(params)}"
        
        try:
            if start_index > 0:
                print(f"Waiting {REQUEST_DELAY}s before next request...")
                time.sleep(REQUEST_DELAY)
            
            print(f"Fetching publications {start_index + 1} to {start_index + PAGE_SIZE}...")
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find all publication entries on this page
            pub_rows = soup.find_all('tr', class_='gsc_a_tr')
            
            if not pub_rows:
                print(f"No more publications found.")
                break
            
            page_publications = []
            for row in pub_rows:
                pub_data = parse_publication_row(row)
                if pub_data:
                    page_publications.append(pub_data)
            
            print(f"  Found {len(page_publications)} publications on this page")
            all_publications.extend(page_publications)
            
            # Check if we've reached the end (fewer results than page size)
            if len(pub_rows) < PAGE_SIZE:
                print("Reached end of publications.")
                break
            
            start_index += PAGE_SIZE
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching page: {e}")
            break
    
    # Filter by year (>= MIN_YEAR)
    filtered_publications = []
    for pub in all_publications:
        year_str = pub.get('year', '')
        if year_str:
            try:
                year = int(year_str)
                if year >= MIN_YEAR:
                    filtered_publications.append(pub)
            except ValueError:
                # Include publications with non-numeric years (might be important)
                filtered_publications.append(pub)
        # Skip publications without a year
    
    print(f"\nTotal publications found: {len(all_publications)}")
    print(f"Publications from {MIN_YEAR} onwards: {len(filtered_publications)}")
    
    # Sort by year descending (newest first)
    filtered_publications.sort(key=lambda x: int(x.get('year', '0') or '0'), reverse=True)
    
    return filtered_publications


def parse_publication_row(row):
    """
    Parse a single publication row from the HTML
    
    Args:
        row: BeautifulSoup element for the publication row
        
    Returns:
        Dictionary containing publication data
    """
    pub_data = {}
    
    # Title and link
    title_elem = row.find('a', class_='gsc_a_at')
    if title_elem:
        pub_data['title'] = title_elem.text.strip()
        pub_data['link'] = 'https://scholar.google.com' + title_elem['href'] if title_elem.get('href') else ''
    
    # Authors and publication venue
    authors_elem = row.find('div', class_='gs_gray')
    if authors_elem:
        pub_data['authors'] = authors_elem.text.strip()
    
    # Publication venue (journal/conference)
    venue_elem = authors_elem.find_next_sibling('div', class_='gs_gray') if authors_elem else None
    if venue_elem:
        pub_data['venue'] = venue_elem.text.strip()
    
    # Citations
    citations_elem = row.find('a', class_='gsc_a_ac')
    if citations_elem and citations_elem.text.strip():
        pub_data['citations'] = citations_elem.text.strip()
    else:
        pub_data['citations'] = '0'
    
    # Year
    year_elem = row.find('span', class_='gsc_a_h')
    if year_elem and year_elem.text.strip():
        pub_data['year'] = year_elem.text.strip()
    else:
        pub_data['year'] = ''
    
    return pub_data

def save_to_csv(publications, filename='scholar_publications.csv'):
    """
    Save publications to CSV file
    
    Args:
        publications: List of publication dictionaries
        filename: Output CSV filename
    """
    if not publications:
        print("No publications to save.")
        return
    
    # Define CSV columns
    fieldnames = ['title', 'authors', 'venue', 'year', 'citations', 'link']
    
    try:
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for pub in publications:
                writer.writerow(pub)
        
        print(f"\nSuccessfully saved {len(publications)} publications to {filename}")
        
    except IOError as e:
        print(f"Error writing to CSV: {e}")

def main():
    # The Google Scholar profile URL
    url = "https://scholar.google.com/citations?user=lAS1T9BopYMC&hl=en"
    
    print("=" * 60)
    print("Google Scholar Profile Scraper")
    print("=" * 60)
    print(f"Profile URL: {url}")
    print(f"Year filter: {MIN_YEAR} onwards")
    print(f"Sort order: Newest first")
    print("=" * 60 + "\n")
    
    publications = scrape_scholar_profile(url)
    
    if publications:
        # Display first few publications (newest)
        print("\n" + "-" * 60)
        print("Newest publications:")
        print("-" * 60)
        for i, pub in enumerate(publications[:5], 1):
            print(f"\n{i}. [{pub.get('year', 'N/A')}] {pub.get('title', 'N/A')}")
            print(f"   Authors: {pub.get('authors', 'N/A')}")
            print(f"   Citations: {pub.get('citations', 'N/A')}")
        
        if len(publications) > 5:
            print(f"\n... and {len(publications) - 5} more publications")
        
        # Save to CSV
        save_to_csv(publications)
    else:
        print("No publications found or error occurred.")

if __name__ == "__main__":
    main()
