import json
import os
from datetime import datetime
from typing import Dict, List, Any, Optional

def load_category_mapping() -> Dict[str, int]:
    """Load the category mapping file"""
    with open('/opt/gg-woo-next/big-c-data/category_mapping.json', 'r') as f:
        mapping_data = json.load(f)
    return {str(k): v for k, v in mapping_data['mapping'].items()}

def transform_categories(bc_categories: List[int], category_mapping: Dict[str, int]) -> List[Dict[str, int]]:
    """Transform BigCommerce category IDs to WooCommerce category format"""
    woo_categories = []
    for cat_id in bc_categories:
        woo_cat_id = category_mapping.get(str(cat_id))
        if woo_cat_id:
            woo_categories.append({"id": woo_cat_id})
    return woo_categories

def transform_images(bc_product: Dict) -> List[Dict[str, str]]:
    """Transform product images to WooCommerce format"""
    images = []
    
    # Add main product image if available
    if bc_product.get('image_url'):
        images.append({
            "src": bc_product['image_url'],
            "name": os.path.basename(bc_product['image_url']),
            "alt": bc_product['name']
        })
    
    # Add additional images if available
    if bc_product.get('images'):
        for img in bc_product['images']:
            if img.get('url_zoom'):  # Use highest resolution available
                images.append({
                    "src": img['url_zoom'],
                    "name": os.path.basename(img['url_zoom']),
                    "alt": img.get('description', bc_product['name'])
                })
    
    return images

def transform_variants(bc_product: Dict) -> tuple[List[Dict], List[Dict]]:
    """Transform BigCommerce variants to WooCommerce format"""
    if not bc_product.get('variants'):
        return [], []
    
    # Extract unique attributes from variants
    attributes = {}
    for variant in bc_product['variants']:
        for option in variant.get('option_values', []):
            option_name = option.get('option_display_name', '')
            option_value = option.get('label', '')
            if option_name:
                if option_name not in attributes:
                    attributes[option_name] = {'name': option_name, 'options': set()}
                attributes[option_name]['options'].add(option_value)
    
    # Convert attributes to WooCommerce format
    woo_attributes = []
    for attr_name, attr_data in attributes.items():
        woo_attributes.append({
            "name": attr_name,
            "position": 0,
            "visible": True,
            "variation": True,
            "options": list(attr_data['options'])
        })
    
    # Transform variants
    woo_variations = []
    for variant in bc_product['variants']:
        variation = {
            "sku": variant.get('sku', ''),
            "regular_price": str(variant.get('price', 0)),
            "sale_price": str(variant.get('sale_price', '')) if variant.get('sale_price') else '',
            "attributes": []
        }
        
        # Add variant attributes
        for option in variant.get('option_values', []):
            variation['attributes'].append({
                "name": option.get('option_display_name', ''),
                "option": option.get('label', '')
            })
        
        woo_variations.append(variation)
    
    return woo_attributes, woo_variations

def transform_product(bc_product: Dict, category_mapping: Dict[str, int]) -> Dict:
    """Transform a BigCommerce product to WooCommerce format"""
    # Determine if product has variants
    has_variants = bool(bc_product.get('variants'))
    
    # Transform attributes and variations if present
    attributes, variations = transform_variants(bc_product) if has_variants else ([], [])
    
    # Create WooCommerce product structure
    woo_product = {
        "name": bc_product['name'],
        "type": "variable" if has_variants else "simple",
        "status": "publish",
        "featured": bc_product.get('is_featured', False),
        "catalog_visibility": "visible",
        "description": bc_product.get('description', ''),
        "short_description": bc_product.get('meta_description', ''),
        "sku": bc_product.get('sku', ''),
        "regular_price": str(bc_product.get('price', 0)) if not has_variants else '',
        "sale_price": str(bc_product.get('sale_price', 0)) if bc_product.get('sale_price') and not has_variants else '',
        "date_created": bc_product.get('date_created', ''),
        "date_modified": bc_product.get('date_modified', ''),
        "images": transform_images(bc_product),
        "categories": transform_categories(bc_product.get('categories', []), category_mapping),
        "tags": [],  # Could be populated from search_keywords or meta_keywords
        "attributes": attributes,
        "variations": variations,
        "meta_data": [
            {
                "key": "_bigcommerce_product_id",
                "value": str(bc_product['id'])
            },
            {
                "key": "_weight",
                "value": str(bc_product.get('weight', ''))
            },
            {
                "key": "_length",
                "value": str(bc_product.get('depth', ''))
            },
            {
                "key": "_width",
                "value": str(bc_product.get('width', ''))
            },
            {
                "key": "_height",
                "value": str(bc_product.get('height', ''))
            }
        ]
    }
    
    return woo_product

def main():
    # Load BigCommerce products
    with open('/opt/gg-woo-next/big-c-data/bc-products.json', 'r') as f:
        bc_data = json.load(f)
    
    # Load category mapping
    category_mapping = load_category_mapping()
    
    # Transform first 5 products
    woo_products = []
    for bc_product in bc_data['data'][:5]:  # Only process first 5 products
        try:
            woo_product = transform_product(bc_product, category_mapping)
            woo_products.append(woo_product)
            print(f"Transformed product: {bc_product['name']}")
        except Exception as e:
            print(f"Error transforming product {bc_product.get('name', 'Unknown')}: {str(e)}")
    
    # Create output structure
    output = {
        "data": woo_products,
        "meta": {
            "total": len(woo_products),
            "timestamp": datetime.now().isoformat(),
            "source": "BigCommerce",
            "target": "WooCommerce"
        }
    }
    
    # Save transformed products
    output_file = '/opt/gg-woo-next/big-c-data/woo-products-transformed.json'
    with open(output_file, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\nTransformed {len(woo_products)} products")
    print(f"Output saved to: {output_file}")

if __name__ == "__main__":
    main()
