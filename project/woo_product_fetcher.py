import os
import json
import requests
from datetime import datetime
from typing import Dict, List, Optional

class WooCommerceProductFetcher:
    def __init__(self):
        # Load from keys file instead of .env
        keys_path = os.path.join(os.path.dirname(__file__), 'keys')
        with open(keys_path) as f:
            for line in f:
                if '=' in line:
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value

        self.base_url = os.getenv('NEXT_PUBLIC_WOOCOMMERCE_URL')
        self.consumer_key = os.getenv('NEXT_PUBLIC_WOOCOMMERCE_KEY')
        self.consumer_secret = os.getenv('NEXT_PUBLIC_WOOCOMMERCE_SECRET')
        
        if not all([self.base_url, self.consumer_key, self.consumer_secret]):
            raise ValueError("Missing required variables in keys file. Please check keys file.")

    def fetch_all_products(self, per_page: int = 100) -> List[Dict]:
        """
        Fetch all products from WooCommerce API with pagination
        """
        all_products = []
        page = 1
        
        while True:
            url = f"{self.base_url}/wp-json/wc/v3/products"
            params = {
                'per_page': per_page,
                'page': page
            }
            
            response = requests.get(
                url,
                params=params,
                auth=(self.consumer_key, self.consumer_secret)
            )
            
            if response.status_code != 200:
                raise Exception(f"API request failed with status {response.status_code}: {response.text}")
            
            products = response.json()
            if not products:
                break
                
            all_products.extend(products)
            page += 1
            
        return all_products

    def save_products_to_json(self, products: List[Dict], filename: Optional[str] = None) -> str:
        """
        Save products to a JSON file with timestamp
        """
        if filename is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f'products_{timestamp}.json'
        
        output_dir = os.path.join(os.path.dirname(__file__), 'data')
        os.makedirs(output_dir, exist_ok=True)
        
        filepath = os.path.join(output_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'total_products': len(products),
                'products': products
            }, f, indent=2, ensure_ascii=False)
        
        return filepath

def main():
    try:
        fetcher = WooCommerceProductFetcher()
        print("Fetching products from WooCommerce...")
        products = fetcher.fetch_all_products()
        print(f"Successfully fetched {len(products)} products")
        
        output_file = fetcher.save_products_to_json(products)
        print(f"Products saved to: {output_file}")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        raise

if __name__ == "__main__":
    main()
