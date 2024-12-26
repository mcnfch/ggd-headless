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

def delete_all_products():
    """Delete all products in WooCommerce"""
    url = f"{WOO_URL}/products"
    domain = urlparse(WOO_URL).netloc
    headers = {'Host': domain}
    
    # Get all product IDs
    try:
        response = requests.get(
            url,
            auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET),
            params={'per_page': 100},
            headers=headers
        )
        response.raise_for_status()
        products = response.json()
        
        # Delete each product
        for product in products:
            delete_url = f"{url}/{product['id']}"
            delete_response = requests.delete(
                delete_url,
                auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET),
                params={'force': True},
                headers=headers
            )
            delete_response.raise_for_status()
            print(f"Deleted product: {product['name']} (ID: {product['id']})")
            time.sleep(1)  # Rate limiting
            
    except requests.exceptions.RequestException as e:
        print(f"Error deleting products: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")

def create_product(product_data: Dict) -> Dict:
    """Create a product in WooCommerce"""
    url = f"{WOO_URL}/products"
    
    # Extract domain from WOO_URL for Host header
    domain = urlparse(WOO_URL).netloc
    
    headers = {
        'Host': domain,  # Ensure nginx routes to correct site
        'Content-Type': 'application/json'
    }
    
    # Remove any fields that might cause issues
    product_data.pop('id', None)
    
    try:
        response = requests.post(
            url,
            json=product_data,
            auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET),
            headers=headers
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error creating product: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return {}

def create_variation(product_id: int, variation_data: Dict, variation_number: int) -> Dict:
    """Create a product variation in WooCommerce"""
    url = f"{WOO_URL}/products/{product_id}/variations"
    
    # Extract domain from WOO_URL for Host header
    domain = urlparse(WOO_URL).netloc
    
    headers = {
        'Host': domain,  # Ensure nginx routes to correct site
        'Content-Type': 'application/json'
    }
    
    # Add a unique suffix to the SKU
    if variation_data.get('sku'):
        variation_data['sku'] = f"{variation_data['sku']}-v{variation_number}"
    
    try:
        response = requests.post(
            url,
            json=variation_data,
            auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET),
            headers=headers
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error creating variation: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return {}

def verify_connection() -> bool:
    """Verify connection to WooCommerce and ensure it's the development site"""
    url = f"{WOO_URL}/products"
    
    # Extract domain from WOO_URL for Host header
    domain = urlparse(WOO_URL).netloc
    
    headers = {
        'Host': domain,  # Ensure nginx routes to correct site
    }
    
    try:
        response = requests.get(
            url,
            auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET),
            params={'per_page': 1},
            headers=headers
        )
        response.raise_for_status()
        
        # Verify we're on the development site
        if 'groovygallerydesigns.com' not in domain:
            print("ERROR: Script is not configured for development site!")
            return False
            
        print(f"Successfully connected to WooCommerce site: {domain}")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to WooCommerce: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return False

def main():
    # Verify connection first
    if not verify_connection():
        print("Aborting import due to connection/configuration issues")
        return
        
    # Load transformed products
    with open('/opt/gg-woo-next/big-c-data/woo-products-transformed.json', 'r') as f:
        products_data = json.load(f)
    
    products = products_data['data']
    start_index = 88  # Start from the 89th product (0-based index)
    total_products = len(products)
    
    print(f"Continuing import from product {start_index + 1} of {total_products}")
    
    for i, product in enumerate(products[start_index:], start_index + 1):
        print(f"\nProcessing product {i}/{total_products}: {product['name']}")
        
        # Store variations data
        variations = product.pop('variations', [])
        
        # Create the main product
        created_product = create_product(product)
        if not created_product:
            print(f"Failed to create product: {product['name']}")
            continue
        
        print(f"Created product: {created_product['name']} (ID: {created_product['id']})")
        
        # If it's a variable product, create variations
        if product['type'] == 'variable' and variations:
            print(f"Creating {len(variations)} variations...")
            for idx, variation in enumerate(variations, 1):
                created_variation = create_variation(created_product['id'], variation, idx)
                if created_variation:
                    print(f"Created variation: {variation.get('sku', 'No SKU')}")
                else:
                    print(f"Failed to create variation: {variation.get('sku', 'No SKU')}")
                
                # Wait a bit between variation creations to avoid rate limits
                time.sleep(1)
        
        # Wait between products to avoid rate limits
        time.sleep(2)
    
    print("\nImport completed!")

if __name__ == "__main__":
    main()
