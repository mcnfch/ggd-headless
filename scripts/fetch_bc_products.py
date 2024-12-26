import requests
import json
import os
import time
from typing import List, Dict

# BigCommerce API credentials
CLIENT_ID = "46k18oiw5i04si00q8bgt0gm610kxyc"
ACCESS_TOKEN = "pfzqkjta458zpv5u6ipf4rsb35n90hq"
STORE_HASH = "sz0eoyttoh"

# API endpoint for products
BASE_URL = f"https://api.bigcommerce.com/stores/{STORE_HASH}/v3"
PRODUCTS_URL = f"{BASE_URL}/catalog/products"

# Configure request headers
headers = {
    "X-Auth-Token": ACCESS_TOKEN,
    "Content-Type": "application/json",
    "Accept": "application/json"
}

def fetch_all_products() -> List[Dict]:
    """Fetch all products using pagination"""
    all_products = []
    page = 1
    limit = 250  # Maximum allowed by BigCommerce
    
    while True:
        print(f"\nFetching page {page}...")
        
        # Add pagination parameters
        params = {
            "limit": limit,
            "page": page,
            "include": "variants,images,custom_fields,bulk_pricing_rules,primary_image",
        }
        
        try:
            response = requests.get(PRODUCTS_URL, headers=headers, params=params)
            response.raise_for_status()
            
            data = response.json()
            products = data.get("data", [])
            
            if not products:
                break
                
            all_products.extend(products)
            print(f"Fetched {len(products)} products")
            
            # Check if we've reached the last page
            pagination = data.get("meta", {}).get("pagination", {})
            total_pages = pagination.get("total_pages", 1)
            
            if page >= total_pages:
                break
                
            # Rate limiting - wait 2 seconds between requests
            time.sleep(2)
            page += 1
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching products: {e}")
            if response.status_code == 429:  # Rate limit exceeded
                retry_after = int(response.headers.get('Retry-After', 60))
                print(f"Rate limit exceeded. Waiting {retry_after} seconds...")
                time.sleep(retry_after)
                continue
            break
            
    return all_products

def save_products(products: List[Dict]):
    """Save products to JSON file"""
    output = {
        "data": products,
        "meta": {
            "total": len(products),
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
    }
    
    # Create directory if it doesn't exist
    os.makedirs('/opt/gg-woo-next/big-c-data', exist_ok=True)
    
    # Save to file
    output_file = '/opt/gg-woo-next/big-c-data/bc-products.json'
    with open(output_file, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\nSaved {len(products)} products to {output_file}")

def main():
    print("Starting product fetch...")
    products = fetch_all_products()
    if products:
        save_products(products)
        print("\nProduct fetch completed successfully!")
    else:
        print("\nNo products were fetched!")

if __name__ == "__main__":
    main()
