import requests
import json
import os
import time
from typing import List, Dict

# WooCommerce API credentials
WOOCOMMERCE_URL = "https://woo.festivalravegear.com/wp-json/wc/v3"
CONSUMER_KEY = "ck_9fbfdb952b71771cd624e7e82bd9b26b55c51b22"
CONSUMER_SECRET = "cs_f26a1b4f70789242e28206e83f9af5e815cd533c"

def fetch_all_categories() -> List[Dict]:
    """Fetch all categories using pagination"""
    all_categories = []
    page = 1
    per_page = 100  # Maximum recommended for WooCommerce
    
    while True:
        print(f"\nFetching page {page}...")
        
        # Build URL with authentication and pagination
        params = {
            'consumer_key': CONSUMER_KEY,
            'consumer_secret': CONSUMER_SECRET,
            'page': page,
            'per_page': per_page,
            'hide_empty': False,  # Include categories with no products
        }
        
        try:
            response = requests.get(f"{WOOCOMMERCE_URL}/products/categories", params=params)
            response.raise_for_status()
            
            categories = response.json()
            
            if not categories:
                break
                
            all_categories.extend(categories)
            print(f"Fetched {len(categories)} categories")
            
            # Check if we've reached the last page
            total_pages = int(response.headers.get('X-WP-TotalPages', 1))
            
            if page >= total_pages:
                break
                
            # Rate limiting - wait 1 second between requests
            time.sleep(1)
            page += 1
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching categories: {e}")
            if response.status_code == 429:  # Rate limit exceeded
                retry_after = int(response.headers.get('Retry-After', 30))
                print(f"Rate limit exceeded. Waiting {retry_after} seconds...")
                time.sleep(retry_after)
                continue
            break
            
    return all_categories

def save_categories(categories: List[Dict]):
    """Save categories to JSON file"""
    output = {
        "data": categories,
        "meta": {
            "total": len(categories),
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
    }
    
    # Create directory if it doesn't exist
    os.makedirs('/opt/gg-woo-next/big-c-data', exist_ok=True)
    
    # Save to file
    output_file = '/opt/gg-woo-next/big-c-data/woo-cat.json'
    with open(output_file, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\nSaved {len(categories)} categories to {output_file}")

def main():
    print("Starting WooCommerce category fetch...")
    categories = fetch_all_categories()
    if categories:
        save_categories(categories)
        print("\nCategory fetch completed successfully!")
    else:
        print("\nNo categories were fetched!")

if __name__ == "__main__":
    main()
