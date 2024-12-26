"""Test script for product content generation."""
import json
import sys
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any

# Add project root to path
sys.path.append(str(Path(__file__).parent.parent))

from generate_product_titles import generate_product_title
from test_image_description import get_image_description
from product_content_generator import generate_product_description
from utils.woo_formatter import format_for_woo_api

def get_keywords() -> List[str]:
    """Get keywords from the festival keywords file."""
    with open("data/festival_keywords.json") as f:
        data = json.load(f)
        # Get keywords from the first category, excluding LED-related ones
        keywords = [k for k in data["categories"][0]["keywords"] if "led" not in k.lower()]
        return keywords

def save_results(results: Dict[str, Any], is_woo: bool = False) -> str:
    """Save results to a JSON file."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir = Path("data/results")
    output_dir.mkdir(exist_ok=True)
    
    # Save both raw results and WooCommerce formatted results
    prefix = "woo_update" if is_woo else "mobile_content"
    output_file = output_dir / f"{prefix}_{timestamp}.json"
    
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    return str(output_file)

def process_product(product: Dict[str, Any], keywords: List[str]) -> Dict[str, Any]:
    """Process a single product."""
    result = {
        "product_id": product["id"],
        "original_name": product["name"],
        "outputs": {}
    }
    
    # Get image URL
    image_url = product["images"][0]["src"] if product["images"] else None
    if not image_url:
        return None
    
    # Generate title
    title = generate_product_title(
        image_url=image_url,
        product_name=product["name"],
        category="Festival Fashion",
        keywords=keywords[:2]
    ).replace("**", "").strip()
    result["outputs"]["title"] = title
    
    # Generate full description
    full_description = generate_product_description(
        product_name=product["name"],
        product_title=title,
        image_descriptions=[],
        keywords=keywords[:2]
    ).replace("**", "").strip()
    
    # Extract the main description (before Key Features)
    main_desc = ""
    if "Key Features:" in full_description:
        main_desc = full_description[:full_description.find("Key Features:")].strip()
    else:
        main_desc = full_description.split('\n')[0]  # Take first paragraph
    
    # Extract call-to-action
    cta = generate_product_description(
        product_name=product["name"],
        product_title=title,
        image_descriptions=[],
        keywords=keywords[:2],
        prompt_type="cta_only"
    ).replace("**", "").strip()
    
    # Combine main description and AI-generated CTA
    result["outputs"]["description"] = f"{main_desc}\n\n{cta}"
    
    return result

def main():
    """Run tests on multiple products."""
    print("Starting mobile-optimized content generation test...")
    
    # Load keywords
    keywords = get_keywords()
    print(f"Loaded {len(keywords)} keywords (excluding LED-related)")
    
    # Load test products
    with open("data/products_20241221_070833.json") as f:
        data = json.load(f)
        test_products = data["products"][:5]  # Test first 5 products
    
    results = {
        "timestamp": datetime.now().isoformat(),
        "keywords_used": keywords[:2],
        "products": []
    }
    
    for product in test_products:
        print(f"\nProcessing product: {product['name']}")
        print("=" * 50)
        
        try:
            result = process_product(product, keywords)
            if result:
                results["products"].append(result)
                print(f"\nTitle: {result['outputs']['title']}")
                print(f"Description:\n{result['outputs']['description']}")
        except Exception as e:
            print(f"Error processing product: {str(e)}")
            continue
    
    # Save raw results
    output_file = save_results(results)
    print(f"\nRaw results saved to: {output_file}")
    
    # Format and save WooCommerce API update
    woo_updates = format_for_woo_api(results["products"])
    woo_output_file = save_results(woo_updates, is_woo=True)
    print(f"WooCommerce update file saved to: {woo_output_file}")
    
    print(f"\nProcessed {len(results['products'])} products successfully!")

if __name__ == "__main__":
    main()
