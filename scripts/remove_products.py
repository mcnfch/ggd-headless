import requests
from requests.auth import HTTPBasicAuth
import json
from typing import List

# Production site - only used for cleanup
PROD_WOO_URL = "https://woo.festivalravegear.com/wp-json/wc/v3"
CONSUMER_KEY = "ck_9fbfdb952b71771cd624e7e82bd9b26b55c51b22"
CONSUMER_SECRET = "cs_f26a1b4f70789242e28206e83f9af5e815cd533c"

# List of product IDs to remove (these were accidentally added)
PRODUCT_IDS = [
    4448,  # Maze Runner's Neon Escape
    4461,  # Psychedelic Hexagon Hawaiian Trip Matching Set
    4467,  # Quack-tastic Rave Duckling Bucket Hat
    4475,  # Swirl Galaxy Rave Bucket Hat
    4483   # Swirlicious Vortex Bucket Hat
]

def delete_product(product_id: int, force: bool = True) -> bool:
    """Delete a product and its variations"""
    url = f"{PROD_WOO_URL}/products/{product_id}"
    params = {'force': force}  # force=true permanently deletes instead of moving to trash
    
    try:
        response = requests.delete(
            url,
            auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET),
            params=params
        )
        response.raise_for_status()
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error deleting product {product_id}: {e}")
        return False

def main():
    print("Starting cleanup of accidentally imported products...")
    
    for product_id in PRODUCT_IDS:
        print(f"\nAttempting to delete product {product_id}...")
        if delete_product(product_id):
            print(f"Successfully deleted product {product_id}")
        else:
            print(f"Failed to delete product {product_id}")
    
    print("\nCleanup completed!")

if __name__ == "__main__":
    # Safety prompt
    response = input("WARNING: This will DELETE products from the PRODUCTION site. Are you sure? (yes/no): ")
    if response.lower() != 'yes':
        print("Aborting.")
        exit(1)
    main()
