import requests
import json
import os

# BigCommerce API credentials
CLIENT_ID = "46k18oiw5i04si00q8bgt0gm610kxyc"
ACCESS_TOKEN = "pfzqkjta458zpv5u6ipf4rsb35n90hq"
STORE_HASH = "sz0eoyttoh"  # Store hash from store-sz0eoyttoh

# API endpoint for categories
API_URL = f"https://api.bigcommerce.com/stores/{STORE_HASH}/v3/catalog/categories"

# Configure request headers
headers = {
    "X-Auth-Token": ACCESS_TOKEN,
    "Content-Type": "application/json",
    "Accept": "application/json"
}

def fetch_categories():
    try:
        response = requests.get(API_URL, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {response.headers}")
        print(f"Response Body: {response.text[:500]}...")  # Print first 500 chars
        
        if response.status_code == 200:
            data = response.json()
            
            # Create directory if it doesn't exist
            os.makedirs('/opt/gg-woo-next/big-c-data', exist_ok=True)
            
            # Save raw response
            with open('/opt/gg-woo-next/big-c-data/bc-cat.json', 'w') as f:
                json.dump(data, f, indent=2)
            
            print(f"\nSuccessfully fetched and saved {len(data.get('data', []))} categories")
        else:
            print(f"Error: {response.status_code}")
            print(f"Response: {response.text}")
    
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    fetch_categories()
