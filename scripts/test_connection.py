import requests
from requests.auth import HTTPBasicAuth
import json
from urllib.parse import urlparse

# Development site configuration
WOO_URL = "https://woo.groovygallerydesigns.com/wp-json/wc/v3"
CONSUMER_KEY = "ck_90846993a7f31d0c512aee435ac278edd2b07a63"
CONSUMER_SECRET = "cs_8cccc3b94095049498243682dc77f6f5bf502e84"

def check_specific_product(product_id):
    """Check if a specific product ID exists"""
    url = f"{WOO_URL}/products/{product_id}"
    
    headers = {
        'Host': urlparse(WOO_URL).netloc,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get(
            url,
            auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET),
            headers=headers
        )
        if response.status_code == 200:
            product = response.json()
            print(f"\nFound Product ID {product_id}:")
            print(f"Name: {product['name']}")
            print(f"Status: {product['status']}")
            return True
        else:
            print(f"\nProduct ID {product_id} not found (Status: {response.status_code})")
            return False
    except requests.exceptions.RequestException as e:
        print(f"Error checking product {product_id}: {e}")
        return False

def test_request():
    # First check general connection
    domain = urlparse(WOO_URL).netloc
    
    print("Checking specific product IDs...")
    product_ids = [4448, 4461, 4467, 4475, 4483]
    found_products = []
    
    for pid in product_ids:
        if check_specific_product(pid):
            found_products.append(pid)
    
    print("\nSummary:")
    print(f"Total products found: {len(found_products)}")
    if found_products:
        print("Found product IDs:", found_products)
    else:
        print("No products found with the specified IDs")

if __name__ == "__main__":
    test_request()
