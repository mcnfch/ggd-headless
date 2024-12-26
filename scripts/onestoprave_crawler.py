#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup
import sys
import json
from urllib.parse import urljoin
from datetime import datetime

class MenuCrawler:
    def __init__(self):
        self.base_url = "https://onestoprave.com"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
        self.menu_structure = {
            'NEW': [],
            'ACCESSORIES': [],
            "WOMEN'S": [],
            "MEN'S": [],
            'SHOES': [],
            'HOME & CAMP': [],
            'HOLIDAY SALE': []
        }

    def get_collections(self, page=1):
        try:
            url = f"{self.base_url}/collections.json?page={page}"
            response = requests.get(url, headers=self.headers)
            if response.ok:
                return response.json()
        except requests.RequestException as e:
            print(f"Error fetching collections page {page}: {str(e)}")
        return None

    def categorize_collection(self, collection):
        title = collection['title'].upper()
        
        # Categorize based on keywords and patterns
        if 'NEW' in title or 'NEW ARRIVAL' in title:
            self.menu_structure['NEW'].append(collection['title'])
        
        elif any(acc in title for acc in ['HAND FAN', 'PASHMINA', 'MASK', 'JEWELRY', 'ACCESSORY', 'ACCESSORIES', 'TRINKET', 'FLAG', 'CHARM', 'PIN', 'STICKER', 'BANDANA']):
            self.menu_structure['ACCESSORIES'].append(collection['title'])
        
        elif any(w in title for w in ["WOMEN'S", 'BIKINI', 'DRESS', 'BODYSUIT', 'CROP TOP']) or ('RAVE' in title and any(item in title for item in ['BRA', 'SHORTS', 'TOP']) and 'MEN' not in title):
            self.menu_structure["WOMEN'S"].append(collection['title'])
        
        elif any(m in title for m in ["MEN'S", 'MENS']) or ('RAVE' in title and 'MEN' in title):
            self.menu_structure["MEN'S"].append(collection['title'])
        
        elif any(s in title for s in ['SHOE', 'BOOT', 'SNEAKER']):
            self.menu_structure['SHOES'].append(collection['title'])
        
        elif any(h in title for h in ['CAMP', 'HOME', 'PILLOW', 'BLANKET', 'TOWEL']):
            self.menu_structure['HOME & CAMP'].append(collection['title'])
        
        elif 'HOLIDAY' in title or 'SALE' in title:
            self.menu_structure['HOLIDAY SALE'].append(collection['title'])

    def crawl(self):
        print("\nExtracting Menu Structure from OneStopRave.com:")
        print("="*50)
        
        page = 1
        while True:
            collections = self.get_collections(page)
            if not collections or not isinstance(collections, dict) or not collections.get('collections'):
                break
                
            current_collections = collections['collections']
            if not current_collections:
                break
                
            for collection in current_collections:
                self.categorize_collection(collection)
            page += 1
        
        # Clean up and sort the categories
        for key in self.menu_structure:
            self.menu_structure[key] = sorted(set(self.menu_structure[key]))
        
        # Save to text file
        txt_filename = 'onestoprave_menu.txt'
        with open(txt_filename, 'w') as f:
            f.write(f"OneStopRave.com Menu Structure\n")
            f.write(f"Crawled on: {datetime.now().isoformat()}\n")
            f.write("="*50 + "\n\n")
            
            for menu_item, collections in self.menu_structure.items():
                if collections:  # Only show categories that have items
                    f.write(f"\n{menu_item}:\n")
                    for collection in collections:
                        f.write(f"  └─  {collection}\n")
        
        # Save to JSON
        json_filename = 'onestoprave_menu.json'
        output = {
            'source': 'OneStopRave.com',
            'crawl_date': datetime.now().isoformat(),
            'menu_structure': self.menu_structure
        }
        with open(json_filename, 'w') as f:
            json.dump(output, f, indent=2)
        
        print(f"\nSaved menu structure to {txt_filename} and {json_filename}")
        
        # Print the structure
        print("\nMenu Structure:")
        print("="*50)
        for menu_item, collections in self.menu_structure.items():
            if collections:  # Only show categories that have items
                print(f"\n{menu_item}:")
                for collection in collections:
                    print(f"  └─  {collection}")

if __name__ == "__main__":
    crawler = MenuCrawler()
    crawler.crawl()
