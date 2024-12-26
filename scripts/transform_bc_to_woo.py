import json
import os
from typing import Dict, List, Any

def transform_images(bc_images: List[Dict]) -> List[Dict]:
    """Transform BigCommerce image format to WooCommerce format"""
    return [{
        "src": img.get("url_zoom", ""),
        "name": os.path.basename(img.get("url_zoom", "")),
        "alt": img.get("description", "")
    } for img in bc_images]

def transform_categories(bc_categories: List[int], category_mapping: Dict[int, int]) -> List[Dict]:
    """Transform BigCommerce category IDs to WooCommerce format"""
    return [{
        "id": category_mapping.get(cat_id, 0)
    } for cat_id in bc_categories]

def get_price_data(product: Dict) -> Dict[str, str]:
    """Extract and format price data from BigCommerce product"""
    calculated = product.get("calculated_price", 0)
    base = product.get("price", 0)
    
    # If calculated price is higher than base price, use calculated as regular and base as sale
    if calculated > base:
        return {
            "regular_price": str(calculated),
            "sale_price": str(base)
        }
    # Otherwise just use the base price as regular price
    else:
        return {
            "regular_price": str(base),
            "sale_price": ""
        }

def transform_variant_prices(variant: Dict) -> Dict[str, str]:
    """Extract and format price data from BigCommerce variant"""
    calculated = variant.get("calculated_price", 0)
    base = variant.get("price", 0)
    
    # If calculated price is higher than base price, use calculated as regular and base as sale
    if calculated > base:
        return {
            "regular_price": str(calculated),
            "sale_price": str(base)
        }
    # Otherwise just use the base price as regular price
    else:
        return {
            "regular_price": str(base),
            "sale_price": ""
        }

def transform_product(bc_product: Dict, category_mapping: Dict[int, int]) -> Dict:
    """Transform a single BigCommerce product to WooCommerce format"""
    is_variable = len(bc_product.get("variants", [])) > 0
    
    # Get price data
    prices = get_price_data(bc_product)
    
    woo_product = {
        "name": bc_product["name"],
        "type": "variable" if is_variable else "simple",
        "status": "publish",
        "catalog_visibility": "visible",
        "description": bc_product.get("description", ""),
        "short_description": bc_product.get("description_summary", ""),
        "sku": bc_product.get("sku", ""),
        "regular_price": prices["regular_price"],
        "sale_price": prices["sale_price"],
        "images": transform_images(bc_product.get("images", [])),
        "categories": transform_categories(bc_product.get("categories", []), category_mapping),
        "attributes": [],  # Will be populated if product has variants
        "variations": [],  # Will be populated if product has variants
        "meta_data": [
            {
                "key": "_bigcommerce_product_id",
                "value": str(bc_product["id"])
            }
        ]
    }
    
    # Handle variants if they exist
    if is_variable:
        # Get unique options for each variant option
        option_sets = {}
        for variant in bc_product.get("variants", []):
            for option in variant.get("option_values", []):
                option_name = option.get("option_display_name")
                if option_name not in option_sets:
                    option_sets[option_name] = set()
                option_sets[option_name].add(option.get("label"))
        
        # Create attributes
        woo_product["attributes"] = [
            {
                "name": name,
                "position": idx,
                "visible": True,
                "variation": True,
                "options": sorted(list(values))
            }
            for idx, (name, values) in enumerate(option_sets.items())
        ]
        
        # Create variations
        woo_product["variations"] = []
        for variant in bc_product.get("variants", []):
            # Get variant prices
            variant_prices = transform_variant_prices(variant)
            
            variation = {
                "sku": variant.get("sku", ""),
                "regular_price": variant_prices["regular_price"],
                "sale_price": variant_prices["sale_price"],
                "attributes": [
                    {
                        "name": option.get("option_display_name"),
                        "option": option.get("label")
                    }
                    for option in variant.get("option_values", [])
                ]
            }
            woo_product["variations"].append(variation)
        
    return woo_product

def main():
    # Load BigCommerce data
    with open('/opt/gg-woo-next/big-c-data/bc-products.json', 'r') as f:
        bc_data = json.load(f)
    
    # Load category mapping
    with open('/opt/gg-woo-next/big-c-data/category_mapping.json', 'r') as f:
        category_mapping = json.load(f)["mapping"]  # Get the actual mapping dict
    
    # Transform all products
    woo_products = []
    total_products = len(bc_data["data"])
    print(f"Starting transformation of {total_products} products...")
    
    for i, bc_product in enumerate(bc_data["data"], 1):
        woo_product = transform_product(bc_product, category_mapping)
        woo_products.append(woo_product)
        if i % 10 == 0:  # Progress update every 10 products
            print(f"Transformed {i}/{total_products} products...")
    
    # Save transformed products
    output = {
        "data": woo_products,
        "meta": {
            "total": len(woo_products),
            "timestamp": bc_data.get("meta", {}).get("timestamp", "")
        }
    }
    
    with open('/opt/gg-woo-next/big-c-data/woo-products-transformed.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\nCompleted! Transformed {len(woo_products)} products to WooCommerce format")

if __name__ == "__main__":
    main()
