import requests
from requests.auth import HTTPBasicAuth
import json
from typing import List, Dict

# WooCommerce API configuration
WOO_URL = "https://woo.groovygallerydesigns.com/wp-json/wc/v3"
CONSUMER_KEY = "ck_9fbfdb952b71771cd624e7e82bd9b26b55c51b22"
CONSUMER_SECRET = "cs_f26a1b4f70789242e28206e83f9af5e815cd533c"

def get_products(page: int = 1, per_page: int = 100) -> List[Dict]:
    """Get products from WooCommerce"""
    url = f"{WOO_URL}/products"
    params = {
        'page': page,
        'per_page': per_page,
        'order': 'desc',  # Get newest first
        'orderby': 'date'
    }
    
    try:
        response = requests.get(
            url,
            auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET),
            params=params
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error getting products: {e}")
        return []

def get_product_variations(product_id: int) -> List[Dict]:
    """Get variations for a specific product"""
    url = f"{WOO_URL}/products/{product_id}/variations"
    
    try:
        response = requests.get(
            url,
            auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET),
            params={'per_page': 100}
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error getting variations for product {product_id}: {e}")
        return []

def search_products(search_term: str) -> List[Dict]:
    """Search for products by name"""
    url = f"{WOO_URL}/products"
    params = {
        'search': search_term,
        'per_page': 100
    }
    
    try:
        response = requests.get(
            url,
            auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET),
            params=params
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error searching products: {e}")
        return []

def get_product_details(product_id: int) -> Dict:
    """Get detailed product information"""
    url = f"{WOO_URL}/products/{product_id}"
    
    try:
        response = requests.get(
            url,
            auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET)
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error getting product {product_id}: {e}")
        return {}

def main():
    # Get all products (including drafts, private, etc)
    url = f"{WOO_URL}/products"
    params = {
        'per_page': 100,
        'status': 'any',  # Get all products regardless of status
        'orderby': 'date',
        'order': 'desc'
    }
    
    try:
        response = requests.get(
            url,
            auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET),
            params=params
        )
        response.raise_for_status()
        products = response.json()
        
        print(f"Found {len(products)} total products")
        print("\nMost recent products:")
        
        for product in products[:10]:  # Show 10 most recent
            print(f"\nProduct ID: {product['id']}")
            print(f"Name: {product['name']}")
            print(f"Status: {product['status']}")
            print(f"Catalog visibility: {product.get('catalog_visibility', 'unknown')}")
            print(f"Created: {product['date_created']}")
            print(f"Modified: {product['date_modified']}")
            print("-" * 50)
            
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return

if __name__ == "__main__":
    main()
