import json
import requests
from typing import Dict, List
from requests.auth import HTTPBasicAuth
import time

# WooCommerce API configuration
WOO_URL = "https://woo.groovygallerydesigns.com/wp-json/wc/v3"
CONSUMER_KEY = "ck_90846993a7f31d0c512aee435ac278edd2b07a63"
CONSUMER_SECRET = "cs_8cccc3b94095049498243682dc77f6f5bf502e84"

def load_category_mapping() -> Dict[str, int]:
    """Load the category mapping from BigCommerce to WooCommerce IDs"""
    with open('/opt/gg-woo-next/big-c-data/category_mapping.json', 'r') as f:
        data = json.load(f)
        return {str(bc_id): woo_id for bc_id, woo_id in data['mapping'].items()}

def load_bc_products() -> Dict[int, Dict]:
    """Load the original BigCommerce products data and index by ID"""
    with open('/opt/gg-woo-next/big-c-data/bc-products.json', 'r') as f:
        data = json.load(f)
        return {product['id']: product for product in data['data']}

def get_woo_products() -> List[Dict]:
    """Get all WooCommerce products"""
    products = []
    page = 1
    per_page = 100

    while True:
        try:
            response = requests.get(
                f"{WOO_URL}/products",
                auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET),
                params={'per_page': per_page, 'page': page}
            )
            response.raise_for_status()
            batch = response.json()
            
            if not batch:  # No more products
                break
                
            products.extend(batch)
            print(f"Fetched page {page} ({len(batch)} products)")
            page += 1
            time.sleep(1)  # Rate limiting
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching products: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response: {e.response.text}")
            break
    
    return products

def update_product_categories(product_id: int, category_ids: List[int]) -> bool:
    """Update a WooCommerce product's categories"""
    try:
        response = requests.put(
            f"{WOO_URL}/products/{product_id}",
            auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET),
            json={'categories': [{'id': cat_id} for cat_id in category_ids]}
        )
        response.raise_for_status()
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error updating product {product_id}: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return False

def get_bc_id_from_meta(product: Dict) -> int:
    """Extract BigCommerce ID from WooCommerce product meta data"""
    if not product.get('meta_data'):
        return None
    
    for meta in product['meta_data']:
        if meta.get('key') == '_bigcommerce_product_id':
            try:
                return int(meta.get('value'))
            except (ValueError, TypeError):
                return None
    return None

def main():
    # Load necessary data
    category_mapping = load_category_mapping()
    bc_products = load_bc_products()
    woo_products = get_woo_products()
    
    print(f"Found {len(woo_products)} WooCommerce products")
    print(f"Found {len(bc_products)} BigCommerce products")
    print(f"Loaded {len(category_mapping)} category mappings")
    
    # Process each WooCommerce product
    for woo_product in woo_products:
        # Get the BigCommerce ID from meta
        bc_id = get_bc_id_from_meta(woo_product)
        if not bc_id:
            print(f"Skipping product {woo_product['id']} (no BigCommerce ID)")
            continue
            
        # Get corresponding BigCommerce product
        bc_product = bc_products.get(bc_id)
        if not bc_product:
            print(f"No BigCommerce product found for ID: {bc_id}")
            continue
            
        # Get BigCommerce category IDs
        bc_category_ids = [str(cat) for cat in bc_product.get('categories', [])]
        if not bc_category_ids:
            print(f"No categories found for product ID: {bc_id}")
            continue
            
        # Convert to WooCommerce category IDs
        woo_category_ids = []
        for bc_cat_id in bc_category_ids:
            if bc_cat_id in category_mapping:
                woo_category_ids.append(category_mapping[bc_cat_id])
            else:
                print(f"Warning: No mapping found for BigCommerce category {bc_cat_id}")
        
        if not woo_category_ids:
            print(f"No valid category mappings for product ID: {bc_id}")
            continue
            
        # Update the product's categories
        print(f"Updating categories for product {woo_product['id']} (BC ID: {bc_id})")
        success = update_product_categories(woo_product['id'], woo_category_ids)
        if success:
            print(f"Successfully updated categories for product {woo_product['id']}")
        else:
            print(f"Failed to update categories for product {woo_product['id']}")
            
        time.sleep(1)  # Rate limiting

if __name__ == "__main__":
    main()
