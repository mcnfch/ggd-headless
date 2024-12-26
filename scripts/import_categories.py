import json
import requests
import time
from typing import Dict, List
from requests.auth import HTTPBasicAuth
from urllib.parse import urlparse

# WooCommerce API configuration
WOO_URL = "https://woo.groovygallerydesigns.com/wp-json/wc/v3"
CONSUMER_KEY = "ck_90846993a7f31d0c512aee435ac278edd2b07a63"
CONSUMER_SECRET = "cs_8cccc3b94095049498243682dc77f6f5bf502e84"

# Safety check
if 'festivalravegear.com' in WOO_URL:
    raise Exception("ERROR: Script attempting to modify production site! Aborting.")

def delete_all_categories():
    """Delete all categories in WooCommerce except the default one"""
    url = f"{WOO_URL}/products/categories"
    domain = urlparse(WOO_URL).netloc
    headers = {'Host': domain}
    
    try:
        # Get all categories
        response = requests.get(
            url,
            auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET),
            params={'per_page': 100},
            headers=headers
        )
        response.raise_for_status()
        categories = response.json()
        
        # Delete each category except the default one (ID: 15)
        for category in categories:
            if category['id'] != 15:  # Skip default category
                delete_url = f"{url}/{category['id']}"
                delete_response = requests.delete(
                    delete_url,
                    auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET),
                    params={'force': True},
                    headers=headers
                )
                delete_response.raise_for_status()
                print(f"Deleted category: {category['name']} (ID: {category['id']})")
                time.sleep(1)  # Rate limiting
            
    except requests.exceptions.RequestException as e:
        print(f"Error deleting categories: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")

def create_category(category_data: Dict) -> Dict:
    """Create a category in WooCommerce"""
    url = f"{WOO_URL}/products/categories"
    domain = urlparse(WOO_URL).netloc
    headers = {
        'Host': domain,
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.post(
            url,
            json=category_data,
            auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET),
            headers=headers
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error creating category: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return {}

def create_categories_hierarchically(categories: List[Dict]) -> Dict[int, int]:
    """Create categories maintaining parent-child relationships"""
    # Sort categories by parent_id to ensure parents are created before children
    sorted_categories = sorted(categories, key=lambda x: x.get('parent_id', 0))
    
    # Keep track of BigCommerce ID to WooCommerce ID mapping
    id_mapping = {}
    
    for category in sorted_categories:
        bc_id = category['id']
        parent_id = category.get('parent_id', 0)
        
        # Prepare category data
        category_data = {
            'name': category['name'],
            'description': category.get('description', ''),
            'parent': id_mapping.get(parent_id, 0),  # Map parent ID or use 0 if not found
            'display': 'default'
        }
        
        # Add meta data if available
        meta_desc = category.get('meta_description', '')
        if meta_desc:
            category_data['meta_data'] = [
                {
                    'key': '_yoast_wpseo_metadesc',
                    'value': meta_desc
                }
            ]
        
        # Create the category
        created = create_category(category_data)
        if created:
            id_mapping[bc_id] = created['id']
            print(f"Created category: {category_data['name']} (BC ID: {bc_id} -> WC ID: {created['id']})")
            if parent_id > 0:
                print(f"  └─ Parent: BC ID {parent_id} -> WC ID {category_data['parent']}")
            time.sleep(1)  # Rate limiting
    
    return id_mapping

def main():
    # Load BigCommerce categories
    try:
        with open('/opt/gg-woo-next/big-c-data/bc-cat.json', 'r') as f:
            bc_categories = json.load(f)
    except FileNotFoundError:
        print("Error: BigCommerce categories file not found. Please run fetch_bc_categories.py first.")
        return
    
    categories = bc_categories.get('data', [])
    print(f"Found {len(categories)} categories in BigCommerce")
    
    # Delete existing categories
    print("\nDeleting existing categories...")
    delete_all_categories()
    print("Finished deleting categories\n")
    
    # Create categories maintaining hierarchy
    print("Creating categories...")
    category_mapping = create_categories_hierarchically(categories)
    
    # Save category mapping for future use
    with open('/opt/gg-woo-next/big-c-data/category_mapping.json', 'w') as f:
        json.dump({
            'mapping': category_mapping,
            'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ')
        }, f, indent=2)
    
    print(f"\nCategory import completed! Created {len(category_mapping)} categories.")

if __name__ == "__main__":
    main()
