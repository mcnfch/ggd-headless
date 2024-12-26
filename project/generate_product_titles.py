import os
import json
import random
import openai
from datetime import datetime
from typing import Dict, List, Optional
from utils.rate_limiter import RateLimiter, rate_limited
from utils.content_filters import ContentFilter

# Initialize the OpenAI client, rate limiter, and content filter
client = openai.Client(api_key='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')
api_limiter = RateLimiter(calls_per_minute=20)
content_filter = ContentFilter()

# Initialize the OpenAI client, rate limiter, and content filter
client = openai.Client(api_key='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')
api_limiter = RateLimiter(calls_per_minute=20)
content_filter = ContentFilter()

class KeywordManager:
    def __init__(self, keywords_data: Dict):
        self.categories = {
            cat["name"]: cat["keywords"] 
            for cat in keywords_data["categories"]
        }
        
    def get_keywords_by_category(self, category: str, num_keywords: int = 3) -> List[str]:
        """Get random keywords from a specific category"""
        if category in self.categories:
            return random.sample(
                self.categories[category],
                min(num_keywords, len(self.categories[category]))
            )
        return []
    
    def determine_product_category(self, product_name: str) -> str:
        """Determine the most relevant category based on product name"""
        # Convert product name to lowercase for matching
        product_name = product_name.lower()
        
        # Define category keywords
        category_indicators = {
            "Festival and Rave Gear": ["gear", "equipment", "tech", "light", "led", "portable"],
            "Festival and Rave Clothing": ["clothing", "outfit", "wear", "dress", "top", "pants", "romper"],
            "Festival and Rave Accessories": ["glasses", "sunglasses", "jewelry", "accessory", "accessories", "belt", "bag"],
            "Festival Camping Gear": ["tent", "camping", "sleep", "outdoor", "camp"]
        }
        
        # Score each category based on keyword matches
        category_scores = {
            category: sum(1 for keyword in indicators if keyword in product_name)
            for category, indicators in category_indicators.items()
        }
        
        # Return the category with the highest score, default to accessories if no match
        return max(category_scores.items(), key=lambda x: x[1])[0] if any(category_scores.values()) else "Festival and Rave Accessories"

def load_product_data(file_path: str = "/opt/gg-woo-next/project/data/products_20241221_070833.json") -> Dict:
    """Load product data from JSON file"""
    with open(file_path, 'r') as f:
        return json.load(f)

def load_keywords(file_path: str = "/opt/gg-woo-next/project/data/festival_keywords.json") -> Dict:
    """Load festival keywords from JSON file"""
    with open(file_path, 'r') as f:
        return json.load(f)

def create_title_prompt(product_name: str, category: str, keywords: List[str]) -> str:
    """Create a prompt for generating a product title"""
    return f"""Create a concise, SEO-friendly product title for this {category} item.
Current name: {product_name}

Guidelines:
- Keep it under 60 characters
- Include 1-2 relevant keywords from: {', '.join(keywords)}
- Focus on key features and benefits
- Use natural, direct language
- Avoid marketing clichés and overused phrases
- Make it specific and descriptive

The title should be SEO-optimized and drive conversions while maintaining clarity and uniqueness."""

@rate_limited(api_limiter)
def generate_product_title(image_url: str, product_name: str, category: str, keywords: List[str]) -> str:
    """Generate a title for a product based on its image and category"""
    try:
        # Create the chat completion with image analysis
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": 'When writing product titles for Groovy Gallery Designs follow these guidelines: max 75 characters, capture the product\'s essence using descriptive keywords and keeping it relevant to festival culture or retro fashion.'
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"Create a title for this product. Current name: {product_name}. Use these keywords if relevant: {', '.join(keywords[:2])}"
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": image_url}
                        }
                    ]
                }
            ],
            max_tokens=100
        )

        title = response.choices[0].message.content.strip()
        
        # Apply content filtering if needed
        if content_filter.contains_banned_phrase(title):
            title = content_filter.filter_text(title)
        
        return title

    except Exception as e:
        print(f"Error generating title: {str(e)}")
        return product_name

def process_products(product_data: Dict, keyword_manager: KeywordManager, max_products: Optional[int] = None) -> Dict:
    """Process products and generate titles for their images"""
    product_titles = {
        "timestamp": datetime.now().isoformat(),
        "products": {}
    }
    
    products_to_process = product_data['products'][:max_products] if max_products else product_data['products']
    total_products = len(products_to_process)
    
    for idx, product in enumerate(products_to_process, 1):
        product_id = product['id']
        print(f"\nProcessing product {idx}/{total_products}: ID {product_id}")
        
        # Determine product category and get relevant keywords
        category = keyword_manager.determine_product_category(product['name'])
        keywords = keyword_manager.get_keywords_by_category(category)
        
        product_info = {
            "original_name": product['name'],
            "category": category,
            "images": []
        }
        
        if 'images' in product and product['images']:
            for image in product['images']:
                image_url = image.get('src', '')
                if image_url:
                    print(f"Generating title for image: {image_url}")
                    print(f"Using category: {category}")
                    title = generate_product_title(image_url, product['name'], category, keywords)
                    product_info["images"].append({
                        "image_id": image.get('id', ''),
                        "url": image_url,
                        "generated_title": title,
                        "keywords_used": keywords
                    })
        
        product_titles["products"][product_id] = product_info
    
    return product_titles

def save_titles(titles: Dict, output_dir: str = "/opt/gg-woo-next/project/data") -> str:
    """Save generated titles to a JSON file"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f'product_titles_{timestamp}.json'
    
    os.makedirs(output_dir, exist_ok=True)
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(titles, f, indent=2, ensure_ascii=False)
    
    return filepath

def main():
    print("Loading product and keyword data...")
    product_data = load_product_data()
    keywords_data = load_keywords()
    
    # Initialize keyword manager
    keyword_manager = KeywordManager(keywords_data)
    
    print(f"Found {product_data['total_products']} products")
    
    # Process one product for testing
    max_products = 1
    
    print(f"\nGenerating titles for {max_products} product(s)...")
    titles = process_products(product_data, keyword_manager, max_products=max_products)
    
    output_file = save_titles(titles)
    print(f"\nTitles saved to: {output_file}")

if __name__ == "__main__":
    main()
