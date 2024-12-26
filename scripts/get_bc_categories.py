import sys
import json
from typing import Dict, List

def load_bigcommerce_categories(file_path: str) -> List[Dict]:
    """Load BigCommerce categories from JSON file."""
    try:
        with open(file_path, 'r') as f:
            content = f.read()
            print(f"File content length: {len(content)}")
            if len(content) == 0:
                print("Error: File is empty")
                return []
            data = json.loads(content)
            return data['data']
    except FileNotFoundError:
        print(f"Error: The file {file_path} was not found.")
        return []
    except json.JSONDecodeError as e:
        print(f"Error: JSON decode error - {str(e)}")
        print(f"Content: {content[:200]}...")  # Show more content
        return []

def format_category(category: Dict) -> Dict:
    """Format BigCommerce category data for our needs."""
    return {
        "id": category["id"],
        "name": category["name"],
        "description": category["description"],
        "parent_id": category["parent_id"],
        "is_visible": category["is_visible"],
        "image_url": category.get("image_url", ""),
        "url": category.get("custom_url", {}).get("url", ""),
        "sort_order": category.get("sort_order", 0),
        "meta_description": category.get("meta_description", ""),
        "meta_keywords": category.get("meta_keywords", [])
    }

def main():
    # Load BigCommerce categories
    categories = load_bigcommerce_categories('big.json')
    
    # Format categories
    formatted_categories = [format_category(cat) for cat in categories if cat["is_visible"]]
    
    # Save to bc-cat.json
    output = {
        "categories": formatted_categories,
        "total_count": len(formatted_categories)
    }
    
    with open('bc-cat.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\nSuccessfully processed {len(formatted_categories)} categories")

if __name__ == "__main__":
    main()
