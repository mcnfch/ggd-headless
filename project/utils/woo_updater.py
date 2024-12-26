"""Utility to send updates to WooCommerce via REST API."""
import os
import json
import requests
from typing import Dict, Any
from base64 import b64encode
from pathlib import Path

def load_env_file(file_path: str) -> Dict[str, str]:
    """Load environment variables from file."""
    env_vars = {}
    with open(file_path) as f:
        for line in f:
            if '=' in line:
                key, value = line.strip().split('=', 1)
                env_vars[key] = value
    return env_vars

class WooCommerceUpdater:
    def __init__(self, site_url: str, consumer_key: str, consumer_secret: str):
        """Initialize WooCommerce API client.
        
        Args:
            site_url: Your WordPress site URL
            consumer_key: WooCommerce API consumer key
            consumer_secret: WooCommerce API consumer secret
        """
        self.site_url = site_url.rstrip('/')
        self.api_url = f"{self.site_url}/wp-json/wc/v3"
        self.auth = b64encode(f"{consumer_key}:{consumer_secret}".encode()).decode()
    
    def update_products(self, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Send product updates to WooCommerce.
        
        Args:
            updates: Dictionary containing product updates in WooCommerce format
            
        Returns:
            API response with update results
        """
        headers = {
            'Authorization': f'Basic {self.auth}',
            'Content-Type': 'application/json'
        }
        
        # WooCommerce batch update endpoint
        endpoint = f"{self.api_url}/products/batch"
        
        # Send the batch update request
        response = requests.post(
            endpoint,
            headers=headers,
            json=updates
        )
        
        if response.status_code != 200:
            raise Exception(f"Failed to update products: {response.text}")
        
        return response.json()

def main():
    """Update products from the latest generated content."""
    # Load environment variables
    env_vars = load_env_file("keys")
    site_url = env_vars["NEXT_PUBLIC_WOOCOMMERCE_URL"]
    consumer_key = env_vars["NEXT_PUBLIC_WOOCOMMERCE_KEY"]
    consumer_secret = env_vars["NEXT_PUBLIC_WOOCOMMERCE_SECRET"]
    
    # Find the latest WooCommerce update file
    results_dir = Path("data/results")
    update_files = list(results_dir.glob("woo_update_*.json"))
    if not update_files:
        print("No update files found!")
        return
    
    latest_file = max(update_files, key=lambda x: x.stat().st_mtime)
    print(f"Using update file: {latest_file}")
    
    # Load the updates
    with open(latest_file) as f:
        updates = json.load(f)
    
    # Initialize WooCommerce updater
    woo = WooCommerceUpdater(site_url, consumer_key, consumer_secret)
    
    try:
        # Send updates to WooCommerce
        result = woo.update_products(updates)
        print("\nProducts updated successfully!")
        print(f"Updated {len(result['update'])} products")
        
        # Save the result
        timestamp = latest_file.stem.split('_')[-1]
        result_file = results_dir / f"woo_result_{timestamp}.json"
        with open(result_file, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"\nUpdate results saved to: {result_file}")
        
    except Exception as e:
        print(f"Error updating products: {str(e)}")

if __name__ == "__main__":
    main()
