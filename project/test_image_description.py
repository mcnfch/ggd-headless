import os
import json
import random
from datetime import datetime
import openai
from typing import List, Optional

# Initialize OpenAI client
client = openai.Client(api_key='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')

# Initialize the rate limiter and content filter
from utils.rate_limiter import RateLimiter, rate_limited
from utils.content_filters import ContentFilter
api_limiter = RateLimiter(calls_per_minute=20)  # Limit to 20 calls per minute
content_filter = ContentFilter()

def load_product_data(file_path="/opt/gg-woo-next/project/data/products_20241221_070833.json"):
    """Load product data from JSON file"""
    with open(file_path, 'r') as f:
        return json.load(f)

def load_keywords(file_path="/opt/gg-woo-next/project/data/festival_keywords.json"):
    """Load festival keywords from JSON file"""
    with open(file_path, 'r') as f:
        return json.load(f)

def get_random_keywords(keywords_data, category, num_keywords=3):
    """Get random keywords from a specific category"""
    for cat in keywords_data["categories"]:
        if cat["name"] == category:
            keywords = cat["keywords"]
            return random.sample(keywords, min(num_keywords, len(keywords)))
    return []

def create_description_prompt(product_name: str, category: str, keywords: List[str]) -> str:
    """Create a prompt for generating a product description"""
    return f"""Create a detailed, SEO-friendly product description for this {category} item.
Current name: {product_name}

Guidelines:
- Focus on specific features and benefits
- Include 2-3 relevant keywords from: {', '.join(keywords)}
- Use natural, direct language
- Avoid marketing clichés and overused phrases
- Include key product features and use cases
- Add a concise alt tag for SEO

The description should highlight practical benefits while maintaining authenticity."""

@rate_limited(api_limiter)
def get_image_description(image_url, product_name, category, keywords):
    """Get a description of the image using GPT-4 Vision."""
    try:
        prompt = create_description_prompt(product_name, category, keywords)
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Analyze the image and describe its key features, focusing on style, patterns, colors, and design elements that would appeal to festival-goers and fashion enthusiasts."
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": image_url}
                        }
                    ]
                }
            ],
            max_tokens=300
        )
        
        description = response.choices[0].message.content.strip()
        
        # Filter out banned phrases
        if content_filter.contains_banned_phrase(description):
            print(f"Warning: Found banned phrases in description: {content_filter.get_banned_phrases_found(description)}")
            description = content_filter.filter_text(description)
        
        return description
    except Exception as e:
        return f"Error analyzing image: {str(e)}"

def determine_product_category(product_name):
    """Determine the most relevant category based on product name"""
    product_name = product_name.lower()
    
    category_indicators = {
        "Festival and Rave Gear": ["gear", "equipment", "tech", "light", "led", "portable"],
        "Festival and Rave Clothing": ["clothing", "outfit", "wear", "dress", "top", "pants", "romper"],
        "Festival and Rave Accessories": ["glasses", "sunglasses", "jewelry", "accessory", "accessories", "belt", "bag"],
        "Festival Camping Gear": ["tent", "camping", "sleep", "outdoor", "camp"]
    }
    
    category_scores = {
        category: sum(1 for keyword in indicators if keyword in product_name)
        for category, indicators in category_indicators.items()
    }
    
    return max(category_scores.items(), key=lambda x: x[1])[0] if any(category_scores.values()) else "Festival and Rave Accessories"

def analyze_product_images(product_data, keywords_data, max_products=None):
    """Analyze images for products and return descriptions"""
    image_descriptions = {
        "timestamp": datetime.now().isoformat(),
        "products": {}
    }
    
    products_to_process = product_data['products'][:max_products] if max_products else product_data['products']
    total_products = len(products_to_process)
    
    for idx, product in enumerate(products_to_process, 1):
        product_id = product['id']
        print(f"\nProcessing product {idx}/{total_products}: ID {product_id}")
        
        # Determine product category and get relevant keywords
        category = determine_product_category(product['name'])
        keywords = get_random_keywords(keywords_data, category)
        
        product_info = {
            "name": product['name'],
            "category": category,
            "images": []
        }
        
        if 'images' in product and product['images']:
            for image in product['images']:
                image_url = image.get('src', '')
                if image_url:
                    print(f"Analyzing image: {image_url}")
                    print(f"Using category: {category}")
                    description = get_image_description(image_url, product['name'], category, keywords)
                    product_info["images"].append({
                        "image_id": image.get('id', ''),
                        "url": image_url,
                        "description": description,
                        "keywords_used": keywords
                    })
        
        image_descriptions["products"][product_id] = product_info
    
    return image_descriptions

def save_descriptions(descriptions, output_dir="/opt/gg-woo-next/project/data"):
    """Save descriptions to a JSON file"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f'image_descriptions_{timestamp}.json'
    
    os.makedirs(output_dir, exist_ok=True)
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(descriptions, f, indent=2, ensure_ascii=False)
    
    return filepath

def main():
    print("Loading product and keyword data...")
    product_data = load_product_data()
    keywords_data = load_keywords()
    print(f"Found {product_data['total_products']} products")
    
    # Process one product for testing
    max_products = 1
    
    print(f"\nAnalyzing images for {max_products} product(s)...")
    descriptions = analyze_product_images(product_data, keywords_data, max_products=max_products)
    
    output_file = save_descriptions(descriptions)
    print(f"\nDescriptions saved to: {output_file}")

if __name__ == "__main__":
    main()
