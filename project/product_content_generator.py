import os
import json
from datetime import datetime
from generate_product_titles import process_products as generate_titles
from generate_product_titles import KeywordManager, load_product_data, load_keywords
from test_image_description import analyze_product_images as generate_descriptions
import openai
from typing import List, Optional
from utils.rate_limiter import RateLimiter, rate_limited
from utils.content_filters import ContentFilter

# Initialize OpenAI client and utilities
client = openai.Client(api_key='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')
api_limiter = RateLimiter(calls_per_minute=20)
content_filter = ContentFilter()

@rate_limited(api_limiter)
def generate_product_description(product_name: str, product_title: str, image_descriptions: List[str], keywords: List[str], prompt_type: str = "full") -> str:
    """Generate a product description using GPT-4."""
    try:
        # Combine image descriptions
        combined_desc = " ".join(image_descriptions)
        
        if prompt_type == "cta_only":
            system_content = (
                "Create an engaging call-to-action for a festival fashion product. Follow these guidelines:\n"
                "- Be creative and unique\n"
                "- Use festival and rave culture language\n"
                "- Keep it short and punchy\n"
                "- Avoid marketing clichés and AI-specific terms\n"
                "- Make it fun and exciting"
            )
            user_content = f"Product: {product_name}\nTitle: {product_title}\nKeywords: {', '.join(keywords[:2])}\n\nCreate a compelling call-to-action."
        else:
            system_content = (
                "Create engaging product descriptions for festival and rave fashion items. Follow these guidelines:\n"
                "- Maximum 500 characters\n"
                "- Start with a bold hook\n"
                "- Include key features and materials\n"
                "- End with an approved call-to-action\n"
                "- Avoid marketing clichés and AI-specific terms"
            )
            user_content = f"Product: {product_name}\nTitle: {product_title}\nImage Analysis: {combined_desc}\nKeywords: {', '.join(keywords[:2])}\n\nCreate a compelling product description."
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_content},
                {"role": "user", "content": user_content}
            ],
            max_tokens=300
        )
        
        description = response.choices[0].message.content.strip()
        
        # Apply content filtering
        if content_filter.contains_banned_phrase(description):
            description = content_filter.filter_text(description)
        
        return description
        
    except Exception as e:
        print(f"Error generating description: {str(e)}")
        return f"Experience the unique style of {product_name}. Perfect for festivals and raves."

def create_woo_update(titles_data, descriptions_data):
    """Create WooCommerce product update file from titles and descriptions"""
    updates = {
        "timestamp": datetime.now().isoformat(),
        "products": []
    }
    
    # Process each product that has both titles and descriptions
    for product_id in set(titles_data["products"].keys()) & set(descriptions_data["products"].keys()):
        title_info = titles_data["products"][product_id]
        desc_info = descriptions_data["products"][product_id]
        
        # Get the first generated title and all descriptions
        if title_info["images"] and desc_info["images"]:
            product_update = {
                "id": product_id,
                "name": title_info["images"][0]["generated_title"],  # Use first image's title
                "meta_data": [
                    {
                        "key": "original_name",
                        "value": title_info["original_name"]
                    },
                    {
                        "key": "product_category",
                        "value": title_info["category"]
                    },
                    {
                        "key": "keywords_used",
                        "value": title_info["images"][0]["keywords_used"]
                    }
                ],
                "images": []
            }
            
            # Process each image
            for title_img, desc_img in zip(title_info["images"], desc_info["images"]):
                if title_img["image_id"] == desc_img["image_id"]:
                    image_data = {
                        "id": title_img["image_id"],
                        "alt": desc_img["description"],
                        "title": title_img["generated_title"],
                        "keywords_used": {
                            "title_keywords": title_img["keywords_used"],
                            "description_keywords": desc_img["keywords_used"]
                        }
                    }
                    product_update["images"].append(image_data)
            
            updates["products"].append(product_update)
    
    return updates

def save_json(data, filename, output_dir="/opt/gg-woo-next/project/data"):
    """Save data to a JSON file"""
    os.makedirs(output_dir, exist_ok=True)
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    return filepath

def main():
    print("Starting product content generation workflow...")
    
    # Load necessary data
    print("\nLoading product and keyword data...")
    product_data = load_product_data()
    keywords_data = load_keywords()
    keyword_manager = KeywordManager(keywords_data)
    
    # Number of products to process
    max_products = 3
    print(f"\nProcessing {max_products} products...")
    
    # Step 1: Generate Titles
    print("\n=== Generating Titles ===")
    titles = generate_titles(product_data, keyword_manager, max_products=max_products)
    titles_file = save_json(titles, f'product_titles_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json')
    print(f"Titles saved to: {titles_file}")
    
    # Step 2: Generate Descriptions
    print("\n=== Generating Descriptions ===")
    descriptions = generate_descriptions(product_data, keywords_data, max_products=max_products)
    descriptions_file = save_json(descriptions, f'product_descriptions_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json')
    print(f"Descriptions saved to: {descriptions_file}")
    
    # Step 3: Create WooCommerce Update File
    print("\n=== Creating WooCommerce Update File ===")
    woo_updates = create_woo_update(titles, descriptions)
    updates_file = save_json(woo_updates, f'woo_product_updates_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json')
    print(f"WooCommerce updates saved to: {updates_file}")
    
    print("\nWorkflow complete! Generated titles, descriptions, and update file.")
    return titles_file, descriptions_file, updates_file

if __name__ == "__main__":
    main()
